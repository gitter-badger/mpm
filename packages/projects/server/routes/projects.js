'use strict';

var projects = require('../controllers/projects');

// Project authorization helpers
var hasAuthorization = function(req, res, next) {
  if (!req.user.isAdmin && req.project.user.id !== req.user.id) {
    return res.send(401, 'User is not authorized');
  }
  next();
};

module.exports = function(Projects, app, auth) {

  app.route('/projects')
    .get(projects.all)
    .post(auth.requiresLogin, projects.create);
  app.route('/projects/:projectId')
    .get(projects.show)
    .put(auth.requiresLogin, hasAuthorization, projects.update)
    .delete(auth.requiresLogin, hasAuthorization, projects.destroy);

  // Finish with setting up the projectId param
  app.param('projectId', projects.project);
};
