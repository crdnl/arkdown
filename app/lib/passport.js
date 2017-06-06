const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("../models/User");

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	User.findById(id, (err, user) => {
		done(err, user);
	});
});

/**
 * Local Strategy
 */
passport.use(new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
	console.log("Local Called");
	User.findOne({ email: email.toLowerCase() }, (err, user) => {
		console.log("Local > FindOne Called")
		if (err) { return done(err); }
		if (!user) {
			return done(null, false, { msg: `Email ${email} not found` });
		}

		user.comparePassword(password, (compErr, isMatch) => {
			console.log("Local > FindOne > compare Called");
			if (compErr) { return done(err); }
			if (isMatch) {
				return done(null, user);
			}

			return done(null, false, { msg: "Invalid Email or Password" });
		});
	});
}));

/**
 * Validate Authentication
 */

module.exports.isAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect("/user/login");
};
