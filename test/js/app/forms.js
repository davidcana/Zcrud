"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var Qunit = require( 'qunit' );
var utils = require( '../../../js/app/utils.js' );
var testHelper = require( './testHelper.js' );
var testServerSide = require( './testServerSide.js' );
var context = require( '../../../js/app/context.js' );

var formTestOptions = require( './editableSubformAsListTestOptions.js' );
var extendedFormTestOptions = require( './editableSubformAsListExtendedTestOptions.js' );
var thisTestOptions = undefined;
var options = undefined;

var abortedConfirmFunctionCounter = 0;
var abortedConfirmFunction = function(){
    ++abortedConfirmFunctionCounter;
};

var discardConfirmFunctionCounter = 0;
var discardConfirmFunction = function( confirmOptions, onFulfilled ){
    ++discardConfirmFunctionCounter;
    onFulfilled( 'discard' );
};

var errorFunctionCounter = 0;
var errorFunction = function( message ){
    ++errorFunctionCounter;
};

// Run tests
QUnit.test( "form simple test", function( assert ) {

    options = utils.extend( true, {}, formTestOptions );
    var numberOfOriginalMembers = 12;
    testServerSide.resetOriginalAndVerifiedMembers( 'Member', numberOfOriginalMembers );
    
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
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
            $copyButton.trigger( 'click' );
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
                testServerSide.getVerifiedMembers(), 
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
                testServerSide.getVerifiedMembers(), 
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
            $copyButton.trigger( 'click' );
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
                    "hobbies": [],
                    "important": false
                },
                "5": {
                    "code": "5",
                    "name": "Member 5",
                    "description": "Description of Member 5",
                    "hobbies": [],
                    "important": false
                },
                "7": {
                    "code": "7",
                    "name": "Member 7",
                    "description": "Description of Member 7 edited",
                    "hobbies": [],
                    "important": false
                }
                
            };
            assert.deepEqual( 
                testServerSide.getVerifiedMembers(), 
                expectedVerifiedMembers );
            
            done();
        }
    );
});

