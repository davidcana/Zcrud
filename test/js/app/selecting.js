
import { utils } from '../../../js/app/utils.js';
import { zzDOM } from '../../../js/app/zzDOMPlugin.js';
var $ = zzDOM.zz;

import { testHelper } from './testHelper.js';
import { testServerSide } from './testServerSide.js';

import { defaultTestOptions as listTestOptions } from './defaultTestOptions.js';
import { subformTestOptions } from './subformTestOptions.js';

var thisTestOptions = undefined;
var options = undefined;
var toolbar = [ 
    'undo', 
    'redo', 
    'form_cancel', 
    'form_submit', 
    {
        cssClass: 'copyMembers',
        textsBundle: {
            title: undefined,
            content: {
                translate: false,
                text: 'Copy members'
            }
        }
    },
    {
        cssClass: 'copyExternalMembers',
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
QUnit.test( 'list selecting test', function( assert ) {
    
    // Setup services
    testServerSide.resetServices();
    
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
    options = utils.extend( true, {}, listTestOptions, thisTestOptions );
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
                        'id': '3',
                        'name': 'Service 3'
                    },
                    {
                        'id': '5',
                        'name': 'Service 5'
                    },
                    {
                        'id': '7',
                        'name': 'Service 7'
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
                        'id': '3',
                        'name': 'Service 3'
                    },
                    {
                        'id': '5',
                        'name': 'Service 5'
                    },
                    {
                        'id': '7',
                        'name': 'Service 7'
                    }
                ] );

            // Test ranges
            testHelper.keyDown( 'Shift' );
            testHelper.listSelect( '9' );
            assert.deepEqual( 
                testHelper.getSelectedFromList(), 
                [ 
                    {
                        'id': '3',
                        'name': 'Service 3'
                    },
                    {
                        'id': '5',
                        'name': 'Service 5'
                    },
                    {
                        'id': '7',
                        'name': 'Service 7'
                    },
                    {
                        'id': '8',
                        'name': 'Service 8'
                    },
                    {
                        'id': '9',
                        'name': 'Service 9'
                    }
                ] );
            testHelper.keyUp( 'Shift' );

            // Select all being some selected
            testHelper.listToggleSelect();
            assert.deepEqual( 
                testHelper.getSelectedFromList(), 
                [ 
                    {
                        'id': '1',
                        'name': 'Service 1'
                    },
                    {
                        'id': '2',
                        'name': 'Service 2'
                    },
                    {
                        'id': '3',
                        'name': 'Service 3'
                    },
                    {
                        'id': '4',
                        'name': 'Service 4'
                    },
                    {
                        'id': '5',
                        'name': 'Service 5'
                    },
                    {
                        'id': '6',
                        'name': 'Service 6'
                    },
                    {
                        'id': '7',
                        'name': 'Service 7'
                    },
                    {
                        'id': '8',
                        'name': 'Service 8'
                    },
                    {
                        'id': '9',
                        'name': 'Service 9'
                    },
                    {
                        'id': '10',
                        'name': 'Service 10'
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
                        'id': '1',
                        'name': 'Service 1'
                    },
                    {
                        'id': '2',
                        'name': 'Service 2'
                    },
                    {
                        'id': '3',
                        'name': 'Service 3'
                    },
                    {
                        'id': '4',
                        'name': 'Service 4'
                    },
                    {
                        'id': '5',
                        'name': 'Service 5'
                    },
                    {
                        'id': '6',
                        'name': 'Service 6'
                    },
                    {
                        'id': '7',
                        'name': 'Service 7'
                    },
                    {
                        'id': '8',
                        'name': 'Service 8'
                    },
                    {
                        'id': '9',
                        'name': 'Service 9'
                    },
                    {
                        'id': '10',
                        'name': 'Service 10'
                    }
                ] );

            // Deselect some
            testHelper.listSelect( '1', '4', '7' );
            assert.deepEqual( 
                testHelper.getSelectedFromList(), 
                [ 
                    {
                        'id': '2',
                        'name': 'Service 2'
                    },
                    {
                        'id': '3',
                        'name': 'Service 3'
                    },
                    {
                        'id': '5',
                        'name': 'Service 5'
                    },
                    {
                        'id': '6',
                        'name': 'Service 6'
                    },
                    {
                        'id': '8',
                        'name': 'Service 8'
                    },
                    {
                        'id': '9',
                        'name': 'Service 9'
                    },
                    {
                        'id': '10',
                        'name': 'Service 10'
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

QUnit.test( 'subform selecting test', function( assert ) {

    // Setup services
    testServerSide.resetServices();
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
            },
            {
                'code': '3',
                'name': 'Marge Simpson',
                'description': 'Description of Marge Simpson'
            },
            {
                'code': '4',
                'name': 'Homer Simpson',
                'description': 'Description of Homer Simpson'
            }
        ]
    };
    testServerSide.setService( key, record );
    
    thisTestOptions = {
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
                                cssClass: 'doAction',
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
                $( 'button.doAction' ).on( 'click',  function ( event ) {
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
    options = utils.extend( true, {}, subformTestOptions, thisTestOptions );
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
                        'code': '1',
                        'name': 'Bart Simpson',
                        'description': 'Description of Bart Simpson'
                    },
                    {
                        'code': '3',
                        'name': 'Marge Simpson',
                        'description': 'Description of Marge Simpson'
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
                        'code': '1',
                        'name': 'Bart Simpson',
                        'description': 'Description of Bart Simpson'
                    }
                ]);
            
            // Test ranges
            testHelper.keyDown( 'Shift' );
            testHelper.subformSelect( 'members', '3' );
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'members' ), 
                [ 
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
                        'name': 'Marge Simpson',
                        'description': 'Description of Marge Simpson'
                    }
                ] );
            testHelper.keyUp( 'Shift' );
            
            // Select all being some selected
            testHelper.subformToggleSelect( 'members' );
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'members' ), 
                [ 
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
                        'name': 'Marge Simpson',
                        'description': 'Description of Marge Simpson'
                    },
                    {
                        'code': '4',
                        'name': 'Homer Simpson',
                        'description': 'Description of Homer Simpson'
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
                        'name': 'Marge Simpson',
                        'description': 'Description of Marge Simpson'
                    },
                    {
                        'code': '4',
                        'name': 'Homer Simpson',
                        'description': 'Description of Homer Simpson'
                    }
                ] );
            
            // Deselect some
            testHelper.subformSelect( 'members', '1', '4' );
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'members' ), 
                [ 
                    {
                        'code': '2',
                        'name': 'Lisa Simpson',
                        'description': 'Description of Lisa Simpson'
                    },
                    {
                        'code': '3',
                        'name': 'Marge Simpson',
                        'description': 'Description of Marge Simpson'
                    }
                ] );
            
            // TODO Test move to next page, all selected must be deselected
            
            done();
        }
    );
});

