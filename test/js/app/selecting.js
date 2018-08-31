"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var Qunit = require( 'qunit' );
var testHelper = require( './testHelper.js' );
var testUtils = require( './testUtils.js' );

var listTestOptions = require( './defaultTestOptions.js' );
var subformTestOptions = require( './subformTestOptions.js' );
var thisTestOptions = undefined;
var options = undefined;
var toolbar = [ 
    'undo', 
    'redo', 
    'form_cancel', 
    'form_submit', 
    {
        id: 'copyMembers',
        textsBundle: {
            title: undefined,
            content: {
                translate: false,
                text: 'Copy members'
            }
        }
    },
    {
        id: 'copyExternalMembers',
        textsBundle: {
            title: undefined,
            content: {
                translate: false,
                text: 'Copy external members'
            }
        }
    }
];

var copyMembers = function( fromFieldId, toFieldId, deleteFrom ){

    var listPage = $( '#departmentsContainer' ).zcrud( 'getListPage' );
    var formPage = listPage.getCurrentFormPage();

    var selectedRecords = formPage.getField( toFieldId ).addNewRowsFromSubform( fromFieldId, true, deleteFrom );
    if ( selectedRecords.length == 0 ){
        alert( 'Please, select at least one member!' );
    }
};

// Run tests
QUnit.test( "list selecting test", function( assert ) {
    
    // Setup services
    testUtils.resetServices();
    
    thisTestOptions = {
        pageConf: {
            pages: {
                list: {
                    components: {
                        selecting: {
                            isOn: true,
                            multiple: true,
                            mode: [ 'checkbox', 'onRowClick' ] // Options are checkbox and onRowClick
                        }
                    }
                }
            }
        }
    };
    options = $.extend( true, {}, listTestOptions, thisTestOptions );
    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
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
            assert.equal( testHelper.getSelectedFromList().length, 0 );

            // Select
            testHelper.listSelect( '3', '5', '7' );
            assert.deepEqual( 
                testHelper.getSelectedFromList(), 
                [ 
                    {
                        "id": "3",
                        "name": "Service 3"
                    },
                    {
                        "id": "5",
                        "name": "Service 5"
                    },
                    {
                        "id": "7",
                        "name": "Service 7"
                    }
                ] );

            // Deselect
            testHelper.listSelect( '3', '5', '7' );
            assert.equal( testHelper.getSelectedFromList().length, 0 );

            // Select again
            testHelper.listSelect( '3', '5', '7' );
            assert.deepEqual( 
                testHelper.getSelectedFromList(), 
                [ 
                    {
                        "id": "3",
                        "name": "Service 3"
                    },
                    {
                        "id": "5",
                        "name": "Service 5"
                    },
                    {
                        "id": "7",
                        "name": "Service 7"
                    }
                ] );

            // Test ranges
            testHelper.keyDown( 16 );
            testHelper.listSelect( '9' );
            assert.deepEqual( 
                testHelper.getSelectedFromList(), 
                [ 
                    {
                        "id": "3",
                        "name": "Service 3"
                    },
                    {
                        "id": "5",
                        "name": "Service 5"
                    },
                    {
                        "id": "7",
                        "name": "Service 7"
                    },
                    {
                        "id": "8",
                        "name": "Service 8"
                    },
                    {
                        "id": "9",
                        "name": "Service 9"
                    }
                ] );
            testHelper.keyUp( 16 );

            // Select all being some selected
            testHelper.listToggleSelect();
            assert.deepEqual( 
                testHelper.getSelectedFromList(), 
                [ 
                    {
                        "id": "1",
                        "name": "Service 1"
                    },
                    {
                        "id": "2",
                        "name": "Service 2"
                    },
                    {
                        "id": "3",
                        "name": "Service 3"
                    },
                    {
                        "id": "4",
                        "name": "Service 4"
                    },
                    {
                        "id": "5",
                        "name": "Service 5"
                    },
                    {
                        "id": "6",
                        "name": "Service 6"
                    },
                    {
                        "id": "7",
                        "name": "Service 7"
                    },
                    {
                        "id": "8",
                        "name": "Service 8"
                    },
                    {
                        "id": "9",
                        "name": "Service 9"
                    },
                    {
                        "id": "10",
                        "name": "Service 10"
                    }
                ] );

            // Deselect all
            testHelper.listToggleSelect();
            assert.equal( testHelper.getSelectedFromList().length, 0 );

            // Select all being no selected
            testHelper.listToggleSelect();
            assert.deepEqual( 
                testHelper.getSelectedFromList(), 
                [ 
                    {
                        "id": "1",
                        "name": "Service 1"
                    },
                    {
                        "id": "2",
                        "name": "Service 2"
                    },
                    {
                        "id": "3",
                        "name": "Service 3"
                    },
                    {
                        "id": "4",
                        "name": "Service 4"
                    },
                    {
                        "id": "5",
                        "name": "Service 5"
                    },
                    {
                        "id": "6",
                        "name": "Service 6"
                    },
                    {
                        "id": "7",
                        "name": "Service 7"
                    },
                    {
                        "id": "8",
                        "name": "Service 8"
                    },
                    {
                        "id": "9",
                        "name": "Service 9"
                    },
                    {
                        "id": "10",
                        "name": "Service 10"
                    }
                ] );

            // Deselect some
            testHelper.listSelect( '1', '4', '7' );
            assert.deepEqual( 
                testHelper.getSelectedFromList(), 
                [ 
                    {
                        "id": "2",
                        "name": "Service 2"
                    },
                    {
                        "id": "3",
                        "name": "Service 3"
                    },
                    {
                        "id": "5",
                        "name": "Service 5"
                    },
                    {
                        "id": "6",
                        "name": "Service 6"
                    },
                    {
                        "id": "8",
                        "name": "Service 8"
                    },
                    {
                        "id": "9",
                        "name": "Service 9"
                    },
                    {
                        "id": "10",
                        "name": "Service 10"
                    }
                ] );

            // Move to next page, all selected must be deselected
            values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 11, 20 ) );
            testHelper.pagingTest({
                action: { 
                    nextPage: true
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 11-20 of 129',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '2' ],
                pageListActive: [ '<<', '<', '1', '3', '4', '5', '13', '>', '>>' ]
            });
            assert.equal( testHelper.getSelectedFromList().length, 0 );
            
            done();
        }
    );
});

