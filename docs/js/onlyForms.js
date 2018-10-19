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
                        type: "fieldsGroup",
                        source: [ 
                            'month', 
                            'year'
                        ],
                        container: {
                            id: 'filterMembers',
                            containerType: 'fieldSet',
                            buttons: [ 'form_filter' ]
                        }
                    },
                    'originalMembers', 
                    'verifiedMembers'
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
        month: {
            type: 'select',
            translateOptions: true,
            options: [
                { value: 1, displayText: 'January' }, 
                { value: 2, displayText: 'February' },
                { value: 3, displayText: 'March' }, 
                { value: 4, displayText: 'April' }, 
                { value: 5, displayText: 'May' },
                { value: 6, displayText: 'June' }, 
                { value: 7, displayText: 'July' },
                { value: 8, displayText: 'August' }, 
                { value: 9, displayText: 'September' }, 
                { value: 10, displayText: 'October' },
                { value: 11, displayText: 'November' },
                { value: 12, displayText: 'December' }
            ]
        },
        year: {
            type: 'select',
            translateOptions: false,
            options: [ 2016, 2017, 2018 ]
        },
        originalMembers: {
            type: 'subform',
            url: 'http://localhost/CRUDManager.do?cmd=LIST&table=people',
            readOnly: true,
            subformKey: 'id',
            fields: { 
                id: { },
                name: { },
                datetime: {
                    type: 'datetime'
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
                    defaultValue: '4'
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
                toolbar: [],
                byRow: []
            }
        },
        verifiedMembers: {
            type: 'subform',
            subformKey: 'id',
            fields: { 
                id: { },
                name: { },
                datetime: {
                    type: 'datetime'
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
                    defaultValue: '4'
                }
            },
            buttons: {
                toolbar: [ 'subform_addNewRow' ]
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
            en: [ 'en-common.json', 'en-people.json' ],
            es: [ 'es-common.json', 'es-people.json' ] 
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
        
        $( '#container' ).zcrud( 
            'init',
            options,
            function( options ){
                $( '#container' ).zcrud( 'renderForm' );
            }
        );
    }
);

