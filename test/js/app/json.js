"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var Qunit = require( 'qunit' );
var testHelper = require( './testHelper.js' );
var testUtils = require( './testUtils.js' );

var subformTestOptions = require( './subformTestOptions.js' );
var editableListTestOptions = require( './editableListTestOptions.js' );
var options = undefined;

var onlyChangesJSONBuilder = require( '../../../js/app/jsonBuilders/onlyChangesJSONBuilder.js' );
var allJSONBuilder = require( '../../../js/app/jsonBuilders/allJSONBuilder.js' );

var errorFunctionCounter = 0;
subformTestOptions.errorFunction = function( message ){
    ++errorFunctionCounter;
};
editableListTestOptions.errorFunction = function( message ){
    ++errorFunctionCounter;
};

// Run tests
QUnit.test( "form update test (JSONBuilder: onlyChangesJSONBuilder)", function( assert ) {

    var done = assert.async();
    options = $.extend( true, {}, subformTestOptions );
    options.jsonBuilder = onlyChangesJSONBuilder;
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            
            // Set service with key 4
            var key = 4;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "description": "Description " + key,
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
            testUtils.reset();
            testUtils.setService( key, record );
            
            $( '#departmentsContainer' ).zcrud( 'renderList' );
            
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
                "description": "Description " + key,
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
            
            // Check JSON
            var jsonObject = testUtils.getJSONUpdate( 0 );
            var expectedExistingRecords = {
                "4": {
                    "name": "Service 4 edited",
                    "membersZCrudRecords": {
                        "existingRecords": {
                            "1": {
                                "description": "Description of Bart Simpson edited"
                            },
                            "2": {
                                "description": "Description of Lisa Simpson edited",
                                "name": "Lisa Simpson edited"
                            }
                        },
                        "newRecords": [],
                        "recordsToRemove": []
                    }
                }
            };
            var expectedNewRecords = [];
            var expectedRecordsToRemove = [];

            assert.deepEqual( jsonObject.existingRecords, expectedExistingRecords );
            assert.deepEqual( jsonObject.newRecords, expectedNewRecords );
            assert.deepEqual( jsonObject.recordsToRemove, expectedRecordsToRemove );
            
            // Check storage
            assert.deepEqual( testUtils.getService( key ), newRecord );
            
            // Go to edit form again and check the form again
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, newRecord );
            
            done();
        }
    );
});

QUnit.test( "form update test (JSONBuilder: allJSONBuilder)", function( assert ) {

    var done = assert.async();
    options = $.extend( true, {}, subformTestOptions );
    options.jsonBuilder = allJSONBuilder;

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // Set service with key 4
            var key = 4;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "description": "Description " + key,
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
            testUtils.reset();
            testUtils.setService( key, record );

            $( '#departmentsContainer' ).zcrud( 'renderList' );

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
                "description": "Description " + key,
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

            // Check JSON
            var jsonObject = testUtils.getJSONUpdate( 0 );
            var expectedExistingRecords = {
                "4": {
                    "id": "4",
                    "name": "Service 4 edited",
                    "description": "Description 4",
                    "membersZCrudRecords": {
                        "existingRecords": {
                            "1": {
                                "code": "1",
                                "description": "Description of Bart Simpson edited",
                                "name": "Bart Simpson"
                            },
                            "2": {
                                "code": "2",
                                "description": "Description of Lisa Simpson edited",
                                "name": "Lisa Simpson edited"
                            }
                        },
                        "newRecords": [],
                        "recordsToRemove": []
                    }
                }
            };
            var expectedNewRecords = [];
            var expectedRecordsToRemove = [];

            assert.deepEqual( jsonObject.existingRecords, expectedExistingRecords );
            assert.deepEqual( jsonObject.newRecords, expectedNewRecords );
            assert.deepEqual( jsonObject.recordsToRemove, expectedRecordsToRemove );
            
            // Check storage
            assert.deepEqual( testUtils.getService( key ), newRecord );

            // Go to edit form again and check the form again
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, newRecord );

            done();
        }
    );
});

