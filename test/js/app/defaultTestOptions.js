"use strict";

var testUtils = require( './testUtils' );
var log4javascript = require( 'log4javascript' );

module.exports = {

    entityId: 'department',
    saveUserPreferences: false,
    
    pageConf: {
        defaultPageConf: {
            url: 'http://localhost/CRUDManager.do?cmd=BATCH_UPDATE&table=department'
        },
        pages: {
            list: {
                url: 'http://localhost/CRUDManager.do?cmd=LIST&table=department',
                fields: [ 'id', 'name' ],
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
        }
    },

    validation: {
        modules: 'security, date',
        rules: {
            '#zcrud-name': {
                validation: 'length',
                length: '3-20'
            },
            '#zcrud-number': {
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
