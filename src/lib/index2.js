
import { createStore } from 'redux'
import botReducer from './reducers'
import Telegram from './telegram'
import Timer from './timer'

import Cleanup from './cleanup'
import _options from './options.js'
import { getChangedDateTime } from './misc'

import {
    timerStart,
    timerStarted,
    timerStop,
    timerStopped,
    chatToggle
} from './actions'

import { /*fileTypes,*/ logLevel, timerType /*, botCommands, chatTypes*/ } from './enums.js'

// import fs from 'fs'
// import readChunk from 'read-chunk'
// import imageType from 'image-type'
// import jsonfile from 'jsonfile'

//dev
import { l, log } from './loggers'

let store = createStore(botReducer)
let unsubscribe
const isProduction = process.env.NODE_ENV === 'production'


const Run = () => {
    const cleanup = new Cleanup(Dispose);

    //subscribe() возвращает функцию для отмены регистрации слушателя
    let unsubscribe = store.subscribe(() =>
        processState()
    )

    const callbk = () => {
        l('callback вызван')
    }

    //l("callbk", callbk)
    // const timer_err1 = new Timer()
    // const timer_err2 = new Timer(timerType.DAILY)
    l("test beg")
    const timer = new Timer(timerType.DAILY, callbk)
    timer.start({ interval: 10 })
    // timer.stop()
     let dt = new Date()
     dt = getChangedDateTime({ seconds: 34 }, dt)
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

    // Отправим несколько действий
    // store.dispatch(toggleChat("id 1", false))
    // store.dispatch(toggleChat('id 2', true))
    // store.dispatch(toggleChat('id 3'))
    // store.dispatch(toggleChat('id 4'))
    // store.dispatch(toggleChat('id 4'))

    // Прекратим слушать обновление состояния
    unsubscribe()

    //var telegram = new Telegram({ token: null })
    //telegram.sendMessage("text send message")



    store.dispatch(timerStart(timerType.MAIN, null, 1))
}
if (_options.run) Run()

const Dispose = () => {

    log("Dispose(). Освобождение ресурсов.", logLevel.INFO)
    unsubscribe()
    // Object.keys(timerType).forEach(x => {
    //     stopTimer(x)
    // })
}

//Реакция на изменение состояния
const processState = () => {
    const state = store.getState()
    if (state.timers && Object.keys(state.timers) > 0) {
        Object.keys(state.timers).forEach(t => {

        })
    }
}
