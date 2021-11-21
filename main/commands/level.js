// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import Zen from '../Zen.js';
import Paginator from '../structures/Paginator.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Interaction, Message, MessageEmbed, Permissions } from 'discord.js';

// ----------------------------------------------------------------
//                             Command
// ----------------------------------------------------------------
export default class Levels {
	constructor() {
		this.name = 'xp';
		this.description = 'Commands Related to the Levelling system';
		this.global = false;
		this.data = new SlashCommandBuilder()
			.setName(this.name)
			.setDescription(this.description)
			.addSubcommand(subcommand =>
				subcommand
					.setName('get')
					.setDescription('Displays the Level of a user.')
					.addUserOption(option =>
						option.setName('target').setDescription('Selected User')
					)
			)
			.addSubcommand(subcommand =>
				subcommand
					.setName('givexp')
					.setDescription('Give xp to a user.')
					.addUserOption(option =>
						option
							.setName('target')
							.setDescription('Selected User')
							.setRequired(true)
					)
					.addIntegerOption(opt =>
						opt.setName('amount').setDescription('XP given').setRequired(true)
					)
			)
			.addSubcommand(subcommand =>
				subcommand
					.setName('setxp')
					.setDescription('Set the xp of a user')
					.addUserOption(opt =>
						opt
							.setName('target')
							.setDescription('Selected User')
							.setRequired(true)
					)
					.addIntegerOption(opt =>
						opt.setName('amount').setDescription('New Amount').setRequired(true)
					)
			)
			.addSubcommand(subcommand =>
				subcommand
					.setName('xpboard')
					.setDescription('Display the leveling board for the server.')
					.addIntegerOption(option =>
						option.setName('page').setDescription('Selected page to view.')
					)
			)
			.addSubcommand(sub =>
				sub
					.setName('rewards')
					.setDescription('Display Rewards Associated with XP.')
			);
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void>}
	 * */
	execute = async (interaction, ...args) => {
		// Get Bot & interface
		/** @type {Zen} */
		const bot = interaction.client;
		if (!this.bot) this.bot = bot;

		// Defer Reply
		await interaction.deferReply();
		// Execute based on subcommand
		const sub = interaction.options.getSubcommand();
		if (sub === 'get') await this.getLevel(interaction);
		else if (sub === 'givexp') await this.giveXp(interaction);
		else if (sub === 'xpboard') await this.xpBoard(interaction, args);
		else if (sub === 'setxp') await this.setXp(interaction);
		else if (sub === 'rewards') await this.rewards(interaction);

		return;
	};

	/**
	 *
	 * @param {Interaction} interaction
	 */
	async getLevel(interaction) {
		let user = interaction.options.getUser('target');
		if (!user) user = interaction.user;

		// Get Data from db
		try {
			// Get Level Information
			const sql = 'SELECT * FROM xp WHERE server_id=$1 AND user_id=$2';
			const vals = [interaction.guild.id, user.id];
			const res = await this.bot.db.fetchOne(sql, vals);
			// Get Message Information
			const sql2 = 'SELECT * FROM logger WHERE server_id=$1 AND user_id=$2';
			const vals2 = [interaction.guild.id, user.id];
			const res2 = await this.bot.db.fetchOne(sql2, vals2);
			// Message Builder
			const xp = res ? res.xp : 0;
			const level = res ? res.level : 0;
			const nXp = Levels.calcXp(level);
			const missXp = nXp - xp;
			const msgCount = res2 ? res2.mes_count : 0;
			// Message
			let msg = `You are level ${level}, with ${xp} xp.\n`;
			msg += `Level ${
				level + 1
			} requires a total of ${nXp} xp: You need ${missXp} more xp.`;

			const e = new MessageEmbed()
				.setThumbnail(user.avatarURL())
				.setTitle(user.username)
				.setDescription(msg)
				.addField('XP', `${xp}/${nXp}`, true)
				.addField('Level', `${level}`, true)
				.addField('Messages', `${msgCount}`, true);

			await interaction.editReply({ embeds: [e] });
		} catch (e) {
			console.error(e);
			return;
		}
	}

