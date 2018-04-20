"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var fieldBuilder = require( '../../../js/app/fields/fieldBuilder.js' );
var Qunit = require( 'qunit' );
var testHelper = require( './testHelper.js' );
var testUtils = require( './testUtils.js' );
var context = require( '../../../js/app/context.js' );

var formTestOptions = require( './defaultTestOptions.js' );
var editableListTestOptions = require( './editableListTestOptions.js' );
var options = undefined;

var fatalErrorFunctionCounter = 0;
var fatalErrorFunction = function( message ){
    ++fatalErrorFunctionCounter;
};
formTestOptions.fatalErrorFunction = fatalErrorFunction;
editableListTestOptions.fatalErrorFunction = fatalErrorFunction;

// Run tests

QUnit.test( "form create record with duplicated key test", function( assert ) {

    var done = assert.async();
    fatalErrorFunctionCounter = 0;
    options = formTestOptions;
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            
            testUtils.resetServices();
            $( '#departmentsContainer' ).zcrud( 'load' );

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                "id": "" + key,
                "name": "Service " + key
            };
            testHelper.checkRecord( assert, key, record );
            
            // Go to create form and try to create record
            testHelper.clickCreateListButton();
            var newRecord =  {
                "id": "" + key,
                "name": "Service " + key + " (error)",
                "description": "Service " + key + " description (duplicated key)",
                "province": "Cádiz"
            };
            testHelper.fillForm( newRecord );
            testHelper.checkForm( assert, newRecord );
            
            // Submit 
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 1 );
            
            assert.deepEqual( testUtils.getService( key ), record );
            
            done();
        }
    );
});

QUnit.test( "form update record with no duplicated key test", function( assert ) {

    var done = assert.async();
    fatalErrorFunctionCounter = 0;
    options = formTestOptions;
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            
            testUtils.resetServices();
            $( '#departmentsContainer' ).zcrud( 'load' );

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                "id": "" + key,
                "name": "Service " + key
            };
            testHelper.checkRecord( assert, key, record );

            // Go to update form and update key
            testHelper.clickUpdateListButton( key );
            var newKey = 999;
            var newRecord =  {
                "id": "" + newKey,
                "name": "Service " + newKey
            };
            testHelper.checkNoRecord( assert, newKey );
            testHelper.fillForm( newRecord );
            testHelper.checkForm( assert, newRecord );
            
            // Submit 
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );

            testHelper.checkNoRecord( assert, key );
            assert.deepEqual( testUtils.getService( newKey ), newRecord );

            done();
        }
    );
});

QUnit.test( "form update record with duplicated key test", function( assert ) {

    var done = assert.async();
    fatalErrorFunctionCounter = 0;
    options = formTestOptions;
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            
            testUtils.resetServices();
            $( '#departmentsContainer' ).zcrud( 'load' );

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                "id": "" + key,
                "name": "Service " + key
            };
            testHelper.checkRecord( assert, key, record );

            // Go to update form and try to update key
            testHelper.clickUpdateListButton( key );
            var newKey = 3;
            var newRecord =  {
                "id": "" + newKey,
                "name": "Service " + newKey
            };
            testHelper.fillForm( newRecord );
            testHelper.checkForm( assert, newRecord );

            // Submit 
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 1 );

            assert.deepEqual( testUtils.getService( key ), record );

            done();
        }
    );
});

QUnit.test( "form delete non existing record test", function( assert ) {

    var done = assert.async();
    fatalErrorFunctionCounter = 0;
    options = formTestOptions;
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices();
            $( '#departmentsContainer' ).zcrud( 'load' );

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                "id": "" + key,
                "name": "Service " + key
            };
            testHelper.checkRecord( assert, key, record );

            // Go to delete form
            testHelper.clickDeleteListButton( key );
            
            // Remove service
            testUtils.removeService( key ); 

            // Submit 
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 1 );

            assert.deepEqual( testUtils.getService( key ), undefined );
            
            done();
        }
    );
});

QUnit.test( "editable list create record with duplicated key test", function( assert ) {

    var done = assert.async();
    fatalErrorFunctionCounter = 0;
    options = editableListTestOptions;
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices();
            context.updateListVisibleFields( options, [ 'id', 'name' ] );

            $( '#departmentsContainer' ).zcrud( 'load' );

            var editable = true;

            // Assert record with key 1 exists
            var key = 1;
            var record =  {
                "id": "" + key,
                "name": "Service " + key
            };
            testHelper.checkRecord( assert, key, record, editable, true );

            // Try to create
            testHelper.clickCreateRowListButton();
            var newRecord =  {
                "id": "" + key,
                "name": "Bad service"
            };
            testHelper.fillNewRowEditableList( newRecord );

            // Check errors before and after button submit
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 1 );

            testHelper.checkRecord( assert, key, record, editable, true );

            done();
        }
    );
});

