import fs from "fs";
import chalk from "chalk";
import delay from "delay";
import fetch from "node-fetch";
import pkg from "https-proxy-agent";
const { HttpsProxyAgent } = pkg;
import TelegramBot from "node-telegram-bot-api";
import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";
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

function readQueryIdsFromFile(queryFilePath) {
  try {
    const queryContent = fs.readFileSync(queryFilePath, "utf-8");
    return queryContent
      .split("\n")
      .map((query) => query.trim())
      .filter((query) => query); // Ensure to remove extra newlines or spaces
  } catch (error) {
    console.error(chalk.red(`Error reading ${queryFilePath}:`), error);
    return [];
  }
}
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
        Connection: "keep-alive",
        "Accept-Language": "id-ID",
        Host: "api.wattpad.com",
        Accept: "*/*",
        Authorization: "gyJp8LykESHBcLntrLevPA",
        "User-Agent":
          "Android App v10.51.0; Model: G011A; Android SDK: 28; Connection: None; Locale: en_US;",
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
const token = "5355944753:AAH_tnkHc-uFHm9meBR3Aur6gJgwwlhJZ8A";
const bot = new TelegramBot(token, { polling: true });
let currentMessageId;
async function updateButtonText(chatId, orderId, apiKey, newText) {
  const newOptions = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: newText, // Ganti dengan teks baru
            callback_data: `message_${orderId}_${apiKey}`,
          },
          {
            text: "Repeat Message", // Ganti dengan teks baru
            callback_data: `repeat_${orderId}_${apiKey}`,
          },
        ],
      ],
    },
  };

  await bot.editMessageReplyMarkup(newOptions.reply_markup, {
    chat_id: chatId,
    message_id: currentMessageId, // Gunakan messageId yang telah disimpan
  });
}
async function sendOrderMessage(chatId, message) {
  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Waiting Message",
            callback_data: `message_${orderId}_${apiKey}`,
          },
          {
            text: "Cancel",
            callback_data: `cancel_${orderId}_${apiKey}`,
          },
        ],
      ],
    },
  };

  const sentMessage = await bot.sendMessage(
    chatId,
    `Pesanan OTP berhasil.\nID Pesanan: ${orderId}.\nNumber phone: ${number}.`,
    options
  );
  currentMessageId = sentMessage.message_id; // Simpan messageId untuk digunakan nanti
}
bot.onText(/\/premium/, async (msg) => {
  const chatId = msg.chat.id.toString();

  // Function to handle the premium process
  const handlePremiumProcess = async () => {
    let total = 0;
    let gagal = 0;
    const queryIds = readQueryIdsFromFile("premium_accounts.txt");
    for (let index = 0; index < queryIds.length; index++) {
      let login;
      let validate;
      try {
        const proxy =
          "http://6c9xq54vori6n63-country-id:l5lf7iqs9eplqpg@rp.proxyscrape.com:6060";
        const [email, password] = queryIds[index].split("|");
        validate = email;
        log(email, "warning");
        const params = new URLSearchParams({
          password: password,
          username: email,
          fields:
            "token,user(username,email,has_password,inbox,externalId,createDate),ga(created,group,logged)",
          type: "wattpad",
        });
        login = await makeRequest(
          "https://api.wattpad.com/v4/sessions",
          params,
          { "Content-Type": "application/x-www-form-urlencoded" },
          proxy
        );
        log(login.token + "|" + login.user.username, "warning");
        if (login.token) {
          log("login Successfully..", "success");

          const checkSubscription = await makeRequest(
            `https://api.wattpad.com/v4/users/${login.user.username}/subscriptions`,
            null,
            {
              "Content-Type": "application/json; charset=utf-8",
              cookie: `locale=en_US; wp_id=a5f9a3f4-7254-41e2-9d74-bb9d984d7307; token=${login.token}`,
            },
            proxy
          );
          try {
            const proxy =
              "http://6c9xq54vori6n63-country-id:l5lf7iqs9eplqpg@rp.proxyscrape.com:6060";
            const [email, password] = queryIds[index].split("|");
            validate = email;
            log(email, "warning");
            const params = new URLSearchParams({
              password: password,
              username: email,
              fields:
                "token,user(username,email,has_password,inbox,externalId,createDate),ga(created,group,logged)",
              type: "wattpad",
            });
            login = await makeRequest(
              "https://api.wattpad.com/v4/sessions",
              params,
              { "Content-Type": "application/x-www-form-urlencoded" },
              proxy
            );
            log(login.token + "|" + login.user.username, "warning");
            if (login.token) {
              log("login Successfully..", "success");
              const makePremium = await makeRequest(
                `https://api.wattpad.com/v4/users/${login.user.username}/subscriptions`,
                JSON.stringify({
                  receipt:
                    "jkbphllgeohbioaajhmfineb.AO-J1OzX_ObU0HhP84i3bgUq2uEaf6hgebBJgqa-Nd7BvTCfOf17b67uWlIqG7jBbApaGCTCEGfLFEevEcCL5oLUz_xpsDEmHw",
                  sku: "wp_premium_1_month_d",
                }),
                {
                  "Content-Type": "application/json; charset=utf-8",
                  cookie: `locale=en_US; wp_id=a5f9a3f4-7254-41e2-9d74-bb9d984d7307; token=${login.token}`,
                },
                proxy
              );

              total += 1;
            } else {
              log("login failed..", "error");
            }
          } catch (error) {
            log(login.message, "error");
            bot.sendMessage(
              chatId,
              `[ status : ${login.message} ${validate} ]`
            );
            gagal += 1;
          }
        } else {
          log("login failed..", "error");
        }
      } catch (error) {
        log(login.message, "error");
        bot.sendMessage(chatId, `[ status : ${login.message} ${validate} ]`);
        gagal += 1;
      }
    }
    await bot.sendMessage(
      chatId,
      `premium status : total ${queryIds.length} succeess total ${total} gagal ${gagal}`
    );
    total = 0;
    gagal = 0;
  };

  // Run the premium process when the /premium command is triggered
  await handlePremiumProcess();

  // Set interval to run the process every 4 hours (14400000 milliseconds)
  setInterval(async () => {
    await handlePremiumProcess();
  }, 14400000); // 4 hours in milliseconds
});

