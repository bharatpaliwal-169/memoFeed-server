import express from 'express';

import {login,signup,deleteAccount,forgotPassword, verifyUser} from '../controllers/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.delete('/deleteAccount/:id', deleteAccount);
router.post("/forgotpswd",forgotPassword);
router.get("/email/verification/:token",verifyUser);

export default router;