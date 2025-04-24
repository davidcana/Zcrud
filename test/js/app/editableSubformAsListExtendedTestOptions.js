'use strict';

var testServerSide = require( './testServerSide' );
//var log4javascript = require( 'log4javascript' );

module.exports = {

    entityId: 'department',
    saveUserPreferences: false,
    
    pageConf: {
        defaultPageConf: {
            updateURL: 'http://localhost/CRUDManager.do?cmd=BATCH_UPDATE&table=memberCheck',
            getRecordURL: 'http://localhost/CRUDManager.do?cmd=GET&table=memberCheck',
            confirm: {
                save: false,
                cancel: false
            }
        },
        pages: {
            customForm: {
                fields: [ 
                    {
                        'type': 'fieldsGroup'
                    }
                ],
                buttons: {
                    toolbar: [ 
                        'undo', 
                        'redo', 
                        'form_submit',
                        {
                            type: 'form_copySubformRows',
                            source: 'originalMembers',
                            target: 'verifiedMembers',
                            onlySelected: true,
                            removeFromSource: false,
                            deselect: true,
                            title: 'Copy original members',
                            textsBundle: {
                                title: undefined,
                                content: {
                                    translate: false,
                                    text: 'Copy original members'
                                }  
                            }
                        }
                    ]
                }
            },
            update: {
                key: 'code',
                getRecordURL: 'http://localhost/CRUDManager.do?cmd=GET&table=originalMembers',
                updateURL: 'http://localhost/CRUDManager.do?cmd=BATCH_UPDATE&table=originalMembers',
                fields: [
                    {
                        'type': 'fieldsGroup',
                        'source': 'subform/originalMembers'
                    }
                ]
            },
            create: {
                key: 'code',
                updateURL: 'http://localhost/CRUDManager.do?cmd=BATCH_UPDATE&table=originalMembers',
                fields: [
                    {
                        'type': 'fieldsGroup',
                        'source': 'update'
                    }
                ]
            },
            delete: {
                key: 'code',
                getRecordURL: 'http://localhost/CRUDManager.do?cmd=GET&table=originalMembers',
                updateURL: 'http://localhost/CRUDManager.do?cmd=BATCH_UPDATE&table=originalMembers',
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
        originalMembers: {
            type: 'subform',
            getGroupOfRecordsURL: 'http://localhost/CRUDManager.do?cmd=LIST&table=memberCheck',
            readOnly: true,
            subformKey: 'code',
            fields: { 
                code: { },
                name: { },
                datetime: {
                    type: 'datetime'
                },
                browser: {
                    type: 'datalist',
                    options: [ 'Internet Explorer', 'Firefox', 'Chrome', 'Opera', 'Safari' ]
                },
                important: {
                    type: 'checkbox'
                },
                hobbies: {
                    type: 'checkboxes',
                    translateOptions: true,
                    options: [ 'reading_option', 'videogames_option', 'sports_option', 'cards_option' ]
                }
            },
            components: {
                paging: {
                    isOn: true
                },
                selecting: {
                    isOn: true
                }
            },
            buttons: {
                toolbar: [ 'subform_showCreateForm' ],
                byRow: [ 'subform_showEditForm', 'subform_showDeleteForm' ]
            }
        },
        verifiedMembers: {
            type: 'subform',
            subformKey: 'code',
            fields: { 
                code: { },
                name: {
                    attributes:{
                        field: {
                            minlength: 3,
                            maxlength: 20,
                            pattern: '.{3,20}' // Must use pattern to make the tests work properly
                        }
                    }
                },
                datetime: {
                    type: 'datetime'
                },
                browser: {
                    type: 'datalist',
                    options: [ 'Internet Explorer', 'Firefox', 'Chrome', 'Opera', 'Safari' ]
                },
                important: {
                    type: 'checkbox'
                },
                hobbies: {
                    type: 'checkboxes',
                    translateOptions: true,
                    options: [ 'reading_option', 'videogames_option', 'sports_option', 'cards_option' ]
                }
            },
            buttons: {
                toolbar: [ 'subform_showCreateForm' ]
            }
        }
    },

    ajax:{
        ajaxFunction: testServerSide.ajax    
    },
    /*
    templates: {
        declaredRemotePageUrls: [ 'templates/fieldLists.html', 'templates/lists.html' ]
    },*/
    
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
