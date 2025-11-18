
import sweetalert from '../../lib/sweetalert-esm.js';

import { utils } from './utils.js';
import { requestHelper } from './requestHelper.js';
import { context } from './context.js';

// Components
import { PagingComponent } from './components/pagingComponent.js';
import { SortingComponent } from './components/sortingComponent.js';
import { FilteringComponent } from './components/filteringComponent.js';
import { SelectingComponent } from './components/selectingComponent.js';
import { EditingComponent } from './components/editingComponent.js';
import { TemplatingComponent } from './components/templatingComponent.js';

// Fields
import { Field } from './fields/field.js';
import { Datetime } from './fields/datetime.js';
import { OptionsField } from './fields/optionsField.js';
import { Checkbox } from './fields/checkbox.js';
import { Subform } from './fields/subform.js';
import { FileUpload } from './fields/fileUpload.js';

// Buttons
import { GenericButton } from './buttons/genericButton.js';
import { UndoButton } from './buttons/undoButton.js';
import { RedoButton } from './buttons/redoButton.js';
import { CancelButton as FormPageCancelButton } from './buttons/formPage/cancelButton.js';
import { CopySubformRowsButton as FormPageCopySubformRowsButton } from './buttons/formPage/copySubformRowsButton.js';
import { SubmitButton as FormPageSubmitButton } from './buttons/formPage/submitButton.js';
import { AddNewRowButton as ListPageAddNewRowButton } from './buttons/listPage/addNewRowButton.js';
import { DeleteRowButton as ListPageDeleteRowButton } from './buttons/listPage/deleteRowButton.js';
import { ShowCreateFormButton as ListPageShowCreateFormButton } from './buttons/listPage/showCreateFormButton.js';
import { ShowDeleteFormButton as ListPageShowDeleteFormButton } from './buttons/listPage/showDeleteFormButton.js';
import { ShowEditFormButton  as ListPageShowEditFormButton} from './buttons/listPage/showEditFormButton.js';
import { SubmitButton as ListPageSubmitButton} from './buttons/listPage/submitButton.js';
import { AddNewRowButton as SubformAddNewRowButton } from './buttons/subform/addNewRowButton.js';
import { DeleteRowButton as SubformDeleteRowButton } from './buttons/subform/deleteRowButton.js';
import { ShowCreateFormButton as SubformShowCreateFormButton} from './buttons/subform/showCreateFormButton.js';
import { ShowDeleteFormButton as SubformShowDeleteFormButton } from './buttons/subform/showDeleteFormButton.js';
import { ShowEditFormButton as SubformShowEditFormButton} from './buttons/subform/showEditFormButton.js';

// JSONBuilders
import { onlyChangesJSONBuilder } from './jsonBuilders/onlyChangesJSONBuilder.js';

// Misc
import { TabsAutomatic } from './components/containers/tabsAutomatic.js';

export const defaultOptions = {

    validation: {
        showBrowserMessageBubbles: false,
        useBrowserMessages: false,
        customValidations: {
            mustBeEqualTo: function( mustBeEqualToFieldId, field, thisFieldValue, page ){
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
            constructorClass: PagingComponent,
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
            constructorClass: SortingComponent,
            loadFromLocalStorage: true,
            default: {
                fieldId: undefined,
                type: undefined
            },
            allowUser: false
        },
        filtering: {
            isOn: false,
            constructorClass: FilteringComponent,
            fieldsTemplate: 'compact-editable@templates/fieldLists.html'
        },
        selecting: {
            isOn: false,
            constructorClass: SelectingComponent,
            multiple: true,
            mode: [ 'checkbox', 'onRowClick' ] // possible values: 'checkbox' and 'onRowClick'
        },
        editing: {
            isOn: false,
            constructorClass: EditingComponent,
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
        },
        templating: {
            isOn: true,
            constructorClass: TemplatingComponent,
            mapping: {
                tabContainer: function(){
                    var tablists = document.querySelectorAll( '[role=tablist].automatic' );
                    for ( var i = 0; i < tablists.length; i++ ) {
                        new TabsAutomatic( tablists[ i ] );
                    }
                }
            }
        }
    },
    
    fields: {},
    fieldsConfig: {
        constructors: {
            default: Field,
            mapping: [
                {
                    fieldTypes: [ 'date', 'datetime', 'time' ],
                    constructor: Datetime
                },
                {
                    fieldTypes: [ 'datalist', 'select', 'radio', 'checkboxes' ],
                    constructor: OptionsField
                },
                {
                    fieldTypes: [ 'checkbox' ],
                    constructor: Checkbox
                },
                {
                    fieldTypes: [ 'subform' ],
                    constructor: Subform
                },
                {
                    fieldTypes: [ 'fileUpload' ],
                    constructor: FileUpload
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
            },
            file: {
                maxFileSize: 1024 * 1024, // 1Mb
                minFileSize:    1 * 1024  // 1Kb
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
            'custom': {},
            'tabContainer': {
                template: 'tabContainer@templates/containers/basic.html'
            },
            'tabItem': {
                template: 'tabItem@templates/containers/basic.html'
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
        selectionChanged: function ( data ) {},
        listCreated: function ( data ) {}
    },

    buttons: {
        generic: GenericButton,
        undo: UndoButton,
        redo: RedoButton,

        form_cancel: FormPageCancelButton,
        form_copySubformRows: FormPageCopySubformRowsButton,
        form_submit: FormPageSubmitButton,

        list_addNewRow: ListPageAddNewRowButton,
        list_deleteRow: ListPageDeleteRowButton,
        list_showCreateForm: ListPageShowCreateFormButton,
        list_showDeleteForm: ListPageShowDeleteFormButton,
        list_showEditForm: ListPageShowEditFormButton,
        list_submit: ListPageSubmitButton,

        subform_addNewRow: SubformAddNewRowButton,
        subform_deleteRow: SubformDeleteRowButton,
        subform_showCreateForm: SubformShowCreateFormButton,
        subform_showDeleteForm: SubformShowDeleteFormButton,
        subform_showEditForm: SubformShowEditFormButton
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

    jsonBuilder: onlyChangesJSONBuilder,
    
    defaultErrorOptions: {
        icon: 'error',
        closeOnClickOutside: false,
        i18nTitle: 'errorTitle'
    },
    errorFunction: function( message ){
        var swal = sweetalert;
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
        var swal = sweetalert;
        var thisOptions = utils.extend( true, {}, this.defaultConfirmOptions, confirmOptions );
        swal( thisOptions ).then( onFulfilled );
    },
    
    defaultShowMessageOptions: {
        icon: 'info',
        closeOnClickOutside: false,
        className: 'showMessage'
    },
    showMessageFunction: function( messageOptions ){
        var swal = sweetalert;
        var thisOptions = utils.extend( true, {}, this.defaultShowMessageOptions, messageOptions );
        swal( thisOptions );
    },
    
    subformsRecordsSuffix: 'ZCrudRecords'
};