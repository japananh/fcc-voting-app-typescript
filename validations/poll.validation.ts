import Joi from "@hapi/joi";

const getUserPolls = {
	params: Joi.object().keys({
		user_id: Joi.string().required(),
	}),
};

const getPoll = {
	params: Joi.object().keys({
		id: Joi.string().required(),
	}),
};

const updatePoll = {
	params: Joi.object().keys({
		id: Joi.string().required(),
	}),
	body: Joi.object().keys({
		user_id: Joi.string().required(),
		option: Joi.string().required(),
	}),
};

const deletePoll = {
	params: Joi.object().keys({
		id: Joi.string().required(),
	}),
};

const createPoll = {
	body: Joi.object().keys({
		question: Joi.string().required(),
		options: Joi.string().required(),
		user_id: Joi.string().required(),
	}),
};

export { getUserPolls, getPoll, updatePoll, deletePoll, createPoll };
