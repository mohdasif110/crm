<?php
session_start();
require_once 'function.php';

$data = json_decode(file_get_contents('php://input'), TRUE);

if (!empty($data) && isset($data['enquiry_id'])) {

	$enquiry_id = $data['enquiry_id'];

	if (isset($data['lead_id']) && $data['lead_id'] != 'NULL') {
		$lead_id = $data['lead_id'];
	} else {
		$lead_id = 'NULL';
	}

	$status_id = $data['status_id'];
	$sub_status_id = $data['sub_status_id'];
	$status_title = getStatusLabel($status_id, 'parent');
	$sub_status_title = getStatusLabel($sub_status_id, 'child');

	$callback_date = 'NULL';
	$callback_time = 'NULL';

	if (isset($data['callback_date'])) {
		$callback_date = $data['callback_date'];
	}

	if (isset($data['callback_time'])) {
		$callback_time = $data['callback_time'];
	}

	// update status  remark 
	$remark = ( isset($data['remark']) ? $data['remark'] : '' );

	// employee who did update 
	$employee_id = ( isset($data['employee_id']) ? $data['employee_id'] : '' );
	$employee_name = getEmployeeName($employee_id);

	$update_lead = array(
		'disposition_status_id' => $status_id,
		'disposition_sub_status_id' => ( isset($sub_status_id) && $sub_status_id != 'NULL' ? $sub_status_id : 'NULL' ),
		'future_followup_date' => $callback_date,
		'future_followup_time' => $callback_time,
		'enquiry_status_remark' => $remark
	);

	$update_sql = 'UPDATE `lead` SET ';

	foreach ($update_lead as $column => $val) {

		$update_sql .= $column . ' = "' . $val . '" , ';
	}

	$update_sql_trimmed = rtrim($update_sql, ' , ');

	$update_sql_trimmed .= ' WHERE enquiry_id = ' . $enquiry_id . ' LIMIT 1';

	$is_lead_update = false; // Flag to save result for update query 

	if (mysql_query($update_sql_trimmed)) {
		$is_lead_update = true;
	}

	if ($is_lead_update) {

		// if meeting scheduled or re-scheduled event is happening
		if (isset($data['is_meeting_scheduled']) || isset($data['is_meeting_rescheduled'])) {

			// save meeting data in lead meeting 

			if ($data['is_meeting_scheduled'] == 1 || $data['is_meeting_rescheduled'] == 1) {

				
				// Meeting secondary status
				$meeting_event = '';
				if( $data['is_meeting_scheduled'] == 1 ){
					$meeting_event = 'meeting_schedule';
				}
				
				if( $data['is_meeting_rescheduled'] == 1 ){
					$meeting_event = 'meeting_reschedule';
				}
				
				// generate lead number 
				if ($lead_id == 'NULL') {

					$lead_id = generateLeadNumber($enquiry_id);

					// update lead number with 
					mysql_query('UPDATE lead SET lead_id = "' . $lead_id . '" WHERE enquiry_id = ' . $enquiry_id . ' LIMIT 1');
				}

				$meeting_data = array(
					'enquiry_id' => $enquiry_id,
					'lead_number' => $lead_id,
					'meeting_status' => $sub_status_title,
					'employee_id' => $employee_id,
					'meeting_date' => $callback_date,
					'meeting_time' => $callback_time,
					'remark' => $remark,
					'meeting_address' => ( isset($data['meeting_address']) ? $data['meeting_address'] : ''),
					'meeting_location_type' => ( isset($data['meeting_location_type']) ? $data['meeting_location_type'] : '' )
				);

				$meeting_sql = 'INSERT INTO `lead_meeting` SET ';

				foreach ($meeting_data as $col => $val) {
					$meeting_sql .= $col . ' = "' . $val . '" ,';
				}

				// Trim comma from sql string
				$meeting_sql_trim = rtrim($meeting_sql, " ,");

				$meeting_sql_trim .= ' ON DUPLICATE KEY UPDATE '
						. ' meeting_status = "' . $sub_status_title . '",'
						. ' employee_id = "' . $employee_id . '",'
						. ' meeting_date = "' . $callback_date . '",'
						. ' meeting_time = "' . $callback_time . '",'
						. ' remark = "' . $remark . '",'
						. ' meeting_address = "' . ( isset($data['meeting_address']) ? $data['meeting_address'] : '') . '",'
						. ' meeting_location_type = "' . ( isset($data['meeting_location_type']) ? $data['meeting_location_type'] : '' ) . '"';

				if (mysql_query($meeting_sql_trim)) {

					// ENQUIRY LOG 	
					// Create a log for meeting status in history table 

					$history_detail = 'Enquiry status has been changed to Meeting ' . $sub_status_title . ' by ' . $employee_name .' on '. date('Ym-d H:i:s');

					$history_data = array(
						'enquiry_id' => $enquiry_id,
						'lead_number' => $lead_id,
						'details' => mysql_real_escape_string($history_detail),
						'employee_id' => $employee_id,
						'type' => 'edit'
					);

					$insert_history = 'INSERT INTO `lead_history` SET ';

					foreach ($history_data as $col => $val) {
						$insert_history .= $col . ' = "' . $val . '" ,';
					}

					mysql_query(rtrim($insert_history, ' ,'));

					// send mail and sms to client 
					
					$email_template_id = getEmailTemplateId('external', $meeting_event);
					
					// update Email template Id 
					
					if(mysql_query('UPDATE `lead` SET email_template_id = "'.$email_template_id.'" WHERE enquiry_id = '.$enquiry_id.' LIMIT 1')){
						sendMeetingReminder($enquiry_id);
					}
		
					echo json_encode(array('success' => 1, 'message' => 'Lead status has been updated successfully'), true);
					exit;
				}
			}
		}

		// If meeting done event is happening
		if (isset($data['is_meeting_done'])) {

			if ($data['is_meeting_done'] == 1) {

				// update meeting status as done  

				$update_meeting_done_status = 'UPDATE `lead_meeting` SET '
						. ' meeting_done_on = "' . date('Y-m-d H:i:s') . '",'
						. ' meeting_status = "Done",'
						. ' employee_id = "' . $employee_id . '",'
						. ' remark = "' . $remark . '"'
						. ' WHERE enquiry_id = ' . $enquiry_id . ' LIMIT 1';

				if (mysql_query($update_meeting_done_status)) {

					// log for lead history 
					$log_details = 'Enquiry status has been changed to meeting done by ' . $employee_name;
					$log = 'INSERT INTO `lead_history` '
							. ' SET '
							. ' lead_number = "' . $lead_id . '",'
							. ' enquiry_id = ' . $enquiry_id . ','
							. ' details = "' . $log_details . '",'
							. ' employee_id = "' . $employee_id . '",'
							. ' type = "new"';

					mysql_query($log);
				}
			}
		}

		// if site_visit_scheduled or re-scheduled event is happening 
		if (isset($data['is_site_visit_scheduled']) || isset($data['is_site_visit_rescheduled'])) {

			// save site visit data in site visit 

			if ($data['is_site_visit_scheduled'] == 1 || $data['is_site_visit_rescheduled'] == 1) {

				$client_info = getCLientInfoByEnquiry($enquiry_id);
				$site_visit_project = ( isset($data['site_visit_project']) ? $data['site_visit_project'] : '' );

				$site_visit_data = array(
					'enquiry_id' => $enquiry_id,
					'lead_number' => $lead_id,
					'site_visit_status' => $sub_status_title,
					'employee_id' => $employee_id,
					'site_visit_date' => $callback_date,
					'site_visit_time' => $callback_time,
					'site_location' => (isset($data['site_visit_address']) ? $data['site_visit_address'] : ''),
					'number_of_person_visited' => ( isset($data['no_of_people_for_site_visit']) ? $data['no_of_people_for_site_visit'] : '' ),
					'project_name' => $site_visit_project,
					'remark' => $remark,
					'client_name' => $client_info['customerName'],
					'client_email' => $client_info['customerEmail'],
					'client_number' => $client_info['customerMobile']
				);

				$create_site_visit = 'INSERT INTO `site_visit` SET ';

				foreach ($site_visit_data as $col => $val) {
					$create_site_visit .= $col . ' = "' . $val . '" ,';
				}

				$create_site_visit = rtrim($create_site_visit, ' ,');

				$create_site_visit .= ' ON DUPLICATE KEY UPDATE '
						. ' site_visit_status = "' . $sub_status_title . '",'
						. ' employee_id = "' . $employee_id . '",'
						. ' site_visit_date = "' . $callback_date . '",'
						. ' site_visit_time = "' . $callback_time . '",'
						. ' site_location = "' . $data['site_visit_address'] . '",'
						. ' number_of_person_visited = "' . ( isset($data['no_of_people_for_site_visit']) ? $data['no_of_people_for_site_visit'] : '' ) . '",'
						. ' project_name = "' . $site_visit_project . '",'
						. ' remark = "' . $remark . '"';


				if (mysql_query($create_site_visit)) {

					$history_detail = 'Site Visit has been ' . $sub_status_title . ' by ' . $employee_name . ' for ' . $site_visit_project;

					$history_data = array(
						'enquiry_id' => $enquiry_id,
						'lead_number' => $lead_id,
						'details' => mysql_real_escape_string($history_detail),
						'employee_id' => $employee_id,
						'type' => 'edit'
					);

					$insert_history = 'INSERT INTO `lead_history` SET ';

					foreach ($history_data as $col => $val) {
						$insert_history .= $col . ' = "' . $val . '" ,';
					}

					mysql_query(rtrim($insert_history, ' ,'));
				}
			}
		}

		if (isset($data['site_visit_done'])) {

			if ($data['site_visit_done'] == 1) {

				$site_visit_done_status = 'UPDATE `site_visit` SET '
						. ' is_site_visit_done = "' . date('Y-m-d H:i:s') . '",'
						. ' site_visit_status = "' . $sub_status_title . '",'
						. ' employee_id = "' . $employee_id . '",'
						. ' remark = "' . $remark . '"'
						. ' WHERE enquiry_id = ' . $enquiry_id . ' LIMIT 1';

				if (mysql_query($site_visit_done_status)) {

					// log for lead history 
					$log_details = 'Site visit has been done by ' . $employee_name;
					$log = 'INSERT INTO `lead_history` '
							. ' SET '
							. ' enquiry_id = ' . $enquiry_id . ','
							. ' details = "' . $log_details . '",'
							. ' employee_id = "' . $employee_id . '",'
							. ' type = "new"';

					mysql_query($log);
				}
			}
		}

		// if call back status is set 
		if (isset($data['is_call_back'])) {

			if ($data['is_call_back'] == 1) {

				// Log callback staus for lead in history table  

				$history_detail = 'A Callback has been placed for enquiry ' . $enquiry_id . ' on ' . date('l dS M, Y', strtotime($callback_date)) . ' at ' . date('H:i A', strtotime($callback_time)) . '';

				$history_data = array(
					'enquiry_id' => $enquiry_id,
					'lead_number' => $lead_id,
					'details' => mysql_real_escape_string($history_detail),
					'employee_id' => $employee_id,
					'type' => 'edit'
				);

				$insert_history = 'INSERT INTO `lead_history` SET ';

				foreach ($history_data as $col => $val) {
					$insert_history .= $col . ' = "' . $val . '" ,';
				}

				mysql_query(rtrim($insert_history, ' ,'));
			}
		}

		// if technical issue is set 
		if (isset($data['is_technical_issue'])) {

			// Log history of enquiry/ lead
			if ($data['is_technical_issue'] == 1) {

				$history_detail = 'Status has been changed to ' . $sub_status_title . ' by ' . $employee_name;

				$history_data = array(
					'enquiry_id' => $enquiry_id,
					'lead_number' => $lead_id,
					'details' => mysql_real_escape_string($history_detail),
					'employee_id' => $employee_id,
					'type' => 'edit'
				);

				$insert_history = 'INSERT INTO `lead_history` SET ';

				foreach ($history_data as $col => $val) {
					$insert_history .= $col . ' = "' . $val . '" ,';
				}

				mysql_query(rtrim($insert_history, ' ,'));
			}
		}

		if (isset($data['is_not_intrested'])) {

			if ($data['is_not_intrested']) {

				$history_detail = 'Status has been changed to ' . $status_title . ' by ' . $employee_name;

				$history_data = array(
					'enquiry_id' => $enquiry_id,
					'lead_number' => $lead_id,
					'details' => mysql_real_escape_string($history_detail),
					'employee_id' => $employee_id,
					'type' => 'edit'
				);

				$insert_history = 'INSERT INTO `lead_history` SET ';

				foreach ($history_data as $col => $val) {
					$insert_history .= $col . ' = "' . $val . '" ,';
				}

				mysql_query(rtrim($insert_history, ' ,'));
			}
		}

		echo json_encode(array('success' => 1, 'message' => 'Lead status has been updated successfully'), true);
		exit;
	} else {
		// Failure response of lead not updated 
		echo json_encode(array('success' => 0, 'message' => 'Lead could not be updated'), true);
		exit;
	}
} else {

	// Error response from server 

	echo json_encode(array('success' => 0, 'message' => 'Lead could not be updated. Insufficient data passed.'), true);
	exit;
}