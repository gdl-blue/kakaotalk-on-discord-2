const fs = require('fs');
const LosslessJSON = require('lossless-json');
const readline = require('readline');

// 노드카카오 버그 수정
(function() {
	const script  = fs.readFileSync('./node_modules/node-kakao/dist/api/web-client.js') + '';
	const patched = script.replace(`class TextWebRequest {\r\n        constructor(_client) {\r\n            this._client = _client;\r\n        }`, `class TextWebRequest {\r\n        constructor(_client) {\r\n            this._client = _client;\r\n            if(_client.then)\r\n                _client.then(c => this._client = c);\r\n        }`);
	if(script != patched) {
		fs.writeFileSync('./node_modules/node-kakao/dist/api/web-client.js', patched);
	}
})();

const compname = '디스코드';
process.title = '디스코드-카카오톡';
global.__defineGetter__('commit', () => {
	fs.writeFile('./config.json', JSON.stringify(config), dooly => '둘리');
});
global.__defineGetter__('commits', () => {
	fs.writeFileSync('./config.json', JSON.stringify(config));
});
function input(prompt, hide) {
	const rl = readline.createInterface(process.stdin, process.stdout);
	var pwchar = '';
	rl._writeToOutput = function(s) {
		if (rl.x)
			rl.output.write('*'), pwchar += '*';
		else
			rl.output.write(s);
	};
	
	return new Promise(r => {
		rl.question(prompt, ret => {
			rl.close();
			if(hide) process.stdout.write('\r' + prompt + pwchar.replace(/[*]$/, '') + ' \n'), rl.history = rl.history.slice(1);;
			r(ret);
		});
		
		if(hide) rl.x = 1;
	});
}

function filter(n) {
	return n;
}

const { DefaultConfiguration, util, api, AuthApiClient, TalkClient, ChatBuilder, KnownChatType, ReplyContent } = require('node-kakao');
const print = p => console.log(p);
const cfg = {
	agent: 'android', 
	mccmnc: '999', 
	deviceModel: 'SM-T976N', 
	appVersion: '9.2.1', 
	version: '9.2.1', 
	netType: 0, 
	subDevice: true,
};

const floorof = Math.floor;
const randint = (s, e) => floorof(Math.random() * (e + 1 - s) + s);

const https = require('https');
const path = require('path');
const DJS11 = require('djs11');
const CONST11 = require('djs11/src/util/Constants.js');
CONST11.DefaultOptions.ws.properties.$browser = `Discord Android`;
const md5 = require('md5');

const bridge = new DJS11.Client;
const { Collection, RichEmbed, MessageFlags } = DJS11;
const read = new Collection;
const chats = new Collection;
const messages = new Collection;
const webhooks = {};
const webhook = id => (webhooks[id + ''] || { guildID: null, send: (async () => {}) }).webhook;
const client = id => (webhooks[id.toString()] || ({ guildID: null, send: (async () => {}) })).webhook;
const lastID = {};

