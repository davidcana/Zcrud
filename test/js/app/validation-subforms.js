"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var Qunit = require( 'qunitjs' );
var testHelper = require( './testHelper.js' );
var testUtils = require( './testUtils' );

var defaultTestOptions = require( './subformTestOptions.js' );
var options = undefined;

var fatalErrorFunctionCounter = 0;
defaultTestOptions.fatalErrorFunction = function( message ){
    ++fatalErrorFunctionCounter;
};

// Run tests
/*
QUnit.test( "create validation test", function( assert ) {

    testUtils.resetServices();
    var done = assert.async();
    options = $.extend( true, {}, defaultTestOptions );
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'load' );

            // Assert register with key 0 not exists
            var key = 0;
            var record =  {
                "id": "" + key,
                "name": "" + key,   // Validation must fail here!
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

            // Go to create form
            testHelper.clickCreateListButton();
            testHelper.fillForm( record );
            assert.equal( testHelper.getNumberOfValidationErrors(), 1 );
            
            // Try to create record (1 error)
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 1 );
            fatalErrorFunctionCounter = 0;
            testHelper.checkForm( assert, record );
            testHelper.checkNoRecord( assert, key );
            
            // Fix the form
            record.name = "Service " + key;
            testHelper.setFormVal( record, 'name' );
            assert.equal( testHelper.getNumberOfValidationErrors(), 0 );
            
            // Create record (no errors)
            testHelper.clickFormSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.checkRecord( assert, key, record );
            
            // Go to edit form again and check record
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, record );
            
            done();
        }
    );
});

QUnit.test( "update validation test", function( assert ) {
    
    testUtils.resetServices();
    var done = assert.async();
    options = $.extend( true, {}, defaultTestOptions );
    
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
            testHelper.checkRecord( assert, key, record );

            // Go to edit form and edit record
            testHelper.clickUpdateListButton( key );
            var editedRecord =  {
                "name": "" + key,   // Validation must fail here!
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
            assert.equal( testHelper.getNumberOfValidationErrors(), 1 );
            
            // Try to create record (1 error)
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 1 );
            fatalErrorFunctionCounter = 0;
            testHelper.checkForm( assert, newRecord );
            
            // Fix the form
            newRecord.name = "Service " + key + " edited";
            testHelper.setFormVal( newRecord, 'name' );
            assert.equal( testHelper.getNumberOfValidationErrors(), 0 );
            
            // Create record (no errors)
            testHelper.clickFormSubmitButton();
            testHelper.checkRecord( assert, key, newRecord );

            // Go to edit form again and check record
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, newRecord );

            done();
        }
    );
});

QUnit.test( "create undo/redo validation test", function( assert ) {
    
    testUtils.resetServices();
    var done = assert.async();
    options = $.extend( true, {}, defaultTestOptions );

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

            // Go to create form
            testHelper.clickCreateListButton();
            testHelper.fillForm( record );
            assert.equal( testHelper.getNumberOfValidationErrors(), 0 );

            // Set an invalid name
            var badRecord = $.extend( true, {}, record );
            badRecord.name = "" + key;
            testHelper.setFormVal( badRecord, 'name' );
            
            // Try to create record (1 error)
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 1 );
            fatalErrorFunctionCounter = 0;
            testHelper.checkForm( assert, badRecord );
            testHelper.checkNoRecord( assert, key );
            
            // Fix the form undoing
            testHelper.clickUndoButton();
            assert.equal( testHelper.getNumberOfValidationErrors(), 0 );
            testHelper.checkForm( assert, record );
            
            // Set the name to an invalid value again redoing
            testHelper.clickRedoButton();
            assert.equal( testHelper.getNumberOfValidationErrors(), 1 );
            testHelper.checkForm( assert, badRecord );
            
            // Fix the form undoing again
            testHelper.clickUndoButton();
            assert.equal( testHelper.getNumberOfValidationErrors(), 0 );
            testHelper.checkForm( assert, record );
            
            // Create record (no errors)
            testHelper.clickFormSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.checkRecord( assert, key, record );

            // Go to edit form again and check record
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, record );

            done();
        }
    );
});

QUnit.test( "update undo/redo validation test", function( assert ) {
    
    testUtils.resetServices();
    var done = assert.async();
    options = $.extend( true, {}, defaultTestOptions );

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
            testHelper.checkRecord( assert, key, record );

            // Go to edit form and edit record
            testHelper.clickUpdateListButton( key );
            var editedRecord =  {
                "name": "Service " + key,   // Validation must fail here!
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

            // Go to create form
            testHelper.clickCreateListButton();
            testHelper.fillForm( editedRecord );
            assert.equal( testHelper.getNumberOfValidationErrors(), 0 );

            // Set an invalid name
            var newRecord = $.extend( true, {}, record, editedRecord );
            var badRecord = $.extend( true, {}, newRecord );
            badRecord.name = "" + key;
            testHelper.setFormVal( badRecord, 'name' );
            
            // Try to create record (1 error)
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 1 );
            fatalErrorFunctionCounter = 0;
            testHelper.checkForm( assert, badRecord );

            // Fix the form undoing
            testHelper.clickUndoButton();
            assert.equal( testHelper.getNumberOfValidationErrors(), 0 );
            testHelper.checkForm( assert, newRecord );

            // Set the name to an invalid value again redoing
            testHelper.clickRedoButton();
            assert.equal( testHelper.getNumberOfValidationErrors(), 1 );
            testHelper.checkForm( assert, badRecord );

            // Fix the form undoing again
            testHelper.clickUndoButton();
            assert.equal( testHelper.getNumberOfValidationErrors(), 0 );
            testHelper.checkForm( assert, newRecord );

            // Create record (no errors)
            testHelper.clickFormSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.checkRecord( assert, key, newRecord );

            // Go to edit form again and check record
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, newRecord );

            done();
        }
    );
});
*/
QUnit.test( "create with subforms validation test", function( assert ) {

    // Reset services and build new service with id 0
    testUtils.resetServices();
    
    var done = assert.async();
    options = $.extend( true, {}, defaultTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'load' );
            
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
                "number": "3",
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
            
            // Assert register with key 0 not exists
            testHelper.checkNoRecord( assert, key );

            // Go to create form
            testHelper.clickCreateListButton();
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillForm( record );
            /*
            assert.equal( testHelper.getNumberOfValidationErrors(), 1 );

            // Try to create record (1 error)
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 1 );
            fatalErrorFunctionCounter = 0;
            testHelper.checkForm( assert, record );
            testHelper.checkNoRecord( assert, key );

            // Fix the form
            record.name = "Service " + key;
            testHelper.setFormVal( record, 'name' );
            assert.equal( testHelper.getNumberOfValidationErrors(), 0 );

            // Create record (no errors)
            testHelper.clickFormSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.checkRecord( assert, key, record );

            // Go to edit form again and check record
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, record );*/

            done();
        }
    );
});
/*
QUnit.test( "update with subforms validation test", function( assert ) {

    // Reset services and build new service with id 0
    testUtils.resetServices();
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
        "number": "3",
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

    var done = assert.async();
    options = $.extend( true, {}, defaultTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'load' );

            // Assert register with key 0 not exists
            testHelper.checkNoRecord( assert, key );

            // Go to create form
            testHelper.clickCreateListButton();
            testHelper.fillForm( record );

            assert.equal( testHelper.getNumberOfValidationErrors(), 1 );

            // Try to create record (1 error)
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 1 );
            fatalErrorFunctionCounter = 0;
            testHelper.checkForm( assert, record );
            testHelper.checkNoRecord( assert, key );

            // Fix the form
            record.name = "Service " + key;
            testHelper.setFormVal( record, 'name' );
            assert.equal( testHelper.getNumberOfValidationErrors(), 0 );

            // Create record (no errors)
            testHelper.clickFormSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.checkRecord( assert, key, record );

            // Go to edit form again and check record
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, record );

            done();
        }
    );
});
*/