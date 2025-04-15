"use strict";

//var $ = require( 'zzdom' );
//var zcrud = require( '../../../js/app/main.js' );
var zzDOM = require( '../../../js/app/zzDOMPlugin.js' );
var $ = zzDOM.zz;
var Qunit = require( 'qunit' );
var utils = require( '../../../js/app/utils.js' );
var testHelper = require( './testHelper.js' );
var testServerSide = require( './testServerSide' );
var context = require( '../../../js/app/context.js' );

var defaultTestOptions = require( './defaultTestOptions.js' );
var options = undefined;

var errorFunctionCounter = 0;
defaultTestOptions.errorFunction = function( message ){
    ++errorFunctionCounter;
};

// Run tests
QUnit.test( "create validation test", function( assert ) {

    testServerSide.resetServices();
    var done = assert.async();
    options = utils.extend( true, {}, defaultTestOptions );
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 0 not exists
            var key = 0;
            var record =  {
                "id": "" + key,
                "name": "" + key,   // Validation must fail here!
                "description": "Service " + key + " description",
                "date": "10/02/2017",
                "time": "18:50",
                "datetime": "10/03/2017 20:00",
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
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 1 );
            errorFunctionCounter = 0;
            testHelper.checkForm( assert, record );
            testHelper.checkNoRecord( assert, key );
            
            // Fix the form
            record.name = "Service " + key;
            testHelper.setFormVal( record, 'name' );
            assert.equal( testHelper.getNumberOfValidationErrors(), 0 );
            
            // Create record (no errors)
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( record, options.fields ) );
            
            // Go to edit form again and check record
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, record );
            
            done();
        }
    );
});

QUnit.test( "update validation test (text)", function( assert ) {
    
    testServerSide.resetServices();
    var done = assert.async();
    options = utils.extend( true, {}, defaultTestOptions );
    
    $( '#departmentsContainer' ).zcrud(
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                "id": "" + key,
                "name": "Service " + key
            };
            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( record, options.fields ) );

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
            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkForm( assert, newRecord );
            assert.equal( testHelper.getNumberOfValidationErrors(), 1 );
            
            // Try to create record (1 error)
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 1 );
            errorFunctionCounter = 0;
            testHelper.checkForm( assert, newRecord );
            
            // Fix the form
            newRecord.name = "Service " + key + " edited";
            testHelper.setFormVal( newRecord, 'name' );
            assert.equal( testHelper.getNumberOfValidationErrors(), 0 );
            
            // Create record (no errors)
            testHelper.clickFormSubmitButton();
            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( newRecord, options.fields ) );

            // Go to edit form again and check record
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, newRecord );

            done();
        }
    );
});

QUnit.test( "update validation test (date)", function( assert ) {
    
    testServerSide.resetServices();
    var done = assert.async();
    options = utils.extend( true, {}, defaultTestOptions );
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                "id": "" + key,
                "name": "Service " + key
            };
            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( record, options.fields ) );

            // Go to edit form and edit record
            testHelper.clickUpdateListButton( key );
            var editedRecord =  {
                "name": "Service " + key,
                "description": "Service 2 description",
                "date": "10/23/201A",    // Validation must fail here!
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
            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkForm( assert, newRecord );
            assert.equal( testHelper.getNumberOfValidationErrors(), 1 );
            
            // Try to create record (1 error)
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 1 );
            errorFunctionCounter = 0;
            testHelper.checkForm( assert, newRecord );
            
            // Fix the form
            newRecord.date = "10/23/2017";
            testHelper.setFormVal( newRecord, 'date' );
            assert.equal( testHelper.getNumberOfValidationErrors(), 0 );
            
            // Force validation error
            newRecord.date = "10/34/2017";
            testHelper.setFormVal( newRecord, 'date' );
            assert.equal( testHelper.getNumberOfValidationErrors(), 1 );
            
            // Fix the form again
            newRecord.date = "11/23/2017";
            testHelper.setFormVal( newRecord, 'date' );
            assert.equal( testHelper.getNumberOfValidationErrors(), 0 );

            // Create record (no errors)
            testHelper.clickFormSubmitButton();
            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( newRecord, options.fields ) );

            // Go to edit form again and check record
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, newRecord );

            done();
        }
    );
});

QUnit.test( "update validation test (time)", function( assert ) {
    
    testServerSide.resetServices();
    var done = assert.async();
    options = utils.extend( true, {}, defaultTestOptions );
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                "id": "" + key,
                "name": "Service " + key
            };
            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( record, options.fields ) );

            // Go to edit form and edit record
            testHelper.clickUpdateListButton( key );
            var editedRecord =  {
                "name": "Service " + key,
                "description": "Service 2 description",
                "date": "10/23/2017",
                "time": "18:5A",    // Validation must fail here!
                "datetime": "10/23/2017 20:00",
                "phoneType": "officePhone_option",
                "province": "Cádiz",
                "city": "Tarifa",
                "browser": "Firefox",
                "important": true,
                "number": "3"
            };

            testHelper.fillForm( editedRecord );
            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkForm( assert, newRecord );
            assert.equal( testHelper.getNumberOfValidationErrors(), 1 );
            
            // Try to create record (1 error)
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 1 );
            errorFunctionCounter = 0;
            testHelper.checkForm( assert, newRecord );
            
            // Fix the form
            newRecord.time = '18:22';
            testHelper.setFormVal( newRecord, 'time' );
            assert.equal( testHelper.getNumberOfValidationErrors(), 0 );
            
            // Create record (no errors)
            testHelper.clickFormSubmitButton();
            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( newRecord, options.fields ) );

            // Go to edit form again and check record
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, newRecord );

            done();
        }
    );
});

