module.exports.getSettings = (req, res) => {
	res.render("user/settings", {
		title: "User Setttings"
	});
};

module.exports.getDelete = (req, res) => {
	res.send(200);
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
	res.send(200);
};
