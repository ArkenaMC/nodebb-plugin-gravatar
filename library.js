"use strict";

var user = module.parent.require('./user'),
        meta = module.parent.require('./meta'),
        db = module.parent.require('./database'),
        winston = module.parent.require('winston'),
        async = module.parent.require('async'),

        controllers = require('./lib/controllers'),
        plugin = {};

plugin.init = function(params, callback) {
        var router = params.router,
                hostMiddleware = params.middleware,
                hostControllers = params.controllers;

        router.get('/admin/plugins/minotar', hostMiddleware.admin.buildHeader, controllers.renderAdminPage);
        router.get('/api/admin/plugins/minotar', controllers.renderAdminPage);

        meta.settings.get('minotar', function(err, settings) {
                if (err) {
                        winston.error('[plugin/gravatar] Could not retrieve plugin settings! Using defaults.');
                        plugin.settings = {
                                default: false,
                                force: false
                        };
                        return;
					}

                plugin.settings = settings;
        });

        callback();
};

plugin.addAdminNavigation = function(header, callback) {
        header.plugins.push({
                route: '/plugins/minotar',
                icon: 'fa-picture',
                name: 'Minotar'
        });

        callback(null, header);
};

plugin.list = function(data, callback) {
        user.getUserFields(data.uid, ['username'], function(err, userData) {
                data.pictures.push({
                        type: 'minotar',
                        url: getAvatarUrl(userData.username),
                        text: 'Minecraft Avatar'
                });

                callback(null, data);
        });
};

plugin.get = function(data, callback) {
        if (data.type === 'minotar') {
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
                winston.verbose('[plugin/minotar] Updating uid ' + data.user.uid + ' to use minotar');
                data.user.picture = getAvatarUrl(data.user.username);
                callback(null, data);
        } else {
                // No transformation
                callback(null, data);
        }
};

plugin.onForceEnabled = function(users, callback) {
        if (plugin.hasOwnProperty('settings') && plugin.settings.force === 'on') {
                async.map(users, function(userObj, next) {
                        if (!userObj) {
                                return next(null, userObj);
                        }
                                userObj.picture = getAvatarUrl(userObj.username);
                                next(null, userObj);
                }, callback);
        } else if (plugin.hasOwnProperty('settings') && plugin.settings.default === 'on') {
                async.map(users, function(userObj, next) {
                        if (!userObj) {
                                return next(null, userObj);
                        }

                        if (userObj.picture === '') {
                                        userObj.picture = getAvatarUrl(userObj.username);
                                        next(null, userObj);
                        } else {
                                setImmediate(next, null, userObj);
                        }
                }, callback);
        } else {
 				// No transformation
                callback(null, users);
        }
}

function getAvatarUrl(username) {
            var size = parseInt(meta.config.profileImageDimension, 10) || 128,
                baseUrl = 'https://minotar.net/avatar/' + username + '/'+size;
        return baseUrl;
};

module.exports = plugin;
