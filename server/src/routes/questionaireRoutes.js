import express from 'express';
import * as questionaire from '../controllers/questionaireController';
import { bodyValidatorNames, validateByApiVersion } from './bodyValidator';
import * as auth from '../controllers/authController';

const router = express.Router();

router.route('/questions')
  .get(questionaire.getQuestions);

router.route('/answers')
  .post(validateByApiVersion(bodyValidatorNames.answers), questionaire.submitAnswers);

export default router;
