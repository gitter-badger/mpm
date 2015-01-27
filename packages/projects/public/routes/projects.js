'use strict';

//Setting up route
angular.module('mean.projects').config(['$stateProvider',
  function($stateProvider) {
    // Check if the user is connected
    var checkLoggedin = function($q, $timeout, $http, $location) {
      // Initialize a new promise
      var deferred = $q.defer();

      // Make an AJAX call to check if the user is logged in
      $http.get('/loggedin').success(function(user) {
        // Authenticated
        if (user !== '0') $timeout(deferred.resolve);

        // Not Authenticated
        else {
          $timeout(deferred.reject);
          $location.url('/login');
        }
      });

      return deferred.promise;
    };

    // states for my app
    $stateProvider
    .state('browse projects', {
        url: '/projects',
        templateUrl: 'projects/views/list.html',
        resolve: {
          loggedin: checkLoggedin
        }
      })
      .state('assigned projects', {
        url: '/my-projects/assigned',
        templateUrl: 'projects/views/my-projects/assigned.html',
        resolve: {
          loggedin: checkLoggedin
        }
      })
      .state('requested projects', {
        url: '/my-projects/requested',
        templateUrl: 'projects/views/my-projects/requested.html',
        resolve: {
          loggedin: checkLoggedin
        }
      })
      .state('project notifications', {
        url: '/my-projects/notifications',
        templateUrl: 'projects/views/my-projects/notifications.html',
        resolve: {
          loggedin: checkLoggedin
        }
      })
      .state('create project', {
        url: '/projects/create',
        templateUrl: 'projects/views/create.html',
        resolve: {
          loggedin: checkLoggedin
        }
      })
      .state('edit project', {
        url: '/projects/:projectId/edit',
        templateUrl: 'projects/views/edit.html',
        resolve: {
          loggedin: checkLoggedin
        }
      })
      .state('project by id', {
        url: '/projects/:projectId',
        templateUrl: 'projects/views/view.html',
        resolve: {
          loggedin: checkLoggedin
        }
      });
  }
]);
