<?php
require_once 'db_connection.php';

if(!function_exists('phone_number_validation'))
	{ 
			function phone_number_validation($phone){
				
				if(is_numeric( $phone ))
				{
					
					if(preg_match('/^[0-9]{10}+$/', $phone))
					{
						
						return  false ;
					
					}else{
						
						return true;
					}  
				
				}else{
					
					return true;
				}
			} 
	}


ini_set("display_errors", "1");
error_reporting(E_ALL);

if($_FILES[0]['name']){
	$foldername			=	"../queryupload/".time()."_".$_FILES[0]['name'];

	if(move_uploaded_file($_FILES[0]['tmp_name'],$foldername)){
	
	$arrayFromCSV 			=  array_map('str_getcsv', file($foldername));
	
	$headArr				=	$arrayFromCSV[0];
    
		// echo "<pre>";
	 //print_r($headArr);
	
	$Mytemp					=	array();
	$count 					=	1;
	
	$NewEnqueries 			=	array();
	$AlreadyEnqueries 		=	array();
	$phoneValidation 		=	array();
	
	foreach($arrayFromCSV as $key=>$val){
		
		$TempArr				=	array();
		$TempArr2				=	array();
		
		if($count>1){
		
			$i		=	0;
			$flag 	= true;	
			
			foreach($val as $k=>$v){
				
				$index				=	strtolower(trim($headArr[$i]));	
				$TempArr[]			=	$v;	
				$TempArr2[$index]	=	$v;	
				$i++;
			}
		
			$rflag 	= save_enquery($TempArr2 , $enquiry_from='CSV');
			
			if($rflag=='new'){
				
				$NewEnqueries[] 			=	 $TempArr; 
				
			}else if($rflag=='already'){
				
				$AlreadyEnqueries[] 		=	 $TempArr; 
				
			}else if($rflag=='envalidphone'){
				
				$phoneValidation[]			=	$TempArr;
			}
		
		}
		
		$count++;
	}
	
	echo  json_encode(array('action'=>'success', 'message'=>'file has been uploaded successfully.','csvHead'=>$headArr,'newIn'=>$NewEnqueries,'already'=>$AlreadyEnqueries,'phoneValidation'=>$phoneValidation));
	
	}else{
		
		
		echo  json_encode(array('action'=>'error', 'message'=>'file is not uploaded.'));
	
	}
	
}




	//Save enquery.
	function  save_enquery($post , $enquiry_from='BMH'){
	
		
		$numberdigit 		= 	$enquiry_from.str_pad(mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);
		$jsonPost			=	json_encode($post);
		
		$Mydata 			=   mapFiledKey($post,'maped');
		$jsonPost			=	json_encode(mapFiledKey($post,'all'));
		
		if(count($Mydata)>0){
				
				$addingQuery 			=	'';
				
				foreach($Mydata as $key=>$val){
					
					$addingQuery		.=	", ".$key."='".$val."'";
					
					if($key=='phone'){
						
						$phone		=  $val;
					}
				}
			
			if($phone!=''){
			
				if(phone_number_validation($phone)){
					
					return 'envalidphone';
				}
			
			$sql_selectQuery	=	 "select *from crm_enquiry_capture where phone='".$phone."'";	
			$sqlQuery 			=	mysql_query($sql_selectQuery);
			$numrow				=	mysql_num_rows($sqlQuery);
			
			if($numrow>0)
			{
				
				return 'already';
			
			}else{
				
					$insertLead 		=	"insert into crm_enquiry_capture set query_request_id='".$numberdigit."' ,enquiry_from='".$enquiry_from."', leadvalujson='".$jsonPost."', created_on='".date('Y-m-d H:i:s')."' ,created_time='".time()."' ".$addingQuery;
					
					if(mysql_query($insertLead)){
					
						return 'new';
					}
				}	
			}
		
			}else{
				
				$insertLead 	=	"insert into crm_enquiry_capture set query_request_id='".$numberdigit."' ,enquiry_from='".$enquiry_from."', leadvalujson='".$jsonPost."',created_time='".time()."'";
			
				if(mysql_query($insertLead)){
				
	    			return true;
				
				}
		}
	}
	
	function mapFiledKey($jsonPost, $type='maped'){
		
		try {
			
			$NameArr	=  array(
								'full_name'=>'name', 
								'name'=>'name', 
								'user_name'=>'name',
								'phone_number'=>'phone',
								'email'=>'email',
								'user_contact'=>'phone',
								'phone'=>'phone',
								'tell_us_are_you_interested_'=>'tell_us_are_you_interested',
								'want_to_schedule_a_free_site_visit_'=>"want_to_schedule_a_free_site_visit",
								'preferred_day_for_site_visit_'=>'preferred_day_for_site_visit',
								'city'=>'city',
								'gender'=>'gender',
								'country'=>'country',
								'enquiry'=>'enquiry' 
		);	
		
		
		if($type=='maped'){
			
			$jsonPost2		=	array();
		
			foreach($NameArr as $key=>$val){
				
				if(@array_key_exists($key , $jsonPost))
				{
				@$jsonPost2[$val] = @$jsonPost[$key];
				}
		}
		 return $jsonPost2;
		
		}else{
			
			$c=	array();
			foreach($jsonPost as $key=>$va){

				if(isset($keyArr[$key])){
					
					$c[$keyArr[$key]]			=	$va;
					unset($rawArr[$key]);

				}else{

					$c[$key]					=	$va;
				}
			}
			
			
			return  $c;
			
		}
 
 
	}catch (Exception $e){
		
		return false;
	
	}
 
 }
 
 
 

?>