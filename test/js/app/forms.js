"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var Qunit = require( 'qunit' );
var testHelper = require( './testHelper.js' );
var testUtils = require( './testUtils.js' );
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

// Run tests

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
                        "description": "Description of Member 11",
                        "important": false,
                        "hobbies": []
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
                    "description": "Description of Member 11 edited",
                    "hobbies": [],
                    "important": false
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
                testUtils.getVerifiedMembers(), 
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
                    "description": "Description of Member 11 edited",
                    "important": false,
                    "hobbies": []
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
            
            // Check record 1 value
            var key = "1";
            var record = buildMemberRecord( key );
            assert.deepEqual( 
                testUtils.getOriginalMembersByCode( key ), 
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
            var newRecord = $.extend( true, {}, editedRecord );
            newRecord.code = key;

            testHelper.checkForm( assert, newRecord );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();
            
            var newRecord2 = $.extend( true, {}, newRecord );
            var expectedRecord = context.getFieldBuilder().filterValues( 
                    newRecord2, 
                    options.fields.originalMembers.fields
            );
            expectedRecord.description = record.description;
            assert.deepEqual( 
                testUtils.getOriginalMembers()[ 0 ],
                expectedRecord
            );
            
            // Check record 2 value
            key = "2";
            record = buildMemberRecord( key );
            assert.deepEqual( 
                testUtils.getOriginalMembersByCode( key ), 
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
            newRecord = $.extend( true, {}, editedRecord );
            newRecord.code = key;
            
            testHelper.checkForm( assert, newRecord );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            newRecord2 = $.extend( true, {}, newRecord );
            expectedRecord = context.getFieldBuilder().filterValues( 
                newRecord2, 
                options.fields.originalMembers.fields
            );
            expectedRecord.description = record.description;
            assert.deepEqual( 
                testUtils.getOriginalMembersByCode( key ),
                expectedRecord
            );
            
            // Check record 3 value
            key = "3";
            record = buildMemberRecord( key );
            assert.deepEqual( 
                testUtils.getOriginalMembers()[ 2 ], 
                record );
            
            // Click delete button and delete record
            testHelper.clickDeleteFormSubformRowButton( 'originalMembers', 2 );
            testHelper.clickFormSubmitButton();
            assert.deepEqual( 
                testUtils.getOriginalMembersByCode( key ),
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
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();
            expectedRecord = context.getFieldBuilder().filterValues( 
                editedRecord, 
                options.fields.originalMembers.fields
            );
            assert.deepEqual( 
                testUtils.getOriginalMembersByCode( key ),
                expectedRecord
            );
            
            // Select
            testHelper.readOnlySubformSelect( 'originalMembers', '0', '1', '2', '3', '6' );
  
            // Copy
            var $copyButton = $( 'button.zcrud-copy-subform-rows-command-button' );
            $copyButton.click();
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
                    "hobbies": [],
                    "datetime": undefined,
                    "browser": undefined
                }
            };
            
            // Filter datetime
            var datetimeField = options.fields.originalMembers.fields.datetime;
            expectedVerifiedMembers[ 0 ].datetime = datetimeField.filterValue( expectedVerifiedMembers[ 0 ] );
            expectedVerifiedMembers[ 1 ].datetime = datetimeField.filterValue( expectedVerifiedMembers[ 1 ] );
            expectedVerifiedMembers[ 2 ].datetime = datetimeField.filterValue( expectedVerifiedMembers[ 2 ] );
            expectedVerifiedMembers[ 6 ].datetime = datetimeField.filterValue( expectedVerifiedMembers[ 6 ] );

            assert.deepEqual( 
                testUtils.getVerifiedMembers(), 
                expectedVerifiedMembers );
            
            done();
        }
    );
});

QUnit.test( "form filtering test", function( assert ) {

    thisTestOptions = {
        pageConf: {
            pages: {
                list: {
                    url: 'http://localhost/CRUDManager.do?cmd=BATCH_UPDATE_FILTERING&table=memberCheck',
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
    options = $.extend( true, {}, formTestOptions, thisTestOptions );
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
    testUtils.resetOriginalAndVerifiedMembers( 'Member', numberOfOriginalMembers );
    var itemName = 'Member';
    testHelper.setDefaultItemName( itemName );
    
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices();
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
            $( '.zcrud-filter-submit-button' ).click();
            
            // Select
            testHelper.subformSelectByText( 'originalMembers', '1', '11' );
            
            // Copy
            var $copyButton = $( 'button.zcrud-copy-subform-rows-command-button' );
            $copyButton.click();
            
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
                testUtils.getVerifiedMembers(), 
                expectedVerifiedMembers );
            assert.deepEqual( 
                verifiedMembersSubform.getRecords(), 
                testHelper.fromObjectToArray( expectedVerifiedMembers  )
            );
            
            // Filter by name again
            $( '[name="originalMembers-name"]' ).val( '2' );
            $( '.zcrud-filter-submit-button' ).click();
            assert.deepEqual( 
                verifiedMembersSubform.getRecords(), 
                []
            );
            
            // Filter by name again
            $( '[name="originalMembers-name"]' ).val( '1' );
            $( '.zcrud-filter-submit-button' ).click();
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
                testUtils.getVerifiedMembers(), 
                expectedVerifiedMembers );
            assert.deepEqual( 
                verifiedMembersSubform.getRecords(), 
                testHelper.fromObjectToArray( expectedVerifiedMembers  )
            );
            
            // Filter by name again
            $( '[name="originalMembers-name"]' ).val( '2' );
            $( '.zcrud-filter-submit-button' ).click();
            assert.deepEqual( 
                verifiedMembersSubform.getRecords(), 
                []
            );
            
            // Filter by name again
            $( '[name="originalMembers-name"]' ).val( '1' );
            $( '.zcrud-filter-submit-button' ).click();
            
            assert.deepEqual( 
                testUtils.getVerifiedMembers(), 
                expectedVerifiedMembers );
            assert.deepEqual( 
                verifiedMembersSubform.getRecords(), 
                testHelper.fromObjectToArray( expectedVerifiedMembers  )
            );
            
            done();
        }
    );
});

var buildMemberRecord = function( key ){
    
    return {
        "code": key,
        "name": "Member " + key,
        "description": "Description of Member " + key,
        "hobbies": [],
        "important": false
    };
};
