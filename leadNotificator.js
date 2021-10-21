require('dotenv').config();
const moment = require('moment-timezone');
const mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: false });

const BuyNumbers = require('./models/buyNumbers');
const OrderService = require('./models/orderService');
const OrderTariff = require('./models/orderTariff');
const TrasferNumber = require('./models/trasferNumber');


mongoose.connect('mongodb://localhost:27017/boom', {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

function timer(ms) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve();
    }, ms);
  });
}

async function sendNotification() {

  let prevDate = moment().tz("Europe/Moscow").subtract(1, "days").format('D.MM.YYYY')
  let nowDate = moment().tz("Europe/Moscow").format('D.MM.YYYY')
  let allNumbersOrders = []
  let allServicesOrders = []
  let allTariffOrders = []
  let allTransferOrders = []
  const getBuyNumbers = new Promise((resolve, reject) => {
    BuyNumbers.find({})
      .then((numbersOrders) => {
        resolve(numbersOrders)
      })
  })
  const getOrderService = new Promise((resolve, reject) => {
    OrderService.find({})
      .then((servicesOrders) => {
        resolve(servicesOrders)
      })
  })
  const getOrderTariff = new Promise((resolve, reject) => {
    OrderTariff.find({})
      .then((tariffOrders) => {
        resolve(tariffOrders)
      })
  })
  const getTrasferNumber = new Promise((resolve, reject) => {
    TrasferNumber.find({})
      .then((transferOrders) => {
        resolve(transferOrders)
      })
  })
  const promises = [getBuyNumbers, getOrderService, getOrderTariff, getTrasferNumber]
  Promise.all(promises)
    .then((results) => {
      allNumbersOrders = results[0]
      allServicesOrders = results[1]
      allTariffOrders = results[2]
      allTransferOrders = results[3]

      let numbersOrdersUTMValues = {
        utm_source: [],
        utm_medium: [],
        utm_campaign: [],
        utm_term: [],
        utm_content: [],
      }

      allNumbersOrders.filter((item) => {
        if (prevDate === item.date.split(' ')[0] && item.utm) return true
        else return false
      }).forEach((item) => {
        numbersOrdersUTMValues.utm_source = [...numbersOrdersUTMValues.utm_source, item.utm.utm_source]
        numbersOrdersUTMValues.utm_medium = [...numbersOrdersUTMValues.utm_medium, item.utm.utm_medium]
        numbersOrdersUTMValues.utm_campaign = [...numbersOrdersUTMValues.utm_campaign, item.utm.utm_campaign]
        numbersOrdersUTMValues.utm_term = [...numbersOrdersUTMValues.utm_term, item.utm.utm_term]
        numbersOrdersUTMValues.utm_content = [...numbersOrdersUTMValues.utm_content, item.utm.utm_content]
      })


      let servicesOrdersUTMValues = {
        utm_source: [],
        utm_medium: [],
        utm_campaign: [],
        utm_term: [],
        utm_content: [],
      }

      allServicesOrders.filter((item) => {
        if (prevDate === item.date.split(' ')[0] && item.serviceName !== 'Подключение eSim' && item.utm) return true
        else return false
      }).forEach((item) => {
        servicesOrdersUTMValues.utm_source = [...servicesOrdersUTMValues.utm_source, item.utm.utm_source]
        servicesOrdersUTMValues.utm_medium = [...servicesOrdersUTMValues.utm_medium, item.utm.utm_medium]
        servicesOrdersUTMValues.utm_campaign = [...servicesOrdersUTMValues.utm_campaign, item.utm.utm_campaign]
        servicesOrdersUTMValues.utm_term = [...servicesOrdersUTMValues.utm_term, item.utm.utm_term]
        servicesOrdersUTMValues.utm_content = [...servicesOrdersUTMValues.utm_content, item.utm.utm_content]
      })

      let esimOrdersUTMValues = {
        utm_source: [],
        utm_medium: [],
        utm_campaign: [],
        utm_term: [],
        utm_content: [],
      }

      allServicesOrders.filter((item) => {
        if (prevDate === item.date.split(' ')[0] && item.serviceName === 'Подключение eSim' && item.utm) return true
        else return false
      }).forEach((item) => {
        esimOrdersUTMValues.utm_source = [...esimOrdersUTMValues.utm_source, item.utm.utm_source]
        esimOrdersUTMValues.utm_medium = [...esimOrdersUTMValues.utm_medium, item.utm.utm_medium]
        esimOrdersUTMValues.utm_campaign = [...esimOrdersUTMValues.utm_campaign, item.utm.utm_campaign]
        esimOrdersUTMValues.utm_term = [...esimOrdersUTMValues.utm_term, item.utm.utm_term]
        esimOrdersUTMValues.utm_content = [...esimOrdersUTMValues.utm_content, item.utm.utm_content]
      })
      let transferOrdersUTMValues = {
        utm_source: [],
        utm_medium: [],
        utm_campaign: [],
        utm_term: [],
        utm_content: [],
      }

      allTransferOrders.filter((item) => {
        if (prevDate === item.date.split(' ')[0] && item.utm) return true
        else return false
      }).forEach((item) => {
        transferOrdersUTMValues.utm_source = [...transferOrdersUTMValues.utm_source, item.utm.utm_source]
        transferOrdersUTMValues.utm_medium = [...transferOrdersUTMValues.utm_medium, item.utm.utm_medium]
        transferOrdersUTMValues.utm_campaign = [...transferOrdersUTMValues.utm_campaign, item.utm.utm_campaign]
        transferOrdersUTMValues.utm_term = [...transferOrdersUTMValues.utm_term, item.utm.utm_term]
        transferOrdersUTMValues.utm_content = [...transferOrdersUTMValues.utm_content, item.utm.utm_content]
      })

      let tariffOrdersUTMValues = {
        utm_source: [],
        utm_medium: [],
        utm_campaign: [],
        utm_term: [],
        utm_content: [],
      }

      allTariffOrders.filter((item) => {
        if (prevDate === item.date.split(' ')[0] && item.utm) return true
        else return false
      }).forEach((item) => {
        tariffOrdersUTMValues.utm_source = [...tariffOrdersUTMValues.utm_source, item.utm.utm_source]
        tariffOrdersUTMValues.utm_medium = [...tariffOrdersUTMValues.utm_medium, item.utm.utm_medium]
        tariffOrdersUTMValues.utm_campaign = [...tariffOrdersUTMValues.utm_campaign, item.utm.utm_campaign]
        tariffOrdersUTMValues.utm_term = [...tariffOrdersUTMValues.utm_term, item.utm.utm_term]
        tariffOrdersUTMValues.utm_content = [...tariffOrdersUTMValues.utm_content, item.utm.utm_content]
      })







      bot.sendMessage(-534419638,
        `
*Статистика (${prevDate} 00:00) - (${nowDate} 00:00)*
Поступило заявок: ${
  allServicesOrders.filter((item) => {
    if (prevDate === item.date.split(' ')[0]) return true
    else return false
  }).length + allTransferOrders.filter((item) => {
    if (prevDate === item.date.split(' ')[0]) return true
    else return false
  }).length + allNumbersOrders.filter((item) => {
    if (prevDate === item.date.split(' ')[0]) return true
    else return false
  }).length + allTariffOrders.filter((item) => {
    if (prevDate === item.date.split(' ')[0]) return true
    else return false
  }).length
}

——————
Форма "Подключение услуг"
Всего заявок: ${allServicesOrders.filter((item) => {
          if (prevDate === item.date.split(' ')[0] && item.serviceName !== 'Подключение eSim') return true
          else return false
        }).length}

Популярные услуги: 
${Object.entries(allServicesOrders.filter((item) => {
          if (prevDate === item.date.split(' ')[0] && item.serviceName !== 'Подключение eSim') return true
          else return false
        }).map((item, i) => {
          return item.serviceName
        }).reduce((acc, el) => {
          acc[el] = (acc[el] || 0) + 1;
          return acc;
        }, {})).map((item, i) => {
          return `${item[0]} - ${item[1]}
`}).join("")
        }

*Метки UTM*
[utm_source: 
  ${Object.entries(servicesOrdersUTMValues.utm_source.reduce((acc, el) => {
          acc[el] = (acc[el] || 0) + 1;
          return acc;
        }, {})).map((item, i) => {
          return `${item[0]} - ${item[1]}
  `}).join("")
        }]
[utm_medium: 
  ${Object.entries(servicesOrdersUTMValues.utm_medium.reduce((acc, el) => {
          acc[el] = (acc[el] || 0) + 1;
          return acc;
        }, {})).map((item, i) => {
          return `${item[0]} - ${item[1]}
  `}).join("")
        }]
[utm_campaign: 
  ${Object.entries(servicesOrdersUTMValues.utm_campaign.reduce((acc, el) => {
          acc[el] = (acc[el] || 0) + 1;
          return acc;
        }, {})).map((item, i) => {
          return `${item[0]} - ${item[1]}
  `}).join("")
        }]
[utm_term: 
  ${Object.entries(servicesOrdersUTMValues.utm_term.reduce((acc, el) => {
          acc[el] = (acc[el] || 0) + 1;
          return acc;
        }, {})).map((item, i) => {
          return `${item[0]} - ${item[1]}
  `}).join("")
        }]
[utm_content: 
  ${Object.entries(servicesOrdersUTMValues.utm_content.reduce((acc, el) => {
          acc[el] = (acc[el] || 0) + 1;
          return acc;
        }, {})).map((item, i) => {
          return `${item[0]} - ${item[1]}
  `}).join("")
        }]
——————

——————
Форма "Подключение eSim"
Всего заявок: ${allServicesOrders.filter((item) => {
          if (prevDate === item.date.split(' ')[0] && item.serviceName === 'Подключение eSim') return true
          else return false
        }).length}
*Метки UTM*
[utm_source: 
  ${Object.entries(esimOrdersUTMValues.utm_source.reduce((acc, el) => {
          acc[el] = (acc[el] || 0) + 1;
          return acc;
        }, {})).map((item, i) => {
          return `${item[0]} - ${item[1]}
  `}).join("")
        }]
[utm_medium: 
  ${Object.entries(esimOrdersUTMValues.utm_medium.reduce((acc, el) => {
          acc[el] = (acc[el] || 0) + 1;
          return acc;
        }, {})).map((item, i) => {
          return `${item[0]} - ${item[1]}
  `}).join("")
        }]
[utm_campaign: 
  ${Object.entries(esimOrdersUTMValues.utm_campaign.reduce((acc, el) => {
          acc[el] = (acc[el] || 0) + 1;
          return acc;
        }, {})).map((item, i) => {
          return `${item[0]} - ${item[1]}
  `}).join("")
        }]
[utm_term: 
  ${Object.entries(esimOrdersUTMValues.utm_term.reduce((acc, el) => {
          acc[el] = (acc[el] || 0) + 1;
          return acc;
        }, {})).map((item, i) => {
          return `${item[0]} - ${item[1]}
  `}).join("")
        }]
[utm_content: 
  ${Object.entries(esimOrdersUTMValues.utm_content.reduce((acc, el) => {
          acc[el] = (acc[el] || 0) + 1;
          return acc;
        }, {})).map((item, i) => {
          return `${item[0]} - ${item[1]}
  `}).join("")
        }]
——————

——————
Форма "Перенос номера"
Всего заявок: ${allTransferOrders.filter((item) => {
          if (prevDate === item.date.split(' ')[0]) return true
          else return false
        }).length}
*Метки UTM*
[utm_source: 
  ${Object.entries(transferOrdersUTMValues.utm_source.reduce((acc, el) => {
          acc[el] = (acc[el] || 0) + 1;
          return acc;
        }, {})).map((item, i) => {
          return `${item[0]} - ${item[1]}
  `}).join("")
        }]
[utm_medium: 
  ${Object.entries(transferOrdersUTMValues.utm_medium.reduce((acc, el) => {
          acc[el] = (acc[el] || 0) + 1;
          return acc;
        }, {})).map((item, i) => {
          return `${item[0]} - ${item[1]}
  `}).join("")
        }]
[utm_campaign: 
  ${Object.entries(transferOrdersUTMValues.utm_campaign.reduce((acc, el) => {
          acc[el] = (acc[el] || 0) + 1;
          return acc;
        }, {})).map((item, i) => {
          return `${item[0]} - ${item[1]}
  `}).join("")
        }]
[utm_term: 
  ${Object.entries(transferOrdersUTMValues.utm_term.reduce((acc, el) => {
          acc[el] = (acc[el] || 0) + 1;
          return acc;
        }, {})).map((item, i) => {
          return `${item[0]} - ${item[1]}
  `}).join("")
        }]
[utm_content: 
  ${Object.entries(transferOrdersUTMValues.utm_content.reduce((acc, el) => {
          acc[el] = (acc[el] || 0) + 1;
          return acc;
        }, {})).map((item, i) => {
          return `${item[0]} - ${item[1]}
  `}).join("")
        }]
——————

——————
Форма "Приобретение номера/номеров"
Всего заявок: ${allNumbersOrders.filter((item) => {
          if (prevDate === item.date.split(' ')[0]) return true
          else return false
        }).length}
С одним номером: ${allNumbersOrders.filter((item) => {
          if (prevDate === item.date.split(' ')[0] && item.numbersArray.length === 1) return true
          else return false
        }).length}
С несколькими номерами: ${allNumbersOrders.filter((item) => {
          if (prevDate === item.date.split(' ')[0] && item.numbersArray.length > 1) return true
          else return false
        }).length}

*Способ доставки*
Доставка: ${allNumbersOrders.filter((item) => {
          if (prevDate === item.date.split(' ')[0] && item.deliveryMethod === "Доставка") return true
          else return false
        }).length}
Самовывоз: ${allNumbersOrders.filter((item) => {
          if (prevDate === item.date.split(' ')[0] && item.deliveryMethod === "Самовывоз") return true
          else return false
        }).length}
eSIM: ${allNumbersOrders.filter((item) => {
          if (prevDate === item.date.split(' ')[0] && item.deliveryMethod === "eSIM") return true
          else return false
        }).length}

*Метки UTM*
[utm_source: 
  ${Object.entries(numbersOrdersUTMValues.utm_source.reduce((acc, el) => {
          acc[el] = (acc[el] || 0) + 1;
          return acc;
        }, {})).map((item, i) => {
          return `${item[0]} - ${item[1]}
  `}).join("")
        }]
[utm_medium: 
  ${Object.entries(numbersOrdersUTMValues.utm_medium.reduce((acc, el) => {
          acc[el] = (acc[el] || 0) + 1;
          return acc;
        }, {})).map((item, i) => {
          return `${item[0]} - ${item[1]}
  `}).join("")
        }]
[utm_campaign: 
  ${Object.entries(numbersOrdersUTMValues.utm_campaign.reduce((acc, el) => {
          acc[el] = (acc[el] || 0) + 1;
          return acc;
        }, {})).map((item, i) => {
          return `${item[0]} - ${item[1]}
  `}).join("")
        }]
[utm_term: 
  ${Object.entries(numbersOrdersUTMValues.utm_term.reduce((acc, el) => {
          acc[el] = (acc[el] || 0) + 1;
          return acc;
        }, {})).map((item, i) => {
          return `${item[0]} - ${item[1]}
  `}).join("")
        }]
[utm_content: 
  ${Object.entries(numbersOrdersUTMValues.utm_content.reduce((acc, el) => {
          acc[el] = (acc[el] || 0) + 1;
          return acc;
        }, {})).map((item, i) => {
          return `${item[0]} - ${item[1]}
  `}).join("")
        }]
——————

——————
Форма "Подключение тарифа"
Всего заявок: ${allTariffOrders.filter((item) => {
          if (prevDate === item.date.split(' ')[0]) return true
          else return false
        }).length}


*Способ доставки*
Доставка: ${allTariffOrders.filter((item) => {
          if (prevDate === item.date.split(' ')[0] && item.deliveryMethod === "Доставка") return true
          else return false
        }).length}
Самовывоз: ${allTariffOrders.filter((item) => {
          if (prevDate === item.date.split(' ')[0] && item.deliveryMethod === "Самовывоз") return true
          else return false
        }).length}
eSIM: ${allTariffOrders.filter((item) => {
          if (prevDate === item.date.split(' ')[0] && item.deliveryMethod === "eSIM") return true
          else return false
        }).length}

*Метки UTM*
[utm_source: 
  ${Object.entries(tariffOrdersUTMValues.utm_source.reduce((acc, el) => {
          acc[el] = (acc[el] || 0) + 1;
          return acc;
        }, {})).map((item, i) => {
          return `${item[0]} - ${item[1]}
  `}).join("")
        }]
[utm_medium: 
  ${Object.entries(tariffOrdersUTMValues.utm_medium.reduce((acc, el) => {
          acc[el] = (acc[el] || 0) + 1;
          return acc;
        }, {})).map((item, i) => {
          return `${item[0]} - ${item[1]}
  `}).join("")
        }]
[utm_campaign: 
  ${Object.entries(tariffOrdersUTMValues.utm_campaign.reduce((acc, el) => {
          acc[el] = (acc[el] || 0) + 1;
          return acc;
        }, {})).map((item, i) => {
          return `${item[0]} - ${item[1]}
  `}).join("")
        }]
[utm_term: 
  ${Object.entries(tariffOrdersUTMValues.utm_term.reduce((acc, el) => {
          acc[el] = (acc[el] || 0) + 1;
          return acc;
        }, {})).map((item, i) => {
          return `${item[0]} - ${item[1]}
  `}).join("")
        }]
[utm_content: 
  ${Object.entries(tariffOrdersUTMValues.utm_content.reduce((acc, el) => {
          acc[el] = (acc[el] || 0) + 1;
          return acc;
        }, {})).map((item, i) => {
          return `${item[0]} - ${item[1]}
  `}).join("")
        }]
——————
`, { parse_mode: 'Markdown' });

      console.log(allNumbersOrders.length, allServicesOrders.length, allTariffOrders.length, allTransferOrders.length); // ["Первый промис", "Второй промис"]
    });

}

async function leadNotificator() {


  // User.find({})
  let nowDate = moment().tz("Europe/Moscow").format('HH')
 
  
  if(nowDate === '08'){
    console.log('___Обход начат___', nowDate)
    sendNotification()
    console.log('___Обход завершен___')
    setTimeout(leadNotificator, 3600000)
  } else{
    setTimeout(leadNotificator, 3600000)
  }
  

  
  // users.reduce(async (a, user) => {
  //   // Wait for the previous item to finish processing
  //   await a;
  //   // Process this item
  //   await sendNotification(user, date);
  // }, Promise.resolve())
  //   .then(() => {
      
      
  //   })

}


leadNotificator()



