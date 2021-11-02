// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { Client, ClientEvents } from "discord.js";


// ----------------------------------------------------------------
//                            Ready Event
// ----------------------------------------------------------------
export default class ZenEvent {
  constructor () {
    /** @type {keyof ClientEvents} */
    this.name = "ready";
    /** @type {boolean} */
    this.once = true;
  }

  /**
   * @param {Client} bot 
   * @returns {Promise<void>}
   */
  execute = async ( bot ) => {
    if ( bot.config.activity ) bot.user.setActivity(bot.config.activity);
    bot.logger.log(`Logged in as ${bot.user.tag}!`);
  }
}