// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { SlashCommandBuilder } from '@discordjs/builders';
import {
	CommandInteraction,
	MessageEmbed,
	Permissions,
	User,
} from 'discord.js';
import Zen from '../Zen.js';
import { TabulatedPages } from '../utils/ui/Paginator.js';

// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
export default class Info {
	constructor() {
		this.name = 'info';
		this.description = 'Display information about the specified target.';
		this.global = true;
		this.data = new SlashCommandBuilder()
			.setName(this.name)
			.setDescription(this.description)
			.addSubcommand(sub =>
				sub
					.setName('user')
					.setDescription("Displays a user's information.")
					.addUserOption(opt =>
						opt
							.setName('target')
							.setDescription('Selected User.')
							.setRequired(true)
					)
					.addBooleanOption(opt =>
						opt.setName('hidden').setDescription('Set Ephemeral')
					)
			)
			.addSubcommand(sub =>
				sub
					.setName('server')
					.setDescription("Displays the server's information.")
					.addBooleanOption(opt =>
						opt.setName('hidden').setDescription('Set Ephemeral')
					)
			)
			.addSubcommand(sub =>
				sub
					.setName('self')
					.setDescription('Displays information on the bot.')
					.addBooleanOption(opt =>
						opt.setName('hidden').setDescription('Set Ephemeral')
					)
			)
			.addSubcommand(sub =>
				sub
					.setName('role')
					.setDescription('Displays information about a role.')
					.addRoleOption(role =>
						role
							.setName('target')
							.setDescription('Selected Role.')
							.setRequired(true)
					)
					.addBooleanOption(opt =>
						opt.setName('hidden').setDescription('Set Ephemeral')
					)
			);
	}

	/**
	 * @param {CommandInteraction} interaction
	 * @returns {Promise<void>}
	 * */
	execute = async interaction => {
		// Validation?

		// Data builder
		/**@type {Zen} */
		const bot = interaction.client;
		if (!this.bot) this.bot = bot;
		// Defer Update
		const hidden = interaction.options.getBoolean('hidden');
		await interaction.deferReply({ ephemeral: hidden });
		const sub = interaction.options.getSubcommand();

		// Handler
		switch (sub) {
			case 'user':
				await this.userInfo(interaction);
				return;
			case 'server':
				await this.serverInfo(interaction);
				return;
			case 'self':
				await this.selfInfo(interaction);
				return;
			case 'role':
				await this.roleInfo(interaction);
				return;
		}
	};

	/**
	 *
	 * @param {CommandInteraction} interaction
	 */
	async userInfo(interaction) {
		// Data builder
		/** @type {User || GuildMember} */
		const user = interaction.options.getUser('target');
		const member = await interaction.guild.members.fetch(user.id);
		const bts = '```diff\n';
		const bt = '```';
		const e = new MessageEmbed();

		// Basic information
		e.setAuthor(user.username);
		e.addField('ID', `${bts}${user.id} ${bt}`, true);
		// Get shared servers
		const shared = this.bot.guilds.cache
			.map(g => g.members.cache.get(member.id))
			.filter(m => m);

		e.addField('Servers', `${bts}${shared.length} ${bt}`, true);
		// Joined
		const joined = member.joinedAt.toDateString();
		e.addField('Joined', `${bts}${joined} ${bt}`, false);
		// Created
		const created = user.createdAt.toDateString();
		e.addField('Created', `${bts}${created} ${bt}`, true);
		// Get roles
		const roles = member.roles.cache;
		if (roles) {
			const roleNames = roles.map(role => role.name.replace('@', '@\u200b'));
			const data =
				roles.size > 10 ? `${roles.size} roles` : roleNames.join(', ');
			e.addField('Roles', `${bts}${data} ${bt}`, false);
		}

		// Add color
		const color = user.hexAccentColor || 'RANDOM';
		e.setColor(color);
		// Add Avatar
		const avatar = user.avatarURL();
		if (avatar) e.setThumbnail(avatar);

		try {
			const sql = `SELECT * FROM logger WHERE server_id=$1 AND user_id=$2`;
			const vals = [interaction.guildId, user.id];
			const res = await this.bot.db.fetchOne(sql, vals);

			const msgTime = res ? res?.last_msg?.toString() : 'No last message';
			e.addField('Last Message', `${bts}${msgTime} ${bt}`);
		} catch (e) {
			this.bot.logger.error(e);
		}

		// Set Footer
		const footer = Date();
		e.setFooter(`Generated at ${footer}`);

		// Send embed
		await interaction.editReply({ embeds: [e] });
	}

