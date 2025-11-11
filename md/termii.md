Messaging API
This API enables businesses to send text messages to their customers across various messaging channels. It accepts JSON-formatted request payloads and returns JSON-encoded responses, using standard HTTP response codes to indicate success or failure.

Messaging Channels/Routes

Channel Description
generic Used to send promotional messages and messages to phone numbers not on DND (Do Not Disturb).
dnd Delivers messages to all phone numbers, regardless of dnd restriction . Ideal for transactional or critical messages.
whatsapp Sends messages via the WhatsApp messaging channel.
voice Converts text messages into speech and delivers them as automated voice calls to recipients. Ideal for sending verification codes, alerts, or important notifications through a voice call.
Send message
The Messaging endpoint enables you to send a message to a single recipient via SMS, using either the Generic (Promotional) or DND (Transactional) route, depending on the type of message.

The generic (non-DND) route is meant strictly for promotional messages. It should not be used for sending OTP or transactional messages, as these are best handled via the DND (transactional) route.

The WhatsApp channel allows messages to be sent to a single recipient via WhatsApp, while the Voice channel converts text messages into speech and delivers them as a voice call to the recipient.

Using the generic route for OTPs may result in eventual delivery failures or Sender ID being blocked. Additionally, messages sent through the generic route will not deliver to numbers on Do-Not-Disturb (DND) and are subject to time restrictions in Nigeria for just MTN numbers (no message delivery between 8PM and 8AM WAT as enforced by the telecom provider, MTN). Please note that the time restriction does not apply to transactional messages sent on the DND route.

To ensure reliable delivery of OTPs or transactional messages, we strongly recommend using the DND route. To deliver messages to phone numbers on DND, the DND route needs to be activated on your account. Kindly reach out to our support team.
Endpoint : https://BASE_URL/api/sms/send

Request Type : POST

Body params

