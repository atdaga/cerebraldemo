import httpStatus from 'http-status';
import { apiVersionedVisibility, publishByApiVersion } from '../publishedVisibility';
import * as questionaireSvc from '../services/questionaireService';
import { ApiError, UnauthorizedError } from '../errors';

export const getQuestions = (req, res, next) => { // eslint-disable-line import/prefer-default-export
  questionaireSvc.questions(req)
    .then((questions) => {
      res.status(httpStatus.OK)
        .json({ questions: publishByApiVersion(req, apiVersionedVisibility.publicQuestions, questions) });
    })
    .catch((err) => {
      if (err instanceof UnauthorizedError) {
        next(new ApiError(httpStatus.UNAUTHORIZED, httpStatus.UNAUTHORIZED, { message: 'Invalid credentials.', nestedError: err, warning: true }));
      } else {
        next(err);
      }
    });
};

export const submitAnswers = (req, res, next) => {
  const { answers } = req.body;
  questionaireSvc.submitAnswers(req, answers)
    .then(() => {
      res.status(httpStatus.OK)
        .end();
    })
    .catch((err) => {
      if (err instanceof UnauthorizedError) {
        next(new ApiError(httpStatus.UNAUTHORIZED, httpStatus.UNAUTHORIZED, { message: 'Server error.', nestedError: err, warning: true }));
      } else {
        next(err);
      }
    });
};
