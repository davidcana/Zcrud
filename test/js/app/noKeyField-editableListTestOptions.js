
import { testServerSide } from './testServerSide.js';

export const noKeyFieldEditableListTestOptions = {

    entityId: 'department',
    saveUserPreferences: false,
    
    key: 'id',
    
    pageConf: {
        pages: {
            list: {
                getGroupOfRecordsURL: 'http://localhost/CRUDManager.do?cmd=LIST&table=department',
                getRecordURL: 'http://localhost/CRUDManager.do?cmd=GET&table=department',
                fields: [ 'name', 'description' ],
                buttons: {
                    toolbar: [ 'list_addNewRow', 'undo', 'redo', 'list_submit' ],
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
                        updateURL: 'http://localhost/CRUDManager.do?cmd=BATCH_UPDATE&table=department',
                        dataToSend: 'modified', // possible values: 'modified', 'all',
                        modifiedFieldsClass: 'zcrud-modified-field',
                        modifiedRowsClass: 'zcrud-modified-row',
                        hideTr: function( $tr ){
                            $tr.hide();
                        },
                        showTr: function( $tr ){
                            $tr.show();
                        },
                        confirm: {
                            save: false
                        }
                    }
                }
            }, 
            create: {
                fields: [
                    {
                        'type': 'fieldsGroup'
                    }
                ]
            }, 
            update: {
                fields: [
                    {
                        'type': 'fieldsGroup'
                    }
                ]
            }, 
            delete: {
                fields: [
                    {
                        'type': 'fieldsGroup'
                    }
                ]
            }
        }
    },

    fields: {
        name: {
            attributes:{
                field: {
                    minlength: 3,
                    maxlength: 20,
                    pattern: '.{3,20}' // Must use pattern to make the tests work properly
                }
            }
        },
        description: {
            type: 'textarea'
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
            options: [ 'Edge', 'Firefox', 'Chrome', 'Opera', 'Safari' ]
        },
        important: {
            type: 'checkbox'
        }
    },

    ajax: {
        ajaxFunction: testServerSide.ajax    
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
