
import {createStore, compose, applyMiddleware} from 'redux'
import thunkMiddleware from 'redux-thunk'

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

    messangerAdd,

    botCommand,
    botCommandDone,

    messageSend,
    messageSendDone
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
    let unsubscribe = store.subscribe(() =>processState())

    l("test beg")

    // #region Инициализация

    // мессенджеры
    const botTelegram = new Telegram({dispatch: store.dispatch})
    store.dispatch(messangerAdd(messangerTypes.telegram, botTelegram))
    // #endregion Инициализация
    
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

    // отправка сообщений ботами
    store.dispatch(messageSend({telegram: [84677480]}, "Некоторый тестовый текст"))

    // Прекратим слушать обновление состояния
    // unsubscribe()


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
    //l(state.message) 

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
        onBotCommand(state.botCommand)
    }

    // Сообщения через ботов
    // if (state.message && state.message.chatIds && Object.keys(state.message.chatIds).length > 0) {
    //     onMessageSend(state.message, state.messangers)
    // }
}

// Колбэк таймеров
const onTimerTrigger = (type) => {
    store.dispatch(timerStop(type))
    l(`Триггер таймера ${type}`)
    //store.dispatch(timerStart(type, null, 10)) //INFO: чтобы таймер продолжал работать дальше. Актуально для MAIN
}

// Обработка команды боту
const onBotCommand = (command) => {
    l("onBotCommand", command)
    store.dispatch(botCommandDone()) //сначала очищаем команду, т.к. она уже поступила в обработку
    //TODO: обоработка команд бота
    //получение дополнительных параметров
    
}

// TODO: отправку сообщения сделать через промисы и миддлвэр в экшнах/редусерах
// Сообщение в ботов
const onMessageSend = (message, messangers) => {
    l("onMessageSend", message)
    //l("messangers", messangers)
    store.dispatch(messageSendDone()) //сначала очищаем команду, т.к. она уже поступила в обработку
    if(!message || !message.chatIds || Object.keys(message.chatIds).length === 0) return
    const prms = []
    Object.keys(message.chatIds).forEach((messangerTitle) => {
        l("messangerTitle", messangerTitle)
        const messanger = messangers[messangerTitle]
        //l("messanger", messanger)
        if(!messanger)
            return
        const chatIds = message.chatIds[messangerTitle]
        prms.push(messanger.sendMessage(chatIds, {text: message.text, file: message.file}))
    })
    if(prms.length === 0)
        return
    Promise.all(prms).then((data) => { l("onMessageSend Promise.all THEN. data = ", data) }).catch((err) => {  l("onMessageSend Promise.all ERROR. err = ", err) })
}

const enhancer = compose(
    applyMiddleware(thunkMiddleware)
);
let store = createStore(botReducer, initState(), enhancer)
let unsubscribe
const isProduction = process.env.NODE_ENV === 'production'
if (_options.run) Run()