"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
//var Qunit = require( 'qunit' );
var testServerSide = require( './testServerSide' );
var context = require( '../../../js/app/context.js' );
var log4javascript = require( 'log4javascript' );

var options = {
    
    entityId: 'department',
    
    pageConf: {
        defaultPageConf: {
            updateURL: 'http://localhost/CRUDManager.do?cmd=BATCH_UPDATE&table=department',
            getRecordURL: 'http://localhost/CRUDManager.do?cmd=GET&table=department'
        },
        pages: {
            list: {
                getGroupOfRecordsURL: 'http://localhost/CRUDManager.do?cmd=LIST&table=department',
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
                        fields: [ 'id', 'name' ]
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
            //template: "descriptionTextarea"
        },
        date: {
            type: 'date',
            inline: false
        },
        time: {
            type: 'time'
        },
        datetime: {
            type: 'datetime'
        },
        phoneType: {
            type: 'radio',
            translateOptions: false,
            options: 'http://localhost/CRUDManager.do?table=phoneTypes',
            /*options: function(){
                return [ 'homePhone_option', 'officePhone_option', 'cellPhone_option' ];
            }*/
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
        ajaxFunction: testServerSide.ajax    
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
        isOn: true
    }
};

$( '#departmentsContainer' ).zcrud( 
    'init',
    options,
    function( options ){
        $( '#departmentsContainer' ).zcrud( 'renderList' );
    }
);
/*
zcrud.init( options, function( options ){
    zcrud.renderList(
        options,
        {
            name: 'Service 1'
        });
});*/

$( '#customButton' ).on( 'click',  function ( event ) {
    
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
