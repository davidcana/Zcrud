"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var Qunit = require( 'qunitjs' );
var testHelper = require( './testHelper.js' );
var testUtils = require( './testUtils.js' );

var defaultTestOptions = require( './editableListTestOptions.js' );
var thisTestOptions = {};
var options = $.extend( true, {}, defaultTestOptions, thisTestOptions );

var fatalErrorFunctionCounter = 0;

options.fatalErrorFunction = function( message ){
    ++fatalErrorFunctionCounter;
};

// Run tests
QUnit.test( "create/delete rows without changes test", function( assert ) {
    
    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            var pagingTest = function( assert ){

                var editable = true;
                var values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 10 ) );
                testHelper.pagingTest({
                    options: options,
                    assert: assert,
                    visibleRows: 10,
                    pagingInfo: 'Showing 1-10 of 129',
                    ids:  values[ 0 ],
                    names: values[ 1 ],
                    pageListNotActive: [ '<<', '<', '1' ],
                    pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ],
                    editable: editable
                });
            };

            testUtils.resetServices();
            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );

            pagingTest( assert );

            testHelper.clickCreateRowListButton();
            testHelper.assertHistory( assert, 1, 0, false );

            testHelper.clickLastDeleteRowListButton();
            testHelper.assertHistory( assert, 2, 0, false );

            pagingTest( assert );

            testHelper.clickUndoButton();
            testHelper.assertHistory( assert, 1, 1, false );

            testHelper.clickUndoButton();
            testHelper.assertHistory( assert, 0, 2, false );

            pagingTest( assert );

            testHelper.clickRedoButton();
            testHelper.assertHistory( assert, 1, 1, false );

            testHelper.clickRedoButton();
            testHelper.assertHistory( assert, 2, 0, false );

            pagingTest( assert );
            
            done();
        }
    );
});
