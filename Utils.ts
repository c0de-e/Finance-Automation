function MultiFormulaDialog() {
    let ui = SpreadsheetApp.getUi();
    const html = HtmlService.createHtmlOutputFromFile("multiFormula.html")
        .setWidth(300)
        .setHeight(150)
        .setSandboxMode(HtmlService.SandboxMode.IFRAME);
    ui.showModelessDialog(html, "Apply formula to selected cells");
}

function MultiFormula(formula: string) {
    let sheet = SpreadsheetApp.getActiveSheet();
    let ranges = sheet.getSelection().getActiveRangeList()?.getRanges();

    ranges?.forEach(range => {
        let rangeVals = range.getValues();
        rangeVals = rangeVals.map(row => row.map(cell => cell = formula.replace("#CELL", cell)));
        range.setValues(rangeVals);
    });
}

function EvaluateSelectionValues(formula: string): Object {
    let sheet = SpreadsheetApp.getActiveSheet();
    let ranges = sheet.getSelection().getActiveRangeList()?.getRanges();

    let valsMap = new Object();
    ranges?.forEach(range => {
        let rangeVals = range.getValues();
        rangeVals = rangeVals.map(row => row.map(cell => cell = `${formula.replace("#CELL", cell)}`));
        valsMap[ range.getA1Notation() ] = rangeVals;
    });
    return valsMap;
}