bot.onText(/\/login/, async (msg) => {
  const chatId = msg.chat.id.toString();
  const [command, data] = msg.text.split(" ");

  let login;
  let validate;
  try {
    const proxy =
      "http://6c9xq54vori6n63-country-id:l5lf7iqs9eplqpg@rp.proxyscrape.com:6060";
    const [email, password] = data.split("|");
    validate = email;
    log(email, "warning");
    const params = new URLSearchParams({
      password: password,
      username: email,
      fields:
        "token,user(username,email,has_password,inbox,externalId,createDate),ga(created,group,logged)",
      type: "wattpad",
    });
    login = await makeRequest(
      "https://api.wattpad.com/v4/sessions",
      params,
      { "Content-Type": "application/x-www-form-urlencoded" },
      proxy
    );
    log(login.token + "|" + login.user.username, "warning");
    if (login.token) {
      log("login Successfully..", "success");
      const makePremium = await makeRequest(
        `https://api.wattpad.com/v4/users/${login.user.username}/subscriptions`,
        JSON.stringify({
          receipt:
            "jkbphllgeohbioaajhmfineb.AO-J1OzX_ObU0HhP84i3bgUq2uEaf6hgebBJgqa-Nd7BvTCfOf17b67uWlIqG7jBbApaGCTCEGfLFEevEcCL5oLUz_xpsDEmHw",
          sku: "wp_premium_1_month_d",
        }),
        {
          "Content-Type": "application/json; charset=utf-8",
          cookie: `locale=en_US; wp_id=a5f9a3f4-7254-41e2-9d74-bb9d984d7307; token=${login.token}`,
        },
        proxy
      );
      await delay(1000);
    } else {
      log("login failed..", "error");
    }
  } catch (error) {
    log(login.message, "error");
    bot.sendMessage(chatId, `[ status : ${login.message} ${validate} ]`);
  }

  // Set interval to run the process every 4 hours (14400000 milliseconds)
});

