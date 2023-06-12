/**
 * Appends the current date to the supplied value
 * @param val The value to modify
 * @param range The range to modify
 */
function AppendDate(val: string, range: GoogleAppsScript.Spreadsheet.Range): void {
  val = `${val} (${new Date().toLocaleDateString()})`.replace('+', '');
  range.setValue(val);
}

/**
 * Appends the supplied date (using the UI) to the selected range
 */
function AppendDateToSelectedRange(): void {
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt('Input Date', 'Please input the desired date\n(Use no value for currrent date)', ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() == ui.Button.CANCEL) return;

  var activeSheet = SpreadsheetApp.getActiveSheet();
  var date = response.getResponseText() == "" ? new Date().toLocaleDateString() : response.getResponseText();

  var selectedRange = activeSheet.getActiveRange() as GoogleAppsScript.Spreadsheet.Range;
  var modifiedVals = selectedRange.getValues()
    .map(row =>
      row.map(cellVal => `${cellVal} (${date})`.replace('+', '')));
  selectedRange.setValues(modifiedVals);
}