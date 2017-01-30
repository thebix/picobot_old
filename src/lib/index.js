//https://github.com/babel/example-node-server

import TelegramBot from 'node-telegram-bot-api'

import Cleanup from './cleanup'
import _options from './options.js'
import { fileTypes, logLevel, timerType, botCommands, chatTypes } from './enums.js'

import fs from 'fs'
import readChunk from 'read-chunk'
import imageType from 'image-type'
import jsonfile from 'jsonfile'

import botToken from './token.js'


const isProduction = process.env.NODE_ENV === 'production'
const token = isProduction ? botToken.prod : botToken.dev
const bot = new TelegramBot(token, { polling: true })


var _state = {
    chats: {},
    intervalMain: null
}

const Run = () => {
    const cleanup = new Cleanup(Dispose);
    const helloText = `\n\n*******************\n* Бот ${_options.version} запущен\n*******************\nРежим = ${isProduction ? "production" : "dev"}`
    log(helloText, logLevel.INFO, true)

    if (_options.autostart) {
        startTimer(timerType.MAIN)
    }

    const regxParams = new RegExp(`^\/${_options.botCmd} ([a-zA-Z0-9а-яА-Я]+)\s*(.+)*$`)
    const regex = new RegExp(`^\/${_options.botCmd}$`)
    bot.onText(regex, (msg, match) => {
        proceedCommand(msg, match)
    })
    bot.onText(regxParams, (msg, match) => {
        proceedCommand(msg, match)
    })

    //INFO: по активности в чате понимаем, что туда надо слать
    //пока хз как еще получить список чатов, в которых бот
    // bot.on('message', (msg) => { 
    //     console.log(`TEST ======= ${_test}`)
    //     console.log(JSON.stringify(msg))
    //     _state.chats[msg.chat.id] = true
    //     console.log(`state.chats=${JSON.stringify(_state.chats)}` )
    // });

    //проверяем наличие папок
    //новые не создаем, т.к. если папка существует, но принадлежит другому юзеру, она может быть перезатерта скриптом
    isPathExists(`${_options.path}`, false, true)
    isPathExists(`${_options.path}${_options.dirPriority}`, false, true)
    isPathExists(`${_options.path}${_options.dirInbox}`, false, true)
    isPathExists(`${_options.pathStorage}`, true)

    //чтение прошлого состояния и смешивание его с дефолтным 
    const stateFromFile = readState();
    log(`Состояние из файла: ${JSON.stringify(stateFromFile)}`, logLevel.INFO)
    setState(stateFromFile)
}

const mainInterval = () => {
    //проверка даты, если новая - выбрать когда показать следующую картинку
    const dt = new Date()
    const state = getState()
    // l(`state.dailyPicShowDateTime= __${state.dailyPicShowDateTime}__`)
    // l(`dt= __${dt}__`)
    // l(`state.dailyPicShowDateTime && dt > state.dailyPicShowDateTime= __${state.dailyPicShowDateTime && dt > state.dailyPicShowDateTime}__`)
    if (!!state.dailyPicShowDateTime && dt > state.dailyPicShowDateTime) {
        // l('IF 1')
        Post(null)
        stopTimer(timerType.DAILY)
    }
    // l(`state.dailySetDateTime= __${state.dailySetDateTime}__`)
    // l(`!state.dailySetDateTime || dt > state.dailySetDateTime= __${!state.dailySetDateTime || dt > state.dailySetDateTime}__`)
    
    if (!state.dailySetDateTime || dt > state.dailySetDateTime) {
        // l('IF 2')
        //установиь время установки времени следующего отображения картинки
        startTimer(timerType.DAILY_SET)
        //запустить таймер отображения картинки
        startTimer(timerType.DAILY)
    }
}

const Post = (chatId) => {
    const state = getState()
    if (!chatId && (!state.chats || Object.keys(state.chats).length == 0))
        log("no subscribers :(", logLevel.INFO, true)

    //получить картинку
    let image = GetImage(_options.dirPriority)
    if (!image) {
        image = GetImage(_options.dirInbox)
    }

    //отправить сообщение
    if (image) {
        sendBroadcast(null, image, false, false, true)
    } else if (_options.devId) {
        log("no pics :(", logLevel.ERROR, true)
        sendBroadcast(null, null, false, false, true) //отпрвить по настроенным папкам для конкретных чатов
    }
}

