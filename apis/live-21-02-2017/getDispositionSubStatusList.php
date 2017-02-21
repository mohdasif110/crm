<?php

require_once 'db_connection.php';

$query = 'SELECT tbl1.`id`, tbl1.`sub_status_title`, tbl2.id as parent_id, tbl2.status_title as parent_status_title FROM `disposition_status_substatus_master` as tbl1 INNER JOIN disposition_status_substatus_master as tbl2 ON (tbl1.parent_status = tbl2.id) WHERE tbl1.`parent_status` IS NOT NULL ORDER BY tbl1.sub_status_title';

$result = mysql_query($query);

$status = array();

if($result){
    
    while($row = mysql_fetch_assoc($result)){
        
        array_push($status,$row);
    }
}
echo json_encode($status,true); exit;