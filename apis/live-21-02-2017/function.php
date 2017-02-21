<?php

require_once 'db_connection.php';

/**
 * General utility php functions
 */

function generateEnquiryID($range = null) {

	$enquiry_id = rand($range[0], $range[1]);

	// Strore generated enquiry id in db
	if (!mysql_query('INSERT INTO enquiry_ids_log (enquiry_id) VALUES (' . $enquiry_id . ')')) {
		generateEnquiryID(array(1, 100000));
	}

	return $enquiry_id;
}

function generateLeadNumber($enquiry_id = null) {

	$current_year = date('Y');
	$lead_number = rand(1, 100000);

	// Strore generated enquiry id in db
	if (!mysql_query('INSERT INTO lead_numbers_log (lead_id) VALUES (' . $lead_number . ')')) {
		generateLeadNumber(generateEnquiryID(array(1, 100000)));
	}

	return $current_year . '-' . $enquiry_id . '-' . $lead_number;
}

/*
 * get last enquiry number generated 
 */

function lastGeneratedEnquiryId() {

	$last_generated_enquiry_id = '';
}

/**
 * 
 */

function authenticateUser($id = null, $email = null) {

	if ($id === null || $email == null) {
		return 0;
	}

	$is_user_exists = 'SELECT id FROM `employees` WHERE id= ' . $id . ' AND email = "' . $email . '" LIMIT 1';

	$result = mysql_query($is_user_exists);

	if (mysql_num_rows($result) > 0) {

		return 1;
	} else {
		return 0;
	}
}

function unauthorizedResponse() {
	return json_encode(array('success' => 0, 'http_status_code' => 401, 'message' => 'Not Authorized'), true);
}

function getEnquiryStatusText($status_id = null) {

	if ($status_id === null) {
		return '';
	}
	$enquiry_status_text = 'SELECT `status_title` FROM `enquiry_status` WHERE id = ' . $status_id . ' LIMIT 1';

	$enquiry_resource = mysql_query($enquiry_status_text);

	$enquiry_text = '';

	if ($enquiry_resource) {

		if (mysql_num_rows($enquiry_resource) > 0) {

			$enquiry_text = mysql_fetch_row($enquiry_resource)[0];
		}
	}

	return $enquiry_text;
}

function getEmployeeByDesignationSlug($designation_slug = '') {

	if ($designation_slug == '') {
		return '';
	}

	$select_employee = 'SELECT `id`, `designation` FROM `designationmaster` WHERE designation_slug = "' . $designation_slug . '" LIMIT 1';

	$result = mysql_query($select_employee);

	if ($result) {

		if (mysql_num_rows($result) > 0) {

			$row = mysql_fetch_object($result);
			return $row;
		}
	}
}

/**
 * Function to get sub modules 
 * @param <array> $sub_module_ids
 * @param integer|string $designation_id designation id of user 
 */

function getSubModules($sub_modules_ids = NULL, $designation_id = null) {

	if (empty($sub_modules_ids) || count($sub_modules_ids) <= 0) {

		return array();
	}

	$module_ids = implode(',', $sub_modules_ids);

	if($designation_id == 2){
		
		// here we skip "my leads" and "assigned leads" sub modules of "lead module" for admin
		
		$child_modules = 'SELECT * FROM `crmmodules` WHERE id IN('.$module_ids.') AND ( (title NOT LIKE "%My Leads") AND (title NOT LIKE "%Assigned Leads") )';
	
	}else{
		
		$child_modules = 'SELECT * FROM `crmmodules` WHERE id IN(' . $module_ids . ')';
	}

	$child_modules_result = mysql_query($child_modules);
	$child_modules_results_data = array();
	
	while ($row = mysql_fetch_assoc($child_modules_result)) {

		$temp_row = array();

		$title = $row['title'];
		$temp_row[$title]['id'] = $row['id'];
		$temp_row[$title]['title'] = $row['title'];
		$temp_row[$title]['link'] = $row['link'];
		$temp_row[$title]['params'] = $row['params'];
		if ($designation_id == 2) {
			$temp_row[$title]['permission'] = 7;
		} else {
			$temp_row[$title]['permission'] = file_get_contents(BASE_URL . 'apis/helper.php?method=getModulePermission&params=module_id:' . $row['id'] . '/designation_id:' . $designation_id);
		}

		array_push($child_modules_results_data, $temp_row);
	}

	return $child_modules_results_data;
}

