/**
 * Package CRM
 * 
 * @fileOverview controller addSalesPersonCapacityCtrl
 * @author Abhishek Agrawal
 */

var app = app || {};

(function(app, $){
	
	app.controller ('addSalesPersonCapacityCtrl', ['$scope','user_session','sales_person_remaining_capacity','dateUtility','sales_person_details','httpService','baseUrl','asm_mpl_capacity', function ($scope,user_session, sales_person_remaining_capacity,dateUtility, sales_person_details, httpService, baseUrl,asm_mpl_capacity){
		
		$scope.user = user_session;
		
		$scope.sales_person_max_capacity = sales_person_remaining_capacity;
		
		$scope.asm_mpl_capacity = asm_mpl_capacity;
		
		// Add area sales manager mpl capacity to spl capacity if not null
		if($scope.asm_mpl_capacity){
			$scope.sales_person_max_capacity = parseInt ($scope.sales_person_max_capacity) + parseInt($scope.asm_mpl_capacity);
		}
		
		$scope.current_month = dateUtility.current_month_in_textual_representation('full');
		
		$scope.current_year = dateUtility.current_year;
		
		$scope.sales_person_details = sales_person_details;
		
		$scope.sales_person_details.capacity_month = new Date().getMonth ();
		
		$scope.sales_person_details.capacity_year = new Date().getFullYear ();
		
		$scope.checkMaxCapacityLimit = function (event, capacity_value){
			
			if(capacity_value === ''){
				$scope.sales_person_details.sales_person_capacity = null;
			}
			
			if(parseInt(capacity_value) > $scope.sales_person_max_capacity){
				alert('Cannot assign capacity beyond maximum limit');
				$scope.sales_person_details.sales_person_capacity = null;
				return false;
			}
			
		};
		
		$scope.saveCapacity = function (capacity_data){
			
			if(capacity_data.sales_person_capacity === null){
				alert('Please enter sales person capacity');
				return false;
			}
			
			var save_capacity = httpService.makeRequest({
				url : baseUrl + 'apis/save_sales_person_capacity.php',
				method: 'POST',
				data : capacity_data
			});
			
			save_capacity.then(function (success){
				
				if(parseInt(success.data.success) === 1){
					
					$scope.notify({
						class	: ['alert','alert-success', 'center-aligned'],
						message : success.data.message
					});
				}else{
					$scope.notify({
						class	: ['alert','alert-warning', 'center-aligned'],
						message : success.data.message
					});
				}
				
			}, function (error){
				
			});
			
		};
		
	}]);
	
}(app, jQuery));