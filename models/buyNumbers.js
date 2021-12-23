const mongoose = require('mongoose');
const validator = require('validator');
// Опишем схему:
const buyNumbersSchema = new mongoose.Schema({
    leadNumber: {
        type: Number,
        default: 1,
    },
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
    confirmCode: {
        type: Number,
        required: true,
    },
    lastCodeUpd: {
        type: String,
        required: true,
    },
    codeUpdCount: {
        type: Number,
        required: true,
        default: 1,
    },
    phoneConfirmed: {
        type: Boolean,
        required: true,
        default: false,
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
    },
    userIP: {
        type: String,
    },
    passportData:
    {
        fullName: {
            type: String,
        },
        lastName: {
            type: String,
        },
        firstName: {
            type: String,
        },
        patronymic: {
            type: String,
            default: 'Нет отчества'
        },
        dateOfBirth: {
            type: String,
        },
        placeOfBirth: {
            type: String,
        },
        citizenship: {
            type: String,
        },
        divisionCode: {
            type: String,
        },
        dateOfIssue: {
            type: String,
        },
        passportSeries: {
            type: String,
        },
        passportNumber: {
            type: String,
        },
        whoIssuedPassport: {
            type: String,
        },
        registrationAddress: {
            type: String,
        },
        formatedRegistrationAddress: {
            type: String,
        },
        dateOfRegistration: {
            type: String,
        },


    },
    
});

// создаём модель и экспортируем её
module.exports = mongoose.model('buyNumbers', buyNumbersSchema);
