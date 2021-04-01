/* eslint-disable no-console */
import * as dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";

import apiRoutes from "./routes/api";

import fccTestingRoutes from "./routes/fcctesting";
import runner from "./test-runner";
import { errorConverter, errorHandler } from "./middlewares/error";
import config from "./config/config";

dotenv.config();

const app = express();

app.use(cors({ origin: "*" })); // For FCC testing purposes only

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				styleSrc: [
					"'self'",
					"'unsafe-inline'",
					"https://code.jquery.com/jquery-3.6.0.min.js",
				],
				scriptSrc: [
					"'self'",
					"'unsafe-inline'",
					"https://code.jquery.com/jquery-3.6.0.min.js",
					"https://cdn.jsdelivr.net/npm/js-cookie@rc/dist/js.cookie.min.js",
				],
			},
		},
		xssFilter: true,
		nocache: true,
		noSniff: true,
		hidePoweredBy: true,
		// frameguard: {
		//   action: "deny",
		// },
	})
);

app.use("/public", express.static(`${process.cwd()}/public`));

app.route("/").get(function (_req, res) {
	res.sendFile(`${process.cwd()}/views/index.html`);
});
// TODO: Add midleware to all routes below
app.route("/login").get(function (_req, res) {
	res.sendFile(`${process.cwd()}/views/login.html`);
});
app.route("/signup").get(function (_req, res) {
	res.sendFile(`${process.cwd()}/views/signup.html`);
});
app.route("/new-poll").get(function (_req, res) {
	res.sendFile(`${process.cwd()}/views/new-poll.html`);
});
app.route("/polls").get(function (_req, res) {
	res.sendFile(`${process.cwd()}/views/my-polls.html`);
});
app.route("/polls/:id").get(function (_req, res) {
	res.sendFile(`${process.cwd()}/views/poll.html`);
});

// For FCC testing purposes
fccTestingRoutes(app);

// Routing for API
apiRoutes(app);

app.use(function (_req, res) {
	res.status(404).type("text").send("Not Found");
});

mongoose.connect(config.db.uri, config.db.options).then(() => {
	console.log("Connected to mongodb");

	const port: number = parseInt(process.env.PORT as string, 10) || 3000;
	// Start our server and tests!
	app.listen(port, function () {
		console.log(`Listening on port ${process.env.PORT}`);
		if (process.env.NODE_ENV === "test") {
			console.log("Running Tests...");
			setTimeout(function () {
				try {
					runner.run();
					console.log("Completed test");
				} catch (e) {
					console.log("Tests are not valid:", e);
				}
			}, 1500);
		}
	});
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

export default app; // for testing
