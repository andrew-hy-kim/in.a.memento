/**
 * in a memento: automatic "we got your inquiry" email
 *
 * Sends a friendly confirmation to everyone who submits the inquiry form,
 * whether they use the website or the Google Form directly.
 *
 * Setup (about 3 minutes, see README "Inquiry confirmation email"):
 *   1. Open the Google Form in edit mode, click ⋮ (top right), then "Apps Script".
 *   2. Delete any code there, paste this whole file in, and click Save.
 *   3. Left sidebar: Triggers (clock icon), then "+ Add Trigger":
 *        function: sendConfirmation · event source: From form · event type: On form submit
 *      Save, then allow the permissions Google asks for.
 *   4. Send yourself a test inquiry.
 *
 * Emails come from the Google account that sets this up. Replies go to that account too.
 */

var BUSINESS_NAME = 'in a memento';
var WEBSITE = 'https://inamemento.com';
var INSTAGRAM = 'https://www.instagram.com/in.a.memento/';

function sendConfirmation(e) {
  var response = e.response;
  var email = response.getRespondentEmail();
  var name = '';
  var date = '';

  response.getItemResponses().forEach(function (item) {
    var title = item.getItem().getTitle().toLowerCase();
    var answer = item.getResponse();
    if (!email && title === 'email') email = answer;
    if (!name && title.indexOf('name') === 0) name = String(answer).trim().split(/\s+/)[0];
    if (!date && title.indexOf('date of event') === 0) date = answer;
  });

  if (!email) return;

  var greeting = name ? 'Hi ' + name + '!' : 'Hi there!';
  var dateLine = date ? ' for ' + formatDate(date) : '';
  var subject = 'We got your inquiry! 💌';
  var body =
    '<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#5b3f2c;max-width:520px">' +
    '<p>' + greeting + '</p>' +
    '<p>Thank you for reaching out to ' + BUSINESS_NAME + '! We received your inquiry' + dateLine +
    ' and will email you about availability within 2 to 3 business days.</p>' +
    '<p>In the meantime, you can peek at our <a href="' + WEBSITE + '/gallery/">design gallery</a>, ' +
    'read our <a href="' + WEBSITE + '/faq/">FAQ</a>, or say hi on <a href="' + INSTAGRAM + '">Instagram</a>.</p>' +
    '<p>We hope to connect with you soon!<br>' + BUSINESS_NAME + '</p>' +
    '</div>';

  MailApp.sendEmail({ to: email, subject: subject, htmlBody: body, name: BUSINESS_NAME });
}

function formatDate(value) {
  var parts = String(value).split('-'); // Google Forms gives yyyy-mm-dd
  if (parts.length !== 3) return value;
  var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'MMMM d, yyyy');
}
