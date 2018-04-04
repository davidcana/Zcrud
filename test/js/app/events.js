"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var fieldBuilder = require( '../../../js/app/fields/fieldBuilder.js' );
var Qunit = require( 'qunit' );
var testHelper = require( './testHelper.js' );
var testUtils = require( './testUtils.js' );

var options = require( './defaultTestOptions.js' );

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
options.events.formClosed = function ( data, event ) {
    eventFunction( 'formClosed', data, event );
};
options.events.formCreated = function ( data ) {
    eventFunction( 'formCreated', data );
};
options.events.formSubmitting = function ( data, event ) {
    eventFunction( 'formSubmitting', data, event );
};
options.events.recordAdded = function ( data, event ) {
    eventFunction( 'recordAdded', data, event );
};
options.events.recordDeleted = function ( data, event ) {
    eventFunction( 'recordDeleted', data, event );
};
options.events.recordUpdated = function ( data, event ) {
    eventFunction( 'recordUpdated', data, event );
};
options.events.selectionChanged = function ( data, event ) {
    eventFunction( 'selectionChanged', data, event );
};

// Run tests
QUnit.test( "events update test", function( assert ) {

    var done = assert.async();
    resetCounters();
    
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

QUnit.test( "events create test", function( assert ) {

    var done = assert.async();
    resetCounters();
    
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

QUnit.test( "event delete test", function( assert ) {

    var done = assert.async();
    resetCounters();
    
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