QUnit.test( '2 subforms selecting and copy/paste test', function( assert ) {

    // Setup services
    testServerSide.resetServices();
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
            },
            {
                'code': '3',
                'name': 'Marge Simpson',
                'description': 'Description of Marge Simpson'
            },
            {
                'code': '4',
                'name': 'Homer Simpson',
                'description': 'Description of Homer Simpson'
            }
        ],
        'externalMembers': [
            {
                'code': '5',
                'name': 'Ned Flanders',
                'description': 'Description of Ned Flanders'
            }
        ]
    };
    testServerSide.setService( key, record );

    thisTestOptions = {
        pageConf: {
            pages: {
                update: {
                    buttons: {
                        toolbar: toolbar
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
                        attributes: {
                            field: {
                                rows: 3
                            }
                        }
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
                $( 'button.copyMembers' ).on( 'click',  
                    function ( event ) {
                        event.preventDefault();
                        copyMembers( 'members', 'externalMembers', false );
                    }
                );
                $( 'button.copyExternalMembers' ).on( 'click',  
                    function ( event ) {
                        event.preventDefault();
                        copyMembers( 'externalMembers', 'members', false );
                    }
                );
            }
        }
    };
    options = utils.extend( true, {}, subformTestOptions, thisTestOptions );
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
                        'code': '1',
                        'name': 'Bart Simpson',
                        'description': 'Description of Bart Simpson'
                    },
                    {
                        'code': '3',
                        'name': 'Marge Simpson',
                        'description': 'Description of Marge Simpson'
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
                        'code': '1',
                        'name': 'Bart Simpson',
                        'description': 'Description of Bart Simpson'
                    },
                    {
                        'code': '3',
                        'name': 'Marge Simpson',
                        'description': 'Description of Marge Simpson'
                    }
                ]);
            assert.equal( testHelper.getSelectedFromSubform( 'externalMembers' ).length, 0 );
            
            // Select at the external members
            testHelper.subformSelect( 'externalMembers', '5' );
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'externalMembers' ), 
                [ 
                    {
                        'code': '5',
                        'name': 'Ned Flanders',
                        'description': 'Description of Ned Flanders'
                    }
                ]);
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'members' ), 
                [ 
                    {
                        'code': '1',
                        'name': 'Bart Simpson',
                        'description': 'Description of Bart Simpson'
                    },
                    {
                        'code': '3',
                        'name': 'Marge Simpson',
                        'description': 'Description of Marge Simpson'
                    }
                ]);
            
            // Copy selected items from members to external
            $( 'button.copyMembers' ).trigger( 'click' );
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'externalMembers' ), 
                [ '5', '1', '3' ]);
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'members' ), 
                [ '1', '2', '3', '4' ]);
            testHelper.assertHistory( assert, 1, 0, true );
            
            // Copy selected items from external to members
            $( 'button.copyExternalMembers' ).trigger( 'click' );
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
            $( 'button.copyExternalMembers' ).trigger( 'click' );
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
                    'name': 'Marge Simpson',
                    'description': 'Description of Marge Simpson'
                },
                {
                    'code': '4',
                    'name': 'Homer Simpson',
                    'description': 'Description of Homer Simpson'
                },
                {
                    'code': '5',
                    'name': 'Ned Flanders',
                    'description': 'Description of Ned Flanders'
                }
            ];
            record.externalMembers = [
                {
                    'code': '5',
                    'name': 'Ned Flanders',
                    'description': 'Description of Ned Flanders'
                },
                {
                    'code': '1',
                    'name': 'Bart Simpson',
                    'description': 'Description of Bart Simpson'
                },
                {
                    'code': '3',
                    'name': 'Marge Simpson',
                    'description': 'Description of Marge Simpson'
                }
            ];
            assert.deepEqual( testServerSide.getService( key ), record );
            
            done();
        }
    );
});

