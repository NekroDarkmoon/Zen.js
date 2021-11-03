// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { Message } from "discord.js";
import Zen from "../Zen.js";


// ----------------------------------------------------------------
//                            Ready Event
// ----------------------------------------------------------------
export default class MessageCreateEvent {
  constructor () {
    this.name = "messageCreate";
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


    // Fire sub events
    await this.levelHandler(message);
    await this.repHandler(message);

  };


  /**
   * 
   * @param {Message} message 
   */
  async levelHandler ( message ) {

  }


  /**
   * 
   * @param {Message} message 
   */
  async repHandler ( message ) {

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // Message filter
    const _checkMsg = (msg) => {
      return [
			m => /(?<!no )(?<![A-z])th(a?n(k|x(?!s))s?)(?![A-z])/gi.test(m.content),   // Permutations or Abbreviations of thanks, but not preceeded by "no"
			m => /(?<![A-z])ty(vm)?(?![A-z])/gi.test(m.content),                       // "tyvm" or just "ty"
			m => /(?<![A-z])dankee?(?![A-z])/gi.test(m.content),                       // Constains "danke"
			m => /(?<![A-z])ありがとう?(?![A-z])/gi.test(m.content),                       // Constains "danke"
			m => /:upvote:/gi.test(m.content)                                          // The +1 emoji
		  ].some(test=> test(msg));
    };
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    // Validation - Mention & test
    if (!message.mentions.users.size || !_checkMsg(message)) return;

    // Data builder
    const users = [...message.mentions.users.values()]
                  .filter(u => u.id !== message.author.id)
                  .filter(u => !u.bot);
    
    // Validation - Length
    if (!users.length) return;

    // Give rep to users
    try {
      // Construct Sql Array
      const sqlArray = [];
      const valArray = []; 
      users.forEach( user => {
        const sql = `INSERT INTO rep (server_id, user_id, rep)
                     VALUES ($1, $2, $3)
                     ON CONFLICT ON CONSTRAINT server_user 
                     DO UPDATE SET rep = rep.rep + $3;`
        const values = [message.guild.id, user.id, 1];
        sqlArray.push(sql);
        valArray.push(values);       
      });

      await this.bot.db.executeMany(sqlArray, valArray);
    } catch ( err ) {console.log(err)}


    // Send notif
    const msg = `Gave rep to \`${users.map(u => u.username).join(", ")}\``;
    await message.reply(msg);
  }
}
