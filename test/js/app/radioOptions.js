"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var Qunit = require( 'qunit' );
var utils = require( '../../../js/app/utils.js' );
var context = require( '../../../js/app/context.js' );
var testHelper = require( './testHelper.js' );
var testServerSide = require( './testServerSide.js' );

var formOptions = require( './defaultTestOptions.js' );
var subformTestOptions = require( './subformTestOptions.js' );
var editableListTestOptions = require( './editableListTestOptions.js' );
var editableListAllFieldsTestOptions= require( './editableListAllFieldsTestOptions.js' );
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

var key = 2;

var testPhoneOptions = function( assert, options, values, text ) {
    
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
            testHelper.clickUpdateListButton( key );
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
};

var testCityOptions = function( assert, options, values1, values2 ) {

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
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );

            assert.deepEqual(
                testHelper.getSelectOptions( 'city' ),
                values1
            );
            
            var editedRecord =  {
                "province": "Cádiz"
            };
            testHelper.fillForm( editedRecord );
            
            assert.deepEqual(
                testHelper.getSelectOptions( 'city' ),
                values2
            );
            
            done();
        }
    );
};

// Run tests
/*
QUnit.test( "array of objects form test", function( assert ) {
    
    options = utils.extend( true, {}, formOptions );
    options.fields.phoneType.translateOptions = true;
    options.fields.phoneType.options = [
        { value: '1', displayText: 'homePhone_option' }, 
        { value: '2', displayText: 'officePhone_option' }, 
        { value: '3', displayText: 'cellPhone_option' } 
    ];
    
    testPhoneOptions(
        assert,
        options,
        [ '1', '2', '3' ],
        'Home phone/Office phone/Cell phone'
    );
});

QUnit.test( "simple array test", function( assert ) {

    options = utils.extend( true, {}, formOptions );
    options.fields.phoneType.translateOptions = false;
    options.fields.phoneType.options = [ '1', '2', '3' ];

    testPhoneOptions( 
        assert, 
        options, 
        [ '1', '2', '3' ],
        '1/2/3'
    );
});

QUnit.test( "object test", function( assert ) {

    options = utils.extend( true, {}, formOptions );
    options.fields.phoneType.translateOptions = true;
    options.fields.phoneType.options = {
        '1': 'homePhone_option', 
        '2': 'officePhone_option', 
        '3': 'cellPhone_option'
    };

    testPhoneOptions( 
        assert, 
        options, 
        [ '1', '2', '3' ],
        'Home phone/Office phone/Cell phone'
    );
});

QUnit.test( "function test", function( assert ) {

    options = utils.extend( true, {}, formOptions );
    options.fields.phoneType.translateOptions = true;
    options.fields.phoneType.options = function(){
        return [ 'homePhone_option', 'officePhone_option', 'cellPhone_option' ];
    };

    testPhoneOptions( 
        assert, 
        options, 
        [ 'homePhone_option', 'officePhone_option', 'cellPhone_option' ],
        'Home phone/Office phone/Cell phone'
    );
});
*/
/*
QUnit.test( "URL returning array of objects form after list test", function( assert ) {

    options = utils.extend( true, {}, formOptions );
    options.fields.phoneType.translateOptions = false;
    options.fields.phoneType.options = 'http://localhost/CRUDManager.do?table=phoneTypes';

    testPhoneOptions(
        assert,
        options,
        [ 'Home phone', 'Office phone', 'Cell phone' ],
        'Home phone/Office phone/Cell phone'
    );
});
*/
QUnit.test( "URL returning array of objects editable list test", function( assert ) {

    var done = assert.async();
    options = utils.extend( true, {}, editableListAllFieldsTestOptions );
    options.pageConf.pages.list.getRecordURL = 'http://localhost/CRUDManager.do?cmd=GET&table=department';
    context.updateListVisibleFields( options, [ 'id', 'name', 'province', 'city' ] );

    $( '#departmentsContainer' ).zcrud(
        'init',
        options,
        function( options ){

            testServerSide.resetServices( undefined, false, true );
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );
            assert.equal( errorFunctionCounter, 0 );
            
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 5,
                pagingInfo: 'Showing 1-5 of 129',
                records: [
                    "1|Service 1|Málaga|Estepona",
                    "2|Service 2|Cádiz|Algeciras",
                    "3|Service 3|Málaga|Marbella",
                    "4|Service 4|Cádiz|Tarifa",
                    "5|Service 5|Málaga|Estepona"
                ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '26', '>', '>>' ],
                editable: true
            });

            done();
        }
    );
});
/*
QUnit.test( "function returning URL returning array of objects test", function( assert ) {

    options = utils.extend( true, {}, formOptions );
    options.fields.city.options = function( data ){
        if ( ! data.dependedValues.province ){
            return [];
        }
        return 'http://localhost/CRUDManager.do?table=cities&province=' + data.dependedValues.province;
    };

    testCityOptions( 
        assert, 
        options, 
        [], 
        [ 'Algeciras', 'Los Barrios', 'Tarifa' ]
    );
});

QUnit.test( "function returning URL returning array of objects and adding current value test", function( assert ) {

    options = utils.extend( true, {}, formOptions );
    options.fields.city.addCurrentValueToOptions = true;
    options.fields.city.options = function( data ){
        if ( ! data.dependedValues.province ){
            return [];
        }
        return 'http://localhost/CRUDManager.do?table=cities&province=' + data.dependedValues.province;
    };

    // Setup services
    testServerSide.resetServices();
    var record =  {
        "id": "" + key,
        "name": "Service " + key,
        "city": "San Roque"
    };
    testServerSide.setService( key, record );
    
    testCityOptions( 
        assert, 
        options, 
        [ 'San Roque' ],
        [ 'San Roque', 'Algeciras', 'Los Barrios', 'Tarifa' ]
    );
});
*/
/*
QUnit.test( "URL returning array of objects list test", function( assert ) {

    options = utils.extend( true, {}, formOptions );
    options.fields.phoneType.translateOptions = false;
    options.fields.phoneType.options = 'http://localhost/CRUDManager.do?table=phoneTypes';

    testPhoneOptions(
        assert,
        options,
        [ 'Home phone', 'Office phone', 'Cell phone' ],
        'Home phone/Office phone/Cell phone'
    );
});
*/