QUnit.test( "subform selecting test", function( assert ) {

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
    
    thisTestOptions = {
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
                                id: 'doAction',
                                textsBundle: {
                                    title: undefined,
                                    content: {
                                        translate: false,
                                        text: 'Do action'
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        },
        fields: {
            members: {
                components: {
                    selecting: {
                        isOn: true,
                        multiple: true,
                        mode: [ 'checkbox', 'onRowClick' ] // Options are checkbox and onRowClick
                    }
                }
            }
        },
        events: {
            formCreated: function ( data ) {
                $( 'button.doAction' ).click( function ( event ) {
                    event.preventDefault();
                    
                    var listPage = $( '#departmentsContainer' ).zcrud( 'getListPage' );
                    var formPage = listPage.getCurrentFormPage();
                    alert( 
                        JSON.stringify(
                            formPage.getField( 'members' ).getComponent( 'selecting' ).getSelectedRecords()
                        )
                    );
                });
            }
        }
    };
    options = $.extend( true, {}, subformTestOptions, thisTestOptions );
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );
            
            // Test it!
            assert.equal( testHelper.getSelectedFromSubform( 'members' ).length, 0 );
            
            // Select
            testHelper.subformSelect( 'members', '1', '3' );
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'members' ), 
                [ 
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "description": "Description of Bart Simpson"
                    },
                    {
                        "code": "3",
                        "name": "Marge Simpson",
                        "description": "Description of Marge Simpson"
                    }
                ]);
            
            // Deselect
            testHelper.subformSelect( 'members', '1', '3' );
            assert.equal( testHelper.getSelectedFromSubform( 'members' ).length, 0 );

            // Select again
            testHelper.subformSelect( 'members', '1' );
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'members' ), 
                [ 
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "description": "Description of Bart Simpson"
                    }
                ]);
            
            // Test ranges
            testHelper.keyDown( 16 );
            testHelper.subformSelect( 'members', '3' );
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'members' ), 
                [ 
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
                    }
                ] );
            testHelper.keyUp( 16 );
            
            // Select all being some selected
            testHelper.subformToggleSelect( 'members' );
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'members' ), 
                [ 
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
                ] );
            
            // Deselect all
            testHelper.subformToggleSelect( 'members' );
            assert.equal( testHelper.getSelectedFromSubform( 'members' ).length, 0 );
            
            // Select all being no selected
            testHelper.subformToggleSelect( 'members' );
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'members' ), 
                [ 
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
                ] );
            
            // Deselect some
            testHelper.subformSelect( 'members', '1', '4' );
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'members' ), 
                [ 
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        "description": "Description of Lisa Simpson"
                    },
                    {
                        "code": "3",
                        "name": "Marge Simpson",
                        "description": "Description of Marge Simpson"
                    }
                ] );
            
            // TODO Test move to next page, all selected must be deselected
            
            done();
        }
    );
});

