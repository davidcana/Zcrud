"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var fieldBuilder = require( '../../../js/app/fields/fieldBuilder.js' );
var Qunit = require( 'qunit' );
var testHelper = require( './testHelper.js' );
var testUtils = require( './testUtils.js' );
var context = require( '../../../js/app/context.js' );
var datetimeFieldManager = require( '../../../js/app/fields/datetimeFieldManager.js' );

var defaultTestOptions = require( './editableListAllFieldsTestOptions.js' );
var thisTestOptions = {};
var options = $.extend( true, {}, defaultTestOptions, thisTestOptions );

var fatalErrorFunctionCounter = 0;

options.fatalErrorFunction = function( message ){
    ++fatalErrorFunctionCounter;
};

// Run tests

QUnit.test( "create text area test", function( assert ) {

    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            
            var varName = 'description';
            context.updateListVisibleFields( options, [ 'id', 'name', varName ] );

            testUtils.resetServices();
            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );

            var editable = true;
            
            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                "id": "" + key,
                "name": "Service " + key
            };
            var record2 = $.extend( true, {}, record );
            record2[ varName ] = "Service " + key + " description";
            testHelper.checkNoRecord( assert, key, record2, editable );

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

            // Create record
            testHelper.clickCreateRowListButton();
            testHelper.fillNewRowEditableList( record2 );
            testHelper.assertHistory( assert, 4, 0, false );
            
            // Undo
            testHelper.clickUndoButton();
            testHelper.checkEditableListLastRow( assert, record );
            testHelper.assertHistory( assert, 3, 1, false );
            
            // Redo
            testHelper.clickRedoButton();
            testHelper.checkEditableListLastRow( assert, record2 );
            testHelper.assertHistory( assert, 4, 0, true );
            
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );

            assert.deepEqual( testUtils.getService( key ), record2 );
            
            done();
        }
    );
});

QUnit.test( "create datetime test", function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){


            var varName = 'datetime';
            context.updateListVisibleFields( options, [ 'id', 'name', varName ] );

            testUtils.resetServices();
            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );

            var editable = true;

            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                "id": "" + key,
                "name": "Service " + key
            };
            var record2 = $.extend( true, {}, record );
            record2[ varName ] = new Date( "2017-09-10T20:00:00.000Z" );
            testHelper.checkNoRecord( assert, key, record2, editable );

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
            
            // Create record
            var clientRecord = $.extend( true, {}, record2 );
            clientRecord[ varName ] = datetimeFieldManager.formatToClient(
                options.fields[ varName ],
                clientRecord[ varName ] );
            testHelper.clickCreateRowListButton();
            testHelper.fillNewRowEditableList( clientRecord );
            testHelper.assertHistory( assert, 4, 0, false );
            
            // Undo
            testHelper.clickUndoButton();
            testHelper.checkEditableListLastRow( assert, record );
            testHelper.assertHistory( assert, 3, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkEditableListLastRow( assert, clientRecord );
            testHelper.assertHistory( assert, 4, 0, true );

            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );

            assert.deepEqual( testUtils.getService( key ), record2 );

            done();
        }
    );
});

QUnit.test( "create datetime using picker test", function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){


            var varName = 'datetime';
            context.updateListVisibleFields( options, [ 'id', 'name', varName ] );

            testUtils.resetServices();
            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );

            var editable = true;

            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                "id": "" + key,
                "name": "Service " + key
            };
            var record2 = $.extend( true, {}, record );
            record2[ varName ] = new Date( "2017-09-10T20:00:00.000Z" );
            testHelper.checkNoRecord( assert, key, record2, editable );

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
            
            // Create record
            var clientRecord = $.extend( true, {}, record );
            var varValue = datetimeFieldManager.formatToClient(
                options.fields[ varName ],
                record2[ varName ] );
            testHelper.clickCreateRowListButton();
            testHelper.fillNewRowEditableList( clientRecord );
            testHelper.updateLastRowDatetimePickerInList( 
                varName, 
                options.fields[ varName ], 
                varValue );
            testHelper.assertHistory( assert, 4, 0, false );
            
            // Undo
            testHelper.clickUndoButton();
            testHelper.checkEditableListLastRow( assert, record );
            testHelper.assertHistory( assert, 3, 1, false );
            
            // Redo
            testHelper.clickRedoButton();
            testHelper.checkEditableListLastRow( assert, clientRecord );
            testHelper.assertHistory( assert, 4, 0, true );
            
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );

            assert.deepEqual( testUtils.getService( key ), record2 );

            done();
        }
    );
});

