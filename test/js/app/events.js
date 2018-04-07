"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var fieldBuilder = require( '../../../js/app/fields/fieldBuilder.js' );
var Qunit = require( 'qunit' );
var testHelper = require( './testHelper.js' );
var testUtils = require( './testUtils.js' );
var datetimeFieldManager = require( '../../../js/app/fields/datetimeFieldManager.js' );

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

var checkOpenCloseEvent = function( assert, data, $form, formType, options ){
    
    assert.ok( data.$form.is( $form ) );
    assert.equal( data.formType, formType );
    //alert( JSON.stringify( data.record ) );
    //assert.deepEqual(
    //    JSON.stringify( data.record ), 
    //    JSON.stringify( record ) );
    //assert.deepEqual( data.record, record );
    assert.deepEqual( data.options, options );
};

var checkFormSubmittingEvent = function( assert, data, $form, formType, dataToSend, options ){

    assert.ok( data.$form.is( $form ) );
    assert.equal( data.formType, formType );
    assert.deepEqual( data.dataToSend.command, dataToSend.command );
    //alert( JSON.stringify( data.dataToSend.existingRecords ) );
    //assert.deepEqual( 
    //    JSON.stringify( data.dataToSend.existingRecords ), 
    //    JSON.stringify( dataToSend.existingRecords ) );
    assert.deepEqual( data.dataToSend.existingRecords, dataToSend.existingRecords );
    //alert( JSON.stringify( data.dataToSend.newRecords ) );
    //assert.deepEqual( 
    //    JSON.stringify( data.dataToSend.newRecords ), 
    //    JSON.stringify( dataToSend.newRecords ) );
    assert.deepEqual( data.dataToSend.newRecords, dataToSend.newRecords );
    //alert( JSON.stringify( data.dataToSend.recordsToRemove ) );
    //assert.deepEqual(
    //    JSON.stringify( data.dataToSend.recordsToRemove ), 
    //    JSON.stringify( dataToSend.recordsToRemove ) );
    assert.deepEqual( data.dataToSend.recordsToRemove, dataToSend.recordsToRemove );
    assert.deepEqual( data.dataToSend.url, dataToSend.url );
    assert.deepEqual( data.options, options );
};

var checkRecordEvent = function( assert, data, record, serverResponse, options ){

    assert.deepEqual( data.record, record );
    //alert( JSON.stringify( data.serverResponse ) );
    //assert.equal( 
    //    JSON.stringify( data.serverResponse ), 
    //    JSON.stringify( serverResponse ) );
    assert.deepEqual( data.serverResponse, serverResponse );
    assert.deepEqual( data.options, options );
};