/**
 * Function to get assigned sub modules ids with designation 
 * @param integer $parent_id
 * @param integer $designation_id
 * @return array
 */

function getAssignedChildModules($parent_id = "", $designation_id = "") {


	$parent_all_modules = 'SELECT * FROM crmmodules WHERE `parent` = ' . $parent_id . '';

	$result = mysql_query($parent_all_modules);

	$child_module_data = array();

	$sub_modules_ids = array();

	$assigned_sub_modules_ids = array();

	while ($row = mysql_fetch_assoc($result)) {

		array_push($sub_modules_ids, $row['id']);
	}
	
	if ($designation_id != 2) {

		if (!empty($sub_modules_ids)) {

			$ids_string = implode(',', $sub_modules_ids);

			// Now we query in designation module master to get only assigned modules for given designation 
			$assigned = 'SELECT * FROM `designationmodulemaster` WHERE designationId = ' . $designation_id . ' AND ModuleId IN (' . $ids_string . ') ';

			$assigned_result = mysql_query($assigned);

			if (mysql_num_rows($assigned_result)) {

				while ($row = mysql_fetch_assoc($assigned_result)) {

					array_push($assigned_sub_modules_ids, $row['ModuleId']);
				}

				$child_module_data = getSubModules($assigned_sub_modules_ids, $designation_id);
			}
		}
	} else {
		
		$child_module_data = $sub_modules_ids;
	}

	return $child_module_data;
}

/**
 * Function to get disposition status label 
 * @param int $status_id
 */

function getStatusLabel($status_id = NULL, $type = "parent") {

	if ($status_id == NULL) {

		return '';
	}

	$column_to_select = '';

	if ($type == 'parent') {

		$column_to_select = 'status_title';
	} else {
		$column_to_select = 'sub_status_title';
	}

	$select_status_title = 'SELECT ' . $column_to_select . ' as title '
			. ' FROM `disposition_status_substatus_master` WHERE id = ' . $status_id . ' LIMIT 1 ';

	$result = mysql_query($select_status_title);

	if ($result) {

		if (mysql_num_rows($result) > 0) {

			$data = mysql_fetch_object($result);

			return $data->title;
		}
	}
}

/**
 * Function to get meeting data of lead 
 * @param int $enquiry_id
 */

function getLeadMeetingData($enquiry_id = NULL) {

	if ($enquiry_id == NULL) {
		return array();
	}

	$select_meeting_data = 'SELECT lm.*, lm.meeting_date as event_date, lm.meeting_time as event_time, lp.project_id, lp.project_name, lp.project_url '
			. ' FROM `lead_meeting` as lm '
			. ' LEFT JOIN lead_enquiry_projects as lp ON (lm.enquiry_id = lp.enquiry_id)'
			. ' WHERE lm.enquiry_id = ' . $enquiry_id . ' ORDER BY `id` DESC LIMIT 1';
	$meeting_result = mysql_query($select_meeting_data);

	if ($meeting_result) {

		if (mysql_num_rows($meeting_result) > 0) {

			$data = mysql_fetch_assoc($meeting_result);
			return $data;
		}
	}
}

/**
 * Function to get site visit data of lead
 * @param int $enquiry_id
 */

function getLeadSiteVisitData($enquiry_id = null) {

	if ($enquiry_id == NULL) {
		return array();
	}

	$select_visit_data = 'SELECT site_visit.*, site_visit.site_visit_date as event_date, site_visit.site_visit_time as event_time FROM `site_visit` WHERE enquiry_id = ' . $enquiry_id . ' ORDER BY `id` DESC LIMIT 1';

	$visit_result = mysql_query($select_visit_data);

	if ($visit_result) {

		if (mysql_num_rows($visit_result) > 0) {
			
			$data = mysql_fetch_assoc($visit_result);
			return ($data);
		}
	}
}

