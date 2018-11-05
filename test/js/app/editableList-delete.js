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

var errorFunctionCounter = 0;

options.errorFunction = function( message ){
    ++errorFunctionCounter;
};

// Run tests
QUnit.test( "delete test", function( assert ) {

    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices();
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

            // Delete record
            testHelper.clickDeleteRowListButton( key );

            // Save
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkNoRecord( assert, key );
            
            done();
        }
    );
});

QUnit.test( "delete 3 rows test", function( assert ) {

    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            
            testUtils.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Delete records
            var key1 = 3;
            testHelper.clickDeleteRowListButton( key1 );
            var key2 = 5;
            testHelper.clickDeleteRowListButton( key2 );
            var key3 = 7;
            testHelper.clickDeleteRowListButton( key3 );

            // Save
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkNoRecord( assert, key1 );
            testHelper.checkNoRecord( assert, key2 );
            testHelper.checkNoRecord( assert, key3 );
            
            done();
        }
    );
});

QUnit.test( "delete undo/redo 1 action test", function( assert ) {

    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            
            testUtils.resetServices();
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

            // Delete record
            testHelper.clickDeleteRowListButton( key );

            // Undo
            testHelper.clickUndoButton();
            testHelper.checkRecord( assert, key, record, editable );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkEditableListForm( assert, key, record );
            testHelper.assertHistory( assert, 1, 0, true );

            // Save
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkNoRecord( assert, key );
            
            done();
        }
    );
});

QUnit.test( "delete undo/redo 3 actions test", function( assert ) {

    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            
            testUtils.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;

            // Delete records
            var key1 = 3;
            var record1 =  {
                "id": "" + key1,
                "name": "Service " + key1
            };
            testHelper.clickDeleteRowListButton( key1 );
            var key2 = 5;
            var record2 =  {
                "id": "" + key2,
                "name": "Service " + key2
            };
            testHelper.clickDeleteRowListButton( key2 );
            var key3 = 7;
            var record3 =  {
                "id": "" + key3,
                "name": "Service " + key3
            };
            testHelper.clickDeleteRowListButton( key3 );

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
            testHelper.checkEditableListForm( assert, key1, record1 );
            testHelper.assertHistory( assert, 1, 2, true );

            // Redo (2)
            testHelper.clickRedoButton();
            testHelper.checkEditableListForm( assert, key2, record2 );
            testHelper.assertHistory( assert, 2, 1, true );

            // Redo (3)
            testHelper.clickRedoButton();
            testHelper.checkEditableListForm( assert, key3, record3 );
            testHelper.assertHistory( assert, 3, 0, true );

            // Save
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkNoRecord( assert, key1 );
            testHelper.checkNoRecord( assert, key2 );
            testHelper.checkNoRecord( assert, key3 );
            
            done();
        }
    );
});
