<?php
require_once 'db_connection.php';

$Error 				=	array();

	if(isset($_REQUEST['queryID']) && $_REQUEST['queryID']!=''){
			
				$queryID 		=	$_REQUEST['queryID'];
	}else{
		
		$Error['queryID']				=	"Please send query ID.";
	}
	
	if(isset($_REQUEST['phoneNumber']) && $_REQUEST['phoneNumber']!=''){
			
			$phoneNumber			=	 $_REQUEST['phoneNumber'];
					
	}else{
		
		$Error['phoneNumber']				=	"Please send phone Number.";
	}

	if(count($Error)>0){
		
		echo  json_encode(array('action'=>'error', 'message'=>'validation fail', 'required'=>$Error));
	
	}
	
  
  $sqlSelect 		=	"select  query_request_id,phone from  crm_enquiry_capture  where  query_request_id='".$queryID."'  and phone='".$phoneNumber."'";
  $executeQuery 		=		mysql_query($sqlSelect);
  $num 					=		mysql_num_rows($sqlSelect);	

  if($num>0)
  {
	$updateReopenQuery			=	"update  crm_enquiry_capture set ivr_push_status='Reopen'  where  query_request_id='".$queryID."'  and phone='".$phoneNumber."'";
	$executeQueryUpdate		=	mysql_query($updateReopenQuery); 
	echo  json_encode(array('action'=>'error', 'message'=>'Query has been re-open successfully, for pusing to IVR', 'required'=>$Error));
 }
 
	
?>