function getDesignationBySlug($designation_slug = '', $response = 'json'){
	
	if($designation_slug == ''){
		return '';
	}
	
	$select_designation = 'SELECT `id`, `designation` FROM `designationmaster` WHERE designation_slug = "'.$designation_slug.'" LIMIT 1';
	
	$result = mysql_query($select_designation);
	
	if($result){
		
		$data = mysql_fetch_assoc($result);
	
		if($response == 'json'){
			return json_encode($data,true); exit;
		}else{
			return print_r($data); exit;
		}
	}
}

/**
 * Function to get Employee name by Employee ID 
 */

function getEmployeeName($employee_id = '') {
	
	if($employee_id === '' || $employee_id === null){
		return '';
	}
	
	$employee_name = 'SELECT firstname, lastname FROM employees WHERE id = '.$employee_id.' LIMIT 1';
	
	$result = mysql_query($employee_name);
	
	$employee_name = '';
	
	if($result){
		
		$data_row = mysql_fetch_row($result);
		return $data_row[0] . ' '. $data_row[1];
	}
}

/**
 * To get Employee data by role 
 */

function getEmployeeByRole($role_id){
	
	if($role_id == ''){
		return '';
	}
	
	$select_employee = 'SELECT '
			. '		id, firstname, lastname, email, designation '
			. '		FROM employees '
			. '		WHERE role = "'.$role_id.'" '
			. '		LIMIT 1';
	
	
	$result = mysql_query($select_employee);
	
	if($result && mysql_num_rows($result) > 0){
	
		return  mysql_fetch_object($result);
	}else{
		return '';
	}
}


function getEmployeeByEmail($email_id = '') {
	
	if($email_id === '' || $email_id === null){
		return '';
	}
	
	$employee_name = 'SELECT firstname, lastname FROM employees WHERE email = '.$email_id.' LIMIT 1';
	
	$result = mysql_query($employee_name);
	
	$employee_name = '';
	
	if($result){
		
		$data_row = mysql_fetch_row($result);
		return $data_row[0] . ' '. $data_row[1];
	}
}

/**
 * Get Lead Source Text
 */

function getCampaignText($campaign_id = ''){
	
	if($campaign_id == ''){
		return '';
	}
	
	$sql = 'SELECT `title` FROM `campaign_master` WHERE id = '.$campaign_id.' LIMIT 1 ';
	
	$result = mysql_query($sql);
	
	if($result && mysql_num_rows($result) > 0){
		
		$source = mysql_fetch_object($result);
		
		return $source -> title;
	}else{
		return '';
	}
	
}

/**
 * To get total notes counts for a single enquiry id
 */

function getNotesCount($enquiry_id = ''){
	
	if($enquiry_id == ''){
		return 0;
	}
	
	$select_notes = 'SELECT COUNT(id) as total_notes FROM notes WHERE enquiry_id = '.$enquiry_id.'';
	
	$result = mysql_query($select_notes);
	
	if($result && mysql_num_rows($result) > 0){
		
		$total_notes = mysql_fetch_object($result);
		
		return $total_notes -> total_notes; 
	}else{
		return 0; exit; 
	}
}

/**
 * Function to get lead ID 
 * @param integer $enquiry_id
 * @return string
 */

function getLeadNumber($enquiry_id = ''){
	
	if($enquiry_id == ''){
		
		return 'NULL';
	}
	
	$select_lead_number  = 'SELECT lead_id FROM `lead` WHERE enquiry_id = '.$enquiry_id.' LIMIT 1';
	
	$result = mysql_query($select_lead_number);
	
	if($result && mysql_num_rows($result) > 0){
		
		$data = mysql_fetch_object($result);
		
		if($data -> lead_id != 'NULL' || $data -> lead_id != null){
			return $data -> lead_id;
		}else{
			return 'NULL';
		}
	}else{
		return 'NULL';
	}
	
}