// 게시판 기능 (node-kakao v3에서 가져옴 저작권은 storycraft에게 라이선스는 MIT - https://github.com/storycraft/node-kakao/blob/stable/LICENSE)
(function() {
	var channel_post_struct_1 = (function() {
		var exports = {};
		exports.ChannelPost = exports.BoardEmotionType = exports.PostPermission = exports.PostType;
		var PostType;
		(function (PostType) {
			PostType["TEXT"] = "TEXT";
			PostType["POLL"] = "POLL";
			PostType["FILE"] = "FILE";
			PostType["IMAGE"] = "IMAGE";
			PostType["VIDEO"] = "VIDEO";
			PostType["SCHEDULE"] = "SCHEDULE";
		})(PostType = exports.PostType || (exports.PostType = {}));
		var PostPermission;
		(function (PostPermission) {
		})(PostPermission = exports.PostPermission || (exports.PostPermission = {}));
		var BoardEmotionType;
		(function (BoardEmotionType) {
			BoardEmotionType["LIKE"] = "LIKE";
		})(BoardEmotionType = exports.BoardEmotionType || (exports.BoardEmotionType = {}));
		var ChannelPost;
		(function (ChannelPost) {
			let ContentType;
			(function (ContentType) {
				ContentType["TEXT"] = "text";
				ContentType["MENTION"] = "user";
				ContentType["EVERYONE_MENTION"] = "user_all";
			})(ContentType = ChannelPost.ContentType || (ChannelPost.ContentType = {}));
			let PollItemType;
			(function (PollItemType) {
				PollItemType["TEXT"] = "text";
			})(PollItemType = ChannelPost.PollItemType || (ChannelPost.PollItemType = {}));
		})(ChannelPost = exports.ChannelPost || (exports.ChannelPost = {}));
		
		return exports;
	})();
	
	const { ChannelPost, PostType } = channel_post_struct_1;
	global.ChannelPost = ChannelPost;
	global.PostType = PostType;
	
	function parse(d) {
		return LosslessJSON.parse(d, (key, value) => {
            if(value && typeof value == 'object' && value.isLosslessNumber != undefined) {
                if(key.toLowerCase().endsWith('id')) return value + '';
				else return Number(value + '');
            }
            return value;
        });
	}
	
	class BaseBoardClient extends api.SessionWebClient {
		fillCommentForm(form, content) {
			let contentList = [];
			if (typeof (content) === 'string') {
				contentList.push({ type: 'text', text: content });
			}
			else {
				if (typeof (content.text) === 'string') {
					contentList.push({ type: 'text', text: content.text });
				}
				else if (content.text && content.text instanceof Array) {
					contentList.push(...content.text);
				}
				if (content.emoticon)
					form.sticon = util.JsonUtil.stringifyLoseless(content.emoticon.toJsonAttachment());
			}
			form.content = util.JsonUtil.stringifyLoseless(contentList);
		}
		fillFileMap(form, type, fileMap) {
			form['original_file_names[]'] = Object.keys(fileMap);
			form[`${type.toLowerCase()}_paths[]`] = Object.values(fileMap);
		}
		fillPostForm(form, template) {
			form.object_type = template.object_type;
			if (template.content) {
				let contentList = [];
				if (typeof (template.content) === 'string')
					contentList.push({ text: template.content, type: channel_post_struct_1.ChannelPost.ContentType.TEXT });
				else if (template.content instanceof Array)
					contentList.push(...template.content);
				form.content = util.JsonUtil.stringifyLoseless(contentList);
			}
			if (template.object_type === channel_post_struct_1.PostType.POLL && template.poll_content)
			 	form.poll_content = util.JsonUtil.stringifyLoseless(template.poll_content);
			if (template.object_type === channel_post_struct_1.PostType.IMAGE)
				this.fillFileMap(form, channel_post_struct_1.PostType.IMAGE, template.images);
			else if (template.object_type === channel_post_struct_1.PostType.VIDEO)
				this.fillFileMap(form, channel_post_struct_1.PostType.VIDEO, template.vidoes);
			else if (template.object_type === channel_post_struct_1.PostType.FILE)
				this.fillFileMap(form, channel_post_struct_1.PostType.FILE, template.files);
			else if (template.object_type === channel_post_struct_1.PostType.SCHEDULE)
				form['schedule_content'] = util.JsonUtil.stringifyLoseless(template.schedule_content);
			if (template.emoticon)
				form.sticon = util.JsonUtil.stringifyLoseless(template.emoticon.toJsonAttachment());
			if (template.scrap)
				form['scrap'] = util.JsonUtil.stringifyLoseless(template.scrap);
			form['notice'] = template.notice;
		}
	}

	class ChannelBoardClient extends BaseBoardClient {
		get Scheme() {
			return 'https';
		}
		get Host() {
			return 'talkmoim-api.kakao.com';
		}
		async requestPostList(channelId) {
			return parse(await this.request('GET', `chats/${channelId.toString()}/posts`) + '');
		}
		async getPost(postId) {
			return parse(await this.request('GET', `posts/${postId}`) + '');
		}
		async getPostEmotionList(postId) {
			return parse(await this.request('GET', `posts/${postId}/emotions`) + '');
		}
		async getPostCommentList(postId) {
			return parse(await this.request('GET', `posts/${postId}/comments`) + '');
		}
		async reactToPost(postId) {
			return parse(await this.request('POST', `posts/${postId}/emotions`, { emotion: channel_post_struct_1.BoardEmotionType.LIKE }) + '');
		}
		async unreactPost(postId, reactionId) {
			return parse(await this.request('DELETE', `posts/${postId}/emotions/${reactionId}`) + '');
		}
		async commentToPost(postId, content) {
			let form = {};
			this.fillCommentForm(form, content);
			return parse(await this.request('POST', `posts/${postId}/comments`, form) + '');
		}
		async deleteComment(postId, commentId) {
			return parse(await this.request('DELETE', `posts/${postId}/comments/${commentId}`) + '');
		}
		async createPost(channelId, template) {
			let form = {};
			this.fillPostForm(form, template);
			return parse(await this.request('POST', `chats/${channelId.toString()}/posts`, form) + '');
		}
		async updatePost(postId, template) {
			let form = {};
			this.fillPostForm(form, template);
			return parse(await this.request('PUT', `posts/${postId}`, form) + '');
		}
		async deletePost(postId) {
			return parse(await this.request('DELETE', `posts/${postId}`) + '');
		}
		async setPostNotice(postId) {
			return parse(await this.request('POST', `posts/${postId}/set_notice`) + '');
		}
		async unsetPostNotice(postId) {
			return parse(await this.request('POST', `posts/${postId}/unset_notice`) + '');
		}
		async sharePostToChannel(postId) {
			return parse(await this.request('POST', `posts/${postId}/share`) + '');
		}
	}
	
	class OpenChannelBoardClient extends BaseBoardClient {
		get Scheme() {
			return 'https';
		}
		get Host() {
			return 'open.kakao.com';
		}
		async requestPostList(linkId, channelId) {
			return parse(await this.request('GET', this.toOpenApiPath(linkId, `chats/${channelId.toString()}/posts`)) + '');
		}
		async getPost(linkId, postId) {
			return parse(await this.request('GET', this.toOpenApiPath(linkId, `posts/${postId}`)) + '');
		}
		async getPostEmotionList(linkId, postId) {
			return parse(await this.request('GET', this.toOpenApiPath(linkId, `posts/${postId}/emotions`)) + '');
		}
		async getPostCommentList(linkId, postId) {
			return parse(await this.request('GET', this.toOpenApiPath(linkId, `posts/${postId}/comments`)) + '');
		}
		async reactToPost(linkId, postId) {
			return parse(await this.request('POST', this.toOpenApiPath(linkId, `posts/${postId}/emotions`), { emotion: channel_post_struct_1.BoardEmotionType.LIKE }) + '');
		}
		async unreactPost(linkId, postId, reactionId) {
			return parse(await this.request('DELETE', this.toOpenApiPath(linkId, `posts/${postId}/emotions/${reactionId}`)) + '');
		}
		async commentToPost(linkId, postId, content) {
			let form = {};
			this.fillCommentForm(form, content);
			return parse(await this.request('POST', this.toOpenApiPath(linkId, `posts/${postId}/comments`), form) + '');
		}
		async deleteComment(linkId, postId, commentId) {
			return parse(await this.request('DELETE', this.toOpenApiPath(linkId, `posts/${postId}/comments/${commentId}`)) + '');
		}
		async createPost(linkId, channelId, template) {
			let form = {};
			this.fillPostForm(form, template);
			return parse(await this.request('POST', this.toOpenApiPath(linkId, `chats/${channelId.toString()}/posts`), form) + '');
		}
		async updatePost(linkId, postId, template) {
			let form = {};
			this.fillPostForm(form, template);
			return parse(await this.request('PUT', this.toOpenApiPath(linkId, `posts/${postId}`), form) + '');
		}
		async deletePost(linkId, postId) {
			return parse(await this.request('DELETE', this.toOpenApiPath(linkId, `posts/${postId}`)) + '');
		}
		async setPostNotice(linkId, postId) {
			return parse(await this.request('POST', this.toOpenApiPath(linkId, `posts/${postId}/set_notice`)) + '');
		}
		async unsetPostNotice(linkId, postId) {
			return parse(await this.request('POST', this.toOpenApiPath(linkId, `posts/${postId}/unset_notice`)) + '');
		}
		async sharePostToChannel(linkId, postId) {
			return parse(await this.request('POST', this.toOpenApiPath(linkId, `posts/${postId}/share`)) + '');
		}
		toOpenApiPath(linkId, path) {
			return `moim/${path}?link_id=${linkId.toString()}`;
		}
	}
	
	global.ChannelBoardClient = ChannelBoardClient;
})();