QUnit.test( "2 subforms selecting and copy/paste test", function( assert ) {

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
        ],
        "externalMembers": [
            {
                "code": "5",
                "name": "Ned Flanders",
                "description": "Description of Ned Flanders"
            }
        ]
    };
    testUtils.setService( key, record );

    thisTestOptions = {
        pageConf: {
            pages: {
                update: {
                    buttons: {
                        toolba2: toolbar
                    }
                }
            }
        },
        fields: {
            members: {
                components: {
                    selecting: {
                        isOn: true,
                        multiple: true,
                        mode: [ 'checkbox', 'onRowClick' ] // Options are checkbox and onRowClick
                    }
                }
            },
            externalMembers: {
                type: 'subform',
                subformKey: 'code',
                fields: { 
                    code: { },
                    name: { },
                    description: {
                        type: 'textarea',
                        formFieldAttributes: {
                            rows: 3,
                            cols: 80
                        }
                    }
                },
                buttons: {
                    toolbar: {
                        newRegisterRow: true
                    },
                    byRow: {
                        openEditRegisterForm: false,
                        openDeleteRegisterForm: false,
                        deleteRegisterRow: true
                    }
                },
                components: {
                    selecting: {
                        isOn: true,
                        multiple: true,
                        mode: [ 'checkbox', 'onRowClick' ] // Options are checkbox and onRowClick
                    }
                }
            }
        },
        events: {
            formCreated: function ( data ) {
                $( 'button.copyMembers' ).click( 
                    function ( event ) {
                        event.preventDefault();
                        copyMembers( 'members', 'externalMembers', false );
                    }
                );
                $( 'button.copyExternalMembers' ).click( 
                    function ( event ) {
                        event.preventDefault();
                        copyMembers( 'externalMembers', 'members', false );
                    }
                );
            }
        }
    };
    options = $.extend( true, {}, subformTestOptions, thisTestOptions );
    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );

            // Test it!
            assert.equal( testHelper.getSelectedFromSubform( 'members' ).length, 0 );
            assert.equal( testHelper.getSelectedFromSubform( 'externalMembers' ).length, 0 );
            testHelper.assertHistory( assert, 0, 0, true );
            
            // Select
            testHelper.subformSelect( 'members', '1', '3' );
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'members' ), 
                [ 
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "description": "Description of Bart Simpson"
                    },
                    {
                        "code": "3",
                        "name": "Marge Simpson",
                        "description": "Description of Marge Simpson"
                    }
                ]);
            assert.equal( testHelper.getSelectedFromSubform( 'externalMembers' ).length, 0 );
            
            // Deselect
            testHelper.subformSelect( 'members', '1', '3' );
            assert.equal( testHelper.getSelectedFromSubform( 'members' ).length, 0 );
            assert.equal( testHelper.getSelectedFromSubform( 'externalMembers' ).length, 0 );
            
            // Select again
            testHelper.subformSelect( 'members', '1', '3' );
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'members' ), 
                [ 
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "description": "Description of Bart Simpson"
                    },
                    {
                        "code": "3",
                        "name": "Marge Simpson",
                        "description": "Description of Marge Simpson"
                    }
                ]);
            assert.equal( testHelper.getSelectedFromSubform( 'externalMembers' ).length, 0 );
            
            // Select at the external members
            testHelper.subformSelect( 'externalMembers', '5' );
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'externalMembers' ), 
                [ 
                    {
                        "code": "5",
                        "name": "Ned Flanders",
                        "description": "Description of Ned Flanders"
                    }
                ]);
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'members' ), 
                [ 
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "description": "Description of Bart Simpson"
                    },
                    {
                        "code": "3",
                        "name": "Marge Simpson",
                        "description": "Description of Marge Simpson"
                    }
                ]);
            
            // Copy selected items from members to external
            $( 'button.copyMembers' ).click();
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'externalMembers' ), 
                [ '5', '1', '3' ]);
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'members' ), 
                [ '1', '2', '3', '4' ]);
            testHelper.assertHistory( assert, 1, 0, true );
            
            // Copy selected items from external to members
            $( 'button.copyExternalMembers' ).click();
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'members' ), 
                [ '1', '2', '3', '4', '5' ]);
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'externalMembers' ), 
                [ '5', '1', '3' ]);
            testHelper.assertHistory( assert, 2, 0, true );
            
            // Select at the external members a repeated item
            testHelper.subformSelect( 'externalMembers', '1' );
            
            // Copy selected items from external to members
            $( 'button.copyExternalMembers' ).click();
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'members' ), 
                [ '1', '2', '3', '4', '5', '5', '1' ]);
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'externalMembers' ), 
                [ '5', '1', '3' ]);
            testHelper.assertHistory( assert, 3, 0, true );
            
            // Undo
            testHelper.clickUndoButton();
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'members' ), 
                [ '1', '2', '3', '4', '5' ]);
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'externalMembers' ), 
                [ '5', '1', '3' ]);
            testHelper.assertHistory( assert, 2, 1, true );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();
            
            // Check storage
            record.members = [
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
                },
                {
                    "code": "5",
                    "name": "Ned Flanders",
                    "description": "Description of Ned Flanders"
                }
            ];
            record.externalMembers = [
                {
                    "code": "5",
                    "name": "Ned Flanders",
                    "description": "Description of Ned Flanders"
                },
                {
                    "code": "1",
                    "name": "Bart Simpson",
                    "description": "Description of Bart Simpson"
                },
                {
                    "code": "3",
                    "name": "Marge Simpson",
                    "description": "Description of Marge Simpson"
                }
            ];
            assert.deepEqual( testUtils.getService( key ), record );
            
            done();
        }
    );
});

