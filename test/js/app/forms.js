"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var Qunit = require( 'qunit' );
var testHelper = require( './testHelper.js' );
var testUtils = require( './testUtils.js' );

var formTestOptions = require( './editableSubformAsListTestOptions.js' );
//var extendedFormTestOptions = require( './editableSubformAsListExtendedTestOptions.js' );
var thisTestOptions = undefined;
var options = undefined;

// Run tests
/*
QUnit.test( "form simple test", function( assert ) {

    options = $.extend( true, {}, formTestOptions );
    var numberOfOriginalMembers = 12;
    testUtils.resetOriginalAndVerifiedMembers( 'Member', numberOfOriginalMembers );
    
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices();
            $( '#departmentsContainer' ).zcrud( 'renderForm' );
            
            assert.equal( testHelper.getSelectedFromSubform( 'originalMembers', true ).length, 0 );
            
            // Select
            testHelper.subformSelectByText( 'originalMembers', '2', '3' );
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'originalMembers', true ), 
                [ 
                    {
                        "code": "2",
                        "name": "Member 2",
                        "description": "Description of Member 2",
                        "important": false,
                        "hobbies": []
                    },
                    {
                        "code": "3",
                        "name": "Member 3",
                        "description": "Description of Member 3",
                        "important": false,
                        "hobbies": []
                    }
                ]);
            
            // Copy
            var $copyButton = $( 'button.zcrud-copy-subform-rows-command-button' );
            $copyButton.click();
            testHelper.fillSubformNewRow(
                {
                    "description": "Description of Member 3 edited"
                }, 
                'verifiedMembers' );
            
            // Submit and check storage
            testHelper.clickFormSubmitButton();
            
            var expectedVerifiedMembers = {
                "2": {
                    "code": "2",
                    "name": "Member 2",
                    "description": "Description of Member 2",
                    "important": false,
                    "hobbies": []
                },
                "3": {
                    "code": "3",
                    "name": "Member 3",
                    "description": "Description of Member 3 edited",
                    "important": false,
                    "hobbies": []
                }
            };
            assert.deepEqual( 
                testUtils.getVerifiedMembers(), 
                expectedVerifiedMembers );
            
            // Delete row
            testHelper.clickDeleteSubformRowButton( 'verifiedMembers', 0 );
            
            // Submit and check storage
            testHelper.clickFormSubmitButton();

            expectedVerifiedMembers = {
                "3": {
                    "code": "3",
                    "name": "Member 3",
                    "description": "Description of Member 3 edited",
                    "important": false,
                    "hobbies": []
                }
            };
            assert.deepEqual( 
                testUtils.getVerifiedMembers(), 
                expectedVerifiedMembers );
            
            // Select
            testHelper.subformSelectByText( 'originalMembers', '5', '7' );
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'originalMembers', true ), 
                [ 
                    {
                        "code": "5",
                        "name": "Member 5",
                        "description": "Description of Member 5",
                        "important": false,
                        "hobbies": []
                    },
                    {
                        "code": "7",
                        "name": "Member 7",
                        "description": "Description of Member 7",
                        "important": false,
                        "hobbies": []
                    }
                ]);
            
            // Copy
            $copyButton.click();
            testHelper.fillSubformNewRow(
                {
                    "description": "Description of Member 7 edited"
                }, 
                'verifiedMembers' );

            // Submit and check storage
            testHelper.clickFormSubmitButton();

            expectedVerifiedMembers = {
                "3": {
                    "code": "3",
                    "name": "Member 3",
                    "description": "Description of Member 3 edited",
                    "important": false,
                    "hobbies": []
                },
                "5": {
                    "code": "5",
                    "name": "Member 5",
                    "description": "Description of Member 5",
                    "important": false,
                    "hobbies": []
                },
                "7": {
                    "code": "7",
                    "name": "Member 7",
                    "description": "Description of Member 7 edited",
                    "important": false,
                    "hobbies": []
                }
                
            };
            assert.deepEqual( 
                testUtils.getVerifiedMembers(), 
                expectedVerifiedMembers );
            
            done();
        }
    );
});

QUnit.test( "form undo/redo test", function( assert ) {

    options = $.extend( true, {}, formTestOptions );
    var numberOfOriginalMembers = 12;
    testUtils.resetOriginalAndVerifiedMembers( 'Member', numberOfOriginalMembers );

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices();
            $( '#departmentsContainer' ).zcrud( 'renderForm' );

            assert.equal( testHelper.getSelectedFromSubform( 'originalMembers', true ).length, 0 );

            // Select
            testHelper.subformSelectByText( 'originalMembers', '2', '3' );
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'originalMembers', true ), 
                [ 
                    {
                        "code": "2",
                        "name": "Member 2",
                        "description": "Description of Member 2",
                        "important": false,
                        "hobbies": []
                    },
                    {
                        "code": "3",
                        "name": "Member 3",
                        "description": "Description of Member 3",
                        "important": false,
                        "hobbies": []
                    }
                ]);

            // Copy
            var $copyButton = $( 'button.zcrud-copy-subform-rows-command-button' );
            $copyButton.click();
            
            // Check subform
            var expectedVerifiedMembers = [
                {
                    "code": "2",
                    "name": "Member 2",
                    "description": "Description of Member 2"
                },
                {
                    "code": "3",
                    "name": "Member 3",
                    "description": "Description of Member 3"
                }
            ];
            assert.deepEqual( 
                testHelper.getSubformVal( 'verifiedMembers' ), expectedVerifiedMembers );
            
            // Fill new row
            testHelper.fillSubformNewRow(
                {
                    "description": "Description of Member 3 edited"
                }, 
                'verifiedMembers' );

            // Check subform again
            var expectedVerifiedMembers2 = $.extend( true, [], expectedVerifiedMembers );
            expectedVerifiedMembers2[ 1 ].description = "Description of Member 3 edited";
            assert.deepEqual( 
                testHelper.getSubformVal( 'verifiedMembers' ), expectedVerifiedMembers2 );
            
            // Undo and check
            testHelper.clickUndoButton();
            assert.deepEqual( 
                testHelper.getSubformVal( 'verifiedMembers' ), expectedVerifiedMembers );
            
            // Redo and check
            testHelper.clickRedoButton();
            assert.deepEqual( 
                testHelper.getSubformVal( 'verifiedMembers' ), expectedVerifiedMembers2 );
            
            // Delete row and check
            testHelper.clickDeleteSubformRowButton( 'verifiedMembers', 0 );
            var expectedVerifiedMembers3 = [ expectedVerifiedMembers2[ 1 ] ];
            assert.deepEqual( 
                testHelper.getSubformVal( 'verifiedMembers' ), expectedVerifiedMembers3 );
            
            // Undo and check
            testHelper.clickUndoButton();
            assert.deepEqual( 
                testHelper.getSubformVal( 'verifiedMembers' ), expectedVerifiedMembers2 );
            
            // Redo and check
            testHelper.clickRedoButton();
            assert.deepEqual( 
                testHelper.getSubformVal( 'verifiedMembers' ), expectedVerifiedMembers3 );
            
            // Select
            testHelper.subformSelectByText( 'originalMembers', '5', '7' );
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'originalMembers', true ), 
                [ 
                    {
                        "code": "5",
                        "name": "Member 5",
                        "description": "Description of Member 5",
                        "important": false,
                        "hobbies": []
                    },
                    {
                        "code": "7",
                        "name": "Member 7",
                        "description": "Description of Member 7",
                        "important": false,
                        "hobbies": []
                    }
                ]);

            // Copy
            $copyButton.click();
            testHelper.fillSubformNewRow(
                {
                    "description": "Description of Member 7 edited"
                }, 
                'verifiedMembers' );
            var expectedVerifiedMembers4 = [
                {
                    "code": "3",
                    "name": "Member 3",
                    "description": "Description of Member 3 edited"
                },
                {
                    "code": "5",
                    "name": "Member 5",
                    "description": "Description of Member 5"
                },
                {
                    "code": "7",
                    "name": "Member 7",
                    "description": "Description of Member 7 edited"
                }
            ];
            assert.deepEqual( 
                testHelper.getSubformVal( 'verifiedMembers' ), expectedVerifiedMembers4 );
            
            // Undo twice and check
            testHelper.clickUndoButton( 2 );
            assert.deepEqual( 
                testHelper.getSubformVal( 'verifiedMembers' ), expectedVerifiedMembers3 );
            
            // Redo twice and check
            testHelper.clickRedoButton( 2 );
            assert.deepEqual( 
                testHelper.getSubformVal( 'verifiedMembers' ), expectedVerifiedMembers4 );
            
            // Submit and check storage
            testHelper.clickFormSubmitButton();

            expectedVerifiedMembers = {
                "3": {
                    "code": "3",
                    "name": "Member 3",
                    "description": "Description of Member 3 edited",
                    "important": false,
                    "hobbies": []
                },
                "5": {
                    "code": "5",
                    "name": "Member 5",
                    "description": "Description of Member 5",
                    "important": false,
                    "hobbies": []
                },
                "7": {
                    "code": "7",
                    "name": "Member 7",
                    "description": "Description of Member 7 edited",
                    "important": false,
                    "hobbies": []
                }

            };
            assert.deepEqual( 
                testUtils.getVerifiedMembers(), 
                expectedVerifiedMembers );

            done();
        }
    );
});
*/

