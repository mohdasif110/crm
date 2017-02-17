/**
 * View Lead Controller 
 */

var app = app || {};

(function (app, $){
	
	app.controller('viewLeadCtrl', function ($scope, Session, $log, httpService, $route, $routeParams, $rootScope, $state, baseUrl, user_session, $filter, enquiry_status, sales_persons, is_lead_accepted){
		
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
		
		$log.info(typeof $scope.is_lead_accepted);
		
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
		 * function to update lead status 
		 * @returns {undefined}
		 */
		
		$scope.updateLeadStatus = function (status_data){
					
			status_data.employee_id = $scope.currentUser.id;
			
			httpService.makeRequest({
				url : baseUrl + 'apis/update_lead_status.php',
				method : 'POST',
				data : status_data
			}).then(function (success){
		
				if(parseInt(success.data.success) === 1) {
					alert('success');
				}else{
					alert('failure');
				}
		
				// Hiding the modal and then reload the route 
				$('#action_modal').modal('hide');
				
				$scope.reloadRoute ();
				
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
		
		
	}); // End of controller function
	
	
	/**
	 * Custom directive to save lead action attributes  
	 */
	
	
	app.directive('actionPopupDialog', function (baseUrl, httpService, $filter, utilityService){
		
			return {
			
				strict : 'A',
				
				link : function (scope, iElement, iAttr){
				
					iElement.click(function (){
						
						var action		= iAttr.action; // lead action id
						var sub_action	= iAttr.subAction;
						
						scope.setSubStatusType(sub_action);
						
						scope.changeLeadStatus(action, sub_action); // updating lead status id and sub status id in parent modal property
						
						scope.callActionTemplate(action, sub_action);
					});
				},
				
				controller : function ($scope){
					
					$scope.callActionTemplate  = function (action_id, sub_action_id){
					
							switch(parseInt(action_id)){
								
								case 5:
										// Technical Issue 
										$('#action-panel-5').show();
										$('#action_modal').modal('show');
								break;
								
								case 3:
									$('#action-panel-3').show();
									$('#action_modal').modal('show');
								break;
								
								case 4:
									
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
								
								case 6:
									$('#action-panel-6').show();
									$('#action_modal').modal('show');
								break;
							}
					};
					
					$scope.setSubStatusType = function (val){
					
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
						
					};
				}
			};
	}); // end of directive 
	
}(app, jQuery));