QUnit.test( "subform create and form create test (JSONBuilder: onlyChangesJSONBuilder)", function( assert ) {

    var done = assert.async();
    
    options = $.extend( true, {}, subformTestOptions );
    options.jsonBuilder = onlyChangesJSONBuilder;
    delete options.fields[ 'province' ].defaultValue;
    
    testUtils.reset();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // 
            var key = 0;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "members": []
            };

            // Go to create form and create record
            testHelper.clickCreateListButton();
            testHelper.fillForm( record );

            // Add subform record 1
            var subformRecord1 = {
                "code": "1",
                "name": "Bart Simpson",
                "description": "Description of Bart Simpson"
            };
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillSubformNewRow( subformRecord1, 'members' );

            // Add subform record 2
            var subformRecord2 = {
                "code": "2",
                "name": "Lisa Simpson",
                "description": "Description of Lisa Simpson"
            }
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillSubformNewRow( subformRecord2, 'members' );

            // Build edited record and check form
            var editedRecord = $.extend( true, {}, record );
            editedRecord.members.push( subformRecord1 );
            editedRecord.members.push( subformRecord2 );
            testHelper.checkForm( assert, editedRecord );

            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check JSON
            var jsonObject = testUtils.getJSONUpdate( 0 );
            var expectedExistingRecords = {};
            var expectedNewRecords = [
                {
                    "id": "0",
                    "name": "Service 0",
                    "membersZCrudRecords": {
                        "existingRecords": {},
                        "newRecords": [
                            {
                                "code": "1",
                                "description": "Description of Bart Simpson",
                                "name": "Bart Simpson"
                            },
                            {
                                "code": "2",
                                "description": "Description of Lisa Simpson",
                                "name": "Lisa Simpson"
                            }
                        ],
                        "recordsToRemove": []
                    }
                }
            ];
            var expectedRecordsToRemove = [];

            assert.deepEqual( jsonObject.existingRecords, expectedExistingRecords );
            assert.deepEqual( jsonObject.newRecords, expectedNewRecords );
            assert.deepEqual( jsonObject.recordsToRemove, expectedRecordsToRemove );
            
            // Check storage
            assert.deepEqual( testUtils.getService( key ), editedRecord );

            // Go to edit form again and check the form again
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, editedRecord );

            done();
        }
    );
});

QUnit.test( "subform create and form create test (JSONBuilder: allJSONBuilder)", function( assert ) {

    var done = assert.async();
    
    options = $.extend( true, {}, subformTestOptions );
    options.jsonBuilder = allJSONBuilder;
    delete options.fields[ 'province' ].defaultValue;
    
    testUtils.reset();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // 
            var key = 0;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "members": []
            };

            // Go to create form and create record
            testHelper.clickCreateListButton();
            testHelper.fillForm( record );

            // Add subform record 1
            var subformRecord1 = {
                "code": "1",
                "name": "Bart Simpson",
                "description": "Description of Bart Simpson"
            };
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillSubformNewRow( subformRecord1, 'members' );

            // Add subform record 2
            var subformRecord2 = {
                "code": "2",
                "name": "Lisa Simpson",
                "description": "Description of Lisa Simpson"
            }
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillSubformNewRow( subformRecord2, 'members' );

            // Build edited record and check form
            var editedRecord = $.extend( true, {}, record );
            editedRecord.members.push( subformRecord1 );
            editedRecord.members.push( subformRecord2 );
            testHelper.checkForm( assert, editedRecord );

            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check JSON
            var jsonObject = testUtils.getJSONUpdate( 0 );
            var expectedExistingRecords = {};
            var expectedNewRecords = [
                {
                    "id": "0",
                    "name": "Service 0",
                    "membersZCrudRecords": {
                        "existingRecords": {},
                        "newRecords": [
                            {
                                "code": "1",
                                "description": "Description of Bart Simpson",
                                "name": "Bart Simpson"
                            },
                            {
                                "code": "2",
                                "description": "Description of Lisa Simpson",
                                "name": "Lisa Simpson"
                            }
                        ],
                        "recordsToRemove": []
                    }
                }
            ];
            var expectedRecordsToRemove = [];

            assert.deepEqual( jsonObject.existingRecords, expectedExistingRecords );
            assert.deepEqual( jsonObject.newRecords, expectedNewRecords );
            assert.deepEqual( jsonObject.recordsToRemove, expectedRecordsToRemove );

            // Check storage
            assert.deepEqual( testUtils.getService( key ), editedRecord );

            // Go to edit form again and check the form again
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, editedRecord );

            done();
        }
    );
});