/**
 * Function to get client information by enquiryId
 * @param integer $enquiry_id
 */

function getCLientInfoByEnquiry($enquiry_id = ''){

	if($enquiry_id == ''){
		return (array());
	}
	
	$select_client = 'SELECT customerEmail, customerMobile, customerName, customerProfession, customerCity, customerState, customerAddress, customerDOB'
			. ' FROM `lead` '
			. ' WHERE enquiry_id = '.$enquiry_id.' LIMIT 1';

	$result = mysql_query($select_client);
	
	if($result && mysql_num_rows($result) > 0){
		
		$client_object = mysql_fetch_assoc($result);
		return($client_object);
	}else{
		return(array());
	}
}

/**
 * Function to get client information by phone no.
 * @param integer $phone_no
 */

function getCLientInfoByPhone($phone_no = ''){

	if($phone_no == ''){
		return (array());
	}
	
	$select_client = 'SELECT enquiry_id, lead_id , customerEmail, customerName, customerProfession, customerCity, customerState, customerAddress, customerDOB'
			. ' FROM `lead` '
			. ' WHERE customerMobile = "'.$phone_no.'" LIMIT 1';

	$result = mysql_query($select_client);
	
	if($result && mysql_num_rows($result) > 0){
		
		$client_object = mysql_fetch_assoc($result);
		return($client_object);
	}else{
		return(array());
	}
}


function getReportingPersons($user_id = ''){
	
	if($user_id === ''){
		return array();
	}
	
	$select_reporting = 'SELECT id FROM employees WHERE reportingTo = '.$user_id.'';
	
	$result = mysql_query($select_reporting);
	
	$reportings = array();
	
	if($result && mysql_num_rows($result) > 0){
		
		while($rows = mysql_fetch_assoc($result)){
		
			array_push($reportings, $rows['id']);
		}
		
		return $reportings;
		
	}else{
		return array();
	}
}

/**
 * Function to get hierarchy of user
 * @param type $designation_id
 * @return string
 */
function getUsersHierarchy($user_id = NULL, $level = 0){
	
		if($user_id === ''){
			return json_encode(array(),true); exit;
		}
		
		$user_ids = array();
		
		if($level == 0){
			array_push($user_ids,$user_id);
		}
		
		
		if($level == 1){
			
			array_push($user_ids, $user_id);
			
			$one_level_reportings = getReportingPersons($user_id);
			
			if(count($one_level_reportings) > 0){
				
				foreach($one_level_reportings as $user){
						
					array_push($user_ids, $user);
				}
			}
		}
		
		if($level == 2){
			
			array_push($user_ids, $user_id);
			
			$one_level_users = getReportingPersons($user_id);
			
			if(count($one_level_users) > 1){
				
				foreach($one_level_users as $user){
					
					array_push($user_ids, $user);
					
					$second_level_users = getReportingPersons($user);
					
					if(!empty($second_level_users)){
					
						if(count($second_level_users) > 0){
							foreach ($second_level_users as $user){
								array_push($user_ids,$user);									
								$third_level_users = getReportingPersons($user);

								if(count($third_level_users) > 0){
									foreach ($third_level_users as $user){
										array_push($user_ids, $user);
									}
								}
							}
						}
					}
				}
			}else{
				
				array_push($user_ids, $one_level_users[0]);
				
				$second_level_users = getReportingPersons($one_level_users[0]);
				
				foreach($second_level_users as $user){
					
					array_push($user_ids,$user);
					
					$third_level_users = getReportingPersons($user);
					
					if(count($third_level_users) > 0){
						
						foreach($third_level_users as $user){
							array_push($user_ids, $user);
						}
					}
				}
			}
		}
		
		return $user_ids; 
}


/**
 * Function to get Number on which OTP will be sent 
 * @param type $request_id
 * @return string
 */
function getNumberToResendOTP($request_id = ''){
	
	if($request_id == ''){
		return '';
	}
	
	$get_otp_number = 'SELECT `otp_sent_on_number` FROM reset_password WHERE id = '.$request_id.' LIMIT 1';
	
	$result = mysql_query($get_otp_number);
	
	if($result && mysql_num_rows($result) > 0){
		
		return mysql_fetch_object($result) -> otp_sent_on_number;
		
	}else{
		return '';
	}
}

