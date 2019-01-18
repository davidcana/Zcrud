"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var Qunit = require( 'qunit' );
var testHelper = require( './testHelper.js' );
var testServerSide = require( './testServerSide.js' );
var context = require( '../../../js/app/context.js' );
var log4javascript = require( 'log4javascript' );

var defaultTestOptions = {

    entityId: 'department',
    saveUserPreferences: false,

    pageConf: {
        defaultPageConf: {
            updateURL: 'http://localhost/CRUDManager.do?cmd=BATCH_UPDATE&table=department',
            getRecordURL: 'http://localhost/CRUDManager.do?cmd=GET&table=department',
            dataToSend: 'modified',
            confirm: {
                save: false,
                cancel: false
            }
        },
        pages: {
            list: {
                getGroupOfRecordsURL: 'http://localhost/CRUDManager.do?cmd=LIST&table=department',
                fields: [ 'id', 'name' ],
                components: {
                    paging: {
                        isOn: true,
                        defaultPageSize: 10,
                        pageSizes: [10, 25, 50, 100, 250, 500],
                        pageSizeChangeArea: true,
                        gotoPageFieldType: 'combobox', // possible values: 'textbox', 'combobox', 'none'
                        maxNumberOfAllShownPages: 5,
                        block1NumberOfPages: 1,
                        block2NumberOfPages: 5,
                        block3NumberOfPages: 1
                    },
                    sorting: {
                        isOn: false
                    },
                    selecting: {
                        isOn: false
                    },
                    filtering: {
                        isOn: false
                    }
                }
            }, 
            create: {
                fields: [
                    {
                        "type": "fieldsGroup"
                    }
                ]
            }, 
            update: {
                fields: [
                    {
                        "type": "fieldsGroup"
                    }
                ]
            }, 
            delete: {
                fields: [
                    {
                        "type": "fieldsGroup"
                    }
                ]
            }
        }
    },

    key : 'id',
    fields: {
        id: {
            sorting: false
        },
        name: {
            attributes:{
                rowHeader: {
                    style: 'width:90%'
                }
            }
        },
        description: {
            type: 'textarea'
        },
        time: {
            type: 'time',
            customOptions: {
                inline: false
            }
        },
        datetime: {
            type: 'datetime',
            customOptions: {
                inline: false
            }
        },
        date: {
            type: 'date',
            customOptions: {
                inline: false
            }
        },
        phoneType: {
            type: 'radio',
            translateOptions: true,
            options: function(){
                return [ 'homePhone_option', 'officePhone_option', 'cellPhone_option' ];
            }
        },
        province: {
            type: 'select',
            options: [ 'Cádiz', 'Málaga' ]
            //defaultValue: 'Cádiz'
        },
        city: {
            type: 'select',
            dependsOn: 'province',
            options: function( data ){
                if ( ! data.dependedValues.province ){
                    return [ 'Algeciras', 'Estepona', 'Marbella', 'Tarifa' ]
                }
                switch ( data.dependedValues.province ) {
                    case 'Cádiz':
                        return [ 'Algeciras', 'Tarifa' ];
                    case 'Málaga':
                        return [ 'Estepona', 'Marbella' ];
                    default:
                        throw 'Unknown province: ' + data.dependedValues.province;
                }
            }
        },
        browser: {
            type: 'datalist',
            options: [ 'Internet Explorer', 'Firefox', 'Chrome', 'Opera', 'Safari' ]
        },
        important: {
            type: 'checkbox'
        },
        number: {
        },
        members: {
            type: 'subform',
            subformKey: 'code',
            fields: { 
                code: { },
                name: { },
                description: {
                    type: 'textarea',
                    attributes: {
                        field: {
                            rows: 3
                        }
                    }
                }
            }
        }
    },

    validation: {
        modules: 'security, date',
        rules: {
            "name": {
                validation: 'length',
                length: '3-20'
            },
            "members/name": {
                validation: 'length',
                length: '3-20'
            },
            /*
            '#zcrud-number': {
                validation: 'number',
                allowing: 'float'
            }*/
            "number": {
                validation: 'number',
                allowing: 'float'
            }
        }
    },

    ajax:{
        ajaxFunction: testServerSide.ajax    
    },

    events: {},

    i18n: {
        language: 'es',
        files: { 
            en: [ 'en-common.json', 'en-services.json' ],
            es: [ 'es-common.json', 'es-services.json' ] 
        }
    },

    logging: {
        isOn: true
    }
};

