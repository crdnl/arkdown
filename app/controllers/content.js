const config = require("../../config/config.json");
const Content = require("../models/Content");
const md = require("jstransformer")(require("jstransformer-markdown-it"));
const algolia = require("algoliasearch")(config.algolia.applicationID, config.algolia.api_key);
const { getVersion } = require("../lib/helpers");

const index = algolia.initIndex("content");

exports.contentIndex = (req, res) => {
	res.redirect("/content/top/1");
};

exports.getDownload = (req, res) => {
	req.assert("version", "Version must be an integer").isInt();

	const errors = req.validationErrors();

	if (errors) {
		req.flash("error", errors);
		return res.redirect("/");
	}

	Content.findOne({ name: req.params.name }, (contentErr, content) => {
		if (contentErr || content === null) {
			console.log(contentErr);
			console.log(content);
			req.flash("error", { msg: "There was an error loading the content article." });
			return res.redirect("/");
		}

		getVersion(content.versions, parseInt(req.params.version, 10), (version) => {
			console.log(version);
			if (version === null) {
				req.flash("error", { msg: "The version specifified doesn't exist!" });
				return res.redirect(`/content/details/${req.params.name}`);
			}

			res.redirect(version.url);

			content.downloads += 1;
			content.save();
		});
	});
};

exports.getDetails = (req, res) => {
	Content.findOne({ name: req.params.name }, (contentErr, content) => {
		if (contentErr || content === null) {
			console.log(contentErr);
			console.log(content);
			req.flash("error", { msg: "There was an error loading that content article" });
			return res.redirect("/");
		}

		content.versions.sort((v1, v2) => v2.versionId - v1.versionId);

		if (req.accepts("html")) {
			return res.render("content/details", {
				title: content.name,
				content,
				description: md.render(content.description).body
			});
		}

		if (req.accepts("json")) {
			res.send(content);
		}
	});
};

exports.getLike = (req, res, next) => {
	const favIndex = req.user.liked.indexOf(req.params.name);

	if (favIndex > -1) {
		req.user.liked.splice(index, 1);
		req.user.save((err) => {
			if (err) {
				return next(err);
			}

			res.redirect(`/content/details/${req.params.name}`);
			return next();
		});
	} else {
		Content.findOne({ name: req.params.name }, (existsErr, content) => {
			if (existsErr) {
				return next(existsErr);
			}

			if (content == null) {
				req.flash("error", { msg: "The content you tried to like doesn't exist! " });
				res.redirect("/");
				return next();
			}

			req.user.liked.push(req.params.name);
			req.user.save((err) => {
				if (err) {
					return next(err);
				}
				res.redirect(`/content/details/${req.params.name}`);
			});
		});
	}
};

exports.getNew = (req, res) => {
	Content.paginate({}, { page: req.params.page || 1, limit: 20, sort: "-updated" }, (err, results) => {
		if (req.accepts("html")) {
			return res.render("content/page", {
				title: "Top Content",
				results,
				base: "content/top"
			});
		}


		if (req.accepts("json")) {
			return res.send(results);
		}
	});
};

exports.getTop = (req, res) => {
	Content.paginate({}, { page: req.params.page || 1, limit: 20, sort: "-downloads" }, (err, results) => {
		if (req.accepts("html")) {
			return res.render("content/page", {
				title: "Top Content",
				results,
				base: "content/top"
			});
		}


		if (req.accepts("json")) {
			return res.send(results);
		}
	});
};

exports.getAdd = (req, res) => {
	res.render("content/add", {
		title: "Add Content"
	});
};

exports.postAdd = (req, res, next) => {
	req.body.visibility = req.body.visibility === "on";

	req.assert("name", "Name must be at least 4 characters.").len(4);
	req.assert("shortDesc", "The Short Description must be between 10 and 140 characters").isLength({ min: 10, max: 140 });
	req.assert("description", "Description must be between 10 and 5000 characters").isLength({ min: 10, max: 5000 });
	req.assert("headerImage", "Header Image is invalid").matches(/^https?:\/\/(\w+\.)?imgur.com\/(\w*\d\w*)+(\.[a-zA-Z]{3})?$/);
	req.assert("visibility", "Visibility is somehow not a boolean value.... WTF you doin bruh?").isBoolean();

	req.sanitize("shortDesc").escape();

	req.body.headerImage = req.body.headerImage.replace(/^http:\/\//i, "https://");

	const errors = req.validationErrors();

	if (errors) {
		req.flash("error", errors);
		return res.redirect("/content/add");
	}

	const newDoc = {
		name: req.body.name,
		public: req.body.visibility,
		shortDesc: req.body.shortDesc,
		description: req.body.description,
		headerImage: req.body.headerImage,
		owner: req.user.name,
		downloads: 0
	};

	const content = new Content(newDoc);

	index.addObject(newDoc, (err) => {
		if (err) {
			console.error(err);
		}
	});

	Content.findOne({ name: req.body.name }, (nameErr, existingName) => {
		if (nameErr) { return next(nameErr); }

		if (existingName) {
			req.flash("error", { msg: "Something with that name already exists! ;( " });
			return res.redirect("/content/add");
		}

		content.save((contentErr) => {
			if (contentErr) { return next(contentErr); }
			return res.redirect(`/content/details/${req.body.name}/`);
		});
	});
};
