/**
 * GET
 * /
 * Index Route
 */

module.exports.index = (req, res) => {
	res.render("index", { title: "Home" });
};
