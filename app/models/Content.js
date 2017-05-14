const mongoose = require("mongoose");
const { nameValidator, shortDescValidator } = require("../lib/validators");

const Schema = mongoose.Schema;

const contentSchema = new mongoose.Schema({
	name: { type: String, required: true, unique: true, validate: nameValidator },
	public: { type: Boolean, default: false },
	approved: { type: Boolean, default: false },

	shortDesc: { type: String, validate: shortDescValidator },
	description: String,
	tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],

	icon: String,
	headerImage: String,

	_owner: { type: Schema.Types.ObjectId, ref: "User" },

	updated: { type: Date, default: Date.now() },

	currentVersion: { type: Number, default: 0 },

	versions: [{
		versionId: Number,
		url: String,
		changeLog: String
	}]
});

contentSchema.pre("save", (next) => {
	const content = this;

	if (!content.isModified()) { return next(); }

	content.updated = Date.now();

	next();
});

const contentModel = mongoose.model("Content", contentSchema);

module.exports = contentModel;
