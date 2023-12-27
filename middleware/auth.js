const Joi = require("joi");
require("dotenv").config();

module.exports = {
  registerValidator: async (req, res, next) => {
    try {
      const Schema = Joi.object({
        name: Joi.string().required().label("Username"),
        email: Joi.string().email().required().label("Email"),
        password: Joi.string().required().label("Password"),
        gender: Joi.string().optional().valid("male", "female").label("Gender"),
      });
      const response = Schema.validate(req.body);
      if (response.error) {
        res.json({ err: response.error.message });
      } else {
        next();
      }
    } catch (error) {
      res.json({ err: error.message });
    }
  },
  loginValidator: async (req, res, next) => {
    try {
      const Schema = Joi.object({
        email: Joi.string().email().required().label("Email"),
        password: Joi.string().required().label("Password"),
      });
      const response = Schema.validate(req.body);
      if (response.error) {
        res.json({ err: response.error.message });
      } else {
        next();
      }
    } catch (error) {
      res.json({ err: error.message });
    }
  },
  otpValidator: async (req, res, next) => {
    try {
      const Schema = Joi.object({
        otp: Joi.number().label("otp"),
        password: Joi.string().required().label("Password"),
      });
      const response = Schema.validate(req.body);
      if (response.error) {
        res.status(400).json({ message: response.error.message });
      } else {
        next();
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  newAdminValidator: async (req, res, next) => {
    try {
      const Schema = Joi.object({
        name: Joi.string().required().label("Username"),
        email: Joi.string().email().required().label("Email"),
        password: Joi.string().required().label("Password"),
        gender: Joi.string().optional().valid("male", "female").label("Gender"),
      });
      const response = Schema.validate(req.body);
      if (response.error) {
        res.json({ err: response.error.message });
      } else {
        next();
      }
    } catch (error) {
      res.json({ err: error.message });
    }
  },
  newTeacherValidator: async (req, res, next) => {
    try {
      const Schema = Joi.object({
        name: Joi.string().required().label("Username"),
        email: Joi.string().email().required().label("Email"),
        password: Joi.string().required().label("Password"),
        subject: Joi.string().required().label("subject"),
        gender: Joi.string().optional().valid("male", "female").label("Gender"),
      });
      const response = Schema.validate(req.body);
      if (response.error) {
        res.json({ err: response.error.message });
      } else {
        next();
      }
    } catch (error) {
      res.json({ err: error.message });
    }
  },
};
