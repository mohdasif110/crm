
/*App module script to configure modules*/

var app = app || {};
var Pace = Pace || {};

( function ( Pace, $ ) {

	// module dependency of ngRoute module 
	app = angular.module ( 'app', ['ngRoute', 'ngSanitize', 'ngAnimate', 'ui.bootstrap'] );

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
	app.config ( function ( $routeProvider, baseUrl, $locationProvider ) {

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
					controller: 'homeCtrl',
					resolve: {
						user_auth: function ( $http, $location, Session) {
							
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
				} )
				.when ( '/add-lead', {
					templateUrl: baseUrl + 'templates/add_lead_form.html',
					controller: 'addLeadCtrl',
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
				} )
				.when ( '/edit-lead/:enquiry_id/:lead_id?', {
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
				} )
				.when ( '/lead-enqueries', {
					templateUrl: baseUrl + 'templates/lead_enquiry.html',
					controller: 'leadEnquiryCtrl'
				} )
				.when ( '/all-lead', {
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
					templateUrl: baseUrl + 'templates/tl_crm_leads.html',
					controller: 'myLeadsCtrl',
					resolve: {
						user: function ( Session, $log, httpService, $location ) {

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
						user: function ( Session, $log, httpService, $location ) {

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
						},
						disposition_status_list: function ( httpService ) {

							return httpService.makeRequest ( {url: baseUrl + 'apis/get_disposition_status_list.php', method: 'GET'} ).then ( function ( success ) {
								return success.data;
							} );
						},
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
				otherwise ( {
					// Redirect to home
					redirectTo: '/home'
				} );

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
					Session.destroyUser (); // Removing user session client side
					$location.path ( '/' );
				}
				else {
					// Stroing user session in client service 
					Session.createUser ( success.data );
					// Broadcast event to spread out user sesion in application 
					$rootScope.$broadcast ( 'userSession', success.data );
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
			$scope.currentUser = data;
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
			 
		}, 60000); // 1 minute interval of checking user session 
		
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

	
	
} ) ( Pace, jQuery );