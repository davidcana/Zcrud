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
            inline: false
        },
        datetime: {
            type: 'datetime',
            inline: false
        },
        date: {
            type: 'date',
            inline: false
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
            options: [ 'Cádiz', 'Málaga' ],
            defaultValue: 'Cádiz'
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
        inline: false
    },
    datetime: {
        type: 'datetime',
        inline: false
    },
    date: {
        type: 'date',
        inline: false
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
        options: [ 'Cádiz', 'Málaga' ],
        defaultValue: 'Cádiz'
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
QUnit.test( "update text area test", function( assert ) {

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
            var editedRecord =  {
                "members": {
                    "1": {
                        "description": "Description of Lisa Simpson edited"
                    }
                }
            };
            testHelper.fillForm( editedRecord );
            
            // Check form
            var newRecord = $.extend( true, {}, record );
            newRecord.members[ 1 ][ varName ] = editedRecord.members[ 1 ][ varName ];
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            // Undo
            var tempRecord = $.extend( true, {} , newRecord );
            tempRecord.members[ 1 ][ varName ] = record.members[ 1 ][ varName ];
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 0, 1, false );
            
            // Redo
            tempRecord = $.extend( true, {} , newRecord );
            newRecord.members[ 1 ][ varName ] = editedRecord.members[ 1 ][ varName ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 1, 0, false );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), newRecord );

            // Go to edit form again and check the form again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkForm( assert, newRecord );

            done();
        }
    );
});

QUnit.test( "update datetime test", function( assert ) {

    var done = assert.async();
    options = $.extend( true, {}, defaultTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // Setup services
            testServerSide.resetServices();
            var key = 4;
            var serverRecord = {
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

            context.updateSubformFields( options.fields.members, [ 'code', 'name', 'datetime' ] );

            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );
            
            // Go to edit form
            testHelper.clickUpdateListButton( key );
            
            // Edit record
            var varName = "datetime";
            var editedRecord =  {
                "members": {
                    "1": {
                        "datetime": "10/02/2017 20:00"
                    }
                }
            };
            testHelper.fillForm( editedRecord );
            
            // Transform date instances into string
            var record = $.extend( true, {}, serverRecord );
            record.members[ 0 ][ varName ] = options.fields[ varName ].formatToClient(
                record.members[ 0 ][ varName ] );
            record.members[ 1 ][ varName ] = options.fields[ varName ].formatToClient(
                record.members[ 1 ][ varName ] );
            
            // Check form
            var newRecord = $.extend( true, {}, record );
            newRecord.members[ 1 ][ varName ] = editedRecord.members[ 1 ][ varName ];
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );
            
            // Undo
            var tempRecord = $.extend( true, {} , newRecord );
            tempRecord.members[ 1 ][ varName ] = record.members[ 1 ][ varName ];
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 0, 1, false );
            
            // Redo
            tempRecord = $.extend( true, {} , newRecord );
            newRecord.members[ 1 ][ varName ] = editedRecord.members[ 1 ][ varName ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 1, 0, false );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();
            
            // Check storage
            assert.deepEqual( testServerSide.getService( key ), context.getFieldBuilder().filterValues( newRecord, options.fields ) );
            
            // Go to edit form again and check the form again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkForm( assert, newRecord );

            done();
        }
    );
});


QUnit.test( "update datetime using picker test", function( assert ) {

    var done = assert.async();
    options = $.extend( true, {}, defaultTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // Setup services
            testServerSide.resetServices();
            var key = 4;
            var serverRecord = {
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

            // Edit record
            var editedRecord =  {
                "members": {
                    "1": {
                        "datetime": "10/02/2017 20:10"
                    }
                }
            };
            testHelper.updateDatetimePickerInSubform( 
                'members', 
                varName, 
                1, 
                options.fields.members.fields[ varName ],
                editedRecord.members[ 1 ][ varName ] );

            // Transform date instances into string
            var record = $.extend( true, {}, serverRecord );
            record.members[ 0 ][ varName ] = options.fields[ varName ].formatToClient(
                record.members[ 0 ][ varName ] );
            record.members[ 1 ][ varName ] = options.fields[ varName ].formatToClient(
                record.members[ 1 ][ varName ] );
            
            // Check form
            var newRecord = $.extend( true, {}, record );
            newRecord.members[ 1 ][ varName ] = editedRecord.members[ 1 ][ varName ];
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );
            
            // Undo
            var tempRecord = $.extend( true, {} , newRecord );
            tempRecord.members[ 1 ][ varName ] = record.members[ 1 ][ varName ];
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            tempRecord = $.extend( true, {} , newRecord );
            newRecord.members[ 1 ][ varName ] = editedRecord.members[ 1 ][ varName ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 1, 0, false );

            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), context.getFieldBuilder().filterValues( newRecord, options.fields ) );

            // Go to edit form again and check the form again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkForm( assert, newRecord );

            done();
        }
    );
});