QUnit.test( '2 subforms selecting and cut/paste test', function( assert ) {

    // Setup services
    testServerSide.resetServices();
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
            },
            {
                'code': '3',
                'name': 'Marge Simpson',
                'description': 'Description of Marge Simpson'
            },
            {
                'code': '4',
                'name': 'Homer Simpson',
                'description': 'Description of Homer Simpson'
            }
        ],
        'externalMembers': [
            {
                'code': '5',
                'name': 'Ned Flanders',
                'description': 'Description of Ned Flanders'
            }
        ]
    };
    testServerSide.setService( key, record );

    thisTestOptions = {
        pageConf: {
            pages: {
                update: {
                    buttons: {
                        toolbar: toolbar
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
                        attributes: {
                            field: {
                                rows: 3
                            }
                        }
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
                $( 'button.copyMembers' ).on( 'click',  
                    function ( event ) {
                        event.preventDefault();
                        copyMembers( 'members', 'externalMembers', true );
                    }
                );
                $( 'button.copyExternalMembers' ).on( 'click',  
                    function ( event ) {
                        event.preventDefault();
                        copyMembers( 'externalMembers', 'members', true );
                    }
                );
            }
        }
    };
    options = utils.extend( true, {}, subformTestOptions, thisTestOptions );
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
                        'code': '1',
                        'name': 'Bart Simpson',
                        'description': 'Description of Bart Simpson'
                    },
                    {
                        'code': '3',
                        'name': 'Marge Simpson',
                        'description': 'Description of Marge Simpson'
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
                        'code': '1',
                        'name': 'Bart Simpson',
                        'description': 'Description of Bart Simpson'
                    },
                    {
                        'code': '3',
                        'name': 'Marge Simpson',
                        'description': 'Description of Marge Simpson'
                    }
                ]);
            assert.equal( testHelper.getSelectedFromSubform( 'externalMembers' ).length, 0 );

            // Select at the external members
            testHelper.subformSelect( 'externalMembers', '5' );
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'externalMembers' ), 
                [ 
                    {
                        'code': '5',
                        'name': 'Ned Flanders',
                        'description': 'Description of Ned Flanders'
                    }
                ]);
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'members' ), 
                [ 
                    {
                        'code': '1',
                        'name': 'Bart Simpson',
                        'description': 'Description of Bart Simpson'
                    },
                    {
                        'code': '3',
                        'name': 'Marge Simpson',
                        'description': 'Description of Marge Simpson'
                    }
                ]);

            // Copy selected items from members to external
            $( 'button.copyMembers' ).trigger( 'click' );
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'externalMembers' ), 
                [ '5', '1', '3' ]);
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'members' ), 
                [ '2', '4' ]);
            testHelper.assertHistory( assert, 1, 0, true );
            
            // Copy selected items from external to members
            $( 'button.copyExternalMembers' ).trigger( 'click' );
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
                    'code': '2',
                    'name': 'Lisa Simpson',
                    'description': 'Description of Lisa Simpson'
                },
                {
                    'code': '4',
                    'name': 'Homer Simpson',
                    'description': 'Description of Homer Simpson'
                },
                {
                    'code': '5',
                    'name': 'Ned Flanders',
                    'description': 'Description of Ned Flanders'
                }
            ];
            record.externalMembers = [
                {
                    'code': '1',
                    'name': 'Bart Simpson',
                    'description': 'Description of Bart Simpson'
                },
                {
                    'code': '3',
                    'name': 'Marge Simpson',
                    'description': 'Description of Marge Simpson'
                }
            ];
            assert.deepEqual( testServerSide.getService( key ), record );
            
            done();
        }
    );
});

