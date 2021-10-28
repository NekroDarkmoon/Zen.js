import discord from "discord.js";
import Zen from "./main/Zen.js";
import { readFile } from 'fs/promises';

// ----------------------------------------------------------------
//                              Main 
// ----------------------------------------------------------------
async function main () {
  const { Client, Intents } = discord;
  
  // TODO: Set up postgres database
  const db = null;

  // Set up discord.js client
  const bot = new Client({
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_BANS,
      Intents.FLAGS.GUILD_MEMBERS,
      Intents.FLAGS.GUILD_MESSAGES,
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER']
  });

  // Fetch data from config file
  const config = JSON.parse(
    await readFile(
      new URL("./main/settings/config.json", import.meta.url)
    )
  );

  // Set up bot instance
  const ZEN = new Zen(bot, config, db);

  // ["exit", "SIGINT", "SIGQUIT", "SIGTERM", "uncaughtException", "unhandledRejection"]
	// 	.forEach(ec => process.on(ec, ZEN.handleExit.bind(ZEN)));
  

  await ZEN.init();
}


main()