QUnit.test( "update inline datetime using picker test", function( assert ) {

    var done = assert.async();
    options = $.extend( true, {}, defaultTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // Setup services
            testServerSide.resetServices();
            var key = 4;
            var serverRecord = {
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
                        "datetime": new Date( "2016-07-02T14:00:00.000" )
                    }
                ]
            };
            testServerSide.setService( key, serverRecord );

            context.updateSubformFields( options.fields.members, [ 'code', 'name', 'datetime' ] );
            
            options.fields.members.fields.datetime.inline = true;
            
            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );

            // Edit record
            var varName = "datetime";
            var editedRecord =  {
                "members": {
                    "1": {
                        "datetime": "09/02/2017 17:10"
                    }
                }
            };
            
            testHelper.updateDatetimePickerInSubform( 
                'members', 
                'datetime', 
                1, 
                options.fields.members.fields[ varName ],
                editedRecord.members[ 1 ][ varName ] );
            
            // Transform date instances into string
            var record = $.extend( true, {}, serverRecord );
            record.members[ 0 ][ varName ] = options.fields[ varName ].formatToClient(
                record.members[ 0 ][ varName ] );
            record.members[ 1 ][ varName ] = options.fields[ varName ].formatToClient(
                record.members[ 1 ][ varName ] );
            
            // Check form
            var numberOfActions = 6;
            var newRecord = $.extend( true, {}, record );
            newRecord.members[ 1 ][ varName ] = editedRecord.members[ 1 ][ varName ];
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, numberOfActions, 0, true );
            
            // Undo
            var tempRecord = $.extend( true, {} , newRecord );
            tempRecord.members[ 1 ][ varName ] = record.members[ 1 ][ varName ];
            testHelper.clickUndoButton( numberOfActions );
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 0, numberOfActions, false );
            
            // Redo
            tempRecord = $.extend( true, {} , newRecord );
            newRecord.members[ 1 ][ varName ] = editedRecord.members[ 1 ][ varName ];
            testHelper.clickRedoButton( numberOfActions );
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, numberOfActions, 0, false );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), context.getFieldBuilder().filterValues( newRecord, options.fields ) );

            // Go to edit form again and check the form again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkForm( assert, newRecord );

            done();
        }
    );
});

QUnit.test( "update date test", function( assert ) {

    var done = assert.async();
    options = $.extend( true, {}, defaultTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // Setup services
            testServerSide.resetServices();
            var key = 4;
            var serverRecord = {
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

            context.updateSubformFields( options.fields.members, [ 'code', 'name', 'date' ] );

            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );

            // Edit record
            var varName = "date";
            var editedRecord =  {
                "members": {
                    "1": {
                        "date": "10/02/2017"
                    }
                }
            };
            testHelper.fillForm( editedRecord );

            // Transform date instances into string
            var record = $.extend( true, {}, serverRecord );
            record.members[ 0 ][ varName ] = options.fields[ varName ].formatToClient(
                record.members[ 0 ][ varName ] );
            record.members[ 1 ][ varName ] = options.fields[ varName ].formatToClient(
                record.members[ 1 ][ varName ] );
            
            // Check form
            var newRecord = $.extend( true, {}, record );
            newRecord.members[ 1 ][ varName ] = editedRecord.members[ 1 ][ varName ];
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );
            
            // Undo
            var tempRecord = $.extend( true, {} , newRecord );
            tempRecord.members[ 1 ][ varName ] = record.members[ 1 ][ varName ];
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            tempRecord = $.extend( true, {} , newRecord );
            newRecord.members[ 1 ][ varName ] = editedRecord.members[ 1 ][ varName ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 1, 0, false );

            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), context.getFieldBuilder().filterValues( newRecord, options.fields ) ); 

            // Go to edit form again and check the form again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkForm( assert, newRecord );

            done();
        }
    );
});