QUnit.test( "form undo/redo test", function( assert ) {

    options = utils.extend( true, {}, formTestOptions );
    var numberOfOriginalMembers = 12;
    testServerSide.resetOriginalAndVerifiedMembers( 'Member', numberOfOriginalMembers );

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
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
            $copyButton.trigger( 'click' );
            
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
            var expectedVerifiedMembers2 = utils.extend( true, [], expectedVerifiedMembers );
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
            $copyButton.trigger( 'click' );
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
                testServerSide.getVerifiedMembers(), 
                expectedVerifiedMembers );

            done();
        }
    );
});
/*
QUnit.test( "subform filtering test", function( assert ) {

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
    options = utils.extend( true, {}, formTestOptions, thisTestOptions );

    var numberOfOriginalMembers = 12;
    testServerSide.resetOriginalAndVerifiedMembers( 'Member', numberOfOriginalMembers );
    var itemName = 'Member';
    var subformName = 'originalMembers';
    testHelper.setDefaultItemName( itemName );
    
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
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
                        "description": "Description of Member 11",
                        "important": false,
                        "hobbies": []
                    }
                ]);
            
            // Copy
            var $copyButton = $( 'button.zcrud-copy-subform-rows-command-button' );
            $copyButton.trigger( 'click' );
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
                    "description": "Description of Member 1",
                    "hobbies": [],
                    "important": false
                },
                "11": {
                    "code": "11",
                    "name": "Member 11",
                    "description": "Description of Member 11 edited",
                    "hobbies": [],
                    "important": false
                }
            };
            assert.deepEqual( 
                testServerSide.getVerifiedMembers(), 
                expectedVerifiedMembers );
            
            // Delete row
            testHelper.clickDeleteSubformRowButton( 'verifiedMembers', 0 );

            // Submit and check storage
            testHelper.clickFormSubmitButton();
            
            expectedVerifiedMembers = {
                "11": {
                    "code": "11",
                    "name": "Member 11",
                    "description": "Description of Member 11 edited",
                    "hobbies": [],
                    "important": false
                }
            };
            assert.deepEqual( 
                testServerSide.getVerifiedMembers(), 
                expectedVerifiedMembers );
            
            // Select
            testHelper.subformSelectByText( 'originalMembers', '1', '12' );
            assert.deepEqual( 
                testHelper.getSelectedFromSubform( 'originalMembers', true ), 
                [ 
                    {
                        "code": "1",
                        "name": "Member 1",
                        "description": "Description of Member 1",
                        "hobbies": [],
                        "important": false,
                    },
                    {
                        "code": "12",
                        "name": "Member 12",
                        "description": "Description of Member 12",
                        "hobbies": [],
                        "important": false
                    }
                ]);
            
            // Copy
            $copyButton.trigger( 'click' );
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
                    "description": "Description of Member 11 edited",
                    "hobbies": [],
                    "important": false
                },
                "1": {
                    "code": "1",
                    "name": "Member 1",
                    "description": "Description of Member 1",
                    "hobbies": [],
                    "important": false
                },
                "12": {
                    "code": "12",
                    "name": "Member 12",
                    "description": "Description of Member 12 edited",
                    "hobbies": [],
                    "important": false
                }

            };
            assert.deepEqual( 
                testServerSide.getVerifiedMembers(), 
                expectedVerifiedMembers );
            
            done();
        }
    );
});

QUnit.test( "subform filtering starting void test", function( assert ) {

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
    options = utils.extend( true, {}, formTestOptions, thisTestOptions );

    var numberOfOriginalMembers = 12;
    testServerSide.resetOriginalAndVerifiedMembers( 'Member', numberOfOriginalMembers );
    var itemName = 'Member';
    var subformName = 'originalMembers';
    testHelper.setDefaultItemName( itemName );

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
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
                        "description": "Description of Member 1",
                        "important": false,
                        "hobbies": []
                    },
                    {
                        "code": "11",
                        "name": "Member 11",
                        "description": "Description of Member 11",
                        "important": false,
                        "hobbies": []
                    }
                ]);

            // Copy
            var $copyButton = $( 'button.zcrud-copy-subform-rows-command-button' );
            $copyButton.trigger( 'click' );
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
                    "description": "Description of Member 1",
                    "important": false,
                    "hobbies": []
                },
                "11": {
                    "code": "11",
                    "name": "Member 11",
                    "description": "Description of Member 11 edited",
                    "important": false,
                    "hobbies": []
                }
            };
            assert.deepEqual( 
                testServerSide.getVerifiedMembers(), 
                expectedVerifiedMembers );

            // Delete row
            testHelper.clickDeleteSubformRowButton( 'verifiedMembers', 0 );
            
            // Submit and check storage
            testHelper.clickFormSubmitButton();

            expectedVerifiedMembers = {
                "11": {
                    "code": "11",
                    "name": "Member 11",
                    "description": "Description of Member 11 edited",
                    "important": false,
                    "hobbies": []
                }
            };
            assert.deepEqual( 
                testServerSide.getVerifiedMembers(), 
                expectedVerifiedMembers );
            
            // Select
            testHelper.subformSelectByText( 'originalMembers', '1', '12' );
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
                        "code": "12",
                        "name": "Member 12",
                        "description": "Description of Member 12",
                        "important": false,
                        "hobbies": []
                    }
                ]);

            // Copy
            $copyButton.trigger( 'click' );
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
                    "description": "Description of Member 11 edited",
                    "important": false,
                    "hobbies": []
                },
                "1": {
                    "code": "1",
                    "name": "Member 1",
                    "description": "Description of Member 1",
                    "important": false,
                    "hobbies": []
                },
                "12": {
                    "code": "12",
                    "name": "Member 12",
                    "description": "Description of Member 12 edited",
                    "important": false,
                    "hobbies": []
                }

            };
            assert.deepEqual( 
                testServerSide.getVerifiedMembers(), 
                expectedVerifiedMembers );
            
            done();
        }
    );
});
*/
QUnit.test( "form after form test", function( assert ) {

    options = utils.extend( true, {}, extendedFormTestOptions );
    var numberOfOriginalMembers = 12;
    testServerSide.resetOriginalAndVerifiedMembers( 'Member', numberOfOriginalMembers );

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            $( '#departmentsContainer' ).zcrud( 'renderForm' );
            
            // Check record 1 value
            var key = "1";
            var record = buildMemberRecord( key );
            assert.deepEqual( 
                testServerSide.getOriginalMembersByCode( key ), 
                record );

            // Click update button and update record
            testHelper.clickUpdateSubformRowButton( 'originalMembers', 0 );
            var editedRecord =  {
                "name": "Member " + key + " edited",
                "datetime": "07/03/2018 21:45",
                "browser": "Firefox",
                "important": true,
                "hobbies": [ 'reading_option', 'sports_option' ]
            };
            testHelper.fillForm( editedRecord );
            var newRecord = utils.extend( true, {}, editedRecord );
            newRecord.code = key;

            testHelper.checkForm( assert, newRecord );
            
            // Submit and show the custom form again
            testHelper.clickFormSubmitButton();
            
            var newRecord2 = utils.extend( true, {}, newRecord );
            var expectedRecord = context.getFieldBuilder().filterValues( 
                    newRecord2, 
                    options.fields.originalMembers.fields
            );
            expectedRecord.description = record.description;
            assert.deepEqual( 
                testServerSide.getOriginalMembers()[ 0 ],
                expectedRecord
            );
            
            // Check record 2 value
            key = "2";
            record = buildMemberRecord( key );
            assert.deepEqual( 
                testServerSide.getOriginalMembersByCode( key ), 
                record );
            
            // Click update button and update record
            testHelper.clickUpdateSubformRowButton( 'originalMembers', 1 );
            editedRecord =  {
                "name": "Member " + key + " edited",
                "datetime": "07/02/2018 20:45",
                "browser": "Chrome",
                "important": false,
                "hobbies": [ 'reading_option', 'cards_option' ]
            };
            testHelper.fillForm( editedRecord );
            newRecord = utils.extend( true, {}, editedRecord );
            newRecord.code = key;
            
            testHelper.checkForm( assert, newRecord );
            
            // Submit and show the custom form again
            testHelper.clickFormSubmitButton();

            newRecord2 = utils.extend( true, {}, newRecord );
            expectedRecord = context.getFieldBuilder().filterValues( 
                newRecord2, 
                options.fields.originalMembers.fields
            );
            expectedRecord.description = record.description;
            assert.deepEqual( 
                testServerSide.getOriginalMembersByCode( key ),
                expectedRecord
            );
            
            // Check record 3 value
            key = "3";
            record = buildMemberRecord( key );
            assert.deepEqual( 
                testServerSide.getOriginalMembers()[ 2 ], 
                record );
            
            // Click delete button and delete record
            testHelper.clickDeleteFormSubformRowButton( 'originalMembers', 2 );
            testHelper.clickFormSubmitButton();
            assert.deepEqual( 
                testServerSide.getOriginalMembersByCode( key ),
                undefined
            );
            
            // Create record
            testHelper.clickCreateFormSubformRowButton( 'originalMembers' );
            key = 0;
            editedRecord =  {
                "code": "" + key,
                "name": "Member " + key,
                "datetime": "07/01/2018 12:45",
                "browser": "Chrome",
                "hobbies": [ 'sports_option', 'cards_option' ]
            };
            testHelper.fillForm( editedRecord );
            
            // Submit and show the custom form again
            testHelper.clickFormSubmitButton();
            expectedRecord = context.getFieldBuilder().filterValues( 
                editedRecord, 
                options.fields.originalMembers.fields
            );
            assert.deepEqual( 
                testServerSide.getOriginalMembersByCode( key ),
                expectedRecord
            );
            
            // Select
            testHelper.readOnlySubformSelect( 'originalMembers', '0', '1', '2', '3', '6' );
  
            // Copy
            var $copyButton = $( 'button.zcrud-copy-subform-rows-command-button' );
            $copyButton.trigger( 'click' );
            testHelper.fillSubformNewRow(
                {
                    "name": "Member 6 edited"
                }, 
                'verifiedMembers' );

            // Submit and check storage
            testHelper.clickFormSubmitButton();
            
            var expectedVerifiedMembers = {
                "0": {
                    "code": "0",
                    "name": "Member 0",
                    "datetime": "07/01/2018 12:45",
                    "browser": "Chrome",
                    "important": false,
                    "hobbies": [ 'sports_option', 'cards_option' ]
                },
                "1": {
                    "code": "1",
                    "name": "Member 1 edited",
                    "description": "Description of Member 1",
                    "datetime": "07/03/2018 21:45",
                    "browser": "Firefox",
                    "important": true,
                    "hobbies": [ 'reading_option', 'sports_option' ]
                },
                "2": {
                    "code": "2",
                    "name": "Member 2 edited",
                    "description": "Description of Member 2",
                    "datetime": "07/02/2018 20:45",
                    "browser": "Chrome",
                    "important": false,
                    "hobbies": [ 'reading_option', 'cards_option' ]
                },
                "6": {
                    "code": "6",
                    "name": "Member 6 edited",
                    "description": "Description of Member 6",
                    "important": false,
                    "hobbies": []
                }
            };
            
            // Filter datetime
            var datetimeField = options.fields.originalMembers.fields.datetime;
            expectedVerifiedMembers[ 0 ].datetime = datetimeField.filterValue( expectedVerifiedMembers[ 0 ] );
            expectedVerifiedMembers[ 1 ].datetime = datetimeField.filterValue( expectedVerifiedMembers[ 1 ] );
            expectedVerifiedMembers[ 2 ].datetime = datetimeField.filterValue( expectedVerifiedMembers[ 2 ] );
            //expectedVerifiedMembers[ 6 ].datetime = datetimeField.filterValue( expectedVerifiedMembers[ 6 ] );

            assert.deepEqual( 
                testServerSide.getVerifiedMembers(), 
                expectedVerifiedMembers );
            
            done();
        }
    );
});

