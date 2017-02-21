/**
 * @fileOverview To list and search employee 
 * @author Abhishek Agrawal
 * @version 1.0
 */

var app = app || {};

( function ( app ) {

	app.controller ( 'employeeSearchCtrl', ['$scope', '$routeParams', '$location', '$http', '$log', 'Session', 'employeeService', 'user_auth','$filter','user_designation', function ( $scope, $routeParams, $location, $http, $log, Session, employeeService, user_auth, $filter, user_designation ) {

			$scope.user = Session.getUser(); // current user 
			
			$scope.employees = new Array ();

			$scope.designation_list = user_designation;
			
			$scope.getAllEmployees = function (){
				
				var res = employeeService.getAllEmployees ();
					res.then ( function ( response ) {
						$scope.employees = response.data; // Employees data
					}, function ( error ) {
				});
			};
			
			$scope.getAllEmployees ();
			
			// Pagination Data 
			$scope.pagination = {
				current_page	: 1,
				pagination_size : 4,
				page_size		: 10,
				show_boundary_links : true,
				total_page		: 0,
				changePage : function (page){
					this.current_page = page;
				}
			};
			// End pagination
			
			$scope.pages = new Array($scope.pagination.page_size, $scope.pagination.page_size + 10, $scope.pagination.page_size + 20, 'All');
			
			$scope.changePageSize = function (page_size){
				
				if(typeof page_size === 'string'){
					if( 'all' === $filter('lowercase')(page_size)){
						$scope.pagination.page_size = $scope.employees.length;
					}
				}
				else if (typeof page_size === 'object' && !page_size){
					$scope.pagination.page_size = 10; // default value of page size
				}else{
					$scope.pagination.page_size = page_size;
				}
			};
			
			/**
			 * Filter employee data set by designation 
			 * @returns {undesfined}
			 */
			$scope.filterEmployeeByDesignation = function (designation_id){
				
				if(designation_id){
					employeeService.filterEmployeeByDesignation(designation_id).then(function (res){
						
						$scope.employees = res.data;
					});
				}else{
					$scope.getAllEmployees ();
				}
				
			};
			
	}]); // End of controller 

} ) ( app );