QUnit.test( "update date using picker test", function( assert ) {

    var done = assert.async();
    options = $.extend( true, {}, defaultTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // Setup services
            testServerSide.resetServices();
            var key = 4;
            var serverRecord = {
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

            var varName = "date";
            context.updateSubformFields( options.fields.members, [ 'code', 'name', varName ] );

            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );

            // Edit record
            var editedRecord =  {
                "members": {
                    "1": {
                        "date": "10/02/2017"
                    }
                }
            };
            
            testHelper.updateDatetimePickerInSubform( 
                'members', 
                varName, 
                1, 
                options.fields.members.fields[ varName ],
                editedRecord.members[ 1 ][ varName ] );
            
            // Transform date instances into string
            var record = $.extend( true, {}, serverRecord );
            record.members[ 0 ][ varName ] = options.fields[ varName ].formatToClient(
                record.members[ 0 ][ varName ] );
            record.members[ 1 ][ varName ] = options.fields[ varName ].formatToClient(
                record.members[ 1 ][ varName ] );
            
            // Check form
            var newRecord = $.extend( true, {}, record );
            newRecord.members[ 1 ][ varName ] = editedRecord.members[ 1 ][ varName ];
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );
            
            // Undo
            var tempRecord = $.extend( true, {} , newRecord );
            tempRecord.members[ 1 ][ varName ] = record.members[ 1 ][ varName ];
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            tempRecord = $.extend( true, {} , newRecord );
            newRecord.members[ 1 ][ varName ] = editedRecord.members[ 1 ][ varName ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 1, 0, false );

            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), context.getFieldBuilder().filterValues( newRecord, options.fields ) ); 

            // Go to edit form again and check the form again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkForm( assert, newRecord );

            done();
        }
    );
});

QUnit.test( "update inline date using picker test", function( assert ) {

    var done = assert.async();
    options = $.extend( true, {}, defaultTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // Setup services
            testServerSide.resetServices();
            var key = 4;
            var serverRecord = {
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
            
            var varName = "date";
            context.updateSubformFields( options.fields.members, [ 'code', 'name', varName ] );
            options.fields.members.fields[ varName ].inline = true;

            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );

            // Edit record

            var editedRecord =  {
                "members": {
                    "1": {
                        "date": "09/02/2017"
                    }
                }
            };

            testHelper.updateDatetimePickerInSubform( 
                'members', 
                varName, 
                1, 
                options.fields.members.fields[ varName ],
                editedRecord.members[ 1 ][ varName ] );

            // Transform date instances into string
            var record = $.extend( true, {}, serverRecord );
            record.members[ 0 ][ varName ] = options.fields[ varName ].formatToClient(
                record.members[ 0 ][ varName ] );
            record.members[ 1 ][ varName ] = options.fields[ varName ].formatToClient(
                record.members[ 1 ][ varName ] );
            
            // Check form
            var numberOfActions = 1;
            var newRecord = $.extend( true, {}, record );
            newRecord.members[ 1 ][ varName ] = editedRecord.members[ 1 ][ varName ];
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, numberOfActions, 0, true );

            // Undo
            var tempRecord = $.extend( true, {} , newRecord );
            tempRecord.members[ 1 ][ varName ] = record.members[ 1 ][ varName ];
            testHelper.clickUndoButton( numberOfActions );
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 0, numberOfActions, false );

            // Redo
            tempRecord = $.extend( true, {} , newRecord );
            newRecord.members[ 1 ][ varName ] = editedRecord.members[ 1 ][ varName ];
            testHelper.clickRedoButton( numberOfActions );
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, numberOfActions, 0, false );

            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), context.getFieldBuilder().filterValues( newRecord, options.fields ) ); 

            // Go to edit form again and check the form again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkForm( assert, newRecord );

            done();
        }
    );
});

