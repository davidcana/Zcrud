"use strict";

var testUtils = require( './testUtils' );
var log4javascript = require( 'log4javascript' );

module.exports = {

    entityId: 'department',
    saveUserPreferences: false,
    
    pageConf: {
        defaultPageConf: {
            url: 'http://localhost/CRUDManager.do?cmd=BATCH_UPDATE&table=memberCheck',
            getRecordURL: 'http://localhost/CRUDManager.do?cmd=GET&table=memberCheck'
        },
        pages: {
            list: {
                template: "formDefaultTemplate@templates/forms.html",
                fields: [ 
                    {
                        "type": "fieldsGroup"
                    }
                ],
                buttons: {
                    toolbar: {
                        undo: true,
                        redo: true,
                        copySubformRows: {
                            source: 'originalMembers',
                            target: 'verifiedMembers',
                            onlySelected: true,
                            removeFromSource: false,
                            title: 'Copy original members'
                        }
                    }
                }
            }
        }
    },
    
    key : 'id',
    fields: {
        originalMembers: {
            type: 'subform',
            url: 'http://localhost/CRUDManager.do?cmd=LIST&table=memberCheck',
            readOnly: true,
            fields: { 
                code: { 
                    subformKey: true
                },
                name: { },
                description: {
                    type: 'textarea',
                    formFieldAttributes: {
                        rows: 2,
                        cols: 40
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
                toolbar: {
                    newRegisterRow: false
                },
                byRow: {
                    openEditRegisterForm: false,
                    openDeleteRegisterForm: false,
                    deleteRegisterRow: false
                }
            }
        },
        verifiedMembers: {
            type: 'subform',
            fields: { 
                code: { 
                    subformKey: true
                },
                name: { },
                description: {
                    type: 'textarea',
                    formFieldAttributes: {
                        rows: 2,
                        cols: 40
                    }
                }
            },
            buttons: {
                toolbar: {
                    newRegisterRow: true
                },
                byRow: {
                    openEditRegisterForm: false,
                    openDeleteRegisterForm: false,
                    deleteRegisterRow: true
                }
            }
        }
    },

    validation: {
        modules: 'security, date',
        rules: {
            'verifiedMembers-name': {
                validation: 'length',
                length: '3-20'
            }
        }
    },
    
    ajax:{
        ajaxFunction: testUtils.ajax    
    },
    
    templates: {
        declaredRemotePageUrls: [ 'templates/fieldLists.html', 'templates/lists.html' ]
    },
    
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
