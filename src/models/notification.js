/**
      .                              .o8                     oooo
   .o8                             "888                     `888
 .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
   888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
   888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
   888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
   "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 ========================================================================
 Created:    02/10/2015
 Author:     Chris Brame

 **/

var async = require('async');
var mongoose = require('mongoose');
var _ = require('lodash');

var COLLECTION = "notification";

var notificationSchema = mongoose.Schema({
    created: {type: Date, default: Date.now},
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'accounts'},
    title: {type: String, required: true},
    message: {type: String, required: true},
    type: Number,
    data: Object,
    unread: {type: Boolean, default: true}
});

notificationSchema.methods.markRead = function(callback) {
    this.unread = false;

    return callback(null, true);
};

notificationSchema.statics.getNotification = function(id, callback) {
    if (_.isUndefined(id)) {
        return callback("Invalid ObjectId - NotificationSchema.GetNotification()", null);
    }

    return this.model(COLLECTION).findOne({_id: id}, callback);
};

notificationSchema.statics.findAllForUser = function(oId, callback) {
    if (_.isUndefined(oId)) {
        return callback("Invalid ObjectId - NotificationSchema.FindAllForUser()", null);
    }

    return this.model(COLLECTION).find({owner: oId}, callback);
};

notificationSchema.statics.getCount = function(oId, callback) {
    if (_.isUndefined(oId)) {
        return callback("Invalid ObjectId - NotificationSchema.GetCount()", null);
    }

    return this.model(COLLECTION).count({owner: oId}, callback);
};

notificationSchema.statics.getUnreadCount = function(oId, callback) {
    if (_.isUndefined(oId)) {
        return callback("Invalid ObjectId - NotificationSchema.GetUnreadCount()", null);
    }

    return this.model(COLLECTION).count({owner: oId, unread: true}, callback);
};

notificationSchema.statics.clearNotifications = function(oId, callback) {
    if (_.isUndefined(oId)) {
        return callback("Invalid UserId - NotificationSchema.ClearNotifications()", null);
    }

    return this.model(COLLECTION).remove({owner: oId}, callback);
};

module.exports = mongoose.model(COLLECTION, notificationSchema);
