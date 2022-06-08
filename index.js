// Require the necessary discord.js classes
const axios = require('axios');
const request = require('request');
const { Client, Intents } = require('discord.js');
const { token, kakao } = require('./config.json');
const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, createAudioResource, AudioPlayerStatus, SubscriptionStatus } = require('@discordjs/voice');
const player = createAudioPlayer();

// Create a new client instance
const client = new Client({
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
	intents: ['DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILDS', 'GUILD_VOICE_STATES']
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

client.on('messageCreate', async msg => {
	const msgBody = msg.content;

	if (msg.author.bot) return;
	if (msgBody.length <= 1 || !msgBody.startsWith(',')) return;
	if (msg.member.voice.channel == null) return;
	
	const msgSpeak = msgBody.slice(1);
	try {
		const tts_stream = (await axios.post('https://kakaoi-newtone-openapi.kakao.com/v1/synthesize', `<speak>${msgSpeak}</speak>`, {
			headers: {
				'Content-Type': 'application/xml',
				'Authorization': `KakaoAK ${kakao}`,
			},
			responseType: 'stream'
		})).data

		const connection = joinVoiceChannel({
			channelId: msg.member.voice.channel.id,
			guildId: msg.guild.id,
			adapterCreator: msg.guild.voiceAdapterCreator
		});
		
		let resource = createAudioResource(tts_stream);
		player.play(resource);
		player.on("error", console.error);
		connection.subscribe(player);
	}
	catch(e) {
		console.log(e);
	}
});

// client.on("voiceStateUpdate", (oldState, newState) => {
// 	console.log("check");
// });

// Login to Discord with your client's token
client.login(token);