QUnit.test( "2 subforms selecting and cut/paste test", function( assert ) {

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
        ],
        "externalMembers": [
            {
                "code": "5",
                "name": "Ned Flanders",
                "description": "Description of Ned Flanders"
            }
        ]
    };
    testUtils.setService( key, record );

    thisTestOptions = {
        pageConf: {
            pages: {
                update: {
                    buttons: {
                        toolba2: toolbar
                    }
                }
            }
        },
        fields: {
            members: {
                components: {
                    selecting: {
                        isOn: true,
                        multiple: true,
                        mode: [ 'checkbox', 'onRowClick' ] // Options are checkbox and onRowClick
                    }
                }
            },
            externalMembers: {
                type: 'subform',
                subformKey: 'code',
                fields: { 
                    code: { },
                    name: { },
                    description: {
                        type: 'textarea',
                        formFieldAttributes: {
                            rows: 3,
                            cols: 80
                        }
                    }
                },
                buttons: {
                    toolbar: {
                        newRegisterRow: true
                    },
                    byRow: {
                        openEditRegisterForm: false,
                        openDeleteRegisterForm: false,
                        deleteRegisterRow: true
                    }
                },
                components: {
                    selecting: {
                        isOn: true,
                        multiple: true,
                        mode: [ 'checkbox', 'onRowClick' ] // Options are checkbox and onRowClick
                    }
                }
            }
        },
        events: {
            formCreated: function ( data ) {
                $( 'button.copyMembers' ).click( 
                    function ( event ) {
                        event.preventDefault();
                        copyMembers( 'members', 'externalMembers', true );
                    }
                );
                $( 'button.copyExternalMembers' ).click( 
                    function ( event ) {
                        event.preventDefault();
                        copyMembers( 'externalMembers', 'members', true );
                    }
                );
            }
        }
    };
    options = $.extend( true, {}, subformTestOptions, thisTestOptions );
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );

            // Test it!
            assert.equal( testHelper.getSelectedFromSubform( 'members' ).length, 0 );
            assert.equal( testHelper.getSelectedFromSubform( 'externalMembers' ).length, 0 );
            testHelper.assertHistory( assert, 0, 0, true );

            // Select
            testHelper.subformSelect( 'members', '1', '3' );
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'members' ), 
                [ 
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "description": "Description of Bart Simpson"
                    },
                    {
                        "code": "3",
                        "name": "Marge Simpson",
                        "description": "Description of Marge Simpson"
                    }
                ]);
            assert.equal( testHelper.getSelectedFromSubform( 'externalMembers' ).length, 0 );

            // Deselect
            testHelper.subformSelect( 'members', '1', '3' );
            assert.equal( testHelper.getSelectedFromSubform( 'members' ).length, 0 );
            assert.equal( testHelper.getSelectedFromSubform( 'externalMembers' ).length, 0 );

            // Select again
            testHelper.subformSelect( 'members', '1', '3' );
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'members' ), 
                [ 
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "description": "Description of Bart Simpson"
                    },
                    {
                        "code": "3",
                        "name": "Marge Simpson",
                        "description": "Description of Marge Simpson"
                    }
                ]);
            assert.equal( testHelper.getSelectedFromSubform( 'externalMembers' ).length, 0 );

            // Select at the external members
            testHelper.subformSelect( 'externalMembers', '5' );
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'externalMembers' ), 
                [ 
                    {
                        "code": "5",
                        "name": "Ned Flanders",
                        "description": "Description of Ned Flanders"
                    }
                ]);
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'members' ), 
                [ 
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "description": "Description of Bart Simpson"
                    },
                    {
                        "code": "3",
                        "name": "Marge Simpson",
                        "description": "Description of Marge Simpson"
                    }
                ]);

            // Copy selected items from members to external
            $( 'button.copyMembers' ).click();
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'externalMembers' ), 
                [ '5', '1', '3' ]);
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'members' ), 
                [ '2', '4' ]);
            testHelper.assertHistory( assert, 1, 0, true );
            
            // Copy selected items from external to members
            $( 'button.copyExternalMembers' ).click();
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'members' ), 
                [ '2', '4', '5' ]);
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'externalMembers' ), 
                [ '1', '3' ]);
            testHelper.assertHistory( assert, 2, 0, true );
            
            // Undo (1)
            testHelper.clickUndoButton();
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'externalMembers' ), 
                [ '5', '1', '3' ]);
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'members' ), 
                [ '2', '4' ]);
            testHelper.assertHistory( assert, 1, 1, true );
            
            // Undo (2)
            testHelper.clickUndoButton();
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'members' ), 
                [ '1', '2', '3', '4' ]);
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'externalMembers' ), 
                [ '5' ]);
            testHelper.assertHistory( assert, 0, 2, true );
            
            // Redo (1)
            testHelper.clickRedoButton();
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'externalMembers' ), 
                [ '5', '1', '3' ]);
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'members' ), 
                [ '2', '4' ]);
            testHelper.assertHistory( assert, 1, 1, true );
            
            // Redo (2)
            testHelper.clickRedoButton();
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'members' ), 
                [ '2', '4', '5' ]);
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'externalMembers' ), 
                [ '1', '3' ]);
            testHelper.assertHistory( assert, 2, 0, true );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();
            
            // Check storage
            record.members = [
                {
                    "code": "2",
                    "name": "Lisa Simpson",
                    "description": "Description of Lisa Simpson"
                },
                {
                    "code": "4",
                    "name": "Homer Simpson",
                    "description": "Description of Homer Simpson"
                },
                {
                    "code": "5",
                    "name": "Ned Flanders",
                    "description": "Description of Ned Flanders"
                }
            ];
            record.externalMembers = [
                {
                    "code": "1",
                    "name": "Bart Simpson",
                    "description": "Description of Bart Simpson"
                },
                {
                    "code": "3",
                    "name": "Marge Simpson",
                    "description": "Description of Marge Simpson"
                }
            ];
            assert.deepEqual( testUtils.getService( key ), record );
            
            done();
        }
    );
});

