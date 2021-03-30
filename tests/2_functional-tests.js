const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const ObjectID = require("mongoose").Types.ObjectId;

const server = require("../server");
const { Poll, User } = require("../models");

chai.use(chaiHttp);

suite("Functional Tests", function () {
	after((done) => {
		Poll.collection.drop();
		User.collection.drop();
		done();
	});

	const username = `username-${new Date().getTime()}`;
	const password = `password${new Date().getTime()}`;
	let userId = "";

	suite("Test authentication requests", () => {
		test("POST request to /api/auth/signup with valid username and password", (done) => {
			chai.request(server)
				.post(`/api/auth/signup`)
				.send({
					username,
					password,
				})
				.end((_err, res) => {
					assert.equal(res.status, 200);
					assert.isObject(res.body, "response should be an object");
					assert.containsAllKeys(
						res.body,
						["username", "created_at", "updated_at", "id"],
						"response should contain all keys"
					);
					assert.exists(
						res.body.password,
						false,
						"response should not contains password field"
					);

					userId = res.body.id;

					done();
				});
		});

		test("POST request to /api/auth/signup with duplicate username", (done) => {
			chai.request(server)
				.post(`/api/auth/signup`)
				.send({
					username,
					password,
				})
				.end((_err, res) => {
					assert.equal(res.status, 409);
					assert.isObject(res.body, "response should be an object");
					assert.equal(
						res.body.message,
						"User already existed",
						"response should have error message"
					);

					done();
				});
		});

		test("POST request to /api/auth/login with correct username and password", (done) => {
			chai.request(server)
				.post(`/api/auth/login`)
				.send({
					username,
					password,
				})
				.end((_err, res) => {
					assert.equal(res.status, 200);
					assert.isObject(res.body, "response should be an object");
					assert.containsAllKeys(
						res.body,
						["username", "created_at", "updated_at", "id"],
						"response should contain all keys"
					);
					assert.exists(
						res.body.password,
						false,
						"response should not contains password field"
					);

					done();
				});
		});

		test("POST request to /api/auth/login with incorrect username and correct password", (done) => {
			chai.request(server)
				.post(`/api/auth/login`)
				.send({
					username: `user-${new Date().getTime()}`,
					password,
				})
				.end((_err, res) => {
					assert.equal(res.status, 400);
					assert.isObject(res.body, "response should be an object");
					assert.equal(
						res.body.message,
						"Incorrect username or password",
						"response should have error message"
					);

					done();
				});
		});

		test("POST request to /api/auth/login with correct username and incorrect password", (done) => {
			chai.request(server)
				.post(`/api/auth/login`)
				.send({
					username,
					password: "incorrectpassword",
				})
				.end((_err, res) => {
					assert.equal(res.status, 400);
					assert.isObject(res.body, "response should be an object");
					assert.equal(
						res.body.message,
						"Incorrect username or password",
						"response should have error message"
					);

					done();
				});
		});
	});

	suite("Test requests to /api/polls", () => {
		let pollId = "";
		const question = "What is the most favorite programming language?";
		const options = ["JavaScript", "Python", "Java", "Go", "Ruby"];

		test("Create a poll with valid fields, POST request to /api/polls", (done) => {
			chai.request(server)
				.post(`/api/polls`)
				.send({
					user_id: userId,
					question,
					options: options.join(","),
				})
				.end((_err, res) => {
					assert.equal(res.status, 200);
					assert.isObject(res.body, "response should be an object");

					assert.containsAllKeys(res.body, [
						"created_by",
						"question",
						"created_at",
						"updated_at",
						"id",
						"options",
					]);

					assert.isArray(
						res.body.options,
						"options should be an array"
					);

					pollId = res.body.id;

					done();
				});
		});

		test("Create a poll with missing fields, POST request to /api/polls", (done) => {
			chai.request(server)
				.post(`/api/polls`)
				.send({
					user_id: userId,
					question,
				})
				.end((_err, res) => {
					assert.equal(res.status, 400);
					assert.isObject(res.body, "response should be an object");

					done();
				});
		});

		test("Get all polls, GET request to /api/polls", (done) => {
			chai.request(server)
				.get(`/api/polls`)
				.end((_err, res) => {
					assert.equal(res.status, 200);
					assert.isArray(res.body, "response should be an array");

					if (res.body.length) {
						res.body.forEach((item) => {
							assert.containsAllKeys(item, [
								"created_by",
								"question",
								"created_at",
								"updated_at",
								"id",
								"options",
							]);
						});
					}

					done();
				});
		});

		test("Get all polls that are created by a user, GET request to /api/polls", (done) => {
			chai.request(server)
				.get(`/api/polls`)
				.query({ user_id: userId })
				.end((_err, res) => {
					assert.equal(res.status, 200);
					assert.isArray(res.body, "response should be an array");

					if (res.body.length) {
						res.body.forEach((item) => {
							assert.containsAllKeys(item, [
								"created_by",
								"question",
								"created_at",
								"updated_at",
								"id",
								"options",
							]);
							assert.containsAllKeys(
								item.created_by,
								["id", "username"],
								"created_by should contain id and username keys"
							);
							assert.equal(
								item.created_by.id,
								userId,
								"all polls should have the same user_id"
							);
						});
					}

					done();
				});
		});

		test("Get a poll, GET request to /api/polls/:id", (done) => {
			chai.request(server)
				.get(`/api/polls/${pollId}`)
				.end((_err, res) => {
					assert.equal(res.status, 200);
					assert.isObject(res.body, "response should be an object");

					assert.containsAllKeys(res.body, [
						"created_by",
						"question",
						"created_at",
						"updated_at",
						"id",
						"options",
					]);

					done();
				});
		});

		test("Delete a poll with an invalid poll id, DELETE request to /api/polls/:id", (done) => {
			const invalidId = ObjectID().toString();

			chai.request(server)
				.delete(`/api/polls/${invalidId}`)
				.end((_err, res) => {
					assert.equal(res.status, 404);
					assert.deepEqual(
						res.body.message,
						"Poll not found",
						"response should return error message"
					);

					done();
				});
		});

		test("Delete a poll with a valid poll id, DELETE request to /api/polls/:id", (done) => {
			chai.request(server)
				.delete(`/api/polls/${pollId}`)
				.end((_err, res) => {
					assert.equal(res.status, 200);
					assert.deepEqual(
						res.body,
						"success",
						"response should return success"
					);

					done();
				});
		});
	});
});
