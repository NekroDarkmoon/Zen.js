// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { SlashCommandBuilder } from "@discordjs/builders";
import { Interaction } from "discord.js";
import Zen from "../Zen";

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

        return;
      case "server":
        return;
      case "self":
        return;
      case "role":
        return;
    } 
  }


  async userInfo (interaction) {
    
  }
  
  async selfInfo (interaction) {}
  async serverInfo (interaction) {}
  async roleInfo (interaction) {}

}