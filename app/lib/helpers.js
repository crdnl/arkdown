module.exports.getVersion = (versions, versionId, cb) => {
	console.log(versions);
	console.log(versionId);

	let retVersion = null;

	versions.forEach((version) => {
		console.log(version);
		console.log(versionId);
		if (version.versionId === versionId) {
			retVersion = version;
		}
	});

	return cb(retVersion);
};
