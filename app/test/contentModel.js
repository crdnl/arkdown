const chai = require("chai");
const dirtyChai = require("dirty-chai");
const sinon = require("sinon");
require("sinon-mongoose");

const expect = chai.expect;

// Because ESLint doesn't like expect
chai.use(dirtyChai);

// User Model
const Content = require("../models/Content");

// Helper
function genMock() {
	return sinon.mock(new Content({
		name: "TestContent",
		shortDesc: "A short description",
		description: "A description that is a bit longer than the shortDesc"
	}));
}

describe("Content Model", () => {
	it("should create new content", (done) => {
		// Create a Mock Content
		const contentMock = genMock();

		const content = contentMock.object;

		contentMock
			.expects("save")
			.yields(null);

		content.save((err) => {
			contentMock.verify();
			contentMock.restore();

			expect(err).to.be.null("Error when creating content");

			done();
		});
	});

	it("should return an error if user is not created", (done) => {
		// Create Mock Content
		const contentMock = genMock();

		const content = contentMock.object;

		const expectedError = {
			name: "ValidationError"
		};

		contentMock
			.expects("save")
			.yields(expectedError);

		content.save((err, result) => {
			contentMock.verify();
			contentMock.restore();

			expect(err.name).to.equal("ValidationError");
			expect(result).to.be.undefined();

			done();
		});
	});

	it("should not create a content with the unique name", (done) => {
		// Create Mock Content
		const contentMock = genMock();

		const content = contentMock.object;

		const expectedError = {
			name: "MongoError",
			code: 11000
		};

		contentMock
			.expects("save")
			.yields(expectedError);

		content.save((err, result) => {
			contentMock.verify();
			contentMock.restore();

			expect(err.name).to.equal("MongoError");
			expect(err.code).to.equal(11000);
			expect(result).to.be.undefined();

			done();
		});
	});

	// TODO: Add version to content

	it("should remove content by name", (done) => {
		const contentMock = sinon.mock(Content);

		const expectedResult = {
			nRemoved: 1
		};

		contentMock
			.expects("remove")
			.withArgs({ name: "TestContent" })
			.yields(null, expectedResult);

		Content.remove({ name: "TestContent" }, (err, result) => {
			contentMock.verify();
			contentMock.restore();

			expect(err).to.be.null();
			expect(result.nRemoved).to.equal(1);

			done();
		});
	});
});


