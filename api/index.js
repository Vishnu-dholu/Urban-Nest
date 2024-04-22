import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js'
import cookieParser from 'cookie-parser';
import path from 'path';

// Loading environment variables from .env file
dotenv.config();

// Connecting to MongoDB database using the provided URI
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB!');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });

    const __dirname = path.resolve();

// Creating an Express application
const app = express();

// Middleware to parse JSON requests
app.use(express.json());
app.use(cookieParser());

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

// Mounting userRouter at '/api/user' endpoint
app.use('/api/user', userRouter);
// Mounting authRouter at '/api/auth' endpoint
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);

app.use(express.static(path.join(__dirname, '/client/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', index.html));
})

// Error handling middleware to handle errors passed to next() function
app.use((err, req, res, next) => {
    // Extracting status code and message from error object, or using defaults
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    });
});
