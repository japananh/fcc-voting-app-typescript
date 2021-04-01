/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/**
 * A mongoose schema plugin which applies the following in the toJSON transform call:
 *  - removes __v and any path that has private: true
 *  - replaces _id with id
 */
const toJSON = (schema: any) => {
	let transform: any;
	if (schema.options.toJSON && schema.options.toJSON.transform) {
		transform = schema.options.toJSON.transform;
	}

	schema.options.toJSON = Object.assign(schema.options.toJSON || {}, {
		transform(doc: any, ret: any, options: any) {
			Object.keys(schema.paths).forEach((path) => {
				if (
					schema.paths[path].options &&
					schema.paths[path].options.private
				) {
					delete ret[path];
				}
			});

			ret.id = ret._id.toString();

			delete ret._id;
			delete ret.__v;

			if (transform) {
				return transform(doc, ret, options);
			}
		},
	});
};

export default toJSON;
