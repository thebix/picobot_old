import { timerTypes } from './enums.js'

import { l } from './loggers'

/******************
 *  ТИПЫ ДЕЙСТВИЙ *
 ******************/
//чаты
export const ACT_CHAT_ACTIVE_TOGGLE = "ACT_CHAT_ACTIVE_TOGGLE" //включение/выключение активного для рассылки чата
export const ACT_CHAT_ADD = "ACT_CHAT_ADD" //добавление чата и первоначальная настройка
export const ACT_CHAT_UPDATE = "ACT_CHAT_UPDATE" //изменение настроек чата (папка и тд)
export const ACT_CHAT_REMOVE = "ACT_CHAT_REMOVE" //удаление чата
//файлы
export const ACT_FILE_READ = "FILE_READ"
//таймеры
export const ACT_TIMER_START = "TIMER_START"
export const ACT_TIMER_STARTED = "TIMER_STARTED"
export const ACT_TIMER_STOP = "TIMER_STOP"
export const ACT_TIMER_STOPPED = "TIMER_STOPED"

/***************
 *  ГЕНЕРАТОРЫ *
 ***************/
// чаты
export const chatActiveToggle = (messangerType, id,  status = null) => {
    return {
        type: ACT_CHAT_ACTIVE_TOGGLE,
        id,
        messangerType,
        status
    }
}

export const chatAdd = (messangerType, id, title, dir = null) => {
    return {
        type: ACT_CHAT_ADD,
        id,
        messangerType,
        title,
        dir
    }
}

//если передан null или undefined - настройка не перезаписывается
export const chatUpdate = (messangerType, id, title = null, dir = null, wordPics = null) => {
    return {
        type: ACT_CHAT_UPDATE,
        id,
        messangerType,
        title,
        dir,
        wordPics
    }
}

export const chatRemove = (messangerType, id) => {
    return {
        type: ACT_CHAT_REMOVE,
        id,
        messangerType
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
export const timerStart = (timerType = timerTypes.NONE, date, interval) => {
    return {
        type: ACT_TIMER_START,
        timerType,
        date,
        interval
    }
}

export const timerStarted = (timerType = timerTypes.NONE) => {
    return {
        type: ACT_TIMER_STARTED,
        timerType
    }
}

export const timerStop = (timerType = timerTypes.NONE) => {
    //l('ACTION timerStop')
    return {
        type: ACT_TIMER_STOP,
        timerType
    }
}

export const timerStopped = (timerType = timerTypes.NONE) => {
    //l('Action timerStopped')
    return {
        type: ACT_TIMER_STOPPED,
        timerType
    }
}