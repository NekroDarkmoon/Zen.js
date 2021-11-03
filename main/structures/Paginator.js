// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { Interaction, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";


// ----------------------------------------------------------------
//                             Paginator
// ----------------------------------------------------------------
export default class Paginator {
  /**
   * @param {*} data
   * @param {Number} max_pages 
   */
  constructor ( data, max_pages ) {
    this.collector = null;
    this.data = data;
    this.max_page = max_pages;
  }

  /**
   * 
   * @param {*} page 
   * @returns {MessageActionRow} actionRow
   */
  getPaginationComponents ( page ) {
    // TODO: Add << >> and select menu
    return new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId(JSON.stringify({ name: "page", page: page - 1 }))
          .setLabel("◀")
          .setStyle('PRIMARY')
          .setDisabled( page < 2)
      )
      .addComponents(
        new MessageButton()
          .setCustomId(JSON.stringify({ name: "page", page: page }))
          .setLabel("⟳")
          .setStyle('SECONDARY')
      )
      .addComponents(
        new MessageButton()
          .setCustomId(JSON.stringify({ name: "page", page: page + 1 }))
          .setLabel("▶")
          .setStyle('PRIMARY')
          .setDisabled( page >= this.max_pages)
      ) 
  }


  /**
   * 
   * @param {Interaction} msgInteraction
   * @param {number} time
   */
  createCollector (msgInteraction, time=1000*15) {
    // Data builder
    /** @type {Interaction.channel} */
    const channel = msgInteraction.channel;
    const filter = (btnInteraction) => {
      return msgInteraction.user.id === btnInteraction.user.id;
    }

    // Create collector
    this.collector = channel.createMessageComponentCollector({
      filter,
      time: time
    });
  }


  collect ( msgInteraction ) {
    if (!this.collector) throw "No collector found";

    this.collector.on('collect', async btnInteraction => {
      
      // Get page number
      const pageNum = JSON.parse(btnInteraction.component.customId).page;
      console.log(pageNum)

      // Prepate data for pageNumber
      const data = `Data ${pageNum}`;

      // Create embed
      const e = new MessageEmbed()
        .setTitle('RepBoard')
        .setDescription(data)
        .setColor('#0099ff')

      // Update components
      const components = this.getPaginationComponents(pageNum);
      
      await btnInteraction.update({
        components: [components],
        embeds: [e]
      });      
    });


    this.collector.on('end', async collection => {
      await msgInteraction.editReply({
        components: []
      });
    });

  }




}


// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------

// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------