defaultTestOptions.fields.members.fields = { 
    code: { },
    name: { },
    description: {
        type: 'textarea',
        attributes: {
            field: {
                rows: 3
            }
        }
    },
    time: {
        type: 'time',
        customOptions: {
            inline: false
        }
    },
    datetime: {
        type: 'datetime',
        customOptions: {
            inline: false
        }
    },
    date: {
        type: 'date',
        customOptions: {
            inline: false
        }
    },
    important: {
        type: 'checkbox'
    },
    phoneType: {
        type: 'radio',
        translateOptions: true,
        options: function(){
            return [ 'homePhone_option', 'officePhone_option', 'cellPhone_option' ];
        }
    },
    province: {
        type: 'select',
        options: [ 'Cádiz', 'Málaga' ]
        //defaultValue: 'Cádiz'
    },
    city: {
        type: 'select',
        dependsOn: 'members-province',
        options: function( data ){
            var dependedValues = data.dependedValues[ 'members-province' ];
            if ( ! dependedValues ){
                return [ 'Algeciras', 'Estepona', 'Marbella', 'Tarifa' ]
            }
            switch ( dependedValues ) {
                case 'Cádiz':
                    return [ 'Algeciras', 'Tarifa' ];
                case 'Málaga':
                    return [ 'Estepona', 'Marbella' ];
                default:
                    throw 'Unknown province: ' + dependedValues;
            }
        }
    },
    browser: {
        type: 'datalist',
        options: [ 'Internet Explorer', 'Firefox', 'Chrome', 'Opera', 'Safari' ]
    },
    hobbies: {
        type: 'checkboxes',
        translateOptions: true,
        options: [ 'reading_option', 'videogames_option', 'sports_option', 'cards_option' ]
    }
};

var options = undefined;

var errorFunctionCounter = 0;

defaultTestOptions.errorFunction = function( message ){
    ++errorFunctionCounter;
};

// Run tests
QUnit.test( "create text area test", function( assert ) {

    var done = assert.async();
    options = $.extend( true, {}, defaultTestOptions );
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            
            // Setup services
            testServerSide.resetServices();
            var key = 4;
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
            testServerSide.setService( key, record );
            
            var varName = 'description';
            context.updateSubformFields( options.fields.members, [ 'code', 'name', varName ] );
            
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );
            
            // Go to edit form
            testHelper.clickUpdateListButton( key );
            
            // Add subform record 3
            var subformRecord3 = {
                "code": "3",
                "name": "Homer Simpson",
                "description": "Description of Homer Simpson"
            };
            var subformRecord3Clone = $.extend( true, {}, subformRecord3 );
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillSubformNewRow( subformRecord3Clone, 'members' );
            
            // Build edited record and check form
            var editedRecord = $.extend( true, {}, record );
            editedRecord.members.push( subformRecord3Clone );
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 4, 0, true );
            
            // Undo (1)
            editedRecord.members[ 2 ][ varName ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 3, 1, false );
            
            // Undo (2)
            editedRecord.members[ 2 ][ 'name' ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 2, 2, false );
            
            // Undo (3)
            editedRecord.members[ 2 ][ 'code' ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 1, 3, false );
            
            // Undo (4)
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 0, 4, false );
            
            // Redo (1)
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 1, 3, false );
            
            // Redo (2)
            editedRecord.members[ 2 ][ 'code' ] = subformRecord3[ 'code' ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 2, 2, false );
            
            // Redo (3)
            editedRecord.members[ 2 ][ 'name' ] = subformRecord3[ 'name' ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 3, 1, false );
            
            // Redo (4)
            editedRecord.members[ 2 ][ varName ] = subformRecord3[ varName ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 4, 0, false );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), editedRecord );

            // Go to edit form again and check the form again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkForm( assert, editedRecord );

            done();
        }
    );
});

QUnit.test( "create datetime test", function( assert ) {

    var done = assert.async();
    options = $.extend( true, {}, defaultTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // Setup services
            testServerSide.resetServices();
            var key = 4;
            var serverRecord =  {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "datetime": new Date( "2017-09-10T20:00:00.000" )
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        "datetime": new Date( "2018-07-02T14:00:00.000" )
                    }
                ]
            };
            testServerSide.setService( key, serverRecord );

            var varName = 'datetime';
            context.updateSubformFields( options.fields.members, [ 'code', 'name', varName ] );

            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );

            // Add subform record 3
            var subformRecord3 = {
                "code": "3",
                "name": "Homer Simpson",
                "datetime": "10/02/2017 20:00"
            };
            var subformRecord3Clone = $.extend( true, {}, subformRecord3 );
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillSubformNewRow( subformRecord3Clone, 'members' );

            // Transform date instances into string
            var record = $.extend( true, {}, serverRecord );
            record.members[ 0 ][ varName ] = options.fields[ varName ].formatToClient(
                record.members[ 0 ][ varName ] );
            record.members[ 1 ][ varName ] = options.fields[ varName ].formatToClient(
                record.members[ 1 ][ varName ] );
            
            // Build edited record and check form
            var editedRecord = $.extend( true, {}, record );
            editedRecord.members.push( subformRecord3Clone );
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 4, 0, true );
            
            // Undo (1)
            editedRecord.members[ 2 ][ varName ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 3, 1, false );

            // Undo (2)
            editedRecord.members[ 2 ][ 'name' ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 2, 2, false );

            // Undo (3)
            editedRecord.members[ 2 ][ 'code' ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 1, 3, false );

            // Undo (4)
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 0, 4, false );

            // Redo (1)
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 1, 3, false );

            // Redo (2)
            editedRecord.members[ 2 ][ 'code' ] = subformRecord3[ 'code' ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 2, 2, false );

            // Redo (3)
            editedRecord.members[ 2 ][ 'name' ] = subformRecord3[ 'name' ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 3, 1, false );

            // Redo (4)
            editedRecord.members[ 2 ][ varName ] = subformRecord3[ varName ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 4, 0, false );

            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), context.getFieldBuilder().filterValues( editedRecord, options.fields ) );

            // Go to edit form again and check the form again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkForm( assert, editedRecord );

            done();
        }
    );
});

