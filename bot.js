import fs from "fs";
import chalk from "chalk";
import delay from "delay";
import fetch from "node-fetch";
import pkg from "https-proxy-agent";
const { HttpsProxyAgent } = pkg;
import TelegramBot from "node-telegram-bot-api";
import { faker } from "@faker-js/faker";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
dotenv.config();

function log(msg, type = "info") {
  const timestamp = new Date().toLocaleTimeString();
  switch (type) {
    case "success":
      console.log(`[${timestamp}] ➤  ${chalk.green(msg)}`);
      break;
    case "custom":
      console.log(`[${timestamp}] ➤  ${chalk.magenta(msg)}`);
      break;
    case "error":
      console.log(`[${timestamp}] ➤  ${chalk.red(msg)}`);
      break;
    case "warning":
      console.log(`[${timestamp}] ➤  ${chalk.yellow(msg)}`);
      break;
    default:
      console.log(`[${timestamp}] ➤  ${msg}`);
  }
}
const randstr = (length) =>
  new Promise((resolve, reject) => {
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    resolve(text);
  });
async function makeRequest(
  url,
  body = null,
  headers = {},
  proxy = null,
  retries = 5
) {
  let attempt = 0;

  // Fungsi untuk melakukan request
  const makeRequestWithRetry = async () => {
    attempt++;
    const options = {
      method: body ? "POST" : "GET",
      headers: {
        ...headers,
      },
    };

    // Jika proxy disediakan, atur agent
    if (proxy) {
      options.agent = new HttpsProxyAgent(proxy);
    }

    if (body) {
      options.body = body;
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      return data;
    } catch (error) {
      // Menangani kesalahan
      if (attempt < retries) {
        log(
          `Attempt ${attempt} failed ${error.toString()}. Retrying...`,
          "error"
        );
        return makeRequestWithRetry(); // Retry request
      } else {
        // Jika semua percobaan gagal, lemparkan error
        if (error.code === "ECONNREFUSED") {
          throw new Error("Proxy connection refused after retries.");
        } else if (error.code === "ETIMEDOUT") {
          throw new Error("Proxy connection timed out after retries.");
        } else if (error.message.includes("fetch")) {
          throw new Error("Network error or invalid URL after retries.");
        } else {
          throw error; // Lemparkan error lainnya setelah retry
        }
      }
    }
  };

  return makeRequestWithRetry();
}
const functionGetLink = (email, domain) =>
  new Promise((resolve, reject) => {
    fetch(`https://generator.email/inbox1`, {
      method: "get",
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
        "accept-encoding": "gzip, deflate, br",
        cookie: `_ga=GA1.2.659238676.1567004853; _gid=GA1.2.273162863.1569757277; embx=%5B%22${email}%40${domain}%22%2C%22hcycl%40nongzaa.tk%22%5D; _gat=1; io=io=tIcarRGNgwqgtn40O${randstr(
          3
        )}; surl=${domain}%2F${email}`,
        "upgrade-insecure-requests": 1,
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36",
      },
    })
      .then((res) => res.text())
      .then((text) => {
        const $ = cheerio.load(text);
        const src = $(
          "#email-table > div.e7m.row.list-group-item > div.e7m.col-md-12.ma1 > div.e7m.mess_bodiyy > p:nth-child(3) > a"
        ).attr("href");
        resolve(src);
      })
      .catch((err) => reject(err));
  });
const token = "5355944753:AAH_tnkHc-uFHm9meBR3Aur6gJgwwlhJZ8A";
const bot = new TelegramBot(token, { polling: true });
bot.onText(/\/add (\d+)/, async (msg, match) => {
  if (msg.chat.type === "private") {
    const userId = match[1];
    let users = JSON.parse(fs.readFileSync("user.json", "utf-8"));

    // Cek apakah user sudah ada
    if (!users.some((user) => user.user === userId)) {
      users.push({ user: userId });
      fs.writeFileSync("user.json", JSON.stringify(users, null, 2));
      bot.sendMessage(msg.chat.id, `User ${userId} telah ditambahkan.`);
    } else {
      bot.sendMessage(msg.chat.id, `User ${userId} sudah ada.`);
    }
  }
});

