<?php
session_start();

require 'function.php';

$data = filter_input_array(INPUT_POST);

if(!empty($data)){
	
	if(isset($data['enquiry_id']) && isset($data['sales_person'])){
	
		$enquiry_id			= $data['enquiry_id'];
		$sales_person		= $data['sales_person'];
		$current_date		= date('Y-m-d H:i:s');
		$sales_person_name	= getemployeename($sales_person);
		$current_month		= (int) date('m') - 1;
		$current_year		= date('Y'); 
		
		$login_user_id		= $_SESSION['currentUser']['id'];
		
		// set sales person in lead table 
		$update_lead = 'UPDATE `lead` '
				. ' SET lead_assigned_to_sp = '.$sales_person.','
				. '  lead_assigned_to_sp_on = "'.$current_date.'"'
				. 'WHERE enquiry_id = '.$enquiry_id.' LIMIT 1';
		
		if(mysql_query($update_lead)){
			
			// update remaining capacity value of sales person in current month capacity
			$update_remaining_capacity = 'UPDATE sales_person_capacities '
					. ' SET remaining_capacity = remaining_capacity - 1 '
					. ' WHERE sales_person_id = '.$sales_person.' AND month = '.$current_month.' AND year = "'.$current_year.'"';
			
			mysql_query($update_remaining_capacity);
			
			// log history of lead assignment
			
			$details = 'Lead has been assigned to sales person '.$sales_person_name.' on '.$current_date.'';
			
			$lead_number = getLeadNumber($enquiry_id);
			
			$log_insert = 'INSERT INTO `lead_history` '
					. ' SET lead_number = "'.$lead_number.'",'
					. ' enquiry_id = '.$enquiry_id.','
					. ' details = "'.$details.'",'
					. ' type = "new",'
					. ' employee_id = '.$login_user_id.'' ;
			
			mysql_query($log_insert);
			
			echo json_encode(array('success' => 1, 'message' => 'Lead has been assigned to sales person successfully')); exit;
		}else{
			echo json_encode(array('success' => 0, 'error' => 'Lead couldn\'t be assigned. Please try again later')); exit;
		}
	}else{
		json_encode(array('success' => 0, 'error' => 'No data recieved'), true);
	}
}else{
	json_encode(array('success' => 0, 'error' => 'No data recieved'), true);
}


