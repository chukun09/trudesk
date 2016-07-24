/**
    .                              .o8                     oooo
 . o8                             "888                     `888
.o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
  888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
  888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
  888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
  "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 ========================================================================
 Created:    07/22/2016
 Author:     Chris Brame

 **/

define('modules/socket.io/logs.io', [
    'jquery',
    'underscore',
    'moment',
    'modules/helpers',
    'history'

], function($, _, moment, helpers) {
    var logsIO = {};

    logsIO.getLogData = function(socket) {
        socket.on('logs:data', function(data) {
            var $sLogs = $('#serverlogs');
            if ($sLogs.length > 0) {
                $sLogs.append(data);
                $sLogs.scrollTop(99999999999999 * 999999999999999);
                helpers.scrollToBottom($sLogs);
            }
        });
    };

    return logsIO;
});
