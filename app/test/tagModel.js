const chai = require("chai");
const dirtyChai = require("dirty-chai");
const sinon = require("sinon");
require("sinon-mongoose");

const expect = chai.expect;

// Because ESLint doesn't like expect
chai.use(dirtyChai);

// User Model
const Tag = require("../models/Tag");

describe("Tag Model", () => {
	it("should create a new tag", (done) => {
		// Create a Mock Tag
		const tagMock = sinon.mock(new Tag({
			name: "TestTag",
			shortDesc: "A Tag for Testing"
		}));

		const tag = tagMock.object;

		tagMock
			.expects("save")
			.yields(null);

		tag.save((err) => {
			tagMock.verify();
			tagMock.restore();

			expect(err).to.be.null("Error when creating Tag");

			done();
		});
	});

	it("should return an error if user is not created", (done) => {
		// Create a Mock Tag
		const tagMock = sinon.mock(new Tag({
			name: "TestTag",
			shortDesc: "A Tag for Testing"
		}));

		const tag = tagMock.object;

		const expectedError = {
			name: "ValidationError"
		};

		tagMock
			.expects("save")
			.yields(expectedError);

		tag.save((err, result) => {
			tagMock.verify();
			tagMock.restore();

			expect(err.name).to.equal("ValidationError");
			expect(result).to.be.undefined();

			done();
		});
	});

	it("should not create a tag with the unique name", (done) => {
		// Create a Mock Tag
		const tagMock = sinon.mock(new Tag({
			name: "TestTag",
			shortDesc: "A Tag for Testing"
		}));

		const tag = tagMock.object;

		const expectedError = {
			name: "MongoError",
			code: 11000
		};

		tagMock
			.expects("save")
			.yields(expectedError);

		tag.save((err, result) => {
			tagMock.verify();
			tagMock.restore();

			expect(err.name).to.equal("MongoError");
			expect(err.code).to.equal(11000);
			expect(result).to.be.undefined();

			done();
		});
	});

	it("should remove tag by name", (done) => {
		const tagMock = sinon.mock(Tag);

		const expectedResult = {
			nRemoved: 1
		};

		tagMock
			.expects("remove")
			.withArgs({ name: "TestTag" })
			.yields(null, expectedResult);

		Tag.remove({ name: "TestTag" }, (err, result) => {
			tagMock.verify();
			tagMock.restore();

			expect(err).to.be.null();
			expect(result.nRemoved).to.equal(1);

			done();
		});
	});
});
