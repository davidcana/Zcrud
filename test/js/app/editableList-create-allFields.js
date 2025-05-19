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
QUnit.test( 'create text area test', function( assert ) {

    var done = assert.async();
    var varName = 'description';
    context.updateListVisibleFields( options, [ 'id', 'name', varName ] );
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;
            
            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            var record2 = utils.extend( true, {}, record );
            record2[ varName ] = 'Service ' + key + ' description';
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
            
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            assert.deepEqual( testServerSide.getService( key ), record2 );
            
            done();
        }
    );
});

QUnit.test( 'create datetime test', function( assert ) {

    var done = assert.async();
    var varName = 'datetime';
    context.updateListVisibleFields( options, [ 'id', 'name', varName ] );
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;

            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            var record2 = utils.extend( true, {}, record );
            record2[ varName ] = new Date( '2017-09-10T20:00:00.000Z' );
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
            var clientRecord = utils.extend( true, {}, record2 );
            clientRecord[ varName ] = options.fields[ varName ].formatToClient(
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

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            assert.deepEqual( testServerSide.getService( key ), record2 );

            done();
        }
    );
});

QUnit.test( 'create datetime using picker test', function( assert ) {

    var done = assert.async();
    var varName = 'datetime';
    context.updateListVisibleFields( options, [ 'id', 'name', varName ] );
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;

            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            var record2 = utils.extend( true, {}, record );
            record2[ varName ] = new Date( '2017-09-10T20:00:00.000Z' );
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
            var clientRecord = utils.extend( true, {}, record );
            var varValue = options.fields[ varName ].formatToClient(
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
            
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            assert.deepEqual( testServerSide.getService( key ), record2 );

            done();
        }
    );
});

QUnit.test( 'create inline datetime using picker test', function( assert ) {

    var done = assert.async();
    var varName = 'datetime';
    context.updateListVisibleFields( options, [ 'id', 'name', varName ] );
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            
            options.fields[ varName ].inline = true;
            
            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;

            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            var record2 = utils.extend( true, {}, record );
            record2[ varName ] = new Date( '2017-09-10T03:10:00.000' );
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
            var clientRecord = utils.extend( true, {}, record );
            var varValue = options.fields[ varName ].formatToClient(
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
            
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            assert.deepEqual( testServerSide.getService( key ), record2 );

            done();
        }
    );
});

QUnit.test( 'create date test', function( assert ) {

    var done = assert.async();
    var varName = 'date';
    context.updateListVisibleFields( options, [ 'id', 'name', varName ] );
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;

            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            var record2 = utils.extend( true, {}, record );
            record2[ varName ] = new Date( '2017-09-10T00:00:00.000' );
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
            var clientRecord = utils.extend( true, {}, record2 );
            clientRecord[ varName ] = options.fields[ varName ].formatToClient(
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

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            assert.deepEqual( testServerSide.getService( key ), record2 );

            done();
        }
    );
});

QUnit.test( 'create date using picker test', function( assert ) {

    var done = assert.async();
    var varName = 'date';
    context.updateListVisibleFields( options, [ 'id', 'name', varName ] );
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;

            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            var record2 = utils.extend( true, {}, record );
            record2[ varName ] = new Date( '2017-09-10T00:00:00.000' );
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
            var clientRecord = utils.extend( true, {}, record );
            var varValue = options.fields[ varName ].formatToClient(
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
            
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );
            
            assert.deepEqual( testServerSide.getService( key ), record2 );

            done();
        }
    );
});

QUnit.test( 'create inline date using picker test', function( assert ) {

    var done = assert.async();
    var varName = 'date';
    context.updateListVisibleFields( options, [ 'id', 'name', varName ] );
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            options.fields[ varName ].inline = true;

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;

            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            var record2 = utils.extend( true, {}, record );
            record2[ varName ] = new Date( '2017-09-10T00:00:00.000' );
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
            var clientRecord = utils.extend( true, {}, record );
            var varValue = options.fields[ varName ].formatToClient(
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

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            assert.deepEqual( testServerSide.getService( key ), record2 );

            done();
        }
    );
});

