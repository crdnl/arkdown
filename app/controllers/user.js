const config = require("../../config/config");
const bluebird = require("bluebird");
const crypto = bluebird.promisifyAll(require("crypto"));
const passport = require("passport");
const User = require("../models/User");

/**
 * GET
 * /user
 * User Index
 */
exports.getIndex = (req, res) => {
	res.redirect("/");
};


/**
 * GET
 * /user/login
 * Login Page
 */
exports.getLogin = (req, res) => {
	if (req.user) {
		req.flash("info", { msg: "You're already logged in!" });
		return res.redirect("/");
	}

	res.render("user/login", {
		title: "Login"
	});
};

/**
 * POST
 * /user/login
 * Validate and Authenticate
 */
exports.postLogin = (req, res, next) => {
	req.assert("email", "Email is not valid").isEmail();
	req.assert("password", "Password cannot be blank").notEmpty();
	req.sanitize("email").normalizeEmail({ remove_dots: false });

	const errors = req.validationErrors();
	if (errors) {
		req.flash("error", errors);
		return res.redirect("/user/login");
	}

	passport.authenticate("local", (err, user, info) => {
		if (err) { return next(err); }
		if (!user) {
			req.flash("error", info);
			return res.redirect("/user/login");
		}

		req.logIn(user, (loginErr) => {
			if (loginErr) { return next(err); }
			req.flash("success", { msg: "Success! You're logged in!" });
			res.redirect(req.session.returnTo || "/");
		});
	})(req, res, next);
};

/**
 * GET
 * /user/logout
 * Logout of the current session
 */
exports.getLogout = (req, res) => {
	req.logout();
	req.flash("success", { msg: "You've successfully logged out!" });
	res.redirect("/");
};

/**
 * GET
 * /user/signup
 * Signup Page
 */
exports.getSignup = (req, res) => {
	if (req.user) {
		req.flash("info", { msg: "You're already logged in!" });
		return res.redirect("/");
	}

	res.render("user/signup", {
		title: "Register"
	});
};

/**
 * POST
 * /user/register
 * Validate and Create User
 */
exports.postSignup = (req, res, next) => {
	req.assert("email", "Email is not valid").isEmail();
	req.assert("password", "Password mut be at least 4 characters long").len(4);
	req.assert("passwordConfirm", "Passwords do not match").equals(req.body.password);
	req.assert("name", "Username must not be atleast 4 characters").len(4);
	req.sanitize("email").normalizeEmail({ remove_dots: false });

	const errors = req.validationErrors();

	if (errors) {
		req.flash("error", errors);
		return res.redirect("/user/signup");
	}

	const user = new User({
		email: req.body.email,
		name: req.body.name,
		password: req.body.password
	});

	User.findOne({ email: req.body.email }, (emailErr, existingEmail) => {
		if (emailErr) { return next(emailErr); }

		if (existingEmail) {
			req.flash("error", { msg: "An account exists with that email" });
			return res.redirect("/user/signup");
		}

		User.findOne({ name: req.body.name }, (nameErr, existingName) => {
			if (nameErr) { return next(nameErr); }

			if (existingName) {
				req.flash("error", { msg: "An account exists with that username" });
				return res.redirect("/user/signup");
			}

			user.save((usrErr) => {
				if (usrErr) { return next(usrErr); }

				req.logIn(user, logErr => next(logErr));
				res.redirect("/");
			});
		});
	});
};
