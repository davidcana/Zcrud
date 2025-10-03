
import { utils } from '../../../js/app/utils.js';
import { testServerSide } from './testServerSide.js';
import { zzDOM } from '../../../js/app/zzDOMPlugin.js';
var $ = zzDOM.zz;

var defaultTestOptions = {

    entityId: 'department',
    saveUserPreferences: false,

    pageConf: {
        defaultPageConf: {
            updateURL: 'http://localhost/CRUDManager.do?cmd=BATCH_UPDATE&table=department',
            getRecordURL: 'http://localhost/CRUDManager.do?cmd=GET&table=department',
            dataToSend: 'modified'
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
        name: {},
        description: {
            type: 'textarea'
        },
        time: {
            type: 'time',
            inline: true
        },
        datetime: {
            type: 'datetime',
            inline: true
        },
        date: {
            type: 'date',
            inline: true
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
            options: [ 'Edge', 'Firefox', 'Chrome', 'Opera', 'Safari' ]
        },
        important: {
            type: 'checkbox'
        },
        number: {
            type: 'number'
        },
        members: {
            type: 'subform',
            subformKey: 'code',
            fields: { 
                code: { },
                name: {
                    attributes:{
                        field: {
                            minlength: 3,
                            maxlength: 20,
                            pattern: '[0-9a-zA-Z ]{3,20}' // Must use pattern to make the tests work properly
                        }
                    }
                },
                description: {
                    type: 'textarea',
                    attributes: {
                        field: {
                            rows: 3
                        }
                    }
                }
            }
        }
    },

    ajax:{
        ajaxFunction: testServerSide.ajax    
    },

    events: {},

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
/*
defaultTestOptions.fields.members.fields = { 
    code: { },
    name: {
        attributes:{
            field: {
                minlength: 3,
                maxlength: 20,
                pattern: '[0-9a-zA-Z ]{3,20}' // Must use pattern to make the tests work properly
            }
        }
    },
    description: {
        type: 'textarea',
        attributes: {
            field: {
                rows: 3
            }
        }
    },
    time: {
        type: 'time',
        inline: false
    },
    datetime: {
        type: 'datetime',
        inline: false
    },
    date: {
        type: 'date',
        inline: false
    }
};
*/

// Setup services
testServerSide.resetServices();
var key = 4;
var record = {
    'id': '' + key,
    'name': 'Service ' + key,
    'time': '20:30',
    'datetime': '2017-03-10T20:00:00.000Z',
    'date': '2017-03-14T00:00:00.000Z',
    'members': [
        {
            'code': '1',
            'name': 'Bart Simpson',
            'time': '20:00',
            'datetime': '2017-09-10T20:00:00.000Z',
            'date': '2017-09-10T00:00:00.000Z'
        },
        {
            'code': '2',
            'name': 'Lisa Simpson',
            'time': '14:00',
            'datetime': '2018-07-02T14:00:00.000Z',
            'date': '2018-07-02T00:00:00.000Z'
        }
    ]
};
testServerSide.setService( key, record );

var errorFunctionCounter = 0;
defaultTestOptions.errorFunction = function( message ){
    ++errorFunctionCounter;
};

var options = utils.extend( true, {}, defaultTestOptions );

$( '#departmentsContainer' ).zcrud( 
    'init',
    options,
    function( options ){
        
        //testHelper.updateSubformFields( options.fields.members, [ 'code', 'name', 'time', 'datetime', 'date' ] );
        //testHelper.updateSubformFields( options.fields.members, [ 'code', 'name', 'date' ] );
        
        //errorFunctionCounter = 0;
        $( '#departmentsContainer' ).zcrud( 'renderList' );
        
        // Go to edit form
        //testHelper.clickUpdateListButton( key );

    }
);
