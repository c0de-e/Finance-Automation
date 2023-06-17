const CACHE_ID = "Chosen Folder ID";
/**
 * Displays an HTML-service dialog in Google Sheets that contains client-side
 * JavaScript code for the Google Picker API.
 */
function showPicker() {
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

/**
 * Acts as a callback for our Drive file picker... sets selected file id to the user cache
 * This expires in 6 hours from the time it is picked
 * @param id The file id
 */
function SetCachedId(id: string) {
  CacheService.getUserCache().put(CACHE_ID, id, 21600);
}

/**
 * @returns The cached pdf id the user selected with the file picker
 */
function GetSelectedPDFId(): string | null {
  return CacheService.getUserCache().get(CACHE_ID);
}