QUnit.test( "form filtering test", function( assert ) {

    thisTestOptions = {
        pageConf: {
            pages: {
                customForm: {
                    updateURL: 'http://localhost/CRUDManager.do?cmd=BATCH_UPDATE_FILTERING&table=memberCheck',
                    getRecordURL: 'http://localhost/CRUDManager.do?cmd=GET_FILTERING&table=memberCheck',
                    components: {
                        paging: {
                            isOn: false
                        },
                        filtering: {
                            isOn: true,
                            fields: [ 'originalMembers/name' ]
                        }   
                    }
                }
            }    
        }
    };
    options = utils.extend( true, {}, formTestOptions, thisTestOptions );
    options.fields.originalMembers.buttons = {
        buttons: {
            toolbar: [],
            byRow: []
        }
    };
    options.fields.verifiedMembers.buttons = {
        buttons: {
            toolbar: [],
            byRow: [ 'subform_addNewRow' ]
        }
    };
    
    var numberOfOriginalMembers = 12;
    testServerSide.resetOriginalAndVerifiedMembers( 'Member', numberOfOriginalMembers );
    var itemName = 'Member';
    testHelper.setDefaultItemName( itemName );
    
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            $( '#departmentsContainer' ).zcrud( 'renderForm' );
            
            // Assert  verified members is void
            var form = $( '#departmentsContainer' ).zcrud( 'getFormPage' );
            var verifiedMembersSubform = form.getFieldByName( 'verifiedMembers' );
            assert.deepEqual( 
                verifiedMembersSubform.getRecords(), 
                []
            );
            
            // Filter by name
            $( '[name="originalMembers-name"]' ).val( '1' );
            $( '.zcrud-filter-submit-button' ).trigger( 'click' );
            
            // Select
            testHelper.subformSelectByText( 'originalMembers', '1', '11' );
            
            // Copy
            var $copyButton = $( 'button.zcrud-copy-subform-rows-command-button' );
            $copyButton.trigger( 'click' );
            
            // Edit last row
            testHelper.fillSubformNewRow(
                {
                    "description": "Description of Member 11 edited"
                }, 
                'verifiedMembers' );
            
            // Submit and check storage
            testHelper.clickFormSubmitButton();

            var expectedVerifiedMembers = {
                "1": {
                    "filter": "1",
                    "code": "1",
                    "name": "Member 1",
                    "description": "Description of Member 1",
                    "hobbies": [],
                    "important": false
                },
                "11": {
                    "filter": "1",
                    "code": "11",
                    "name": "Member 11",
                    "description": "Description of Member 11 edited",
                    "hobbies": [],
                    "important": false
                }
            };
            
            assert.deepEqual( 
                testServerSide.getVerifiedMembers(), 
                expectedVerifiedMembers );
            assert.deepEqual( 
                verifiedMembersSubform.getRecords(), 
                testHelper.fromObjectToArray( expectedVerifiedMembers  )
            );
            
            // Filter by name again
            $( '[name="originalMembers-name"]' ).val( '2' );
            $( '.zcrud-filter-submit-button' ).trigger( 'click' );
            assert.deepEqual( 
                verifiedMembersSubform.getRecords(), 
                []
            );
            
            // Filter by name again
            $( '[name="originalMembers-name"]' ).val( '1' );
            $( '.zcrud-filter-submit-button' ).trigger( 'click' );
            assert.deepEqual( 
                verifiedMembersSubform.getRecords(), 
                testHelper.fromObjectToArray( expectedVerifiedMembers  )
            );
            
            // Edit last row
            var editedDescription = "Description of Member 11 edited(2)";
            testHelper.fillSubformNewRow(
                {
                    "description": editedDescription
                }, 
                'verifiedMembers' 
            );
            expectedVerifiedMembers[ "11" ].description = editedDescription;

            // Submit and check storage
            testHelper.clickFormSubmitButton();
            
            assert.deepEqual( 
                testServerSide.getVerifiedMembers(), 
                expectedVerifiedMembers );
            assert.deepEqual( 
                verifiedMembersSubform.getRecords(), 
                testHelper.fromObjectToArray( expectedVerifiedMembers  )
            );
            
            // Filter by name again
            $( '[name="originalMembers-name"]' ).val( '2' );
            $( '.zcrud-filter-submit-button' ).trigger( 'click' );
            assert.deepEqual( 
                verifiedMembersSubform.getRecords(), 
                []
            );
            
            // Filter by name again
            $( '[name="originalMembers-name"]' ).val( '1' );
            $( '.zcrud-filter-submit-button' ).trigger( 'click' );
            
            assert.deepEqual( 
                testServerSide.getVerifiedMembers(), 
                expectedVerifiedMembers );
            assert.deepEqual( 
                verifiedMembersSubform.getRecords(), 
                testHelper.fromObjectToArray( expectedVerifiedMembers  )
            );
            
            // Change originalMembers size to 25
            //testHelper.changeSubformPageSize( 'originalMembers', 25 );
            testHelper.pagingSubformTest({
                subformName: 'originalMembers',
                action: { 
                    changeSize: 25
                },
                options: options,
                assert: assert,
                visibleRows: 4,
                pagingInfo: 'Showing 1-4 of 4',
                ids:  '1/10/11/12',
                names: 'Member 1/Member 10/Member 11/Member 12',
                pageListNotActive: [ '<<', '<', '1', '>', '>>' ],
                pageListActive: []
            });
            
            done();
        }
    );
});