QUnit.test( 'create time test', function( assert ) {

    var done = assert.async();
    var varName = 'time';
    context.updateListVisibleFields( options, [ 'id', 'name', varName ] );
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;

            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            var record2 = utils.extend( true, {}, record );
            record2[ varName ] = '03:05';
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

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            assert.deepEqual( testServerSide.getService( key ), record2 );

            done();
        }
    );
});

QUnit.test( 'create time using picker test', function( assert ) {

    var done = assert.async();
    var varName = 'time';
    context.updateListVisibleFields( options, [ 'id', 'name', varName ] );
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;

            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            var record2 = utils.extend( true, {}, record );
            record2[ varName ] = '03:05';
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
            var clientRecord = utils.extend( true, {}, record );
            var varValue = record2[ varName ];
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

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            assert.deepEqual( testServerSide.getService( key ), record2 );

            done();
        }
    );
});

QUnit.test( 'create inline time using picker test', function( assert ) {

    var done = assert.async();
    var varName = 'time';
    context.updateListVisibleFields( options, [ 'id', 'name', varName ] );
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            options.fields[ varName ].inline = true;

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;

            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            var record2 = utils.extend( true, {}, record );
            record2[ varName ] = '03:05';
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
            var clientRecord = utils.extend( true, {}, record );
            var varValue = record2[ varName ];
            testHelper.clickCreateRowListButton();
            testHelper.fillNewRowEditableList( clientRecord );
            testHelper.updateLastRowDatetimePickerInList( 
                varName, 
                options.fields[ varName ], 
                varValue );
            
            testHelper.assertHistory( assert, 7, 0, false );

            // Undo
            testHelper.clickUndoButton( 4 );
            testHelper.checkEditableListLastRow( assert, record );
            testHelper.assertHistory( assert, 3, 4, false );

            // Redo
            testHelper.clickRedoButton( 4 );
            testHelper.checkEditableListLastRow( assert, clientRecord );
            testHelper.assertHistory( assert, 7, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            assert.deepEqual( testServerSide.getService( key ), record2 );

            done();
        }
    );
});

QUnit.test( 'create checkbox test', function( assert ) {

    var done = assert.async();
    var varName = 'important';
    context.updateListVisibleFields( options, [ 'id', 'name', varName ] );
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;

            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            var record2 = utils.extend( true, {}, record );
            record2[ varName ] = true;
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

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            assert.deepEqual( testServerSide.getService( key ), record2 );

            done();
        }
    );
});

QUnit.test( 'create radio test', function( assert ) {

    var done = assert.async();
    var varName = 'phoneType';
    context.updateListVisibleFields( options, [ 'id', 'name', varName ] );
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;

            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            var record2 = utils.extend( true, {}, record );
            record2[ varName ] = 'officePhone_option';
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

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            assert.deepEqual( testServerSide.getService( key ), record2 );

            done();
        }
    );
});

QUnit.test( 'create select test', function( assert ) {

    var done = assert.async();
    var varName = 'province';
    context.updateListVisibleFields( options, [ 'id', 'name', varName ] );
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;

            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            var record2 = utils.extend( true, {}, record );
            record2[ varName ] = 'Málaga';
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
            assert.deepEqual(
                testHelper.getSelectOptions( 'province', testHelper.getLastRow() ),
                [ 'Cádiz', 'Málaga' ] );
            
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

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            assert.deepEqual( testServerSide.getService( key ), record2 );

            done();
        }
    );
});

