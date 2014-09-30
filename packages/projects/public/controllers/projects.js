'use strict';

angular.module('mean.projects').controller('ProjectsController', ['$scope', '$stateParams', '$location', 'Global', 'Projects', '$http',
  function($scope, $stateParams, $location, Global, Projects, $http) {
    $scope.global = Global;

    $http.get('/users/me').success(function(data){$scope.user = data;});

    $scope.hasAuthorization = function(project) {
      if (!project || !project.user) return false;
      return $scope.global.isAdmin || project.user._id === $scope.global.user._id;
    };

    $scope.create = function(isValid) {
      if (isValid) {
        var project = new Projects({
          nameFirst: this.nameFirst,
          nameLast: this.nameLast,
          department: this.department,
          email: this.email,
          costCenter: this.costCenter,
          additionalInfo: this.additionalInfo,
          shipping: this.shipping,
          attention: this.attention,
          address1: this.address1,
          address2: this.address2,
          city: this.city,
          state: this.State,
          zip: this.zip,
          country: this.country,
          requestType: this.requestType,
          projectName: this.projectName,
          projectDetails: this.projectDetails,
          projectAudience: this.projectAudience,
          projectMessage: this.projectMessage,
          completionDate: this.completionDate,
          departmentHeadApproving: this.departmentHeadApproving
        });
        project.$save(function(response) {
          $location.path('projects/' + response._id);
        });

        this.costCenter = '';
        this.email = '';
        this.department = '';
        this.nameFirst = '';
        this.nameLast = '';
        this.additionalInfo = '';
        this.attention = '';
        this.address1 = '';
        this.address2 = '';
        this.city = '';
        this.state = '';
        this.zip = '';
        this.projectName = '';
        this.projectDetails = '';
        this.projectAudience = '';
        this.projectMessage = '';
        this.completionDate = '';
        this.departmentHeadApproving = '';
      } else {
        $scope.submitted = true;
      }
    };

    $scope.remove = function(project) {
      if (project) {
        project.$remove();

        for (var i in $scope.projects) {
          if ($scope.projects[i] === project) {
            $scope.projects.splice(i, 1);
          }
        }
      } else {
        $scope.project.$remove(function(response) {
          $location.path('projects');
        });
      }
    };

    $scope.update = function(isValid) {
      if (isValid) {
        var project = $scope.project;
        if (!project.updated) {
          project.updated = [];
        }
        project.updated.push(new Date().getTime());

        project.$update(function() {
          $location.path('projects/' + project._id);
        });
      } else {
        $scope.submitted = true;
      }
    };

    $scope.find = function() {
      Projects.query(function(projects) {
        $scope.projects = projects;
      });
      Projects.query(function(projects) {
        $scope.assignedProjects = projects;
      });
    };

    $scope.findOne = function() {
      Projects.get({
        projectId: $stateParams.projectId
      }, function(project) {
        $scope.project = project;
      });
    };
  }
]);
