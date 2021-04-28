// Import discord.js and create the client
const Discord = require("discord.js");
require("discord-reply"); // TODO: replace this with discord.js built in method once v13 comes out
const client = new Discord.Client();

require("dotenv").config();

const axios = require("axios");

const Tesseract = require("tesseract.js");

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async (msg) => {
  if (msg.author.bot) {
    return;
  }

  if (msg.attachments.size > 0) {
    console.log(msg.attachments.array()[0].url);
    let user_message = await msg.lineReply("Checking for text in image..");
    const ocr_result = await Tesseract.recognize(
      msg.attachments.array()[0].url,
      "eng",
      { logger: (m) => console.log(m) }
    );
    const text = ocr_result.data.text;
    const pp_search_result = await axios.get("https://paper.sc/search", {
      params: { as: "json", query: text },
    });
    const paper_match = pp_search_result.data.list[0];
    user_message.edit(
      `I think this is from ${paper_match.doc.subject} ${paper_match.doc.time} paper ${paper_match.doc.paper} variant ${paper_match.doc.variant}`
    );
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
