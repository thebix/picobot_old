import TelegramBot from 'node-telegram-bot-api'
import botToken from './token.js'
import MessangerBase from './messanger'

//dev
import { l } from './loggers'

const isProduction = process.env.NODE_ENV === 'production'

class Telegram extends MessangerBase {
    //token - если не передан, берется из token.js
    constructor({token = null}){ 
        super({token})
        const t = token ? token : isProduction ? botToken.prod : botToken.dev
        this.bot = new TelegramBot(t, { polling: true })
        this.sendMessage = this.sendMessage.bind(this)
    }
    sendMessage({text, img, chatId}){
        //super.sendMessage(text)
        //l("Telegram sendMessage = " + text)
    }
    sendBroadcast({text, img}) {

    }
}

export default Telegram