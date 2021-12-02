// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { Message } from 'discord.js';
import Collection from '@discordjs/collection';
import MessageDeleteEvent from './messageDelete.js';
import Zen from '../Zen.js';

// ----------------------------------------------------------------
//                            Ready Event
// ----------------------------------------------------------------
export default class MessageDeleteBulkEvent {
	constructor(bot) {
		this.name = 'messageDeleteBulk';
		/** @type {boolean} */
		this.once = false;
		/** @type {Zen} */
		this.bot = bot;
	}

	/**
	 * @param {Collection<Message>} mCollection
	 * @returns {Promise<void>}
	 */
	execute = async mCollection => {
		// Validation - Ready
		if (!this.bot.isReady()) return;

		try {
			await this.logEvent(mCollection);
		} catch (e) {
			console.error(e);
			return;
		}
	};

	/**
	 *
	 * @param {Collection<Message>} mCollection
	 * @returns
	 */
	async logEvent(mCollection) {
		mCollection.forEach(dEvent => this.bot.emit('messageDelete', dEvent));
	}
}
