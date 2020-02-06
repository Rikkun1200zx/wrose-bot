const ytdl = require("ytdl-core");
const musicModel = require("../../model/model.js");
const dude = require("yt-dude");
const youtubeDL = require("youtube-dl");
const getVideoId = require("get-video-id");

module.exports = {
  name: "play",
  async run(message, args) {
    if (ytdl.validateURL(args[0])) {
      addQueue(args[0]);
    }
    if (!ytdl.validateURL(args[0])) {
      let query = await dude.search(args);
      let videoUrl = "https://www.youtube.com/watch?v=" + query[0].videoId;
      addQueue(videoUrl);
    }

    async function addQueue(url) {
      let songInfo = await ytdl.getInfo(url);
      let song = {
        title: songInfo.title,
        url: songInfo.video_url,
        thumbnail: getThumbnail(url),
        duration: secondsCoverter(songInfo.length_seconds)
      }

      if (musicModel.isPlaying == false) {
        musicModel.queue.push(song);
        play();
      }
      if (musicModel.isPlaying == true) {
        musicModel.queue.push(song);
        musicModel.sendQueueMessage(message.channel);
      }
    }
    async function play() {
      if (!musicModel.voiceChannel) {
        musicModel.voiceChannel = message.member.voiceChannel;
      }
      musicModel.connection = await musicModel.voiceChannel.join();
      musicModel.dispatcher = musicModel.connection
        .playStream(
          ytdl(musicModel.queue[0].url, {
            filter: "audioonly",
            quality: "highestaudio",
            highWaterMark: 1 << 25
          })
        )
        .on("start", () => {
          console.log(musicModel.queue);
          musicModel.isPlaying = true;
          musicModel.sendPlayMessage(message.channel);
          musicModel.queue.shift();
        })
        .on("end", () => {
          if (musicModel.queue[0]) {
            console.log("next song url " + musicModel.queue[0]);
            play();
          }
          if (!musicModel.queue[0]) {
            musicModel.voiceChannel.leave();
            musicModel.isPlaying = false;
            message.channel.send({
              embed: {
                color: 15158332,
                title: "Leaving voiceChannel",
                description: "No songs left in the queue"
              }
            });
          }
        })
        .on("error", error => {
          console.log(error);
        });
    }

    function getThumbnail(url) {
      let ids = getVideoId(url);
      return `http://img.youtube.com/vi/${ids.id}/hqdefault.jpg`;
    }

    function secondsCoverter(second) {
      second = Number(second);
      var m = Math.floor(second % 3600 / 60);
      var s = Math.floor(second % 3600 % 60);

      return m + ':' + s;
    }
  }
};