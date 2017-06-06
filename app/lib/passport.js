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
	User.findOne({ email: email.toLowerCase() }, (err, user) => {
		if (err) { return done(err); }
		if (!user) {
			return done(null, false, { msg: `Email ${email} not found` });
		}

		user.comparePassword(password, user.password, (compErr, isMatch) => {
			if (compErr) { return done(compErr); }
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

exports.isAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect("/user/login");
};
