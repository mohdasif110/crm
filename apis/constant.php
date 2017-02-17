<?php
date_default_timezone_set('Asia/Kolkata');
$root_folder = '';

if(strtolower($_SERVER['HTTP_HOST']) != 'localhost'){

	$root_folder = 'CRM';

}else{
	
	$root_folder = 'CRM';
}

$base_url = 'http://'. $_SERVER['HTTP_HOST'].'/'.$root_folder.'/';
define('BASE_URL',$base_url);
// ADMIN CONSTANT
define('ROLE_ADMIN', 1);
define('NOTES_PER_PAGE', 5);
$current_date = date('Y-m-d H:i:s');
define('NEW_LEAD_ASSIGNMENT_TO_SP', 'Lead/ Enquiry has been assigned to sales person on '. $current_date);
// Email functionality ON/OFF
define('IS_EMAIL_ON',1);

function phone_number_validation($phone){
	
	if(is_numeric( $phone ))
		{
			
			if(preg_match('/^[0-9]{10}+$/', $phone))
			{
				
				return  false ;
			
			}else{
				
				return true;
			}  
		
		}else{
			
			return true;
		}
		
}
