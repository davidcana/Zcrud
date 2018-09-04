"use strict";

//var Qunit = require( 'qunit' );
var testUtils = require( './testUtils' );
var log4javascript = require( 'log4javascript' );

module.exports = {

    entityId: 'department',
    saveUserPreferences: false,
    
    key: 'id',
    
    pageConf: {
        pages: {
            list: {
                url: 'http://localhost/CRUDManager.do?cmd=LIST&table=department',
                getRecordURL: 'http://localhost/CRUDManager.do?cmd=GET&table=department',
                fields: [ 'name', 'description' ],
                buttons: {
                    toolbar: [ 'list_addNewRow', 'undo', 'redo', 'list_save' ],
                    byRow: [ 'list_deleteRow' ]
                },
                components: {
                    sorting: {
                        isOn: false,
                        default: {
                            fieldId: 'name',
                            type: 'asc'
                        },
                        allowUser: false
                    },
                    editing: {
                        isOn: true,
                        url: 'http://localhost/CRUDManager.do?cmd=BATCH_UPDATE&table=department',
                        dataToSend: 'modified', // possible values: 'modified', 'all',
                        modifiedFieldsClass: 'zcrud-modified-field',
                        modifiedRowsClass: 'zcrud-modified-row',
                        hideTr: function( $tr ){
                            $tr.hide();
                        },
                        showTr: function( $tr ){
                            $tr.show();
                        }
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

    fields: {
        name: {
        },
        description: {
            type: 'textarea',
            formFieldAttributes: {
                rows: 6,
                cols: 80
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
        }
    },

    validation: {
        modules: 'security, date',
        rules: {
            'name': {
                validation: 'length',
                length: '3-20'
            }
        },
        configuration: {
            errorMessageClass: 'form-error-inline-absolute',
        }
    },

    ajax: {
        ajaxFunction: testUtils.ajax    
    },

    events: { },

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
