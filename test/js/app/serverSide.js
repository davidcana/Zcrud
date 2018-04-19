"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var fieldBuilder = require( '../../../js/app/fields/fieldBuilder.js' );
var Qunit = require( 'qunit' );
var testHelper = require( './testHelper.js' );
var testUtils = require( './testUtils.js' );

var defaultTestOptions = require( './defaultTestOptions.js' );
var thisTestOptions = {};
var options = $.extend( true, {}, defaultTestOptions, thisTestOptions );

var fatalErrorFunctionCounter = 0;

options.fatalErrorFunction = function( message ){
    ++fatalErrorFunctionCounter;
};

// Run tests

QUnit.test( "create record with duplicated key test", function( assert ) {

    var done = assert.async();
    fatalErrorFunctionCounter = 0;
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            
            testUtils.resetServices();
            $( '#departmentsContainer' ).zcrud( 'load' );

            // Assert register with key 0 not exists
            var key = 2;
            var record =  {
                "id": "" + key,
                "name": "Service " + key
            };
            testHelper.checkRecord( assert, key, record );
            
            // Go to create form and create record
            testHelper.clickCreateListButton();
            var newRecord =  {
                "id": "" + key,
                "name": "Service " + key + " (error)",
                "description": "Service " + key + " description (duplicated key)",
                "province": "Cádiz"
            };
            testHelper.fillForm( newRecord );
            testHelper.checkForm( assert, newRecord );
            
            // Submit 
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 1 );
            
            assert.deepEqual( testUtils.getService( key ), record );
            
            done();
        }
    );
});

QUnit.test( "update record with no duplicated key test", function( assert ) {

    var done = assert.async();
    fatalErrorFunctionCounter = 0;

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            
            testUtils.resetServices();
            $( '#departmentsContainer' ).zcrud( 'load' );

            // Assert register with key 0 not exists
            var key = 2;
            var record =  {
                "id": "" + key,
                "name": "Service " + key
            };
            testHelper.checkRecord( assert, key, record );

            // Go to update form and update key
            testHelper.clickUpdateListButton( key );
            var newKey = 999;
            var newRecord =  {
                "id": "" + newKey,
                "name": "Service " + newKey
            };
            testHelper.checkNoRecord( assert, newKey );
            testHelper.fillForm( newRecord );
            testHelper.checkForm( assert, newRecord );
            
            // Submit 
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 0 );

            testHelper.checkNoRecord( assert, key );
            assert.deepEqual( testUtils.getService( newKey ), newRecord );

            done();
        }
    );
});

QUnit.test( "update record with duplicated key test", function( assert ) {

    var done = assert.async();
    fatalErrorFunctionCounter = 0;

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            
            testUtils.resetServices();
            $( '#departmentsContainer' ).zcrud( 'load' );

            // Assert register with key 0 not exists
            var key = 2;
            var record =  {
                "id": "" + key,
                "name": "Service " + key
            };
            testHelper.checkRecord( assert, key, record );

            // Go to update form and update key
            testHelper.clickUpdateListButton( key );
            var newKey = 3;
            var newRecord =  {
                "id": "" + newKey,
                "name": "Service " + newKey
            };
            testHelper.fillForm( newRecord );
            testHelper.checkForm( assert, newRecord );

            // Submit 
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 1 );

            assert.deepEqual( testUtils.getService( key ), record );

            done();
        }
    );
});

QUnit.test( "delete non existing record test", function( assert ) {

    var done = assert.async();
    fatalErrorFunctionCounter = 0;

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices();
            $( '#departmentsContainer' ).zcrud( 'load' );

            // Assert register with key 0 not exists
            var key = 2;
            var record =  {
                "id": "" + key,
                "name": "Service " + key
            };
            testHelper.checkRecord( assert, key, record );

            // Go to update form and update key
            testHelper.clickDeleteListButton( key );
            
            // Remove service
            testUtils.removeService( key ); 

            // Submit 
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 1 );

            assert.deepEqual( testUtils.getService( key ), undefined );
            
            done();
        }
    );
});

