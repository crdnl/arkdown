const mongoose = require("mongoose");
const { shortDescValidator } = require("../lib/validators");

const Schema = mongoose.Schema;

const tagSchema = new mongoose.Schema({
	name: { type: String, unique: true },
	shortDesc: { type: String, validate: shortDescValidator },

	_content: [{ type: Schema.Types.ObjectId, ref: "Content" }]
});

const tagModel = mongoose.model("Tag", tagSchema);

module.exports = tagModel;