QUnit.test( "update validation test (datetime)", function( assert ) {
    
    testServerSide.resetServices();
    var done = assert.async();
    options = utils.extend( true, {}, defaultTestOptions );
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                "id": "" + key,
                "name": "Service " + key
            };
            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( record, options.fields ) );

            // Go to edit form and edit record
            testHelper.clickUpdateListButton( key );
            var editedRecord =  {
                "name": "Service " + key,
                "description": "Service 2 description",
                "date": "10/23/2017",
                "time": "18:50",
                "datetime": "10/23/201A 20:00",    // Validation must fail here!
                "phoneType": "officePhone_option",
                "province": "Cádiz",
                "city": "Tarifa",
                "browser": "Firefox",
                "important": true,
                "number": "3"
            };

            testHelper.fillForm( editedRecord );
            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkForm( assert, newRecord );
            assert.equal( testHelper.getNumberOfValidationErrors(), 1 );
            
            // Try to create record (1 error)
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 1 );
            errorFunctionCounter = 0;
            testHelper.checkForm( assert, newRecord );
            
            // Fix the form
            newRecord.datetime = "10/23/2019 20:00";
            testHelper.setFormVal( newRecord, 'datetime' );
            assert.equal( testHelper.getNumberOfValidationErrors(), 0 );
            
            // Force validation error
            newRecord.datetime = "10/38/2019 20:00";
            testHelper.setFormVal( newRecord, 'datetime' );
            assert.equal( testHelper.getNumberOfValidationErrors(), 1 );

            // Fix the form again
            newRecord.datetime = "12/23/2019 20:00";
            testHelper.setFormVal( newRecord, 'datetime' );
            assert.equal( testHelper.getNumberOfValidationErrors(), 0 );

            // Create record (no errors)
            testHelper.clickFormSubmitButton();
            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( newRecord, options.fields ) );

            // Go to edit form again and check record
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, newRecord );

            done();
        }
    );
});

QUnit.test( "create undo/redo validation test", function( assert ) {
    
    testServerSide.resetServices();
    var done = assert.async();
    options = utils.extend( true, {}, defaultTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

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
            var badRecord = utils.extend( true, {}, record );
            badRecord.name = "" + key;
            testHelper.setFormVal( badRecord, 'name' );
            
            // Try to create record (1 error)
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 1 );
            errorFunctionCounter = 0;
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
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( record, options.fields ) );

            // Go to edit form again and check record
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, record );

            done();
        }
    );
});

QUnit.test( "update undo/redo validation test", function( assert ) {
    
    testServerSide.resetServices();
    var done = assert.async();
    options = utils.extend( true, {}, defaultTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                "id": "" + key,
                "name": "Service " + key
            };
            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( record, options.fields ) );

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
            var newRecord = utils.extend( true, {}, record, editedRecord );
            var badRecord = utils.extend( true, {}, newRecord );
            badRecord.name = "" + key;
            testHelper.setFormVal( badRecord, 'name' );
            
            // Try to create record (1 error)
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 1 );
            errorFunctionCounter = 0;
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
            assert.equal( errorFunctionCounter, 0 );
            
            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( newRecord, options.fields ) );
            
            // Go to edit form again and check record
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, newRecord );

            done();
        }
    );
});

QUnit.test( "update undo/redo validation test (date)", function( assert ) {
    
    testServerSide.resetServices();
    var done = assert.async();
    options = utils.extend( true, {}, defaultTestOptions );
    
    $( '#departmentsContainer' ).zcrud(
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                "id": "" + key,
                "name": "Service " + key
            };
            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( record, options.fields ) );

            // Go to edit form and edit record
            testHelper.clickUpdateListButton( key );
            var editedRecord =  {
                "date": "a",    // Validation must fail here!
            };

            testHelper.fillForm( editedRecord );
            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkForm( assert, newRecord );
            assert.equal( testHelper.getNumberOfValidationErrors(), 1 );
            
            // Try to create record (1 error)
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 1 );
            errorFunctionCounter = 0;
            testHelper.checkForm( assert, newRecord );
            
            // Fix the form undoing
            testHelper.clickUndoButton();
            assert.equal( testHelper.getNumberOfValidationErrors(), 0 );
            newRecord.date = '';
            testHelper.checkForm( assert, newRecord );

            // Force error again
            testHelper.clickRedoButton();
            assert.equal( testHelper.getNumberOfValidationErrors(), 1 );
            newRecord.date = 'a';
            testHelper.checkForm( assert, newRecord );

            done();
        }
    );
});
