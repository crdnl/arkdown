const Content = require("../models/Content");

/**
 * GET
 * /
 * Index Route
 */
module.exports.index = (req, res) => {
	Content.find({}).sort({ updated: "desc" }).limit(3).exec((newestErr, newest) => {
		if (newestErr) { return res.send(500); }

		res.render("index", {
			title: "Home",
			newest
		});
	});
};

module.exports.error = (req, res) => {
	req.flash("error", "NoooooO!");
	res.redirect("/");
};

module.exports.info = (req, res) => {
	req.flash("info", "Such information! Wow!");
	res.redirect("/");
};

module.exports.success = (req, res) => {
	req.flash("success", "Woo! You did it! Amazing!");
	res.redirect("/");
};
