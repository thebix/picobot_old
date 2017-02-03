import { l, log } from './loggers'
import { /*fileTypes,*/ logLevel, timerType /*, botCommands, chatTypes*/ } from './enums.js'
import _options from './options'

export default class Timer {
    constructor(type, callback) {
        if (!type || type === timerType.NONE) {
            log(`В конструктор таймера не передан тип. timerType = ${type}`, logLevel.ERROR)
            return
        }
        if (!callback || typeof callback !== 'function') {
            log(`В конструктор таймера не передана колбэк функция.`, logLevel.ERROR)
            return
        }
        this.type = type //тип таймера
        this.timerId = null //выключение таймера по id
        this.callback = callback //функция "триггер таймера"
        this.onTrigger = this.onTrigger.bind(this) // функция "триггер по интервалу"
        this.onCheckDateTime = this.onCheckDateTime.bind(this) //функция "триггер по дате"
        this.start = this.start.bind(this) //функция "старт таймера"
        this.isStopped = true //Состояние таймера - выключен 
    }
    onCheckDateTime() {
        if(this.isStopped)
            return
        // l(`Timer onCheckDateTime`)
        const dt = new Date()
        // l("dt", dt)
        // l('this.dateTime', this.dateTime)
        if (!this.dateTime || dt < this.dateTime) {
            // l(`Timer onCheckDateTime IF - рано для срабатывания`)
            //clearInterval(this.timerId)
            this.timerId = setTimeout(this.onCheckDateTime, _options.intervalMain * 1000 * 60)
            this.isStopped = false
            return
        }
        this.isStopped = true
        // l(`Timer onCheckDateTime вызов callback`)
        this.callback()
    }
    onTrigger() {
        if(this.isStopped)
            return
        l(`Timer onTrigger`)
        this.isStopped = true
        this.callback()
    }
    start({interval, dateTime}) {
        // l(`Timer start`)
        // l(`interval`, interval)
        // l(`dateTime`, dateTime)
        if (interval) {
            let callback = this.callback
            this.isStopped = false
            this.timerId = setTimeout(this.onTrigger, interval * 1000)
        } else if (dateTime) {
            this.dateTime = dateTime
            this.isStopped = false
            this.timerId = setTimeout(this.onCheckDateTime, _options.intervalMain * 1000 * 60)
            //console.log(this.timerId)
        }
    }
    stop() {
        //l(`Timer stop`)
        this.isStopped = true
        //l(`this.timerId`, this.timerId)
        if(this.timerId)
            clearInterval(this.timerId)
    }
} 