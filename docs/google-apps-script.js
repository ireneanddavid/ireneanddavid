/**
 * Append-only Google Apps Script endpoint for wedding RSVPs.
 *
 * This must be created from Extensions > Apps Script inside the RSVP
 * spreadsheet. It only accesses that attached spreadsheet and only appends
 * submissions to the "RSVP" tab.
 *
 * RSVP columns:
 * Timestamp | Name | Attendance | Guest Count | Invitation Type | Email |
 * Address | Message
 */

const RSVP_TAB = 'RSVP';

function doPost(e) {
  try {
    const params = e.parameter;
    const sheet = SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(RSVP_TAB);

    if (!sheet) {
      return jsonResponse({
        result: 'error',
        message: 'RSVP sheet not found.',
      });
    }

    if (!params.name || !params.name.trim()) {
      return jsonResponse({
        result: 'error',
        message: 'Name is required.',
      });
    }

    sheet.appendRow([
      new Date(),
      params.name.trim(),
      params.attendance || 'yes',
      parseInt(params.guest_count, 10) || 1,
      (params.invitation_type || '').trim(),
      (params.email || '').trim(),
      (params.address || '').trim(),
      (params.message || '').trim(),
    ]);

    return jsonResponse({
      result: 'success',
      message: 'RSVP received!',
    });
  } catch (error) {
    return jsonResponse({
      result: 'error',
      message: 'Server error: ' + error.message,
    });
  }
}

function doGet() {
  return jsonResponse({
    result: 'ok',
    message: 'RSVP endpoint is active.',
  });
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
