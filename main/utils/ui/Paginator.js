// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import {
	Interaction,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
} from 'discord.js';

import { View } from './view.js';
import columnify from 'columnify';

// ----------------------------------------------------------------
//                             Paginator
// ----------------------------------------------------------------
export default class Paginator {
	/**
	 * @param {Array} data
	 * @param {Object} config
	 * @param {Number} max_pages
	 */
	constructor(data, config = {}, max_pages = null) {
		this.collector = null;
		this.data = data;
		this.config = config;
		this.max_pages = max_pages ? max_pages : Math.ceil(data.length / 15);
		this.view = new View();
	}

	/**
	 *
	 * @param {Number} page
	 * @returns {MessageActionRow} actionRow
	 */
	getPaginationComponents(page) {
		// TODO: select menu
		console.log(View.randomHex(16));

		const firstPage = new MessageButton()
			.setCustomId(JSON.stringify({ name: 'page', page: 1, type: 'first' }))
			.setLabel('≪')
			.setStyle('PRIMARY')
			.setDisabled(page < 2);

		const prevButton = new MessageButton()
			.setCustomId(
				JSON.stringify({ name: 'page', page: page - 1, type: 'prev' })
			)
			.setLabel('◀')
			.setStyle('PRIMARY')
			.setDisabled(page < 2);

		// const current = new MessageButton()
		// 	.setCustomId(View.randomHex(16))
		// 	.setLabel('⟳')
		// 	.setStyle('SECONDARY');

		const nextButton = new MessageButton()
			.setCustomId(
				JSON.stringify({ name: 'page', page: page + 1, type: 'next' })
			)
			.setLabel('▶')
			.setStyle('PRIMARY')
			.setDisabled(page >= this.max_pages);

		const lastButton = new MessageButton()
			.setCustomId(
				JSON.stringify({ name: 'page', page: this.max_pages, type: 'last' })
			)
			.setLabel('≫')
			.setStyle('PRIMARY')
			.setDisabled(page >= this.max_pages);

		const stop = new MessageButton()
			.setCustomId(JSON.stringify({ name: 'page', page: -1, type: 'stop' }))
			.setLabel('Stop')
			.setStyle('DANGER');

		// Add Buttons to view
		this.view.clearComponents();
		this.view.addComponents([
			firstPage,
			prevButton,
			// current,
			nextButton,
			lastButton,
			stop,
		]);

		return this.view.toComponents();
	}

	/**
	 *
	 * @param {Interaction} msgInteraction
	 * @param {number} time
	 */
	startCollector(msgInteraction, time = 1000 * 30) {
		// Data builder
		/** @type {Interaction.channel} */
		const channel = msgInteraction.channel;
		const filter = btnInteraction => {
			return msgInteraction.user.id === btnInteraction.user.id;
		};

		// Create collector
		this.collector = channel.createMessageComponentCollector({
			filter,
			time: time,
		});

		this.collect(msgInteraction);
	}

	/**
	 *
	 * @param {*} msgInteraction
	 */
	collect(msgInteraction) {
		if (!this.collector) throw 'No collector found';

		this.collector.on('collect', async btnInteraction => {
			// Get page number
			const pageNum = JSON.parse(btnInteraction.component.customId).page;
			const type = JSON.parse(btnInteraction.component.customId).type;

			// End if stop
			if (type === 'stop') {
				await this.collector.stop();
				return;
			}

			// Prepate data for pageNumber
			const data = this._prepareData(pageNum);

			// Create embed
			const e = new MessageEmbed()
				.setTitle('RepBoard')
				.setDescription(data)
				.setColor('DARK_GOLD');

			// Update components
			const components = this.getPaginationComponents(pageNum);
			console.log('Imhere');
			console.log(components);

			await btnInteraction.update({
				components: components,
				embeds: [e],
			});
		});

		this.collector.on('end', async collection => {
			await msgInteraction.editReply({
				components: [],
			});
		});
	}

	/**
	 *
	 * @param {Number} page
	 * @returns
	 */
	_prepareData(page) {
		const maxLines = 15;
		const data = this.data;
		// Splice array for 15 values if exists
		// TODO: Add check for no content
		const display = data.slice((page - 1) * maxLines, page * maxLines);

		// Tabulate data for display
		const tabulated = this.tabulate(display);
		return tabulated;
	}

	/**
	 *
	 * @param {Array<{}>} data
	 * @returns
	 */
	tabulate(data) {
		// Data builder
		const options = {
			columnSplitter: ' | ',
			config: this.config,
			headingTransform: function (heading) {
				return `--${heading.toUpperCase()}--`;
			},
		};

		const columns = columnify(data, options);
		return `\`\`\`\n${columns}\n\`\`\``;
	}
}
