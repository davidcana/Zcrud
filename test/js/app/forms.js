"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var Qunit = require( 'qunit' );
var testHelper = require( './testHelper.js' );
var testUtils = require( './testUtils.js' );

var formTestOptions = require( './editableSubformAsListTestOptions.js' );
var options = undefined;

// Run tests
QUnit.test( "form simple test", function( assert ) {

    options = $.extend( true, {}, formTestOptions );
    var numberOfOriginalMembers = 12;
    testUtils.resetOriginalAndVerifiedMembers( 'Member', numberOfOriginalMembers );
    
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices();
            $( '#departmentsContainer' ).zcrud( 'renderForm' );
            

            
            done();
        }
    );
});