	/**
	 *
	 * @param {Interaction} interaction
	 */
	async giveXp(interaction) {
		// Data builder
		const member = interaction.member;
		const guild = interaction.guild;
		const user = interaction.options.getUser('target');
		const xp = interaction.options.getInteger('amount');
		// Validation - Admin
		if (!member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
			const msg = `Error: Permissions not ment. \`Administrator\` `;
			await interaction.editReply(msg);
			return;
		}

		// Get Existing
		let existing = null;
		try {
			const sql = 'SELECT * FROM xp WHERE server_id=$1 AND user_id=$2';
			const vals = [interaction.guild.id, user.id];
			existing = await this.bot.db.fetchOne(sql, vals);
		} catch (e) {
			console.error(e);
			await interaction.editReply('Error: Unable to complete.');
			return;
		}
		// Calculate Updated details
		const fXp = existing ? existing.xp + xp : xp;
		const level = Levels.calcLevel(fXp);

		// Update db with new data
		try {
			if (!existing) {
				const sql = `INSERT INTO xp(server_id, user_id, xp, level)
                                VALUES ($1, $2, $3, $4);`;
				const vals = [guild.id, user.id, fXp, level];

				await this.bot.db.execute(sql, vals);
			} else {
				const sql = `UPDATE xp SET xp=$1,
                                   level=$2,
                                   last_xp=$3
                                   WHERE server_id=$4 AND user_id=$5`;
				const vals = [fXp, level, interaction.createdAt, guild.id, user.id];
				await this.bot.db.execute(sql, vals);
			}
		} catch (e) {
			console.error(e);
			await interaction.editReply('Error: Unable to Complete.');
			return;
		}

		const msg = `Gave \`${xp}\`xp to \`${user.username}\`. \`Accumulated xp: ${fXp}\` `;
		await interaction.editReply(msg);
	}

	/**
	 *
	 * @param {Interaction} interaction
	 */
	async setXp(interaction) {
		// Data builder
		const member = interaction.member;
		const guild = interaction.guild;
		const user = interaction.options.getUser('target');
		const xp = interaction.options.getInteger('amount');
		// Validation - Admin
		if (!member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
			const msg = `Error: Permissions not ment. \`Administrator\` `;
			await interaction.editReply(msg);
			return;
		}
		// Get level
		const level = Levels.calcLevel(xp);
		// Overwrite if exists
		try {
			const sql = `INSERT INTO xp (server_id, user_id, xp, level)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (server_id, user_id) 
                    DO UPDATE SET xp=$3, 
                                  level=$4;`;
			const vals = [guild.id, user.id, xp, level];
			await this.bot.db.execute(sql, vals);

			const msg = `User \`${user.username}\` now has \`${xp}\`xp.`;
			await interaction.editReply(msg);
		} catch (e) {
			console.error(e);
			await interaction.editReply('Error: Unable to Complete Interaction.');
			return;
		}
	}

	/**
	 *
	 * @param {Interaction} interaction
	 * @param {*} args
	 */
	async xpBoard(interaction, args) {
		// Data builder
		let page = interaction.options.getInteger('page');
		page = !page ? 1 : page;
		let data = null;

		// Fetch xp data
		try {
			const sql = `SELECT * FROM xp WHERE server_id=$1 ORDER BY xp DESC`;
			const vals = [interaction.guild.id];
			const res = await this.bot.db.fetch(sql, vals);
			if (!res) {
				const msg = `This server has no one with xp.`;
				await interaction.editReply(msg);
				return;
			}

			// Modify results to needs
			const modifiedResult = [];
			let count = 1;
			res.forEach(async row => {
				const user = this.bot.users.cache.get(row.user_id);

				const temp = {
					rank: count,
					user: user
						? user.username
						: (await this.bot.users.fetch(row.user_id)).username,
					xp: row.xp,
					level: row.level,
				};

				count += 1;
				modifiedResult.push(temp);
			});

			data = modifiedResult;
		} catch (e) {
			console.error(e);
			return;
		}

		// Decide on tabulated format
		const config = {
			rank: { align: 'center' },
			user: { align: 'left', midWidth: 20, maxWidth: 25 },
			xp: { align: 'center', minWidth: 8 },
			level: { align: 'center', minWidth: 4 },
		};

		// Construct Paginator
		const paginator = new Paginator(data, config);
		const components = paginator.getPaginationComponents(page);

		// Construct Embed
		const e = new MessageEmbed()
			.setColor(interaction.member.user.hexAccentColor)
			.setTitle('XP Board')
			.setDescription(paginator._prepareData(page));

		// Send Reply
		await interaction.editReply({
			embeds: [e],
			components: [components],
		});

		// Start Collecting
		try {
			paginator.startCollector(interaction);
		} catch (e) {
			this.logger.error(e);
			return;
		}
	}

