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
		await this.bot.CommandHandler.setSlashPerms();
	};
}