QUnit.test( "update time test", function( assert ) {

    var done = assert.async();
    options = $.extend( true, {}, defaultTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // Setup services
            testServerSide.resetServices();
            var key = 4;
            var serverRecord = {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "time": "20:00"
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        "time": "14:00"
                    }
                ]
            };
            testServerSide.setService( key, serverRecord );

            var varName = "time";
            context.updateSubformFields( options.fields.members, [ 'code', 'name', varName ] );

            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );

            // Edit record
            var editedRecord =  {
                "members": {
                    "1": {
                        "time": "18:00"
                    }
                }
            };
            testHelper.fillForm( editedRecord );

            // Transform date instances into string
            var record = $.extend( true, {}, serverRecord );
            record.members[ 0 ][ varName ] = options.fields[ varName ].formatToClient(
                record.members[ 0 ][ varName ] );
            record.members[ 1 ][ varName ] = options.fields[ varName ].formatToClient(
                record.members[ 1 ][ varName ] );
            
            // Check form
            var newRecord = $.extend( true, {}, record );
            newRecord.members[ 1 ][ varName ] = editedRecord.members[ 1 ][ varName ];
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );
            
            // Undo
            var tempRecord = $.extend( true, {} , newRecord );
            tempRecord.members[ 1 ][ varName ] = record.members[ 1 ][ varName ];
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            tempRecord = $.extend( true, {} , newRecord );
            newRecord.members[ 1 ][ varName ] = editedRecord.members[ 1 ][ varName ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 1, 0, false );

            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), context.getFieldBuilder().filterValues( newRecord, options.fields ) );

            // Go to edit form again and check the form again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkForm( assert, newRecord );

            done();
        }
    );
});

QUnit.test( "update time using picker test", function( assert ) {

    var done = assert.async();
    options = $.extend( true, {}, defaultTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // Setup services
            testServerSide.resetServices();
            var key = 4;
            var serverRecord = {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "time": "20:00"
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        "time": "14:00"
                    }
                ]
            };
            testServerSide.setService( key, serverRecord );
            
            var varName = "time";
            context.updateSubformFields( options.fields.members, [ 'code', 'name', varName ] );

            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );

            // Edit record
            var editedRecord =  {
                "members": {
                    "1": {
                        "time": "19:15"
                    }
                }
            };
            testHelper.updateDatetimePickerInSubform( 
                'members', 
                varName, 
                1, 
                options.fields.members.fields[ varName ],
                editedRecord.members[ 1 ][ varName ] );

            // Transform date instances into string
            var record = $.extend( true, {}, serverRecord );
            record.members[ 0 ][ varName ] = options.fields[ varName ].formatToClient(
                record.members[ 0 ][ varName ] );
            record.members[ 1 ][ varName ] = options.fields[ varName ].formatToClient(
                record.members[ 1 ][ varName ] );
            
            // Check form
            var newRecord = $.extend( true, {}, record );
            newRecord.members[ 1 ][ varName ] = editedRecord.members[ 1 ][ varName ];
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            // Undo
            var tempRecord = $.extend( true, {} , newRecord );
            tempRecord.members[ 1 ][ varName ] = record.members[ 1 ][ varName ];
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            tempRecord = $.extend( true, {} , newRecord );
            newRecord.members[ 1 ][ varName ] = editedRecord.members[ 1 ][ varName ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 1, 0, false );

            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), context.getFieldBuilder().filterValues( newRecord, options.fields ) );

            // Go to edit form again and check the form again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkForm( assert, newRecord );

            done();
        }
    );
});

QUnit.test( "update inline time using picker test", function( assert ) {

    var done = assert.async();
    options = $.extend( true, {}, defaultTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // Setup services
            testServerSide.resetServices();
            var key = 4;
            var serverRecord = {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "time": "20:00"
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        "time": "14:00"
                    }
                ]
            };
            testServerSide.setService( key, serverRecord );

            var varName = "time";
            context.updateSubformFields( options.fields.members, [ 'code', 'name', varName ] );
            options.fields.members.fields[ varName ].inline = true;

            errorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            testHelper.clickUpdateListButton( key );

            // Edit record
            var editedRecord =  {
                "members": {
                    "1": {
                        "time": "13:05"
                    }
                }
            };

            testHelper.updateDatetimePickerInSubform( 
                'members', 
                varName, 
                1, 
                options.fields.members.fields[ varName ],
                editedRecord.members[ 1 ][ varName ] );
            
            // Transform date instances into string
            var record = $.extend( true, {}, serverRecord );
            record.members[ 0 ][ varName ] = options.fields[ varName ].formatToClient(
                record.members[ 0 ][ varName ] );
            record.members[ 1 ][ varName ] = options.fields[ varName ].formatToClient(
                record.members[ 1 ][ varName ] );
            
            // Check form
            var numberOfActions = 2;
            var newRecord = $.extend( true, {}, record );
            newRecord.members[ 1 ][ varName ] = editedRecord.members[ 1 ][ varName ];
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, numberOfActions, 0, true );

            // Undo
            var tempRecord = $.extend( true, {} , newRecord );
            tempRecord.members[ 1 ][ varName ] = record.members[ 1 ][ varName ];
            testHelper.clickUndoButton( numberOfActions );
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 0, numberOfActions, false );

            // Redo
            tempRecord = $.extend( true, {} , newRecord );
            newRecord.members[ 1 ][ varName ] = editedRecord.members[ 1 ][ varName ];
            testHelper.clickRedoButton( numberOfActions );
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, numberOfActions, 0, false );

            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), newRecord );

            // Go to edit form again and check the form again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkForm( assert, newRecord );

            done();
        }
    );
});

