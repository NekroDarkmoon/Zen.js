// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember, Interaction, MessageEmbed, User } from "discord.js";
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
          .addUserOption( opt => opt.setName('target').setDescription("Selected User."))
          .addIntegerOption( opt => opt.setName('id').setDescription("ID"))
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
        await this.severInfo( interaction ); return;        
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
    await interaction.deferReply();
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
    e.addField("Joined", joined, true);
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
    await interaction.editReply({embeds: [e]});
  }
  
  async serverInfo (interaction) {}

  
  async selfInfo (interaction) {}
  async roleInfo (interaction) {}

}