/**
* LikeController
*
* @description :: Server-side logic for managing likes
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
*/
var helper = require('../services/helper');
var internalError = 'Internal server Error!';
module.exports = {
	likeUser: async function (req, res) {
		try {
			sails.log.info("Like user invoked for id: %s, actionUser: %s ", req.param('id'), req.token.id);

			if (req.param('id') == req.token.id) {
				sails.log.error("User cannot like himself. Id: ", req.param('id'));
				return res.conflict("likeItself");
			}

			var user = await helper.getUser(req.param('id'));
			if (!user) {
				sails.log.info("No user with id: ", req.param('id'));
				return res.notFound("User that you are trying to like does not exist.");
			}

			var actionUser = await helper.getUser(req.token.id);
			if (!actionUser) {
				sails.log.info("No user with id: ", req.token.id);
				return res.notFound();
			}

			var like = await likeIfNotLiked(user, actionUser);

			sails.log.info("Like user finished for id: %s, actionUser: %s ", req.param('id'), req.token.id);
			return res.created(like);
		}
		catch (err) {
			sails.log.error(err);
			return res.serverError(internalError);
		}
	},
	unlikeUser: async function (req, res) {
		try {
			sails.log.info("Unlike user invoked for id: %s, actionUser: %s ", req.param('id'), req.token.id);

			if (req.param('id') == req.token.id) {
				sails.log.error("User cannot unlike himself. Id: ", req.param('id'));
				return res.conflict("unlikeItself");
			}

			var user = await helper.getUser(req.param('id'));
			if (!user) {
				sails.log.info("No user with id: ", req.param('id'));
				return res.notFound("User that you are trying to like does not exist.");
			}

			var actionUser = await helper.getUser(req.token.id);
			if (!actionUser) {
				sails.log.info("No user with id: ", req.token.id);
				return res.notFound();
			}

			var like = await unlikeIfLiked(user, actionUser);

			sails.log.info("Unlike user finished for id: %s, actionUser: %s ", req.param('id'), req.token.id);
			return res.ok(like);
		}
		catch (err) {
			sails.log.error(err);
			return res.serverError(internalError);
		}
	},
	mostLikedUsers: function (req, res) {
		sails.log.info("Most liked users invoked");

		User.native(function (err, collection) {
			if (err) {
				sails.log.error(err);
				return res.serverError(internalError);
			}

			collection.aggregate([
				{
					$project: {
						item: 1,
						numberOfLikes: { $size: { "$ifNull": ["$likedBy", []] } },

					}
				},
				{
					$sort: { numberOfLikes: -1 }
				},
				{
					$limit: 100
				}
			]).toArray(function (err, results) {
				if (err) {
					sails.log.error(err);
					return res.serverError(internalError);
				}
				return res.ok(results);
			});
		});

		sails.log.info("Most liked users finished");
	}
};
async function likeIfNotLiked(userToBeLiked, actionUser) {
	try {
		if (!userToBeLiked.likedBy)
			userToBeLiked.likedBy = [];

		if (userToBeLiked.likedBy.indexOf(actionUser.id) > -1) { //check if user is already liked by actionUser.
			return userToBeLiked
		}

		userToBeLiked.likedBy.push(actionUser.id);
		var likeResult = await User.update({ id: userToBeLiked.id }, userToBeLiked);

		if (!actionUser.likes)
			actionUser.likes = [];

		if (!actionUser.likes.indexOf(userToBeLiked.id) > -1) {
			actionUser.likes.push(userToBeLiked.id);
			User.update({ id: actionUser.id }, actionUser);
		}
		return likeResult;
	}
	catch (err) {
		throw err;
	}
}

async function unlikeIfLiked(userToBeUnliked, actionUser) {
	try {
		if (!userToBeUnliked.likedBy)
			userToBeUnliked.likedBy = [];

		var index = userToBeUnliked.likedBy.indexOf(actionUser.id);

		if (!(index > -1)) { //check if user is liked by actionUser.
			return userToBeUnliked
		}

		userToBeUnliked.likedBy.splice(index, 1);
		var likeResult = await User.update({ id: userToBeUnliked.id }, userToBeUnliked);

		if (!actionUser.likes)
			actionUser.likes = [];

		index = actionUser.likes.indexOf(userToBeUnliked.id);
		if (index > -1) {
			actionUser.likes.splice(index, 1);
			User.update({ id: actionUser.id }, actionUser);
		}
		return likeResult;
	}
	catch (err) {
		throw err;
	}
}