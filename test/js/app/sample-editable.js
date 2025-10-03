
import { testServerSide } from './testServerSide.js';
import { zzDOM } from '../../../js/app/zzDOMPlugin.js';
var $ = zzDOM.zz;

var options = {
    
    entityId: 'department',
    
    pageConf: {
        pages: {
            list: {
                getGroupOfRecordsURL: 'http://localhost/CRUDManager.do?cmd=LIST&table=department',
                fields: [ 'id', 'name' ],
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
                        modifiedRowsClass: 'zcrud-modified-row'
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
                    pattern: '[0-9a-zA-Z ]{3,12}' // Must use pattern to make the tests work properly
                }
            }
        },
        description: {
            type: 'textarea',
            //template: 'descriptionTextarea'
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
            options: [ 'Edge', 'Firefox', 'Chrome', 'Opera', 'Safari' ]
        },
        important: {
            type: 'checkbox'
        },
        number: {
            type: 'number'
        }
    },

    ajax: {
        ajaxFunction: testServerSide.ajax    
    },

    events: { },
    
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

