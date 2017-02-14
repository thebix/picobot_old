import _options from './options.js'
import { cloneArray } from './misc'
import { /*fileTypes,*/ logLevel, timerTypes /*, botCommands, chatTypes*/ } from './enums.js'
import { l, log } from './loggers'
import Timer from './timer'

import {
    ACT_CHAT_ACTIVE_TOGGLE,
    ACT_CHAT_ADD,
    ACT_CHAT_UPDATE,
    ACT_CHAT_REMOVE,

    ACT_TIMER_START,
    ACT_TIMER_STARTED,
    ACT_TIMER_STOP,
    ACT_TIMER_STOPPED,
} from './actions.js'

export const stateSkeleton = {
    chatsActive: {
        "telegram": ["84677480"]
    },
    chats: {
        "telegram": {
            "84677480": {
                title: "Дев",
                "dir": '',
                "wordPics": {
                    "words/привет": []
                }
            }
        }
    },
    messangers: {
        "telegram": {
        }
    },
    timers: {
        timers: {
            "main": {},
            "daily": {},
            "daily_set": {}
        },
        states: {
            "main": {
                isStarting: false,
                interval: 0,
            },
            "daily": {
                isStarting: false,
                date: null
            },
            "daily_set": {
                isStarting: false,
                date: null
            }
        },
    }
}


// Активные чаты (в них происходит рассылка)
const chatsActive = (state = stateSkeleton.chatsActive, action) => {
    const newState = Object.assign({}, state)
    switch (action.type) {
        case ACT_CHAT_ACTIVE_TOGGLE:
            const chatsArr = newState[action.messangerType] || []
            const i = chatsArr.indexOf(action.id)
            if (action.status === true || action.status === false) { //чат устанавливается явно
                if (action.status && i === -1) { //добавляем
                    chatsArr.push(action.id)
                    newState[action.messangerType] = chatsArr
                    return newState
                } else if (!action.status && i > -1) { //удаляем
                    chatsArr.splice(i, 1)
                    newState[action.messangerType] = chatsArr
                    return newState
                }
            } else { //не устанвливаем явно
                if (i === -1) {
                    chatsArr.push(action.id)
                } else {
                    chatsArr.splice(i, 1)
                }
                newState[action.messangerType] = chatsArr
                return  newState
            }
            break
        default:
            break
    }
    return state
}

// Настройки чатов (как активных, в которых рассылка, так и простых, где бот просто отвечает)
const chats = (state = stateSkeleton.chats, action) => {
    const newState = Object.assign({}, state)
    switch(action.type) {
        case ACT_CHAT_ADD: { 
            const messanger = newState[action.messangerType] || {}
            const chat = messanger[action.id] || {}
            chat.id = action.id
            chat.title = action.title
            chat.dir = action.dir
            messanger[action.id] = chat
            newState[action.messangerType] = messanger
            return newState
        }
        case ACT_CHAT_UPDATE: {
            // если агрумент "" - перезапишет, если null - не перезапишет
            const messanger = newState[action.messangerType] || {}
            const chat = messanger[action.id] || {}
            chat.id = action.id
            if(action.title || action.title === "") chat.title = action.title
            if(action.dir || action.dir === "") chat.dir = action.dir
            if(action.wordPics) chat.wordPics = action.wordPics
            messanger[action.id] = chat
            newState[action.messangerType] = messanger
            return newState
        }
        case ACT_CHAT_REMOVE: {
            const messanger = newState[action.messangerType]
            if(!messanger) break
            const chat = messanger[action.id]
            if(!chat) break
            delete messanger[action.id]
            newState[action.messangerType] = messanger
            return newState
        }
    }

    return state
}

const timers = (state = stateSkeleton.timers, action) => {
    if (action.timerType == timerTypes.NONE) return state
    const newState = Object.assign({}, state)
    switch (action.type) {
        case ACT_TIMER_START:
            if (action.timerType == timerTypes.MAIN) {
                if (action.interval === undefined || action.interval === null || action.interval === '') log(`Для таймера с типом '${action.timerType}' не передан интервал.`, logLevel.ERROR)
                newState.states[action.timerType] = {
                    isStarting: true,
                    interval: action.interval,
                    isStopping: false
                }
            } else {
                if (action.date) log(`Для таймера с типом '${action.timerType}' не передана дата.`, logLevel.ERROR)
                newState.states[action.timerType] = {
                    isStarting: true,
                    date: action.date,
                    isStopping: false
                }
            }
            return newState
        case ACT_TIMER_STARTED:
            if (!newState.states[action.timerType]) log(`Таймер с типом '${action.timerType}' не существует, но пришло сообщение о том, что он стартанул.`, logLevel.ERROR)
            newState.states[action.timerType].isStarting = false
            newState.states[action.timerType].isStopped = false
            return newState
        case ACT_TIMER_STOP:
            l(`Reducer timers: '${action.timerType}' ACT_TIMER_STOP`)
            newState.states[action.timerType].isStarting = false
            newState.states[action.timerType].isStopping = true
            return newState
        case ACT_TIMER_STOPPED:
            log(`Таймер с типом '${action.timerType}' был остановлен`, logLevel.INFO)
            newState.states[action.timerType].isStopping = false
            newState.states[action.timerType].isStopped = true
            return newState
        default:
            break
    }
    return state
}

export default (state = stateSkeleton, action) => {
    return {
        chatsActive: chatsActive(state.chatsActive, action),
        chats: chats(state.chats, action),
        timers: timers(state.timers, action)
    }
}