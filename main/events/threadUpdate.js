// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { ThreadChannel } from 'discord.js';
import { handleKeepAliveEvent } from '../commands/threads.js';
import Zen from '../Zen.js';

// ----------------------------------------------------------------
//                            Ready Event
// ----------------------------------------------------------------
export default class ThreadUpdateEvent {
	constructor(bot) {
		this.name = 'threadUpdate';
		/** @type {boolean} */
		this.on = true;
		/** @type {Zen} */
		this.bot = bot;
	}

	/**
	 * @param {ThreadChannel} oldThread
	 * @param {ThreadChannel} newThread
	 * @returns {Promise<void>}
	 */
	execute = async (oldThread, newThread) => {
		// Validation - Ready
		if (!this.bot.isReady()) return;

		// Handle Keep Alive
		const state = handleKeepAliveEvent(this.bot, oldThread, newThread);
	};
}
