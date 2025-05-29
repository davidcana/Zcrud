'use strict';

var zzDOM = require( '../../../js/app/zzDOMPlugin.js' );
var $ = zzDOM.zz;
var testServerSide = require( './testServerSide' );
var context = require( '../../../js/app/context.js' );

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
                },
                buttons: {
                    toolbar: [
                        'list_showCreateForm',
                        {
                            type: 'generic',
                            cssClass: 'showSelectedRecords',
                            textsBundle: {
                                title: undefined,
                                content: {
                                    translate: false,
                                    text: 'Show selected records'
                                }
                            }
                        }
                    ]
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
            attributes: {
                field: {
                    required: '',
                    minlength: 3,
                    maxlength: 12,
                    pattern: '[0-9a-zA-Z ]{3,12}'
                },
                filterField: {
                    maxlength: 6
                },
                rowHeader: {
                    style: 'width:90%'
                }
            }
        },
        description: {
            type: 'textarea'
            //template: 'descriptionTextarea'
        },
        date: {
            type: 'date',
            minYear: 1973,
            maxYear: 2035
        },
        time: {
            type: 'time',
            maxHour: 23
        },
        datetime: {
            type: 'datetime',
            minYear: 1973,
            maxYear: 2035
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
            options: [ 'Edge', 'Firefox', 'Chrome', 'Opera', 'Safari' ]
        },
        important: {
            type: 'checkbox'
        },
        number: {
            type: 'number',
            attributes: {
                field: {
                    required: '',
                    min: 1,
                    max: 10,
                    step: .1
                }
            }
        },
        password: {
            type: 'password',
            attributes: {
                field: {
                    required: '',
                    autocomplete: 'current-password'
                }
            }
        },
        newPassword: {
            type: 'password',
            attributes: {
                field: {
                    autocomplete: 'new-password'
                }
            },
            mustBeEqualTo: 'repeatNewPassword'
        },
        repeatNewPassword: {
            type: 'password',
            attributes: {
                field: {
                    autocomplete: 'new-password'
                }
            },
            mustBeEqualTo: 'newPassword'
        },
        file: {
            type: 'fileUpload',
            attributes: {
                field: {
                    accept: '.pdf'
                }
            },
            acceptedFileExtensions: [ '.pdf' ],
            maxFileSize: 1024 * 1024, // 1Mb
            minFileSize:   10 * 1024  // 10Kb
        }
    },

    ajax: {
        ajaxFunction: testServerSide.ajax    
    },

    events: {
        listCreated: function ( data ) {
            $( 'button.showSelectedRecords' ).on(
                'click',
                function ( event ) {
                    const records = JSON.stringify(
                        $( '#departmentsContainer' ).zcrud( 'getSelectedRecords' )
                    );
                    const options = context.getOptions(
                        $( '#departmentsContainer' )
                    );
                    context.showMessage(
                        options,
                        {
                            text: 'Selected records: ' + records
                        }
                    );
                    //alert( text );
                }
            );
        }
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