//chatId - если передан, фильтруются которые покзывались уже
const GetImage = (photosDir, chatId = null) => {
    let result = null
    const photosPath = `${_options.path}${photosDir}`

    const items = getDirListing(photosPath)
    const state = getState()
    const files = items
        .filter((item) => {
            const pathFile = `${photosPath}/${item}`
            let showed = []
            if (chatId) {
                const chat = state.chats[chatId]
                if (chat && chat.wordPics)
                    showed = chat.wordPics[`${photosDir}`]
                if (!showed)
                    showed = []
            }
            return showed.indexOf(item) == -1
                && fs.lstatSync(pathFile).isFile()
        }) //fs.isFile http://stackoverflow.com/questions/15630770/node-js-check-if-path-is-file-or-directory
        .sort((a, b) => { return 0.5 - Math.random() })

    if (!files || files.length == 0)
        return null

    for (let i = 0; i < files.length; i++) {
        const path = `${photosPath}/${files[i]}`;
        const buffer = readChunk.sync(path, 0, 12);
        const fileType = imageType(buffer);
        if (!fileType
            || (fileType.mime != 'image/jpeg'
                && fileType.mime != 'image/png'
                && fileType.mime != 'image/gif'))
            continue
        //jpg/gif
        switch (fileType.mime) {
            case 'image/jpeg':
            case 'image/png':
                result = {
                    type: fileTypes.Jpg,
                    path: photosPath,
                    file: files[i]
                }
                break
            case 'image/gif':
                result = {
                    type: fileTypes.Gif,
                    path: photosPath,
                    file: files[i]
                }
                break
            default:
                continue
        }
        if (result)
            break

    }
    return result
}

//отправить сообщение
const SendMessage = (chatId, text, image, isSuper = false, writeLog = true) => {
    let prms = null
    if (image) {
        const options = {}
        if (text) options.caption = `${text}${isSuper ? ', Мастер' : ''}`
        switch (image.type) {
            case fileTypes.Gif:
                prms = bot.sendDocument(chatId, `${image.path}/${image.file}`, options)
                break
            case fileTypes.Jpg:
                prms = bot.sendPhoto(chatId, `${image.path}/${image.file}`, options)
                break
            default:
                break
        }
    } else if (text) {
        prms = bot.sendMessage(chatId, text)
    }
    return prms
}

//isCheckChatDir - смотреть для конкретного чата переопределенную директорию
const sendBroadcast = (text, image, isSuper = false, writeLog = false, isCheckChatDir = false) => {
    const state = getState()
    const prms = []
    if(!state.chats) return
    const chatIds = Object.keys(state.chats)
    if (!chatIds || chatIds.length == 0)
        return
    chatIds.forEach((cId) => {
        if (isCheckChatDir && state.chats[cId].dir && state.chats[cId].dir.length > 0) {
            const dir = getRandom(state.chats[cId].dir)
            if (!dir) return
            const img = GetImage(dir)
            if (!img) return
            //TODO: удаление картинок должно проходить только после отработки всех промисов. Иначе, если два чата настроены на одну папку - будет конфликт. Лень щас заморачиваться, но потом надо будет.
            SendMessage(cId, text, img, false)
                .then((data) => { OnImageSent(img, data) }).catch((err) => { OnImageSentErr(img, err) })
        }
        else if (image || text)
            prms.push(SendMessage(cId, text, image, false))
    })
    Promise.all(prms).then((data) => { OnImageSent(image, data) }).catch((err) => { OnImageSentErr(image, err) })
}

const OnImageSent = (image, data) => {
    //переместить картинку в архив
    MoveToArchive(image)
}

const OnImageSentErr = (image, err) => {
    //TODO: chatId
    log(`Ошибка отправки :(. Err = ${JSON.stringify(err)}`, logLevel.ERROR, true)
}

