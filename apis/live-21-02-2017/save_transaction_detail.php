<?php
session_start();
require 'function.php';

function uploadFile (){
	
	if(isset($_FILES['file'])){
		
		$errors= array();
		$file_name	=	$_FILES['file']['name'];
		$file_size	=	$_FILES['file']['size'];
		$file_tmp	=	$_FILES['file']['tmp_name'];
//		$file_type	=	$_FILES['file']['type'];
		$file_ext	=	strtolower(end(explode('.',$_FILES['file']['name'])));
		$expensions	=	array("jpeg","jpg","png");
      
		$file_name = 'transaction_scan_file_'.time().'.'. $file_ext;
		
		/* Validation Code not applicable now */
		//		if(in_array($file_ext,$expensions)=== false){
		//		   $errors[]="extension not allowed, please choose a JPEG or PNG file.";
		//		}

		//		if($file_size > 2097152){
		//		   $errors[]='File size must be excately 2 MB';
		//		}
		/* End: validation code */	
		
		// system path where file will be uploaded
		$upload_path = dirname(__DIR__). '/'. TRANSACTION_UPLOAD_PATH;
		
		if(empty($file_errors) == true){
			
		   move_uploaded_file($file_tmp, $upload_path.$file_name);
		   return $upload_path . $file_name;
		}else{
			return '';
		}
	}
	
}

$_post = filter_input_array(INPUT_POST);

if( isset( $_post ) && !empty($_post) ){
	
	$transactionData		= array();
	$errors					= array();
	
	// Mandatory fields 
	// amount; transaction_date; payment_mode; 
	
	if( isset($_post['amount']) && !empty($_post['amount'])){
		$transactionData['amount'] = $_post['amount'];
	}else{
		$errors[] = 'Transaction amount is not filled';
	}
	
	if( isset($_post['transaction_date']) && !empty($_post['transaction_date'])){
		$transactionData['transaction_date'] = $_post['transaction_date'];
	}else{
		$errors[] = 'Transaction date is not provided';
	}
	
	if( isset($_post['payment_mode']) && !empty($_post['payment_mode'])){
		$transactionData['transaction_mode'] = $_post['payment_mode'];
	}else{
		$errors[] = 'Payment mode is not selected';
	}
	
	if( isset($_post['enquiry_number']) && !empty($_post['enquiry_number']) ){
		$transactionData['enquiry_id'] = $_post['enquiry_number'];
	}else{
		$errors[] = 'Enquiry id not provided';
	}	
	
	if( isset($_post['user_id']) && !empty($_post['user_id']) ){
		$transactionData['employee_id'] = $_post['user_id'];
	}else{
		$errors[] = 'User is not identified for this action. Please check your session and login again';
	}	
	
	if( isset($_post['payment_type']) ){
		$transactionData['payment_type'] = $_post['payment_type'];
	}
	
	
	/**
	 * Error cheking 
	 */
	if( !empty($errors)){
		
		// send errors back to client 
		echo json_encode(array('success' => 0, 'errors' => $errors), true); exit;
	}
	
	// check if ant file is uploaded 
	
	if( isset($_FILES) && !empty($_FILES['file'])){
	
		// upload file 
		$transactionData['transaction_receipt_filepath'] = uploadFile();
	}
	
	$query = 'INSERT INTO `payment_collection` '
			. 'SET ';
	
	foreach ($transactionData as $col => $val){
		$query .= $col .' = "'. $val .'",';
	}
	
	// trim sql query 
	$trimmed_query = rtrim($query,",");
	
	if(mysql_query($trimmed_query)){
		
		// log in history 
		$log_date = date('Y-m-d');
		$employee_name = getEmployeeName($_post['user_id']);
		$text = 'Transaction details has been updated against enquiry id '.$_post['enquiry_number'].' by '.$employee_name.' on '. $log_date;
		
		$log_query = 'INSERT INTO lead_history SET '
				. ' enquiry_id = '.$_post['enquiry_number'].','
				. ' details = "'.$text.'",'
				. ' employee_id = '.$_post['user_id'].','
				. ' type = "new"';
		
		mysql_query($log_query);
		
		echo json_encode(array('success' => 1, 'message' => 'Transaction details has been saved successfully'), true);
		exit;
	}
	else{
		$errors[] = 'Transaction details not saved';
		echo json_encode(array('success' => 0, 'errors' => $errors), true);
	}
}
else{
	$errors[] = 'No Data Provided';
	echo json_encode(array('success' => 0, 'errors' => $errors), true);
}