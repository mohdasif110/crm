<?php

session_start();

require_once 'function.php';

$data = json_decode(file_get_contents('php://input'),true);

if(!empty($data) && isset($data['enquiry_id'])){
	
	$enquiry_id = $data['enquiry_id'];
	
	$lead_number = 'NULL';
	
	if(isset($data['lead_number'])){
		$lead_number = $data['lead_number'];
	}
	
	foreach ($data['projects'] as $key => $val) {

		$project_id		= $val['project_id'];
		$project_name	= $val['project_name'];
		$project_url		= $val['project_url'];
					
		$save_enquiry_projects = 'INSERT INTO `lead_enquiry_projects`'
				. '  (enquiry_id,lead_number,project_id,project_name,project_url) '
				. ' VALUES (' . $enquiry_id .',"'.$lead_number.'", '. $project_id . ', "' . $project_name . ' ","' . $project_url . '")';

		if (mysql_query($save_enquiry_projects)) {
			$flag_of_save_enquiry_projects = true;
		}
	}
	
	
	echo json_encode(array('success' => 1),TRUE); exit;
}
else{
	echo json_encode(array('success' => 0),TRUE); exit;
}