module.exports = function invalidParameter(err){
	var res = this.res
	switch(err)
	{
		case 'password':
			return res.send(400, "Incorrect password.")
			break;
	}
}