//

var options = {

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
                toolbar: [ 'subform_showCreateForm' ],
                byRow: []
            }
        },
        verifiedMembers: {
            type: 'subform',
            subformKey: 'code',
            fields: { 
                code: { },
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

    ajax: {
        ajaxFunction: zcrudServerSide.ajax
    },
    
    templates: {
        declaredRemotePageUrls: [ 'templates/fieldLists.html', 'templates/lists.html' ]
    },
    
    i18n: {
        language: 'en',
        files: { 
            en: [ 'en-common.json', 'en-services.json' ],
            es: [ 'es-common.json', 'es-services.json' ] 
        }
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
                $( '#departmentsContainer' ).zcrud( 'renderForm' );
            }
        );
    }
);