const MoveToArchive = (image) => {
    if (!image || !image.path || !image.file)
        return

    if (isPathExists(`${image.path}/${_options.archiveName}`, false, true))
        fs.rename(`${image.path}/${image.file}`, `${image.path}/${_options.archiveName}/${image.file}`)
}

const Dispose = () => {
    log("Dispose(). Освобождение ресурсов.", logLevel.INFO)
    Object.keys(timerType).forEach(x => {
        stopTimer(x)
    })
}

const startTimer = (type = timerType.MAIN, options = { interval: null, dateTime: null }) => {
    stopTimer(type)
    let interval = 0;
    let intervalId = null
    let date = options.dateTime || new Date()
    switch (type) {
        case timerType.MAIN:
            interval = options.interval || _options.intervalMain
            intervalId = _state.intervalMain = setInterval(mainInterval, interval * 60 * 1000)
            break;
        case timerType.DAILY:
            if (!options.dateTime) {
                interval = options.interval || ((Math.random() * (_options.intervalDaily.max - _options.intervalDaily.min)
                    + _options.intervalDaily.min) | 0)
            }

            date = getChangedDateTime({ minutes: interval }, date)
            saveState({ dailyPicShowDateTime: date })
            break
        case timerType.DAILY_SET:
            if (!options.dateTime) {
                interval = options.interval || _options.intervalDaily.max
            }

            date = getChangedDateTime({ minutes: interval }, date)
            saveState({ dailySetDateTime: date })
            break
    }
    log(`Запуск таймера "${type}". Интервал: ${interval}.${date ? ` Дата срабатывания: ${getDateString(date)}` : ""}`, logLevel.INFO, true)
}

const stopTimer = (type) => {
    let timerId = null
    switch (type) {
        case timerType.MAIN:
            timerId = _state.intervalMain
            _state.intervalMain = null
            break
        case timerType.DAILY:
            saveState({ dailyPicShowDateTime: null })
            break
        case timerType.DAILY_SET:
            saveState({ dailySetDateTime: null })
            break
    }

    if (timerId) {
        log(`Остановка таймера "${type}"`, logLevel.INFO, true)
        clearInterval(timerId)
    }
}

const getDateString = (date = new Date()) => {
    const options = {
        year: '2-digit', month: 'numeric', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: 'numeric',
        hour12: false,
        weekday: "long"
    }
    return `${date.toLocaleDateString()} ${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}:${("0" + date.getSeconds()).slice(-2)}`
}

const getChangedDateTime = (options = { days: null, hours: null, minutes: null, seconds: null }, date = new Date()) => {
    let dt = new Date(date)
    if (options.days != null)
        dt.setDate(dt.getDate() + options.days)
    if (options.hours != null)
        dt.setHours(dt.getHours() + options.hours)
    if (options.minutes != null)
        dt.setMinutes(dt.getMinutes() + options.minutes)
    if (options.seconds != null)
        dt.setSeconds(dt.getSeconds() + options.seconds)

    return dt
}

const log = (text, level = logLevel.DEBUG, devChat = false) => {
    if (!text) return
    if (_options.log == logLevel.DEBUG
        || (_options.log == logLevel.INFO && (level == logLevel.INFO || level == logLevel.ERROR))
        || (_options.log == logLevel.ERROR && level == logLevel.ERROR)) {
        const t = `${getDateString()} | ${level} | ${text}`
        console.log(t)
        if (devChat || _options.duplicateLogToDevChat) {
            SendMessage(_options.devId, t)
        }
    }
}

const l = (text, devChat = true) => {
    log(text, logLevel.DEBUG, devChat)
}

const getState = () => {
    return Object.assign({}, _state)
}

const setState = (obj) => {
    log(`setState(obj = ${JSON.stringify(obj)})\n`, logLevel.DEBUG)
    _state = Object.assign({}, _state, obj)
}

//чтение ранее сохраненного состояния из файла
const readState = () => {
    const state = readJson(`${_options.pathStorage}${_options.stateFile}`) || {}
    //Необходимые преобразования
    if (state.dailyPicShowDateTime)
        state.dailyPicShowDateTime = new Date(state.dailyPicShowDateTime)
    if (state.dailySetDateTime)
        state.dailySetDateTime = new Date(state.dailySetDateTime)
    //l(`readState = ${JSON.stringify(state)}`)
    return state
}

