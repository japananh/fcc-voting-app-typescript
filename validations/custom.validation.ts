/* eslint-disable */
const password = (value: string, helpers: any): string => {
	if (value.length < 4) {
		return helpers.message("password must be at least 4 characters");
	}
	if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
		return helpers.message(
			"password must contain at least 1 letter and 1 number"
		);
	}
	return value;
};

export default password;