QUnit.test( "create inline datetime using picker test", function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            var varName = 'datetime';
            context.updateListVisibleFields( options, [ 'id', 'name', varName ] );
            options.fields[ varName ].customOptions.inline = true;
            
            testUtils.resetServices();
            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );

            var editable = true;

            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                "id": "" + key,
                "name": "Service " + key
            };
            var record2 = $.extend( true, {}, record );
            record2[ varName ] = new Date( "2017-09-10T03:10:00.000" );
            testHelper.checkNoRecord( assert, key, record2, editable );

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
            
            // Create record
            var clientRecord = $.extend( true, {}, record );
            var varValue = datetimeFieldManager.formatToClient(
                options.fields[ varName ],
                record2[ varName ] );
            testHelper.clickCreateRowListButton();
            testHelper.fillNewRowEditableList( clientRecord );
            testHelper.updateLastRowDatetimePickerInList( 
                varName, 
                options.fields[ varName ], 
                varValue );
            testHelper.assertHistory( assert, 9, 0, false );
            
            // Undo
            testHelper.clickUndoButton( 6 );
            testHelper.checkEditableListLastRow( assert, record );
            testHelper.assertHistory( assert, 3, 6, false );
            
            // Redo
            testHelper.clickRedoButton( 6 );
            testHelper.checkEditableListLastRow( assert, clientRecord );
            testHelper.assertHistory( assert, 9, 0, true );
            
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );

            assert.deepEqual( testUtils.getService( key ), record2 );

            done();
        }
    );
});

QUnit.test( "create date test", function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){


            var varName = 'date';
            context.updateListVisibleFields( options, [ 'id', 'name', varName ] );

            testUtils.resetServices();
            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );

            var editable = true;

            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                "id": "" + key,
                "name": "Service " + key
            };
            var record2 = $.extend( true, {}, record );
            record2[ varName ] = new Date( "2017-09-10T00:00:00.000" );
            testHelper.checkNoRecord( assert, key, record2, editable );

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

            // Create record
            var clientRecord = $.extend( true, {}, record2 );
            clientRecord[ varName ] = datetimeFieldManager.formatToClient(
                options.fields[ varName ],
                clientRecord[ varName ] );
            testHelper.clickCreateRowListButton();
            testHelper.fillNewRowEditableList( clientRecord );
            testHelper.assertHistory( assert, 4, 0, false );

            // Undo
            testHelper.clickUndoButton();
            testHelper.checkEditableListLastRow( assert, record );
            testHelper.assertHistory( assert, 3, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkEditableListLastRow( assert, clientRecord );
            testHelper.assertHistory( assert, 4, 0, true );

            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );

            assert.deepEqual( testUtils.getService( key ), record2 );

            done();
        }
    );
});

QUnit.test( "create date using picker test", function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){


            var varName = 'date';
            context.updateListVisibleFields( options, [ 'id', 'name', varName ] );

            testUtils.resetServices();
            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );

            var editable = true;

            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                "id": "" + key,
                "name": "Service " + key
            };
            var record2 = $.extend( true, {}, record );
            record2[ varName ] = new Date( "2017-09-10T00:00:00.000" );
            testHelper.checkNoRecord( assert, key, record2, editable );

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

            // Create record
            var clientRecord = $.extend( true, {}, record );
            var varValue = datetimeFieldManager.formatToClient(
                options.fields[ varName ],
                record2[ varName ] );
            testHelper.clickCreateRowListButton();
            testHelper.fillNewRowEditableList( clientRecord );
            testHelper.updateLastRowDatetimePickerInList( 
                varName, 
                options.fields[ varName ], 
                varValue );
            testHelper.assertHistory( assert, 4, 0, false );
            
            // Undo
            testHelper.clickUndoButton();
            testHelper.checkEditableListLastRow( assert, record );
            testHelper.assertHistory( assert, 3, 1, false );
            
            // Redo
            testHelper.clickRedoButton();
            testHelper.checkEditableListLastRow( assert, clientRecord );
            testHelper.assertHistory( assert, 4, 0, true );
            
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );
            
            assert.deepEqual( testUtils.getService( key ), record2 );

            done();
        }
    );
});

QUnit.test( "create inline date using picker test", function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            var varName = 'date';
            context.updateListVisibleFields( options, [ 'id', 'name', varName ] );
            options.fields[ varName ].customOptions.inline = true;

            testUtils.resetServices();
            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );

            var editable = true;

            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                "id": "" + key,
                "name": "Service " + key
            };
            var record2 = $.extend( true, {}, record );
            record2[ varName ] = new Date( "2017-09-10T00:00:00.000" );
            testHelper.checkNoRecord( assert, key, record2, editable );

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

            // Create record
            var clientRecord = $.extend( true, {}, record );
            var varValue = datetimeFieldManager.formatToClient(
                options.fields[ varName ],
                record2[ varName ] );
            testHelper.clickCreateRowListButton();
            testHelper.fillNewRowEditableList( clientRecord );
            
            testHelper.updateLastRowDatetimePickerInList( 
                varName, 
                options.fields[ varName ], 
                varValue );
            
            testHelper.assertHistory( assert, 4, 0, false );
            
            // Undo
            testHelper.clickUndoButton();
            testHelper.checkEditableListLastRow( assert, record );
            testHelper.assertHistory( assert, 3, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkEditableListLastRow( assert, clientRecord );
            testHelper.assertHistory( assert, 4, 0, true );

            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );

            assert.deepEqual( testUtils.getService( key ), record2 );

            done();
        }
    );
});

