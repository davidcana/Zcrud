"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var fieldBuilder = require( '../../../js/app/fields/fieldBuilder.js' );
var Qunit = require( 'qunitjs' );
var testHelper = require( './testHelper.js' );

var defaultTestOptions = require( './defaultTestOptions.js' );
var thisTestOptions = {};
var options = $.extend( true, {}, defaultTestOptions, thisTestOptions );

// Run tests
QUnit.test( "create test", function( assert ) {

    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'load' );

            // Assert register with key 0 not exists
            var key = 0;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "description": "Service " + key + " description",
                "date": "10/23/2017",
                "time": "18:50",
                "datetime": "10/23/2017 20:00",
                "phoneType": "officePhone_option",
                "province": "Málaga",
                "city": "Marbella",
                "browser": "Firefox",
                "important": true,
                "number": "3"
            };
            testHelper.checkNoRecord( assert, key );
            var values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 10 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 129',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
            });
            
            // Go to create form and create record
            testHelper.clickCreateListButton();
            testHelper.fillForm( record );
            
            testHelper.checkForm( assert, record );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();
            values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 0, 9 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 130',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
            });
            testHelper.checkRecord( assert, key, fieldBuilder.filterValues( record, options.fields ) );
            
            // Go to edit form again and check record
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, record );

            // Return to list again and check it
            testHelper.clickFormCancelButton();
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 130',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
            });
            testHelper.checkRecord( assert, key, fieldBuilder.filterValues( record, options.fields ) );
            
            done();
        }
    );
});
