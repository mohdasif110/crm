
/*App module script to configure modules*/

var app		= app || {};
var Pace	= Pace || {};

( function ( Pace, $ ) {

	// module dependency of ngRoute module 
	app = angular.module ( 'app', ['ngRoute', 'ngSanitize', 'ngAnimate', 'ui.bootstrap','ui.router'] );

	app.value ( 'application_blocks', {
		left_sidebar_path: "html/sidebar/left_side_nav.html",
		right_sidebar_path: "html/sidebar/right_side_nav.html",
		header_path: "html/header/index.html"
	} );

	app.value ( 'appUrls', {
		baseUrl: 'http://52.77.73.171/CRM/',
		stuffUrl: 'http://52.77.73.171/CRM/stuff/',
		appUrl: 'http://52.77.73.171/CRM/app/',
		apiUrl: 'http://52.77.73.171/CRM/apis/'
	} );

	// App layout
	app.value ( 'appLayout', {
		width: '1119px',
		minHeight: '1164px',
		height: '',
		backgroundColor: '#F7F7F7'
	} );

	app.constant ( 'baseUrl', 'http://52.77.73.171/CRM/' );
	
	app.value ('officeAddress', 'Raisina Farms Pvt. Ltd.Minus One, Raheja Mall,Sec-47, Gurgaon - 122007');
	
	var email_template_events = [
		{title : 'Not Interested'	, value :'not_interested'},
		{title : 'Just Enquiry'	, value :'just_enquiry'},
		{title : 'Meeting Done'	, value :'meeting_done'},
		{title : 'Meeting Schedule'	, value :'meeting_schedule'},
		{title : 'Meeting Reschedule'	, value :'meeting_reschedule'},
		{title : 'Meeting Reject'	, value :'meeting_reject'},
		{title : 'Site Visit Done'	, value :'site_visit_done'},
		{title : 'Site Visit Schedule'	, value :'site_visit_schedule'},
		{title : 'Site Visit Reject', value : 'site_visit_reject'},
		{title : 'Site Visit Reschedule'	, value :'site_visit_reschedule'},
		{title : 'Call Back', value :'call_back'},
		{title : 'Escalation', value: 'esclation'}
	];

	var message_template_events = [
		{title : 'Not Interested'	, value :'not_interested'},
		{title : 'Just Enquiry'	, value :'just_enquiry'},
		{title : 'Meeting Done'	, value :'meeting_done'},
		{title : 'Meeting Schedule'	, value :'meeting_schedule'},
		{title : 'Meeting Reschedule'	, value :'meeting_reschedule'},
		{title : 'Meeting Reject'	, value :'meeting_reject'},
		{title : 'Site Visit Done'	, value :'site_visit_done'},
		{title : 'Site Visit Schedule'	, value :'site_visit_schedule'},
		{title : 'Site Visit Reject', value : 'site_visit_reject'},
		{title : 'Site Visit Reschedule'	, value :'site_visit_reschedule'},
		{title : 'Call Back', value :'call_back'},
		{title : 'Escalation', value: 'esclation'}
	];

	app.constant ('email_template_events',email_template_events);
	app.constant ('message_template_events', message_template_events);
	
	// configuration of TLCRM 
	app.constant('tlcrm_config', {
		
		disposition_status : {
			meeting : ['schedule','reschedule'],
			site_visit : ['schedule','reschedule']
		}
	});
	
	app.constant ( 'notify', {
		template: '<div><notification-message></notification-message/></div>'
	} );

	// Application configuration block
	app.config ( function ( $routeProvider, baseUrl, $locationProvider, $stateProvider, $urlRouterProvider) {

		$routeProvider.caseInsensitiveMatch = true; // Match URL with case insensitive match
		$routeProvider.
				when ( '/', {
					templateUrl: baseUrl + 'html/login/index.html',
					resolve: {
						user_auth: function ( $http, $location ) {
							return $http ( {
								url: baseUrl + 'apis/getCurrentUser.php',
								method: 'GET'
							} ).then ( function ( promise ) {

								if ( promise.data ) {

									// Authenticate user     
									if ( angular.isDefined ( promise.data.id ) ) {
										$location.path ( '/home' );
									}
								}
							} );
						}
					},
					controller: 'loginCtrl'
				} ).
				when ( '/home', {
					templateUrl: baseUrl + 'home.php',
					controller: 'homeCtrl'
				} ).
				when ( '/designation', {
					templateUrl: baseUrl + 'templates/designation.html',
					controller: 'designationCtrl',
					resolve: {user_auth: function ( $http, $location ) {
							return $http ( {
								url: baseUrl + 'apis/getCurrentUser.php',
								method: 'GET'
							} ).then ( function ( promise ) {

								if ( promise.data ) {

									// Authenticate user     
									if ( ! angular.isDefined ( promise.data.id ) ) {
										$location.path ( '/' );
									}
								}
								else {
									$location.path ( '/' );
								}
							} );
						}}
				} ).
				when ( '/employee', {
					templateUrl: baseUrl + 'templates/addEmployee.html',
					controller: 'addEmployeeCtrl',
					resolve: {
						user_auth: function ( $http, $location ) {

							return $http ( {
								url: baseUrl + 'apis/getCurrentUser.php',
								method: 'GET'
							} ).then ( function ( promise ) {

								if ( promise.data ) {

									// Authenticate user     
									if ( ! angular.isDefined ( promise.data.id ) ) {
										$location.path ( '/' );
									}
								}
								else {
									$location.path ( '/' );
								}
							} );
						},
						
						assign_to_employees_list : function (httpService){
							
							return httpService.makeRequest({
								url : baseUrl + 'apis/employees.php',
								method : 'GET'
							}).then(function (success){
								return success.data; // Returning list of employees
							});
						}
					}
				} ).
				when ( '/search-employee/:employee_id?', {
					templateUrl: baseUrl + 'templates/employee_search.html',
					controller: 'employeeSearchCtrl',
					resolve: {user_auth: function ( $http, $location ) {
							return $http ( {
								url: baseUrl + 'apis/getCurrentUser.php',
								method: 'GET'
							} ).then ( function ( promise ) {

								if ( promise.data ) {

									// Authenticate user     
									if ( ! angular.isDefined ( promise.data.id ) ) {
										$location.path ( '/' );
									}
								}
								else {
									$location.path ( '/' );
								}
							} );
						}}
				} ).
				when ( '/update_employee/:employee_id?', {
					templateUrl: baseUrl + 'templates/update_employee.html',
					controller: 'editEmployeeCtrl',
					resolve: {user_auth: function ( $http, $location ) {
							return $http ( {
								url: baseUrl + 'apis/getCurrentUser.php',
								method: 'GET'
							} ).then ( function ( promise ) {

								if ( promise.data ) {

									// Authenticate user     
									if ( ! angular.isDefined ( promise.data.id ) ) {
										$location.path ( '/' );
									}
								}
								else {
									$location.path ( '/' );
								}
							} );
						}}
				} ).
				when ( '/managePriviledge/:designation_id?', {
					templateUrl: baseUrl + 'templates/priviledges.html',
					controller: 'managePriviledgeCtrl',
					resolve: {
						user_auth: function ( $http, $location ) {
							return $http ( {
								url: baseUrl + 'apis/getCurrentUser.php',
								method: 'GET'
							} ).then ( function ( promise ) {

								if ( promise.data ) {

									// Authenticate user     
									if ( ! angular.isDefined ( promise.data.id ) ) {
										$location.path ( '/' );
									}
								}
								else {
									$location.path ( '/' );
								}
							} );
						}}
				} ).
				when ( '/moduleManager', {
					templateUrl: baseUrl + 'templates/module_manager.html',
					controller: 'moduleManagerCtrl',
					resolve: {user_auth: function ( $http, $location ) {
							return $http ( {
								url: baseUrl + 'apis/getCurrentUser.php',
								method: 'GET'
							} ).then ( function ( promise ) {

								if ( promise.data ) {

									// Authenticate user     
									if ( ! angular.isDefined ( promise.data.id ) ) {
										$location.path ( '/' );
									}
								}
								else {
									$location.path ( '/' );
								}
							} );
						}}
				} ).
				when ( '/primary-campaign', {
					templateUrl: baseUrl + 'templates/addPrimaryCampaign.html',
					controller: 'primaryCampaignCtrl',
					resolve: {user_auth: function ( $http, $location ) {
							return $http ( {
								url: baseUrl + 'apis/getCurrentUser.php',
								method: 'GET'
							} ).then ( function ( promise ) {

								if ( promise.data ) {

									// Authenticate user     
									if ( ! angular.isDefined ( promise.data.id ) ) {
										$location.path ( '/' );
									}
								}
								else {
									$location.path ( '/' );
								}
							} );
						}}
				} ).
				when ( '/secondary-campaign', {
					templateUrl: baseUrl + 'templates/addSecondaryCampaign.html',
					controller: 'secondaryCampaignCtrl',
					resolve: {
						user_auth: function ( $http, $location ) {
							return $http ( {
								url: baseUrl + 'apis/getCurrentUser.php',
								method: 'GET'
							} ).then ( function ( promise ) {

								if ( promise.data ) {

									// Authenticate user     
									if ( ! angular.isDefined ( promise.data.id ) ) {
										$location.path ( '/' );
									}
								}
								else {
									$location.path ( '/' );
								}
							} );
						}
					}
				} ).
				when ( '/disposition-group-master', {
					templateUrl: baseUrl + 'templates/disposition_group.html',
					controller: 'dispositionGroupCtrl',
					resolve: {user_auth: function ( $http, $location ) {
							return $http ( {
								url: baseUrl + 'apis/getCurrentUser.php',
								method: 'GET'
							} ).then ( function ( promise ) {

								if ( promise.data ) {

									// Authenticate user     
									if ( ! angular.isDefined ( promise.data.id ) ) {
										$location.path ( '/' );
									}
								}
								else {
									$location.path ( '/' );
								}
							} );
						}}
				} ).
				when ( '/disposition-status-master', {
					templateUrl: baseUrl + 'templates/disposition_group_status.html',
					controller: 'dispositionGroupStatusCtrl',
					resolve: {user_auth: function ( $http, $location ) {
							return $http ( {
								url: baseUrl + 'apis/getCurrentUser.php',
								method: 'GET'
							} ).then ( function ( promise ) {

								if ( promise.data ) {

									// Authenticate user     
									if ( ! angular.isDefined ( promise.data.id ) ) {
										$location.path ( '/' );
									}
								}
								else {
									$location.path ( '/' );
								}
							} );
						}}
				} ).
				when ( '/manage-disposition-group-mapping/:group_id/:group_name', {
					templateUrl: baseUrl + 'templates/mapping.html',
					resolve: {
						assigned_status: function ( utilityService, $routeParams ) {
							return {
								status_ids: function () {
									var group_id = $routeParams.group_id;
									var promise = utilityService.get_disposition_group_status ( group_id );
									return promise;
								}
							};
						},
						user_auth: function ( $http, $location ) {
							return $http ( {
								url: baseUrl + 'apis/getCurrentUser.php',
								method: 'GET'
							} ).then ( function ( promise ) {

								if ( promise.data ) {

									// Authenticate user     
									if ( ! angular.isDefined ( promise.data.id ) ) {
										$location.path ( '/' );
									}
								}
								else {
									$location.path ( '/' );
								}
							} );
						}
					},
					controller: 'mapping'
				} ).
				when ( '/add-lead', {
					templateUrl: baseUrl + 'templates/add_lead_form.html',
					controller: 'addLeadCtrl',
					resolve: {
						user_session: function ( $http, $location ) {
							return $http ( {
								url: baseUrl + 'apis/getCurrentUser.php',
								method: 'GET'
							} ).then ( function ( promise ) {

								if ( promise.data ) {

									// Authenticate user     
									if ( ! angular.isDefined ( promise.data.id ) ) {
										$location.path ( '/' );
									}else{
										return promise.data;
									}
									
								}
								else {
									$location.path ( '/' );
								}
							} );
						}
					}
				} ).
				when ( '/edit-lead/:enquiry_id/:lead_id?', {
					templateUrl: baseUrl + 'templates/edit_lead_form.html',
					controller: 'editLeadCtrl',
					resolve: {
						client_data: function ( $http, $routeParams ) {

							var enquiry_id = $routeParams.enquiry_id;
						},
						primaryLeadSource: function ( $http, httpService ) {
							var data = new Array;

							var http_config = {
								url: baseUrl + 'apis/helper.php?method=getCampaigns&params=campaign_type:primary',
								method: 'GET'
							};

							var primary_lead_source = httpService.makeRequest ( http_config );
							return primary_lead_source;
						}
					} // End of resolve 
				} ).
				when ( '/lead-enqueries', {
					templateUrl: baseUrl + 'templates/lead_enquiry.html',
					controller: 'leadEnquiryCtrl'
				} ).
				when ( '/all-lead', {
					templateUrl: baseUrl + 'templates/all-leads.html',
					controller: 'allLeadCtrl',
					resolve: {
						user_auth: function ( $http, $location ) {
							return $http ( {
								url: baseUrl + 'apis/getCurrentUser.php',
								method: 'GET'
							} ).then ( function ( promise ) {

								if ( promise.data ) {

									// Authenticate user     
									if ( ! angular.isDefined ( promise.data.id ) ) {
										$location.path ( '/' );
									}
								}
								else {
									$location.path ( '/' );
								}
							} );
						}
					}
				} ).
				when ( '/my-leads', {
//					templateUrl: baseUrl + 'templates/tl_crm_leads.html',
					templateUrl: baseUrl + 'templates/my-leads.html',
					controller: 'myLeadsCtrl',
					resolve: {
						user_session : function (httpService){
							
							return httpService.makeRequest({
								url : baseUrl + 'apis/getCurrentUser.php',
								method : 'GET'
							}).then(function (success){
								return success.data;
							});
						},
						
						reportees: function (httpService){
							
						},
						
						disposition_status_list: function ( httpService ) {

							return httpService.makeRequest ( {url: baseUrl + 'apis/get_disposition_status_list.php', method: 'GET'} ).then ( function ( success ) {
								return success.data;
							} );
						},
						
						sales_person: function ( $http ) {
							return $http (
									{
										url: baseUrl + 'apis/getEmployeeByDesignation.php',
										method: 'POST',
										data: $.param ( {slug: 'sales_person'} ),
										headers: {
											'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
										}
									} ).then ( function ( success ) {

								return ( success.data.data );
							} );
						}
					}
				} ).
				when ( '/assigned-leads', {
					templateUrl: baseUrl + 'templates/assigned_leads.html',
					controller: 'assignedLeadsCtrl',
					resolve: {
						disposition_status_list: function ( httpService ) {

							return httpService.makeRequest ( {url: baseUrl + 'apis/get_disposition_status_list.php', method: 'GET'} ).then ( function ( success ) {
								return success.data;
							} );
						}
					}
				} ).
				when ( '/assign-disposition-group/:role/:id', {
					templateUrl: baseUrl + 'templates/assign_disposition_group.htm',
					controller: 'dispositionGroupAssignmentCtrl',
					resolve: {
						user_auth: function ( $http, $location ) {
							return $http ( {
								url: baseUrl + 'apis/getCurrentUser.php',
								method: 'GET'
							} ).then ( function ( promise ) {

								if ( promise.data ) {

									// Authenticate user     
									if ( ! angular.isDefined ( promise.data.id ) ) {
										$location.path ( '/' );
									}
								}
								else {
									$location.path ( '/' );
								}
							} );
						}
					}
				} ).
				when ( '/add-disposition-group', {
					templateUrl: baseUrl + 'templates/admin/add_disposition_group.htm',
					controller: function ( $scope, utilityService, Session, user, $log, httpService ) {

						$log.info ( user );

						$scope.module = 'Admin disposition group';
						$scope.user = user;

						console.log ( $scope.user );
						// Getting admin group name 
						$scope.disposition_group = {
						};

						$scope.getAdminGroup = function () {

							var promise = utilityService.getAdminDispositionGroup ( 'admin', $scope.user.id );

							promise.then ( function ( response ) {

								if ( angular.isDefined ( response.data ) ) {
									$scope.disposition_group = response.data;
									if ( $scope.disposition_group.assign !== null ) {
										$scope.assign = 1;
									}
									else {
										$scope.assign = 0;
									}
								}
							} );
						};

						$scope.getAdminGroup ();

						$scope.setdisposition_group = function ( event ) {
							var response = '';

							if ( $ ( event.currentTarget ).prop ( 'checked' ) ) {
								// Save disposition group 
								response = utilityService.saveAdminDispositionGroup ( $scope.disposition_group.id, $scope.user.id, 1 );
							}
							else {
								// remove disposition group 
								response = utilityService.saveAdminDispositionGroup ( $scope.disposition_group.id, $scope.user.id, 0 );
							}

							response.then ( function ( promise ) {
								if ( promise.data.success == 1 ) {
									$scope.notify ( {message: promise.data.message, 'class': ['alert', 'alert-success', 'bottom-right']} );
								}
								else {
									$scope.notify ( {message: promise.data.message, 'class': ['alert', 'alert-warning', 'bottom-right']} );
								}
							} );
						};

					},
					resolve: {
						user: function ( Session, httpService ) {

							if ( angular.isUndefined ( Session.getUser () ) ) {

								// Call to server to authenticate user 
								var user_authenticate = httpService.makeRequest ( {url: baseUrl + 'apis/getCurrentUser.php', method: 'GET'} );

								user_authenticate.then ( function ( success ) {

									if ( success.data ) {

										if ( success.data.id ) {

											Session.createUser = success.data;
											return success.data;
										}
										else {
											$location.path ( '/' ); // Redirect user to login page 
										}
									}
									else {
										$location.path ( '/' ); // Redirect user to login page 
									}
								}, function ( error ) {

								} );
								return user_authenticate;
							}
							else {
								return Session.getUser ();
							}

						}
					}

				} ).
				when ( '/lead-management', {
			templateUrl: baseUrl + 'templates/lead_enquiry.html',
			controller: 'leadEnquiryCtrl',
			resolve: {
				user_auth: function ( $http, $location ) {
					return $http ( {
						url: baseUrl + 'apis/getCurrentUser.php',
						method: 'GET'
					} ).then ( function ( promise ) {

						if ( promise.data ) {
							// Authenticate user     
							if ( ! angular.isDefined ( promise.data.id ) ) {
								$location.path ( '/' );
							}
						}
						else {
							$location.path ( '/' );
						}
					} );
				}
			}
		} ).
				when('/manage_disposition_group_status/:group/:group_id/:employee_id', {
					templateUrl : baseUrl + 'templates/manage_employee_disposition_status.html',
					resolve : {
						
						disposition_group : function ($route, $http){
							var params = $route.current.params;
							var group_id = params.group_id;
							var employee_id  = params.employee_id;
							
							return $http({
								url : baseUrl + 'apis/helper.php?method=getDispositionGroupData&params=group_id:'+group_id+'/employee_id:'+employee_id
							});
						},
						
						employee_name : function ($route, httpService){
							
							var employee_id = $route.current.params.employee_id;
							
							return httpService.makeRequest({url : baseUrl + 'apis/helper.php?method=getEmployeeNameById&params=employee_id:'+employee_id , method : 'GET'}).then(function (success){
								
								return success.data;
							});
						}
						
					},
					controller : 'manageEmpDispositionGroupCtrl' 
				}).
				when('/lead_detail/:enquiry_id/:lead_id?/:sub_page?', {
					templateUrl : baseUrl + 'templates/view_lead.html',
					controller : 'viewLeadCtrl',
					resolve : {
						user_session : function (httpService){
								
								var user_session = [];
								
								return httpService.makeRequest({
									url : baseUrl + 'apis/getCurrentUser.php',
									method : 'GET'
									
								}).then(function (success){
									
									return success.data;
								});							
						},
						
						enquiry_status : function ($route, httpService){
							
							var params = $route.current.params;
							var enquiry_id = params.enquiry_id;
							var lead_id ='';
							
							if(params.lead_id){
								lead_id = params.lead_id;
							}
							
							return httpService.makeRequest({
								url : baseUrl + 'apis/helper.php?method=getEnquiryActionStatus&params=enquiry_id:'+enquiry_id+'/lead_id:'+lead_id,
								method : 'GET'
							}).then(function (success){
								
								if(parseInt(success.data.success) === 1){
									return success.data.data;
								}else{
									return [];
								}
								
							}, function (error){
								
							});
							
						},
						
						sales_persons : function ($http){
							
							return $http (
									{
										url: baseUrl + 'apis/getEmployeeByDesignation.php',
										method: 'POST',
										data: $.param ( {slug: 'sales_person'} ),
										headers: {
											'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
										}
									}).then ( function ( success ) {

											return ( success.data.data );
									});
						},
						
						is_lead_accepted : function ($route, httpService){
							
							var params		= $route.current.params;
							var enquiry_id	= params.enquiry_id;
							var lead_id		= 'NULL';
							
							if(params.lead_id){
								lead_id = params.lead_id;
							}
							
							return httpService.makeRequest({
								url : baseUrl + 'apis/helper.php?method=getLeadAcceptStatus&params=enquiry_id:'+enquiry_id+'/lead_id:'+lead_id,
								method : 'POST',
								data : {
									enquiry_id : enquiry_id,
									lead_id : lead_id
								}
							}).then(function (success){
								
								return success.data.accept_status;
							});
						}
					}
							
				}).
				when('/email-template-system', {
					templateUrl : baseUrl + 'templates/email_templates.html',
					controller : 'emailTemplateCtrl',
					resolve : {
						user_session : function (httpService){
								
								var user_session = [];
								
								return httpService.makeRequest({
									url : baseUrl + 'apis/getCurrentUser.php',
									method : 'GET'
								}).then(function (success){
									
									return success.data;
								});							
						},
						
						templates : function (httpService){
							
							return httpService.makeRequest({
								url : baseUrl + 'apis/get_email_templates.php',
								method : 'GET'
							}).then(function (successCallback){
								return successCallback.data;
							});
						}
					}
				}).
				when('/add_email_template', {
					templateUrl : baseUrl + 'templates/add_email_template.html',
					controller : 'addEmailTemplateCtrl',
					resolve : {
						user_session : function (httpService){
							var user_session = [];
							return httpService.makeRequest({
								url : baseUrl + 'apis/getCurrentUser.php',
								method : 'GET'
							}).then(function (success){
								return success.data;
							});	
						},
						
						email_users : function (httpService){
							
							return httpService.makeRequest({
								url : baseUrl + 'apis/get_email_users.php',
								method : 'GET'
							}).then(function (success){
								return success.data;
							});
						}
					}
				}).
				when('/edit_email_template/:template_id', {
					templateUrl : baseUrl + 'templates/add_email_template.html',
					controller : function ($scope, email_template_events, email_template, email_users, $filter, httpService, $window, $route, baseUrl, user_session,$routeParams,$location){
						
						$scope.user						= user_session; // Logged in user session
						
						var template_id					=  $routeParams.template_id; // template id 
						
						$scope.page_title				= 'Edit Email Template';
						$scope.email_template_events	= email_template_events;
						$scope.email_users				= email_users;
						$scope.submit_btn_label			= 'Update';
						
						$scope.email_template = {};
						
						var template						= email_template[0]; // data of email template to edit
						$scope.email_template.subject		= template.subject;
						$scope.email_template.event			= template.event; 
						$scope.email_template.category		= template.email_category;
						$scope.email_template.template_id	= template_id;
						
						var email_message					= template.message_body;
						$scope.email_template.message		= email_message;
						
						$('#summernote').summernote('code', email_message);
						
						$scope.to	= [];
						$scope.cc	= [];
						$scope.bcc	= [];
						
						/**
						 * Pushing email users to respective group 
						 */
						angular.forEach (template.to_users, function(val, key){
							$scope.to.push(val.id);
						});
						angular.forEach (template.cc_users, function(val, key){
							$scope.cc.push(val.id);
						});
						angular.forEach (template.bcc_users, function(val, key){
							$scope.bcc.push(val.id);
						});
						
						// auto select drop down values of to, cc and bcc email users list  
						$('#to_user').val($scope.to).prop('selected', true);
						$('#cc_user').val($scope.cc).prop('selected', true);
						$('#bcc_user').val($scope.bcc).prop('selected', true);
						
						$scope.clearError = function (element_id){
							var dom_element = '#' + element_id;
							angular.element(dom_element).removeClass ('parsley_error').next().html('');
						};
						
						$scope.resetFormErrors = function (){
							var element_classes = ['email_category','email_event','email_subject'];			
							angular.forEach (element_classes, function(val){
								var element_id = '#' + val;
								angular.element(element_id + '_help_block').html('');
								angular.element(element_id).removeClass('parsley_error');
							});
						};
						
						$scope.saveTemplate = function (){
							
							$scope.resetFormErrors();
							var error_flag	= false;
							var markupStr	= $('#summernote').summernote('code');
							$scope.email_template.message = markupStr; // Get message body data again if any change has been made to message 
							
							// category validation
							if(!$scope.email_template.category){
								angular.element('#email_category').addClass('parsley_error');
								angular.element('#email_category_help_block').html('Email category is required');
								error_flag = true;
							}
			
							// event validation
							if(!$scope.email_template.event){
								angular.element('#email_event').addClass('parsley_error');
								angular.element('#email_event_help_block').html('Email event is required');
								error_flag = true;
							}
			
							// subject validation
							if(!$scope.email_template.subject){
								angular.element('#email_subject').addClass('parsley_error');
								angular.element('#email_subject_help_block').html('Email subject is required');
								error_flag = true;
							}

							if(error_flag){
								return false;
							}
							
							if($scope.to.length){
								$scope.email_template.toUsers = [];
					
								angular.forEach($scope.to, function (val){
									var temp_to_user = $filter('filter')($scope.email_users, {id : val}, true);
									$scope.email_template.toUsers.push( temp_to_user[0] );
								});
							}else{
								$scope.email_template.toUsers = [];
							}
				
							if($scope.cc.length){	
					
								$scope.email_template.ccUsers = [];
					
								angular.forEach($scope.cc, function (val){
									var temp_cc_user = $filter('filter')($scope.email_users, {id : val}, true);
									$scope.email_template.ccUsers.push( temp_cc_user[0] );
								});
							}else{
								$scope.email_template.ccUsers = [];
							}
				
							if($scope.bcc.length){					
					
								$scope.email_template.bccUsers = [];
					
								angular.forEach($scope.bcc, function (val){
									var temp_bcc_user = $filter('filter')($scope.email_users, {id : val}, true);
									$scope.email_template.bccUsers.push( temp_bcc_user[0] );
								});
							}else{
								$scope.email_template.bccUsers = [];
							}
						
							// making http request to server to update the template 
							
							var save_email_template = httpService.makeRequest({
					
								url : baseUrl + 'apis/save_email_template.php',
								method : 'POST',
								data : {
									template_data	: $scope.email_template,
									user_id			: $scope.user.id,
									mode			: 'edit'
								}
							});
				
							save_email_template.then(function (successCallback){

								if(parseInt(successCallback.data.success === 1)){
									
									$scope.notify({
										message : successCallback.data.message,
										class : ['alert alert-success center-aligned']
									});

									$window.location.reload();		
								}else{
									$scope.notify({
										message : successCallback.data.message,
										class : ['alert alert-warning center-aligned']
									});
								}
							}, function (errorCallback){
								alert('Some error has been occurred.');
							});
							
						}; // End save template function 
						
						$scope.back_to_list = function (){
								$location.path('/email-template-system');
						};
						
					},
					resolve : {
						email_template : function (httpService, $route){
							
							var template_id = $route.current.params.template_id;
							return httpService.makeRequest({
								url : baseUrl + 'apis/get_email_templates.php?template_id='+template_id,
								method : 'GET'
							}).then(function (successCallback){
								return successCallback.data;
							});
						},
						email_users : function (httpService){
							
							return httpService.makeRequest({
								url : baseUrl + 'apis/get_email_users.php',
								method : 'GET'
							}).then(function (success){
								return success.data;
							});
						},
						user_session : function (httpService){
							var user_session = [];
							return httpService.makeRequest({
								url : baseUrl + 'apis/getCurrentUser.php',
								method : 'GET'
							}).then(function (success){
								return success.data;
							});
						}
					}
				}).
				when('/message-communication-templates', {
							templateUrl : baseUrl + 'templates/message_templates.html',
							controller : 'messageTemplatesCtrl',
							resolve : {
								user_session : function (httpService){
									return httpService.makeRequest({
										url : baseUrl + 'apis/getCurrentUser.php',
										method : 'GET'
									}).then(function (success){
										return success.data;
									});
								},
								message_templates : function ($route, httpService){
									
									return httpService.makeRequest({
										url : baseUrl + 'apis/get_message_templates.php',
										method : 'GET'
									}).then(function (successCallback){
										return successCallback.data;
									});
									
								}
							}
						}).
				when('/add_message_template', {
					templateUrl : baseUrl + '/templates/add_message_template.html',
					controller : 'addMessageTemplateCtrl',
					resolve : {
						user_session : function (httpService){
							
							return httpService.makeRequest({
								url : baseUrl + 'apis/getCurrentUser.php',
								method : 'GET'
							}).then(function (success){
								return success.data;
							});
						}
					}
				}).
				when('/edit_message_template/:template_id',{
							templateUrl : baseUrl + 'templates/add_message_template.html',
							controller : function ($scope,message_template, user_session, message_template_events, httpService, $route){
								$scope.user = user_session;
								var $template = message_template;
								
										
								$scope.page_title = 'Edit Template';
								$scope.submit_btn_label = 'Edit Template';
								$scope.message_event_templates = message_template_events;
								
								$scope.message_template = {};
								$scope.message_template.template_id		= $template[0].template_id;
								$scope.message_template.category		= $template[0].message_category;
								$scope.message_template.event			= $template[0].event;
								$scope.message_template.message_text	= $template[0].message;
								
								if($template[0].default_numbers.length > 0){
									$scope.message_template.numbers = $template[0].default_numbers;
									$scope.number = $template[0].default_numbers.join(',');
								}
								
								$scope.addNumber = function (number){
		
									if(number){
										// split string from comma
										$scope.message_template.numbers = number.split(',');
									}else{
										$scope.message_template.numbers = [];			
									}			
								};
		
								$scope.clearError = function (element_id){
									var dom_element = '#' + element_id;
									var help_block = '#' + element_id + '_help_block';

									angular.element(dom_element).removeClass ('parsley_error');
									angular.element(help_block).html('');
								};
								
								
								$scope.saveTemplate = function (){
		
									// Validations 
			
									var error_flag = false;
			
									if($scope.message_template.category === undefined){
										angular.element('#message_category').addClass('parsley_error');
										angular.element('#message_category_help_block').html('Please select message category');
										error_flag = true;
									}
			
									if($scope.message_template.event === undefined){
										angular.element('#message_event').addClass('parsley_error');
										angular.element('#message_event_help_block').html('Please select message event');
										error_flag = true;
									}
			
									if($scope.message_template.message_text === undefined){
										angular.element('#message_text').addClass('parsley_error');
										angular.element('#message_text_help_block').html('Message text is required');
										error_flag = true;
									}
			
									if(error_flag){
										return false;
									}else{
				
										var save_template = httpService.makeRequest({
					
											url : baseUrl + 'apis/add_message_template.php',
											method : 'POST',
											data : {
												message_data	: $scope.message_template,
												user_id			: $scope.user.id,
												mode : 'edit'
											}
										});
				
										save_template.then(function (succcessCallback){
					
											if(parseInt(succcessCallback.data.success === 1)){

												$scope.notify({
													class:['alert','alert-success','center-aligned'],
													message : succcessCallback.data.message
												});

												$route.reload();

											}else{
												$scope.notify({
													class:['alert','alert-warning','center-aligned'],
													message : succcessCallback.data.message
												});
											}
										});
									}
								};
							},
							resolve : {
								user_session : function (httpService){
									return httpService.makeRequest({
										url : baseUrl + 'apis/getCurrentUser.php',
										method : 'GET'
									}).then(function (success){
										return success.data;
									});
								},
								
								message_template : function (httpService, $route){
									var template_id = $route.current.params.template_id;
									return httpService.makeRequest({
										url : baseUrl + 'apis/get_message_templates.php?template_id='+template_id,
										method : 'GET'
									}).then(function (successCallback){
										return successCallback.data;
									});
								}
							}
				}).
				when('/capacity-area-sales-manager', {
					templateUrl : baseUrl + '/templates/capacity_asm.html',
					controller : 'capacityManagerAsmCtrl',
					resolve : {
						user_session : function (httpService){
							return httpService.makeRequest({
								url : baseUrl + 'apis/getCurrentUser.php',
								method : 'GET'
							}).then(function (success){
								return success.data;
							});
						},
						asm : function (httpService){
							return httpService.makeRequest({
								url : baseUrl + 'apis/helper.php?method=getAsmEmployees',
								method : 'GET',
								data : {}
							}).then(function (success){
								return success.data;
							});
						},
						asm_projects : function ($route, httpService){
							
							var asm_id = $route.current.params.asm_id;
							
							var projects = httpService.makeRequest({
								url : baseUrl + 'apis/helper.php?method=get_area_sales_manager_projects&params=asm_user:'+asm_id,
								method : 'GET'
							});
							
							return projects.then(function (successCallback){
								return successCallback.data;
							});
							
						}
					}
				}).
				when('/capacity-sales-person', {
					templateUrl : baseUrl + 'templates/sales_person_capacity.html',
					controller : 'salesPersonCapacityCtrl',
					resolve : {
						user_session : function (httpService){
							return httpService.makeRequest({
								url : baseUrl + 'apis/getCurrentUser.php',
								method : 'GET'
							}).then(function (success){
								return success.data;
							});
						},
						sales_person : function (httpService){
							
							return httpService.makeRequest({
								url : baseUrl + 'apis/get_all_sales_person.php',
								method : 'POST'
							}).then(function (success){
								return success.data;
							});
							
						}
					}
				}).
				when('/add_sales_person_capacity/:sales_person_id/:manager_id/:manager_capacity/:mode',{
					templateUrl : baseUrl + 'templates/add_sales_person_capacity.html',
					controller	: 'addSalesPersonCapacityCtrl',
					resolve : {
						
						user_session : function (httpService){
							return httpService.makeRequest({
								url : baseUrl + 'apis/getCurrentUser.php',
								method : 'GET'
							}).then(function (success){
								return success.data;
							});
						},
						sales_person_remaining_capacity : function ($route, httpService){
							
							var asm_id				= $route.current.params.manager_id;
							var threshold_capacity	= $route.current.params.manager_capacity;
							var sales_person_id		= $route.current.params.sales_person_id;
							var remaining_capacity	= httpService.makeRequest({
								url : baseUrl + 'apis/helper.php?method=getSalesPersonMaxCapacity&params=asm_id:'+asm_id+'/sales_person_id:'+sales_person_id+'/asm_capacity:'+threshold_capacity,
								method : 'GET'
							});
							
							return remaining_capacity.then(function (success){
								return success.data;
							});
						},
						
						sales_person_details : function ($route, httpService){
						
							var asm_id				= $route.current.params.manager_id;
							var sales_person_id		= $route.current.params.sales_person_id;
							
							return (httpService.makeRequest({
								url : baseUrl + 'apis/helper.php?method=get_sales_person_details&params=id:'+sales_person_id,
								method : 'GET'
							})).then(function (successCallback){
								console.log(successCallback.data);
									return successCallback.data;
							});
						}
						
					}
				}).	
				when('/capacity/:designation_slug?', {
					templateUrl : baseUrl + 'templates/asm_capacity_listing.html',
					resolve : {
						user_session : function (httpService){
							return httpService.makeRequest({
								url : baseUrl + 'apis/getCurrentUser.php',
								method : 'GET'
							}).then(function (success){
								
								return success.data;
							});
						},
						capacities : function (httpService){
							
							var capacities = httpService.makeRequest({
								url : baseUrl + 'apis/get_asm_capacities.php',
								method : 'GET'
							});
							
							return capacities.then(function(successCallback){
								return successCallback.data;
							});
						}
					},
					controller : 'capacities_asm'
				}).		
				when('/edit_capacity_asm/:asm_id', {
					templateUrl : baseUrl + 'templates/capacity_asm.html',
					controller : 'capacityManagerAsmCtrl',
					resolve : {
						user_session : function (httpService){
							return httpService.makeRequest({
								url : baseUrl + 'apis/getCurrentUser.php',
								method : 'GET'
							}).then(function (success){
								return success.data;
							});
						},
						asm : function (httpService){
							return httpService.makeRequest({
								url : baseUrl + 'apis/helper.php?method=getAsmEmployees',
								method : 'GET',
								data : {}
							}).then(function (success){
								return success.data;
							});
						},
						asm_projects: function ($route, httpService){
							
							var asm_id	= $route.current.params.asm_id;
							var month	= new Date().getMonth ();
							var year	= new Date().getFullYear ().toString ();
							
							var projects = httpService.makeRequest({
								url : baseUrl + 'apis/helper.php?method=get_area_sales_manager_projects&params=asm_user:'+asm_id+'/month:'+month+'/year:'+year,
								method : 'GET'
							});
							
							return projects.then(function (successCallback){
								return successCallback.data;
							});
							
						}
					}
				}).		
				when('/previous_capacities/:user_id/:designation_slug?', {
					templateUrl : baseUrl + 'templates/previousCapacitiesListing.html',
					resolve		: {
						user_session : function (httpService){
							return httpService.makeRequest({
								url : baseUrl + 'apis/getCurrentUser.php',
								method : 'GET'
							}).then(function (success){
								return success.data;
							});
						},
						user_name : function (httpService, $route){
							var user_id = $route.current.params.user_id;
							
							return httpService.makeRequest ({
								url : baseUrl + 'apis/helper.php?method=getEmployeeNameById&params=user_id:'+ user_id, method : 'GET'
							}).then(function (successResponse){
								return( successResponse.data );
							});
						}
					},
					controller	: 'previousCapacitiesCtrl'
				}).
				when('/testing_page', {
					templateUrl : baseUrl + 'templates/testing_page.html',
					controller : function ($scope, dateUtility){
						
						$scope.names = [
							{id: 1, name: 'Abhishek'},
							{id: 2, name: 'Jeff'},
							{id: 3, name: 'Hitesh'},
							{id: 4, name: 'Abhay'},
						];	
						
						$scope.getPerson = function (person_name){
							
							alert('name in scope - ' + $scope.name);
							alert('name in parameter - ' + person_name);
						};
						
						console.log('Current Date - ' + dateUtility.current_year);
						
					}
				}).		
				otherwise ( {
					// Redirect to home
					redirectTo: '/home'
				} );

		/**
		 * UI-Router Configuration 
		 */
		
		$stateProvider
		
				.state('view_lead_customer_info', {
					templateUrl : baseUrl + 'partials/view_lead/customer_info.html',
					controller : function ($scope, $routeParams, customer_details){
						
						$scope.customer = customer_details;
					},
					resolve : {
						customer_details : function ($route, httpService){
							
							var route_params			= $route.current.params;
							var employee_details		= [];
							var enquiry_id				= route_params.enquiry_id;
							var lead_id					= '';
							
							if(route_params.lead_id){
								lead_id = route_params.lead_id;
							}
							
							var employee = httpService.makeRequest({
								url : baseUrl + 'apis/helper.php?method=getLeadCustomerInfo&params=enquiry_id:'+enquiry_id+'/lead_id:'+lead_id,
								method : 'GET'
							});
							
							return employee.then(function (success){
								
								if(success.data){
									return employee_details = success.data;
								}
							});
							
						}
					}
				})
				
				.state('view_lead_info', {
					templateUrl : baseUrl + 'partials/view_lead/lead_info.html',
					controller : function ($scope, $routeParams, lead_info){
						
						$scope.lead_detail = lead_info;
					},
					resolve : {
						
						lead_info : function (httpService, $route){
							
							var route_params		= $route.current.params;
							var lead_details		= [];
							var enquiry_id			= route_params.enquiry_id;
							var lead_id			= '';
							
							if(route_params.lead_id){
								lead_id = route_params.lead_id;
							}
							
							var lead_response = httpService.makeRequest({
								url : baseUrl + 'apis/get_single_lead.php',
								method : 'POST',
								data : {
									enquiry_id : enquiry_id
								}
							})
							
							return lead_response.then(function (success){
								
								if(success.data){
									console.log(success.data);
									return lead_details = success.data;
								}
							});
						}
					}
					
				})
				
				.state('view_lead_project_info', {
					templateUrl : baseUrl + 'partials/view_lead/lead_project_info.html',
					resolve : {
						params : function ($route){
							var params = $route.current.params;
							return params;
						},
						
						projects : function ($route, httpService){
							
							var params = $route.current.params;
							var enquiry_id = params.enquiry_id;
							var lead_id = '';
							var projects = [];
							
							if(params.lead_id){
								lead_id = params.lead_id;
							}
							
							var project_response = httpService.makeRequest({
								url : baseUrl + 'apis/get_lead_enquiry_projects.php?enquiry_number='+enquiry_id+'&lead_number='+lead_id,
								method : 'GET',
								data : {
									
								}
							}); 
							
							return project_response.then(function (success){
								
								return projects = success.data.data;
							});
						}
					},
					controller : function ($scope, httpService, projects, params, $filter, $route, $state){
						
						$scope.enquiry_id = params.enquiry_id;
						
						if(angular.isDefined (params.lead_id)){
							$scope.lead_number = params.lead_id;
						}
						
						$scope.projects = projects;
						
						$scope.reloadRoute = function (state){
							$route.reload();
						};
						
							/**
							* Function to remove project
							* @returns {undefined}
							*/
						$scope.remove_project = function (p_id){
		   
							var confirm_to_delete = confirm ('Are you sure to delete this project ? ');
		   
							if(confirm_to_delete){
								
								var config = {};

								config.url  = baseUrl + 'apis/remove_lead_enquiry_project.php';
								config.method = 'POST';
								config.data = {
									enquiry_number : $scope.enquiry_id,
									project_id : p_id
								};
			
								var remove_project = httpService.makeRequest (config);
			
								remove_project.then(function (successCallback){

									if( parseInt(successCallback.data.success) === 1){
										$scope.reloadRoute ();
									}else{
										alert('Project could not be removed at this time. Please try again later.');
										return false;
									}
								});
							}
						};
					}
				})
				
				.state('view_lead_history', {
					templateUrl : baseUrl + 'partials/view_lead/lead_history.html',
					resolve : {
						
						history : function ($route, httpService){
							
							var route_params		= $route.current.params;
							var enquiry_id			= route_params.enquiry_id;
							
							if(angular.isDefined (route_params.lead_id)){
								var lead_number = route_params.lead_id;
							}
							
							// calling API to get history of enquiry 
							var history = httpService.makeRequest({
								url : baseUrl + 'apis/getEnquiryHistory.php',
								method : 'POST',
								data : {
									enquiry_id : enquiry_id,
									lead_number : lead_number
								}
							});
							
							return history.then(function (success){
								
									return success.data; // returning response from server
							});
							
						}
						
					},
					controller : function ($scope, $route, history){
						
						$scope.history_data = history;
					}
				})
				
				.state('view_lead_notes', {
					templateUrl : baseUrl +  'partials/view_lead/lead_notes.html',
					controller : 'notesCtrl',
					resolve : {
						enquiry_id : function ($route){
							var route_params		= $route.current.params;
							var enquiry_id			= route_params.enquiry_id;
							return enquiry_id;
						},
						
						notesCount : function ($route, httpService){
							var route_params		= $route.current.params;
							var enquiry_id			= route_params.enquiry_id;
							
							return httpService.makeRequest({
								url : baseUrl + 'apis/helper.php?method=getEnquiryNotesCount&params=enquiry_id:'+enquiry_id,
								method: 'GET'
							}).then(function (success){
								return success.data;
							});
						}
					}
				});
				
				
		// use the HTML5 History API
		$locationProvider.html5Mode ( true );
	} );

	// Application bootstrapping (Run) block

	app.run ( function ( $rootScope, $location, $http, baseUrl, Session ) {

		$rootScope.$on ( '$routeChangeStart', function ( event, next, current ) {
			
			// get Authentiction of user from server and populate userAuthService 
			var authPromise = $http ( {
				url: baseUrl + 'apis/getCurrentUser.php',
				method: 'GET'
			} );

			authPromise.then ( function ( success ) {
				
				if ( parseInt ( success.data ) === 0 ) {
					Session.destroyUser (); // Remove user session data from session service 
					$location.path ( '/' );
				}
				else {
					// Stroing user session in client service 
					Session.createUser ( success.data );
					// Broadcast event to spread out user session in application by Session Service 
					$rootScope.$broadcast ( 'userSession', {user_session: success.data} );
				}

			}, function ( error ) {
				// if server is unavailable to respond or any server side issue is there then we have to prevent user to login in system 
				Session.destroyUser (); // Removing user session client side
				$location.path ( '/' );
			} );
		} );

	} );
	/**
	 * 
	 * @class mainAppCtrl
	 * @fileOverview Main application controller 
	 */
	app.controller ('mainAppCtrl', function ( $scope, application_blocks, appUrls, appLayout, $location, AuthService, baseUrl, Session, $http, notify, $compile, $window, $interval, $rootScope ) {

		$scope.load_left_nav = true; // Default value 
		$scope.left_nav_template_url = application_blocks.left_sidebar_path;

		$scope.loadHeader = true; // Default value
		$scope.header_template_url = application_blocks.header_path;

		$scope.currentUser = {};
		
		$rootScope.$on ( 'userSession', function ( event, data ) {
			$scope.currentUser = data.user_session;
		});
		
		// user assigned modules 
		$scope.modules = null;

		//$scope.auth = AuthService.currentUser;

		// Make left/ right sidebar show or hide page wise 
		$scope.changeSidebarAppearence = function ( sidebar, value ) {

			switch ( sidebar ) {

				case 'right':
					$scope.load_right_nav = value;
					break;

				case'left':

					$scope.load_left_nav = value;

					if ( ! value ) { // For full width layout

						$scope.changeAppLayout ( '100%', '0px', false );
					}
					else {
						$scope.changeAppLayout ( '1119px', '230px', true );
					}

					break;
			}
		};

		// Change the appearance of application header 
		$scope.toggleApplicationHeader = function ( value ) {
			$scope.loadHeader = value;
		};

		// To change main content layout and top header layout
		$scope.changeAppLayout = function ( width, ml, nav_toggle_btn ) {

			angular.element ( '#content-layout' ).css ( {width: width, marginLeft: ml} );
			angular.element ( '#menu-header' ).css ( {width: width, marginLeft: ml} );

			if ( ! nav_toggle_btn ) {
				angular.element ( '.left-nav-expander' ).hide ();
			}
			else {
				angular.element ( '.left-nav-expander' ).show ();
			}

		};

		
		/**
		 * Logout function 
		 * @returns {undefined}
		 */
		$scope.logout = function () {

			var logout = $http ( {
				url: baseUrl + 'apis/logoutUser.php',
				method: 'GET'
			} );

			logout.then ( function ( success ) {

				if ( parseInt(success.data) === 1 ) {

					Session.destroyUser ();
					$location.path ( '/' );
				}
			}, function ( error ) {

			} );
		};

		// End of logout function


		/**
		 * Notification Message function 
		 */
		$scope.notify = function ( notification ) {

			$scope.notificationConfig = notification;
			$ ( 'body .notification-block' ).prepend ( $compile ( notify.template ) ( $scope ) );
		};

		/**End of function **/
		
		// Set Interval to check user session in 1 minute time interval
		$scope.user_session = $interval(function (){
			
			var user_session = Session.checkUserSession();
			
			user_session.then(function (success){
				
				if(typeof success.data === 'object' && !Object.keys(success.data).length){
					Session.destroyUser ();
					$location.path('/');
				}
			});
			 
		}, 60000*3); // 1 minute interval of checking user session 
		
	} );

	app.directive ( 'accountInfo', function ( $http, appUrls ) {
		var info = {};

		info.restrict = 'A';
		info.templateUrl = appUrls.appUrl + 'directives/template/settings_popup.html';
		info.scope = false;
		return info;
	} );

	// Auth service 
	app.factory ( 'AuthService', function ( $http, Session, baseUrl ) {

		var authentication = {};

		authentication.login = function ( credentials ) {
			return  $http ( {
				url: baseUrl + 'apis/login.php',
				method: 'POST',
				data: credentials
			} );
		};

		authentication.isAuthenticated = function () {
			
			var user_session_data = Session.getUser ();
			
			if(user_session_data){
				return true;
			}
			else{
				return false;
			}
//			return Session.getUser ();
		};

		authentication.isAuthorized = function ( authorizedRoles ) {
			return ( this.isAuthenticated () &&
					authorizedRoles.indexOf ( Session.user.role ) !== - 1 );
		};

		return authentication;

	} );

	// Session Service
	app.service ( 'Session', function ($http, $location, baseUrl) {

		var _user = {}; // Private variable 
		
		function isSessionExists(){
			
			return $http ( {
				url: baseUrl + 'apis/getCurrentUser.php',
				method: 'GET'
			} );
		};
		
		this.createUser = function ( user ) {
			_user = user;
			this.isSessionAvailable = true;
		};

		this.destroyUser = function () {
			_user = {};
			this.isSessionAvailable = false;
		};

		this.getUser = function () {
			return _user;
		};
		
		this.checkUserSession = function (){
			return isSessionExists();
		};

		this.isSessionAvailable = false;
	} );
	
	app.factory('refreshUserSession');

	/**
	 * Mapping Controller 
	 */
	app.controller ( 'mapping', function ( $scope, utilityService, $routeParams, assigned_status, $location, $route, user_auth ) {

		$scope.groupName = $routeParams.group_name;
		$scope.groupId = $routeParams.group_id;

		$scope.assigned_status = [];

		assigned_status.status_ids ().then ( function ( response ) {
			$scope.assigned_status = response.data;
		} );

		$scope.statusItems = [];

		$scope.statusList = function () {

			var status_promise = utilityService.getDispositionStatusList ();

			status_promise.then ( function ( promise ) {
				$scope.statusItems = promise.data;
			} );
		};

		$scope.statusList ();

		$scope.selectStatus = function ( event, status ) {

			var status_id = parseInt ( status.status_id );

			if ( angular.element ( event.currentTarget ).prop ( 'checked' ) === true ) {
				$scope.assigned_status.push ( status_id );
			}
			else {
				var index = $scope.assigned_status.indexOf ( status_id );
				$scope.assigned_status.splice ( index, 1 );
			}
		};

		$scope.checkitem = function ( value ) {

			var checked = false;

			for ( var i = 0; i < $scope.assigned_status.length; i ++ ) {

				if ( parseInt ( value ) === $scope.assigned_status[i] ) {
					checked = true;
				}
			}

			return checked;
		};

		/**
		 * 
		 * @returns {undefined}
		 */
		$scope.save_checked_status = function ( checked_statuses ) {

			if ( checked_statuses.length <= 0 ) {
				var ans = confirm ( 'You have not checked any of the status. Are you sure to continue with empty mapping?' );

			}

			var req_obj = {
				group_id: $scope.groupId,
				status_ids: checked_statuses
			};

			var promise = utilityService.mapDispositionGroupStatus ( req_obj );

			promise.then ( function ( response ) {

				if ( response.data.success == 1 ) {
					alert ( 'Status saved successfully' );
				}
				else {
					alert ( 'Server error. Status could not be saved' );
				}

				$route.reload ();
			} );
		};
	} );

	
	/**
	 * Custom directive of getting employee name
	 */

	app.directive('employeeName', function (httpService){
			
			return  {
				restrict : 'EA',
				replace : false,
				template : '{{lead_add_by_user}}',
				scope : {
					id :'@employeeId'
				},
				controller : function ($scope, httpService, baseUrl){
					$scope.lead_add_by_user = '';
					httpService.makeRequest({
						url : baseUrl + 'apis/helper.php?method=getEmployeeNameById&params=employee_id:'+$scope.id,
						method : 'GET'
					}).then(function (data){
						$scope.lead_add_by_user = data.data;
					});
				}
			};
		}); 
	
	
	/**
	 * custom directive for geeting enquiry status text
	 */
	
	app.directive('enquiryCurrentStatus', function (httpService){
			
			return  {
				restrict : 'EA',
				replace : false,
				template : '{{enquiry_text}}',
				scope : {
					enquiry : '@enquiry'
				},
				controller : function ($scope, httpService, baseUrl){
					
					$scope.enquiry_text = '';
					
					httpService.makeRequest({
						url : baseUrl + 'apis/helper.php?method=getEnquiryActionStatus&params=enquiry_id:'+$scope.enquiry,
						method : 'GET'
					}).then(function (data){
						$scope.enquiry_text = data.data.data.status_title +' '+ data.data.data.sub_status_title;
					});
				}
			};
	}); 
		
} ) ( Pace, jQuery );