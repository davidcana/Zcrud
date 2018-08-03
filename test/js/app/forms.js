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
            
            done();
        }
    );
});
