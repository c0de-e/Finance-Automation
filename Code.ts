function AppendDate(val, range) {
  val = `${val} (${new Date().toLocaleDateString()})`.replace('+', '');
  range.setValue(val);
}

function AppendDateToSelectedRange() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt('Input Date', 'Please input the desired date\n(Use no value for currrent date)', ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() == ui.Button.CANCEL) return;

  var activeSheet = SpreadsheetApp.getActiveSheet();
  var date = response.getResponseText() == "" ? new Date().toLocaleDateString() : response.getResponseText();

  var selectedRange = activeSheet.getActiveRange();
  var modifiedVals = selectedRange.getValues()
    .map(row =>
      row.map(cellVal => `${cellVal} (${date})`.replace('+', '')));
  selectedRange.setValues(modifiedVals);
}