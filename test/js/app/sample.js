"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
//var Qunit = require( 'qunit' );
var testUtils = require( './testUtils' );
var context = require( '../../../js/app/context.js' );
var log4javascript = require( 'log4javascript' );

var options = {
    
    entityId: 'department',
    
    pageConf: {
        defaultPageConf: {
            url: 'http://localhost/CRUDManager.do?cmd=BATCH_UPDATE&table=department'
        },
        pages: {
            list: {
                url: 'http://localhost/CRUDManager.do?cmd=LIST&table=department',
                fields: [ 'id', 'name' ],
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
            }, 
            create: {
                fields: [
                    {
                        "type": "fieldSubset"
                    }
                ]
            }, 
            update: {
                fields: [
                    {
                        "type": "fieldSubset"
                    }
                ]
            }, 
            delete: {
                fields: [
                    {
                        "type": "fieldSubset"
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
            width: '90%'
        },
        description: {
            type: 'textarea',
            //template: "descriptionTextarea",
            formFieldAttributes: {
                rows: 6,
                cols: 80
            }
        },
        date: {
            type: 'date',
            customOptions: {
                inline: false
            }
        },
        time: {
            type: 'time'
        },
        datetime: {
            type: 'datetime'
        },
        phoneType: {
            type: 'radio',
            translateOptions: true,
            //options: 'http://localhost/CRUDManager.do?table=phoneTypes',
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
            type: 'datalist',
            options: [ 'Internet Explorer', 'Firefox', 'Chrome', 'Opera', 'Safari' ]
        },
        important: {
            type: 'checkbox'
        },
        number: {
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
    
    ajax: {
        ajaxFunction: testUtils.ajax    
    },

    events: {
        /*
        formCreated: function ( options ) { 
            alert( 'Form created! ' );
        }*/
        /*
        formSubmitting: function ( options, dataToSend ) { 
            alert( 'Form submit! ' );
            return false;
        }*/
        /*
        recordDeleted: function ( event, options, key ) { 
            alert ( 'recordDeleted! ' );
        }*/
    },
    
    i18n: {
        language: 'es',
        files: { 
            en: [ 'en-common.json', 'en-services.json' ],
            es: [ 'es-common.json', 'es-services.json' ] 
        }
    },
    
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
        $( '#departmentsContainer' ).zcrud( 'getSelectedRecords' ) ) );
    
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