QUnit.test( "2 subforms (1 read only) selecting and copy/paste (saving 2 times) test", function( assert ) {

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
        ],
        "externalMembers": [
            {
                "code": "5",
                "name": "Ned Flanders",
                "description": "Description of Ned Flanders"
            }
        ]
    };
    testUtils.setService( key, record );

    thisTestOptions = {
        pageConf: {
            pages: {
                update: {
                    buttons: {
                        toolba2: toolbar
                    }
                }
            }
        },
        fields: {
            members: {
                readOnly: true,
                components: {
                    selecting: {
                        isOn: true,
                        multiple: true,
                        mode: [ 'checkbox', 'onRowClick' ] // Options are checkbox and onRowClick
                    }
                }
            },
            externalMembers: {
                type: 'subform',
                subformKey: 'code',
                fields: { 
                    code: { },
                    name: { },
                    description: {
                        type: 'textarea',
                        formFieldAttributes: {
                            rows: 3,
                            cols: 80
                        }
                    }
                },
                buttons: {
                    toolbar: {
                        newRegisterRow: true
                    },
                    byRow: {
                        openEditRegisterForm: false,
                        openDeleteRegisterForm: false,
                        deleteRegisterRow: true
                    }
                },
                components: {
                    selecting: {
                        isOn: true,
                        multiple: true,
                        mode: [ 'checkbox', 'onRowClick' ] // Options are checkbox and onRowClick
                    }
                }
            }
        },
        events: {
            formCreated: function ( data ) {
                $( 'button.copyMembers' ).click( 
                    function ( event ) {
                        event.preventDefault();
                        copyMembers( 'members', 'externalMembers', false );
                    }
                );
                $( 'button.copyExternalMembers' ).click( 
                    function ( event ) {
                        event.preventDefault();
                        copyMembers( 'externalMembers', 'members', false );
                    }
                );
            }
        }
    };
    options = $.extend( true, {}, subformTestOptions, thisTestOptions );
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );

            // Test it!
            assert.equal( testHelper.getSelectedFromSubform( 'members' ).length, 0 );
            assert.equal( testHelper.getSelectedFromSubform( 'externalMembers' ).length, 0 );
            testHelper.assertHistory( assert, 0, 0, true );

            // Select
            testHelper.readOnlySubformSelect( 'members', '1', '3' );
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'members' ), 
                [ 
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "description": "Description of Bart Simpson"
                    },
                    {
                        "code": "3",
                        "name": "Marge Simpson",
                        "description": "Description of Marge Simpson"
                    }
                ]);
            assert.equal( testHelper.getSelectedFromSubform( 'externalMembers' ).length, 0 );
            
            // Deselect
            testHelper.readOnlySubformSelect( 'members', '1', '3' );
            assert.equal( testHelper.getSelectedFromSubform( 'members' ).length, 0 );
            assert.equal( testHelper.getSelectedFromSubform( 'externalMembers' ).length, 0 );

            // Select again
            testHelper.readOnlySubformSelect( 'members', '1', '3' );
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'members' ), 
                [ 
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "description": "Description of Bart Simpson"
                    },
                    {
                        "code": "3",
                        "name": "Marge Simpson",
                        "description": "Description of Marge Simpson"
                    }
                ]);
            assert.equal( testHelper.getSelectedFromSubform( 'externalMembers' ).length, 0 );

            // Select at the external members
            testHelper.subformSelect( 'externalMembers', '5' );
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'externalMembers' ), 
                [ 
                    {
                        "code": "5",
                        "name": "Ned Flanders",
                        "description": "Description of Ned Flanders"
                    }
                ]);
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'members' ), 
                [ 
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "description": "Description of Bart Simpson"
                    },
                    {
                        "code": "3",
                        "name": "Marge Simpson",
                        "description": "Description of Marge Simpson"
                    }
                ]);
            
            // Copy selected items from members to external
            $( 'button.copyMembers' ).click();
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'externalMembers' ), 
                [ '5', '1', '3' ]);
            assert.deepEqual( 
                testHelper.getReadOnlySubformItemsKeys( 'members' ), 
                [ '1', '2', '3', '4' ]);
            testHelper.assertHistory( assert, 1, 0, true );
            
            // Copy selected items from external to members
            $( 'button.copyExternalMembers' ).click();
            assert.deepEqual( 
                testHelper.getReadOnlySubformItemsKeys( 'members' ), 
                [ '1', '2', '3', '4', '5' ]);
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'externalMembers' ), 
                [ '5', '1', '3' ]);
            testHelper.assertHistory( assert, 2, 0, true );
            
            // Select at the external members a repeated item
            testHelper.subformSelect( 'externalMembers', '1' );

            // Copy selected items from external to members
            $( 'button.copyExternalMembers' ).click();
            assert.deepEqual( 
                testHelper.getReadOnlySubformItemsKeys( 'members' ), 
                [ '1', '2', '3', '4', '5', '5', '1' ]);
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'externalMembers' ), 
                [ '5', '1', '3' ]);
            testHelper.assertHistory( assert, 3, 0, true );
            
            // Undo
            testHelper.clickUndoButton();
            assert.deepEqual( 
                testHelper.getReadOnlySubformItemsKeys( 'members' ), 
                [ '1', '2', '3', '4', '5' ]);
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'externalMembers' ), 
                [ '5', '1', '3' ]);
            testHelper.assertHistory( assert, 2, 1, true );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            record.members = [
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
                },
                {
                    "code": "5",
                    "name": "Ned Flanders",
                    "description": "Description of Ned Flanders"
                }
            ];
            record.externalMembers = [
                {
                    "code": "5",
                    "name": "Ned Flanders",
                    "description": "Description of Ned Flanders"
                },
                {
                    "code": "1",
                    "name": "Bart Simpson",
                    "description": "Description of Bart Simpson"
                },
                {
                    "code": "3",
                    "name": "Marge Simpson",
                    "description": "Description of Marge Simpson"
                }
            ];
            assert.deepEqual( testUtils.getService( key ), record );
            
            // Go to edit form again
            testHelper.clickUpdateListButton( key );
            
            // Select again
            testHelper.readOnlySubformSelect( 'members', '2' );
            
            // Copy selected items from members to external
            $( 'button.copyMembers' ).click();
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'externalMembers' ), 
                [ '5', '1', '3', '2' ]);
            assert.deepEqual( 
                testHelper.getReadOnlySubformItemsKeys( 'members' ), 
                [ '1', '2', '3', '4', '5' ]);
            testHelper.assertHistory( assert, 1, 0, true );
            
            // Undo
            testHelper.clickUndoButton();
            assert.deepEqual( 
                testHelper.getReadOnlySubformItemsKeys( 'members' ), 
                [ '1', '2', '3', '4', '5' ]);
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'externalMembers' ), 
                [ '5', '1', '3' ]);
            testHelper.assertHistory( assert, 0, 1, true );
            
            // Redo
            testHelper.clickRedoButton();
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'externalMembers' ), 
                [ '5', '1', '3', '2' ]);
            assert.deepEqual( 
                testHelper.getReadOnlySubformItemsKeys( 'members' ), 
                [ '1', '2', '3', '4', '5' ]);
            testHelper.assertHistory( assert, 1, 0, true );
            
            // Submit a second time and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage second time
            record.members = [
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
                },
                {
                    "code": "5",
                    "name": "Ned Flanders",
                    "description": "Description of Ned Flanders"
                }
            ];
            record.externalMembers = [
                {
                    "code": "5",
                    "name": "Ned Flanders",
                    "description": "Description of Ned Flanders"
                },
                {
                    "code": "1",
                    "name": "Bart Simpson",
                    "description": "Description of Bart Simpson"
                },
                {
                    "code": "3",
                    "name": "Marge Simpson",
                    "description": "Description of Marge Simpson"
                },
                {
                    "code": "2",
                    "name": "Lisa Simpson",
                    "description": "Description of Lisa Simpson"
                }
            ];
            assert.deepEqual( testUtils.getService( key ), record );
            
            done();
        }
    );
});

