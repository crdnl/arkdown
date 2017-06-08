/**
 * Dependencies
 */
const express = require("express"); // Express Webserver
const compression = require("compression"); // Stream Compression
const session = require("express-session"); // Session System
const bodyParser = require("body-parser"); // POST Body Parser
const logger = require("morgan"); // Logging
const chalk = require("chalk"); // Colors
const lusca = require("lusca"); // CSRF Protection
const MongoStore = require("connect-mongo")(session); // MongoDB Session Store
const flash = require("express-flash"); // Neat Messages
const path = require("path"); // Filesystem Helpers
const mongoose = require("mongoose"); // MongoDB Driver
const passport = require("passport"); // Authentication and Authorization
const expressValidator = require("express-validator"); // Request Validation
const saas = require("node-sass-middleware"); // SAAS Compiler
const multer = require("multer"); // Multipart Uploader
const errorHandler = require("errorhandler");

/**
 * Set Directory for multipart uploads
 */
const upload = multer({ dest: path.join(__dirname, "temp") });

/**
 * Load Environment Variables from config/env for API keys and such.
 */
const config = require("../config/config.json");

/**
 * Contollers
 */
const indexController = require("./controllers/index");
const userController = require("./controllers/user");
const contentController = require("./controllers/content");
// const profileController = require("./controllers/profile");

/**
 * Passport Config and API Keys
 */
const passportConfig = require("./lib/passport");

const app = express();

/**
 * Initialize mongoose
 */
mongoose.Promise = global.Promise;
mongoose.connect(config.mongo.uri);
mongoose.connection.on("error", (err) => {
	console.error(err);
	console.log("%s MongoDB connection error. Please make sure MongoDB is running.", chalk.red("✗"));
	process.exit();
});

/**
 * Express Configuration
 */
app.set("port", process.env.PORT || 8757); // Listening Port
app.set("views", path.join(__dirname, "views")); // Template Location
app.set("view engine", "pug"); // Templating Engine
app.use(compression()); // Enable Response Compression
app.use(saas({ // Enable SAAS Compliation
	src: path.join(__dirname, "public"),
	dest: path.join(__dirname, "public")
}));
app.use(logger("dev")); // Enable Logging
app.use(bodyParser.json()); // Enable POST JSON Parsing
app.use(bodyParser.urlencoded({ extended: true })); // Enable POST URLEncoded Parsing
app.use(expressValidator()); // Request Validation
app.use(session({ // Enable Session Tracking
	resave: false, // MongoDB Supports `touch`
	saveUninitialized: true,
	secret: config.secret,
	cookie: { secure: false },
	store: new MongoStore({
		mongooseConnection: mongoose.connection
	})
}));
app.use(flash()); // Enable Message Flashes
app.use(passport.initialize()); // Initialize Passport
app.use(passport.session()); // Inject Passport Session
app.use((req, res, next) => { // Disable CSRF Checking on Image Upload
	if (req.path === "/image/upload") {
		next();
	} else {
		lusca.csrf()(req, res, next);
	}
});
app.use(lusca.xframe("SAMEORIGIN")); // Prevent iFrames from embedding site
app.use(lusca.xssProtection(true)); // XSS Mitigation
app.use((req, res, next) => {
	res.locals.user = req.user;
	next();
});
app.use((req, res, next) => { // After login, redirect back to page
	if (!req.user &&
		req.path !== "/user/login" &&
		req.path !== "/user/signup" &&
		!req.path.match(/^\/auth/) &&
		!req.path.match(/\./)
	) {
		req.session.returnTo = req.path;
	} else if (req.user && req.path === "/account") {
		req.session.returnTo = req.path;
	}

	next();
});
app.use(express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })); // Static Content
app.use(express.static(path.join(__dirname, "bower_components"), { maxAge: 31557600000 })); // Bower Content

/**
 * Index Routes
 */
app.route("/") // Index Route
	.get(indexController.index);
app.route("/error") // Error Test Route
	.get(indexController.error);
app.route("/info") // Info Test Route
	.get(indexController.info);
app.route("/success") // Success Test Route
	.get(indexController.success);

/**
 * Authentication Routes
 */
app.get("/user", userController.getIndex); // User Index Route
app.route("/user/login") // Login Route
	.get(userController.getLogin)
	.post(userController.postLogin);
app.route("/user/logout")
	.all(passportConfig.isAuthenticated)
	.get(userController.getLogout); // Logout Route
/* app.route("/user/forgot") // Forgot Password Route
	.get(userController.getForgot)
	.post(userController.postForgot);
app.route("/user/reset/:token") // Reset Password Route
	.get(userController.getReset)
	.post(userController.postReset);
*/
app.route("/user/signup") // Signup Route
	.get(userController.getSignup)
	.post(userController.postSignup);


/**
 * User Profile Routes
 */
/*
app.route("/user/:name") // Profile Route
	.get(profileController.getProfile)
	.post(profileController.postProfile);
app.route("/user/:name/content") // User Content
	.get(profileController.getContent);
app.route("/user/:name/liked") // Liked Content
	.get(profileController.getLiked);
*/

/**
 * User Settings Routes
 */
/*
app.route("/user/settings") // Settings Route
	.use(passportConfig.isAuthenticated)
	.get(userController.getAccount);
app.route("/user/settings/info") // Update Settings
	.use(passportConfig.isAuthenticated)
	.post(userController.postInfo);
app.route("/user/settings/password") // Update Password
	.use(passportConfig.isAuthenticated)
	.post(userController.postPassword);
app.route("/user/settings/deleted") // Delete Account
	.use(passportConfig.isAuthenticated)
	.post(userController.deleteUser)
*/

/**
 * Content Routes
 */

app.route("/content") // Top Content
	.get(contentController.contentIndex);
app.route("/content/top/:page?") // Top Content
	.get(contentController.getTop);
app.route("/content/new/:page?") // Newest Content
	.get(contentController.getNew);
app.route("/content/add") // Add Content
	.all(passportConfig.isAuthenticated)
	.get(contentController.getAdd)
	.post(contentController.postAdd);
app.route("/content/details/:name") // Content Details
	.get(contentController.getDetails);
// app.route("/content/details/:name/:version/download") // Download Content
//	.get(contentController.getDownload);

/**
 * Error Handler
 */
app.use(errorHandler());

/**
 * Start Express
 */
app.listen(app.get("port"), () => {
	console.log("%s EDShare is running on port %d.", chalk.green("✓"), app.get("port"));
});
