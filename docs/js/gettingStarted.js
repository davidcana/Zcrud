//

var options = {

    entityId: 'department',

    pageConf: {
        defaultPageConf: {
            url: 'http://localhost/CRUDManager.do?cmd=BATCH_UPDATE&table=department',
            getRecordURL: 'http://localhost/CRUDManager.do?cmd=GET&table=department'
        },
        pages: {
            list: {
                url: 'http://localhost/CRUDManager.do?cmd=LIST&table=department',
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
            width: '90%'
        },
        description: {
            type: 'textarea',
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
                length: '3-12'
            },
            '#zcrud-number': {
                validation: 'number',
                allowing: 'float'
            }
        }
    },

    ajax: {
        ajaxFunction: zcrudServerSide.ajax
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

var zptParser = zpt.buildParser({
    root: document.body,
    //root: [ $( '#commonHeader' )[0], $( '#commonFooter' )[0] ],
    dictionary: {
        location: window.location
    },
    declaredRemotePageUrls: [ 'templates.html' ]
});

zptParser.init(
    function(){
        zptParser.run();
        
        $( '#departmentsContainer' ).zcrud( 
            'init',
            options,
            function( options ){
                $( '#departmentsContainer' ).zcrud( 'renderList' );
            }
        );
    }
);

