"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var Qunit = require( 'qunitjs' );
var testHelper = require( './testHelper.js' );
var testUtils = require( './testUtils.js' );

var defaultTestOptions = require( './defaultTestOptions.js' );
var thisTestOptions = {};
var options = $.extend( true, {}, defaultTestOptions, thisTestOptions );

var fatalErrorFunctionCounter = 0;

options.fatalErrorFunction = function( message ){
    ++fatalErrorFunctionCounter;
};

$( '#departmentsContainer' ).zcrud( 
    'init',
    options,
    function( options ){
        
        // Run tests
        QUnit.test( "change undo/redo 1 action test (name)", function( assert ) {

            testUtils.resetServices();
            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );
            
            var editable = false;
            var checkOnlyStorage = true;
            
            // Assert register with key 2 exists
            var key = 7;
            var record =  {
                "id": "" + key,
                "name": "Service " + key
            };
            testHelper.checkRecord( assert, key, record );
            
            testHelper.clickUpdateListButton( key );
            
            // Edit record
            var editedRecord =  {
                "name": "Service " + key + " edited"
            };
            testHelper.setFormInputVal( editedRecord, 'name' );
            var newRecord = $.extend( true, {}, record, editedRecord );
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );
            
            // Undo
            testHelper.clickUndoButton();
            testHelper.checkRecord( assert, key, record, editable, checkOnlyStorage );
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 0, 1, false );
            
            // Redo
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );
            
            // Save
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );
            
            //testHelper.checkRecord( assert, key, newRecord, editable );
        });
    });
