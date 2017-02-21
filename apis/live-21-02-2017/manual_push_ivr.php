<?php
require_once 'db_connection.php';
$data = file_get_contents('php://input');
$josnDecode 		=	json_decode($data,true); 
	
	$ivr_success_push 		=	1;
	$ivr_fail_push 			=	1;
	
	if(count($josnDecode['mydata'])>0)
	{
		
		foreach($josnDecode['mydata']  as $key=>$row)
		{
			
			if(push_query_to_ivr($row)){
				
				$update			=	"update crm_enquiry_capture set ivr_push_status='1', ivr_push_type='Manual', ivr_push_date='".time()."' where query_request_id='".$row['query_request_id']."'";
				
				if(mysql_query($update)){
					
					
					$ivr_success_push++;
					ivr_enquiry_push_log($row);
				
				}
			
			}else{
				
				$ivr_fail_push++;
			}
		
		}
		
		echo  json_encode(array(
									'action'=>'success',
									'message'=>'Queries has been pushed succesfully to the IVR.',
									'sucessCount'=>$ivr_success_push,
									'failureCount'=>$ivr_fail_push
									));
		
		}else{
			
			echo  json_encode(array(
									'action'=>'faul',
									'message'=>'technically issue .',
									'sucessCount'=>0,
									'failureCount'=>0
								));
	} 	
	
	//comman function  it can be move in  comman function section .
	
	function push_query_to_ivr($row=array()){
		
		return  true;
	}

	function ivr_enquiry_push_log($row=array()){
		
		return  true;
	}
	
?>

