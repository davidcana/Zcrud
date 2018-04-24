"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var Qunit = require( 'qunit' );
var testHelper = require( './testHelper.js' );
var testUtils = require( './testUtils.js' );

var defaultTestOptions = require( './subformTestOptions.js' );
var thisTestOptions = {};
var options = $.extend( true, {}, defaultTestOptions, thisTestOptions );

var fatalErrorFunctionCounter = 0;

options.fatalErrorFunction = function( message ){
    ++fatalErrorFunctionCounter;
};

// Run tests
QUnit.test( "subform create test", function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // 
            var key = 3;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "description": "Description of Bart Simpson"
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        "description": "Description of Lisa Simpson"
                    }
                ]
            };
            testUtils.setService( key, record );

            $( '#departmentsContainer' ).zcrud( 'load' );

            // Go to edit form and edit record
            testHelper.clickUpdateListButton( key );
            
            // Add subform record 3
            var subformRecord3 = {
                "code": "3",
                "name": "Homer Simpson",
                "description": "Description of Homer Simpson"
            };
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillSubformNewRow( subformRecord3, 'members' );
            
            // Add subform record 4
            var subformRecord4 = {
                "code": "4",
                "name": "Marge Simpson",
                "description": "Description of Marge Simpson"
            };
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillSubformNewRow( subformRecord4, 'members' );
            
            // Build edited record and check form
            var editedRecord = $.extend( true, {}, record );
            editedRecord.members.push( subformRecord3 );
            editedRecord.members.push( subformRecord4 );
            testHelper.checkForm( assert, editedRecord );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();
            
            // Check storage
            assert.deepEqual( testUtils.getService( key ), editedRecord );
            
            // Go to edit form again and check the form again
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, editedRecord );

            done();
        }
    );
});

QUnit.test( "subform create and form create test", function( assert ) {

    var done = assert.async();
    delete options.fields[ 'province' ].defaultValue;
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            
            $( '#departmentsContainer' ).zcrud( 'load' );

            // 
            var key = 0;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "members": []
            };
            
            // Go to create form and create record
            testHelper.clickCreateListButton();
            testHelper.fillForm( record );

            // Add subform record 1
            var subformRecord1 = {
                "code": "1",
                "name": "Bart Simpson",
                "description": "Description of Bart Simpson"
            };
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillSubformNewRow( subformRecord1, 'members' );
            
            // Add subform record 2
            var subformRecord2 = {
                "code": "2",
                "name": "Lisa Simpson",
                "description": "Description of Lisa Simpson"
            }
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillSubformNewRow( subformRecord2, 'members' );

            // Build edited record and check form
            var editedRecord = $.extend( true, {}, record );
            editedRecord.members.push( subformRecord1 );
            editedRecord.members.push( subformRecord2 );
            testHelper.checkForm( assert, editedRecord );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();
            
            // Check storage
            assert.deepEqual( testUtils.getService( key ), editedRecord );
            
            // Go to edit form again and check the form again
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, editedRecord );

            done();
        }
    );
});

QUnit.test( "subform create undo/redo 1 action test", function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // 
            var key = 3;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "description": "Description of Bart Simpson"
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        "description": "Description of Lisa Simpson"
                    }
                ]
            };
            testUtils.setService( key, record );

            $( '#departmentsContainer' ).zcrud( 'load' );

            // Go to edit form and edit record
            testHelper.clickUpdateListButton( key );

            // Add subform record 3
            var subformRecord3 = {
                "code": "3",
                "name": "Homer Simpson",
                "description": "Description of Homer Simpson"
            };
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillSubformNewRow( subformRecord3, 'members' );

            // Add subform record 4
            var subformRecord4 = {
                "code": "4",
                "name": "Marge Simpson",
                "description": "Description of Marge Simpson"
            };
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillSubformNewRow( subformRecord4, 'members' );

            // Build edited record and check form
            var editedRecord = $.extend( true, {}, record );
            editedRecord.members.push( subformRecord3 );
            editedRecord.members.push( subformRecord4 );
            testHelper.checkForm( assert, editedRecord );
            
            testHelper.assertHistory( assert, 8, 0, false );
            var newRecord = $.extend( true, {} , record );
            newRecord.members.push( subformRecord3 );
            newRecord.members.push( subformRecord4 );
            var tempRecord = $.extend( true, {} , newRecord );
            
            // Undo
            testHelper.clickUndoButton();
            tempRecord.members[3].description = '';
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 7, 1, false );
            
            // Redo
            testHelper.clickRedoButton();
            tempRecord.members[3].description = newRecord.members[3].description;
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 8, 0, true );

            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testUtils.getService( key ), editedRecord );
            
            done();
        }
    );
});

QUnit.test( "subform create undo/redo 3 actions test", function( assert ) {

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // 
            var key = 3;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "description": "Description of Bart Simpson"
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        "description": "Description of Lisa Simpson"
                    }
                ]
            };
            testUtils.setService( key, record );

            $( '#departmentsContainer' ).zcrud( 'load' );

            // Go to edit form and edit record
            testHelper.clickUpdateListButton( key );

            // Add subform record 3
            var subformRecord3 = {
                "code": "3",
                "name": "Homer Simpson",
                "description": "Description of Homer Simpson"
            };
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillSubformNewRow( subformRecord3, 'members' );

            // Add subform record 4
            var subformRecord4 = {
                "code": "4",
                "name": "Marge Simpson",
                "description": "Description of Marge Simpson"
            };
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillSubformNewRow( subformRecord4, 'members' );

            // Build edited record and check form
            var editedRecord = $.extend( true, {}, record );
            editedRecord.members.push( subformRecord3 );
            editedRecord.members.push( subformRecord4 );
            testHelper.checkForm( assert, editedRecord );

            testHelper.assertHistory( assert, 8, 0, false );
            var newRecord = $.extend( true, {} , record );
            newRecord.members.push( subformRecord3 );
            newRecord.members.push( subformRecord4 );
            var tempRecord = $.extend( true, {} , newRecord );

            // Undo (1)
            testHelper.clickUndoButton();
            tempRecord.members[3].description = '';
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 7, 1, false );
            
            // Undo (2)
            testHelper.clickUndoButton();
            tempRecord.members[3].name = '';
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 6, 2, false );
            
            // Undo (3)
            testHelper.clickUndoButton();
            tempRecord.members[3].code = '';
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 5, 3, false );
            
            // Redo (1)
            testHelper.clickRedoButton();
            tempRecord.members[3].code = newRecord.members[3].code;
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 6, 2, true );
            
            // Redo (2)
            testHelper.clickRedoButton();
            tempRecord.members[3].name = newRecord.members[3].name;
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 7, 1, true );
            
            // Redo (3)
            testHelper.clickRedoButton();
            tempRecord.members[3].description = newRecord.members[3].description;
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 8, 0, true );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testUtils.getService( key ), editedRecord );

            done();
        }
    );
});
