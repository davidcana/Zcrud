"use strict";

//var Qunit = require( 'qunitjs' );
var testUtils = require( './testUtils' );
var log4javascript = require( 'log4javascript' );

module.exports = {

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
            //template: "descriptionTextarea",
            formFieldAttributes: {
                rows: 6,
                cols: 80
            }
        },
        date: {
            list: false,
            type: 'date',
            customOptions: {
                inline: false
            }
        },
        time: {
            list: false,
            type: 'time'
        },
        datetime: {
            list: false,
            type: 'datetime'
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
        language: 'en',
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