/*
QUnit.test( "update time test", function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            var varName = 'date';
            context.updateListVisibleFields( options, [ 'id', 'name', varName ] );

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
            var editedRecord = {};
            editedRecord[ varName ] = "10/12/2017";
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

QUnit.test( "update time using picker test", function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            var varName = 'date';
            context.updateListVisibleFields( options, [ 'id', 'name', varName ] );

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
            var editedRecord = {};
            editedRecord[ varName ] = "10/12/2017";
            testHelper.updateDatetimePickerInList( 
                key, 
                varName, 
                options.fields[ varName ], 
                editedRecord[ varName ] );
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

QUnit.test( "update inline time using picker test", function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            var varName = 'time';
            context.updateListVisibleFields( options, [ 'id', 'name', varName ] );
            options.fields[ varName ].customOptions.inline = true;
            
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
            var editedRecord = {};
            editedRecord[ varName ] = "02:10";
            testHelper.updateDatetimePickerInList( 
                key, 
                varName, 
                options.fields[ varName ], 
                editedRecord[ varName ] );
            var newRecord = $.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );
            
            // Undo
            testHelper.clickUndoButton( 4 );
            testHelper.checkEditableListForm( assert, key, record, editable );
            testHelper.assertHistory( assert, 0, 4, false );

            // Redo
            testHelper.clickRedoButton( 4 );
            testHelper.checkEditableListForm( assert, key, newRecord );
            testHelper.assertHistory( assert, 4, 0, true );

            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, fieldBuilder.filterValues( newRecord, options.fields ), editable );

            done();
        }
    );
});

QUnit.test( "update checkbox test", function( assert ) {

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

QUnit.test( "update radio test", function( assert ) {

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

QUnit.test( "update 2 radios test", function( assert ) {

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

QUnit.test( "update select test", function( assert ) {

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
            //    testHelper.getSelectOptions( 'province', testHelper.get$row( key ) ) );
            assert.deepEqual(
                testHelper.getSelectOptions( 'province', testHelper.get$row( key ) ),
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

QUnit.test( "update 2 linked select test", function( assert ) {

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
                testHelper.getSelectOptions( 'city', testHelper.get$row( key ) ),
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
                testHelper.getSelectOptions( 'city', testHelper.get$row( key ) ),
                [ 'Estepona', 'Marbella' ] );

            var newRecord2 = $.extend( true, {}, newRecord, editedRecord2 );
            testHelper.checkEditableListForm( assert, key, newRecord2 );

            testHelper.assertHistory( assert, 2, 0, true );

            // Undo (1)
            testHelper.clickUndoButton();
            testHelper.checkEditableListForm( assert, key, newRecord, editable );
            testHelper.assertHistory( assert, 1, 1, true );
            assert.deepEqual(
                testHelper.getSelectOptions( 'city', testHelper.get$row( key ) ),
                [ 'Estepona', 'Marbella' ] );

            // Undo (2)
            testHelper.clickUndoButton();
            testHelper.checkEditableListForm( assert, key, record, editable );
            testHelper.assertHistory( assert, 0, 2, true );
            assert.deepEqual(
                testHelper.getSelectOptions( 'city', testHelper.get$row( key ) ),
                [ 'Algeciras', 'Estepona', 'Marbella', 'Tarifa' ] );

            // Redo (1)
            testHelper.clickRedoButton();
            testHelper.checkEditableListForm( assert, key, newRecord );
            testHelper.assertHistory( assert, 1, 1, true );
            assert.deepEqual(
                testHelper.getSelectOptions( 'city', testHelper.get$row( key ) ),
                [ 'Estepona', 'Marbella' ] );

            // Redo (2)
            testHelper.clickRedoButton();
            testHelper.checkEditableListForm( assert, key, newRecord2 );
            testHelper.assertHistory( assert, 2, 0, true );
            assert.deepEqual(
                testHelper.getSelectOptions( 'city', testHelper.get$row( key ) ),
                [ 'Estepona', 'Marbella' ] );

            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, newRecord2, editable );
            
            done();
        }
    );
});

QUnit.test( "update datalist test", function( assert ) {

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
*/