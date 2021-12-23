const moment = require('moment-timezone');
const TelegramBot = require('node-telegram-bot-api');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const geoip = require('geoip-lite');


const buyNumbers = require('../models/buyNumbers');
const orderService = require('../models/orderService');
const orderTariff = require('../models/orderTariff');
const trasferNumber = require('../models/trasferNumber');
const ConflictError = require('../errors/сonflict-err');
const InvalidDataError = require('../errors/invalid-data-err');

const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: false });

const bU = `1674531`
const bP = `16745311`

const opts = {
  new: true,
  runValidators: true,
};



module.exports.order = (req, res, next) => {
  const {
    deliveryDate,
    deliveryTime,
    deliveryAddress,
    deliveryMethod,
    numbersArray,
    userPhone,
    fromMosсow,
    utm,
    userIP,
  } = req.body;
  const utmMarks = JSON.parse(utm)
  async function sendSMS({ phone, code }) {

    const response = await fetch(`https://a2p-sms-https.beeline.ru/proto/http/?user=${bU}&pass=${bP}&action=post_sms&message=Код подтверждения: ${code}&target=${phone}&sender=BinomSms`, {
      method: 'get',
    });
    const data = await response.json();
    console.log(data);
  }

  let number = `+${userPhone.match(/\d{1,}/g).join("")}`;
  const nowDate = new Date
  let dateMark = moment(nowDate.toISOString()).tz("Europe/Moscow").format('x')
  const realDate = new Date
  let date = moment(realDate.toISOString()).tz("Europe/Moscow").format('D.MM.YYYY HH:mm:ss')
  let code = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;

  let leadNumber = 0
  buyNumbers.find()
    .then((buyNumberLeads) => {
      leadNumber = leadNumber + buyNumberLeads.length
      orderService.find()
        .then((orderServiceLeads) => {
          leadNumber = leadNumber + orderServiceLeads.length

          orderTariff.find()
            .then((orderTariffLeads) => {
              leadNumber = leadNumber + orderTariffLeads.length
              trasferNumber.find()
                .then((trasferNumberLeads) => {
                  leadNumber = leadNumber + trasferNumberLeads.length
                  bot.sendMessage(-1001742268685,
                    `————————————
Поступила заявка №${leadNumber}
на Приобретение номера
Номер телефона не подтвержен 
————————————`, { parse_mode: 'Markdown' });
                  if (deliveryMethod === "Доставка") {
                    buyNumbers.create({
                      leadNumber,
                      deliveryDate,
                      deliveryTime,
                      deliveryAddress,
                      deliveryMethod,
                      numbersArray,
                      userPhone,
                      confirmCode: code,
                      lastCodeUpd: dateMark,
                      fromMosсow,
                      date,
                      utm: utmMarks,
                      userIP,
                    })
                      .then((result) => {

                        //                         bot.sendMessage(-1001742268685,
                        //                           `————————————
                        // Заявка №${leadNumber}

                        // *Приобретение номера*

                        // Способ получения: *${deliveryMethod}*
                        // Дата доставки: *${deliveryDate}*
                        // Время доставки: *${deliveryTime}*
                        // Адрес доставки: *${deliveryAddress}*

                        // ${numbersArray.map((item, i) => {
                        //                             return `------------
                        // *Выбранный номер ${i + 1}*

                        // Номер: *${item.ctn}*
                        // Категория: *${item.category}*
                        // Тариф: *${item.tariffName}*
                        // Опции тарифа: *${item.tariffOptions}*
                        // Безлимитный 4G: *${item['Безлимитный 4G'] ? "Да" : "Нет"}*
                        // Раздача интернета: *${item['Раздача интернета'] ? "Да" : "Нет"}*
                        // `
                        // }).join("")}

                        // Контактный телефон: *${userPhone}*
                        // Откуда заявка: *${fromMosсow}*
                        // Дата: *${date}*

                        // [utm_source: ${utmMarks.utm_source}]
                        // [utm_medium: ${utmMarks.utm_medium}]
                        // [utm_campaign: ${utmMarks.utm_campaign}]
                        // [utm_term: ${utmMarks.utm_term}]
                        // [utm_content: ${utmMarks.utm_content}]
                        // [IP: ${geoip.pretty(userIP)}]
                        // ————————————`, { parse_mode: 'Markdown' });

                        sendSMS({
                          phone: number,
                          code
                        })
                        res.status(200).send({ id: result._id })
                      })
                      .catch((err) => {
                        if (err.name === 'MongoError' && err.code === 11000) {
                          throw new ConflictError('При регистрации указан email, который уже существует на сервере');
                        }
                        if (err.name === 'ValidationError') {
                          throw new InvalidDataError('Переданы некорректные данные при создании пользователя');
                        }
                      })
                      .catch(next);
                  }
                  else {
                    buyNumbers.create({
                      leadNumber,
                      deliveryMethod,
                      numbersArray,
                      userPhone,
                      confirmCode: code,
                      lastCodeUpd: dateMark,
                      fromMosсow,
                      date,
                      utm: utmMarks,
                      userIP,
                    })
                      .then((result) => {

                        //                         bot.sendMessage(-1001742268685,
                        //                           `————————————
                        // Заявка №${leadNumber}

                        // *Приобретение номера*

                        // Способ получения: *${deliveryMethod}*

                        // ${numbersArray.map((item, i) => {
                        //                             return `------------
                        // *Выбранный номер ${i + 1}*

                        // Номер: *${item.ctn}*
                        // Категория: *${item.category}*
                        // Тариф: *${item.tariffName}*
                        // Опции тарифа: *${item.tariffOptions}*
                        // Безлимитный 4G: *${item['Безлимитный 4G'] ? "Да" : "Нет"}*
                        // Раздача интернета: *${item['Раздача интернета'] ? "Да" : "Нет"}*
                        // `
                        // }).join("")}

                        // Контактный телефон: *${userPhone}*
                        // Откуда заявка: *${fromMosсow}*
                        // Дата: *${date}*

                        // [utm_source: ${utmMarks.utm_source}]
                        // [utm_medium: ${utmMarks.utm_medium}]
                        // [utm_campaign: ${utmMarks.utm_campaign}]
                        // [utm_term: ${utmMarks.utm_term}]
                        // [utm_content: ${utmMarks.utm_content}]
                        // [IP: ${geoip.pretty(userIP)}]
                        // ————————————`, { parse_mode: 'Markdown' });

                        sendSMS({
                          phone: number,
                          code
                        })
                        res.status(200).send({ id: result._id })
                      })
                      .catch((err) => {
                        if (err.name === 'MongoError' && err.code === 11000) {
                          throw new ConflictError('При регистрации указан email, который уже существует на сервере');
                        }
                        if (err.name === 'ValidationError') {
                          throw new InvalidDataError('Переданы некорректные данные при создании пользователя');
                        }
                      })
                      .catch(next);
                  }
                })

                .catch(next)
            })
            .catch(next)
        })

        .catch(next)
    })

    .catch(next)

};