QUnit.test( "update checkbox test", function( assert ) {

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
                        "important": false
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        "important": true
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
            var editedRecord =  {
                "members": {
                    "1": {
                        "important": false
                    }
                }
            };
            testHelper.fillForm( editedRecord );
            
            // Check form
            var newRecord = $.extend( true, {}, record );
            newRecord.members[ 1 ][ varName ] = editedRecord.members[ 1 ][ varName ];
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );
            
            // Undo
            var tempRecord = $.extend( true, {} , newRecord );
            tempRecord.members[ 1 ][ varName ] = record.members[ 1 ][ varName ];
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            tempRecord = $.extend( true, {} , newRecord );
            newRecord.members[ 1 ][ varName ] = editedRecord.members[ 1 ][ varName ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 1, 0, false );

            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), newRecord );

            // Go to edit form again and check the form again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkForm( assert, newRecord );

            done();
        }
    );
});

QUnit.test( "update radio test", function( assert ) {

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
            var editedRecord =  {
                "members": {
                    "1": {
                        "phoneType": "cellPhone_option"
                    }
                }
            };
            testHelper.fillForm( editedRecord );

            // Check form
            var newRecord = $.extend( true, {}, record );
            newRecord.members[ 1 ][ varName ] = editedRecord.members[ 1 ][ varName ];
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );
            
            // Undo
            var tempRecord = $.extend( true, {} , newRecord );
            tempRecord.members[ 1 ][ varName ] = record.members[ 1 ][ varName ];
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 0, 1, false );
            
            // Redo
            tempRecord = $.extend( true, {} , newRecord );
            newRecord.members[ 1 ][ varName ] = editedRecord.members[ 1 ][ varName ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 1, 0, false );

            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), newRecord );

            // Go to edit form again and check the form again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkForm( assert, newRecord );

            done();
        }
    );
});

QUnit.test( "update select test", function( assert ) {

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
            var editedRecord =  {
                "members": {
                    "1": {
                        "province": "Cádiz"
                    }
                }
            };
            testHelper.fillForm( editedRecord );

            // Check form
            var newRecord = $.extend( true, {}, record );
            newRecord.members[ 1 ][ varName ] = editedRecord.members[ 1 ][ varName ];
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            // Undo
            var tempRecord = $.extend( true, {} , newRecord );
            tempRecord.members[ 1 ][ varName ] = record.members[ 1 ][ varName ];
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            tempRecord = $.extend( true, {} , newRecord );
            newRecord.members[ 1 ][ varName ] = editedRecord.members[ 1 ][ varName ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 1, 0, false );

            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), newRecord );

            // Go to edit form again and check the form again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkForm( assert, newRecord );

            done();
        }
    );
});

