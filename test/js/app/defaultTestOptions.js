"use strict";

var testServerSide = require( './testServerSide' );
var log4javascript = require( 'log4javascript' );

module.exports = {

    entityId: 'department',
    saveUserPreferences: false,
    
    pageConf: {
        defaultPageConf: {
            updateURL: 'http://localhost/CRUDManager.do?cmd=BATCH_UPDATE&table=department',
            getRecordURL: 'http://localhost/CRUDManager.do?cmd=GET&table=department',
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
                        "type": "fieldsGroup",
                        "source": [ 
                            'id',
                            'name',
                            'description' 
                        ],
                        "container": {
                            "id": "basicData",
                            "containerType": "fieldSet"
                        }
                    },
                    {
                        "type": "fieldsGroup",
                        "source": "default",
                        "start": "date"
                    }
                ]
            }, 
            update: {
                fields: [
                    {
                        "type": "fieldsGroup",
                        "source": "create"
                    }
                ]
            }, 
            delete: {
                fields: [
                    {
                        "type": "fieldsGroup",
                        "source": "create"
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
                field: {
                    minlength: 3,
                    maxlength: 20,
                    pattern: '.{3,20}' // Must use pattern to make the tests work properly
                },
                rowHeader: {
                    style: 'width:90%'
                }
            }
        },
        description: {
            type: 'textarea',
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
            attributes: {
                field: {
                    type: 'number'
                }
            }
        },
        hobbies: {
            type: 'checkboxes',
            translateOptions: true,
            options: [ 'reading_option', 'videogames_option', 'sports_option', 'cards_option' ]
        }
    },

    validation: {
        modules: 'security, date',
        rules: {
            'name': {
                validation: 'length',
                length: '3-20'
            },
            'number': {
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
        language: 'en',
        files: { 
            en: [ 'en-common.json', 'en-services.json' ],
            es: [ 'es-common.json', 'es-services.json' ] 
        }
    },
    
    logging: {
        isOn: true
    }
};
