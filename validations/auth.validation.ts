import Joi from "@hapi/joi";
import { password } from "./custom.validation";

const signup = {
	body: Joi.object().keys({
		username: Joi.string().required(),
		password: Joi.string().required().custom(password),
	}),
};

const login = {
	body: Joi.object().keys({
		username: Joi.string().required(),
		password: Joi.string().required(),
	}),
};

export {
	signup,
	login,
};
