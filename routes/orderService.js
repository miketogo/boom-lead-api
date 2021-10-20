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
    utm: Joi.object().keys({
      utm_content: Joi.string(),
      utm_medium: Joi.string(),
      utm_source: Joi.string(),
      utm_term: Joi.string(),
      utm_campaign: Joi.string(),
    }),
  }),
}), order);


module.exports = router;