QUnit.test( "2 subforms (1 read only) selecting and cut/paste (saving 2 times) test", function( assert ) {

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
        ],
        "externalMembers": [
            {
                "code": "5",
                "name": "Ned Flanders",
                "description": "Description of Ned Flanders"
            }
        ]
    };
    testUtils.setService( key, record );

    thisTestOptions = {
        pageConf: {
            pages: {
                update: {
                    buttons: {
                        toolba2: toolbar
                    }
                }
            }
        },
        fields: {
            members: {
                readOnly: true,
                components: {
                    selecting: {
                        isOn: true,
                        multiple: true,
                        mode: [ 'checkbox', 'onRowClick' ] // Options are checkbox and onRowClick
                    }
                }
            },
            externalMembers: {
                type: 'subform',
                subformKey: 'code',
                fields: { 
                    code: { },
                    name: { },
                    description: {
                        type: 'textarea',
                        formFieldAttributes: {
                            rows: 3,
                            cols: 80
                        }
                    }
                },
                buttons: {
                    toolbar: {
                        newRegisterRow: true
                    },
                    byRow: {
                        openEditRegisterForm: false,
                        openDeleteRegisterForm: false,
                        deleteRegisterRow: true
                    }
                },
                components: {
                    selecting: {
                        isOn: true,
                        multiple: true,
                        mode: [ 'checkbox', 'onRowClick' ] // Options are checkbox and onRowClick
                    }
                }
            }
        },
        events: {
            formCreated: function ( data ) {
                $( 'button.copyMembers' ).click( 
                    function ( event ) {
                        event.preventDefault();
                        copyMembers( 'members', 'externalMembers', true );
                    }
                );
                $( 'button.copyExternalMembers' ).click( 
                    function ( event ) {
                        event.preventDefault();
                        copyMembers( 'externalMembers', 'members', true );
                    }
                );
            }
        }
    };
    options = $.extend( true, {}, subformTestOptions, thisTestOptions );
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );

            // Test it!
            assert.equal( testHelper.getSelectedFromSubform( 'members' ).length, 0 );
            assert.equal( testHelper.getSelectedFromSubform( 'externalMembers' ).length, 0 );
            testHelper.assertHistory( assert, 0, 0, true );

            // Select
            testHelper.readOnlySubformSelect( 'members', '1', '3' );
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'members' ), 
                [ 
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "description": "Description of Bart Simpson"
                    },
                    {
                        "code": "3",
                        "name": "Marge Simpson",
                        "description": "Description of Marge Simpson"
                    }
                ]);
            assert.equal( testHelper.getSelectedFromSubform( 'externalMembers' ).length, 0 );
            
            // Deselect
            testHelper.readOnlySubformSelect( 'members', '1', '3' );
            assert.equal( testHelper.getSelectedFromSubform( 'members' ).length, 0 );
            assert.equal( testHelper.getSelectedFromSubform( 'externalMembers' ).length, 0 );
            
            // Select again
            testHelper.readOnlySubformSelect( 'members', '1', '3' );
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'members' ), 
                [ 
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "description": "Description of Bart Simpson"
                    },
                    {
                        "code": "3",
                        "name": "Marge Simpson",
                        "description": "Description of Marge Simpson"
                    }
                ]);
            assert.equal( testHelper.getSelectedFromSubform( 'externalMembers' ).length, 0 );
            
            // Select at the external members
            testHelper.subformSelect( 'externalMembers', '5' );
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'externalMembers' ), 
                [ 
                    {
                        "code": "5",
                        "name": "Ned Flanders",
                        "description": "Description of Ned Flanders"
                    }
                ]);
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'members' ), 
                [ 
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "description": "Description of Bart Simpson"
                    },
                    {
                        "code": "3",
                        "name": "Marge Simpson",
                        "description": "Description of Marge Simpson"
                    }
                ]);
            
            // Cut selected items from members to external
            $( 'button.copyMembers' ).click();
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'externalMembers' ), 
                [ '5', '1', '3' ]);
            assert.deepEqual( 
                testHelper.getReadOnlySubformItemsKeys( 'members' ), 
                [ '2', '4' ]);
            testHelper.assertHistory( assert, 1, 0, true );
            
            // Cut selected items from external to members
            $( 'button.copyExternalMembers' ).click();
            assert.deepEqual( 
                testHelper.getReadOnlySubformItemsKeys( 'members' ), 
                [ '2', '4', '5' ]);
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'externalMembers' ), 
                [ '1', '3' ]);
            testHelper.assertHistory( assert, 2, 0, true );
            
            // Undo
            testHelper.clickUndoButton();
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'externalMembers' ), 
                [ '5', '1', '3' ]);
            assert.deepEqual( 
                testHelper.getReadOnlySubformItemsKeys( 'members' ), 
                [ '2', '4' ]);
            testHelper.assertHistory( assert, 1, 1, true );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            record.members = [
                {
                    "code": "2",
                    "name": "Lisa Simpson",
                    "description": "Description of Lisa Simpson"
                },
                {
                    "code": "4",
                    "name": "Homer Simpson",
                    "description": "Description of Homer Simpson"
                }
            ];
            record.externalMembers = [
                {
                    "code": "5",
                    "name": "Ned Flanders",
                    "description": "Description of Ned Flanders"
                },
                {
                    "code": "1",
                    "name": "Bart Simpson",
                    "description": "Description of Bart Simpson"
                },
                {
                    "code": "3",
                    "name": "Marge Simpson",
                    "description": "Description of Marge Simpson"
                }
            ];
            assert.deepEqual( testUtils.getService( key ), record );

            // Go to edit form again
            testHelper.clickUpdateListButton( key );
            
            // Select again
            testHelper.subformSelect( 'externalMembers', '3', '5' );
            
            // Cut selected items from external to members
            $( 'button.copyExternalMembers' ).click();
            
            // Submit a second time and show the list again
            testHelper.clickFormSubmitButton();
            
            // Check storage a second time
            record.members = [
                {
                    "code": "2",
                    "name": "Lisa Simpson",
                    "description": "Description of Lisa Simpson"
                },
                {
                    "code": "4",
                    "name": "Homer Simpson",
                    "description": "Description of Homer Simpson"
                },
                {
                    "code": "5",
                    "name": "Ned Flanders",
                    "description": "Description of Ned Flanders"
                },
                {
                    "code": "3",
                    "name": "Marge Simpson",
                    "description": "Description of Marge Simpson"
                }
            ];
            record.externalMembers = [
                {
                    "code": "1",
                    "name": "Bart Simpson",
                    "description": "Description of Bart Simpson"
                }
            ];
            assert.deepEqual( testUtils.getService( key ), record );
            
            done();
        }
    );
});