// Menangani perintah untuk menghapus pengguna
bot.onText(/\/delete (\d+)/, async (msg, match) => {
  if (msg.chat.type === "private") {
    const userId = match[1];
    let users = JSON.parse(fs.readFileSync("user.json", "utf-8"));

    // Cek apakah user ada dalam daftar
    if (users.some((user) => user.user === userId)) {
      users = users.filter((user) => user.user !== userId);
      fs.writeFileSync("user.json", JSON.stringify(users, null, 2));
      bot.sendMessage(msg.chat.id, `User ${userId} telah dihapus.`);
    } else {
      bot.sendMessage(msg.chat.id, `User ${userId} tidak ditemukan.`);
    }
  }
});
bot.onText(/\/login/, async (msg) => {
  if (msg.chat.type === "private") {
    const queryContent = fs.readFileSync("user.json", "utf-8");
    const count = JSON.parse(queryContent);
    for (let index = 0; index < count.length; index++) {
      if (msg.from.id === parseInt(count[index].user)) {
        const chatId = msg.chat.id.toString();
        const [command, email] = msg.text.split(" ");
        try {
          log(
            `[ reply message from ${msg.from.username} ] ` + email,
            "warning"
          );
          const proxy =
            "http://6c9xq54vori6n63-country-id:l5lf7iqs9eplqpg@rp.proxyscrape.com:6060";
          const getEmailValidate = await makeRequest(
            "https://generator.email/check_adres_validation3.php",
            `usr=${email.split("@")[0]}&dmn=${email.split("@")[1]}`,
            {
              Cookie: `surl=${email.split("@")[1]}/${email.split("@")[0]}`,
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
              "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",
            },
            null
          );

          const CraeteMakeAccount = await makeRequest(
            "https://www.googleapis.com/identitytoolkit/v3/relyingparty/createAuthUri?key=AIzaSyDtG1AU22ErnQD60AzBAcaknySiz9_CEq0",
            JSON.stringify({
              identifier: email,
              continueUri: "http://localhost",
            }),
            {
              "content-type": "application/json",
              "x-android-package": "com.alightcreative.motion",
              "x-android-cert": "ECA6BF91B8715A6F810ED0BBFC65B6CD578F52A8",
              "accept-language": "en-US",
              "x-client-version":
                "Android/Fallback/X22003001/FirebaseUI-Android",
              "x-firebase-gmpid": "1:414370328124:android:f1394131c8b84de3",
              "x-firebase-client":
                "H4sIAAAAAAAAAKtWykhNLCpJSk0sKVayio7VUSpLLSrOzM9TslIyUqoFAFyivEQfAAAA",
              "x-firebase-appcheck": "eyJlcnJvciI6IlVOS05PV05fRVJST1IifQ==",
              "user-agent":
                "Dalvik/2.1.0 (Linux; U; Android 9; A5010 Build/PI)",
            },
            proxy
          );
          // console.log(CraeteMakeAccount);
          if (CraeteMakeAccount.registered === true) {
            await bot.sendMessage(chatId, "proses login...").then(async () => {
              log(
                `[ reply message from ${msg.from.username} ] ` +
                  "email registered",
                "success"
              );
              const getOtpCode = await makeRequest(
                "https://www.googleapis.com/identitytoolkit/v3/relyingparty/getOobConfirmationCode?key=AIzaSyDtG1AU22ErnQD60AzBAcaknySiz9_CEq0",
                JSON.stringify({
                  requestType: 6,
                  email: email,
                  androidInstallApp: true,
                  canHandleCodeInApp: true,
                  continueUrl:
                    "https://alightcreative.com?ui_sid=3458523138&ui_sd=0",
                  iosBundleId: "com.alightcreative.motion",
                  androidPackageName: "com.alightcreative.motion",
                  androidMinimumVersion: "585",
                  clientType: "CLIENT_TYPE_ANDROID",
                }),
                {
                  "content-type": "application/json",
                  "x-android-package": "com.alightcreative.motion",
                  "x-android-cert": "ECA6BF91B8715A6F810ED0BBFC65B6CD578F52A8",
                  "accept-language": "en-US",
                  "x-client-version":
                    "Android/Fallback/X22003001/FirebaseUI-Android",
                  "x-firebase-gmpid": "1:414370328124:android:f1394131c8b84de3",
                  "x-firebase-client":
                    "H4sIAAAAAAAAAKtWykhNLCpJSk0sKVayio7VUSpLLSrOzM9TslIyUqoFAFyivEQfAAAA",
                  "x-firebase-appcheck": "eyJlcnJvciI6IlVOS05PV05fRVJST1IifQ==",
                  "user-agent":
                    "Dalvik/2.1.0 (Linux; U; Android 9; A5010 Build/PI)",
                },
                proxy
              );
              if (getOtpCode.email) {
                log(
                  `[ reply message from ${msg.from.username} ] ` +
                    "Sent Code OobConfirmationCode Succesfully",
                  "success"
                );
                bot.sendMessage(
                  chatId,
                  `silakan input link veryfikasi yang sudah dikirim...`
                );
                bot.once("message", async (replyMsg) => {
                  if (
                    replyMsg.text.includes(
                      "https://alightcreative.com/auth_action"
                    )
                  ) {
                    const Code = decodeURIComponent(replyMsg.text);
                    const regex = /[?&]oobCode=([^&]+)/;
                    const match = Code.match(regex);
                    const oobCode = match[1];
                    const Verify = await makeRequest(
                      "https://www.googleapis.com/identitytoolkit/v3/relyingparty/emailLinkSignin?key=AIzaSyDtG1AU22ErnQD60AzBAcaknySiz9_CEq0",
                      JSON.stringify({
                        email: email,
                        oobCode: oobCode,
                        clientType: "CLIENT_TYPE_ANDROID",
                      }),
                      {
                        "content-type": "application/json",
                        "x-android-package": "com.alightcreative.motion",
                        "x-android-cert":
                          "ECA6BF91B8715A6F810ED0BBFC65B6CD578F52A8",
                        "accept-language": "en-US",
                        "x-client-version":
                          "Android/Fallback/X22003001/FirebaseUI-Android",
                        "x-firebase-gmpid":
                          "1:414370328124:android:f1394131c8b84de3",
                        "x-firebase-client":
                          "H4sIAAAAAAAAAKtWykhNLCpJSk0sKVayio7VUSpLLSrOzM9TslIyUqoFAFyivEQfAAAA",
                        "x-firebase-appcheck":
                          "eyJlcnJvciI6IlVOS05PV05fRVJST1IifQ==",
                        "user-agent":
                          "Dalvik/2.1.0 (Linux; U; Android 9; A5010 Build/PI)",
                      },
                      proxy
                    );
                    if (Verify.localId) {
                      log(
                        `[ reply message from ${msg.from.username} ] ` +
                          `OobCode valid `,
                        "success"
                      );
                      const paymentVerify = await makeRequest(
                        "https://us-central1-alight-creative.cloudfunctions.net/verifyPurchase",
                        JSON.stringify({
                          data: {
                            productId: "alightcreative.motion.1y_t20",
                            token:
                              "jlglpndjbjgokncoenhdglip.AO-J1Oy49uLvERISL0dQkMx9pA21uG6T7MwsBAeHCL19yJlUKjyXldo1WUCVq-V_7l8JlIKAebOvOUY4aEa4RVhMAhjOl8-ifWr91k5m848aDvxrTPQz7c0",
                            skuType: "subs",
                            orderId: `GPA.33${
                              Math.floor(Math.random() * (99 - 10 + 1)) + 10
                            }-${
                              Math.floor(Math.random() * (9999 - 1000 + 1)) +
                              1000
                            }-${
                              Math.floor(Math.random() * (9999 - 1000 + 1)) +
                              1000
                            }-${
                              Math.floor(Math.random() * (99999 - 10000 + 1)) +
                              10000
                            }`,
                          },
                        }),
                        {
                          authorization: `Bearer ${Verify.idToken}`,
                          "firebase-instance-id-token":
                            "cL5GYUTvSEWDrm86U7qnqC:APA91bEIEtHooTbg3FIMRER23CdbOcw0eGgN3rEBTyG1fG9ic3KjnmCwtHlxzYctG7rFPUSfj9iMNPRDImd7zaVylWUEXVmsS5eduB38xRNCAQ8b8QREGfcrsYpV02uCeZCiizh_mLIM",
                          "content-type": "application/json; charset=utf-8",
                          host: "us-central1-alight-creative.cloudfunctions.net",
                          connection: "Keep-Alive",
                          "accept-encoding": "gzip",
                          "user-agent": "okhttp/4.12.0",
                        },
                        proxy
                      );
                      if (paymentVerify.result.status === "success") {
                        const messagereply = `[ ACCOUNT SUCCESS CREATE PREMIUM ]\nEMAIL : ${email}\nSTATUS : PREMIUM\nEXPIRED : ${new Date(
                          paymentVerify.result.expiryTimeMillis
                        ).toLocaleDateString()} `;
                        log(
                          `[ reply message from ${msg.from.username} ] ` +
                            "payment succesfully",
                          "success"
                        );
                        bot.sendMessage(chatId, messagereply);
                        fs.appendFileSync(
                          "premium_accounts_align_align.txt",
                          `${email}|${Verify.idToken}\n`
                        );
                      } else {
                        log(
                          `[ reply message from ${msg.from.username} ] ` +
                            "payment failed",
                          "error"
                        );
                      }
                    } else {
                      log(
                        `[ reply message from ${msg.from.username} ] ` +
                          `OobCode failed `,
                        "error"
                      );
                    }
                  }
                });
              } else {
                log(
                  `[ reply message from ${msg.from.username} ] ` +
                    "Sent Code OobConfirmationCode Failed",
                  "error"
                );
              }
            });
          } else {
            log(
              `[ reply message from ${msg.from.username} ] ` +
                "email not registered",
              "error"
            );
          }
        } catch (error) {
          bot.sendMessage(chatId, `[ FAILED PROSES ]`);
        }
      } else {
        bot.sendMessage(msg.chat.id.toString(), `[ ACCESS DENIED !! ]`);
      }
    }
  }
});

