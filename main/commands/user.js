// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
export default class User {
	constructor() {
		this.name = 'user';
		this.description = 'Not Implemented';
		this.global = true;
		this.data = new SlashCommandBuilder()
			.setName(this.name)
			.setDescription(this.description)
			.addSubcommandGroup(group =>
				group
					.setName('settings')
					.setDescription('Global/ Server settings for a users.')
					.addSubcommand(sub =>
						sub
							.setName('settimezone')
							.setDescription(
								'Set your timezone to be used in time related commands.'
							)
							.addNumberOption(num =>
								num
									.setName('timezone')
									.setDescription(
										'Numeric representation of timezone in relation to UTC.'
									)
									.setRequired(true)
							)
					)
			);
	}

	/**
	 * @param {CommandInteraction} interaction
	 * @returns {Promise<void>}
	 * */
	execute = async interaction => {
		// Get Bot & interface
		/** @type {Zen} */
		const bot = interaction.client;
		if (!this.bot) this.bot = bot;
		// Defer Reply
		await interaction.deferReply();

		// Execute based on subcommand
		const sub = interaction.options.getSubcommand();

		switch (sub) {
			case 'settimezone':
				await this.setTimezone(interaction);
				return;
		}

		return;
	};

	/**
	 *
	 * @param {CommandInteraction} interaction
	 */
	async setTimezone(interaction) {
		// Data Builder
		const { guildId, user, options } = interaction;
		const timezone =
			Math.round((options.getNumber('timezone') + Number.EPSILON) * 100) / 100;

		// Validation of timezone
		if (timezone > 14 || timezone < -12)
			return interaction.editReply(
				'The specified timezone is not in range of defined timezones.'
			);

		try {
			const sql = `INSERT INTO users (user_id, timezone)
                     VALUES ($1, $2)
                     ON CONFLICT (user_id) 
                     DO UPDATE SET timezone = $2;`;
			const vals = [user.id, timezone];

			await this.bot.db.execute(sql, vals);
		} catch (e) {
			this.bot.logger.error(e);
			return interaction.editReply(
				'Something went wrong while setting up timezone.'
			);
		}

		return interaction.editReply(`Timezone set to ${timezone}`);
	}
}