const readJson = (path) => {
    // if (fs.existsSync(path)) {
    //     return jsonfile.readFileSync(path)
    // }
    if (isPathExists(path))
        return jsonfile.readFileSync(path)
    return null
}

const saveState = (obj) => {
    //l(`========================= saveState = ${JSON.stringify(obj)}`)
    const oldState = readState()
    //l(`oldState = ${JSON.stringify(oldState)}`)
    const newState = Object.assign({}, oldState, obj)
    _state = newState
    //l(`newState = ${JSON.stringify(newState)}`)
    // jsonfile.writeFile(_options.stateFile, obj, { spaces: 4 }, (err) => {
    //     log(err, logLevel.ERROR)
    // })
    jsonfile.writeFileSync(`${_options.pathStorage}${_options.stateFile}`, newState, { spaces: 4 })
    //l(`=========================`)
}

const toggleChat = (id, title, state) => {
    const st = getState()
    const chats = st.chats || {}

    if (state === undefined) {
        state = Object.keys(chats).indexOf(id.toString()) > -1
    }

    if (state) {
        if (Object.keys(chats).indexOf(id.toString()) > -1) return
        log(`Добавление чата: ${id} '${title}'`, logLevel.INFO, true)
        chats[id] = { title, wordPics: {} }
    } else {
        log(`Удаление чата: ${id} '${title}'`, logLevel.INFO, true)
        delete chats[id]
    }
    log(`Все чаты: ${JSON.stringify(Object.keys(chats))}`)
    saveState({ chats })
}

const getImageByText = (text, chatId = null) => {
    let img = getWordFileByText(text, _options.dialog.keys, chatId)
    const state = getState()
    const key = getKeyBytext(text, _options.dialog.keys)
    if (!key) return null
    const wordSubdir = `${_options.dirWords}/${key}`
    // const path = `${_options.path}${wordSubdir}/`
    if (state.chats[chatId] && !state.chats[chatId].wordPics) {
        state.chats[chatId].wordPics = {}
    }
    let wordPics = state.chats[chatId] ? state.chats[chatId].wordPics[wordSubdir] : []
    // l(`wordPics = ${JSON.stringify(wordPics)}`)
    if (!img && chatId) { //картинку для определенного чата не получили => сбросить счетчик отправленных картинок
        state.chats[chatId].wordPics[wordSubdir] = []
        saveState({ chats: state.chats })
        img = getWordFileByText(text, _options.dialog.keys, chatId)
    }
    if (img) {
        wordPics = state.chats[chatId] ? state.chats[chatId].wordPics[wordSubdir] : []
        if (!wordPics)
            wordPics = []
        wordPics.push(img.file)
        if (state.chats[chatId] && state.chats[chatId].wordPics)
            state.chats[chatId].wordPics[wordSubdir] = wordPics
        saveState({ chats: state.chats })
    }

    return img
}

const getTextByText = (text) => {
    return getWordByText(text, _options.dialog.texts)
}

const getWordByText = (text, keysObject) => {
    return getWordValueByText(text, keysObject)
}

//получение рандомного значения из массива по ключу
const getWordValueByText = (text, keysObject) => {
    const key = getKeyBytext(text, keysObject)
    if (!key) return
    //получение рандомного значения из списка значений
    const values = keysObject[key];
    return getRandom(values)
    // if (!values) return null
    // return values[Math.floor(Math.random() * values.length)]
}

const getWordFileByText = (text, keysObject, chatId = null) => {
    const key = getKeyBytext(text, keysObject)

    if (!key) return null
    // const path = `${_options.path}${_options.dirWords}/${key}`
    // l(`path=${path}`)
    const img = GetImage(`${_options.dirWords}/${key}`, chatId) //INFO: потом получать именно файл, а не картинку
    if (!img) return null
    return img
}

