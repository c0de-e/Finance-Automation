const CALENDARNAME = "Bill Auto Pay";
const BILLSLABEL = "Bills";
const MAXBILLCOUNT = 30;

interface Bill {
    AmountDue: string;
    BillSource: BillSource;
    From: string;
    PaymentDate?: Date;
}

enum BillSource {
    Dominion = "Dominion",
    Lehi_City = "Lehi City",
    Xfinity = "Xfinity"
}

/**
 * Gets the active cell and sets a 2x3 with the grabbed bills data 
 */
function setBillData_() {
    let spreadSheet = SpreadsheetApp.getActiveSheet();
    let activeCell = spreadSheet.getActiveCell();
    let activeRange = spreadSheet.getRange(activeCell.getLastRow(), activeCell.getLastColumn(), Object.values(BillSource).length, 2);
    let rangeValues = activeRange.getValues();

    let bills = GetLastestBills()?.sort((a, b) => a.BillSource.localeCompare(b.BillSource)) as Array<Bill>;

    rangeValues.forEach((row, index) => {
        row[ 0 ] = `${bills[ index ].BillSource} (${bills[ index ].PaymentDate?.toDateString()})`;
        row[ 1 ] = `=${bills[ index ].AmountDue.replace('$', '')}/2`;
    });
    activeRange.setValues(rangeValues);
}

/**
 * Grabs the latest BillSource bills, under the Bills label in gmail
 * @returns The lastest bill data
 */
function GetLastestBills(): Array<Bill> | undefined {
    let billsLabel = GmailApp.getUserLabels().find(label => label.getName() == BILLSLABEL);
    const threads = billsLabel?.getThreads(0, MAXBILLCOUNT);
    return Object.values(BillSource).map((billSource: BillSource) => {
        const sourceThread = threads?.find(thread => parseBillSource_(thread.getMessages()[ 0 ].getFrom()) == billSource) as GoogleAppsScript.Gmail.GmailThread;

        // Gets first email in thread
        let message = sourceThread.getMessages()[ 0 ];
        let amountDue = parseAmountDue_(message.getRawContent());
        let paymentDate = parsePaymentDate_(message.getPlainBody(), billSource);

        console.log(`AMOUNT DUE: ${amountDue}\nFROM: ${message.getFrom()}`);

        return { AmountDue: amountDue, BillSource: billSource, From: message.getFrom(), PaymentDate: paymentDate } as Bill;
    });
}

/**
 * Parses and email for a dollar amount
 * @param emailBody The email body
 * @returns Bill amount due
 */
function parseAmountDue_(emailBody: string): string {
    let amountDue = '';
    // Regex to allow numbers, dollar signs, periods, and commas
    let regex = new RegExp("[^$,.0-9]");

    // Start iteration at "$" and continue until our regex test positive
    for (let i = emailBody.indexOf('$'); ; i++) {
        let currentChar = emailBody[ i ];
        if (regex.test(currentChar)) break;
        else amountDue += currentChar;
    }
    return amountDue;
}

function parseBillSource_(email: string): BillSource | null {
    switch (email) {
        case "Dominion Energy <paperlessbill@domenergyuteb.com>": return BillSource.Dominion;
        case "noreply@xpressbillpay.com": return BillSource.Lehi_City;
        case "Xfinity <online.communications@alerts.comcast.net>": return BillSource.Xfinity;
        default: return null;
    }
}

function parsePaymentDate_(emailBody: string, billSource: BillSource): Date {
    // Regex to allow numbers, forward slashes, and dashes
    let regex = new RegExp("[0-9\/\-]");

    let parseTerm: string;
    switch (billSource) {
        case BillSource.Dominion:
            parseTerm = "Payment Due: ";
            break;
        case BillSource.Lehi_City:
            parseTerm = "Payment Scheduled for:   ";
            break;
        case BillSource.Xfinity:
            parseTerm = "Payment date:     ";
            break;
        default: throw new Error("Bill source does not exist.");
    }
    let dateStr = "";
    // Build dateStr until we reach a newline 
    for (let i = emailBody.indexOf(parseTerm); ; i++) {
        let char = emailBody[ i ];
        if (regex.test(char)) dateStr += char;
        else if (char == "\n") break;
    };
    return new Date(dateStr);
}

function addBillCalandarEvents_() {
    ScriptApp.
        newTrigger("addCalendarEventTrigger_")
        .timeBased()
        .everyHours(24)
        .create();
}

function addCalendarEventTrigger_() {
    // Get the latest bills and filter for the ones we want to create an event for
    let bills = GetLastestBills()?.sort((a, b) => a.BillSource.localeCompare(b.BillSource)) as Array<Bill>;
    bills = bills.filter(bill => bill.BillSource != BillSource.Xfinity);

    // Get the calandar if it exists, if not, create it
    const calendars = CalendarApp.getCalendarsByName(CALENDARNAME);
    if (calendars.length == 0) calendars.push(CalendarApp.createCalendar(CALENDARNAME, { color: "MUSTARD" }));

    bills.forEach(bill => {
        calendars.forEach(calendar => {
            const existingEvents = calendar.getEventsForDay(bill.PaymentDate as Date);
            const eventTitle = `${bill.BillSource} Bill Due`;
            // If the event exists, don't create it again
            if (existingEvents.some(event => event.getTitle() == eventTitle)) return;

            const newEvent = calendar.createAllDayEvent(eventTitle, bill.PaymentDate as Date);
            newEvent.setDescription(`The amount of ${bill.AmountDue} is due`);// @ts-ignore
            newEvent.setColor(CalendarApp.EventColor.PALE_GREEN);
            newEvent.addPopupReminder(420);
        });
    });
}