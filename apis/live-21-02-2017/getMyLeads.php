<?php
/* API: To get leads of an individual user */

session_start();

require_once 'function.php';
require_once 'user_authentication.php';
    
if(!$is_authenticate){
	echo unauthorizedResponse(); exit; 
}

$data = array();
$post_data = filter_input_array(INPUT_POST);
$leads_data = array();

if(isset($post_data) && $post_data['user_id']){
	
	$user_id			= $post_data['user_id'];
	$designation_id		= $post_data['designation_id'];
	$designation_slug	= $post_data['designation_slug']; 
	
	switch($designation_slug){
		
		case 'agent':
			$lead_users_ids     = "'".implode("', '",getUsersHierarchy($user_id, 0))."'";
			break;		
		case 'senior_executive':
			$lead_users_ids		= "'".implode("', '",getUsersHierarchy($user_id, 0))."'";
			break;
			
		case 'executive':
			$lead_users_ids		= "'".implode("', '",getUsersHierarchy($user_id, 0))."'";
			break;
		
		case 'team_leader':
			$lead_users_ids = "'".implode("', '",getUsersHierarchy($user_id, 1))."'";
			break;
			
		case 'sr_team_leader':
			$lead_users_ids = "'".implode("', '",getUsersHierarchy($user_id, 2))."'";
			break;
		
	}
	
	if($lead_users_ids){
		
		$leads = "SELECT "
				. " lead.lead_id, lead.enquiry_id, lead.disposition_status_id, lead.disposition_sub_status_id, lead.leadAddDate, lead.is_cold_call,lead.lead_added_by_user, lead.customerName, lead.customerEmail, lead.customerMobile, lead.customerLandline, CONCAT(emp.firstname,' ', emp.lastname) as lead_added_by_employee,"
				. " lead.lead_category, lead.lead_assigned_to_asm, lead.lead_assigned_to_sp"
			. " FROM lead as lead"
			. " LEFT JOIN employees as emp ON (lead.lead_added_by_user = emp.id)"
			. " WHERE lead.lead_added_by_user IN (".$lead_users_ids.")"
				. " ORDER BY lead.leadAddDate DESC";
	
		
		$result = mysql_query($leads);
		
		if($result){
		
			if(mysql_num_rows($result) > 0){

				while($row = mysql_fetch_assoc($result)){
					
					$row['asm_name']	=	getemployeename($row['lead_assigned_to_asm']);
					$row['sp_name']		=	getemployeename($row['lead_assigned_to_sp']);
					
					array_push($leads_data , $row);
				}
			}
		}
	}
	
	$response = array(
		'success' => 1,
		'http_status_code' => 200,
		'data' => $leads_data,
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