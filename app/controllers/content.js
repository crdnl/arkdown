const Content = require("../models/Content");
const User = require("../models/User");
const md = require("jstransformer")(require("jstransformer-markdown-it"));

exports.contentIndex = (req, res) => {
	res.redirect("/content/top/1");
};

exports.getDetails = (req, res) => {
	req.sanitize("name").escape();

	Content.findOne({ name: req.params.name }, (contentErr, content) => {
		if (contentErr || content === null) {
			console.log(contentErr);
			req.flash("error", { msg: "There was an error loading that content article" });
			return res.redirect("/");
		}

		User.findOne({ _id: content._owner }, { name: 1 }, (userErr, user) => {
			if (userErr || content === null) {
				console.log(userErr);
				req.flash("error", { msg: "There was an error loading that content article" });
				return res.redirect("/");
			}

			content.versions.sort((v1, v2) => { return v2.versionId - v1.versionId; });

			if (req.accepts("html")) {
				return res.render("content/details", {
					title: content.name,
					content,
					owner: user,
					description: md.render(content.description).body
				});
			}

			if (req.accepts("json")) {
				content._owner = user;
				res.send(content);
			}
		});
	});
};

exports.getNew = (req, res) => {
	Content.paginate({}, { page: req.params.page || 1, limit: 20, sort: "-updated" }, (err, results) => {
		if (req.accepts("html")) {
			return res.render("content/page", {
				title: "Top Content",
				results,
				base: "top"
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
				base: "top"
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

	req.sanitize("name").escape();
	req.sanitize("shortDesc").escape();

	const errors = req.validationErrors();

	if (errors) {
		req.flash("error", errors);
		return res.redirect("/content/add");
	}

	const content = new Content({
		name: req.body.name,
		public: req.body.visibility,
		shortDesc: req.body.shortDesc,
		description: req.body.description,
		headerImage: req.body.headerImage,
		_owner: req.user._id
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
