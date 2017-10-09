"use strict";

var user = module.parent.require('./user'),
	meta = module.parent.require('./meta'),
	db = module.parent.require('./database'),
	winston = module.parent.require('winston'),
	async = module.parent.require('async'),

	controllers = require('./lib/controllers'),
	plugin = {};

plugin.init = function(params, callback) {
	callback();
};

plugin.list = function(data, callback) {
	user.getUserFields(data.uid, ['email', 'username'], function(err, userData) {
		data.pictures.push({
			type: 'mcavatar',
			url: getAvatarUrl(userData.email, userData.username),
			text: 'Minecraft Avatar'
		});

		callback(null, data);
	});
};

plugin.get = function(data, callback) {
	if (data.type === 'mcavatar') {
		user.getUserFields(data.uid, ['username'], function(err, userData) {
			data.picture = getAvatarUrl(userData.username);
			callback(null, data);
		});
	} else {
		callback(null, data);
	}
};

plugin.updateUser = function(data, callback) {
	if (plugin.settings.default === 'on') {
		winston.verbose('[plugin/gravatar] Updating uid ' + data.user.uid + ' to use gravatar');
		data.user.picture = getAvatarUrl(data.user.username);
		callback(null, data);
	} else {
		// No transformation
		callback(null, data);
	}
};

plugin.GetUsers = function(users, callback) {
		try {
			users.forEach(function(user) {
				if (user && typeof user.picture == 'object') {
					user.picture = getAvatarUrl(user.username);
				}
			});
		} catch(ex) {
			return callback(ex);
		}
		return callback(null, users);
	};

function getAvatarUrl(username) {
	var size = parseInt(meta.config.profileImageDimension, 10) || 128,
		baseUrl = 'https://minotar.net/avatar/' + username + '/'+size;
	return baseUrl;
};

module.exports = plugin;
