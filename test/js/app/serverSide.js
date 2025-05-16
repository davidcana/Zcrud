'use strict';

//var $ = require( 'zzdom' );
//var zcrud = require( '../../../js/app/main.js' );
var zzDOM = require( '../../../js/app/zzDOMPlugin.js' );
var $ = zzDOM.zz;
var Qunit = require( 'qunit' );
var utils = require( '../../../js/app/utils.js' );
var testHelper = require( './testHelper.js' );
var testServerSide = require( './testServerSide.js' );
var context = require( '../../../js/app/context.js' );

var formTestOptions = require( './defaultTestOptions.js' );
var editableListTestOptions = require( './editableListTestOptions.js' );
var options = undefined;

var errorFunctionCounter = 0;
var errorFunction = function( message ){
    ++errorFunctionCounter;
};
formTestOptions.errorFunction = errorFunction;
editableListTestOptions.errorFunction = errorFunction;

// Run tests
QUnit.test( 'form create record with duplicated key test', function( assert ) {

    var done = assert.async();
    errorFunctionCounter = 0;
    options = utils.extend( true, {}, formTestOptions );
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            
            testServerSide.resetServices();
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, record );
            
            // Go to create form and try to create record
            testHelper.clickCreateListButton();
            var newRecord =  {
                'id': '' + key,
                'name': 'Service ' + key + ' (error)',
                'description': 'Service ' + key + ' description (duplicated key)',
                'province': 'Cádiz'
            };
            testHelper.fillForm( newRecord );
            testHelper.checkForm( assert, newRecord );
            
            // Submit 
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 1 );
            
            assert.deepEqual( testServerSide.getService( key ), record );
            
            done();
        }
    );
});

QUnit.test( 'form update record with no duplicated key test', function( assert ) {

    var done = assert.async();
    errorFunctionCounter = 0;
    options = utils.extend( true, {}, formTestOptions );
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            
            testServerSide.resetServices();
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, record );

            // Go to update form and update key
            testHelper.clickUpdateListButton( key );
            var newKey = 999;
            var newRecord =  {
                'id': '' + newKey,
                'name': 'Service ' + newKey
            };
            testHelper.checkNoRecord( assert, newKey );
            testHelper.fillForm( newRecord );
            testHelper.checkForm( assert, newRecord );
            
            // Submit 
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            testHelper.checkNoRecord( assert, key );
            assert.deepEqual( testServerSide.getService( newKey ), newRecord );

            done();
        }
    );
});

QUnit.test( 'form update record with duplicated key test', function( assert ) {

    var done = assert.async();
    errorFunctionCounter = 0;
    options = utils.extend( true, {}, formTestOptions );
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            
            testServerSide.resetServices();
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, record );

            // Go to update form and try to update key
            testHelper.clickUpdateListButton( key );
            var newKey = 3;
            var newRecord =  {
                'id': '' + newKey,
                'name': 'Service ' + newKey
            };
            testHelper.fillForm( newRecord );
            testHelper.checkForm( assert, newRecord );

            // Submit 
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 1 );

            assert.deepEqual( testServerSide.getService( key ), record );

            done();
        }
    );
});

QUnit.test( 'form delete non existing record test', function( assert ) {

    var done = assert.async();
    errorFunctionCounter = 0;
    options = utils.extend( true, {}, formTestOptions );
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, record );

            // Go to delete form
            testHelper.clickDeleteListButton( key );
            
            // Remove service
            testServerSide.removeService( key ); 

            // Submit 
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 1 );

            assert.deepEqual( testServerSide.getService( key ), undefined );
            
            done();
        }
    );
});

QUnit.test( 'editable list create record with duplicated key test', function( assert ) {

    var done = assert.async();
    errorFunctionCounter = 0;
    options = utils.extend( true, {}, editableListTestOptions );
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            context.updateListVisibleFields( options, [ 'id', 'name' ] );

            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;

            // Assert record with key 1 exists
            var key = 1;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, record, editable, true );

            // Try to create
            testHelper.clickCreateRowListButton();
            var newRecord =  {
                'id': '' + key,
                'name': 'Bad service'
            };
            testHelper.fillNewRowEditableList( newRecord );

            // Check errors before and after button submit
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 1 );

            testHelper.checkRecord( assert, key, record, editable, true );

            done();
        }
    );
});

