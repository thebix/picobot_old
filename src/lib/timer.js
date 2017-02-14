import { l, log } from './loggers'
import { logLevel, timerTypes } from './enums.js'
import _options from './options'

export default class Timer {
    constructor(type, callback) {
        if (!type || type === timerTypes.NONE) {
            log(`В конструктор таймера не передан тип. timerTypes = ${type}`, logLevel.ERROR)
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
        if (this.isStopped)
            return
        const dt = new Date()
        if (!this.dateTime || dt < this.dateTime) {
            if (this.timerId)
                clearInterval(this.timerId)
            this.timerId = setTimeout(this.onCheckDateTime, _options.intervalMain * 1000 * 60)
            this.isStopped = false
            return
        }
        this.isStopped = true
        this.callback(this.type)
    }
    onTrigger() {
        if (this.isStopped)
            return
        this.isStopped = true
        this.callback(this.type)
    }
    start({interval, dateTime}) {
        if (interval) {
            let callback = this.callback
            this.isStopped = false
            this.timerId = setTimeout(this.onTrigger, interval * 1000)
        } else if (dateTime) {
            this.dateTime = dateTime
            this.isStopped = false
            this.timerId = setTimeout(this.onCheckDateTime, _options.intervalMain * 1000 * 60)
        }
    }
    stop() {
        this.isStopped = true
        if (this.timerId)
            clearInterval(this.timerId)
    }
} 