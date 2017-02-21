<?php 
session_start();

require 'function.php';

$_post_data = filter_input_array(INPUT_POST);

if( isset( $_post_data )){
	
//	Array
//(
//    [date] => Mon Feb 06 2017 11:01:54 GMT+0530 (India Standard Time)
//    [remark] => 
//    [status_id] => 7
//    [sub_status_id] => 33
//)
	
	$errors = [];
	$close_lead = array();
	
	if( isset($_post_data['status_id']) && $_post_data['status_id'] != ''){
		$close_lead['disposition_status_id'] = $_post_data['status_id'];
	}
	else{
		$errors[] = 'Undefined Status.';
	}
	
	if( isset($_post_data['sub_status_id']) && $_post_data['sub_status_id'] != ''){
		$close_lead['disposition_sub_status_id'] = $_post_data['sub_status_id'];
	}
	else{
		$errors[] = 'Undefined Sub Status.';
	}
	
	if( isset($_post_data['date']) && $_post_data['date'] != ''){
		$close_lead['lead_closure_date'] = date('Y-m-d',strtotime($_post_data['date']));
	}else{
		$errors[] = 'Please set lead closing date';
	}
	
	if( isset($_post_data['remark']) && $_post_data['remark'] != ''){
		$close_lead['lead_closure_remark'] = $_post_data['remark'];
	}
	
	$employee_id = '';
	if(isset($_post_data['user_id']) && $_post_data['user_id'] != ''){
		$employee_id = $_post_data['user_id'];
	}else{
		$errors[] = 'User is not identified for this action. Please check your session and login again';
	}
	
	$employee_name = '';
	if( isset($_post_data['user_name']) && $_post_data['user_name'] != ''){
		$employee_name = $_post_data['user_name'];
	}
	
	$enquiry_id = '';
	
	if(isset($_post_data['enquiry_id']) && $_post_data['enquiry_id'] != ''){
		$enquiry_id = $_post_data['enquiry_id'];
	}else{
		$errors[] = 'Enquiry number is missing';
	}
	
	
	if( !empty($errors)){
		
		$response = array(
			'success' => 0,
			'errors' => $errors
		);
		
		echo json_encode($response, true); exit;
	}
	
	$query = 'UPDATE lead SET '
			. ' lead_updated_by = "'.$employee_id.'" ,'
			. ' leadUpdateDate = "'.date('Y-m-d').'" ,'
			. ' lead_closed_by = "'.$employee_id.'"';
	
	foreach($close_lead as $col => $val){
		
		$query .= $col .' = "' . $val . '" ,';
	}
	
	$trimmed_query	= rtrim($query," ,");
	$trimmed_query .= ' WHERE enquiry_id = '.$enquiry_id.'';

	// trim query for right side 

	if(mysql_query($trimmed_query)){
		
		// log histroy 
		$text = 'Lead status has been changed to close by '. $employee_name . 'on ' . date('Y-m-d');
		$log_query = mysql_query('INSERT INTO lead_history SET enquiry_id = '.$enquiry_id.', employee_id = '.$employee_id.' , type = "edit" , details = "'.$text.'"');
		
		
		$response = array(
			'success' => 1,
			'message' => 'Lead status has been updated successfully'
		);
		
		echo json_encode($response, true);
	}else{
		$errors[] = 'Server Error. Lead status could not be updated';
		$response = array(
			'success' => 0,
			'error' => $errors
		);
		echo json_encode($response, true);
	}
}
else{
	$errors[] = 'No data received';
	$response = array(
		'success' => 0,
		'error' => $errors
	);
	echo json_encode($response, true);
}
