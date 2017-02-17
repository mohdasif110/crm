<?php

session_start();
ini_set('max_execution_time', 120); // Increased script execution time to 2 minutes  

require_once 'function.php';
require_once 'user_authentication.php';

if (!$is_authenticate) {
	echo unauthorizedResponse();
	exit;
}


// Logic to get leads with different criteria

$leads_query = 'SELECT * FROM `lead` ORDER BY `leadAddDate` DESC';

$lead_resource = mysql_query($leads_query);

$leads = array();

if ($lead_resource) {

	while ($row = mysql_fetch_assoc($lead_resource)) {

		$projects = json_decode(file_get_contents(BASE_URL . 'apis/helper.php?method=getEnquiryProjects&params=enquiry_id:' . $row['enquiry_id'] . '/lead_id:' . $row['lead_id']), true);

		$row['enquiry_projects'] = $projects;

		array_push($leads, $row);
	}
}

echo json_encode(array('success' => 1, 'http_status_code' => 200, 'data' => $leads), TRUE);
