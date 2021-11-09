// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { Message, MessageEmbed } from "discord.js";
import Zen from "../Zen.js";
import {chunkify, msgSanatize} from "../utils/utils.js";


// ----------------------------------------------------------------
//                            Ready Event
// ----------------------------------------------------------------
export default class MessageUpdateEvent {
  constructor (bot) {
    this.name = "messageUpdate";
    /**@type {Zen} */
    this.bot = bot;
    /** @type {boolean} */
    this.once = false;
  }

  /**
   * @param {Message} message 
   * @returns {Promise<void>}
   */
  execute = async ( oldMessage, newMessage ) => {
    // Data builder
    /** @type {Zen} */
    const bot = oldMessage.client;
    if (!this.bot) this.bot = bot;

    try { await this.logEvent(oldMessage, newMessage) }
    catch ( e ) { console.error(e); return; }
  };


  /**
   * @param {Message} before 
   * @param {Message} after 
   */
  async logEvent ( before, after ) {
    // Validation - Partial
    if (before.partial) {
      before = await before.fetch();
      after = await after.fetch();
    }
    // Validation - Bot
    if (before.author.bot) return;
    // Validation - Content Change
    if (before.content === after) return;
    // Get logging channel
    const chnId = this.bot.caches.loggingChns[before.guild.id] || null;
    if (!chnId) return;

    // DataBuilder
    const author = before.author;
    const oc = before.channel;
    const oldContent = before.content;
    const newContent = after.content;
    const guild = before.guild;
    const attchs = Array.from(after.attachments.map(a => a.url));

    // Send to logging channel
    try {
      // Fetch Channel
      const logChn = await guild.channels.fetch(chnId);
      const limit = 1024;
      // Sanatize and chunk
      const oContentArray = chunkify(msgSanatize(oldContent), limit);
      const nContentArray = chunkify(msgSanatize(newContent), limit);
      // Create Embed
      const e = new MessageEmbed().setTitle("Deleted Message Log");
      e.addField("Author", `${author.username}#${author.discriminator}`, true);
      e.addField("AuthorID", author.id, true);
      e.addField("Channel", oc.name , false);
      if ( attchs.length ) e.addField("Attachments", attchs.join(',\n'), false);
      
      oContentArray.forEach(chunk => e.addField("Before", chunk.toString(), false));
      nContentArray.forEach(chunk => e.addField("After", chunk.toString(), false));

      await logChn.send({embeds: [e]});

    } catch ( e ) { console.error(e)}
  }
}