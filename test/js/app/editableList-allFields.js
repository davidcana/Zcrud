"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var fieldBuilder = require( '../../../js/app/fields/fieldBuilder.js' );
var Qunit = require( 'qunitjs' );
var testHelper = require( './testHelper.js' );
var testUtils = require( './testUtils.js' );
var context = require( '../../../js/app/context.js' );

var defaultTestOptions = require( './editableListAllFieldsTestOptions.js' );
var thisTestOptions = {};
var options = $.extend( true, {}, defaultTestOptions, thisTestOptions );

var fatalErrorFunctionCounter = 0;

options.fatalErrorFunction = function( message ){
    ++fatalErrorFunctionCounter;
};

// Run tests
QUnit.test( "change text area test", function( assert ) {

    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            context.updateListVisibleFields( options, [ 'id', 'name', 'description' ] );

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

            var values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 5 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 5,
                pagingInfo: 'Showing 1-5 of 129',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '26', '>', '>>' ],
                editable: editable
            });

            // Edit record
            var editedRecord =  {
                "description": "Service " + key + " description"
            };
            testHelper.fillEditableList( editedRecord, key );
            var newRecord = $.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );

            // Undo
            testHelper.clickUndoButton();
            testHelper.checkEditableListForm( assert, key, record, editable );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkEditableListForm( assert, key, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, newRecord, editable );
            
            done();
        }
    );
});

QUnit.test( "change datetime test", function( assert ) {

    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
    
            context.updateListVisibleFields( options, [ 'id', 'name', 'datetime' ] );

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
            testHelper.checkRecord( assert, key, fieldBuilder.filterValues( record, options.fields ), editable );
            
            var values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 5 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 5,
                pagingInfo: 'Showing 1-5 of 129',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '26', '>', '>>' ],
                editable: editable
            });
            
            // Edit record
            var editedRecord =  {
                "datetime": "10/12/2017 16:00"
            };
            testHelper.fillEditableList( editedRecord, key );
            var newRecord = $.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );
            
            // Undo
            testHelper.clickUndoButton();
            testHelper.checkEditableListForm( assert, key, record, editable );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkEditableListForm( assert, key, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );
            
            testHelper.checkRecord( assert, key, fieldBuilder.filterValues( newRecord, options.fields ), editable );
            
            done();
        }
    );
});

QUnit.test( "change checkbox test", function( assert ) {

    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
    
            context.updateListVisibleFields( options, [ 'id', 'name', 'important' ] );

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

            var values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 5 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 5,
                pagingInfo: 'Showing 1-5 of 129',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '26', '>', '>>' ],
                editable: editable
            });

            // Edit record
            var editedRecord =  {
                "important": true
            };
            testHelper.fillEditableList( editedRecord, key );
            var newRecord = $.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );

            // Undo
            testHelper.clickUndoButton();
            testHelper.checkEditableListForm( assert, key, record, editable );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkEditableListForm( assert, key, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, newRecord, editable );
            
            done();
        }
    );
});

QUnit.test( "change radio test", function( assert ) {

    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
    
            context.updateListVisibleFields( options, [ 'id', 'name', 'phoneType' ] );

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

            var values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 5 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 5,
                pagingInfo: 'Showing 1-5 of 129',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '26', '>', '>>' ],
                editable: editable
            });

            // Edit record
            var editedRecord =  {
                "phoneType": "officePhone_option"
            };
            testHelper.fillEditableList( editedRecord, key );
            var newRecord = $.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );

            // Undo
            testHelper.clickUndoButton();
            testHelper.checkEditableListForm( assert, key, record, editable );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkEditableListForm( assert, key, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, newRecord, editable );
            
            done();
        }
    );
});

QUnit.test( "change 2 radios test", function( assert ) {

    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
    
            context.updateListVisibleFields( options, [ 'id', 'name', 'phoneType' ] );

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

            var values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 5 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 5,
                pagingInfo: 'Showing 1-5 of 129',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '26', '>', '>>' ],
                editable: editable
            });

            // Edit record
            var editedRecord =  {
                "phoneType": "officePhone_option"
            };
            testHelper.fillEditableList( editedRecord, key );
            var newRecord = $.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );

            // Assert register with key 4 exists
            var key2 = 4;
            var record2 =  {
                "id": "" + key2,
                "name": "Service " + key2
            };
            testHelper.checkRecord( assert, key2, record2, editable );

            // Edit record 2
            var editedRecord2 =  {
                "phoneType": "cellPhone_option"
            };
            testHelper.fillEditableList( editedRecord2, key2 );
            var newRecord2 = $.extend( true, {}, record2, editedRecord2 );
            testHelper.checkEditableListForm( assert, key2, newRecord2 );

            // Undo (1)
            testHelper.clickUndoButton();
            testHelper.checkEditableListForm( assert, key2, record2, editable );
            testHelper.assertHistory( assert, 1, 1, true );

            // Undo (2)
            testHelper.clickUndoButton();
            testHelper.checkEditableListForm( assert, key, record, editable );
            testHelper.assertHistory( assert, 0, 2, false );

            // Redo (1)
            testHelper.clickRedoButton();
            testHelper.checkEditableListForm( assert, key, newRecord );
            testHelper.assertHistory( assert, 1, 1, true );

            // Redo (2)
            testHelper.clickRedoButton();
            testHelper.checkEditableListForm( assert, key2, newRecord2 );
            testHelper.assertHistory( assert, 2, 0, true ); 

            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, newRecord, editable );
            testHelper.checkRecord( assert, key2, newRecord2, editable );
            
            done();
        }
    );
});

