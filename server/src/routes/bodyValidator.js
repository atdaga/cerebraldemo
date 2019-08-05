import Joi from 'joi';
import validate from 'express-validation';

const bodyValidatorSchemas = {
  login: {
    0: {
      body: {
        username: Joi.string()
          .min(1)
          .required(),
        password: Joi.string()
          .min(1)
          .required()
      }
    }
  },

  answers: {
    0: {
      body: {
        answers: Joi.array()
          .min(1)
      }
    }
  }
};

export const bodyValidatorNames = {};
Object.keys(bodyValidatorSchemas).forEach((bodyValidatorName) => {
  bodyValidatorNames[bodyValidatorName] = bodyValidatorName;
});


class ApiValidator {
  validatorSchemas;

  constructor(validatorSchemas) {
    this.validatorSchemas = validatorSchemas;
  }

  doValidation(req, res, next) {
    let { apiVersion } = req;
    let validatorSchema = this.validatorSchemas[apiVersion.toString()];
    while (!validatorSchema) {
      apiVersion -= 1;
      validatorSchema = this.validatorSchemas[apiVersion.toString()];
    }
    validate(validatorSchema)(req, res, next);
  }
}

export const validateByApiVersion = (bodyValidatorName) => {
  const apiValidator = new ApiValidator(bodyValidatorSchemas[bodyValidatorName]);
  return apiValidator.doValidation.bind(apiValidator);
};
