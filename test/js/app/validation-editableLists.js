
//var zzDOM = require( '../../../js/app/zzDOMPlugin.js' );
//var $ = zzDOM.zz;
//var Qunit = require( 'qunit' );
//var utils = require( '../../../js/app/utils.js' );
//var testHelper = require( './testHelper.js' );
//var testServerSide = require( './testServerSide' );
//var defaultTestOptions = require( './editableListTestOptions.js' );

import { utils } from '../../../js/app/utils.js';
import { zzDOM } from '../../../js/app/zzDOMPlugin.js';
var $ = zzDOM.zz;

import { testHelper } from './testHelper.js';
import { testServerSide } from './testServerSide.js';

import { editableListTestOptions as defaultTestOptions } from './editableListTestOptions.js';

var thisTestOptions = {};

var errorFunctionCounter = 0;
defaultTestOptions.errorFunction = function( message ){
    ++errorFunctionCounter;
};

var options = utils.extend( true, {}, defaultTestOptions, thisTestOptions );

// Run tests
QUnit.test( 'create test', function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;

            // Assert register with key 0 doesn't exist
            var key = 0;
            var newRecord =  {
                'id': '' + key,
                'name': '-' // Validation must fail here!
                //'name': 'Service ' + key
            };
            testHelper.checkNoRecord( assert, key, newRecord, editable );
            testHelper.clickCreateRowListButton();
            testHelper.fillNewRowEditableList( newRecord );
            assert.equal( testHelper.getNumberOfValidationErrors(), 1 );
            
            // Try to create record (1 error)
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 1 );
            assert.equal( testHelper.getNumberOfValidationErrors(), 1 );
            testHelper.checkNoRecord( assert, key, newRecord, editable );
            
            // Fix the error
            var editedRecord =  {
                'name': 'Service ' + key
            };
            testHelper.fillNewRowEditableList( editedRecord );
            assert.equal( testHelper.getNumberOfValidationErrors(), 0 );

            // Try to edit record (no errors)
            errorFunctionCounter = 0;
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );
            assert.equal( testHelper.getNumberOfValidationErrors(), 0 );

            var fixedRecord = utils.extend( true, {}, newRecord, editedRecord );
            testHelper.checkRecord( assert, key, fixedRecord, editable, true );

            done();
        }
    );
});

QUnit.test( 'create undo/redo 1 action test', function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;

            // Assert register with key 0 doesn't exist
            var key = 0;
            var newRecord =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkNoRecord( assert, key, newRecord, editable );
            testHelper.clickCreateRowListButton();
            testHelper.fillNewRowEditableList( newRecord );
            assert.equal( testHelper.getNumberOfValidationErrors(), 0 );

            // Set an invalid name
            var badRecord = utils.extend( true, {}, newRecord );
            badRecord.name = '' + key;
            testHelper.fillNewRowEditableList( badRecord);
            assert.equal( testHelper.getNumberOfValidationErrors(), 1 );
            testHelper.checkEditableListLastRow( assert, badRecord );
            
            // Try to create record (1 error)
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 1 );
            assert.equal( testHelper.getNumberOfValidationErrors(), 1 );
            testHelper.checkNoRecord( assert, key, newRecord, editable );
            
            // Fix the form undoing
            testHelper.clickUndoButton();
            assert.equal( testHelper.getNumberOfValidationErrors(), 0 );
            testHelper.checkEditableListLastRow( assert, newRecord );

            // Set the name to an invalid value again redoing
            testHelper.clickRedoButton();
            assert.equal( testHelper.getNumberOfValidationErrors(), 1 );
            testHelper.checkEditableListLastRow( assert, badRecord );
            
            // Fix the form undoing again
            testHelper.clickUndoButton();
            assert.equal( testHelper.getNumberOfValidationErrors(), 0 );
            testHelper.checkEditableListLastRow( assert, newRecord );
            
            // Create record (no errors)
            errorFunctionCounter = 0;
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkRecord( assert, key, newRecord, editable, true );

            done();
        }
    );
});

QUnit.test( 'change test', function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, record, editable );

            // Edit record
            var editedRecord =  {
                'name': '-' // Validation must fail here!
            };
            testHelper.fillEditableList( editedRecord, key );
            assert.equal( testHelper.getNumberOfValidationErrors(), 1 );
            
            // Try to edit record (1 error)
            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 1 );
            assert.equal( testHelper.getNumberOfValidationErrors(), 1 );
            testHelper.checkRecord( assert, key, record, editable, true );
            
            // Fix the error
            editedRecord =  {
                'name': 'Service ' + key + ' edited'
            };
            testHelper.fillEditableList( editedRecord, key );
            assert.equal( testHelper.getNumberOfValidationErrors(), 0 );
            
            // Try to edit record (no errors)
            newRecord = utils.extend( true, {}, record, editedRecord );
            errorFunctionCounter = 0;
            testHelper.checkEditableListForm( assert, key, newRecord );
            
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );
            assert.equal( testHelper.getNumberOfValidationErrors(), 0 );
            
            testHelper.checkRecord( assert, key, newRecord, editable );

            done();
        }
    );
});

QUnit.test( 'change undo/redo 1 action test', function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, record, editable );

            // Edit record
            var editedRecord =  {
                'name': 'Service ' + key + ' edited'
            };
            testHelper.fillEditableList( editedRecord, key );
            assert.equal( testHelper.getNumberOfValidationErrors(), 0 );
            
            // Set an invalid name
            var badRecord = utils.extend( true, {}, record, editedRecord );
            badRecord.name = '' + key;
            testHelper.fillEditableList( badRecord, key );
            assert.equal( testHelper.getNumberOfValidationErrors(), 1 );
            testHelper.checkEditableListForm( assert, key, badRecord );
            
            // Try to edit record (1 error)
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 1 );
            errorFunctionCounter = 0;

            // Fix the form undoing
            testHelper.clickUndoButton();
            assert.equal( testHelper.getNumberOfValidationErrors(), 0 );
            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkEditableListForm( assert, key, newRecord );
            
            // Set the name to an invalid value again redoing
            testHelper.clickRedoButton();
            assert.equal( testHelper.getNumberOfValidationErrors(), 1 );
            testHelper.checkEditableListForm( assert, key, badRecord );
            
            // Fix the form undoing again
            testHelper.clickUndoButton();
            assert.equal( testHelper.getNumberOfValidationErrors(), 0 );
            testHelper.checkEditableListForm( assert, key, newRecord );
            
            // Edit record (no errors)
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkRecord( assert, key, newRecord, editable );

            done();
        }
    );
});
