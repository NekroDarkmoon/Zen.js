// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { Guild } from "discord.js";
import Zen from "../Zen.js";


// ----------------------------------------------------------------
//                            Ready Event
// ----------------------------------------------------------------
export default class GuildMemberUpdateEvent {
  constructor () {
    this.name = "guildMemberUpdate";
    /** @type {boolean} */
    this.once = false;
  }

  /**
   * @param {Guild} guild 
   * @returns {Promise<void>}
   */
  execute = async ( guild ) => {
    // Data builder
    /** @type {Zen} */
    const bot = guild.client;
    if (!this.bot) this.bot = bot;

  };

}