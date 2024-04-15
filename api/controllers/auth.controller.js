import User from '../models/user.model.js'
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';

//Sign up function
export const signup = async (req, res, next) => {
    //Extracting data from request body
    const { username, email, password } = req.body;
    //Hashing the password
    const hashedPassword = bcryptjs.hashSync(password, 10);
    //Creating a new user instance
    const newUser = new User({ username, email, password: hashedPassword });
    try {
        //Save the new user to the database
        await newUser.save();
        //Sending success response
        res.status(201).json("User created successfully")
    } catch (error) {
        //Passing error to error handling middleware
        next(error);
    }
}

//Sign in function
export const signin = async (req, res, next) => {
    //Extracting data from request body
    const { email, password } = req.body;

    try{
        //Finding user by email in the database
        const validUser = await User.findOne({ email });
        //If user not found, return error
        if(!validUser) return next(errorHandler(404, 'User not found!'));

        //Comparing entered password with stored hashed password
        const validpassword = bcryptjs.compareSync(password, validUser.password);
        //If password is not valid, return error
        if(!validpassword) return next(errorHandler(401, 'Wrong credentials!'))

        //Generating JWT token
        const token = jwt.sign({id: validUser._id}, process.env.JWT_SECRET)
        //Removing password field from user data
        const { password: pass, ...rest } = validUser._doc;
        //Setting JWT token as cookie and sending user data in response
        res
            .cookie('access_token', token, {httpOnly: true})
            .status(200)
            .json(rest)
    } catch (error) {
        //Passing error to error handling middleware
        next(error);
    }
};

//  Define a function to handle Google authentication
export const google = async (req, res, next) => {
    try {
        //  Check if the user already exists in the database based on their email
        const user = await User.findOne({ email: req.body.email })
        if (user) {
            //  if user exists, generate a JWT token for authentication
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
            //  Omit the password field from the user data
            const { password: pass, ...rest } = user._doc;
            //  Set the token in a HTTP-only cookie and send user data in the response
            res
                .cookie('access_token', token, { httpOnly: true })
                .status(200)
                .json(rest);
        } else {
            //  If user does not exist, generate a random password and hash it
            const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
            //  Create a new user with Google data and hashed password
            const newUser = new User({ 
                username: req.body.name.split(" ").join("").toLowerCase()+Math.random().toString(36).slice(-4),
                email: req.body.email, 
                password: hashedPassword, 
                avatar: req.body.photo 
            });
            //  Save the new user to the database
             await newUser.save();
             // Generate a JWT token for the new user
             const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
             // Omit the password field from the new user data
             const { password: pass, ...rest } = newUser._doc;
             // Set the token in a HTTP-only cookie and send user data in the response
             res.cookie('access_token', token, { httpOnly: true }).status(200).json(rest);
        }
    } catch (error) {
        next(error)
    }
}