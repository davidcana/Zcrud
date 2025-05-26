'use strict';

//var $ = require( 'zzdom' );
//var zcrud = require( '../../../js/app/main.js' );
var zzDOM = require( '../../../js/app/zzDOMPlugin.js' );
var $ = zzDOM.zz;
var Qunit = require( 'qunit' );
var utils = require( '../../../js/app/utils.js' );
var testHelper = require( './testHelper.js' );
var testServerSide = require( './testServerSide.js' );
var context = require( '../../../js/app/context.js' );

var defaultTestOptions = require( './editableListAllFieldsTestOptions.js' );
var thisTestOptions = {};
var options = utils.extend( true, {}, defaultTestOptions, thisTestOptions );

var errorFunctionCounter = 0;

options.errorFunction = function( message ){
    ++errorFunctionCounter;
};

// Run tests
QUnit.test( 'update text area test', function( assert ) {

    var done = assert.async();
    var varName = 'description';
    testHelper.updateListVisibleFields( options, [ 'id', 'name', varName ] );
    
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
                'id': '' + key,
                'name': 'Service ' + key
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
            var editedRecord = {};
            editedRecord[ varName ] = 'Service ' + key + ' description';
            testHelper.fillEditableList( editedRecord, key );
            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );

            // Undo
            testHelper.clickUndoButton();
            testHelper.checkEditableListForm( assert, key, record, editable );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkEditableListForm( assert, key, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, newRecord, editable );
            
            done();
        }
    );
});

QUnit.test( 'update datetime test', function( assert ) {

    var done = assert.async();
    var varName = 'datetime';
    testHelper.updateListVisibleFields( options, [ 'id', 'name', varName ] );
    
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
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( record, options.fields ), editable );
            
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
            editedRecord[ varName ] = '10/12/2017 16:00';
            testHelper.fillEditableList( editedRecord, key );
            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );
            
            // Undo
            testHelper.clickUndoButton();
            testHelper.checkEditableListForm( assert, key, record, editable );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkEditableListForm( assert, key, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );
            
            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( newRecord, options.fields ), editable );
            
            done();
        }
    );
});

QUnit.test( 'update datetime using picker test', function( assert ) {

    var done = assert.async();
    var varName = 'datetime';
    testHelper.updateListVisibleFields( options, [ 'id', 'name', varName ] );
    
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
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( record, options.fields ), editable );

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
            editedRecord[ varName ] = '10/12/2017 16:00';
            
            testHelper.updateDatetimePickerInList( 
                key, 
                varName, 
                options.fields[ varName ], 
                editedRecord[ varName ] );
            
            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );
            // Undo
            testHelper.clickUndoButton();
            testHelper.checkEditableListForm( assert, key, record, editable );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkEditableListForm( assert, key, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( newRecord, options.fields ), editable );

            done();
        }
    );
});

QUnit.test( 'update inline datetime using picker test', function( assert ) {

    var done = assert.async();
    var varName = 'datetime';
    testHelper.updateListVisibleFields( options, [ 'id', 'name', varName ] );
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            options.fields[ varName ].inline = true;
            
            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( record, options.fields ), editable );

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
            editedRecord[ varName ] = '10/12/2017 03:05';
            testHelper.updateDatetimePickerInList( 
                key, 
                varName, 
                options.fields[ varName ], 
                editedRecord[ varName ] );

            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );

            // Undo
            testHelper.clickUndoButton( 5 );
            testHelper.checkEditableListForm( assert, key, record, editable );
            testHelper.assertHistory( assert, 0, 5, false );
            
            // Redo
            testHelper.clickRedoButton( 5 );
            testHelper.checkEditableListForm( assert, key, newRecord );
            testHelper.assertHistory( assert, 5, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( newRecord, options.fields ), editable );

            done();
        }
    );
});

QUnit.test( 'update date test', function( assert ) {

    var done = assert.async();
    var varName = 'date';
    testHelper.updateListVisibleFields( options, [ 'id', 'name', varName ] );
    
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
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( record, options.fields ), editable );

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
            editedRecord[ varName ] = '10/12/2017';
            testHelper.fillEditableList( editedRecord, key );
            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );

            // Undo
            testHelper.clickUndoButton();
            testHelper.checkEditableListForm( assert, key, record, editable );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkEditableListForm( assert, key, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( newRecord, options.fields ), editable );

            done();
        }
    );
});