QUnit.test( '2 subforms (1 read only) selecting and copy/paste (saving 2 times) test', function( assert ) {

    // Setup services
    testServerSide.resetServices();
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
            },
            {
                'code': '3',
                'name': 'Marge Simpson',
                'description': 'Description of Marge Simpson'
            },
            {
                'code': '4',
                'name': 'Homer Simpson',
                'description': 'Description of Homer Simpson'
            }
        ],
        'externalMembers': [
            {
                'code': '5',
                'name': 'Ned Flanders',
                'description': 'Description of Ned Flanders'
            }
        ]
    };
    testServerSide.setService( key, record );

    thisTestOptions = {
        pageConf: {
            pages: {
                update: {
                    buttons: {
                        toolbar: toolbar
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
                        attributes: {
                            field: {
                                rows: 3
                            }
                        }
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
                $( 'button.copyMembers' ).on(
                    'click',
                    function ( event ) {
                        event.preventDefault();
                        copyMembers( 'members', 'externalMembers', false );
                    }
                );
                $( 'button.copyExternalMembers' ).on(
                    'click',
                    function ( event ) {
                        event.preventDefault();
                        copyMembers( 'externalMembers', 'members', false );
                    }
                );
            }
        }
    };
    options = utils.extend( true, {}, subformTestOptions, thisTestOptions );
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
                        'code': '1',
                        'name': 'Bart Simpson',
                        'description': 'Description of Bart Simpson'
                    },
                    {
                        'code': '3',
                        'name': 'Marge Simpson',
                        'description': 'Description of Marge Simpson'
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
                        'code': '1',
                        'name': 'Bart Simpson',
                        'description': 'Description of Bart Simpson'
                    },
                    {
                        'code': '3',
                        'name': 'Marge Simpson',
                        'description': 'Description of Marge Simpson'
                    }
                ]);
            assert.equal( testHelper.getSelectedFromSubform( 'externalMembers' ).length, 0 );
            
            // Select at the external members
            testHelper.subformSelect( 'externalMembers', '5' );
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'externalMembers' ), 
                [ 
                    {
                        'code': '5',
                        'name': 'Ned Flanders',
                        'description': 'Description of Ned Flanders'
                    }
                ]);
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'members' ), 
                [ 
                    {
                        'code': '1',
                        'name': 'Bart Simpson',
                        'description': 'Description of Bart Simpson'
                    },
                    {
                        'code': '3',
                        'name': 'Marge Simpson',
                        'description': 'Description of Marge Simpson'
                    }
                ]);
            
            // Copy selected items from members to external
            $( 'button.copyMembers' ).trigger( 'click' );
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'externalMembers' ), 
                [ '5', '1', '3' ]);
            assert.deepEqual( 
                testHelper.getReadOnlySubformItemsKeys( 'members' ), 
                [ '1', '2', '3', '4' ]);
            testHelper.assertHistory( assert, 1, 0, true );
            
            // Copy selected items from external to members
            $( 'button.copyExternalMembers' ).trigger( 'click' );
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
            $( 'button.copyExternalMembers' ).trigger( 'click' );
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
                    'name': 'Marge Simpson',
                    'description': 'Description of Marge Simpson'
                },
                {
                    'code': '4',
                    'name': 'Homer Simpson',
                    'description': 'Description of Homer Simpson'
                },
                {
                    'code': '5',
                    'name': 'Ned Flanders',
                    'description': 'Description of Ned Flanders'
                }
            ];
            record.externalMembers = [
                {
                    'code': '5',
                    'name': 'Ned Flanders',
                    'description': 'Description of Ned Flanders'
                },
                {
                    'code': '1',
                    'name': 'Bart Simpson',
                    'description': 'Description of Bart Simpson'
                },
                {
                    'code': '3',
                    'name': 'Marge Simpson',
                    'description': 'Description of Marge Simpson'
                }
            ];
            assert.deepEqual( testServerSide.getService( key ), record );
            /*
            // Go to edit form again
            testHelper.clickUpdateListButton( key );
            
            // Select again
            testHelper.readOnlySubformSelect( 'members', '2' );
            
            // Copy selected items from members to external
            $( 'button.copyMembers' ).trigger( 'click' );
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
                    'name': 'Marge Simpson',
                    'description': 'Description of Marge Simpson'
                },
                {
                    'code': '4',
                    'name': 'Homer Simpson',
                    'description': 'Description of Homer Simpson'
                },
                {
                    'code': '5',
                    'name': 'Ned Flanders',
                    'description': 'Description of Ned Flanders'
                }
            ];
            record.externalMembers = [
                {
                    'code': '5',
                    'name': 'Ned Flanders',
                    'description': 'Description of Ned Flanders'
                },
                {
                    'code': '1',
                    'name': 'Bart Simpson',
                    'description': 'Description of Bart Simpson'
                },
                {
                    'code': '3',
                    'name': 'Marge Simpson',
                    'description': 'Description of Marge Simpson'
                },
                {
                    'code': '2',
                    'name': 'Lisa Simpson',
                    'description': 'Description of Lisa Simpson'
                }
            ];
            assert.deepEqual( testServerSide.getService( key ), record );
            */
            done();
        }
    );
});

