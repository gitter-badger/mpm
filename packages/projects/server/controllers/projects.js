'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Project = mongoose.model('Project'),
  async = require('async'),
  config = require('meanio').loadConfig(),
  crypto = require('crypto'),
  nodemailer = require('nodemailer'),
  templates = require('../template'),
  _ = require('lodash');



/*
*
* Send Mail
*/
function sendMail(mailOptions) {
  var transport = nodemailer.createTransport(config.mailer);
  transport.sendMail(mailOptions, function(err, response) {
    if (err) return err;
    return response;
  });
}
/**
 * Find project by id
 */
exports.project = function(req, res, next, id) {
  Project.load(id, function(err, project) {
    if (err) return next(err);
    if (!project) return next(new Error('Failed to load project ' + id));
    req.project = project;
    next();
  });
};

/**
 * Create a project
 */
exports.create = function(req, res) {
  var project = new Project(req.body);
  for(var i = 0; i < project.notifications.length; i++){
    var notifications = project.notifications[i],
        mailOptions = {
          to: project.notifications[i].useremail,
          from: config.emailFrom
        };
    mailOptions = templates.project_notification_email(notifications, project, req, mailOptions);
    sendMail(mailOptions);
  };
  project.user = req.user;

  project.save(function(err) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot save the project'
      });
    }
    res.json(project);

  });
};

/**
 * Update a project
 */
exports.update = function(req, res) {
  var project = req.project;

  project = _.extend(project, req.body);

  project.save(function(err) {
    if (err) {
      return res.json(500, {
        error: 'Cannot update the project'
      });
    }
    res.json(project);

  });
};

/**
 * Delete a project
 */
exports.destroy = function(req, res) {
  var project = req.project;

  project.remove(function(err) {
    if (err) {
      return res.json(500, {
        error: 'Cannot delete the project'
      });
    }
    res.json(project);

  });
};

/**
 * Show a project
 */
exports.show = function(req, res) {
  res.json(req.project);
};

/**
 * List of Projects
 */
exports.all = function(req, res) {
  Project.find().sort('-created').populate('user', 'name username').exec(function(err, projects) {
    if (err) {
      return res.json(500, {
        error: 'Cannot list the projects'
      });
    }
    res.json(projects);

  });
};