QUnit.test( 'update date using picker test', function( assert ) {

    var done = assert.async();
    var varName = 'date';
    testHelper.updateListVisibleFields( options, [ 'id', 'name', varName ] );
    
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
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( record, options.fields ), editable );

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
            editedRecord[ varName ] = '10/12/2017';
            testHelper.updateDatetimePickerInList( 
                key, 
                varName, 
                options.fields[ varName ], 
                editedRecord[ varName ] );

            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );

            // Undo
            testHelper.clickUndoButton();
            testHelper.checkEditableListForm( assert, key, record, editable );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkEditableListForm( assert, key, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( newRecord, options.fields ), editable );

            done();
        }
    );
});

QUnit.test( 'update inline date using picker test', function( assert ) {

    var done = assert.async();
    var varName = 'date';
    testHelper.updateListVisibleFields( options, [ 'id', 'name', varName ] );
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            
            options.fields[ varName ].inline = true;

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( record, options.fields ), editable );

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
            editedRecord[ varName ] = '10/12/2017';
            testHelper.updateDatetimePickerInList( 
                key, 
                varName, 
                options.fields[ varName ], 
                editedRecord[ varName ] );

            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );

            // Undo
            testHelper.clickUndoButton();
            testHelper.checkEditableListForm( assert, key, record, editable );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkEditableListForm( assert, key, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( newRecord, options.fields ), editable );

            done();
        }
    );
});

QUnit.test( 'update time test', function( assert ) {

    var done = assert.async();
    var varName = 'time';
    testHelper.updateListVisibleFields( options, [ 'id', 'name', varName ] );
    
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
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( record, options.fields ), editable );

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
            editedRecord[ varName ] = '03:10';
            testHelper.fillEditableList( editedRecord, key );
            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );

            // Undo
            testHelper.clickUndoButton();
            testHelper.checkEditableListForm( assert, key, record, editable );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkEditableListForm( assert, key, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( newRecord, options.fields ), editable );

            done();
        }
    );
});

QUnit.test( 'update time using picker test', function( assert ) {

    var done = assert.async();
    var varName = 'time';
    testHelper.updateListVisibleFields( options, [ 'id', 'name', varName ] );
    
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
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( record, options.fields ), editable );

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
            editedRecord[ varName ] = '03:10';
            testHelper.updateDatetimePickerInList( 
                key, 
                varName, 
                options.fields[ varName ], 
                editedRecord[ varName ] );
            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );
            
            // Undo
            testHelper.clickUndoButton();
            testHelper.checkEditableListForm( assert, key, record, editable );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkEditableListForm( assert, key, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( newRecord, options.fields ), editable );

            done();
        }
    );
});

QUnit.test( 'update inline time using picker test', function( assert ) {

    var done = assert.async();
    var varName = 'time';
    testHelper.updateListVisibleFields( options, [ 'id', 'name', varName ] );
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            options.fields[ varName ].inline = true;
            
            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( record, options.fields ), editable );

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
            editedRecord[ varName ] = '02:10';
            testHelper.updateDatetimePickerInList( 
                key, 
                varName, 
                options.fields[ varName ], 
                editedRecord[ varName ] );
            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );
            
            // Undo
            testHelper.clickUndoButton( 4 );
            testHelper.checkEditableListForm( assert, key, record, editable );
            testHelper.assertHistory( assert, 0, 4, false );

            // Redo
            testHelper.clickRedoButton( 4 );
            testHelper.checkEditableListForm( assert, key, newRecord );
            testHelper.assertHistory( assert, 4, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( newRecord, options.fields ), editable );

            done();
        }
    );
});

QUnit.test( 'update checkbox test', function( assert ) {

    var done = assert.async();
    testHelper.updateListVisibleFields( options, [ 'id', 'name', 'important' ] );
    
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
                'id': '' + key,
                'name': 'Service ' + key
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
                'important': true
            };
            testHelper.fillEditableList( editedRecord, key );
            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );

            // Undo
            testHelper.clickUndoButton();
            testHelper.checkEditableListForm( assert, key, record, editable );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkEditableListForm( assert, key, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, newRecord, editable );
            
            done();
        }
    );
});

QUnit.test( 'update radio test', function( assert ) {

    var done = assert.async();
    testHelper.updateListVisibleFields( options, [ 'id', 'name', 'phoneType' ] );
    
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
                'id': '' + key,
                'name': 'Service ' + key
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
                'phoneType': 'officePhone_option'
            };
            testHelper.fillEditableList( editedRecord, key );
            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );
            
            // Undo
            testHelper.clickUndoButton();
            testHelper.checkEditableListForm( assert, key, record, editable );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkEditableListForm( assert, key, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, newRecord, editable );
            
            done();
        }
    );
});

