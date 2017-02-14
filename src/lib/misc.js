//dev
import { l } from './loggers'

// Клонирование, копирование данных
export const cloneArray = (array = []) => {
    const res = []
    if (array && array.length > 0) {
        array.forEach((element) => {
            if (typeof (element) === 'object') {
                res.push(Object.assign({}, element))
            } else {
                res.push(element)
            }
        });
    }
    return res
}

// Дата
export const getDateString = (date = new Date()) => {
    const options = {
        year: '2-digit', month: 'numeric', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: 'numeric',
        hour12: false,
        weekday: "long"
    }
    return `${date.toLocaleDateString()} ${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}:${("0" + date.getSeconds()).slice(-2)}`
}

export const getChangedDateTime = (options = { days: null, hours: null, minutes: null, seconds: null }, date = new Date()) => {
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