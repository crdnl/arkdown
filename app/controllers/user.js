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
}


/**
 * GET
 * /user/login
 * Login Page
 */
exports.getLogin = (req, res) => {
	if (req.user) {
		req.flash("info", "You're already logged in!")
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
		console.log(errors);
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
			req.redirect(req.session.returnTo || "/");
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

	});
};
