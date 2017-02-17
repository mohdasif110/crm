<?php

session_start();

require_once 'function.php';

$data = json_decode(file_get_contents('php://input'),TRUE);

$history = array();

if(!empty($data) && !empty($data['enquiry_id'])){
	
	
	$enquiry_id = $data['enquiry_id'];
	
	$lead_number = 'NULL';
	
	if(isset($data['lead_number']) && $data['lead_number'] != 'NULL'){
		
		$lead_number = $data['lead_number'];
	}
	
	$select_history_sql = 'SELECT * FROM `lead_history` WHERE enquiry_id = '.$enquiry_id.' AND lead_number = "'.$lead_number.'" ORDER BY `created_at` DESC';
	
	$result = mysql_query($select_history_sql);
	
	if($result && mysql_num_rows($result) > 0){
		
		while($row = mysql_fetch_assoc($result)){
			
			array_push($history, $row);
			
		}	
	}
}

echo json_encode($history,true);