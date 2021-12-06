// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { Guild } from 'discord.js';
import Zen from '../Zen.js';

// ----------------------------------------------------------------
//                            Ready Event
// ----------------------------------------------------------------
export default class GuildCreateEvent {
	constructor(bot) {
		this.name = 'guildCreate';
		/** @type {boolean} */
		this.once = false;
		/** @type {Zen} */
		this.bot = bot;
	}

	/**
	 * @param {Guild} guild
	 * @returns {Promise<void>}
	 */
	execute = async guild => {
		// Data builder
		const ownerId = guild.ownerId;
		const prefix = this.bot.config.prefix;
		const loggingChannel = null;

		// Validation - Ready
		if (!this.bot.isReady()) return;
		// Validation - Guild Count
		if (this.bot.guilds.cache.size > 73) {
			await guild.leave();
			this.bot.logger.warn(`73 Guilds Limit reached - Left ${guild.name}.`);
		}

		this.bot.logger.debug(`Joined a new guild - ${guild.name}`);

		// Make a db connection to add to db
		try {
			let sql = `SELECT * FROM settings WHERE server_id=$1`;
			let values = [guild.id];

			const res = await this.bot.db.fetchOne(sql, values);

			if (!res) {
				sql = `INSERT INTO settings(server_id, owner_id, prefix, setup)
							 values($1, $2, $3, $4);`;
				values = [guild.id, ownerId, prefix, true];
				await this.bot.db.execute(sql, values);
				this.bot.logger.info(`Registering new guild settings ${values}`);
			} else {
				this.bot.logger.info('Guild already has settings stored in db.');
			}
		} catch (err) {
			this.bot.logger.error(err);
		}

		// Rebuild Cache
		await this.bot.buildCaches();
		// TODO: Setup
	};
}
