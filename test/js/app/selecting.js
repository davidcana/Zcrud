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
            $( '#departmentsContainer' ).zcrud( 'load' );

            var $departmentsContainer = $( '#departmentsContainer' );
            var getSelected = function(){
                return $departmentsContainer.zcrud( 'getSelectedRecords' );
            };

            var $tbody = $( '#zcrud-list-tbody-department' );
            var select = function(){
                for ( var c = 0; c < arguments.length; c++ ){
                    var id = arguments[ c ];
                    $tbody.find( "[data-record-key='" + id + "'] input.zcrud-select-row" ).trigger( 'click' );
                }
            };

            var toggleSelect = function(){
                $departmentsContainer.find( "input.zcrud-select-all-rows" ).trigger( 'click' );
            };

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
            assert.equal( getSelected().length, 0 );

            // Select
            select( '3', '5', '7' );
            assert.deepEqual( 
                getSelected(), 
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
            select( '3', '5', '7' );
            assert.equal( getSelected().length, 0 );

            // Select again
            select( '3', '5', '7' );
            assert.deepEqual( 
                getSelected(), 
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
            select( '9' );
            assert.deepEqual( 
                getSelected(), 
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
            toggleSelect();
            assert.deepEqual( 
                getSelected(), 
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
            toggleSelect();
            assert.equal( getSelected().length, 0 );

            // Select all being no selected
            toggleSelect();
            assert.deepEqual( 
                getSelected(), 
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
            select( '1', '4', '7' );
            assert.deepEqual( 
                getSelected(), 
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
            assert.equal( getSelected().length, 0 );
            
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
            defaultPageConf: {
                buttons: {
                    toolbarExtension: 'customButtons'
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
                $( '#doAction' ).click( function ( event ) {
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
            $( '#departmentsContainer' ).zcrud( 'load' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );
            
            // Add some functions
            var $departmentsContainer = $( '#departmentsContainer' );
            var getSelected = function(){
                var listPage = $departmentsContainer.zcrud( 'getListPage' );
                var formPage = listPage.getCurrentFormPage();
                return formPage.getField( 'members' ).getComponent( 'selecting' ).getSelectedRecords();
            };

            var $tbody = $departmentsContainer.find( '.zcrud-field-members tbody' );
            var select = function(){
                for ( var c = 0; c < arguments.length; c++ ){
                    var id = arguments[ c ];
                    $tbody.find( "[data-record-key='" + id + "'] input.zcrud-select-row" ).trigger( 'click' );
                }
            };

            var toggleSelect = function(){
                $departmentsContainer.find( ".zcrud-field-members input.zcrud-select-all-rows" ).trigger( 'click' );
            };
            
            // Test it!
            assert.equal( getSelected().length, 0 );
            
            // Select
            select( '1', '3' );
            assert.deepEqual( 
                getSelected(), 
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
            select( '1', '3' );
            assert.equal( getSelected().length, 0 );

            // Select again
            select( '1' );
            assert.deepEqual( 
                getSelected(), 
                [ 
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "description": "Description of Bart Simpson"
                    }
                ] );
            
            // Test ranges
            testHelper.keyDown( 16 );
            select( '3' );
            assert.deepEqual( 
                getSelected(), 
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
            toggleSelect();
            assert.deepEqual( 
                getSelected(), 
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
            toggleSelect();
            assert.equal( getSelected().length, 0 );
            
            // Select all being no selected
            toggleSelect();
            assert.deepEqual( 
                getSelected(), 
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
            select( '1', '4' );
            assert.deepEqual( 
                getSelected(), 
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

QUnit.test( "2 subforms selecting test", function( assert ) {

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
                "name": "Ned Flanders Simpson",
                "description": "Description of Ned Flanders"
            }
        ]
    };
    testUtils.setService( key, record );

    thisTestOptions = {
        pageConf: {
            defaultPageConf: {
                buttons: {
                    toolbarExtension: '2CustomButtons'
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
                fields: { 
                    code: { 
                        subformKey: true
                    },
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
                $( '#copyMembers' ).click( 
                    function ( event ) {
                        event.preventDefault();
                        copyMembers( 'members', 'externalMembers' );
                    }
                );
                $( '#copyExternalMembers' ).click( 
                    function ( event ) {
                        event.preventDefault();
                        copyMembers( 'externalMembers', 'members' );
                    }
                );
            }
        }
    };
    options = $.extend( true, {}, subformTestOptions, thisTestOptions );
    var done = assert.async();

    var copyMembers = function( fromFieldId, toFieldId ){
        
        var listPage = $( '#departmentsContainer' ).zcrud( 'getListPage' );
        var formPage = listPage.getCurrentFormPage();
        var selectedRecords = formPage.getField( fromFieldId ).getComponent( 'selecting' ).getSelectedRecords();
        
        if ( selectedRecords.length == 0 ){
            alert( 'Please, select at least one member!' );
            return;
        }
        
        /*
        alert( 
            JSON.stringify( selectedRecords )
        );*/
        for ( var c = 0; c < selectedRecords.length; ++c ){
            var currentRecord = selectedRecords[ c ];
            alert( 
                JSON.stringify( currentRecord )
            );
            formPage.getField( toFieldId );
        }
    };
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'load' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );

            // Add some functions
            var $departmentsContainer = $( '#departmentsContainer' );
            var getSelected = function(){
                var listPage = $departmentsContainer.zcrud( 'getListPage' );
                var formPage = listPage.getCurrentFormPage();
                return formPage.getField( 'members' ).getComponent( 'selecting' ).getSelectedRecords();
            };

            var $tbody = $departmentsContainer.find( '.zcrud-field-members tbody' );
            var select = function(){
                for ( var c = 0; c < arguments.length; c++ ){
                    var id = arguments[ c ];
                    $tbody.find( "[data-record-key='" + id + "'] input.zcrud-select-row" ).trigger( 'click' );
                }
            };

            var toggleSelect = function(){
                $departmentsContainer.find( ".zcrud-field-members input.zcrud-select-all-rows" ).trigger( 'click' );
            };

            // Test it!
            assert.equal( getSelected().length, 0 );



            done();
        }
    );
});
