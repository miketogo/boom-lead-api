const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  order, checkCode, getNewCode, addPassportData
} = require('../controllers/orderTariff');

router.post('/', celebrate({
  body: Joi.object().keys({
    tariffName: Joi.string().required(),
    tariffOptions: Joi.string().required(),
    unlimitedInternet: Joi.boolean().required(),
    modem: Joi.boolean().required(),
    productionMethod: Joi.string().required(),
    selectedNumber: Joi.object(),
    deliveryDate: Joi.string(),
    deliveryTime: Joi.string(),
    deliveryAddress: Joi.string(),
    transferredNumber: Joi.string(),
    deliveryMethod: Joi.string(),
    userPhone: Joi.string().required(),
    fromMosсow: Joi.string().required(),
    utm: Joi.string(),
    userIP: Joi.string(),
  }),
}), order);

router.post('/check-code', celebrate({
  body: Joi.object().keys({
    code: Joi.number().required(),
    order_id: Joi.string().required(),
  }),
}), checkCode);

router.post('/get-new-code', celebrate({
  body: Joi.object().keys({
    order_id: Joi.string().required(),
  }),
}), getNewCode);

router.post('/add-passport-data', celebrate({
  body: Joi.object().keys({
    order_id: Joi.string().required(),
    lastName: Joi.string().required(),
    firstName: Joi.string().required(),
    patronymic: Joi.string(),
    dateOfBirth: Joi.string().required(),
    placeOfBirth: Joi.string().required(),
    citizenship: Joi.string().required(),
    divisionCode: Joi.string(),
    dateOfIssue: Joi.string(),
    passportSeries: Joi.string(),
    passportNumber: Joi.string(),
    whoIssuedPassport: Joi.string(),
    registrationAddress: Joi.string(),
    formatedRegistrationAddress: Joi.string(),
    dateOfRegistration: Joi.string(),
  }),
}), addPassportData);



module.exports = router;
