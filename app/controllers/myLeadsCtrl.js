/**
 * package CRM
 * 
 * @fileOverview controller myLeadsCtrl.js
 * @author Abhishek Agrawal
 */

var app = app || {};

(function (app,$){
	
	app.controller('myLeadsCtrl' , function ($scope,$sce, $log, httpService, baseUrl, $http, disposition_status_list, $filter, user_session, $route, asm_users){
			
		$scope.loginUser = user_session; // Container for logged in user data
		
		$scope.user_designation_slug = $scope.loginUser.designation_slug; 
		
		if($scope.loginUser.designation_slug === 'agent' || $scope.loginUser.designation_slug === 'executive'){
			$scope.hideLeadAddedByCol = true;
		}

		// Ares Sales Managers 
		$scope.area_sales_managers = asm_users;
	
		// pagination data 
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
	
		$scope.round_robin_switch_enable = false;
		
		
		// Flag to enable/ hide assign leads functionality 
		$scope.assign_leads = false;
		
		$scope.view = 'view1'; // default view 
		
		/**
		 * Switch staement to toggle multiple views according to user login
		 */
		
		switch($scope.loginUser.designation_slug.toString()){
			
			case 'area_sales_manager':
				$scope.view = 'view2';
				break;
			
			case 'sr_team_leader':
				$scope.view = 'view1';
				break;
				
			case 'agent':
				$scope.view = 'view4';
				break;
				
			case 'executive':
				$scope.view = 'view1';
				break;
				
			case 'sales_person':
				$scope.view = 'view3';
				break;
		};

		$scope.sales_persons = [];
		
		$scope.getAreaManagerSalesPerson = function (){
			
			httpService.makeRequest({
				url : baseUrl + 'apis/get_area_manager_sales_person.php',
				method : 'POST',
				data : {
					asm_id : $scope.loginUser.id
				}
			}).then(function (successCallback){
				if(successCallback.data.length > 0){
					$scope.sales_persons = successCallback.data;
				}
			});
		};
		
		
		if($scope.loginUser.designation_slug === 'area_sales_manager'){
			$scope.assign_leads = true;
			$scope.round_robin_switch_enable = true;
			$scope.getAreaManagerSalesPerson();
		} 
		
		$scope.disposition_status_list = disposition_status_list; 
		
		// Login user full name 
		 
		$scope.login_user_fullname = $scope.loginUser.firstname +' ' +$scope.loginUser.lastname;

		$scope.leads = [];
	
		$scope.getLeads = function (){
			
			var url = 'apis/getMyLeads.php';
			
			if($scope.loginUser.designation_slug === 'area_sales_manager'){
				url = 'apis/asm_leads.php';
			}
			
			if($scope.user_designation_slug === 'sales_person'){
				url = 'apis/sales_persons_lead.php'
			}
			
			var get_my_leads_config = {

				url : baseUrl + url,
				method : 'POST',
				data : $.param ({
					user_id : $scope.loginUser.id,
					designation_id : $scope.loginUser.designation,
					designation_slug : $scope.loginUser.designation_slug
				}),
				headers : {'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'}

			};

			$http(get_my_leads_config).then(function (success){

				if(parseInt(success.data.success) === 1){
					
					$scope.leads = success.data.data;
					
					// calculate total pages for paginations
					$scope.pagination.total_page = Math.ceil ( Object.keys($scope.leads).length/$scope.pagination.page_size );
					
				}else{
					if(parseInt(success.data.http_status_code) === 401){
						alert('unauthorized access..! Logout user immediate');
					}
				}
			}, function (error){
			});
		};
		
		$scope.getLeads ();
		
		/**
		 * 
		 * @returns {undefined}
		 */
		$scope.getStatusTitle = function (status_id){
		
			var status_data = $filter('filter')($scope.disposition_status_list, {id : status_id}, true);
		
			if(status_data[0].parent_status === null){
				return (status_data[0].status_title);
			}else{
				return (status_data[0].sub_status_title);
			}
		};
		
		/**
		 * Function to assign lead to area sales managers 
		 * @param <object> lead_data
		 * @param <object> dom element
		 * @returns <bool>
		 */
		
		$scope.manualLeadAssignToAsm = function (dom_element,enquiry_id, category){
		
			/**
			 * For MPL category type leads and for leads having no category assigned
			 * we have to assign them manually to ASMs by selecting one of the ASM from popup 
			 */
			if(category === '' || category === null){
			
				$scope.enquiry_id_for_asm_assignment = enquiry_id;
				// open popup of asm users list 
				$('#asm_users_list_popup').modal('show');
				
				return false;
			}
			
			// Start button animation 
			var button_innerHTML = dom_element.target.innerHTML; // existing button html
			dom_element.target.innerHTML = 'Assigning <i class="fa fa-spinner faa-spin animated"></i>';	
			dom_element.target.disabled = true;
		
			var http_call_data = {
				enquiry_id		: enquiry_id
			};
		
			var assign_lead_config = {	
				url : baseUrl + 'apis/manual_lead_assign_to_asm.php',
				method : 'POST',
				data : $.param (http_call_data),
				headers : {'Content-Type' : 'application/x-www-form-urlencoded; charset=utf-8'}
			};
		
			$http(assign_lead_config).then(function (success){
				
				if(parseInt(success.data.success) === 1){
					$scope.getLeads ();
				}else{
					// restore original button text 
					dom_element.target.innerHTML = button_innerHTML;
					dom_element.target.disabled = false;
					alert(success.data.message);
				}
			}, function (error){
				dom_element.target.innerHTML = button_innerHTML;
				dom_element.target.disabled = false;	
			});
		};
		
		
		/**
		 * Click event handler of assign lead button
		 */
		
		$scope.showLeadAssignDialog = function (enq_id){
			$scope.lead_assign.enquiry_id = enq_id;
			$('#option_modal').modal('show');
		};
		
		
		$scope.assignment_method;
		
		/**
		 * Click event handler
		 * @param {object} element  DOM ELEMENT
		 * @returns {undefined}
		 */
		$scope.getAssignmentMethod = function (element){
			$scope.assignment_method = element.currentTarget.value;
		};
		
		// Lead assign scope variable
		$scope.lead_assign = {sales_person : null, enquiry_id : null};
		
		/**
		 * BS Modal hidden event handling 
		 */
		$('#option_modal').on('hidden.bs.modal', function (e) { 
			e.stopPropagation();
			$scope.lead_assign.sales_person = null;
			$scope.lead_assign.enquiry_id	= null;
			
			// reload current route 
			$route.reload();
		});
		
		/**
		 * Function to assign lead to sales person if any selected
		 */
		
		$scope.assignLeadToSalesPerson = function (){
			
			if($scope.lead_assign.enquiry_id === null){
				alert('Please select lead to assign');
				return false;
			}
			
			if($scope.lead_assign.sales_person === null){
				alert('Please select sales person');
				return false;
			}
			
			// Assign lead 
			
			$http({
				url : baseUrl + 'apis/assign_lead_to_sales_person.php',
				method : 'POST',
				data : $.param ($scope.lead_assign),
				headers : {
					'Content-Type' : 'application/x-www-form-urlencoded; charset=utf-8'
				}
			}).then(function (successCallback){
				
				$('#option_modal').modal('hide');
				
				if(parseInt(successCallback.data.success) === 1){
					$scope.notify({
						class : ['alert','center-aligned','alert-success'], message : successCallback.data.message
					});
				}else{
					$scope.notify({
						class : ['alert','center-aligned','alert-warning'], message : successCallback.data.error
					});
				}
			});
		};
		
		/**
		 * 
		 * @param {type} enquiry_id
		 * @returns {undefined}
		 */
		$scope.rejectLeadAction = function (enquiry_id){
			
			$scope.reject_lead_enquiry_id = enquiry_id;
			
			// open BS modal to capture lead rejection explnation againt enquiry id 
			$('#lead_reject_modal').modal('show');
		};
		
		/*
		 * Function to reject lead by sales person
		 * @param <string> reason text of lead reason
		 * @param <number> enquiry id
		 * @returns {undefined}
		 */
		$scope.rejectLead = function (reason, eID){
		
			var lead_reject_modal = {
				reject_reason : reason,
				enquiry_id : eID,
				sales_person_id : $scope.loginUser.id
			};
			
			$http({
				url : baseUrl + 'apis/reject_lead.php',
				method : 'POST',
				data : $.param(lead_reject_modal),
				headers : {
					'Content-Type' : 'application/x-www-form-urlencoded; charset=utf-8'
				}
			}).then(function (successCallback){
				
				console.log(successCallback.data);
				
				if(parseInt(successCallback.data) === 1){
					alert('Lead has been rejected');
				}else{
					alert('Lead could\'nt be rejected at this time.');
				}
				
				$('#lead_reject_modal').modal('hide');
			});
		};
		
		$('#lead_reject_modal').on('hidden.bs.modal', function (e) { 
			e.stopPropagation();
			$scope.lead_reject_reason		= '';
			$scope.reject_lead_enquiry_id	= null;
			$route.reload();
		});
		
		/**
		 * Function to accept lead by sales person
		 * @param {number} enquiryId
		 * @returns {undefined}
		 */
		$scope.acceptLead  = function (enquiryId){
			var lead_accept_modal = {
				enquiry_id : enquiryId,
				sales_person_id : $scope.loginUser.id
			};
			
			$http({
				url : baseUrl + 'apis/acceptLead.php',
				method : 'POST',
				data : $.param(lead_accept_modal),
				headers : {
					'Content-Type' : 'application/x-www-form-urlencoded; charset=utf-8'
				}
			}).then(function (successCallback){
				
				if(parseInt(successCallback.data) === 1){
					alert('Lead has been accepted succesfully');
				}else{
					alert('Lead could\'nt be accepted at this time');
				}
				
				$route.reload();
				
			});
		};
		
	});
	
	/**
	 *  callback leads 
	 */
	app.controller('callbackLeads', function($scope, $route, $log, httpService, Session, baseUrl){
		
		$scope.callback_leads = [];
		
		$scope.getCallbackLeads = function (){
		
			var http_config = {
				url : baseUrl + 'apis/callback_leads.php',
				method : 'POST',
				data : {
					user_id : $scope.loginUser.id
				}
			};
			
			var leads_response = httpService.makeRequest(http_config);
			
			leads_response.then(function (success){
				
				if(success.data){
					$scope.callback_leads = success.data;
				}
			});	
		};
		
		$scope.getCallbackLeads ();
	});
	
	/**
	 * technical issue leads 
	 */
	
	app.controller('technicalIssueLeads', function ($scope, httpService, baseUrl){
		
		$scope.technical_issues_leads = [];
		
		$scope.getTechnicalIssueLeads = function (){
			
			var http_config = {
				url : baseUrl + 'apis/technical_issue_leads.php',
				method : 'POST',
				data : {
					user_id : $scope.loginUser.id
				}
			};
			
			var leads_response = httpService.makeRequest(http_config);
			
			leads_response.then(function (success){
				
				if(success.data){
					$scope.technical_issues_leads = success.data;
				}
			});
		};
		
		$scope.getTechnicalIssueLeads ();
	});
	
	// custom directive isValue

	app.directive('isValue', function(){
		
		return {
			restrict : 'A',
			scope : {
				value : '@'
			},
			link : function (scope, tElement, tAttr){
				if(scope.value === ''){
					tElement.innerText = 'NA';
				}
			}
		};
	});
	
} (app, jQuery));


/**
 * Directive: assign
 * 
 */

app.directive('assignBtn', function (){

	return {
	
		restrict : 'EA',
		scope : {
			emp : '=',
			enquiry_id : '@'
		},
		link : function (scope, tElement, tAttr){
			
		},
		controller : function ($scope){
			
			console.log($scope.emp);
			console.log($scope.enquiry_id);
			
		}
	};
});