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

QUnit.test( "filtering list (compact list of fields) test", function( assert ) {
    
    thisTestOptions = {
        pageConf: {
            pages: {
                list: {
                    components: {
                        filtering: {
                            isOn: true,
                            fields: [ 'id', 'name' ]
                        }
                    }
                }
            }
        }
    };
    options = $.extend( true, {}, defaultTestOptions, thisTestOptions );
    
    var itemName = 'Service';
    testHelper.setDefaultItemName( itemName );
    
    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var values = testHelper.buildCustomValuesList( 1, testHelper.buildValuesList( 10, 18 ) );
            testHelper.pagingTest({
                action: { 
                    filter: {
                        "name": 'Service 1' 
                    }
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 41 (filtered)',
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
                pagingInfo: 'Showing 11-20 of 41 (filtered)',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '2' ],
                pageListActive: [  '<<', '<', '1', '3', '4', '5', '>', '>>' ]
            });

            values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 10 ) );
            testHelper.pagingTest({
                action: { 
                    filter: {
                        "name": '' 
                    }
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
                    filter: {
                        "id": '2',
                        "name": 'Service 1' 
                    }
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 13 (filtered)',
                ids:  '12/102/112/120/121/122/123/124/125/126',
                names: 'Service 12/Service 102/Service 112/Service 120/Service 121/Service 122/Service 123/Service 124/Service 125/Service 126',
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '>', '>>' ]
            });
            
            done();
        }
    );
});

QUnit.test( "filtering subform (compact list of fields) test", function( assert ) {

    thisTestOptions = {
        fields: {
            members: {
                components: {
                    filtering: {
                        isOn: true,
                        fields: [ 'code', 'name' ]
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
    testHelper.setDefaultItemName( itemName );
    
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );
            
            // Go to edit form
            testHelper.clickUpdateListButton( serviceKey );
            
            var values = testHelper.buildCustomValuesList( 1, testHelper.buildValuesList( 10, 18, itemName ) );
            testHelper.pagingSubformTest({
                subformName: subformName,
                action: { 
                    filter: {
                        "members-name": 'Member 1' 
                    }
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 41 (filtered)',
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
                pagingInfo: 'Showing 11-20 of 41 (filtered)',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '2' ],
                pageListActive: [  '<<', '<', '1', '3', '4', '5', '>', '>>' ]
            });
            
            values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 10, itemName ) );
            testHelper.pagingSubformTest({
                subformName: subformName,
                action: { 
                    filter: {
                        "members-name": '' 
                    }
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
                    filter: {
                        "members-code": '2',
                        "members-name": 'Member 1' 
                    }
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 13 (filtered)',
                ids: '12/102/112/120/121/122/123/124/125/126',
                names: 'Member 12/Member 102/Member 112/Member 120/Member 121/Member 122/Member 123/Member 124/Member 125/Member 126',
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '>', '>>' ]
            });

            done();
        }
    );
});

QUnit.test( "filtering list (standard list of fields) test", function( assert ) {

    thisTestOptions = {
        pageConf: {
            pages: {
                list: {
                    components: {
                        filtering: {
                            isOn: true,
                            fields: [ 'id', 'name' ],
                            fieldsTemplate: 'standard-editable@templates/fieldLists.html',
                            cssClass: 'zcrud-standard-fields'
                        }
                    }
                }
            }
        }
    };
    options = $.extend( true, {}, defaultTestOptions, thisTestOptions );
    
    var itemName = 'Service';
    testHelper.setDefaultItemName( itemName );
    
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var values = testHelper.buildCustomValuesList( 1, testHelper.buildValuesList( 10, 18 ) );
            testHelper.pagingTest({
                action: { 
                    filter: {
                        "name": 'Service 1' 
                    }
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 41 (filtered)',
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
                pagingInfo: 'Showing 11-20 of 41 (filtered)',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '2' ],
                pageListActive: [  '<<', '<', '1', '3', '4', '5', '>', '>>' ]
            });

            values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 10 ) );
            testHelper.pagingTest({
                action: { 
                    filter: {
                        "name": '' 
                    }
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
                    filter: {
                        "id": '2',
                        "name": 'Service 1' 
                    }
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 13 (filtered)',
                ids:  '12/102/112/120/121/122/123/124/125/126',
                names: 'Service 12/Service 102/Service 112/Service 120/Service 121/Service 122/Service 123/Service 124/Service 125/Service 126',
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '>', '>>' ]
            });

            done();
        }
    );
});

