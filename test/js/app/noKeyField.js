"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var Qunit = require( 'qunit' );
var testHelper = require( './testHelper.js' );
var testUtils = require( './testUtils.js' );

var formTestOptions = require( './noKeyFieldTestOptions.js' );
var editableListTestOptions = require( './noKeyField-editableListTestOptions.js' );
var subformTestOptions = require( './noKeyField-subformTestOptions.js' );

var errorFunctionCounter = 0;
editableListTestOptions.errorFunction = function( message ){
    ++errorFunctionCounter;
};

// Run tests
QUnit.test( "create form test", function( assert ) {

    var done = assert.async();
    var options = formTestOptions;
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            
            testUtils.resetServices( undefined, true );
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 130 not exists
            var key = 130;
            var record =  {
                "name": "Service " + key,
                "description": "Service " + key + " description",
                "phoneType": "officePhone_option",
                "province": "Málaga",
                "city": "Marbella",
                "browser": "Firefox",
                "important": true
            };

            // Check
            var values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 10 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 129',
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
            });
            
            // Go to create form and create it
            testHelper.clickCreateListButton();
            testHelper.fillForm( record );
            testHelper.checkForm( assert, record );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();
            values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 121, 130 ) );
            
            testHelper.pagingTest({
                action: { 
                    lastPage: true 
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 121-130 of 130',
                names: values[ 1 ],
                pageListNotActive: [ '13', '>', '>>' ],
                pageListActive: [ '<<', '<', '1', '9', '10', '11', '12' ]
            });
            
            var fullRecord = $.extend( true, {}, record );
            fullRecord.id = "" + key;
            testHelper.checkRecordInList( assert, key, fullRecord, false, true );
            assert.deepEqual( testUtils.getService( key ), fullRecord );
            
            done();
        }
    );
});

QUnit.test( "update form test", function( assert ) {

    var done = assert.async();
    var options = formTestOptions;
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices( undefined, true );
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 2 not exists
            var key = 2;
            var record =  {
                "name": "Service " + key + " edited",
                "description": "Service " + key + " description edited",
                "phoneType": "officePhone_option",
                "province": "Málaga",
                "city": "Marbella",
                "browser": "Firefox",
                "important": true
            };

            // Check
            var values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 10 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 129',
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
            });

            // Go to update form and update it
            testHelper.clickUpdateListButton( key );
            testHelper.fillForm( record );
            testHelper.checkForm( assert, record );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 129',
                names: "Service 1/Service 2 edited/Service 3/Service 4/Service 5/Service 6/Service 7/Service 8/Service 9/Service 10",
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
            });
            
            var fullRecord = $.extend( true, {}, record );
            fullRecord.id = "" + key;
            testHelper.checkRecordInList( assert, key, fullRecord, false, true );
            assert.deepEqual( testUtils.getService( key ), fullRecord );
            
            done();
        }
    );
});

QUnit.test( "delete form test", function( assert ) {

    var done = assert.async();
    var options = formTestOptions;
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices( undefined, true );
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "description": "Service " + key + " description"
            };
            assert.deepEqual( testUtils.getService( key ), record );
            
            // Check
            var values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 10 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 129',
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
            });
            
            // Go to delete form and delete it
            testHelper.clickDeleteListButton( key );
            testHelper.clickFormSubmitButton();
            
            values = testHelper.buildCustomValuesList( 1, testHelper.buildValuesList( 3, 11 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 128',
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
            });
            
            testHelper.checkNoRecord( assert, key );
            
            done();
        }
    );
});

QUnit.test( "editable list create test", function( assert ) {

    var done = assert.async();
    var options = editableListTestOptions;
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices( undefined, true );
            errorFunctionCounter = 0;
            
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;

            // Assert register with key 130 doesn't exist
            var key = 130;
            testHelper.checkNoRecord( assert, key );
            
            var values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 10 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 129',
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ],
                editable: editable
            });
            
            testHelper.clickCreateRowListButton();
            var record =  {
                "name": "Service " + key,
                "description": "Service " + key + " description"
            };
            testHelper.fillNewRowEditableList( record );
            
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );
            
            var fullRecord = $.extend( true, {}, record );
            fullRecord.id = "" + key;
            testHelper.checkRecord( assert, key, fullRecord, editable, true );
            
            values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 121, 130 ) );
            testHelper.pagingTest({
                action: { 
                    lastPage: true 
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 121-130 of 130',
                names: values[ 1 ],
                pageListNotActive: [ '13', '>', '>>' ],
                pageListActive: [ '<<', '<', '1', '9', '10', '11', '12' ],
                editable: editable
            });
            
            values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 10 ) );
            testHelper.pagingTest({
                action: { 
                    firstPage: true
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 130',
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ],
                editable: editable
            });

            done();
        }
    );
});

QUnit.test( "editable list update test", function( assert ) {

    var done = assert.async();
    var options = editableListTestOptions;

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices( undefined, true );
            errorFunctionCounter = 0;

            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "description": "Service " + key + " description"
            };
            testHelper.checkRecord( assert, key, record, editable, true );
            var values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 10 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 129',
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ],
                editable: editable
            });
            
            var editedRecord = {
                "name": "Service " + key + " edited",
                "description": "Service " + key + " description edited"
            };
            testHelper.fillEditableList( editedRecord, key );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );
            
            var fullEditedRecord = $.extend( true, {}, editedRecord );
            fullEditedRecord.id = "" + key;
            testHelper.checkRecord( assert, key, fullEditedRecord, editable, true );

            values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 10 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 129',
                names: 'Service 1/Service 2 edited/Service 3/Service 4/Service 5/Service 6/Service 7/Service 8/Service 9/Service 10',
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ],
                editable: editable
            });

            done();
        }
    );
});

