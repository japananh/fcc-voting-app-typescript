import mongoose from "mongoose";
import toJSON from "./plugins";

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const userSchema = new Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
		versionKey: false,
	}
);

const pollSchema = new Schema(
	{
		created_by: {
			type: ObjectId,
			required: true,
			ref: "User",
		},
		question: {
			type: String,
			required: true,
		},
		options: [
			{
				name: {
					type: String,
					required: true,
				},
				votes: [
					{
						type: ObjectId,
						ref: "User",
					},
				],
			},
		],
	},
	{
		timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
		versionKey: false,
	}
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
pollSchema.plugin(toJSON);

const User = mongoose.model("User", userSchema);
const Poll = mongoose.model("Poll", pollSchema);

export { User, Poll };
