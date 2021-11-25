// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { Interaction, Message } from 'discord.js';

// ----------------------------------------------------------------
//                             Command
// ----------------------------------------------------------------
export default class Command {
	constructor(options) {}

	/**
	 *
	 * @param {Object} input
	 * @param {Interaction} input.interaction
	 * @param {Message} input.message
	 */
	execute = async ({ interaction = null, message = null }) => {};
}
