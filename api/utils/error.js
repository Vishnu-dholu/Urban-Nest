//  Function to create custom error objects with status code and message
export const errorHandler = (statusCode, message) => {
    //Create a new Error object
    const error = new Error();
    //Set the statusCode property of the error object to the provided statusCode
    error.statusCode = statusCode
    //Set the message property of the error object to the provided message
    error.message = message
    //Return the created error object
    return error;
}