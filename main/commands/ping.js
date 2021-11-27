// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { SlashCommandBuilder } from '@discordjs/builders';
import { Interaction, MessageEmbed } from 'discord.js';

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
	 * @param {Interaction} interaction
	 */
	execute = async interaction => {
		// Empty Reply
		const reply = await interaction.deferReply({ fetchReply: true });
		const bts = '```diff\n';
		const bt = '```';

		const e = new MessageEmbed()
			.setTitle('Pong!')
			.setColor('RANDOM')
			.addField(
				'Websocket Heartbeat',
				`${bts}- ${interaction.client.ws.ping}ms${bt}`
			)
			.addField(
				'Roundtrip latency',
				`${bts}- ${
					reply.createdTimestamp - interaction.createdTimestamp
				}ms${bt}`
			);

		await interaction.editReply({ embeds: [e] });
	};
}
