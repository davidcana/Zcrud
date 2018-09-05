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
                url: 'http://localhost/CRUDManager.do?cmd=BATCH_UPDATE&table=originalMembers',
                fields: [
                    {
                        "type": "fieldsGroup",
                        "source": "subform/originalMembers"
                    }
                ]
            },
            create: {
                key: 'code',
                url: 'http://localhost/CRUDManager.do?cmd=BATCH_UPDATE&table=originalMembers',
                fields: [
                    {
                        "type": "fieldsGroup",
                        "source": "update"
                    }
                ]
            },
            delete: {
                key: 'code',
                getRecordURL: 'http://localhost/CRUDManager.do?cmd=GET&table=originalMembers',
                url: 'http://localhost/CRUDManager.do?cmd=BATCH_UPDATE&table=originalMembers',
                fields: [
                    {
                        "type": "fieldsGroup",
                        "source": "update"
                    }
                ]
            }
        }
    },
    
    key : 'id',
    fields: {
        originalMembers: {
            type: 'subform',
            url: 'http://localhost/CRUDManager.do?cmd=LIST&table=memberCheck',
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
                byRow: [ 'subform_editCommand', 'subform_showDeleteForm' ]
            }
        },
        verifiedMembers: {
            type: 'subform',
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
            buttons: {
                toolbar: [ 'subform_showCreateForm' ]
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
