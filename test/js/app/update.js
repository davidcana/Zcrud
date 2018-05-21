"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var Qunit = require( 'qunit' );
var testHelper = require( './testHelper.js' );
var context = require( '../../../js/app/context.js' );

var defaultTestOptions = require( './defaultTestOptions.js' );
var thisTestOptions = {};
var options = $.extend( true, {}, defaultTestOptions, thisTestOptions );

// Run tests
QUnit.test( "update test", function( assert ) {

    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'load' );

                // Assert register with key 2 exists
                var key = 2;
                var record =  {
                    "id": "" + key,
                    "name": "Service " + key
                };
                testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( record, options.fields ) );
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

                // Go to edit form and edit record
                testHelper.clickUpdateListButton( key );
                var editedRecord =  {
                    "name": "Service 2 edited",
                    "description": "Service 2 description",
                    "date": "10/23/2017",
                    "time": "18:50",
                    "datetime": "10/23/2017 20:00",
                    "phoneType": "officePhone_option",
                    "province": "Cádiz",
                    "city": "Tarifa",
                    "browser": "Firefox",
                    "important": true,
                    "number": "3"
                };

                testHelper.fillForm( editedRecord );
                var newRecord = $.extend( true, {}, record, editedRecord );

                testHelper.checkForm( assert, newRecord );

                // Submit and show the list again
                testHelper.clickFormSubmitButton();

                var valuesList = testHelper.buildValuesList( 1, 10 );
                valuesList[ 1 ] = valuesList[ 1 ].replace( "/" + record.name + "/", "/" + editedRecord.name + "/" );
                values = testHelper.buildCustomValuesList( valuesList );

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
                testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( newRecord, options.fields ) );

                // Go to edit form again and check record
                testHelper.clickUpdateListButton( key );
                testHelper.checkForm( assert, newRecord );

                // Return to list again and check it
                testHelper.clickFormCancelButton();
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
                testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( newRecord, options.fields ) );
            
                done();
        }
    );
});
