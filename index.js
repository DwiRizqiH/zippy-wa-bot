const {
    WAConnection,
    MessageType,
    Presence,
    Mimetype,
    GroupSettingChange
} = require('@adiwajshing/baileys')
const fs = require('fs-extra')
const moment = require('moment-timezone')

prefix = '!'
blocked = []

//require('./index.js')
//nocache('./index.js', module => console.log(`'${module}' Updated!`))
async function starts() {
	const client = new WAConnection()
	client.logger.level = 'warn'
	client.on('qr', () => {
		console.log(color('[','white'), color('!','red'), color(']','white'), color(' Scan the qr code above'))
		console.log('Scan the qr code')
	})

	fs.existsSync('./clientSession.json') && client.loadAuthInfo('./clientSession.json')
	client.on('connecting', () => {
		console.log('Connecting...')
	})
	client.on('open', () => {
		console.log('Connected')
	})
	await client.connect({timeoutMs: 30*1000})
        fs.writeFileSync('./clientSession.json', JSON.stringify(client.base64EncodedAuthInfo(), null, '\t'))

	client.on('CB:Blocklist', json => {
            if (blocked.length > 2) return
	    for (let i of json[1].blocklist) {
	    	blocked.push(i.replace('c.us','s.whatsapp.net'))
	    }
	})

	client.on('chat-update', async (message) => {
       	if (!message.hasNewMessage) return
        message = message.messages.all()[0]
		if (!message.message) return
		if (message.key && message.key.remoteJid == 'status@broadcast') return
		if (!message.key.fromMe) return
        global.prefix
		global.blocked

        //const content = JSON.stringify(message.message)
		const from = message.key.remoteJid
		const type = Object.keys(message.message)[0]
		const { text, document /*extendedText, contact, location, liveLocation, image, video, sticker, audio, product*/ } = MessageType
		const time = moment.tz('Asia/Jakarta').format('DD/MM HH:mm:ss')
		body = (type === 'conversation' && message.message.conversation.startsWith(prefix)) ? message.message.conversation : (type == 'imageMessage') && message.message.imageMessage.caption.startsWith(prefix) ? message.message.imageMessage.caption : (type == 'videoMessage') && message.message.videoMessage.caption.startsWith(prefix) ? message.message.videoMessage.caption : (type == 'extendedTextMessage') && message.message.extendedTextMessage.text.startsWith(prefix) ? message.message.extendedTextMessage.text : ''
		budy = (type === 'conversation') ? message.message.conversation : (type === 'extendedTextMessage') ? message.message.extendedTextMessage.text : ''
		const command = body.toLowerCase().split(' ')[0] || ''
		const args = body.trim().split(/ +/).slice(1)
		const isCmd = body.startsWith(prefix)
		if(!isCmd) return

       // const botNumber = client.user.jid
		//const ownerNumber = [`6281232015277@s.whatsapp.net`] // replace this with your number
		const isGroup = from.endsWith('@g.us')
		const sender = isGroup ? message.participant : message.key.remoteJid
		const groupMetadata = isGroup ? await client.groupMetadata(from) : ''
		const groupName = isGroup ? groupMetadata.subject : ''
		//const groupId = isGroup ? groupMetadata.jid : ''
		//const groupMembers = isGroup ? groupMetadata.participants : ''
		//const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : ''
		//const isBotGroupAdmins = groupAdmins.includes(botNumber) || false
		//const isGroupAdmins = groupAdmins.includes(sender) || false
		//const isOwner = ownerNumber.includes(sender)
        //if(!isOwner) return

		const isUrl = (url) => {
			return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
		}
		const reply = (teks) => {
			client.sendMessage(from, teks, text, {quoted:message})
		}
		/*const sendMess = (hehe, teks) => {
			client.sendMessage(hehe, teks, text)
		}
		const mentions = (teks, memberr, id) => {
			(id == null || id == undefined || id == false) ? client.sendMessage(from, teks.trim(), extendedText, {contextInfo: {"mentionedJid": memberr}}) : client.sendMessage(from, teks.trim(), extendedText, {quoted: message, contextInfo: {"mentionedJid": memberr}})
		}*/

        //const isMedia = (type === 'imageMessage' || type === 'videoMessage')
		//const isQuotedImage = type === 'extendedTextMessage' && content.includes('imageMessage')
		//const isQuotedVideo = type === 'extendedTextMessage' && content.includes('videoMessage')
		//const isQuotedSticker = type === 'extendedTextMessage' && content.includes('stickerMessage')
        if (!isGroup && isCmd) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', time, command, 'from', sender.split('@')[0], 'args :', args.length)
		if (isCmd && isGroup) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', time, command, 'from', sender.split('@')[0], 'in', groupName, 'args :', args.length)
		//Command
			switch(command) {
				case prefix+'zippy':
					if (args.length < 1) return reply('Mohon isi parameter url\n\nContoh : _'+prefix+'zippy https://www17.zippyshare.com/v/ZLbrdeY6/file.html_')
					if (!args[0].includes('zippyshare.com')) return reply('Url Bukan zippy!')
					console.log(args[0])

					const _$ = require('cheerio')
					const _url = require('url')
					const _axios = require('axios')
					const _math = require('mathjs')
		
					const GetLink = async (u) => {
						console.log('⏳  ' + `Get Page From : ${u}`)
						const zippy = await _axios({ method: 'GET', url: u }).then(res => res.data).catch(err => false)
						console.log('✅  ' + 'Done')
						const $ = _$.load(zippy)
						if (!$('#dlbutton').length) {
							return { error: true, message: $('#lrbox>div').first().text().trim() }
						}
						console.log('⏳  ' + 'Fetch Link Download...')
						const filename0 = $('title').text()
						const filename = filename0.replace('Zippyshare.com - ', '')
						const url = _url.parse($('.flagen').attr('href'), true)
						const urlori = _url.parse(u)
						const key = url.query['key']
						let time;
						let dlurl;
						try {
							time = /var b = ([0-9]+);$/gm.exec($('#dlbutton').next().html())[1]
							dlurl = urlori.protocol + '//' + urlori.hostname + '/d/' + key + '/' + (2 + 2 * 2 + parseInt(time)) + '3/DOWNLOAD'
						} catch (error) {
							time = _math.evaluate(/ \+ \((.*)\) \+ /gm.exec($('#dlbutton').next().html())[1])
							dlurl = urlori.protocol + '//' + urlori.hostname + '/d/' + key + '/' + (time) + '/DOWNLOAD'
						}
						console.log('✅  ' + 'Done')
						return { error: false, url: dlurl, name: filename }
					}

					if(body.slice(7).includes(',')) {
						const link_zippy = body.slice(7).trim().split(',')
						for (let i = 0; i < link_zippy.length; i++) {
							const getLink_zippy1 = await GetLink(link_zippy[i])
							if(getLink_zippy1.error) return reply(`ERROR! File ${link_zippy[i]}\n\nErr : ${getLink_zippy.message}`)
							console.log(`File ${i+1}`)
							try {
								console.log('Download & Uploading to Whatsapp...')
								await client.sendMessage(from, { url: getLink_zippy1.url }, document, { mimetype: Mimetype.mp4, filename: getLink_zippy1.name })
							} catch (err) {
								client.sendMessage(from, `Gagal mengirim file ${link_zippy[i]}\nMungkin size file melebihi limit Whatsapp`)
								console.log(err)
							}
						}
						client.sendMessage(from, 'Bot by *@dwirizqi.h*', text)
						console.log('Succes!')
					} else {
						const getLink_zippy = await GetLink(args[0])
						if(getLink_zippy.error) return reply(`ERROR!\n\nErr : ${getLink_zippy.message}`)
						try {
							console.log('Download & Uploading to Whatsapp...')
							await client.sendMessage(from, { url: getLink_zippy.url }, document, { mimetype: Mimetype.mp4, filename: getLink_zippy.name })
						} catch (err) {
							client.sendMessage(from, `Gagal mengirim file\nMungkin size file melebihi limit Whatsapp`)
							console.log(err)
						}
						client.sendMessage(from, 'Bot by *@dwirizqi.h*', text)
						console.log('Succes!')
					}
				break
				default:
					console.log('Wrong Command')
        	}
    	})
	}
starts()