<?php
session_start();
require 'function.php';

require_once 'user_authentication.php';

if(!$is_authenticate){
	echo unauthorizedResponse(); exit; 
}

$leads = array();

$data = filter_input_array(INPUT_POST);

if(!empty($data) && isset($data['enquiry_id']) && isset($data['sales_person_id'])){

	$current_date = date('Y-m-d H:i:s');
	// Change lead reject status 
	
	$reject_lead_sql = 'UPDATE lead '
			. ' SET is_lead_rejected = 1 , lead_reject_datetime = "'.$current_date.'", '
			. ' lead_rejection_reason = "'.$data['reject_reason'].'", lead_assigned_to_sp = 0 '
			. ' WHERE enquiry_id = '.$data['enquiry_id'].' AND lead_assigned_to_sp = '.$data['sales_person_id'].' LIMIT 1';

	
	if(mysql_query($reject_lead_sql)){
		
		$sales_person_name = getEmployeeName($data['sales_person_id']);
		
		// increase sales person capacity 
		
		$current_month = (int) date('m') - 1;
		$current_year = date('Y');
		
		/** Important: To be apply in logic
		  
			// Get the lead assignment datetime of sales person by area sales manager 
			// and compare the current month and year from the assignment datetime value 
			// if assignment month and year is same to current month and year then we increase in sales person capacity otherwise we will not.
		*/
		
		$update_sales_person_capacity = 'UPDATE `sales_person_capacities` SET'
				. ' remaining_capacity = remaining_capacity + 1  '
				. ' WHERE sales_person_id = '.$data['sales_person_id'].' AND month = '.$current_month.' AND year = "'.$current_year.'"';
		
		mysql_query($update_sales_person_capacity);
		
		// Log history 
		$details		= 'Lead has been rejected by sales person '.$sales_person_name.' on '.$current_date.'';
		$emp_id			= $data['sales_person_id'];
		$lead_number	= getLeadNumber($data['enquiry_id']);
		
		$log = 'INSERT INTO lead_history SET '
				. ' enquiry_id = '.$data['enquiry_id'].','
				. ' lead_number = "'.$lead_number.'",'
				. ' details = "'.$details.'",'
				. ' employee_id = '.$emp_id.' ,'
				. ' type= "new"';
		
		mysql_query($log);
		
		echo 1; exit;
	}else{
		echo 0; exit;
	}		
}else{
	echo 0; exit;
}
