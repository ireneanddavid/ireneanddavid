/**
 * Append-only Google Apps Script endpoint for wedding RSVPs.
 *
 * This must be created from Extensions > Apps Script inside the RSVP
 * spreadsheet. It only accesses that attached spreadsheet, only appends
 * submissions to the "RSVP" tab, and may send one confirmation email to the
 * validated address included in the current submission.
 *
 * RSVP columns:
 * Timestamp | Name | Attendance | Guest Count | Invitation Type | Email |
 * Address | Message
 */

const RSVP_TAB = 'RSVP';

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function isValidEmail(value) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sendRsvpConfirmation(email, name) {
  const safeName = escapeHtml(name);
  const subject = 'RSVP Confirmed｜婚禮邀請函｜Minchi & David 蔡旻淇・郭大為｜2026.11.29';
  const websiteUrl = 'https://minchianddavid.github.io/celebratewithus/';
  const mapsUrl = 'https://maps.google.com/?q=Taipei+Marriott+Hotel';
  const body = [
    'M·D',
    '',
    'Hi ' + name + '，',
    '',
    '謝謝你回覆出席，我們很期待在婚禮當天見到你 🤍',
    '',
    '婚禮將於 2026 年 11 月 29 日，在台北萬豪酒店舉行。',
    mapsUrl,
    '',
    '婚禮流程、交通資訊與其他提醒，都整理在網站中：',
    'Open the Invitation → ' + websiteUrl,
    '',
    '婚禮前三天，我們會再透過 Email 寄送行前提醒與桌次資訊。',
    '',
    '期待與你一起分享這個特別的日子。',
    '',
    'Minchi & David',
  ].join('\n');
  const htmlBody = [
    '<div style="margin:0;padding:56px 22px 52px;background:#faf7f1;color:#38342f;font-family:Arial,\'Noto Sans TC\',\'PingFang TC\',sans-serif;">',
    '<div style="max-width:540px;margin:0 auto;">',
    '<div style="margin:0 0 36px;text-align:center;">',
    '<span style="display:inline-block;font-family:Georgia,\'Times New Roman\',serif;font-size:34px;font-weight:400;letter-spacing:.08em;color:#514b45;">M·D</span>',
    '</div>',
    '<p style="margin:0 0 24px;font-size:16px;line-height:1.8;">Hi ' + safeName + '，</p>',
    '<p style="margin:0 0 24px;font-size:15px;line-height:1.9;">謝謝你回覆出席，我們很期待在婚禮當天見到你 🤍</p>',
    '<p style="margin:0 0 24px;font-size:15px;line-height:1.9;">婚禮將於 2026 年 11 月 29 日，在<a href="' + mapsUrl + '" target="_blank" style="color:#9f7b4d;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:3px;">台北萬豪酒店</a>舉行。</p>',
    '<p style="margin:0 0 16px;font-size:15px;line-height:1.9;">婚禮流程、交通資訊與其他提醒，都整理在網站中：</p>',
    '<p style="margin:0 0 30px;"><a href="' + websiteUrl + '" target="_blank" style="display:inline-block;color:#9f7b4d;font-size:14px;font-weight:600;letter-spacing:.03em;text-decoration:none;">Open the Invitation →</a></p>',
    '<div style="width:42px;margin:0 0 28px;border-top:1px solid #c9ad7f;"></div>',
    '<p style="margin:0 0 24px;font-size:14px;line-height:1.9;color:#665f58;">婚禮前三天，我們會再透過 Email 寄送行前提醒與桌次資訊。</p>',
    '<p style="margin:0 0 34px;font-size:15px;line-height:1.9;">期待與你一起分享這個特別的日子。</p>',
    '<p style="margin:0;font-family:\'Brush Script MT\',\'Segoe Script\',\'Bradley Hand\',cursive;font-size:28px;line-height:1.4;color:#514b45;">Minchi &amp; David</p>',
    '</div></div>',
  ].join('');

  MailApp.sendEmail({
    to: email,
    subject: subject,
    body: body,
    htmlBody: htmlBody,
    name: 'Minchi & David',
  });
}

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
    const name = (params.name || '').trim();
    const email = normalizeEmail(params.email);
    const destination = getRsvpSheet();

    if (!destination.sheet) {
      return jsonResponse({
        result: 'error',
        message: destination.error,
      });
    }

    const sheet = destination.sheet;
    const attendance = params.attendance || 'yes';

    if (!name) {
      return jsonResponse({
        result: 'error',
        message: 'Name is required.',
      });
    }

    if (email && !isValidEmail(email)) {
      return jsonResponse({
        result: 'error',
        message: 'Please enter a valid email address.',
      });
    }

    sheet.appendRow([
      new Date(),
      name,
      attendance,
      parseInt(params.guest_count, 10) || 1,
      (params.invitation_type || '').trim(),
      email,
      (params.address || '').trim(),
      (params.message || '').trim(),
    ]);

    let emailSent = false;
    if (email && attendance === 'yes') {
      try {
        sendRsvpConfirmation(email, name);
        emailSent = true;
      } catch (emailError) {
        console.error('RSVP saved but confirmation email failed: ' + emailError.message);
      }
    }

    return jsonResponse({
      result: 'success',
      message: 'RSVP received!',
      email_sent: emailSent,
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
