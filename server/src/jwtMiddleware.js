import jwt from 'express-jwt/lib';
import config from './config';

const jwtMiddleware = jwt({ secret: config.jwtSecret });
export default jwtMiddleware;