QUnit.test( "editable list update record with no duplicated key test", function( assert ) {

    var done = assert.async();
    fatalErrorFunctionCounter = 0;
    options = editableListTestOptions;

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices();
            context.updateListVisibleFields( options, [ 'id', 'name' ] );
            
            $( '#departmentsContainer' ).zcrud( 'load' );
            
            var editable = true;
            
            // Assert register with key 4 exists
            var key = 4;
            var record =  {
                "id": "" + key,
                "name": "Service " + key
            };
            testHelper.checkRecord( assert, key, record, editable, true );
            
            // Update record
            var newKey = 999;
            var newRecord =  {
                "id": "" + newKey,
                "name": "Service " + newKey
            };
            testHelper.checkNoRecord( assert, newKey );
            testHelper.fillEditableList( newRecord, key );
            testHelper.checkEditableListForm( assert, key, newRecord );
            
            // Submit 
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );

            assert.deepEqual( testUtils.getService( key ), undefined );
            assert.deepEqual( testUtils.getService( newKey ), newRecord );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 129',
                ids:  "1/2/3/999/5/6/7/8/9/10",
                names: "Service 1/Service 2/Service 3/Service 999/Service 5/Service 6/Service 7/Service 8/Service 9/Service 10",
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ],
                editable: editable
            });
            
            done();
        }
    );
});

QUnit.test( "editable list update record with duplicated key test", function( assert ) {

    var done = assert.async();
    fatalErrorFunctionCounter = 0;
    options = editableListTestOptions;

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices();
            context.updateListVisibleFields( options, [ 'id', 'name' ] );

            $( '#departmentsContainer' ).zcrud( 'load' );

            var editable = true;

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                "id": "" + key,
                "name": "Service " + key
            };
            testHelper.checkRecord( assert, key, record, editable, true );

            // Try to update
            var newKey = 3;
            var record2 =  {
                "id": "" + newKey,
                "name": "Service " + newKey
            };
            testHelper.checkRecord( assert, newKey, record2, editable, true );
            
            var newRecord =  {
                "id": "" + newKey,
                "name": "Bad service"
            };
            testHelper.fillEditableList( newRecord, key );
            testHelper.checkEditableListForm( assert, key, newRecord );
            
            // Submit 
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 1 );
            
            assert.deepEqual( testUtils.getService( key ), record );
            assert.deepEqual( testUtils.getService( newKey ), record2 );

            done();
        }
    );
});

QUnit.test( "editable list delete non existing record test", function( assert ) {

    var done = assert.async();
    fatalErrorFunctionCounter = 0;
    options = editableListTestOptions;

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices();
            context.updateListVisibleFields( options, [ 'id', 'name' ] );

            $( '#departmentsContainer' ).zcrud( 'load' );

            var editable = true;

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                "id": "" + key,
                "name": "Service " + key
            };
            testHelper.checkRecord( assert, key, record, editable, true );

            // Remove service
            testUtils.removeService( key ); 
            assert.deepEqual( testUtils.getService( key ), undefined );
            
            // Try to delete again
            testHelper.clickDeleteRowListButton( key );
            
            // Submit 
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 1 );

            done();
        }
    );
});

QUnit.test( "form create record with undefined key test", function( assert ) {

    var done = assert.async();
    fatalErrorFunctionCounter = 0;
    options = formTestOptions;

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices();
            delete options.fields[ 'province' ].defaultValue;
            $( '#departmentsContainer' ).zcrud( 'load' );

            // Go to create form and create record
            testHelper.clickCreateListButton();
            var newRecord =  {
                "name": "Service (no key)",
                "description": "Service with no key"
            };
            testHelper.fillForm( newRecord );
            testHelper.checkForm( assert, newRecord );
            
            // Submit 
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );

            var fullNewRecord = $.extend( true, {}, newRecord );
            var key = 130;
            fullNewRecord.id = "" + key;
            assert.deepEqual( testUtils.getService( key ), fullNewRecord );

            testHelper.pagingTest({
                action: { 
                    lastPage: true
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 121-130 of 130',
                ids:  "121/122/123/124/125/126/127/128/129/130",
                names: "Service 121/Service 122/Service 123/Service 124/Service 125/Service 126/Service 127/Service 128/Service 129/Service (no key)",
                pageListNotActive: [ '13', '>', '>>' ],
                pageListActive: [ '<<', '<', '1', '9', '10', '11', '12' ]
            });
            
            done();
        }
    );
});