Options Required Description
api_key yes string
Your API key (It can be found on your Termii dashboard.
to yes string
Represents the destination phone number. Phone number must be in the international format (Example: 23490126727). You can also send to multiple numbers. To do so put numbers in an array (Example: ["23490555546", "23423490126999"]) Please note: the array takes only 100 phone numbers at a time
from yes string
Represents a sender ID for sms which can be Alphanumeric or Device name for Whatsapp. Alphanumeric sender ID length should be between 3 and 11 characters (Example:CompanyName)
sms yes string
This is the text message that will be delivered to the recipient's phone number.

Disclaimer (for Voice):
If the message contains a verification code, add spaces between the digits to ensure better interpretation for customers during text-to-speech conversion.
channel yes string
Specifies the route through which the message is sent. Accepted values are: dnd, generic, whatsapp, or voice.
dnd – for transactional or critical messages (bypasses DND restrictions).
generic – for promotional or non-transactional messages.
whatsapp – sends the message via the WhatsApp channel.
voice – converts the message to speech and delivers it via a voice call.
type yes string
Specifies the format of the message being sent. Supported types include:
plain - Standard text message unicode
Unicode-encoded message (for special characters or non-Latin scripts)
encrypted - Encrypted message (for added security)
Voice - Converts text to speech and delivers it as a voice call to the recipient.

Note: For encrypted messages you must provide the following details:
Algorithm (we strongly recommend AES)
Secret key

Note on special Characters: 1 page = 160 characters
Special characters reduces your message count from 160 characters per message to 70 characters per message.
Here are a few of them
; // ^ { } \ [ ~ ] | € ' ”```

JSONJavaScriptNodeJsPythonC#JavaPHP
var data = {
"to":"2347880234567",
"from":"talert",
"sms":"Hi there, testing Termii",
"type":"plain",
"api_key":"Your API key",
"channel":"generic",  
 };

var data = JSON.stringify(data);

var xhr = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.addEventListener("readystatechange", function() {
if(this.readyState === 4) {
console.log(this.responseText);
}
});

xhr.open("POST", "https://BASE_URL/api/sms/send");
xhr.setRequestHeader("Content-Type", "application/json");
xhr.setRequestHeader("Content-Type", "application/json");

xhr.send(data);

Sample Response - 200 OK
{
"code": "ok",
"balance": 1047.57,
"message_id": "3017544054459083819856413",
"message": "Successfully Sent",
"user": "Oluwatobiloba Fatunde",
"message_id_str": "3017544054459083819856413"
}

Send WhatsApp Message (Conversational)
The Messaging endpoint allows you to send conversational messages to recipients via the WhatsApp channel.

Endpoint : https://BASE_URL/api/sms/send

Request Type : POST

Body params

Options Required Description
api_key yes string
Your API key (It can be found on your Termii dashboard.
to yes string
Represents the destination phone number. Phone number must be in the international format (Example: 23490126727). You can also send to multiple numbers. To do so put numbers in an array (Example: ["23490555546", "23423490126999"]) Please note: the array takes only 100 phone numbers at a time
from yes string
Represents a sender ID for sms which can be Alphanumeric or Device name for Whatsapp. Alphanumeric sender ID length should be between 3 and 11 characters (Example:CompanyName)
sms yes string
This is the text message that will be delivered to the recipient's phone number.
channel yes string
This should be passed as “whatsapp”.
type yes string
The kind of message that is sent, which is a plain message.
media no Object
This is a media object, it is only available for the High Volume WhatsApp. When using the media parameter, ensure you are not using the sms parameter
media.url no string
The url to the file resource.
media.caption no string
The caption that should be added to the image.
Media Types

File Supported Format
Image JPG, JPEG, PNG
Audio MP3, OGG, AMR
Documents PDF
Video MP4 (Note: WhatsApp currently does not support MP4 files without an audio)

JSONJavaScriptNodeJsPythonC#JavaPHP
var data = {
"to":"2347880234567",
"from":"talert",
"sms":"Hi there, testing Termii",
"type":"plain",
"api_key":"Your API key",
"channel":"generic",
"media": {
"url": "https://media.example.com/file",
"caption": "your media file"
}  
 };

var data = JSON.stringify(data);

var xhr = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.addEventListener("readystatechange", function() {
if(this.readyState === 4) {
console.log(this.responseText);
}
});

xhr.open("POST", "https://BASE_URL/api/sms/send");
xhr.setRequestHeader("Content-Type", "application/json");
xhr.setRequestHeader("Content-Type", "application/json");

xhr.send(data);

Sample Response - 200 OK
{
"code": "ok",
"balance": 1047.57,
"message_id": "3017544054459083819856413",
"message": "Successfully Sent",
"user": "Oluwatobiloba Fatunde",
"message_id_str": "3017544054459083819856413"
}

Send Bulk message
The Messaging endpoints allows you to send bulk messages to recipients via SMS, using either the Generic (non-DND) or DND (Transactional) route, depending on the type of message.

Endpoint : https://BASE_URL/api/sms/send/bulk

Request Type : POST

Request Body Params:

Options Required Description
api_key yes string
Your API key (It can be found on your Termii dashboard.
to yes string
Represents the array of phone numbers you are sending to (Example: ["23490555546", "23423490126999","23490555546"]). Phone numbers must be in international format (Example: 23490126727). Please note: the array can take up to 100 phone numbers
from yes string
Represents a sender ID for sms which can be Alphanumeric or Device name for Whatsapp. Alphanumeric sender ID length should be between 3 and 11 characters (Example:CompanyName)
sms yes string
This is the text message that will be delivered to the recipient's phone number.
channel yes string
This is the route through which the message is sent. It is either dnd or generic .
type yes string
Specifies the format of the message being sent. Supported types include:
plain - Standard text message unicode
Unicode-encoded message (for special characters or non-Latin scripts)
encrypted - Encrypted message (for added security)

Note: For encrypted messages you must provide the following details:
Algorithm (we strongly recommend AES)
Secret key
Initialization Vector (IV) - required based on the selected encryption mode

JSONJavaScriptNodeJsPythonC#JavaPHP
var data = {
"to":["23490555546", "23423490126999","23490555546"],
"from":"talert",
"sms":"Hi there, testing Termii",
"type":"plain",
"api_key":"Your API key",
"channel":"generic",

        };

var data = JSON.stringify(data);

var xhr = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.addEventListener("readystatechange", function() {
if(this.readyState === 4) {
console.log(this.responseText);
}
});

xhr.open("POST", "https://BASE_URL/api/sms/send/bulk");
xhr.setRequestHeader("Content-Type", "application/json");
xhr.setRequestHeader("Content-Type", "application/json");

xhr.send(data);

Sample Response - 200 OK
{
"code": "ok",
"balance": 1047.57,
"message_id": "3017544054459083819856413",
"message": "Successfully Sent",
"user": "Oluwatobiloba Fatunde",
"message_id_str": "3017544054459083819856413"
}

Updated at, Friday, November 7, 2025
