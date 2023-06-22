import express from 'express';

import {login,signup,deleteAccount, verifyUserReq,verifyUser,forgotPassword,forgotPswdReq
  ,changePassword,changePasswordReq
} from '../controllers/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.delete('/deleteAccount/:id', deleteAccount);

router.post('/verifyEmail',verifyUserReq);
router.get('/verification',verifyUser);
router.post('/changepswd/request',changePasswordReq);
router.post('/changepassword',changePassword);
router.post('/forgotpswd/request',forgotPswdReq);
router.get('/forgotpassword',forgotPassword);

export default router;