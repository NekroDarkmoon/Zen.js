// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import {
	Interaction,
	MessageActionRow,
	MessageButton,
	MessageCollector,
	MessageSelectMenu,
} from 'discord.js';
import {} from 'discord-api-types/v9';

// ----------------------------------------------------------------
//                               View
// ----------------------------------------------------------------
export class View {
	/**
	 *
	 * @param {Number} timeout
	 * @param {Array<>} children
	 */
	constructor(children = [], timeout = 180) {
		// Base properties
		this.timeout = timeout;
		this.children = [];

		// Calculated properties
		this.id = View.randomHex(16);
		this._rows = 1;
		this._size = 0;
		this._children = [[]];
		this.__start = false;
		this.__stopped = false;
	}

	addRow() {
		this._rows += 1;
		this._children.push([]);
	}

	/**
	 *
	 * @param {Number} row
	 */
	removeRow(row) {
		if (this._rows > 2) throw 'No row to remove.';
		this._rows -= 1;
		this._children.splice(row - 1, 1);
	}

	/**
	 *
	 * @param {MessageButton | MessageSelectMenu} component
	 * @param {Number} row
	 */
	addComponent(component, row = 1) {
		if (this.size >= 25) throw 'Maximm number of children exceeded';
		if (this._children[row - 1].size >= 5)
			throw 'Max number of components in row exceeded.';

		this._children[row - 1].push(component);
		this._size += 1;
	}

	/**
	 *
	 * @param {Array<MessageButton | MessageSelectMenu>} components
	 * @param {Number} row
	 */
	addComponents(components, row = 1) {
		components.forEach(comp => this.addComponent(comp, row));
	}

	/**
	 *
	 * @param {MessageButton | MessageSelectMenu} component
	 * @param {Number} row
	 */
	removeComponent(component, row = 1) {
		try {
			this._children[row - 1] = this._children[row - 1].filter(
				comp => comp !== component
			);
		} catch (e) {
			throw e;
		}
	}

	clearComponents() {
		this._children = [[]];
	}

	/**
	 *
	 * @param {Number} row
	 */
	clearRow(row) {
		this._children[row - 1] = [];
	}

	/**
	 *
	 * @returns {Array<MessageActionRow>} components
	 */
	toComponents() {
		const components = [];
		this._children.forEach(row => {
			components.push(new MessageActionRow().addComponents(row));
		});

		return components;
	}

	/**
	 *
	 * @param {Interaction} interaction
	 * @returns {MessageCollector}
	 */
	async onInteraction(interaction, maxClicks = 0) {
		// Create Filter
		const filter = btnInt => {
			return interaction.user.id === btnInt.user.id;
		};

		const message = await interaction.fetchReply();

		/**@type {MessageCollector} */
		const collector = message.createMessageComponentCollector({
			filter,
			max: maxClicks,
			time: 1000 * this.timeout,
		});

		return collector;
	}

	async onStop() {}

	onTimeout() {}

	onError() {}

	isFinished() {
		return this.__stopped;
	}

	stop() {
		if (this.__stopped) throw `View already stopped.`;
		this.__stopped = true;
	}

	/**
	 *
	 * @param {Number} size
	 * @returns {String}
	 */
	static randomHex(size) {
		return [...Array(size)]
			.map(() => Math.floor(Math.random() * 16).toString(16))
			.join('');
	}
}

// ----------------------------------------------------------------
//                           Export Samples
// ----------------------------------------------------------------
// export const samples = { ConfirmDenyView };

// ----------------------------------------------------------------
//                          ConfirmDenyView
// ----------------------------------------------------------------
export class ConfirmDenyView extends View {
	/**
	 *
	 * @param {String} action
	 * @param {Number} timeout
	 */
	constructor(action, timeout = 180) {
		super(timeout);
		this.customId = action;
		this.components = this.createComponents();
	}

	createComponents() {
		// Create Buttons
		const confirmButton = new MessageButton()
			.setCustomId(`confirm${this.customId}`)
			.setLabel('✔')
			.setStyle('SUCCESS');

		const denyButton = new MessageButton()
			.setCustomId(`deny${this.customId}`)
			.setLabel('✖')
			.setStyle('DANGER');

		this.addComponents([confirmButton, denyButton]);
		return this.toComponents();
	}

	/**
	 *
	 * @param {Interaction} interaction
	 * @param {Number} maxClicks
	 * @override
	 */
	async onInteraction(interaction, f, maxClicks = 1) {
		this._collector = await super.onInteraction(interaction, maxClicks);

		this._collector.on('collect', async btnInt => f(btnInt));
		this.onStop(interaction);
	}

	async onStop(interaction, f = null) {
		if (f) {
			this._collector.on('end', a => f(a));
			this.__stopped = true;
			super.__stopped = true;
			return;
		}

		this._collector.on('end', async collection => {
			await interaction.editReply({
				components: [],
			});
			this.__stopped = true;
			super.__stopped = true;
		});

		return;
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
