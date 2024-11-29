import fetch from "node-fetch";
import readlineSync from "readline-sync";
import chalk from "chalk";
import { table } from "table";

function createCard(bearer, cardname, amount, startDate, endDate) {
  const index = fetch("https://expense-api.mekari.com/v1/virtual-card/cards", {
    method: "POST",
    headers: {
      Host: "expense-api.mekari.com",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:128.0) Gecko/20100101 Firefox/128.0",
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "id,en-US;q=0.7,en;q=0.3",
      "Accept-Encoding": "gzip, deflate, br",
      Authorization: "Bearer " + bearer + "",
      "Content-Type": "application/json",
      Origin: "https://expense.mekari.com",
      Referer: "https://expense.mekari.com/",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-site",
      Priority: "u=0",
      Te: "trailers",
    },
    body: JSON.stringify({
      cardName: cardname,
      cardPurpose: `Kartu mekari`,
      cumulativeLimitAmount: Number(amount),
      employeeID: 226156,
      startDate: startDate,
      endDate: endDate,
    }),
  }).then(async (res) => {
    const data = await res.json();
    return data;
  });
  return index;
}

function checkCard(bearer) {
  const index = fetch(
    "https://expense-api.mekari.com/v1/virtual-card/cards?page=1&limit=1000",
    {
      headers: {
        Host: "expense-api.mekari.com",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:128.0) Gecko/20100101 Firefox/128.0",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "id,en-US;q=0.7,en;q=0.3",
        "Accept-Encoding": "gzip, deflate, br",
        Authorization: "Bearer " + bearer + "",
        Origin: "https://expense.mekari.com",
        Referer: "https://expense.mekari.com/",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site",
        Te: "trailers",
      },
    }
  ).then(async (res) => {
    const data = await res.json();
    return data;
  });
  return index;
}

function deleteCard(bearer, uuid) {
  const index = fetch(
    "https://expense-api.mekari.com/v1/virtual-card/cards/" +
      uuid +
      "/deactivate",
    {
      method: "PATCH",
      headers: {
        Host: "expense-api.mekari.com",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:128.0) Gecko/20100101 Firefox/128.0",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "id,en-US;q=0.7,en;q=0.3",
        "Accept-Encoding": "gzip, deflate, br",
        Authorization: "Bearer " + bearer + "",
        Origin: "https://expense.mekari.com",
        Referer: "https://expense.mekari.com/",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site",
        Te: "trailers",
      },
    }
  ).then(async (res) => {
    const data = await res.json();
    return data;
  });
  return index;
}

function addFunds(bearer, uuid, amount) {
  const index = fetch(
    "https://expense-api.mekari.com/v1/virtual-card/cards/" + uuid + "/top-ups",
    {
      method: "POST",
      headers: {
        Host: "expense-api.mekari.com",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:128.0) Gecko/20100101 Firefox/128.0",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "id,en-US;q=0.7,en;q=0.3",
        "Accept-Encoding": "gzip, deflate, br",
        Authorization: "Bearer " + bearer + "",
        "Content-Type": "application/json",
        "X-Datadog-Origin": "rum",
        "X-Datadog-Parent-Id": "132441890651592032",
        "X-Datadog-Sampling-Priority": "0",
        "X-Datadog-Trace-Id": "1709363408408491478",
        "Content-Length": "48",
        Origin: "https://expense.mekari.com",
        Referer: "https://expense.mekari.com/",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site",
        Priority: "u=0",
        Te: "trailers",
      },
      body: JSON.stringify({
        amount: Number(amount),
        reason: "sudah di topup bosku",
      }),
    }
  ).then(async (res) => {
    const data = await res.text();
    return data;
  });
  return index;
}

function checkBalance(bearer, uuid) {
  const index = fetch(
    "https://expense-api.mekari.com/v1/virtual-card/cards/" + uuid + "",
    {
      headers: {
        Host: "expense-api.mekari.com",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:128.0) Gecko/20100101 Firefox/128.0",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "id,en-US;q=0.7,en;q=0.3",
        "Accept-Encoding": "gzip, deflate, br",
        Authorization: "Bearer " + bearer + "",
        "X-Datadog-Origin": "rum",
        "X-Datadog-Parent-Id": "2790390271020664734",
        "X-Datadog-Sampling-Priority": "0",
        "X-Datadog-Trace-Id": "4312379686086196074",
        Origin: "https://expense.mekari.com",
        Referer: "https://expense.mekari.com/",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site",
        Te: "trailers",
      },
    }
  ).then(async (res) => {
    const data = await res.json();
    var balance = data.data.virtualCard.cardBalance;
    return balance;
  });
  return index;
}

