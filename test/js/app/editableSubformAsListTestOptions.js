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
                description: {
                    type: 'textarea',
                    attributes: {
                        field: {
                            rows: 2,
                            cols: 40
                        }
                    }
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
                byRow: []
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
                description: {
                    type: 'textarea',
                    attributes: {
                        field: {
                            rows: 2,
                            cols: 40
                        }
                    }
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
