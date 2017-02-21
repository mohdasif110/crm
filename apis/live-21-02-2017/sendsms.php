<?php

if(isset($_GET)){
    
    $number     = $_GET['number'];
    $text       = base64_decode($_GET['text']);
    $text		= 'login details';
    
    echo $number;
    echo '<br/>';
    echo $text;
    
    // SEND SMS 
    
    $url = 'http://5.189.187.160/api/mt/SendSMS?user=bookmyhouse01&password=123456&senderid=BKMYHS&channel=2&DCS=0&flashsms=0&number='.$number.'&text='.$text.'&route=1';
    
    // Get cURL resource
    $curl = curl_init();
    // Set some options - we are passing in a useragent too here
    curl_setopt_array($curl, array(
        CURLOPT_RETURNTRANSFER => 1,
        CURLOPT_URL => $url,
        CURLOPT_TIMEOUT => 120
    ));
    // Send the request & save response to $resp
    $resp = curl_exec($curl);
    // Close request to clear up some resources
    curl_close($curl);
    
    echo $resp; 
}

