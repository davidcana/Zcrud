"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var Qunit = require( 'qunitjs' );
var testHelper = require( './testHelper.js' );
var testUtils = require( './testUtils.js' );

var defaultTestOptions = require( './subformTestOptions.js' );
var thisTestOptions = {};
var options = $.extend( true, {}, defaultTestOptions, thisTestOptions );

// Run tests
QUnit.test( "subform change test", function( assert ) {

    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            
            // 
            var key = 4;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "description": "Description of Bart Simpson"
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        "description": "Description of Lisa Simpson"
                    }
                ]
            };
            testUtils.setService( key, record );
            
            $( '#departmentsContainer' ).zcrud( 'load' );
            
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
                "name": "Service " + key + " edited",
                "members": {
                    "0": {
                        "description": "Description of Bart Simpson edited"
                    },
                    "1": {
                        "name": "Lisa Simpson edited",
                        "description": "Description of Lisa Simpson edited"
                    }
                }
            };
            
            testHelper.fillForm( editedRecord );
            
            var newRecord =  {
                "id": "" + key,
                "name": "Service " + key + " edited",
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "description": "Description of Bart Simpson edited"
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson edited",
                        "description": "Description of Lisa Simpson edited"
                    }
                ]
            };
            testHelper.checkForm( assert, newRecord );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();
            
            // Check storage
            assert.deepEqual( testUtils.getService( key ), newRecord );
            
            // Go to edit form again and check the form again
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, newRecord );
            
            done();
        }
    );
});

QUnit.test( "subform create test", function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // 
            var key = 3;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "description": "Description of Bart Simpson"
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        "description": "Description of Lisa Simpson"
                    }
                ]
            };
            testUtils.setService( key, record );

            $( '#departmentsContainer' ).zcrud( 'load' );

            // Go to edit form and edit record
            testHelper.clickUpdateListButton( key );
            
            // Add subform record 3
            var subformRecord3 = {
                "code": "3",
                "name": "Homer Simpson",
                "description": "Description of Homer Simpson"
            };
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillSubformNewRow( subformRecord3, 'members' );
            
            // Add subform record 4
            var subformRecord4 = {
                "code": "4",
                "name": "Marge Simpson",
                "description": "Description of Marge Simpson"
            };
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillSubformNewRow( subformRecord4, 'members' );
            
            // Build edited record and check form
            var editedRecord = $.extend( true, {}, record );
            editedRecord.members.push( subformRecord3 );
            editedRecord.members.push( subformRecord4 );
            testHelper.checkForm( assert, editedRecord );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testUtils.getService( key ), editedRecord );

            // Go to edit form again and check the form again
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, editedRecord );

            done();
        }
    );
});

