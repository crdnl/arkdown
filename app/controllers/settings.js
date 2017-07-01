const User = require("../models/User");
const Content = require("../models/Content");

module.exports.getSettings = (req, res) => {
	res.render("user/settings", {
		title: "User Setttings"
	});
};

module.exports.getDelete = (req, res) => {
	res.render("user/delete", {
		title: "Delete User"
	});
};

module.exports.postInfo = (req, res) => {
	req.assert("profileImage", "Header Image is invalid").matches(/^https?:\/\/(\w+\.)?imgur.com\/(\w*\d\w*)+(\.[a-zA-Z]{3})?$/);

	const errors = req.validationErrors();

	if (errors) {
		req.flash("error", errors);
		return res.redirect("/user/settings");
	}

	req.body.profileImage = req.body.profileImage.replace(/^http:\/\//i, "https://");

	req.user.profileImage = req.body.profileImage;

	req.user.save((error) => {
		if (error) {
			req.flash("error", { msg: "There was an error updating the profile image." });
			return res.redirect("/user/settings");
		}
		req.flash("success", { msg: "Sick profile picture bro!" });
		return res.redirect("/user/settings");
	});
};

module.exports.postEmail = (req, res) => {
	req.assert("email", "Email is not valid").isEmail();
	req.assert("emailConfirm", "Emails do not match").equals(req.body.email);
	req.sanitize("email").normalizeEmail({ remove_dots: false });

	const errors = req.validationErrors();

	if (errors) {
		req.flash("error", errors);
		return res.redirect("/user/settings");
	}

	req.user.email = req.body.email;

	req.user.save((error) => {
		if (error) {
			req.flash("error", { msg: "There was an error updating your Email." });
			return res.redirect("/user/settings");
		}
		req.flash("success", "Your Email was successfully updated.");
		return res.redirect("/user/settings");
	});
};

module.exports.postPassword = (req, res) => {
	req.assert("password", "Password must be at least 4 characters long.").len(4);
	req.assert("passwordConfirm", "Passwords do not match").equals(req.body.password);

	const errors = req.validationErrors();

	if (errors) {
		req.flash("error", errors);
		return res.redirect("/user/settings");
	}

	req.user.password = req.body.password;

	req.user.save((error) => {
		if (error) {
			req.flash("error", { msg: "There was an error updating your password." });
			return res.redirect("/user/settings");
		}
		req.flash("success", { msg: "Your password was successfully updated." });
		return res.redirect("/user/settings");
	});
};

module.exports.postDelete = (req, res) => {
	req.assert("email", "Email is not valid.").isEmail();
	req.assert("password", "Password cannot be blank.").notEmpty();
	req.sanitize("email").normalizeEmail({ remove_dots: false });
	req.assert("email", "Email must match logged on user.").equals(req.user.email);

	const errors = req.validationErrors();

	if (errors) {
		req.flash("error", errors);
		return res.redirect("/user/login");
	}

	User.findOne({ email: req.user.email }, (err, user) => {
		user.comparePassword(req.body.password, user.password, (compareErr, isMatch) => {
			if (!isMatch || compareErr) {
				req.flash("error", { msg: "The password entered doesn't match!" });
				return res.redirect("/user/settings/delete");
			}

			Content.find({ owner: user.name }).remove().exec();

			req.logout();

			user.remove((userErr) => {
				if (userErr) {
					req.flash("err", { msg: "Something REALLY fucked up happened. Contact qmarchi ASAP!!" });
					return res.redirect("/");
				}

				req.flash("info", { msg: "It's all gone. Sad kitty is even more sad now." });
				res.redirect("/");
			});
		});
	});
};
