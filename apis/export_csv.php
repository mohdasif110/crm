<?php
require_once 'db_connection.php';
//output headers so that the file is downloaded rather than displayed
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename=lms_query_data.csv');
//create a file pointer connected to the output stream
$output = fopen('php://output', 'w');

	//output the column headings
	
	function mysql_field_array( $query ) {
		
		$field = mysql_num_fields( $query );
		
		for ( $i = 0; $i < $field; $i++ ) {
        
			$names[] = mysql_field_name( $query, $i );
		}
        return $names;
    }
	
	//Examples of use
    $selectEnquiry 		=	mysql_query("select 
	name, 
	phone,
	email,
	tell_us_are_you_interested,
	want_to_schedule_a_free_site_visit,
	preferred_day_for_site_visit,
	city,
	gender,
	country,
	enquiry,
	project_name,
	project_url,
	ivr_push_status,
	DATE_FORMAT(FROM_UNIXTIME(created_time), '%e %b %Y') as CreatedDate,
	DATE_FORMAT(FROM_UNIXTIME(ivr_push_date), '%e %b %Y') as ivr_push_date,
	enquiry_from as QueryFrom
	from crm_enquiry_capture order by created_time desc");
	$fields = mysql_field_array( $selectEnquiry );
	fputcsv($output, $fields);
	//loop over the rows, outputting them
	
	while ($row = mysql_fetch_assoc($selectEnquiry)){
	
		fputcsv($output, $row);
	}
	
?>

