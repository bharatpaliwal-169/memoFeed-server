import express from 'express';

import {postNotify} from '../controllers/notify.js';
const router = express.Router();

router.post('/', postNotify);

export default router;
