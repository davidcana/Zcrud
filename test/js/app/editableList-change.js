"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var Qunit = require( 'qunit' );
var testHelper = require( './testHelper.js' );
var testUtils = require( './testUtils.js' );

var defaultTestOptions = require( './editableListTestOptions.js' );
var thisTestOptions = {};
var options = $.extend( true, {}, defaultTestOptions, thisTestOptions );

var fatalErrorFunctionCounter = 0;

options.fatalErrorFunction = function( message ){
    ++fatalErrorFunctionCounter;
};

// Run tests        
QUnit.test( "change test", function( assert ) {

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

            // Edit record
            var editedRecord =  {
                "name": "Service 2 edited",
                "number": "3"
            };
            testHelper.fillEditableList( editedRecord, key );
            var newRecord = $.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );

            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, newRecord, editable );
            
            done();
        }
    );
});

QUnit.test( "change with errors test", function( assert ) {

    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices();
            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );

            var editable = true;

            // Assert register with key 5 exists
            var key = 5;
            var record =  {
                "id": "" + key,
                "name": "Service " + key
            };
            testHelper.checkRecord( assert, key, record, editable );
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

            // Edit record
            var editedRecord =  {
                "name": "Service 5 edited",
                "number": "a"
            };
            testHelper.fillEditableList( editedRecord, key );
            var newRecord = $.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );

            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 1 );

            testHelper.checkRecord( assert, key, record, editable, true );

            done();
        }
    );
});

QUnit.test( "change undo/redo 1 action test", function( assert ) {
    
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

            // Edit record
            var editedRecord =  {
                "name": "Service 2 edited"
            };
            testHelper.fillEditableList( editedRecord, key );
            var newRecord = $.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            // Undo
            testHelper.clickUndoButton();
            testHelper.checkRecord( assert, key, record, editable );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkEditableListForm( assert, key, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            // Save
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.assertHistory( assert, 0, 0, false );

            testHelper.checkRecord( assert, key, newRecord, editable );
            
            done();
        }
    );
});


QUnit.test( "change undo/redo 3 actions test", function( assert ) {
    
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
            var key1 = 2;
            var record1 =  {
                "id": "" + key1,
                "name": "Service " + key1
            };
            testHelper.checkRecord( assert, key1, record1, editable );
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

            // Edit record
            var editedRecord =  {
                "name": "Service " + key1 + " edited"
            };
            testHelper.fillEditableList( editedRecord, key1 );
            var newRecord1 = $.extend( true, {}, record1, editedRecord );
            testHelper.checkEditableListForm( assert, key1, newRecord1 );

            testHelper.assertHistory( assert, 1, 0, true );

            // Edit record (2)
            var key2 = 4;
            var record2 =  {
                "id": "" + key2,
                "name": "Service " + key2
            };
            var editedRecord2 =  {
                "name": "Service " + key2 + " edited"
            };
            testHelper.fillEditableList( editedRecord2, key2 );
            var newRecord2 = $.extend( true, {}, record2, editedRecord2 );
            testHelper.checkEditableListForm( assert, key2, newRecord2 );

            testHelper.assertHistory( assert, 2, 0, true );

            // Edit record (3)
            var key3 = 7;
            var record3 =  {
                "id": "" + key3,
                "name": "Service " + key3
            };
            var editedRecord3 =  {
                "name": "Service " + key3 + " edited"
            };
            testHelper.fillEditableList( editedRecord3, key3 );
            var newRecord3 = $.extend( true, {}, record3, editedRecord3 );
            testHelper.checkEditableListForm( assert, key3, newRecord3 );

            testHelper.assertHistory( assert, 3, 0, true );

            // Undo (1)
            testHelper.clickUndoButton();
            testHelper.checkRecord( assert, key3, record3, editable );
            testHelper.assertHistory( assert, 2, 1, true );

            // Undo (2)
            testHelper.clickUndoButton();
            testHelper.checkRecord( assert, key2, record2, editable );
            testHelper.assertHistory( assert, 1, 2, true );

            // Undo (3)
            testHelper.clickUndoButton();
            testHelper.checkRecord( assert, key1, record1, editable );
            testHelper.assertHistory( assert, 0, 3, false );

            // Redo (1)
            testHelper.clickRedoButton();
            testHelper.checkEditableListForm( assert, key1, newRecord1 );
            testHelper.assertHistory( assert, 1, 2, true );

            // Redo (2)
            testHelper.clickRedoButton();
            testHelper.checkEditableListForm( assert, key2, newRecord2 );
            testHelper.assertHistory( assert, 2, 1, true );

            // Redo (3)
            testHelper.clickRedoButton();
            testHelper.checkEditableListForm( assert, key3, newRecord3 );
            testHelper.assertHistory( assert, 3, 0, true );

            // Save
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.assertHistory( assert, 0, 0, false );

            testHelper.checkRecord( assert, key1, newRecord1, editable );
            testHelper.checkRecord( assert, key2, newRecord2, editable );
            testHelper.checkRecord( assert, key3, newRecord3, editable );
            
            done();
        }
    );
});

