"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var Qunit = require( 'qunit' );
var testHelper = require( './testHelper.js' );

var defaultTestOptions = require( './defaultTestOptions.js' );
var thisTestOptions = {};
var options = $.extend( true, {}, defaultTestOptions, thisTestOptions );

// Run tests
QUnit.test( "paging test", function( assert ) {

    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'load' );

            testHelper.multiplePagingTest({
                options: options,
                assert: assert,
                values: [
                    testHelper.buildValuesList( 1, 10 ),
                    testHelper.buildValuesList( 11, 20 ),
                    testHelper.buildValuesList( 21, 30 ),
                    testHelper.buildValuesList( 11, 20 ),
                    testHelper.buildValuesList( 1, 10 ),
                    testHelper.buildValuesList( 121, 129 ),
                    testHelper.buildValuesList( 71, 80 ),
                    testHelper.buildValuesList( 1, 25 ),
                    testHelper.buildValuesList( 26, 50 ),
                    testHelper.buildValuesList( 1, 10 )
                ]
            });
            
            done();
        }
    );
});