const getKeyBytext = (text, keysObject) => {
    // l(`getWordByText(text = ${text}, keysObject = ${JSON.stringify(keysObject)})`)
    if (!text || !keysObject) return null
    const punctuationless = text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    const t = punctuationless.replace(/\s{2,}/g, " ");
    if (!t) return null

    const keys = Object.keys(keysObject) //ключи переданного объекта, для которого поиск
    const allKeys = Object.keys(_options.dialog.keys) //все ключи массива ключей
    let textKeys = [] //все ключи, полученные из массива ключей, подходящие данному тексту

    //собираем из всех ключей только те, которые есть в keysObject 
    allKeys.forEach(x => {
        if (~keys.indexOf(x)) {
            textKeys = textKeys.concat(_options.dialog.keys[x])
        }
    })

    if (textKeys.length == 0)
        return null

    //слова из текста длиной больше 2
    let textWords = t.split(' ').filter(x => { return x && x.length > 2 })
    if (!textWords || textWords.length == 0) { //если больше двух нет, берем все
        textWords = t.split(' ')
    }

    if (!textWords || textWords.length == 0) return null
    //получаем пересечение со словами из текста
    const result = intersect(textWords, textKeys)

    const key = result.sort((a, b) => { return b.length - a.length })[0] //самый подходящий ключ

    //теперь найдем его в массиве ключей и получим ключ, по которому получать из объекта нужные данные
    let resKey = null
    for (let i = 0; i < allKeys.length; i++) {
        const k = allKeys[i]
        if (~_options.dialog.keys[k].indexOf(key)) {
            resKey = k
            break
        }
    }

    return resKey
}

const proceedCommand = (msg, match) => {
    if (match.length == 0)
        return
    const isSuper = msg && msg.from.id === _options.devId
    const isDevChat = msg && msg.chat.id == _options.devId
    let proceed2ndParam = false
    let interval = null
    if (match.length == 1) {
        if (match[0] == `/${_options.botCmd}`)
            SendMessage(msg.chat.id, getTextByText("bothelp"))
    }

    // l(`match.length=${match.length}, match[2]=${match[2]}`)
    if (match.length == 2 || !match[2]) { //быстрые операции
        const cmd = match[1]
        switch (cmd) {
            case botCommands.GO:
                toggleChat(msg.chat.id, getChatTitle(msg.chat), true)
                SendMessage(msg.chat.id, getTextByText("botgo"), getImageByText("привет", msg.chat.id))
                return
                break
            case botCommands.STOP:
                if (!isSuper) {
                    SendMessage(msg.chat.id, getTextByText("botstopnosuper"), getImageByText("пфф", msg.chat.id))
                    return
                }
                toggleChat(msg.chat.id, null, false)
                SendMessage(msg.chat.id, getTextByText("пока"), getImageByText("пока", msg.chat.id), isSuper)
                return
                break
            case botCommands.GOBOT:
                if (!isDevChat)
                    return;
                startTimer(timerType.MAIN)
                return
                break
            case botCommands.STOPBOT:
                if (!isDevChat)
                    return;
                stopTimer(timerType.MAIN)
                return
                break
            case botCommands.PIC:
                return //пока отключаем работу pic
                interval = 0
                proceed2ndParam = true
                break
            case botCommands.ANS:
                break
            default:
                proceed2ndParam = true;
                break;
        }
    }

    if (match.length == 3 || proceed2ndParam) {
        if (match[1] == botCommands.PIC) {
            return //пока отключаем работу pic
            const state = getState()
            const text = interval != null && interval != undefined ? interval : match[2]
            const img = getImageByText(text, msg.chat.id)

            if (img) {
                SendMessage(msg.chat.id, getTextByText(text), img, isSuper)
            }
            // }
        } else if (match[1] == botCommands.MSG) {
            if (!isDevChat && !_options.isMsgForAll) {
                SendMessage(msg.chat.id, getTextByText("пфф"), null, isSuper)
                return
            }
            const t = match[2]
            if (!t) return null

            //если конкретный чат - ищем по номеру
            let chatId = t.trim().split(' ')

            chatId = chatId && chatId.length > 0 ? chatId[0] : null
            if (chatId == 'br') {
                sendBroadcast(t.slice('br'.length + 2))
                return
            }
            if (!isNumber(chatId)) {
                return
            }

            //Если chatId = число, но чата нет в state - сообщение никуда не пойдет. т.о. /psh 123 какой-то текст - не отправит никуда
            const state = getState()
            const chatIds = Object.keys(state.chats)
            if (~chatIds.indexOf(chatId)) { //чат найден
                SendMessage(chatId, t.slice(chatId.toString().length + 2))
            }
            // else {
            //     sendBroadcast(t)
            // }
        } else if (match[1] == botCommands.PICDIR) {
            if (!isDevChat) return
            const t = match[2]

            if (!t) return null
            const pars = t.trim().split(' ')
            if (!pars || pars.length < 1) return

            //след параметр - номер чата
            const chatId = pars[0]
            if (!chatId || !isNumber(chatId)) return null

            //след параметр - имя папки
            const dir = pars[1]

            let state = getState()
            let chat = state.chats[chatId]
            if (!chat) {
                toggleChat(chatId, getChatTitle(), true)
                state = getState()
                chat = state.chats[chatId]
            }

            if (!dir) {
                log(`Удаление установленной директории '${chat.dir}' в чате ${chat.id}/${chat.title}. Теперь картинки будут слаться из папки по-умолчанию`, logLevel.INFO, true)
                delete chat['dir']
                state.chats[chatId] = chat
            } else {
                //либо удаление конкретной папки, либо добвление ее, если ее не было
                if (chat.dir && chat.dir.length > 0) {
                    const index = chat.dir.indexOf(dir)
                    if (index > -1) {
                        chat.dir.splice(index, 1)
                    } else {
                        //INFO: пока только 1 папка на чат chat.dir.push(dir)
                        chat.dir = [dir]
                    }
                } else {
                    log(`Установка директории '${dir}' в чате ${chatId}/${chat.title}`, logLevel.INFO, true)
                    chat.dir = [dir]
                }
                state.chats[chatId] = chat
            }
            saveState({ chats: state.chats })
        }
        else {
            let text = match[0].slice(_options.botCmd.length + 2)
            if (!text)
                return null
            const img = getImageByText(text, msg.chat.id)

            text = getTextByText(text)
            if(!text && !img){
                SendMessage(msg.chat.id, getTextByText('че'), null, isSuper)
            }
            if (img) {
                SendMessage(msg.chat.id, text, img, isSuper)
            }
        }
    }
}

