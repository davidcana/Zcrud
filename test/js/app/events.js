"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var fieldBuilder = require( '../../../js/app/fields/fieldBuilder.js' );
var Qunit = require( 'qunit' );
var testHelper = require( './testHelper.js' );
var testUtils = require( './testUtils.js' );

var editableListOptions = require( './editableListTestOptions.js' );
var formOptions = require( './defaultTestOptions.js' );
var options = undefined;

// Events
var counters = {};

function resetCounters(){

    counters[ 'formClosed' ] = 0;
    counters[ 'formCreated' ] = 0;
    counters[ 'formSubmitting' ] = 0;
    counters[ 'recordAdded' ] = 0;
    counters[ 'recordDeleted' ] = 0;
    counters[ 'recordUpdated' ] = 0;
    counters[ 'selectionChanged' ] = 0;
    
    dataArray = [];
    eventArray = [];
}

var dataArray = [];
var eventArray = [];
function eventFunction( id, data, event ){
    ++counters[ id ];
    dataArray.push( data );
    eventArray.push( event );
}
var events = {};
events.formClosed = function ( data, event ) {
    eventFunction( 'formClosed', data, event );
};
events.formCreated = function ( data ) {
    eventFunction( 'formCreated', data );
};
events.formSubmitting = function ( data, event ) {
    eventFunction( 'formSubmitting', data, event );
};
events.recordAdded = function ( data, event ) {
    eventFunction( 'recordAdded', data, event );
};
events.recordDeleted = function ( data, event ) {
    eventFunction( 'recordDeleted', data, event );
};
events.recordUpdated = function ( data, event ) {
    eventFunction( 'recordUpdated', data, event );
};
events.selectionChanged = function ( data, event ) {
    eventFunction( 'selectionChanged', data, event );
};
formOptions.events = events;
editableListOptions.events = events;

var fatalErrorFunctionCounter = 0;
var fatalErrorFunction = function( message ){
    ++fatalErrorFunctionCounter;
};
formOptions.fatalErrorFunction = fatalErrorFunction;
editableListOptions.fatalErrorFunction = fatalErrorFunction;

// Run tests

QUnit.test( "events update form test", function( assert ) {

    options = formOptions;
    resetCounters();
    var done = assert.async();
    
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
                testHelper.checkRecord( assert, key, fieldBuilder.filterValues( record, options.fields ) );
            
                // Go to edit form
                testHelper.clickUpdateListButton( key );
            
                assert.deepEqual( 
                    counters,  
                    {
                        formClosed: 0,
                        formCreated: 1,
                        formSubmitting: 0,
                        recordAdded: 0,
                        recordDeleted: 0,
                        recordUpdated: 0,
                        selectionChanged: 0
                    });
            
                // Edit record
                var editedRecord =  {
                    "name": "Service " + key + " edited",
                    "description": "Service " + key + " description",
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
                testHelper.checkRecord( assert, key, fieldBuilder.filterValues( newRecord, options.fields ) );
                assert.deepEqual( 
                    counters,  
                    {
                        formClosed: 1,
                        formCreated: 1,
                        formSubmitting: 1,
                        recordAdded: 0,
                        recordDeleted: 0,
                        recordUpdated: 1,
                        selectionChanged: 0
                    });
            
                // Go to edit form again and check record
                testHelper.clickUpdateListButton( key );
                testHelper.checkForm( assert, newRecord );
                assert.deepEqual( 
                    counters,  
                    {
                        formClosed: 1,
                        formCreated: 2,
                        formSubmitting: 1,
                        recordAdded: 0,
                        recordDeleted: 0,
                        recordUpdated: 1,
                        selectionChanged: 0
                    });
            
                done();
        }
    );
});