QUnit.test( 'editable list update record with no duplicated key test', function( assert ) {

    var done = assert.async();
    errorFunctionCounter = 0;
    options = utils.extend( true, {}, editableListTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            context.updateListVisibleFields( options, [ 'id', 'name' ] );
            
            $( '#departmentsContainer' ).zcrud( 'renderList' );
            
            var editable = true;
            
            // Assert register with key 4 exists
            var key = 4;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, record, editable, true );
            
            // Update record
            var newKey = 999;
            var newRecord =  {
                'id': '' + newKey,
                'name': 'Service ' + newKey
            };
            testHelper.checkNoRecord( assert, newKey );
            testHelper.fillEditableList( newRecord, key );
            testHelper.checkEditableListForm( assert, key, newRecord );
            
            // Submit 
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            assert.deepEqual( testServerSide.getService( key ), undefined );
            assert.deepEqual( testServerSide.getService( newKey ), newRecord );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 129',
                ids:  '1/2/3/999/5/6/7/8/9/10',
                names: 'Service 1/Service 2/Service 3/Service 999/Service 5/Service 6/Service 7/Service 8/Service 9/Service 10',
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ],
                editable: editable
            });
            
            done();
        }
    );
});

QUnit.test( 'editable list update record with duplicated key test', function( assert ) {

    var done = assert.async();
    errorFunctionCounter = 0;
    options = utils.extend( true, {}, editableListTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            context.updateListVisibleFields( options, [ 'id', 'name' ] );

            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, record, editable, true );

            // Try to update
            var newKey = 3;
            var record2 =  {
                'id': '' + newKey,
                'name': 'Service ' + newKey
            };
            testHelper.checkRecord( assert, newKey, record2, editable, true );
            
            var newRecord =  {
                'id': '' + newKey,
                'name': 'Bad service'
            };
            testHelper.fillEditableList( newRecord, key );
            testHelper.checkEditableListForm( assert, key, newRecord );
            
            // Submit 
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 1 );
            
            assert.deepEqual( testServerSide.getService( key ), record );
            assert.deepEqual( testServerSide.getService( newKey ), record2 );

            done();
        }
    );
});

QUnit.test( 'editable list delete non existing record test', function( assert ) {

    var done = assert.async();
    errorFunctionCounter = 0;
    options = utils.extend( true, {}, editableListTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            context.updateListVisibleFields( options, [ 'id', 'name' ] );

            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;

            // Assert register with key 2 exists
            var key = 2;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key
            };
            testHelper.checkRecord( assert, key, record, editable, true );

            // Remove service
            testServerSide.removeService( key ); 
            assert.deepEqual( testServerSide.getService( key ), undefined );
            
            // Try to delete again
            testHelper.clickDeleteRowListButton( key );
            
            // Submit 
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 1 );

            done();
        }
    );
});

QUnit.test( 'form create record with undefined key test', function( assert ) {

    var done = assert.async();
    errorFunctionCounter = 0;
    options = utils.extend( true, {}, formTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            delete options.fields[ 'province' ].defaultValue;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to create form and create record
            testHelper.clickCreateListButton();
            var newRecord =  {
                'name': 'Service (no key)',
                'description': 'Service with no key'
            };
            testHelper.fillForm( newRecord );
            testHelper.checkForm( assert, newRecord );
            
            // Submit 
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            var fullNewRecord = utils.extend( true, {}, newRecord );
            var key = 130;
            fullNewRecord.id = '' + key;
            assert.deepEqual( testServerSide.getService( key ), fullNewRecord );

            testHelper.pagingTest({
                action: { 
                    lastPage: true
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 121-130 of 130',
                ids:  '121/122/123/124/125/126/127/128/129/130',
                names: 'Service 121/Service 122/Service 123/Service 124/Service 125/Service 126/Service 127/Service 128/Service 129/Service (no key)',
                pageListNotActive: [ '13', '>', '>>' ],
                pageListActive: [ '<<', '<', '1', '9', '10', '11', '12' ]
            });
            
            done();
        }
    );
});