module.exports.checkCode = (req, res, next) => {
  const {
    code,
    order_id,
  } = req.body;
  buyNumbers.findById(order_id).orFail(() => new Error('NotFound'))
    .then((order) => {
      if (order.confirmCode !== code) throw new Error('CodeNotCorrect')
      else if (order.phoneConfirmed) throw new Error('PhoneConfirmed')
      else {
        buyNumbers.findByIdAndUpdate(order._id, { phoneConfirmed: true })
          .then(() => {
            bot.sendMessage(-1001742268685,
              `————————————
Подтверждение телефона
по заявке №${order.leadNumber}
————————————`, { parse_mode: 'Markdown' });
            res.status(200).send({ isCodeCorrect: true })
          })
          .catch((err) => {
            if (err.name === 'ValidationError') {
              throw new InvalidDataError('Переданы некорректные данные при создании пользователя');
            }
            if (err.name === 'MongoError' && err.code === 11000) {
              throw new ConflictError('При регистрации указан email, который уже существует на сервере');
            }
            if (err.message === 'NotFound') {
              throw new NotFoundError('Заявка не найдена');
            }
            if (err.message === 'CodeNotCorrect') {
              throw new ConflictError('Неверный код');
            }
            if (err.message === 'PhoneConfirmed') {
              throw new ConflictError('Телефон в заявке подтвержден');
            }
          })
          .catch(next)

      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new InvalidDataError('Переданы некорректные данные при создании пользователя');
      }
      if (err.name === 'MongoError' && err.code === 11000) {
        throw new ConflictError('При регистрации указан email, который уже существует на сервере');
      }
      if (err.message === 'NotFound') {
        throw new NotFoundError('Заявка не найдена');
      }
      if (err.message === 'CodeNotCorrect') {
        throw new ConflictError('Неверный код');
      }
      if (err.message === 'PhoneConfirmed') {
        throw new ConflictError('Телефон в заявке подтвержден');
      }
    })
    .catch(next)
}