QUnit.test( "create datetime using picker test", function( assert ) {

    var done = assert.async();
    options = $.extend( true, {}, defaultTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // Setup services
            testServerSide.resetServices();
            var key = 4;
            var serverRecord =  {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "datetime": new Date( "2017-09-10T20:00:00.000" )
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        "datetime": new Date( "2018-07-02T14:00:00.000" )
                    }
                ]
            };
            testServerSide.setService( key, serverRecord );

            var varName = 'datetime';
            context.updateSubformFields( options.fields.members, [ 'code', 'name', varName ] );

            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );

            // Add subform record 3
            var subformRecord3 = {
                "code": "3",
                "name": "Homer Simpson"
            };
            var subformRecord3Clone = $.extend( true, {}, subformRecord3 );
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillSubformNewRow( subformRecord3Clone, 'members' );
            
            subformRecord3.datetime = "10/02/2017 20:10";
            testHelper.updateDatetimePickerInSubform( 
                'members', 
                varName, 
                2, 
                options.fields.members.fields[ varName ],
                subformRecord3[ varName ] );
            subformRecord3Clone = $.extend( true, {}, subformRecord3 );
            
            
            // Transform date instances into string
            var record = $.extend( true, {}, serverRecord );
            record.members[ 0 ][ varName ] = options.fields[ varName ].formatToClient(
                record.members[ 0 ][ varName ] );
            record.members[ 1 ][ varName ] = options.fields[ varName ].formatToClient(
                record.members[ 1 ][ varName ] );
            
            // Build edited record and check form
            var editedRecord = $.extend( true, {}, record );
            editedRecord.members.push( subformRecord3Clone );
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 4, 0, true );

            // Undo (1)
            editedRecord.members[ 2 ][ varName ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 3, 1, false );

            // Undo (2)
            editedRecord.members[ 2 ][ 'name' ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 2, 2, false );

            // Undo (3)
            editedRecord.members[ 2 ][ 'code' ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 1, 3, false );

            // Undo (4)
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 0, 4, false );

            // Redo (1)
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 1, 3, false );

            // Redo (2)
            editedRecord.members[ 2 ][ 'code' ] = subformRecord3[ 'code' ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 2, 2, false );

            // Redo (3)
            editedRecord.members[ 2 ][ 'name' ] = subformRecord3[ 'name' ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 3, 1, false );

            // Redo (4)
            editedRecord.members[ 2 ][ varName ] = subformRecord3[ varName ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 4, 0, false );

            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), context.getFieldBuilder().filterValues( editedRecord, options.fields ) );

            // Go to edit form again and check the form again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkForm( assert, editedRecord );

            done();
        }
    );
});

QUnit.test( "create inline datetime using picker test", function( assert ) {

    var done = assert.async();
    options = $.extend( true, {}, defaultTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // Setup services
            testServerSide.resetServices();
            var key = 4;
            var serverRecord =  {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "datetime": new Date( "2017-09-10T20:00:00.000" )
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        "datetime": new Date( "2018-07-02T14:00:00.000" )
                    }
                ]
            };
            testServerSide.setService( key, serverRecord );

            var varName = 'datetime';
            context.updateSubformFields( options.fields.members, [ 'code', 'name', varName ] );
            options.fields.members.fields[ varName ].customOptions.inline = true;
            
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );

            // Add subform record 3
            var subformRecord3 = {
                "code": "3",
                "name": "Homer Simpson"
            };
            var subformRecord3Clone = $.extend( true, {}, subformRecord3 );
            
            testHelper.clickCreateSubformRowButton( 'members' );
            
            testHelper.fillSubformNewRow( subformRecord3Clone, 'members' );
            
            subformRecord3.datetime = "10/02/2017 02:10";
            testHelper.updateDatetimePickerInSubform( 
                'members', 
                varName, 
                2, 
                options.fields.members.fields[ varName ],
                subformRecord3[ varName ] );
            subformRecord3Clone = $.extend( true, {}, subformRecord3 );
            
            // Transform date instances into string
            var record = $.extend( true, {}, serverRecord );
            record.members[ 0 ][ varName ] = options.fields[ varName ].formatToClient(
                record.members[ 0 ][ varName ] );
            record.members[ 1 ][ varName ] = options.fields[ varName ].formatToClient(
                record.members[ 1 ][ varName ] );
            
            // Build edited record and check form
            var editedRecord = $.extend( true, {}, record );
            editedRecord.members.push( subformRecord3Clone );
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 8, 0, true );

            // Undo (1)
            editedRecord.members[ 2 ][ varName ] = '';
            testHelper.clickUndoButton( 5 );
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 3, 5, false );
            
            // Undo (2)
            editedRecord.members[ 2 ][ 'name' ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 2, 6, false );
            
            // Undo (3)
            editedRecord.members[ 2 ][ 'code' ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 1, 7, false );
            
            // Undo (4)
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 0, 8, false );
            
            // Redo (1)
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 1, 7, false );

            // Redo (2)
            editedRecord.members[ 2 ][ 'code' ] = subformRecord3[ 'code' ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 2, 6, false );
            
            // Redo (3)
            editedRecord.members[ 2 ][ 'name' ] = subformRecord3[ 'name' ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 3, 5, false );
            
            // Redo (4)
            editedRecord.members[ 2 ][ varName ] = subformRecord3[ varName ];
            testHelper.clickRedoButton( 5 );
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 8, 0, false );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), context.getFieldBuilder().filterValues( editedRecord, options.fields ) );

            // Go to edit form again and check the form again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkForm( assert, editedRecord );

            done();
        }
    );
});