QUnit.test( "2 subforms (1 read only) selecting and cut/paste (cuting the same record twice) test", function( assert ) {

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
        ],
        "externalMembers": [
            {
                "code": "5",
                "name": "Ned Flanders",
                "description": "Description of Ned Flanders"
            }
        ]
    };
    testUtils.setService( key, record );

    thisTestOptions = {
        pageConf: {
            pages: {
                update: {
                    buttons: {
                        toolba2: toolbar
                    }
                }
            }
        },
        fields: {
            members: {
                readOnly: true,
                components: {
                    selecting: {
                        isOn: true,
                        multiple: true,
                        mode: [ 'checkbox', 'onRowClick' ] // Options are checkbox and onRowClick
                    }
                }
            },
            externalMembers: {
                type: 'subform',
                subformKey: 'code',
                fields: { 
                    code: { },
                    name: { },
                    description: {
                        type: 'textarea',
                        formFieldAttributes: {
                            rows: 3,
                            cols: 80
                        }
                    }
                },
                buttons: {
                    toolbar: {
                        newRegisterRow: true
                    },
                    byRow: {
                        openEditRegisterForm: false,
                        openDeleteRegisterForm: false,
                        deleteRegisterRow: true
                    }
                },
                components: {
                    selecting: {
                        isOn: true,
                        multiple: true,
                        mode: [ 'checkbox', 'onRowClick' ] // Options are checkbox and onRowClick
                    }
                }
            }
        },
        events: {
            formCreated: function ( data ) {
                $( 'button.copyMembers' ).click( 
                    function ( event ) {
                        event.preventDefault();
                        copyMembers( 'members', 'externalMembers', true );
                    }
                );
                $( 'button.copyExternalMembers' ).click( 
                    function ( event ) {
                        event.preventDefault();
                        copyMembers( 'externalMembers', 'members', true );
                    }
                );
            }
        }
    };
    options = $.extend( true, {}, subformTestOptions, thisTestOptions );
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );

            // Test it!
            assert.equal( testHelper.getSelectedFromSubform( 'members' ).length, 0 );
            assert.equal( testHelper.getSelectedFromSubform( 'externalMembers' ).length, 0 );
            testHelper.assertHistory( assert, 0, 0, true );

            // Select
            testHelper.readOnlySubformSelect( 'members', '1', '3' );
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'members' ), 
                [ 
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "description": "Description of Bart Simpson"
                    },
                    {
                        "code": "3",
                        "name": "Marge Simpson",
                        "description": "Description of Marge Simpson"
                    }
                ]);
            assert.equal( testHelper.getSelectedFromSubform( 'externalMembers' ).length, 0 );

            // Cut selected items from members to external
            $( 'button.copyMembers' ).click();
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'externalMembers' ), 
                [ '5', '1', '3' ]);
            assert.deepEqual( 
                testHelper.getReadOnlySubformItemsKeys( 'members' ), 
                [ '2', '4' ]);
            testHelper.assertHistory( assert, 1, 0, true );
            
            // Select
            testHelper.subformSelect( 'externalMembers', '5', '1' );
            
            // Cut selected items from external to members
            $( 'button.copyExternalMembers' ).click();
            assert.deepEqual( 
                testHelper.getReadOnlySubformItemsKeys( 'members' ), 
                [ '2', '4', '5', '1' ]);
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'externalMembers' ), 
                [ '3' ]);
            testHelper.assertHistory( assert, 2, 0, true );
            
            // Undo
            testHelper.clickUndoButton();
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'externalMembers' ), 
                [ '5', '1', '3' ]);
            assert.deepEqual( 
                testHelper.getReadOnlySubformItemsKeys( 'members' ), 
                [ '2', '4' ]);
            testHelper.assertHistory( assert, 1, 1, true );
            
            // Redo
            testHelper.clickRedoButton();
            assert.deepEqual( 
                testHelper.getReadOnlySubformItemsKeys( 'members' ), 
                [ '2', '4', '5', '1' ]);
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'externalMembers' ), 
                [ '3' ]);
            testHelper.assertHistory( assert, 2, 0, true );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            record.members = [
                {
                    "code": "2",
                    "name": "Lisa Simpson",
                    "description": "Description of Lisa Simpson"
                },
                {
                    "code": "4",
                    "name": "Homer Simpson",
                    "description": "Description of Homer Simpson"
                },
                {
                    "code": "5",
                    "name": "Ned Flanders",
                    "description": "Description of Ned Flanders"
                },
                {
                    "code": "1",
                    "name": "Bart Simpson",
                    "description": "Description of Bart Simpson"
                }
            ];
            record.externalMembers = [
                {
                    "code": "3",
                    "name": "Marge Simpson",
                    "description": "Description of Marge Simpson"
                }
            ];
            assert.deepEqual( testUtils.getService( key ), record );
            
            done();
        }
    );
});

