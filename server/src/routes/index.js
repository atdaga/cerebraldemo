import express from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import questionaireRoutes from './questionaireRoutes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/questionaire', questionaireRoutes);

export default router;
