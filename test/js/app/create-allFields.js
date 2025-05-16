'use strict';

//var $ = require( 'zzdom' );
//var zcrud = require( '../../../js/app/main.js' );
var zzDOM = require( '../../../js/app/zzDOMPlugin.js' );
var $ = zzDOM.zz;
var Qunit = require( 'qunit' );
var testHelper = require( './testHelper.js' );
var testServerSide = require( './testServerSide.js' );
var context = require( '../../../js/app/context.js' );
var utils = require( '../../../js/app/utils.js' );

var defaultTestOptions = require( './defaultTestOptions.js' );
var thisTestOptions = {};
var options = utils.extend( true, {}, defaultTestOptions, thisTestOptions );

var errorFunctionCounter = 0;

options.errorFunction = function( message ){
    ++errorFunctionCounter;
};

// Run tests
QUnit.test( 'create text area test', function( assert ) {

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
            
            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            var record2 = utils.extend( true, {}, record );
            record2[ varName ] = 'Service ' + key + ' description';
            testHelper.checkNoRecord( assert, key, record2 );
            
            // Go to create form and create record
            testHelper.clickCreateListButton();
            testHelper.fillForm( record2 );
            testHelper.checkForm( assert, record2 );
            testHelper.assertHistory( assert, 3, 0, false );
            
            // Undo
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 2, 1, false );
            
            // Redo
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, record2 );
            testHelper.assertHistory( assert, 3, 0, true );
            
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            assert.deepEqual( testServerSide.getService( key ), record2 );
            
            done();
        }
    );
});

QUnit.test( 'create datetime test', function( assert ) {

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

            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            var record2 = utils.extend( true, {}, record );
            record2[ varName ] = new Date( '2017-09-10T20:00:00.000' );
            testHelper.checkNoRecord( assert, key, record2 );
            
            // Create record
            var clientRecord = utils.extend( true, {}, record2 );
            clientRecord[ varName ] = options.fields[ varName ].formatToClient(
                clientRecord[ varName ] );
            testHelper.clickCreateListButton();
            testHelper.fillForm( clientRecord );
            testHelper.assertHistory( assert, 3, 0, false );
            
            // Undo
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 2, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, clientRecord );
            testHelper.assertHistory( assert, 3, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            assert.deepEqual( testServerSide.getService( key ), record2 );

            done();
        }
    );
});

QUnit.test( 'create datetime using picker test', function( assert ) {

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

            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            var record2 = utils.extend( true, {}, record );
            record2[ varName ] = new Date( '2017-09-10T20:00:00.000Z' );
            testHelper.checkNoRecord( assert, key, record2 );
            
            // Create record
            var clientRecord = utils.extend( true, {}, record );
            var varValue = options.fields[ varName ].formatToClient(
                record2[ varName ] );
            testHelper.clickCreateListButton();
            testHelper.fillForm( clientRecord );
            testHelper.updateDatetimePickerInForm( 
                varName, 
                options.fields[ varName ], 
                varValue );
            testHelper.assertHistory( assert, 3, 0, false );
            
            // Undo
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 2, 1, false );
            
            // Redo
            testHelper.clickRedoButton();
            clientRecord[ varName ] = varValue;
            testHelper.checkForm( assert, clientRecord );
            testHelper.assertHistory( assert, 3, 0, true );
            
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            assert.deepEqual( testServerSide.getService( key ), record2 );

            done();
        }
    );
});

