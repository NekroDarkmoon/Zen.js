// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import Zen from "../Zen.js";
import Paginator from "../structures/Paginator.js";
import { SlashCommandBuilder } from "@discordjs/builders"
import { Interaction, MessageEmbed, Permissions } from "discord.js";

// ----------------------------------------------------------------
//                             Command
// ----------------------------------------------------------------
export default class Levels {
  constructor () {
    this.name = 'levels';
    this.description = 'Commands Related to the Levelling system';
    this.global = false;
    this.data = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addSubcommand( subcommand => 
        subcommand
          .setName('get')
          .setDescription('Displays the Level of a user.')
          .addUserOption( option => option.setName('target').setDescription('Selected User'))
      )
      .addSubcommand( subcommand => 
        subcommand
          .setName('givexp')
          .setDescription('Give xp to a user.')
          .addUserOption( option => 
            option
              .setName('target')
              .setDescription('Selected User')
              .setRequired(true)
          )
          .addIntegerOption( opt => opt.setName('amount').setDescription('XP given'))
      )
      .addSubcommand( subcommand =>
        subcommand
          .setName('setxp')
          .setDescription('Set the xp of a user')
          .addUserOption( opt => opt.setName('target').setDescription('Selected User').setRequired(true))
          .addIntegerOption( opt => opt.setName('amount').setDescription('New Amount').setRequired(true))
      )
      .addSubcommand( subcommand =>
        subcommand
          .setName('levelboard')
          .setDescription('Display the leveling board for the server.')
          .addIntegerOption( option => option.setName('page').setDescription('Selected page to view.'))
      )
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

    // Execute based on subcommand
    const sub = interaction.options.getSubcommand();
    if (sub === "get") await this.getRep(interaction);
    else if (sub === "giverep") await this.giveRep(interaction);
    else if (sub === 'repboard') await this.repBoard(interaction, args);
    else if (sub === 'setrep') await this.setRep(interaction);

    return;
  }
}