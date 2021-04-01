import validate from "../middlewares/validate";
import { authValidation, pollValidation } from "../validations";
import { authController, pollController } from "../controllers";

/* eslint-disable */
export default function routes(app: any): void {
	app.post(
		"/api/auth/login",
		validate(authValidation.login),
		authController.login
	);

	app.post(
		"/api/auth/signup",
		validate(authValidation.signup),
		authController.signup
	);

	app.post(
		"/api/polls",
		validate(pollValidation.createPoll),
		pollController.createPoll
	);

	app.get("/api/polls", pollController.getPolls);

	app.get(
		"/api/polls/:id",
		validate(pollValidation.getPoll),
		pollController.getPoll
	);

	app.put(
		"/api/polls/:id",
		validate(pollValidation.updatePoll),
		pollController.updatePoll
	);

	app.delete(
		"/api/polls/:id",
		validate(pollValidation.deletePoll),
		pollController.deletePoll
	);

	app.post(
		"/api/polls",
		validate(pollValidation.createPoll),
		pollController.createPoll
	);
}