QUnit.test( 'create inline datetime using picker test', function( assert ) {

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

            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            var record2 = utils.extend( true, {}, record );
            record2[ varName ] = new Date( '2017-09-10T03:10:00.000' );
            testHelper.checkNoRecord( assert, key, record2 );
            
            // Create record
            var clientRecord = utils.extend( true, {}, record );
            var varValue = options.fields[ varName ].formatToClient(
                record2[ varName ] );
            testHelper.clickCreateListButton();
            testHelper.fillForm( clientRecord );
            testHelper.updateDatetimePickerInForm( 
                varName, 
                options.fields[ varName ], 
                varValue );
            testHelper.assertHistory( assert, 8, 0, false );
            
            // Undo
            testHelper.clickUndoButton( 6 );
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 2, 6, false );
            
            // Redo
            testHelper.clickRedoButton( 6 );
            clientRecord[ varName ] = varValue;
            testHelper.checkForm( assert, clientRecord );
            testHelper.assertHistory( assert, 8, 0, true );
            
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            assert.deepEqual( testServerSide.getService( key ), record2 );

            done();
        }
    );
});

QUnit.test( 'create date test', function( assert ) {

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

            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            var record2 = utils.extend( true, {}, record );
            record2[ varName ] = new Date( '2017-09-10T00:00:00.000' );
            testHelper.checkNoRecord( assert, key, record2 );

            // Create record
            var clientRecord = utils.extend( true, {}, record2 );
            clientRecord[ varName ] = options.fields[ varName ].formatToClient(
                clientRecord[ varName ] );
            testHelper.clickCreateListButton();
            testHelper.fillForm( clientRecord );
            testHelper.assertHistory( assert, 3, 0, false );

            // Undo
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 2, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, clientRecord );
            testHelper.assertHistory( assert, 3, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            assert.deepEqual( testServerSide.getService( key ), record2 );

            done();
        }
    );
});

QUnit.test( 'create date using picker test', function( assert ) {

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

            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            var record2 = utils.extend( true, {}, record );
            record2[ varName ] = new Date( '2017-09-10T00:00:00.000' );
            testHelper.checkNoRecord( assert, key, record2 );

            // Create record
            var clientRecord = utils.extend( true, {}, record );
            var varValue = options.fields[ varName ].formatToClient(
                record2[ varName ] );
            testHelper.clickCreateListButton();
            testHelper.fillForm( clientRecord );
            testHelper.updateDatetimePickerInForm( 
                varName, 
                options.fields[ varName ], 
                varValue );
            testHelper.assertHistory( assert, 3, 0, false );
            
            // Undo
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 2, 1, false );
            
            // Redo
            testHelper.clickRedoButton();
            clientRecord[ varName ] = varValue;
            testHelper.checkForm( assert, clientRecord );
            testHelper.assertHistory( assert, 3, 0, true );
            
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );
            
            assert.deepEqual( testServerSide.getService( key ), record2 );

            done();
        }
    );
});

QUnit.test( 'create inline date using picker test', function( assert ) {

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

            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            var record2 = utils.extend( true, {}, record );
            record2[ varName ] = new Date( '2017-09-10T00:00:00.000' );
            testHelper.checkNoRecord( assert, key, record2 );

            // Create record
            var clientRecord = utils.extend( true, {}, record );
            var varValue = options.fields[ varName ].formatToClient(
                record2[ varName ] );
            testHelper.clickCreateListButton();
            testHelper.fillForm( clientRecord );
            
            testHelper.updateDatetimePickerInForm( 
                varName, 
                options.fields[ varName ], 
                varValue );
            
            testHelper.assertHistory( assert, 3, 0, false );
            
            // Undo
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 2, 1, false );

            // Redo
            testHelper.clickRedoButton();
            clientRecord[ varName ] = varValue;
            testHelper.checkForm( assert, clientRecord );
            testHelper.assertHistory( assert, 3, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            assert.deepEqual( testServerSide.getService( key ), record2 );

            done();
        }
    );
});

QUnit.test( 'create time test', function( assert ) {

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

            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            var record2 = utils.extend( true, {}, record );
            record2[ varName ] = '03:05';
            testHelper.checkNoRecord( assert, key, record2 );

            // Create record
            testHelper.clickCreateListButton();
            testHelper.fillForm( record2 );
            
            testHelper.assertHistory( assert, 3, 0, false );

            // Undo
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 2, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, record2 );
            testHelper.assertHistory( assert, 3, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            assert.deepEqual( testServerSide.getService( key ), record2 );

            done();
        }
    );
});

