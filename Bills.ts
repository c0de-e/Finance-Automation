const BILLSLABEL = "Bills";

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

function test() {
    console.log(GetLastestBills());
}

function setBillData_() {
    
}

/**
 * Grabs the latest 3 bills, under the Bills label in gmail
 * @returns The lastest bill data
 */
function GetLastestBills(): Array<Bill> | undefined {
    let billsLabel = GmailApp.getUserLabels().find(label => label.getName() == BILLSLABEL);
    return billsLabel?.getThreads(0, 3)
        .map(thread => {
            // Gets first email in thread
            let message = thread.getMessages()[ 0 ];
            let amountDue = parseAmountDue_(message.getRawContent());
            let billSource = parseBillSource_(message.getFrom());

            console.log(`AMOUNT DUE: ${amountDue}\n${message.getFrom()}`);

            let paymentDate: Date | null = null;
            if (billSource != null)
                paymentDate = parsePaymentDate_(message.getPlainBody(), billSource as BillSource);

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
            parseTerm = "Bank Payment ";
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