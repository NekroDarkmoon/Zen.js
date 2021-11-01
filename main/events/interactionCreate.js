// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { Interaction } from "discord.js";
import Zen from "../Zen.js";


// ----------------------------------------------------------------
//                            Ready Event
// ----------------------------------------------------------------
export default class InteractionCreateEvent {
  constructor () {
    this.name = "interactionCreate";
    /** @type {boolean} */
    this.once = false;
  }

  /**
   * @param {Interaction} interaction 
   * @returns {Promise<void>}
   */
  execute = async ( interaction ) => {
    if (!interaction.isCommand()) return;

    /** @type {Zen} */
    const bot = interaction.client;
    const command = bot.CommandHandler.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction);
    } catch ( err ) {
      bot.logger.error(err);

      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true
      });
    }
  };
}
