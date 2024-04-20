import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import bcryptjs from 'bcryptjs';
import Listing from '../models/listing.model.js';

//  Test endpoint to check if the API route is working
export const test = (req, res) => {
    res.json({
        message: 'Api route is working!'
    });
}

//  Update user information
export const updateUser = async (req, res, next) => {
    //  Check if the authenticated user is trying to update their own account
    if(req.user.id !== req.params.id) return next(errorHandler(401, 'You can only update your own account!'))
    try {
        //  If the request contains a password, hash it using bcrypt
        if(req.body.password) {
            req.body.password = bcryptjs.hashSync(req.body.password, 10);
        }

        //  Update the user document in the database
        const updatedUser = await User.findByIdAndUpdate(req.params.id, {
            $set: {
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                avatar: req.body.avatar,
            }
        }, {new: true})

        //  Remove the password field from the updated user document
        const {password, ...rest} = updatedUser._doc;

        //  Send the updated user information in the response
        res.status(200).json(rest);
    } catch (error) {
        next(error)
    }
}

//  Delete user account
export const deleteUser = async (req, res, next) => {
    //  Check if the authenticated user is trying to delete their own account
    if(req.user.id !== req.params.id)
        return next(errorHandler(401, 'You can only delete your own account!'));
    
    try {
        //  Find and delete the user document from the database
        await User.findByIdAndDelete(req.params.id);

        //  Clear the access_token cookie
        res.clearCookie('access_token');

        //  Send success message in the response
        res.status(200).json('User has been deleted!');
    } catch (error) {
        next(error)
    }
};

//  Get listings associated with a specific user
export const getUserListings = async (req, res, next) => {
    //  Check if the authenticated user is trying to access their own listings
    if (req.user.id === req.params.id){
        try{
            //  Find listings associated with the user ID
            const listings = await Listing.find({ userRef: req.params.id });

            //  Send the listings in the response
            res.status(200).json(listings);
        } catch (error){
            next(error)
        }
    } else {
        //  If the user is not authorized to view the listings, send an error
        return next(errorHandler(401, 'You can only view your own listings!'));
    }
};

//  Get user information by user ID
export const getUser = async (req, res, next) => {
    try {
        //  Find user document by ID
        const user = await User.findById(req.params.id);

        //  If user document not found, send eror
        if(!user) return next(errorHandler(404, 'User not found!'));

        //  Remove password field from user document
        const { password: pass, ...rest } = user._id

        //  Send user information in the response
        res.status(200).json(rest);

    } catch (error) {
        next(error)
    }
}