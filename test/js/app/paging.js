"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var Qunit = require( 'qunit' );
var testHelper = require( './testHelper.js' );
var testUtils = require( './testUtils.js' );

var defaultTestOptions = require( './defaultTestOptions.js' );
var subformsTestOptions = require( './2SubformsTestOptions.js' );
var options = undefined;

// Run tests
/*
QUnit.test( "paging test (combobox gotoPageFieldType)", function( assert ) {
    
    options = $.extend( true, {}, defaultTestOptions );
    options.pageConf.pages.list.components.paging.gotoPageFieldType = 'combobox';
            
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

QUnit.test( "paging test (textbox gotoPageFieldType)", function( assert ) {
    
    options = $.extend( true, {}, defaultTestOptions );
    options.pageConf.pages.list.components.paging.gotoPageFieldType = 'textbox';
    options.pageConf.pages.list.components.paging.gotoPageFieldAttributes = {
        size: 2
    };
    
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
*/

QUnit.test( "subform paging test (combobox gotoPageFieldType)", function( assert ) {

    options = $.extend( true, {}, subformsTestOptions );
    options.pageConf.pages.list.components.paging.gotoPageFieldType = 'combobox';

    // Setup services
    var serviceKeys = [ '2' ];
    var numberOfMembers = 32;
    var numberOfExternalMembers = 14;
    testUtils.reset2SubformMembersServices( serviceKeys, numberOfMembers, numberOfExternalMembers );
    
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'load' );



            done();
        }
    );
});
