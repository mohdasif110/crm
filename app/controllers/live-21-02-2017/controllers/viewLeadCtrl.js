/**
 * View Lead Controller 
 */

var app = app || {};

(function (app, $){
	
	app.controller('viewLeadCtrl', function ($scope, Session, $log, httpService, $route, $routeParams, $rootScope, $state, baseUrl, user_session, $filter, enquiry_status, sales_persons, is_lead_accepted, $location){
		
		// current enquiry status 
		$scope.current_enquiry_status = enquiry_status; 
		
		// Getting resolved user session
		$scope.currentUser = user_session;
		
		/**
		 * Admin Role Flag 
		 */
		if(parseInt($scope.currentUser.role )=== 1){
			$scope.is_admin_role = true;
		}else{
			$scope.is_admin_role = false;
		}
	
		/**
		 * TL CRM Flag
		 */
		
		if($scope.currentUser.designation_slug === 'tl_crm'){
			$scope.is_tl_crm = true;
		}else{
			$scope.is_tl_crm = false;
		}
		
		/**
		 * is lead accepted 
		 */
		
		$scope.is_lead_accepted  = parseInt (is_lead_accepted);
		
		// Call default state 
		$state.go('view_lead_customer_info');
	
		// route params 
		$scope.enquiry_id = $routeParams.enquiry_id;
		
		// If lead is available 
		if($routeParams.lead_id){
			$scope.lead_id = $routeParams.lead_id;
		}
	
		// get sub page 
		if($routeParams.sub_page){
			$scope.sub_page = $routeParams.sub_page;
		}
		
		/**
		 * Sales Persons List 
		 */
		$scope.sales_persons = sales_persons;
		
		// modal variable to keep site visit projects 
		$scope.site_visit_projects = [];
		
		/**
		 * Function to get project for site visit 
		 * @param {type} event
		 * @returns {undefined}
		 */
		
		
		$scope.getsiteVisitProject = function (event){
			
			var project_response = httpService.makeRequest ({
				url : baseUrl + 'apis/helper.php?method=getSiteVisitProject&params=enquiry_id:'+ $scope.enquiry_id,
				method : 'GET'
			});
			
			project_response.then(function (successResponse){
				
				if( parseInt (successResponse.data.success) === 1 ){
					$scope.site_visit_projects = successResponse.data.projects;
					console.log($scope.site_visit_projects);
				}
				
			}, function (errorResponse){
				console.log('No site visit project');
			});
			
		};
		
		$scope.getsiteVisitProject ();
		/**
		 * Function to toggle childs list items in lead action block
		 * @param {type} event
		 * @returns {undefined}
		 */
		$scope.toggleSubList = function (event){
			
			var target = event.currentTarget;
			
			$(target).siblings('.sub_list').toggle();
			
		};
		
		// Lead actions to update 
		$scope.lead_actions = [];
		
		
		/**
		 * function to get disposition status assigned to logged-in user 
		 * @returns {undefined}
		 */
		$scope.getLeadActionStatus = function (){
			
			httpService.makeRequest ( {
				url: baseUrl + 'apis/get_employee_disposition_group_status.php?employee_id=' + $scope.currentUser.id
			}).then ( function ( response ) {
			
					if(response.data.parent_status){
						
						angular.forEach (response.data.parent_status, function (val, key){
							
							var temp = {};
							temp.parent_id		= val.id;
							temp.parent_title	= val.title;
							
							var childs = $filter('filter')(response.data.sub_status,{group_id : val.id}, true);
							
							if(angular.isDefined (childs[0])){
								temp.childs = childs[0].childs;
							}else{
								temp.childs = [];
							}
				
							$scope.lead_actions.push(temp);
						});
						
					}
			});
		};
		
		$scope.getLeadActionStatus ();
		
		angular.element('.action-panels').css({display : 'none'});

		/**
		 * Modal property for new lead status data
		 */
		$scope.lead_status = {
			enquiry_id	: $scope.enquiry_id,
			lead_id		: $scope.lead_id,
			status_id	: null,
			sub_status_id : null
		};
		
		/**
		 * Function to update lead status values on select from lead action panel 
		 * @param {integer} parent_status_id
		 * @param {integer} sub_status_id
		 * @returns {undefined}
		 */
		$scope.changeLeadStatus = function (parent_status_id , sub_status_id){
			
			$scope.lead_status.status_id		= parent_status_id;
			$scope.lead_status.sub_status_id	= sub_status_id;
		};
		
		/**
		 * Function to validate update lead status form
		 * @returns {undefined}
		 */
		
		$scope.updateLeadFormValidation = function (data){
			
			switch( parseInt(data.status_id) ){
				
				case 3 : 
					// Case of meeting status 
					// sub status will be Done, schedule, re-scheduled
					
					// meeting done event
					if(parseInt(data.sub_status_id) === 11){ // meeting done 
						// only remark from user is required 
						
						if(angular.isDefined (data.remark) && data.remark){
							return true;
						}else{
							alert('Please enter remark');
							return false;
						}
					}
					
					// Meeting scheduled and re-scheduled with client
					if(parseInt(data.sub_status_id) === 22 || parseInt(data.sub_status_id) === 12){ // meeting scheduled
						
						if( angular.isUndefined (data.callback_date) ){
							alert('Please set date of meeting');
							return false;
						}else{
							if(data.callback_date === ''){
								alert('Please set date of meeting'); return false;
							}
						}
						
						if( angular.isUndefined (data.callback_time) ){
							alert('Please set time for meeting');
							return false;
						}else{
							if(data.callback_time === ''){
								alert('Please set time for meeting'); return false;
							}
						}
						
						if( angular.isUndefined (data.meeting_location_type) ){
							alert('Please select meeting location'); return false;
						}else{
							if( data.meeting_location_type === ''){
								alert('Please select meeting location'); return false;
							}
						}
						
						if( angular.isUndefined (data.meeting_address) ){
							alert('Please enter meeting address'); return false;
						}else{
							if(data.meeting_address === ''){
								alert('Please enter meeting address'); return false;
							}
						}
						
						if( angular.isUndefined (data.remark) ){
							alert('Please enter remark '); return false;
						}else{
							if(data.remark === ''){
								alert('Please enter remark '); return false;
							}
						}
						
						return true;
					}
					
					break;
					
					
				case 6 : // case of site visit 
				
					// Scheduled and Re-scheduled
					if( parseInt (data.sub_status_id) === 23 || parseInt (data.sub_status_id) === 15){
						
						if( angular.isUndefined (data.callback_date) ){
							alert('Please set site visit date'); return false;
						}else{
							if(data.callback_date === ''){
								alert('Please set site visit date'); return false;
							}
						}
						
						if( angular.isUndefined (data.callback_time)){
							alert('Please set site visit time'); return false;
						}else{
							if(data.callback_time === ''){
								alert('Please set site visit time'); return false;
							}
						}
						
						if( angular.isUndefined (data.site_visit_address)){
							alert('Please enter site visit address'); return false;
						}else{
							if(data.site_visit_address === ''){
								alert('Please enter site visit address'); return false;
							}
						}
						
						if( angular.isUndefined (data.remark)){
							alert('Please enter remark'); return false;
						}else{
							if(data.remark === ''){
								alert('Please enter remark'); return false;
							}
						}
						
						if( angular.isUndefined (data.site_visit_project) ){
							alert('Please select project'); return false;
						}else{
							if( !data.site_visit_project ){
								alert('Please select project'); return false;
							}
						}
						
					}
					
					// Done
					if( parseInt(data.sub_status_id) === 14 ){
						
						if(angular.isDefined (data.remark) && data.remark){
							return true;
						}else{
							alert('Please enter remark');
							return false;
						}
					}
				break;
				
				case 1: // not interested
					
					if( angular.isUndefined (data.remark) ){
						alert('Please enter remark'); return false;
					}
					else if(data.remark === ''){
						alert('Please enter remark'); return false;
					}
					else{
						return true;
					}
					break;
					
				case 5:
					if( angular.isUndefined (data.remark) ){
						alert('Please enter remark'); return false;
					}
					else if(data.remark === ''){
						alert('Please enter remark'); return false;
					}
					else{
						return true;
					}
					break;
			}
		};
		
		
		/**
		 * function to update lead status 
		 * @returns {undefined}
		 */
		
		$scope.updateLeadStatus = function (status_data){
				
			if(! $scope.updateLeadFormValidation(status_data)){
				return false;
			}

			status_data.employee_id = $scope.currentUser.id;
			
			httpService.makeRequest({
				url : baseUrl + 'apis/update_lead_status.php',
				method : 'POST',
				data : status_data
			}).then(function (success){
		
				if(parseInt(success.data.success) === 1) {
					
					alert('Lead status updated successfully');
				}else{
					
					alert('Lead status could not be updated. try after some time.');
				}
		
				// Hiding the modal and then reload the route 
				$('#action_modal').modal('hide');
				
				//$scope.reloadRoute ();
				
			}, function (error){
				
			});	
		};

		/**
		 * Function to change lead status wiht no child status 
		 * @returns {undefined}
		 */
		$scope.changeParentLeadAction = function (action_id){
			
			$scope.lead_status.status_id		= action_id;
			$scope.lead_status.sub_status_id	= 'NULL';
			$scope.lead_status.is_not_intrested = true;
			$('#action-panel-'+action_id).show();
			$('#action_modal').modal('show');
		};

		/**
		 * function to reload current route 
		 */
		
		$scope.reloadRoute = function (state){
				$route.reload();
		};
		

		// Event on close of action panel 
		$('#action_modal').on('hidden.bs.modal', function (e) {
			
			// Hide all panels in leadAction Popup modal
			$('.action-panels').css({display : 'none'});
			
			// Reset lead_status modal property on close of popup
			var reset_lead_status = {
				enquiry_id		: $scope.enquiry_id,
				lead_id			: $scope.lead_id,
				status_id		: null,
				sub_status_id	: null
			};
			
			$scope.lead_status = reset_lead_status;
			
		});


		/**
		 * Function to assign lead to sales person
		 * @returns {undefined}
		 */
		$scope.assign_lead = function (sales_person_id){
			
		};
		
		/**
		 * Function to change location 
		 * @returns {undefined}
		 */
		$scope.changePath = function (path){
			
			$location.path('/cheque-collection/20947/7/16');
			
//			$location.path("'"+path.url + '/' + path.data.enquiry_number + '/' + path.data.status_id + '/' + path.data.sub_status_id+"'");
		};
		
		
	}); // End of controller function
	
	
	/**
	 * Custom directive to save lead action attributes  
	 */
	
	
	app.directive('actionPopupDialog', function (baseUrl, httpService, $filter, utilityService, $location){
		
			return {
			
				strict : 'A',
				
				link : function (scope, iElement, iAttr){
				
					iElement.click(function (){
						
						var action		= iAttr.action; // lead action id
						var sub_action	= iAttr.subAction;
						
						scope.setSubStatusType(sub_action);
						
						scope.changeLeadStatus(action, sub_action); // updating lead status id and sub statusId in parent modal property
						
						scope.callActionTemplate(action, sub_action);
					});
				},
				
				controller : function ($scope){		
					
					$scope.setSubStatusType		= function (val){
						
						if(parseInt(val) === 11){
							$scope.lead_status.is_meeting_done = true;
						}else{
							$scope.lead_status.is_meeting_done = false;
						}
						
						if(parseInt(val) === 12){
							// meeting re-schedule
							$scope.lead_status.is_meeting_rescheduled = true;
						}else{
							$scope.lead_status.is_meeting_rescheduled = false;
						}
						
						if(parseInt(val) === 22){
							$scope.lead_status.is_meeting_scheduled = true;
						}else{
							$scope.lead_status.is_meeting_scheduled = false;
						}
						
						if(parseInt(val) === 14){
							$scope.lead_status.site_visit_done = true;
						}else{
							$scope.lead_status.site_visit_done = false;
						}
						
						if(parseInt(val) === 15){
							$scope.lead_status.is_site_visit_rescheduled = true;
						}else{
							$scope.lead_status.is_site_visit_rescheduled = false;
						}
						
						if(parseInt(val) === 23){
							$scope.lead_status.is_site_visit_scheduled = true;
						}else{
							$scope.lead_status.is_site_visit_scheduled = false;
						}
						
						if(parseInt(val) === 10){
							$scope.lead_status.is_call_back = true;
						}else{
							$scope.lead_status.is_call_back = false;
						}
						
						if(parseInt(val) === 19 || parseInt(val) === 20 || parseInt(val) === 21){
							$scope.lead_status.is_technical_issue = true;
						}else{
							$scope.lead_status.is_technical_issue = false;
						}
						
						if( parseInt(val) === 16){
							
							var path = {
								url : 'cheque-collection',
								data : {
									enquiry_number : $scope.enquiry_id,
									status_id : 7,
									sub_status_id : val
								}
							};
							
							$scope.changePath(path);
							
						}
						
					};
					$scope.callActionTemplate	= function (action_id, sub_action_id){
					
					
						switch(parseInt(action_id)){
								
							case 5: // Technical Issue 
								$('#action-panel-5').show();
								$('#action_modal').modal('show');
							break;

							case 3: // Meeting 
								if(parseInt(sub_action_id) !== 11){
									$('#action-panel-3').show();
								}else{
									$('#action-panel-11').show();
								}
								
								$('#action_modal').modal('show');
							break;

							case 4: // Future reference
								if(parseInt(sub_action_id) !== 18){
									$('#action-panel-4').show();
									$('#action_modal').modal('show');
								}else{

									httpService.makeRequest({
										url : baseUrl + 'apis/helper.php?method=setAsColdLead&params=enquiry_id:'+$scope.enquiry_id+'/lead_id:'+$scope.lead_id+'/emp_id:'+$scope.currentUser.id,
										method : 'GET'
									}).then(function (success){

										if(parseInt(success.data.success) === 1){
											alert('success');
										}else{
											alert('failure');
										}

										$scope.reloadRoute();

									}, function (error){

									});
								}
							break;

							case 6: // site visit
								
								if(parseInt (sub_action_id) !== 14){
									$('#action-panel-6').show(); // modal for other sub status in site visit
								}else{
									$('#action-panel-14').show(); // modal for site visit done sub status 
								}
								
								$('#action_modal').modal('show');
							break;
						}
					};
						
				}
			};
	}); // end of directive 
	
	app.directive('eventTime', function ($filter){
		
		return {
			restrict : 'E',
			replace: false,
			scope : {
				data : '='
			},
			link : function (scope, element, attr){
				
				var event = scope.data.status_slug;
				
				if(scope.data[event]){
					var event_data = scope.data[event];
					var template = ' <span style="font-weight:normal; color:lightseagreen">('+$filter('date')(event_data.event_date,'fullDate')+' '+ event_data.event_time+')</span> ';
					element.html(template);
				}else{
					var template = ' <span style="font-weight:normal; color:lightseagreen">('+$filter('date')(scope.data.future_followup_date,'fullDate')+' '+ scope.data.future_followup_time+')</span> ';
					element.html(template);
				}
			}
		};
		
	});
	
}(app, jQuery));