QUnit.test( 'update 2 radios test', function( assert ) {

    var done = assert.async();
    testHelper.updateListVisibleFields( options, [ 'id', 'name', 'phoneType' ] );
    
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
                'id': '' + key,
                'name': 'Service ' + key
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
                'phoneType': 'officePhone_option'
            };
            testHelper.fillEditableList( editedRecord, key );
            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );

            // Assert register with key 4 exists
            var key2 = 4;
            var record2 =  {
                'id': '' + key2,
                'name': 'Service ' + key2
            };
            testHelper.checkRecord( assert, key2, record2, editable );

            // Edit record 2
            var editedRecord2 =  {
                'phoneType': 'cellPhone_option'
            };
            testHelper.fillEditableList( editedRecord2, key2 );
            var newRecord2 = utils.extend( true, {}, record2, editedRecord2 );
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

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, newRecord, editable );
            testHelper.checkRecord( assert, key2, newRecord2, editable );
            
            done();
        }
    );
});

QUnit.test( 'update select test', function( assert ) {

    var done = assert.async();
    testHelper.updateListVisibleFields( options, [ 'id', 'name', 'province' ] );
    
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
                'id': '' + key,
                'name': 'Service ' + key
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
                'province': 'Málaga'
            };
            testHelper.fillEditableList( editedRecord, key );

            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );

            // Undo
            testHelper.clickUndoButton();
            testHelper.checkEditableListForm( assert, key, record, editable );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkEditableListForm( assert, key, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, newRecord, editable );
            
            done();
        }
    );
});

QUnit.test( 'update 2 linked select test', function( assert ) {

    var done = assert.async();
    testHelper.updateListVisibleFields( options, [ 'id', 'name', 'province', 'city' ] );
    
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
                'id': '' + key,
                'name': 'Service ' + key
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
                'province': 'Málaga'
            };
            testHelper.fillEditableList( editedRecord, key );

            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );

            var editedRecord2 =  {
                'city': 'Marbella'
            };
            testHelper.fillEditableList( editedRecord2, key );
            assert.deepEqual(
                testHelper.getSelectOptions( 'city', testHelper.get$row( key ) ),
                [ 'Estepona', 'Marbella' ] );

            var newRecord2 = utils.extend( true, {}, newRecord, editedRecord2 );
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

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, newRecord2, editable );
            
            done();
        }
    );
});

QUnit.test( 'update datalist test', function( assert ) {

    var done = assert.async();
    testHelper.updateListVisibleFields( options, [ 'id', 'name', 'browser' ] );
    
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
                'id': '' + key,
                'name': 'Service ' + key
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
                'browser': 'Firefox'
            };
            testHelper.fillEditableList( editedRecord, key );
            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );

            // Undo
            testHelper.clickUndoButton();
            testHelper.checkEditableListForm( assert, key, record, editable );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkEditableListForm( assert, key, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, newRecord, editable );
            
            done();
        }
    );
});

QUnit.test( 'update hobbies test', function( assert ) {

    var done = assert.async();
    testHelper.updateListVisibleFields( options, [ 'id', 'name', 'hobbies' ] );

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
                'id': '' + key,
                'name': 'Service ' + key
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
                'hobbies': [ 'reading_option', 'sports_option' ]
            };
            testHelper.fillEditableList( editedRecord, key );
            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );
            
            // Undo (2 times)
            testHelper.clickUndoButton( 2 );
            testHelper.checkEditableListForm( assert, key, record, editable );
            testHelper.assertHistory( assert, 0, 2, false );
            
            // Redo (2 times)
            testHelper.clickRedoButton( 2 );
            testHelper.checkEditableListForm( assert, key, newRecord );
            testHelper.assertHistory( assert, 2, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, newRecord, editable );

            done();
        }
    );
});

QUnit.test( 'update password test', function( assert ) {

    var done = assert.async();
    var varName = 'password';
    testHelper.updateListVisibleFields( options, [ 'id', 'name', varName ] );
    
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
                'id': '' + key,
                'name': 'Service ' + key
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
            var editedRecord = {};
            editedRecord[ varName ] = 'password';
            testHelper.fillEditableList( editedRecord, key );
            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );

            // Undo
            testHelper.clickUndoButton();
            testHelper.checkEditableListForm( assert, key, record, editable );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkEditableListForm( assert, key, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, newRecord, editable );
            
            done();
        }
    );
});

