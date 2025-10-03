
import { utils } from '../../../js/app/utils.js';
import { context } from '../../../js/app/context.js';
import { zzDOM } from '../../../js/app/zzDOMPlugin.js';
var $ = zzDOM.zz;

import { testHelper } from './testHelper.js';

import { defaultTestOptions } from './defaultTestOptions.js';

var options = undefined;

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

QUnit.test( 'update test', function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( record, options.fields ) );
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

            // Go to edit form and edit record
            testHelper.clickUpdateListButton( key );
            var editedRecord =  {
                'name': 'Service 2 edited',
                'description': 'Service 2 description',
                'date': '10/23/2017',
                'time': '18:50',
                'datetime': '10/23/2017 20:00',
                'phoneType': 'officePhone_option',
                'province': 'Cádiz',
                'city': 'Tarifa',
                'browser': 'Firefox',
                'important': true,
                'number': '3',
                'hobbies': [ 'reading_option', 'sports_option' ]
            };

            testHelper.fillForm( editedRecord );
            var newRecord = utils.extend( true, {}, record, editedRecord );

            testHelper.checkForm( assert, newRecord );

            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            var valuesList = testHelper.buildValuesList( 1, 10 );
            valuesList[ 1 ] = valuesList[ 1 ].replace( '/' + record.name + '/', '/' + editedRecord.name + '/' );
            values = testHelper.buildCustomValuesList( valuesList );

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
            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( newRecord, options.fields ) );

            // Go to edit form again and check record
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, newRecord );

            // Return to list again and check it
            testHelper.clickFormCancelButton();
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
            testHelper.checkRecord( assert, key, context.getFieldBuilder().filterValues( newRecord, options.fields ) );

            done();
        }
    );
});
