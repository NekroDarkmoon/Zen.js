// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { SlashCommandBuilder } from "@discordjs/builders"
import { Interaction, Permissions } from "discord.js";


// ----------------------------------------------------------------
//                             Setup
// ----------------------------------------------------------------
export default class Setup {
  constructor () {
    this.name = 'setup';
    this.description = 'Setup the bot for the server.';
    this.global = false;
    this.data = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addSubcommand( sub => 
        sub
          .setName('loggingchannel')
          .setDescription('Select a channel for the bot to log to.')
          .addChannelOption( chn => 
            chn
              .setName('channel')
              .setDescription("Selected Channel")
              .setRequired(true)
          )
      )
      .addSubcommand( sub =>
        sub
          .setName('enablelevels')
          .setDescription('Enable the leveling system for this guild')
          .addBooleanOption( c => c.setName('choice').setDescription('True/False')
                                    .setRequired(true))
      )
      .addSubcommand( sub =>
        sub
          .setName('enablerep')
          .setDescription('Enable the reputation system for this guild')
          .addBooleanOption( c => c.setName('choice').setDescription('True/False')
                                    .setRequired(true))
      )
      .addSubcommand( sub =>
        sub
          .setName('rolereward')
          .setDescription('Set up role rewards for different systems.')
      )
  }

  /**
   * @param {Interaction} interaction
   * @returns {Promise<void>}
   * */
  execute = async ( interaction ) => {
    // Data builder
    /** @type {Zen} */
    const bot = interaction.client;
    if (!this.bot) this.bot = bot;

    // Validation - Permissions
    if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
      const msg = `Error: Permissions not met - \`Administrator\``;
      await interaction.reply({content: msg, ephemeral: true});
      return; 
    }

    // Defer reply
    await interaction.deferReply();

    // Command Handler
    const sub = interaction.options.getSubcommand();
    switch (sub) {
      case 'loggingchannel':
        await this.setupLogChn( interaction );
        return;
      case 'enablelevels': 
        await this.enableLevels( interaction );
        return
      case 'enablerep':
        await this.enableRep( interaction );
        return
    };    
  }


  /**
   * 
   * @param {Interaction} interaction 
   */
  async setupLogChn ( interaction ) {
    // Data builder
    const channel = interaction.options.getChannel('channel');
    const guild = interaction.guild;
    const ownerId = guild.ownerId;

    // Update db
    try {
      const sql = `UPDATE settings SET logging_chn=$2
                   WHERE server_id=$1`
      const values = [guild.id, channel.id];
      await this.bot.db.execute(sql, values);

      // Update Cache
      this.bot.caches.loggingChns[guild.id] = channel.id;
      // Send Interaction Update
      const msg = `Logging channel set to \`${channel.name}\``;
      await interaction.editReply(msg);

    } catch ( err ) {
      console.error(err);
      await interaction.editReply("Error - Logging Channel not set.");
      return;
    }
  }

  /**
   * 
   * @param {Interaction} interaction 
   */
  async enableLevels ( interaction ) {
    // Data Builder
    const answer = interaction.options.getBoolean('choice');
    const guild = interaction.guild;

    // Update db
    try {
      const sql = `UPDATE settings SET levels=$2
                   WHERE server_id=$1`
      const vals = [guild.id, answer];
      await this.bot.db.execute(sql, vals);

      // Update Cache
      this.bot.caches.features[guild.id].levels = answer;
      // Send Interaction Update
      const msg = `Enabled leveling system.`
      await interaction.editReply(msg);

    } catch (e) {
      console.error(e);
      await interaction.editReply("Error - Unable to update setting");
      return; 
    }

  }


  /**
   * 
   * @param {Interaction} interaction 
   */
  async enableRep ( interaction ) {
    // Data Builder
    const answer = interaction.options.getBoolean('choice');
    const guild = interaction.guild;

    // Update DB
    try {
      const sql = `UPDATE settings SET rep=$2
                   WHERE server_id=$1`
      const vals = [guild.id, answer];
      await this.bot.db.execute(sql, vals);
      // Update Cache
      this.bot.caches.features[guild.id].rep = answer;
      // Send Interaction Update
      const msg = `Enabled reputation system.`
      await interaction.editReply(msg);

    } catch (e) {
      console.error(e);
      await interaction.editReply("Error - Unable to update setting");
      return; 
    }

  }
}