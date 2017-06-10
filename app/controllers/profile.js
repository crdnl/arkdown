const User = require("../models/User");
const Content = require("../models/Content");

module.exports.index = (req, res) => {
	if (req.user) {
		res.redirect(`/user/${req.user.name}/`);
	} else {
		req.flash("error", { msg: "A username is required to view a profile" });
		res.redirect("/");
	}
};

module.exports.getProfile = (req, res) => {
	res.send(200);
};

module.exports.getContent = (req, res) => {
	User.findOne({ name: req.params.name }, (userErr, user) => {
		if (userErr) {
			req.flash("error", { msg: "An error occured while getting the user's content" });
			return res.redirect("/");
		}

		if (user === null) {
			req.flash("error", { msg: "That user doesn't exist! You sent me on a wild goose chase!" });
			return res.redirect("/");
		}

		Content.paginate({ owner: req.params.name }, { page: req.params.page, limit: 20, sort: "-updated" }, (err, results) => {
			if (req.accepts("html")) {
				return res.render("content/page", {
					title: `${req.params.name}'s Content`,
					results,
					base: `user/${req.params.name}`
				});
			}

			if (req.accepts("json")) {
				return res.send(results);
			}
		});
	});
};

module.exports.getLiked = (req, res) => {
	User.findOne({ name: req.params.name }, (userErr, user) => {
		if (userErr) {
			req.flash("error", { msg: "An error occured while getting the user's content" });
			return res.redirect("/");
		}

		if (user === null) {
			req.flash("error", { msg: "That user doesn't exist! You sent me on a wild goose chase!" });
			return res.redirect("/");
		}

		Content.paginate({ name: { $in: user.liked } }, { page: req.params.page, limit: 20, sort: "-updated" }, (err, results) => {
			if (req.accepts("html")) {
				console.log(results);
				return res.render("content/page", {
					title: `${req.params.name}'s Content`,
					results,
					base: `user/${req.params.name}`
				});
			}

			if (req.accepts("json")) {
				return res.send(results);
			}
		});
	});
};