QUnit.test( 'create 2 linked select test', function( assert ) {

    var done = assert.async();
    var varName = 'province';
    var varName2 = 'city';
    context.updateListVisibleFields( options, [ 'id', 'name', varName, varName2 ] );
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;

            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            var record2 = utils.extend( true, {}, record );
            record2[ varName ] = 'Málaga';
            var record2Step2 = {};
            record2Step2[ varName2 ] = 'Marbella';
            var record3 = utils.extend( true, {}, record2, record2Step2 );
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
            
            assert.deepEqual(
                testHelper.getSelectOptions( 'province', testHelper.getLastRow() ),
                [ 'Cádiz', 'Málaga' ] );
            assert.deepEqual(
                testHelper.getSelectOptions( 'city', testHelper.getLastRow() ),
                [ 'Algeciras', 'Estepona', 'Marbella', 'Tarifa' ] );
            
            // Create record
            testHelper.clickCreateRowListButton();
            testHelper.fillNewRowEditableList( record2 );
            testHelper.assertHistory( assert, 4, 0, false );
            assert.deepEqual(
                testHelper.getSelectOptions( 'city', testHelper.getLastRow() ),
                [ 'Estepona', 'Marbella' ] );
            testHelper.fillNewRowEditableList( record2Step2 );
            testHelper.assertHistory( assert, 5, 0, false );
            testHelper.checkEditableListLastRow( assert, record3 );
            
            // Undo (1)
            testHelper.clickUndoButton();
            testHelper.checkEditableListLastRow( assert, record2 );
            testHelper.assertHistory( assert, 4, 1, false );
            assert.deepEqual(
                testHelper.getSelectOptions( 'city', testHelper.getLastRow() ),
                [ 'Estepona', 'Marbella' ] );
            
            // Undo (2)
            testHelper.clickUndoButton();
            testHelper.checkEditableListLastRow( assert, record );
            testHelper.assertHistory( assert, 3, 2, false );
            assert.deepEqual(
                testHelper.getSelectOptions( 'city', testHelper.getLastRow() ),
                [ 'Algeciras', 'Tarifa' ] );
            
            // Redo (1)
            testHelper.clickRedoButton();
            testHelper.checkEditableListLastRow( assert, record2 );
            testHelper.assertHistory( assert, 4, 1, false );
            assert.deepEqual(
                testHelper.getSelectOptions( 'city', testHelper.getLastRow() ),
                [ 'Estepona', 'Marbella' ] );
            
            // Redo (2)
            testHelper.clickRedoButton();
            testHelper.checkEditableListLastRow( assert, record2 );
            testHelper.assertHistory( assert, 5, 0, false );
            assert.deepEqual(
                testHelper.getSelectOptions( 'city', testHelper.getLastRow() ),
                [ 'Estepona', 'Marbella' ] );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            assert.deepEqual( testServerSide.getService( key ), record3 );

            done();
        }
    );
});

QUnit.test( 'create datalist test', function( assert ) {

    var done = assert.async();
    var varName = 'browser';
    context.updateListVisibleFields( options, [ 'id', 'name', varName ] );
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;

            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            var record2 = utils.extend( true, {}, record );
            record2[ varName ] = 'Firefox';
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

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            assert.deepEqual( testServerSide.getService( key ), record2 );

            done();
        }
    );
});

QUnit.test( 'create checkboxes test', function( assert ) {

    var done = assert.async();
    var varName = 'hobbies';
    context.updateListVisibleFields( options, [ 'id', 'name', varName ] );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;

            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            var record2 = utils.extend( true, {}, record );
            record2[ varName ] = [ 'reading_option', 'sports_option' ];
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
            testHelper.assertHistory( assert, 5, 0, false );
            
            // Undo (2 times)
            testHelper.clickUndoButton( 2 );
            testHelper.checkEditableListLastRow( assert, record );
            testHelper.assertHistory( assert, 3, 2, false );
            
            // Redo (2 times)
            testHelper.clickRedoButton( 2 );
            testHelper.checkEditableListLastRow( assert, record2 );
            testHelper.assertHistory( assert, 5, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            assert.deepEqual( testServerSide.getService( key ), record2 );

            done();
        }
    );
});

QUnit.test( 'create password test', function( assert ) {

    var done = assert.async();
    var varName = 'password';
    context.updateListVisibleFields( options, [ 'id', 'name', varName ] );
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;
            
            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            var record2 = utils.extend( true, {}, record );
            record2[ varName ] = 'password';
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
            
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            assert.deepEqual( testServerSide.getService( key ), record2 );
            
            done();
        }
    );
});
