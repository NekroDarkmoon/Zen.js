// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import Command from "../structures/Command.js";
import { SlashCommandBuilder } from "@discordjs/builders"
import { Interaction } from "discord.js";

export default class Ping {
  constructor () {
    this.name = 'ping';
    this.description = 'Responds with a latency to the server.';
    this.global = false;
    this.data = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description);
  }

  /**
   * @param {Interaction} interaction
   * @returns {Promise<void>}
   * */
  execute = async (interaction) => {
    await interaction.reply("Pong!");
  }
}