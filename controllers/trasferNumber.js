const moment = require('moment-timezone');
const TelegramBot = require('node-telegram-bot-api');


const buyNumbers = require('../models/buyNumbers');
const orderService = require('../models/orderService');
const orderTariff = require('../models/orderTariff');
const trasferNumber = require('../models/trasferNumber');
const ConflictError = require('../errors/сonflict-err');
const InvalidDataError = require('../errors/invalid-data-err');

const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: false });



module.exports.transfer = (req, res, next) => {
  const {
    transferDate,
    transferredNumber,
    userPhone,
    fromMosсow,
    utm,
  } = req.body;
  const utmMarks = JSON.parse(utm)
  const realDate = new Date
  let date = moment(realDate.toISOString()).tz("Europe/Moscow").format('D.MM.YYYY HH:mm:ss')
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
                  trasferNumber.create({
                    transferDate,
                    transferredNumber,
                    userPhone,
                    fromMosсow,
                    date,
                    utm: utmMarks,
                  })
                    .then((result) => {

                      bot.sendMessage(-1001742268685,
                        `————————————
Заявка №${leadNumber}
*Перенос номера*
                
Дата переноса: *${transferDate}*
Переносимый номер: *${transferredNumber}*
                
Контактный телефон: *${userPhone}*
Откуда заявка: *${fromMosсow}*
Дата: *${date}*
                
[utm_source: ${utmMarks.utm_source}]
[utm_medium: ${utmMarks.utm_medium}]
[utm_campaign: ${utmMarks.utm_campaign}]
[utm_term: ${utmMarks.utm_term}]
[utm_content: ${utmMarks.utm_content}]
————————————`, { parse_mode: 'Markdown' });


                      res.status(200).send({ result })
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
                })

                .catch(next)
            })
            .catch(next)
        })

        .catch(next)
    })

    .catch(next)


};
