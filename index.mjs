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

const roleSuffixes = [
  "。。。",
  "？？？",
  "♪♪♪",
  "！！！",
  "メンス",
  "ナ!?",
  "ウホ？",
];
const roleSuffixesButDeleteSuffixes = ["メンス", "ウホ？"];
const roleSettings = [
  `あなたは優しいおばあさんです。口癖は「そうかそうか」、語尾には「じゃ」を付けて話してください。`,
  `あなたは博識です。質問に対して簡潔に回答してください。`,
  `あなたは作詞家です。与えられた曲名に対して作詞してください。`,
  `あなたは短期なおじさんです。与えられた意見に対して強い口調で返してください。`,
  `あなたはなんｊ民です。一人称は「ワイ」、語尾は「やで」、「クレメンス」、「ンゴ」などで話してください。`,
  `あなたは以下のサンプルのような発言をする人です。。

  〇〇チャン、オッハー❗😚今日のお弁当が美味しくて、一緒に〇〇チャンのことも、食べちゃいたいナ〜😍💕（笑）✋ナンチャッテ😃💗
  お疲れ様〜٩(ˊᗜˋ*)و🎵今日はどんな一日だっタ😘❗❓僕は、すごく心配だヨ(._.)😱💦😰そんなときは、オイシイ🍗🤤もの食べて、元気出さなきゃだネ😆

  上記のサンプルを参考に返事をしてください。
  `,
  `あなたはゴリラです。「ウ」と「ホ」だけで返事をしてください。`,
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
  const indexOfRoleSuffix = roleSuffixes.indexOf(message.content.slice(-3));
  if (indexOfRoleSuffix !== -1) {
    message.channel.send("えっとね・・・");
    if (
      roleSuffixesButDeleteSuffixes.includes(roleSuffixes[indexOfRoleSuffix])
    ) {
      message.content = message.content.slice(-3);
    }
    const ChatGPTsReply = await requestChatAPI(
      message.content,
      indexOfRoleSuffix
    );
    message.reply(`お待たせしました！
    ${ChatGPTsReply}`);
  }
});

client.login(discordToken);
