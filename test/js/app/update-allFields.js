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

var defaultTestOptions = require( './defaultTestOptions.js' );
var thisTestOptions = {};
var options = utils.extend( true, {}, defaultTestOptions, thisTestOptions );

var errorFunctionCounter = 0;

options.errorFunction = function( message ){
    ++errorFunctionCounter;
};

// Run tests
QUnit.test( 'update text area test', function( assert ) {

    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            
            var varName = 'description';
            context.updateFormVisibleFields( options, [ 'id', 'name', varName ] );

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, record );

            // Edit record
            var editedRecord = {};
            editedRecord[ varName ] = 'Service ' + key + ' description';
            testHelper.fillForm( editedRecord );
            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.clickUpdateListButton( key );
            testHelper.fillForm( editedRecord );

            // Undo
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, newRecord );
            
            done();
        }
    );
});

QUnit.test( 'update datetime test', function( assert ) {

    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
    
            var varName = 'datetime';
            context.updateFormVisibleFields( options, [ 'id', 'name', varName ] );

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, record );
            
            // Edit record
            testHelper.clickUpdateListButton( key );
            var editedRecord = {};
            editedRecord[ varName ] = new Date( '2017-09-10T20:00:00.000' );
            var clientRecord = utils.extend( true, {}, editedRecord );
            clientRecord[ varName ] = options.fields[ varName ].formatToClient(
                clientRecord[ varName ] );
            testHelper.fillForm( clientRecord );
            
            var newRecord = utils.extend( true, {}, record, editedRecord );
            var newClientRecord = utils.extend( true, {}, record, clientRecord );
            testHelper.checkForm( assert, newClientRecord );
            
            // Undo
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 0, 1, false );
            
            // Redo
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, newClientRecord );
            testHelper.assertHistory( assert, 1, 0, true );
            
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );
            
            testHelper.checkRecord( assert, key, newRecord );
            
            done();
        }
    );
});
/*
QUnit.test( 'update datetime using picker test', function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            debugger;
            var varName = 'datetime';
            context.updateFormVisibleFields( options, [ 'id', 'name', varName ] );

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, record );

            // Edit record
            testHelper.clickUpdateListButton( key );
            var editedRecord = {};
            editedRecord[ varName ] = new Date( '2017-09-10T20:00:00.000' );
            var varValue = options.fields[ varName ].formatToClient(
                editedRecord[ varName ] );
            testHelper.updateDatetimePickerInForm( 
                varName, 
                options.fields[ varName ], 
                varValue );
            
            var clientRecord = utils.extend( true, {}, editedRecord );
            clientRecord[ varName ] = options.fields[ varName ].formatToClient(
                clientRecord[ varName ] );
            var newRecord = utils.extend( true, {}, record, editedRecord );
            var newClientRecord = utils.extend( true, {}, record, clientRecord );
            testHelper.checkForm( assert, newClientRecord );
            
            // Undo
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 0, 1, false );
            
            // Redo
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, newClientRecord );
            testHelper.assertHistory( assert, 1, 0, true );
            
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, newRecord );

            done();
        }
    );
});

QUnit.test( 'update inline datetime using picker test', function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            var varName = 'datetime';
            context.updateFormVisibleFields( options, [ 'id', 'name', varName ] );
            options.fields[ varName ].inline = true;
            
            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, record );

            // Edit record
            testHelper.clickUpdateListButton( key );
            var editedRecord = {};
            editedRecord[ varName ] = new Date( '2017-09-10T03:05:00.000' );
            var varValue = options.fields[ varName ].formatToClient(
                editedRecord[ varName ] );
            testHelper.updateDatetimePickerInForm( 
                varName, 
                options.fields[ varName ], 
                varValue );
            
            var clientRecord = utils.extend( true, {}, editedRecord );
            clientRecord[ varName ] = options.fields[ varName ].formatToClient(
                clientRecord[ varName ] );
            var newRecord = utils.extend( true, {}, record, editedRecord );
            var newClientRecord = utils.extend( true, {}, record, clientRecord );
            testHelper.checkForm( assert, newClientRecord );
            
            // Undo
            testHelper.clickUndoButton( 5 );
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 0, 5, false );
            
            // Redo
            testHelper.clickRedoButton( 5 );
            testHelper.checkForm( assert, newClientRecord );
            testHelper.assertHistory( assert, 5, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, newRecord );

            done();
        }
    );
});

QUnit.test( 'update date test', function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            var varName = 'date';
            context.updateFormVisibleFields( options, [ 'id', 'name', varName ] );

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, record );

            // Edit record
            testHelper.clickUpdateListButton( key );
            var editedRecord = {};
            editedRecord[ varName ] = new Date( '2017-09-10T00:00:00.000' );
            var clientRecord = utils.extend( true, {}, editedRecord );
            clientRecord[ varName ] = options.fields[ varName ].formatToClient(
                clientRecord[ varName ] );
            testHelper.fillForm( clientRecord );

            var newRecord = utils.extend( true, {}, record, editedRecord );
            var newClientRecord = utils.extend( true, {}, record, clientRecord );
            testHelper.checkForm( assert, newClientRecord );

            // Undo
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, newClientRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, newRecord );

            done();
        }
    );
});

QUnit.test( 'update date using picker test', function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            var varName = 'date';
            context.updateFormVisibleFields( options, [ 'id', 'name', varName ] );

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, record );

            // Edit record
            testHelper.clickUpdateListButton( key );
            var editedRecord = {};
            editedRecord[ varName ] = new Date( '2017-09-10T00:00:00.000' );
            var varValue = options.fields[ varName ].formatToClient(
                editedRecord[ varName ] );
            testHelper.updateDatetimePickerInForm( 
                varName, 
                options.fields[ varName ], 
                varValue );

            var clientRecord = utils.extend( true, {}, editedRecord );
            clientRecord[ varName ] = options.fields[ varName ].formatToClient(
                clientRecord[ varName ] );
            var newRecord = utils.extend( true, {}, record, editedRecord );
            var newClientRecord = utils.extend( true, {}, record, clientRecord );
            testHelper.checkForm( assert, newClientRecord );

            // Undo
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, newClientRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, newRecord );

            done();
        }
    );
});

QUnit.test( 'update inline date using picker test', function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            var varName = 'date';
            context.updateFormVisibleFields( options, [ 'id', 'name', varName ] );
            options.fields[ varName ].inline = true;

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, record );

            // Edit record
            testHelper.clickUpdateListButton( key );
            var editedRecord = {};
            editedRecord[ varName ] = new Date( '2017-09-10T00:00:00.000' );
            var varValue = options.fields[ varName ].formatToClient(
                editedRecord[ varName ] );
            testHelper.updateDatetimePickerInForm( 
                varName, 
                options.fields[ varName ], 
                varValue );

            var clientRecord = utils.extend( true, {}, editedRecord );
            clientRecord[ varName ] = options.fields[ varName ].formatToClient(
                clientRecord[ varName ] );
            var newRecord = utils.extend( true, {}, record, editedRecord );
            var newClientRecord = utils.extend( true, {}, record, clientRecord );
            testHelper.checkForm( assert, newClientRecord );
            
            // Undo
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, newClientRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, newRecord );

            done();
        }
    );
});

QUnit.test( 'update time test', function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            var varName = 'time';
            context.updateFormVisibleFields( options, [ 'id', 'name', varName ] );

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, record );

            // Edit record
            testHelper.clickUpdateListButton( key );
            var editedRecord = {};
            editedRecord[ varName ] = '03:05';
            testHelper.fillForm( editedRecord );
            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkForm( assert, newRecord );

            // Undo
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, newRecord );

            done();
        }
    );
});

QUnit.test( 'update time using picker test', function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            var varName = 'time';
            context.updateFormVisibleFields( options, [ 'id', 'name', varName ] );

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, record );

            // Edit record
            testHelper.clickUpdateListButton( key );
            var editedRecord = {};
            editedRecord[ varName ] = '03:05';
            testHelper.updateDatetimePickerInForm( 
                varName, 
                options.fields[ varName ], 
                editedRecord[ varName ] );
            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkForm( assert, newRecord );
            
            // Undo
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, newRecord );

            done();
        }
    );
});

QUnit.test( 'update inline time using picker test', function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            var varName = 'time';
            context.updateFormVisibleFields( options, [ 'id', 'name', varName ] );
            options.fields[ varName ].inline = true;
            
            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, record );

            // Edit record
            testHelper.clickUpdateListButton( key );
            var editedRecord = {};
            editedRecord[ varName ] = '02:10';
            testHelper.updateDatetimePickerInForm( 
                varName, 
                options.fields[ varName ], 
                editedRecord[ varName ] );
            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkForm( assert, newRecord );
            
            // Undo
            testHelper.clickUndoButton( 4 );
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 0, 4, false );

            // Redo
            testHelper.clickRedoButton( 4 );
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 4, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, newRecord );

            done();
        }
    );
});
*/
QUnit.test( 'update checkbox test', function( assert ) {

    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
    
            context.updateFormVisibleFields( options, [ 'id', 'name', 'important' ] );

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, record );

            // Edit record
            testHelper.clickUpdateListButton( key );
            var editedRecord =  {
                'important': true
            };
            testHelper.fillForm( editedRecord );
            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkForm( assert, newRecord );

            // Undo
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, newRecord );
            
            done();
        }
    );
});

