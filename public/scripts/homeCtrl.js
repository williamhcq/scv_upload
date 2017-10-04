const app = angular.module("csvupload", 
                            ['ngRoute',
                            'ui-notification',
                            'ngMaterial',
                            'ngMessages',
                            'angularFileUpload',
                            ]);

app.config(function(NotificationProvider){
    NotificationProvider.setOptions({
        delay: 3000,
        startTop: 20,
        startRight: 10,
        verticalSpacing: 20,
        horizontalSpacing: 20,
        positionX: 'center',
        positionY: 'top'
    });
});

var directory_name = "/"+window.location.pathname.split('/')[1];
app.controller("homeCtrl",function($scope,FileUploader,$window,Notification,homeService,$mdDialog,$q,$http){
    
    //file upload sction
    
    $scope.history_files = [];
    $scope.clear_data=function(){
        $scope.uploader.queue=[]
        $scope.history_files = [];
      
    }
    var uploader =$scope.uploader = new FileUploader({
        url:'../public/upload/upload.php'
    });
    $scope.uploader.onAfterAddingAll = function(addedFileItems) {
        //console.log(addedFileItems)
        var file_size_limit = 5;  //5MB
        var file_type_limit = ['application/vnd.ms-excel'];   
        var file_limitation_status = true;
        var file_size_limitation_status = true
        
        for(key in addedFileItems){
          
            
            var each_file_info = addedFileItems[key]._file;
           
            if(file_type_limit.indexOf(each_file_info.type) == -1){
                
                file_limitation_status = false
            }
            if(each_file_info.size > (file_size_limit*1250000)){
                
                file_size_limitation_status = false

            }
        }

        if(!file_limitation_status){
            Notification.error("Invalid file format");
            $scope.uploader.queue = [];
        }else if(!file_size_limitation_status){
            Notification.error("Invalid file size");
            $scope.uploader.queue = [];
        }else{
            $scope.uploader.uploadAll()
            
        }

         // console.info('onAfterAddingAll', addedFileItems);
    };
    $scope.uploader.onCancelItem = function(fileItem, response, status, headers) {
            console.info('onCancelItem', fileItem, response, status, headers);
            //$scope.removeUploadedFilesInfo(fileItem);
        };
    $scope.uploader.onCompleteItem = function(fileItem, response, status, headers) {
            var file_info = fileItem.file;
            console.log(fileItem)
            
            saveUploadedFilesInfo(file_info);

        };
    $scope.uploader.onCompleteAll = function(){
            console.log("complete all")
            $scope.uploader.queue = [];
            
    }
    $scope.uploader.onErrorItem = function(fileItem, response, status, headers) {
        console.info('onErrorItem', fileItem, response, status, headers);
    };
    
    var saveUploadedFilesInfo = function(file_info){
        console.log(file_info)
        var obj_data = {
            file_name:file_info.name,
            file_size:file_info.size
        }
        $scope.history_files.push(obj_data)
    }
  
    
    $scope.remove_file = function(key) {
        $scope.history_files.splice(key,1)
        
	};
    //read scv section
    
     $scope.view_file = function(file) {
		// http get request to read CSV file content
        $http.get('../public/upload/uploads/'+file.file_name)
        .then(
            (data)=>{
                console.log(data)
                $scope.processData(data.data)
            }
        );
	};

	$scope.processData = function(allText) {
        // split content based on new line
        
		var allTextLines = allText.split(/\r\n|\n/);
		var headers = allTextLines[0].split(',');
		var lines = [];

		for ( var i = 0; i < allTextLines.length; i++) {
			// split content based on comma
			var data = allTextLines[i].split(',');
			if (data.length == headers.length) {
				var tarr = [];
				for ( var j = 0; j < headers.length; j++) {
					tarr.push(data[j]);
				}
				lines.push(tarr);
			}
		}
        $scope.data = lines;
        console.log($scope.data)
	};
    $scope.gotopage=function(page_path){
        $window.location.href = '#/'+page_path;
    }
    $scope.clear_data()
});

app.service('homeService',function($http,$window){
});
app.factory('uploader', ['FileUploader', function(FileUploader) {
    return new FileUploader();
  }])
app.run( function($rootScope, $location,uploader) {
   $rootScope.uploader = uploader;
   $rootScope.$watch(function() { 
      return $location.path(); 
    },
    function(a){
      var scope = angular.element(document.getElementById("homeCtrl")).scope();

    });
});

app.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
});
app.config(function ($routeProvider,$locationProvider) {
    $locationProvider.hashPrefix('');
    $routeProvider
        .when("/", {
            templateUrl: "layouts/excel_upload.html",
        })
        .otherwise({
            redirectTo: "/"
        });
});
