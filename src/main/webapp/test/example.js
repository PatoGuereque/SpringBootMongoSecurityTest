angular.module('taskManagerApp', ['ngAnimate', 'ui.bootstrap', 'ui-notification']);
/*angular.module('taskManagerApp').controller('ModalDemoCtrl', function ($scope, $uibModal, $log) {

  $scope.items = ['item1', 'item2', 'item3'];

  $scope.animationsEnabled = true;

  $scope.open = function (taskName) {

    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',

      resolve: {
        taskName: function () {
          return taskName;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

  $scope.toggleAnimation = function () {
    $scope.animationsEnabled = !$scope.animationsEnabled;
  };

});
*/
// Please note that $uibModalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.

angular.module('taskManagerApp').controller('ModalInstanceCtrl', function ($rootScope, $scope, $http, $uibModalInstance, items) {
  var modal = this;
  $scope.taskName = items.taskName;
  $scope.taskDesc = items.taskDesc;
  $scope.taskStatus = items.taskStatus;
  $scope.taskPriority = items.taskPriority;
  $scope.taskUri = items.taskUri;
  $scope.statuses=['ACTIVE','COMPLETED'];
  $scope.priorities=['HIGH','MEDIUM','LOW'];

  $scope.ok = function () {
    $http.patch($scope.taskUri, { taskName:$scope.taskName, taskDescription:$scope.taskDesc, taskStatus:$scope.taskStatus, $taskPriority:$scope.taskPriority });
    $rootScope.$broadcast('findTasks');
    items.Notification.success("Task Updated!"); 
    $uibModalInstance.close(1);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

angular.module('taskManagerApp').controller('taskManagerController', function ($rootScope, $scope, $timeout, $http, Notification, $uibModal, $log) {
  
  var urlBase="";
  $scope.toggle=true;
  $scope.success=false;
  $scope.selection = [];
  $scope.statuses=['ACTIVE','COMPLETED'];
  $scope.priorities=['HIGH','MEDIUM','LOW'];
  $http.defaults.headers.post["Content-Type"] = "application/json";

  
  $scope.$on('findTasks', function() {
        $timeout(function() {
          $scope.$apply(function() {
            findAllTasks();
          })
        }, 500);
  });

    function findAllTasks() {
        //get all tasks and display initially
        $http.get(urlBase + '/tasks/search/findByTaskArchived?archivedfalse=0').
            success(function (data) {
                if (data._embedded != undefined) {
                    $scope.tasks = data._embedded.tasks;
                } else {
                    $scope.tasks = [];
                }
                for (var i = 0; i < $scope.tasks.length; i++) {
                    if ($scope.tasks[i].taskStatus == 'COMPLETED') {
                        $scope.selection.push($scope.tasks[i].taskId);
                    }
                }
                $scope.taskName="";
                $scope.taskDesc="";
                $scope.taskPriority="";
                $scope.taskStatus="";
                $scope.toggle='!toggle';
            });
    }

    findAllTasks();

  //add a new task
  $scope.addTask = function addTask() {
    if($scope.taskName=="" || $scope.taskDesc=="" || $scope.taskPriority == "" || $scope.taskStatus == ""){
      Notification.error('Insufficient Data! Please provide values for task name, description, priortiy and status');
    }
    else{
     $http.post(urlBase + '/tasks', {
             taskName: $scope.taskName,
             taskDescription: $scope.taskDesc,
             taskPriority: $scope.taskPriority,
             taskStatus: $scope.taskStatus
         }).
      success(function(data, status, headers) {
             Notification.success('Task Added!');
             var newTaskUri = headers()["location"];
             console.log("Might be good to GET " + newTaskUri + " and append the task.");
             // Refetching EVERYTHING every time can get expensive over time
             // Better solution would be to $http.get(headers()["location"]) and add it to the list
             $rootScope.$broadcast('findTasks');
        });
    }
  };
    
  // toggle selection for a given task by task id
    $scope.toggleSelection = function toggleSelection(taskUri) {
      var idx = $scope.selection.indexOf(taskUri);

      // is currently selected
        // HTTP PATCH to ACTIVE state
      if (idx > -1) {
        $http.patch(taskUri, { taskStatus: 'ACTIVE' }).
      success(function(data) {
          Notification.success('Task marked as active.')
              findAllTasks();
        });
        $scope.selection.splice(idx, 1);
      }

      // is newly selected
        // HTTP PATCH to COMPLETED state
      else {
        $http.patch(taskUri, { taskStatus: 'COMPLETED' }).
      success(function(data) {
        Notification.success('Task marked as completed!')
              findAllTasks();
        });
        $scope.selection.push(taskUri);
      }
    };
    
  
  // Archive Completed Tasks
    $scope.archiveTasks = function archiveTasks() {
          $scope.selection.forEach(function(taskUri) {
              if (taskUri != undefined) {
                  $http.patch(taskUri, { taskArchived: 1});
              }
          });
          Notification.success('Archived all completed tasks!')
          console.log("It's risky to run this without confirming all the patches are done. when.js is great for that");
          $rootScope.$broadcast('findTasks');
    };

  $scope.open = function (taskUri, taskName, taskDesc, taskStatus, taskPriority) {

    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      controllerAs: 'modal',
      resolve: {
        items: function () {
          return {
            taskUri: taskUri,
            taskName: taskName,
            taskDesc: taskDesc,
            taskStatus: taskStatus,
            taskPriority: taskPriority,
            Notification: Notification
          };
        }

      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };
});

//Angularjs Directive for confirm dialog box
angular.module('taskManagerApp').directive('ngConfirmClick', [
  function(){
         return {
             link: function (scope, element, attr) {
                 var msg = attr.ngConfirmClick || "Are you sure?";
                 var clickAction = attr.confirmedClick;
                 element.bind('click',function (event) {
                     if ( window.confirm(msg) ) {
                         scope.$eval(clickAction);
                     }
                 });
             }
         };
 }]);