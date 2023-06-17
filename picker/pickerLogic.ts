const CACHE_ID = "Chosen Folder ID";
/**
 * Displays an HTML-service dialog in Google Sheets that contains client-side
 * JavaScript code for the Google Picker API.
 */
function showPDFPicker() {
  const html = HtmlService.createHtmlOutputFromFile('picker/picker.html')
    .setWidth(750)
    .setHeight(500)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  SpreadsheetApp.getUi().showModalDialog(html, 'Select a file');
}

/**
 * Used in our file picker to get the users drive, for file picking
 * @returns OAuth token
 */
function getOAuthToken(): string {
  DriveApp.getRootFolder();
  return ScriptApp.getOAuthToken();
}