QUnit.test( "form filtering with 2 subforms with paging test", function( assert ) {

    thisTestOptions = {
        pageConf: {
            pages: {
                customForm: {
                    updateURL: 'http://localhost/CRUDManager.do?cmd=BATCH_UPDATE_FILTERING&table=memberCheck',
                    getRecordURL: 'http://localhost/CRUDManager.do?cmd=GET_FILTERING&table=memberCheck',
                    components: {
                        paging: {
                            isOn: false
                        },
                        filtering: {
                            isOn: true,
                            fields: [ 'originalMembers/name' ]
                        }   
                    }
                }
            }    
        },
        fields: {
            verifiedMembers: {
                getGroupOfRecordsURL: 'http://localhost/CRUDManager.do?cmd=LIST&table=verifiedMembers',
                components: {
                    paging: {
                        isOn: true,
                        defaultPageSize: 5,
                        pageSizes: [ 5, 10, 25, 50, 100, 250 ]
                    }
                }
            }
        }
    };
    options = utils.extend( true, {}, formTestOptions, thisTestOptions );
    options.fields.originalMembers.buttons = {
        buttons: {
            toolbar: [],
            byRow: []
        }
    };
    options.fields.verifiedMembers.buttons = {
        buttons: {
            toolbar: [],
            byRow: [ 'subform_addNewRow' ]
        }
    };

    var numberOfOriginalMembers = 121;
    testServerSide.resetOriginalAndVerifiedMembers( 'Member', numberOfOriginalMembers );
    var itemName = 'Member';
    testHelper.setDefaultItemName( itemName );

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            $( '#departmentsContainer' ).zcrud( 'renderForm' );

            // Assert  verified members is void
            var form = $( '#departmentsContainer' ).zcrud( 'getFormPage' );
            var verifiedMembersSubform = form.getFieldByName( 'verifiedMembers' );
            assert.deepEqual( 
                verifiedMembersSubform.getRecords(), 
                []
            );
            
            // Filter by name
            $( '[name="originalMembers-name"]' ).val( '1' );
            $( '.zcrud-filter-submit-button' ).trigger( 'click' );
            
            // Select
            testHelper.subformToggleSelect( 'originalMembers' );
            
            // Copy
            var $copyButton = $( 'button.zcrud-copy-subform-rows-command-button' );
            $copyButton.trigger( 'click' );

            // Submit and check storage
            testHelper.clickFormSubmitButton();
            
            // Build expectedVerifiedMembers
            var expectedVerifiedMembers = buildMapOfMemberRecords( 1, 10, 18, "1" );

            assert.deepEqual( 
                testServerSide.getVerifiedMembers(), 
                expectedVerifiedMembers );
            assert.deepEqual( 
                verifiedMembersSubform.getRecords(), 
                testHelper.fromObjectToArray( expectedVerifiedMembers  )
            );
            
            // Filter by name again
            $( '[name="originalMembers-name"]' ).val( '2' );
            $( '.zcrud-filter-submit-button' ).trigger( 'click' );
            assert.deepEqual( 
                verifiedMembersSubform.getRecords(), 
                []
            );
            
            // Filter by name again
            $( '[name="originalMembers-name"]' ).val( '1' );
            $( '.zcrud-filter-submit-button' ).trigger( 'click' );
            expectedVerifiedMembers = buildMapOfMemberRecords( 1, 10, 13, "1" );
            assert.deepEqual( 
                verifiedMembersSubform.getRecords(), 
                testHelper.fromObjectToArray( expectedVerifiedMembers  )
            );
            
            // Go to page 2
            testHelper.pagingSubformTest({
                subformName: 'verifiedMembers',
                action: { 
                    nextPage: true
                },
                options: options,
                assert: assert,
                visibleRows: 5,
                pagingInfo: 'Showing 6-10 of 10',
                ids:  '14/15/16/17/18',
                names: 'Member 14/Member 15/Member 16/Member 17/Member 18',
                pageListNotActive: [ '2', '>', '>>' ],
                pageListActive: [ '<<', '<', '1' ]
            });
            
            // Go to page 1
            testHelper.pagingSubformTest({
                subformName: 'verifiedMembers',
                action: { 
                    previousPage: true
                },
                options: options,
                assert: assert,
                visibleRows: 5,
                pagingInfo: 'Showing 1-5 of 10',
                ids:  '1/10/11/12/13',
                names: 'Member 1/Member 10/Member 11/Member 12/Member 13',
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '>', '>>' ]
            });
            
            // Go to page 2 again
            testHelper.pagingSubformTest({
                subformName: 'verifiedMembers',
                action: { 
                    nextPage: true
                },
                options: options,
                assert: assert,
                visibleRows: 5,
                pagingInfo: 'Showing 6-10 of 10',
                ids:  '14/15/16/17/18',
                names: 'Member 14/Member 15/Member 16/Member 17/Member 18',
                pageListNotActive: [ '2', '>', '>>' ],
                pageListActive: [ '<<', '<', '1' ]
            });
            
            // Change originalMembers size to 25
            testHelper.pagingSubformTest({
                subformName: 'verifiedMembers',
                action: { 
                    changeSize: 25
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 10',
                ids:  '1/10/11/12/13/14/15/16/17/18',
                names: 'Member 1/Member 10/Member 11/Member 12/Member 13/Member 14/Member 15/Member 16/Member 17/Member 18',
                pageListNotActive: [ '<<', '<', '1', '>', '>>' ],
                pageListActive: []
            });
            
            // Change originalMembers size to 5
            testHelper.pagingSubformTest({
                subformName: 'verifiedMembers',
                action: { 
                    changeSize: 5
                },
                options: options,
                assert: assert,
                visibleRows: 5,
                pagingInfo: 'Showing 1-5 of 10',
                ids:  '1/10/11/12/13',
                names: 'Member 1/Member 10/Member 11/Member 12/Member 13',
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '>', '>>' ]
            });
            
            done();
        }
    );
});

