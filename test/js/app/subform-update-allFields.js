"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var fieldBuilder = require( '../../../js/app/fields/fieldBuilder.js' );
var Qunit = require( 'qunit' );
var testHelper = require( './testHelper.js' );
var testUtils = require( './testUtils.js' );
var context = require( '../../../js/app/context.js' );
var log4javascript = require( 'log4javascript' );
var datetimeFieldManager = require( '../../../js/app/fields/datetimeFieldManager.js' );

var defaultTestOptions = {

    entityId: 'department',
    saveUserPreferences: false,

    pages: {
        list: {
            action: 'http://localhost:8080/cerbero/CRUDManager.do?cmd=LIST&table=department',
            components: {
                paging: {
                    isOn: true,
                    defaultPageSize: 10,
                    pageSizes: [10, 25, 50, 100, 250, 500],
                    pageSizeChangeArea: true,
                    gotoPageArea: 'combobox', // possible values: 'textbox', 'combobox', 'none'
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
        }, create: {
            //action: 'http://localhost:8080/cerbero/CRUDManager.do?cmd=CREATE&table=department'
        }, update: {
            //action: 'http://localhost:8080/cerbero/CRUDManager.do?cmd=UPDATE&table=department'
        }, delete: {
            //action: 'http://localhost:8080/cerbero/CRUDManager.do?cmd=DELETE&table=department'
        }
    },

    defaultFormConf: {
        action: 'http://localhost:8080/cerbero/CRUDManager.do?cmd=BATCH_UPDATE&table=department',
        dataToSend: 'modified'
    },

    fields: {
        id: {
            key: true,
            create: true,
            edit: true,
            delete: true,
            sorting: false
        },
        name: {
            width: '90%'
        },
        description: {
            list: false,
            type: 'textarea',
            formFieldAttributes: {
                rows: 6,
                cols: 80
            }
        },
        time: {
            list: false,
            type: 'time',
            customOptions: {
                inline: false
            }
        },
        datetime: {
            list: false,
            type: 'datetime',
            customOptions: {
                inline: false
            }
        },
        date: {
            list: false,
            type: 'date',
            customOptions: {
                inline: false
            }
        },
        phoneType: {
            list: false,
            type: 'radio',
            translateOptions: true,
            options: function(){
                return [ 'homePhone_option', 'officePhone_option', 'cellPhone_option' ];
            }
        },
        province: {
            list: false,
            type: 'select',
            options: [ 'Cádiz', 'Málaga' ],
            defaultValue: 'Cádiz'
        },
        city: {
            list: false,
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
            list: false,
            type: 'datalist',
            options: [ 'Internet Explorer', 'Firefox', 'Chrome', 'Opera', 'Safari' ]
        },
        important: {
            list: false,
            type: 'checkbox'
        },
        number: {
            list: false
        },
        members: {
            list: false,
            type: 'subform',
            fields: { 
                code: { 
                    subformKey: true
                },
                name: { },
                description: {
                    type: 'textarea',
                    formFieldAttributes: {
                        rows: 3,
                        cols: 80
                    }
                }
            },
            buttons: {
                toolbar: {
                    newRegisterRow: true
                },
                byRow: {
                    openEditRegisterForm: false,
                    openDeleteRegisterForm: false,
                    deleteRegisterRow: true
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
        ajaxFunction: testUtils.ajax    
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
        isOn: true,
        level: log4javascript.Level.DEBUG
    }
};

defaultTestOptions.fields.members.fields = { 
    code: { 
        subformKey: true
    },
    name: { },
    description: {
        type: 'textarea',
        formFieldAttributes: {
            rows: 3,
            cols: 80
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
    }
};

var options = undefined;

var fatalErrorFunctionCounter = 0;

defaultTestOptions.fatalErrorFunction = function( message ){
    ++fatalErrorFunctionCounter;
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
            testUtils.resetServices();
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
            testUtils.setService( key, record );
            
            var varName = 'description';
            context.updateSubformFields( options.fields.members, [ 'code', 'name', varName ] );
            
            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );
            
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
            assert.deepEqual( testUtils.getService( key ), newRecord );

            // Go to edit form again and check the form again
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( fatalErrorFunctionCounter, 0 );
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
            testUtils.resetServices();
            var key = 4;
            var serverRecord = {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        //"time": "20:00",
                        "datetime": "2017-09-10T20:00:00.000Z"
                        //"date": "2017-09-10T00:00:00.000Z"
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        //"time": "14:00",
                        "datetime": "2018-07-02T14:00:00.000Z"
                        //"date": "2018-07-02T00:00:00.000Z"
                    }
                ]
            };
            testUtils.setService( key, serverRecord );

            context.updateSubformFields( options.fields.members, [ 'code', 'name', 'datetime' ] );

            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );
            
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
            record.members[ 0 ][ varName ] = datetimeFieldManager.formatToClient(
                options.fields[ varName ],
                record.members[ 0 ][ varName ] );
            record.members[ 1 ][ varName ] = datetimeFieldManager.formatToClient(
                options.fields[ varName ],
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
            assert.deepEqual( testUtils.getService( key ), fieldBuilder.filterValues( newRecord, options.fields ) );
            
            // Go to edit form again and check the form again
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( fatalErrorFunctionCounter, 0 );
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
            testUtils.resetServices();
            var key = 4;
            var serverRecord = {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        //"time": "20:00",
                        "datetime": "2017-09-10T20:00:00.000Z"
                        //"date": "2017-09-10T00:00:00.000Z"
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        //"time": "14:00",
                        "datetime": "2018-07-02T14:00:00.000Z"
                        //"date": "2018-07-02T00:00:00.000Z"
                    }
                ]
            };
            testUtils.setService( key, serverRecord );

            var varName = 'datetime';
            context.updateSubformFields( options.fields.members, [ 'code', 'name', varName ] );

            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );

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
            record.members[ 0 ][ varName ] = datetimeFieldManager.formatToClient(
                options.fields[ varName ],
                record.members[ 0 ][ varName ] );
            record.members[ 1 ][ varName ] = datetimeFieldManager.formatToClient(
                options.fields[ varName ],
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
            assert.deepEqual( testUtils.getService( key ), fieldBuilder.filterValues( newRecord, options.fields ) );

            // Go to edit form again and check the form again
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( fatalErrorFunctionCounter, 0 );
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
            testUtils.resetServices();
            var key = 4;
            var serverRecord = {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        //"time": "20:00",
                        "datetime": "2017-09-10T20:00:00.000Z"
                        //"date": "2017-09-10T00:00:00.000Z"
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        //"time": "14:00",
                        "datetime": "2018-07-02T14:00:00.000Z"
                        //"date": "2018-07-02T00:00:00.000Z"
                    }
                ]
            };
            testUtils.setService( key, serverRecord );

            context.updateSubformFields( options.fields.members, [ 'code', 'name', 'datetime' ] );
            
            options.fields.members.fields.datetime.customOptions.inline = true;
            
            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );

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
            record.members[ 0 ][ varName ] = datetimeFieldManager.formatToClient(
                options.fields[ varName ],
                record.members[ 0 ][ varName ] );
            record.members[ 1 ][ varName ] = datetimeFieldManager.formatToClient(
                options.fields[ varName ],
                record.members[ 1 ][ varName ] );

            // Check form
            var numberOfActions = 4;
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
            assert.deepEqual( testUtils.getService( key ), fieldBuilder.filterValues( newRecord, options.fields ) );

            // Go to edit form again and check the form again
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( fatalErrorFunctionCounter, 0 );
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
            testUtils.resetServices();
            var key = 4;
            var serverRecord = {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        //"time": "20:00",
                        "date": "2017-09-10T00:00:00.000Z"
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        //"time": "14:00",
                        "date": "2018-07-02T00:00:00.000Z"
                    }
                ]
            };
            testUtils.setService( key, serverRecord );

            context.updateSubformFields( options.fields.members, [ 'code', 'name', 'date' ] );

            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );

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
            record.members[ 0 ][ varName ] = datetimeFieldManager.formatToClient(
                options.fields[ varName ],
                record.members[ 0 ][ varName ] );
            record.members[ 1 ][ varName ] = datetimeFieldManager.formatToClient(
                options.fields[ varName ],
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
            var expected = testUtils.getService( key );
            var real = fieldBuilder.filterValues( newRecord, options.fields );
            
            // Correct date
            var rightDate = new Date( real.members[ 0 ][ varName ] );
            rightDate.setHours( rightDate.getHours() + 2 );
            real.members[ 0 ][ varName ] = rightDate;
                
            assert.deepEqual( expected, real );

            // Go to edit form again and check the form again
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( fatalErrorFunctionCounter, 0 );
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
            testUtils.resetServices();
            var key = 4;
            var serverRecord = {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        //"time": "20:00",
                        "date": "2017-09-10T00:00:00.000Z"
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        //"time": "14:00",
                        "date": "2018-07-02T00:00:00.000Z"
                    }
                ]
            };
            testUtils.setService( key, serverRecord );

            var varName = "date";
            context.updateSubformFields( options.fields.members, [ 'code', 'name', varName ] );

            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );

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
            record.members[ 0 ][ varName ] = datetimeFieldManager.formatToClient(
                options.fields[ varName ],
                record.members[ 0 ][ varName ] );
            record.members[ 1 ][ varName ] = datetimeFieldManager.formatToClient(
                options.fields[ varName ],
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
            var expected = testUtils.getService( key );
            var real = fieldBuilder.filterValues( newRecord, options.fields );

            // Correct date
            var rightDate = new Date( real.members[ 0 ][ varName ] );
            rightDate.setHours( rightDate.getHours() + 2 );
            real.members[ 0 ][ varName ] = rightDate;

            assert.deepEqual( expected, real );

            // Go to edit form again and check the form again
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( fatalErrorFunctionCounter, 0 );
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
            testUtils.resetServices();
            var key = 4;
            var serverRecord = {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        //"time": "20:00",
                        "date": "2017-09-10T00:00:00.000Z"
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        //"time": "14:00",
                        "date": "2018-07-02T00:00:00.000Z"
                    }
                ]
            };
            testUtils.setService( key, serverRecord );
            
            var varName = "date";
            context.updateSubformFields( options.fields.members, [ 'code', 'name', varName ] );
            options.fields.members.fields[ varName ].customOptions.inline = true;

            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );

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
            record.members[ 0 ][ varName ] = datetimeFieldManager.formatToClient(
                options.fields[ varName ],
                record.members[ 0 ][ varName ] );
            record.members[ 1 ][ varName ] = datetimeFieldManager.formatToClient(
                options.fields[ varName ],
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
            var expected = testUtils.getService( key );
            var real = fieldBuilder.filterValues( newRecord, options.fields );

            // Correct date
            var rightDate = new Date( real.members[ 0 ][ varName ] );
            rightDate.setHours( rightDate.getHours() + 2 );
            real.members[ 0 ][ varName ] = rightDate;

            assert.deepEqual( expected, real );

            // Go to edit form again and check the form again
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( fatalErrorFunctionCounter, 0 );
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
            testUtils.resetServices();
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
            testUtils.setService( key, serverRecord );

            var varName = "time";
            context.updateSubformFields( options.fields.members, [ 'code', 'name', varName ] );

            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );

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
            record.members[ 0 ][ varName ] = datetimeFieldManager.formatToClient(
                options.fields[ varName ],
                record.members[ 0 ][ varName ] );
            record.members[ 1 ][ varName ] = datetimeFieldManager.formatToClient(
                options.fields[ varName ],
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
            assert.deepEqual( testUtils.getService( key ), fieldBuilder.filterValues( newRecord, options.fields ) );

            // Go to edit form again and check the form again
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( fatalErrorFunctionCounter, 0 );
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
            testUtils.resetServices();
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
            testUtils.setService( key, serverRecord );
            
            var varName = "time";
            context.updateSubformFields( options.fields.members, [ 'code', 'name', varName ] );

            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );

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
            record.members[ 0 ][ varName ] = datetimeFieldManager.formatToClient(
                options.fields[ varName ],
                record.members[ 0 ][ varName ] );
            record.members[ 1 ][ varName ] = datetimeFieldManager.formatToClient(
                options.fields[ varName ],
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
            assert.deepEqual( testUtils.getService( key ), fieldBuilder.filterValues( newRecord, options.fields ) );

            // Go to edit form again and check the form again
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( fatalErrorFunctionCounter, 0 );
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
            testUtils.resetServices();
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
            testUtils.setService( key, serverRecord );

            var varName = "time";
            context.updateSubformFields( options.fields.members, [ 'code', 'name', varName ] );
            options.fields.members.fields[ varName ].customOptions.inline = true;

            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );

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
            record.members[ 0 ][ varName ] = datetimeFieldManager.formatToClient(
                options.fields[ varName ],
                record.members[ 0 ][ varName ] );
            record.members[ 1 ][ varName ] = datetimeFieldManager.formatToClient(
                options.fields[ varName ],
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
            assert.deepEqual( testUtils.getService( key ), newRecord );

            // Go to edit form again and check the form again
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( fatalErrorFunctionCounter, 0 );
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
            testUtils.resetServices();
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
            testUtils.setService( key, record );

            var varName = 'important';
            context.updateSubformFields( options.fields.members, [ 'code', 'name', varName ] );

            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );

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
            assert.deepEqual( testUtils.getService( key ), newRecord );

            // Go to edit form again and check the form again
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( fatalErrorFunctionCounter, 0 );
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
            testUtils.resetServices();
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
            testUtils.setService( key, record );

            var varName = 'phoneType';
            context.updateSubformFields( options.fields.members, [ 'code', 'name', varName ] );

            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );

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
            assert.deepEqual( testUtils.getService( key ), newRecord );

            // Go to edit form again and check the form again
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( fatalErrorFunctionCounter, 0 );
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
            testUtils.resetServices();
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
            testUtils.setService( key, record );

            var varName = 'province';
            context.updateSubformFields( options.fields.members, [ 'code', 'name', varName ] );

            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );

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
            assert.deepEqual( testUtils.getService( key ), newRecord );

            // Go to edit form again and check the form again
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( fatalErrorFunctionCounter, 0 );
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
            testUtils.resetServices();
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
            testUtils.setService( key, record );

            var varName = 'province';
            var varName2 = 'city';
            context.updateSubformFields( options.fields.members, [ 'code', 'name', varName, varName2 ] );

            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );

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
            assert.deepEqual( testUtils.getService( key ), newRecord );

            // Go to edit form again and check the form again
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( fatalErrorFunctionCounter, 0 );
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
            testUtils.resetServices();
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
            testUtils.setService( key, record );

            var varName = 'browser';
            context.updateSubformFields( options.fields.members, [ 'code', 'name', varName ] );

            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );

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
            assert.deepEqual( testUtils.getService( key ), newRecord );

            // Go to edit form again and check the form again
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.clickUpdateListButton( key );
            assert.equal( fatalErrorFunctionCounter, 0 );
            testHelper.checkForm( assert, newRecord );

            done();
        }
    );
});

