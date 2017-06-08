const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

const Schema = mongoose.Schema;

const contentSchema = new mongoose.Schema({
	name: { type: String, required: true, unique: true },
	public: { type: Boolean, default: false },
	approved: { type: Boolean, default: false },

	shortDesc: { type: String },
	description: String,
	tags: [String],

	headerImage: String,

	_owner: { type: Schema.Types.ObjectId, ref: "User" },

	updated: { type: Date, default: Date.now() },
	downloads: { type: Number, default: 0 },

	currentVersion: { type: Number, default: 0 },

	versions: [{
		versionId: Number,
		url: String,
		changeLog: String
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
