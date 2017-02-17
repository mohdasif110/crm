<?php

require_once 'db_connection.php';

$data = file_get_contents('php://input');

if($data == ''){
    
    echo json_encode(array('success' => 0, 'message' => 'Input not received'),true);
    exit;
}

$data_array = json_decode($data,true);

$designation_id = $data_array['id'];
//$delete_flag    = $data_array['mark_as_delete'];

$delete_designation = 'UPDATE `designationMaster` SET `markAsDelete` = "1" WHERE id = '.$designation_id.' LIMIT 1 ';

mysql_query($delete_designation);

echo json_encode(array('success' => 1, 'message' => 'Designation deleted successfully'),true);
exit;
