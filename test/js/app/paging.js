"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var Qunit = require( 'qunit' );
var testHelper = require( './testHelper.js' );
var testUtils = require( './testUtils.js' );

var defaultTestOptions = require( './defaultTestOptions.js' );
var subformsTestOptions = require( './2SubformsTestOptions.js' );
var editableListTestOptions = require( './editableListTestOptions.js' );
var options = undefined;

var fatalErrorFunctionCounter = 0;
var fatalErrorFunction = function( message ){
    ++fatalErrorFunctionCounter;
};

// Run tests
QUnit.test( "paging test (combobox gotoPageFieldType)", function( assert ) {
    
    options = $.extend( true, {}, defaultTestOptions );
    options.pageConf.pages.list.components.paging.gotoPageFieldType = 'combobox';
            
    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

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
            $( '#departmentsContainer' ).zcrud( 'renderList' );

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

QUnit.test( "subform paging test (combobox gotoPageFieldType)", function( assert ) {

    options = $.extend( true, {}, subformsTestOptions );
    options.fields.members.components.paging.gotoPageFieldType = 'combobox';

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
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( serviceKey );
            
            testHelper.multiplePagingTest({
                subformName: subformName,
                options: options,
                assert: assert,
                values: [
                    testHelper.buildValuesList( 1, 10, itemName ),
                    testHelper.buildValuesList( 11, 20, itemName ),
                    testHelper.buildValuesList( 21, 30, itemName ),
                    testHelper.buildValuesList( 11, 20, itemName ),
                    testHelper.buildValuesList( 1, 10, itemName ),
                    testHelper.buildValuesList( 121, 129, itemName ),
                    testHelper.buildValuesList( 71, 80, itemName ),
                    testHelper.buildValuesList( 1, 25, itemName ),
                    testHelper.buildValuesList( 26, 50, itemName ),
                    testHelper.buildValuesList( 1, 10, itemName )
                ]
            });

            done();
        }
    );
});

QUnit.test( "subform paging test (textbox gotoPageFieldType)", function( assert ) {

    options = $.extend( true, {}, subformsTestOptions );
    options.fields.members.components.paging.gotoPageFieldType = 'textbox';
    options.fields.members.components.paging.gotoPageFieldAttributes = {
        size: 2
    };
    
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
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( serviceKey );

            testHelper.multiplePagingTest({
                subformName: subformName,
                options: options,
                assert: assert,
                values: [
                    testHelper.buildValuesList( 1, 10, itemName ),
                    testHelper.buildValuesList( 11, 20, itemName ),
                    testHelper.buildValuesList( 21, 30, itemName ),
                    testHelper.buildValuesList( 11, 20, itemName ),
                    testHelper.buildValuesList( 1, 10, itemName ),
                    testHelper.buildValuesList( 121, 129, itemName ),
                    testHelper.buildValuesList( 71, 80, itemName ),
                    testHelper.buildValuesList( 1, 25, itemName ),
                    testHelper.buildValuesList( 26, 50, itemName ),
                    testHelper.buildValuesList( 1, 10, itemName )
                ]
            });

            done();
        }
    );
});

QUnit.test( "subform aborted paging test (combobox gotoPageFieldType)", function( assert ) {

    options = $.extend( true, {}, subformsTestOptions );
    options.fields.members.components.paging.gotoPageFieldType = 'combobox';
    options.fatalErrorFunction = fatalErrorFunction;
    
    // Setup services
    var serviceKey = 2;
    var serviceKeys = [ serviceKey ];
    var numberOfMembers = 129;
    var numberOfExternalMembers = 14;
    testUtils.reset2SubformMembersServices( serviceKeys, numberOfMembers, numberOfExternalMembers );
    var itemName = 'Member';
    var subformName = 'members';

    fatalErrorFunctionCounter = 0;
    
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( serviceKey );
            
            // Edit description of last row
            testHelper.fillSubformNewRow( 
                {
                    description: "Description of Member 10 edited"
                }, 
                subformName );
            
            // Try to go to next page (1 error)
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.goToNextSubformPage( subformName );
            assert.equal( fatalErrorFunctionCounter, 1 );
            
            // Check page number is 1
            assert.equal( 
                testHelper.getSubformPageNumber( subformName ),
                1
            );
            
            done();
        }
    );
});

QUnit.test( "editable list aborted paging test (textbox gotoPageFieldType)", function( assert ) {

    options = $.extend( true, {}, editableListTestOptions );
    options.fatalErrorFunction = fatalErrorFunction;

    // Setup services
    var serviceKey = 2;

    fatalErrorFunctionCounter = 0;

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );
            
            // Edit description of last row
            testHelper.fillNewRowEditableList( 
                {
                    name: "Member 10b"
                }
            );
            
            // Try to go to next page (1 error)
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.goToNextPage( options );
            assert.equal( fatalErrorFunctionCounter, 1 );
            
            // Check page number is 1
            assert.equal( 
                testHelper.getListPageNumber(),
                1
            );
            
            // Save changes
            testHelper.clickEditableListSubmitButton();
            assert.equal( fatalErrorFunctionCounter, 1 );
            
            // Go to next page
            testHelper.goToNextPage( options );
            assert.equal( fatalErrorFunctionCounter, 1 );
            
            // Check page number is 2
            assert.equal( 
                testHelper.getListPageNumber(),
                2
            );
            
            done();
        }
    );
});
