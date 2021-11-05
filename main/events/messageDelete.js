// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { Message } from "discord.js";
import Zen from "../Zen.js";


// ----------------------------------------------------------------
//                            Ready Event
// ----------------------------------------------------------------
export default class MessageDeleteEvent {
  constructor () {
    this.name = "messageDelete";
    /** @type {boolean} */
    this.once = false;
  }

  /**
   * @param {Message} message 
   * @returns {Promise<void>}
   */
  execute = async ( message ) => {
    // Data builder
    /** @type {Zen} */
    const bot = message.client;
    if (!this.bot) this.bot = bot;

    // Validation - Bot
    if (message.author.bot) return;

  };

}