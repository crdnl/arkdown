const validate = require("mongoose-validator");

module.exports.nameValidator = [
	validate({
		validator: "isLength",
		arguments: [3, 50],
		message: "Name must be between {ARGS[0]} and {ARGS[1]} characters"
	}),
	validate({
		validator: "isAlphanumeric",
		passIfEmpty: false,
		message: "Name should contain alpha-numeric characters only"
	})
];

module.exports.shortDescValidator = [
	validate({
		validator: "isLength",
		arguments: [1, 140],
		message: "Short Descriptions should be less than {ARGS[1]} Characters"
	})
];
