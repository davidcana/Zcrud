"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var Qunit = require( 'qunit' );
var testHelper = require( './testHelper.js' );
var testUtils = require( './testUtils.js' );

var formOptions = require( './defaultTestOptions.js' );
var subformTestOptions = require( './subformTestOptions.js' );
var editableListTestOptions = require( './editableListTestOptions.js' );
var options = undefined;

var errorFunctionCounter = 0;
formOptions.errorFunction = function( message ){
    ++errorFunctionCounter;
};
subformTestOptions.errorFunction = function( message ){
    ++errorFunctionCounter;
};
editableListTestOptions.errorFunction = function( message ){
    ++errorFunctionCounter;
};

var testOptions = function( assert, options, values, text ) {
    
    var done = assert.async();
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            errorFunctionCounter = 0;

            assert.equal( errorFunctionCounter, 0 );
            $( '#departmentsContainer' ).zcrud( 'renderList' );
            assert.equal( errorFunctionCounter, 0 );

            // Go to edit form
            testHelper.clickUpdateListButton( 2 );
            assert.equal( errorFunctionCounter, 0 );

            assert.deepEqual(
                testHelper.getRadioOptions( 'phoneType[0]' ),
                values
            );
            
            assert.equal(
                testHelper.getRadioTexts( 'phoneType[0]' ),
                text
            );
            
            done();
        }
    );
}

// Run tests

QUnit.test( "array of objects test", function( assert ) {
    
    options = $.extend( true, {}, formOptions );
    options.fields.phoneType.translateOptions = true;
    options.fields.phoneType.options = [
        { value: '1', displayText: 'homePhone_option' }, 
        { value: '2', displayText: 'officePhone_option' }, 
        { value: '3', displayText: 'cellPhone_option' } 
    ];
    
    testOptions( 
        assert, 
        options, 
        [ '1', '2', '3' ],
        'Home phone/Office phone/Cell phone'
    );
});

QUnit.test( "simple array test", function( assert ) {

    options = $.extend( true, {}, formOptions );
    options.fields.phoneType.translateOptions = false;
    options.fields.phoneType.options = [ '1', '2', '3' ];

    testOptions( 
        assert, 
        options, 
        [ '1', '2', '3' ],
        '1/2/3'
    );
});

QUnit.test( "object test", function( assert ) {

    options = $.extend( true, {}, formOptions );
    options.fields.phoneType.translateOptions = true;
    options.fields.phoneType.options = {
        '1': 'homePhone_option', 
        '2': 'officePhone_option', 
        '3': 'cellPhone_option'
    };

    testOptions( 
        assert, 
        options, 
        [ '1', '2', '3' ],
        'Home phone/Office phone/Cell phone'
    );
});

QUnit.test( "function test", function( assert ) {

    options = $.extend( true, {}, formOptions );
    options.fields.phoneType.translateOptions = true;
    options.fields.phoneType.options = function(){
        return [ 'homePhone_option', 'officePhone_option', 'cellPhone_option' ];
    };

    testOptions( 
        assert, 
        options, 
        [ 'homePhone_option', 'officePhone_option', 'cellPhone_option' ],
        'Home phone/Office phone/Cell phone'
    );
});

QUnit.test( "URL returning array of objects test", function( assert ) {

    options = $.extend( true, {}, formOptions );
    options.fields.phoneType.translateOptions = false;
    options.fields.phoneType.options = 'http://localhost/CRUDManager.do?table=phoneTypes';

    testOptions( 
        assert, 
        options, 
        [ 'Home phone', 'Office phone', 'Cell phone' ],
        'Home phone/Office phone/Cell phone'
    );
});