QUnit.test( 'create time using picker test', function( assert ) {

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

            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            var record2 = utils.extend( true, {}, record );
            record2[ varName ] = '03:05';
            testHelper.checkNoRecord( assert, key, record2 );

            // Create record
            var clientRecord = utils.extend( true, {}, record );
            var varValue = record2[ varName ];
            testHelper.clickCreateListButton();
            testHelper.fillForm( clientRecord );
            testHelper.updateDatetimePickerInForm( 
                varName, 
                options.fields[ varName ], 
                varValue );
    
            testHelper.assertHistory( assert, 3, 0, false );

            // Undo
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 2, 1, false );

            // Redo
            testHelper.clickRedoButton();
            clientRecord[ varName ] = varValue;
            testHelper.checkForm( assert, clientRecord );
            testHelper.assertHistory( assert, 3, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            assert.deepEqual( testServerSide.getService( key ), record2 );

            done();
        }
    );
});

QUnit.test( 'create inline time using picker test', function( assert ) {

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

            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            var record2 = utils.extend( true, {}, record );
            record2[ varName ] = '03:05';
            testHelper.checkNoRecord( assert, key, record2 );

            // Create record
            var clientRecord = utils.extend( true, {}, record );
            var varValue = record2[ varName ];
            testHelper.clickCreateListButton();
            testHelper.fillForm( clientRecord );
            testHelper.updateDatetimePickerInForm( 
                varName, 
                options.fields[ varName ], 
                varValue );
            
            testHelper.assertHistory( assert, 6, 0, false );

            // Undo
            testHelper.clickUndoButton( 4 );
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 2, 4, false );

            // Redo
            testHelper.clickRedoButton( 4 );
            clientRecord[ varName ] = varValue;
            testHelper.checkForm( assert, clientRecord );
            testHelper.assertHistory( assert, 6, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            assert.deepEqual( testServerSide.getService( key ), record2 );

            done();
        }
    );
});

QUnit.test( 'create checkbox test', function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            var varName = 'important';
            context.updateFormVisibleFields( options, [ 'id', 'name', varName ] );

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            var record2 = utils.extend( true, {}, record );
            record2[ varName ] = true;
            testHelper.checkNoRecord( assert, key, record2 );

            // Create record
            testHelper.clickCreateListButton();
            testHelper.fillForm( record2 );
            testHelper.assertHistory( assert, 3, 0, false );

            // Undo
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 2, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, record2 );
            testHelper.assertHistory( assert, 3, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            assert.deepEqual( testServerSide.getService( key ), record2 );

            done();
        }
    );
});

QUnit.test( 'create radio test', function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            var varName = 'phoneType';
            context.updateFormVisibleFields( options, [ 'id', 'name', varName ] );

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            var record2 = utils.extend( true, {}, record );
            record2[ varName ] = 'officePhone_option';
            testHelper.checkNoRecord( assert, key, record2 );

            // Create record
            testHelper.clickCreateListButton();
            testHelper.fillForm( record2 );
            testHelper.assertHistory( assert, 3, 0, false );

            // Undo
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 2, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, record2 );
            testHelper.assertHistory( assert, 3, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            assert.deepEqual( testServerSide.getService( key ), record2 );

            done();
        }
    );
});

QUnit.test( 'create select test', function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            var varName = 'province';
            context.updateFormVisibleFields( options, [ 'id', 'name', varName ] );
            delete options.fields[ varName ].defaultValue;
            
            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            var record2 = utils.extend( true, {}, record );
            record2[ varName ] = 'Málaga';
            testHelper.checkNoRecord( assert, key, record2 );

            // Create record
            testHelper.clickCreateListButton();
            assert.deepEqual(
                testHelper.getSelectOptions( 'province' ),
                [ 'Cádiz', 'Málaga' ] );
            testHelper.fillForm( record2 );
            testHelper.assertHistory( assert, 3, 0, false );
            
            // Undo
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 2, 1, false );
            
            // Redo
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, record2 );
            testHelper.assertHistory( assert, 3, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            assert.deepEqual( testServerSide.getService( key ), record2 );

            done();
        }
    );
});