QUnit.test( '2 subforms (1 read only) selecting and cut/paste (saving 2 times) test', function( assert ) {

    // Setup services
    testServerSide.resetServices();
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
            },
            {
                'code': '3',
                'name': 'Marge Simpson',
                'description': 'Description of Marge Simpson'
            },
            {
                'code': '4',
                'name': 'Homer Simpson',
                'description': 'Description of Homer Simpson'
            }
        ],
        'externalMembers': [
            {
                'code': '5',
                'name': 'Ned Flanders',
                'description': 'Description of Ned Flanders'
            }
        ]
    };
    testServerSide.setService( key, record );

    thisTestOptions = {
        pageConf: {
            pages: {
                update: {
                    buttons: {
                        toolbar: toolbar
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
                        attributes: {
                            field: {
                                rows: 3
                            }
                        }
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
                $( 'button.copyMembers' ).on( 'click',  
                    function ( event ) {
                        event.preventDefault();
                        copyMembers( 'members', 'externalMembers', true );
                    }
                );
                $( 'button.copyExternalMembers' ).on( 'click',  
                    function ( event ) {
                        event.preventDefault();
                        copyMembers( 'externalMembers', 'members', true );
                    }
                );
            }
        }
    };
    options = utils.extend( true, {}, subformTestOptions, thisTestOptions );
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
                        'code': '1',
                        'name': 'Bart Simpson',
                        'description': 'Description of Bart Simpson'
                    },
                    {
                        'code': '3',
                        'name': 'Marge Simpson',
                        'description': 'Description of Marge Simpson'
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
                        'code': '1',
                        'name': 'Bart Simpson',
                        'description': 'Description of Bart Simpson'
                    },
                    {
                        'code': '3',
                        'name': 'Marge Simpson',
                        'description': 'Description of Marge Simpson'
                    }
                ]);
            assert.equal( testHelper.getSelectedFromSubform( 'externalMembers' ).length, 0 );
            
            // Select at the external members
            testHelper.subformSelect( 'externalMembers', '5' );
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'externalMembers' ), 
                [ 
                    {
                        'code': '5',
                        'name': 'Ned Flanders',
                        'description': 'Description of Ned Flanders'
                    }
                ]);
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'members' ), 
                [ 
                    {
                        'code': '1',
                        'name': 'Bart Simpson',
                        'description': 'Description of Bart Simpson'
                    },
                    {
                        'code': '3',
                        'name': 'Marge Simpson',
                        'description': 'Description of Marge Simpson'
                    }
                ]);
            
            // Cut selected items from members to external
            $( 'button.copyMembers' ).trigger( 'click' );
            assert.deepEqual( 
                testHelper.getSubformItemsKeys( 'externalMembers' ), 
                [ '5', '1', '3' ]);
            assert.deepEqual( 
                testHelper.getReadOnlySubformItemsKeys( 'members' ), 
                [ '2', '4' ]);
            testHelper.assertHistory( assert, 1, 0, true );
            
            // Cut selected items from external to members
            $( 'button.copyExternalMembers' ).trigger( 'click' );
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
                    'code': '2',
                    'name': 'Lisa Simpson',
                    'description': 'Description of Lisa Simpson'
                },
                {
                    'code': '4',
                    'name': 'Homer Simpson',
                    'description': 'Description of Homer Simpson'
                }
            ];
            record.externalMembers = [
                {
                    'code': '5',
                    'name': 'Ned Flanders',
                    'description': 'Description of Ned Flanders'
                },
                {
                    'code': '1',
                    'name': 'Bart Simpson',
                    'description': 'Description of Bart Simpson'
                },
                {
                    'code': '3',
                    'name': 'Marge Simpson',
                    'description': 'Description of Marge Simpson'
                }
            ];
            assert.deepEqual( testServerSide.getService( key ), record );

            // Go to edit form again
            testHelper.clickUpdateListButton( key );
            
            // Select again
            testHelper.subformSelect( 'externalMembers', '3', '5' );
            
            // Cut selected items from external to members
            $( 'button.copyExternalMembers' ).trigger( 'click' );
            
            // Submit a second time and show the list again
            testHelper.clickFormSubmitButton();
            
            // Check storage a second time
            record.members = [
                {
                    'code': '2',
                    'name': 'Lisa Simpson',
                    'description': 'Description of Lisa Simpson'
                },
                {
                    'code': '4',
                    'name': 'Homer Simpson',
                    'description': 'Description of Homer Simpson'
                },
                {
                    'code': '5',
                    'name': 'Ned Flanders',
                    'description': 'Description of Ned Flanders'
                },
                {
                    'code': '3',
                    'name': 'Marge Simpson',
                    'description': 'Description of Marge Simpson'
                }
            ];
            record.externalMembers = [
                {
                    'code': '1',
                    'name': 'Bart Simpson',
                    'description': 'Description of Bart Simpson'
                }
            ];
            assert.deepEqual( testServerSide.getService( key ), record );
            
            done();
        }
    );
});

