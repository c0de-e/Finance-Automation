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

function getFirstOfTheMonth_(month: string) { return new Error("Not implemented"); }

/**
 * Sorts a range (selected range if using the ui button) by date
 * Dates should be between parenthesis in the first column in the range
 * @param range 
 */
function sortRangeByDate_(range: GoogleAppsScript.Spreadsheet.Range) {
  // Use the selected range if using the ui button
  if (range == null) range = SpreadsheetApp.getActiveSheet().getActiveRange() as GoogleAppsScript.Spreadsheet.Range;
  // Regex to grab everything between parenthesis
  var regExp = /\(([^)]+)\)/;
  let rangeVals = range.getValues();

  rangeVals.sort((a, b) => {
    // Try to match dates between parenthesis in fist column
    let matchA = regExp.exec(a[ 0 ]);
    let matchB = regExp.exec(b[ 0 ]);

    // Puts items without dates at the top
    if (matchA == null && matchB != null) return -1;
    else if (matchB == null && matchA != null) return 1;
    // Do nothing if both do not contain date
    else if (matchB == null && matchA == null) return 0;
    // Compare dates, if both exist
    let dateA = new Date((matchA as RegExpExecArray)[ 1 ]);
    let dateB = new Date((matchB as RegExpExecArray)[ 1 ]);
    return dateA.getTime() - dateB.getTime();
  });
  range.setValues(rangeVals);
}