// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { Message, MessageEmbed } from 'discord.js';
import Zen from '../Zen.js';
import { chunkify, msgSanitize } from '../utils/utils.js';

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
		// Validation - Ready
		if (!this.bot.isReady()) return;

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
		if (before.partial || after.partial) {
			before = await before.fetch();
			after = await after.fetch();
		}

		// console.log(before);
		// Validation - Bot
		if (before.author.bot) return;
		// Validation - Content Change
		if (before.content === after.content) return;
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
			const limit = 1000;
			// Sanatize and chunk
			const oContentArray = chunkify(msgSanitize(oldContent), limit);
			const nContentArray = chunkify(msgSanitize(newContent), limit);
			const embeds = [];

			for (
				let pos = 0;
				pos < oContentArray.length || pos < nContentArray.length;
				pos++
			) {
				let title = '';
				let cont = '';
				if (pos < oContentArray.length - 1 || pos < nContentArray.length - 1) {
					title = ' [Continued]';
					cont = '...';
				}

				const before = oContentArray[pos];
				const after = nContentArray[pos];

				const e = new MessageEmbed()
					.setTitle(`Edited Message Log ${title}`)
					.setColor('ORANGE');

				e.addField(
					'Author',
					`${bts}- ${author.username}#${author.discriminator} ${bt}`,
					true
				);

				e.addField('AuthorID', `${bts}- ${author.id} ${bt}`, true);

				e.addField('Channel', `${bts}- ${oc.name} ${bt}`, false);

				if (attchs.length) e.addField('Attachments', attchs.join(',\n'), false);

				if (before !== undefined)
					e.addField('Before', `${bts}${before}${cont} ${bt}`, false);
				else e.addField('Before', `${bts} . . . ${bt}`, false);

				if (after !== undefined)
					e.addField('After', `${bts}${after}${cont} ${bt}`, false);
				else e.addField('Before', `${bts} . . . ${bt}`, false);

				embeds.push(e);
			}

			embeds.forEach(e => logChn.send({ embeds: [e] }));
		} catch (e) {
			console.error(e);
		}
	}
}
