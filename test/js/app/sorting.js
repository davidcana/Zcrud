
import { utils } from '../../../js/app/utils.js';
import { zzDOM } from '../../../js/app/zzDOMPlugin.js';
var $ = zzDOM.zz;

import { testHelper } from './testHelper.js';
import { testServerSide } from './testServerSide.js';

import { defaultTestOptions } from './defaultTestOptions.js';
import { twoSubformsTestOptions as subformsTestOptions } from './2SubformsTestOptions.js';

var thisTestOptions = undefined;
var options = undefined;

var abortedConfirmFunctionCounter = 0;
var abortedConfirmFunction = function(){
    ++abortedConfirmFunctionCounter;
};

var discardConfirmFunctionCounter = 0;
var discardConfirmFunction = function( confirmOptions, onFulfilled ){
    ++discardConfirmFunctionCounter;
    onFulfilled( 'discard' );
};

// Run tests
QUnit.test( 'sorting list test', function( assert ) {
    
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
    options = utils.extend( true, {}, defaultTestOptions, thisTestOptions );
    
    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );
            
            // Sort by name
            var $sortableLink = testHelper.getCurrentList( options ).find( '.zcrud-column-header-sortable.zcrud-column-header-name' );
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

QUnit.test( 'sorting subform test', function( assert ) {

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
    options = utils.extend( true, {}, subformsTestOptions, thisTestOptions );
    
    // Setup services
    var serviceKey = 2;
    var serviceKeys = [ serviceKey ];
    var numberOfMembers = 129;
    var numberOfExternalMembers = 14;
    testServerSide.reset2SubformMembersServices( serviceKeys, numberOfMembers, numberOfExternalMembers );
    var itemName = 'Member';
    var subformName = 'members';
    
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );
            
            // Go to edit form
            testHelper.clickUpdateListButton( serviceKey );
            
            // Sort by name
            var $sortableLink = testHelper.get$FormFieldByNameClass( subformName ).find( '.zcrud-column-header-sortable.zcrud-column-header-name' );
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

QUnit.test( 'sorting subform breaking paging: abort test', function( assert ) {

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
    options = utils.extend( true, {}, subformsTestOptions, thisTestOptions );
    options.confirmFunction = abortedConfirmFunction;
    
    // Setup services
    var serviceKey = 2;
    var serviceKeys = [ serviceKey ];
    var numberOfMembers = 129;
    var numberOfExternalMembers = 14;
    testServerSide.reset2SubformMembersServices( serviceKeys, numberOfMembers, numberOfExternalMembers );
    var itemName = 'Member';
    var subformName = 'members';

    abortedConfirmFunctionCounter = 0;
    
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( serviceKey );
            
            // Sort by name
            var $sortableLink = testHelper.get$FormFieldByNameClass( subformName ).find( '.zcrud-column-header-sortable.zcrud-column-header-name' );
            $sortableLink.trigger( 'click' );

            // Check subform
            testHelper.pagingSubformTest({
                subformName: subformName,
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 129',
                ids: '1/10/100/101/102/103/104/105/106/107',
                names: 'Member 1/Member 10/Member 100/Member 101/Member 102/Member 103/Member 104/Member 105/Member 106/Member 107',
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
            });
            
            testHelper.setDefaultItemName( itemName );

            // Edit description of last row
            testHelper.fillSubformNewRow( 
                {
                    description: 'Description of Member 107 edited'
                }, 
                subformName );
            
            // Try to sort
            assert.equal( abortedConfirmFunctionCounter, 0 );
            $sortableLink.trigger( 'click' );
            assert.equal( abortedConfirmFunctionCounter, 1 );
            
            // Check subform again
            testHelper.pagingSubformTest({
                subformName: subformName,
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 129',
                ids: '1/10/100/101/102/103/104/105/106/107',
                names: 'Member 1/Member 10/Member 100/Member 101/Member 102/Member 103/Member 104/Member 105/Member 106/Member 107',
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
            });
            
            done();
        }
    );
});

QUnit.test( 'sorting subform breaking paging: discard test', function( assert ) {

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
    options = utils.extend( true, {}, subformsTestOptions, thisTestOptions );
    options.confirmFunction = discardConfirmFunction;

    // Setup services
    var serviceKey = 2;
    var serviceKeys = [ serviceKey ];
    var numberOfMembers = 129;
    var numberOfExternalMembers = 14;
    testServerSide.reset2SubformMembersServices( serviceKeys, numberOfMembers, numberOfExternalMembers );
    var itemName = 'Member';
    var subformName = 'members';

    discardConfirmFunctionCounter = 0;

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( serviceKey );

            // Sort by name
            var $sortableLink = testHelper.get$FormFieldByNameClass( subformName ).find( '.zcrud-column-header-sortable.zcrud-column-header-name' );
            $sortableLink.trigger( 'click' );
            
            // Check subform
            testHelper.pagingSubformTest({
                subformName: subformName,
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 129',
                ids: '1/10/100/101/102/103/104/105/106/107',
                names: 'Member 1/Member 10/Member 100/Member 101/Member 102/Member 103/Member 104/Member 105/Member 106/Member 107',
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
            });
            
            testHelper.setDefaultItemName( itemName );

            // Edit description of last row
            testHelper.fillSubformNewRow( 
                {
                    description: 'Description of Member 107 edited'
                }, 
                subformName );

            // Try to sort
            assert.equal( discardConfirmFunctionCounter, 0 );
            $sortableLink = testHelper.get$FormFieldByNameClass( subformName ).find( '.zcrud-column-header-sortable.zcrud-column-header-name' );
            $sortableLink.trigger( 'click' );
            assert.equal( discardConfirmFunctionCounter, 1 );
            
            // Check subform again
            testHelper.pagingSubformTest({
                subformName: subformName,
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 129',
                ids: '99/98/97/96/95/94/93/92/91/90',
                names: 'Member 99/Member 98/Member 97/Member 96/Member 95/Member 94/Member 93/Member 92/Member 91/Member 90',
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
            });
            
            done();
        }
    );
});
