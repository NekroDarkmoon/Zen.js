// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import {} from 'discord.js';

// ----------------------------------------------------------------
//                               Base
// ----------------------------------------------------------------
export default class BaseUI {
	constructor(timeout = 180) {
		this._timeout = timeout;
		this.children = [];
	}

	/**
	 *
	 * @param {} item
	 */
	async addItem(item) {
		// Validation - Length
		if (this.children > 25) throw 'Maximum number of children exceeded.';

		this.children.push(item);
	}
}