(async () => {
  const bearer =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb21wYW55X2lkIjoxMTk1LCJlbXBsb3llZV9pZCI6MjI2MTU2LCJleHAiOjE3MzEwNzExMjQsImlhdCI6MTczMTA3MDIyNCwianRpIjoiNDIzMzU5MzAtMDdhNi00OTA3LWIzMTAtNGVlNGYwNGQxOTBhIiwidXNlcl9pZCI6MjA3MzQwfQ.iV0oNbljlGUjeHrvsO07QiOXtHMtL7edAV9hniOwEfU";

  console.log(chalk.bold.magenta("Mekari Virtual Card"));
  console.log();
  console.log(`[1] ` + chalk.bold.green("Mekari Create Card"));
  console.log(`[2] ` + chalk.bold.green("Mekari Feature Card"));
  console.log();
  const menu = readlineSync.question(chalk`{bold.green Choose menu: }`);
  if (menu == 1) {
    const now = new Date();

    const startDate = new Date().toISOString().split("T")[0];
    const endDate = new Date(now.setFullYear(now.getFullYear() + 1))
      .toISOString()
      .split("T")[0];
    console.log(startDate);
    console.log(endDate);

    const cardnameAsk = readlineSync.question(
      chalk`{bold.green Card Name ?? example renalganteng: }`
    );
    const amount = readlineSync.question(
      chalk`{bold.green Amount    ?? example 10000: }`
    );
    const total = readlineSync.question(
      chalk`{bold.green Total     ?? example 1: }`
    );

    console.log();
    for (let index = 0; index < total; index++) {
      var cardname = `${cardnameAsk} ${index}`;
      const create = await createCard(
        bearer,
        cardname,
        amount,
        startDate,
        endDate
      );
      try {
        console.log(create);
        const hasil = create.data.virtualCard.uuid;
        console.log(
          `[${
            index + 1
          }/${total}] Card Name: ${cardname} | Amount: ${amount} | Start Date: ${startDate} | End Date: ${endDate} | UUID: ${hasil} | Status: ` +
            chalk`{bold.green Success}`
        );
      } catch (err) {
        console.log(err);
      }
    }

    process.exit(0);
  } else if (menu == 2) {
    const checking = await checkCard(bearer);

    let tableData = [
      ["id", "Card Name", "CardNumberSuffix", "EndDate", "UUID", "Status"],
    ];

    const configTable = {
      columns: [
        {
          alignment: "center",
        },
        {
          alignment: "center",
        },
        {
          alignment: "center",
        },
        {
          alignment: "center",
        },
        {
          alignment: "center",
        },
        {
          alignment: "center",
        },
        {
          alignment: "center",
        },
      ],
    };

    try {
      var virtualCards = checking.data.virtualCards;
      var activeCards = virtualCards.filter((card) => card.status === "active");

      for (let index = 0; index < activeCards.length; index++) {
        var cardName = activeCards[index].cardName;
        var cardNumberSuffix = activeCards[index].cardNumberSuffix;
        var endDate = activeCards[index].endDate;
        var uuid = activeCards[index].uuid;
        var status = activeCards[index].status;
        // var balance = await checkBalance(bearer, uuid)
        if (status.toLowerCase() == "active") {
          status = chalk.bold.green(status);
        } else {
          status = chalk.bold.red(status);
        }
        tableData.push([
          index,
          cardName,
          cardNumberSuffix,
          endDate,
          uuid,
          status,
        ]);
      }
    } catch (err) {
      console.log(checking);
      process.exit(0);
    }
    console.log(table(tableData, configTable));

    const question = readlineSync.question(
      chalk`{bold.green Choose card id: }`
    );
    console.log();
    var cardName = activeCards[question].cardName;
    var uuid = activeCards[question].uuid;

    console.log(`Kamu Memilih : Card Name: ${cardName} UUid: ${uuid}`);
    console.log();

    console.log(`[1] ` + chalk.bold.green("Add Balance"));
    console.log(`[2] ` + chalk.bold.green("Delete Card"));

    console.log();
    const option = readlineSync.question(chalk`{bold.green Vote : }`);
    console.log();

    if (option == 1) {
      const amount = readlineSync.question(
        chalk`{bold.green Amount    ?? example 10000: }`
      );
      const topup = await addFunds(bearer, uuid, amount);
      console.log(topup);
      console.log(
        `Card Name: ${cardName} | UUID: ${uuid} | Status: Topup ` +
          chalk`{bold.green Success}`
      );
    } else if (option == 2) {
      const deletez = await deleteCard(bearer, uuid);
      try {
        var hasil = deletez.data.virtualCard.uuid;

        if (hasil) {
          console.log(
            `Card Name: ${cardName} | UUID: ${uuid} | Status: Delete ` +
              chalk`{bold.green Success}`
          );
        }
      } catch (err) {
        console.log(
          `Card Name: ${cardName} | UUID: ${uuid} | Status: Delete ` +
            chalk`{bold.red Failure}`
        );
      }
    }
  }
})();

function formatPrice(amount) {
  // Mengubah angka menjadi format desimal dengan delapan angka desimal
  const formattedAmount = (amount / 1e9).toFixed(8);

  // Menambahkan mata uang SOL di akhir
  return `${formattedAmount}`;
}
