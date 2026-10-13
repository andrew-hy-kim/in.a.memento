/**
 * in a memento: "new inquiry" email to us
 *
 * Every time someone submits the inquiry form (on the website or on Google Forms directly),
 * this emails in.a.memento.wa@gmail.com with all of their answers laid out question by question.
 * Hit Reply on that email and it goes straight to the person who asked.
 *
 * Setup (about 3 minutes). Keep the confirmation email script; this one sits next to it:
 *   1. Open the Google Form in edit mode, click ⋮ (top right), then "Apps Script".
 *   2. In the left sidebar next to "Files", click + then "Script", and name it "notify us".
 *      (Don't paste over the existing confirmation email code.)
 *   3. Paste this whole file into the new script and click Save.
 *   4. Left sidebar: Triggers (clock icon), then "+ Add Trigger":
 *        function: notifyOwner · event source: From form · event type: On form submit
 *      Save, then allow the permissions Google asks for.
 *   5. To check it works without filling in the form: pick "testNotifyOwner" in the menu at the
 *      top of the editor and click Run. It emails you the most recent response.
 */

var NOTIFY_TO = 'in.a.memento.wa@gmail.com';
var NOTIFY_FROM_NAME = 'in a memento website';

function notifyOwner(e) {
  sendOwnerEmail_(e.response);
}

// Run this by hand to send yourself the latest response as a test
function testNotifyOwner() {
  var responses = FormApp.getActiveForm().getResponses();
  if (!responses.length) throw new Error('No responses yet. Submit a test inquiry first.');
  sendOwnerEmail_(responses[responses.length - 1]);
}

function sendOwnerEmail_(response) {
  var email = response.getRespondentEmail();
  var name = '', eventType = '', date = '';
  var rows = [];

  response.getItemResponses().forEach(function (item) {
    var question = item.getItem().getTitle();
    var title = question.toLowerCase();
    var answer = notifyAnswerText_(item.getResponse());
    if (!email && title === 'email') email = answer;
    if (!name && title.indexOf('name') !== -1) name = answer;
    if (!eventType && title.indexOf('event type') !== -1) eventType = answer;
    if (!date && title.indexOf('date of event') !== -1) date = notifyFormatDate_(answer);
    if (title.indexOf('date') !== -1) answer = notifyFormatDate_(answer);
    rows.push([question, answer]);
  });

  // Questions left blank still appear, marked with a dash, so the email always has the full form
  var answered = {};
  rows.forEach(function (r) { answered[r[0]] = true; });
  FormApp.getActiveForm().getItems().forEach(function (item) {
    var t = item.getTitle();
    var type = item.getType();
    var isQuestion = [FormApp.ItemType.SECTION_HEADER, FormApp.ItemType.PAGE_BREAK, FormApp.ItemType.IMAGE, FormApp.ItemType.VIDEO].indexOf(type) === -1;
    if (isQuestion && t && !answered[t]) rows.push([t, '']);
  });

  var subjectBits = ['New inquiry', name || 'someone', eventType, date].filter(function (x) { return x; });
  var subject = subjectBits.shift() + ': ' + subjectBits.join(' · ');

  var submitted = Utilities.formatDate(response.getTimestamp(), Session.getScriptTimeZone(), "EEE, MMM d 'at' h:mm a");
  var table = rows.map(function (r) {
    var value = r[1] ? notifyEscape_(r[1]).replace(/\n/g, '<br>') : '<span style="color:#b3a394">—</span>';
    return '<tr>' +
      '<td style="padding:10px 14px;border-bottom:1px solid #ecdcc8;vertical-align:top;width:38%;color:#735b4b;font-weight:bold">' + notifyEscape_(r[0]) + '</td>' +
      '<td style="padding:10px 14px;border-bottom:1px solid #ecdcc8;vertical-align:top;color:#5b3f2c">' + value + '</td>' +
      '</tr>';
  }).join('');

  var html =
    '<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#5b3f2c;max-width:640px">' +
    '<p style="font-size:18px;margin:0 0 4px"><b>New inquiry from ' + notifyEscape_(name || 'the website') + '</b></p>' +
    '<p style="margin:0 0 16px;color:#735b4b">Submitted ' + submitted +
    (email ? ' · reply to this email to write back to <a href="mailto:' + notifyEscape_(email) + '">' + notifyEscape_(email) + '</a>' : '') + '</p>' +
    '<table style="border-collapse:collapse;width:100%;background:#fffdf8;border:1px solid #ecdcc8;border-radius:8px">' + table + '</table>' +
    '<p style="margin:16px 0 0;font-size:13px;color:#735b4b">See every response in Google Forms: ' +
    '<a href="' + FormApp.getActiveForm().getEditUrl().replace(/\/edit.*$/, '/edit#responses') + '">open responses</a></p>' +
    '</div>';

  var plain = rows.map(function (r) { return r[0] + ': ' + (r[1] || '-'); }).join('\n');

  var message = { to: NOTIFY_TO, subject: subject, htmlBody: html, body: plain, name: NOTIFY_FROM_NAME };
  if (email) message.replyTo = email;
  MailApp.sendEmail(message);
}

// Checkbox answers come as lists, grid answers as lists of lists
function notifyAnswerText_(value) {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) {
    return value.map(function (v) { return Array.isArray(v) ? v.filter(String).join(', ') : v; })
      .filter(function (v) { return v !== '' && v !== null; }).join(', ');
  }
  return String(value).trim();
}

function notifyFormatDate_(value) {
  var m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/); // Google Forms gives yyyy-mm-dd
  if (!m) return value;
  var d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'EEE, MMMM d, yyyy');
}

function notifyEscape_(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