QUnit.test( "update 2 linked select test", function( assert ) {

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
            var editedRecord =  {
                "members": {
                    "1": {
                        "province": "Cádiz",
                        "city": "Tarifa"
                    }
                }
            };
            testHelper.fillForm( editedRecord );
            
            // Check form
            var newRecord = $.extend( true, {}, record );
            newRecord.members[ 1 ][ varName ] = editedRecord.members[ 1 ][ varName ];
            newRecord.members[ 1 ][ varName2 ] = editedRecord.members[ 1 ][ varName2 ];
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 2, 0, true );
            
            assert.deepEqual(
                testHelper.getSelectOptions( 'members-city', testHelper.get$SubFormFieldRow( 'members', 0 ) ),
                [ 'Algeciras', 'Tarifa' ] );
            assert.deepEqual(
                testHelper.getSelectOptions( 'members-city', testHelper.get$SubFormFieldRow( 'members', 1 ) ),
                [ 'Algeciras', 'Tarifa' ] );
            
            // Undo (1)
            var tempRecord = $.extend( true, {} , record );
            tempRecord.members[ 1 ][ varName ] = editedRecord.members[ 1 ][ varName ];
            delete tempRecord.members[ 1 ][ varName2 ];
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 1, 1, false );
            assert.deepEqual(
                testHelper.getSelectOptions( 'members-city', testHelper.get$SubFormFieldRow( 'members', 0 ) ),
                [ 'Algeciras', 'Tarifa' ] );
            assert.deepEqual(
                testHelper.getSelectOptions( 'members-city', testHelper.get$SubFormFieldRow( 'members', 1 ) ),
                [ 'Algeciras', 'Tarifa' ] );
            
            // Undo (2)
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, record );
            testHelper.assertHistory( assert, 0, 2, false );
            assert.deepEqual(
                testHelper.getSelectOptions( 'members-city', testHelper.get$SubFormFieldRow( 'members', 0 ) ),
                [ 'Algeciras', 'Tarifa' ] );
            assert.deepEqual(
                testHelper.getSelectOptions( 'members-city', testHelper.get$SubFormFieldRow( 'members', 1 ) ),
                [ 'Estepona', 'Marbella' ] );
            
            // Redo (1)
            tempRecord.members[ 1 ][ varName2 ] = "";
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 1, 1, false );
            assert.deepEqual(
                testHelper.getSelectOptions( 'members-city', testHelper.get$SubFormFieldRow( 'members', 0 ) ),
                [ 'Algeciras', 'Tarifa' ] );
            assert.deepEqual(
                testHelper.getSelectOptions( 'members-city', testHelper.get$SubFormFieldRow( 'members', 1 ) ),
                [ 'Algeciras', 'Tarifa' ] );
            
            // Redo (2)
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 2, 0, false );
            assert.deepEqual(
                testHelper.getSelectOptions( 'members-city', testHelper.get$SubFormFieldRow( 'members', 0 ) ),
                [ 'Algeciras', 'Tarifa' ] );
            assert.deepEqual(
                testHelper.getSelectOptions( 'members-city', testHelper.get$SubFormFieldRow( 'members', 1 ) ),
                [ 'Algeciras', 'Tarifa' ] );
            
            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), newRecord );

            // Go to edit form again and check the form again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkForm( assert, newRecord );

            done();
        }
    );
});

QUnit.test( "update datalist test", function( assert ) {

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
            var editedRecord =  {
                "members": {
                    "1": {
                        "browser": "Firefox"
                    }
                }
            };
            testHelper.fillForm( editedRecord );
            
            // Check form
            var newRecord = $.extend( true, {}, record );
            newRecord.members[ 1 ][ varName ] = editedRecord.members[ 1 ][ varName ];
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            // Undo
            var tempRecord = $.extend( true, {} , newRecord );
            tempRecord.members[ 1 ][ varName ] = record.members[ 1 ][ varName ];
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            tempRecord = $.extend( true, {} , newRecord );
            newRecord.members[ 1 ][ varName ] = editedRecord.members[ 1 ][ varName ];
            testHelper.clickRedoButton();
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 1, 0, false );

            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), newRecord );

            // Go to edit form again and check the form again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkForm( assert, newRecord );

            done();
        }
    );
});

QUnit.test( "update chackboxes test", function( assert ) {

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
            var editedRecord =  {
                "members": {
                    "1": {
                        "hobbies": [ 'sports_option', 'cards_option' ]
                    }
                }
            };
            testHelper.fillForm( editedRecord );

            // Check form
            var newRecord = $.extend( true, {}, record );
            newRecord.members[ 1 ][ varName ] = editedRecord.members[ 1 ][ varName ];
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 2, 0, true );
            
            // Undo (2 times)
            var tempRecord = $.extend( true, {} , newRecord );
            tempRecord.members[ 1 ][ varName ] = record.members[ 1 ][ varName ];
            testHelper.clickUndoButton( 2 );
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 0, 2, false );
            
            // Redo (2 times)
            tempRecord = $.extend( true, {} , newRecord );
            newRecord.members[ 1 ][ varName ] = editedRecord.members[ 1 ][ varName ];
            testHelper.clickRedoButton( 2 );
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 2, 0, false );

            // Submit and show the list again
            testHelper.clickFormSubmitButton();

            // Check storage
            assert.deepEqual( testServerSide.getService( key ), newRecord );

            // Go to edit form again and check the form again
            assert.equal( errorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( errorFunctionCounter, 0 );
            testHelper.checkForm( assert, newRecord );

            done();
        }
    );
});
