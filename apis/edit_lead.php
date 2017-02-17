<?php
session_start();

require_once 'function.php';

// post data 
$post_data = filter_input_array(INPUT_POST);

if(!empty($post_data)){
	
	$lead_auto_number = $post_data['client_basic_info']['id']; // auto increment number
	
	$enquiry_id		= $post_data['client_basic_info']['enquiry_id'];
	$lead_number		= $post_data['client_basic_info']['lead_id'];
	
	// Customer details 
	$customer_mobile			= $post_data['client_basic_info']['customerMobile'];
	$customer_alternate_mobile	= $post_data['client_basic_info']['customer_alternate_mobile'];
	$customer_name				= $post_data['client_basic_info']['customerName'];
	$customer_email				= $post_data['client_basic_info']['customerEmail'];
	$customer_profession		= $post_data['client_basic_info']['customerProfession'];
	$customer_dob				= $post_data['client_basic_info']['customerDOB'];
	$customer_city				= $post_data['client_basic_info']['customerCity'];
	$customer_state				= $post_data['client_basic_info']['customerState'];
	$customer_address			= $post_data['client_basic_info']['customerAddress'];
	$customer_remark			= $post_data['client_basic_info']['customerRemark'];
	$customer_gender			= $post_data['client_basic_info']['customer_gender'];
	$customer_landline			= '-';
	$landline					= '';
	$lead_primary_source		= '';
	$lead_secondary_source		= '';
	
	if(isset($post_data['landline'])){
		
		$landline = $post_data['landline'];
		$customer_landline = $landline['std']. '-'.$landline['number'].'-'.$landline['ext'];
	}
	
	// lead source 
	$lead_primary_source	=	$post_data['client_basic_info']['leadPrimarySource'];
	$lead_secondary_source	=	$post_data['client_basic_info']['leadSecondarySource'];
	
	// customer preferences 
	
	$customer_bhk_preference				= '';
	$customer_property_state_preference		= '';
	$customer_budget_preference			= '';
	$customer_property_type_preference		= '';
	
	if(isset($post_data['filters'])){
		
		$filter = $post_data['filters'];
		
		if($filter['bhk'] != ''){
			$customer_bhk_preference = $filter['bhk'];
		}
		
		if($filter['property_status']){
			$customer_property_state_preference = $filter['property_status'];
		}
		
		if(!empty($filter['property_types'])){
			$customer_property_type_preference = implode(',', $filter['property_types']);
		}
		
		if(!empty($filter['budget'])){
			
			if($filter['budget']['min'] != '' && $filter['budget']['max']){
				
				$customer_budget_preference = $filter['budget']['min'] . '-'. $filter['budget']['max'];
			}
		}
	}
	
	// Lead update date
	$lead_update_date = date('Y-m-d H:i:s');
	
	// lead updated by 
	if(isset($post_data['user'])){
		$lead_update_by = $post_data['user']['id'];
	}

	// Callback date and time 
	$callback_date			= '';
	$callback_time			= '';
	$disposition_status_remark		= '';
	
	if(isset($post_data['followup']) && !empty($post_data['followup'])){
		
		if($post_data['followup']['callback_date'] != ''){
			$callback_date = date('Y-m-d', strtotime($post_data['followup']['callback_date']));
		}
		
		if($post_data['followup']['callback_time'] != ''){
			$callback_time = $post_data['followup']['callback_time'];
		}
		
		$disposition_status_remark = $post_data['followup']['status_remark'];
	}
	
	// disposition status 
	$disposition_status_id			= $post_data['client_basic_info']['disposition_status_id'];
	$disposition_status_sub_id		= $post_data['client_basic_info']['disposition_sub_status_id'];
	$disposition_status_title		= getStatusLabel($post_data['client_basic_info']['disposition_sub_status_id'],'parent');
	$disposition_status_sub_title	= getStatusLabel($post_data['client_basic_info']['disposition_sub_status_id'],'child');
	
	// get disposition status title and prepare slug by joining title with underscore
	if(isset($post_data['lead_enquiry'])){
		
		$disposition_status_id		= $post_data['lead_enquiry']['id'];
		$disposition_status_title	= str_replace(' ','_',$post_data['lead_enquiry']['group_title']);
		
		if($post_data['lead_enquiry']['sub_status_id'] != ''){
			$disposition_status_sub_id = $post_data['lead_enquiry']['sub_status_id'];
		}
		
		if($post_data['lead_enquiry']['sub_status_title'] != ''){
			$disposition_status_sub_title = str_replace(' ','_',$post_data['lead_enquiry']['sub_status_title']);
		}
		
		
		// Add new enquiry status if any changes have been made 
		
		/** 
		* insert meeting record
		*/
		
		if(strtolower($disposition_status_title) == 'meeting'){
		
			$meeting_status		= $disposition_status_sub_title;
			$meeting_date		= $callback_date;
			$meeting_time		= $callback_time;
			$meeting_remark		=  $disposition_status_remark;

			$meeting_data = array(
				'lead_number' => $lead_number,
				'enquiry_id' => $enquiry_id,
				'meeting_status' => $meeting_status,
				'meeting_date' => $meeting_date,
				'meeting_time' => $meeting_time,
				'remark' => $meeting_remark
			);
	
			$insert_meeting = 'INSERT INTO `lead_meeting` SET '; 
			foreach($meeting_data as $column => $value){
				$insert_meeting .= ' '.$column.' = "'.$value.'" ,';
			}
		
			$insert_meeting_sql = rtrim($insert_meeting, ',');		
			mysql_query($insert_meeting_sql);
		}

	
		/**
		 *  insert site visit record 
		 */
	
		if(strtolower($disposition_status_title) == 'site_visit'){
		
			$site_visit_status	= $disposition_status_sub_title;
			$site_visit_date	= $callback_date;
			$site_visit_time	= $callback_time;
			$client_name		= $customer_name;
			$client_email		= $customer_email;
			$client_number	= $customer_mobile;
			$remark		= $disposition_status_remark;

			$site_visit_data = array(
				'lead_number' => $lead_number,
				'enquiry_id' => $enquiry_id,
				'site_visit_status' => $site_visit_status,
				'site_visit_date' => $site_visit_date,
				'site_visit_time' => $site_visit_time,
				'client_name' => $client_name,
				'client_email' => $client_email,
				'client_number' => $client_number,
				'remark' => $disposition_status_remark
			);

			$insert_site_visit = 'INSERT INTO `site_visit` SET '; 

			foreach($site_visit_data as $column => $value){
				$insert_site_visit .= ' '.$column.' = "'.$value.'" ,';
			}

			$insert_site_visit_sql = rtrim($insert_site_visit, ',');		
			mysql_query($insert_site_visit_sql);
		}
	
	}
	
	
	$is_cold_call = 0; // Flag for cold call
	
	$future_callback_date	= '';
	$future_callback_time	= '';
	
	if (strtolower($disposition_status_title) == 'future_references' || strtolower($disposition_status_title) === 'future_reference') {

		if (strtolower($disposition_status_sub_title) === 'cold_call') {
			$is_cold_call = 1;	
		} else {
			$future_callback_date = date('Y-m-d', strtotime($callback_date));
			$future_callback_time = $callback_time;
		}
	}
	
	
	// save enquiry projects if any 
	$projects = array();
	
	if (isset($post_data['projects']) && !empty($post_data['projects']['projects'])) {

		$projects = $post_data['projects']['projects'];
		
			foreach ($projects as $key => $val) {

				$project_id		=	$val['id'];
				$project_name	=	$val['project_name'];
				$project_url		=	$val['project_url'];

				$enquiry_project_lead_number = 'NULL';

				if($lead_number != ''){
					$enquiry_project_lead_number = $lead_number;
				}

				$save_enquiry_projects = 'INSERT INTO `lead_enquiry_projects`'
						. '  (enquiry_id,lead_number,project_id,project_name,project_url) '
						. ' VALUES (' . $enquiry_id . ','.$enquiry_project_lead_number.',' . $project_id . ',"' . $project_name . '","' . $project_url . '")';

				
				mysql_query($save_enquiry_projects);
				
			}
		}
	
	
			
	/**
	 *  log data lead history table 
	 */
	$log_history = array();
	
	$log_history['lead_number']		=	( $lead_number!= '' ? $lead_number :  NULL);
	$log_history['enquiry_id']		=	$enquiry_id;
	$log_history['employee_id']		=	$post_data['user']['id'];
	$log_history['details']			=	'Lead has been updated';
	$log_history['type']			=	'edit';
	
	$insert_lead_hsitory = 'INSERT INTO `lead_history` SET ';
	foreach($log_history as $column => $value){
		$insert_lead_hsitory .= ' '.$column.' = "'.$value.'" ,';
	}
	
	$insert_lead_hsitory_sql = rtrim($insert_lead_hsitory,',');
	
	mysql_query($insert_lead_hsitory_sql);
	
	/**
	 *  Now update data in lead table
	 */
	$lead_data = array();
	$lead_data['lead_id']						= ( $lead_number!= '' ? $lead_number :  NULL);
	$lead_data['enquiry_id']					= $enquiry_id;
	$lead_data['customerMobile']				= $customer_mobile;
	$lead_data['customer_alternate_mobile']			= $customer_alternate_mobile;
	$lead_data['customerLandline']				= $customer_landline;
	$lead_data['customerEmail']					= $customer_email;
	$lead_data['customerName']					= $customer_name;
	$lead_data['customerProfession']				= $customer_profession;
	$lead_data['customer_gender']				= $customer_gender;
	$lead_data['customerCity']					= $customer_city;
	$lead_data['customerState']					= $customer_state;
	$lead_data['customerDOB']					= $customer_dob;
	$lead_data['customerAddress']				= $customer_address;
	$lead_data['customerRemark']				= $customer_remark;
	$lead_data['leadPrimarySource']				= $lead_primary_source;
	$lead_data['leadSecondarySource']				= $lead_secondary_source;
	$lead_data['disposition_status_id']				= $disposition_status_id;
	$lead_data['disposition_sub_status_id']			= $disposition_status_sub_id;
	$lead_data['lead_updated_by']				= $lead_update_by;
	$lead_data['future_followup_date']				= $future_callback_date;
	$lead_data['future_followup_time']				= $future_callback_time;
	$lead_data['is_cold_call']					= $is_cold_call;
	$lead_data['customer_bhk_preference']			= $customer_bhk_preference;
	$lead_data['customer_project_state_preference']		= $customer_property_state_preference;
	$lead_data['customer_property_type_preference']		= $customer_property_type_preference;
	$lead_data['customer_budget_preference']			= $customer_budget_preference;
	$lead_data['enquiry_status_remark']			= $disposition_status_remark;
	
	$lead_updated_on_id = $lead_auto_number;
	
	$update_lead = 'UPDATE `lead` SET ';
	
	foreach($lead_data as $column => $value){
		$update_lead .= ' '.$column.' = "'.$value.'" ,';
	}
	
	$update_lead_sql = rtrim($update_lead,',');
	
	$update_lead_sql .= ' WHERE `id` = '.$lead_updated_on_id.' AND `enquiry_id` = '.$enquiry_id.'';
	
	if(mysql_query($update_lead_sql)){
		
		$success_response = array('success' => 1, 'message' => 'Lead has been updated successfully');
		echo json_encode($success_response,true); exit; 
	}else{
		$failure_response = array('success' => 0, 'message' => 'Lead could not be updated');
		echo json_encode($failure_response,true); exit; 
	}
}else{
	
	// No data error resonse to client 
	$no_data = array('success' => 0, 'message' => 'No Data Recieved');
	echo json_encode($no_data,true); exit; 
}




