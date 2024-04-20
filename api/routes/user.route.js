import express from 'express';
import { deleteUser, test, updateUser, getUserListings } from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

//  Route for testing the API
router.get('/test', test);

//  Route for updating user information
router.post('/update/:id', verifyToken, updateUser);

//  Route for deleting a user account
router.delete('/delete/:id', verifyToken, deleteUser);

//  Route for getting listings associated with a user
router.get('/listing/:id', verifyToken, getUserListings)

export default router;