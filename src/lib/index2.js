
import { createStore } from 'redux'
import botReducer, { stateSkeleton } from './reducers'
import Telegram from './telegram'
import Timer from './timer'

import Cleanup from './cleanup'
import _options from './options.js'
import { getChangedDateTime } from './misc'

import {
    chatActiveToggle,
    chatAdd,
    chatUpdate,
    chatRemove,

    timerStart,
    timerStarted,
    timerStop,
    timerStopped,

    botCommand,
    botCommandDone
} from './actions'

import { /*fileTypes,*/
    logLevel,
    timerTypes,
    messangerTypes /*, botCommands, chatTypes*/
} from './enums.js'

// import fs from 'fs'
// import readChunk from 'read-chunk'
// import imageType from 'image-type'
// import jsonfile from 'jsonfile'

//dev
import { l, log } from './loggers'


const Run = () => {
    const cleanup = new Cleanup(Dispose);

    //subscribe() возвращает функцию для отмены регистрации слушателя
    let unsubscribe = store.subscribe(() =>
        processState()
    )

    //initState()

    // const callbk = () => {
    //     l('callback вызван')
    // }

    //l("callbk", callbk)
    // const timer_err1 = new Timer()
    // const timer_err2 = new Timer(timerTypes.DAILY)
    l("test beg")
    //processState()
    //
    // const timer = new Timer(timerTypes.DAILY, callbk)
    // timer.start({ interval: 10 })
    // // timer.stop()
    // let dt = new Date()
    // dt = getChangedDateTime({ seconds: 34 }, dt)
    //  timer.start({ dateTime: dt })
    //  timer.stop()


    // OLD
    const helloText = `\n\n*******************\n* Бот ${_options.version} запущен\n*******************\nРежим = ${isProduction ? "production" : "dev"}`

    // Выведем в консоль начальное состояние
    //console.log("store.getState()=")
    //l("first state", store.getState())
    //log(helloText, logLevel.INFO, true)

    // Каждый раз при обновлении состояния - выводим его
    // Отметим, что subscribe() возвращает функцию для отмены регистрации слушателя
    // let unsubscribe = store.subscribe((a, b, c) =>
    //     l(`a=${JSON.stringify(a)}, b=${JSON.stringify(b)}, c=${JSON.stringify(c)},`)
    //     // l("b", b)
    //     // l("b", b)
    //     // l(store.getState())
    // )

    // Работа с таймерами
    //store.dispatch(timerStart(timerTypes.MAIN, null, 10))

    // Работа с активными чатами
    // store.dispatch(chatActiveToggle("TELEG 666", false))
    // store.dispatch(chatActiveToggle("TELEG 777", true))
    // store.dispatch(chatActiveToggle("TELEG 888"))
    // store.dispatch(chatActiveToggle("IRC ID", null, messangerTypes.irc))
    // store.dispatch(chatActiveToggle("TELEG 888"))

    // Работа с чатами
    // store.dispatch(chatAdd("TELEG 666", "Тайтл чата TELEG 666", "Директория чата TELEG 666"))
    // store.dispatch(chatAdd("IRC 777", "Тайтл чата IRC 777", "Директория чата IRC 777", messangerTypes.irc))
    // store.dispatch(chatUpdate("TELEG 666", null, "23"))
    // store.dispatch(chatRemove("TELEG 666"))

    // команды боту
    // store.dispatch(botCommand(84677480, 84677480, "go1", "some params1"))
    // store.dispatch(botCommand(123, 84677480, "go2", "some params2"))
    // store.dispatch(botCommand(666, 888, "go3", "some params3"))



    // Прекратим слушать обновление состояния
    // unsubscribe()

    //var telegram = new Telegram({ token: null })
    //telegram.sendMessage("text send message")



    //store.dispatch(timerStart(timerTypes.MAIN, null, 10))
    // setTimeout(() => {
    //     l('Trigger timer stop')
    //     store.dispatch(timerStop(timerTypes.MAIN))
    // }, 12000)
}


const Dispose = () => {
    log("Dispose(). Освобождение ресурсов.", logLevel.INFO)
    if (typeof unsubscribe === 'function')
        unsubscribe()
}

const initState = () => {
    var state = Object.assign({}, stateSkeleton)

    // Таймеры
    if (!state.timers) {
        state.timers = {}
    }
    if (!state.timers.timers) {
        state.timers.timers = {}
    }
    if (!state.timers.states) {
        state.timers.states = {}
    }

    for (let timerType in timerTypes) {
        if (timerType == timerTypes.NONE) continue
        const timer = new Timer(timerType, onTimerTrigger)
        state.timers.timers[timerType] = timer //сам таймер
        state.timers.states[timerType] = { isStarting: false } //его состояние
    }

    return state
}

//Реакция на изменение состояния
const processState = () => {
    const state = store.getState()
    l(state.botCommand)

    // Tаймеры
    if (state.timers && state.timers.timers) {
        for (let timerType in state.timers.timers) {
            const timer = state.timers.timers[timerType]
            const timerState = state.timers.states[timerType]
            if (timerState.isStarting) {
                timer.start({ interval: timerState.interval, date: timerState.dateTime })
                store.dispatch(timerStarted(timerType))
            } else if (timerState.isStopping) {
                timer.stop()
                store.dispatch(timerStopped(timerType))
            }
        }
    }

    // Команды боту
    if (state.botCommand && state.botCommand.cmd) {
        store.dispatch(botCommandDone()) //сначала очищаем команду, т.к. она уже поступила в обработку
        onBotCommand(state.botCommand)
    }
}

// Колбэк таймеров
const onTimerTrigger = (type) => {
    store.dispatch(timerStop(type))
    l(`Триггер таймера ${type}`)
    //store.dispatch(timerStart(type, null, 5)) //INFO: чтобы таймер продолжал работать дальше. Актуально для MAIN
}

// Обработка команды боту
const onBotCommand = (command) => {
    //TODO: обоработка команд бота
}


let store = createStore(botReducer, initState())
let unsubscribe
const isProduction = process.env.NODE_ENV === 'production'
if (_options.run) Run()