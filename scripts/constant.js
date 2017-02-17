/**
 * Application constant js file 
 */

// create a namesapce 
var app_constant = app_constant || {};

app_constant.protocol	= window.location.protocol;
app_constant.hostname	= window.location.hostname;
app_constant.host		= window.location.host;	 
if(app_constant.hostname === 'localhost'){
	app_constant.root = 'test.crm';
}else{
	app_constant.root = 'CRM';
}

app_constant.base_url	= app_constant.protocol + '//'+ app_constant.hostname + '/'+ app_constant.root + '/' ; 