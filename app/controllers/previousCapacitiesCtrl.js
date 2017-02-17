/**
 * package CRM
 * 
 * @fileOverview controller previousCapacitiesCtrl.js
 */


var app = app || {};

( function (app, $) {
	
	app.controller('previousCapacitiesCtrl', function ($scope,$routeParams,$log, httpService, user_session, $filter, baseUrl,user_name){
	
		$scope.user					= user_session; // Login user session data 
		$scope.previous_capacities	= []; 
		$scope.showAssignedProjectsCol = true;
		
		if($routeParams.designation_slug === 'sales_person'){
			$scope.showAssignedProjectsCol = false;
		}
		
		$scope.user_for_showing_previous_capacites = {
			id : $routeParams.user_id,
			designation_slug : $routeParams.designation_slug,
			getDesignationFromSlug : function (){
				
				return this.designation_slug.split('_').map(function (words){
					var first_char = words.charAt(0).toUpperCase();
					var str; 
					for(var i=0;i<words.length;i++){
						
						if(i===0){
							str = first_char;
						}else{
							str += words[i];
						}
					}
					return str;
				}).join(' ');
			},
			
			name : user_name
		};
		
		
		
		/**
		 * HTTP call to previous months capacities 
		 * @type type
		 */
		var capacity_response = httpService.makeRequest({
			url : baseUrl + 'apis/get_all_previous_month_capacities.php',
			method : 'POST',
			data : {
				user_id : $scope.user_for_showing_previous_capacites.id,
				designation_slug : $scope.user_for_showing_previous_capacites.designation_slug
			}
		});
		
		capacity_response.then(function (successResponse){
			$scope.previous_capacities = successResponse.data;
		});
		
		
		$scope.showProjects = function (data){
			
			var projects = data.projects.split(',');
			var capacities = data.month_capacity.split(',');
			
			// prepare data 
			
			$scope.project_with_capacities = [];
			
			angular.forEach (projects, function (val, index){
				
				var temp = {
					project : val,
					capacity : capacities[index]
				};
				
				$scope.project_with_capacities.push(temp);
				
			});
			
			// open modal to show up projects with capacities 
			$('.project_wise_capacity_model').modal('show');
			
		};
		
		// on hidden of bsmodal
		$('.project_wise_capacity_model').on('hidden.bs.modal', function (e) { 
			
			$scope.project_with_capacities = [];
		});
		
	});
	
} (app, jQuery));
