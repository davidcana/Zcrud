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
var thisTestOptions = undefined;

// Run tests
QUnit.test( "filtering list test", function( assert ) {
    
    thisTestOptions = {
        pageConf: {
            pages: {
                list: {
                    components: {
                        filtering: {
                            isOn: true,
                            fields: {
                                name: 'name'
                            }
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

            var values = testHelper.buildCustomValuesList( 1, testHelper.buildValuesList( 10, 18 ) );
            testHelper.pagingTest({
                action: { 
                    filter: 'Service 1' 
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 41',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '>', '>>' ]
            });

            values = testHelper.buildCustomValuesList( 19, testHelper.buildValuesList( 100, 108 ) );
            testHelper.pagingTest({
                action: { 
                    nextPage: true
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 11-20 of 41',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '2' ],
                pageListActive: [  '<<', '<', '1', '3', '4', '5', '>', '>>' ]
            });

            values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 10 ) );
            testHelper.pagingTest({
                action: { 
                    filter: ''
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 129',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
            });

            values = testHelper.buildCustomValuesList( 1, testHelper.buildValuesList( 10, 18 ) );
            testHelper.pagingTest({
                action: { 
                    filter: 'Service 1' 
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 41',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '>', '>>' ]
            });
            
            done();
        }
    );
});

QUnit.test( "filtering subform test", function( assert ) {

    thisTestOptions = {
        fields: {
            members: {
                components: {
                    filtering: {
                        isOn: true,
                        fields: {
                            name: 'name'
                        }
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
            
            testHelper.setDefaultItemName( itemName );
            var values = testHelper.buildCustomValuesList( 1, testHelper.buildValuesList( 10, 18, itemName ) );
            testHelper.pagingSubformTest({
                subformName: subformName,
                action: { 
                    filter: 'Member 1' 
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 41',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '>', '>>' ]
            });
            
            values = testHelper.buildCustomValuesList( 19, testHelper.buildValuesList( 100, 108, itemName ) );
            testHelper.pagingSubformTest({
                subformName: subformName,
                action: { 
                    nextPage: true
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 11-20 of 41',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '2' ],
                pageListActive: [  '<<', '<', '1', '3', '4', '5', '>', '>>' ]
            });
            
            values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 10, itemName ) );
            testHelper.pagingSubformTest({
                subformName: subformName,
                action: { 
                    filter: ''
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 129',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
            });
            
            values = testHelper.buildCustomValuesList( 1, testHelper.buildValuesList( 10, 18, itemName ) );
            testHelper.pagingSubformTest({
                subformName: subformName,
                action: { 
                    filter: 'Member 1' 
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 41',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '>', '>>' ]
            });

            done();
        }
    );
});
