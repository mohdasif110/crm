<?php
session_start();
require 'function.php';

$designations = array();

$query = 'SELECT id, designation, designation_slug FROM designationmaster WHERE disable != "1" and designation_slug != ""';

$result = mysql_query($query);

if( $result && mysql_num_rows($result) > 0){
	
	while($row = mysql_fetch_assoc($result)){
	
		array_push($designations, $row);	
	}
	
}

// response 

echo json_encode($designations, true); exit;
