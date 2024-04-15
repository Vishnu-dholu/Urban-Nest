import express from 'express';
import { signup, signin, google } from '../controllers/auth.controller.js';

const router = express.Router();

//Route for user sign-up
router.post('/signup', signup);

//Route for user sign-in
router.post('/signin', signin);

router.post('/google', google);

export default router;