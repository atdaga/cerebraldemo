// Deprecated.  Use bodyValidator.js instead.
import Joi from 'joi';
import validate from 'express-validation';


const validationSchemas = {
  registerUser: {
    body: {
      email: Joi.string().email().required()
    }
  },
  createUser: {
    body: {
      firstName: Joi.string().min(1).required(),
      lastName: Joi.string().min(1).required(),
      displayName: Joi.string().min(1).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(1).required(),
      country: Joi.string().min(1).required(),
      timeZone: Joi.string().min(1).required(),
      icon: Joi.string().base64().allow(null),
      defaultLocale: Joi.string().min(1),
      preferences: Joi.object().keys({
        iconColor: Joi.string().min(1),
        private: Joi.object()
      })
    }
  },
  updateUser: {
    body: {
      firstName: Joi.string().min(1),
      lastName: Joi.string().min(1),
      displayName: Joi.string().min(1),
      country: Joi.string().min(1),
      timeZone: Joi.string().min(1),
      icon: Joi.string().base64().allow(null),
      defaultLocale: Joi.string().min(1),
      presenceStatus: Joi.string().min(1),
      bookmarks: Joi.object(),
      preferences: Joi.object().keys({
        iconColor: Joi.string().min(1),
        private: Joi.object()
      })
    }
  },
  updatePassword: {
    body: {
      oldPassword: Joi.string().min(1).required(),
      newPassword: Joi.string().min(1).required()
    }
  },
  forgotPassword: {
    body: {
      email: Joi.string().email().required()
    }
  },
  resetPassword: {
    body: {
      password: Joi.string().min(1).required(),
    }
  },
  updateUserPublicPreferences: {
    body: {
      preferences: Joi.object().min(1).keys({
        private: Joi.any().forbidden()
      }).required()
    }
  },
  login: {
    body: {
      username: Joi.string().min(1).required(),
      password: Joi.string().min(1).required()
    }
  },
  createSubscriberOrg: {
    body: {
      name: Joi.string().min(1).required(),
      icon: Joi.string().base64().allow(null),
      preferences: Joi.object().keys({
        iconColor: Joi.string().min(1),
        private: Joi.object().required()
      })
    }
  },
  updateSubscriberOrg: {
    body: {
      name: Joi.string().min(1),
      icon: Joi.string().base64().allow(null),
      preferences: Joi.object().keys({
        iconColor: Joi.string().min(1),
        private: Joi.object()
      })
    }
  },
  inviteSubscribers: {
    body: {
      userIdOrEmails: Joi.array().min(1).items(
        Joi.string().min(1).required()
      ).required()
    }
  },
  replyToInvite: {
    body: {
      accept: Joi.boolean().required()
    }
  },
  createTeam: {
    body: {
      name: Joi.string().min(1).required(),
      icon: Joi.string().base64().allow(null),
      preferences: Joi.object().keys({
        iconColor: Joi.string().min(1),
        private: Joi.object().required()
      })
    }
  },
  updateTeam: {
    body: {
      name: Joi.string().min(1),
      active: Joi.boolean(),
      icon: Joi.string().base64().allow(null),
      preferences: Joi.object().keys({
        iconColor: Joi.string().min(1),
        private: Joi.object()
      })
    }
  },
  inviteTeamMembers: {
    body: {
      userIds: Joi.array().min(1).items(
        Joi.string().min(1).required()
      ).required()
    }
  },
  createTeamRoom: {
    body: {
      name: Joi.string().min(1).required(),
      purpose: Joi.string().min(1),
      active: Joi.boolean().required(),
      icon: Joi.string().base64().allow(null),
      preferences: Joi.object().keys({
        iconColor: Joi.string().min(1),
        private: Joi.object().required()
      })
    }
  },
  updateTeamRoom: {
    body: {
      name: Joi.string().min(1),
      purpose: Joi.string().min(1),
      publish: Joi.boolean(),
      active: Joi.boolean(),
      icon: Joi.string().base64().allow(null),
      preferences: Joi.object().keys({
        iconColor: Joi.string().min(1),
        private: Joi.object()
      })
    }
  },
  inviteTeamRoomMembers: {
    body: {
      userIds: Joi.array().min(1).items(
        Joi.string().min(1).required()
      ).required()
    }
  },
  createMessage: {
    body: {
      messageType: Joi.string().min(1).required(),
      text: Joi.string().min(1).required(),
      replyTo: Joi.string().min(1).allow(null)
    }
  },
  createMessage_v1: {
    body: {
      content: Joi.array().min(1).items(
        Joi.object().keys({
          type: Joi.string().min(1).required(),
          text: Joi.string().min(1),
          resourceId: Joi.string().min(1),
          meta: Joi.object().keys({
            fileName: Joi.string().min(1),
            fileSize: Joi.number().min(1)
          })
        })
      ).required(),
      replyTo: Joi.string().min(1).allow(null)
    }
  },
  getMessages: {
    body: {
      messages: Joi.array().min(1).items(
        Joi.object().keys({
          conversationId: Joi.string().min(1).required(),
          messageId: Joi.string().min(1).required()
        })
      ).required()
    }
  },
  updateMessage: {
    body: {
      content: Joi.array().min(1).items(
        Joi.object().keys({
          type: Joi.string().min(1).required(),
          text: Joi.string().min(1),
          resourceId: Joi.string().min(1),
          meta: Joi.object().keys({
            fileName: Joi.string().min(1),
            fileSize: Joi.number().min(1)
          })
        })
      ).required()
    }
  },
  likeMessage: {
    body: {
      like: Joi.boolean().required()
    }
  },
  dislikeMessage: {
    body: {
      dislike: Joi.boolean().required()
    }
  },
  flagMessage: {
    body: {
      flag: Joi.boolean().required()
    }
  },
  readMessage: {
    body: {
      messageId: Joi.string().min(1).required()
    }
  },
  configureIntegration: {
    body: {
      sharepoint: Joi.object().keys({
        sites: Joi.array().min(1).items(
          Joi.object().keys({
            site: Joi.string().min(1).required(),
            selected: Joi.boolean().required()
          })
        )
      })
    }
  }
};


// Index in the array is the version number to validate against.
export const apiVersionedValidators = {
  registerUser: {
    0: validate(validationSchemas.registerUser),
    1: validate(validationSchemas.registerUser)
  },
  createUser: {
    0: validate(validationSchemas.createUser),
    1: validate(validationSchemas.createUser)
  },
  updateUser: {
    0: validate(validationSchemas.updateUser),
    1: validate(validationSchemas.updateUser)
  },
  updateUserPublicPreferences: {
    0: validate(validationSchemas.updateUserPublicPreferences),
    1: validate(validationSchemas.updateUserPublicPreferences)
  },
  login: {
    0: validate(validationSchemas.login),
    1: validate(validationSchemas.login)
  }
};

class ApiValidator {
  validators;

  constructor(validators) {
    this.validators = validators;
  }

  doValidation(req, res, next) {
    this.validators[req.apiVersion.toString()](req, res, next);
  }
}

export const validateByApiVersion = (validators) => {
  const apiValidator = new ApiValidator(validators);
  return apiValidator.doValidation.bind(apiValidator);
};
