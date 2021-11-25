// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { SlashCommandBuilder } from '@discordjs/builders';
import { Interaction } from 'discord.js';

/**
 * @class
 * @augments Command
 */
export default class Ping {
	constructor() {
		this.name = 'ping';
		this.description = 'Responds with a latency to the server.';
		this.global = false;
		this.data = new SlashCommandBuilder()
			.setName(this.name)
			.setDescription(this.description);
	}

	/**
	 *
	 *
	 */
	execute = async interaction => {
		await interaction.reply('Pong!');
	};
}
