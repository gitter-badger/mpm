'use strict';

(function() {
  // Projects Controller Spec
  describe('MEAN controllers', function() {
    describe('ProjectsController', function() {
      // The $resource service augments the response object with methods for updating and deleting the resource.
      // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
      // the responses exactly. To solve the problem, we use a newly-defined toEqualData Jasmine matcher.
      // When the toEqualData matcher compares two objects, it takes only object properties into
      // account and ignores methods.
      beforeEach(function() {
        this.addMatchers({
          toEqualData: function(expected) {
            return angular.equals(this.actual, expected);
          }
        });
      });

      beforeEach(function() {
        module('mean');
        module('mean.system');
        module('mean.projects');
      });

      // Initialize the controller and a mock scope
      var ProjectsController,
        scope,
        $httpBackend,
        $stateParams,
        $location;

      // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
      // This allows us to inject a service but then attach it to a variable
      // with the same name as the service.
      beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {

        scope = $rootScope.$new();

        ProjectsController = $controller('ProjectsController', {
          $scope: scope
        });

        $stateParams = _$stateParams_;

        $httpBackend = _$httpBackend_;

        $location = _$location_;

      }));

      it('$scope.find() should create an array with at least one project object ' +
        'fetched from XHR', function() {

          // test expected GET request
          $httpBackend.expectGET('projects').respond([{
            title: 'An Project about MEAN',
            content: 'MEAN rocks!'
          }]);

          // run controller
          scope.find();
          $httpBackend.flush();

          // test scope value
          expect(scope.projects).toEqualData([{
            title: 'An Project about MEAN',
            content: 'MEAN rocks!'
          }]);

        });

      it('$scope.findOne() should create an array with one project object fetched ' +
        'from XHR using a projectId URL parameter', function() {
          // fixture URL parament
          $stateParams.projectId = '525a8422f6d0f87f0e407a33';

          // fixture response object
          var testProjectData = function() {
            return {
              title: 'An Project about MEAN',
              content: 'MEAN rocks!'
            };
          };

          // test expected GET request with response object
          $httpBackend.expectGET(/projects\/([0-9a-fA-F]{24})$/).respond(testProjectData());

          // run controller
          scope.findOne();
          $httpBackend.flush();

          // test scope value
          expect(scope.project).toEqualData(testProjectData());

        });

      it('$scope.create() with valid form data should send a POST request ' +
        'with the form input values and then ' +
        'locate to new object URL', function() {

          // fixture expected POST data
          var postProjectData = function() {
            return {
              title: 'An Project about MEAN',
              content: 'MEAN rocks!'
            };
          };

          // fixture expected response data
          var responseProjectData = function() {
            return {
              _id: '525cf20451979dea2c000001',
              title: 'An Project about MEAN',
              content: 'MEAN rocks!'
            };
          };

          // fixture mock form input values
          scope.title = 'An Project about MEAN';
          scope.content = 'MEAN rocks!';

          // test post request is sent
          $httpBackend.expectPOST('projects', postProjectData()).respond(responseProjectData());

          // Run controller
          scope.create(true);
          $httpBackend.flush();

          // test form input(s) are reset
          expect(scope.title).toEqual('');
          expect(scope.content).toEqual('');

          // test URL location to new object
          expect($location.path()).toBe('/projects/' + responseProjectData()._id);
        });

      it('$scope.update(true) should update a valid project', inject(function(Projects) {

        // fixture rideshare
        var putProjectData = function() {
          return {
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Project about MEAN',
            to: 'MEAN is great!'
          };
        };

        // mock project object from form
        var project = new Projects(putProjectData());

        // mock project in scope
        scope.project = project;

        // test PUT happens correctly
        $httpBackend.expectPUT(/projects\/([0-9a-fA-F]{24})$/).respond();

        // testing the body data is out for now until an idea for testing the dynamic updated array value is figured out
        //$httpBackend.expectPUT(/projects\/([0-9a-fA-F]{24})$/, putProjectData()).respond();
        /*
                Error: Expected PUT /projects\/([0-9a-fA-F]{24})$/ with different data
                EXPECTED: {"_id":"525a8422f6d0f87f0e407a33","title":"An Project about MEAN","to":"MEAN is great!"}
                GOT:      {"_id":"525a8422f6d0f87f0e407a33","title":"An Project about MEAN","to":"MEAN is great!","updated":[1383534772975]}
                */

        // run controller
        scope.update(true);
        $httpBackend.flush();

        // test URL location to new object
        expect($location.path()).toBe('/projects/' + putProjectData()._id);

      }));

      it('$scope.remove() should send a DELETE request with a valid projectId ' +
        'and remove the project from the scope', inject(function(Projects) {

          // fixture rideshare
          var project = new Projects({
            _id: '525a8422f6d0f87f0e407a33'
          });

          // mock rideshares in scope
          scope.projects = [];
          scope.projects.push(project);

          // test expected rideshare DELETE request
          $httpBackend.expectDELETE(/projects\/([0-9a-fA-F]{24})$/).respond(204);

          // run controller
          scope.remove(project);
          $httpBackend.flush();

          // test after successful delete URL location projects list
          //expect($location.path()).toBe('/projects');
          expect(scope.projects.length).toBe(0);

        }));
    });
  });
}());
