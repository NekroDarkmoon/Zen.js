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
	 * @param {ButtonStyle | String} style
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

		// Check if both url and id are set
		if (customId && url) throw 'Cannot mix both url and customId with Button';
		this._providedCustomId = customId ? customId : null;

		// Generate id if neither url or id are set
		if (!url && !customId) {
			customId = [...Array(16)]
				.map(() => Math.floor(Math.random() * 16).toString(16))
				.join('');
		}

		// Set style to link if url set
		if (url) {
			style = ButtonStyle.Link;
		}

		// Set Button Style based on input
		if (style > 4 || style < 0) throw 'Invalid Button Style.';
		if (!typeof style === Number) {
			switch (style.toLowerCase()) {
				case 'primary':
					style = ButtonStyle.Primary;
					break;
				case 'success':
					style = ButtonStyle.Success;
					break;
				case 'danger':
					style = ButtonStyle.Danger;
					break;
				default:
					style = ButtonStyle.Secondary;
			}
		}

		// Create button
		this._underlying = new MessageButton({
			label: label,
			customId: customId,
			style: style,
			emoji: emoji,
			url: url,
			disabled: disabled,
		});

		this._type = ComponentType.Button;
		this.row = row;
	}

	/** @override */
	toComponent() {
		return this._underlying;
	}

	/** @override */
	fromComponent() {
		return this._underlying.toJSON();
	}

	/**
	 * @override
	 */
	isDispatchable() {
		return this.customId ? true : false;
	}
}
