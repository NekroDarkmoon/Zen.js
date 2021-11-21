// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { Message, MessageEmbed } from 'discord.js';
import { chunkify, msgSanatize } from '../utils/utils.js';
import Zen from '../Zen.js';

// ----------------------------------------------------------------
//                            Ready Event
// ----------------------------------------------------------------
export default class MessageDeleteEvent {
	constructor(bot) {
		this.name = 'messageDelete';
		/** @type {boolean} */
		this.once = false;
		/** @type {Zen} */
		this.bot = bot;
	}

	/**
	 * @param {Message} message
	 * @returns {Promise<void>}
	 */
	execute = async message => {
		// Data builder
		/** @type {Zen} */
		const bot = message.client;
		if (!this.bot) this.bot = bot;

		try {
			await this.logEvent(message);
		} catch (e) {
			console.error(e);
			return;
		}
	};

	/**
	 *
	 * @param {Message} message
	 * @returns
	 */
	async logEvent(message) {
		// Validation - Bot
		if (message.author?.bot) return;
		// Validation - Partial
		if (message.partial) return;
		// Validation - regex
		const regex = '^[^"\'.w]';
		// Validation - length
		if (message.content.length < 3) return;

		// Get logging channel
		const chnId = this.bot.caches.loggingChns[message.guild.id] || null;
		if (!chnId) return;

		// Databuilder
		const author = message.author;
		const origChannel = message.channel;
		const content = message.content;
		const guild = message.guild;
		const attachs = Array.from(message.attachments.map(a => a.url));

		// Send to logging channel
		try {
			// Fetch channel
			const logChn = await guild.channels.fetch(chnId);
			const limit = 1024;
			// Sanatize and chunk
			const contentArray = chunkify(msgSanatize(content), limit);
			// Create Embed
			const e = new MessageEmbed().setTitle('Deleted Message Log');
			e.addField('Author', `${author.username}#${author.discriminator}`, true);
			e.addField('AuthorID', author.id, true);
			e.addField('Channel', origChannel.name, false);
			if (attachs.length) e.addField('Attachments', attachs.join(',\n'), false);

			contentArray.forEach(chunk => {
				e.addField('Content', chunk.toString(), false);
			});

			await logChn.send({ embeds: [e] });
		} catch (err) {
			console.error(err);
		}
	}
}
