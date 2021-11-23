// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { ButtonStyle, ComponentType } from 'discord-api-types/v9';
import { Emoji, MessageButton } from 'discord.js';
import UIItem from './item.js';

// ----------------------------------------------------------------
//                            Button UI
// ----------------------------------------------------------------
export default class ButtonUI extends UIItem {
	/**
	 *
	 * @param {ButtonStyle} style
	 * @param {String} label
	 * @param {Boolean} disabled
	 * @param {String} customId
	 * @param {String} url
	 * @param {Emoji} emoji
	 * @param {Number} row
	 */
	constructor({
		style = ButtonStyle.Secondary,
		label = '',
		disabled = false,
		customId = null,
		url = null,
		emoji = null,
		row = null,
	}) {
		// Super
		super();

		const button = new MessageButton();

		// Check if both url and id are set
		if (customId && url) throw 'Cannot mix both url and customId with Button';
		this._providedCustomId = customId ? customId : null;

		// Generate id if neither url or id are set
		if (!url && !customId) {
			customId = [...Array(16)]
				.map(() => Math.floor(Math.random() * 16).toString(16))
				.join('');
		}

		// Set custom ID
		button.setCustomId(customId);

		// Set style to link if url set
		if (url) {
			style = ButtonStyle.Link;
			button.setURL(url);
		}

		// Add additional properties
		if (label) button.setLabel(label);
		button.setStyle(style);
		if (emoji) button.setEmoji(emoji);
		if (disabled) button.setDisabled(disabled);

		this._underlying = button;
		this.type = ComponentType.Button;
		this.row = row;

		console.log(this._underlying);
	}

	toComponent() {
		return this._underlying;
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