QUnit.test( "create date test", function( assert ) {

    var done = assert.async();
    options = $.extend( true, {}, defaultTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // Setup services
            testServerSide.resetServices();
            var key = 4;
            var serverRecord =  {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "date": new Date( "2017-09-10T00:00:00.000" )
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        "date": new Date( "2018-07-02T00:00:00.000" )
                    }
                ]
            };
            testServerSide.setService( key, serverRecord );

            var varName = 'date';
            context.updateSubformFields( options.fields.members, [ 'code', 'name', varName ] );

            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );

            // Add subform record 3
            var subformRecord3 = {
                "code": "3",
                "name": "Homer Simpson",
                "date": "10/02/2017"
            };
            var subformRecord3Clone = $.extend( true, {}, subformRecord3 );
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillSubformNewRow( subformRecord3Clone, 'members' );

            // Transform date instances into string
            var record = $.extend( true, {}, serverRecord );
            record.members[ 0 ][ varName ] = options.fields[ varName ].formatToClient(
                record.members[ 0 ][ varName ] );
            record.members[ 1 ][ varName ] = options.fields[ varName ].formatToClient(
                record.members[ 1 ][ varName ] );
            
            // Build edited record and check form
            var editedRecord = $.extend( true, {}, record );
            editedRecord.members.push( subformRecord3Clone );
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 4, 0, true );

            // Undo (1)
            editedRecord.members[ 2 ][ varName ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 3, 1, false );

            // Undo (2)
            editedRecord.members[ 2 ][ 'name' ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 2, 2, false );

            // Undo (3)
            editedRecord.members[ 2 ][ 'code' ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 1, 3, false );

            // Undo (4)
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 0, 4, false );

            // Redo (1)
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 1, 3, false );

            // Redo (2)
            editedRecord.members[ 2 ][ 'code' ] = subformRecord3[ 'code' ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 2, 2, false );

            // Redo (3)
            editedRecord.members[ 2 ][ 'name' ] = subformRecord3[ 'name' ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 3, 1, false );

            // Redo (4)
            editedRecord.members[ 2 ][ varName ] = subformRecord3[ varName ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 4, 0, false );

            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), context.getFieldBuilder().filterValues( editedRecord, options.fields ) );
            
            // Go to edit form again and check the form again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkForm( assert, editedRecord );

            done();
        }
    );
});

QUnit.test( "create date using picker test", function( assert ) {

    var done = assert.async();
    options = $.extend( true, {}, defaultTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // Setup services
            testServerSide.resetServices();
            var key = 4;
            var serverRecord =  {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "date": new Date( "2017-09-10T00:00:00.000" )
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        "date": new Date( "2018-07-02T00:00:00.000" )
                    }
                ]
            };
            testServerSide.setService( key, serverRecord );

            var varName = 'date';
            context.updateSubformFields( options.fields.members, [ 'code', 'name', varName ] );

            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );

            // Add subform record 3
            var subformRecord3 = {
                "code": "3",
                "name": "Homer Simpson"
            };
            var subformRecord3Clone = $.extend( true, {}, subformRecord3 );
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillSubformNewRow( subformRecord3Clone, 'members' );

            subformRecord3[ varName ] = "10/02/2017";
            testHelper.updateDatetimePickerInSubform( 
                'members', 
                varName, 
                2, 
                options.fields.members.fields[ varName ],
                subformRecord3[ varName ] );
            subformRecord3Clone = $.extend( true, {}, subformRecord3 );
            
            // Transform date instances into string
            var record = $.extend( true, {}, serverRecord );
            record.members[ 0 ][ varName ] = options.fields[ varName ].formatToClient(
                record.members[ 0 ][ varName ] );
            record.members[ 1 ][ varName ] = options.fields[ varName ].formatToClient(
                record.members[ 1 ][ varName ] );
            
            // Build edited record and check form
            var editedRecord = $.extend( true, {}, record );
            editedRecord.members.push( subformRecord3Clone );
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 4, 0, true );
            
            // Undo (1)
            editedRecord.members[ 2 ][ varName ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 3, 1, false );

            // Undo (2)
            editedRecord.members[ 2 ][ 'name' ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 2, 2, false );

            // Undo (3)
            editedRecord.members[ 2 ][ 'code' ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 1, 3, false );

            // Undo (4)
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 0, 4, false );

            // Redo (1)
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 1, 3, false );

            // Redo (2)
            editedRecord.members[ 2 ][ 'code' ] = subformRecord3[ 'code' ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 2, 2, false );

            // Redo (3)
            editedRecord.members[ 2 ][ 'name' ] = subformRecord3[ 'name' ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 3, 1, false );

            // Redo (4)
            editedRecord.members[ 2 ][ varName ] = subformRecord3[ varName ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 4, 0, false );

            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), context.getFieldBuilder().filterValues( editedRecord, options.fields ) );

            // Go to edit form again and check the form again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkForm( assert, editedRecord );

            done();
        }
    );
});

