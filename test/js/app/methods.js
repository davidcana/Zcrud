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