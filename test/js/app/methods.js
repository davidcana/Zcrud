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

QUnit.test( "load (using filter) test", function( assert ) {

    var thisTestOptions = {};
    options = $.extend( true, {}, formOptions, thisTestOptions );
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices();
            $( '#departmentsContainer' ).zcrud( 
                'load', 
                { 
                    name: 'Service 1'
                } );
            
            var values = testHelper.buildCustomValuesList( 1, testHelper.buildValuesList( 10, 18 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 41',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '>', '>>' ]
            });
            
            done();
        }
    );
});
*/
QUnit.test( "simple addRecord test", function( assert ) {

    var thisTestOptions = {};
    options = $.extend( true, {}, formOptions, thisTestOptions );
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices();
            $( '#departmentsContainer' ).zcrud( 'load' );

            // Add record
            var key = 0;
            var record = {
                "id": "" + key,
                "name": "Service " + key,
                "description": "Service " + key + " description",
                "province": "Málaga",
                "city": "Marbella"
            };
            $( '#departmentsContainer' ).zcrud( 
                'addRecord', 
                {
                    record: record
                } );

            // Check it
            testHelper.checkRecord( assert, key, record );
            
            var values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 0, 9 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 130',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
            });
            
            done();
        }
    );
});

QUnit.test( "simple deleteRecord test", function( assert ) {

    var thisTestOptions = {};
    options = $.extend( true, {}, formOptions, thisTestOptions );
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices();
            $( '#departmentsContainer' ).zcrud( 'load' );

            // Add record
            var key = 2;
            var record =  {
                "name": "Service " + key,
                "id":"" + key
            };
            testHelper.checkRecord( assert, key, record );
            
            $( '#departmentsContainer' ).zcrud( 
                'deleteRecord', 
                {
                    key: key
                } );
            
            // Check it
            var values = testHelper.buildCustomValuesList( 1, testHelper.buildValuesList( 3, 11 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 128',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
            });
            testHelper.checkNoRecord( assert, key );

            done();
        }
    );
});

QUnit.test( "simple updateRecord test", function( assert ) {

    var thisTestOptions = {};
    options = $.extend( true, {}, formOptions, thisTestOptions );
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices();
            $( '#departmentsContainer' ).zcrud( 'load' );

            // Check record
            var key = 2;
            var record =  {
                "name": "Service " + key,
                "id":"" + key
            };
            testHelper.checkRecord( assert, key, record );
            
            // Update record on server
            record =  {
                "id": "" + key,
                "name": "Service " + key,
                "province": "Málaga",
                "city": "Marbella",
                "browser": "Firefox",
            };
            testUtils.setService( key, record );
            
            // Update record using method
            var editedRecord =  {
                "id":"" + key,
                "name": "Service 2 edited",
                "description": "Service 2 description"
            };
            $( '#departmentsContainer' ).zcrud( 
                'updateRecord', 
                {
                    record: editedRecord
                } );
            
            // Check it
            var newRecord = $.extend( true, {}, record, editedRecord );
            testHelper.checkRecord( assert, key, newRecord );
            
            done();
        }
    );
});