QUnit.test( "change select test", function( assert ) {

    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
    
            context.updateListVisibleFields( options, [ 'id', 'name', 'province' ] );

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

            var values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 5 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 5,
                pagingInfo: 'Showing 1-5 of 129',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '26', '>', '>>' ],
                editable: editable
            });
            //alert(
            //    testHelper.getSelectOptions( 'province', testHelper.getRow( key ) ) );
            assert.deepEqual(
                testHelper.getSelectOptions( 'province', testHelper.getRow( key ) ),
                [ 'Cádiz', 'Málaga' ] );

            // Edit record
            var editedRecord =  {
                "province": "Málaga"
            };
            testHelper.fillEditableList( editedRecord, key );

            var newRecord = $.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );

            // Undo
            testHelper.clickUndoButton();
            testHelper.checkEditableListForm( assert, key, record, editable );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkEditableListForm( assert, key, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, newRecord, editable );
            
            done();
        }
    );
});
   
QUnit.test( "change 2 linked select test", function( assert ) {

    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
    
            context.updateListVisibleFields( options, [ 'id', 'name', 'province', 'city' ] );

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
            assert.deepEqual(
                testHelper.getSelectOptions( 'city', testHelper.getRow( key ) ),
                [ 'Algeciras', 'Estepona', 'Marbella', 'Tarifa' ] );

            var values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 5 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 5,
                pagingInfo: 'Showing 1-5 of 129',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '26', '>', '>>' ],
                editable: editable
            });

            // Edit record
            var editedRecord =  {
                "province": "Málaga"
            };
            testHelper.fillEditableList( editedRecord, key );

            var newRecord = $.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );

            var editedRecord2 =  {
                "city": "Marbella"
            };
            testHelper.fillEditableList( editedRecord2, key );
            assert.deepEqual(
                testHelper.getSelectOptions( 'city', testHelper.getRow( key ) ),
                [ 'Estepona', 'Marbella' ] );

            var newRecord2 = $.extend( true, {}, newRecord, editedRecord2 );
            testHelper.checkEditableListForm( assert, key, newRecord2 );

            testHelper.assertHistory( assert, 2, 0, true );

            // Undo (1)
            testHelper.clickUndoButton();
            testHelper.checkEditableListForm( assert, key, newRecord, editable );
            testHelper.assertHistory( assert, 1, 1, true );
            assert.deepEqual(
                testHelper.getSelectOptions( 'city', testHelper.getRow( key ) ),
                [ 'Estepona', 'Marbella' ] );

            // Undo (2)
            testHelper.clickUndoButton();
            testHelper.checkEditableListForm( assert, key, record, editable );
            testHelper.assertHistory( assert, 0, 2, true );
            assert.deepEqual(
                testHelper.getSelectOptions( 'city', testHelper.getRow( key ) ),
                [ 'Algeciras', 'Estepona', 'Marbella', 'Tarifa' ] );

            // Redo (1)
            testHelper.clickRedoButton();
            testHelper.checkEditableListForm( assert, key, newRecord );
            testHelper.assertHistory( assert, 1, 1, true );
            assert.deepEqual(
                testHelper.getSelectOptions( 'city', testHelper.getRow( key ) ),
                [ 'Estepona', 'Marbella' ] );

            // Redo (2)
            testHelper.clickRedoButton();
            testHelper.checkEditableListForm( assert, key, newRecord2 );
            testHelper.assertHistory( assert, 2, 0, true );
            assert.deepEqual(
                testHelper.getSelectOptions( 'city', testHelper.getRow( key ) ),
                [ 'Estepona', 'Marbella' ] );

            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, newRecord2, editable );
            
            done();
        }
    );
});

QUnit.test( "change datalist test", function( assert ) {

    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
    
            context.updateListVisibleFields( options, [ 'id', 'name', 'browser' ] );

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

            var values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 5 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 5,
                pagingInfo: 'Showing 1-5 of 129',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '26', '>', '>>' ],
                editable: editable
            });

            // Edit record
            var editedRecord =  {
                "browser": "Firefox"
            };
            testHelper.fillEditableList( editedRecord, key );
            var newRecord = $.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );

            // Undo
            testHelper.clickUndoButton();
            testHelper.checkEditableListForm( assert, key, record, editable );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkEditableListForm( assert, key, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, newRecord, editable );
            
            done();
        }
    );
});
