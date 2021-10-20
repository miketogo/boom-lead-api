const mongoose = require('mongoose');
const validator = require('validator');
// Опишем схему:
const buyNumbersSchema = new mongoose.Schema({
    deliveryMethod: {
        type: String,
        required: true,
    },
    deliveryDate: {
        type: String,
    },
    deliveryTime: {
        type: String,
    },
    deliveryAddress: {
        type: String,
    },
    userPhone: {
        type: String,
        required: true,
        minlength: 1,
    },
    numbersArray: [
        {
            category: {
                type: String,
                required: true,
            },
            ctn: {
                type: String,
                required: true,
            },
            tariffName: {
                type: String,
                required: true,
            },
            tariffOptions: {
                type: String,
                required: true,
            },
        }
    ],
    date: {
        type: String,
        required: true,
    },
    fromMosсow: {
        type: String,
        required: true,
    },
    utm:{
        type: Object,
    }
});

// создаём модель и экспортируем её
module.exports = mongoose.model('buyNumbers', buyNumbersSchema);
