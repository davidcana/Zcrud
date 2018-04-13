/* 

Public methods of ZCrud:
-----------------------

 - addRecord: Add a new record to the table. (!)
 - deleteRecord: Delete an existing record from the table. (!)
 - destroy: Completely removes table from it's container.
 - getRecordByKey: Get record by key field's value of the record.
 - init: Set options and normalize them.
 - load: Show the list page. 
 - selectedRecords: Return an array with the selected records.
 - selectedRows: Return a jQuery object with the selected rows.
 - selectRows: Make rows selected.
 - showCreateForm: Open a 'create new record' form dialog.
 - updateRecord: Update an existing record on the table. (!)
*/
var $ = require( 'jquery' );
var zpt = require( 'zpt' );
var log = zpt.logHelper;
var fieldBuilder = require( './fields/fieldBuilder.js' );
var context = require( './context.js' );
var ListPage = require( './pages/listPage.js' );
var FormPage = require( './pages/formPage.js' );
var log4javascript = require( 'log4javascript' );

exports.init = function( userOptions, callback ){
    
    /* defaultOptions */
    var defaultOptions = {

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
                }
            },
            getDefaultFieldTemplate: function( field ){
                return field.type + '@templates/fields/basic.html';
            }
        },
        
        events: {
            formClosed: function ( data, event ) {},
            formCreated: function ( data ) {},
            formSubmitting: function ( data, event ) {},
            recordAdded: function ( data, event ) {},
            recordDeleted: function ( data, event ) {},
            recordUpdated: function ( data, event ) {},
            selectionChanged: function ( data ) {}
        },
        
        pages: {
            list: {
                template: "listDefaultTemplate@templates/lists.html",
                components: {
                    paging: {
                        isOn: true,
                        defaultPageSize: 10,
                        pageSizes: [10, 25, 50, 100, 250, 500],
                        pageSizeChangeArea: true,
                        gotoPageArea: 'combobox', // possible values: 'textbox', 'combobox', 'none'
                        maxNumberOfAllShownPages: 5,
                        block1NumberOfPages: 1,
                        block2NumberOfPages: 5,
                        block3NumberOfPages: 1
                    },
                    sorting: {
                        isOn: false,
                        loadFromLocalStorage: true,
                        default: {
                            fieldId: undefined,
                            type: undefined
                        },
                        allowUser: false
                    },
                    filtering: {
                        isOn: false,
                        filteringComponentId: 'zcrud-filtering',
                        elementIdSuffix: '-filter'
                    },
                    selecting: {
                        isOn: false,
                        multiple: true,
                        mode: [ 'checkbox', 'onRowClick' ] // possible values: 'checkbox' and 'onRowClick'
                    },
                    editing: {
                        isOn: false,
                        event: 'batch',    // possible values: 'fieldChange', 'batch'
                        dataToSend: 'all', // possible values: 'modified', 'all',
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
                    toolbar: {
                        newRegisterRow: undefined,
                        openNewRegisterForm: undefined,
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
            }, create: {
                template: "formDefaultTemplate@templates/forms.html"
            }, update: {
                template: "formDefaultTemplate@templates/forms.html"
            }, delete: {
                template: "deleteDefaultTemplate@templates/forms.html"
            }
        },
        
        defaultFormConf: {
            event: 'batch',    // possible values: 'fieldChange', 'batch'
            dataToSend: 'all', // possible values: 'modified', 'all',
            modifiedFieldsClass: 'zcrud-modified-field',
            modifiedRowsClass: 'zcrud-modified-row',
            hideTr: function( $tr ){
                $tr.fadeOut();
            },
            showTr: function( $tr ){
                $tr.fadeIn();
            },
            buttons: {
                toolbar: {
                    undo: true,
                    redo: true,
                    cancel: true
                },
                byRow: {
                    openEditRegisterForm: true,
                    openDeleteRegisterForm: true,
                    deleteRegisterRow: true,
                }
            }
        },
        
        templates: {
            declaredRemotePageUrls: [],
            busyTemplate: "busyDefaultTemplate@templates/misc.html"
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
            files: {}
        },
        /*
        serverDataFormat: {
            datetime: 'm/d/Y H:i', 
            date: 'm/d/Y',          
            time: 'H:i',            
            decimalSeparator: '.'
        },*/
        
        logging: {
            isOn: false,
            level: log4javascript.Level.ERROR,
        },
        
        fatalErrorFunction: function( message ){
            alert( message );
        }
    };
    
    // Normalizes some options (sets default values)
    var normalizeOptions = function() {
        
        normalizeGeneralOptions();
        
        $.each( options.fields, function ( fieldId, field ) {
            normalizeFieldOptions( fieldId, field, options );
        });
        
        normalizeGeneralOptionsPostFields();
    };
    
    // Normalizes some general options (non related to fields)
    var normalizeGeneralOptions = function() {

        if ( options.formId == undefined ){
            options.formId = 'zcrud-form-' + options.entityId;
        }
        
        // Normalize list options
        var listOptions = options.pages.list;
        if ( listOptions.formId == undefined ){
            listOptions.formId = 'zcrud-list-form-' + options.entityId;
        }
        if ( listOptions.id == undefined ){
            listOptions.id = 'zcrud-list-' + options.entityId;
        }
        if ( listOptions.tableId == undefined ){
            listOptions.tableId = 'zcrud-list-table-' + options.entityId;
        }
        if ( listOptions.tbodyId == undefined ){
            listOptions.tbodyId = 'zcrud-list-tbody-' + options.entityId;
        }
        
        // Normalize editable list
        var editableListIsOn = listOptions.components.editing.isOn;
        var toolbar = listOptions.buttons.toolbar;
        if ( toolbar.newRegisterRow == undefined ){
            toolbar.newRegisterRow = editableListIsOn;
        }
        if ( toolbar.openNewRegisterForm == undefined ){
            toolbar.openNewRegisterForm = ! editableListIsOn;
        }
        if ( toolbar.undo == undefined ){
            toolbar.undo = editableListIsOn;
        }
        if ( toolbar.redo == undefined ){
            toolbar.redo = editableListIsOn;
        }
        if ( toolbar.save == undefined ){
            toolbar.save = editableListIsOn;
        }
        var byRow = listOptions.buttons.byRow;
        if ( byRow.openEditRegisterForm == undefined ){
            byRow.openEditRegisterForm = ! editableListIsOn;
        }
        if ( byRow.openDeleteRegisterForm == undefined ){
            byRow.openDeleteRegisterForm = ! editableListIsOn;
        }
        if ( byRow.deleteRegisterRow == undefined ){
            byRow.deleteRegisterRow = editableListIsOn;
        }
    };

    // Normalizes some options for a field (sets default values)
    var normalizeFieldOptions = function ( id, field, options, parent ) {
        
        // Set id
        field.id = id;
                
        // Set the key
        if ( field.key ){
            options.key = id;
        }
        field.name = id;
        
        // Set defaults when undefined
        if ( field.type == undefined ) {
            field.type = 'text';
        }
        if ( field.elementId == undefined ) {
            field.elementId = 'zcrud-' + id;
        }
        if ( field.elementName == undefined ) {
            field.elementName = parent? parent.id + context.subformSeparator + id: id;
        }
        //field.labelFor = fieldBuilder.getLabelFor( field, options );
        if ( field.template == undefined ){
            field.template = fieldBuilder.getTemplate( field, options );
        }
        context.declareRemotePageUrl( field.template, options.templates.declaredRemotePageUrls );
        if ( field.formFieldAttributes == undefined ){
            field.formFieldAttributes = {};
        }
        if ( field.sorting == undefined ){
            field.sorting = true;
        }
        
        // Convert dependsOn to array if it's a comma separated lists
        if ( field.dependsOn && $.type( field.dependsOn ) === 'string' ) {
            var dependsOnArray = field.dependsOn.split( ',' );
            field.dependsOn = [];
            for ( var i = 0; i < dependsOnArray.length; i++ ) {
                field.dependsOn.push( $.trim( dependsOnArray[ i ] ) );
            }
        }
        
        // 
        normalizeCustomOptionsField( field, options );
        
        // Normalize subfields in this field
        if ( field.fields ){
            $.each( field.fields, function ( subfieldId, subfield ) {
                normalizeFieldOptions( subfieldId, subfield, options, field );
            });
        }
    };
    
    var normalizeGeneralOptionsPostFields = function() {
        
        // Add remote page URLs to allDeclaredRemotePageUrls array
        options.allDeclaredRemotePageUrls = options.templates.declaredRemotePageUrls.slice();
        context.declareRemotePageUrl( options.templates.busyTemplate, options.allDeclaredRemotePageUrls );

        for ( var i in options.pages ) {
            var template = options.pages[ i ].template;
            context.declareRemotePageUrl( template, options.allDeclaredRemotePageUrls );
        }
        //alert( JSON.stringify( options.allDeclaredRemotePageUrls ) );
    };
    
    var normalizeCustomOptionsField = function( field, options ){

        if ( ! field.customOptions ){
            field.customOptions = {};
        }

        var defaultFieldOptions = options.fieldsConfig.defaultFieldOptions[ field.type ];
        if ( ! defaultFieldOptions ){
            defaultFieldOptions = {};
        }

        field.customOptions = $.extend( true, {}, defaultFieldOptions, field.customOptions );
    };
    
    // Register in options.dictionary I18n instances
    var initI18n = function(){
        
        // Build the list of file paths
        var filePaths = [];
        var fileNames = options.i18n.files[ options.i18n.language ];
        for ( var c = 0; c < fileNames.length; c++ ) {
            var fileName = fileNames[ c ];
            var filePath = options.i18n.filesPath? options.i18n.filesPath + '/' + fileName: fileName;
            filePaths.push( filePath ); 
        }
        
        // Load them, build the I18n instances and register them in the options.dictionary
        zpt.i18nHelper.loadAsync( filePaths , function( i18nMap ){
            var i18nArray = [];
            for ( var c = 0; c < filePaths.length; c++ ) {
                var filePath = filePaths[ c ];
                //var fileName = fileNames[ c ];
                var i18n =  new zpt.I18n( options.i18n.language, i18nMap[ filePath ] );
                i18nArray.push( i18n );
            }
            context.setI18nArray( i18nArray, options );
            context.initZPT({
                root: options.body,
                dictionary: options.dictionary,
                declaredRemotePageUrls: options.allDeclaredRemotePageUrls,
                callback: function(){
                    callback( options );
                }
            });
        });
    };
    
    // Init options
    var options = $.extend( true, {}, defaultOptions, userOptions );
    normalizeOptions();
    
    // Configure ZPT
    zpt.context.getConf().loggingOn = options.logging.isOn;
    zpt.context.getConf().loggingLevel = options.logging.level;
    
    log.info( 'Initializing ZCrud...' );
    
    // Init I18n
    initI18n();
    
    log.info( '...ZCrud initialized.' );
    
    return options;
};

exports.load = function( options, data, callback ){

    log.info( 'Showing list...' );
    
    var listPage =  new ListPage( options, data );
    context.putPage( listPage.getId(), listPage );
    listPage.show( true, undefined, undefined, callback );
    /*
    if ( data && data.records ){
        listPage.showUsingRecords( data.records, callback );
    } else {
        listPage.show( true, undefined, undefined, callback );
    }*/
    
    log.info( '...showing list finished.' );
};

exports.destroy = function( options ){
    options.target.empty();
};

exports.showCreateForm = function( listPageIdSource ){
    
    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    listPage.showCreateForm();
};

exports.showUpdateForm = function( listPageIdSource, key ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    listPage.showEditForm( undefined, key );
};

exports.showDeleteForm = function( listPageIdSource, key ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    listPage.showDeleteForm( undefined, key );
};

exports.getRecordByKey = function( listPageIdSource, key ){
    
    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    return listPage.getRecordByKey( key );
};

exports.getRecords = function( listPageIdSource ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    return listPage.getRecordsArray();
};

exports.getRowByKey = function( listPageIdSource, key ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    return listPage.getRowByKey( key );
};

exports.selectRecords = function( listPageIdSource, rows ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    listPage.selectRecords( rows );
};

exports.deselectRecords = function( listPageIdSource, rows ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    listPage.deselectRecords( rows );
};

exports.selectRows = function( listPageIdSource, rows ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    listPage.selectRows( rows );
};

exports.deselectRows = function( listPageIdSource, rows ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    listPage.deselectRows( rows );
};

exports.selectedRows = function( listPageIdSource ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    return listPage.selectedRows();
};

exports.selectedRecords = function( listPageIdSource ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    return listPage.selectedRecords();
};

var recordOperationCommon = function( listPageIdSource, data, checkRecord, checkKey, method, type ){
    
    if ( checkRecord && ! data.record ){
        alert( 'Record not set in ' + method + ' method!' );
        return false;
    }
    
    if ( checkKey && ! data.key ){
        alert( 'Key not set in ' + method + ' method!' );
        return false;
    }
    
    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return false;
    }
    
    return listPage.instanceNewForm( type, data.record );
};

exports.addRecord = function( listPageIdSource, data ){
    
    var formPage = recordOperationCommon( listPageIdSource, data, true, false, 'addRecord', 'create' );
    if ( formPage ){
        formPage.addRecord( data );
    }
};

exports.updateRecord = function( listPageIdSource, data ){
    
    var formPage = recordOperationCommon( listPageIdSource, data, true, true, 'updateRecord', 'update' );
    if ( formPage ){
        formPage.updateRecord( data );
    }
};

exports.deleteRecord = function( listPageIdSource, data ){

    var formPage = recordOperationCommon( listPageIdSource, data, false, true, 'deleteRecord', 'delete' );
    if ( formPage ){
        formPage.deleteRecord( data );
    }
};