QUnit.test( "create inline date using picker test", function( assert ) {

    var done = assert.async();
    options = $.extend( true, {}, defaultTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // Setup services
            testServerSide.resetServices();
            var key = 4;
            var serverRecord =  {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "date": new Date( "2017-09-10T00:00:00.000" )
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        "date": new Date( "2018-07-02T00:00:00.000" )
                    }
                ]
            };
            testServerSide.setService( key, serverRecord );

            var varName = 'date';
            context.updateSubformFields( options.fields.members, [ 'code', 'name', varName ] );
            options.fields.members.fields[ varName ].customOptions.inline = true;

            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );

            // Add subform record 3
            var subformRecord3 = {
                "code": "3",
                "name": "Homer Simpson"
            };
            var subformRecord3Clone = $.extend( true, {}, subformRecord3 );

            testHelper.clickCreateSubformRowButton( 'members' );

            testHelper.fillSubformNewRow( subformRecord3Clone, 'members' );

            subformRecord3[ varName ] = "10/02/2017";
            testHelper.updateDatetimePickerInSubform( 
                'members', 
                varName, 
                2, 
                options.fields.members.fields[ varName ],
                subformRecord3[ varName ] );
            subformRecord3Clone = $.extend( true, {}, subformRecord3 );

            // Transform date instances into string
            var record = $.extend( true, {}, serverRecord );
            record.members[ 0 ][ varName ] = options.fields[ varName ].formatToClient(
                record.members[ 0 ][ varName ] );
            record.members[ 1 ][ varName ] = options.fields[ varName ].formatToClient(
                record.members[ 1 ][ varName ] );
            
            // Build edited record and check form
            var editedRecord = $.extend( true, {}, record );
            editedRecord.members.push( subformRecord3Clone );
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 4, 0, true );
            
            // Undo (1)
            editedRecord.members[ 2 ][ varName ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 3, 1, false );

            // Undo (2)
            editedRecord.members[ 2 ][ 'name' ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 2, 2, false );

            // Undo (3)
            editedRecord.members[ 2 ][ 'code' ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 1, 3, false );

            // Undo (4)
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 0, 4, false );

            // Redo (1)
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 1, 3, false );

            // Redo (2)
            editedRecord.members[ 2 ][ 'code' ] = subformRecord3[ 'code' ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 2, 2, false );

            // Redo (3)
            editedRecord.members[ 2 ][ 'name' ] = subformRecord3[ 'name' ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 3, 1, false );

            // Redo (4)
            editedRecord.members[ 2 ][ varName ] = subformRecord3[ varName ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 4, 0, false );

            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), context.getFieldBuilder().filterValues( editedRecord, options.fields ) );
            
            // Go to edit form again and check the form again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkForm( assert, editedRecord );

            done();
        }
    );
});

QUnit.test( "create time test", function( assert ) {

    var done = assert.async();
    options = $.extend( true, {}, defaultTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // Setup services
            testServerSide.resetServices();
            var key = 4;
            var serverRecord =  {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "time": "21:00"
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        "time": "14:00"
                    }
                ]
            };
            testServerSide.setService( key, serverRecord );

            var varName = 'time';
            context.updateSubformFields( options.fields.members, [ 'code', 'name', varName ] );

            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );

            // Add subform record 3
            var subformRecord3 = {
                "code": "3",
                "name": "Homer Simpson",
                "time": "02:05"
            };
            var subformRecord3Clone = $.extend( true, {}, subformRecord3 );
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillSubformNewRow( subformRecord3Clone, 'members' );

            // Build edited record and check form
            var editedRecord = $.extend( true, {}, serverRecord );
            editedRecord.members.push( subformRecord3Clone );
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 4, 0, true );
            
            // Undo (1)
            editedRecord.members[ 2 ][ varName ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 3, 1, false );

            // Undo (2)
            editedRecord.members[ 2 ][ 'name' ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 2, 2, false );

            // Undo (3)
            editedRecord.members[ 2 ][ 'code' ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 1, 3, false );

            // Undo (4)
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, serverRecord );
            testHelper.assertHistory( assert, 0, 4, false );

            // Redo (1)
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 1, 3, false );

            // Redo (2)
            editedRecord.members[ 2 ][ 'code' ] = subformRecord3[ 'code' ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 2, 2, false );

            // Redo (3)
            editedRecord.members[ 2 ][ 'name' ] = subformRecord3[ 'name' ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 3, 1, false );

            // Redo (4)
            editedRecord.members[ 2 ][ varName ] = subformRecord3[ varName ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 4, 0, false );

            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), context.getFieldBuilder().filterValues( editedRecord, options.fields ) );

            // Go to edit form again and check the form again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkForm( assert, editedRecord );

            done();
        }
    );
});

