"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var Qunit = require( 'qunitjs' );
var testHelper = require( './testHelper.js' );
var testUtils = require( './testUtils.js' );
var context = require( '../../../js/app/context.js' );
var log4javascript = require( 'log4javascript' );

//var defaultTestOptions = require( './subformTestOptions.js' );
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
        /*
        date: {
            list: false,
            type: 'date',
            customOptions: {
                inline: false
            }
        },*/
        time: {
            list: false,
            type: 'time',
            customOptions: {
                inline: true
            }
        },
        datetime: {
            list: false,
            type: 'datetime',
            customOptions: {
                inline: true
            }
        },
        date: {
            list: false,
            type: 'date',
            customOptions: {
                inline: true
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
    }
};

var options = undefined;

var fatalErrorFunctionCounter = 0;

defaultTestOptions.fatalErrorFunction = function( message ){
    ++fatalErrorFunctionCounter;
};

// Run tests
/*
QUnit.test( "change text area test", function( assert ) {

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
            
            context.updateSubformFields( options.fields.members, [ 'code', 'name', 'description' ] );
            
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
            newRecord.members[ 1 ].description = editedRecord.members[ 1 ].description;
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            // Undo
            var tempRecord = $.extend( true, {} , newRecord );
            tempRecord.members[ 1 ].description = record.members[ 1 ].description;
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 0, 1, false );
            
            // Redo
            tempRecord = $.extend( true, {} , newRecord );
            newRecord.members[ 1 ].description = editedRecord.members[ 1 ].description;
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
*/
QUnit.test( "change datetime test", function( assert ) {

    var done = assert.async();
    options = $.extend( true, {}, defaultTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            // Setup services
            testUtils.resetServices();
            var key = 4;
            var record = {
                "id": "" + key,
                "name": "Service " + key,
                "time": "20:30",
                "datetime": "2017-03-10T20:00:00.000Z",
                "date": "2017-03-14T00:00:00.000Z",
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "time": "20:00",
                        "datetime": "2017-09-10T20:00:00.000Z",
                        "date": "2017-09-10T00:00:00.000Z"
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        "time": "14:00",
                        "datetime": "2018-07-02T14:00:00.000Z",
                        "date": "2018-07-02T00:00:00.000Z"
                    }
                ]
            };
            testUtils.setService( key, record );

            context.updateSubformFields( options.fields.members, [ 'code', 'name', 'time', 'datetime', 'date' ] );

            fatalErrorFunctionCounter = 0;
            $( '#departmentsContainer' ).zcrud( 'load' );
            
            // Go to edit form
            testHelper.clickUpdateListButton( key );
            
            // Click
            /*
            testHelper
                .get$SubFormFieldByNameClass( 'members', 'datetime', 1 )
                .trigger( 'mousedown' );
            testHelper.clickDatetimePickerDay( 25 );*/
            /*
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
            newRecord.members[ 1 ].description = editedRecord.members[ 1 ].description;
            testHelper.checkForm( assert, newRecord );
            testHelper.assertHistory( assert, 1, 0, true );

            // Undo
            var tempRecord = $.extend( true, {} , newRecord );
            tempRecord.members[ 1 ].description = record.members[ 1 ].description;
            testHelper.clickUndoButton();
            testHelper.checkForm( assert, tempRecord );
            testHelper.assertHistory( assert, 0, 1, false );

            // Redo
            tempRecord = $.extend( true, {} , newRecord );
            newRecord.members[ 1 ].description = editedRecord.members[ 1 ].description;
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
            testHelper.checkForm( assert, newRecord );*/

            done();
        }
    );
});
