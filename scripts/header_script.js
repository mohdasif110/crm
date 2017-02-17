/**
 * Common script file for application header 
 * @version 1.0
 * @author Abhishek Agrawal
 */

(function ($){
    
    $(document).ready(function (){
        
        $('.ac_info').click(clickHandler);
        
        $(document).click(domClickHandler);
        
        function clickHandler(e){
            e.stopPropagation();
        }
        
        function domClickHandler(e){
          
            e.stopPropagation();
            
            var target = $(e.target);
            var el_class = target.attr('class');
            
            if(typeof el_class !== 'undefined'){
                var target_classes = target.attr('class').split(' ');
                if($.inArray('settings_circle',target_classes) <= -1 ){
                    $('.ac_info').hide();
                }else{
                    $('.ac_info').toggle();
                }
            }else{
                // Code to be execute for rest of the DOM elements except settings_circle
                $('.ac_info').hide();
            }
        }
    });
})(jQuery);