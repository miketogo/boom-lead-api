const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  order,
} = require('../controllers/orderService');

router.post('/', celebrate({
  body: Joi.object().keys({
    serviceName: Joi.string().required(),
    userPhone: Joi.string().required(),
    fromMosсow: Joi.string().required(),
    utm: Joi.object(),
  }),
}), order);


module.exports = router;