QUnit.test( "form forcing filtering test with errors", function( assert ) {

    thisTestOptions = {
        pageConf: {
            pages: {
                customForm: {
                    updateURL: 'http://localhost/CRUDManager.do?cmd=BATCH_UPDATE_FILTERING&table=memberCheck',
                    getRecordURL: 'http://localhost/CRUDManager.do?cmd=GET_FILTERING&table=memberCheck',
                    components: {
                        paging: {
                            isOn: false
                        },
                        filtering: {
                            isOn: true,
                            fields: [ 'originalMembers/name' ],
                            forceToFilter: true
                        }   
                    }
                }
            }    
        },
        errorFunction: errorFunction
    };
    options = utils.extend( true, {}, formTestOptions, thisTestOptions );
    options.fields.originalMembers.buttons = {
        buttons: {
            toolbar: [],
            byRow: []
        }
    };
    options.fields.verifiedMembers.buttons = {
        buttons: {
            toolbar: [],
            byRow: [ 'subform_addNewRow' ]
        }
    };

    var numberOfOriginalMembers = 12;
    testServerSide.resetOriginalAndVerifiedMembers( 'Member', numberOfOriginalMembers );
    var itemName = 'Member';
    testHelper.setDefaultItemName( itemName );
    
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            $( '#departmentsContainer' ).zcrud( 'renderForm' );

            errorFunctionCounter = 0;
            
            // Assert  verified members is void
            var form = $( '#departmentsContainer' ).zcrud( 'getFormPage' );
            var verifiedMembersSubform = form.getFieldByName( 'verifiedMembers' );
            assert.deepEqual( 
                verifiedMembersSubform.getRecords(), 
                []
            );
            
            // Select
            assert.equal( errorFunctionCounter, 0 );
            testHelper.subformSelectByText( 'originalMembers', '1', '11' );
            assert.equal( errorFunctionCounter, 0 );
            
            // Copy
            var $copyButton = $( 'button.zcrud-copy-subform-rows-command-button' );
            assert.equal( errorFunctionCounter, 0 );
            $copyButton.trigger( 'click' );
            assert.equal( errorFunctionCounter, 1 );
            
            // Submit and check storage
            assert.equal( errorFunctionCounter, 1 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 2 );
            
            done();
        }
    );
});

