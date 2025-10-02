
//var zzDOM = require( '../../../js/app/zzDOMPlugin.js' );
//var $ = zzDOM.zz;
//var Qunit = require( 'qunit' );
//var utils = require( '../../../js/app/utils.js' );
//var testHelper = require( './testHelper.js' );
//var testServerSide = require( './testServerSide.js' );
//var defaultTestOptions = require( './editableListTestOptions.js' );

import { utils } from '../../../js/app/utils.js';
import { zzDOM } from '../../../js/app/zzDOMPlugin.js';
var $ = zzDOM.zz;

import { testHelper } from './testHelper.js';
import { testServerSide } from './testServerSide.js';

import { editableListTestOptions as defaultTestOptions } from './editableListTestOptions.js';

var options = utils.extend( true, {}, defaultTestOptions );

var errorFunctionCounter = 0;

options.errorFunction = function( message ){
    ++errorFunctionCounter;
};

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
                'name': 'Service ' + key
            };
            testHelper.checkNoRecord( assert, key, newRecord, editable );
            var values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 10 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 129',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ],
                editable: editable
            });

            testHelper.clickCreateRowListButton();
            testHelper.fillNewRowEditableList( newRecord );
            
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );
            
            testHelper.checkRecord( assert, key, newRecord, editable, true );
            
            values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 10, 19 ) );
            testHelper.pagingTest({
                action: { 
                    nextPage: true
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 11-20 of 130',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '2' ],
                pageListActive: [ '<<', '<', '1', '3', '4', '5', '13', '>', '>>' ],
                editable: true
            });
            
            values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 0, 9 ) );
            testHelper.pagingTest({
                action: { 
                    previousPage: true
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 130',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ],
                editable: true
            });
            
            done();
        }
    );
});

QUnit.test( 'create with errors test', function( assert ) {
    
    var done = assert.async();

    // Set number as required
    //var errorOptions = utils.extend( true, {}, defaultTestOptions, thisTestOptions );
    var errorOptions = utils.extend( true, {}, options );
    errorOptions.fields.number.attributes.field.required = '';

    $( '#departmentsContainer' ).zcrud( 
        'init',
        errorOptions,
        function( options ){
            
            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;

            // Assert register with key 0 doesn't exist
            var key = 0;
            var newRecord =  {
                'id': '' + key,
                'name': 'Service ' + key,
                'number': 'a'
            };
            testHelper.checkNoRecord( assert, key, newRecord, editable );
            var values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 10 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 129',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ],
                editable: editable
            });

            testHelper.clickCreateRowListButton();
            testHelper.fillNewRowEditableList( newRecord );

            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 1 );

            testHelper.checkNoRecord( assert, key, newRecord, editable );

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
                'name': 'Service ' + key,
                'number': 'a'
            };
            testHelper.checkNoRecord( assert, key, newRecord, editable );
            var values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 10 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 129',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ],
                editable: editable
            });

            testHelper.assertHistory( assert, 0, 0, false );
            testHelper.clickCreateRowListButton();
            testHelper.assertHistory( assert, 1, 0, false );

            // Undo
            testHelper.clickUndoButton();
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            testHelper.clickRedoButton();
            testHelper.assertHistory( assert, 1, 0, false );
            
            done();
        }
    );
});
        
QUnit.test( 'create undo/redo 3 action test', function( assert ) {
    
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
                'name': 'Service ' + key,
                'number': 'a'
            };
            testHelper.checkNoRecord( assert, key, newRecord, editable );
            var values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 10 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 129',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ],
                editable: editable
            });

            // Create row (1)
            testHelper.assertHistory( assert, 0, 0, false );
            testHelper.clickCreateRowListButton();
            testHelper.assertHistory( assert, 1, 0, false );

            // Create row (2)
            testHelper.clickCreateRowListButton();
            testHelper.assertHistory( assert, 2, 0, false );

            // Create row (3)
            testHelper.clickCreateRowListButton();
            testHelper.assertHistory( assert, 3, 0, false );

            // Undo (1)
            testHelper.clickUndoButton();
            testHelper.assertHistory( assert, 2, 1, false );

            // Undo (2)
            testHelper.clickUndoButton();
            testHelper.assertHistory( assert, 1, 2, false );

            // Undo (3)
            testHelper.clickUndoButton();
            testHelper.assertHistory( assert, 0, 3, false );

            // Redo (1)
            testHelper.clickRedoButton();
            testHelper.assertHistory( assert, 1, 2, false );

            // Redo (2)
            testHelper.clickRedoButton();
            testHelper.assertHistory( assert, 2, 1, false );

            // Redo (3)
            testHelper.clickRedoButton();
            testHelper.assertHistory( assert, 3, 0, false );
            
            done();
        }
    );
});

QUnit.test( 'create with default values test', function( assert ) {

    var defaultRecord = {
        number: '0'
    };
    var thisTestOptions = {
        fields: {
            number: { 
                defaultValue: defaultRecord.number
            }
        }
    };
    options = utils.extend( true, {}, defaultTestOptions, thisTestOptions );
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
            var clientRecord =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkNoRecord( assert, key, clientRecord, editable );
            var values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 10 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 129',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ],
                editable: editable
            });
            
            testHelper.clickCreateRowListButton();
            testHelper.fillNewRowEditableList( clientRecord );
            var newRecord = utils.extend( true, {}, defaultRecord, clientRecord );
            
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );
            
            testHelper.checkRecord( assert, key, newRecord, editable, true );
            
            values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 10, 19 ) );
            testHelper.pagingTest({
                action: { 
                    nextPage: true
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 11-20 of 130',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '2' ],
                pageListActive: [ '<<', '<', '1', '3', '4', '5', '13', '>', '>>' ],
                editable: true
            });

            values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 0, 9 ) );
            testHelper.pagingTest({
                action: { 
                    previousPage: true
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 130',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ],
                editable: true
            });

            done();
        }
    );
});
