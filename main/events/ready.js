// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { Client } from 'discord.js';
import Zen from '../Zen.js';

// ----------------------------------------------------------------
//                            Ready Event
// ----------------------------------------------------------------
export default class ReadyEvent {
	constructor(bot) {
		this.name = 'ready';
		/** @type {boolean} */
		this.once = true;
		/** @type {Zen} */
		this.bot = bot;
	}

	/**
	 * @param {Zen} bot
	 * @returns {Promise<void>}
	 */
	execute = async bot => {
		if (bot.config.activity) bot.user.setActivity(bot.config.activity);

		// Data builder
		const tag = bot.user.tag;
		const guildCount = bot.guilds.cache.size;

		bot.logger.info(`Logged in as ${tag}!. Currently in ${guildCount} Guilds.`);
		// Setup entries for settings if things changed while the bot was offline
		await this.updateGuildSettings();

		// Fetch Members from main guild
		const guilds = bot.config.guilds;

		bot.logger.info(`Chunking ${guilds.length} guilds.`);
		guilds.forEach(async guildId => {
			const guild = bot.guilds.cache.get(guildId);
			const members = await guild.members.fetch();
			bot.logger.info(`Chunked ${members.size} members from ${guildId}`);
			setTimeout(() => {}, 1000);
		});

		// Set Perms
		if (bot.config.deploySlash) this.bot.CommandHandler.setSlashPerms();
	};

	/**
	 *
	 */
	async updateGuildSettings() {
		try {
			const guilds = this.bot.guilds.cache;
			const sql = [];
			const vals = [];
			const s = `INSERT INTO settings (server_id, owner_id, setup)
								 VALUES ($1, $2, $3)
								 ON CONFLICT (server_id)
								 DO NOTHING;`;

			guilds.forEach(async g => {
				sql.push(s);
				vals.push([g.id, g.ownerId, true]);
			});

			this.bot.db.executeMany(sql, vals);
			this.bot.logger.info('Updated db with guild settings.	');
		} catch (e) {
			this.bot.logger.error(e);
		}
	}
}