QUnit.test( '2 subforms (1 read only) selecting and cut/paste (cuting the same record twice) test', function( assert ) {

    // Setup services
    testServerSide.resetServices();
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
            },
            {
                'code': '3',
                'name': 'Marge Simpson',
                'description': 'Description of Marge Simpson'
            },
            {
                'code': '4',
                'name': 'Homer Simpson',
                'description': 'Description of Homer Simpson'
            }
        ],
        'externalMembers': [
            {
                'code': '5',
                'name': 'Ned Flanders',
                'description': 'Description of Ned Flanders'
            }
        ]
    };
    testServerSide.setService( key, record );

    thisTestOptions = {
        pageConf: {
            pages: {
                update: {
                    buttons: {
                        toolbar: toolbar
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
                        attributes: {
                            field: {
                                rows: 3
                            }
                        }
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
                $( 'button.copyMembers' ).on( 'click',  
                    function ( event ) {
                        event.preventDefault();
                        copyMembers( 'members', 'externalMembers', true );
                    }
                );
                $( 'button.copyExternalMembers' ).on( 'click',  
                    function ( event ) {
                        event.preventDefault();
                        copyMembers( 'externalMembers', 'members', true );
                    }
                );
            }
        }
    };
    options = utils.extend( true, {}, subformTestOptions, thisTestOptions );
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
                        'code': '1',
                        'name': 'Bart Simpson',
                        'description': 'Description of Bart Simpson'
                    },
                    {
                        'code': '3',
                        'name': 'Marge Simpson',
                        'description': 'Description of Marge Simpson'
                    }
                ]);
            assert.equal( testHelper.getSelectedFromSubform( 'externalMembers' ).length, 0 );

            // Cut selected items from members to external
            $( 'button.copyMembers' ).trigger( 'click' );
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
            $( 'button.copyExternalMembers' ).trigger( 'click' );
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
                    'code': '2',
                    'name': 'Lisa Simpson',
                    'description': 'Description of Lisa Simpson'
                },
                {
                    'code': '4',
                    'name': 'Homer Simpson',
                    'description': 'Description of Homer Simpson'
                },
                {
                    'code': '5',
                    'name': 'Ned Flanders',
                    'description': 'Description of Ned Flanders'
                },
                {
                    'code': '1',
                    'name': 'Bart Simpson',
                    'description': 'Description of Bart Simpson'
                }
            ];
            record.externalMembers = [
                {
                    'code': '3',
                    'name': 'Marge Simpson',
                    'description': 'Description of Marge Simpson'
                }
            ];
            assert.deepEqual( testServerSide.getService( key ), record );
            
            done();
        }
    );
});

