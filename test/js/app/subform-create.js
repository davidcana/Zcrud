"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var Qunit = require( 'qunit' );
var testHelper = require( './testHelper.js' );
var testServerSide = require( './testServerSide.js' );

var defaultTestOptions = require( './subformTestOptions.js' );
var options = undefined;

var errorFunctionCounter = 0;

defaultTestOptions.errorFunction = function( message ){
    ++errorFunctionCounter;
};

// Run tests

QUnit.test( "subform create test", function( assert ) {
    
    options = $.extend( true, {}, defaultTestOptions );
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
            testServerSide.setService( key, record );

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
            assert.deepEqual( testServerSide.getService( key ), editedRecord );
            
            // Go to edit form again and check the form again
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, editedRecord );

            done();
        }
    );
});

QUnit.test( "subform create and form create test", function( assert ) {
    
    options = $.extend( true, {}, defaultTestOptions );
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
            assert.deepEqual( testServerSide.getService( key ), editedRecord );
            
            // Go to edit form again and check the form again
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, editedRecord );
            
            done();
        }
    );
});

QUnit.test( "subform create undo/redo 1 action test", function( assert ) {

    options = $.extend( true, {}, defaultTestOptions );
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
            testServerSide.setService( key, record );

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
            assert.deepEqual( testServerSide.getService( key ), editedRecord );
            
            done();
        }
    );
});

QUnit.test( "subform create undo/redo 3 actions test", function( assert ) {

    options = $.extend( true, {}, defaultTestOptions );
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
            testServerSide.setService( key, record );

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
            assert.deepEqual( testServerSide.getService( key ), editedRecord );

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
            testServerSide.setService( key, record );

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
            assert.deepEqual( testServerSide.getService( key ), editedRecord );

            done();
        }
    );
});

QUnit.test( "add records to subform test", function( assert ) {

    // Setup services
    testServerSide.resetServices();
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
    testServerSide.setService( key, record );

    var thisTestOptions = {
        pageConf: {
            pages: {
                update: {
                    buttons: {
                        toolbar: [ 
                            'undo', 
                            'redo', 
                            'form_cancel', 
                            'form_submit', 
                            {
                                cssClass: 'addMembers',
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
            assert.deepEqual( testServerSide.getService( key ), record );
            
            done();
        }
    );
});

QUnit.test( "subform create with fields with default values test", function( assert ) {
    
    options = $.extend( true, {}, defaultTestOptions );
    options.fields[ 'members' ].fields.description.defaultValue = "Default description";
    
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
            testServerSide.setService( key, record );

            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form and edit record
            testHelper.clickUpdateListButton( key );

            // Add subform record 3
            var subformRecord3 = {
                "code": "3",
                "name": "Homer Simpson",
                //"description": "Description of Homer Simpson"
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
            var realSubformRecord3 = $.extend( true, {}, subformRecord3 );
            realSubformRecord3.description = options.fields[ 'members' ].fields.description.defaultValue;
            editedRecord.members.push( realSubformRecord3 );
            editedRecord.members.push( subformRecord4);
            
            testHelper.checkForm( assert, editedRecord );

            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), editedRecord );

            // Go to edit form again and check the form again
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, editedRecord );
            
            done();
        }
    );
});

QUnit.test( "subform create with default value (2 rows, 0 changed) test", function( assert ) {

    options = $.extend( true, {}, defaultTestOptions );
    options.fields[ 'members' ].defaultValue = [
        {
            "code": "1",
            "name": "Default Bart Simpson",
            "description": "Default description of Bart Simpson"
        },
        {
            "code": "2",
            "name": "Default Lisa Simpson",
            "description": "Default description of Lisa Simpson"
        }
    ];

    testServerSide.resetServices();
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            var key = 0;
            var record =  {
                "id": "" + key,
                "name": "Service " + key
            };
            
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to create form and create record
            testHelper.clickCreateListButton();
            testHelper.fillForm( record );

            // Check form
            var editedRecord = $.extend( true, {}, record );
            editedRecord.province = options.fields[ 'province' ].defaultValue;
            editedRecord.members = options.fields[ 'members' ].defaultValue;
            testHelper.checkForm( assert, editedRecord );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), editedRecord );

            // Go to edit form again and check the form again
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, editedRecord );
            
            done();
        }
    );
});

