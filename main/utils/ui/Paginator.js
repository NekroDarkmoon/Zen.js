// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import {
	Interaction,
	MessageButton,
	MessageCollector,
	MessageEmbed,
} from 'discord.js';
import { View } from './View.js';
import columnify from 'columnify';

// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
export class Pages extends View {
	constructor(maxPages = null, timeout = 180) {
		super(timeout);

		this.maxPages = maxPages ? maxPages : 1;
		this._currPage = 1;
		this.components = this.createComponents(this._currPage);
	}

	/**
	 *
	 * @param {Number} page
	 * @returns {Array<MessageActionRow>} components
	 */
	createComponents(page) {
		// Get buttons
		this.clearComponents();
		const comps = [
			this.firstPage(page),
			this.prevPage(page),
			this.nextPage(page),
			this.lastPage(page),
			this.stopPages(page),
		];

		this.addComponents(comps);
		return this.toComponents();
	}

	/**
	 *
	 * @param {Interaction} interaction
	 * @param {Number} maxClicks
	 * @returns {MessageCollector}
	 * @override
	 */
	async onInteraction(interaction, maxClicks = 0) {
		return await super.onInteraction(interaction, maxClicks);
	}

	/**
	 *
	 * @param {Interaction} interaction
	 * @override
	 */
	async onStop(interaction) {
		if (!this._collector) throw 'No collector exists.';

		this._collector.on('end', async collection => {
			await interaction.editReply({
				components: [],
			});
			this.__stopped = true;
		});

		return;
	}

	/**
	 *
	 * @param {Number} page
	 */
	_prepareData(page) {}

	// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	//                              Buttons
	firstPage(page) {
		return new MessageButton()
			.setCustomId(JSON.stringify({ name: 'page', page: 1, type: 'first' }))
			.setLabel('≪')
			.setStyle('PRIMARY')
			.setDisabled(page < 2);
	}

	prevPage(page) {
		return new MessageButton()
			.setCustomId(
				JSON.stringify({ name: 'page', page: page - 1, type: 'prev' })
			)
			.setLabel('◀')
			.setStyle('PRIMARY')
			.setDisabled(page < 2);
	}

	currentPage(page) {
		return new MessageButton()
			.setCustomId(View.randomHex(16))
			.setLabel('⟳')
			.setStyle('SECONDARY');
	}

	nextPage(page) {
		return new MessageButton()
			.setCustomId(
				JSON.stringify({ name: 'page', page: page + 1, type: 'next' })
			)
			.setLabel('▶')
			.setStyle('PRIMARY')
			.setDisabled(page >= this.maxPages);
	}

	lastPage(page) {
		return new MessageButton()
			.setCustomId(
				JSON.stringify({ name: 'page', page: this.maxPages, type: 'last' })
			)
			.setLabel('≫')
			.setStyle('PRIMARY')
			.setDisabled(page >= this.maxPages);
	}

	stopPages() {
		return new MessageButton()
			.setCustomId(JSON.stringify({ name: 'page', page: -1, type: 'stop' }))
			.setLabel('Stop')
			.setStyle('DANGER');
	}
}

// ----------------------------------------------------------------
//                      Tabulated Data Paginator
// ----------------------------------------------------------------
export class TabulatedPages extends Pages {
	/**
	 *
	 * @param {string} action
	 * @param {Array<Object>} data
	 * @param {Object} config
	 * @param {Numer} maxPages
	 * @param {Number} maxLines
	 * @param {Numebr} timeout
	 */
	constructor(
		action,
		data,
		config = {},
		maxPages = null,
		maxLines = 15,
		timeout = 180
	) {
		maxPages = maxPages ? maxPages : Math.ceil(data.length / maxLines);
		super(maxPages, timeout);
		this.customId = action;
		this.data = data;
		this.config = config;
		this.maxLines = maxLines;
	}

	/**
	 *
	 * @param {Number} page
	 * @override
	 */
	createComponents(page) {
		return super.createComponents(page);
	}

	/**
	 *
	 * @param {Interaction} interaction
	 * @param {Number} maxClicks
	 */
	async onInteraction(interaction, maxClicks = 0) {
		this._collector = await super.onInteraction(interaction, maxClicks);

		this._collector.on('collect', async btnInt => {
			// Data Builder
			const pageNum = JSON.parse(btnInt.component.customId).page;
			const type = JSON.parse(btnInt.component.customId).type;

			// End if Stopped
			if (type === 'stop') {
				await this._collector.stop();
				return;
			}

			// Prep Data
			const data = this._prepareData(pageNum);
			// Create Embed
			const e = new MessageEmbed()
				.setTitle(this.customId)
				.setDescription(data)
				.setColor('RANDOM');
			// Update Components
			this.components = this.createComponents(pageNum);
			await btnInt.update({
				components: this.components,
				embeds: [e],
			});
		});

		this.onStop(interaction);
	}

	/**
	 *
	 * @param {Number} page
	 * @returns {String}
	 */
	_prepareData(page) {
		const data = this.data;
		const display = data.slice(
			(page - 1) * this.maxLines,
			page * this.maxLines
		);

		// Tabulate data for display
		const tabulated = this.tabulate(display);
		return tabulated;
	}

	/**
	 *
	 * @param {Array<>} data
	 * @returns {String}
	 */
	tabulate(data) {
		// Data Builder
		const options = {
			columnSplitter: '  ',
			config: this.config,
			headingTransform: heading => `${heading}\n${`-`.repeat(heading.length)}`,
		};

		const tabulated = columnify(data, options);
		return `\`\`\`\n${tabulated}\n\`\`\``;
	}
}

// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------

// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------

// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------

// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------

// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------

// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
