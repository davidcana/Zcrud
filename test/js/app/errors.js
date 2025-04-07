"use strict";

//var $ = require( 'zzdom' );
//var zcrud = require( '../../../js/app/main.js' );
var zzDOM = require( '../../../js/app/zzDOMPlugin.js' );
var $ = zzDOM.zz;
var Qunit = require( 'qunit' );
var utils = require( '../../../js/app/utils.js' );
var testHelper = require( './testHelper.js' );
var testServerSide = require( './testServerSide.js' );

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

// Run tests
QUnit.test( "list error test", function( assert ) {

    var done = assert.async();
    options = utils.extend( true, {}, formOptions );
    options.pageConf.pages.list.getGroupOfRecordsURL = 'http://localhost/CRUDManager.do?cmd=LIST&table=department&forceError=true';
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            
            errorFunctionCounter = 0;
            
            assert.equal( errorFunctionCounter, 0 );
            $( '#departmentsContainer' ).zcrud( 'renderList' );
            assert.equal( errorFunctionCounter, 1 );

            done();
        }
    );
});

QUnit.test( "options error test", function( assert ) {

    var done = assert.async();
    options = utils.extend( true, {}, formOptions );
    options.fields.phoneType.translateOptions = false;
    //options.fields.phoneType.options = 'http://localhost/CRUDManager.do?table=phoneTypes';
    options.fields.phoneType.options = 'http://localhost/CRUDManager.do?table=phoneTypes&forceError=true';
    
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
            assert.equal( errorFunctionCounter, 1 );

            done();
        }
    );
});

QUnit.test( "get error in update form page test", function( assert ) {

    var done = assert.async();
    options = utils.extend( true, {}, formOptions );
    options.pageConf.defaultPageConf.getRecordURL = 'http://localhost/CRUDManager.do?cmd=GET&table=department&forceError=true';

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
            assert.equal( errorFunctionCounter, 1 );

            done();
        }
    );
});

QUnit.test( "update error in update form page test", function( assert ) {

    var done = assert.async();
    options = utils.extend( true, {}, formOptions );
    options.pageConf.defaultPageConf.updateURL = 'http://localhost/CRUDManager.do?cmd=BATCH_UPDATE&table=department&forceError=true';

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            errorFunctionCounter = 0;

            assert.equal( errorFunctionCounter, 0 );
            $( '#departmentsContainer' ).zcrud( 'renderList' );
            assert.equal( errorFunctionCounter, 0 );

            var key = 2;
            
            // Go to edit form
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );
            
            var editedRecord =  {
                "name": "Service 2 edited",
                "description": "Service 2 description",
                "date": "10/23/2017",
                "time": "18:50",
                "datetime": "10/23/2017 20:00",
                "phoneType": "officePhone_option",
                "province": "Cádiz",
                "city": "Tarifa",
                "browser": "Firefox",
                "important": true,
                "number": "3",
                "hobbies": [ 'reading_option', 'sports_option' ]
            };

            testHelper.fillForm( editedRecord );
            
            // Submit
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 1 );
            
            done();
        }
    );
});

QUnit.test( "get error in delete page test", function( assert ) {

    var done = assert.async();
    options = utils.extend( true, {}, formOptions );
    options.pageConf.defaultPageConf.getRecordURL = 'http://localhost/CRUDManager.do?cmd=GET&table=department&forceError=true';

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            errorFunctionCounter = 0;

            assert.equal( errorFunctionCounter, 0 );
            $( '#departmentsContainer' ).zcrud( 'renderList' );
            assert.equal( errorFunctionCounter, 0 );

            // Go to edit form
            testHelper.clickDeleteListButton( 2 );
            assert.equal( errorFunctionCounter, 1 );

            done();
        }
    );
});

QUnit.test( "delete error in delete form page test", function( assert ) {

    var done = assert.async();
    options = utils.extend( true, {}, formOptions );
    options.pageConf.defaultPageConf.updateURL = 'http://localhost/CRUDManager.do?cmd=BATCH_UPDATE&table=department&forceError=true';

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            errorFunctionCounter = 0;

            assert.equal( errorFunctionCounter, 0 );
            $( '#departmentsContainer' ).zcrud( 'renderList' );
            assert.equal( errorFunctionCounter, 0 );

            var key = 2;

            // Go to edit form
            testHelper.clickDeleteListButton( key );
            assert.equal( errorFunctionCounter, 0 );

            // Submit
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 1 );

            done();
        }
    );
});

QUnit.test( "update error in editable list test", function( assert ) {

    var done = assert.async();
    options = utils.extend( true, {}, editableListTestOptions );
    options.pageConf.pages.list.components.editing.updateURL = 'http://localhost/CRUDManager.do?cmd=BATCH_UPDATE&table=department&forceError=true';

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            errorFunctionCounter = 0;

            assert.equal( errorFunctionCounter, 0 );
            $( '#departmentsContainer' ).zcrud( 'renderList' );
            assert.equal( errorFunctionCounter, 0 );
            
            // Edit record
            var key = 2;
            var editedRecord =  {
                "name": "Service 2 edited",
                "number": "3"
            };
            testHelper.fillEditableList( editedRecord, key );
            
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 1 );

            done();
        }
    );
});

QUnit.test( "i18n file not found error test", function( assert ) {

    var done = assert.async();
    options = utils.extend( true, {}, formOptions );
    options.i18n.files.en = [ 'en-common.json', 'en-notFound.json' ];

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            assert.equal( 1, 0, "Error must be thrown!" );
            done();
        },
        function( msg ){
            assert.equal( msg, "Error trying to get /i18n/en-notFound.json: Not Found" );
            done();
        }
    );
});

QUnit.test( "not found field in list error test", function( assert ) {

    var done = assert.async();
    options = utils.extend( true, {}, formOptions );
    options.pageConf.pages.list.fields = [ 'id', 'notFound' ];

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            
            errorFunctionCounter = 0;

            assert.equal( errorFunctionCounter, 0 );
            $( '#departmentsContainer' ).zcrud( 'renderList' );
            assert.equal( errorFunctionCounter, 1 );
            
            done();
        }
    );
});
