"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var Qunit = require( 'qunit' );
var testHelper = require( './testHelper.js' );
var testUtils = require( './testUtils.js' );

var formTestOptions = require( './editableSubformAsListTestOptions.js' );
var options = undefined;

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
                        "description": "Description of Member 2"
                    },
                    {
                        "code": "3",
                        "name": "Member 3",
                        "description": "Description of Member 3"
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
                    "description": "Description of Member 2"
                },
                "3": {
                    "code": "3",
                    "name": "Member 3",
                    "description": "Description of Member 3 edited"
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
                    "description": "Description of Member 3 edited"
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
                        "description": "Description of Member 5"
                    },
                    {
                        "code": "7",
                        "name": "Member 7",
                        "description": "Description of Member 7"
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
                    "description": "Description of Member 3 edited"
                },
                "5": {
                    "code": "5",
                    "name": "Member 5",
                    "description": "Description of Member 5"
                },
                "7": {
                    "code": "7",
                    "name": "Member 7",
                    "description": "Description of Member 7 edited"
                }
                
            };
            assert.deepEqual( 
                testUtils.getVerifiedMembers(), 
                expectedVerifiedMembers );
            
            done();
        }
    );
});
