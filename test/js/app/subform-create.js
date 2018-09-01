"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var Qunit = require( 'qunit' );
var testHelper = require( './testHelper.js' );
var testUtils = require( './testUtils.js' );

var defaultTestOptions = require( './subformTestOptions.js' );
var options = $.extend( true, {}, defaultTestOptions );

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

            $( '#departmentsContainer' ).zcrud( 'renderList' );

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
            
            $( '#departmentsContainer' ).zcrud( 'renderList' );

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

            $( '#departmentsContainer' ).zcrud( 'renderList' );

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

            $( '#departmentsContainer' ).zcrud( 'renderList' );

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


QUnit.test( "subform create undo/redo 1 action with default values test", function( assert ) {
    
    var defaultMember = {
        code: '',
        name: 'Default name',
        description: 'Default description'
    };
    var thisTestOptions = {
        fields: {
            members: {
                fields: { 
                    name: { 
                        defaultValue: defaultMember.name
                    },
                    description: {
                        defaultValue: defaultMember.description
                    }
                }
            }
        }
    };
    options = $.extend( true, {}, defaultTestOptions, thisTestOptions );
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

            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form and edit record
            testHelper.clickUpdateListButton( key );

            // Add subform record 3
            var subformRecord3 = {
                "code": "3",
                "name": "Homer Simpson"
            };
            testHelper.clickCreateSubformRowButton( 'members' );
            
            testHelper.fillSubformNewRow( subformRecord3, 'members' );
            
            // Build editedSubformRecord3
            var editedSubformRecord3 = $.extend( true, {}, subformRecord3 );
            editedSubformRecord3.description = defaultMember.description;
            
            // Build edited record and check form
            var editedRecord = $.extend( true, {}, record );
            editedRecord.members.push( editedSubformRecord3 );
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 3, 0, false );
            
            // Undo
            testHelper.clickUndoButton();
            editedRecord.members[2].name = defaultMember.name;
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 2, 1, false );
            
            // Redo
            testHelper.clickRedoButton();
            editedRecord.members[2].name = subformRecord3.name;
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 3, 0, true );

            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testUtils.getService( key ), editedRecord );

            done();
        }
    );
});

QUnit.test( "add records to subform test", function( assert ) {

    // Setup services
    testUtils.resetServices();
    var key = 4;
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
            },
            {
                "code": "3",
                "name": "Marge Simpson",
                "description": "Description of Marge Simpson"
            },
            {
                "code": "4",
                "name": "Homer Simpson",
                "description": "Description of Homer Simpson"
            }
        ]
    };
    testUtils.setService( key, record );

    var thisTestOptions = {
        pageConf: {
            pages: {
                update: {
                    buttons: {
                        toolba2: [ 
                            'undo', 
                            'redo', 
                            'form_cancel', 
                            'form_submit', 
                            {
                                type: 'addMembers',
                                textsBundle: {
                                    title: undefined,
                                    content: {
                                        translate: false,
                                        text: 'Add members'
                                    }  
                                }
                            }
                        ]
                    }
                }
            }
        },
        events: {
            formCreated: function ( data ) {
                $( 'button.addMembers' ).click( 
                    function ( event ) {
                        event.preventDefault();
                        addMembers( 'members', newMembers );
                    }
                );
            }
        }
    };

    options = $.extend( true, {}, defaultTestOptions, thisTestOptions );
    var done = assert.async();

    var newMembers = [
        {
            "code": "5",
            "name": "Ned Flanders",
            "description": "Description of Ned Flanders"
        },
        {
            "code": "6",
            "name": "Montgomery Burns",
            "description": "Description of Montgomery Burns"
        }
    ];
    
    var addMembers = function( fieldId, membersToCopy ){

        var listPage = $( '#departmentsContainer' ).zcrud( 'getListPage' );
        var formPage = listPage.getCurrentFormPage();

        formPage.getField( fieldId ).addNewRows( membersToCopy );
    };

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );

            // Test it!
            testHelper.assertHistory( assert, 0, 0, true );
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'members' ), 
                [ '1', '2', '3', '4' ]);
            
            // Add items to members
            $( 'button.addMembers' ).click();
            testHelper.assertHistory( assert, 1, 0, true );
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'members' ), 
                [ '1', '2', '3', '4', '5', '6' ]);
            
            // Undo
            testHelper.clickUndoButton();
            testHelper.assertHistory( assert, 0, 1, true );
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'members' ), 
                [ '1', '2', '3', '4' ]);
            
            // Redo
            testHelper.clickRedoButton();
            testHelper.assertHistory( assert, 1, 0, true );
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'members' ), 
                [ '1', '2', '3', '4', '5', '6' ]);
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            record.members = record.members.concat( newMembers );
            assert.deepEqual( testUtils.getService( key ), record );
            
            done();
        }
    );
});
