const chai = require("chai");
const dirtyChai = require("dirty-chai");
const sinon = require("sinon");
require("sinon-mongoose");

const expect = chai.expect;

// Because ESLint doesn't like expect
chai.use(dirtyChai);

// User Model
const User = require("../models/User");

describe("User Model", () => {
	it("should create a new user", (done) => {
		// Create a Mock User
		const UserMock = sinon.mock(new User(
			{
				name: "testDemo",
				email: "spam@example.com",
				password: "toor"
			}
		));

		// Object from UserMock
		const user = UserMock.object;

		UserMock
			.expects("save")
			.yields(null);

		user.save((err) => {
			UserMock.verify();
			UserMock.restore();

			expect(err).to.be.null("Error when creating User");

			done();
		});
	});

	it("should return error if user is not created", (done) => {
		// Create a Mock User
		const UserMock = sinon.mock(new User(
			{
				name: "testDemo",
				email: "spam@example.com",
				password: "toor"
			}
		));

		// Object from UserMock
		const user = UserMock.object;

		const expectedError = {
			name: "ValidationError"
		};

		UserMock
			.expects("save")
			.yields(expectedError);

		user.save((err, result) => {
			UserMock.verify();
			UserMock.restore();

			expect(err.name).to.equal("ValidationError");
			expect(result).to.be.undefined();

			done();
		});
	});

	it("should not create a user with the unique email", (done) => {
		// Create a Mock User
		const UserMock = sinon.mock(new User(
			{
				name: "testDamo",
				email: "spam@example.com",
				password: "toor"
			}
		));

		// Object from UserMock
		const user = UserMock.object;

		const expectedError = {
			name: "MongoError",
			code: 11000
		};

		UserMock
			.expects("save")
			.yields(expectedError);

		user.save((err, result) => {
			UserMock.verify();
			UserMock.restore();

			expect(err.name).to.equal("MongoError");
			expect(err.code).to.equal(11000);
			expect(result).to.be.undefined();

			done();
		});
	});

	it("should not create a user with the unique name", (done) => {
		// Create a Mock User
		const UserMock = sinon.mock(new User(
			{
				name: "testDemo",
				email: "spam@exemple.com",
				password: "toor"
			}
		));

		// Object from UserMock
		const user = UserMock.object;

		const expectedError = {
			name: "MongoError",
			code: 11000
		};

		UserMock
			.expects("save")
			.yields(expectedError);

		user.save((err, result) => {
			UserMock.verify();
			UserMock.restore();

			expect(err.name).to.equal("MongoError");
			expect(err.code).to.equal(11000);
			expect(result).to.be.undefined();

			done();
		});
	});

	it("should find user by email", (done) => {
		// Blank User Mock
		const userMock = sinon.mock(User);

		const expectedUser = {
			_id: "5700a128bd97c1341d8fb365",
			name: "testDemo",
			email: "spam@example.com"
		};

		userMock
			.expects("findOne")
			.withArgs({ email: "spam@example.com" })
			.yields(null, expectedUser);

		User.findOne({ email: "spam@example.com" }, (err, result) => {
			userMock.verify();
			userMock.restore();

			expect(result.email).to.equal("spam@example.com");

			done();
		});
	});

	it("should find user by name", (done) => {
		// Blank User Mock
		const userMock = sinon.mock(User);

		const expectedUser = {
			_id: "5700a128bd97c1341d8fb365",
			name: "testDemo",
			email: "spam@example.com"
		};

		userMock
			.expects("findOne")
			.withArgs({ name: "testDemo" })
			.yields(null, expectedUser);

		User.findOne({ name: "testDemo" }, (err, result) => {
			userMock.verify();
			userMock.restore();

			expect(result.name).to.equal("testDemo");

			done();
		});
	});

	it("should remove user by email", (done) => {
		const userMock = sinon.mock(User);

		const expectedResult = {
			nRemoved: 1
		};

		userMock
			.expects("remove")
			.withArgs({ email: "spam@example.com" })
			.yields(null, expectedResult);

		User.remove({ email: "spam@example.com" }, (err, result) => {
			userMock.verify();
			userMock.restore();

			expect(err).to.be.null();
			expect(result.nRemoved).to.equal(1);

			done();
		});
	});
});