QUnit.test( "create time using picker test", function( assert ) {

    var done = assert.async();
    options = $.extend( true, {}, defaultTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // Setup services
            testServerSide.resetServices();
            var key = 4;
            var serverRecord =  {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "time": "21:00"
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        "time": "14:00"
                    }
                ]
            };
            testServerSide.setService( key, serverRecord );

            var varName = 'time';
            context.updateSubformFields( options.fields.members, [ 'code', 'name', varName ] );

            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );

            // Add subform record 3
            var subformRecord3 = {
                "code": "3",
                "name": "Homer Simpson"
                //"time": "02:05"
            };
            var subformRecord3Clone = $.extend( true, {}, subformRecord3 );
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillSubformNewRow( subformRecord3Clone, 'members' );

            subformRecord3[ varName ] = "02:05";
            testHelper.updateDatetimePickerInSubform( 
                'members', 
                varName, 
                2, 
                options.fields.members.fields[ varName ],
                subformRecord3[ varName ] );
            subformRecord3Clone = $.extend( true, {}, subformRecord3 );
            
            // Build edited record and check form
            var editedRecord = $.extend( true, {}, serverRecord );
            editedRecord.members.push( subformRecord3Clone );
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 4, 0, true );

            // Undo (1)
            editedRecord.members[ 2 ][ varName ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 3, 1, false );

            // Undo (2)
            editedRecord.members[ 2 ][ 'name' ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 2, 2, false );

            // Undo (3)
            editedRecord.members[ 2 ][ 'code' ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 1, 3, false );

            // Undo (4)
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, serverRecord );
            testHelper.assertHistory( assert, 0, 4, false );

            // Redo (1)
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 1, 3, false );

            // Redo (2)
            editedRecord.members[ 2 ][ 'code' ] = subformRecord3[ 'code' ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 2, 2, false );

            // Redo (3)
            editedRecord.members[ 2 ][ 'name' ] = subformRecord3[ 'name' ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 3, 1, false );

            // Redo (4)
            editedRecord.members[ 2 ][ varName ] = subformRecord3[ varName ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 4, 0, false );

            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), context.getFieldBuilder().filterValues( editedRecord, options.fields ) );

            // Go to edit form again and check the form again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkForm( assert, editedRecord );

            done();
        }
    );
});

QUnit.test( "create inline time using picker test", function( assert ) {

    var done = assert.async();
    options = $.extend( true, {}, defaultTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // Setup services
            testServerSide.resetServices();
            var key = 4;
            var serverRecord =  {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "time": "21:00"
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        "time": "14:00"
                    }
                ]
            };
            testServerSide.setService( key, serverRecord );

            var varName = 'time';
            context.updateSubformFields( options.fields.members, [ 'code', 'name', varName ] );
            options.fields.members.fields[ varName ].customOptions.inline = true;
            
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );

            // Add subform record 3
            var subformRecord3 = {
                "code": "3",
                "name": "Homer Simpson"
                //"time": "02:05"
            };
            var subformRecord3Clone = $.extend( true, {}, subformRecord3 );
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillSubformNewRow( subformRecord3Clone, 'members' );

            subformRecord3[ varName ] = "02:05";
            testHelper.updateDatetimePickerInSubform( 
                'members', 
                varName, 
                2, 
                options.fields.members.fields[ varName ],
                subformRecord3[ varName ] );
            subformRecord3Clone = $.extend( true, {}, subformRecord3 );
            
            // Build edited record and check form
            var editedRecord = $.extend( true, {}, serverRecord );
            editedRecord.members.push( subformRecord3Clone );
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 6, 0, true );
            
            // Undo (1)
            editedRecord.members[ 2 ][ varName ] = '';
            testHelper.clickUndoButton( 3 );
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 3, 3, false );
            
            // Undo (2)
            editedRecord.members[ 2 ][ 'name' ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 2, 4, false );

            // Undo (3)
            editedRecord.members[ 2 ][ 'code' ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 1, 5, false );

            // Undo (4)
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, serverRecord );
            testHelper.assertHistory( assert, 0, 6, false );

            // Redo (1)
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 1, 5, false );

            // Redo (2)
            editedRecord.members[ 2 ][ 'code' ] = subformRecord3[ 'code' ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 2, 4, false );

            // Redo (3)
            editedRecord.members[ 2 ][ 'name' ] = subformRecord3[ 'name' ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 3, 3, false );

            // Redo (4)
            editedRecord.members[ 2 ][ varName ] = subformRecord3[ varName ];
            testHelper.clickRedoButton( 3 );
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 6, 0, false );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), editedRecord, options.fields );

            // Go to edit form again and check the form again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkForm( assert, editedRecord );

            done();
        }
    );
});

QUnit.test( "create checkbox test", function( assert ) {

    var done = assert.async();
    options = $.extend( true, {}, defaultTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // Setup services
            testServerSide.resetServices();
            var key = 4;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "important": true
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        "important": false
                    }
                ]
            };
            testServerSide.setService( key, record );

            var varName = 'important';
            context.updateSubformFields( options.fields.members, [ 'code', 'name', varName ] );

            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );

            // Add subform record 3
            var subformRecord3 = {
                "code": "3",
                "name": "Homer Simpson",
                "important": true
            };
            var subformRecord3Clone = $.extend( true, {}, subformRecord3 );
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillSubformNewRow( subformRecord3Clone, 'members' );

            // Build edited record and check form
            var editedRecord = $.extend( true, {}, record );
            editedRecord.members.push( subformRecord3Clone );
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 4, 0, true );
            
            // Undo (1)
            editedRecord.members[ 2 ][ varName ] = false;
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 3, 1, false );
            
            // Undo (2)
            editedRecord.members[ 2 ][ 'name' ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 2, 2, false );
            
            // Undo (3)
            editedRecord.members[ 2 ][ 'code' ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 1, 3, false );

            // Undo (4)
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 0, 4, false );

            // Redo (1)
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 1, 3, false );
            
            // Redo (2)
            editedRecord.members[ 2 ][ 'code' ] = subformRecord3[ 'code' ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 2, 2, false );

            // Redo (3)
            editedRecord.members[ 2 ][ 'name' ] = subformRecord3[ 'name' ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 3, 1, false );

            // Redo (4)
            editedRecord.members[ 2 ][ varName ] = subformRecord3[ varName ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 4, 0, false );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), editedRecord );

            // Go to edit form again and check the form again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkForm( assert, editedRecord );

            done();
        }
    );
});

