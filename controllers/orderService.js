const moment = require('moment-timezone');
const TelegramBot = require('node-telegram-bot-api');
const geoip = require('geoip-lite');


const buyNumbers = require('../models/buyNumbers');
const orderService = require('../models/orderService');
const orderTariff = require('../models/orderTariff');
const trasferNumber = require('../models/trasferNumber');
const ConflictError = require('../errors/сonflict-err');
const InvalidDataError = require('../errors/invalid-data-err');

const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: false });



module.exports.order = (req, res, next) => {
  const {
    serviceName, userPhone, fromMosсow, utm, userIP
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
                  orderService.create({
                    serviceName, userPhone, fromMosсow, date, utm: utmMarks, userIP
                  })
                    .then((result) => {
                      // const opts = {
                      //   reply_markup: {
                      //     inline_keyboard: [
                      //       [
                      //         {
                      //           text: 'Нажми на меня',
                      //           callback_data: 'delete_notification'
                      //         }
                      //       ]
                      //     ]
                      //   }
                      // };
                      if (serviceName === "Подключение eSim") {
                        bot.sendMessage(-1001742268685,
                          `————————————
Заявка №${leadNumber}
                
*${serviceName}*
                          
Телефон: *${userPhone}*
Откуда заявка: *${fromMosсow}*
Дата: *${date}*
                
[utm_source: ${utmMarks.utm_source}]
[utm_medium: ${utmMarks.utm_medium}]
[utm_campaign: ${utmMarks.utm_campaign}]
[utm_term: ${utmMarks.utm_term}]
[utm_content: ${utmMarks.utm_content}]
[IP: ${geoip.pretty(userIP)}]
————————————`, { parse_mode: 'Markdown' });
                      } else {
                        bot.sendMessage(-1001742268685,
                          `————————————
Заявка №${leadNumber}
                
*Подключение услуги*
                
Название услуги: *${serviceName}*
Телефон: *${userPhone}*
Откуда заявка: *${fromMosсow}*
Дата: *${date}*
                
[utm_source: ${utmMarks.utm_source}]
[utm_medium: ${utmMarks.utm_medium}]
[utm_campaign: ${utmMarks.utm_campaign}]
[utm_term: ${utmMarks.utm_term}]
[utm_content: ${utmMarks.utm_content}]
[IP: ${geoip.pretty(userIP)}]
————————————`, { parse_mode: 'Markdown' });
                      }

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
                    .catch(next);
                })

                .catch(next)
            })
            .catch(next)
        })

        .catch(next)
    })

    .catch(next)

};
