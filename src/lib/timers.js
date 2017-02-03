import { l, log } from './loggers'
import { /*fileTypes,*/ logLevel, timerType /*, botCommands, chatTypes*/ } from './enums.js'
import _options from './options'

export default class Timer {
    constructor({type, callback}) {
        if (!type || type === timerType.NONE) {
            log(`В конструктор таймера не передан тип. timerType = ${type}`, logLevel.ERROR)
            return
        }
        if (!callback || typeof callback !== 'function') {
            log(`В конструктор таймера не передана колбэк функция.`, logLevel.ERROR)
            return
        }
        l(`Timer coustructor`)
        l(`type`, type)
        l(`callback`, callback)
        this.type = type //тип таймера
        this.timerId = null //выключение таймера по id
        this.callback = callback //функция "триггер таймера"
        // this.onTrigger = this.onTrigger.bind(this) // хз что
        this.start = this.start.bind(this) //функция "старт таймера"
    }
    onCheckDateTime() {
        l(`Timer onCheckDateTime`)
        const dt = new Date()
        l("dt", dt)
        l('this.dateTime', this.dateTime)
        if (!this.dateTime || dt > this.dateTime) {
            l(`Timer onCheckDateTime IF - рано для срабатывания`)
            this.timerId = setTimeout(this.onCheckDateTime, _options.intervalMain)
            return
        }
        l(`Timer onCheckDateTime вызов callback`)
        this.callback()
    }
    // onTrigger() {
    //     l(`Timer onTrigger`)
    // }
    start({interval, dateTime}) {
        l(`Timer start`)
        l(`interval`, interval)
        l(`dateTime`, dateTime)
        if (interval) {
            let callback = this.callback
            this.timerId = setTimeout(this.callback, interval * 1000)
        } else if (dateTime) {
            this.dateTime = dateTime
            this.timerId = setTimeout(this.onCheckDateTime, _options.intervalMain)
        }
    }
    stop() {
        l(`Timer stop`)
        clearInterval(this.timerId)
    }
} 