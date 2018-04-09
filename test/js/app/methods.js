"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var fieldBuilder = require( '../../../js/app/fields/fieldBuilder.js' );
var Qunit = require( 'qunit' );
var testHelper = require( './testHelper.js' );
var testUtils = require( './testUtils.js' );
//var datetimeFieldManager = require( '../../../js/app/fields/datetimeFieldManager.js' );

var editableListOptions = require( './editableListTestOptions.js' );
var formOptions = require( './defaultTestOptions.js' );
var options = undefined;

// Run tests
/*
QUnit.test( "selection related methods test (using selectRows)", function( assert ) {

    var thisTestOptions = {
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
    };
    options = $.extend( true, {}, formOptions, thisTestOptions );
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices();
            $( '#departmentsContainer' ).zcrud( 'load' );
            
            var $departmentsContainer = $( '#departmentsContainer' );
            var $tbody = $( '#zcrud-list-tbody-department' );
            
            // Select row with key 3
            $( '#departmentsContainer' ).zcrud( 
                'selectRows',
                $tbody.find( "[data-record-key='" + 3 + "']" ) );
            
            assert.deepEqual( 
                $departmentsContainer.zcrud( 'selectedRecords' ),
                [ 
                    {
                        "id": "3",
                        "name": "Service 3"
                    }
                ] );
            assert.ok(
                $departmentsContainer.zcrud( 'selectedRows' ).is(
                    $tbody.find( "[data-record-key='" + 3 + "']" ) ) );
            
            // Select row with key 5
            $( '#departmentsContainer' ).zcrud( 
                'selectRows',
                $tbody.find( "[data-record-key='" + 5 + "']" ) );

            assert.deepEqual( 
                $departmentsContainer.zcrud( 'selectedRecords' ),
                [ 
                    {
                        "id": "3",
                        "name": "Service 3"
                    },
                    {
                        "id": "5",
                        "name": "Service 5"
                    }
                ] );
            assert.ok(
                $departmentsContainer.zcrud( 'selectedRows' ).is(
                    $tbody.find( "[data-record-key='" + 3 + "'], [data-record-key='" + 5 + "']" ) ) );
            
            // Deselect row with key 3
            $( '#departmentsContainer' ).zcrud( 
                'deselectRows',
                $tbody.find( "[data-record-key='" + 3 + "']" ) );

            assert.deepEqual( 
                $departmentsContainer.zcrud( 'selectedRecords' ),
                [ 
                    {
                        "id": "5",
                        "name": "Service 5"
                    }
                ] );
            assert.ok(
                $departmentsContainer.zcrud( 'selectedRows' ).is(
                    $tbody.find( "[data-record-key='" + 5 + "']" ) ) );
            
            done();
        }
    );
});

QUnit.test( "selection related methods test (using selectRecords)", function( assert ) {

    var thisTestOptions = {
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
    };
    options = $.extend( true, {}, formOptions, thisTestOptions );
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices();
            $( '#departmentsContainer' ).zcrud( 'load' );

            var $departmentsContainer = $( '#departmentsContainer' );
            var $tbody = $( '#zcrud-list-tbody-department' );

            // Select row with key 3
            $( '#departmentsContainer' ).zcrud( 
                'selectRecords',
                [
                    {
                        "id": "3",
                        "name": "Service 3"
                    }
                ]
            );
            assert.deepEqual( 
                $departmentsContainer.zcrud( 'selectedRecords' ),
                [ 
                    {
                        "id": "3",
                        "name": "Service 3"
                    }
                ] );
            assert.ok(
                $departmentsContainer.zcrud( 'selectedRows' ).is(
                    $tbody.find( "[data-record-key='" + 3 + "']" ) ) );
            
            // Select row with key 5
            $( '#departmentsContainer' ).zcrud( 
                'selectRecords',
                [ 
                    {
                        "id": "3",
                        "name": "Service 3"
                    },
                    {
                        "id": "5",
                        "name": "Service 5"
                    }
                ] );

            assert.deepEqual( 
                $departmentsContainer.zcrud( 'selectedRecords' ),
                [ 
                    {
                        "id": "3",
                        "name": "Service 3"
                    },
                    {
                        "id": "5",
                        "name": "Service 5"
                    }
                ] );
            assert.ok(
                $departmentsContainer.zcrud( 'selectedRows' ).is(
                    $tbody.find( "[data-record-key='" + 3 + "'], [data-record-key='" + 5 + "']" ) ) );
                    
            // Deselect row with key 3
            $( '#departmentsContainer' ).zcrud( 
                'deselectRecords',
                [ 
                    {
                        "id": "3",
                        "name": "Service 3"
                    }
                ] );

            assert.deepEqual( 
                $departmentsContainer.zcrud( 'selectedRecords' ),
                [ 
                    {
                        "id": "5",
                        "name": "Service 5"
                    }
                ] );
            assert.ok(
                $departmentsContainer.zcrud( 'selectedRows' ).is(
                    $tbody.find( "[data-record-key='" + 5 + "']" ) ) );

            done();
        }
    );
});

QUnit.test( "showCreateForm test", function( assert ) {

    var thisTestOptions = {};
    options = $.extend( true, {}, formOptions, thisTestOptions );
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices();
            $( '#departmentsContainer' ).zcrud( 'load' );

            assert.equal( 
                $( '#zcrud-form-department' ).length,
                0 );
            
            $( '#departmentsContainer' ).zcrud( 'showCreateForm' );
            
            assert.equal( 
                $( '#zcrud-form-department' ).length,
                1 );
            
            // Fill create form
            var key = 0;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "description": "Service " + key + " description",
                "province": "Málaga",
                "city": "Marbella"
            };
            testHelper.fillForm( record );
            testHelper.checkForm( assert, record );
            
            // Submit
            testHelper.clickFormSubmitButton();
            testHelper.checkRecord( assert, key, record );
            
            done();
        }
    );
});

QUnit.test( "showUpdateForm test", function( assert ) {

    var thisTestOptions = {};
    options = $.extend( true, {}, formOptions, thisTestOptions );
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices();
            $( '#departmentsContainer' ).zcrud( 'load' );

            assert.equal( 
                $( '#zcrud-form-department' ).length,
                0 );
            
            var key = 2;
            var record =  {
                "id": "" + key,
                "name": "Service " + key
            };
            $( '#departmentsContainer' ).zcrud( 'showUpdateForm', key );

            assert.equal( 
                $( '#zcrud-form-department' ).length,
                1 );

            // Fill create form
            var editedRecord =  {
                "name": "Service " + key + " edited",
                "description": "Service " + key + " description",
                "province": "Málaga",
                "city": "Marbella"
            };
            var newRecord = $.extend( true, {}, record, editedRecord );
            testHelper.fillForm( editedRecord );
            testHelper.checkForm( assert, newRecord );

            // Submit
            testHelper.clickFormSubmitButton();
            testHelper.checkRecord( assert, key, newRecord );

            done();
        }
    );
});

QUnit.test( "showDeleteForm test", function( assert ) {

    var thisTestOptions = {};
    options = $.extend( true, {}, formOptions, thisTestOptions );
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices();
            $( '#departmentsContainer' ).zcrud( 'load' );

            assert.equal( 
                $( '#zcrud-form-department' ).length,
                0 );
            
            var key = 2;
            $( '#departmentsContainer' ).zcrud( 'showDeleteForm', key );

            assert.equal( 
                $( '#zcrud-form-department' ).length,
                1 );

            testHelper.clickFormSubmitButton();
            testHelper.checkNoRecord( assert, key );
            
            done();
        }
    );
});
*/
QUnit.test( "getRecordByKey/getRowByKey test", function( assert ) {

    var thisTestOptions = {};
    options = $.extend( true, {}, formOptions, thisTestOptions );
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices();
            $( '#departmentsContainer' ).zcrud( 'load' );

            var key = 2;
            var record = $( '#departmentsContainer' ).zcrud( 'getRecordByKey', key );
            assert.deepEqual(
                record,
                {
                    "id": "2",
                    "name": "Service 2"
                }
            );
            
            var $tbody = $( '#zcrud-list-tbody-department' );
            var $row = $( '#departmentsContainer' ).zcrud( 'getRowByKey', key );
            assert.ok(
                $row.is( 
                    $tbody.find( "[data-record-key='" + key + "']" ) )
            );
            
            done();
        }
    );
});

