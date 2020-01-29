let musicModel = require('../../model/model')
module.exports = {
    name: 'skip',
    async run(message, args) {
        musicModel.queue.shift();
        if (message.author.voiceChannel != musicModel.voiceChannel) {
            message.channel.send({
                embed: {
                    title: 'You have to be in the same channel with the me to use the command'
                }
            })
        }
        if (!musicModel.queue[0]) {
            message.channel.send({
                embed: {
                    title: 'No songs in the queue'
                }
            })
        }
        musicModel.connection.dispatcher.end();
    }
}