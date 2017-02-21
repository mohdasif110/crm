<?php
session_start();
require 'function.php';

$data		= filter_input_array(INPUT_POST);
$enquiry_id = '';

if(isset($data['enquiry_id'])){
	$enquiry_id = $data['enquiry_id'];
}

// Get category of $enquiry_id 
$current_month	= (int) date('m') - 1;
$current_year	= date('Y');
$current_date	= date('Y-m-d H:i:s');
$user			= $_SESSION['currentUser']['id']; 

$lead_category	= '';

// Get lead category type 
$get_lead_category_type = 'SELECT lead_category FROM lead WHERE enquiry_id = '.$enquiry_id.'  LIMIT 1';

$lead_category_result	= mysql_query($get_lead_category_type);

if($lead_category_result && mysql_num_rows($lead_category_result) > 0){
	
	$lead_category = mysql_fetch_object($lead_category_result) -> lead_category;
}

// Get enquired project

$get_project_enquired = 'SELECT `project_id`, `project_name`, `project_url` '
						. '	FROM `lead_enquiry_projects` '
						. ' WHERE enquiry_id = '.$enquiry_id.' LIMIT 1';
	
$enquiry_project_result = mysql_query($get_project_enquired);
$project_id				= '';
$project_name			= '';
$project_url			= '';

