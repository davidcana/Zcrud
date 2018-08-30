"use strict";

var $ = require( 'jquery' );
var log4javascript = require( 'log4javascript' );

module.exports = {

    validation: {
        modules: '',
        rules: {},
        configuration: {
            errorMessageClass: 'form-error-inline-absolute', // form-error-fixed, form-error-inline-static and form-error-inline-absolute already exist
            borderColorOnError: ''
        }
    },
    dictionary: {},

    saveUserPreferences: true,
    body: document.body,
    entityId: 'entity',

    fields: {},
    fieldsConfig: {
        constructors: {
            default: require( './fields/field.js' ),
            mapping: [
                {
                    fieldTypes: [ 'date', 'datetime', 'time' ],
                    constructor: require( './fields/datetime.js' )
                },
                {
                    fieldTypes: [ 'datalist', 'select', 'radio', 'checkboxes' ],
                    constructor: require( './fields/optionsField.js' )
                },
                {
                    fieldTypes: [ 'checkbox' ],
                    constructor: require( './fields/checkbox.js' )
                },
                {
                    fieldTypes: [ 'subform' ],
                    constructor: require( './fields/subform.js' )
                }
            ]
        },
        defaultFieldOptions: {
            datetime: {
                customOptions: {
                    inline: false,
                    minYear: 1950,
                    maxYear: 2050,
                    maxHour: 23,
                    minutesStep: 5,
                    timerDelay: 100
                }
            },
            date: {
                customOptions: {
                    inline: false,
                    minYear: 1950,
                    maxYear: 2050
                }
            },
            time: {
                customOptions: {
                    inline: false,
                    maxHour: 99,
                    minutesStep: 5,
                    timerDelay: 100
                }
            },
            subform: {
                buttons: {
                    toolba2: [ 'subform_addNewRow' ],
                    byRo2: [ 'subform_editCommand', 'subform_deleteCommand' ]  
                },
                components: {
                    paging: {
                        isOn: false,
                        constructorClass: require( './components/pagingComponent.js' ),
                        defaultPageSize: 10,
                        pageSizes: [10, 25, 50, 100, 250, 500],
                        pageSizeChangeArea: true,
                        gotoPageFieldType: 'combobox', // possible values: 'textbox', 'combobox', 'none'
                        gotoPageFieldAttributes: {},
                        maxNumberOfAllShownPages: 5,
                        block1NumberOfPages: 1,
                        block2NumberOfPages: 5,
                        block3NumberOfPages: 1
                    },
                    sorting: {
                        isOn: false,
                        constructorClass: require( './components/sortingComponent.js' ),
                        loadFromLocalStorage: true,
                        default: {
                            fieldId: undefined,
                            type: undefined
                        },
                        allowUser: false
                    },
                    filtering: {
                        isOn: false,
                        constructorClass: require( './components/filteringComponent.js' ),
                        fieldsTemplate: 'compact-editable@templates/fieldLists.html'
                    },
                    selecting: {
                        isOn: false,
                        constructorClass: require( './components/selectingComponent.js' ),
                        multiple: true,
                        mode: [ 'checkbox', 'onRowClick' ] // possible values: 'checkbox' and 'onRowClick'
                    }
                }
            }
        },
        getDefaultFieldTemplate: function( field ){
            return field.type + '@templates/fields/basic.html';
        }
    },

    containers: {
        types: {
            'fieldSet': {
                template: 'fieldSet@templates/containers/basic.html'
            },
            'div': {
                template: 'div@templates/containers/basic.html'
            }
        }
    },
    
    events: {
        formClosed: function ( data, event ) {},
        formCreated: function ( data ) {},
        formSubmitting: function ( data, event ) {},
        recordAdded: function ( data, event ) {},
        recordDeleted: function ( data, event ) {},
        recordUpdated: function ( data, event ) {},
        formBatchUpdated: function ( data, event ) {},
        selectionChanged: function ( data ) {}
    },

    buttons: {
        undo: require( './buttons/undoButton.js' ),
        redo: require( './buttons/redoButton.js' ),

        form_cancel: require( './buttons/formPage/cancelButton.js' ),
        form_submit: require( './buttons/formPage/submitButton.js' ),
        form_copySubformRows: require( './buttons/formPage/copySubformRowsButton.js' ),
        
        list_showCreateForm: require( './buttons/listPage/showCreateFormButton.js' ),
        list_save: require( './buttons/listPage/saveButton.js' ),
        list_addNewRow: require( './buttons/listPage/addNewRowButton.js' ),
        list_showEditForm: require( './buttons/listPage/showEditFormButton.js' ),
        list_showDeleteForm: require( './buttons/listPage/showDeleteFormButton.js' ),
        list_deleteRow: require( './buttons/listPage/deleteRowButton.js' ),

        subform_addNewRow: require( './buttons/subform/addNewRowButton.js' ),
        subform_showCreateForm: require( './buttons/subform/showCreateFormButton.js' ),
        subform_deleteCommand: require( './buttons/subform/deleteCommandButton.js' ),
        subform_deleteRow: require( './buttons/subform/deleteRowButton.js' ),
        subform_editCommand: require( './buttons/subform/editCommandButton.js' )
    },
    
    pageConf: {
        defaultPageConf: {
            showStatus: false,
            modifiedFieldsClass: 'zcrud-modified-field',
            modifiedRowsClass: 'zcrud-modified-row',
            hideTr: function( $tr ){
                $tr.fadeOut();
            },
            showTr: function( $tr ){
                $tr.fadeIn();
            },
            buttons: {
                byRo2: [],
                toolbar: {
                    undo: true,
                    redo: true,
                    cancel: true,
                    save: true
                },
                toolbarExtension: undefined,
                byRow: {
                    openEditRegisterForm: true,
                    openDeleteRegisterForm: true,
                    deleteRegisterRow: true,
                }
            }
        },
        pages: {
            list: {
                template: "listDefaultTemplate@templates/lists.html",
                showStatus: true,
                components: {
                    paging: {
                        isOn: true,
                        constructorClass: require( './components/pagingComponent.js' ),
                        defaultPageSize: 10,
                        pageSizes: [10, 25, 50, 100, 250, 500],
                        pageSizeChangeArea: true,
                        gotoPageFieldType: 'combobox', // possible values: 'textbox', 'combobox', 'none'
                        gotoPageFieldAttributes: {},
                        maxNumberOfAllShownPages: 5,
                        block1NumberOfPages: 1,
                        block2NumberOfPages: 5,
                        block3NumberOfPages: 1
                    },
                    sorting: {
                        isOn: false,
                        constructorClass: require( './components/sortingComponent.js' ),
                        loadFromLocalStorage: true,
                        default: {
                            fieldId: undefined,
                            type: undefined
                        },
                        allowUser: false
                    },
                    filtering: {
                        isOn: false,
                        constructorClass: require( './components/filteringComponent.js' ),
                        fieldsTemplate: 'compact-editable@templates/fieldLists.html'
                    },
                    selecting: {
                        isOn: false,
                        constructorClass: require( './components/selectingComponent.js' ),
                        multiple: true,
                        mode: [ 'checkbox', 'onRowClick' ] // possible values: 'checkbox' and 'onRowClick'
                    },
                    editing: {
                        isOn: false,
                        constructorClass: require( './components/editingComponent.js' ),
                        modifiedFieldsClass: 'zcrud-modified-field',
                        modifiedRowsClass: 'zcrud-modified-row',
                        hideTr: function( $tr ){
                            $tr.fadeOut();
                        },
                        showTr: function( $tr ){
                            $tr.fadeIn();
                        }
                    }
                },
                buttons: {
                    toolba2: [ 'list_showCreateForm' ],
                    byRo2: [
                        'list_showEditForm', 'list_showDeleteForm'
                    ],
                    toolbar: {
                        newRegisterRow: undefined,
                        openNewRegisterForm: undefined,
                        copySubformRows: undefined,
                        undo: undefined,
                        redo: undefined,
                        save: undefined
                    },
                    byRow: {
                        openEditRegisterForm: undefined,
                        openDeleteRegisterForm: undefined,
                        deleteRegisterRow: undefined,
                    }
                }
            }, 
            create: {
                template: "formDefaultTemplate@templates/forms.html",
                buttons: {
                    toolba2: [ 'undo', 'redo', 'form_cancel', 'form_submit' ]
                }
            }, 
            update: {
                template: "formDefaultTemplate@templates/forms.html",
                buttons: {
                    toolba2: [ 'undo', 'redo', 'form_cancel', 'form_submit' ]
                }
            }, 
            delete: {
                template: "deleteDefaultTemplate@templates/forms.html",
                buttons: {
                    toolba2: [ 'form_cancel', 'form_submit' ]
                }
            }
        }
    },

    templates: {
        declaredRemotePageUrls: [ 'templates/fieldLists.html' ]
        //busyTemplate: "busyDefaultTemplate@templates/misc.html"
    },

    ajax: {
        ajaxFunction: $.ajax,
        defaultFormAjaxOptions: {
            dataType   : 'json',
            contentType: 'application/json; charset=UTF-8',
            type       : 'POST'
        },
        ajaxPreFilter: function( data ){
            return data;
        },
        ajaxPostFilter : function( data ){
            return data;
        }
    },

    i18n: {
        language: 'en',
        filesPath: 'i18n',
        i18nArrayVarName: 'i18nArray',
        files: { 
            en: [ 'en-common.json' ],
            es: [ 'es-common.json' ] 
        }
    },

    logging: {
        isOn: false,
        level: log4javascript.Level.ERROR
    },

    jsonBuilder: require( './jsonBuilders/onlyChangesJSONBuilder.js' ),
    
    fatalErrorFunction: function( message ){
        alert( message );
    }
};