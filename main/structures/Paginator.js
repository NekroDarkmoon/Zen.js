// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { 
  Interaction,
  MessageActionRow,
  MessageButton, 
  MessageEmbed } from "discord.js";

import columnify from "columnify";


// ----------------------------------------------------------------
//                             Paginator
// ----------------------------------------------------------------
export default class Paginator {
  /**
   * @param {Array} data
   * @param {Number} max_pages 
   */
  constructor ( data, max_pages=null ) {
    this.collector = null;
    this.data = data;
    this.max_pages = max_pages ? max_pages : Math.ceil( data.length / 15 );
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
  createCollector (msgInteraction, time=1000*30) {
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

  /**
   * 
   * @param {*} msgInteraction 
   */
  collect ( msgInteraction ) {
    if (!this.collector) throw "No collector found";

    this.collector.on('collect', async btnInteraction => {
      
      // Get page number
      const pageNum = JSON.parse(btnInteraction.component.customId).page;
      // Prepate data for pageNumber
      const data = this._prepareData(pageNum)

      // Create embed
      const e = new MessageEmbed()
        .setTitle('RepBoard')
        .setDescription(data)
        .setColor('DARK_GOLD')

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

  /**
   * 
   * @param {Number} page 
   * @returns 
   */
  _prepareData (page) {
    const maxLines = 15;
    const data = this.data;
    const dataLen = data.length;
    // Splice array for 15 values if exists  
    // TODO: Add check for no content
    const display = data.slice( ((page-1)*maxLines) , (page*maxLines - 1));
    
    // Tabulate data for display
    const tabulated = Paginator.tabulate(display) 
    return tabulated;
  }

  /**
   * 
   * @param {Array<{}>} data 
   * @returns 
   */
  static tabulate (data) {
    // Data builder
  
    // TODO: Fix this 
    const options = {
      columnSplitter: '|',
    }

    const columns = columnify(data, options);
    return `\`\`\`\n${columns}\n\`\`\``;
  } 
}
