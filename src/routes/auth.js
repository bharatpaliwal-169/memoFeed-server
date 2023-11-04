import express from 'express';

import {login,signup,deleteAccount, verifyUserReq,verifyUser,
  // forgotPassword,
  forgotPswdReq,changePassword,changePasswordReq
} from '../controllers/auth.js';

import logMid from '../middleware/logMiddleware.js';

const router = express.Router();

router.post('/login',logMid, login);
router.post('/signup',logMid, signup);
router.delete('/deleteAccount/:id',logMid, deleteAccount);

router.post('/verifyEmail',logMid,verifyUserReq);
router.get('/verification',logMid,verifyUser);
router.post('/changepswd/request',logMid,changePasswordReq);
router.post('/changepassword',logMid,changePassword);
router.post('/forgotpswd/request',logMid,forgotPswdReq);
// router.get('/forgotpassword',logMid,forgotPassword);

export default router;