QUnit.test( "create radio test", function( assert ) {

    var done = assert.async();
    options = $.extend( true, {}, defaultTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // Setup services
            testServerSide.resetServices();
            var key = 4;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "phoneType": "homePhone_option"
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        "phoneType": "officePhone_option"
                    }
                ]
            };
            testServerSide.setService( key, record );

            var varName = 'phoneType';
            context.updateSubformFields( options.fields.members, [ 'code', 'name', varName ] );

            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );

            // Add subform record 3
            var subformRecord3 = {
                "code": "3",
                "name": "Homer Simpson",
                "phoneType": "cellPhone_option"
            };
            var subformRecord3Clone = $.extend( true, {}, subformRecord3 );
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillSubformNewRow( subformRecord3Clone, 'members' );

            // Build edited record and check form
            var editedRecord = $.extend( true, {}, record );
            editedRecord.members.push( subformRecord3Clone );
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 4, 0, true );
            
            // Undo (1)
            delete editedRecord.members[ 2 ][ varName ];
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 3, 1, false );
            
            // Undo (2)
            editedRecord.members[ 2 ][ 'name' ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 2, 2, false );

            // Undo (3)
            editedRecord.members[ 2 ][ 'code' ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 1, 3, false );
            
            // Undo (4)
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 0, 4, false );
            
            // Redo (1)
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 1, 3, false );

            // Redo (2)
            editedRecord.members[ 2 ][ 'code' ] = subformRecord3[ 'code' ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 2, 2, false );

            // Redo (3)
            editedRecord.members[ 2 ][ 'name' ] = subformRecord3[ 'name' ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 3, 1, false );
            
            // Redo (4)
            editedRecord.members[ 2 ][ varName ] = subformRecord3[ varName ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 4, 0, false );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), editedRecord );

            // Go to edit form again and check the form again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkForm( assert, editedRecord );

            done();
        }
    );
});

QUnit.test( "create select test", function( assert ) {

    var done = assert.async();
    options = $.extend( true, {}, defaultTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // Setup services
            testServerSide.resetServices();
            var key = 4;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "province": "Cádiz"
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        "province": "Málaga"
                    }
                ]
            };
            testServerSide.setService( key, record );

            var varName = 'province';
            context.updateSubformFields( options.fields.members, [ 'code', 'name', varName ] );

            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );

            // Add subform record 3
            var subformRecord3 = {
                "code": "3",
                "name": "Homer Simpson",
                "province": "Cádiz"
            };
            var subformRecord3Clone = $.extend( true, {}, subformRecord3 );
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillSubformNewRow( subformRecord3Clone, 'members' );

            // Build edited record and check form
            var editedRecord = $.extend( true, {}, record );
            editedRecord.members.push( subformRecord3Clone );
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 4, 0, true );
            
            // Undo (1)
            editedRecord.members[ 2 ][ varName ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 3, 1, false );
            
            // Undo (2)
            editedRecord.members[ 2 ][ 'name' ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 2, 2, false );

            // Undo (3)
            editedRecord.members[ 2 ][ 'code' ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 1, 3, false );

            // Undo (4)
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 0, 4, false );

            // Redo (1)
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 1, 3, false );

            // Redo (2)
            editedRecord.members[ 2 ][ 'code' ] = subformRecord3[ 'code' ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 2, 2, false );

            // Redo (3)
            editedRecord.members[ 2 ][ 'name' ] = subformRecord3[ 'name' ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 3, 1, false );

            // Redo (4)
            editedRecord.members[ 2 ][ varName ] = subformRecord3[ varName ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 4, 0, false );

            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), editedRecord );

            // Go to edit form again and check the form again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkForm( assert, editedRecord );

            done();
        }
    );
});

