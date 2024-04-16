import express from 'express';
import { test, updateUser } from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

//  Defining a route for handling GET requests to '/test'
router.get('/test', test);
router.post('/update/:id', verifyToken, updateUser);

export default router;