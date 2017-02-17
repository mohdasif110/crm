/**
 * Project Filters values factory service 
 */

var app = app || {};

(function (app){
    
	app.factory('projectFilters',function (){
        
		var filter_values = {};
        
		filter_values.budget_range = [
            
			{
				value : '500000',
				label : '5',
				currency_suffix : 'Lacs',
				selected : ''
			},
			{
				value : '1000000',
				label : '10',
				currency_suffix : 'Lacs',
				selected : ''
			},
			{
				value : '2000000',
				label : '20',
				currency_suffix : 'Lacs',
				selected : ''
			},
			{
				value : '3000000',
				label : '30',
				currency_suffix : 'Lacs',
				selected : ''
			},
            {
                value : '4000000',
                label : '40',
                currency_suffix : 'Lacs',
                selected : ''
            },
            {
                value : '5000000',
                label : '50',
                currency_suffix : 'Lacs',
                selected : ''
            },
            {
                value : '6000000',
                label : '60',
                currency_suffix : 'Lacs',
                selected : ''
            },
            {
                value : '7000000',
                label : '70',
                currency_suffix : 'Lacs',
                selected : ''
            },
            {
                value : '8000000',
                label : '80',
                currency_suffix : 'Lacs',
                selected : ''
            },
            {
                value : '9000000',
                label : '90',
                currency_suffix : 'Lacs',
                selected: ''
            },
            {
                value : '10000000',
                label : '1.0',
                currency_suffix : 'Cr',
                selected : ''
            },
            {
                value : '12000000',
                label : '1.2',
                currency_suffix : 'Cr',
                selected : ''
            },
            {
                value : '14000000',
                label : '1.4',
                currency_suffix : 'Cr',
                selected : ''
            },
            {
                value : '16000000',
                label : '1.6',
                currency_suffix : 'Cr',
                selected : ''
            },
            {
                value : '18000000',
                label : '1.8',
                currency_suffix : 'Cr',
                selected : ''
            },
            {
                value : '20000000',
                label : '2.0',
                currency_suffix : 'Cr',
                selected : ''
            },
            {
                value : '23000000',
                label : '2.3',
                currency_suffix : 'Cr',
                selected : ''
            },
            {
                value : '26000000',
                label : '2.6',
                currency_suffix : 'Cr',
                selected : ''
            },
            {
                value : '30000000',
                label : '3.5',
                currency_suffix : 'Cr',
                selected : ''
            },
            {
                value : '35000000',
                label : '3.5',
                currency_suffix : 'Cr',
                selected : ''
            },
            {
                value : '40000000',
                label : '4.0',
                currency_suffix : 'Cr',
                selected : ''
            },
            {
                value : '45000000',
                label : '4.5',
                currency_suffix : 'Cr',
                selected : ''
            },
            {
                value : '50000000',
                label : '5',
                currency_suffix : 'Cr',
                selected : ''
            },
            {
                value : '100000000',
                label : '10',
                currency_suffix : 'Cr',
                selected : ''
            },
            {
                value : '200000000',
                label : '20',
                currency_suffix : 'Cr',
                selected : ''
            }
        ];
        
        
	filter_values.property_types = [
		{
			label : 'Plot',
			value : 'PLOT',
			type : 'R'
		},
		{
			label : 'Flat',
			value : 'FLAT',
			type : 'R'
		},
		{
			label : 'House/Villa',
			value : 'HOUSE/VILLA',
			type : 'R'
		},
		{
			label : 'Bilder floor',
			value : 'BUILDER FLOOR',
			type : 'R'
		},
		{
			label : 'Office Space',
			value : 'OFFICE SPACE',
			type : 'C'
		},
		{
			label : 'Shop/Showroom',
			value : 'SHOP/SHOWROOM',
			type : 'C'
		},
		{
			label : 'Service Apartment',
			value : 'SERVICE APARTMENT',
			type : 'C'
		}
	];
			
		return filter_values;
    });
    
}) (app);