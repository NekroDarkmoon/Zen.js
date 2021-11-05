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
    const bot = message.client;
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
    // Data builder
    const channel = interaction.options.getChannelOption('loggingchannel');
    const guild = interaction.guild;
    const owner =     

    // 
  }
}