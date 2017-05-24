const config = require("../../config/config");
const bluebird = require("bluebird");
const crypto = bluebird.promisifyAll(require("crypto"));
const Mailjet = require("node-mailjet").connect(config.mailjet.apikey, config.mailjet.secret);
const passport = require("passport");
const User = require("../models/User");


/**
 * MailJet Instance
 */
const mjinstance = Mailjet(config.mailjet.apikey, config.mailjet.secret, {
	secure: true,
	output: "json"
});

/**
 * GET /user/login
 * Login Page
 */
exports.getLogin = (req, res) => {
	if (req.user) {
		return res.redirect("/");
	}

	res.render("account/login", {
		title: "Login"
	});
};

/**
 * POST /user/login
 * Validate and Authenticate
 */
exports.postLogin = (req, res, next) => {
	req.assert("email", "Email is not valid").isEmail();
	req.assert("password", "Password cannot be blank").notEmpty();
	req.sanitize("email").normalizeEmail({ remove_dots: false });

	const errors = req.validationErrors();

	if (errors) {
		req.flash("errors", errors);
		return res.redirect("/user/login");
	}

	passport.authenticate("local", (err, user, info) => {
		if (err) { return next(err); }
		if (!user) {
			req.flash("errors", info);
			return res.redirect("/user/login");
		}

		req.logIn(user, (loginErr) => {
			if (loginErr) { return next(err); }
			req.flash("success", { msg: "Success! You're logged in!" });
			req.redirect(req.session.returnTo || "/");
		});
	});
};
