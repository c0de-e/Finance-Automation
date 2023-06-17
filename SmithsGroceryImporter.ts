// Regex to check for dollar sign
const dollar_sign_regex = /\$\d+/;

interface SmithsGroceryItem {
    Name: string;
    Cost: number;
}

/**
 * Opens a file picker to import a pdf receipt from Smith's (Kroger) grocery
 * and imports the data to the selected position in the spreadsheet
 */
function ImportSmithsReciept(pdf_id: string) {
    let groceryData = GetSmithsRecieptData(pdf_id);
    let sheetData = groceryData.map(item => {
        return new Array<any>(item.Name, item.Cost);
    });
    const spreadSheet = SpreadsheetApp.getActiveSheet();
    const activeCell = spreadSheet.getActiveCell();
    const row = activeCell.getRow();
    const col = activeCell.getColumn();

    let a1 = spreadSheet.getRange(row, col + 1).getA1Notation();
    sheetData.push(new Array<any>("Total:", `=SUM(${a1}:${a1[ 0 ]}${row + sheetData.length - 1})`));

    let range = spreadSheet.getRange(row, col, sheetData.length, 2);
    range.setValues(sheetData);
}

/**
 * Parses an ocr'd pdf and grabs relevant data
 * @param pdf_id The id of the pdf we want to analyze
 * @returns An array of 
 */
function GetSmithsRecieptData(pdf_id: string): Array<SmithsGroceryItem> {
    let groceries = new Array<SmithsGroceryItem>();
    let ocr = getTextFromPDF(pdf_id);
    let split_ocr = ocr?.text.split("\n");

    split_ocr?.forEach(t => {
        // Ignore irrelevant data 
        if (t.startsWith("UPC")
            || t.startsWith("Item Coupon")
            || !dollar_sign_regex.test(t)
            || !t.includes(" x ")
        ) return;

        // Split the items by a consistent pattern
        let split = t.split(" $", 2);
        split[ 1 ] = split[ 1 ].split(' ', 1)[ 0 ];

        let itemData: SmithsGroceryItem = { Name: split[ 0 ], Cost: parseFloat(split[ 1 ]) };
        groceries.push(itemData);
    });

    console.log(groceries);
    return groceries;
}


// Get pdf text and url
function getTextFromPDF(fileID: string) {
    try {
        Logger.log('Running OCR on...');
        var file = DriveApp.getFileById(fileID);
        var blob = file.getBlob();
        var fileURL = file.getUrl();
        var resource = {
            title: blob.getName(),
            mimeType: blob.getContentType()
        };
        var options = {
            ocr: true,
            ocrLanguage: "en"
        };
        // Convert the pdf to a Google Doc with ocr.
        var docFile = Drive?.Files?.insert(resource, blob, options) as GoogleAppsScript.Drive.Schema.File;

        // Get the texts from the newly created text.
        var doc = DocumentApp.openById(docFile.id as string);
        var text = doc.getBody().getText();
        var title = doc.getName();
        Drive?.Files?.remove(doc.getId());
        Logger.log(title);
        return {
            name: title,
            text: text,
            fileURL: fileURL
        };
    } catch (error) {
        Logger.log(error);
        Logger.log('failed to run ocr');
    }
}