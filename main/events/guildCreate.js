// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { Guild } from "discord.js";
import Zen from "../Zen.js";


// ----------------------------------------------------------------
//                            Ready Event
// ----------------------------------------------------------------
export default class GuildCreateEvent {
  constructor () {
    this.name = "guildCreate";
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
    const ownerId = guild.ownerId;
    const prefix = bot.config.prefix;
    const loggingChannel = null;

    console.log(`Joined a new guild - ${guild.name}`);

    // Make a db connection to add to db
    try {
      let sql = `SELECT * FROM settings WHERE server_id=$1`;
      let values = [guild.id];
      
      const res = await bot.db.fetchOne(sql, values);

      if (!res) {
        sql = `INSERT INTO settings values($1, $2, $3, $4, $5);`;
        values = [guild.id, ownerId, prefix, loggingChannel, true];
        await bot.db.execute(sql, values);
        this.bot.logger.info(`Registering new guild settings ${values}`);
      } else {
        this.bot.logger.info("Guild already has settings stored in db.");
      }      
    } catch (err) {console.error(err);}

    // Rebuild Cache
    await bot.buildCaches();
    // TODO: Setup
  };
}
