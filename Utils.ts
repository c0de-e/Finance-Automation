function MultiFormulaDialog() {
    let ui = SpreadsheetApp.getUi();
    const html = HtmlService.createHtmlOutputFromFile("multiFormula.html")
        .setWidth(300)
        .setHeight(100)
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

