"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var Qunit = require( 'qunit' );
var testHelper = require( './testHelper.js' );
var testServerSide = require( './testServerSide.js' );

var defaultTestOptions = require( './editableListTestOptions.js' );
var thisTestOptions = {};
var options = $.extend( true, {}, defaultTestOptions, thisTestOptions );

var errorFunctionCounter = 0;

options.errorFunction = function( message ){
    ++errorFunctionCounter;
};

// Run tests
QUnit.test( "create/delete rows without changes test", function( assert ) {
    
    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            var pagingTest = function( assert ){

                var editable = true;
                var values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 10 ) );
                testHelper.pagingTest({
                    options: options,
                    assert: assert,
                    visibleRows: 10,
                    pagingInfo: 'Showing 1-10 of 129',
                    ids:  values[ 0 ],
                    names: values[ 1 ],
                    pageListNotActive: [ '<<', '<', '1' ],
                    pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ],
                    editable: editable
                });
            };

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            pagingTest( assert );
            
            testHelper.clickCreateRowListButton();
            testHelper.assertHistory( assert, 1, 0, false );
            
            testHelper.clickLastDeleteRowListButton();
            testHelper.assertHistory( assert, 2, 0, false );

            pagingTest( assert );

            testHelper.clickUndoButton();
            testHelper.assertHistory( assert, 1, 1, false );

            testHelper.clickUndoButton();
            testHelper.assertHistory( assert, 0, 2, false );

            pagingTest( assert );

            testHelper.clickRedoButton();
            testHelper.assertHistory( assert, 1, 1, false );

            testHelper.clickRedoButton();
            testHelper.assertHistory( assert, 2, 0, false );

            pagingTest( assert );
            
            done();
        }
    );
});

QUnit.test( "Edit one row and delete another test", function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            errorFunctionCounter = 0;
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

            // Assert register with key 3 exists
            var key2 = 3;
            var record2 =  {
                "id": "" + key2,
                "name": "Service " + key2
            };
            testHelper.checkRecord( assert, key2, record2, editable );
            
            // Delete record
            testHelper.clickDeleteRowListButton( key2 );
            
            // Submit
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            // Check records
            testHelper.checkRecord( assert, key, newRecord, editable );
            testHelper.checkNoRecord( assert, key2 );
            
            // Check form
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 9,
                pagingInfo: 'Showing 1-9 of 128',
                ids: "1/2/4/5/6/7/8/9/10",
                names: "Service 1/Service 2 edited/Service 4/Service 5/Service 6/Service 7/Service 8/Service 9/Service 10",
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ],
                editable: editable
            });
            
            done();
        }
    );
});

QUnit.test( "Edit one row and create another test", function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            errorFunctionCounter = 0;
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

            // Assert register with key 3 exists
            var key2 = 0;
            var record2 =  {
                "id": "" + key2,
                "name": "Service " + key2
            };
            testHelper.checkNoRecord( assert, key2 );

            // Create record
            testHelper.clickCreateRowListButton();
            testHelper.fillNewRowEditableList( record2 );
            
            // Submit
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            // Check records
            testHelper.checkRecord( assert, key, newRecord, editable, true );
            testHelper.checkRecord( assert, key2, record2, editable, true );
            
            // Check form
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 11,
                pagingInfo: 'Showing 1-11 of 130',
                ids: "1/2/3/4/5/6/7/8/9/10/0",
                names: "Service 1/Service 2 edited/Service 3/Service 4/Service 5/Service 6/Service 7/Service 8/Service 9/Service 10/Service 0",
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ],
                editable: editable
            });

            done();
        }
    );
});

QUnit.test( "Create one row and delete another test", function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;

            // Assert register with key 3 exists
            var key = 0;
            var record =  {
                "id": "" + key,
                "name": "Service " + key
            };
            testHelper.checkNoRecord( assert, key );

            // Create record
            testHelper.clickCreateRowListButton();
            testHelper.fillNewRowEditableList( record );

            // Assert register with key 3 exists
            var key2 = 3;
            var record2 =  {
                "id": "" + key2,
                "name": "Service " + key2
            };
            testHelper.checkRecord( assert, key2, record2, editable );

            // Delete record
            testHelper.clickDeleteRowListButton( key2 );
            
            // Submit
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            // Check records
            testHelper.checkRecord( assert, key, record, editable, true );
            testHelper.checkNoRecord( assert, key2 );

            // Check form
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 129',
                ids: "1/2/4/5/6/7/8/9/10/0",
                names: "Service 1/Service 2/Service 4/Service 5/Service 6/Service 7/Service 8/Service 9/Service 10/Service 0",
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ],
                editable: editable
            });

            done();
        }
    );
});

QUnit.test( "Edit one row, create another and delete another test", function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            errorFunctionCounter = 0;
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

            // Assert register with key 3 exists
            var key2 = 0;
            var record2 =  {
                "id": "" + key2,
                "name": "Service " + key2
            };
            testHelper.checkNoRecord( assert, key2 );

            // Create record
            testHelper.clickCreateRowListButton();
            testHelper.fillNewRowEditableList( record2 );
            
            // Assert register with key 3 exists
            var key3 = 5;
            var record3 =  {
                "id": "" + key3,
                "name": "Service " + key3
            };
            testHelper.checkRecord( assert, key3, record3, editable );

            // Delete record
            testHelper.clickDeleteRowListButton( key3 );
            
            // Submit
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );
            
            // Check records
            testHelper.checkRecord( assert, key, newRecord, editable, true );
            testHelper.checkRecord( assert, key2, record2, editable, true );
            testHelper.checkNoRecord( assert, key3 );
            
            // Check form
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 129',
                ids: "1/2/3/4/6/7/8/9/10/0",
                names: "Service 1/Service 2 edited/Service 3/Service 4/Service 6/Service 7/Service 8/Service 9/Service 10/Service 0",
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ],
                editable: editable
            });

            done();
        }
    );
});
