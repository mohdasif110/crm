<?php
/**
 * API to get projects list from bookmyhouse.com server 
 * @request_method : POST 
 */

 $post_fields = array();
 
 if(isset($_POST) && isset($_POST['city'])){
    
     $post_fields = $_POST;
 }
 
 if(isset($post_fields['ptype'])){
    
    $serialize_ptype = json_encode($post_fields['ptype'],true);
    unset($post_fields['ptype']);
    
    $post_fields['ptype'] = $serialize_ptype;
 }
 
 if(isset($post_fields['bhk1'])){
	
    $serialize_bhk1 = json_encode($post_fields['bhk1'],true);
    unset($post_fields['bhk1']);
    $post_fields['bhk1'] = $serialize_bhk1;
 }
 
 // CURL Request to bookmyhouse.com server  
 
 $curl = curl_init();
 curl_setopt_array($curl, array(
    CURLOPT_RETURNTRANSFER => 1,
    CURLOPT_URL => 'http://52.77.73.171/apimain/api/fetchDetailsForCRM.php',
    CURLOPT_POST => 1,
    CURLOPT_POSTFIELDS => $post_fields
 ));
 
 $resp = curl_exec($curl);
 
 // Close request to clear up some resources
 curl_close($curl);
 
 echo $resp; exit;
 