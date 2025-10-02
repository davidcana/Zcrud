
//var zzDOM = require( '../../../js/app/zzDOMPlugin.js' );
//var $ = zzDOM.zz;
//var Qunit = require( 'qunit' );
//var testServerSide = require( './testServerSide.js' );
//var testHelper = require( './testHelper.js' );
//var context = require( '../../../js/app/context.js' );
//var utils = require( '../../../js/app/utils.js' );
//var defaultTestOptions = require( './defaultTestOptions.js' );

import { utils } from '../../../js/app/utils.js';
import { context } from '../../../js/app/context.js';
import { zzDOM } from '../../../js/app/zzDOMPlugin.js';
var $ = zzDOM.zz;

import { testHelper } from './testHelper.js';
import { testServerSide } from './testServerSide.js';

import { defaultTestOptions } from './defaultTestOptions.js';

var options;

// Run tests
QUnit.test( 'create test', function( assert ) {
    
    options = utils.extend( true, {}, defaultTestOptions );
    
    testServerSide.resetServices();
    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 0 not exists
            var key = 0;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key,
                'description': 'Service ' + key + ' description',
                'date': '10/23/2017',
                'time': '18:50',
                'datetime': '10/23/2017 20:00',
                'phoneType': 'officePhone_option',
                'province': 'Málaga',
                'city': 'Marbella',
                'browser': 'Firefox',
                'important': true,
                'number': '3',
                'hobbies': [ 'reading_option', 'sports_option' ]
            };
            testHelper.checkNoRecord( assert, key );
            var values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 10 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 129',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
            });
            
            // Go to create form and create record
            testHelper.clickCreateListButton();
            testHelper.fillForm( record );
            testHelper.checkForm( assert, record );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();
            values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 0, 9 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 130',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
            });
            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( record, options.fields ) );
            
            // Go to edit form again and check record
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, record );
            
            // Return to list again and check it
            testHelper.clickFormCancelButton();
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 130',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
            });
            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( record, options.fields ) );
            
            done();
        }
    );
});

QUnit.test( 'create with default values test', function( assert ) {
    
    options = utils.extend( true, {}, defaultTestOptions );
    
    testServerSide.resetServices();
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 0 not exists
            var key = 0;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key,
                'description': 'Service ' + key + ' description',
                'date': '10/23/2017',
                'time': '18:50',
                'datetime': '10/23/2017 20:00',
                'phoneType': 'officePhone_option',
                'city': 'Algeciras',
                'browser': 'Firefox',
                'important': true,
                'number': '3',
                'hobbies': [ 'reading_option', 'sports_option' ]
            };
            var fullRecord = utils.extend( true, {}, record );
            fullRecord.province = 'Cádiz';
            
            testHelper.checkNoRecord( assert, key );
            var values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 10 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 129',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
            });
            
            // Go to create form and create record
            testHelper.clickCreateListButton();
            testHelper.fillForm( record );
            testHelper.checkForm( assert, fullRecord );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();
            values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 0, 9 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 130',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
            });
            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( fullRecord, options.fields ) );
            
            // Go to edit form again and check record
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, fullRecord );
            
            // Return to list again and check it
            testHelper.clickFormCancelButton();
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 130',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
            });
            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( fullRecord, options.fields ) );
            
            done();
        }
    );
});