QUnit.test( "form filtering test", function( assert ) {

    thisTestOptions = {
        fields: {
            originalMembers: {
                components: {
                    filtering: {
                        isOn: true,
                        fields: [ 'code', 'name' ]
                    }
                }
            }
        }
    };
    options = $.extend( true, {}, formTestOptions, thisTestOptions );

    var numberOfOriginalMembers = 12;
    testUtils.resetOriginalAndVerifiedMembers( 'Member', numberOfOriginalMembers );
    var itemName = 'Member';
    var subformName = 'originalMembers';
    testHelper.setDefaultItemName( itemName );
    
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices();
            $( '#departmentsContainer' ).zcrud( 'renderForm' );

            testHelper.pagingSubformTest({
                subformName: subformName,
                action: { 
                    filter: {
                        "originalMembers-name": 'Member 1' 
                    }
                },
                options: options,
                assert: assert,
                visibleRows: 4,
                pagingInfo: 'Showing 1-4 of 4 (filtered)',
                ids:  '1/10/11/12',
                names: 'Member 1/Member 10/Member 11/Member 12',
                pageListNotActive: [ '<<', '<', '1', '>', '>>' ],
                pageListActive: []
            });
            
            assert.equal( testHelper.getSelectedFromSubform( 'originalMembers', true ).length, 0 );

            // Select
            testHelper.subformSelectByText( 'originalMembers', '1', '11' );
            
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'originalMembers', true ), 
                [ 
                    {
                        "code": "1",
                        "name": "Member 1",
                        "description": "Description of Member 1",
                        "important": false,
                        "hobbies": []
                    },
                    {
                        "code": "11",
                        "name": "Member 11",
                        "description": "Description of Member 11"
                    }
                ]);
            
            // Copy
            var $copyButton = $( 'button.zcrud-copy-subform-rows-command-button' );
            $copyButton.click();
            testHelper.fillSubformNewRow(
                {
                    "description": "Description of Member 11 edited"
                }, 
                'verifiedMembers' );

            // Submit and check storage
            testHelper.clickFormSubmitButton();
            
            var expectedVerifiedMembers = {
                "1": {
                    "code": "1",
                    "name": "Member 1",
                    "description": "Description of Member 1"
                },
                "11": {
                    "code": "11",
                    "name": "Member 11",
                    "description": "Description of Member 11 edited"
                }
            };
            assert.deepEqual( 
                testUtils.getVerifiedMembers(), 
                expectedVerifiedMembers );
            
            // Delete row
            testHelper.clickDeleteSubformRowButton( 'verifiedMembers', 0 );

            // Submit and check storage
            testHelper.clickFormSubmitButton();
            
            expectedVerifiedMembers = {
                "11": {
                    "code": "11",
                    "name": "Member 11",
                    "description": "Description of Member 11 edited"
                }
            };
            assert.deepEqual( 
                testUtils.getVerifiedMembers(), 
                expectedVerifiedMembers );
            
            // Select
            testHelper.subformSelectByText( 'originalMembers', '1', '12' );
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'originalMembers', true ), 
                [ 
                    {
                        "code": "1",
                        "name": "Member 1",
                        "description": "Description of Member 1"
                    },
                    {
                        "code": "12",
                        "name": "Member 12",
                        "description": "Description of Member 12"
                    }
                ]);
            
            // Copy
            $copyButton.click();
            testHelper.fillSubformNewRow(
                {
                    "description": "Description of Member 12 edited"
                }, 
                'verifiedMembers' );

            // Submit and check storage
            testHelper.clickFormSubmitButton();
            
            expectedVerifiedMembers = {
                "11": {
                    "code": "11",
                    "name": "Member 11",
                    "description": "Description of Member 11 edited"
                },
                "1": {
                    "code": "1",
                    "name": "Member 1",
                    "description": "Description of Member 1"
                },
                "12": {
                    "code": "12",
                    "name": "Member 12",
                    "description": "Description of Member 12 edited"
                }

            };
            assert.deepEqual( 
                testUtils.getVerifiedMembers(), 
                expectedVerifiedMembers );
            
            done();
        }
    );
});
/*
QUnit.test( "form filtering starting void test", function( assert ) {

    thisTestOptions = {
        fields: {
            originalMembers: {
                components: {
                    filtering: {
                        isOn: true,
                        fields: [ 'code', 'name' ]
                    }
                }
            }
        }
    };
    options = $.extend( true, {}, formTestOptions, thisTestOptions );

    var numberOfOriginalMembers = 12;
    testUtils.resetOriginalAndVerifiedMembers( 'Member', numberOfOriginalMembers );
    var itemName = 'Member';
    var subformName = 'originalMembers';
    testHelper.setDefaultItemName( itemName );

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices();
            $( '#departmentsContainer' ).zcrud( 
                'renderForm', 
                {
                    load: false
                }
            );
            
            testHelper.pagingSubformTest({
                subformName: subformName,
                options: options,
                assert: assert,
                visibleRows: 0,
                pagingInfo: 'No records found!',
                ids:  '',
                names: '',
                pageListNotActive: [ '<<', '<', '>', '>>' ],
                pageListActive: []
            });
            
            testHelper.pagingSubformTest({
                subformName: subformName,
                action: { 
                    filter: {
                        "originalMembers-name": 'Member 1' 
                    }
                },
                options: options,
                assert: assert,
                visibleRows: 4,
                pagingInfo: 'Showing 1-4 of 4 (filtered)',
                ids:  '1/10/11/12',
                names: 'Member 1/Member 10/Member 11/Member 12',
                pageListNotActive: [ '<<', '<', '1', '>', '>>' ],
                pageListActive: []
            });

            assert.equal( testHelper.getSelectedFromSubform( 'originalMembers', true ).length, 0 );
            
            // Select
            testHelper.subformSelectByText( 'originalMembers', '1', '11' );

            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'originalMembers', true ), 
                [ 
                    {
                        "code": "1",
                        "name": "Member 1",
                        "description": "Description of Member 1"
                    },
                    {
                        "code": "11",
                        "name": "Member 11",
                        "description": "Description of Member 11"
                    }
                ]);

            // Copy
            var $copyButton = $( 'button.zcrud-copy-subform-rows-command-button' );
            $copyButton.click();
            testHelper.fillSubformNewRow(
                {
                    "description": "Description of Member 11 edited"
                }, 
                'verifiedMembers' );

            // Submit and check storage
            testHelper.clickFormSubmitButton();

            var expectedVerifiedMembers = {
                "1": {
                    "code": "1",
                    "name": "Member 1",
                    "description": "Description of Member 1"
                },
                "11": {
                    "code": "11",
                    "name": "Member 11",
                    "description": "Description of Member 11 edited"
                }
            };
            assert.deepEqual( 
                testUtils.getVerifiedMembers(), 
                expectedVerifiedMembers );

            // Delete row
            testHelper.clickDeleteSubformRowButton( 'verifiedMembers', 0 );

            // Submit and check storage
            testHelper.clickFormSubmitButton();

            expectedVerifiedMembers = {
                "11": {
                    "code": "11",
                    "name": "Member 11",
                    "description": "Description of Member 11 edited"
                }
            };
            assert.deepEqual( 
                testUtils.getVerifiedMembers(), 
                expectedVerifiedMembers );

            // Select
            testHelper.subformSelectByText( 'originalMembers', '1', '12' );
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'originalMembers', true ), 
                [ 
                    {
                        "code": "1",
                        "name": "Member 1",
                        "description": "Description of Member 1"
                    },
                    {
                        "code": "12",
                        "name": "Member 12",
                        "description": "Description of Member 12"
                    }
                ]);

            // Copy
            $copyButton.click();
            testHelper.fillSubformNewRow(
                {
                    "description": "Description of Member 12 edited"
                }, 
                'verifiedMembers' );

            // Submit and check storage
            testHelper.clickFormSubmitButton();

            expectedVerifiedMembers = {
                "11": {
                    "code": "11",
                    "name": "Member 11",
                    "description": "Description of Member 11 edited"
                },
                "1": {
                    "code": "1",
                    "name": "Member 1",
                    "description": "Description of Member 1"
                },
                "12": {
                    "code": "12",
                    "name": "Member 12",
                    "description": "Description of Member 12 edited"
                }

            };
            assert.deepEqual( 
                testUtils.getVerifiedMembers(), 
                expectedVerifiedMembers );
            
            done();
        }
    );
});

QUnit.test( "form after form test", function( assert ) {

    options = $.extend( true, {}, extendedFormTestOptions );
    var numberOfOriginalMembers = 12;
    testUtils.resetOriginalAndVerifiedMembers( 'Member', numberOfOriginalMembers );

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices();
            $( '#departmentsContainer' ).zcrud( 'renderForm' );


            done();
        }
    );
});*/
