import axios from "axios";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { Client, Events, GatewayIntentBits } = require("discord.js");
// 変更してください
const serverID = "サーバーIDを入力";
const channelID = "チャンネルIDを入力";
const discordToken = "ディスコードのトークンを入力";
const ChatGPTAPIKey = "OpenAIのAPIキーを入力";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
});

// ChatGPT
async function requestChatAPI(text) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${ChatGPTAPIKey}`,
  };

  const messages = [
    {
      role: "user",
      content: text,
    },
    {
      role: "system",
      content: "簡潔に回答してください。",
    },
  ];

  const payload = {
    model: "gpt-3.5-turbo",
    max_tokens: 80, //文字数制限
    messages: messages,
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
  if (
    message.content.includes("？？？") ||
    message.content.includes("。。。")
  ) {
    message.channel.send("えっとね・・・");
    const ChatGPTsReply = await requestChatAPI(message.content);
    message.reply(`お待たせしました！
    ${ChatGPTsReply}`);
  }
});

client.login(discordToken);
