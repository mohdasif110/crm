<?php 
session_start();

require 'function.php';

$_get_data = filter_input_array(INPUT_GET);

$employee_id = '';

// user is mandatory to access this API

if ( isset ($_get_data['user_id']) && !empty($_get_data['user_id']) ){
	$employee_id = $_get_data['user_id'];
}

// get user role or designation 

// if user is agent or executive then fetch only those closed leads which were added by them.

// if user is sales person then fetch only those leads which is closed by them 

// if user is asm then fetch leads which are closed by their sales persons or itself 

// if user is TL CRM then fetch all leads which is closed 

// if user is admin then fetch all leads which is closed

// if user is sr. team leader then fetch leads which is closed by their underlying agents 

// if user is Director Sales then fetch all leads which is closed.

// if user is Head Customer Support then fetch all leads which is closed

$user_role = '';

$user_role = getEmployeeDesignation($employee_id);
//echo '<pre>'; print_r($user_role); exit;
$designation_slug	= ( isset($user_role[1]) ? $user_role[1] : '');
$designation		= ( isset($user_role[0]) ? $user_role[0]: '');

switch($designation_slug){
	
	case 'sales_person':
		
		$query = 'SELECT * FROM lead WHERE lead_closure_date IS NOT NULL AND lead_closed_by = '.$employee_id.'';
		break;
	
	case 'area_sales_manager':
		
		$direct_reporting_persons = getDirectReportings($employee_id);
		array_push($direct_reporting_persons, $employee_id);
		$ids = implode("','", $direct_reporting_persons);
		$query = "SELECT * FROM `lead` WHERE lead_closure_date IS NOT NULL AND `lead_closed_by` IN ('".$ids."')";
		break;
	
	default :	
}

	$result = mysql_query($query);	
	
	$lead_data = array ();
	
	if($result && mysql_num_rows($result) > 0){
		
		while($row = mysql_fetch_assoc($result)){
			array_push($lead_data, $row);
		}
	}
	
	echo json_encode(array(
		'success' => 1, 'data' => $lead_data
	), true);