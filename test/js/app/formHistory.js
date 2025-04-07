"use strict";

//var $ = require( 'zzdom' );
//var zcrud = require( '../../../js/app/main.js' );
var zzDOM = require( '../../../js/app/zzDOMPlugin.js' );
var $ = zzDOM.zz;
var Qunit = require( 'qunit' );
var utils = require( '../../../js/app/utils.js' );
var testHelper = require( './testHelper.js' );
var testServerSide = require( './testServerSide.js' );

var defaultTestOptions = require( './defaultTestOptions.js' );
var thisTestOptions = {};
var options = utils.extend( true, {}, defaultTestOptions, thisTestOptions );

var errorFunctionCounter = 0;

options.errorFunction = function( message ){
    ++errorFunctionCounter;
};

$( '#departmentsContainer' ).zcrud( 
    'init',
    options,
    function( options ){
        
        // Run tests
        QUnit.test( "change undo/redo 1 action test (name)", function( assert ) {

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );
            
            var editable = false;
            var checkOnlyStorage = true;
            
            // Assert register with key 2 exists
            var key = 7;
            var record =  {
                "id": "" + key,
                "name": "Service " + key
            };
            testHelper.checkRecord( assert, key, record );
            
            testHelper.clickUpdateListButton( key );
            
            // Edit record
            var editedRecord =  {
                "name": "Service " + key + " edited"
            };
            testHelper.setFormVal( editedRecord, 'name' );
            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );
            
            // Undo
            testHelper.clickUndoButton();
            testHelper.checkRecord( assert, key, record, editable, checkOnlyStorage );
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 0, 1, false );
            
            // Redo
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );
            
            // Save
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );
            
            testHelper.checkRecord( assert, key, newRecord, editable );
        });
        
        QUnit.test( "change undo/redo all actions test (name)", function( assert ) {

            testServerSide.resetServices();
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = false;
            var checkOnlyStorage = true;

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                "id": "" + key,
                "name": "Service " + key
            };
            testHelper.checkRecord( assert, key, record );
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
                "name": "Service " + key + " edited",
                "description": "Service " + key + " description",
                "date": "10/23/2017",
                "time": "18:50",
                "datetime": "10/23/2017 20:00",
                "phoneType": "officePhone_option",
                "province": "Cádiz",
                "city": "Tarifa",
                "browser": "Firefox",
                "important": true,
                "number": "3"
            };

            testHelper.fillForm( editedRecord );
            var newRecord = utils.extend( true, {}, record, editedRecord );
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 11, 0, true );
            
            // Undo (1)
            testHelper.clickUndoButton();
            newRecord.number = undefined;
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 10, 1, true );
            
            // Undo (2)
            testHelper.clickUndoButton();
            newRecord.important = false;
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 9, 2, true );
            
            // Undo (3)
            testHelper.clickUndoButton();
            newRecord.browser = '';
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 8, 3, true );
            
            // Undo (4)
            testHelper.clickUndoButton();
            newRecord.city = undefined;
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 7, 4, true );
            
            // Undo (5)
            testHelper.clickUndoButton();
            newRecord.province = undefined;
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 6, 5, true );
            
            // Undo (6)
            testHelper.clickUndoButton();
            newRecord.phoneType = undefined;
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 5, 6, true );
            
            // Undo (7)
            testHelper.clickUndoButton();
            newRecord.datetime = undefined;
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 4, 7, true );
            
            // Undo (8)
            testHelper.clickUndoButton();
            newRecord.time = undefined;
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 3, 8, true );
            
            // Undo (9)
            testHelper.clickUndoButton();
            newRecord.date = undefined;
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 2, 9, true );
            
            // Undo (10)
            testHelper.clickUndoButton();
            newRecord.description = undefined;
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 1, 10, true );
            
            // Undo (11)
            testHelper.clickUndoButton();
            newRecord.name = record.name;
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 0, 11, false );
            
            // Redo (1)
            testHelper.clickRedoButton();
            newRecord.name = editedRecord.name;
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 1, 10, true );
            
            // Redo (2)
            testHelper.clickRedoButton();
            newRecord.description = editedRecord.description;
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 2, 9, true );
            
            // Redo (3)
            testHelper.clickRedoButton();
            newRecord.date = editedRecord.date;
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 3, 8, true );
            
            // Redo (4)
            testHelper.clickRedoButton();
            newRecord.time = editedRecord.time;
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 4, 7, true );
            
            // Redo (5)
            testHelper.clickRedoButton();
            newRecord.datetime = editedRecord.datetime;
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 5, 6, true );
            
            // Redo (6)
            testHelper.clickRedoButton();
            newRecord.phoneType = editedRecord.phoneType;
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 6, 5, true );
            
            // Redo (7)
            testHelper.clickRedoButton();
            newRecord.province = editedRecord.province;
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 7, 4, true );
            
            // Redo (8)
            testHelper.clickRedoButton();
            newRecord.city = editedRecord.city;
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 8, 3, true );
            
            // Redo (9)
            testHelper.clickRedoButton();
            newRecord.browser = editedRecord.browser;
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 9, 2, true );
            
            // Redo (10)
            testHelper.clickRedoButton();
            newRecord.important = editedRecord.important;
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 10, 1, true );
            
            // Redo (11)
            testHelper.clickRedoButton();
            newRecord.number = editedRecord.number;
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 11, 0, true );

            // Save
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkRecord( assert, key, newRecord, editable );
        });
    });