QUnit.test( 'editable list create record with undefined key test', function( assert ) {

    var done = assert.async();
    errorFunctionCounter = 0;
    options = utils.extend( true, {}, editableListTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            context.updateListVisibleFields( options, [ 'id', 'name' ] );

            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;
            
            // Assert record with key 1 exists
            var key = 130;
            var record =  {
                'name': 'Service with no key'
            };
            assert.deepEqual( testServerSide.getService( key ), undefined );
            
            // Try to create
            testHelper.clickCreateRowListButton();
            testHelper.fillNewRowEditableList( record );
            
            // Check errors before and after button submit
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );
            
            var fullNewRecord = utils.extend( true, {}, record );
            fullNewRecord.id = '' + key;
            assert.deepEqual( testServerSide.getService( key ), fullNewRecord );
            
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 11,
                pagingInfo: 'Showing 1-11 of 130',
                ids:  '1/2/3/4/5/6/7/8/9/10/130',
                names: 'Service 1/Service 2/Service 3/Service 4/Service 5/Service 6/Service 7/Service 8/Service 9/Service 10/Service with no key',
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ],
                editable: editable
            });
            
            var values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 121, 130 ) );
            testHelper.pagingTest({
                action: { 
                    lastPage: true
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 121-130 of 130',
                ids:  values[ 0 ],
                names: 'Service 121/Service 122/Service 123/Service 124/Service 125/Service 126/Service 127/Service 128/Service 129/Service with no key',
                pageListNotActive: [ '13', '>', '>>' ],
                pageListActive: [ '<<', '<', '1', '9', '10', '11', '12' ],
                editable: editable
            });
            
            values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 10 ) );
            testHelper.pagingTest({
                action: { 
                    firstPage: true
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 130',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ],
                editable: editable
            });
            
            done();
        }
    );
});

QUnit.test( 'editable list create record with undefined key test and then update it', function( assert ) {

    var done = assert.async();
    errorFunctionCounter = 0;
    options = utils.extend( true, {}, editableListTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            testServerSide.resetServices();
            context.updateListVisibleFields( options, [ 'id', 'name' ] );

            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var editable = true;
            
            // Assert record with key 1 exists
            var key = 130;
            var record =  {
                'name': 'Service with no key'
            };
            assert.deepEqual( testServerSide.getService( key ), undefined );
            
            // Try to create
            testHelper.clickCreateRowListButton();
            testHelper.fillNewRowEditableList( record );
            
            // Check errors before and after button submit
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );
            
            var fullNewRecord = utils.extend( true, {}, record );
            fullNewRecord.id = '' + key;
            assert.deepEqual( testServerSide.getService( key ), fullNewRecord );
            
            // Update it 
            record =  {
                'name': 'Service with key'
            };
            testHelper.fillEditableList( record, key );
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickEditableListSubmitButton();
            assert.equal( errorFunctionCounter, 0 );
            
            fullNewRecord = utils.extend( true, {}, record );
            fullNewRecord.id = '' + key;
            assert.deepEqual( testServerSide.getService( key ), fullNewRecord );
            
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 11,
                pagingInfo: 'Showing 1-11 of 130',
                ids:  '1/2/3/4/5/6/7/8/9/10/130',
                names: 'Service 1/Service 2/Service 3/Service 4/Service 5/Service 6/Service 7/Service 8/Service 9/Service 10/Service with key',
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ],
                editable: editable
            });
                        
            var values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 121, 130 ) );
            testHelper.pagingTest({
                action: { 
                    lastPage: true
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 121-130 of 130',
                ids:  values[ 0 ],
                names: 'Service 121/Service 122/Service 123/Service 124/Service 125/Service 126/Service 127/Service 128/Service 129/Service with key',
                pageListNotActive: [ '13', '>', '>>' ],
                pageListActive: [ '<<', '<', '1', '9', '10', '11', '12' ],
                editable: editable
            });
                        
            values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 10 ) );
            testHelper.pagingTest({
                action: { 
                    firstPage: true
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 130',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ],
                editable: editable
            });
            done();
        }
    );
});
