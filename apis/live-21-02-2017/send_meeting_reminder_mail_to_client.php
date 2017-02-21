<?php

/* API to send reminder mails for meeting status(s)*/

require 'function.php';

$_post_data = filter_input_array(INPUT_POST);

$enquiry_id		= '';
$client_data	= array();
$project_data	= array();

function sendMailData( $email_data = '', $enquiry_id = ''){
	
	$curl_url	= BASE_URL . 'apis/sendEmailReminder.php';
	$curl		= curl_init($curl_url);
	curl_setopt_array($curl, array(
		CURLOPT_RETURNTRANSFER => false,
		CURLOPT_POST => 1,
		CURLOPT_POSTFIELDS => $email_data
	));
	
	$result = curl_exec($curl);
	
	if($result){
		
		// set flag of email sent or not
		mysql_query('UPDATE lead SET `is_email_template_sent` = "'.date('Y-m-d H:i:s').'" WHERE enquiry_id = '.$enquiry_id.'');
	}
	
	curl_close($curl);
}

function sendSMS($numbers = array() , $message = ''){
	
	if( !empty($numbers)){
		
		foreach($numbers as $number){
			
			$message = urlencode($message);
			$url = 'http://5.189.187.160/api/mt/SendSMS?user=bookmyhouse01&password=123456&senderid=BKMYHS&channel=2&DCS=0&flashsms=0&number='.$number.'&text='.$message.'&route=1';
		
			// Get cURL resource
			$curl = curl_init();
			// Set some options - we are passing in a useragent too here
			curl_setopt_array($curl, array(
				CURLOPT_RETURNTRANSFER => false,
				CURLOPT_URL => $url,
				CURLOPT_TIMEOUT => 120
			));
			// Send the request & save response to $resp
			$resp = curl_exec($curl);
			// Close request to clear up some resources
			curl_close($curl);
		} // end foreach
	} // end if condition 
}

if( isset($_post_data) && isset($_post_data['enquiry_id'])){	
	$enquiry_id = $_post_data['enquiry_id'];
}