QUnit.test( "form delete test (JSONBuilder: onlyChangesJSONBuilder)", function( assert ) {

    var done = assert.async();
    options = $.extend( true, {}, subformTestOptions );
    options.jsonBuilder = onlyChangesJSONBuilder;

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // Set service with key 4
            var key = 4;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "description": "Description " + key,
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
            testUtils.reset();
            testUtils.setService( key, record );

            $( '#departmentsContainer' ).zcrud( 'renderList' );
            
            // Go to delete form and delete record
            testHelper.clickDeleteListButton( key );
            testHelper.clickFormSubmitButton();

            // Check JSON
            var jsonObject = testUtils.getJSONUpdate( 0 );
            var expectedExistingRecords = {};
            var expectedNewRecords = [];
            var expectedRecordsToRemove = [ "4" ];

            assert.deepEqual( jsonObject.existingRecords, expectedExistingRecords );
            assert.deepEqual( jsonObject.newRecords, expectedNewRecords );
            assert.deepEqual( jsonObject.recordsToRemove, expectedRecordsToRemove );

            // Check storage
            assert.deepEqual( testUtils.getService( key ), undefined );

            done();
        }
    );
});

QUnit.test( "form delete test (JSONBuilder: allJSONBuilder)", function( assert ) {

    var done = assert.async();
    options = $.extend( true, {}, subformTestOptions );
    options.jsonBuilder = allJSONBuilder;

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // Set service with key 4
            var key = 4;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "description": "Description " + key,
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
            testUtils.reset();
            testUtils.setService( key, record );

            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to delete form and delete record
            testHelper.clickDeleteListButton( key );
            testHelper.clickFormSubmitButton();

            // Check JSON
            var jsonObject = testUtils.getJSONUpdate( 0 );
            var expectedExistingRecords = {};
            var expectedNewRecords = [];
            var expectedRecordsToRemove = [ "4" ];

            assert.deepEqual( jsonObject.existingRecords, expectedExistingRecords );
            assert.deepEqual( jsonObject.newRecords, expectedNewRecords );
            assert.deepEqual( jsonObject.recordsToRemove, expectedRecordsToRemove );

            // Check storage
            assert.deepEqual( testUtils.getService( key ), undefined );

            done();
        }
    );
});

QUnit.test( "editable list update (JSONBuilder: onlyChangesJSONBuilder) test", function( assert ) {

    var done = assert.async();
    
    options = $.extend( true, {}, editableListTestOptions );
    options.jsonBuilder = onlyChangesJSONBuilder;
    
    testUtils.reset();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            $( '#departmentsContainer' ).zcrud( 'renderList' );

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
                "name": "Service 2 edited",
                "number": "3"
            };
            testHelper.fillEditableList( editedRecord, key );
            var newRecord = $.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );
            
            // Save changes
            testHelper.clickEditableListSubmitButton();
            testHelper.checkRecord( assert, key, newRecord, editable );
            
            // Check JSON
            var jsonObject = testUtils.getJSONUpdate( 0 );
            var expectedExistingRecords = {
                "2": {
                    "name": "Service 2 edited",
                    "number": "3"
                }
            };
            var expectedNewRecords = [];
            var expectedRecordsToRemove = [];

            assert.deepEqual( jsonObject.existingRecords, expectedExistingRecords );
            assert.deepEqual( jsonObject.newRecords, expectedNewRecords );
            assert.deepEqual( jsonObject.recordsToRemove, expectedRecordsToRemove );
            
            done();
        }
    );
});

