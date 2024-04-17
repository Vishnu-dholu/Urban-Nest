import express from 'express';
import { signup, signin, google, signout } from '../controllers/auth.controller.js';

const router = express.Router();

//Route for user sign-up
router.post('/signup', signup);

//Route for user sign-in
router.post('/signin', signin);

//Route for user google
router.post('/google', google);

router.get('/signout', signout)

export default router;