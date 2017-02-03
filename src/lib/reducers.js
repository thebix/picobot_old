import _options from './options.js'
import { cloneArray } from './misc'
import { /*fileTypes,*/ logLevel, timerType /*, botCommands, chatTypes*/ } from './enums.js'
import { l, log } from './loggers'

import {
    ACT_CHAT_TOGGLE,
    ACT_TIMER_START,
    ACT_TIMER_STARTED,
    ACT_TIMER_STOP,
    ACT_TIMER_STOPPED,
} from './actions.js'

const initState = {
    activeChats: ["84677480"],
    chats: {
        "telegram": {
            "84677480": {
                title: "Дев",
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

const activeChats = (state = initState.activeChats, action) => {
    //const newState = Object.assign({}, ...state)
    // console.log(["1", "2"].indexOf("2"))
    // console.log("state")
    // console.log(state)

    const newState = cloneArray(state) //INFO: ну хз хз
    // console.log(newState)
    // console.log("newState")
    // console.log(newState)
    switch (action.type) {
        case ACT_CHAT_TOGGLE:
            const i = newState.indexOf(action.id) //_.findIndex(state, (t) => t.id === action.id);
            if (action.status === true || action.status === false) { //чат устанавливается явно
                if (action.status && i === -1) { //добавляем
                    newState.push(action.id)
                    return newState
                } else if (!action.status && i > -1) { //удаляем
                    newState.splice(i, 1)
                    return newState
                }
            } else { //не устанвливаем явно
                if (i === -1) {
                    newState.push(action.id)
                } else {
                    newState.splice(i, 1)
                }
                return newState
            }
            break
        default:
            break
    }
    return state
}

const chats = (state = initState.chats, action) => {
    return state
}

const timers = (state = initState.timers, action) => {
    if (action.timerType == timerType.NONE) return state
    const newState = Object.assign({}, state)
    switch (action.type) {
        case ACT_TIMER_START:
            if (action.timerType == timerType.MAIN) {
                if (action.interval === undefined || action.interval === null || action.interval === '') log(`Для таймера с типом '${action.timerType}' не передан интервал.`, logLevel.ERROR)
                newState[action.timerType] = {
                    isStarting: true,
                    interval: action.interval
                }
            } else {
                if (action.date) log(`Для таймера с типом '${action.timerType}' не передана дата.`, logLevel.ERROR)
                newState[action.timerType] = {
                    isStarting: true,
                    date: action.date
                }
            }
            return newState
        case ACT_TIMER_STARTED:
            if (!newState[action.timerType]) log(`Таймер с типом '${action.timerType}' не существует, но пришло сообщение о том, что он стартанул.`, logLevel.ERROR)
            newState[action.timerType].isStarting = false
        case ACT_TIMER_STOP:
            newState[action.timerType] = null
        case ACT_TIMER_STOPPED:
            log(`Таймер с типом '${action.timerType}' был остановлен`, logLevel.INFO)
        default:
            break
    }
    return state
}

export default (state = initState, action) => {
    //console.log(state.activeChats)
    return {
        activeChats: activeChats(state.activeChats, action),
        chats: chats(state.chats, action),
        timers: timers(state.timers, action)
    }
}