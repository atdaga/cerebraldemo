import express from 'express';
import { bodyValidatorNames, validateByApiVersion } from './bodyValidator';
import * as auth from '../controllers/authController';

const router = express.Router();

router.route('/login')
  .post(validateByApiVersion(bodyValidatorNames.login), auth.login);

router.route('/logout')
  .get(auth.logout);

export default router;
