
import { utils } from '../../../js/app/utils.js';
import { zzDOM } from '../../../js/app/zzDOMPlugin.js';
var $ = zzDOM.zz;

import { testHelper } from './testHelper.js';
import { testServerSide } from './testServerSide.js';

import { subformTestOptions as defaultTestOptions } from './subformTestOptions.js';

var options = undefined;

var errorFunctionCounter = 0;
defaultTestOptions.errorFunction = function( message ){
    ++errorFunctionCounter;
};

// Run tests
QUnit.test( 'create with subforms validation test', function( assert ) {

    testServerSide.resetServices();
    
    var done = assert.async();
    options = utils.extend( true, {}, defaultTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );
            
            var key = 0;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key,
                'description': 'Service ' + key + ' description',
                'date': '10/23/2017',
                'time': '18:50',
                'datetime': '10/23/2017 20:00',
                'phoneType': 'officePhone_option',
                'province': 'Málaga',
                'city': 'Marbella',
                'browser': 'Firefox',
                'important': true,
                'number': '3',
                'members': {
                    '0': {
                        'code': '0',
                        'name': 'Bart Simpson',
                        'description': 'Description of Bart Simpson'
                    },
                    '1': {
                        'code': '1',
                        'name': 'Lisa Simpson',
                        'description': 'Description of Lisa Simpson'
                    }
                }
            };
            
            // Assert register with key 0 not exists
            testHelper.checkNoRecord( assert, key );

            // Go to create form
            testHelper.clickCreateListButton();
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillForm( record );


            done();
        }
    );
});

QUnit.test( 'update with updated subforms validation test', function( assert ) {

    testServerSide.resetServices();
    
    var done = assert.async();
    options = utils.extend( true, {}, defaultTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            
            var key = 2;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key,
                'members': [
                    {
                        'code': '1',
                        'name': 'Bart Simpson',
                        'description': 'Description of Bart Simpson'
                    },
                    {
                        'code': '2',
                        'name': 'Lisa Simpson',
                        'description': 'Description of Lisa Simpson'
                    }
                ]
            };
            testServerSide.setService( key, record );
            
            $( '#departmentsContainer' ).zcrud( 'renderList' );
            
            // Go to edit form and edit record
            testHelper.clickUpdateListButton( key );
            //testHelper.clickCreateSubformRowButton( 'members' );
            //testHelper.clickCreateSubformRowButton( 'members' );
            //testHelper.fillForm( record );
            var editedRecord =  {
                'name': 'Service ' + key + ' edited',
                'members': {
                    '0': {
                        'description': 'Description of Bart Simpson edited'
                    },
                    '1': {
                        'name': '-',   // Validation must fail here!
                        'description': 'Description of Lisa Simpson edited'
                    }
                }
            };

            testHelper.fillForm( editedRecord );
            assert.equal( testHelper.getNumberOfValidationErrors(), 1 );
            
            // Try to edit record (1 error)
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 1 );
            errorFunctionCounter = 0;

            // Fix the form
            var editedRecord2 = {
                'members': {
                    '1': {
                        'name': 'Lisa Simpson edited'
                    }
                }
            };
            //editedRecord.members[ 1 ].name = 'Lisa Simpson edited';
            testHelper.fillSubform( editedRecord2, 'members' );
            assert.equal( testHelper.getNumberOfValidationErrors(), 0 );
            
            // Update record (no errors)
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );
            
            var newRecord = {
                'id': '' + key,
                'name': 'Service ' + key + ' edited',
                'members': [
                    {
                        'code': '1',
                        'description': 'Description of Bart Simpson edited',
                        'name': 'Bart Simpson'
                    },
                    {
                        'code': '2',
                        'description': 'Description of Lisa Simpson edited',
                        'name': 'Lisa Simpson edited'
                    }
                ]
            };
            testHelper.checkRecord( assert, key, newRecord );

            // Go to edit form again and check record
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, newRecord );

            done();
        }
    );
});