module.exports.getNewCode = (req, res, next) => {
  const {
    order_id,
  } = req.body;

  async function sendSMS({ phone, code }) {

    const response = await fetch(`https://a2p-sms-https.beeline.ru/proto/http/?user=${bU}&pass=${bP}&action=post_sms&message=Код подтверждения: ${code}&target=${phone}&sender=BinomSms`, {
      method: 'get',
    });
    const data = await response.json();
    console.log(data);
  }

  const nowDate = new Date
  let dateMark = moment(nowDate.toISOString()).tz("Europe/Moscow").format('x')
  let code = Math.floor(Math.random() * 10000)


  buyNumbers.findById(order_id).orFail(() => new Error('NotFound'))
    .then((order) => {
      if (order.phoneConfirmed) throw new Error('PhoneConfirmed')
      else if (Number(order.codeUpdCount) >= 3) throw new Error('MoreThen3Times')
      else if (Number(dateMark) - Number(order.lastCodeUpd) < 60000) throw new Error('NotEnoughtTime')
      else {
        buyNumbers.findByIdAndUpdate(order._id, { confirmCode: code, codeUpdCount: order.codeUpdCount + 1, lastCodeUpd: dateMark })
          .then(() => {
            let number = `+${order.userPhone.match(/\d{1,}/g).join("")}`;
            sendSMS({
              phone: number,
              code
            })
            res.status(200).send({ codeSent: true })
          })
          .catch((err) => {
            if (err.name === 'ValidationError') {
              throw new InvalidDataError('Переданы некорректные данные при создании пользователя');
            }
            if (err.name === 'MongoError' && err.code === 11000) {
              throw new ConflictError('При регистрации указан email, который уже существует на сервере');
            }
            if (err.message === 'NotFound') {
              throw new NotFoundError('Заявка не найдена');
            }
            if (err.message === 'PhoneConfirmed') {
              throw new ConflictError('Телефон в заявке подтвержден');
            }
            if (err.message === 'NotEnoughtTime') {
              throw new ConflictError('Код можно обновить только один раз в минуту');
            }
            if (err.message === 'MoreThen3Times') {
              throw new ConflictError('Код можно получить только 3 раза');
            }
          })
          .catch(next)

      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new InvalidDataError('Переданы некорректные данные при создании пользователя');
      }
      if (err.name === 'MongoError' && err.code === 11000) {
        throw new ConflictError('При регистрации указан email, который уже существует на сервере');
      }
      if (err.message === 'NotFound') {
        throw new NotFoundError('Заявка не найдена');
      }
      if (err.message === 'PhoneConfirmed') {
        throw new ConflictError('Телефон в заявке подтвержден');
      }
      if (err.message === 'NotEnoughtTime') {
        throw new ConflictError('Код можно обновить только один раз в минуту');
      }
      if (err.message === 'MoreThen3Times') {
        throw new ConflictError('Код можно получить только 3 раза');
      }
    })
    .catch(next)
}


