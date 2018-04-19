"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var fieldBuilder = require( '../../../js/app/fields/fieldBuilder.js' );
var Qunit = require( 'qunit' );
var testHelper = require( './testHelper.js' );

var defaultTestOptions = require( './defaultTestOptions.js' );
var thisTestOptions = {};
var options = $.extend( true, {}, defaultTestOptions, thisTestOptions );

// Run tests
QUnit.test( "create duplicated key test", function( assert ) {

    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
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
            var clientRecord =  {
                "id": "" + key,
                "name": "Service " + key + " (error)",
                "description": "Service " + key + " description (duplicated key)",
                "province": "Cádiz"
            };
            testHelper.fillForm( clientRecord );
            testHelper.checkForm( assert, clientRecord );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            
            done();
        }
    );
});
