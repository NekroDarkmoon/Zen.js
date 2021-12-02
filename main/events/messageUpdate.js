// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { Message, MessageEmbed } from 'discord.js';
import Zen from '../Zen.js';
import { chunkify, msgSanatize } from '../utils/utils.js';

// ----------------------------------------------------------------
//                            Ready Event
// ----------------------------------------------------------------
export default class MessageUpdateEvent {
	constructor(bot) {
		this.name = 'messageUpdate';
		/**@type {Zen} */
		this.bot = bot;
		/** @type {boolean} */
		this.once = false;
	}

	/**
	 * @param {Message} message
	 * @returns {Promise<void>}
	 */
	execute = async (oldMessage, newMessage) => {
		// Data builder
		/** @type {Zen} */
		const bot = oldMessage.client;
		if (!this.bot) this.bot = bot;

		try {
			await this.logEvent(oldMessage, newMessage);
		} catch (e) {
			console.error(e);
			return;
		}
	};

	/**
	 * @param {Message} before
	 * @param {Message} after
	 */
	async logEvent(before, after) {
		// Validation - Partial
		if (before.partial) {
			before = await before.fetch();
			after = await after.fetch();
		}
		// Validation - Bot
		if (before.author.bot) return;
		// Validation - Content Change
		if (before.content === after) return;
		// Get logging channel
		const chnId = this.bot.caches[before.guild.id].channels.logChn;
		if (!chnId) return;

		// DataBuilder
		const bts = '```diff\n';
		const bt = '```';
		const author = before.author;
		const oc = before.channel;
		const oldContent = before.content;
		const newContent = after.content;
		const guild = before.guild;
		const attchs = Array.from(after.attachments.map(a => a.url));

		// Send to logging channel
		try {
			// Fetch Channel
			const logChn = await guild.channels.fetch(chnId);
			const limit = 1024;
			// Sanatize and chunk
			const oContentArray = chunkify(msgSanatize(oldContent), limit);
			const nContentArray = chunkify(msgSanatize(newContent), limit);
			// Create Embed
			const e = new MessageEmbed()
				.setTitle('Edited Message Log')
				.setColor('ORANGE');

			e.addField(
				'Author',
				`${bts} ${author.username}#${author.discriminator} ${bt}`,
				true
			);

			e.addField('AuthorID', `${bts} ${author.id} ${bt}`, true);

			e.addField('Channel', `${bts} ${oc.name} ${bt}`, false);

			if (attchs.length) e.addField('Attachments', attchs.join(',\n'), false);

			oContentArray.forEach(chunk =>
				e.addField('Before', `${bts} ${chunk.toString()} ${bt}`, false)
			);
			nContentArray.forEach(chunk =>
				e.addField('After', `${bts} ${chunk.toString()} ${bt}`, false)
			);

			await logChn.send({ embeds: [e] });
		} catch (e) {
			console.error(e);
		}
	}
}
