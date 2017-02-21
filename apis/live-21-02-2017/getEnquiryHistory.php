<?php

session_start();

require_once 'function.php';

$data = json_decode(file_get_contents('php://input'),TRUE);

$history = array();

if(!empty($data) && !empty($data['enquiry_id'])){
	
	
	$enquiry_id = $data['enquiry_id'];
	
	$select_history_sql = 'SELECT * FROM `lead_history` WHERE enquiry_id = '.$enquiry_id.' ORDER BY `created_at` DESC';
	
	$result = mysql_query($select_history_sql);
	
	if($result && mysql_num_rows($result) > 0){
		
		while($row = mysql_fetch_assoc($result)){
			
			// json decode meta data if not blank
			
			if($row['meta_data'] != ''){
				
				$meta_data = json_decode($row['meta_data'], true);
				unset($row['meta_data']);
				$row['meta_data'] = $meta_data;
			}
			
			array_push($history, $row);
			
		}	
	}
}

echo json_encode($history,true); exit; 