import { timerType } from './enums.js'

/******************
 *  ТИПЫ ДЕЙСТВИЙ *
 ******************/
//чаты
export const ACT_CHAT_TOGGLE = "CHAT_TOGGLE"
//файлы
export const ACT_FILE_READ = "FILE_READ"
//таймеры
export const ACT_TIMER_START = "TIMER_START"
export const ACT_TIMER_STARTED = "TIMER_STARTED"
export const ACT_TIMER_STOP = "TIMER_STOP"
export const ACT_TIMER_STOPED = "TIMER_STOPED"

/***************
 *  ГЕНЕРАТОРЫ *
 ***************/
// чаты
export const chatToggle = (id, status = null) => {
    return {
        type: ACT_CHAT_TOGGLE,
        id,
        status
    }
}

// файлы
export const fileRead = (path, name) => {
    return {
        type: ACT_FILE_READ,
        path,
        name
    }
}

// таймеры
//date - время срабатывания по таймеру
//interval - время в минутах для таймара MAIN
export const timerStart = (timerType = timerType.NONE, date, interval) => {
    return {
        type: ACT_TIMER_START,
        timerType,
        date,
        interval
    }
}

export const timerStarted = (timerType = timerType.NONE) => {
    return {
        type: ACT_TIMER_STARTED,
        timerType
    }
}

export const timerStop = (timerType = timerType.NONE) => {
    return {
        type: ACT_TIMER_STOP,
        timerType
    }
}

export const timerStopped = (timerType = timerType.NONE) => {
    return {
        type: ACT_TIMER_STOPED,
        timerType
    }
}