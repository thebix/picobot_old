import { l } from './loggers'

//Базовый класс мессенджера/соцсети
export default class MessangerBase {
    constructor({token}){
        l("Base constructor. token = " + token)
        this.sendMessage = this.sendMessage.bind(this)
    }
    sendMessage(text, img, chatId){
        l("Base sendMessage = " + text)
    }
}