bot.onText(/\/manual/, async (msg) => {
  let register;
  let validate;
  const [command, email] = msg.text.split(" ");
  validate = email;
  const chatId = msg.chat.id.toString();
  let data;

  try {
    const proxy =
      "http://6c9xq54vori6n63-country-id:l5lf7iqs9eplqpg@rp.proxyscrape.com:6060";
    const birthday = `${Math.floor(
      Math.random() * (12 - 10 + 1) + 10
    )}-${Math.floor(Math.random() * (30 - 10 + 1) + 10)}-${Math.floor(
      Math.random() * (2002 - 1990 + 1) + 1990
    )}`;
    const password = process.env.PASSWORD;
    const params = new URLSearchParams({
      type: "wattpad",
      username:
        faker.internet.username().replaceAll(/[^a-zA-Z0-9]/g, "") +
        Math.floor(Math.random() * (12 - 10 + 1) + 10),
      password: password, // Ganti dengan variabel atau input sesuai kebutuhan
      email: email,
      birthdate: birthday,
      language: 1,
      has_accepted_latest_tos: true,
      fields:
        "token,ga,user(username,description,avatar,name,email,genderCode,language,birthdate,verified,isPrivate,ambassador,is_staff,follower,following,backgroundUrl,votesReceived,numFollowing,numFollowers,createDate,followerRequest,website,facebook,twitter,followingRequest,numStoriesPublished,numLists,location,externalId,programs,showSocialNetwork,verified_email,has_accepted_latest_tos,email_reverification_status,language,inbox(unread),has_password,connectedServices)",
      trackingId: uuidv4(),
    });
    register = await makeRequest(
      "https://api.wattpad.com/v4/users",
      params,
      { "Content-Type": "application/x-www-form-urlencoded" },
      proxy
    );
    log(register.token + "|" + register.user.username, "warning");
    if (register.token) {
      log("login Successfully..", "success");
      const makePremium = await makeRequest(
        `https://api.wattpad.com/v4/users/${register.user.username}/subscriptions`,
        JSON.stringify({
          receipt:
            "jkbphllgeohbioaajhmfineb.AO-J1OzX_ObU0HhP84i3bgUq2uEaf6hgebBJgqa-Nd7BvTCfOf17b67uWlIqG7jBbApaGCTCEGfLFEevEcCL5oLUz_xpsDEmHw",
          sku: "wp_premium_1_month_d",
        }),
        {
          "Content-Type": "application/json; charset=utf-8",
          cookie: `locale=en_US; wp_id=a5f9a3f4-7254-41e2-9d74-bb9d984d7307; token=${register.token}`,
        },
        proxy
      );
      await delay(1000);
      const checkSubscription = await makeRequest(
        `https://api.wattpad.com/v4/users/${register.user.username}/subscriptions`,
        null,
        {
          "Content-Type": "application/json; charset=utf-8",
          cookie: `locale=en_US; wp_id=a5f9a3f4-7254-41e2-9d74-bb9d984d7307; token=${register.token}`,
        },
        proxy
      );
      if (checkSubscription.premium) {
        log("account sudah premium tidak perlu premiumkan lagi ", "success");
        fs.appendFileSync("premium_accounts.txt", `${email}|${password}\n`);
        await bot.sendMessage(
          chatId,
          `create premium status :\nemail : ${email}\nusername : ${register.user.username}\npassword : ${password}\nstatus : premium\n\nnote : account tersimpan premium_accounts.txt`
        );
      } else {
        log("account expired premium perlu premiumkan lagi ", "error");
        const makePremium = await makeRequest(
          `https://api.wattpad.com/v4/users/${register.user.username}/subscriptions`,
          JSON.stringify({
            receipt:
              "jkbphllgeohbioaajhmfineb.AO-J1OzX_ObU0HhP84i3bgUq2uEaf6hgebBJgqa-Nd7BvTCfOf17b67uWlIqG7jBbApaGCTCEGfLFEevEcCL5oLUz_xpsDEmHw",
            sku: "wp_premium_1_month_d",
          }),
          {
            "Content-Type": "application/json; charset=utf-8",
            cookie: `locale=en_US; wp_id=a5f9a3f4-7254-41e2-9d74-bb9d984d7307; token=${register.token}`,
          },
          proxy
        );
        console.log(makePremium);
      }
    } else {
      log("login failed..", "error");
    }
  } catch (error) {
    log(register.message, "error");
    bot.sendMessage(chatId, `[ status : ${register.message} ${validate} ]`);
  }
});
bot.onText(/\/create/, async (msg) => {
  const chatId = msg.chat.id.toString();
  let data;
  let validate;
  let register;
  try {
    const email =
      faker.internet.username() +
      faker.internet
        .email()
        .split("@")[0]
        .replace(/[^a-zA-Z0-9]/g, "") +
      Math.floor(Math.random() * (12 - 10 + 1) + 10) +
      "@" +
      process.env.DOMAIN;
    validate = email;
    log(email, "warning");
    const proxy =
      "http://6c9xq54vori6n63-country-id:l5lf7iqs9eplqpg@rp.proxyscrape.com:6060";
    const birthday = `${Math.floor(
      Math.random() * (12 - 10 + 1) + 10
    )}-${Math.floor(Math.random() * (30 - 10 + 1) + 10)}-${Math.floor(
      Math.random() * (2002 - 1990 + 1) + 1990
    )}`;
    const password = process.env.PASSWORD;
    const params = new URLSearchParams({
      type: "wattpad",
      username:
        faker.internet.username().replace(/[^a-zA-Z0-9]/g, "") +
        Math.floor(Math.random() * (12 - 10 + 1) + 10),
      password: password, // Ganti dengan variabel atau input sesuai kebutuhan
      email: email,
      birthdate: birthday,
      language: 1,
      has_accepted_latest_tos: true,
      fields:
        "token,ga,user(username,description,avatar,name,email,genderCode,language,birthdate,verified,isPrivate,ambassador,is_staff,follower,following,backgroundUrl,votesReceived,numFollowing,numFollowers,createDate,followerRequest,website,facebook,twitter,followingRequest,numStoriesPublished,numLists,location,externalId,programs,showSocialNetwork,verified_email,has_accepted_latest_tos,email_reverification_status,language,inbox(unread),has_password,connectedServices)",
      trackingId: uuidv4(),
    });
    register = await makeRequest(
      "https://api.wattpad.com/v4/users",
      params,
      { "Content-Type": "application/x-www-form-urlencoded" },
      proxy
    );
    log(register.token + "|" + register.user.username, "warning");
    if (register.token) {
      log("login Successfully..", "success");
      const makePremium = await makeRequest(
        `https://api.wattpad.com/v4/users/${register.user.username}/subscriptions`,
        JSON.stringify({
          receipt:
            "jkbphllgeohbioaajhmfineb.AO-J1OzX_ObU0HhP84i3bgUq2uEaf6hgebBJgqa-Nd7BvTCfOf17b67uWlIqG7jBbApaGCTCEGfLFEevEcCL5oLUz_xpsDEmHw",
          sku: "wp_premium_1_month_d",
        }),
        {
          "Content-Type": "application/json; charset=utf-8",
          cookie: `locale=en_US; wp_id=a5f9a3f4-7254-41e2-9d74-bb9d984d7307; token=${register.token}`,
        },
        proxy
      );
      await delay(1000);
      const checkSubscription = await makeRequest(
        `https://api.wattpad.com/v4/users/${register.user.username}/subscriptions`,
        null,
        {
          "Content-Type": "application/json; charset=utf-8",
          cookie: `locale=en_US; wp_id=a5f9a3f4-7254-41e2-9d74-bb9d984d7307; token=${register.token}`,
        },
        proxy
      );
      if (checkSubscription.premium) {
        log("account sudah premium tidak perlu premiumkan lagi ", "success");
        fs.appendFileSync("premium_accounts.txt", `${email}|${password}\n`);
        await bot.sendMessage(
          chatId,
          `create premium status :\nemail : ${email}\nusername : ${register.user.username}\npassword : ${password}\nstatus : premium\n\nnote : account tersimpan premium_accounts.txt`
        );
      } else {
        log("account expired premium perlu premiumkan lagi ", "error");
        const makePremium = await makeRequest(
          `https://api.wattpad.com/v4/users/${register.user.username}/subscriptions`,
          JSON.stringify({
            receipt:
              "jkbphllgeohbioaajhmfineb.AO-J1OzX_ObU0HhP84i3bgUq2uEaf6hgebBJgqa-Nd7BvTCfOf17b67uWlIqG7jBbApaGCTCEGfLFEevEcCL5oLUz_xpsDEmHw",
            sku: "wp_premium_1_month_d",
          }),
          {
            "Content-Type": "application/json; charset=utf-8",
            cookie: `locale=en_US; wp_id=a5f9a3f4-7254-41e2-9d74-bb9d984d7307; token=${register.token}`,
          },
          proxy
        );
        console.log(makePremium);
      }
    } else {
      log("login failed..", "error");
    }
  } catch (error) {
    log(register.message, "error");
    bot.sendMessage(chatId, `[ status : ${register.message} ${validate} ]`);
  }
});
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const text = `/start [ untuk di cek menu ]\n/create [ untuk di create otomatis include premium ]\n/manual name@example [ untuk create manual menggunakan email include premium ]/loginexample@gmail.com|password [ untuk login premium account ]\nnote : [ semua disimpan di premium_accounts.txt ]`;
  bot.sendMessage(chatId, text);
});
// Menangani callback dari tombol Inline Keyboard
bot.on("callback_query", async (callbackQuery) => {
  const message = callbackQuery.message;
  const chatId = message.chat.id;
  const action = callbackQuery.data; // Mengambil data dari callback (misalnya repeat_12345 atau cancel_12345)

  const [command, orderId, apiKey] = action.split("_"); // Pisahkan perintah dan ID pesanan

  const sms = new SMSActivate(apiKey, "smshub");

  switch (command) {
    case "repeat":
      try {
        await sms.setStatus(orderId, 3); // Ulangi pesan
        bot.sendMessage(
          chatId,
          `Pesan OTP dengan ID Pesanan ${orderId} telah diulang.`
        );
      } catch (error) {
        console.error("Gagal mengulang pesan:", error);
        bot.sendMessage(chatId, "Terjadi kesalahan saat mengulang pesan.");
      }
      break;

    case "cancel":
      try {
        await sms.setStatus(orderId, 8); // Batalkan pesanan
        bot.sendMessage(
          chatId,
          `Pesanan OTP dengan ID Pesanan ${orderId} telah dibatalkan.`
        );
      } catch (error) {
        console.error("Gagal membatalkan pesanan:", error);
        bot.sendMessage(chatId, "Terjadi kesalahan saat membatalkan pesanan.");
      }
      break;

    default:
      break;
  }

  // Mengirim pesan kepada pengguna bahwa aksi telah dipilih
  bot.answerCallbackQuery(callbackQuery.id);
});

// Notifikasi saat bot aktif
console.log("Bot OTP service is running...");