	/**
	 *
	 * @param {Interaction} interaction
	 */
	async rewards(interaction) {
		// Data Builder
		const page = 1;
		let data = null;

		// Fetch Rewards Data
		try {
			const sql = `SELECT * FROM rewards WHERE server_id=$1 AND type=$2
                   ORDER BY val ASC;`;
			const vals = [interaction.guild.id, this.name];
			const res = await this.bot.db.fetch(sql, vals);
			if (!res) {
				const msg = `This server has no rewards set up for ${this.name}`;
				await interaction.editReply(msg);
				return;
			}

			// Modify resuts to datafy
			data = [];
			let count = 1;
			res.forEach(async row => {
				const role = interaction.guild.roles.cache.get(row.role_id);
				const temp = {
					role: role
						? role.name
						: await interaction.guild.roles.fetch(row.role_id),
					level: row.val,
				};

				count += 1;
				data.push(temp);
			});
		} catch (e) {
			console.error(e);
			return;
		}

		// Setup Formatter
		const pageConf = {
			role: { align: 'left', minWidth: 20 },
			level: { align: 'center', minWidth: 4 },
		};

		// Construct Paginator
		const paginator = new Paginator(data, pageConf);
		const components = paginator.getPaginationComponents(page);

		// Construct Embed
		const e = new MessageEmbed()
			.setColor(interaction.member.user.hexAccentColor)
			.setTitle('Rewards - XP')
			.setDescription(paginator._prepareData(page));

		await interaction.editReply({
			embeds: [e],
			components: [components],
		});

		// Start Collecting
		try {
			paginator.startCollector(interaction);
		} catch (e) {
			this.logger.error(e);
			return;
		}
	}

	/**
	 *
	 * @param {Number} level
	 * @returns {Number} xp
	 */
	static calcXp(level) {
		const baseXp = 400;
		const inc = 200;
		return Math.floor(baseXp * level + inc * level * (level - 1) * 0.5);
	}

	/**
	 *
	 * @param {Number} xp
	 * @returns {Number} level
	 */
	static calcLevel(xp) {
		let level = 1;
		while (xp >= Levels.calcXp(level)) level += 1;
		return level;
	}

	/**
	 *
	 * @param {String} msg
	 * @returns {Number} xp
	 */
	static genXp(msg) {
		return Math.floor(Math.random() * (15, 25) + 15);
	}
}

/**
 *
 * @param {Message} message
 */
export async function handleXpMsg(message) {
	// DataBuilder
	const guild = message.guild;
	const author = message.member;
	const time = message.createdAt;
	let eXp = null;
	let eLevel = null;

	// Get Existing Data
	try {
		const sql = `SELECT * FROM xp WHERE server_id=$1 AND user_id=$2;`;
		const vals = [guild.id, author.id];
		const res = await this.bot.db.fetchOne(sql, vals);

		if (res) {
			const eTime = res.last_xp;
			if ((time.getTime() - eTime.getTime()) / 1000 < 60) return;
			eXp = res.xp;
			eLevel = res.level;
		}
	} catch (e) {
		this.bot.logger.error(e);
		return false;
	}

	// Get XP and Level
	const xp = Levels.genXp(message.content);
	const level = Levels.calcLevel(xp + eXp);
	// Add to DB
	try {
		const sql = `INSERT INTO xp (server_id, user_id, xp, level, last_xp)
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (server_id, user_id) 
                    DO UPDATE SET xp = xp.xp + $3,
                                  level = $4,
                                  last_xp = $5;`;
		const vals = [guild.id, author.id, xp, level, time];
		await this.bot.db.execute(sql, vals);
	} catch (e) {
		this.bot.logger.error(e);
		return false;
	}

	// Create Object for Emitter
	if (level > eLevel) {
		const lEvent = { message, level };
		this.bot.emit('leveledUp', lEvent);
	}

	return true;
}
