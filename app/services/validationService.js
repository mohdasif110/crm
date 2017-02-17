/**
 * @author Abhishek agrawal
 * @fileOverview Validation service using regex pattern
 */

var app  = app || {};

(function (app){
    
    app.service('validationService',function ($http){
        
        this.email = function (val){
          
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,24})+$/;
            if(regex.test(val)){
                return true;
            }else{
                return false;
            }
        };
        
          this.isStringContainAlphaChar = function ( str ){
                
                if(str === null){
                        return false;
                }
                
                if (str.match(/[a-z]/i)) {
                    // alphabet letters found
                    return false;
                }else{
                    return true;
                }
                
          };
        
    });
    
})(app);