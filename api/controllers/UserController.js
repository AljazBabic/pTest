/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var helper = require('../services/helper');
var internalError = 'Internal server Error!';
module.exports = {
	find: function (req, res) { return res.notFound(); },
	findOne: function (req, res) { return res.notFound(); },
	create: function (req, res) { return res.notFound(); },
	update: function (req, res) { return res.notFound(); },
	destroy: function (req, res) { return res.notFound(); },
	signup: async function (req, res) {
		sails.log.info("Signup invoked for username: ", req.param('username'));
		try {
			if (!req.param('username')) {
				sails.log.error("Bad request: username required");
				return res.badRequest("Username required")
			}
			if (!req.param('password')) {
				sails.log.error("Bad request: password required");
				return res.badRequest("Password required.")
			}

			var user = {
				username: req.param('username'),
				password: req.param('password')
			};
			var createdUser = await User.create(user);

			sails.log.info("Signup finished for username: ", req.param('username'));
			return res.created(createdUser);
		}
		catch (err) {
			if (err.invalidAttributes.username) {
				sails.log.error("Username already in use: ", req.param('username'));
				return res.conflict('username');
			}
			sails.log.error(err);
			return res.serverError(internalError);
		}
	},
	login: async function (req, res) {
		try {
			sails.log.info("Login invoked for username: ", req.param('username'));

			if (!req.param('username')) {
				sails.log.error("Bad request: username required");
				return res.badRequest("Username required")
			}
			if (!req.param('password')) {
				sails.log.error("Bad request: password required");
				return res.badRequest("Password required.")
			}

			var user = await helper.getUserbyUsername(req.param('username'));
			if (!user) {
				sails.log.error("Username %s does not exist in the system.", req.param('username'));
				return res.notFound();
			}

			var passwordCorrect = await User.comparePassword(req.param('password'), user)
			if (!passwordCorrect) {
				sails.log.error("Password incorrect for username: ", req.param('username'));
				return res.invalidParameter('password');
			}
			sails.log.info("Login finished for username: ", req.param('username'));
			return res.ok({ user: user, token: jwToken.issue({ id: user.id }) });
		}
		catch (err) {
			sails.log.error(err);
			return res.serverError(internalError);
		}
	},
	me: async function (req, res) {
		try {
			sails.log.info("Me invoked for id: ", req.token.id);

			var user = await helper.getUser(req.token.id);
			if (!user) {
				sails.log.info("No user with id: ", req.token.id);
				return res.notFound();
			}

			sails.log.info("Me finished for id: ", req.token.id);
			return res.ok(user);
		}
		catch (err) {
			sails.log.error(err);
			return res.serverError(internalError);
		}
	},
	updatePassword: async function (req, res) {
		try {
			sails.log.info("Update password invoked for id: ", req.token.id);

			if (!req.param('newPassword')) {
				sails.log.error("Bad request: newPassword required");
				return res.badRequest("newPassword required")
			}
			if (!req.param('password')) {
				sails.log.error("Bad request: password required");
				return res.badRequest("Password required.")
			}

			var user = await helper.getUser(req.token.id);
			if (!user) {
				sails.log.info("No user with id: ", req.token.id);
				return res.notFound();
			}


			var passwordValid = await User.comparePassword(req.param('password'), user)
			if (!passwordValid) {
				sails.log.error("Password inccorect.");
				return res.invalidParameter('password');
			}

			var newPassword = await User.encryptPassword(req.param('newPassword'))
			var updateUser = {
				password: newPassword
			}
			var updatedUser = await User.update(
				{
					id: req.token.id
				},
				updateUser)

			sails.log.info("Update password finished for id: ", req.token.id);
			return res.ok(user);
		}
		catch (err) {
			sails.log.error(err);
			return res.serverError(internalError);
		}
	},
	getUserInfo: async function (req, res) {
		try {
			sails.log.info("Get user info invoked for id: ", req.param('id'));

			var user = await helper.getUser(req.param('id'));
			if (!user) {
				sails.log.info("No user with id: ", req.token.id);
				return res.notFound();
			}
			sails.log.info("Get user info finished for id: ", req.param('id'));
			return res.ok(user);
		}
		catch (err) {
			sails.log.error(err);
			return res.serverError(internalError);
		}
	},
}