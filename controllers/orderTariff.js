const moment = require('moment-timezone');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const TelegramBot = require('node-telegram-bot-api');
const geoip = require('geoip-lite');

const buyNumbers = require('../models/buyNumbers');
const orderService = require('../models/orderService');
const orderTariff = require('../models/orderTariff');
const trasferNumber = require('../models/trasferNumber');

const ConflictError = require('../errors/сonflict-err');
const InvalidDataError = require('../errors/invalid-data-err');
const NotFoundError = require('../errors/not-found-err');

const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: false });

const bU = `1674531`
const bP = `16745311`

const opts = {
  new: true,
  runValidators: true,
};


// [utm_source: ${utmMarks.utm_source}]
// [utm_medium: ${utmMarks.utm_medium}]
// [utm_campaign: ${utmMarks.utm_campaign}]
// [utm_term: ${utmMarks.utm_term}]
// [utm_content: ${utmMarks.utm_content}]
// [IP: ${geoip.pretty(userIP)}]

module.exports.order = (req, res, next) => {
  const {
    tariffName,
    tariffOptions,
    unlimitedInternet,
    modem,
    productionMethod,
    selectedNumber = false,
    deliveryDate = false,
    deliveryTime = false,
    deliveryAddress = false,
    transferredNumber = false,
    deliveryMethod = false,
    userPhone,
    fromMosсow,
    utm,
    userIP,
  } = req.body;

  async function sendSMS({ phone, code }) {

    const response = await fetch(`https://a2p-sms-https.beeline.ru/proto/http/?user=${bU}&pass=${bP}&action=post_sms&message=Код подтверждения: ${code}&target=${phone}&sender=BinomSms`, {
      method: 'get',
    });
    const data = await response.json();
    console.log(data);
  }

  const utmMarks = JSON.parse(utm)
  let number = `+${userPhone.match(/\d{1,}/g).join("")}`;
  const nowDate = new Date
  let dateMark = moment(nowDate.toISOString()).tz("Europe/Moscow").format('x')
  const realDate = new Date
  let date = moment(realDate.toISOString()).tz("Europe/Moscow").format('D.MM.YYYY HH:mm:ss')
  let leadNumber = 0
  let code = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;

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
на Подключение тарифа
Номер телефона не подтвержен 
————————————`, { parse_mode: 'Markdown' });
                  if (productionMethod === "Купить новую SIM") {
                    if (deliveryMethod === "Доставка") {
                      orderTariff.create({
                        tariffName,
                        tariffOptions,
                        unlimitedInternet,
                        modem,
                        productionMethod,
                        selectedNumber,
                        deliveryMethod,
                        deliveryDate,
                        deliveryTime,
                        deliveryAddress,
                        userPhone,
                        confirmCode: code,
                        lastCodeUpd: dateMark,
                        fromMosсow,
                        date,
                        utm: utmMarks,
                        userIP,
                        leadNumber,
                      })
                        .then((result) => {
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
                        .catch(next)
                    }

                    else {
                      orderTariff.create({
                        tariffName,
                        tariffOptions,
                        unlimitedInternet,
                        modem,
                        productionMethod,
                        selectedNumber,
                        deliveryMethod,
                        userPhone,
                        confirmCode: code,
                        lastCodeUpd: dateMark,
                        fromMosсow,
                        date,
                        utm: utmMarks,
                        userIP,
                        leadNumber,
                      })
                        .then((result) => {
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
                        .catch(next)
                    }

                  }
                  else {
                    orderTariff.create({
                      tariffName,
                      tariffOptions,
                      unlimitedInternet,
                      modem,
                      productionMethod,
                      transferredNumber,
                      userPhone,
                      confirmCode: code,
                      lastCodeUpd: dateMark,
                      fromMosсow,
                      date,
                      utm: utmMarks,
                      userIP,
                      leadNumber,
                    })
                      .then((result) => {
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
                      .catch(next)
                  }
                })

                .catch(next)
            })
            .catch(next)
        })

        .catch(next)
    })

    .catch(next)

    ;
};


module.exports.checkCode = (req, res, next) => {
  const {
    code,
    order_id,
  } = req.body;
  orderTariff.findById(order_id).orFail(() => new Error('NotFound'))
    .then((order) => {
      if (order.confirmCode !== code) throw new Error('CodeNotCorrect')
      else if (order.phoneConfirmed) throw new Error('PhoneConfirmed')
      else {
        orderTariff.findByIdAndUpdate(order._id, { phoneConfirmed: true })
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
  let code = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;


  orderTariff.findById(order_id).orFail(() => new Error('NotFound'))
    .then((order) => {
      if (order.phoneConfirmed) throw new Error('PhoneConfirmed')
      else if (Number(order.codeUpdCount) >= 3) throw new Error('MoreThen3Times')
      else if (Number(dateMark) - Number(order.lastCodeUpd) < 60000) throw new Error('NotEnoughtTime')
      else {
        orderTariff.findByIdAndUpdate(order._id, { confirmCode: code, codeUpdCount: order.codeUpdCount + 1, lastCodeUpd: dateMark })
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


  orderTariff.findById(order_id).orFail(() => new Error('NotFound'))
    .then((order) => {
      if (!order.phoneConfirmed) throw new Error('PhoneNotConfirmed')
      else {
        orderTariff.findByIdAndUpdate(order._id, {
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
            if (orderWithPD.productionMethod === "Купить новую SIM") {
              if (orderWithPD.deliveryMethod === "Доставка") {
                bot.sendMessage(-1001742268685,
                  `————————————
Заявка №${orderWithPD.leadNumber}
          
*Подключение тарифа*
          
Способ подключения: *${orderWithPD.productionMethod}*
Способ получения: *${orderWithPD.deliveryMethod}*
Дата доставки: *${orderWithPD.deliveryDate}*
Время доставки: *${orderWithPD.deliveryTime}*
Адрес доставки: *${orderWithPD.deliveryAddress}*
          
Название тарифа: *${orderWithPD.tariffName}*
Опции тарифа: *${orderWithPD.tariffOptions}*
Безлимитный 4G: *${orderWithPD.unlimitedInternet ? "Да" : "Нет"}*
Раздача интернета: *${orderWithPD.modem ? "Да" : "Нет"}*
Выбранный номер: *${orderWithPD.selectedNumber.ctn}*
Категория выбранного номера: *${orderWithPD.selectedNumber.category}*
          
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
          
*Подключение тарифа*
          
Способ подключения: *${orderWithPD.productionMethod}*
Способ получения: *${orderWithPD.deliveryMethod}*
                                 
Название тарифа: *${orderWithPD.tariffName}*
Опции тарифа: *${orderWithPD.tariffOptions}*
Безлимитный 4G: *${orderWithPD.unlimitedInternet ? "Да" : "Нет"}*
Раздача интернета: *${orderWithPD.modem ? "Да" : "Нет"}*
Выбранный номер: *${orderWithPD.selectedNumber.ctn}*
Категория выбранного номера: *${orderWithPD.selectedNumber.category}*
                      
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

            }
            else {


              bot.sendMessage(-1001742268685,
                `————————————
Заявка №${orderWithPD.leadNumber}

*Подключение тарифа*

Способ подключения: *${orderWithPD.productionMethod}*
Переносимый номер: *${orderWithPD.transferredNumber}*           

Название тарифа: *${orderWithPD.tariffName}*
Опции тарифа: *${orderWithPD.tariffOptions}*
Безлимитный 4G: *${orderWithPD.unlimitedInternet ? "Да" : "Нет"}*
Раздача интернета: *${orderWithPD.modem ? "Да" : "Нет"}*


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