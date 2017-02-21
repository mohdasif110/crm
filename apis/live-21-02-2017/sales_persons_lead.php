<?php
session_start();
require 'function.php';
require_once 'user_authentication.php';
    
if(!$is_authenticate){
	echo unauthorizedResponse(); exit; 
}

$leads = array();

$data = filter_input_array(INPUT_POST);

if(isset($data['user_id'])){
	$sales_person_id = $data['user_id'];


	$sql = "SELECT "
				.  " lead.lead_id, lead.enquiry_id, lead.disposition_status_id, lead.disposition_sub_status_id, lead.leadAddDate, lead.is_cold_call,lead.lead_added_by_user, lead.customerName, lead.customerEmail, lead.customerMobile, lead.customerLandline, CONCAT(emp.firstname,' ', emp.lastname) as lead_added_by_employee,"
				.  " lead.lead_assigned_to_asm, is_lead_accepted, is_lead_rejected, lead_rejection_reason, lead_accept_datetime"
				.  " FROM lead as lead"
				.  " LEFT JOIN employees as emp ON (lead.lead_added_by_user = emp.id)"
				.  " WHERE lead.lead_assigned_to_sp = ".$sales_person_id." AND lead_closure_date IS NULL"
				.  " ORDER BY lead.leadAddDate DESC";

	$result = mysql_query($sql);
	
	if($result && mysql_num_rows($result) > 0){

		while($row = mysql_fetch_assoc($result)){

			$row['primary_status_title']	= getstatuslabel($row['disposition_status_id'],'parent');
			$row['secondary_status_title']	= getstatuslabel($row['disposition_sub_status_id'],'child');
			$row['asm_name']				= getemployeename($row['lead_assigned_to_asm']);
			
			array_push($leads, $row);
		}
	}
	
	
	// response in JSON format
	$response = array(
			'success' => 1,
			'http_status_code' => 200,
			'data' => $leads,
	);
	echo json_encode($response,true); exit;	
}else{
	$error_response = array(
		'success' => 0,
		'http_status_code' => 401,
		'message' => 'Unauthorized access'
 	);
	
	echo json_encode($error_response,true); exit; 
}