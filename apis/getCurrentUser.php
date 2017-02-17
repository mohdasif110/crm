<?php
session_start();
/**
 * Return current user object from session 
 *  
 */

// Gettting user data from session 

if( isset($_SESSION['currentUser']) && !empty($_SESSION['currentUser'])){
    
    echo json_encode($_SESSION['currentUser']);
    
}else{
 
    echo json_encode(array(),TRUE);
}