import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

//  Middleware function to verify JWT token
export const verifyToken = (req, res, next) => {
    //  Extracting JWT token from request cookies
    const token = req.cookies.access_token;
    //  If token is not present, return unauthorized error 
    if (!token) return next(errorHandler(401, 'Unauthorized'));

    //  Verify the JWT token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        //  If verification fails, return forbidden error
        if (err) return next(errorHandler(403, 'Forbidden'));

        //  If verification succeeds, attach user information to request object
        req.user = user;
        next();
    })
}
