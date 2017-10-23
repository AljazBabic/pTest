module.exports = function conflict(attribute) {
	var res = this.res
	switch (attribute) {
		case 'username':
			return res.send(409, "Username is already taken by another user.");
			break;
		case 'likeItself':
			return res.send(409, "Username cannot like himself.");
			break;
		case 'unlikeItself':
			return res.send(409, "Username cannot unlike himself.");
			break;
	}
}