QUnit.test( 'update radio test', function( assert ) {

    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
    
            context.updateFormVisibleFields( options, [ 'id', 'name', 'phoneType' ] );

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, record );

            // Edit record
            testHelper.clickUpdateListButton( key );
            var editedRecord =  {
                'phoneType': 'officePhone_option'
            };
            testHelper.fillForm( editedRecord );
            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkForm( assert, newRecord );

            // Undo
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, newRecord );
            
            done();
        }
    );
});
/*
QUnit.test( 'update select test', function( assert ) {

    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
    
            context.updateFormVisibleFields( options, [ 'id', 'name', 'province' ] );

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, record );
            
            // Edit record
            testHelper.clickUpdateListButton( key );
            assert.deepEqual(
                testHelper.getSelectOptions( 'province' ),
                [ 'Cádiz', 'Málaga' ] );
            var editedRecord =  {
                'province': 'Málaga'
            };
            testHelper.fillForm( editedRecord );

            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkForm( assert, newRecord );

            // Undo
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, newRecord );
            
            done();
        }
    );
});

QUnit.test( 'update 2 linked select test', function( assert ) {

    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
    
            context.updateFormVisibleFields( options, [ 'id', 'name', 'province', 'city' ] );

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, record );
            
            // Edit record
            testHelper.clickUpdateListButton( key );
            assert.deepEqual(
                testHelper.getSelectOptions( 'city' ),
                [ 'Algeciras', 'Estepona', 'Marbella', 'Tarifa' ] );
            var editedRecord =  {
                'province': 'Málaga'
            };
            testHelper.fillForm( editedRecord );

            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkForm( assert, newRecord );

            var editedRecord2 =  {
                'city': 'Marbella'
            };
            testHelper.fillForm( editedRecord2 );
            assert.deepEqual(
                testHelper.getSelectOptions( 'city' ),
                [ 'Estepona', 'Marbella' ] );

            var newRecord2 = utils.extend( true, {}, newRecord, editedRecord2 );
            testHelper.checkForm( assert, newRecord2 );

            testHelper.assertHistory( assert, 2, 0, true );

            // Undo (1)
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 1, 1, true );
            assert.deepEqual(
                testHelper.getSelectOptions( 'city' ),
                [ 'Estepona', 'Marbella' ] );

            // Undo (2)
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 0, 2, true );
            assert.deepEqual(
                testHelper.getSelectOptions( 'city' ),
                [ 'Algeciras', 'Estepona', 'Marbella', 'Tarifa' ] );

            // Redo (1)
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 1, 1, true );
            assert.deepEqual(
                testHelper.getSelectOptions( 'city' ),
                [ 'Estepona', 'Marbella' ] );

            // Redo (2)
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, newRecord2 );
            testHelper.assertHistory( assert, 2, 0, true );
            assert.deepEqual(
                testHelper.getSelectOptions( 'city' ),
                [ 'Estepona', 'Marbella' ] );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, newRecord2 );
            
            done();
        }
    );
});
*/
QUnit.test( 'update datalist test', function( assert ) {

    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
    
            context.updateFormVisibleFields( options, [ 'id', 'name', 'browser' ] );

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, record );

            // Edit record
            testHelper.clickUpdateListButton( key );
            var editedRecord =  {
                'browser': 'Firefox'
            };
            testHelper.fillForm( editedRecord );
            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkForm( assert, newRecord );

            // Undo
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, newRecord );
            
            done();
        }
    );
});

QUnit.test( 'update checkboxes test', function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            context.updateFormVisibleFields( options, [ 'id', 'name', 'hobbies' ] );

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, record );

            // Edit record
            testHelper.clickUpdateListButton( key );
            var editedRecord =  {
                'hobbies': [ 'reading_option', 'sports_option' ]
            };
            testHelper.fillForm( editedRecord );
            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkForm( assert, newRecord );
            
            // Undo (2 times)
            testHelper.clickUndoButton( 2 );
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 0, 2, false );
            
            // Redo (2 times)
            testHelper.clickRedoButton( 2 );
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 2, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, newRecord );

            done();
        }
    );
});