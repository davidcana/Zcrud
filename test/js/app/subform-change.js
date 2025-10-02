
//var zzDOM = require( '../../../js/app/zzDOMPlugin.js' );
//var $ = zzDOM.zz;
//var Qunit = require( 'qunit' );
//var utils = require( '../../../js/app/utils.js' );
//var testHelper = require( './testHelper.js' );
//var testServerSide = require( './testServerSide.js' );
//var defaultTestOptions = require( './subformTestOptions.js' );

import { utils } from '../../../js/app/utils.js';
import { zzDOM } from '../../../js/app/zzDOMPlugin.js';
var $ = zzDOM.zz;

import { testHelper } from './testHelper.js';
import { testServerSide } from './testServerSide.js';

import { subformTestOptions as defaultTestOptions } from './subformTestOptions.js';

var thisTestOptions = {};
var options = utils.extend( true, {}, defaultTestOptions, thisTestOptions );

var errorFunctionCounter = 0;

options.errorFunction = function( message ){
    ++errorFunctionCounter;
};

// Run tests
QUnit.test( 'subform change test', function( assert ) {

    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            
            // 
            var key = 4;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key,
                'members': [
                    {
                        'code': '1',
                        'name': 'Bart Simpson',
                        'description': 'Description of Bart Simpson'
                    },
                    {
                        'code': '2',
                        'name': 'Lisa Simpson',
                        'description': 'Description of Lisa Simpson'
                    }
                ]
            };
            testServerSide.setService( key, record );
            
            $( '#departmentsContainer' ).zcrud( 'renderList' );
            
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
                'name': 'Service ' + key + ' edited',
                'members': {
                    '0': {
                        'description': 'Description of Bart Simpson edited'
                    },
                    '1': {
                        'name': 'Lisa Simpson edited',
                        'description': 'Description of Lisa Simpson edited'
                    }
                }
            };
            
            testHelper.fillForm( editedRecord );
            
            var newRecord =  {
                'id': '' + key,
                'name': 'Service ' + key + ' edited',
                'members': [
                    {
                        'code': '1',
                        'name': 'Bart Simpson',
                        'description': 'Description of Bart Simpson edited'
                    },
                    {
                        'code': '2',
                        'name': 'Lisa Simpson edited',
                        'description': 'Description of Lisa Simpson edited'
                    }
                ]
            };
            testHelper.checkForm( assert, newRecord );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();
            
            // Check storage
            assert.deepEqual( testServerSide.getService( key ), newRecord );
            
            // Go to edit form again and check the form again
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, newRecord );
            
            done();
        }
    );
});

QUnit.test( 'subform change undo/redo 1 action test', function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // 
            var key = 4;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key,
                'members': [
                    {
                        'code': '1',
                        'name': 'Bart Simpson',
                        'description': 'Description of Bart Simpson'
                    },
                    {
                        'code': '2',
                        'name': 'Lisa Simpson',
                        'description': 'Description of Lisa Simpson'
                    }
                ]
            };
            testServerSide.setService( key, record );

            $( '#departmentsContainer' ).zcrud( 'renderList' );

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
                'name': 'Service ' + key + ' edited',
                'members': {
                    '0': {
                        'description': 'Description of Bart Simpson edited'
                    },
                    '1': {
                        'name': 'Lisa Simpson edited',
                        'description': 'Description of Lisa Simpson edited'
                    }
                }
            };

            testHelper.fillForm( editedRecord );

            var newRecord =  {
                'id': '' + key,
                'name': 'Service ' + key + ' edited',
                'members': [
                    {
                        'code': '1',
                        'name': 'Bart Simpson',
                        'description': 'Description of Bart Simpson edited'
                    },
                    {
                        'code': '2',
                        'name': 'Lisa Simpson edited',
                        'description': 'Description of Lisa Simpson edited'
                    }
                ]
            };
            testHelper.checkForm( assert, newRecord );

            testHelper.assertHistory( assert, 4, 0, true );

            var tempRecord = utils.extend( true, {} , newRecord );
            
            // Undo
            testHelper.clickUndoButton();
            tempRecord.members[1].description = record.members[1].description;
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 3, 1, false );
            
            // Redo
            testHelper.clickRedoButton();
            tempRecord.members[1].description = newRecord.members[1].description;
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 4, 0, true );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), newRecord );

            // Go to edit form again and check the form again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkForm( assert, newRecord );
            
            done();
        }
    );
});

QUnit.test( 'subform change undo/redo 3 actions test', function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // 
            var key = 4;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key,
                'members': [
                    {
                        'code': '1',
                        'name': 'Bart Simpson',
                        'description': 'Description of Bart Simpson'
                    },
                    {
                        'code': '2',
                        'name': 'Lisa Simpson',
                        'description': 'Description of Lisa Simpson'
                    }
                ]
            };
            testServerSide.setService( key, record );

            $( '#departmentsContainer' ).zcrud( 'renderList' );

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
                'name': 'Service ' + key + ' edited',
                'members': {
                    '0': {
                        'description': 'Description of Bart Simpson edited'
                    },
                    '1': {
                        'name': 'Lisa Simpson edited',
                        'description': 'Description of Lisa Simpson edited'
                    }
                }
            };
            
            testHelper.fillForm( editedRecord );

            var newRecord =  {
                'id': '' + key,
                'name': 'Service ' + key + ' edited',
                'members': [
                    {
                        'code': '1',
                        'name': 'Bart Simpson',
                        'description': 'Description of Bart Simpson edited'
                    },
                    {
                        'code': '2',
                        'name': 'Lisa Simpson edited',
                        'description': 'Description of Lisa Simpson edited'
                    }
                ]
            };
            testHelper.checkForm( assert, newRecord );

            testHelper.assertHistory( assert, 4, 0, true );

            var tempRecord = utils.extend( true, {} , newRecord );
            
            // Undo (1)
            testHelper.clickUndoButton();
            tempRecord.members[1].description = record.members[1].description;
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 3, 1, false );
            
            // Undo (2)
            testHelper.clickUndoButton();
            tempRecord.members[1].name = record.members[1].name;
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 2, 2, false );
            
            // Undo (3)
            testHelper.clickUndoButton();
            tempRecord.members[0].description = record.members[0].description;
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 1, 3, false );
            
            // Redo (1)
            testHelper.clickRedoButton();
            tempRecord.members[0].description = newRecord.members[0].description;
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 2, 2, true );
            
            // Redo (2)
            testHelper.clickRedoButton();
            tempRecord.members[1].name = newRecord.members[1].name;
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 3, 1, true );
            
            // Redo (3)
            testHelper.clickRedoButton();
            tempRecord.members[1].description = newRecord.members[1].description;
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 4, 0, true );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), newRecord );

            // Go to edit form again and check the form again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkForm( assert, newRecord );
            
            done();
        }
    );
});
