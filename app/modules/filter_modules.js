/**
 * New module for cutom filters 
 */

var app_filters = angular.module ('filter_module',[]);

(function (app_filters){
   
   app_filters.ascii_filter = function (){
	return function (char_input){
		return Math.random ();
	};
   };
   
} (app_filters));