QUnit.test( "subform create with default value (2 rows, 1 changed) test", function( assert ) {

    options = $.extend( true, {}, defaultTestOptions );
    options.fields[ 'members' ].defaultValue = [
        {
            "code": "1",
            "name": "Default Bart Simpson",
            "description": "Default description of Bart Simpson"
        },
        {
            "code": "2",
            "name": "Default Lisa Simpson",
            "description": "Default description of Lisa Simpson"
        }
    ];

    testServerSide.resetServices();
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            var key = 0;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "name": "Bart Simpson",
                        "description": "Description of Bart Simpson"  
                    }
                ]
            };

            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to create form and create record
            testHelper.clickCreateListButton();
            testHelper.fillForm( record );

            // Check form
            var editedRecord = $.extend( true, {}, record );
            editedRecord.province = options.fields[ 'province' ].defaultValue;
            editedRecord.members = options.fields[ 'members' ].defaultValue;
            editedRecord.members[ 0 ].name = "Bart Simpson";
            editedRecord.members[ 0 ].description = "Description of Bart Simpson";
            testHelper.checkForm( assert, editedRecord );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), editedRecord );

            // Go to edit form again and check the form again
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, editedRecord );
            
            done();
        }
    );
});

QUnit.test( "subform create with default value (2 rows, 1 changed) and default values test", function( assert ) {

    options = $.extend( true, {}, defaultTestOptions );
    options.fields[ 'members' ].defaultValue = [
        {
            "code": "1",
            "name": "Default Bart Simpson",
            "description": "Default description of Bart Simpson"
        },
        {
            "code": "2",
            "name": "Default Lisa Simpson",
            "description": "Default description of Lisa Simpson"
        }
    ];
    options.fields[ 'members' ].fields.description.defaultValue = "Default description";
    
    testServerSide.resetServices();
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            var key = 0;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "name": "Bart Simpson",
                        "description": "Description of Bart Simpson"  
                    }
                ]
            };

            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to create form and create record
            testHelper.clickCreateListButton();
            testHelper.fillForm( record );
            
            // Add subform record 3
            var subformRecord = {
                "code": "3",
                "name": "Homer Simpson"
            };
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillSubformNewRow( subformRecord, 'members' );
            
            // Check form
            var editedRecord = $.extend( true, {}, record );
            editedRecord.province = options.fields[ 'province' ].defaultValue;
            editedRecord.members = options.fields[ 'members' ].defaultValue;
            editedRecord.members[ 0 ].name = "Bart Simpson";
            editedRecord.members[ 0 ].description = "Description of Bart Simpson";
            editedRecord.members[ 2 ] = subformRecord;
            editedRecord.members[ 2 ].description = options.fields[ 'members' ].fields.description.defaultValue;
            testHelper.checkForm( assert, editedRecord );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), editedRecord );

            // Go to edit form again and check the form again
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, editedRecord );
            
            done();
        }
    );
});

QUnit.test( "subform create with default value (2 rows, 0 changed, 1 deleted) test", function( assert ) {

    options = $.extend( true, {}, defaultTestOptions );
    options.fields[ 'members' ].defaultValue = [
        {
            "code": "1",
            "name": "Default Bart Simpson",
            "description": "Default description of Bart Simpson"
        },
        {
            "code": "2",
            "name": "Default Lisa Simpson",
            "description": "Default description of Lisa Simpson"
        }
    ];

    testServerSide.resetServices();
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            var key = 0;
            var record =  {
                "id": "" + key,
                "name": "Service " + key
            };

            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to create form and create record
            testHelper.clickCreateListButton();
            testHelper.fillForm( record );
            
            // Delete subform row
            testHelper.clickDeleteSubformRowButton( 'members', 0 );
            
            // Check form
            var editedRecord = $.extend( true, {}, record );
            editedRecord.province = options.fields[ 'province' ].defaultValue;
            editedRecord.members = options.fields[ 'members' ].defaultValue;
            editedRecord.members = [ editedRecord.members[ 1 ] ];
            testHelper.checkForm( assert, editedRecord );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), editedRecord );

            // Go to edit form again and check the form again
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, editedRecord );
            
            done();
        }
    );
});

QUnit.test( "subform create with default value (2 rows, 1 changed, 1 deleted) test", function( assert ) {

    options = $.extend( true, {}, defaultTestOptions );
    options.fields[ 'members' ].defaultValue = [
        {
            "code": "1",
            "name": "Default Bart Simpson",
            "description": "Default description of Bart Simpson"
        },
        {
            "code": "2",
            "name": "Default Lisa Simpson",
            "description": "Default description of Lisa Simpson"
        }
    ];

    testServerSide.resetServices();
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            var key = 0;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "name": "Bart Simpson",
                        "description": "Description of Bart Simpson"  
                    }
                ]
            };

            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to create form and create record
            testHelper.clickCreateListButton();
            testHelper.fillForm( record );

            // Delete subform row
            testHelper.clickDeleteSubformRowButton( 'members', 1 );
            
            // Check form
            var editedRecord = $.extend( true, {}, record );
            editedRecord.province = options.fields[ 'province' ].defaultValue;
            editedRecord.members = [ editedRecord.members[ 0 ] ];
            editedRecord.members[ 0 ].code = '1';
            testHelper.checkForm( assert, editedRecord );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), editedRecord );

            // Go to edit form again and check the form again
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, editedRecord );
            
            done();
        }
    );
});