QUnit.test( "editable list update (JSONBuilder: allJSONBuilder) test", function( assert ) {

    var done = assert.async();
    options = $.extend( true, {}, editableListTestOptions );
    options.jsonBuilder = allJSONBuilder;

    testUtils.reset();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            $( '#departmentsContainer' ).zcrud( 'renderList' );

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
                "name": "Service 2 edited",
                "number": "3"
            };
            testHelper.fillEditableList( editedRecord, key );
            var newRecord = $.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );

            // Save changes
            testHelper.clickEditableListSubmitButton();
            testHelper.checkRecord( assert, key, newRecord, editable );

            // Check JSON
            var jsonObject = testUtils.getJSONUpdate( 0 );
            var expectedExistingRecords = {
                "2": {
                    "id": "2",
                    "name": "Service 2 edited",
                    "number": "3"
                }
            };
            var expectedNewRecords = [];
            var expectedRecordsToRemove = [];

            assert.deepEqual( jsonObject.existingRecords, expectedExistingRecords );
            assert.deepEqual( jsonObject.newRecords, expectedNewRecords );
            assert.deepEqual( jsonObject.recordsToRemove, expectedRecordsToRemove );

            done();
        }
    );
});

QUnit.test( "editable list create (JSONBuilder: onlyChangesJSONBuilder) test", function( assert ) {

    var done = assert.async();
    
    options = $.extend( true, {}, editableListTestOptions );
    options.jsonBuilder = onlyChangesJSONBuilder;

    testUtils.reset();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;

            // Assert register with key 0 doesn't exist
            var key = 0;
            var newRecord =  {
                "id": "" + key,
                "name": "Service " + key
            };
            testHelper.checkNoRecord( assert, key );

            // Create row, fill it and save changes
            testHelper.clickCreateRowListButton();
            testHelper.fillNewRowEditableList( newRecord );
            testHelper.clickEditableListSubmitButton();

            testHelper.checkRecord( assert, key, newRecord, editable, true );
            
            // Check JSON
            var jsonObject = testUtils.getJSONUpdate( 0 );
            var expectedExistingRecords = {};
            var expectedNewRecords = [
                {
                    "id": "0",
                    "name": "Service 0"
                }
            ];
            var expectedRecordsToRemove = [];

            assert.deepEqual( jsonObject.existingRecords, expectedExistingRecords );
            assert.deepEqual( jsonObject.newRecords, expectedNewRecords );
            assert.deepEqual( jsonObject.recordsToRemove, expectedRecordsToRemove );


            done();
        }
    );
});

QUnit.test( "editable list create (JSONBuilder: allJSONBuilder) test", function( assert ) {

    var done = assert.async();

    options = $.extend( true, {}, editableListTestOptions );
    options.jsonBuilder = allJSONBuilder;

    testUtils.reset();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;

            // Assert register with key 0 doesn't exist
            var key = 0;
            var newRecord =  {
                "id": "" + key,
                "name": "Service " + key
            };
            testHelper.checkNoRecord( assert, key );

            // Create row, fill it and save changes
            testHelper.clickCreateRowListButton();
            testHelper.fillNewRowEditableList( newRecord );
            testHelper.clickEditableListSubmitButton();

            testHelper.checkRecord( assert, key, newRecord, editable, true );

            // Check JSON
            var jsonObject = testUtils.getJSONUpdate( 0 );
            var expectedExistingRecords = {};
            var expectedNewRecords = [
                {
                    "id": "0",
                    "name": "Service 0"
                }
            ];
            var expectedRecordsToRemove = [];

            assert.deepEqual( jsonObject.existingRecords, expectedExistingRecords );
            assert.deepEqual( jsonObject.newRecords, expectedNewRecords );
            assert.deepEqual( jsonObject.recordsToRemove, expectedRecordsToRemove );

            done();
        }
    );
});

