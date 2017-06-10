const User = require("../models/User");

module.exports.getSettings = (req, res) => {
	User.findOne({ name: req.user.name }, (userErr, user) => {
		if (userErr || user == null) {
			console.log(userErr);
			console.log(user);
			req.flash("error", { msg: "Umm... This is Embarassing... We couldn't find you...." });
			req.flash("error", { msg: "Please contact crdnl on GitHub" });
			return res.redirect("/");
		}

		res.render("user/settings", {
			title: "User Setttings",
			user
		});
	});
};

module.exports.getDelete = (req, res) => {
	res.send(200);
};

module.exports.postInfo = (req, res, next) => {
	res.send(200);
	next();
};

module.exports.postEmail = (req, res, next) => {
	res.send(200);
	next();
};

module.exports.postPassword = (req, res, next) => {
	res.send(200);
	next();
};

module.exports.postInfo = (req, res, next) => {
	res.send(200);
	next();
};

module.exports.postDelete = (req, res, next) => {
	res.send(200);
	next();
};
