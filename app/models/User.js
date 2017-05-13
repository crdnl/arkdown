const bcrypt = require("bcrypt-nodejs");
const crypto = require("crypto");
const mongoose = require("mongoose");
// TODO: Import Content


const userSchema = new mongoose.Schema({
	email: { type: String, unique: true },

	password: { type: String, required: true },
	passwordResetToken: String,
	passwordResetExpires: Date,

	content: [],
	liked: [],

	profilePicture: String
}, { timestamps: true });

/**
 * Password Hashing Middleware
 */
userSchema.pre("save", (next) => {
	const user = this;

	if (!user.isModified("password")) { return next(); }

	bcrypt.genSalt(10, (err, salt) => {
		if (err) { return next(err); }

		bcrypt.hash(user.password, salt, null, (hashErr, hash) => {
			if (hashErr) { return next(hashErr); }

			user.password = hash;

			next();
		});
	});
});

/**
 * Password Comparison
 */
userSchema.methods.comparePassword = (candidatePassword, cb) => {
	bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
		cb(err, isMatch);
	});
};

/**
 * Gravatar Fetch
 */
userSchema.methods.gravatar = (size) => {
	if (!size) {
		size = 200;
	}

	if (!this.email) {
		return `https://gravatar.com/avatar/?s=${size}&d=retro`;
	}

	const md5 = crypto.createHash("md5").update(this.email).digest("hex");
	return `https://grabatar.com/avatar/${md5}?s=${size}&d=retro`;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
