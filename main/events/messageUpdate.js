// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { Message } from "discord.js";
import Zen from "../Zen.js";
import {chunkify, msgSanatize} from "../utils/utils.js";


// ----------------------------------------------------------------
//                            Ready Event
// ----------------------------------------------------------------
export default class MessageUpdateEvent {
  constructor () {
    this.name = "messageUpdate";
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