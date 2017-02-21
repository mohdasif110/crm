<?php

session_start();

require_once 'db_connection.php';

$post_data = file_get_contents('php://input');

if($post_data == ''){
    
    echo json_encode(array('success' => 0,'message' => ''), TRUE); exit;
};

$data = json_decode($post_data, true);

/* Validations on employee data */


$form_errors =  array();

if(!isset($data['firstname']) || $data['firstname'] == ''){
    
    $form_errors['firstname'] = 'First name field is required';
}

if(!isset($data['email']) || $data['email'] == ''){
    $form_errors['email'] = 'Email field is required';
}else if(!filter_var($data['email'],FILTER_VALIDATE_EMAIL) === TRUE){
    $form_errors['email'] = 'Email id is not valid';
}

if(!isset($data['contactNumber']) || $data['contactNumber'] == ''){
    $form_errors['phone'] = 'Phone field is required';
}

if(!isset($data['doj']) || $data['doj'] == ''){
    $form_errors['joining_date'] = 'Join Date feild is required';
}

if(!isset($data['address']) || $data['address'] == ''){
    $form_errors['address'] = 'Address field is required';
}

if(empty($data['state']) || $data['state'] == ''){
    $form_errors['state'] = 'State field is required';
}

if(empty($data['city']) || $data['city'] == ''){
    $form_errors['city'] = 'City field is required';
}

if(empty($data['designation']) || $data['designation'] == ''){
    $form_errors['designation'] = 'Designation field is required';
}

if(!empty($form_errors)){
    
    echo json_encode(array('success' => -1, 'errors' => $form_errors),true); exit;
}else{
 
    // Update employee
    
    $update_emp = 'UPDATE  '.strtolower('employees').' '
            . ' SET  firstname = "'.$data['firstname'].'" ,'
            . ' lastname = "'.$data['lastname'].'" , '
            . ' email = "'.$data['email'].'" ,'
            . ' contactNumber = "'.$data['contactNumber'].'" ,'
            . ' doj = "'.$data['doj'].'" ,'
            . ' state = '.$data['state'].' ,'
            . ' city = '.$data['city'].' ,'
            . ' designation = '.$data['designation'].' ,'
            . ' reportingTo = '.$data['reportingTo'].' ,'
            . ' address = "'.$data['address'].'" ,'
            . ' addressLine2 = "'.$data['addressLine2'].'"'
            . ' WHERE id = '.$data['id'].'';
    
    $query_flag = 0;        
	
    if(mysql_query($update_emp)){
        
        $query_flag = 1;
		
        echo json_encode(array('success' => 1),true); exit;
		
    }else{
		
		$mysql_error = mysql_error();
		
		if( stripos($mysql_error, "duplicate", 0) >= 0){
			
			$error_text = 'Contact number already exists';
		}else{
			
			$error_text = 'Employee details could not be updated. Try again later';
		}
		
        $query_flag = 0;
		
        echo json_encode(array('success' => 0,'error' => $error_text),true); exit;
    }
}