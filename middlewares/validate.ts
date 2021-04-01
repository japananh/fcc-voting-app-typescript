/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response, Request, NextFunction } from "express";
import Joi from "@hapi/joi";
import httpStatus from "http-status";
import pick from "../utils/pick";
import ApiError from "../utils/ApiError";

const validate = (schema: any) => (
	req: Request,
	_res: Response,
	next: NextFunction
) => {
	const validSchema = pick(schema, ["params", "query", "body"]);
	const object = pick(req, Object.keys(validSchema));
	const { value, error } = Joi.compile(validSchema)
		.prefs({ errors: { label: "key" } })
		.validate(object);

	if (error) {
		const errorMessage = error.details
			.map((details: any) => details.message)
			.join(", ");
		return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
	}
	Object.assign(req, value);
	return next();
};

export default validate;
