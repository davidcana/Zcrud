"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var Qunit = require( 'qunitjs' );
var testHelper = require( './testHelper.js' );

var defaultTestOptions = require( './defaultTestOptions.js' );
var thisTestOptions = {
    pages: {
        list: {
            components: {
                sorting: {
                    isOn: true,
                    loadFromLocalStorage: false,
                    default: {
                        fieldId: undefined,
                        type: undefined
                    },
                    allowUser: true
                }
            }
        }
    }
};
var options = $.extend( true, {}, defaultTestOptions, thisTestOptions );

$( '#departmentsContainer' ).zcrud( 
    'init',
    options,
    function( options ){
        $( '#departmentsContainer' ).zcrud( 'load' );
        
        // Sort by name
        var $sortableLink = testHelper.getCurrentList( options ).find( '.zcrud-column-header-sortable' );
        $sortableLink.trigger( 'click' );
        
        // Run tests
        QUnit.test( "sorting test", function( assert ) {
            
            testHelper.multiplePagingTest({
                options: options,
                assert: assert,
                values: [
                    testHelper.buildCustomValuesList( 1, 10, testHelper.buildValuesList( 100, 107 ) ),
                    testHelper.buildCustomValuesList( 108, 109, 11, testHelper.buildValuesList( 110, 116 ) ),
                    testHelper.buildCustomValuesList( 117, 118, 119, 12, testHelper.buildValuesList( 120, 125 ) ),
                    testHelper.buildCustomValuesList( 108, 109, 11, testHelper.buildValuesList( 110, 116 ) ),
                    testHelper.buildCustomValuesList( 1, 10, testHelper.buildValuesList( 100, 107 ) ),
                    testHelper.buildCustomValuesList( testHelper.buildValuesList( 91, 99 ) ),
                    testHelper.buildCustomValuesList( testHelper.buildValuesList( 46, 49 ), 5, testHelper.buildValuesList( 50, 54 )  ),
                    testHelper.buildCustomValuesList( 1, 10, testHelper.buildValuesList( 100, 109 ), 11, 
                                                     testHelper.buildValuesList( 110, 119 ), 12, 120 ),
                    testHelper.buildCustomValuesList( testHelper.buildValuesList( 121, 129 ), 
                                                     testHelper.buildValuesList( 13, 19 ), 2, 
                                                     testHelper.buildValuesList( 20, 27 ) ),
                    testHelper.buildCustomValuesList( 1, 10, testHelper.buildValuesList( 100, 107 ) )
                ]
            });
            

        });
    });
