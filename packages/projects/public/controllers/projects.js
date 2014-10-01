'use strict';

angular.module('mean.projects').controller('ProjectsController', ['$scope', '$stateParams', '$location', 'Global', 'Projects', '$http',
  function($scope, $stateParams, $location, Global, Projects, $http) {
    $scope.global = Global;

    $http.get('/users/me').success(function(data){$scope.user = data;});
    $http.get('/users').success(function(data){$scope.users = data;});

    $scope.requestedProjects = $scope.projects;

    $scope.hasAuthorization = function(project) {
      if (!project || !project.user) return false;
      return $scope.global.isAdmin || project.user._id === $scope.global.user._id;
    };

    $scope.create = function(isValid) {
      if (isValid) {

        var project = new Projects({
          name:{
            first: this.nameFirst,
            last: this.nameLast
          },
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

        //setup project notifications for users to accecpt assigned project
        var $notifications = [];
        for(var i in $scope.users) {
          if ($scope.users[i].department === this.requestType){
            $notifications.push({
              text: 'A new project has been assigned to you.', 
              userId: $scope.users[i]._id, 
              userName: $scope.users[i].name, status: 'pending'
            });
          } 
        }
        project.notifications = $notifications;

        project.$save(function(response) {
          $location.path('projects/' + response._id);

          $scope.project = project;

          var $theProject = {title: $scope.project.projectName, _id:response._id};

          //update user requested project
          $scope.user.projects.requested.push($theProject);
          $http.put('/users/me', {
              projects: {
                assigned: $scope.user.projects.assigned,
                requested: $scope.user.projects.requested
              }
          })
          .success(function(response){
            $scope.response = response;
          })
          .error(function(error){
            $scope.response = error;
          });

          
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

    $scope.accept = function(project){
      $scope.user.projects.assigned.push({title: project.projectName, _id: project._id});

      $http.put('/users/me', {
              projects: {
                assigned: $scope.user.projects.assigned,
                requested: $scope.user.projects.requested
              }
          })
          .success(function(response){
            $scope.response = response;

            for(var i in $scope.projectNotifications) {
              if($scope.projectNotifications[i]._id === project._id){
                $scope.projectNotifications.splice(i, 1);
              }
            }

            for(var x in project.notifications) {
              if(project.notifications[x].userId === $scope.user._id) {
                project.notifications[x].status = 'accepted';
                console.log(project.notifications);
                updateNotifications();
                $scope.projectsAssigned.push(project);
              }
            }


          })
          .error(function(error){
            $scope.response = error;
          });
      var updateNotifications = function(){
        $http.put('/projects/' + project._id, {
          notifications: project.notifications
        })
        .success(function(response){
          console.log(response);
        });
      };
    };

    $scope.remove = function(project) {
      if (project) {
        project.$remove();

        for (var i in $scope.projects) {
          if ($scope.projects[i] === project) {
            $scope.projects.splice(i, 1);
          }
        }
        for (var x in $scope.user.projects.requested) {
          if ($scope.user.projects.requested[x]._id === project._id) {
            $scope.user.projects.requested.splice(x, 1);

            $http.put('/users/me', {
              projects: {requested: $scope.user.projects.requested}
            });

          }
        }

        for (var y in $scope.user.projects.assigned) {
          if ($scope.user.projects.assigned[y]._id === project._id) {
            $scope.user.projects.assigned.splice(y, 1);

            $http.put('/users/me', {
              projects: {requested: $scope.user.projects.assigned}
            });

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
        $scope.projectsRequested = [];
        $scope.projectNotifications = [];
        $scope.projectsAssigned = [];

        //set requested projects to $scope.projectsRequested
        for(var i in $scope.user.projects.requested) {
          var reqId = $scope.user.projects.requested[i]._id;
          
          for(var x in $scope.projects) {
            if($scope.projects[x]._id === reqId){
              $scope.projectsRequested.push($scope.projects[x]);
            }
          
          }
        }

        //set requested projects to $scope.projectsRequested
        for(var c in $scope.user.projects.assigned) {
          var assId = $scope.user.projects.assigned[c]._id;
          
          for(var d in $scope.projects) {
            if($scope.projects[d]._id === assId){
              $scope.projectsAssigned.push($scope.projects[d]);
            }
          
          }
        }

        //create list of notifcations from projects for logged in user
        for(var y in $scope.projects) {
          for(var z in $scope.projects[y].notifications) {
            if($scope.projects[y].notifications[z].userId === $scope.user._id && $scope.projects[y].notifications[z].status === 'pending') {
              $scope.projectNotifications.push($scope.projects[y]);
            }
          }
        }




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
