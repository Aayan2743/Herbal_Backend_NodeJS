// /**
//  * Send message using 360Messenger API
//  * @param {string} phoneNumber - With country code
//  * @param {string} text - Message content
//  * @param {string} url - Media / QR URL
//  * @param {string|null} delay - Optional (MM-DD-YYYY HH:MM in GMT)
//  * @param {function} callback
//  */
// import axios from "axios";

// export function sendMessage(phoneNumber, text, url, delay = null, callback) {
//   const payload = new URLSearchParams({
//     phonenumber: phoneNumber,
//     text,
//     url,
//   });

//   if (delay) payload.append("delay", delay);

//   axios
//     .post("https://api.360messenger.com/v2/sendMessage", payload, {
//       headers: {
//         Authorization: `Bearer ${process.env.MESSENGER_API_KEY}`,
//         "Content-Type": "application/x-www-form-urlencoded",
//       },
//     })
//     .then((response) => callback(null, response.data))
//     .catch((error) =>
//       callback(error.response ? error.response.data : error.message, null)
//     );
// }

import axios from "axios";

export function sendMessage(
  phoneNumber,
  text,
  url = "",
  delay = null,
  callback
) {
  const payload = new URLSearchParams();

  payload.append("phonenumber", phoneNumber);
  payload.append("text", text);

  if (url) payload.append("url", url);
  if (delay) payload.append("delay", delay);

  axios
    .post("https://api.360messenger.com/v2/sendMessage", payload, {
      headers: {
        Authorization: `Bearer ${process.env.MESSENGER_API_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 15000,
    })
    .then((res) => callback(null, res.data))
    .catch((err) =>
      callback(err.response ? err.response.data : err.message, null)
    );
}
