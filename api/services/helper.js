module.exports = {
    getUser: async function(userId) {
    try {
        var user = await User.findOne(
            {
                id: userId
            });
        return user;
    }
    catch (err) {
        throw err;
    }
},

getUserbyUsername: async function (username) {
    try {
        var user = await User.findOne(
            {
                username: username
            });
        return user;
    }
    catch (err) {
        throw err;
    }
}
}