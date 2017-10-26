"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
//var Qunit = require( 'qunitjs' );
var testUtils = require( './testUtils' );
var context = require( '../../../js/app/context.js' );
var log4javascript = require( 'log4javascript' );

var options = {
    body: document.body,
    //target: $( '#departmentsContainer' ),
    //title: 'Departments',
    entityId: 'department',
    
    // Pages
    pages: {
        list: {
            action: 'http://localhost:8080/cerbero/CRUDManager.do?cmd=LIST&table=department',
            components: {
                sorting: {
                    isOn: true,
                    default: {
                        fieldId: 'name',
                        type: 'asc'
                    },
                    allowUser: false
                },
                filtering: {
                    isOn: true,
                    fields: {
                        name: 'name'
                    }
                },
                selecting: {
                    isOn: true,
                    multiple: true,
                    mode: [ 'checkbox', 'onRowClick' ] // Options are checkbox and onRowClick
                }
            }
        }, create: {
            action: 'http://localhost:8080/cerbero/CRUDManager.do?cmd=CREATE&table=department'
        }, update: {
            action: 'http://localhost:8080/cerbero/CRUDManager.do?cmd=UPDATE&table=department'
        }, delete: {
            action: 'http://localhost:8080/cerbero/CRUDManager.do?cmd=DELETE&table=department'
        }
    },
    
    // Fields
    fields: {
        id: {
            //title: 'Id',
            //description: 'The unique id of the department!',
            key: true,
            create: true,
            edit: true,
            delete: true,
            sorting: false
        },
        name: {
            //title: 'Name',
            //description: 'The name of the department!',
            width: '90%'
        },
        description: {
            //title: 'Description',
            //description: 'The description of the department!',
            list: false,
            type: 'textarea',
            //template: "descriptionTextarea",
            formFieldAttributes: {
                rows: 6,
                cols: 80
            }
        },
        date: {
            //title: 'Date',
            //description: 'The date of the department!',
            list: false,
            type: 'date',
            customOptions: {
                inline: false
            }
        },
        time: {
            //title: 'Time',
            //description: 'The time of the department!',
            list: false,
            type: 'time'
        },
        datetime: {
            //title: 'Datetime',
            //description: 'The datetime of the department!',
            list: false,
            type: 'datetime'
        },
        phoneType: {
            //title: 'Phone type',
            //description: 'The phone type of the department!',
            list: false,
            type: 'radio',
            translateOptions: true,
            //options: 'http://localhost:8080/cerbero/CRUDManager.do?table=phoneTypes',
            options: function(){
                return [ 'homePhone_option', 'officePhone_option', 'cellPhone_option' ];
            }
            /*
            options: function(){
                return [ 'Home phone!', 'Office phone!', 'Cell phone!!!' ];
            }*/
            //options: [ 'Home phone', 'Office phone', 'Cell phone' ]
            /*
            options: [
                { value: '1', displayText: 'Home phone!' }, 
                { lue: '2', displayText: 'Office phone!' }, 
                { value: '3', displayText: 'Cell phone!' } ]*/
            //options: { '1': 'Home phone', '2': 'Office phone', '3': 'Cell phone' }
        },
        province: {
            //title: 'Province',
            //description: 'The province of the department!',
            list: false,
            type: 'select',
            options: [ 'Cádiz', 'Málaga' ],
            defaultValue: 'Cádiz'
        },
        city: {
            //title: 'City',
            //description: 'The city of the department!',
            list: false,
            type: 'select',
            dependsOn: 'province',
            options: function( data ){
                if ( ! data.dependedValues.province ){
                    return [ 'Algeciras', 'Estepona', 'Marbella', 'Tarifa' ]
                };
                
                switch ( data.dependedValues.province ) {
                case 'Cádiz':
                    return [ 'Algeciras', 'Tarifa' ];
                    break;
                case 'Málaga':
                    return [ 'Estepona', 'Marbella' ];
                    break;
                default:
                    throw 'Unknown province: ' + data.dependedValues.province;
                }
            }
        },
        browser: {
            //title: 'Browser',
            //description: 'The prefered browser of the department!',
            list: false,
            type: 'datalist',
            options: [ 'Internet Explorer', 'Firefox', 'Chrome', 'Opera', 'Safari' ]
        },
        important: {
            //title: 'Important',
            //description: 'Is important???',
            list: false,
            type: 'checkbox'
        },
        number: {
            list: false
        }
    },

    validation: {
        modules: 'security, date',
        rules: {
            '#zcrud-name': {
                validation: 'length',
                length: '3-12'
            },
            '#zcrud-number': {
                validation: 'number',
                allowing: 'float'
            }
        }
    },
    
    ajax: testUtils.ajax,
    /*
    ajaxPreFilter : function( data ){
        return data;
    },
    ajaxPostFilter : function( data ){
        return {
            records: data.Records,
            result : data.Result,
            message: data.Message
        };
    }*/
    events: {
        /*
        formCreated: function ( options ) { 
            alert( 'Form created! ' + options.currentForm.type );
        }*/
        /*
        formSubmitting: function ( options, dataToSend ) { 
            alert( 'Form submit! ' + options.currentForm.type );
            return false;
        }*/
        /*
        recordDeleted: function ( event, options, key ) { 
            alert ( 'recordDeleted! '  + options.currentForm.type + ': ' + key );
        }*/
    },
    
    // I18n and L10n
    i18n: {
        language: 'es',
        files: { 
            en: [ 'en-common.json', 'en-services.json' ],
            es: [ 'es-common.json', 'es-services.json' ] 
        }
    },
    
    // Logging
    logging: {
        isOn: true,
        level: log4javascript.Level.DEBUG,
    }
};

$( '#departmentsContainer' ).zcrud( 
    'init',
    options,
    function( options ){
        $( '#departmentsContainer' ).zcrud( 'load' );
    }
);
/*
zcrud.init( options, function( options ){
    //zcrud.load( options );
    zcrud.load(
        options,
        {
            name: 'Service 1'
        });
});*/

$( '#customButton' ).click( function ( event ) {
    
    alert( JSON.stringify(
        $( '#departmentsContainer' ).zcrud( 'selectedRecords' ) ) );
    
    //$( '#departmentsContainer' ).zcrud( 'destroy' );
    /*alert( JSON.stringify(
        $( '#departmentsContainer' ).zcrud( 'getRecordByKey', 1 ) ) );
            //zcrud.getRecordByKey( 'zcrud-list-department', 10 ) ) );*/
    //$( '#departmentsContainer' ).zcrud( 'showCreateForm' );
    /*
    $( '#departmentsContainer' ).zcrud( 
        'updateRecord',
        {
            id: '1',
            name: 'New service!'
        });*/
    /*
    zcrud.deleteRecord( 
        'zcrud-list-department', 1, event );*/
    //$( '#departmentsContainer' ).zcrud( 'deleteRecord', 1, event );
});
