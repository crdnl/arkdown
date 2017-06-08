const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

const contentSchema = new mongoose.Schema({
	name: { type: String, required: true, unique: true },
	public: { type: Boolean, default: false },
	approved: { type: Boolean, default: false },

	shortDesc: { type: String },
	description: String,
	tags: [String],

	headerImage: String,

	owner: { type: String, required: true },

	updated: { type: Date, default: Date.now() },
	downloads: { type: Number, default: 0 },

	currentVersion: { type: Number, default: 0 },

	versions: [{
		versionId: Number,
		url: String,
		changelog: String
	}]
});

contentSchema.pre("save", function save(next) {
	const content = this;

	if (!content.isModified()) { return next(); }

	content.updated = Date.now();

	next();
});

contentSchema.plugin(mongoosePaginate);

const contentModel = mongoose.model("Content", contentSchema);

module.exports = contentModel;
