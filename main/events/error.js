// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import {} from 'discord.js';
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
	 *
	 * @param {Error} error
	 */
	execute = async error => {};
}
