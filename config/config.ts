import dotenv from "dotenv";
import path from "path";
import Joi from "@hapi/joi";

dotenv.config({ path: path.join(__dirname, "../.env") });

const envVarsSchema = Joi.object()
	.keys({
		NODE_ENV: Joi.string()
			.valid("production", "development", "test")
			.required(),
		PORT: Joi.number().default(3000),

		DB: Joi.string().required().description("mongodb connection"),
	})
	.unknown();

const { value: envVars, error } = envVarsSchema
	.prefs({ errors: { label: "key" } })
	.validate(process.env);

if (error) {
	throw new Error(`Config validation error: ${error.message}`);
}

const config = {
	env: envVars.NODE_ENV,
	port: envVars.PORT,
	db: {
		uri: envVars.DB,
		options: {
			useCreateIndex: true,
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
		},
	},
};

export default config;
