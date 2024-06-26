/**
 * Runs on SpreadSheet open; Sets up UI
 * @param e 
 */
function onOpen(e: GoogleAppsScript.Events.SheetsOnOpen) {
    let ui = SpreadsheetApp.getUi();
    ui.alert("Reminder!!!", `Use '+' to auto-add date 😄`, ui.ButtonSet.OK);
    let automationMenu = ui.createMenu('Automation');
    automationMenu
        .addItem('Append Date To Selected Range', 'AppendDateToSelectedRange')
        .addItem('Set Bill Data At Selected Range', 'setBillData_')
        .addItem('Sort Selected Range By Date\n(First column should have date between parenthesis)', 'sortRangeByDate_')
        .addItem('Import Smiths Reciept', 'showPDFPicker')
        .addToUi();

    ui.createAddonMenu()
        .addSubMenu(automationMenu)
        .addSeparator()
        .addItem("Apply formula to selected", "MultiFormulaDialog")
        .addItem("Add billing calendar events (Dominion and Xpress Bill Pay)", "addBillCalandarEvents_")
        .addToUi();
}

/**
 * Runs when editing a cell value
 * @param e 
 */
function onEdit(e: GoogleAppsScript.Events.SheetsOnEdit) {
    let val = e.range.getDisplayValue();
    if (!val.includes('+')) return;
    if (val.includes('$')) return;
    AppendDate(val, e.range);
}