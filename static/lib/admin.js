'use strict';
/* globals $, app, socket */

define('admin/plugins/minotar', ['settings'], function(Settings) {

	var ACP = {};

	ACP.init = function() {
		Settings.load('minotar', $('.minotar-settings'));

		$('#save').on('click', function() {
			Settings.save('minotar', $('.minotar-settings'), function() {
				app.alert({
					type: 'success',
					alert_id: 'minotar-saved',
					title: 'Settings Saved',
					message: 'Please reload your NodeBB to apply these settings',
					clickfn: function() {
						socket.emit('admin.reload');
					}
				});
			});
		});
	};

	return ACP;
});
