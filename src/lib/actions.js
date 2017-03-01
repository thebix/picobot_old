import {
    timerTypes,
    botCommandTypes,
    messangerTypes,
    errorMessageSendTypes
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

// управление мессенджерами
export const ACT_MESSANGER_ADD = "ACT_MESSANGER_ADD" // добавление мессенджера
// export const ACT_MESSANGER_ADD_DONE = "ACT_MESSANGER_ADD_DONE" // добавление мессенджера прошло

//управление ботом
export const ACT_BOT_CMD = "ACT_BOT_CMD" //команда или обращение к боту
export const ACT_BOT_CMD_DONE = "ACT_BOT_CMD_DONE" //команда или обращение к боту обработаны
//отправка сообщения
export const ACT_MESSAGE_SEND = "ACT_MESSAGE_SEND" //depr? отправить сообщение
export const ACT_MESSAGE_SEND_DONE = "ACT_MESSAGE_SEND_DONE" //depr? Команда отправить сообщение обработана
export const ACT_MESSAGE_SEND_REQUEST = "ACT_MESSAGE_SEND_REQUEST" // запрос к мессенжерам на отправку сообщения
export const ACT_MESSAGE_SEND_RESPONSE = "ACT_MESSAGE_SEND_RESPONSE" // ответ мессенжеров на отправку сообщения
export const ACT_MESSAGE_SEND_ERROR = "ACT_MESSAGE_SEND_ERROR" // при попытке отправки сообщения возникла ошибка

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

// добавление мессанджера
// messangerType - тип мессанджера
// messanger - сам мессанджер
export const messangerAdd = (messangerType, messanger) => {
    return {
        type: ACT_MESSANGER_ADD,
        messangerType,
        messanger
    }
}

// export const messangerAddDone = (messangerType) => {
//     return {
//         type: ACT_MESSANGER_ADD_DONE,
//         messangerType
//     }
// }



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

// команда обработана
export const botCommandDone = () => {
    return {
        type: ACT_BOT_CMD_DONE
    }
}

// TODO: отправку сообщения сделать через промисы и миддлвэр в экшнах/редусерах
// отправка сообщения
// chatIds - объект с массивами чатов, которым послать
// text, image, file
// inResponseId - ответ на конкретное сообщение пользователя
// excludeChatIds - чаты исключения. Пока не используется.
// export const messageSend = (chatIds, text = null, file = null, inResponseId = null, excludeChatIds = []) => {
//     // l("messageSend action. chatIds", chatIds)
//     // l("messageSend action. text", text)
//     return {
//         type: ACT_MESSAGE_SEND,
//         chatIds,
//         text,
//         file,
//         inResponseId,
//         excludeChatIds
//     }
// }

export const messageSendRequest = (chatIds, text = null, file = null, inResponseId = null, excludeChatIds = []) => {
    return {
        type: ACT_MESSAGE_SEND_REQUEST,
        chatIds,
        text,
        file,
        inResponseId,
        excludeChatIds
    }
}

export const messageSendResponse = (data) => {
    return {
        type: ACT_MESSAGE_SEND_RESPONSE,
        data //INFO: возможно парсить на составляющие перед возвращением экшна
    }
}

export const messageSendError = (errType, text, error) => {
    return {
        type: ACT_MESSAGE_SEND_ERROR,
        errType,
        text,
        error
    }
}

export const messageSend = (chatIds, messangers, text = null, file = null, inResponseId = null, excludeChatIds = []) => {
    return dispatch => {
        if (!chatIds || Object.keys(chatIds).length === 0) {
            dispatch(messageSendError(errorMessageSendTypes.noChats))
            return true //TODO: правильно разрешать промис
        }
        if (!messangers || Object.keys(messangers).length === 0) {
            dispatch(messageSendError(errorMessageSendTypes.noMessangers))
            return true //TODO: правильно разрешать промис
        }
        if (!text && !file) {
            dispatch(messageSendError(errorMessageSendTypes.noData))
            return true //TODO: правильно разрешать промис
        }

        dispatch(messageSendRequest(chatIds, text, file, inResponseId, excludeChatIds))

        const prms = []
        Object.keys(chatIds).forEach((messangerTitle) => {
            l("messangerTitle", messangerTitle)
            const messanger = messangers[messangerTitle]
            if (!messanger)
                return
            const chatIds = message.chatIds[messangerTitle]
            prms.push(messanger.sendMessage(chatIds, { text: message.text, file: message.file }))
        })
        if (prms.length === 0)
            return
        return Promise.all(prms)
            .then((data) => {
                l("onMessageSend Promise.all THEN. data = ", data)
                dispatch(messageSendResponse(data))
            })
            .catch((err) => {
                dispatch(messageSendError(errorMessageSendTypes.sendError, '', err))
            })
    }
}


// команда обработана
export const messageSendDone = () => {
    return {
        type: ACT_MESSAGE_SEND_DONE
    }
}