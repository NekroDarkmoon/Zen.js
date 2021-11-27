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

		this.bot.logger.info(
			`Logged in as ${tag}!. Currently in ${guildCount} Guilds.`
		);

		// Fetch Members from main guild
		await bot.guilds.cache.get(bot.config.guild_id).members.fetch();
	};
}
