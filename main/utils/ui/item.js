// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { ComponentType } from 'discord-api-types/v9';
import {} from 'discord.js';

// ----------------------------------------------------------------
//                             Base Item
// ----------------------------------------------------------------
export default class UIItem {
	constructor() {
		this._ui = null;
		this._row = null;
		this._providedCustomId = false;
	}

	/** @returns {ComponentType.Button | ComponentType.SelectMenu} */
	toComponent() {}
	/** @returns {{}} */
	fromComponent() {}
	/** @returns {boolean} */
	isDispatchable() {}
}

// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