QUnit.test( "2 subforms (1 read only and 1 with 2 read only fields) selecting and cut/paste (cuting the same record twice) test", function( assert ) {

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
        ],
        "externalMembers": [
            {
                "code": "5",
                "name": "Ned Flanders",
                "description": "Description of Ned Flanders"
            }
        ]
    };
    testUtils.setService( key, record );

    thisTestOptions = {
        pageConf: {
            pages: {
                update: {
                    buttons: {
                        toolba2: toolbar
                    }
                }
            }
        },
        fields: {
            members: {
                readOnly: true,
                components: {
                    selecting: {
                        isOn: true,
                        multiple: true,
                        mode: [ 'checkbox', 'onRowClick' ] // Options are checkbox and onRowClick
                    }
                }
            },
            externalMembers: {
                type: 'subform',
                subformKey: 'code',
                fields: { 
                    code: { 
                        readOnly: true
                    },
                    name: { 
                        readOnly: true
                    },
                    description: {
                        type: 'textarea',
                        formFieldAttributes: {
                            rows: 3,
                            cols: 80
                        }
                    }
                },
                buttons: {
                    toolbar: {
                        newRegisterRow: true
                    },
                    byRow: {
                        openEditRegisterForm: false,
                        openDeleteRegisterForm: false,
                        deleteRegisterRow: true
                    }
                },
                components: {
                    selecting: {
                        isOn: true,
                        multiple: true,
                        mode: [ 'checkbox', 'onRowClick' ] // Options are checkbox and onRowClick
                    }
                }
            }
        },
        events: {
            formCreated: function ( data ) {
                $( 'button.copyMembers' ).click( 
                    function ( event ) {
                        event.preventDefault();
                        copyMembers( 'members', 'externalMembers', true );
                    }
                );
                $( 'button.copyExternalMembers' ).click( 
                    function ( event ) {
                        event.preventDefault();
                        copyMembers( 'externalMembers', 'members', true );
                    }
                );
            }
        }
    };
    options = $.extend( true, {}, subformTestOptions, thisTestOptions );
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );

            // Test it!
            assert.equal( testHelper.getSelectedFromSubform( 'members' ).length, 0 );
            assert.equal( testHelper.getSelectedFromSubform( 'externalMembers' ).length, 0 );
            testHelper.assertHistory( assert, 0, 0, true );

            // Select
            testHelper.readOnlySubformSelect( 'members', '1', '3' );
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'members' ), 
                [ 
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "description": "Description of Bart Simpson"
                    },
                    {
                        "code": "3",
                        "name": "Marge Simpson",
                        "description": "Description of Marge Simpson"
                    }
                ]);
            assert.equal( testHelper.getSelectedFromSubform( 'externalMembers' ).length, 0 );
            
            // Cut selected items from members to external
            $( 'button.copyMembers' ).click();
            assert.deepEqual( 
                testHelper.getReadOnlySubformItemsKeys( 'externalMembers' ), 
                [ '5', '1', '3' ]);
            assert.deepEqual( 
                testHelper.getReadOnlySubformItemsKeys( 'members' ), 
                [ '2', '4' ]);
            testHelper.assertHistory( assert, 1, 0, true );
            
            // Select
            testHelper.subformSelectByText( 'externalMembers', '5', '1' );
            
            // Cut selected items from external to members
            $( 'button.copyExternalMembers' ).click();
            assert.deepEqual( 
                testHelper.getReadOnlySubformItemsKeys( 'members' ), 
                [ '2', '4', '5', '1' ]);
            assert.deepEqual( 
                testHelper.getReadOnlySubformItemsKeys( 'externalMembers' ), 
                [ '3' ]);
            testHelper.assertHistory( assert, 2, 0, true );
            
            // Undo
            testHelper.clickUndoButton();
            assert.deepEqual( 
                testHelper.getReadOnlySubformItemsKeys( 'externalMembers' ), 
                [ '5', '1', '3' ]);
            assert.deepEqual( 
                testHelper.getReadOnlySubformItemsKeys( 'members' ), 
                [ '2', '4' ]);
            testHelper.assertHistory( assert, 1, 1, true );

            // Redo
            testHelper.clickRedoButton();
            assert.deepEqual( 
                testHelper.getReadOnlySubformItemsKeys( 'members' ), 
                [ '2', '4', '5', '1' ]);
            assert.deepEqual( 
                testHelper.getReadOnlySubformItemsKeys( 'externalMembers' ), 
                [ '3' ]);
            testHelper.assertHistory( assert, 2, 0, true );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();
            
            // Check storage
            record.members = [
                {
                    "code": "2",
                    "name": "Lisa Simpson",
                    "description": "Description of Lisa Simpson"
                },
                {
                    "code": "4",
                    "name": "Homer Simpson",
                    "description": "Description of Homer Simpson"
                },
                {
                    "code": "5",
                    "name": "Ned Flanders",
                    "description": "Description of Ned Flanders"
                },
                {
                    "code": "1",
                    "name": "Bart Simpson",
                    "description": "Description of Bart Simpson"
                }
            ];
            record.externalMembers = [
                {
                    "code": "3",
                    "name": "Marge Simpson",
                    "description": "Description of Marge Simpson"
                }
            ];
            assert.deepEqual( testUtils.getService( key ), record );
            
            done();
        }
    );
});
