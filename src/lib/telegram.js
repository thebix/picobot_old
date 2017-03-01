import TelegramBot from 'node-telegram-bot-api'
import botToken from './token.js'
import MessangerBase from './messanger'
import { botCommand } from './actions'
import { botCommandTypes } from './enums.js'
import _options from './options'
import { 
    fileTypes
} from './enums.js'

//dev
import { l } from './loggers'

const isProduction = process.env.NODE_ENV === 'production'

class Telegram extends MessangerBase {
    //token - если не передан, берется из token.js
    constructor({dispatch, token = null}){ 
        super({token})
        const t = token ? token : isProduction ? botToken.prod : botToken.dev
        this.bot = new TelegramBot(t, { polling: true })
        this.sendMessage = this.sendMessage.bind(this)
        if(dispatch) {
            //this.onMessage = onMessage.bind(this)
            // парсинг команды боту
            const regxParams = new RegExp(`^\/${_options.botCmd} ([a-zA-Z0-9а-яА-Я]+)\s*(.+)*$`) //TODO: исправить регексп
            const regex = new RegExp(`^\/${_options.botCmd}$`)
            this.bot.onText(regex, (msg, match) => {
                dispatch(botCommand(msg.from.id, msg.chat.id, botCommandTypes.HELP, ''))
            })
            this.bot.onText(regxParams, (msg, match) => {
                if (match.length <= 1)
                    return
                const cmd = match[1]
                let params
                if(match.length > 2) 
                    params = match[2] //TODO: пока что берется второй параметр и все, надо доделать
                dispatch(botCommand(msg.from.id, msg.chat.id, cmd, params))
            })
        }
        else 
            l("Не задан обработчик dispatch")
    }

    // file {type = null, path = null, name = null}
    sendMessage(chatIds = [], {text, file}) {
        //super.sendMessage(text)
        l("Telegram sendMessage = " + text)
        if(!chatIds || chatIds.length === 0) {
            return true //TODO: возвращать правильный ответ, если промис сразу разрешен
        }
        const prms = []
        const args = []
        let fileType = null
        if(file && file.path && file.name) {
            fileType = file.type || fileTypes.file
            args.push(`${file.path}/${file.name}`)
            args.push({caption: `${text || ''}`})
        }
        chatIds.forEach((cId) => {
            prms.push(
                !fileType
                    ? this.bot.sendMessage(cId, text)
                    : fileType === fileTypes.image
                        ? this.bot.sendPhoto(cId, ...args)
                        : bot.sendDocument(cId, ...args)
            )
        })
        return Promise.all(prms) //.then((data) => { OnImageSent(image, data) }).catch((err) => { OnImageSentErr(image, err) })
    }
    // sendBroadcast({text, img}) {
    // }

}

export default Telegram