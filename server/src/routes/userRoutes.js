import express from 'express';
import { apiVersionedValidators, validateByApiVersion } from './validation';
import * as auth from '../controllers/authController';

const router = express.Router();

router.route('/register')
  .post(validateByApiVersion(apiVersionedValidators.registerUser), auth.login);

export default router;
