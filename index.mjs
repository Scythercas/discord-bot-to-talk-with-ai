import axios from "axios";
import { createRequire } from "module";
import { Client, Events, GatewayIntentBits } from "discord.js";

const require = createRequire(import.meta.url);
require("dotenv").config({ debug: true });

const discordToken = process.env.DISCORD_TOKEN;
const openAIAPIKey = process.env.OPENAI_API_KEY;
// const serverID = process.env.SERVER_ID;
// const channelID = process.env.CHANNEL_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
});

const roleSuffixes = ["。。。", "？？？", "♪♪♪", "！！！", "メンス"];
const roleSettings = [
  `適切に対応してください。`,
  `質問に対して簡潔に回答してください。`,
  `あなたは作詞家です。与えられた曲名に対して作詞してください。`,
  `あなたは短期なおじさんです。与えられた意見に対して強い口調で返してください。`,
  `あなたはなんｊ民です。一人称は「ワイ」、語尾は「やで」、「クレメンス」、「ンゴ」などで話してください。`,
];

// ChatGPT
async function requestChatAPI(text, index) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${openAIAPIKey}`,
  };

  const messagesSettings = [
    {
      role: "user",
      content: text,
    },
    {
      role: "system",
      content: roleSettings[index],
    },
  ];

  const payload = {
    model: "gpt-3.5-turbo",
    max_tokens: 512, //文字数制限
    messages: messagesSettings,
  };
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    payload,
    {
      headers: headers,
    }
  );
  console.log(response.data.choices[0].message.content);
  return response.data.choices[0].message.content;
}

client.once(Events.ClientReady, (c) => {
  console.log(`Ready! (${c.user.tag})`);
});
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  const indexOfRoleSuffix = roleSuffixes.indexOf(message.content.slice(-3));
  if (indexOfRoleSuffix !== -1) {
    message.channel.send("えっとね・・・");
    message.content = message.content.slice(0, -3);
    const ChatGPTsReply = await requestChatAPI(
      message.content,
      indexOfRoleSuffix
    );
    message.reply(`${ChatGPTsReply}`);
  }
});

client.login(discordToken);
