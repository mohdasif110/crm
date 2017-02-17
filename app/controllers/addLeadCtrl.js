/**
 * Add Lead Controller
 */

var app = app || {};

( function ( app, $ ) {

	app.controller ( 'addLeadCtrl', function ( $scope, $rootScope, $http, $location, Session, utilityService, baseUrl, httpService, $log, projectFilters, $filter, user_session, validationService, $route, $compile,tlcrm_config, officeAddress) {

		$scope.user = user_session;

		$scope.hide_cities = true;

		$scope.budget_range = projectFilters.budget_range;

		$scope.property_types = projectFilters.property_types;

		$scope.max_mobile_num_length = 10;

		$scope.showActionIcons = false; // A flag to show or hide action icons based on enquiry status selected 

		$scope.cold_call = 0;

		$scope.customer_number_exists = false;

		$scope.edit_lead_url = 'edit-lead';

		$scope.project_loading = false;

		// Calender 
		$scope.showCalender		= false;
		
		// Show Address area for meeting or site visit
		$scope.showAddressArea	= false;

		/* User gender values */
		$scope.gender = [
			{
				value: null,
				label: 'Select Gender'
			},
			{
				value: 'M',
				label: 'Male'
			},
			{
				value: 'F',
				label: 'Female'
			}
		];

		/**
		 * Lead Enquiry Status property
		 */

		$scope.lead_enquiry = {
			id: null,
			group_title: '',
			sub_status_id: null,
			sub_status_title: '',
			callback_date: '',
			callback_time: '',
			status_remark: '',
			address		: ''
		};

		/**
		 * Projects Filters 
		 */

		$scope.filters = {
			budget: {
				min: '',
				min_label: '',
				max: '',
				max_label: ''
			},
			bhk : '',
			property_status: '',
			property_types: [],
			resetBudget: function () {
				this.budget.min = '';
				this.budget.max = '';
				this.budget.min_label = '';
				this.budget.max_label = '';
				angular.element ( '.filter-budget-container .min-list div' ).removeClass ( 'active' );
				angular.element ( '.filter-budget-container .max-list div' ).removeClass ( 'active' );
			},
			resetPropertyFilter: function ( event ) {

				$ ( '#filter_property_type' ).find ( 'input[type="checkbox"]' ).prop ( 'checked', false );
				this.property_types = [];
			}
		};

		/**
		 * To reset project filters
		 * @returns {undefined}
		 */
		$scope.resetFilters = function () {
			$scope.filters.bhk = null;
			$scope.filters.property_status = '';
			$scope.filters.resetPropertyFilter ();
			$scope.filters.resetBudget ();
		};

		/**
		 * Client Basic Detail object 
		 */
		$scope.client = {
			gender: null,
			fullname: '',
			email: '',
			mobile_number: null,
			alternate_mobile_number: '',
			landline_number: {
				std_code: '',
				number: '',
				ext: ''
			},
			dob: '',
			profession: '',
			country_id: 91,
			country: 'INDIA',
			city_id: '',
			state_id: '',
			state_name: '',
			city_name: '',
			address: '',
			remark: ''
		};

		/**
		 * Watch on mobile number input to limit input number length
		 */
		$scope.$watch ( 'client.mobile_number', function ( val ) {
			$scope.client.mobile_number = $filter ( 'limitTo' ) ( val, 10 );
		} );

		$scope.$watch ( 'client.alternate_mobile_number', function ( val ) {
			$scope.client.alternate_mobile_number = $filter ( 'limitTo' ) ( val, 10 );
		} );

		/*End */

		/**
		 * To check if client number already exists in CRM 
		 */

		$scope.loadingData = {
			number: $scope.client.mobile_number,
			stop: 1,
			start: 0
		};

		/**
		 * Function to check if mobile number exists or not 
		 * @param {type} number
		 * @param {type} element
		 * @returns {undefined}
		 */
		$scope.checkNumberExists = function ( number, element ) {

			var offset_parent = element.currentTarget.offsetParent;
			var number_length = number.length;
			$scope.loadingData.stop = 0;
			$scope.loadingData.start = 1;

			// Fetch some detail about this number is system if already exists
			if ( number_length === 10 ) {

				$scope.loadingData.start = 1;
				$scope.loadingData.stop = 0;

				var response = utilityService.isMobileNumberExists ( number );

				response.then ( function ( success ) {

					$scope.loadingData.stop = 1;
					$scope.loadingData.start = 0;

					if ( parseInt ( success.data.success ) === 1 ) {
						$scope.customer_number_exists = true;
						$scope.enquiry_id = success.data.data.enquiry_id;
						$scope.lead_id = success.data.data.lead_id;

						if ( $scope.lead_id !== null ) {
							$scope.edit_lead_url = $scope.edit_lead_url + '/' + $scope.enquiry_id + '/' + $scope.lead_id;
						}
						else {
							$scope.edit_lead_url = $scope.edit_lead_url + '/' + $scope.enquiry_id;
						}

						$ ( offset_parent ).find ( '.number_existence' ).text ( 'Mobile number already in our system' );
					}
					else {

						// Get details from LMS data
						var lms_detail_response = utilityService.get_user_detail_from_lms ( number );

						lms_detail_response.then ( function ( response ) {

							console.log(response);
							
							if ( parseInt(response.data.success) === 1 ) {

								console.log('success');
								$scope.client.email = response.data.data.email;
								$scope.client.mobile_number = response.data.data.phone;
								$scope.client.fullname = response.data.data.name;
								console.log($scope.client);
							}
							else {

							}
						} );
					}

				} );
			}
			else {
				$scope.customer_number_exists = false;
				$scope.loadingData.stop = 1;
				$scope.loadingData.start = 0;
			}

		};

		/**
		 * Form valiation errors object 
		 */
		$scope.validation_error = {};

		/**
		 *  Validation function on client email address input  
		 * @param {string} email
		 * @param {object} event
		 * @returns {undefined}
		 */

		$scope.clientEmailValidation = function ( email, event ) {

			if ( ! validationService.email ( email ) ) {
				$scope.validation_error.email = 'parsley_error';
				$scope.email_error = 'Invaid email address';
				return false;
			}
			else {
				$scope.validation_error.email = '';
				$scope.email_error = '';
				return true;
			}
		};

		/**
		 * Validation on client name input 
		 */

		$scope.clientNameValidation = function ( name ) {
			if ( name === '' || name === null ) {
				$scope.name_error = 'Client name is required';
				$scope.validation_error.fullname = 'parsley_error';
				return false;
			}
			else {
				$scope.name_error = '';
				$scope.validation_error.fullname = '';
				return true;
			}
		};

		/**
		 * Validation on client mobile nunber 
		 * @returns {undefined}
		 */

		$scope.clientMobileNumberValidation = function ( number ) {

			if ( number === null || number.toString () === '' ) {
				$scope.validation_error.mobile_number_error = 'parsley_error';
				$scope.mobile_number_error = 'Please enter mobile number';
				return false;
			}
			else {
				
				// Validation of alphabetical characters 
				if ( ! validationService.isStringContainAlphaChar ( number ) ) {
					$scope.mobile_number_error = 'Please enter only number\'s in mobile number ';
					$scope.validation_error.mobile_number_error = 'parsley_error';
					return false;
				}
	
				$scope.validation_error.mobile_number_error = '';
				$scope.mobile_number_error = '';
			}
			return true;
		};
		
		//------------Code Block ----------------------------------------------------------------------------------------------------------------------------

		/**
		 * 
		 * @returns {undefined}
		 */
		$scope.leadSourceValidation = function ( type, value ) {

			if ( value === '' || value === null ) {
				if ( type === 'primary' ) {
					$scope.validation_error.primary_lead_source_error = 'parsley_error';
					$scope.primary_lead_source_error = 'Please select primary lead source';
					return false;
				}
				else {
					$scope.validation_error.secondary_lead_source_error = 'parsley_error';
					$scope.secondary_lead_source_error = 'Please select secondary lead source';
					return false;
				}
			}
			else {
				$scope.validation_error.primary_lead_source_error = '';
				$scope.primary_lead_source_error = '';
				$scope.validation_error.secondary_lead_source_error = '';
				$scope.secondary_lead_source_error = '';
				return true;
			}
		};
		//----------End Code Block -------------------------------------------------------------------------------------------------------------------------

		/**
		 * Function to validate lead enquiry sub status 
		 * @param {type} value
		 * @returns {Boolean}
		 */

		$scope.subStatusValidation = function (primary_status_id){
			
			
			// get sub status data according to primary status id 
			
			// if sub status array is blank then it is a case of "Not Intrested" enquiry status
			if( $scope.sub_status.length === 0){
				
				if( !$scope.lead_enquiry.status_remark ){
					alert('Please fill status remark');
					return false;
				}
				else{
					return true;
				}
			}
			
			
			if( $scope.sub_status.length > 0 ){
				// if no sub status is selected 
				if($scope.lead_enquiry.sub_status_id === null){
					return false;
				}
				
				else{
						
					var primary_status = $filter('filter')($scope.enquiry_status.disposition_group , {id : primary_status_id} , true);	
					
					var primary_status_title = $filter( 'trimSpace' )($filter('lowercase')(primary_status[0].title), '_' );
					
					if(primary_status_title){
						
						switch ( primary_status_title ){
							
							case 'meeting': 
								
								if( !$scope.lead_enquiry.callback_date || !$scope.lead_enquiry.callback_time || !$scope.lead_enquiry.status_remark || !$scope.lead_enquiry.address ){
									return false;
								}else{
									return true;
								}
								break;
								
							case 'site_visit':
								if( !$scope.lead_enquiry.callback_date || !$scope.lead_enquiry.callback_time || !$scope.lead_enquiry.status_remark || !$scope.lead_enquiry.address ){
									return false;
								}else{
									return true;
								}
								break;
								
							case 'technical_issue':
									
								if( !$scope.lead_enquiry.status_remark ){
									alert('Plese enter remark'); return false;
								}else{
									return true;
								}
								break;
								
							case 'future_references':
								
								var sub_status_title = $filter( 'trimSpace' )($filter('lowercase')($scope.lead_enquiry.sub_status_title), '_');
								
								// for call_back sub status date time and status remark is required
								if(sub_status_title === 'call_back'){
									
									if( !$scope.lead_enquiry.callback_date || !$scope.lead_enquiry.callback_time || !$scope.lead_enquiry.status_remark ){
										alert('Either Call back date & time or remark is not filled ');
										return false;
									}else{
										return true;
									}
								}
								// for cold call sub status only status remark is required
								else if('cold_call'){
									if( !$scope.lead_enquiry.status_remark ){
										alert('Please fill status remark ');
										return false;
									}else{
										return true;
									}
								}
								
								break;
						}
	
					}
				}
				
			}
			
		};

		$scope.enquiryStatusValidation = function ( value ) {

			if ( value === null || value === '' ) {
				$scope.validation_error.enquiry_status_error	= 'parsley_error';
				$scope.enquiry_status_error						= 'Please select enquiry status';
				return false;
			}
			else {
				
					// Check for sub status data for validation 
					if( !$scope.subStatusValidation(value) ){
						
					}
					
					$scope.validation_error.enquiry_status_error = '';
					$scope.enquiry_status_error = '';
					return true;
			}
		};

		/**
		 * Validation on state dropdown input 
		 * @returns {undefined}
		 */
		$scope.clientStateValidation = function () {

			if ( $scope.client.state_id === '' || $scope.client.state_id === null ) {
				$scope.validation_error.state_error = 'parsley_error';
				$scope.state_error = 'Please select a state';
				return false;
			}
			else {
				$scope.validation_error.state_error = '';
				$scope.state_error = '';
				return true;
			}
		};

		/**
		 * validation on city dropdown input
		 * @returns {undefined}
		 */
		$scope.clientCityValidation = function () {

			if ( $scope.client.city_id === '' || $scope.client.city_id === null ) {
				$scope.validation_error.city_error = 'parsley_error';
				$scope.city_error = 'Please select a city';
				return false;
			}
			else {
				$scope.validation_error.city_error = '';
				$scope.city_error = '';
				return true;
			}
		};

		//---------Code Block -------------------------------------------------------------------------------------------------------------------------------

		$scope.clientAddressValidation = function ( address ) {

			if ( address === '' ) {
				$scope.address_error = 'Please enter client address';
				$scope.validation_error.address_error = 'parsley_error';
				return false;
			}
			else {
				$scope.address_error = '';
				$scope.validation_error.address_error = '';
				return true;
			}
		};

		//--------End Code Block ---------------------------------------------------------------------------------------------------------------------------

		//----------Code Block ------------------------------------------------------------------------------------------------------------------------------

		$scope.clientProfessionValidation = function ( profession ) {

			if ( profession === '' ) {
				$scope.validation_error.profession_error = 'parsley_error';
				$scope.profession_error = 'Please enter profession';
				return false;
			}
			else {
				$scope.validation_error.profession_error = '';
				$scope.profession_error = '';
				return true;
			}
		};

		//-----------End Code Block -----------------------------------------------------------------------------------------------------------------------
		
		
		$scope.leadsource = {
			primary: {
				source_id: null,
				source_name: ''
			},
			secondary: {
				source_id: null,
				source_name: ''
			}
		};

		/**
		 * To set Lead source name
		 * @returns {undefined}
		 */

		$scope.setLeadSourceName = function ( mode ) {
			$scope.getSecondaryLeadSource ( $scope.leadsource.primary.source_id );
		};
		$scope.getPrimaryLeadSource = function () {

			var http_config = {
				url: baseUrl + 'apis/helper.php?method=getCampaigns&params=campaign_type:primary',
				method: 'GET'
			};

			var primary_lead_source = httpService.makeRequest ( http_config );

			primary_lead_source.then ( function ( success ) {

				if ( success.data.success == 1 ) {
					$scope.primary_lead_source = success.data.data;
				}

			} );
		};
		$scope.getSecondaryLeadSource = function ( parent_source_id ) {

			var secondary_source_object = $filter ( 'filter' ) ( $scope.primary_lead_source, {id: parent_source_id} );
			if ( angular.isDefined ( secondary_source_object ) && secondary_source_object.length > 0 ) {
				$scope.secondary_lead_source = secondary_source_object[0];
			}

		};
		$scope.getPrimaryLeadSource ();

		/*
		 * State List 
		 */

		$scope.states = [];
		$scope.cities = [];

		$scope.fetchStatesList = function () {

			var state = utilityService.getStateList ();

			state.then ( function ( response ) {

				$scope.states = response.data;

			} );
		};
		$scope.fetchStatesList ();

		/**
		 * Event handler for fetching cities from state_id
		 */

		$scope.getStateCities = function () {

			if ( $scope.client.state_id == '' ) {
				return false;
			}

			var state_obj = $filter ( 'filter' ) ( $scope.states, {state_id: $scope.client.state_id} );
			$scope.client.state_name = state_obj[0].state_name;


			var city = utilityService.getCityList ( $scope.client.state_id );

			city.then ( function ( response ) {

				$scope.cities = response.data;
			} );

		};

		$scope.setCityName = function () {

			if ( $scope.client.city_id === null ) {
				$scope.clientCityValidation ( null );
				return false;
			}

			var city_obj = $filter ( 'filter' ) ( $scope.cities, {city_id: $scope.client.city_id} );
			$scope.client.city_name = city_obj[0].city_name;
		};

		/*
		 * Default Page record limit 
		 */

		$scope.page_record_limit = 10;


		$scope.floor = [];
		$scope.client_preference = {
			floor: 0,
			site_visit: '',
			usage: ''
		};

		//------ Code Block ------------------------------------------------------------------------------------------------------------------------------------
		/**
		 * Join selected floor values in a comma saperated string 
		 */
		$scope.$watch ( 'floor', function ( val ) {
			if ( val.length > 0 ) {
				$scope.client_preference.floor = val.join ( ',' );
			}

		} );
		//---------End Code Block ----------------------------------------------------------------------------------------------------------------------------

		/**
		 * Floor counts
		 */
		$scope.floors = [];
		for ( var i = 0; i <= 25; i ++ ) {
			$scope.floors.push ( i );
		}

		/**
		 * Site Visit 
		 */
		$scope.site_visits = ['<24 hrs', '<48 hrs', '<1 Wk', '15 Days', '1 Month', '45 Days'];

		/**
		 * Usage
		 */
		$scope.usage = ['Investment', 'Self Usage'];

		$scope.showCitiesList = function () {
			$scope.hide_cities = ! $scope.hide_cities;
		};

		/*
		 * Fetching list of cities
		 */

		$scope.project_cities = [];

		$scope.getProjectCities = function () {

			var config = {
				url: baseUrl + 'apis/getProjectCities.php',
				method: 'GET'
			};

			var response = httpService.makeRequest ( config );

			response.then ( function ( response ) {

				if ( response.data.success ) {
					$scope.project_cities = response.data.city_list;
				}
			} );

		};

		$scope.getProjectCities ();

		$scope.project = {
			city_id: null,
			city_name: ''
		};

		$scope.addHoverClass = function ( element ) {
			var target = element.target;
			angular.element ( target ).addClass ( 'active' ).css ( {cursor: 'pointer'} );
		};
		$scope.RemoveHoverClass = function ( element ) {
			var target = element.target;
			angular.element ( target ).removeClass ( 'active' );
		};

		$scope.setCityVal = function ( city ) {

			$scope.project.city_id = city.city_id;
			$scope.project.city_name = city.city_name;
			$scope.clearCityQuery ();
			$scope.showCitiesList ();
		};

		$scope.searchProject = function ( city_name ) {
			$scope.fetchCRMProjects ( city_name );
		};

		$scope.clearCityQuery = function () {
			$scope.city_query = '';
		};

		/**
		 * CRM Projects 
		 */
		$scope.crm_projects = [];
		$scope.current_page_number = 1;

		
		/**
		 * Getting projects from bookmyhouse with filters applied 
		 * @param {string} city_name
		 * @returns {object}
		 */
		$scope.fetchCRMProjects = function ( city_name ) {
			$scope.applyFilter (); // apply filters 
		};

		$scope.showFilters = function () {
			$ ( '#filter-modal' ).modal ( 'show' );
		};

		/**
		 * Setting minimum budget filter 
		 * @param {type} budget
		 * @param {type} event
		 * @returns {undefined}
		 */
		$scope.setMinBudget = function ( budget, event ) {

			// If min value is greater than max budget value then alert user and unselect min value

			$scope.filters.budget.min = budget.value;
			$scope.filters.budget.min_label = budget.label + ' ' + budget.currency_suffix;
			angular.element ( '.filter-budget-container .min-list div' ).removeClass ( 'active' );
			angular.element ( event.currentTarget ).addClass ( 'active' );
		};

		/**
		 * Setting maximum budget filter
		 * @param {type} budget
		 * @param {type} event
		 * @returns {undefined}
		 */
		$scope.setMaxBudget = function ( budget, event ) {

			// If max value is less then minimum then alert user and unselect max value 
			$scope.filters.budget.max = budget.value;
			$scope.filters.budget.max_label = budget.label + ' ' + budget.currency_suffix;
			angular.element ( '.filter-budget-container .max-list div' ).removeClass ( 'active' );
			angular.element ( event.currentTarget ).addClass ( 'active' );
		};

		/**
		 * Setting BHK filters 
		 * @param {type} bhk_value
		 * @returns {undefined}
		 */
		$scope.setBHK = function ( bhk_value ) {
			$scope.filters.bhk = bhk_value + ' BHK';
			$scope.applyFilter ();
		};

		/**
		 * To set property status filter 
		 * @param {type} status
		 * @param {type} event
		 * @returns {undefined}
		 */
		$scope.setPropertyStatus = function ( status, event ) {
			$scope.filters.property_status = status;
			$scope.applyFilter ();
		};

		/*End./Set status filter **********************************************/

		/**
		 * To set property type filter 
		 * @param {type} ptype
		 * @param {type} event
		 * @returns {undefined}
		 */
		$scope.setPropertyType = function ( ptype, event ) {
		
			var isStatusChecked = $ ( event.currentTarget ).prop ( 'checked' );
			if ( isStatusChecked ) {
				$scope.filters.property_types.push ( ptype );
			}
			else {
				var index = $scope.filters.property_types.indexOf ( ptype );
				$scope.filters.property_types.splice ( index, 1 );
			}
			
			$scope.applyFilter ();
		};

		/* End property type filter */


		/**
		 * To apply filters on projects
		 * @returns {undefined}
		 */
		$scope.applyFilter = function () {

			// First step to close the popup modal
			//$ ( '#filter-modal' ).modal ( 'hide' );

			// Check if any of the filter selected
			
//			if ( ! $scope.isFilterSelected () ) {
//				return false;
//			}
			
			// start loading animation 
			$scope.project_loading = true;
			
			var ptype	= new Array;
			var bhk1	= new Array;

			if ( $scope.filters.property_types.length > 0 ) {
				angular.forEach ( $scope.filters.property_types, function ( val, key ) {
					var property_type_value = $filter ( 'lowercase' ) ( $filter ( 'removeForwardSlash' ) ( val, '-' ) );
					ptype.push ( property_type_value );
				} );
			}

			if ( $scope.filters.bhk != '' && $scope.filters.bhk != null ) {
				bhk1.push ( $filter ( 'extractFirstLetter' ) ( $scope.filters.bhk ) );
			}

			var config = {
				url: baseUrl + 'apis/fetchCRMProjects.php',
				method: 'POST',
				data: $.param ( {
					city: $scope.project.city_name,
					ptype: ptype,
					status_data: $scope.filters.property_status,
					bhk1: bhk1,
					min_price: $scope.filters.budget.min,
					max_price: $scope.filters.budget.max
				} ),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
				}
			};

			var filtered_projects = $http ( config );

			filtered_projects.then ( function ( success ) {

				if ( success.data.success ) {
					$scope.project_loading = false;
					$scope.crm_projects = success.data.data;
				}
			} );
		};

		/* End of Project filters */



		// Create page offset on change of page change 
		$scope.pageChange = function ( page ) {
			$scope.offset = $scope.page_record_limit * ( parseInt ( page ) - 1 );
		};

		/* Selected Enquiry Projects */
		$scope.selectedProjects = {
			ids: [],
			projects: []
		};

		/**
		 *  To select project and put it in selcted projects list
		 * @param {type} selected_project
		 * @param {type} event
		 * @returns {undefined}
		 */
		$scope.selectProject = function ( selected_project, event ) {

			var is_checked = $ ( event.currentTarget ).prop ( 'checked' );

			if ( is_checked ) {
				$scope.selectedProjects.ids.push ( selected_project.project_id );
				$scope.selectedProjects.projects.push ( {project_name: selected_project.project_name, project_url: selected_project.project_url, id: selected_project.project_id, element: event} );

			}
			else {

				var project_id_index = $scope.selectedProjects.ids.indexOf ( selected_project.project_id );
				$scope.selectedProjects.ids.splice ( project_id_index, 1 );
				$scope.selectedProjects.projects.splice ( project_id_index, 1 );
			}
		};

		/**
		 * To remove or unselect selected projects 
		 * @param {type} removed_project
		 * @returns {undefined}
		 */

		$scope.removeSelected = function ( removed_project ) {

			$ ( removed_project.element.currentTarget ).prop ( 'checked', false );
			var project_id_index = $scope.selectedProjects.ids.indexOf ( removed_project.id );
			$scope.selectedProjects.ids.splice ( project_id_index, 1 );
			$scope.selectedProjects.projects.splice ( project_id_index, 1 );
		};

		/***********End *************************************************************************************/

		$scope.searchFromSelectedProjects = function ( value ) {

			if ( $.inArray ( value, $scope.selectedProjects.ids ) > - 1 ) {
				return 1;
			}
			else {
				return 0;
			}
		};
		/*
		 * Function to check if any project filter selected or not 
		 * @returns {boolean}
		 */
		$scope.isFilterSelected = function () {

			var is_select = false;

			if ( $scope.filters.budget.min != '' ) {
				is_select = true;
			}

			if ( $scope.filters.budget.max != '' ) {
				is_select = true;
			}

			if ( $scope.filters.property_status != '' ) {
				is_select = true;
			}

			if ( $scope.filters.bhk != '' && $scope.filters.bhk !== null ) {
				is_select = true;
			}

			if ( $scope.filters.property_types.length > 0 ) {
				is_select = true;
			}

			return is_select;
		};

		/* End */

		//------------ Code Block ----------------------------------------------------------------------------------------------------------------------------
		/**
		 * HTTP call to get enquiry status list 
		 */
		$scope.enquiry_status = {
			disposition_group: [],
			group_sub_status: []
		};
		
		$scope.getDispositionGroupList = function (){
			
			httpService.makeRequest ( {
			url: baseUrl + 'apis/get_employee_disposition_group_status.php?employee_id=' + $scope.user.id
			} ).then ( function ( response ) {

				if ( response.data.success ) {

					if(response.data.parent_status){
						$scope.enquiry_status.disposition_group = response.data.parent_status;
					}

					if(response.data.sub_status){
						$scope.enquiry_status.group_sub_status = response.data.sub_status;
					}
				}			
			} );
		};
		
		$scope.getDispositionGroupList();

		/* End */

		/**
		 * 
		 * @returns {Boolean}
		 */
		$scope.populate_sub_status = function ( group_id ) {

			$scope.sub_status = [];

			// Get group title from enquiry_status.disposition group 
			var parent_group = $filter ( 'filter' ) ( $scope.enquiry_status.disposition_group, {id: group_id} );

			// Assigning enquiry status title 
			if ( parent_group.length > 0 ) {

				$scope.lead_enquiry.group_title = parent_group[0].title;

				// Preparing value to pass in function 
				var lowercase_title			= $filter ( 'lowercase' ) ( $scope.lead_enquiry.group_title );
				var title_with_underscore	= $filter ( 'trimSpace' ) ( lowercase_title, '_' );
				$scope.displayCalender ( title_with_underscore );
			}
			else {
				$scope.lead_enquiry.group_title = '';
				$scope.resetFollowupData ();
			}

			if ( angular.isUndefined ( group_id ) || group_id === null ) {
				$scope.sub_status = [];
			}

			$scope.sub_status = $filter ( 'filter' ) ( $scope.enquiry_status.group_sub_status, {group_id: group_id} );
		
			// If sub status list items are there then only we show the list dropdown
			$scope.enquiry_sub_status_list_item = Object.keys($scope.sub_status).length;
		};
		// ------Code Block End-----------------------------------------------------------------------------------------------------------------------------

		/**
		 * Function to handle change in enquiry sub status 
		 * @returns {Boolean}
		 */

		$scope.setValueEnquiryForSubStatus = function ( sub_status_item ) {
			
			var sub_status_selected_object = $filter ( 'filter' ) ( $scope.sub_status[0].childs, {id: sub_status_item} );

			if ( sub_status_selected_object.length > 0 ) {
				$scope.lead_enquiry.sub_status_id = sub_status_item;
				$scope.lead_enquiry.sub_status_title = sub_status_selected_object[0].status;

				if ( $filter ( 'lowercase' ) ( $filter ( 'trimSpace' ) ( $scope.lead_enquiry.sub_status_title, '_' ) ) === 'cold_call' ) {
					$scope.cold_call = 1; // This is a cold call
				}
				else {
					$scope.cold_call = 0;
				}

			}
			else {
				$scope.lead_enquiry.sub_status_id = null;
				$scope.lead_enquiry.sub_status_title = '';
			}
		};
		/*End: Function to handle change in enquiry sub status */

		$scope.validation_test = function () {

			var validation_fails = false;
			
			var validation_errors = [];

//			( $scope.clientNameValidation ( $scope.client.fullname ) === true ? validation_fails = true : validation_fails = false );
//			( $scope.clientEmailValidation ( $scope.client.email ) === true ? validation_fails = true : validation_fails = false );
//			( $scope.clientMobileNumberValidation ( $scope.client.mobile_number ) === true ? validation_fails = true : validation_fails = false );
			
			// Validation check on mobile number 
			if( !$scope.clientMobileNumberValidation ( $scope.client.mobile_number ) ){
				validation_errors.push('mobile_number');
				
				var parent = angular.element('#panel1').parents('.panel').removeClass ('panel-primary').addClass('panel-danger');
				
			}else{
				
				var parent = angular.element('#panel1').parents('.panel').removeClass ('panel-danger').addClass('panel-primary');
				// remove from validation errors list 
				var error_type_index = validation_errors.indexOf ('mobile_number');
				if(error_type_index > -1){
					validation_errors.splice (error_type_index,1);
				}
			}
			
//			( $scope.clientStateValidation () === true ? validation_fails = true : validation_fails = false );
//			( $scope.clientCityValidation () === true ? validation_fails = true : validation_fails = false );
//			( $scope.clientAddressValidation ( $scope.client.address ) === true ? validation_fails = true : validation_fails = false );
//			( $scope.clientProfessionValidation ( $scope.client.profession ) === true ? validation_fails = true : validation_fails = false );
//			( $scope.leadSourceValidation ( 'primary', $scope.leadsource.primary.source_id ) === true ? validation_fails = true : validation_fails = false );
//			( $scope.leadSourceValidation ( 'secondary', $scope.leadsource.secondary.source_id ) === true ? validation_fails = true : validation_fails = false );
//			( $scope.enquiryStatusValidation ( $scope.lead_enquiry.id ) === true ? validation_fails = true : validation_fails = false );

			
					
			// selected project validation check 		
			if( parseInt($scope.selectedProjects.ids.length) <= 0 ){
				validation_errors.push('project');
				
				var parent = angular.element('#panel4').parents('.panel').removeClass ('panel-primary').addClass('panel-danger');
				
			}else{
				var parent = angular.element('#panel4').parents('.panel').removeClass ('panel-danger').addClass('panel-primary');
				
				var error_type_index = validation_errors.indexOf ( 'project' );
				if(error_type_index > -1){
					validation_errors.splice (error_type_index,1);
				}
			}
			
			// enquiry status validation check 
			if( !$scope.enquiryStatusValidation ( $scope.lead_enquiry.id ) ){
				
				validation_errors.push('lead_status');
				
				var parent = angular.element('#panel5').parents('.panel').removeClass ('panel-primary').addClass('panel-danger');
				
			}else{
				var parent = angular.element('#panel5').parents('.panel').removeClass ('panel-danger').addClass('panel-primary');
				
				var error_type_index = validation_errors.indexOf ('lead_status');
				if(error_type_index > -1){
					validation_errors.splice (error_type_index,1);
				}
			}
			
			// if validation errors 
			if(validation_errors.length > 0){
				return false;
			}else{
				return true;
			}
			
		};

		//-------Code Block ---------------------------------------------------------------------------------------------------------------------------------

		/**
			* function to add new lead 
			* @returns {undefined}
		 */
		$scope.addLead = function () {

			if ( ! $scope.validation_test () ) {
				
//				Show notification message of form errors to user 
				$scope.notify ({class : ['alert','alert-danger','bottom-right'], message : 'Please correct the form error highlighted.'});
				
				return false;
			}

			var lead_data = {
				client_info: $scope.client,
				lead_source: $scope.leadsource,
				client_preference: $scope.client_preference,
				projects: $scope.removeEventFromObject ( $scope.selectedProjects ),
				project_city: $scope.project.city_name,
				filters: {
					budget: $scope.filters.budget,
					bhk: $scope.filters.bhk,
					property_status: $scope.filters.property_status,
					property_types: $scope.filters.property_types
				},
				enquiry: $scope.lead_enquiry,
				cold_call: $scope.cold_call
			};

			var http_config = {
				url: baseUrl + 'apis/add_lead.php',
				method: 'POST',
				data: $.param ( lead_data ),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
				}
			};

			// Post data to server
			var lead_request = $http ( http_config );
			lead_request.then ( function ( response ) {

				if ( parseInt(response.data.success) === - 1 ) {

					// Server sends back some form errors
					// show them to user to correct
					var notification = {message: response.data.message, class: ['alert', 'alert-warning', 'bottom-right']};
					$scope.notify ( notification );
					
					$scope.formErrors = new Array();
					angular.forEach (response.data.errors, function(error){
						
						$scope.formErrors.push(error);
					});					
					return false;
				}

				if ( parseInt(response.data.success) === 0 ) {
					// Some warning messages to user
					var notification = {message: response.data.message, class: ['alert', 'alert-warning', 'bottom-right']};
					$scope.notify ( notification );
					return false;
				}

				if ( parseInt(response.data.success) === 1 ) {
					var notification = {message: response.data.message, class: ['alert', 'alert-success', 'center-aligned']};
					$scope.notify ( notification );
					$scope.reloadRoute ();
				}

			} );

		};


		$scope.removeEventFromObject = function ( obj ) {

			for ( var i = 0; i <= obj.projects.length - 1; i ++ ) {
				delete  obj.projects[i].element;
			}

			return $scope.selectedProjects;
		};

		/**
		 * Route Reload 
		 */

		$scope.reloadRoute = function () {
			$route.reload ( '/add-lead' );
		};

		var date = new Date ();
		$scope.meridians = ['AM', 'PM'];
		$scope.minDate = new Date ();
		dateOptions: {
			minDate: $scope.minDate;
		}
		;

		/**
		 * Model property to store callback date & time 
		 */
		$scope.followup = {};
		$scope.followup.callback_time = '';
		$scope.followup.callback_date = '';
		$scope.followup.status_remark = '';
		
		$scope.$watch ('followup.callback_date', function ( val ) {
			$scope.followup.callback_date = $scope.lead_enquiry.callback_date = $filter ( 'date' ) ( val, 'yyyy-MM-dd', '+0530' );
		} );

		$scope.$watch ('followup.callback_time', function ( val ) {
			$scope.followup.callback_time = $scope.lead_enquiry.callback_time = $filter ( 'date' ) ( val, 'shortTime' );
		} );

		$scope.$watch ('followup.status_remark', function ( val ) {
			$scope.followup.status_remark = $scope.lead_enquiry.status_remark = val;
		} );

		/**
		 * Function to show or hide followup actions icons 
		 * @argument {string} title 
		 * description title : title of the enquiry status
		 * @returns {boolean}
		 */
		$scope.displayCalender = function ( title ) {

			switch ( title ) {
				
				case 'meeting':
					$scope.address_event	= 'Meeting';
					$scope.showCalender		= true;
					$scope.showAddressArea	= true;
					break;

				case 'site_visit':
					$scope.address_event	= 'Site Visit';
					$scope.showCalender		= true;
					$scope.showAddressArea	= true;
					break;

				case 'future_references':
					$scope.showCalender		= true;
					$scope.showAddressArea	= false;		
					break;
					
				default :
					$scope.resetFollowupData ();
					$scope.showCalender		= false; // Always hide this as this is no more a required
					$scope.showAddressArea	= false;
			}
			;
		};

		/**
		 * Function to reset all followup information with lead enquiry callback date and time
		 * @returns {undefined}
		 */

		$scope.resetFollowupData = function () {
			
			$scope.followup.callback_date			= '';
			$scope.followup.callback_time			= '';
			$scope.followup.status_remark			= '';
			$scope.lead_enquiry.callback_date		= '';
			$scope.lead_enquiry.callback_time		= '';
			$scope.lead_enquiry.status_remark		= '';
			$scope.lead_enquiry.sub_status_id		= null;
			$scope.lead_enquiry.sub_status_title	= '';
			
		};

		/*End*/

		/**
		 * Function to refresh list of project cities
		 * @returns {undefined}
		 */
		$scope.refreshProjectCities = function () {
			$scope.getProjectCities ();
		};
		
		/**
		 * Date and time picker configuration for calender 
		 */
		
		function getDayClass(data) {
			
			var date	= data.date,
			mode		= data.mode;
			
			if (mode === 'day') {
				var dayToCheck = new Date(date).setHours(0,0,0,0);

				for (var i = 0; i < $scope.datepicker.events.length; i++) {
					var currentDay = new Date($scope.datepicker.events[i].date).setHours(0,0,0,0);
					
					if (dayToCheck === currentDay) {
					  return $scope.datepicker.events[i].status;
					}
				}
			}

			return '';
		}
		
		var tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);		
		var afterTomorrow = new Date(tomorrow);
		afterTomorrow.setDate(tomorrow.getDate() + 1);
		
		$scope.setDate = function(year, month, day) {
			$scope.dt = new Date(year, month, day);
		};
		
		$scope.datepicker = {
			
			dt : new Date() ,
			options : {
				customClass: getDayClass,
				minDate: new Date(),
				showWeeks: true
			},
			events : [
				{
					date:	tomorrow,
					status: 'full'
				},
				{
					date:	afterTomorrow,
					status: 'partially'
				}
			]
		};
		
		
		$scope.$watch('datepicker.dt', function (val){
			
			if(val){
				$scope.followup.callback_date = $filter('date')(val , 'd-MM-yyyy' , '+0530');
			}
			
		});
		
		function format12(){
			var temp = new Array;
			for(var i = 1; i<=12;i++){
				temp.push (i);
			}
			return temp;
		}
		
		function format24(){
			var temp = new Array;
			for(var i = 0; i<=23;i++){
				temp.push (i);
			}
			return temp;
		}
		
		$scope.timepicker = {
			
			meridian		: ['AM','PM'],
			time_format		: [12,24],
			format12 : function (){
				return format12 ();
			},
			format24 : function (){
				return format24 ();
			},
			default : {
				meridian : (new Date().getHours () > 12 && 'PM' || 'AM'),
				list : format24()
			},
			time : ''
		};
		
		$scope.setCallbackTime = function (time){
		
			$scope.timepicker.time = time;
			var meridian = 'AM';
			if(time > 11){
				meridian = 'PM';
			}
			
			$scope.followup.callback_time = time + ': 00' +' '+ meridian;
		};
		
		// Function to change time format
		$scope.changeTimeFormat = function (format){
			
			if(parseInt(format) === 12){
				
				$scope.timepicker.default.list = format12 ();
			}else{
				$scope.timepicker.default.list = format24 ();
			}
		};
		
		/*End configuration */
		
		/**
		 * function to set address type
		 * @param {type} string
		 * @returns {undefined}
		 */
		
		$scope.setAddressType = function (type){
			
			if(type === 'client'){
				$scope.lead_enquiry.address = $scope.client.address;
			}
			
			if(type === 'office'){
			
				$scope.lead_enquiry.address = officeAddress;
			}
			
			if(type === 'misc'){
				$scope.lead_enquiry.address = '';
			}
		};
		
	} );

} ) ( app, jQuery );