QUnit.test( "filtering subform (standard list of fields) test", function( assert ) {

    thisTestOptions = {
        fields: {
            members: {
                components: {
                    filtering: {
                        isOn: true,
                        fields: [ 'code', 'name' ],
                        fieldsTemplate: 'standard-editable@templates/fieldLists.html',
                        cssClass: 'zcrud-standard-fields'
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
    testHelper.setDefaultItemName( itemName );

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( serviceKey );

            var values = testHelper.buildCustomValuesList( 1, testHelper.buildValuesList( 10, 18, itemName ) );
            testHelper.pagingSubformTest({
                subformName: subformName,
                action: { 
                    filter: {
                        "members-name": 'Member 1' 
                    }
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 41 (filtered)',
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
                pagingInfo: 'Showing 11-20 of 41 (filtered)',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '2' ],
                pageListActive: [  '<<', '<', '1', '3', '4', '5', '>', '>>' ]
            });

            values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 10, itemName ) );
            testHelper.pagingSubformTest({
                subformName: subformName,
                action: { 
                    filter: {
                        "members-name": '' 
                    }
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
                    filter: {
                        "members-code": '2',
                        "members-name": 'Member 1' 
                    }
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 13 (filtered)',
                ids: '12/102/112/120/121/122/123/124/125/126',
                names: 'Member 12/Member 102/Member 112/Member 120/Member 121/Member 122/Member 123/Member 124/Member 125/Member 126',
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '>', '>>' ]
            });

            done();
        }
    );
});

QUnit.test( "filtering subform breaking paging: abort (standard list of fields) test", function( assert ) {

    thisTestOptions = {
        fields: {
            members: {
                components: {
                    filtering: {
                        isOn: true,
                        fields: [ 'code', 'name' ],
                        fieldsTemplate: 'standard-editable@templates/fieldLists.html',
                        cssClass: 'zcrud-standard-fields'
                    }
                }
            }
        }
    };
    options = $.extend( true, {}, subformsTestOptions, thisTestOptions );
    options.confirmFunction = abortedConfirmFunction;
    
    // Setup services
    var serviceKey = 2;
    var serviceKeys = [ serviceKey ];
    var numberOfMembers = 129;
    var numberOfExternalMembers = 14;
    testUtils.reset2SubformMembersServices( serviceKeys, numberOfMembers, numberOfExternalMembers );
    var itemName = 'Member';
    var subformName = 'members';
    testHelper.setDefaultItemName( itemName );

    abortedConfirmFunctionCounter = 0;
    
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( serviceKey );

            var values = testHelper.buildCustomValuesList( 1, testHelper.buildValuesList( 10, 18, itemName ) );
            testHelper.pagingSubformTest({
                subformName: subformName,
                action: { 
                    filter: {
                        "members-name": 'Member 1' 
                    }
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 41 (filtered)',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '>', '>>' ]
            });

            // Edit description of last row
            testHelper.fillSubformNewRow( 
                {
                    description: "Description of Member 18 edited"
                }, 
                subformName );
            
            // Try to filter (1 error)
            assert.equal( abortedConfirmFunctionCounter, 0 );
            testHelper.pagingSubformTest({
                subformName: subformName,
                action: { 
                    filter: {
                        "members-name": 'Member 2222222' 
                    }
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 41 (filtered)',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '>', '>>' ]
            });
            assert.equal( abortedConfirmFunctionCounter, 1 );
            
            done();
        }
    );
});

QUnit.test( "filtering subform breaking paging: discard (standard list of fields) test", function( assert ) {

    thisTestOptions = {
        fields: {
            members: {
                components: {
                    filtering: {
                        isOn: true,
                        fields: [ 'code', 'name' ],
                        fieldsTemplate: 'standard-editable@templates/fieldLists.html',
                        cssClass: 'zcrud-standard-fields'
                    }
                }
            }
        }
    };
    options = $.extend( true, {}, subformsTestOptions, thisTestOptions );
    options.confirmFunction = discardConfirmFunction;

    // Setup services
    var serviceKey = 2;
    var serviceKeys = [ serviceKey ];
    var numberOfMembers = 129;
    var numberOfExternalMembers = 14;
    testUtils.reset2SubformMembersServices( serviceKeys, numberOfMembers, numberOfExternalMembers );
    var itemName = 'Member';
    var subformName = 'members';
    testHelper.setDefaultItemName( itemName );

    discardConfirmFunctionCounter = 0;

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( serviceKey );

            var values = testHelper.buildCustomValuesList( 1, testHelper.buildValuesList( 10, 18, itemName ) );
            testHelper.pagingSubformTest({
                subformName: subformName,
                action: { 
                    filter: {
                        "members-name": 'Member 1' 
                    }
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 41 (filtered)',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '>', '>>' ]
            });

            // Edit description of last row
            testHelper.fillSubformNewRow( 
                {
                    description: "Description of Member 18 edited"
                }, 
                subformName );

            // Try to filter (1 error)
            assert.equal( discardConfirmFunctionCounter, 0 );
            testHelper.pagingSubformTest({
                subformName: subformName,
                action: { 
                    filter: {
                        "members-name": 'Member 2222222' 
                    }
                },
                options: options,
                assert: assert,
                visibleRows: 0,
                pagingInfo: 'No records found! (filtered)',
                ids: [],
                names: [],
                pageListNotActive: [ '<<', '<', '>', '>>' ],
                pageListActive: [ ]
            });
            assert.equal( discardConfirmFunctionCounter, 1 );

            done();
        }
    );
});
