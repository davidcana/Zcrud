
import { testServerSide } from '../../../test/js/app/testServerSide.js';
import { zzDOM } from '../../../js/app/zzDOMPlugin.js';
var $ = zzDOM.zz;

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
                        'type': 'fieldsGroup',
                        'source': [ 
                            'id',
                            'name',
                            'description'
                        ],
                        'container': {
                            'id': 'basicData',
                            'containerType': 'fieldSet'
                        }
                    },
                    {
                        'type': 'fieldsGroup',
                        'source': 'default',
                        'start': 'date',
                        'end': 'phoneType'
                    },
                    {
                        'type': 'fieldsGroup',
                        'container': {
                            'id': 'customTemplate1',
                            'containerType': 'custom',
                            'template': 'customTemplate1@/test/custom-template.html'
                        }
                    },
                    {
                        'type': 'fieldsGroup',
                        'source': [ 
                            'province',
                            'city'
                        ],
                        'container': {
                            'id': 'location',
                            'containerType': 'fieldSet'
                        }
                    },
                    'browser',
                    'important'
                ]
            }, 
            delete: {
                fields: [
                    {
                        'type': 'fieldsGroup',
                        'source': 'update'
                    }
                ]
            }
        }
    },
    
    key : 'id',
    fields: {
        id: {},
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
            type: 'textarea'
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
    
    templates: {
        declaredRemotePageUrls: [ '/test/custom-template.html' ]
    },

    ajax: {
        ajaxFunction: testServerSide.ajax    
    },
    
    i18n: {
        language: 'es',
        files: { 
            en: [ 'en-common.json', 'en-services.json' ],
            es: [ 'es-common.json', 'es-services.json' ] 
        }
    },
    
    events: {
        formCreated: function ( data ) {
            $( '#customButton1' ).on(
                'click',
                function ( e ) {
                    e.preventDefault();
                    alert( 'It works!' )
                }
            );
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

