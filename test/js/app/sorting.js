"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var Qunit = require( 'qunit' );
var testHelper = require( './testHelper.js' );
var testUtils = require( './testUtils.js' );

var defaultTestOptions = require( './defaultTestOptions.js' );
var subformsTestOptions = require( './2SubformsTestOptions.js' );
var thisTestOptions = undefined;
var options = undefined;

// Run tests

QUnit.test( "sorting list test", function( assert ) {
    
    // Build options
    thisTestOptions = {
        pageConf: {
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
        }
    };
    options = $.extend( true, {}, defaultTestOptions, thisTestOptions );
    
    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'load' );
            
            // Sort by name
            var $sortableLink = testHelper.getCurrentList( options ).find( '.zcrud-column-header-sortable' );
            $sortableLink.trigger( 'click' );

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

            done();
        }
    );
});


QUnit.test( "sorting subform test", function( assert ) {

    thisTestOptions = {
        fields: {
            members: {
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
    options = $.extend( true, {}, subformsTestOptions, thisTestOptions );
    
    // Setup services
    var serviceKey = 2;
    var serviceKeys = [ serviceKey ];
    var numberOfMembers = 129;
    var numberOfExternalMembers = 14;
    testUtils.reset2SubformMembersServices( serviceKeys, numberOfMembers, numberOfExternalMembers );
    var itemName = 'Member';
    var subformName = 'members';
    
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'load' );
            
            // Go to edit form
            testHelper.clickUpdateListButton( serviceKey );
            
            // Sort by name
            var $sortableLink = testHelper.get$FormFieldByNameClass( subformName ).find( '.zcrud-column-header-sortable' );
            $sortableLink.trigger( 'click' );

            testHelper.setDefaultItemName( itemName );
            testHelper.multiplePagingTest({
                subformName: subformName,
                options: options,
                assert: assert,
                values: [
                    testHelper.buildCustomValuesList( 1, 10, testHelper.buildValuesList( 100, 107, itemName ) ),
                    testHelper.buildCustomValuesList( 108, 109, 11, testHelper.buildValuesList( 110, 116, itemName ) ),
                    testHelper.buildCustomValuesList( 117, 118, 119, 12, testHelper.buildValuesList( 120, 125, itemName ) ),
                    testHelper.buildCustomValuesList( 108, 109, 11, testHelper.buildValuesList( 110, 116, itemName ) ),
                    testHelper.buildCustomValuesList( 1, 10, testHelper.buildValuesList( 100, 107, itemName ) ),
                    testHelper.buildCustomValuesList( testHelper.buildValuesList( 91, 99, itemName ) ),
                    testHelper.buildCustomValuesList( testHelper.buildValuesList( 46, 49, itemName ), 5, testHelper.buildValuesList( 50, 54, itemName )  ),
                    testHelper.buildCustomValuesList( 1, 10, testHelper.buildValuesList( 100, 109, itemName ), 11, 
                                                     testHelper.buildValuesList( 110, 119, itemName ), 12, 120 ),
                    testHelper.buildCustomValuesList( testHelper.buildValuesList( 121, 129, itemName ), 
                                                     testHelper.buildValuesList( 13, 19, itemName ), 2, 
                                                     testHelper.buildValuesList( 20, 27, itemName ) ),
                    testHelper.buildCustomValuesList( 1, 10, testHelper.buildValuesList( 100, 107, itemName ) )
                ]
            });

            done();
        }
    );
});