QUnit.test( 'update with added subforms validation test', function( assert ) {

    testServerSide.resetServices();

    var done = assert.async();
    options = utils.extend( true, {}, defaultTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            var key = 2;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key,
                'members': [
                    {
                        'code': '1',
                        'name': 'Bart Simpson',
                        'description': 'Description of Bart Simpson'
                    },
                    {
                        'code': '2',
                        'name': 'Lisa Simpson',
                        'description': 'Description of Lisa Simpson'
                    }
                ]
            };
            testServerSide.setService( key, record );

            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form and edit record
            testHelper.clickUpdateListButton( key );

            var editedRecord =  {
                'name': 'Service ' + key + ' edited',
                'members': {
                    '2': {
                        'code': '3',
                        'name': '-',   // Validation must fail here!
                        'description': 'Description of Marge Simpson'
                    },
                    '3': {
                        'code': '4',
                        'name': 'Homer Simpson', 
                        'description': 'Description of Homer Simpson'
                    }
                }
            };
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.clickCreateSubformRowButton( 'members' );
            
            testHelper.fillForm( editedRecord );
            assert.equal( testHelper.getNumberOfValidationErrors(), 1 );
            
            // Try to edit record (1 error)
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 1 );
            errorFunctionCounter = 0;
            
            // Fix the form
            var editedRecord2 = {
                'members': {
                    '2': {
                        'name': 'Marge Simpson'
                    }
                }
            };
            testHelper.fillSubform( editedRecord2, 'members' );
            assert.equal( testHelper.getNumberOfValidationErrors(), 0 );
            
            // Update record (no errors)
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 0 );

            var newRecord = {
                'id': '' + key,
                'name': 'Service ' + key + ' edited',
                'members': [
                    {
                        'code': '1',
                        'name': 'Bart Simpson',
                        'description': 'Description of Bart Simpson'
                    },
                    {
                        'code': '2',
                        'name': 'Lisa Simpson',
                        'description': 'Description of Lisa Simpson'
                    },
                    {
                        'code': '3',
                        'name': 'Marge Simpson',
                        'description': 'Description of Marge Simpson'
                    },
                    {
                        'code': '4',
                        'name': 'Homer Simpson', 
                        'description': 'Description of Homer Simpson'
                    }
                ]
            };
            testHelper.checkRecord( assert, key, newRecord );

            // Go to edit form again and check record
            testHelper.clickUpdateListButton( key );
            testHelper.checkForm( assert, newRecord );

            done();
        }
    );
});

QUnit.test( 'update with updated subforms undo/redo 1 action validation test', function( assert ) {

    testServerSide.resetServices();

    var done = assert.async();
    options = utils.extend( true, {}, defaultTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            var key = 2;
            var record =  {
                'id': '' + key,
                'name': 'Service ' + key,
                'members': [
                    {
                        'code': '1',
                        'name': 'Bart Simpson',
                        'description': 'Description of Bart Simpson'
                    },
                    {
                        'code': '2',
                        'name': 'Lisa Simpson',
                        'description': 'Description of Lisa Simpson'
                    }
                ]
            };
            testServerSide.setService( key, record );

            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form and edit record
            testHelper.clickUpdateListButton( key );
            var editedRecord =  {
                'name': 'Service ' + key + ' edited',
                'members': {
                    '1': {
                        'name': '-',  // Validation must fail here!
                    }
                }
            };

            testHelper.fillForm( editedRecord );
            assert.equal( testHelper.getNumberOfValidationErrors(), 1 );

            // Try to edit record (1 error)
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickFormSubmitButton();
            assert.equal( errorFunctionCounter, 1 );
            errorFunctionCounter = 0;
            
            // Undo
            var tempRecord = utils.extend( true, {} , record );
            testHelper.clickUndoButton();
            tempRecord.name = editedRecord.name;
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 1, 1, false );
            assert.equal( testHelper.getNumberOfValidationErrors(), 0 );
            
            // Redo
            testHelper.clickRedoButton();
            tempRecord.members[1].name = editedRecord.members[1].name;
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 2, 0, true );
            assert.equal( testHelper.getNumberOfValidationErrors(), 1 );
            
            // Undo
            tempRecord = utils.extend( true, {} , record );
            testHelper.clickUndoButton();
            tempRecord.name = editedRecord.name;
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 1, 1, false );
            assert.equal( testHelper.getNumberOfValidationErrors(), 0 );

            done();
        }
    );
});
