// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import {
	Channel,
	Interaction,
	Message,
	MessageActionRow,
	MessageButton,
	MessageSelectMenu,
} from 'discord.js';
import { ComponentType } from 'discord-api-types/v9';

// ----------------------------------------------------------------
//                              View
// ----------------------------------------------------------------
export class View {
	/**
	 *
	 * @param {Number} timeout
	 */
	constructor(timeout = 180) {
		this.timeout = 180;
		this._rows = null; // Not Implemented Yet TODO:
		this._children = [];
		this.__start = false;
		this.__stopped = false;
	}

	/**
	 * Not Implemented
	 */
	// TODO:
	addRow() {}

	// TODO:
	removeRow() {}

	/**
	 *
	 * @param {ComponentType.Button | ComponentType.SelectMenu} component
	 * @param {Number} row
	 */
	addComponent(component, row = 0) {
		if (this._children > 25) throw 'Maximum number of children exceeded';
		// TODO: Perform check

		this._children.push(component);
	}

	/**
	 *
	 * @param {ComponentType.Button | ComponentType.SelectMenu} component
	 * @param {Number} row
	 */
	// TODO: Might not work
	removeComponent(component, row = 0) {
		try {
			this._children = this._children.filter(comp => comp !== component);
		} catch (e) {
			throw e;
		}
	}

	/**
	 * Clears all components on this view.
	 */
	clearComponents() {
		this._children = [];
	}

	/**
	 *
	 * @returns {Array<MessageActionRow>}
	 */
	toComponents() {
		const components = new MessageActionRow();
		this._children.forEach(component => {
			// Temp Fix TODO:
			components.addComponents(component);
		});

		return [components];
	}

	/**
	 *
	 * @returns {boolean}
	 */
	isFinished() {
		return this.__stopped;
	}

	/**
	 * Not Implemented
	 */
	// TODO:
	stop() {}

	/**
	 *
	 * @param {Channel} channel
	 * @param {Number} maxClicks
	 * @returns
	 */
	createCollector(channel, interaction, maxClicks = 1) {
		const filter = btnInt => {
			return interaction.user.id === btnInt.user.id;
		};

		const collector = channel.createMessageComponentCollector({
			filter,
			max: maxClicks,
			time: 1000 * this.timeout,
		});

		this._collector = collector;
		return collector;
	}

	async collect(f) {
		this._collector.on('collect', f);
	}

	async end(interaction, f = null) {
		if (!f) {
			await interaction.editReply({
				components: [],
			});
		}

		this._collector.on('end', f);
	}
}

// ----------------------------------------------------------------
//                     Sample Confirm Deny View
// ----------------------------------------------------------------
export function confirmDenyView(id, timeout = 180) {
	// Create Buttons
	const confirmButton = new MessageButton()
		.setCustomId(`confirm${id}`)
		.setLabel('✔')
		.setStyle('SUCCESS');

	const denyButton = new MessageButton()
		.setCustomId(`deny${id}`)
		.setLabel('✖')
		.setStyle('DANGER');

	// Create new View
	const view = new View(timeout);
	view.addComponent(confirmButton);
	view.addComponent(denyButton);

	return view;
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
