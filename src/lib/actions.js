import { 
    timerTypes,
    botCommandTypes,
    messangerTypes
} from './enums.js'
import { l } from './loggers'
import _options from './options'

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
//управление ботом
export const ACT_BOT_CMD = "ACT_BOT_CMD" //команда или обращение к боту
export const ACT_BOT_CMD_DONE = "ACT_BOT_CMD_DONE" //команда или обращение к боту обработаны

 
/***************
 *  ГЕНЕРАТОРЫ *
 ***************/
// чаты
export const chatActiveToggle = (id, status = null, messangerType = messangerTypes.telegram) => {
    return {
        type: ACT_CHAT_ACTIVE_TOGGLE,
        id,
        messangerType,
        status
    }
}

export const chatAdd = (id, title, dir = null, messangerType = messangerTypes.telegram) => {
    return {
        type: ACT_CHAT_ADD,
        id,
        messangerType,
        title,
        dir
    }
}

//если передан null или undefined - настройка не перезаписывается
export const chatUpdate = (id, title = null, dir = null, wordPics = null, messangerType = messangerTypes.telegram) => {
    return {
        type: ACT_CHAT_UPDATE,
        id,
        messangerType,
        title,
        dir,
        wordPics
    }
}

export const chatRemove = (id, messangerType = messangerTypes.telegram) => {
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


// команды бота
// fromId - идентификатор того, кто прислал команду
// chatId - идентификатор чата, в котором пришла команда
// cmd - команда
// params - параметры команды
// messangerType - мессенджер в котором поступила команда
export const botCommand = (fromId, chatId, cmd, params, messangerType = messangerTypes.telegram) => {
    const superUserIds = _options.superUserIds[messangerType]
    const superChatIds = _options.superChatIds[messangerType]
    //сообщение от админа бота?
    const isSuperUser = superUserIds && superUserIds.length > 0
        ? superUserIds.indexOf(fromId) != -1 : false
    //сообщение в админский приват чат?
    const isSuperChat = superChatIds && superChatIds.length > 0
        ? superChatIds.indexOf(fromId) != -1 : false
    
    return {
        type: ACT_BOT_CMD,
        fromId,
        chatId,
        cmd,
        params,
        messangerType,
        isSuperUser,
        isSuperChat
    }
}

export const botCommandDone = () => {
    return {
        type: ACT_BOT_CMD_DONE
    }
}