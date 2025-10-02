
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
QUnit.test( 'delete test', function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            
            // Update record in server
            var key = 6;
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
                    },
                    {
                        'code': '3',
                        'name': 'Homer Simpson',
                        'description': 'Description of Homer Simpson'
                    },
                    {
                        'code': '4',
                        'name': 'Marge Simpson',
                        'description': 'Description of Marge Simpson'
                    }
                ]
            };
            testServerSide.setService( key, record );
            
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );
            
            testServerSide.setService( key, record );
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
            
            // Delete row 2 of members
            var subformIndexToDelete = 2;
            testHelper.clickDeleteSubformRowButton( 'members', subformIndexToDelete );
            
            var editedRecord = utils.extend( true, {} , record );
            editedRecord.members.splice( subformIndexToDelete, 1 );
            testHelper.checkForm( assert, editedRecord );
            
            // Submit and show the list again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );
            
            // Check storage
            assert.deepEqual( testServerSide.getService( key ), editedRecord );
            
            // Go to edit form again and test form
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, editedRecord );
            
            done();
        }
    );
});

QUnit.test( 'delete 3 rows test', function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();

            // Update record in server
            var key = 6;
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
                    },
                    {
                        'code': '3',
                        'name': 'Homer Simpson',
                        'description': 'Description of Homer Simpson'
                    },
                    {
                        'code': '4',
                        'name': 'Marge Simpson',
                        'description': 'Description of Marge Simpson'
                    }
                ]
            };
            testServerSide.setService( key, record );

            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            testServerSide.setService( key, record );
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

            // Delete rows 1, 2 and 4 of members
            var subformIndexToDelete1 = 3;
            var subformIndexToDelete2 = 1;
            var subformIndexToDelete3 = 0;
            testHelper.clickDeleteSubformRowButton( 'members', subformIndexToDelete1 );
            testHelper.clickDeleteSubformRowButton( 'members', subformIndexToDelete2 );
            testHelper.clickDeleteSubformRowButton( 'members', subformIndexToDelete3 );
            
            var editedRecord = utils.extend( true, {} , record );
            editedRecord.members.splice( subformIndexToDelete1, 1 );
            editedRecord.members.splice( subformIndexToDelete2, 1 );
            editedRecord.members.splice( subformIndexToDelete3, 1 );
            testHelper.checkForm( assert, editedRecord );
            
            // Submit and show the list again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), editedRecord );

            // Go to edit form again and test form
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, editedRecord );

            done();
        }
    );
});

QUnit.test( 'delete undo/redo 1 action test', function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();

            // Update record in server
            var key = 6;
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
                    },
                    {
                        'code': '3',
                        'name': 'Homer Simpson',
                        'description': 'Description of Homer Simpson'
                    },
                    {
                        'code': '4',
                        'name': 'Marge Simpson',
                        'description': 'Description of Marge Simpson'
                    }
                ]
            };
            testServerSide.setService( key, record );

            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            testServerSide.setService( key, record );
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

            // Delete row 2 of members
            var subformIndexToDelete = 2;
            testHelper.clickDeleteSubformRowButton( 'members', subformIndexToDelete );
            
            var editedRecord = utils.extend( true, {} , record );
            editedRecord.members.splice( subformIndexToDelete, 1 );
            testHelper.checkForm( assert, editedRecord );
            
            // Undo
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 1, 0, true );
            
            // Submit and show the list again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), editedRecord );

            // Go to edit form again and test form
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, editedRecord );

            done();
        }
    );
});

QUnit.test( 'delete undo/redo 3 actions test', function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();

            // Update record in server
            var key = 6;
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
                    },
                    {
                        'code': '3',
                        'name': 'Homer Simpson',
                        'description': 'Description of Homer Simpson'
                    },
                    {
                        'code': '4',
                        'name': 'Marge Simpson',
                        'description': 'Description of Marge Simpson'
                    }
                ]
            };
            testServerSide.setService( key, record );

            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            testServerSide.setService( key, record );
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

            // Delete rows 1, 2 and 4 of members
            var subformIndexToDelete1 = 3;
            var subformIndexToDelete2 = 1;
            var subformIndexToDelete3 = 0;
            testHelper.clickDeleteSubformRowButton( 'members', subformIndexToDelete1 );
            testHelper.clickDeleteSubformRowButton( 'members', subformIndexToDelete2 );
            testHelper.clickDeleteSubformRowButton( 'members', subformIndexToDelete3 );

            var member0 = record.members[ 0 ];
            var member1 = record.members[ 1 ];
            var member2 = record.members[ 2 ];
            var member3 = record.members[ 3 ];
            var editedRecord = utils.extend( true, {} , record );
            editedRecord.members.splice( subformIndexToDelete1, 1 );
            editedRecord.members.splice( subformIndexToDelete2, 1 );
            editedRecord.members.splice( subformIndexToDelete3, 1 );
            testHelper.checkForm( assert, editedRecord );
            
            testHelper.assertHistory( assert, 3, 0, false );
            
            // Undo (1)
            var tempRecord = utils.extend( true, {} , record );
            tempRecord.members = [ member0, member2 ];
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 2, 1, false );
            
            // Undo (2)
            tempRecord.members = [ member0, member1, member2 ];
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 1, 2, false );
            
            // Undo (3)
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 0, 3, false );
            
            // Redo (1)
            tempRecord.members = [ member0, member1, member2 ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 1, 2, true );
            
            // Redo (2)
            tempRecord.members = [ member0, member2 ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 2, 1, true );
            
            // Redo (3)
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 3, 0, true );
            
            // Submit and show the list again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), editedRecord );

            // Go to edit form again and test form
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, editedRecord );

            done();
        }
    );
});
