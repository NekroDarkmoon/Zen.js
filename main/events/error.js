// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import {} from 'discord.js';
import Zen from '../Zen.js';

// ----------------------------------------------------------------
//                            Ready Event
// ----------------------------------------------------------------
export default class ErrorEvent {
	constructor(bot) {
		this.name = 'error';
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
