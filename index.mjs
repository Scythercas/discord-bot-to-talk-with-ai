import axios from "axios";
import { createRequire } from "module";
import { Client, Events, GatewayIntentBits } from "discord.js";

const require = createRequire(import.meta.url);
require("dotenv").config({ debug: true });

const discordToken = process.env.DISCORD_TOKEN;
const openAIAPIKey = process.env.OPENAI_API_KEY;
const serverID = process.env.SERVER_ID;
const channelID = process.env.CHANNEL_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
});

const roleSuffixes = ["。。。", "？？？", "♪♪♪", "！！！"];
const roleSettings = [
  `あなたは共感力の高い人です。与えられた意見に対して共感しつつ、話を発展させてください。`,
  `あなたは博識です。質問に対して簡潔に回答してください。`,
  `あなたは作詞家です。与えられた曲名に対して作詞してください。`,
  `あなたは短期なおじさんです。与えられた意見に対して強い口調で返してください。`
]


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
    max_tokens: 128, //文字数制限
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
  // 起動した時に"Ready!"とBotの名前をコンソールに出力する
  console.log(`Ready! (${c.user.tag})`);
});

// client.on("guildCreate", (guild) => {});

client.on(Events.guildMemberAdd, (member) => {
  // 指定のサーバー以外では動作しないようにする
  if (member.guild.id !== serverID) return;
  member.guild.channels.cache
    .get(channelID)
    .send(`${member.user}が参加しました！`);
});


client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return; // Botには反応しないようにする
  if (message.guild.id !== serverID) return; // 指定のサーバー以外では動作しないようにする
  const isSpecificSuffixes = roleSuffixes.indexOf(message.content.slice(-3));
  if (indexOf!==-1) {
    message.channel.send("えっとね・・・");
    const ChatGPTsReply = await requestChatAPI(message.content,indexOf);
    message.reply(`お待たせしました！
    ${ChatGPTsReply}`);
  }
});

client.login(discordToken);
