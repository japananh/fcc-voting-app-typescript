import { Request, Response } from "express";
import { Poll } from "../models";
import ApiError from "../utils/ApiError";
import catchAsync from "../utils/catchAsync";

export const getPolls = catchAsync(async (req: Request, res: Response) => {
	const userId = req.query.user_id;
	if (userId) {
		const polls = await Poll.find({ created_by: userId }).populate([
			{
				path: "created_by",
				select: "username",
			},
		]);
		return res.json(polls || []);
	}

	const polls = await Poll.find({}).populate([
		{
			path: "created_by",
			select: "username",
		},
	]);

	res.json(polls || []);
});

export const getPoll = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const poll = await Poll.findOne({ _id: id }).populate([
		{
			path: "created_by",
			/* eslint-disable @typescript-eslint/no-explicit-any */
			transform: (doc: any) =>
				doc == null ? null : { username: doc.username },
		},
	]);
	if (!poll) throw new ApiError(404, "Poll not found");
	res.json(poll);
});

export const updatePoll = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const { user_id: userId, option } = req.body;

	const poll = await Poll.findOne({
		_id: id,
		"options.name": option,
	});

	if (poll) {
		await Poll.findOneAndUpdate(
			{
				_id: id,
				"options.name": option,
			},
			{
				$addToSet: {
					/* eslint-disable */
					"options.$.votes": [userId],
				},
			}
		);
	} else {
		await Poll.findOneAndUpdate(
			{
				_id: id,
			},
			{
				$push: {
					options: {
						votes: [userId],
						name: option,
					},
				},
			}
		);
	}

	res.json("success");
});

export const deletePoll = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const deletedPoll = await Poll.findByIdAndDelete(id);
	if (!deletedPoll) throw new ApiError(404, "Poll not found");
	res.json("success");
});

export const createPoll = catchAsync(async (req: Request, res: Response) => {
	const { user_id: userId, question, options: optionString } = req.body;

	const options = optionString
		.split(",")
		.map((option: string) => ({ name: option, votes: [] }));

	const createdPoll = await Poll.create({
		created_by: userId,
		question,
		options,
	});

	if (!createdPoll) throw new ApiError(500, "Server error");

	res.json(createdPoll);
});