if($enquiry_project_result && mysql_num_rows($enquiry_project_result) > 0){
			
	// get area sales manager with project capacity of current month 
	// if capacity is not defined for current month 
	// then lead should not be assigned to that area sales manager.
	// Also get the remaining space of lead capacities of area sales manager for that particular project
			
	$project_detail = mysql_fetch_object($enquiry_project_result);
	$project_id		=  $project_detail -> project_id;
	$project_name	=  $project_detail -> project_name;
	$project_url	=  $project_detail -> project_url;
	
	
	// Check here for are sales manager capacity according to the lead type 
	// if lead type is SPL then check for his remaining SPL lead capacity 
	// if lead type is MPL then check for his remaining MPL lead capacity
	
	if(strtolower($lead_category) === 'spl'){
		
		$select_area_sales_manager_sql = 'SELECT userId, capacity, remaining_capacity '
			. ' FROM capacity_master '
			. ' WHERE pId = '.$project_id.' AND capacity_month = '.$current_month.' AND capacity_year = "'.$current_year.'" and remaining_capacity > 0';

		$area_sales_manager_result = mysql_query($select_area_sales_manager_sql);
		
		if($area_sales_manager_result && mysql_num_rows($area_sales_manager_result) > 0){

			// Here we assign lead to area sales manager
			// update in lead table against enquiry id on column <lead_assigned_to_asm>

			$asm_user = mysql_fetch_object($area_sales_manager_result);

			$assign_lead_to_asm = 'UPDATE `lead` '
				. ' SET lead_assigned_to_asm = '.$asm_user -> userId.','
				. ' lead_assigned_to_asm_on = "'.$current_date.'"'
				. ' WHERE enquiry_id = '.$enquiry_id.' LIMIT 1';

			$asm_name = getEmployeeName($asm_user -> userId);

			if(mysql_query($assign_lead_to_asm)){

			
			// Update remaining capacity of area sales manager in current month capacity
				
				$update_remaining_capacity = 'UPDATE capacity_master SET'
					. ' remaining_capacity = remaining_capacity - 1 '
					. ' WHERE userId = '.$asm_user -> userId.' AND pId= '.$project_id.' AND capacity_month = '.$current_month.' AND capacity_year = "'.$current_year.'" LIMIT 1';
				mysql_query($update_remaining_capacity);
			
			// on successfull update of asm id create history 

			// Lead has been assigned to area sales manager <ASM_NAME> on <CURRENT_DATE>
			// Lead Details - 
			// Enquiry ID
			// Project ID

			$asm_name		= getEmployeeName($asm_user -> userId);
			$history_text	= 'Lead has been assigned to area sales manager '.$asm_name.' on '. date('Y-m-d H:i:s');
			$details		= '<p>Lead Details - <br/>Enquiry ID - '.$enquiry_id.' <br/>Project - '.$project_name.' </p>';
			$history_text	.= $details;	
			$lead_number	= getLeadNumber($enquiry_id);
			
			$insert_history = 'INSERT lead_history (lead_number, enquiry_id, details, type) VALUES ("'.$lead_number.'",'.$enquiry_id.', "'.$history_text.'","new")';

			mysql_query($insert_history);

			// Apply Round Robin lead Assignment Process to sales person in manual lead assignment process of ASM also  

			$request_url	= BASE_URL .'apis/round_robin_assignment.php';
			$ch				= curl_init();
			curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);
			curl_setopt ($ch, CURLOPT_URL,$request_url);
			curl_setopt ($ch, CURLOPT_POST, 1);
			curl_setopt ($ch, CURLOPT_POSTFIELDS,array('enquiry_ids' => serialize(array($enquiry_id)), 'asm_id' => $asm_user -> userId ));
			curl_exec ( $ch );
			curl_close($ch);
			
			// Success response 
			$response = array('success' => 1, 'message' => 'Lead/ Enquiry has been successfully assigned.');
			echo json_encode($response, true); exit;
		}	
		else{
			$error_response = array('success' => 0, 'message' => 'Lead couldn\'t be assigned to area sales manager. Please try again later.');
			echo json_encode($error_response,true); exit;
		}
	}else{
			$response = array('success' => 1, 'message' => 'Lead could not be assigned. No Area Sales Manager found for assignment');
			echo json_encode($response,true); exit;
		}
	}
	
	if(strtolower($lead_category) === 'mpl'){
		
		// Get the area sales manager and remaining capacity of MPL category
	
		// Random selection of asm		
		
		$asm = 'SELECT emp.id as user_id, concat(emp.firstname ," ", emp.lastname) as username
				FROM employees as emp
				LEFT JOIN mpl_capacity as mpl ON (emp.id = mpl.user_id)
				WHERE emp.designation = (SELECT id from designationmaster where designation_slug = "area_sales_manager")
				AND mpl.capacity IS NOT NULL AND mpl.remaining_capacity > 0 ORDER  BY rand() LIMIT 1';

		$asm_result = mysql_query($asm);

		if($asm_result && mysql_num_rows($asm_result) > 0){
		
			$asm_user	= mysql_fetch_object($asm_result);
			
			$asm_id		= $asm_user -> user_id;
			$asm_name	= $asm_user -> username; 
			
			// Assigning lead to asm 
			
			$assign_lead_to_asm = 'UPDATE `lead` '
				. ' SET lead_assigned_to_asm = '.$asm_id.','
				. ' lead_assigned_to_asm_on = "'.$current_date.'"'
				. ' WHERE enquiry_id = '.$enquiry_id.' LIMIT 1';
			
			if(mysql_query($assign_lead_to_asm)){
					
				// update capacity 
				
				$update_remaining_capacity = 'UPDATE mpl_capacity SET'
					. ' remaining_capacity = remaining_capacity - 1 , edited_by = '.$user.''
					. ' WHERE userId = '.$asm_id.' LIMIT 1';
				mysql_query($update_remaining_capacity);
				
				// log history 
				
				$history_text	= 'Multiple project lead has been assigned to Area Sales Manager '.$asm_name.' on '. date('Y-m-d H:i:s');
				$details		= '<p>Lead Details - <br/>Enquiry ID - '.$enquiry_id.'</p>';
				$history_text	.= $details;	
				$lead_number	= getLeadNumber($enquiry_id);
			
				$insert_history = 'INSERT lead_history (lead_number, enquiry_id, details, type) VALUES ("'.$lead_number.'",'.$enquiry_id.', "'.$history_text.'","new")';

				mysql_query($insert_history);
				
				// Assigning to sales person from round robin method 

				$request_url	= BASE_URL .'apis/round_robin_assignment.php';
				$ch				= curl_init();
				curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);
				curl_setopt ($ch, CURLOPT_URL,$request_url);
				curl_setopt ($ch, CURLOPT_POST, 1);
				curl_setopt ($ch, CURLOPT_POSTFIELDS,array('enquiry_ids' => serialize(array($enquiry_id)), 'asm_id' => $asm_id ));
				curl_exec ( $ch );
				curl_close($ch);
				
				// Success response 
				$response = array('success' => 1, 'message' => 'Lead/ Enquiry has been successfully assigned.');
				echo json_encode($response, true); exit;
			}
		}else{
			
			// error response 
			$error_response = array('success' => 0, 'message' => 'Lead could not be assigned. No Area sales manager found for assignment');
			echo json_encode($error_response,true); exit;
		}
	}
}else{
	
	$response = array('success' => 1, 'message' => 'Assignment could not be done. No Project found for this Lead/ Enquiry');
	echo json_encode($response,true); exit;
}
