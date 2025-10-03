
import { utils } from '../../../js/app/utils.js';
import { zzDOM } from '../../../js/app/zzDOMPlugin.js';
var $ = zzDOM.zz;

import { testHelper } from './testHelper.js';
import { testServerSide } from './testServerSide.js';

import { defaultTestOptions } from './defaultTestOptions.js';
import { twoSubformsTestOptions as subformsTestOptions } from './2SubformsTestOptions.js';
import { editableListTestOptions } from './editableListTestOptions.js';

var options = undefined;

var errorFunctionCounter = 0;
var errorFunction = function( message ){
    ++errorFunctionCounter;
};

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
QUnit.test( 'paging test (combobox gotoPageFieldType)', function( assert ) {
    
    options = utils.extend( true, {}, defaultTestOptions );
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

QUnit.test( 'paging test (textbox gotoPageFieldType)', function( assert ) {
    
    options = utils.extend( true, {}, defaultTestOptions );
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

QUnit.test( 'subform paging test (combobox gotoPageFieldType)', function( assert ) {

    //options = $.extend( true, {}, subformsTestOptions );
    options = utils.extend( true, {}, subformsTestOptions );
    options.fields.members.components.paging.gotoPageFieldType = 'combobox';

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

QUnit.test( 'subform paging test (textbox gotoPageFieldType)', function( assert ) {

    options = utils.extend( true, {}, subformsTestOptions );
    options.fields.members.components.paging.gotoPageFieldType = 'textbox';
    options.fields.members.components.paging.gotoPageFieldAttributes = {
        size: 2
    };
    
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

QUnit.test( 'subform broken paging: abort test', function( assert ) {

    options = utils.extend( true, {}, subformsTestOptions );
    options.fields.members.components.paging.gotoPageFieldType = 'combobox';
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
            
            // Edit description of last row
            testHelper.fillSubformNewRow( 
                {
                    description: 'Description of Member 10 edited'
                }, 
                subformName );
            
            // Try to go to next page (1 error)
            assert.equal( abortedConfirmFunctionCounter, 0 );
            testHelper.goToNextSubformPage( subformName );
            assert.equal( abortedConfirmFunctionCounter, 1 );
            
            // Check page number is 1
            assert.equal( 
                testHelper.getSubformPageNumber( subformName ),
                1
            );
            
            done();
        }
    );
});

QUnit.test( 'subform broken paging: discard test', function( assert ) {

    options = utils.extend( true, {}, subformsTestOptions );
    options.fields.members.components.paging.gotoPageFieldType = 'combobox';
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

            // Edit description of last row
            testHelper.fillSubformNewRow( 
                {
                    description: 'Description of Member 10 edited'
                }, 
                subformName );

            // Try to go to next page (1 error)
            assert.equal( discardConfirmFunctionCounter, 0 );
            testHelper.goToNextSubformPage( subformName );
            assert.equal( discardConfirmFunctionCounter, 1 );

            // Check page number is 2
            assert.equal( 
                testHelper.getSubformPageNumber( subformName ),
                2
            );

            done();
        }
    );
});

QUnit.test( 'editable list broken paging: discard test', function( assert ) {

    options = utils.extend( true, {}, editableListTestOptions );
    options.confirmFunction = discardConfirmFunction;

    // Setup services
    var serviceKey = 2;

    discardConfirmFunctionCounter = 0;

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Edit description of last row
            testHelper.fillNewRowEditableList( 
                {
                    name: 'Member 10b'
                }
            );

            // Try to go to next page (1 error)
            assert.equal( discardConfirmFunctionCounter, 0 );
            testHelper.goToNextPage( options );
            assert.equal( discardConfirmFunctionCounter, 1 );

            // Check page number is 2
            assert.equal( 
                testHelper.getListPageNumber(),
                2
            );

            done();
        }
    );
});

QUnit.test( 'editable list broken paging: abort test', function( assert ) {

    options = utils.extend( true, {}, editableListTestOptions );
    options.confirmFunction = abortedConfirmFunction;

    // Setup services
    var serviceKey = 2;

    abortedConfirmFunctionCounter = 0;

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );
            
            // Edit description of last row
            testHelper.fillNewRowEditableList( 
                {
                    name: 'Member 10b'
                }
            );
            
            // Try to go to next page (1 error)
            assert.equal( abortedConfirmFunctionCounter, 0 );
            testHelper.goToNextPage( options );
            assert.equal( abortedConfirmFunctionCounter, 1 );
            
            // Check page number is 1
            assert.equal( 
                testHelper.getListPageNumber(),
                1
            );
            
            // Save changes
            testHelper.clickEditableListSubmitButton();
            assert.equal( abortedConfirmFunctionCounter, 1 );
            
            // Go to next page
            testHelper.goToNextPage( options );
            assert.equal( abortedConfirmFunctionCounter, 1 );
            
            // Check page number is 2
            assert.equal( 
                testHelper.getListPageNumber(),
                2
            );
            
            done();
        }
    );
});
