<?php 
session_start();

require_once 'db_connection.php';

$input_post_data = json_decode(file_get_contents('php://input'),true);

/* Validation on form fields */

$form_errors =  array();

if(!isset($input_post_data['firstname']) || $input_post_data['firstname'] == ''){
    
    $form_errors['firstname'] = 'First name field is required';
}

if(!isset($input_post_data['email']) || $input_post_data['email'] == ''){
    $form_errors['email'] = 'Email field is required';
}else if(!filter_var($input_post_data['email'],FILTER_VALIDATE_EMAIL) === TRUE){
    $form_errors['email'] = 'Email id is not valid';
}

if(!isset($input_post_data['phone']) || $input_post_data['phone'] == ''){
    $form_errors['phone'] = 'Phone field is required';
}

if(!isset($input_post_data['joining_date']) || $input_post_data['joining_date'] == ''){
    $form_errors['joining_date'] = 'Join Date feild is required';
}

if(!isset($input_post_data['address1']) || $input_post_data['address1'] == ''){
    $form_errors['address'] = 'Address field is required';
}

if(empty($input_post_data['state']) || $input_post_data['state']['id'] == ''){
    $form_errors['state'] = 'State field is required';
}

if(empty($input_post_data['city']) || $input_post_data['city']['id'] == ''){
    $form_errors['city'] = 'City field is required';
}

if(empty($input_post_data['designation']) || $input_post_data['designation']['id'] == ''){
    $form_errors['designation'] = 'Designation field is required';
}

// Reporting 
$reporting = 'NULL';
if(!empty($input_post_data['reporting_to'])){
	$reporting = $input_post_data['reporting_to'];
}

// Email Block
if($input_post_data['isCreateLogin'] == 1){
    
    if(!isset($input_post_data['username']) || $input_post_data['username'] == ''){
        $form_errors['username'] = 'Username is required';
    }else{
        $curl = curl_init();
        curl_setopt_array($curl, array(
            CURLOPT_RETURNTRANSFER => 1,
            CURLOPT_URL => BASE_URL . 'apis/check_username_availibility.php',
            CURLOPT_POST => 1,
            CURLOPT_POSTFIELDS => json_encode(array('username' => $input_post_data['username']),true)
        ));
        
        // Send the request & save response to $resp
        $resp = curl_exec($curl);
        // Close request to clear up some resources
        curl_close($curl);
        
        // DECODE JSON response 
        $decoded_json_resp = json_decode($resp,true);
        
        if($decoded_json_resp['is_available'] == 0){
            $form_errors['username'] = 'Username is not available';
        }
    }
    
}

if(!empty($form_errors)){   
    $response = array('success' => (int) -1,'errors' => $form_errors,'message' => 'Form has some errors');
    echo json_encode($response,true,10); 
    exit;
}else{
  
    // Get form fields 
    $firstname		= $input_post_data['firstname'];
    $lastname		= $input_post_data['lastname'];
    $email			= $input_post_data['email'];
    $phone			= $input_post_data['phone'];
    $join_date		= $input_post_data['joining_date'];
    $username		= '';
    $password		= '';
    
    if(isset($input_post_data['username'])){
        $username = $input_post_data['username'];
    }
    
    if(isset($input_post_data['password'])){
        $password = hash('sha1', $input_post_data['password']); 
    }
    
    $address1 = $input_post_data['address1'];
    $address2 = '';
    
    if(isset($input_post_data['address2'])){
        $address2 = $input_post_data['address2'];
    }
    
    $city				= $input_post_data['city']['id'];
    $state				= $input_post_data['state']['id'];
    $designation		= $input_post_data['designation']['id'];
    $designation_label	= $input_post_data['designation']['text'];
    
 
	/**
	 * Every employee created having a role of other user as of now.
	 */
    
    /* Database query to insert record */
    
    $save_employee = 'INSERT INTO `employees` '
				. ' SET firstname = "'.$firstname.'" ,'
				. ' lastname = "'.$lastname.'" ,'
				. ' email = "'.$email.'" ,'
				. ' username = "'.$username.'" ,'
				. ' password = "'.$password.'" ,'
				. ' doj = "'.date('Y-m-d',  strtotime($join_date)).'" ,'
				. ' contactNumber = "'.$phone.'" ,'
				. ' address = "'.$address1.'" ,'
				. ' addressLine2 = "'.$address2.'" ,'
				. ' designation = '.$designation.' ,'
				. ' city = '.$city.' ,'
				. ' state = '.$state.' ,'
				. ' empCreationDate = "'.date('Y-m-d').'",'
				. '	role = 2 ,'
				. ' reportingTo = '.$reporting.'';
   
    if(mysql_query($save_employee)){
        
			// now send email and sms to user 
		
		    if(isset($input_post_data['isCreateLogin'])){
        
				if($input_post_data['isCreateLogin'] == 1){
            
					/* Send email to user with login credentials */
            
					require_once 'email.php';
           
					$recepient_name = $firstname. ' '. $lastname;
					$recepient_address = $email;
					$mail_body = 'Dear, '. $recepient_name;
					$mail_body .= '<br/><br/>';
					$mail_body .= 'Your account has been created in CRM';
					$mail_body .= '<br/><br/>';
					$mail_body .= 'Please find below your account/ login credentials - ';
					$mail_body .= '<br/><br/>';
					$mail_body .= '<b><u>Details:</u></b>';
					$mail_body .= '<br/><br/>';
					$mail_body .= '<b><u>Email ID:</u></b> '. $email;
					$mail_body .= '<br/>';
					$mail_body .= '<b><u>Username:</u></b> '. $username;
					$mail_body .= '<br/>';
					$mail_body .= '<b><u>Password:</u></b> ' . $input_post_data['password'];
					$mail_body .= '<br/>';
					$mail_body .= '<b><u>Designation:</u></b> '. $designation_label;
					$mail_body .= '<br/>';
					$mail_body .= '<b><u>Login URL:</u></b> ' .BASE_URL;
                    
					$mail_body .= '<br/><br/>';
					$mail_body .= '<b>Note:</b> You can login from both email id and username with the same password';
					
					// Add a recepient
					$mail->addAddress($recepient_address, $recepient_name);
					
					// Set email format to HTML
					$mail->isHTML(true);                                  

					$mail->Subject = 'Login Credentials: CRM';
					$mail->Body    = $mail_body;
					$mail->AltBody = $mail_body;

			// SENDING MAIL AND SMS 		
			/*******************************************************************************/
			
				if(IS_EMAIL_ON == 1){
					
					if(!$mail->send()) {                                             
						$email_sent = 0;                                             
					} else {                                                           
						$email_sent = 1 ;                                            
					} 
				}
			                                                                        
			/********************************************************************************/
        }
			}

			if(isset($input_post_data['isSendSMS'])){

				if($input_post_data['isSendSMS'] == 1){

					/* Send sms to user with login credentials */

				   //$sms =  file_get_contents(BASE_URL.'apis/sendsms.php?number='.$phone.'&username='.$username.'&password='.$input_post_data['password']);

				}
			}
		
		
        $success_response = array('success' => (int) 1,'message' => 'New employee has been created successfully', 'email_sent' => $email_sent); 
        echo json_encode($success_response,true);
        exit;
    }else{
        $error_response = array('success' => (int) 0, 'message' =>'Server Error: '. mysql_error());
        echo json_encode($error_response,true);
        exit;
    }
}
