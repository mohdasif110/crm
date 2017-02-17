
/**
 * Left Sidebar Controller
 * version 1.0
 * @author Abhishek Agrawal
 *  
 */

var app = app || '';

(function (app){
    
	app.controller('leftNavCtrl', ['$scope','$rootScope','AuthService','Session',function ($scope,$rootScope,AuthService,Session){
                
		$rootScope.$on('userSession', function (event,data){
			$scope.currentUser = data.user_session;
		});
        
		$scope.currentUser = Session.getUser();
        
		$scope.displayMenu = function (menu,element){
            
				if(angular.isUndefined(menu)){
					return true;
				}
            
				/*Creating submenu html template */
				var submenu_template = '<div class="sub-list"> ';         

				angular.forEach (menu, function(val,key){

					for(var i in val){
					submenu_template += '<div><a href="'+val[i].link+'">'+val[i].title+'<a/></div>';
					}
				});
		
				submenu_template += '</div>';
				/* submenu template end */
            
				var subMenuHideFlag = angular.element(element.currentTarget).attr('data-hide-sublist');
            
				if(angular.isUndefined(subMenuHideFlag)){
					angular.element(element.currentTarget).after(submenu_template).attr('data-hide-sublist',true);
				}else{
					angular.element(element.currentTarget).next().remove();
					angular.element(element.currentTarget).removeAttr('data-hide-sublist');
				}
		};
        
	}]);
})(app);




