const BILLSLABEL = "Bills";
interface Bill {
    AmountDue: string;
    From: string;
    PaymentDate: Date;
}

function test() {
    console.log(GetLastestBills());
}

/**
 * Grab the latest 3 bills, under the Bills label in gmail
 * @returns The lastest bill data
 */
function GetLastestBills(): Array<Bill> | undefined {
    let billsLabel = GmailApp.getUserLabels().find(label => label.getName() == BILLSLABEL);
    return billsLabel?.getThreads(0, 3)
        .map(thread => {
            let messages = thread.getMessages();
            let message = messages[ 0 ];
            console.log(message.getRawContent());
            console.warn(`AMOUNT DUE: ${parseAmountDue_(message.getRawContent())}\n${message.getFrom()}`);
            return { From: message.getFrom(), AmountDue: parseAmountDue_(message.getRawContent()) } as Bill;
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

function parsePaymentDate_(emailBody: string): Date {

    return new Date();
}