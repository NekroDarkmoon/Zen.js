// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { SlashCommandBuilder } from '@discordjs/builders';
import {
	Interaction,
	MessageActionRow,
	MessageButton,
	Permissions,
} from 'discord.js';

// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
export default class Ban {
	constructor() {
		this.name = 'unban';
		this.description = 'Unbans a user from the server.';
		this.global = false;
		this.data = new SlashCommandBuilder()
			.setName(this.name)
			.setDescription(this.description)
			.addUserOption(opt =>
				opt.setName('target').setDescription('Selected User').setRequired(true)
			)
			.addStringOption(opt =>
				opt.setName('reason').setDescription('Reason for unban.')
			);
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void>}
	 * */
	execute = async interaction => {
		// Validation - Permissions
		if (!interaction.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
			const msg = `Error: Permissions not met - \`Ban Members\``;
			await interaction.reply({ content: msg, ephemeral: true });
			return;
		}

		// Data builder
		const user = interaction.options.getUser('target');
		const reason = interaction.options.getString('reason') || '';
		const channel = interaction.channel;

		// Inital reply
		interaction.reply({
			content: `\`Are you sure you wish to unban ${user.username}\``,
			// ephemeral: true,
			components: [
				new MessageActionRow()
					.addComponents(
						new MessageButton()
							.setCustomId('confirmUnban')
							.setLabel('✔')
							.setStyle('SUCCESS')
					)
					.addComponents(
						new MessageButton()
							.setCustomId('denyUnban')
							.setLabel('✖')
							.setStyle('DANGER')
					),
			],
		});

		// Filter
		const filter = btnInteraction => {
			return interaction.user.id === btnInteraction.user.id;
		};

		// Collectors
		const collector = channel.createMessageComponentCollector({
			filter,
			max: 1,
			time: 1000 * 15,
		});

		collector.on('collect', async btnInteraction => {
			if (btnInteraction.component.customId === 'confirmUnban') {
				await interaction.guild.members.unban(user.id);
				const msg = `Unbanned ${user.username} for the following reason:\n${reason}`;
				await btnInteraction.update({ content: msg, ephemeral: false });

				// TODO: Log it
			} else {
				await btnInteraction.update({ content: 'Action Cancelled.' });
			}
		});

		collector.on('end', async collection => {
			await interaction.editReply({
				components: [],
			});
		});
	};
}
