/**
 * @fileOverview To list and search employee 
 * @author Abhishek Agrawal
 * @version 1.0
 */

var app = app || {};

( function ( app ) {

	app.controller ( 'employeeSearchCtrl', ['$scope', '$routeParams', '$location', '$http', '$log', 'Session', 'employeeService', 'user_auth','$filter', function ( $scope, $routeParams, $location, $http, $log, Session, employeeService, user_auth, $filter ) {

			$scope.user = Session.getUser(); // current user 
			
			$scope.employees = new Array ();

			var res = employeeService.getAllEmployees ();

			res.then ( function ( response ) {
				$scope.employees = response.data; // Employees data 
			}, function ( error ) {

			});
			
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
			
	}]); // End of controller 

} ) ( app );