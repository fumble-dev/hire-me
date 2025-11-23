export default class ErrorHandler extends Error {
    constructor(statusCode, message) {
        super(message);
        console.log("error", message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