QUnit.test( "create 2 linked select test", function( assert ) {

    var done = assert.async();
    options = $.extend( true, {}, defaultTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // Setup services
            testServerSide.resetServices();
            var key = 4;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "province": "Cádiz",
                        "city": "Algeciras"
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        "province": "Málaga",
                        "city": "Marbella"
                    }
                ]
            };
            testServerSide.setService( key, record );

            var varName = 'province';
            var varName2 = 'city';
            context.updateSubformFields( options.fields.members, [ 'code', 'name', varName, varName2 ] );

            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );

            // Add subform record 3
            var subformRecord3 = {
                "code": "3",
                "name": "Homer Simpson",
                "province": "Cádiz",
                "city": "Tarifa"
            };
            var subformRecord3Clone = $.extend( true, {}, subformRecord3 );
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillSubformNewRow( subformRecord3Clone, 'members' );
            
            // Build edited record and check form
            var editedRecord = $.extend( true, {}, record );
            editedRecord.members.push( subformRecord3Clone );
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 5, 0, true );
            
            // Undo (1)
            editedRecord.members[ 2 ][ varName2 ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 4, 1, false );
            
            // Undo (2)
            editedRecord.members[ 2 ][ varName ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 3, 2, false );
            
            // Undo (3)
            editedRecord.members[ 2 ][ 'name' ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 2, 3, false );
            
            // Undo (4)
            editedRecord.members[ 2 ][ 'code' ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 1, 4, false );
            
            // Undo (5)
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 0, 5, false );
            
            // Redo (1)
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 1, 4, false );
            
            // Redo (2)
            editedRecord.members[ 2 ][ 'code' ] = subformRecord3[ 'code' ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 2, 3, false );
            
            // Redo (3)
            editedRecord.members[ 2 ][ 'name' ] = subformRecord3[ 'name' ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 3, 2, false );
            
            // Redo (4)
            editedRecord.members[ 2 ][ varName ] = subformRecord3[ varName ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 4, 1, false );
            
            // Redo (4)
            editedRecord.members[ 2 ][ varName2 ] = subformRecord3[ varName2 ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 5, 0, false );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), editedRecord );

            // Go to edit form again and check the form again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkForm( assert, editedRecord );

            done();
        }
    );
});

QUnit.test( "create datalist test", function( assert ) {

    var done = assert.async();
    options = $.extend( true, {}, defaultTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // Setup services
            testServerSide.resetServices();
            var key = 4;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "browser": "Firefox"
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        "browser": "Internet Explorer"
                    }
                ]
            };
            testServerSide.setService( key, record );

            var varName = 'browser';
            context.updateSubformFields( options.fields.members, [ 'code', 'name', varName ] );

            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );

            // Add subform record 3
            var subformRecord3 = {
                "code": "3",
                "name": "Homer Simpson",
                "browser": "Firefox"
            };
            var subformRecord3Clone = $.extend( true, {}, subformRecord3 );
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillSubformNewRow( subformRecord3Clone, 'members' );

            // Build edited record and check form
            var editedRecord = $.extend( true, {}, record );
            editedRecord.members.push( subformRecord3Clone );
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 4, 0, true );

            // Undo (1)
            editedRecord.members[ 2 ][ varName ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 3, 1, false );

            // Undo (2)
            editedRecord.members[ 2 ][ 'name' ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 2, 2, false );

            // Undo (3)
            editedRecord.members[ 2 ][ 'code' ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 1, 3, false );

            // Undo (4)
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 0, 4, false );

            // Redo (1)
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 1, 3, false );

            // Redo (2)
            editedRecord.members[ 2 ][ 'code' ] = subformRecord3[ 'code' ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 2, 2, false );

            // Redo (3)
            editedRecord.members[ 2 ][ 'name' ] = subformRecord3[ 'name' ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 3, 1, false );

            // Redo (4)
            editedRecord.members[ 2 ][ varName ] = subformRecord3[ varName ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 4, 0, false );

            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), editedRecord );

            // Go to edit form again and check the form again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkForm( assert, editedRecord );

            done();
        }
    );
});

QUnit.test( "create checkboxes test", function( assert ) {

    var done = assert.async();
    options = $.extend( true, {}, defaultTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // Setup services
            testServerSide.resetServices();
            var key = 4;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "hobbies": [ 'reading_option', 'videogames_option' ]
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        "hobbies": [ 'reading_option', 'cards_option' ]
                    }
                ]
            };
            testServerSide.setService( key, record );

            var varName = 'hobbies';
            context.updateSubformFields( options.fields.members, [ 'code', 'name', varName ] );

            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );

            // Add subform record 3
            var subformRecord3 = {
                "code": "3",
                "name": "Homer Simpson",
                "hobbies": [ 'sports_option', 'cards_option' ]
            };
            var subformRecord3Clone = $.extend( true, {}, subformRecord3 );
            testHelper.clickCreateSubformRowButton( 'members' );
            testHelper.fillSubformNewRow( subformRecord3Clone, 'members' );

            // Build edited record and check form
            var editedRecord = $.extend( true, {}, record );
            editedRecord.members.push( subformRecord3Clone );
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 5, 0, true );
            
            // Undo (1) (2 times)
            delete editedRecord.members[ 2 ][ varName ];
            testHelper.clickUndoButton( 2 );
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 3, 2, false );
            
            // Undo (2)
            editedRecord.members[ 2 ][ 'name' ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 2, 3, false );
            
            // Undo (3)
            editedRecord.members[ 2 ][ 'code' ] = '';
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 1, 4, false );
            
            // Undo (4)
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 0, 5, false );
            
            // Redo (1)
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 1, 4, false );
            
            // Redo (2)
            editedRecord.members[ 2 ][ 'code' ] = subformRecord3[ 'code' ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 2, 3, false );
            
            // Redo (3)
            editedRecord.members[ 2 ][ 'name' ] = subformRecord3[ 'name' ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 3, 2, false );
            
            // Redo (4) (2 times)
            editedRecord.members[ 2 ][ varName ] = subformRecord3[ varName ];
            testHelper.clickRedoButton( 2 );
            testHelper.checkForm( assert, editedRecord );
            testHelper.assertHistory( assert, 5, 0, false );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), editedRecord );

            // Go to edit form again and check the form again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkForm( assert, editedRecord );

            done();
        }
    );
});