QUnit.test( "events create form test", function( assert ) {

    options = formOptions;
    resetCounters();
    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            
            testUtils.resetServices();
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

            // Go to create form and create record
            testHelper.clickCreateListButton();
            assert.deepEqual( 
                counters,  
                {
                    formClosed: 0,
                    formCreated: 1,
                    formSubmitting: 0,
                    recordAdded: 0,
                    recordDeleted: 0,
                    recordUpdated: 0,
                    selectionChanged: 0
                });
            testHelper.fillForm( record );
            testHelper.checkForm( assert, record );

            // Submit and show the list again
            testHelper.clickFormSubmitButton();
            testHelper.checkRecord( assert, key, fieldBuilder.filterValues( record, options.fields ) );
            assert.deepEqual( 
                counters,  
                {
                    formClosed: 1,
                    formCreated: 1,
                    formSubmitting: 1,
                    recordAdded: 1,
                    recordDeleted: 0,
                    recordUpdated: 0,
                    selectionChanged: 0
                });
            
            // Go to edit form again and check record
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, record );
            assert.deepEqual( 
                counters,  
                {
                    formClosed: 1,
                    formCreated: 2,
                    formSubmitting: 1,
                    recordAdded: 1,
                    recordDeleted: 0,
                    recordUpdated: 0,
                    selectionChanged: 0
                });
            
            done();
        }
    );
});

QUnit.test( "event delete form test", function( assert ) {

    options = formOptions;
    resetCounters();
    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            
            testUtils.resetServices();
            $( '#departmentsContainer' ).zcrud( 'load' );

            // Assert register with key 2 is OK
            var key = 3;
            var expectedRecord =  {
                "name": "Service " + key,
                "id": "" + key
            };
            testHelper.checkRecord( assert, key, expectedRecord );

            // Go to delete form and cancel
            testHelper.clickDeleteListButton( key );
            assert.deepEqual( 
                counters,  
                {
                    formClosed: 0,
                    formCreated: 1,
                    formSubmitting: 0,
                    recordAdded: 0,
                    recordDeleted: 0,
                    recordUpdated: 0,
                    selectionChanged: 0
                });
            testHelper.clickFormCancelButton();
            assert.deepEqual( 
                counters,  
                {
                    formClosed: 1,
                    formCreated: 1,
                    formSubmitting: 0,
                    recordAdded: 0,
                    recordDeleted: 0,
                    recordUpdated: 0,
                    selectionChanged: 0
                });
            testHelper.checkRecord( assert, key, expectedRecord );

            // Go to delete form and delete record
            testHelper.clickDeleteListButton( key );
            assert.deepEqual( 
                counters,  
                {
                    formClosed: 1,
                    formCreated: 2,
                    formSubmitting: 0,
                    recordAdded: 0,
                    recordDeleted: 0,
                    recordUpdated: 0,
                    selectionChanged: 0
                });
            testHelper.clickFormSubmitButton();
            assert.deepEqual( 
                counters,  
                {
                    formClosed: 2,
                    formCreated: 2,
                    formSubmitting: 1,
                    recordAdded: 0,
                    recordDeleted: 1,
                    recordUpdated: 0,
                    selectionChanged: 0
                });
            testHelper.checkNoRecord( assert, key );

            done();
        }
    );
});

QUnit.test( "event update editable list test", function( assert ) {

    options = editableListOptions;
    resetCounters();
    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices();
            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );

            var editable = true;

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                "id": "" + key,
                "name": "Service " + key
            };
            testHelper.checkRecord( assert, key, record, editable );

            // Edit record
            var editedRecord =  {
                "name": "Service " + key + " edited",
                "number": "3"
            };
            testHelper.fillEditableList( editedRecord, key );
            var newRecord = $.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );

            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );
            assert.deepEqual( 
                counters,  
                {
                    formClosed: 0,
                    formCreated: 0,
                    formSubmitting: 1,
                    recordAdded: 0,
                    recordDeleted: 0,
                    recordUpdated: 1,
                    selectionChanged: 0
                });
            testHelper.checkRecord( assert, key, newRecord, editable );

            done();
        }
    );
});

QUnit.test( "event create editable list test", function( assert ) {
    
    options = editableListOptions;
    resetCounters();
    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices();
            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );

            var editable = true;

            // Assert register with key 0 doesn't exist
            var key = 0;
            var newRecord =  {
                "id": "" + key,
                "name": "Service " + key
            };
            testHelper.checkNoRecord( assert, key, newRecord, editable );

            testHelper.clickCreateRowListButton();
            testHelper.fillNewRowEditableList( newRecord );

            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );
            assert.deepEqual( 
                counters,  
                {
                    formClosed: 0,
                    formCreated: 0,
                    formSubmitting: 1,
                    recordAdded: 1,
                    recordDeleted: 0,
                    recordUpdated: 0,
                    selectionChanged: 0
                });
            testHelper.checkRecord( assert, key, newRecord, editable, true );

            done();
        }
    );
});

