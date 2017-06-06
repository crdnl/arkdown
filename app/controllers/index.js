/**
 * GET
 * /
 * Index Route
 */

module.exports.index = (req, res) => {
	res.render("index", { title: "Home" });
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
