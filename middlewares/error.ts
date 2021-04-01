/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable  @typescript-eslint/explicit-module-boundary-types */
import { Response, Request, NextFunction } from "express";
import httpStatus from "http-status";
import config from "../config/config";
import ApiError from "../utils/ApiError";

export const errorConverter = (
	err: any,
	_req: Request,
	_res: Response,
	next: NextFunction
): any => {
	let error = err;

	if (!(error instanceof ApiError)) {
		const statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
		const message = error.message || httpStatus[statusCode];
		error = new ApiError(statusCode, message, false, err.stack);
	}

	// Bug: error should be instance of ApiError, but this line logs false
	// console.log(error instanceof ApiError, "-------message");
	next(error);
};

// Bug: This middleware never be called
export const errorHandler = (err: any, _req: Request, res: Response): void => {
	// This line never be called too
	// console.log("error handler------", err);
	let { statusCode, message } = err;
	if (config.env === "production" && !err.isOperational) {
		statusCode = httpStatus.INTERNAL_SERVER_ERROR;
		message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
	}

	res.locals.errorMessage = err.message;

	const response = {
		code: statusCode,
		message,
		...(config.env === "development" && { stack: err.stack }),
	};
	if (config.env === "development") {
		/* eslint-disable no-console */
		console.error("Error handler-----\n", err);
	}

	res.status(statusCode).send(response);
};
