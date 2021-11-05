// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { Message, MessageEmbed } from "discord.js";
import {chunkify, msgSanatize} from "../utils/utils.js";
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
    // Validation - regex
    const regex = "^[^\"\'\.\w]";
    // Validation - lenght
    if (message.content.length < 3) return;


    // Get logging channel
    let chnId = null;
    try {
      const sql = 'SELECT * FROM settings WHERE server_id=$1';
      const vals = [message.guild.id];
      const res = await bot.db.fetchOne(sql, vals);

      if (!res.logging_chn) return;
      chnId = res.logging_chn;
    } catch ( err ) {console.error(err);}

    if (!chnId) return;

    // Databuilder
    const author = message.member;
    const origChannel = message.channel;
    const content = message.content;
    const guild = message.guild;
    const attachs = message.attachments || null;

    // Send to logging channel
    try {
      // Fetch channel
      const logChn = await guild.channels.fetch(chnId);
      const limit = 1024;
      // Sanatize and chunk
      const contentArray = chunkify(msgSanatize(content), limit);
      console.log(contentArray);
      // Create Embed
      const e = new MessageEmbed().setTitle("Deleted Message Log");
      e.addField("Author", author.nickname, true);
      e.addField("AuthorID", author.id, true);
      e.addField("Channel", origChannel.name , true);
      if ( attachs ) e.addField("Attachments", attachs, false);

      contentArray.forEach( chunk => {
        e.addField("Content", chunk, false);
      });

      await logChn.send({embeds: [e]});

    } catch ( err ) {console.error(err);}

  };

}