bot.onText(/\/create/, async (msg) => {
  if (msg.chat.type === "private") {
    const queryContent = fs.readFileSync("user.json", "utf-8");
    const count = JSON.parse(queryContent);
    for (let index = 0; index < count.length; index++) {
      if (msg.from.id === parseInt(count[index].user)) {
        const chatId = msg.chat.id.toString();
        // console.log(chatId);
        try {
          const getemail =
            faker.internet.username() +
            faker.internet
              .email()
              .split("@")[0]
              .replace(/[^a-zA-Z0-9]/g, "") +
            Math.floor(Math.random() * (12 - 10 + 1) + 10) +
            "@" +
            process.env.DOMAIN;
          const email = getemail.toLocaleLowerCase();
          log(
            `[ reply message from ${msg.from.username} ] ` + email,
            "warning"
          );
          const proxy =
            "http://6c9xq54vori6n63-country-id:l5lf7iqs9eplqpg@rp.proxyscrape.com:6060";
          const getEmailValidate = await makeRequest(
            "https://generator.email/check_adres_validation3.php",
            `usr=${email.split("@")[0]}&dmn=${process.env.DOMAIN}`,
            {
              Cookie: `surl=${process.env.DOMAIN}/${email.split("@")[0]}`,
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
              "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",
            },
            null
          );
          if (getEmailValidate.status === "good") {
            log(`${email} status [ ${getEmailValidate.status} ]`, "success");
            const CraeteMakeAccount = await makeRequest(
              "https://www.googleapis.com/identitytoolkit/v3/relyingparty/createAuthUri?key=AIzaSyDtG1AU22ErnQD60AzBAcaknySiz9_CEq0",
              JSON.stringify({
                identifier: email,
                continueUri: "http://localhost",
              }),
              {
                "content-type": "application/json",
                "x-android-package": "com.alightcreative.motion",
                "x-android-cert": "ECA6BF91B8715A6F810ED0BBFC65B6CD578F52A8",
                "accept-language": "en-US",
                "x-client-version":
                  "Android/Fallback/X22003001/FirebaseUI-Android",
                "x-firebase-gmpid": "1:414370328124:android:f1394131c8b84de3",
                "x-firebase-client":
                  "H4sIAAAAAAAAAKtWykhNLCpJSk0sKVayio7VUSpLLSrOzM9TslIyUqoFAFyivEQfAAAA",
                "x-firebase-appcheck": "eyJlcnJvciI6IlVOS05PV05fRVJST1IifQ==",
                "user-agent":
                  "Dalvik/2.1.0 (Linux; U; Android 9; A5010 Build/PI)",
              },
              proxy
            );
            if (CraeteMakeAccount.registered === false) {
              await bot.sendMessage(chatId, "proses register...");
              log(
                `[ reply message from ${msg.from.username} ] ` +
                  "email belum registered",
                "success"
              );
              const getOtpCode = await makeRequest(
                "https://www.googleapis.com/identitytoolkit/v3/relyingparty/getOobConfirmationCode?key=AIzaSyDtG1AU22ErnQD60AzBAcaknySiz9_CEq0",
                JSON.stringify({
                  requestType: 6,
                  email: email,
                  androidInstallApp: true,
                  canHandleCodeInApp: true,
                  continueUrl:
                    "https://alightcreative.com?ui_sid=3458523138&ui_sd=0",
                  iosBundleId: "com.alightcreative.motion",
                  androidPackageName: "com.alightcreative.motion",
                  androidMinimumVersion: "585",
                  clientType: "CLIENT_TYPE_ANDROID",
                }),
                {
                  "content-type": "application/json",
                  "x-android-package": "com.alightcreative.motion",
                  "x-android-cert": "ECA6BF91B8715A6F810ED0BBFC65B6CD578F52A8",
                  "accept-language": "en-US",
                  "x-client-version":
                    "Android/Fallback/X22003001/FirebaseUI-Android",
                  "x-firebase-gmpid": "1:414370328124:android:f1394131c8b84de3",
                  "x-firebase-client":
                    "H4sIAAAAAAAAAKtWykhNLCpJSk0sKVayio7VUSpLLSrOzM9TslIyUqoFAFyivEQfAAAA",
                  "x-firebase-appcheck": "eyJlcnJvciI6IlVOS05PV05fRVJST1IifQ==",
                  "user-agent":
                    "Dalvik/2.1.0 (Linux; U; Android 9; A5010 Build/PI)",
                },
                proxy
              );
              if (getOtpCode.email) {
                log(
                  `[ reply message from ${msg.from.username} ] ` +
                    "Sent Code OobConfirmationCode Succesfully",
                  "success"
                );
                let linkConfirm;
                do {
                  linkConfirm = await functionGetLink(
                    email.split("@")[0],
                    process.env.DOMAIN
                  );
                  await delay(500);
                } while (!linkConfirm);
                log(
                  `[ reply message from ${msg.from.username} ] ` +
                    `Otp Found ${linkConfirm.substring(0, 20)}`,
                  "success"
                );
                const Code = decodeURIComponent(linkConfirm);
                const regex = /[?&]oobCode=([^&]+)/;
                const match = Code.match(regex);
                const oobCode = match[1];
                const Verify = await makeRequest(
                  "https://www.googleapis.com/identitytoolkit/v3/relyingparty/emailLinkSignin?key=AIzaSyDtG1AU22ErnQD60AzBAcaknySiz9_CEq0",
                  JSON.stringify({
                    email: email,
                    oobCode: oobCode,
                    clientType: "CLIENT_TYPE_ANDROID",
                  }),
                  {
                    "content-type": "application/json",
                    "x-android-package": "com.alightcreative.motion",
                    "x-android-cert":
                      "ECA6BF91B8715A6F810ED0BBFC65B6CD578F52A8",
                    "accept-language": "en-US",
                    "x-client-version":
                      "Android/Fallback/X22003001/FirebaseUI-Android",
                    "x-firebase-gmpid":
                      "1:414370328124:android:f1394131c8b84de3",
                    "x-firebase-client":
                      "H4sIAAAAAAAAAKtWykhNLCpJSk0sKVayio7VUSpLLSrOzM9TslIyUqoFAFyivEQfAAAA",
                    "x-firebase-appcheck":
                      "eyJlcnJvciI6IlVOS05PV05fRVJST1IifQ==",
                    "user-agent":
                      "Dalvik/2.1.0 (Linux; U; Android 9; A5010 Build/PI)",
                  },
                  proxy
                );
                if (Verify.localId) {
                  log(
                    `[ reply message from ${msg.from.username} ] ` +
                      `OobCode valid `,
                    "success"
                  );
                  const paymentVerify = await makeRequest(
                    "https://us-central1-alight-creative.cloudfunctions.net/verifyPurchase",
                    JSON.stringify({
                      data: {
                        productId: "alightcreative.motion.1y_t20",
                        token:
                          "jlglpndjbjgokncoenhdglip.AO-J1Oy49uLvERISL0dQkMx9pA21uG6T7MwsBAeHCL19yJlUKjyXldo1WUCVq-V_7l8JlIKAebOvOUY4aEa4RVhMAhjOl8-ifWr91k5m848aDvxrTPQz7c0",
                        skuType: "subs",
                        orderId: `GPA.33${
                          Math.floor(Math.random() * (99 - 10 + 1)) + 10
                        }-${
                          Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000
                        }-${
                          Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000
                        }-${
                          Math.floor(Math.random() * (99999 - 10000 + 1)) +
                          10000
                        }`,
                      },
                    }),
                    {
                      authorization: `Bearer ${Verify.idToken}`,
                      "firebase-instance-id-token":
                        "cL5GYUTvSEWDrm86U7qnqC:APA91bEIEtHooTbg3FIMRER23CdbOcw0eGgN3rEBTyG1fG9ic3KjnmCwtHlxzYctG7rFPUSfj9iMNPRDImd7zaVylWUEXVmsS5eduB38xRNCAQ8b8QREGfcrsYpV02uCeZCiizh_mLIM",
                      "content-type": "application/json; charset=utf-8",
                      host: "us-central1-alight-creative.cloudfunctions.net",
                      connection: "Keep-Alive",
                      "accept-encoding": "gzip",
                      "user-agent": "okhttp/4.12.0",
                    },
                    proxy
                  );
                  if (paymentVerify.result.status === "success") {
                    const messagereply = `[ ACCOUNT SUCCESS CREATE PREMIUM ]\nEMAIL : ${email}\nSTATUS : PREMIUM\nEXPIRED : ${new Date(
                      paymentVerify.result.expiryTimeMillis
                    ).toLocaleDateString()} `;
                    log(
                      `[ reply message from ${msg.from.username} ] ` +
                        "payment succesfully",
                      "success"
                    );
                    bot.sendMessage(chatId, messagereply);
                    fs.appendFileSync(
                      "premium_accounts_align_align.txt",
                      `${email}|${Verify.idToken}\n`
                    );
                  } else {
                    log(
                      `[ reply message from ${msg.from.username} ] ` +
                        "payment failed",
                      "error"
                    );
                  }
                } else {
                  log(
                    `[ reply message from ${msg.from.username} ] ` +
                      `OobCode failed `,
                    "error"
                  );
                }
              } else {
                log(
                  `[ reply message from ${msg.from.username} ] ` +
                    "Sent Code OobConfirmationCode Failed",
                  "error"
                );
              }
            } else {
              log(
                `[ reply message from ${msg.from.username} ] ` +
                  "email registered",
                "error"
              );
            }
          } else {
            log(
              `[ reply message from ${msg.from.username} ] ` +
                "failed get email !!",
              "error"
            );
          }
        } catch (error) {
          // console.log(error);
          bot.sendMessage(chatId, `[ FAILED PROSES ]`);
        }
      } else {
        bot.sendMessage(msg.chat.id.toString(), `[ ACCESS DENIED !! ]`);
      }
    }
  }
});
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const text = `/start [ untuk di cek menu ]\n/create [ untuk di create otomatis include premium ]\n/manual name@example [ untuk create manual menggunakan email include premium ]/loginexample@gmail.com|password [ untuk login premium account ]\nnote : [ semua disimpan di premium_accounts_align.txt ]`;
  bot.sendMessage(chatId, text);
});

// Notifikasi saat bot aktif
console.log("Bot OTP service is running...");