if( $enquiry_id != ''){
	
	// Get client info 
	
	$client_info_query = 'SELECT '
			. ' customerMobile, customer_alternate_mobile, '
			. ' customerLandline, customerEmail, customerName, '
			. ' customerProfession, customerCity, customerAddress, '
			. ' email_template_id, lead_id, disposition_status_id, '
			. ' disposition_sub_status_id, lead_assigned_to_asm, lead_assigned_to_sp '
			. ' FROM lead WHERE enquiry_id = '.$enquiry_id.' LIMIT 1';
	
	$client_info_result = mysql_query($client_info_query);

	if($client_info_result && mysql_num_rows($client_info_result) > 0) {
		
		$client_data  = mysql_fetch_object($client_info_result);
	}

	// Project Info
	
	$project_info = 'SELECT project_name, project_city, project_url FROM lead_enquiry_projects WHERE enquiry_id = '.$enquiry_id.'';
	$project_info_result = mysql_query($project_info);
	
	if($project_info_result && mysql_num_rows($project_info_result) > 0){
		while($row = mysql_fetch_assoc($project_info_result)){
			array_push($project_data, $row);
		}
	}

	$project_details = new stdClass();
	
	if( !empty($project_data)){
		
		$project_details -> project_name = $project_data[0]['project_name'];
		$project_details -> project_city = $project_data[0]['project_city'];
		$project_details -> project_url = $project_data[0]['project_url'];
	}
	
	// Get Email Template with default users 
	if( $client_data -> email_template_id != ''){
		
		$email_template = 'SELECT email_category, event, subject, to_users, cc_users, bcc_users, message_body FROM email_templates WHERE template_id = '.$client_data -> email_template_id ;
		
		$email_template_result = mysql_query($email_template);
		
		if( $email_template_result && mysql_num_rows($email_template_result) > 0){
			
			$email_template_data = mysql_fetch_object($email_template_result);
			
			switch( $email_template_data -> event){
				
				case 'meeting_schedule': 
					
					$keyword_to_replace =  array('{{customer_name}}','{{project_name}}','{{project_city}}','{{customer_number}}','{{project_link}}');
					
					$replacement_values = array($client_data -> customerName, $project_details->project_name, $project_details->project_city, $client_data->customerMobile, $project_details->project_url);
				
					$message			= str_replace($keyword_to_replace, $replacement_values, $email_template_data -> message_body);
							
					$default_to_users = '';
					$default_cc_users = '';
					$default_bcc_users = '';
					
					if($email_template_data -> to_users != ''){
						$default_to_users = $email_template_data -> to_users;
					}
					if($email_template_data -> cc_users != ''){
						$default_cc_users = $email_template_data -> cc_users;
					}
					if($email_template_data -> bcc_users != ''){
						$default_bcc_users = $email_template_data -> bcc_users;
					}
					
					$mail_data = array(
						MESSAGE => $message,
						DEFAULT_TO_USERS	=> $default_to_users,
						DEFAULT_CC_USERS	=> $default_cc_users,
						DEFAULT_BCC_USERS	=> $default_bcc_users,
						TO	=> $client_data -> customerEmail,
						CC	=> '',
						BCC => '',
						SUBJECT => $email_template_data -> subject,
						TO_NAME => $client_data -> customerName
					);
					
					sendMailData($mail_data, $enquiry_id);
					
					$sms_template = 'SELECT default_numbers, message FROM message_templates WHERE message_category = "external" AND event = "meeting_schedule" LIMIT 1';
					
					$sms_template_result = mysql_query($sms_template);
					
					if($sms_template_result && mysql_num_rows($sms_template_result) > 0){
						
						$sms_template_data = mysql_fetch_object($sms_template_result);
						
						$sms_receiver_numbers = array();
						
						if( $sms_template_data -> default_numbers != ''){
							
							// create an array of numbers 
							$sms_receiver_numbers = explode(',', $sms_template_data -> default_numbers);
						}
						
						array_push($sms_receiver_numbers, $client_data -> customerMobile);
						
						$meeting_data = getLeadMeetingData($enquiry_id); // meeting data 
						
						$sms_keyword_to_replace = array('{{customer_name}}','{{project_name}}','{{project_city}}','{{project_link}}','{{meeting_time}}','{{meeting_date}}');
						$sms_keyword_values		= array($client_data -> customerName, $project_details -> project_name, $project_details -> project_city, $project_details -> project_url, $meeting_data['meeting_date'], $meeting_data['meeting_time']);
						$sms_message			= str_replace($sms_keyword_to_replace, $sms_keyword_values, $sms_template_data -> message) ;
						sendSMS($sms_receiver_numbers, $sms_message);
					}
					
					break;
				
				case 'meeting_reschedule';
					
					$meeting_data = getLeadMeetingData($enquiry_id); // meeting data 
					
					$keyword_to_replace =  array('{{customer_name}}','{{project_name}}','{{project_city}}','{{customer_number}}','{{project_link}}','{{meeting_schedule_date}}','{{meeting_schedule_time}}');
					
					$replacement_values = array($client_data -> customerName, $project_details->project_name, $project_details->project_city, $client_data->customerMobile, $project_details->project_url, $meeting_data['meeting_date'], $meeting_data['meeting_time']);
				
					$message			= str_replace($keyword_to_replace, $replacement_values, $email_template_data -> message_body);
							
					$default_to_users = '';
					$default_cc_users = '';
					$default_bcc_users = '';
					
					if($email_template_data -> to_users != ''){
						$default_to_users = $email_template_data -> to_users;
					}
					if($email_template_data -> cc_users != ''){
						$default_cc_users = $email_template_data -> cc_users;
					}
					if($email_template_data -> bcc_users != ''){
						$default_bcc_users = $email_template_data -> bcc_users;
					}
					
					$mail_data = array(
						MESSAGE => $message,
						DEFAULT_TO_USERS	=> $default_to_users,
						DEFAULT_CC_USERS	=> $default_cc_users,
						DEFAULT_BCC_USERS	=> $default_bcc_users,
						TO	=> $client_data -> customerEmail,
						CC	=> '',
						BCC => '',
						SUBJECT => $email_template_data -> subject,
						TO_NAME => $client_data -> customerName
					);
					
					sendMailData($mail_data, $enquiry_id);
					
					$sms_template = 'SELECT default_numbers, message FROM message_templates WHERE message_category = "external" AND event = "meeting_reschedule" LIMIT 1';
					
					$sms_template_result = mysql_query($sms_template);
					
					if($sms_template_result && mysql_num_rows($sms_template_result) > 0){
						
						$sms_template_data = mysql_fetch_object($sms_template_result);
						
						$sms_receiver_numbers = array();
						
						if( $sms_template_data -> default_numbers != ''){
							
							// create an array of numbers 
							$sms_receiver_numbers = explode(',', $sms_template_data -> default_numbers);
						}
						
						array_push($sms_receiver_numbers, $client_data -> customerMobile);
						
						$sms_keyword_to_replace = array('{{customer_name}}','{{project_name}}','{{project_city}}','{{project_link}}','{{meeting_time}}','{{meeting_date}}');
						$sms_keyword_values		= array($client_data -> customerName, $project_details -> project_name, $project_details -> project_city, $project_details -> project_url, $meeting_data['meeting_date'], $meeting_data['meeting_time']);
						$sms_message			= str_replace($sms_keyword_to_replace, $sms_keyword_values, $sms_template_data -> message) ;
						sendSMS($sms_receiver_numbers, $sms_message);
					}
					
					break;
			
				case 'meeting_done':
					
					// mail message keyword 
					// {{customer_name}}, {{project_name}}, {{project_city}}, {{sales_person_name}}, {{meeting_date}},{{meeting_time}},{{project_link}}
					// sms keywords
					// {{customer_name}},{{project_name}},{{project_city}},{{sales_person_name}},{{meeting_date}},{{meeting_time}},{{project_link}}
					
					$meeting_data		= getLeadMeetingData($enquiry_id); // meeting data 
					
					$sales_person_name	= getEmployeeName( $client_data -> lead_assigned_to_sp );
					
					$keyword_to_replace =  array('{{customer_name}}','{{project_name}}','{{project_city}}','{{sales_person_name}}','{{project_link}}','{{meeting_date}}','{{meeting_time}}');
					
					$replacement_values = array($client_data -> customerName, $project_details->project_name, $project_details->project_city, $sales_person_name, $project_details->project_url, $meeting_data['meeting_date'], $meeting_data['meeting_time']);
				
					$message			= str_replace($keyword_to_replace, $replacement_values, $email_template_data -> message_body);
					
					$default_to_users = '';
					$default_cc_users = '';
					$default_bcc_users = '';
					
					if($email_template_data -> to_users != ''){
						$default_to_users = $email_template_data -> to_users;
					}
					if($email_template_data -> cc_users != ''){
						$default_cc_users = $email_template_data -> cc_users;
					}
					if($email_template_data -> bcc_users != ''){
						$default_bcc_users = $email_template_data -> bcc_users;
					}
					
					$mail_data = array(
						MESSAGE => $message,
						DEFAULT_TO_USERS	=> $default_to_users,
						DEFAULT_CC_USERS	=> $default_cc_users,
						DEFAULT_BCC_USERS	=> $default_bcc_users,
						TO	=> $client_data -> customerEmail,
						CC	=> '',
						BCC => '',
						SUBJECT => $email_template_data -> subject,
						TO_NAME => $client_data -> customerName
					);
					
					sendMailData($mail_data, $enquiry_id);
					
					$sms_template = 'SELECT default_numbers, message FROM message_templates WHERE message_category = "external" AND event = "meeting_done" LIMIT 1';
					
					$sms_template_result = mysql_query($sms_template);
					
					if($sms_template_result && mysql_num_rows($sms_template_result) > 0){
						
						$sms_template_data = mysql_fetch_object($sms_template_result);
						
						$sms_receiver_numbers = array();
						
						if( $sms_template_data -> default_numbers != ''){
							
							// create an array of numbers 
							$sms_receiver_numbers = explode(',', $sms_template_data -> default_numbers);
						}
						
						array_push($sms_receiver_numbers, $client_data -> customerMobile);
						
						$sms_keyword_to_replace = array('{{customer_name}}','{{project_name}}','{{project_city}}','{{sales_person_name}}','{{project_link}}','{{meeting_time}}','{{meeting_date}}');
						$sms_keyword_values		= array($client_data -> customerName, $project_details -> project_name, $project_details -> project_city, $sales_person_name, $project_details -> project_url, $meeting_data['meeting_date'], $meeting_data['meeting_time']);
						$sms_message			= str_replace($sms_keyword_to_replace, $sms_keyword_values, $sms_template_data -> message) ;
						sendSMS($sms_receiver_numbers, $sms_message);
					}
					
					break;
			}
			
		}
	}
}