QUnit.test( '2 subforms (1 read only and 1 with 2 read only fields) selecting and cut/paste (cuting the same record twice) test', function( assert ) {

    // Setup services
    testServerSide.resetServices();
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
            },
            {
                'code': '3',
                'name': 'Marge Simpson',
                'description': 'Description of Marge Simpson'
            },
            {
                'code': '4',
                'name': 'Homer Simpson',
                'description': 'Description of Homer Simpson'
            }
        ],
        'externalMembers': [
            {
                'code': '5',
                'name': 'Ned Flanders',
                'description': 'Description of Ned Flanders'
            }
        ]
    };
    testServerSide.setService( key, record );

    thisTestOptions = {
        pageConf: {
            pages: {
                update: {
                    buttons: {
                        toolbar: toolbar
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
                        attributes: {
                            field: {
                                rows: 3
                            }
                        }
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
                $( 'button.copyMembers' ).on( 'click',  
                    function ( event ) {
                        event.preventDefault();
                        copyMembers( 'members', 'externalMembers', true );
                    }
                );
                $( 'button.copyExternalMembers' ).on( 'click',  
                    function ( event ) {
                        event.preventDefault();
                        copyMembers( 'externalMembers', 'members', true );
                    }
                );
            }
        }
    };
    options = utils.extend( true, {}, subformTestOptions, thisTestOptions );
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
                        'code': '1',
                        'name': 'Bart Simpson',
                        'description': 'Description of Bart Simpson'
                    },
                    {
                        'code': '3',
                        'name': 'Marge Simpson',
                        'description': 'Description of Marge Simpson'
                    }
                ]);
            assert.equal( testHelper.getSelectedFromSubform( 'externalMembers' ).length, 0 );
            
            // Cut selected items from members to external
            $( 'button.copyMembers' ).trigger( 'click' );
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
            $( 'button.copyExternalMembers' ).trigger( 'click' );
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
                    'code': '2',
                    'name': 'Lisa Simpson',
                    'description': 'Description of Lisa Simpson'
                },
                {
                    'code': '4',
                    'name': 'Homer Simpson',
                    'description': 'Description of Homer Simpson'
                },
                {
                    'code': '5',
                    'name': 'Ned Flanders',
                    'description': 'Description of Ned Flanders'
                },
                {
                    'code': '1',
                    'name': 'Bart Simpson',
                    'description': 'Description of Bart Simpson'
                }
            ];
            record.externalMembers = [
                {
                    'code': '3',
                    'name': 'Marge Simpson',
                    'description': 'Description of Marge Simpson'
                }
            ];
            assert.deepEqual( testServerSide.getService( key ), record );
            
            done();
        }
    );
});
