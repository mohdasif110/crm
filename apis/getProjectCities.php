<?php

// Make a request to remote server for cities list 

$cities = file_get_contents('https://bookmyhouse.com/api/getcities.php');
echo $cities; 