QUnit.test( "event delete editable list test", function( assert ) {
    
    options = editableListOptions;
    resetCounters();
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices();
            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );

            var editable = true;

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                "id": "" + key,
                "name": "Service " + key
            };
            testHelper.checkRecord( assert, key, record, editable );
            
            // Delete record
            testHelper.clickDeleteRowListButton( key );

            // Save
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );
            assert.deepEqual( 
                counters,  
                {
                    formClosed: 0,
                    formCreated: 0,
                    formSubmitting: 1,
                    recordAdded: 0,
                    recordDeleted: 1,
                    recordUpdated: 0,
                    selectionChanged: 0
                });
            testHelper.checkNoRecord( assert, key );

            done();
        }
    );
});

QUnit.test( "events update with failed validation form test", function( assert ) {

    options = $.extend( true, {}, formOptions );
    options.events.formSubmitting = function ( data, event ) {
        eventFunction( 'formSubmitting', data, event );
        return false;
    };
    resetCounters();
    var done = assert.async();

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
            testHelper.checkRecord( assert, key, fieldBuilder.filterValues( record, options.fields ) );

            // Go to edit form
            testHelper.clickUpdateListButton( key );
            assert.deepEqual( 
                counters,  
                {
                    formClosed: 0,
                    formCreated: 1,
                    formSubmitting: 0,
                    recordAdded: 0,
                    recordDeleted: 0,
                    recordUpdated: 0,
                    selectionChanged: 0
                });

            // Try to edit record but 
            var editedRecord =  {
                "name": "Service " + key + " edited",
                "description": "Service " + key + " description",
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
            
            // Try to submit, but validation must be false
            testHelper.clickFormSubmitButton();
            assert.deepEqual( testUtils.getService( key ), record );
            assert.deepEqual( 
                counters,  
                {
                    formClosed: 0,
                    formCreated: 1,
                    formSubmitting: 1,
                    recordAdded: 0,
                    recordDeleted: 0,
                    recordUpdated: 0,
                    selectionChanged: 0
                });
            
            // Click cancel and check record
            testHelper.clickFormCancelButton();
            testHelper.checkRecord( assert, key, fieldBuilder.filterValues( record, options.fields ) );

            done();
        }
    );
});

QUnit.test( "selectionChanged event test", function( assert ) {

    var thisTestOptions = {
        pages: {
            list: {
                components: {
                    selecting: {
                        isOn: true,
                        multiple: true,
                        mode: [ 'checkbox', 'onRowClick' ] // Options are checkbox and onRowClick
                    }
                }
            }
        }
    };
    options = $.extend( true, {}, formOptions, thisTestOptions );
    resetCounters();
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices();
            $( '#departmentsContainer' ).zcrud( 'load' );
            
            var $tbody = $( '#zcrud-list-tbody-department' );
            var select = function(){
                for ( var c = 0; c < arguments.length; c++ ){
                    var id = arguments[ c ];
                    $tbody.find( "[data-record-key='" + id + "'] input.zcrud-select-row" ).trigger( 'click' );
                }
            };
            
            // Select 2
            select( '2' );
            assert.deepEqual( 
                counters,  
                {
                    formClosed: 0,
                    formCreated: 0,
                    formSubmitting: 0,
                    recordAdded: 0,
                    recordDeleted: 0,
                    recordUpdated: 0,
                    selectionChanged: 1
                });
            
            // Select 3, 5 and 7
            select( '3', '5', '7' );
            assert.deepEqual( 
                counters,  
                {
                    formClosed: 0,
                    formCreated: 0,
                    formSubmitting: 0,
                    recordAdded: 0,
                    recordDeleted: 0,
                    recordUpdated: 0,
                    selectionChanged: 4
                });
            
            // Unselect 2 and 7
            select( '2', '7' );
            assert.deepEqual( 
                counters,  
                {
                    formClosed: 0,
                    formCreated: 0,
                    formSubmitting: 0,
                    recordAdded: 0,
                    recordDeleted: 0,
                    recordUpdated: 0,
                    selectionChanged: 6
                });
            done();
        }
    );
});