	/**
	 *
	 * @param {CommandInteraction} interaction
	 */
	async serverInfo(interaction) {
		// Data Builder
		const e = new MessageEmbed().setColor('RANDOM');
		const guildId = interaction.guild.id;
		const guild = await this.bot.guilds.fetch(guildId);
		const owner = await guild.fetchOwner();
		// Get roles on the server
		const roles = Array.from(
			guild.roles.cache.mapValues(r => r.name.replace('@', '@\u200b'))
		);

		// Find Secret Channels
		const defRole = guild.roles.everyone;
		const defPerms = defRole.permissions;
		const secrets = {};
		const totals = {};

		const channels = guild.channels.cache;
		channels.forEach(chn => {
			const perms = Permissions.FLAGS;
			const type = chn.type;
			if (!totals[type]) totals[type] = 0;
			totals[type] += 1;

			if (!secrets[type]) secrets[type] = 0;
			if (!chn.permissionsFor(defRole).has(perms.VIEW_CHANNEL))
				secrets[type] += 1;
			else if (type === 'GUILD_VOICE' && !(perms.CONNECT || perms.SPEAK))
				secrets[type] += 1;
		});

		// Set up embed
		e.setTitle(guild.name);
		e.setDescription(`**ID**: ${guild.id}\n**Owner**: ${owner.user.tag}`);
		// Add image
		const avatar = guild.iconURL();
		if (avatar) e.setThumbnail(avatar);
		// Setup channel info
		const channelInfo = [];
		const key_to_emoji = {
			GUILD_CATEGORY: ':open_file_folder:',
			GUILD_TEXT: '<:text_channel:586339098172850187>',
			GUILD_VOICE: '<:voice_channel:586339098524909604>',
			GUILD_NEWS: ':loudspeaker:',
			GUILD_PUBLIC_THREAD: ':thread:',
		};

		for (const [key, value] of Object.entries(totals)) {
			const secret = secrets[key];
			try {
				const emoji = key_to_emoji[key];
				if (!emoji) continue;
				if (secret) channelInfo.push(`${emoji} ${value} (${secret}) locked.`);
				else channelInfo.push(`${emoji} ${value}`);
			} catch (err) {
				continue;
			}
		}

		// Setup Feature info
		const features = guild.features;
		const all_features = {
			ANIMATED_ICON: 'Animated Icon',
			BANNER: 'Banner',
			COMMERCE: 'Commerce',
			COMMUNITY: 'Community Server',
			DISCOVERABLE: 'Server Discovery',
			FEATURABLE: 'Featured',
			INVITE_SPLASH: 'Invite Splash',
			NEWS: 'News Channels',
			PARTNERED: 'Partnered',
			VANITY_URL: 'Vanity Invite',
			VERIFIED: 'Verified',
			VIP_REGIONS: 'VIP Voice Servers',
			WELCOME_SCREEN_ENABLED: 'Welcome Screen',
			LURKABLE: 'Lurkable',
			TICKETED_EVENTS_ENABLED: 'Ticketed Events',
			MONETIZATION_ENABLED: 'Monetization Enabled',
			THREE_DAY_THREAD_ARCHIVE: 'Thread Archive Time - 3 Days',
			SEVEN_DAY_THREAD_ARCHIVE: 'Thread Archive Time - 7 Days',
			PRIVATE_THREADS: 'Private Threads',
			ROLE_ICONS: 'Role Icons',
		};
		const info = [];
		for (const [feature, label] of Object.entries(all_features)) {
			if (features.includes(feature)) info.push(`:white_check_mark: ${label}`);
		}

		// Add feature List
		if (info.length > 0) e.addField('Features', info.join('\n'), true);
		// Add channel List
		e.addField('Channels', channelInfo.join('\n'), true);
		// Add Boosts
		if (guild.premiumTier !== 'NONE') {
			let boosts = `Level ${guild.premiumTier.charAt(
				guild.premiumTier.length - 1
			)}`;
			boosts += `\n${guild.premiumSubscriptionCount} boosts`;
			e.addField('Boosts', boosts, false);
		}
		// Add NSFW Information
		const nsfw_lvl = {
			DEFAULT: 'Default',
			EXPLICIT: 'Explicit',
			SAFE: 'Safe',
			AGE_RESTRICTED: 'Age Restricted',
		};
		e.addField('NSFW Level', nsfw_lvl[guild.nsfwLevel], true);

		// Add member count
		const memCount = guild.memberCount;
		const botCount = Array.from(
			guild.members.cache.filter(mem => mem.user.bot)
		);
		e.addField('Members', `Total: ${memCount} (${botCount.length} bots)`, true);
		// Add role count
		if (roles) {
			const data =
				roles.length > 10 ? `${roles.length} roles` : roles.join(', ');
			e.addField('Roles', data, false);
		}

		// Add Emoji Count
		const emojiStats = {
			animated: 0,
			animatedDisabled: 0,
			regular: 0,
			disabled: 0,
		};
		guild.emojis.cache.forEach(emoji => {
			if (emoji.animated) {
				emojiStats.animated += 1;
				if (!emoji.available) emojiStats.animatedDisabled += 1;
			} else {
				emojiStats.regular += 1;
				if (!emoji.available) emojiStats.disabled += 1;
			}
		});
		let emojiMsg = `Regular: ${emojiStats.regular} (${emojiStats.disabled} disabled).\n`;
		emojiMsg += `Animated: ${emojiStats.animated} (${emojiStats.animatedDisabled} disabled).\n`;
		e.addField('Emojis', emojiMsg, true);
		// Created Date
		e.setFooter(`Created at: ${guild.createdAt.toDateString()}`);

		await interaction.editReply({ embeds: [e] });
	}