module.exports.addPassportData = (req, res, next) => {
  const {
    order_id,
    lastName,
    firstName,
    patronymic = 'Нет отчетсва',
    dateOfBirth,
    placeOfBirth,
    citizenship,
    divisionCode = 'Не указано',
    dateOfIssue = 'Не указано',
    passportSeries = 'Не указано',
    passportNumber = 'Не указано',
    whoIssuedPassport = 'Не указано',
    registrationAddress = 'Не указано',
    formatedRegistrationAddress = 'Не указано',
    dateOfRegistration = 'Не указано',
  } = req.body;

  let fullName = `${lastName} ${firstName} ${patronymic}`

console.log(req.body)
  buyNumbers.findById(order_id).orFail(() => new Error('NotFound'))
    .then((order) => {
      if (!order.phoneConfirmed) throw new Error('PhoneNotConfirmed')
      else {
        buyNumbers.findByIdAndUpdate(order._id, {
          passportData: {
            fullName,
            lastName,
            firstName,
            patronymic,
            dateOfBirth,
            placeOfBirth,
            citizenship,
            divisionCode,
            dateOfIssue,
            passportSeries,
            passportNumber,
            whoIssuedPassport,
            registrationAddress,
            formatedRegistrationAddress,
            dateOfRegistration,
          }
        }, opts)
          .then((orderWithPD) => {

            if (orderWithPD.deliveryMethod === "Доставка") {
              bot.sendMessage(-1001742268685,
                `————————————

Заявка №${orderWithPD.leadNumber}

*Приобретение номера*

Способ получения: *${orderWithPD.deliveryMethod}*
Дата доставки: *${orderWithPD.deliveryDate}*
Время доставки: *${orderWithPD.deliveryTime}*
Адрес доставки: *${orderWithPD.deliveryAddress}*

${orderWithPD.numbersArray.map((item, i) => {
return `------------
*Выбранный номер ${i + 1}*

Номер: *${item.ctn}*
Категория: *${item.category}*
Тариф: *${item.tariffName}*
Опции тарифа: *${item.tariffOptions}*
Безлимитный 4G: *${item['Безлимитный 4G'] ? "Да" : "Нет"}*
Раздача интернета: *${item['Раздача интернета'] ? "Да" : "Нет"}*
`
}).join("")}

Контактный телефон: *${orderWithPD.userPhone}*
Откуда заявка: *${orderWithPD.fromMosсow}*
Дата: *${orderWithPD.date}*

*Паспортные данные*
ФИО: *${orderWithPD.passportData.fullName}*
Дата рождения: *${orderWithPD.passportData.dateOfBirth}*
Место рождения: *${orderWithPD.passportData.placeOfBirth}*
Гражданство: *${orderWithPD.passportData.citizenship}*
Код подразделения: *${orderWithPD.passportData.divisionCode}*
Дата выдачи: *${orderWithPD.passportData.dateOfIssue}*
Серия и номер: *${orderWithPD.passportData.passportSeries} ${orderWithPD.passportData.passportNumber}*
Кем выдан: *${orderWithPD.passportData.whoIssuedPassport}*
Адрес регистрации: *${orderWithPD.passportData.registrationAddress}*
по картам Google: *${orderWithPD.passportData.formatedRegistrationAddress}*
Дата регистрации: *${orderWithPD.passportData.dateOfRegistration}*


[utm_source: ${orderWithPD.utm.utm_source}]
[utm_medium: ${orderWithPD.utm.utm_medium}]
[utm_campaign: ${orderWithPD.utm.utm_campaign}]
[utm_term: ${orderWithPD.utm.utm_term}]
[utm_content: ${orderWithPD.utm.utm_content}]
[IP: ${geoip.pretty(orderWithPD.userIP)}]


————————————`, { parse_mode: 'Markdown' });

            }

            else {

              bot.sendMessage(-1001742268685,
                `————————————

Заявка №${orderWithPD.leadNumber}
          
*Приобретение номера*
          

Способ получения: *${orderWithPD.deliveryMethod}*
                                 
${orderWithPD.numbersArray.map((item, i) => {
  return `------------
*Выбранный номер ${i + 1}*

Номер: *${item.ctn}*
Категория: *${item.category}*
Тариф: *${item.tariffName}*
Опции тарифа: *${item.tariffOptions}*
Безлимитный 4G: *${item['Безлимитный 4G'] ? "Да" : "Нет"}*
Раздача интернета: *${item['Раздача интернета'] ? "Да" : "Нет"}*
`
}).join("")}
                      
Контактный телефон: *${orderWithPD.userPhone}*
Откуда заявка: *${orderWithPD.fromMosсow}*
Дата: *${orderWithPD.date}*

*Паспортные данные*
ФИО: *${orderWithPD.passportData.fullName}*
Дата рождения: *${orderWithPD.passportData.dateOfBirth}*
Место рождения: *${orderWithPD.passportData.placeOfBirth}*
Гражданство: *${orderWithPD.passportData.citizenship}*
Код подразделения: *${orderWithPD.passportData.divisionCode}*
Дата выдачи: *${orderWithPD.passportData.dateOfIssue}*
Серия и номер: *${orderWithPD.passportData.passportSeries} ${orderWithPD.passportData.passportNumber}*
Кем выдан: *${orderWithPD.passportData.whoIssuedPassport}*
Адрес регистрации: *${orderWithPD.passportData.registrationAddress}*
по картам Google: *${orderWithPD.passportData.formatedRegistrationAddress}*
Дата регистрации: *${orderWithPD.passportData.dateOfRegistration}*

          
[utm_source: ${orderWithPD.utm.utm_source}]
[utm_medium: ${orderWithPD.utm.utm_medium}]
[utm_campaign: ${orderWithPD.utm.utm_campaign}]
[utm_term: ${orderWithPD.utm.utm_term}]
[utm_content: ${orderWithPD.utm.utm_content}]
[IP: ${geoip.pretty(orderWithPD.userIP)}]
————————————`, { parse_mode: 'Markdown' });

            }




            res.status(200).send({ leadSent: true })
          })
          .catch((err) => {
            if (err.name === 'ValidationError') {
              throw new InvalidDataError('Переданы некорректные данные при создании пользователя');
            }
            if (err.name === 'MongoError' && err.code === 11000) {
              throw new ConflictError('При регистрации указан email, который уже существует на сервере');
            }
            if (err.message === 'NotFound') {
              throw new NotFoundError('Заявка не найдена');
            }
            if (err.message === 'PhoneNotConfirmed') {
              throw new ConflictError('Телефон в заявке не подтвержден');
            }

          })
          .catch(next)

      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new InvalidDataError('Переданы некорректные данные при создании пользователя');
      }
      if (err.name === 'MongoError' && err.code === 11000) {
        throw new ConflictError('При регистрации указан email, который уже существует на сервере');
      }
      if (err.message === 'NotFound') {
        throw new NotFoundError('Заявка не найдена');
      }
      if (err.message === 'PhoneNotConfirmed') {
        throw new ConflictError('Телефон в заявке не подтвержден');
      }
    })
    .catch(next)
}