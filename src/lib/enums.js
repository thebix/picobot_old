export const fileTypes = {
    image: "image",
    file: "file"
}

export const logLevel = {
    ERROR: "ERROR",
    INFO: "INFO ",
    DEBUG: "DEBUG"
}

export const timerTypes = {
    NONE: "NONE",
    MAIN: "MAIN",   //"Главный короткий (мин)",
    DAILY: "DAILY", //Ежедневного отображения картинки (мин)",
    DAILY_SET: "DAILY_SET", //Ежедневной установки времени таймера ежедневной картинки"
}

export const botCommandTypes = {
    PIC: 'pic',
    GO: 'go',
    STOP: 'stop',
    GOBOT: 'gobot',
    STOPBOT: 'stopbot',
    ANS: "ans",
    MSG: 'msg',
    PICDIR: 'picdir',
    HELP: 'help'
}

export const chatTypes = {
    PRIVATE: 'private',
    GROUP: 'group'
}

export const messangerTypes = {
    telegram: 'telegram',
    irc: 'irc'
}

export const errorMessageSendTypes = {
    noChats: "noChats",
    noMessangers: 'noMessangers',
    noData: 'noData',
    sendError: 'sendError'
}