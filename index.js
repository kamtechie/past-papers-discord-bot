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
      {
        logger: (m) => {
          if (m.status == "recognizing text") {
            console.log(m.progress);
          }
        },
      }
    );
    const text = ocr_result.data.text;
    const pp_search_result = await axios.get("https://paper.sc/search", {
      params: { as: "json", query: text },
    });
    const paper_match = pp_search_result.data.list[0];

    const imgResultEmbed = new Discord.MessageEmbed()
      .setColor("#0099ff")
      .setTitle("Paper Found")
      .setDescription(
        `${paper_match.doc.subject} ${paper_match.doc.time} Paper ${paper_match.doc.paper} Variant ${paper_match.doc.variant}`
      )
      .setURL(`https://paper.sc/doc/${paper_match.doc._id}`)
      .setTimestamp()
      .setFooter("Made with ❤️ by TheKarlos#5992 - Powered by paper.sc");

    user_message.edit(imgResultEmbed);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
