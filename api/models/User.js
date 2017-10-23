/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var bcrypt = require('bcrypt');

module.exports = {


	attributes: {

		username: {
			type: 'string',
			required: true,
			unique: true
		},
		password: {
			type: 'string',
			required: true
    },
    likedBy: {
      type: 'array'
		},
		likes: {
      type: 'array'
    },
		toJSON: function () {
			var obj = this.toObject();
			delete obj.password;
			delete obj.likes;
			if(!obj.likedBy){
				obj.numberOfLikes =0;
			}
			else{
			obj.numberOfLikes = obj.likedBy.length;
			}
			delete obj.likedBy;
			return obj;
		}		
	},
	beforeCreate: function (values, next) {
		bcrypt.genSalt(10, function (err, salt) {
			if (err) return next(err);
			bcrypt.hash(values.password, salt, function (err, hash) {
				if (err) return next(err);
				values.likedBy = [];
				values.likes = [];
        values.password = hash;
				next();
			})
		})
	},
	comparePassword: async function (password, user) {
		return await bcrypt.compare(password, user.password);
  },
  encryptPassword: async function (password) {
    var salt  = await bcrypt.genSalt(10);
    var hash = await  bcrypt.hash(password, salt);
    return hash;
	},
};

