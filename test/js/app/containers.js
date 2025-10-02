
//var zzDOM = require( '../../../js/app/zzDOMPlugin.js' );
//var $ = zzDOM.zz;
//var Qunit = require( 'qunit' );
//var utils = require( '../../../js/app/utils.js' );
//var testHelper = require( './testHelper.js' );
//var testServerSide = require( './testServerSide.js' );
//var defaultTestOptions = require( './defaultTestOptions.js' );
//var subformsTestOptions = require( './2SubformsTestOptions.js' );
//var editableListTestOptions = require( './editableListTestOptions.js' );

import { utils } from '../../../js/app/utils.js';
import { zzDOM } from '../../../js/app/zzDOMPlugin.js';
var $ = zzDOM.zz;

import { testHelper } from './testHelper.js';
import { testServerSide } from './testServerSide.js';

import { defaultTestOptions } from './defaultTestOptions.js';
import { twoSubformsTestOptions as subformsTestOptions } from './2SubformsTestOptions.js';
import { editableListTestOptions } from './editableListTestOptions.js';

var options = undefined;

var customButtonClickCounter = 0;
var incCustomButtonClickCounterFunction = function( message ){
    ++customButtonClickCounter;
};

var discardConfirmFunctionCounter = 0;
var discardConfirmFunction = function( confirmOptions, onFulfilled ){
    ++discardConfirmFunctionCounter;
    onFulfilled( 'discard' );
};

// Run tests
QUnit.test( 'form test', function( assert ) {
    
    options = utils.extend( true, {}, defaultTestOptions );

    // Customize options
    options.pageConf.pages.update.fields = [
        {
            'type': 'fieldsGroup',
            'source': [ 
                'id',
                'name',
                'description'
            ],
            'container': {
                'id': 'basicData',
                'containerType': 'fieldSet'
            }
        },
        {
            'type': 'fieldsGroup',
            'source': 'default',
            'start': 'date',
            'end': 'phoneType'
        },
        {
            'type': 'fieldsGroup',
            'container': {
                'id': 'customTemplate1',
                'containerType': 'custom',
                'template': 'customTemplate1@/test/custom-template.html'
            }
        },
        {
            'type': 'fieldsGroup',
            'source': [ 
                'province',
                'city'
            ],
            'container': {
                'id': 'location',
                'containerType': 'fieldSet'
            }
        },
        'browser',
        'important'
    ];
    options.templates = {
        declaredRemotePageUrls: [ '/test/custom-template.html' ]
    };
    options.events = {
        formCreated: function ( data ) {
            $( '#customButton1' ).on(
                'click',
                function ( e ) {
                    e.preventDefault();
                    incCustomButtonClickCounterFunction();
                }
            );
        }
    };

    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );
            
            // Go to edit form
            var key = 2;
            testHelper.clickUpdateListButton( key );

            assert.equal( customButtonClickCounter, 0 );
            $( '#customButton1' ).trigger( 'click' );
            assert.equal( customButtonClickCounter, 1 );

            done();
        }
    );
});

QUnit.test( 'subform test', function( assert ) {

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

QUnit.test( 'editable list test', function( assert ) {

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

