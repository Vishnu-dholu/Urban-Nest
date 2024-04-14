import express from 'express';
import { test } from '../controllers/user.controller.js';

const router = express.Router();

//  Defining a route for handling GET requests to '/test'
router.get('/test', test);

export default router;