QUnit.test( 'create 2 linked select test', function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            var varName = 'province';
            var varName2 = 'city';
            context.updateFormVisibleFields( options, [ 'id', 'name', varName, varName2 ] );
            delete options.fields[ varName ].defaultValue;
            
            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

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
            testHelper.checkNoRecord( assert, key, record2 );
            
            // Create record
            testHelper.clickCreateListButton();
            assert.deepEqual(
                testHelper.getSelectOptions( 'province' ),
                [ 'Cádiz', 'Málaga' ] );
            assert.deepEqual(
                testHelper.getSelectOptions( 'city' ),
                [ 'Algeciras', 'Estepona', 'Marbella', 'Tarifa' ] );
            testHelper.fillForm( record2 );
            testHelper.assertHistory( assert, 3, 0, false );
            
            assert.deepEqual(
                testHelper.getSelectOptions( 'city' ),
                [ 'Estepona', 'Marbella' ] );
            testHelper.fillForm( record2Step2 );
            testHelper.assertHistory( assert, 4, 0, false );
            testHelper.checkForm( assert, record3 );
            
            // Undo (1)
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record2 );
            testHelper.assertHistory( assert, 3, 1, false );
            assert.deepEqual(
                testHelper.getSelectOptions( 'city' ),
                [ 'Estepona', 'Marbella' ] );
            
            // Undo (2)
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 2, 2, false );
            assert.deepEqual(
                testHelper.getSelectOptions( 'city' ),
                [ 'Algeciras', 'Estepona', 'Marbella', 'Tarifa' ] );
            
            // Redo (1)
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, record2 );
            testHelper.assertHistory( assert, 3, 1, false );
            assert.deepEqual(
                testHelper.getSelectOptions( 'city' ),
                [ 'Estepona', 'Marbella' ] );
            
            // Redo (2)
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, record3 );
            testHelper.assertHistory( assert, 4, 0, false );
            assert.deepEqual(
                testHelper.getSelectOptions( 'city' ),
                [ 'Estepona', 'Marbella' ] );
            
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            assert.deepEqual( testServerSide.getService( key ), record3 );

            done();
        }
    );
});

QUnit.test( 'create datalist test', function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){


            var varName = 'browser';
            context.updateFormVisibleFields( options, [ 'id', 'name', varName ] );

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            var record2 = utils.extend( true, {}, record );
            record2[ varName ] = 'Firefox';
            testHelper.checkNoRecord( assert, key, record2 );

            // Create record
            testHelper.clickCreateListButton();
            testHelper.fillForm( record2 );
            testHelper.assertHistory( assert, 3, 0, false );

            // Undo
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 2, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, record2 );
            testHelper.assertHistory( assert, 3, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            assert.deepEqual( testServerSide.getService( key ), record2 );

            done();
        }
    );
});

QUnit.test( 'create checkboxes test', function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){


            var varName = 'hobbies';
            context.updateFormVisibleFields( options, [ 'id', 'name', varName ] );

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 0 doesn't exist
            var key = 0;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            var record2 = utils.extend( true, {}, record );
            record2[ varName ] = [ 'reading_option', 'sports_option' ];
            testHelper.checkNoRecord( assert, key, record2 );

            // Create record
            testHelper.clickCreateListButton();
            testHelper.fillForm( record2 );
            testHelper.assertHistory( assert, 4, 0, false );
            
            // Undo (2 times)
            testHelper.clickUndoButton( 2 );
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 2, 2, false );
            
            // Redo (2 times)
            testHelper.clickRedoButton( 2 );
            testHelper.checkForm( assert, record2 );
            testHelper.assertHistory( assert, 4, 0, true );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            assert.deepEqual( testServerSide.getService( key ), record2 );

            done();
        }
    );
});

