// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { SlashCommandBuilder } from '@discordjs/builders';
import { Interaction } from 'discord.js';
import Command from '../structures/Command.js';

/**
 * @inheritdoc
 */
export default class Ping extends Command {
	constructor() {
		super();
		this.name = 'ping';
		this.description = 'Responds with a latency to the server.';
		this.global = false;
		this.data = new SlashCommandBuilder()
			.setName(this.name)
			.setDescription(this.description);
	}

	execute = async ({ interaction }) => {
		await interaction.reply('Pong!');
	};
}