QUnit.test( "editable list delete 3 rows (JSONBuilder: onlyChangesJSONBuilder) test", function( assert ) {

    var done = assert.async();

    options = $.extend( true, {}, editableListTestOptions );
    options.jsonBuilder = onlyChangesJSONBuilder;

    testUtils.reset();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            $( '#departmentsContainer' ).zcrud( 'renderList' );
            
            // Delete records
            var key1 = 3;
            testHelper.clickDeleteRowListButton( key1 );
            var key2 = 5;
            testHelper.clickDeleteRowListButton( key2 );
            var key3 = 7;
            testHelper.clickDeleteRowListButton( key3 );
            
            // Save
            testHelper.clickEditableListSubmitButton();

            testHelper.checkNoRecord( assert, key1 );
            testHelper.checkNoRecord( assert, key2 );
            testHelper.checkNoRecord( assert, key3 );
            
            // Check JSON
            var jsonObject = testUtils.getJSONUpdate( 0 );
            var expectedExistingRecords = {};
            var expectedNewRecords = [];
            var expectedRecordsToRemove = [ "3", "5", "7" ];

            assert.deepEqual( jsonObject.existingRecords, expectedExistingRecords );
            assert.deepEqual( jsonObject.newRecords, expectedNewRecords );
            assert.deepEqual( jsonObject.recordsToRemove, expectedRecordsToRemove );
            
            done();
        }
    );
});

QUnit.test( "editable list delete 3 rows (JSONBuilder: allJSONBuilder) test", function( assert ) {

    var done = assert.async();

    options = $.extend( true, {}, editableListTestOptions );
    options.jsonBuilder = allJSONBuilder;

    testUtils.reset();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Delete records
            var key1 = 3;
            testHelper.clickDeleteRowListButton( key1 );
            var key2 = 5;
            testHelper.clickDeleteRowListButton( key2 );
            var key3 = 7;
            testHelper.clickDeleteRowListButton( key3 );

            // Save
            testHelper.clickEditableListSubmitButton();

            testHelper.checkNoRecord( assert, key1 );
            testHelper.checkNoRecord( assert, key2 );
            testHelper.checkNoRecord( assert, key3 );

            // Check JSON
            var jsonObject = testUtils.getJSONUpdate( 0 );
            var expectedExistingRecords = {};
            var expectedNewRecords = [];
            var expectedRecordsToRemove = [ "3", "5", "7" ];

            assert.deepEqual( jsonObject.existingRecords, expectedExistingRecords );
            assert.deepEqual( jsonObject.newRecords, expectedNewRecords );
            assert.deepEqual( jsonObject.recordsToRemove, expectedRecordsToRemove );

            done();
        }
    );
});

QUnit.test( "editable list update and delete (JSONBuilder: onlyChangesJSONBuilder) test", function( assert ) {

    var done = assert.async();

    options = $.extend( true, {}, editableListTestOptions );
    options.jsonBuilder = onlyChangesJSONBuilder;

    testUtils.reset();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            $( '#departmentsContainer' ).zcrud( 'renderList' );
            
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
                "name": "Service 2 edited",
                "number": "3"
            };
            testHelper.fillEditableList( editedRecord, key );
            var newRecord = $.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );

            // Delete records
            var key1 = 2;
            testHelper.clickDeleteRowListButton( key1 );

            // Save
            testHelper.clickEditableListSubmitButton();
            testHelper.checkNoRecord( assert, key1 );

            // Check JSON
            var jsonObject = testUtils.getJSONUpdate( 0 );
            var expectedExistingRecords = {};
            var expectedNewRecords = [];
            var expectedRecordsToRemove = [ "2" ];

            assert.deepEqual( jsonObject.existingRecords, expectedExistingRecords );
            assert.deepEqual( jsonObject.newRecords, expectedNewRecords );
            assert.deepEqual( jsonObject.recordsToRemove, expectedRecordsToRemove );
            
            done();
        }
    );
});

