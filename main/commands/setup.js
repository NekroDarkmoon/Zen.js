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

    // Command Handler
    const sub = interaction.options.getSubcommand();
    switch (sub) {
      case 'loggingchannel':
        await this.setupLogChn( interaction );
        return;
    };    
  }


  /**
   * 
   * @param {Interaction} interaction 
   */
  async setupLogChn ( interaction ) {
    // Defer reply
    await interaction.deferReply();
    // Data builder
    const channel = interaction.options.getChannel('channel');
    const guild = interaction.guild;
    const ownerId = guild.ownerId;

    // Update db
    try {
      const sql = `INSERT INTO settings (server_id, owner_id, logging_chn)
                   VALUES ($1, $2, $3)
                   ON CONFLICT (server_id) 
                   DO UPDATE SET logging_chn = $3;`
      const values = [guild.id, ownerId, channel.id];
      await this.bot.db.execute(sql, values);

      const msg = `Logging channel set to \`${channel.name}\``;
      await interaction.editReply(msg);

    } catch ( err ) {
      console.error(err);
      await interaction.editReply("Error - Logging Channel not set.");
      return;
    }
  }
}