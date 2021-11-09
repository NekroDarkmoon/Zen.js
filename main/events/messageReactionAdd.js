// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { Message } from "discord.js";
import Zen from "../Zen.js";


// ----------------------------------------------------------------
//                            Ready Event
// ----------------------------------------------------------------
export default class MessageReactionAddEvent {
  constructor ( bot ) {
    this.name = "messageReactionAdd";
    /** @type {boolean} */
    this.once = false;
    /** @type {Zen} */
    this.bot = bot;
  }

  /**
   * @param {Message} message 
   * @returns {Promise<void>}
   */
  execute = async ( message ) => {

  }
}