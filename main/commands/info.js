// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { SlashCommandBuilder } from "@discordjs/builders";
import { Interaction, MessageEmbed, Permissions, User } from "discord.js";
import Zen from "../Zen.js";

// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
export default class Info {
  constructor () {
    this.name = 'info';
    this.description = 'Display information about the specified target.';
    this.global = false;
    this.data = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addSubcommand( sub =>
        sub
          .setName('user')
          .setDescription("Displays a user's information.")
          .addUserOption( opt => opt.setName('target').setDescription("Selected User.")
                                .setRequired(true))
          .addBooleanOption( opt => opt.setName('hidden').setDescription("Set Ephemeral"))
      )
      .addSubcommand( sub => 
        sub
          .setName('server')
          .setDescription("Displays the server's information.")
      )
      .addSubcommand( sub => 
        sub
          .setName('self')
          .setDescription('Displays information on the bot.')
      )
      .addSubcommand( sub => 
        sub
          .setName('role')
          .setDescription("Displays information about a role.")
          .addRoleOption(role => role.setName('target').setDescription("Selected Role.")
                                      .setRequired(true))
      )
  }

  /**
   * @param {Interaction} interaction
   * @returns {Promise<void>}
   * */
  execute = async ( interaction ) => {   
    // Validation?

    // Data builder
    /**@type {Zen} */
    const bot = interaction.client;
    if (!this.bot) this.bot = bot;
    const sub = interaction.options.getSubcommand();

    // Handler
    switch (sub) {
      case "user":
        await this.userInfo( interaction ); return;        
      case "server":
        await this.serverInfo( interaction ); return;        
      case "self":
        await this.selfInfo( interaction ); return;        
      case "role":
        await this.roleInfo( interaction ); return;        
    } 
  }

  /**
   * 
   * @param {Interaction} interaction 
   */
  async userInfo (interaction) {
    // Defer reply
    const hidden = interaction.options.getBoolean('hidden');
    await interaction.deferReply({ephemeral: hidden});
    // Data builder
    /** @type {User || GuildMember} */
    const user = interaction.options.getUser('target');
    const member = await interaction.guild.members.fetch(user.id);
    const e = new MessageEmbed()

    // Basic information
    e.setAuthor(user.username);
    e.addField('ID', user.id, true);
    // Get shared servers
    const shared = "In Progress";
    e.addField('Servers', shared, true);
    // Joined
    const joined = member.joinedAt.toDateString();
    e.addField("Joined", joined, false);
    // Created
    const created = user.createdAt.toDateString();
    e.addField("Created", created, true);
    // Get roles
    const roles = member.roles.cache;
    if (roles) {
      const roleNames = roles.map(role => (role.name).replace('@', '@\u200b'));
      const data = (roles.length > 10) ? `${roles.length} roles`: roleNames.join(', ');
      e.addField("Roles", data, false);
    }

    // Add color
    const color = user.hexAccentColor || '0xf2f6f7';
    e.setColor(color); 
    // Add Avatar
    const avatar = user.avatarURL();
    if (avatar) e.setThumbnail(avatar);

    // TODO: Add last message

    // Set Footer
    const footer = Date()
    e.setFooter(`Generated at ${footer}`);

    // Send embed
    await interaction.editReply({embeds: [e], ephemeral: hidden});
  }
  
