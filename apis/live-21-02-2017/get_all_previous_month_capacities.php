<?php
session_start();
require 'function.php';

// user designation type 
// user id 

$data = file_get_contents('php://input');

$table = '';

if($data != ''){
	
	$encoded_data = json_decode($data, true);
//	echo '<pre>'; print_r($encoded_data); exit;
	$current_year	= date('Y');
	$capacity_data	= array();
	
	if(!empty($encoded_data)){
	
		$user_id			= $encoded_data['user_id'];
		$designation_slug	= (isset($encoded_data['designation_slug']) ? $encoded_data['designation_slug'] : '');
		
		if($designation_slug === 'area_sales_manager'){
			
			$sql = 'SELECT SUM(capacity.capacity) as total_capacity, GROUP_CONCAT(capacity.pName) as projects, '
					. ' GROUP_CONCAT(capacity.capacity) as month_capacity, capacity.capacity_month, capacity.capacity_year '
					. ' FROM `capacity_master` as capacity '
					. ' WHERE capacity.userId = '.$user_id.' AND capacity.capacity_year != "'.$current_year.'" '
					. 'GROUP by capacity.capacity_month order BY capacity.capacity_year DESC, capacity.capacity_month DESC';
			
			$result = mysql_query($sql);
			
			if($result && mysql_num_rows($result) > 0){
				
				while($row = mysql_fetch_assoc($result)){
					array_push($capacity_data, $row);
				}
			}
			
		}else if($designation_slug == 'sales_person'){
			
			$sql = 'SELECT capacity as total_capacity, month as capacity_month, year as capacity_year FROM
				sales_person_capacities WHERE sales_person_id = '.$user_id.' AND 
				year != "'.$current_year.'"
				ORDER BY year DESC, month DESC';
//			
//			echo $sql; exit;
			
			$result = mysql_query($sql);
			
			if($result && mysql_num_rows($result) > 0){
				
				while($row = mysql_fetch_assoc($result)){
					array_push($capacity_data, $row);
				}
			}
		}
	}
	
	echo json_encode($capacity_data,true); exit;
	
}else{
	echo json_encode(array(),true); exit;
}



