'use strict';

angular.module('mean.upload').controller('MeanUploadController', ['$scope', 'Global', 'MeanUpload', '$http', 
  function($scope, Global, MeanUpload, $http) {
    $scope.global = Global;
    $scope.images = [];
    $scope.files = [];
    $scope.package = {
        name: 'mean-upload'
    };

    $scope.images = [];

    $scope.uploadFileCallback = function(file) {
      if (file.type.indexOf('image') !== -1){
          $scope.images.push(file);
          $scope.addSlide(file.src);
      }
      else{
          $scope.files.push(file);
      }
      $scope.assets.files.push({
        src: file.src,
          name: file.name,
          size: file.size,
          kind: file.type,
          description: 'default',
          user: {
            name: {
              first: $scope.global.user.name.first,
              last: $scope.global.user.name.last
            },
            username: $scope.global.user.username,
            _id: $scope.global.user._id
          }
      });
    };

    $scope.uploadFinished = function(files) {
      console.log(files);
    };

    $scope.myInterval = 5000;
    var slides = $scope.slides = [];
    $scope.addSlide = function(url) {
//           var newWidth = 600 + slides.length;
       slides.push({
         image: url
       });
    };
  }
]);
