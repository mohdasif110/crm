<?php
/*
 * API to create new meeting 
 */

$meeting = array(
	'meetingId' => '',
	'lead_number' => '',
	'enquiry_id' => '',
	'meeting_status' => '',
	'meeting_timestamp' => '',
	'project' => '',
	'client' => '',
	'executiveId' => '',
	'executiveName' => '',
	'feedback' => '',
	'meeting_created_at' =>'',
	'remark' => '',
	'meeting_address' => '',
	'meeting_location_type' => '',
	'attendees' => '',
	'is_reminder_mail_sent' => '',
	'is_reminder_sms_sent' => '',
	'meeting_update_on' => ''
);

$_post = filter_input_array(INPUT_POST);

if( isset($_post) && !empty($_post)){
	
	if( isset($_post['enquiry_id'])){
		$meeting['enquiry_id'] = $_post['enquiry_id'];
	}
	
	if( isset($_post['project'])){
		$meeting['project'] = json_encode($_post['project'],true);
	}
	
	if( isset($_post['client'])){
		$meeting['client'] = json_encode($_post['client'],true);
	}
	
	if( isset( $_post['meeting_address']) ){
		$meeting['meeting_address'] = $_post['meeting_address'];
	}
	
	if( isset($_post['meeting_time'])){
		$meeting['meeting_timestamp'] = time() * 1000;
	}
	
	if( isset($_post['employee_id'])){	
		$meeting['executiveId'] = $_post['employee_id'];
	}
	
	if( isset($_post['employee_name'])){
		$meeting['executiveName'] = $_post['employee_name'];
	}
	
}
