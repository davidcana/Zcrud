'use strict';

var utils = require( './utils.js' );
var requestHelper = require( './requestHelper.js' );
const context = require( './context.js' );

module.exports = {

    validation: {
        showBrowserMessageBubbles: false,
        useBrowserMessages: false,
        customValidations: {
            mustBeEqualTo: function( mustBeEqualToFieldId, field, thisFieldValue, options, page ){
                // Get equalField
                var equalField = page.getField( mustBeEqualToFieldId );
                if ( ! equalField ){
                    alert( 'Not found field in mustBeEqualTo custom validation: ' + mustBeEqualToFieldId );
                    return false;
                }

                // Set the value of fieldsToCheckOnChange so mustBeEqualToFieldId is also checked
                field.fieldsToCheckOnChange = [ mustBeEqualToFieldId ];

                // Get equalFieldValue
                var equalFieldValue = equalField.getValueFromForm( equalField.get$() );

                // If any of the values are empty do not check anything
                if ( ! equalFieldValue || ! thisFieldValue ){
                    return true;
                }

                // If both values are equal return true; otherwise show badInput error
                return equalFieldValue == thisFieldValue? true: 'badInput';
            }
        }
    },

    dictionary: {
        u: utils
    },

    saveUserPreferences: true,
    entityId: 'entity',
    
    defaultComponentsConfig: {
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
            },
            confirm: {
                save: true
            }
        }
    },
    
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
                },
                {
                    fieldTypes: [ 'fileUpload' ],
                    constructor: require( './fields/fileUpload.js' )
                }
            ]
        },
        defaultFieldOptions: {
            datetime: {
                inline: false,
                minYear: 1950,
                maxYear: 2050,
                maxHour: 23,
                minutesStep: 5,
                timerDelay: 100
            },
            date: {
                inline: false,
                minYear: 1950,
                maxYear: 2050
            },
            time: {
                inline: false,
                maxHour: 99,
                minutesStep: 5,
                timerDelay: 100
            },
            subform: {
                buttons: {
                    toolbar: [ 'subform_addNewRow' ],
                    byRow: [ 'subform_deleteRow' ]  
                },
                components: {}
            },
            textarea: {
                attributes: {
                    field: {
                        rows: 6,
                        cols: 80
                    }
                }
            },
            number: {
                templateMacro: 'text'
            },
            password: {
                templateMacro: 'text',
                attributes: {
                    field: {
                        minlength: 8,
                        maxlength: 12,
                        pattern: '[0-9a-zA-Z ]{8,12}'
                    }
                }
            }
        },
        getDefaultFieldTemplate: function( field ){
            return ( field.templateMacro || field.type ) + '@templates/fields/basic.html';
        }
    },

    containers: {
        types: {
            'fieldSet': {
                template: 'fieldSet@templates/containers/basic.html'
            },
            'div': {
                template: 'div@templates/containers/basic.html'
            },
            'custom': {}
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
        selectionChanged: function ( data ) {},
        listCreated: function ( data ) {}
    },

    buttons: {
        generic: require( './buttons/genericButton.js' ),
        undo: require( './buttons/undoButton.js' ),
        redo: require( './buttons/redoButton.js' ),

        form_cancel: require( './buttons/formPage/cancelButton.js' ),
        form_copySubformRows: require( './buttons/formPage/copySubformRowsButton.js' ),
        form_submit: require( './buttons/formPage/submitButton.js' ),
        
        list_addNewRow: require( './buttons/listPage/addNewRowButton.js' ),
        list_deleteRow: require( './buttons/listPage/deleteRowButton.js' ),
        list_showCreateForm: require( './buttons/listPage/showCreateFormButton.js' ),
        list_showDeleteForm: require( './buttons/listPage/showDeleteFormButton.js' ),
        list_showEditForm: require( './buttons/listPage/showEditFormButton.js' ),
        list_submit: require( './buttons/listPage/submitButton.js' ),
        
        subform_addNewRow: require( './buttons/subform/addNewRowButton.js' ),
        subform_deleteRow: require( './buttons/subform/deleteRowButton.js' ),
        subform_showCreateForm: require( './buttons/subform/showCreateFormButton.js' ),
        subform_showDeleteForm: require( './buttons/subform/showDeleteFormButton.js' ),
        subform_showEditForm: require( './buttons/subform/showEditFormButton.js' )
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
                byRow: []
            },
            confirm: {
                save: true,
                cancel: true
            }
        },
        pages: {
            list: {
                template: 'listDefaultTemplate@templates/lists.html',
                showStatus: true,
                components: {
                    paging: {
                        isOn: true
                    }
                },
                buttons: {
                    toolbar: [ 'list_showCreateForm' ],
                    byRow: [ 'list_showEditForm', 'list_showDeleteForm' ]
                }
            }, 
            create: {
                template: 'formDefaultTemplate@templates/forms.html',
                components: {},
                buttons: {
                    toolbar: [ 'undo', 'redo', 'form_cancel', 'form_submit' ]
                }
            }, 
            update: {
                template: 'formDefaultTemplate@templates/forms.html',
                components: {},
                buttons: {
                    toolbar: [ 'undo', 'redo', 'form_cancel', 'form_submit' ]
                }
            }, 
            delete: {
                template: 'deleteDefaultTemplate@templates/forms.html',
                components: {},
                buttons: {
                    toolbar: [ 'form_cancel', 'form_submit' ]
                }
            },
            customForm: {
                template: 'formDefaultTemplate@templates/forms.html',
                showStatus: true,
                components: {
                    paging: {
                        isOn: true
                    }
                },
                buttons: {
                    toolbar: [ 'list_showCreateForm' ],
                    byRow: [ 'list_showEditForm', 'list_showDeleteForm' ]
                }
            }
        }
    },
    
    filesPathPrefix: '',
    
    templates: {
        filesPath: '/',
        declaredRemotePageUrls: [ 'templates/lists.html', 'templates/fieldLists.html' ]
    },

    ajax: {
        ajaxFunction: requestHelper.fetch,
        //defaultFormAjaxOptions: {
        //    dataType   : 'json',
        //    contentType: 'application/json; charset=UTF-8',
        //    type       : 'POST'
        //},
        ajaxPreFilter: function( data ){
            return data;
        },
        ajaxPostFilter : function( data ){
            return data;
        }
    },

    i18n: {
        language: 'en',
        filesPath: '/i18n/',
        files: { 
            en: [ 'en-common.json' ],
            es: [ 'es-common.json' ] 
        }
    },

    logging: {
        isOn: false,
        level: 'error'
    },

    jsonBuilder: require( './jsonBuilders/onlyChangesJSONBuilder.js' ),
    
    defaultErrorOptions: {
        icon: 'error',
        closeOnClickOutside: false,
        i18nTitle: 'errorTitle'
    },
    errorFunction: function( message ){
        var swal = require( 'sweetalert' );
        var thisOptions = utils.extend( true, {}, this.defaultErrorOptions );
        if ( ! thisOptions.title ){
            thisOptions.title = context.translate( this.defaultErrorOptions.i18nTitle );
        }
        thisOptions.text = message;
        swal( thisOptions );
    },
    
    defaultConfirmOptions: {
        icon: 'warning',
        dangerMode: true,
        closeOnClickOutside: false,
        className: 'confirm'
    },
    confirmFunction: function( confirmOptions, onFulfilled ){
        var swal = require( 'sweetalert' );
        var thisOptions = utils.extend( true, {}, this.defaultConfirmOptions, confirmOptions );
        swal( thisOptions ).then( onFulfilled );
    },
    
    defaultShowMessageOptions: {
        icon: 'info',
        closeOnClickOutside: false,
        className: 'showMessage'
    },
    showMessageFunction: function( messageOptions ){
        var swal = require( 'sweetalert' );
        var thisOptions = utils.extend( true, {}, this.defaultShowMessageOptions, messageOptions );
        swal( thisOptions );
    },
    
    subformsRecordsSuffix: 'ZCrudRecords'
};