const intersect = (a, b) => {
    if (!a || !b)
        return []
    var t;
    if (b.length > a.length) t = b, b = a, a = t; // indexOf to loop over shorter
        return a.filter(function (e) {
            if (b.indexOf(e) !== -1) return true
        })
        .filter(function (e, i, c) { // extra step to remove duplicates
            return c.indexOf(e) === i
        })
}

const isNumber = (text) => {
    return (text | 0).toString() == text
}

//TODO: передавать id, получать чат и его инфу здесь
const getChatTitle = (chat) => {
    if (!chat) return ''
    switch (chat.type) {
        case chatTypes.GROUP:
            return chat.title
            break
        case chatTypes.PRIVATE:
            return `${chat.first_name} ${chat.last_name}`
            break
        default:
            ''
    }
}

const isPathExists = (path, isMakeIfNot = false, isLogErrIfNot = false) => {
    if (!fs.existsSync(path)) {
        if (isLogErrIfNot) {
            log(`Директория или файл с путем '${path}' не существует. ${isMakeIfNot ? 'Создаем' : 'Не создаем'}`, logLevel.ERROR)
        }
        if (!isMakeIfNot) {
            return false
        }
        fs.mkdirSync(path)
    }
    return true
}

const getDirListing = (path) => {
    if (isPathExists(path, false, true)) {
        return fs.readdirSync(path)
    }
    return []
}

const getRandom = (values) => {
    if (!values || values.length == 0)
        return null
    return values[Math.floor(Math.random() * values.length)]
}

if (_options.run) Run()



// import http from 'http'

// http.createServer((req, res) => {
//     res.writeHead(200, { 'Content-Type': 'text/plain' });
//     res.end('Hello World\n');
// }).listen(1337, '192.168.86.3');

// console.log('Server running at http://127.0.0.1:1337/');
