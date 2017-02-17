
/*
 * Home Controller
 * @scope: Dashbaord
 * @author : Abhishek Agrawal
 * version : 1.0
 */

var app = app || '';
var Pace = Pace || {};

( function ( app, $, Pace ) {
	

	app.controller ( 'homeCtrl', ['$scope', '$rootScope', 'application_blocks', 'appUrls', 'appLayout', '$http', 'paceLoading', 'Session', 'AuthService', 'modalService', '$location', '$compile','notify', function ( $scope, $rootScope, application_blocks, appUrls, appLayout, $http, paceLoading, Session, AuthService, modalService, $location, $compile, notify ) {
		
		
			$scope.currentUser = {};
			
			/**
		 * Switch button 
		 */
		
		
		
		
		/* End: switch button */
			
			$rootScope.$on('userSession', function (event,data){
				$scope.currentUser = data.user_session;
			});
			
			// To start loading bar on page load
			paceLoading.start ();

			// To toggle main application header    
			$scope.toggleApplicationHeader ( true );

			// To toggle left sidebar block
			$scope.changeSidebarAppearence ( 'left', true );

			$scope.datatable = false;

			$scope.tableSrc = appUrls.baseUrl + 'templates/table.html';

			$scope.ShowTable = function () {

				var response = $http ( {
					url: appUrls.baseUrl + 'apis/test.php',
					method: 'POST'
				} );

				response.then ( function ( success ) {
					$scope.datatable = success.data.data;
				}, function ( error ) {

				} );

			};

			$scope.hideTable = function () {
				$scope.datatable = false;
			};

			$scope.hideLeftNav = function () {
				$scope.changeSidebarAppearence ( 'left', false );
			};
			
			$scope.$watch ( function () {
				$scope.modalSize = modalService.size;
			} );


			$scope.modal_large = {
				size: 'modal-lg',
				title: 'Demo for large model',
				template: '<div class="alert alert-info">This is template of modal</div>',
				showFooter: true,
				showCloseBtn: true
			};

			$scope.modal_small = {
				size: 'modal-sm',
				title: 'Demo for small model',
				templateUrl: "http://localhost/test.crm/partials/modals/demo.html",
				showFooter: true,
				showSaveBtn: true
			};

			$scope.modalMessage = '';

			$scope.$on ( 'messageFromModal', function ( event, data ) {
				$scope.modalMessage = data.message;
			} );


			/*
			 * Pagination data
			 */

			$scope.currentPage = 1; // Default set to 1

			$scope.table_data = [
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				},
				{
					name: 'Abhishek',
					age: '28',
					number: '7838104984'
				}
			];

			$scope.table_data = [
				{
					name: 'Abhishek',
					age: '28',
					number: 7838104984
				},
				{
					name: 'Asif',
					age: '32',
					number: 7838104984
				}
			];

			$scope.saveuser = function ( name ) {
				var notificationConfig = {};
				notificationConfig.message = 'alert for  ' + name;
				notificationConfig.class = ['alert', 'alert-info', 'bottom-right'];
				$scope.notify ( notificationConfig ); // Calling parent controller function with configuration object 
			};

			$scope.totalItems = $scope.table_data.length;

			$scope.addNewElement = function () {
				var newElement = '<input type="text" ng-model="new_el" placeholder="New Element" />';
				var compiledElement = $compile ( newElement ) ( $scope );
				$ ( '.dashbaord-section' ).append ( compiledElement );
			};

			//$scope.addNewElement();
			$scope.new_el = $scope.$id;

			$scope.dummyData = [{
					id: 1,
					name: 'Abhishek',
					isbn: 12989
				},
				{
					id: 2,
					name: 'Umang',
					isbn: 655456
				},
				{
					id: 3,
					name: 'Asif',
					isbn: 25415
				}
			];
			
			$scope.get_session_user_id = function (){
				alert(Session.getUser().id);
			};
			
		}] );


		app.controller('subHome', function ($scope){
		});

	// Custom Directive 

	app.directive ( 'message', function () {

		var directiveDefinition = {};

		directiveDefinition.restrict = 'EA';

		directiveDefinition.replace = true;

		directiveDefinition.template = '<div></div>';

		directiveDefinition.compile = function ( tElement, tAttr ) {

			// returns a link function 
			console.log ( 'in compile phase' );
			tElement.css ( 'border', '1px solid #C0C0C0' );
			tElement.css ( 'backgroundColor', 'red' );

			return function ( scope, element, attribute, controller ) {

				console.log ( attribute.data );
			};
		};

		directiveDefinition.controller = function ( $scope, $element, $attrs ) {

			$scope.scope_id = $scope.$id;
		};
		return directiveDefinition;

	} );

	/**
	 * Directive  
	 */
	app.directive ( 'messageInner', function () {

		var directiveDefinition = {};

		directiveDefinition.restrict = 'EA';

		directiveDefinition.replace = true;

//        directiveDefinition.template = '';

		directiveDefinition.compile = function ( tElement, tAttr ) {

			// returns a link function 
			console.log ( 'in inner compile phase' );
			tElement.css ( 'border', '1px solid #C0C0C0' );
			tElement.css ( 'backgroundColor', 'red' );
			tElement.css ( 'float', 'left' );
			tElement.css ( 'width', '100px' );

			// postLink function 
			return function ( scope, ielement, iattr ) {

			};
		};

		directiveDefinition.controller = function ( $scope, $element, $attrs ) {

			$scope.scope_id = $scope.$id;
			console.log ( $scope.dummyData );
		};
		return directiveDefinition;

	} );
	
} ) ( app, jQuery, Pace );
