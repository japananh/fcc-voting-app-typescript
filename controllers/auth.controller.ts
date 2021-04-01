import { Request, Response } from "express";
import { User } from "../models";
import ApiError from "../utils/ApiError";
import catchAsync from "../utils/catchAsync";
import { encryptData, decryptData } from "../utils/auth";

export const login = catchAsync(async (req: Request, res: Response) => {
	const { username, password } = req.body;

	const user = await User.findOne({ username });
	if (!user || !user.toJSON() || !user.password) {
		throw new ApiError(400, "Incorrect username or password");
	}

	const match = await decryptData(password, user.password);
	if (!match) {
		throw new ApiError(400, "Incorrect username or password");
	}

	res.json({
		id: user.id,
		created_at: user.created_at,
		username: user.username,
		updated_at: user.updated_at,
	});
});

export const signup = catchAsync(async (req: Request, res: Response) => {
	const { username, password } = req.body;

	const existedUser = await User.findOne({ username });

	if (existedUser && existedUser.toJSON()) {
		throw new ApiError(409, "User already existed");
	}

	const hashPassword = await encryptData(password);

	if (!hashPassword) throw new ApiError(500, "Server error");

	const user = await User.create({ username, password: hashPassword });
	if (!user) throw new ApiError(500, "Server error");

	res.json({
		id: user.id,
		created_at: user.created_at,
		username: user.username,
		updated_at: user.updated_at,
	});
});
