"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var Qunit = require( 'qunitjs' );
var testHelper = require( './testHelper.js' );
var testUtils = require( './testUtils.js' );
var context = require( '../../../js/app/context.js' );

var defaultTestOptions = require( './subformTestOptions.js' );
defaultTestOptions.fields.members.fields = { 
    code: { 
        subformKey: true
    },
    name: { },
    description: {
        type: 'textarea',
        formFieldAttributes: {
            rows: 3,
            cols: 80
        }
    },
    datetime: {
        type: 'datetime'
    }
};

var options = undefined;

var fatalErrorFunctionCounter = 0;

defaultTestOptions.fatalErrorFunction = function( message ){
    ++fatalErrorFunctionCounter;
};

// Run tests
/*
QUnit.test( "change text area test", function( assert ) {

    var done = assert.async();
    options = $.extend( true, {}, defaultTestOptions );
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            
            // Setup services
            testUtils.resetServices();
            var key = 4;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
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
            
            context.updateSubformFields( options.fields.members, [ 'code', 'name', 'description' ] );
            
            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );
            
            // Go to edit form
            testHelper.clickUpdateListButton( key );
            var editedRecord =  {
                "members": {
                    "1": {
                        "description": "Description of Lisa Simpson edited"
                    }
                }
            };
            testHelper.fillForm( editedRecord );
            
            // Check form
            var newRecord = $.extend( true, {}, record );
            newRecord.members[ 1 ].description = editedRecord.members[ 1 ].description;
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            // Undo
            var tempRecord = $.extend( true, {} , newRecord );
            tempRecord.members[ 1 ].description = record.members[ 1 ].description;
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 0, 1, false );
            
            // Redo
            tempRecord = $.extend( true, {} , newRecord );
            newRecord.members[ 1 ].description = editedRecord.members[ 1 ].description;
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 1, 0, false );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testUtils.getService( key ), newRecord );

            // Go to edit form again and check the form again
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.checkForm( assert, newRecord );

            done();
        }
    );
});
*/
QUnit.test( "change datetime test", function( assert ) {

    var done = assert.async();
    options = $.extend( true, {}, defaultTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // Setup services
            testUtils.resetServices();
            var key = 4;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "datetime": "10/23/2017 20:00"
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        "datetime": "10/24/2017 14:00"
                    }
                ]
            };
            testUtils.setService( key, record );

            context.updateSubformFields( options.fields.members, [ 'code', 'name', 'datetime' ] );

            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );
            
            // Go to edit form
            testHelper.clickUpdateListButton( key );
            /*
            var editedRecord =  {
                "members": {
                    "1": {
                        "description": "Description of Lisa Simpson edited"
                    }
                }
            };
            testHelper.fillForm( editedRecord );

            // Check form
            var newRecord = $.extend( true, {}, record );
            newRecord.members[ 1 ].description = editedRecord.members[ 1 ].description;
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            // Undo
            var tempRecord = $.extend( true, {} , newRecord );
            tempRecord.members[ 1 ].description = record.members[ 1 ].description;
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            tempRecord = $.extend( true, {} , newRecord );
            newRecord.members[ 1 ].description = editedRecord.members[ 1 ].description;
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 1, 0, false );

            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testUtils.getService( key ), newRecord );

            // Go to edit form again and check the form again
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.checkForm( assert, newRecord );*/

            done();
        }
    );
});
