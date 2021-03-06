/*
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *       DO NOT EDIT THIS FILE
 *       For FCC testing purposes!
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */

import cors from "cors";
import fs from "fs";
import { Request, Response, NextFunction } from "express";
import runner from "../test-runner";

interface Test {
	title: string;
	context: string;
	state: string;
	assertions: {
		[index: number]: {
			method: string;
			args: string[];
		};
	};
}

function testFilter(tests: Test[], type: string, n: number): Test[] {
	let out: Test[] = [];
	switch (type) {
		case "unit":
			out = tests.filter((t: Test) => t.context.match("Unit Tests"));
			break;
		case "functional":
			out = tests.filter(
				(t: Test) =>
					t.context.match("Functional Tests") &&
					!t.title.match("#example")
			);
			break;
		default:
			out = tests;
	}
	if (n !== undefined) {
		return out[n] || out;
	}
	return out;
}

/* eslint-disable */
export default function (app: any) {
	app.route("/_api/server.js").get(function (
		_req: Request,
		res: Response,
		next: NextFunction
	) {
		fs.readFile(`${__dirname}/server.js`, function (err, data) {
			if (err) return next(err);
			res.send(data.toString());
		});
	});
	app.route("/_api/routes/api.js").get(function (
		_req: Request,
		res: Response,
		next: NextFunction
	) {
		fs.readFile(`${__dirname}/routes/api.js`, function (err, data) {
			if (err) return next(err);
			res.type("txt").send(data.toString());
		});
	});
	app.route("/_api/controllers/convertHandler.js").get(function (
		_req: Request,
		res: Response,
		next: NextFunction
	) {
		fs.readFile(
			`${__dirname}/controllers/convertHandler.js`,
			function (err, data) {
				if (err) return next(err);
				res.type("txt").send(data.toString());
			}
		);
	});

	let error: any;
	app.get(
		"/_api/get-tests",
		cors(),
		function (_req: Request, res: Response, next: NextFunction) {
			if (!error && process.env.NODE_ENV === "test") return next();
			res.json({ status: "unavailable" });
		},
		function (req: Request, res: Response, next: NextFunction) {
			if (!runner.report) return next();
			res.json(testFilter(runner.report, req.query.type, req.query.n));
		},
		function (req: Request, res: Response) {
			runner.on("done", function () {
				process.nextTick(() =>
					res.json(
						testFilter(runner.report, req.query.type, req.query.n)
					)
				);
			});
		}
	);
	app.get("/_api/app-info", function (_req: Request, res: Response) {
		const hs = Object.keys(res._headers).filter(
			(h) => !h.match(/^access-control-\w+/)
		);
		const hObj: any = {};
		hs.forEach((h) => {
			hObj[h] = res._headers[h];
		});
		delete res._headers["strict-transport-security"];
		res.json({ headers: hObj });
	});
}
