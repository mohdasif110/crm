<?php
session_start();
require_once 'function.php';
require_once 'user_authentication.php';

$enquiry_id = $_GET['enquiry_id'];

$lead_id = $_GET['lead_id'];

$where_lead_id = '';

$edit_data = array();

$client_details = array();

$client_projects = array();

$client_preference = array();

$lead_source = array();

$disposition_source = array();

if($lead_id !== null && $lead_id != 'null'){
	$where_lead_id = ' AND lead_id = "'.$lead_id.'"' ;
}


// Client basic details 

$client_info = 'SELECT * FROM lead WHERE enquiry_id = '.$enquiry_id.' '.$where_lead_id;

$result = mysql_query($client_info);

if($result){
	
	if(mysql_num_rows($result) > 0){
	   
		$client_details = mysql_fetch_assoc($result);	
		
		array_push($edit_data,array('client_basic' => $client_details));

		// Client preference 
		$preference = array(
			'property_usage' => '',
			'site_visit_in' => '',
			'floor_preference' => ''
		);
		
		array_push($client_preference, $preference);
		array_push($edit_data, array('client_preference' => $client_preference));
		
		// Lead source 
		array_push($lead_source, array('primary_source' => $client_details['leadPrimarySource'], 'secondary_source' => $client_details['leadSecondarySource']));
		array_push($edit_data , array('lead_cource' => $lead_source));
	
		// disposition status
		array_push($disposition_source, array('disposition_status_id' => $client_details['disposition_status_id'],'disposition_sub_status_id' => $client_details['disposition_sub_status_id'],'enquiry_status_remark' => $client_details['enquiry_status_remark']));
		array_push($edit_data, array('disposition' => $disposition_source));
		
}
}

// Client suggested projects 

$select_client_projects = 'SELECT * FROM lead_enquiry_projects WHERE enquiry_id = '.$enquiry_id.' '. $where_lead_id;

$project_result = mysql_query($select_client_projects);

if($project_result){
   
	if(mysql_num_rows($project_result)){
		   
		while($row = mysql_fetch_assoc($project_result)){
			$temp = array();
			
			$temp['id'] = $row['id'];
			$temp['project_id'] = $row['id'];
			$temp['project_url'] = $row['project_url'];
			$temp['project_name'] = $row['project_name'];
			$temp['project_city'] = $row['project_city'];
			
			array_push($client_projects, $temp);
		}
		array_push($edit_data, array('enquiry_projects' => $client_projects));
	}
}


echo json_encode(array('success' => 1, 'http_status_code' => 200, 'data' => $edit_data),true); exit;