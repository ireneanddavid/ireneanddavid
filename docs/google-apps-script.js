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

function getRsvpSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    return {
      error: 'RSVP endpoint is not attached to a spreadsheet. Open the RSVP spreadsheet, choose Extensions > Apps Script, and redeploy the web app from there.',
      sheet: null,
    };
  }

  const sheet = spreadsheet.getSheetByName(RSVP_TAB);
  if (!sheet) {
    return {
      error: 'RSVP sheet not found. Create a sheet tab named "RSVP" and redeploy the web app.',
      sheet: null,
    };
  }

  return { error: '', sheet: sheet };
}

function doPost(e) {
  try {
    const params = e.parameter;
    const destination = getRsvpSheet();

    if (!destination.sheet) {
      return jsonResponse({
        result: 'error',
        message: destination.error,
      });
    }

    const sheet = destination.sheet;

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
  const destination = getRsvpSheet();

  if (!destination.sheet) {
    return jsonResponse({
      result: 'error',
      message: destination.error,
    });
  }

  return jsonResponse({ result: 'ok', message: 'RSVP endpoint is active.' });
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