var checkSelectionChangedEvent = function( assert, data, $rows, record, options ){
    
    assert.ok( data.$rows.is( $rows ) );
    assert.deepEqual( data.record, record );
    assert.deepEqual( data.options, options );
};

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
                "name": "Service " + key,
                "id": "" + key
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
            
            checkOpenCloseEvent( 
                assert, 
                dataArray[0], 
                $( '#zcrud-form-department' ), 
                'update',  
                options );
            
            // Edit record
            var editedServerRecord = {
                "name": "Service " + key + " edited",
                "description": "Service " + key + " description",
                "date": new Date( '2017-10-02T00:00:00.000Z' ),
                "time": "18:50",
                "datetime": new Date( '2017-09-10T00:00:00.000Z' ),
                "phoneType": "officePhone_option",
                "province": "Málaga",
                "city": "Marbella",
                "browser": "Firefox",
                "important": true,
                "number": "3"
            };
            var editedClientRecord = $.extend( true, {}, editedServerRecord );
            editedClientRecord[ 'date' ] = datetimeFieldManager.formatToClient(
                options.fields[ 'date' ],
                editedClientRecord[ 'date' ] );
            editedClientRecord[ 'datetime' ] = datetimeFieldManager.formatToClient(
                options.fields[ 'datetime' ],
                editedClientRecord[ 'datetime' ] );
            testHelper.fillForm( editedClientRecord );

            var newClientRecord = $.extend( true, {}, record, editedClientRecord );
            testHelper.checkForm( assert, newClientRecord );
            
            // Submit and show the list again
            var $form = $( '#zcrud-form-department' );
            testHelper.clickFormSubmitButton();
            testHelper.checkRecord( assert, key, fieldBuilder.filterValues( newClientRecord, options.fields ) );
            
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
            
            var serverRecord2 = $.extend( true, {}, record, editedServerRecord );
            serverRecord2 = fieldBuilder.filterValues( serverRecord2, options.fields );
            
            // Correct date
            var rightDate = new Date( serverRecord2[ 'date' ] );
            rightDate.setHours( rightDate.getHours() - 2 );
            serverRecord2[ 'date' ] = rightDate;
            
            checkFormSubmittingEvent( 
                assert, 
                dataArray[1], 
                $form, 
                'update', 
                {
                    "command": "batchUpdate",
                    "existingRecords": {
                        "2": serverRecord2
                    },
                    "newRecords": [],
                    "recordsToRemove": [],
                    "url": "http://localhost:8080/cerbero/CRUDManager.do?cmd=BATCH_UPDATE&table=department"
                }, 
                options );
            checkRecordEvent( 
                assert, 
                dataArray[2], 
                serverRecord2, 
                {
                    "message":"",
                    "existingRecords":{
                        "2": serverRecord2
                    },
                    "newRecords":[],
                    "recordsToRemove":[],
                    "result":"OK"},  
                options );
            checkOpenCloseEvent( 
                assert, 
                dataArray[3], 
                $form, 
                'update', 
                options );
            
            // Go to edit form again and check record
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, newClientRecord );
            
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
            
            checkOpenCloseEvent( 
                assert, 
                dataArray[4], 
                $( '#zcrud-form-department' ), 
                'update', 
                options );
            
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
            var serverRecord =  {
                "id": "" + key,
                "name": "Service " + key,
                "description": "Service " + key + " description",
                "date": new Date( '2017-10-02T00:00:00.000Z' ),
                "time": "18:50",
                "datetime": new Date( '2017-09-10T00:00:00.000Z' ),
                "phoneType": "officePhone_option",
                "province": "Málaga",
                "city": "Marbella",
                "browser": "Firefox",
                "important": true,
                "number": "3"
            };
            var clientRecord = $.extend( true, {}, serverRecord );
            clientRecord[ 'date' ] = datetimeFieldManager.formatToClient(
                options.fields[ 'date' ],
                clientRecord[ 'date' ] );
            clientRecord[ 'datetime' ] = datetimeFieldManager.formatToClient(
                options.fields[ 'datetime' ],
                clientRecord[ 'datetime' ] );
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
            checkOpenCloseEvent( 
                assert, 
                dataArray[0], 
                $( '#zcrud-form-department' ), 
                'create', 
                options );
            testHelper.fillForm( clientRecord );
            testHelper.checkForm( assert, clientRecord );

            // Submit and show the list again
            var $form = $( '#zcrud-form-department' );
            testHelper.clickFormSubmitButton();
            testHelper.checkRecord( assert, key, fieldBuilder.filterValues( clientRecord, options.fields ) );
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
            
            var serverRecord2 = fieldBuilder.filterValues( serverRecord, options.fields );
            
            // Correct date
            var rightDate = new Date( serverRecord2[ 'date' ] );
            rightDate.setHours( rightDate.getHours() - 2 );
            serverRecord2[ 'date' ] = rightDate;
            
            checkFormSubmittingEvent( 
                assert, 
                dataArray[1], 
                $form, 
                'create', 
                {
                    "command": "batchUpdate",
                    "existingRecords": {},
                    "newRecords": [ serverRecord2 ],
                    "recordsToRemove": [],
                    "url": "http://localhost:8080/cerbero/CRUDManager.do?cmd=BATCH_UPDATE&table=department"
                }, 
                options );
            
            checkRecordEvent( 
                assert, 
                dataArray[2], 
                serverRecord2, 
                {
                    "message":"",
                    "existingRecords": {},
                    "newRecords": [ serverRecord2 ],
                    "recordsToRemove": [],
                    "result":"OK"
                },  
                options );
            
            checkOpenCloseEvent( 
                assert, 
                dataArray[3], 
                $form, 
                'create',  
                options );
            
            // Go to edit form again and check record
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, clientRecord );
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
            var $form = $( '#zcrud-form-department' );
            checkOpenCloseEvent( 
                assert, 
                dataArray[0], 
                $form, 
                'delete', 
                options );
            
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
            checkOpenCloseEvent( 
                assert, 
                dataArray[1],
                $form, 
                'delete', 
                options );
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
            $form = $( '#zcrud-form-department' );
            checkOpenCloseEvent( 
                assert, 
                dataArray[2],
                $form, 
                'delete', 
                options );
            
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
            
            checkFormSubmittingEvent( 
                assert, 
                dataArray[3], 
                $form, 
                'delete', 
                {
                    "command": "batchUpdate",
                    "existingRecords": {},
                    "newRecords": [],
                    "recordsToRemove": [ '' + key ],
                    "url": "http://localhost:8080/cerbero/CRUDManager.do?cmd=BATCH_UPDATE&table=department"
                }, 
                options );
            
            checkRecordEvent( 
                assert, 
                dataArray[4], 
                expectedRecord, 
                {
                    "message":"",
                    "existingRecords": {},
                    "newRecords": [],
                    "recordsToRemove": [ '' + key ],
                    "result":"OK"
                },  
                options );
            
            checkOpenCloseEvent( 
                assert, 
                dataArray[5],
                $form, 
                'delete', 
                options );
            
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
            var $form = $( '#zcrud-list-form-department' );
            checkFormSubmittingEvent( 
                assert, 
                dataArray[0], 
                $form, 
                'list', 
                {
                    "command": "batchUpdate",
                    "existingRecords": {
                        "2": editedRecord
                    },
                    "newRecords": [],
                    "recordsToRemove": [],
                    "url": "http://localhost:8080/cerbero/CRUDManager.do?cmd=BATCH_UPDATE&table=department"
                }, 
                options );
            checkRecordEvent( 
                assert, 
                dataArray[1], 
                newRecord, 
                {
                    "message":"",
                    "existingRecords":{
                        "2": newRecord
                    },
                    "newRecords":[],
                    "recordsToRemove":[],
                    "result":"OK"},  
                options );
            
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
            var $form = $( '#zcrud-list-form-department' );
            checkFormSubmittingEvent( 
                assert, 
                dataArray[0], 
                $form, 
                'list', 
                {
                    "command": "batchUpdate",
                    "existingRecords": {},
                    "newRecords": [ newRecord ],
                    "recordsToRemove": [],
                    "url": "http://localhost:8080/cerbero/CRUDManager.do?cmd=BATCH_UPDATE&table=department"
                }, 
                options );
            checkRecordEvent( 
                assert, 
                dataArray[1], 
                newRecord, 
                {
                    "message":"",
                    "existingRecords":{},
                    "newRecords":[ newRecord ],
                    "recordsToRemove":[],
                    "result":"OK"},  
                options );
            
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
            var $form = $( '#zcrud-list-form-department' );
            checkFormSubmittingEvent( 
                assert, 
                dataArray[0], 
                $form, 
                'list', 
                {
                    "command": "batchUpdate",
                    "existingRecords": {},
                    "newRecords": [],
                    "recordsToRemove": [ '' + key ],
                    "url": "http://localhost:8080/cerbero/CRUDManager.do?cmd=BATCH_UPDATE&table=department"
                }, 
                options );
            checkRecordEvent( 
                assert, 
                dataArray[1], 
                record, 
                {
                    "message":"",
                    "existingRecords":{},
                    "newRecords": [],
                    "recordsToRemove": [ '' + key ],
                    "result":"OK"},  
                options );
            
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
            checkOpenCloseEvent( 
                assert, 
                dataArray[0], 
                $( '#zcrud-form-department' ), 
                'update',  
                options );
            
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
            
            var $departmentsContainer = $( '#departmentsContainer' );
            var getSelected = function(){
                return $departmentsContainer.zcrud( 'selectedRecords' );
            };
            
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
            assert.deepEqual( 
                dataArray[0].records,
                [
                    {
                        'id': '2',
                        'name': 'Service 2' 
                    }
                ]);
            assert.ok(
                dataArray[0].$rows.is(
                    $tbody.find( "tr[data-record-key='2']" )));
            assert.deepEqual( dataArray[0].options, options );
            
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
            assert.deepEqual( 
                dataArray[3].records,
                [
                    {
                        'id': '2',
                        'name': 'Service 2' 
                    },
                    {
                        'id': '3',
                        'name': 'Service 3' 
                    },
                    {
                        'id': '5',
                        'name': 'Service 5' 
                    },
                    {
                        'id': '7',
                        'name': 'Service 7' 
                    }
                ]);
            //assert.ok(
            //    dataArray[3].$rows.is(
            //        $tbody.find( "tr[data-record-key='2'] tr[data-record-key='3'] tr[data-record-key='5'] tr[data-record-key='7']" )));
            assert.deepEqual( dataArray[3].options, options );
            
            // Unselect 2, 3 and 7
            select( '2', '3', '7' );
            assert.deepEqual( 
                counters,  
                {
                    formClosed: 0,
                    formCreated: 0,
                    formSubmitting: 0,
                    recordAdded: 0,
                    recordDeleted: 0,
                    recordUpdated: 0,
                    selectionChanged: 7
                });
            assert.deepEqual( 
                dataArray[6].records,
                [
                    {
                        'id': '5',
                        'name': 'Service 5' 
                    }
                ]);
            assert.ok(
                dataArray[6].$rows.is(
                    $tbody.find( "tr[data-record-key='5']" )));
            assert.deepEqual( dataArray[6].options, options );
                
            done();
        }
    );
});