	/**
	 *
	 * @param {CommandInteraction} interaction
	 */
	async selfInfo(interaction) {
		// // Data Builder
		const bot = this.bot;
		const e = new MessageEmbed();
		const bts = '```diff\n';
		const bt = '```';

		// // Add Title & Description
		e.setTitle(bot.application.name || 'Not Set');
		e.setDescription(bot.application.description || 'Not Set');

		// // Add ID, Shards, GuildCount, MemberCount & Commands count
		e.addField('Bot ID', `${bts}${bot.application.id} ${bt}`, true);
		e.addField('Guilds', `${bts}${bot.guilds.cache.size} ${bt}`, true);
		e.addField('Members', `${bts}${bot.users.cache.size} ${bt}`, false);
		e.addField(
			'Global Slash Commands',
			`${bts}${bot.application.commands.cache.size} ${bt}`,
			false
		);

		// // Add Uptime
		const uptime = (bot.uptime / 1000 / 60 / 60 / 24).toFixed(3);
		e.addField('Uptime', `${bts}${uptime} days ${bt}`, true);
		// // Add CPU & MEM usage
		// e.addField('CPU Usage', `${bts}${cpu} ${bt}`, true);

		// Add links
		e.setURL(bot.config.inviteLink);
		e.addField('Repo Link', 'https://github.com/NekroDarkmoon/Zen');
		// Add Bot Image
		e.setThumbnail(bot.user.displayAvatarURL());
		// Add Created at
		e.setFooter(`Created At: ${bot.application.createdAt.toString()}`);
		interaction.editReply({ embeds: [e] });
	}

	/**
	 *
	 * @param {CommandInteraction} interaction
	 */
	async roleInfo(interaction) {
		const page = 1;

		// Data builder
		const role = interaction.options.getRole('target');
		const e = new MessageEmbed();

		// Set up embed
		const name = role.name;
		e.setTitle(`Role: ${name}`);

		const guild = role.guild.name;
		e.addField('Server', guild, false);

		const color = role.hexColor;
		e.setColor(color);

		const members = role.members;
		e.addField('Number of members', `${members.size}`, false);

		// Modify results to needs
		let modifiedResult = [];

		members.forEach(member =>
			modifiedResult.push({ members: `- ${member.displayName}` })
		);

		// Setup Formatter
		const pageConf = {
			members: { align: 'left', minWidth: 40 },
		};

		// Construct Paginator
		const paginator = new TabulatedPages(
			'Members in role',
			modifiedResult,
			pageConf
		);

		// Construct Embed
		e.setDescription(paginator._prepareData(page));

		// Send reply
		await interaction.editReply({
			embeds: [e],
			components: paginator.components,
		});

		// Start Collecting
		try {
			await paginator.onInteraction(interaction);
		} catch (e) {
			this.bot.logger.error(e);
			return;
		}
	}

	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++
}
