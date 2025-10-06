// Index
import { zpt, $ } from '../lib/zcrud-esm.js';
import { zcrudServerSide } from './zcrudServerSide.js'; 
import { people, skills } from './data.js';

zcrudServerSide.addPeople( people );
zcrudServerSide.addSubformsData( 'skills', skills );

var options = {

    entityId: 'people',
    saveUserPreferences: false,
    
    pageConf: {
        defaultPageConf: {
            updateURL: 'http://localhost/CRUDManager.do?cmd=BATCH_UPDATE&table=people',
            getRecordURL: 'http://localhost/CRUDManager.do?cmd=GET&table=people'
        },
        pages: {
            list: {
                getGroupOfRecordsURL: 'http://localhost/CRUDManager.do?cmd=LIST&table=people',
                fields: [ 'id', 'name', 'datetime', 'country', 'city', 'browser' ],
                components: {
                    filtering: {
                        isOn: true,
                        fields: [ 'id', 'name' ]
                    }   
                }
            }, 
            create: {
                fields: [
                    {
                        type: 'fieldsGroup',
                        source: [ 
                            'id',
                            'name',
                            'description' 
                        ],
                        container: {
                            id: 'basicData',
                            containerType: 'fieldSet'
                        }
                    },
                    {
                        type: 'fieldsGroup',
                        source: 'default',
                        start: 'date'
                    }
                ]
            }, 
            update: {
                fields: [
                    {
                        "type": "fieldsGroup",
                        source: "create"
                    }
                ]
            }, 
            delete: {
                fields: [
                    {
                        "type": "fieldsGroup",
                        source: "create"
                    }
                ]
            }
        }
    },

    key : 'id',
    fields: {
        id: {
        },
        name: {
            attributes:{
                rowHeader: {
                    style: 'width:30%'
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
            options: [
                { value: 1, displayText: 'homePhone_option' }, 
                { value: 2, displayText: 'officePhone_option' }, 
                { value: 3, displayText: 'cellPhone_option' } 
            ]
        },
        country: {
            type: 'select',
            translateOptions: false,
            options: [
                { value: 1, displayText: 'France' }, 
                { value: 2, displayText: 'Italy' },
                { value: 3, displayText: 'Portugal' }, 
                { value: 4, displayText: 'Spain' }, 
                { value: 5, displayText: 'UK' }
            ],
            defaultValue: 4
        },
        city: {
            type: 'select',
            sorting: false,
            dependsOn: 'country',
            options: function( data ){

                if ( ! data.dependedValues.country ){
                    return [];
                }

                switch ( parseInt( data.dependedValues.country ) ) {
                    case 1:
                        return [ 
                            { value: 1, displayText: 'Paris' }, 
                            { value: 2, displayText: 'Marseille' }, 
                            { value: 3, displayText: 'Lyon' }, 
                            { value: 4, displayText: 'Toulouse' },
                            { value: 5, displayText: 'Nice' }
                        ];
                    case 2:
                        return [ 
                            { value: 1, displayText: 'Roma' }, 
                            { value: 2, displayText: 'Milano' }, 
                            { value: 3, displayText: 'Napoli' }, 
                            { value: 4, displayText: 'Torino' },
                            { value: 5, displayText: 'Paliemmu' }
                        ];
                    case 3:
                        return [ 
                            { value: 1, displayText: 'Lisboa' }, 
                            { value: 2, displayText: 'Oporto' }, 
                            { value: 3, displayText: 'Vila Nova de Gaia' }, 
                            { value: 4, displayText: 'Amadora' },
                            { value: 5, displayText: 'Braga' }
                        ];
                    case 4:
                        return [ 
                            { value: 1, displayText: 'Madrid' }, 
                            { value: 2, displayText: 'Barcelona' }, 
                            { value: 3, displayText: 'Valencia' }, 
                            { value: 4, displayText: 'Sevilla' },
                            { value: 5, displayText: 'Zaragoza' }
                        ];
                    case 5:
                        return [ 
                            { value: 1, displayText: 'London' }, 
                            { value: 2, displayText: 'Birmingham' }, 
                            { value: 3, displayText: 'Glasgow' }, 
                            { value: 4, displayText: 'Liverpool' },
                            { value: 5, displayText: 'Leeds' }
                        ];
                    default:
                        throw 'Unknown country: ' + data.dependedValues.country;
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
        hobbies: {
            type: 'checkboxes',
            translateOptions: true,
            options: [ 'reading_option', 'videogames_option', 'sports_option', 'cards_option' ]
        },
        skills: {
            type: 'subform',
            subformKey: 'code',
            fields: { 
                code: { },
                name: { },
                datetime: {
                    type: 'datetime'
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

    validation: {
        modules: 'security, date',
        rules: {
            '#zcrud-name': {
                validation: 'length',
                length: '3-12'
            }
        }
    },

    ajax: {
        ajaxFunction: zcrudServerSide.ajax
    },

    i18n: {
        language: 'en',
        files: { 
            en: [ 'en-common.json', 'en-people.json' ],
            es: [ 'es-common.json', 'es-people.json' ] 
        }
    }
};

var callback = function( options ){
    $( '#container' ).zcrud( 'renderList' );
};

// This is needed to make the git pages work
options.filesPathPrefix = location.pathname.startsWith( '/Zcrud' )? '/Zcrud': '';
zpt.context.getConf().externalMacroPrefixURL = options.filesPathPrefix + '/';

zpt.run(
    {
        command: 'preload',
        root: [ 
            document.getElementById( 'commonHeader' ), 
            document.getElementById( 'commonFooter' )
        ],
        dictionary: {},
        declaredRemotePageUrls: [ 'templates.html' ],
        callback: function(){
            zpt.run();
            $( '#container' ).zcrud( 'init', options, callback );
        }
    }
);