QUnit.test( "editable list delete test", function( assert ) {

    var done = assert.async();
    var options = editableListTestOptions;

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices( undefined, true );
            errorFunctionCounter = 0;

            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "description": "Service " + key + " description"
            };
            testHelper.checkRecord( assert, key, record, editable, true );
            var values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 10 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 129',
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ],
                editable: editable
            });
            // Delete record
            testHelper.clickDeleteRowListButton( key );

            // Save
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkNoRecord( assert, key );
            
            values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 10 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 9,
                pagingInfo: 'Showing 1-9 of 128',
                names: 'Service 1/Service 3/Service 4/Service 5/Service 6/Service 7/Service 8/Service 9/Service 10',
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ],
                editable: editable
            });

            done();
        }
    );
});

QUnit.test( "create subform test", function( assert ) {

    var done = assert.async();
    var options = subformTestOptions;

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices( undefined, true );

            // Setup register
            var key = 2;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "description": "Service " + key + " description",
                "phoneType": "officePhone_option",
                "province": "Málaga",
                "city": "Marbella",
                "browser": "Firefox",
                "important": true,
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
            
            // Check
            var values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 10 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 129',
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
            });

            // Go to edit form and edit record
            testHelper.clickUpdateListButton( key );
            
            // Add subform record 3
            var subformRecord3 = {
                "name": "Homer Simpson",
                "description": "Description of Homer Simpson"
            };
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillSubformNewRow( subformRecord3, 'members' );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();
            
            // Check storage
            var editedRecord = $.extend( true, {}, record );
            subformRecord3.code = "3";
            editedRecord.members.push( subformRecord3 );
            assert.deepEqual( testUtils.getService( key ), editedRecord );
            
            // Go to edit form again and check the form again
            delete editedRecord.id;
            delete editedRecord.members[ 0 ].code;
            delete editedRecord.members[ 1 ].code;
            delete editedRecord.members[ 2 ].code;
            
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, editedRecord );
            
            done();
        }
    );
});

QUnit.test( "update subform test", function( assert ) {

    var done = assert.async();
    var options = subformTestOptions;

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices( undefined, true );

            // Setup register
            var key = 2;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "description": "Service " + key + " description",
                "phoneType": "officePhone_option",
                "province": "Málaga",
                "city": "Marbella",
                "browser": "Firefox",
                "important": true,
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

            // Submit
            testHelper.clickFormSubmitButton();

            // Check storage
            var newRecord =  {
                "id": "" + key,
                "name": "Service " + key + " edited",
                "description": "Service " + key + " description",
                "phoneType": "officePhone_option",
                "province": "Málaga",
                "city": "Marbella",
                "browser": "Firefox",
                "important": true,
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
            assert.deepEqual( testUtils.getService( key ), newRecord );

            done();
        }
    );
});

QUnit.test( "delete subform test", function( assert ) {

    var done = assert.async();
    var options = subformTestOptions;

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices( undefined, true );

            // Setup register
            var key = 2;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "description": "Service " + key + " description",
                "phoneType": "officePhone_option",
                "province": "Málaga",
                "city": "Marbella",
                "browser": "Firefox",
                "important": true,
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
            
            // Delete row 2 of members
            var subformIndexToDelete = 0;
            testHelper.clickDeleteSubformRowButton( 'members', subformIndexToDelete );

            // Submit
            testHelper.clickFormSubmitButton();

            // Check storage
            var newRecord =  {
                "id": "" + key,
                "name": "Service " + key,
                "description": "Service " + key + " description",
                "phoneType": "officePhone_option",
                "province": "Málaga",
                "city": "Marbella",
                "browser": "Firefox",
                "important": true,
                "members": [
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        "description": "Description of Lisa Simpson"
                    }
                ]
            };
            assert.deepEqual( testUtils.getService( key ), newRecord );

            done();
        }
    );
});

QUnit.test( "create form and subform test", function( assert ) {

    var done = assert.async();
    var options = subformTestOptions;

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices( undefined, true );

            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Setup register
            var record =  {
                "name": "Service no key",
                "description": "Service description",
                "phoneType": "officePhone_option",
                "province": "Málaga",
                "city": "Marbella",
                "browser": "Firefox",
                "important": true,
                "members": []
            };
            
            // Check
            var values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 10 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 129',
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
            });

            // Go to create form and create record
            testHelper.clickCreateListButton();
            testHelper.fillForm( record );
            
            // Add subform record 1
            var subformRecord1 = {
                "name": "Bart Simpson",
                "description": "Description of Bart Simpson"
            };
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillSubformNewRow( subformRecord1, 'members' );

            // Add subform record 2
            var subformRecord2 = {
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
            
            // Submit
            testHelper.clickFormSubmitButton();
            
            // Check storage
            var fullRecord = $.extend( true, {}, editedRecord );
            var key = "130";
            fullRecord.id = key;
            fullRecord.members[ 0 ].code = "1";
            fullRecord.members[ 1 ].code = "2";
            assert.deepEqual( testUtils.getService( key ), fullRecord );
            
            // Go to edit form again and check the form again
            testHelper.goToLastPage( options );
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, editedRecord )

            done();
        }
    );
});