QUnit.test( "form forcing filtering test without errors", function( assert ) {

    thisTestOptions = {
        pageConf: {
            pages: {
                customForm: {
                    updateURL: 'http://localhost/CRUDManager.do?cmd=BATCH_UPDATE_FILTERING&table=memberCheck',
                    getRecordURL: 'http://localhost/CRUDManager.do?cmd=GET_FILTERING&table=memberCheck',
                    components: {
                        paging: {
                            isOn: false
                        },
                        filtering: {
                            isOn: true,
                            fields: [ 'originalMembers/name' ],
                            forceToFilter: true
                        }   
                    }
                }
            }    
        },
        errorFunction: errorFunction
    };
    options = utils.extend( true, {}, formTestOptions, thisTestOptions );
    options.fields.originalMembers.buttons = {
        buttons: {
            toolbar: [],
            byRow: []
        }
    };
    options.fields.verifiedMembers.buttons = {
        buttons: {
            toolbar: [],
            byRow: [ 'subform_addNewRow' ]
        }
    };

    var numberOfOriginalMembers = 12;
    testServerSide.resetOriginalAndVerifiedMembers( 'Member', numberOfOriginalMembers );
    var itemName = 'Member';
    testHelper.setDefaultItemName( itemName );

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            $( '#departmentsContainer' ).zcrud( 'renderForm' );

            errorFunctionCounter = 0;

            // Assert  verified members is void
            var form = $( '#departmentsContainer' ).zcrud( 'getFormPage' );
            var verifiedMembersSubform = form.getFieldByName( 'verifiedMembers' );
            assert.deepEqual( 
                verifiedMembersSubform.getRecords(), 
                []
            );

            // Filter
            filterByName( '1' );
            
            // Select
            testHelper.subformSelectByText( 'originalMembers', '1', '11' );

            // Copy
            var $copyButton = $( 'button.zcrud-copy-subform-rows-command-button' );
            $copyButton.trigger( 'click' );

            // Edit last row
            testHelper.fillSubformNewRow(
                {
                    "description": "Description of Member 11 edited"
                }, 
                'verifiedMembers' );

            // Submit and check storage
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );
            
            var expectedVerifiedMembers = {
                "1": {
                    "filter": "1",
                    "code": "1",
                    "name": "Member 1",
                    "description": "Description of Member 1",
                    "hobbies": [],
                    "important": false
                },
                "11": {
                    "filter": "1",
                    "code": "11",
                    "name": "Member 11",
                    "description": "Description of Member 11 edited",
                    "hobbies": [],
                    "important": false
                }
            };
            
            verifiedMembersSubform = form.getFieldByName( 'verifiedMembers' );
            assert.deepEqual( 
                testServerSide.getVerifiedMembers(), 
                expectedVerifiedMembers 
            );
            assert.deepEqual( 
                verifiedMembersSubform.getRecords(), 
                testHelper.fromObjectToArray( expectedVerifiedMembers  )
            );
            
            // Filter
            filterByName( '2' );
            filterByName( '1' );
            
            verifiedMembersSubform = form.getFieldByName( 'verifiedMembers' );
            assert.deepEqual( 
                verifiedMembersSubform.getRecords(), 
                testHelper.fromObjectToArray( expectedVerifiedMembers  )
            );
            
            // Edit last row
            var newDescription = "Description of Member 11 edited (2)";
            testHelper.fillSubformNewRow(
                {
                    "description": newDescription
                }, 
                'verifiedMembers' 
            );

            // Submit and check storage
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );
            
            expectedVerifiedMembers[ '11' ].description = newDescription;
            verifiedMembersSubform = form.getFieldByName( 'verifiedMembers' );
            assert.deepEqual( 
                testServerSide.getVerifiedMembers(), 
                expectedVerifiedMembers 
            );
            assert.deepEqual( 
                verifiedMembersSubform.getRecords(), 
                testHelper.fromObjectToArray( expectedVerifiedMembers  )
            );
            
            // Filter
            filterByName( '2' );
            filterByName( '1' );
            
            verifiedMembersSubform = form.getFieldByName( 'verifiedMembers' );
            assert.deepEqual( 
                verifiedMembersSubform.getRecords(), 
                testHelper.fromObjectToArray( expectedVerifiedMembers  )
            );
            
            // Click delete button and delete record
            testHelper.clickDeleteSubformRowButton( 'verifiedMembers', 0 );
            testHelper.clickFormSubmitButton();
            
            verifiedMembersSubform = form.getFieldByName( 'verifiedMembers' );
            var expectedVerifiedMembers2 = {
                '11': expectedVerifiedMembers[ '11' ]
            };
            assert.deepEqual( 
                testServerSide.getVerifiedMembers(), 
                expectedVerifiedMembers2 
            );
            assert.deepEqual( 
                verifiedMembersSubform.getRecords(), 
                testHelper.fromObjectToArray( expectedVerifiedMembers2 )
            );
            
            done();
        }
    );
});

var buildMemberRecord = function( key, filter ){
    
    var member = {
        "code": key,
        "name": "Member " + key,
        "description": "Description of Member " + key,
        "hobbies": [],
        "important": false
    };
    
    if ( filter ){
        member.filter = filter;
    }
    
    return member;
};

var buildMapOfMemberRecords = function( firstKey, begin, end, filter ){
    
    var expectedVerifiedMembers = {};
    var currentMember = buildMemberRecord( "" + firstKey, filter );
    expectedVerifiedMembers[ currentMember.code ] = currentMember;
    for ( var i = begin; i <= end; ++i ){
        currentMember = buildMemberRecord( "" + i, filter );
        expectedVerifiedMembers[ currentMember.code ] = currentMember;
    }
    
    return expectedVerifiedMembers;
};

var filterByName = function( name ){

    $( '[name="originalMembers-name"]' ).val( name );
    $( '.zcrud-filter-submit-button' ).trigger( 'click' );
};