QUnit.test( "editable list create, 2 changes and delete (JSONBuilder: onlyChangesJSONBuilder) test", function( assert ) {

    var done = assert.async();

    options = $.extend( true, {}, editableListTestOptions );
    options.jsonBuilder = onlyChangesJSONBuilder;

    testUtils.reset();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            $( '#departmentsContainer' ).zcrud( 'renderList' );

            errorFunctionCounter = 0;
            
            // Assert register with key 0 doesn't exist
            var key = 0;
            var newRecord =  {
                "id": "" + key,
                "name": "Service " + key
            };
            testHelper.checkNoRecord( assert, key );

            // Create row, fill it and save changes
            testHelper.clickCreateRowListButton();
            testHelper.fillNewRowEditableList( newRecord );
            
            // Delete record
            testHelper.clickLastDeleteRowListButton();

            // Submit 
            // A 'No operation to do!' warning would be shown if errorFunction would not be overwritten
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 1 );
            testHelper.checkNoRecord( assert, key );

            done();
        }
    );
});

QUnit.test( "subform update and delete test", function( assert ) {

    var done = assert.async();

    options = $.extend( true, {}, subformTestOptions );
    options.jsonBuilder = onlyChangesJSONBuilder;
    delete options.fields[ 'province' ].defaultValue;
    
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

            $( '#departmentsContainer' ).zcrud( 'renderList' );

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
            
            // Delete subform record
            testHelper.clickDeleteSubformRowButton( 'members', 0 );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();
            
            // Check JSON
            var jsonObject = testUtils.getJSONUpdate( 0 );
            var expectedExistingRecords = {
                "4": {
                    "membersZCrudRecords": {
                        "existingRecords": {
                            "2": {
                                "description": "Description of Lisa Simpson edited",
                                "name": "Lisa Simpson edited"
                            }
                        },
                        "newRecords": [],
                        "recordsToRemove": [
                            "1"
                        ]
                    },
                    "name": "Service 4 edited"
                }
            };
            var expectedNewRecords = [];
            var expectedRecordsToRemove = [];

            assert.deepEqual( jsonObject.existingRecords, expectedExistingRecords );
            assert.deepEqual( jsonObject.newRecords, expectedNewRecords );
            assert.deepEqual( jsonObject.recordsToRemove, expectedRecordsToRemove );
            
            // Check storage
            newRecord.members = [ newRecord.members[1] ];
            assert.deepEqual( testUtils.getService( key ), newRecord );
            
            // Go to edit form again and check the form again
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, newRecord );

            done();
        }
    );
});

QUnit.test( "subform create and delete test", function( assert ) {

    var done = assert.async();

    options = $.extend( true, {}, subformTestOptions );
    options.jsonBuilder = onlyChangesJSONBuilder;
    delete options.fields[ 'province' ].defaultValue;

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
                        "name": "Lisa Simpson",
                        "description": "Description of Lisa Simpson"
                    }
                ]
            };
            testUtils.setService( key, record );

            $( '#departmentsContainer' ).zcrud( 'renderList' );
            
            errorFunctionCounter = 0;
            
            // Go to edit form and edit record
            testHelper.clickUpdateListButton( key );
            
            // Add subform record 1
            var subformRecord1 = {
                "code": "2",
                "name": "Bart Simpson",
                "description": "Description of Bart Simpson"
            };
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillSubformNewRow( subformRecord1, 'members' );

            // Build edited record and check form
            var editedRecord = $.extend( true, {}, record );
            editedRecord.members.push( subformRecord1 );
            testHelper.checkForm( assert, editedRecord );

            // Delete subform record
            testHelper.clickDeleteSubformRowButton( 'members', 1 );
            
            // Submit 
            // A 'No operation to do!' warning would be shown if errorFunction would not be overwritten
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 1 );

            done();
        }
    );
});