const kakao = new TalkClient(cfg);
var ws = null, sc = null, iv;
var board = null;

try {
	global.config = require('./config.json');
	if(!config.deviceName || !config.deviceUUID) throw 1;
	run();
} catch(e) {
	global.config = {};
	setup();
}

var currentChannelName = '';
var guild = null;

async function run() {
	if(!config.email || !config.password) {
		const email = await (input('전자우편 주소: '));
		const password = await (input('비밀번호: ', 1));
		config.email = email;
		config.password = Buffer.from(password).toString('base64');
		commits;
	}
	
	if(!config.webhook) config.webhook = {}, commits;
	
	const email = config.email;
	const password = Buffer.from(config.password, 'base64').toString();
	const devname = config.deviceName;
	const uuid = config.deviceUUID;
	
	(async function login() {
		// 로그인
		const authapi = await AuthApiClient.create(devname, uuid, cfg);
		var loginRes = await authapi.login({
			email, password, forced: true,
		});
		
		// 기기인증
		if(!loginRes.success) {
			if(loginRes.status == 12 || loginRes.status == 30) {
				print('아이디 또는 비밀번호가 틀립니다');
				config.email = null;
				commits;
				process.exit(1);
			}
			if(loginRes.status != -100) process.exit(print(`로그인에 실패했습니다 (${loginRes.status})`));

			const form = {
				email,
				password,
				forced: true,
			};

			const api = await AuthApiClient.create(devname, uuid, cfg);
			const lr = await api.login(form);
			if(lr.success)
				return login();

			const passcodeRes = await api.requestPasscode(form);
			if(!passcodeRes.success) return process.exit(print('기기인증 요청에 실패했습니다'));

			const rl = readline.createInterface(process.stdin, process.stdout);
			const passcode = await new Promise((resolve) => rl.question('보안인증번호: ', resolve));
			rl.close();

			const registerRes = await api.registerDevice(form, passcode, true);
			if (!registerRes.success) return process.exit(print('기기등록에 실패했습니다'));
			
			return login();
		}
		
		// 계속 로그인
		var res = await kakao.login(loginRes.result);
		if(!res.success) process.exit(print(`로그인에 실패했습니다 (${e})`));
		
		ws = api.createSessionWebClient(loginRes.result, Object.assign({ ...DefaultConfiguration }, cfg), 'https', 'katalk.kakao.com');
		sc = new api.ServiceApiClient(ws);
		iv = setInterval(async function() {
			if(sc.config) {
				clearInterval(iv);
				go();
			}
		}, 100);
		board = new ChannelBoardClient(await api.createWebClient('https', 'talkmoim-api.kakao.com'), loginRes.result, Object.assign({ ...DefaultConfiguration }, cfg));
		
		async function go() {
			const moreSettings = await sc.requestMoreSettings();
			const lessSettings = await sc.requestLessSettings();
			if(!moreSettings.success || !lessSettings.success)
				process.exit(print('내부 오류가 발생했습니다'));
			kakao.settings = Object.assign(lessSettings.result, lessSettings.result);
			print('카카오톡 서버에 로그인 되었습니다');
			if(!config.token) config.token = await (input('디스코드 봇 토큰: ')), commits;
			try {
				await bridge.login(config.token);
			} catch(e) {
				process.exit(print('디스코드 로그인에 실패했습니다'));
			}
			
			if(!config.guild) {
				var i = 0;
				bridge.guilds.forEach(g => print('[' + ++i + '] ' + g.name));
				while(!guild) {
					var num = Number(await (input('사용할 디스코드 서버(만드려면 0): ')));
					guild = bridge.guilds.array()[num - 1];
					if(!guild && num) print(' *** 번호가 올바르지 않습니다 *** ');
					else if(!num) try {
						guild = await (bridge.user.createGuild(await (input('서버 이름: ')) || '카카오톡 서버'));
						var ch = guild.channels.find(ch => ch.type == 'text');
						await (ch.edit({ name: '실험실' }));
						var iv = await (ch.createInvite({
							maxAge: 0,
							maxUses: 1,
						}));
						var rl = await (guild.createRole({
							name: '초록빛둘리',
							color: 51400,
							permissions: 8,
						}));
						bridge.once('guildMemberAdd', async member => {
							await (guild.me.addRole(rl));
							guild.setOwner(member);
						});
						print(' - 서버 초대 코드: ' + iv.code + ', 서버에 들어오면 소유권을 줍니다 - ');
					} catch(e) {
						print(' *** 서버를 만드는 도중 문제가 발생했읍니다! 다시 시도하거나 이미 있는 써버를 고르세요 ***');
					}
				}
				print(guild.name + ' 서버가 선택되었읍니다');
				config.guild = guild.id;
				commits;
			} else {
				guild = bridge.guilds.get(config.guild);
			}
			
			async function setupWebhook(channel) {
				if(!channel && config.webhook) {
					for(var whi in config.webhook) {
						var whdata = config.webhook[whi];
						webhooks[whi] = whdata;
						webhooks[whi].webhook = await (bridge.fetchWebhook(whdata.id, whdata.token));
						if(!webhooks[whi].webhook.token) webhooks[whi].webhook.token = whdata.token;
						webhooks[whi].webhook.chid = whi;
					}
					return;
				}
				
				if(!webhooks[channel.channelId]) {
					if(!config.webhook[channel.channelId]) {
						var ch = await (guild.createChannel(channel.getDisplayName()));
						var wh = await (ch.createWebhook('message-poster'));
						
						  config.webhook[channel.channelId]
						= webhooks[channel.channelId]
						= {
							token: wh.token,
							id: wh.id,
							channel: ch.id,
						};
						
						commit;
					}
					
					var whdata = config.webhook[channel.channelId + ''];
					webhooks[channel.channelId] = whdata;
					webhooks[channel.channelId].webhook = await (bridge.fetchWebhook(whdata.id, whdata.token));
					if(!webhooks[channel.channelId].webhook.token)
						webhooks[channel.channelId].webhook.token = whdata.token;
				}
			}
			
			// 메시지 보내기 및 게시판 조작
			bridge.on('message', async msg => {
				await (setupWebhook());
				
				if(msg.author.bot || msg.webhookID) return;
				if(msg.guild.id != config.guild) return;
				if(msg.content && msg.content.startsWith('&')) return;
				if(!msg.content) msg.content = '';
				
				for(var whi in webhooks) {
					var wh = webhooks[whi].webhook;
					if(wh.channelID != msg.channel.id) continue;
					const kchid   = wh.chid;
					const kch     = kakao.channelList.get(kchid);
					const kchname = kch.getDisplayName();
					const _users  = kch.getAllUserInfo();
					const users   = {};
					while(1) {
						const item = _users.next();
						if(item.done) break;
						users[item.value.userId + ''] = item.value;
					}
					
					// 게시글 목록
					if(msg.content.toLowerCase().startsWith('!board')) {
						if(['OD', 'OM'].includes(kch._channel.info.type))
							return msg.channel.send(err('오픈채팅은 게시판 기능을 지원하지 않습니다'));
						
						const res = await board.requestPostList(kchid);
						if(res.status) return msg.channel.send(err('게시판을 불러오지 못했습니다'));
						global.posts[`${msg.channel.id}-${msg.author.id}`] = [];
						const { posts } = res;
						const embed = new DJS11.RichEmbed()
							.setColor('#5c4b43')
							.setTitle(`**${strip(kchname, 240)}**`);
						var n = 1;
						for(var post of posts) {
							global.posts[`${msg.channel.id}-${msg.author.id}`].push(post);
							var content = '게시글';
							if(post.content)
								for(var item of JSON.parse(post.content))
									if(item.type == 'text')
										content = item.text;
							if(post.poll)
								content = post.poll.subject;
							if(post.object_type == 'POLL')
								content = `투표: ${content}`;
							if(post.notice)
								content = `[공지] ${content}`;
							embed.addField(`${n++}. ${strip(content, 240)}`, `${(users[post.owner_id + ''] || { nickname: '작성자 불분명' }).nickname}${post.comment_count ? (' • 댓글 ' + post.comment_count) : ''}${post.emotion_count ? (' • 좋아요 ' + post.emotion_count) : ''} • ${parseDate(post.created_at)}`);
						}
						msg.channel.send(embed);
						return;
					}
					
					// 게시글 보기
					if(msg.content.toLowerCase().startsWith('!viewpost ')) {
						if(['OD', 'OM'].includes(kch._channel.info.type))
							return msg.channel.send(err('오픈채팅은 게시판 기능을 지원하지 않습니다'));
						
						const idx = msg.content.split(/\s+/)[1];
						if(!idx) return msg.channel.send(err('!board로 게시글 목록을 불러오고 번호를 지정해 주세요'));
						var rawpost;
						try {
							rawpost = global.posts[`${msg.channel.id}-${msg.author.id}`][idx - 1];
						} catch(e) {}
						if(!rawpost) return msg.channel.send(err('!board로 게시글 목록을 불러오고 올바른 번호를 지정해 주세요'));
						const post = await board.getPost(rawpost.id);
						if(post.status) return msg.channel.send(err('게시글을 불러오지 못했습니다'));
						const embed = new DJS11.RichEmbed().setColor('#5c4b43');
						var title = '게시글';
						if(post.poll)
							title = `투표: ${post.poll.subject}`;
						if(post.notice && !post.poll)
							title = '공지';
						embed.setTitle(`**${strip(title, 230)}**${post.read_count ? (' • ' + post.read_count + '명 읽음') : ''}`);
						var content = '';
						if(post.content)
							for(var item of JSON.parse(post.content))
								if(item.type == 'text')
									content = item.text;
						embed.setDescription(strip(content, 4090));
						if(post.poll)
							for(var item of post.poll.items)
								embed.addField(strip(item.title, 250), `${progress(item.user_count / post.poll.user_count * 100)} (${item.user_count}명)`);
						if(post.poll && post.emotions.length)
							embed.addBlankField();
						if(post.emotions.length) {
							var likers = '';
							for(var item of post.emotions)
								likers += `- ${users[item.owner_id].nickname} (${parseDate(item.created_at)})\n`;
							embed.addField(`좋아요한 친구들 (${post.emotion_count})`, likers);
						}
						msg.channel.send(embed).then(() => {
							if(!post.comments.length) return;
							const embed = new DJS11.RichEmbed()
								.setColor('#5c4b43')
								.setTitle(`**댓글 ${post.comments.length}개**`);
							var n = 1;
							for(var item of post.comments) {
								var content = '';
								for(var itm of JSON.parse(item.content))
									if(itm.type == 'text')
										content = itm.text;
								embed.addField(users[item.owner_id + ''].nickname || '작성자 불분명', strip(content, 1019) || '.');
								if(n == 24 && post.comments.length >= 25) {
									embed.addField('*', '(댓글이 더 있습니다.)');
									break;
								}
								n++;
							}
							msg.channel.send(embed);
						});
						return;
					}
					
					// 댓글 달기
					if(msg.content.toLowerCase().startsWith('!comment ')) {
						if(['OD', 'OM'].includes(kch._channel.info.type))
							return msg.channel.send(err('오픈채팅은 게시판 기능을 지원하지 않습니다'));
						
						const args = msg.content.split(/\s+/);
						const idx = args[1];
						if(!idx) return msg.channel.send(err('!board로 게시글 목록을 불러오고 번호를 지정해 주세요'));
						var rawpost;
						try {
							rawpost = global.posts[`${msg.channel.id}-${msg.author.id}`][idx - 1];
						} catch(e) {}
						if(!rawpost) return msg.channel.send(err('!board로 게시글 목록을 불러오고 올바른 번호를 지정해 주세요'));
						const post = await board.getPost(rawpost.id);
						board.commentToPost(post.id, args.slice(2, 99999999999).join(' ')).then(res => {
							if(res.status)
								return msg.channel.send(err(res.error_message || '카카오톡 내부 오류'));
							
							var title = '게시글';
							if(post.content)
								for(var item of JSON.parse(post.content))
									if(item.type == 'text')
										title = strip(item.text.replace(/(\r|\n)/g, ' '), 32);
							if(post.poll)
								title = post.poll.subject;
							
							msg.reply2(`${title}에 댓글을 달았습니다`);
						});
						
						return;
					}
					
					// 좋아요
					if(msg.content.toLowerCase().startsWith('!like ')) {
						if(['OD', 'OM'].includes(kch._channel.info.type))
							return msg.channel.send(err('오픈채팅은 게시판 기능을 지원하지 않습니다'));
						
						const args = msg.content.split(/\s+/);
						const idx = args[1];
						if(!idx) return msg.channel.send(err('!board로 게시글 목록을 불러오고 번호를 지정해 주세요'));
						var rawpost;
						try {
							rawpost = global.posts[`${msg.channel.id}-${msg.author.id}`][idx - 1];
						} catch(e) {}
						if(!rawpost) return msg.channel.send(err('!board로 게시글 목록을 불러오고 올바른 번호를 지정해 주세요'));
						const post = await board.getPost(rawpost.id);
						if(post.my_emotion) return msg.channel.send(err('이미 좋아요 표시헀습니다'));
						board.reactToPost(post.id).then(res => {
							if(res.status)
								return msg.channel.send(err(res.error_message || '카카오톡 내부 오류'));
							
							var title = '게시글';
							if(post.content)
								for(var item of JSON.parse(post.content))
									if(item.type == 'text')
										title = strip(item.text.replace(/(\r|\n)/g, ' '), 32);
							if(post.poll)
								title = post.poll.subject;
							
							msg.reply2(`${title}에 좋아요 표시했습니다`);
						});
						
						return;
					}
					
					// 좋아요 취소
					if(msg.content.toLowerCase().startsWith('!unlike ')) {
						if(['OD', 'OM'].includes(kch._channel.info.type))
							return msg.channel.send(err('오픈채팅은 게시판 기능을 지원하지 않습니다'));
						
						const args = msg.content.split(/\s+/);
						const idx = args[1];
						if(!idx) return msg.channel.send(err('!board로 게시글 목록을 불러오고 번호를 지정해 주세요'));
						var rawpost;
						try {
							rawpost = global.posts[`${msg.channel.id}-${msg.author.id}`][idx - 1];
						} catch(e) {}
						if(!rawpost) return msg.channel.send(err('!board로 게시글 목록을 불러오고 올바른 번호를 지정해 주세요'));
						const post = await board.getPost(rawpost.id);
						if(!post.my_emotion) return msg.channel.send(err('좋아요 표시하지 않았습니다'));
						board.unreactPost(post.id).then(res => {
							if(res.status)
								return msg.channel.send(err(res.error_message || '카카오톡 내부 오류'));
							
							var title = '게시글';
							if(post.content)
								for(var item of JSON.parse(post.content))
									if(item.type == 'text')
										title = strip(item.text.replace(/(\r|\n)/g, ' '), 32);
							if(post.poll)
								title = post.poll.subject;
							
							msg.reply2(`${title} 좋아요 취소했습니다`);
						});
						
						return;
					}
					
					// 공지 등록하기
					if(msg.content.toLowerCase().startsWith('!setnotice ')) {
						if(['OD', 'OM'].includes(kch._channel.info.type))
							return msg.channel.send(err('오픈채팅은 게시판 기능을 지원하지 않습니다'));
						
						const args = msg.content.split(/\s+/);
						const idx = args[1];
						if(!idx) return msg.channel.send(err('!board로 게시글 목록을 불러오고 번호를 지정해 주세요'));
						var rawpost;
						try {
							rawpost = global.posts[`${msg.channel.id}-${msg.author.id}`][idx - 1];
						} catch(e) {}
						if(!rawpost) return msg.channel.send(err('!board로 게시글 목록을 불러오고 올바른 번호를 지정해 주세요'));
						const post = await board.getPost(rawpost.id);
						if(post.notice) return msg.channel.send(err('이미 공지글입니다'));
						board.setPostNotice(post.id).then(res => {
							if(res.status)
								return msg.channel.send(err(res.error_message || '카카오톡 내부 오류'));
							
							var title = '게시글';
							if(post.content)
								for(var item of JSON.parse(post.content))
									if(item.type == 'text')
										title = strip(item.text.replace(/(\r|\n)/g, ' '), 32);
							if(post.poll)
								title = post.poll.subject;
							
							msg.reply2(`${title}을(를) 공지로 등록했습니다`);
						});
						
						return;
					}
					
					// 공지 내리기
					if(msg.content.toLowerCase().startsWith('!denotice ')) {
						if(['OD', 'OM'].includes(kch._channel.info.type))
							return msg.channel.send(err('오픈채팅은 게시판 기능을 지원하지 않습니다'));
						
						const args = msg.content.split(/\s+/);
						const idx = args[1];
						if(!idx) return msg.channel.send(err('!board로 게시글 목록을 불러오고 번호를 지정해 주세요'));
						var rawpost;
						try {
							rawpost = global.posts[`${msg.channel.id}-${msg.author.id}`][idx - 1];
						} catch(e) {}
						if(!rawpost) return msg.channel.send(err('!board로 게시글 목록을 불러오고 올바른 번호를 지정해 주세요'));
						const post = await board.getPost(rawpost.id);
						if(!post.notice) return msg.channel.send(err('공지글이 아닙니다'));
						board.unsetPostNotice(post.id).then(res => {
							if(res.status)
								return msg.channel.send(err(res.error_message || '카카오톡 내부 오류'));
							
							var title = '게시글';
							if(post.content)
								for(var item of JSON.parse(post.content))
									if(item.type == 'text')
										title = strip(item.text.replace(/(\r|\n)/g, ' '), 32);
							if(post.poll)
								title = post.poll.subject;
							
							msg.reply2(`${title} 공지를 내렸습니다`);
						});
						
						return;
					}
					
					// 게시글을 채팅방에 공유하기
					if(msg.content.toLowerCase().startsWith('!share ')) {
						if(['OD', 'OM'].includes(kch._channel.info.type))
							return msg.channel.send(err('오픈채팅은 게시판 기능을 지원하지 않습니다'));
						
						const args = msg.content.split(/\s+/);
						const idx = args[1];
						if(!idx) return msg.channel.send(err('!board로 게시글 목록을 불러오고 번호를 지정해 주세요'));
						var rawpost;
						try {
							rawpost = global.posts[`${msg.channel.id}-${msg.author.id}`][idx - 1];
						} catch(e) {}
						if(!rawpost) return msg.channel.send(err('!board로 게시글 목록을 불러오고 올바른 번호를 지정해 주세요'));
						const post = await board.getPost(rawpost.id);
						board.sharePostToChannel(post.id).then(res => {
							if(res.status)
								return msg.channel.send(err(res.error_message || '카카오톡 내부 오류'));
							
							var title = '게시글';
							if(post.content)
								for(var item of JSON.parse(post.content))
									if(item.type == 'text')
										title = strip(item.text.replace(/(\r|\n)/g, ' '), 32);
							if(post.poll)
								title = post.poll.subject;
							
							msg.reply2(`${title} 공유 완료`);
						});
						
						return;
					}
					
					// 글쓰기
					if(msg.content.toLowerCase().startsWith('!post')) {
						if(['OD', 'OM'].includes(kch._channel.info.type))
							return msg.channel.send(err('오픈채팅은 게시판 기능을 지원하지 않습니다'));
						
						const pattern = msg.content
							.replace(/\r\n/g, '\n')
							.replace(/\r/g, '\n')
							.match(/^[!]post\s*(noticepoll|noticetext|notice|poll|text|)(\s+|\n)((.|\n)*)$/i);
						if(!pattern) return msg.channel.send(err('명령어를 형식에 맞게 호출해주세요'));
						const _type = pattern[1].toUpperCase();
						const notice = _type.startsWith('NOTICE');
						const type = _type.replace('NOTICE', '') || 'TEXT';
						const content = pattern[3] || '(내용 없음)';
						
						const template = {
							object_type: type,
							notice,
							content,
						};
						
						if(type == 'POLL') {
							template.content = '';
							var items = content.split('\n');
							var subject = items[0];
							items.splice(0, 1);
							var flags = subject.match(/^(([+]|[-]|[*])*)/)[0];
							subject = subject.replace(flags, '');
							
							template.poll_content = {
								subject,
								secret: flags.includes('-'),
								items: [],
								item_type: 'text',
								item_addable: flags.includes('+'),
								multi_select: flags.includes('*'),
							};
							
							for(var item of items) {
								template.poll_content.items.push({
									title: item,
								});
							}
							
							if(template.poll_content.items.length < 2)
								return msg.channel.send(err('투표 항목 수가 너무 적습니다'));
						}
						
						board.createPost(kchid, template).then(res => {
							if(res.status)
								return msg.channel.send(err(res.error_message || '카카오톡 내부 오류'));
						});
						
						return;
					}
					
					var cnt = msg.content;
					if(cnt && cnt.startsWith('*')) cnt = cnt.replace('*', '');
					
					var cntnt = r => (((r || '') + cnt) || '*');
					var ref = null;
					var reply = '';
					
					function handle(res) {
						if(!res.success) return msg.reply2(`메시지가 정상적으로 전송되지 않았습니다 다시 시도해 주십시오 (${res.status})`);
						if(msg.content && msg.content.startsWith('*'))
							read.set(res.result.logId + '', { msg, nouser: 0, chat: res.result });
					}
					
					if(msg.reference) {
						if(msg.attachments.size) {
							msg.reply2('[경고!] 답장 메시지에 첨부파일을 추가할 수 없습니다');
							if(!msg.content) return;
						}
						try {
							ref = await msg.fetchReference();
						} catch(e) {
							ref = { content: '', id: '0', author: { username: '' } };
						}
						var fc = ref.content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, ' '), _fc = fc;
						if(fc.length > 30) fc = `${fc.slice(0, 30)}...`;
						reply = (ref ? (`[${ref.author.username}의 메시지: ${fc}]\n ↳️ `) : '');
						if(chats.has(ref.id))
							kakao.channelList.get(wh.chid).sendChat(new ChatBuilder()
								.append(new ReplyContent(chats.get(ref.id)))
								.text(cntnt())
								.build(KnownChatType.REPLY));
						else
							kakao.channelList.get(wh.chid).sendChat(cntnt(reply)).then(handle);
					} else {
						if(msg.attachments.size > 1)
							msg.reply2('[경고!] 첫 번째 첨부파일만 전송됩니다');
						if(!msg.attachments.size)
							return kakao.channelList.get(wh.chid).sendChat(cntnt()).then(handle);
						const att = msg.attachments.first();
						if(!att.width)
							return msg.reply2('[오류!] 사진만 보낼 수 있습니다');
						
						https.get(att.url, res => {
							var d = '';
							res.setEncoding('base64');
							res.on('data', chunk => d += chunk);
							res.on('end', () => {
								kakao.channelList.get(wh.chid).sendMedia(KnownChatType.PHOTO, {
									name: att.filename,
									data: Buffer.from(d, 'base64'),
									width: att.width,
									height: att.height,
									ext: path.parse(att.filename).ext.replace('.', ''),
								}).then(res => {
									handle(res);
									if(msg.content && res.success) setTimeout(() => {
										kakao.channelList.get(wh.chid).sendChat(msg.content).then(handle);
									}, 1000);
								});
							});
						});
					}
					break;
				}
			});

			// 수신한 메시지를 디스코드로 보내기
			kakao.on('chat', async (data, channel) => {
				await (setupWebhook(channel));
				lastID[channel.channelId + ''] = data._chat.logId;
				
				// 전송자 정보
				const sender = data.getSenderInfo(channel);
				var pf = sender;
				var nick = pf.nickname || pf.nickName;
				
				// 방장/부방장 접미사
				switch(sender.perm) {
					case 8: nick += ' (봇)';
					break; case 4: nick += ' (부방장)';
					break; case 1: nick += ' (방장)';
				}
				
				// 대화상대 목록
				const _users = channel.getAllUserInfo();
				const users = {};
				while(1) {
					const item = _users.next();
					if(item.done) break;
					users[item.value.userId + ''] = item.value;
				}
				
				if(sender.userId + '' == kakao.clientUser.userId + '' && data._chat.attachment.url) return;
				var msg = data.text || '', shmsg = msg;
				var filecfg = {};
				var emoji = null;
				
				// 일반 첨부파일
				if(data._chat.attachment && data._chat.attachment.url)
					// 8MB 이상은 링크로 올리기
					if(data._chat.attachment.s >= 7999998)
						msg = data._chat.attachment.url;
					else
						msg = '',
						filecfg = { files: [data._chat.attachment.url] };
				
				// 묶음사진
				if(data._chat.attachment && data._chat.attachment.imageUrls) {
					msg = '';
					var n = 1;
					// filecfg = { files: [] };
					for(var img of data._chat.attachment.imageUrls)
						msg += `사진 #${n++}: ${img}\n`;
						// filecfg.files.push(img);
				}
				
				// 이모티콘
				if(data._chat.attachment && (data._chat.type == 25 || data._chat.type == 20 || data._chat.type == 12)) {
					// 움직이는 이모티콘 파싱불가
					const url = api.serviceApiUtil.getEmoticonImageURL(data._chat.attachment.path);
					if(!url || data._chat.attachment.type == 'image/webp' || data._chat.attachment.path.endsWith('.webp')) {
						if(!msg) msg += '(' + (data._chat.attachment.alt || '이모티콘') + ')';
					} else {
						// msg += '\n[' + (data._chat.attachment.alt || '이모티콘') + ' - ' + url + ']';
						// filecfg.files = [url];
						emoji = await bridge.guilds.get(client(channel.channelId).guildID).createEmoji(url, 'kakaoet' + (new Date().getTime()));
						if(!emoji) msg += ' [' + (data._chat.attachment.alt || '이모티콘') + ']';
						else msg = `<:${emoji.name}:${emoji.id}> ${msg}`;
					}
					if(!data.text) shmsg += '(이모티콘)';
				}
				
				// 답장
				if(data._chat.type == 26)
					msg = '```' + (users[data._chat.attachment.src_userId].nickname || users[data._chat.attachment.src_userId].nickName) + '\n ' + data._chat.attachment.src_message.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, ' ') + '``` ' + msg,
					shmsg = `(답장)${shmsg}`;
				
				// 샾검색
				if(data._chat.type == 71) {
					msg = '';
					filecfg.embed = {
						color: 0x5c4b43,
						title: `**# ${data._chat.attachment.C.HD.TD.T}**`,
						fields: [],
					};
					if(data._chat.attachment.C.ITL)
					for(var item of data._chat.attachment.C.ITL) {
						filecfg.embed.fields.push({
							name: item.TD.T,
							value: item.TD.D + '... [[바로가기]](' + encodeURI(item.L.LPC) + ')',
						});
					}
					if(data._chat.attachment.C.THL)
					for(var item of data._chat.attachment.C.THL) {
						filecfg.embed.fields.push({
							name: data._chat.attachment.C.HD.TD.T,
							value: '[[보기]](' + encodeURI(item.L.LPC) + ')',
						});
					}
					if(data._chat.attachment.C.HD.L && data._chat.attachment.C.HD.L.LPC) {
						filecfg.embed.fields.push({
							name: data._chat.attachment.C.HD.TD.T + ' 더보기',
							value: '**[[검색 결과 더보기]](' + encodeURI(data._chat.attachment.C.HD.L.LPC) + ')**',
						});
					}
					else if(data._chat.attachment.P && data._chat.attachment.P.L) {
						filecfg.embed.fields.push({
							name: data._chat.attachment.C.HD.TD.T + ' 더보기',
							value: '**[[검색 결과 더보기]](' + encodeURI(data._chat.attachment.P.L.LPC) + ')**',
						});
					}
				}
				
				// 공지 및 게시글
				if(data._chat.type == 24) {
					if(data._chat.attachment.os && data._chat.attachment.os[0].t == 1 && data._chat.attachment.os[0].ct) {
						msg = '';
						filecfg.embed = {
							color: 0x5c4b43,
							title: '새 글',
							description: data._chat.attachment.os[0].ct,
						};
					}
					
					// 공지글
					if(data._chat.attachment.os && data._chat.attachment.os[0].t == 3 && data._chat.attachment.os[1].t == 1) {
						msg = '';
						filecfg.embed = {
							color: 0x5c4b43,
							title: '[공지] 새 글',
							description: data._chat.attachment.os[1].ct,
						};
					}
					
					// 공지투표
					if(data._chat.attachment.os && data._chat.attachment.os[1] && data._chat.attachment.os[1].its) {
						msg = '';
						filecfg.embed = {
							color: 0x5c4b43,
							title: '[공지] 투표: ' + data._chat.attachment.os[1].tt,
							fields: [],
						};
						for(var item of data._chat.attachment.os[1].its) {
							filecfg.embed.fields.push({
								name: item.tt,
								value: '*',
							});
						}
					}
				}
				
				// 투표
				if(data._chat.type == 14 && data._chat.attachment.os && data._chat.attachment.os[0]) {
					msg = '';
					filecfg.embed = {
						color: 0x5c4b43,
						title: '투표: ' + data._chat.attachment.title,
						fields: [],
					};
					for(var item of data._chat.attachment.os[0].its) {
						filecfg.embed.fields.push({
							name: item.tt,
							value: '*',
						});
					}
				}
				
				// 디스코드로 전송
				client(channel.channelId).send(msg, Object.assign({
					username: filter(nick),
					avatarURL: pf.originalProfileURL || pf.originalProfileImageUrl || ('https://secure.gravatar.com/avatar/' + md5(salt[0] + sender.userId + salt[1]) + '?d=monsterid'),
					// avatarURL: 'https://secure.gravatar.com/avatar/' + md5(salt[0] + sender.userId + salt[1]) + '?d=retro',
				}, filecfg)).then(msg => {
					messages.set(data._chat.logId + '', {
						author: {
							id: sender.userId,
							username: pf.nickname,
						},
						content: shmsg,
						whmsg: msg,
					});
					
					if(msg) chats.set(msg.id, data.chat);
					
					if(emoji) bridge.guilds.get(client(channel.channelId).guildID).deleteEmoji(emoji);
				});
				
				// 읽음 처리 및 동기화
				setTimeout(() => {
					channel.markRead({ logId: channel.info.lastChatLogId });
					setTimeout(() => channel.syncChatList(channel.info.lastChatLogId, channel.info.lastSeenLogId));
				}, randint(1, 5) * 300);
			});

			// 메시지가 읽힐 경우
			kakao.on('chat_read', (chat, channel, _user) => {
				await (setupWebhook(channel));
				
				const _msg = read.get(chat.logId + '');
				const user = channel.getUserInfo(_user);
				if(!_msg) return;
				const { msg, nouser } = _msg;
				if(_user.userId + '' == (chats.get(msg.id) || { sender: {} }).sender.userId + '') return;
				if(nouser) msg.channel.send(channel._channel.info.activeUserCount - (rc[chat.logId + '']--) + '명이 ' + msg.author.username + '의 메시지를 읽었읍니다');
				else msg.channel.send(user.nickname + '이(가) ' + new Date().getHours() + ':' + (String(new Date().getMinutes()).length > 1 ? (new Date().getMinutes()) : ('0' + new Date().getMinutes())) + '분에 ' + msg.author.username + '의 메시지를 읽었읍니다');
			});

			// 메시지가 지워진 경우
			kakao.on('chat_deleted', (feedChat, channel) => {
				await (setupWebhook(channel));
				if(config.force_show_deleted_message) return;
				
				const sender = channel.getUserInfo(feedChat.sender);
				const msg = messages.get(feedChat.text.match(/\"logId\"[:](\d+)/)[1]);
				
				if(msg && (['DirectChat', 'MultiChat'].includes(channel._channel.info.type) || channel._channel.info.activeUserCount == 2)) {
					const flags = new MessageFlags(msg.whmsg.flags.bitfield);
					flags.add(MessageFlags.FLAGS.SUPPRESS_EMBEDS);
					msg.whmsg.edit('[메시지 삭제됨]', {
						token: webhook(msg.whmsg.webhookID).token,
						attachments: [],
						flags,
					});
				} else client(channel.channelId).send(sender.nickname + '이(가) 메시지' + (msg ? (' (' + msg.content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, ' ') + ')') : '') + '를 삭제함', {
					username: system,
					avatarURL: 'https://secure.gravatar.com/avatar/' + md5('') + '?d=retro',
				});
			});

			// 메시지가 가려진 경우 (오픈채팅)
			kakao.on('message_hidden', (hide, channel) => {
				await (setupWebhook(channel));
				if(config.force_show_deleted_message) return;
				
				const sender = channel.getUserInfo(hide.sender);
				const msg = messages.get(hide.text.match(/\"logId\"[:](\d+)/)[1]);
				
				if(msg) {
					const flags = new MessageFlags(msg.whmsg.flags.bitfield);
					flags.add(MessageFlags.FLAGS.SUPPRESS_EMBEDS);
					msg.whmsg.edit('[' + sender.nickname + '에 의해 숨겨진 글입니다.]', {
						token: webhook(msg.whmsg.webhookID).token,
						attachments: [],
						flags,
					});
				}/* else client(channel.channelId).send(sender.nickname + '이(가) ' + (msg ? (msg.author.username + '의 ') : '') + '메시지' + (msg ? (' (' + msg.content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, ' ') + ')') : '') + '를 가렸음', {
					username: system,
					avatarURL: 'https://secure.gravatar.com/avatar/' + md5('') + '?d=retro',
				}); */
			});

			// 대화상대 들어옴
			kakao.on('user_join', (join, channel, user) => {
				await (setupWebhook(channel));
				if(config.no_system_message) return;
				
				client(channel.channelId).send(user.nickname + '이(가) 방에 들어음', {
					username: system,
					avatarURL: 'https://secure.gravatar.com/avatar/' + md5('') + '?d=retro',
				});
			});

			// 대화상대 나감
			kakao.on('user_left', (left, channel, user) => {
				await (setupWebhook(channel));
				if(config.no_system_message) return;
				
				if(left.sender.userId + '' != user.userId + '') client(channel.channelId).send(user.nickname + '이(가) ' + channel.getUserInfo(left.sender).nickname + '에 의해 추방됨', {
					username: system,
					avatarURL: 'https://secure.gravatar.com/avatar/' + md5('') + '?d=retro',
				}); else client(channel.channelId).send(user.nickname + '이(가) 방을 떠남', {
					username: system,
					avatarURL: 'https://secure.gravatar.com/avatar/' + md5('') + '?d=retro',
				});
			});

			// 프로필 변경 (오픈채팅)
			kakao.on('profile_changed', (channel, oldUser, newUser) => {
				await (setupWebhook(channel));
				if(config.no_system_message) return;
				
				// console.log(newUser.nickname + '의 프로필이 변경됨 ' + (oldUser.nickname != newUser.nickname ? ('[닉네임: ' + oldUser.nickname + '에서 ' + newUser.nickname + '로]') : ''));
				client(channel.channelId).send(oldUser.nickname + '의 프로필이 변경됨 ' + (oldUser.nickname != newUser.nickname ? ('[닉네임: **' + oldUser.nickname + '**에서 **' + newUser.nickname + '**로]') : ''), {
					username: system,
					avatarURL: 'https://secure.gravatar.com/avatar/' + md5('') + '?d=retro',
				});
			});

			// 부방장 등록/박탈 (오픈채팅)
			kakao.on('perm_changed', (channel, oldUser, newUser) => {
				await (setupWebhook(channel));
				if(config.no_system_message) return;
				
				var cntnt = '';
				
				if(oldUser.perm == 2 && newUser.perm == 4) cntnt = oldUser.nickname + '이(가) 부방장이 됨';
				if(oldUser.perm == 4 && newUser.perm == 2) cntnt = oldUser.nickname + '이 부방장에서 박탈됨';
				
				if(cntnt) client(channel.channelId).send(cntnt, {
					username: system,
					avatarURL: 'https://secure.gravatar.com/avatar/' + md5('') + '?d=retro',
				});
			});

			// 방장 변경 (오픈채팅)
			kakao.on('host_handover', (channel) => {
				await (setupWebhook(channel));
				if(config.no_system_message) return;
				
				client(channel.channelId).send('방장이 바뀜', {
					username: system,
					avatarURL: 'https://secure.gravatar.com/avatar/' + md5('') + '?d=retro',
				});
			});
		}
	})();
}

async function setup() {
	config.deviceName = '디스코드';
	
	function randomUUID() {
		var ret = '';
		for(var i=0; i<86; i++)
			ret += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+	/'[Math.floor(Math.random() * 64)];
		return ret + '==';
	}
	
	config.deviceUUID = randomUUID();
	commits;
	run();
}


