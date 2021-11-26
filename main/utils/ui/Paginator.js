// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import {} from 'discord.js';
import { View } from './View.js';
import columnify from 'columnify';

// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
export class Pages extends View {
	constructor(max_pages = null, timeout = 180) {
		super(timeout);

		this.max_pages = max_pages;
		this._currPage = 1;
		this.components = this.createComponents(1);
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
			.setDisabled(page >= this.max_pages);
	}

	lastPage(page) {
		return new MessageButton()
			.setCustomId(
				JSON.stringify({ name: 'page', page: this.max_pages, type: 'last' })
			)
			.setLabel('≫')
			.setStyle('PRIMARY')
			.setDisabled(page >= this.max_pages);
	}

	stopPages() {
		return new MessageButton()
			.setCustomId(JSON.stringify({ name: 'page', page: -1, type: 'stop' }))
			.setLabel('Stop')
			.setStyle('DANGER');
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

// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