function confirmRequestID($req_id = ''){
	
	if($req_id === ''){
		return false;
	}
	
	$confirm_request = 'SELECT id FROM reset_password WHERE id = '.$req_id. ' LIMIT 1';
	
	$result = mysql_query($confirm_request);
	
	$rows	= mysql_num_rows($result);
	
	if($result && $rows > 0){
		return true;
	}else{
		return FALSE;
	}
}

/*
 * Function: Random string generator 
 */

function generateRandomString($length = 10) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%&*';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomString;
}

/**
 * 
 */
function getEmployeeEmailAddress($employee_id = ''){

	if($employee_id === ''){
		return ''; 
	}
	
	$get_email = 'SELECT email FROM employees WHERE id = '.$employee_id.' LIMIT 1';
	
	$result = mysql_query($get_email);
	
	$rows = mysql_num_rows($result);
	
	if($result && $rows > 0){
		
		return mysql_fetch_object($result) -> email;
	}else{
		return ''; 
	}
}

/**
 * Function to get employee designation 
 */

function getEmployeeDesignation($employee_id = ''){
	
	if($employee_id == ''){
		return '';
	}
	
	$query = 'SELECT tbl2.designation, tbl2.designation_slug FROM employees as tbl1 '
			. ' LEFT JOIN designationmaster as tbl2 ON (tbl1.designation = tbl2.id)'
			. ' WHERE tbl1.id = '.$employee_id. ' LIMIT 1';
	
	$res = mysql_query($query);
	
	if($res && mysql_num_rows($res) > 0){
		
		$data = mysql_fetch_row($res);
		return $data;
	}else{
		return '';
	}
}


function getDirectReportings($employee_id = '') {

	if($employee_id == ''){
		return array();
	}	
	
	$query = 'SELECT id FROM employees WHERE reportingTo = '.$employee_id.'';
	
	$result = mysql_query($query);
	
	$direct_reportings = array();
	
	if($result && mysql_num_rows($result) > 0){
		
		while($row = mysql_fetch_assoc($result)){
			array_push($direct_reportings, $row['id']);
		}
	}
	
	return $direct_reportings; // array of user ids 
}

function getEmailTemplateId($category = '', $template_event = ''){
	
	if($category === '' || $template_event === ''){
		return 0;
	}
	
	$query = 'SELECT template_id FROM email_templates WHERE email_category = "'.$category.'" AND event = "'.$template_event.'" LIMIT 1';
	
	$result = mysql_query($query);
	
	if($result && mysql_num_rows($result) > 0){
		
		$template_id = mysql_fetch_object($result);
		
		return $template_id -> template_id;
	}else{
		return 0;
	}
}

function sendMeetingReminder($enquiry_id = ''){
	
	// send cURL request to mail sender API
	
	$curl_url = BASE_URL . 'apis/send_meeting_reminder_mail_to_client.php';
	$curl = curl_init($curl_url);
	curl_setopt_array($curl, array(
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_POST => 1,
		CURLOPT_POSTFIELDS => array('enquiry_id' => $enquiry_id)
	));
	
	curl_exec($curl);
	curl_close($curl);
}

/**
 * Function to fetch all employees of given designation 
 * @param type $designation_slug
 */

function getEmployeeByDesignation($designation_slug =  '' ){
	
	if($designation_slug == ''){
		return array();
	}
	
	$designation = getEmployeeByDesignationSlug($designation_slug);
	
	$users = array();
	
	if(is_object($designation)){
		
		$query = 'SELECT id, firstname, lastname, email, contactNumber FROM employees WHERE designation = '.$designation -> id.'';
		
		$result = mysql_query($query);
		
		if($result && mysql_num_rows($result) > 0){
			while($row = mysql_fetch_assoc($result)){
				array_push($users, $row);	
			}
		}
	}
	
	return $users;
}