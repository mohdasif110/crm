<?php
session_start();
require_once 'function.php';

$data = json_decode(file_get_contents('php://input'),TRUE);

//echo '<pre>'; print_r($data); exit;

if(!empty($data) && isset($data['enquiry_id'])){
	
	$enquiry_id		= $data['enquiry_id'];
	
	if(isset($data['lead_id']) && $data['lead_id'] != 'NULL'){
		$lead_id		= $data['lead_id'];
	}else{
		$lead_id		= 'NULL';
	}
	
	$status_id			= $data['status_id'];
	
	$sub_status_id		= $data['sub_status_id'];
	
	$status_title		= getStatusLabel($status_id,'parent');
	$sub_status_title	= getStatusLabel($sub_status_id,'child');
	
	$update_lead = array(
		'disposition_status_id'	=> $status_id,
		'disposition_sub_status_id' => (isset($sub_status_id) && $sub_status_id != 'NULL' ? : 'NULL'),
		'future_followup_date'		=> (isset($data['callback_date']) ? $data['callback_date'] : 'NULL'),
		'future_followup_time'		=> (isset($data['callback_time']) ? $data['callback_time'] : 'NULL'),
		'enquiry_status_remark'		=> $data['remark']
	);
	
	$update_sql = 'UPDATE `lead` SET ';
	
	foreach ($update_lead as $column => $val){
		
		$update_sql .= $column .' = "'.$val.'" , ';
	}
	
	$update_sql_trimmed = rtrim($update_sql,' , ');
	
	$update_sql_trimmed .= ' WHERE enquiry_id = '.$enquiry_id.' LIMIT 1';
	
	$is_lead_update = false; // Flag to save result for update query 
	
	if(mysql_query($update_sql_trimmed)){
		$is_lead_update = true;
	}
	
	if($is_lead_update){
	
			if(isset($data['is_meeting_scheduled']) || isset($data['is_meeting_rescheduled'])){
		
		// save meeting data in lead meeting 
		
		$meeting_data = array(
			'enquiry_id' => $enquiry_id,
			'lead_number' => $lead_id,
			'meeting_status' => $sub_status_title,
			'employee_id' => $data['employee_id'],
			'meeting_date' => $data['callback_date'],
			'meeting_time' => $data['callback_time'],
			'remark' => $data['remark'],
			'meeting_address' => $data['meeting_address'],
			'meeting_location_type' => $data['meeting_location_type']
		);
		
		$add_meeting = 'INSERT INTO `lead_meeting` SET ';
		
		foreach($meeting_data as $col => $val){
			$add_meeting .= $col .' = "'.$val.'" , ';
		}
		
		$add_meeting_trimmed = rtrim($add_meeting,' , ');
		
		$is_meeting_add = false;
		
		if(mysql_query($add_meeting_trimmed)){
			$is_meeting_add = true;
		}
		
		if($is_meeting_add){
			
			// Create a log for meeting status in history table 
			
			$history_detail = 'Meeting has been '.$sub_status_title.' for enquiry '.$enquiry_id.' on '.date('l dS M, Y', strtotime($data['callback_date'])).' at '.date('H:i A',strtotime($data['callback_time'])).'';
			
			$history_data = array(
				'enquiry_id' => $enquiry_id,
				'lead_number' => $lead_id,
				'details' => mysql_real_escape_string($history_detail),
				'employee_id' => $data['employee_id'],
				'type' => 'edit'
			);
			
			$insert_history = 'INSERT INTO `lead_history` SET ';
			
			foreach($history_data as $col => $val){
				$insert_history .= $col .' = "'.$val.'" ,';
			}
			
			mysql_query(rtrim($insert_history,' ,'));
		}
		
	}
	
			if(isset($data['is_site_visit_scheduled']) || isset($data['is_site_visit_rescheduled'])){
		
				// save site visit data in site visit 
		
				$client_info = getCLientInfoByEnquiry($enquiry_id);
				
				$site_visit_data = array(
					'enquiry_id' => $enquiry_id,
					'lead_number' => $lead_id,
					'site_visit_status' => $sub_status_title,
					'employee_id' => $data['employee_id'],
					'site_visit_date' => $data['callback_date'],
					'site_visit_time' => $data['callback_time'],
					'site_location' => $data['site_visit_address'],
					'number_of_person_visited' => $data['no_of_people_for_site_visit'],
					'project_name' => ( isset($data['site_visit_project']) ? $data['site_visit_project']: '' ),
					'remark' => $data['remark'],
					'client_name' => $client_info['customerName'],
					'client_email' => $client_info['customerEmail'],
					'client_number' => $client_info['customerMobile']
				);
		
				$add_site_visit = 'INSERT INTO `site_visit` SET ';
		
				foreach($site_visit_data as $col => $val){
					$add_site_visit .= $col .' = "'.$val.'" , ';
				}
		
				$add_site_visit_trimmed = rtrim($add_site_visit,' , ');
	
				$is_site_visit_add = false;
		
				if(mysql_query($add_site_visit_trimmed)){
					$is_site_visit_add = true;
				}
		
				if($is_site_visit_add){
			
					$history_detail = 'Site Vist has been '.$sub_status_title.' for enquiry '.$enquiry_id.' on '.date('l dS M, Y', strtotime($data['callback_date'])).' at '.date('H:i A',strtotime($data['callback_time'])).'';
			
					$history_data = array(
						'enquiry_id' => $enquiry_id,
						'lead_number' => $lead_id,
						'details' => mysql_real_escape_string($history_detail),
						'employee_id' => $data['employee_id'],
						'type' => 'edit'
					);
			
			
					$insert_history = 'INSERT INTO `lead_history` SET ';
			
					foreach($history_data as $col => $val){
						$insert_history .= $col .' = "'.$val.'" ,';
					}
			
					mysql_query(rtrim($insert_history,' ,'));
				}
		
			}

			if(isset($data['is_call_back'])){
		
				// Log callback staus for lead in history table  
		
				$history_detail = 'A Callback has been placed for enquiry '.$enquiry_id.' on '.date('l dS M, Y', strtotime($data['callback_date'])).' at '.date('H:i A',strtotime($data['callback_time'])).'';
			
				$history_data = array(
					'enquiry_id' => $enquiry_id,
					'lead_number' => $lead_id,
					'details' => mysql_real_escape_string($history_detail),
					'employee_id' => $data['employee_id'],
					'type' => 'edit'
				);		
			
				$insert_history = 'INSERT INTO `lead_history` SET ';
			
				foreach($history_data as $col => $val){
					$insert_history .= $col .' = "'.$val.'" ,';
				}
			
				mysql_query(rtrim($insert_history,' ,'));
		
			}
	
			if(isset($data['is_technical_issue'])){
				
				// Log history of enquiry/ lead
										
				$history_detail = 'Status has been changed to '.$sub_status_title.' for enquiry '.$enquiry_id.' on '.date('l dS M, Y').' at '.date('H:i A').'';
			
				$history_data = array(
					'enquiry_id' => $enquiry_id,
					'lead_number' => $lead_id,
					'details' => mysql_real_escape_string($history_detail),
					'employee_id' => $data['employee_id'],
					'type' => 'edit'
				);		
			
				$insert_history = 'INSERT INTO `lead_history` SET ';
			
				foreach($history_data as $col => $val){
					$insert_history .= $col .' = "'.$val.'" ,';
				}
			
				mysql_query(rtrim($insert_history,' ,'));
				
			}
			
			if(isset($data['is_not_intrested'])){
				
				$history_detail = 'Status has been changed to '.$status_title.' for enquiry '.$enquiry_id.' on '.date('l dS M, Y').' at '.date('H:i A').'';
			
				$history_data = array(
					'enquiry_id' => $enquiry_id,
					'lead_number' => $lead_id,
					'details' => mysql_real_escape_string($history_detail),
					'employee_id' => $data['employee_id'],
					'type' => 'edit'
				);		
			
				$insert_history = 'INSERT INTO `lead_history` SET ';
			
				foreach($history_data as $col => $val){
					$insert_history .= $col .' = "'.$val.'" ,';
				}
			
				mysql_query(rtrim($insert_history,' ,'));
			}
			
			echo json_encode(array('success' => 1, 'message' => 'Lead status has been updated successfully'), true); exit;
	}else{
		// Failure response of lead not updated 
		echo json_encode(array('success' => 0, 'message' => 'Lead could not be updated'),true); exit;
	}
}
else{

	// Error response from server 
	
	echo json_encode(array('success' => 0, 'message' => 'Lead could not be updated. Insufficient data passed.'),true); exit;
	
}