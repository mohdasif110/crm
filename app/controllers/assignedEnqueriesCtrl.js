/**
 * Add Lead Controller
*/
var app = app || {};

(function (app,$){


	 app.controller('assignedEnqueriesCtrl', function ($scope,$location,user_session,$http,Session,utilityService,baseUrl,$interval,$filter,$window)
	 {
		 
		 
		$scope.page_record_limit 		=   10;
		$scope.current_page_number 		= 	1;
		$scope.baseUrl					=	baseUrl;
		$scope.leadCapture				=	[];
		$scope.enquiryData				=	[];
		$scope.currentUser = user_session;
		
		
		
		$scope.read_captured_leads		=    function()
		{
		
		
		
		var  date_range =  $('#dateRangText').val();
		$scope.dateRangeTextShow		=	'';
		
		$http.post(baseUrl+"/apis/read_assigned_enqueries.php", {date_range:date_range})
			.then(function(response) {
				$scope.enquiryData     		=			response.data.enData;
				$scope.dateRangeTextShow	=	response.data.dateRange
			});
		}
	
 	$scope.read_captured_leads();
	
	// Create page offset on change of page change 
	$scope.pageChange = function (page) {
		
		$scope.offset = $scope.page_record_limit * (parseInt(page) - 1);
	};
	
	
	$scope.ViewQuery			=	function($data){
		$scope.QueryDetailData	=	$data;
		$('#classModal').modal('show');
	}

	// Reload list on  close  of pop up.
	$scope.CloseModal		=	function()
	{
		$('#csvImportModal').modal('hide');
		$scope.read_captured_leads();
	}

	$scope.export_csv		=	function(){
	
		$http.post(baseUrl+"/apis/export_csv.php")
			.then(function(response) {
		});
	}
	
	//import csv formate ...	
	 $scope.import_format_csv		=	function(){
		
		var csv_formate				=	baseUrl+'queryupload/query_report.csv';
		$window.location = csv_formate;
	
	}
	//Import csv formate.

	$scope.changeDD=function(){
		
		var  date_range =  $('#dateRangText').val();
		
		$http.post(baseUrl+"/apis/read_assigned_enqueries.php", {date_range:date_range})
			.then(function(response) {
				
				$scope.enquiryData     		=			response.data.enData;
				$scope.dateRangeTextShow	=			response.data.dateRange
				
		});
	
	}

});
	
})(app,jQuery);

