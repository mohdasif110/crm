<?php
session_start();
require 'function.php';

$capacites			= array();
$capacity_month		= (int)date('m') - 1;
$capacity_year		= date('Y');

$condition = ' WHERE capacity_month = '.$capacity_month.' AND capacity_year = "'.$capacity_year.'"';

$select_capacities = 'SELECT CONCAT(emp.firstname," ",emp.lastname) as employee_name, emp.id as user_id, emp.total_capacity, GROUP_CONCAT(cap.pName) as projects,GROUP_CONCAT(cap.pId) as project_ids,GROUP_CONCAT(cap.capacity) as project_capacity, cap.capacity_month, cap.capacity_year, SUM(cap.remaining_capacity) as remaining_capacity
					FROM employees as emp
					LEFT JOIN capacity_master as cap ON (emp.id = cap.userId AND cap.capacity_month = '.$capacity_month.' AND cap.capacity_year="'.$capacity_year.'")
					WHERE designation = (SELECT id FROM designationmaster WHERE designation_slug = "area_sales_manager")
					GROUP BY emp.id';

$result = mysql_query($select_capacities);

if($result && mysql_num_rows($result) > 0){
	
	while($row = mysql_fetch_assoc($result)){
		
		$row['projects']			= explode(',', $row['projects']);
		$row['project_ids']			= explode(',', $row['project_ids']);
		$row['project_capacity']	= explode(',', $row['project_capacity']);

		array_push($capacites, $row); 
	}
}

echo json_encode($capacites,true); exit;