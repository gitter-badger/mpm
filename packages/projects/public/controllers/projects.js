'use strict';

angular.module('mean.projects').controller('ProjectsController', ['$scope', '$stateParams', '$location', 'Global', 'Projects', '$http',
  function($scope, $stateParams, $location, Global, Projects, $http) {
    /*jslint plusplus: true */
    $scope.global = Global;
    $scope.allProjectItems = {items: [], count: 0};

    $http.get('/users/me').success(function(data){$scope.user = data;});
    $http.get('/users').success(function(data){$scope.users = data;});

    $scope.hasAuthorization = function(project) {
      if (!project || !project.user) return false;
      return $scope.global.isAdmin || project.user._id === $scope.global.user._id;
    };

    $scope.hasItemAuth = function(project, item) {
      if (!project || !project.user) return false;
      var $itemHasUser = false;
      for(var x in item.users) {if($scope.global.user._id === item.users[x]._id) $itemHasUser = true;}
      return $scope.global.isAdmin || $itemHasUser;
    };

    $scope.hasFileAuth = function(file) {
      if(!file || !file.user) return false;
      if(file.user._id === $scope.global.user._id) return $scope.global.isAdmin || true;
    };

    $scope.alerts = [];

    $scope.removeAlertDuplicate = function(kind){
      for(var a in $scope.alerts){
        if($scope.alerts[a].kind === kind){
          $scope.alerts.splice([a], 1);
        }
      }
    };

    $scope.addAlert = function(type, message, kind) {
      $scope.removeAlertDuplicate(kind);
      $scope.alerts.push({type: type, msg: message, kind: kind});
    };

    $scope.closeAlert = function(index) {
      $scope.alerts.splice(index, 1);
    };

    $scope.projectProgress = function(project){
      var $allProgress = [],
          $totalprogress = 0,
          $count = 0;
      for(var i in project.items) {
        $count++;
        $totalprogress = $totalprogress + project.items[i].progress;
        $allProgress.push({item: project.items[i].subType, name: project.items[i].title, value: project.items[i].progress});
      }
      project.progresslength = $count * 100;
      project.progress = $totalprogress / $count;
      project.progresstotal = $totalprogress / $count;
    };

    $scope.progressUpdate = function(project, item){
      if(!$scope.hasItemAuth(project, item)) return false;
      console.log('updating ' + item.subType + ' progress');
    };


    $scope.create = function(isValid) {
      if($scope.allProjectItems.count === 0){
        $scope.addAlert('danger', 'You are required to submit at least one project Item!', 'no-items');
        return;
      }
      //add users to project items
      for(var x in $scope.allProjectItems.items) {
        var $itemUsers = [];
        for(var u in $scope.users) {
          if($scope.users[u].department === $scope.allProjectItems.items[x].itemType) {
            $itemUsers.push({_id: $scope.users[u]._id, username: $scope.users[u].username, status: 'pending'});
          }
        }
        $scope.allProjectItems.items[x].users = $itemUsers;
      }

      if (isValid) {
        var project = new Projects({
          general: {
              name:{
                first: $scope.user.name.first,
                last: $scope.user.name.last
              },
              department: $scope.user.department,
              email: $scope.user.email,
              costCenter: this.costCenter,
              additionalInfo: this.additionalInfo,
              projectName: this.projectName,
              projectDescription: this.projectDescription,
              completionDate: this.dt,
              departmentHeadApproving: this.departmentHeadApproving,
              projectAudience: this.projectAudience,
              projectMessage: this.projectMessage
          },
          items: $scope.allProjectItems.items
        });

        //load initial project progress
        $scope.projectProgress(project);

        //setup project notifications for users to accecpt assigned project
        var $notifications = [];

        for(var i in $scope.users) { //loop through users
          var $usersItems = [];
          for(var z in $scope.allProjectItems.items) { //loop through project items
            if($scope.users[i].department === $scope.allProjectItems.items[z].itemType) {
              $usersItems.push({
                item: $scope.allProjectItems.items[z].itemType,
                description: $scope.allProjectItems.items[z].description
              }); 
            }
          }
          if($usersItems.length >= 1){
            var $notification = {
              items: $usersItems,
              userId: $scope.users[i]._id,
              username: $scope.users[i].username,
              viewed: false
            };
            $notifications.push($notification);
          }   
        }
        project.notifications = $notifications;

        //save project
        project.$save(function(response) {
          $location.path('projects/' + response._id);
          
        });

      } else {
        $scope.submitted = true;
      }
    };

    $scope.notification = function(project, action) {
        $scope.project = project;
        switch(action) {
          case 'confirm':
            for(var x in $scope.project.notifications) {
              if($scope.project.notifications[x].userId === $scope.global.user._id) {
                $scope.project.notifications[x].viewed = true;
              }
            }
            break;
        }
        $scope.update(true);
    };

    // $scope.accept = function(project){

    //   $scope.user.projects.assigned.push({title: project.general.projectName, _id: project._id});

    //   $http.put('/users/me', {
    //           projects: {
    //             assigned: $scope.user.projects.assigned,
    //             requested: $scope.user.projects.requested
    //           }
    //       })
    //       .success(function(response){
    //         $scope.response = response;

    //         for(var i in $scope.projectNotifications) {
    //           if($scope.projectNotifications[i]._id === project._id){
    //             $scope.projectNotifications.splice(i, 1);
    //           }
    //         }

    //         for(var x in project.notifications) {
    //           if(project.notifications[x].userId === $scope.user._id) {
    //             project.notifications[x].status = 'accepted';
    //             updateNotifications();
    //             $scope.projectsAssigned.push(project);
    //           }
    //         }


    //       })
    //       .error(function(error){
    //         $scope.response = error;
    //       });
    //   var updateNotifications = function(){
    //     $http.put('/projects/' + project._id, {
    //       notifications: project.notifications
    //     })
    //     .success(function(response){
    //     });
    //   };
    // };

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

    $scope.removeFile = function(item, file) {
      console.log(file);
      console.log(item);
      if(confirm('Are you sure you want to remove this file from your project?') === true){
        for(var f in item.files){
          if(item.files[f] === file){
            item.files.splice(f, 1);
            item.fileCount--;
            $scope.update(true);
          }
        }
        
      };
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


        //set assigned projects to $scope.projectsAssigned
        for(var d = 0; d < $scope.projects.length; d++) {

          //create list of notifcations from projects for logged in user
          for(var z in $scope.projects[d].notifications) {
            if($scope.projects[d].notifications[z].userId === $scope.global.user._id && $scope.projects[d].notifications[z].viewed === false) {
              $scope.projectNotifications.push($scope.projects[d]);
            }
          }

          //set assigned projects to $scope.projectsAssigned
          var isAssigned = false;
          for(var c in $scope.projects[d].items) {
              for(var e in $scope.projects[d].items[c].users) {
                if($scope.projects[d].items[c].users[e]._id === $scope.global.user._id && $scope.projects[d].items[c].users[e].status === 'accepted') {
                  isAssigned = true;
                }
              } 
          }
          if(isAssigned === true)$scope.projectsAssigned.push($scope.projects[d]);

          //set requested projects to $scope.projectsRequested
          if($scope.projects[d].user._id === $scope.global.user._id)$scope.projectsRequested.push($scope.projects[d]);
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
]).controller('ProjectDateController', ['$scope', '$stateParams', '$location', 'Global', 'Projects', '$http',
  function($scope, $stateParams, $location, Global, Projects, $http) {

    $scope.today = function() {
    $scope.dt = new Date();
    $scope.dt.setDate($scope.dt.getDate() + 14);
    };
    $scope.today();

    $scope.clear = function () {
      $scope.dt = null;
    };

    // Disable weekend selection
    $scope.disabled = function(date, mode) {
      return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    };

    
    $scope.minDate = new Date();
    $scope.minDate.setDate($scope.minDate.getDate() + 14);

    $scope.open = function($event) {
      $event.preventDefault();
      $event.stopPropagation();

      $scope.opened = true;
    };

    $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 1
    };


    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
  }
]).controller('ModalController', ['$scope', '$stateParams', '$location', 'Global', 'Projects', '$http', '$modal', '$log',
  function($scope, $stateParams, $location, Global, Projects, $http, $modal, $log) {
    /*jslint plusplus: true */
    $scope.modalType = null;
    $scope.items = {
      web: [
        {name: 'Website', template: 'modal-website.html', department: 'Marketing: Web'},
        {name: 'Splash Page', template: 'modal-splashpage.html', department: 'Marketing: Web'},
        {name: 'Site Update', template: 'modal-siteupdate.html', department: 'Marketing: Web'}
      ], 
      creative: [
        {name: 'Artwork', template: 'modal-artwork.html', department: 'Marketing: Creative'},
        {name: 'Flyer/Palm Card', template: 'modal-flyerpalmcard.html', department: 'Marketing: Creative'},
        {name: 'Postcard Mailer', template: 'modal-postcardmailer.html', department: 'Marketing: Creative'},
        {name: 'Vinyl Banner', template: 'modal-vinylbanner.html', department: 'Marketing: Creative'},
        {name: 'Signage', template: 'modal-signage.html', department: 'Marketing: Creative'},
        {name: 'Poster', template: 'modal-poster.html', department: 'Marketing: Creative'}
      ]
    };

    $scope.countries = [
      "Afghanistan", "Aland Islands", "Albania", "Algeria", "American Samoa", "Andorra", "Angola",
      "Anguilla", "Antarctica", "Antigua And Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria",
      "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin",
      "Bermuda", "Bhutan", "Bolivia, Plurinational State of", "Bonaire, Sint Eustatius and Saba", "Bosnia and Herzegovina",
      "Botswana", "Bouvet Island", "Brazil",
      "British Indian Ocean Territory", "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia",
      "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China",
      "Christmas Island", "Cocos (Keeling) Islands", "Colombia", "Comoros", "Congo",
      "Congo, the Democratic Republic of the", "Cook Islands", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba",
      "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
      "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Islands (Malvinas)",
      "Faroe Islands", "Fiji", "Finland", "France", "French Guiana", "French Polynesia",
      "French Southern Territories", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece",
      "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea",
      "Guinea-Bissau", "Guyana", "Haiti", "Heard Island and McDonald Islands", "Holy See (Vatican City State)",
      "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran, Islamic Republic of", "Iraq",
      "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya",
      "Kiribati", "Korea, Democratic People's Republic of", "Korea, Republic of", "Kuwait", "Kyrgyzstan",
      "Lao People's Democratic Republic", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya",
      "Liechtenstein", "Lithuania", "Luxembourg", "Macao", "Macedonia, The Former Yugoslav Republic Of",
      "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique",
      "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia, Federated States of", "Moldova, Republic of",
      "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru",
      "Nepal", "Netherlands", "New Caledonia", "New Zealand", "Nicaragua", "Niger",
      "Nigeria", "Niue", "Norfolk Island", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau",
      "Palestinian Territory, Occupied", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines",
      "Pitcairn", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russian Federation",
      "Rwanda", "Saint Barthelemy", "Saint Helena, Ascension and Tristan da Cunha", "Saint Kitts and Nevis", "Saint Lucia",
      "Saint Martin (French Part)", "Saint Pierre and Miquelon", "Saint Vincent and the Grenadines", "Samoa", "San Marino",
      "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore",
      "Sint Maarten (Dutch Part)", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa",
      "South Georgia and the South Sandwich Islands", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname",
      "Svalbard and Jan Mayen", "Swaziland", "Sweden", "Switzerland", "Syrian Arab Republic",
      "Taiwan, Province of China", "Tajikistan", "Tanzania, United Republic of", "Thailand", "Timor-Leste",
      "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
      "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom",
      "United States", "United States Minor Outlying Islands", "Uruguay", "Uzbekistan", "Vanuatu",
      "Venezuela, Bolivarian Republic of", "Viet Nam", "Virgin Islands, British", "Virgin Islands, U.S.",
      "Wallis and Futuna", "Western Sahara", "Yemen", "Zambia", "Zimbabwe"
    ];

    $scope.status = {
      isopen: false
    };

    $scope.toggled = function(open) {
    };

    $scope.toggleDropdown = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.status.isopen = !$scope.status.isopen;
    };

    $scope.choose = function(name, template, department) {
      $scope.modalType = {name: name, template: template, department: department};
      $scope.status.isopen = !$scope.status.isopen;
    };

    

    $scope.open = function(theTemplate, type, item) {
      
      switch(type){
        case 'item':

        $scope.today = function() {
        $scope.dt = new Date();
        $scope.dt.setDate($scope.dt.getDate() + 14);
        };
        $scope.today();

        $scope.clear = function () {
          $scope.dt = null;
        };

        // Disable weekend selection
        $scope.dateDisabled = function(date, mode) {
          return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
        };

        
        $scope.minDate = new Date();
        $scope.minDate.setDate($scope.minDate.getDate() + 14);

        $scope.dateOpen = function($event) {
          $event.preventDefault();
          $event.stopPropagation();

          $scope.opened = true;
        };

        $scope.dateOptions = {
          formatYear: 'yy',
          startingDay: 1
        };


        $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        $scope.format = $scope.formats[0];

        $scope.assets = {files: []};
        $scope.isNewItem = true;
        console.log('opening item modal');

          if($scope.modalType === null) {
            $scope.modalType = {name: item.subType, template: item.template, department: item.itemType};    
          }

          if(item !== undefined) {
            $scope.isNewItem = false;
            $scope.assets.files = item.files;
            $scope.openItem = item;
            $scope.oldContent = angular.copy(item);
            $scope.dt = item.completionDate;
          }
        break;

        case 'discussion':
        console.log('opening discussion modal');
          if(item !== 'new') {
            $scope.openDiscussion = item;
          }
        break;
      }

        var modalInstance = $modal.open({
        templateUrl: theTemplate,
        controller: 'ModalInstanceCtrl',
        size: 'lg',
        scope: $scope,
        resolve: {
          items: function () {
            return $scope.items;
          },
          type: function() {
            return type;
          }
        }

      });

      modalInstance.result.then(function (item) {
        switch(type){
          case 'item':

            $scope.newItem = item;
            $scope.newItem.itemType = $scope.modalType.department;
            $scope.newItem.subType = $scope.modalType.name;
            $scope.newItem.template = $scope.modalType.template;
            $scope.newItem.files = $scope.assets.files;
            $scope.newItem.completionDate = item.dt;
            $scope.newItem.fileCount = 0;

            for(var f in $scope.newItem.files){
              $scope.newItem.fileCount++;
            }
            
            if($scope.isNewItem){
              $scope.newItem.users = [];
              //add users to the item
              for(var u in $scope.users){
                if($scope.users[u].department === $scope.newItem.subType){
                  $scope.newItem.users.push({
                    _id: $scope.users[u]._id,
                    username: $scope.users[u].username,
                    status: 'pending'
                  });
                }
              }
            }

            $scope.newItem.remove = function($index) {
              if(confirm('Are you sure you want to remove this item from your project?') === true)  {
                $scope.allProjectItems.items.splice($index, 1);
                $scope.allProjectItems.count--;
              }
            };

            //if we are editing an item we need to delete and re-write to the object
            for(var a in $scope.allProjectItems.items){
              if($scope.allProjectItems.items[a].$$hashKey === item.$$hashKey){
                $scope.allProjectItems.items.splice(a, 1);
                $scope.allProjectItems.count--;
              }
            }

            // push the new item to the object and remove any alerts
            $scope.allProjectItems.items.push($scope.newItem);
            $scope.allProjectItems.count++;
            $scope.removeAlertDuplicate('no-items');
            console.log($scope.allProjectItems);

            //if we are editing an item in an existing project
            if($scope.project){
              $scope.projectProgress($scope.project);
              $scope.update(true);
            }

            //reset modalType
            $scope.modalType = null;
            $scope.opened = false;
          break;

          case 'discussion':
            
            $scope.discussion = item;

            if ($scope.openDiscussion){
              $scope.openDiscussion.messages.push({
                author: {
                  name: {
                    first: $scope.global.user.name.first,
                    last: $scope.global.user.name.last
                  },
                  username: $scope.global.user.username,
                  _id: $scope.global.user._id
                },
                content: $scope.discussion.message.content,
                created: new Date()
              });
              for(var x in $scope.project.discussions){
                if($scope.project.discussions[x] === item){
                  $scope.project.discussions.splice(x, 1, $scope.openDiscussion); 
                }
              }
            } else{
              $scope.discussion.created = new Date();
              $scope.discussion.creator = {
                name: {
                  first: $scope.global.user.name.first,
                  last: $scope.global.user.name.last
                },
                username: $scope.global.user.username,
                _id: $scope.global.user._id
              };
              $scope.discussion.messages = [];
              $scope.discussion.messages.push({
                author: {
                  name: {
                    first: $scope.global.user.name.first,
                    last: $scope.global.user.name.last
                  },
                  username: $scope.global.user.username,
                  _id: $scope.global.user._id
                },
                content: $scope.discussion.message.content,
                created: new Date()
              });

              $scope.project.discussions.push($scope.discussion);
            }

            
            $scope.update(true);
            //reset form data
            $scope.discussion = {
              subject: '',
              message: {
                content: ''
              }
            };

            $scope.openDiscussion = false;


          break; // end case discussion

        } // end switch

      }, function (type) {
        switch(type){
          case 'item':
            var cancelObj = {
              open: $scope.openItem,
              old: $scope.oldContent
            };

            $log.info('Modal dismissed at: ' + new Date());
            $scope.oldContent = cancelObj.old;

            //reset item to state before modal opens
            if(cancelObj.open !== null) {
              if($scope.project) {
                  for(var i in $scope.project.items){
                    if($scope.project.items[i].$$hashKey === $scope.openItem.$$hashKey){
                      $scope.project.items[i] = $scope.oldContent;
                    }
                  }
              } else {
                for(var a in $scope.allProjectItems.items){
                  if($scope.allProjectItems.items[a].$$hashKey === $scope.openItem.$$hashKey){
                    $scope.allProjectItems.items[a] = $scope.oldContent;
                  }
                }
              }
            }
            $scope.modalType = null;//reset modalType

          break; // end case item

          case 'discussion':
            
            //reset form data
            $scope.discussion = {
              subject: '',
              message: {
                content: ''
              }
            };

            $scope.openDiscussion = false;


          break; // end case discussion

        } // end switch

      });

      
      
    };
  }
]).controller('ModalInstanceCtrl', ['$scope', '$stateParams', '$location', 'Global', 'Projects', '$http', '$modalInstance', 'items', 'type',
  function($scope, $stateParams, $location, Global, Projects, $http, $modalInstance, items, type){
    $scope.items = items;

    if(type === 'item'){
      $scope.ok = function () {
        $modalInstance.close(this.item);
      };
    }
    if(type === 'discussion'){
      $scope.ok = function () {
        $modalInstance.close(this.discussion);
      };
    }

    $scope.cancel = function () {
      $modalInstance.dismiss(type);
    };
  }
 ]);






