const callback = function(res) {
	if (res.success === true) {
		$('#headerImage').val(res.data.link);
		$('div.dropzone>p').text("Success!");
		$('div.dropzone').addClass("green");
		$('div.dropzone>p').addClass("white-text");
	}
};

new Imgur({
	clientid: "9c8b7013e018244",
	callback
});
