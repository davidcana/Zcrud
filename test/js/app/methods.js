"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var fieldBuilder = require( '../../../js/app/fields/fieldBuilder.js' );
var Qunit = require( 'qunit' );
var testHelper = require( './testHelper.js' );
var testUtils = require( './testUtils.js' );

var editableListOptions = require( './editableListTestOptions.js' );
var formOptions = require( './defaultTestOptions.js' );
var subformTestOptions = require( './subformTestOptions.js' );
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
                "name": "Service 2 edited",
                "description": "Service 2 description"
            };
            $( '#departmentsContainer' ).zcrud( 
                'updateRecord', 
                {
                    record: editedRecord,
                    key: key
                } );
            
            // Check it
            var newRecord = $.extend( true, {}, record, editedRecord );
            testHelper.checkRecord( assert, key, newRecord );
            
            done();
        }
    );
});

QUnit.test( "change key updateRecord test", function( assert ) {

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
            var newKey = 0;
            var editedRecord =  {
                "id": "" + newKey,
                "name": "Service 2 edited",
                "description": "Service 2 description"
            };
            $( '#departmentsContainer' ).zcrud( 
                'updateRecord', 
                {
                    record: editedRecord,
                    key: key
                } );

            // Check it
            var newRecord = $.extend( true, {}, record, editedRecord );
            testHelper.checkRecord( assert, newKey, newRecord );

            done();
        }
    );
});

QUnit.test( "subform updateRecord test", function( assert ) {

    var thisTestOptions = {};
    options = $.extend( true, {}, subformTestOptions, thisTestOptions );
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testUtils.resetServices();

            // Update record on server
            var key = 2;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "description": "Description of Bart Simpson"
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        "description": "Description of Lisa Simpson"
                    }
                ]
            };
            testUtils.setService( key, record );
            
            // Load from server
            $( '#departmentsContainer' ).zcrud( 'load' );
            
            // Update record using method
            var editedRecord =  {
                "name": "Service 2 edited",
                "members": [
                    {
                        "code": "1",
                        "description": "Description of Bart Simpson edited"
                    },
                    {
                        "code": "3",
                        "name": "Homer Simpson",
                        "description": "Description of Homer Simpson"
                    }
                ]
            };
            $( '#departmentsContainer' ).zcrud( 
                'updateRecord', 
                {
                    record: editedRecord,
                    key: key
                } );

            // Check it
            var newRecord = $.extend( true, {}, record, editedRecord );
            testHelper.checkRecord( assert, key, newRecord );

            done();
        }
    );
});

QUnit.test( "clientOnly updateRecord test", function( assert ) {

    var thisTestOptions = {
        fields: {
            name: {
                width: '30%'
            },
            description: {
                list: true,
                width: '50%'
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

            // Check record
            var key = 2;
            var record =  {
                "name": "Service " + key,
                "id":"" + key
            };
            testHelper.checkRecord( assert, key, record );

            // Update record using method
            var editedRecord =  {
                "name": "Service 2 edited",
                "description": "Service 2 description"
            };
            $( '#departmentsContainer' ).zcrud( 
                'updateRecord', 
                {
                    record: editedRecord,
                    key: key,
                    clientOnly: true
                } );

            // Check it
            var newRecord = $.extend( true, {}, record, editedRecord );
            testHelper.checkRecordInList( assert, key, newRecord );
            assert.deepEqual( testUtils.getService( key ), record );
            
            var values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 10 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 129',
                ids:  values[ 0 ],
                names: "Service 1/Service 2 edited/Service 3/Service 4/Service 5/Service 6/Service 7/Service 8/Service 9/Service 10",
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
            });
            var values2 = testHelper.buildCustomValuesList( testHelper.buildValuesList( 11, 20 ) );
            testHelper.pagingTest({
                action: { 
                    pageId: '2' 
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 11-20 of 129',
                ids:  values2[ 0 ],
                names: values2[ 1 ],
                pageListNotActive: [ '2' ],
                pageListActive: [ '<<', '<', '1', '3', '4', '5', '13', '>', '>>' ]
            });
            testHelper.pagingTest({
                action: { 
                    pageId: '1' 
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 129',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
            });

            done();
        }
    );
});

QUnit.test( "clientOnly deleteRecord test", function( assert ) {

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
                    key: key,
                    clientOnly: true
                } );
            
            // Check it
            var values = testHelper.buildCustomValuesList( 1, testHelper.buildValuesList( 3, 10 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 9,
                pagingInfo: 'Showing 1-9 of 128',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
            });
            assert.deepEqual( testUtils.getService( key ), record );
            
            var values2 = testHelper.buildCustomValuesList( testHelper.buildValuesList( 11, 20 ) );
            testHelper.pagingTest({
                action: { 
                    pageId: '2' 
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 11-20 of 129',
                ids:  values2[ 0 ],
                names: values2[ 1 ],
                pageListNotActive: [ '2' ],
                pageListActive: [ '<<', '<', '1', '3', '4', '5', '13', '>', '>>' ]
            });
            
            var values3 = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 10 ) );
            testHelper.pagingTest({
                action: { 
                    pageId: '1' 
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 129',
                ids:  values3[ 0 ],
                names: values3[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
            });
            done();
        }
    );
});

QUnit.test( "clientOnly addRecord test", function( assert ) {

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
                    record: record,
                    clientOnly: true
                } );
            
            // Check it
            assert.equal( testUtils.getService( key ), undefined );
            
            var values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 0, 10 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 11,
                pagingInfo: 'Showing 1-11 of 130',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
            });
            

            var values2 = testHelper.buildCustomValuesList( testHelper.buildValuesList( 11, 20 ) );
            testHelper.pagingTest({
                action: { 
                    pageId: '2' 
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 11-20 of 129',
                ids:  values2[ 0 ],
                names: values2[ 1 ],
                pageListNotActive: [ '2' ],
                pageListActive: [ '<<', '<', '1', '3', '4', '5', '13', '>', '>>' ]
            });

            var values3 = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 10 ) );
            testHelper.pagingTest({
                action: { 
                    pageId: '1' 
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 129',
                ids:  values3[ 0 ],
                names: values3[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
            });

            done();
        }
    );
});

QUnit.test( "custom url updateRecord test", function( assert ) {

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
            var url = 'http://localhost:8080/cerbero/CRUDManager.do?cmd=BATCH_UPDATE&table=department&customArg=myValue';
            var editedRecord =  {
                "name": "Service 2 edited",
                "description": "Service 2 description"
            };
            $( '#departmentsContainer' ).zcrud( 
                'updateRecord', 
                {
                    record: editedRecord,
                    key: key,
                    url: url
                } );

            // Check it
            var newRecord = $.extend( true, {}, record, editedRecord );
            testHelper.checkRecord( assert, key, newRecord );
            
            assert.equal( testUtils.getUrl( 1 ), url );

            done();
        }
    );
});