  /**
   * 
   * @param {Interaction} interaction 
   */
  async serverInfo (interaction) {
    // Defer Reply
    await interaction.deferReply();
    // Data Builder
    const e = new MessageEmbed();
    const guildId = interaction.guild.id;
    const guild = await this.bot.guilds.fetch(guildId);
    const owner = await guild.fetchOwner();
    // Get roles on the server
    const roles = Array.from(guild.roles.cache.mapValues(r => (r.name).replace('@', '@\u200b')));

    // Find Secret Channels
    const defRole = guild.roles.everyone;
    const defPerms = defRole.permissions;
    const secrets = {};
    const totals = {};

    const channels = guild.channels.cache;
    channels.forEach(chn =>{
      const perms = Permissions.FLAGS;
      const type = chn.type;
      if (!totals[type]) totals[type] = 0;
      totals[type] += 1;

      if (!secrets[type]) secrets[type] = 0;
      if (!defPerms.has(perms.VIEW_CHANNEL)) secrets[type] += 1;
      else if (type === 'GUILD_VOICE' && !(perms.CONNECT || perms.SPEAK)) secrets[type] += 1;
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
      'GUILD_CATEGORY': ':open_file_folder:',
      'GUILD_TEXT': '<:text_channel:586339098172850187>',
      'GUILD_VOICE': '<:voice_channel:586339098524909604>',
    }
    for (const [key, value] of Object.entries(totals)) {
      const secret = secrets[key];
      try {
        const emoji = key_to_emoji[key]
        if (secret) channelInfo.push(`${emoji} ${value} (${secret}) locked.`);
        else channelInfo.push(`${emoji} ${value}`)

      } catch (err) {continue}      
    }

    // Setup Feature info
    const features = guild.features;
    const all_features = {
      'ANIMATED_ICON': 'Animated Icon',
      'BANNER': 'Banner',
      'COMMERCE': 'Commerce',
      'COMMUNITY': 'Community Server',
      'DISCOVERABLE': 'Server Discovery',
      'FEATURABLE': 'Featured',
      'INVITE_SPLASH': 'Invite Splash',
      'NEWS': 'News Channels',
      'PARTNERED': 'Partnered',
      'VANITY_URL': 'Vanity Invite',
      'VERIFIED': 'Verified',
      'VIP_REGIONS': 'VIP Voice Servers',
      'WELCOME_SCREEN_ENABLED': 'Welcome Screen',
      'LURKABLE': 'Lurkable',
      'TICKETED_EVENTS_ENABLED': 'Ticketed Events',
      'MONETIZATION_ENABLED': 'Monetization Enabled',
      'THREE_DAY_THREAD_ARCHIVE': 'Thread Archive Time - 3 Days',
      'SEVEN_DAY_THREAD_ARCHIVE': 'Thread Archive Time - 7 Days',
      'PRIVATE_THREADS': 'Private Threads',
      'ROLE_ICONS': 'Role Icons',
    }
    const info = [];
    for (const [feature, label] of Object.entries(all_features)) {
      if (features.includes(feature)) info.push(`:white_check_mark:: ${label}`);
    };

    // Add feature List
    if (info.length > 0) e.addField("Features", info.join('\n'), true);
    // Add channel List
    e.addField("Channels", channelInfo.join('\n'), true);    
    // Add Boosts
    if (guild.premiumTier == 'NONE') {
      let boosts = `Level ${guild.premiumTier.charAt(guild.premiumTier.length - 1)}`;
      boosts += `\n${guild.premiumSubscriptionCount} boosts`;
      e.addField("Boosts", boosts, true);
    }
    // Add NSFW Information
    const nsfw_lvl = {
      DEFAULT: 'Default',
      EXPLICIT: 'Explicit',
      SAFE: 'Safe',
      AGE_RESTRICTED: 'Age Restricted', 
    }
    e.addField("NSFW Level", nsfw_lvl[guild.nsfwLevel], true);

    // Add member count
    const memCount = guild.memberCount;
    const botCount = (guild.members.cache.map(mem => mem.user.bot)).length;
    e.addField("Members", `Total: ${memCount} (${botCount} bots)`);
    // Add role count
    if (roles) {
      const data = (roles.length > 10) ? `${roles.length} roles`: roles.join(', ');
      e.addField("Roles", data, false);
    }

    // Add Emoji Count
    const emojiStats = {
      animated: 0, animatedDisabled: 0, regular: 0, disabled: 0
    };
    guild.emojis.cache.forEach( emoji => {
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
    e.addField("Emojis", emojiMsg, true);
    // Created Date
    e.setFooter(`Created at: ${guild.createdAt.toDateString()}`)

    await interaction.editReply({embeds:[e]});
  }

  
  async selfInfo (interaction) {}
  async roleInfo (interaction) {}

}