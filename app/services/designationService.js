/**
 * @fileOverview Service modal of designation module 
 */

var app = app || {};

(function (app){
    
    app.service('designationService', function ($http,$location,appUrls){
        
        this.updateDesignationModules = function (modules){
            
            return $http({
                url : appUrls.apiUrl + 'updateDesignationModules.php',
                method : 'POST',
                data : modules
            });
        };
        
        this.addNewModule = function (module){
            return $http({
                url : appUrls.apiUrl + 'addDesignationModules.php',
                method : 'POST',
                data : module
            });
        };
    });
    
})(app);