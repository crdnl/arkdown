module.exports.getSettings = (req, res) => {
	res.render("user/settings", {
		title: "User Setttings"
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
