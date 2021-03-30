$(document).ready(() => {
	const username = Cookies.get("username");
	const userId = Cookies.get("userId");

	if (username && userId) {
		$("#username").text(`, ${username}`);

		$("#navigation").append('<a href="/polls">My polls</a>');
		$("#navigation").append('<a href="/new-poll">New poll</a>');
		$("#navigation").append('<a href="/" id="logout">Log out</a>');

		$("#polls").append(' <a href="/new-poll">Create poll</a>');
	} else {
		$("#navigation").append('<a href="/login">Log in</a>');
		$("#navigation").append('<a href="/signup">Sign up</a>');
	}

	$("#logout").click((e) => {
		Cookies.remove("username");
		Cookies.remove("userId");
	});
});
