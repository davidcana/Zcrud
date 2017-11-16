/* 

Public methods of zCrud:
-----------------------

 - addRecord: Add a new record to the table.
 - deleteRecord: Delete an existing record from the table.
 - destroy: Completely removes table from it's container.
 - getRecordByKey: Get record by key field's value of the record.
 - init: Set options and normalize them.
 - load: Show the list page.
 - reload: Show again a list page without configuring options or filters.
 - showCreateForm: Open a 'create new record' form dialog.
 - updateRecord: Update an existing record on the table. 
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
    
    /************************************************************************
    * DEFAULT OPTIONS / EVENTS                                              *
    *************************************************************************/
    var defaultOptions = {

        actions: {},
        validation: {
            modules: '',
            rules: {},
            configuration: {
                errorMessageClass: 'form-error-inline', // form-error-fixed or form-error-inline (already existing)
                borderColorOnError: ''
            }
        },
        dictionary: {},
        
        saveUserPreferences: true,
        body: document.body,
        entityId: 'entity',
        
        //animationsEnabled: true,
        //loadingAnimationDelay: 500,
        /*
        toolbar: {
            hoverAnimation: true,
            hoverAnimationDuration: 60,
            hoverAnimationEasing: undefined,
            items: []
        },*/
        
        fields: {},
        fieldsConfig: {
            defaultFieldOptions: {
                datetime: {
                    inline: false
                },
                date: {
                    inline: false,
                    timepicker: false
                },
                time: {
                    inline: false,
                    datepicker: false,
                    step: 5
                }
            },
            getDefaultFieldTemplate: function( field ){
                return field.type + '@templates/fields/basic.html';
            }
        },
        
        events: {
            formClosed: function ( event, options ) {},
            formCreated: function ( options ) {},
            formSubmitting: function ( options, dataToSend ) {},
            //loadingRecords: function ( options, url ) {},
            recordAdded: function ( event, options, record ) {},
            recordDeleted: function ( event, options, key ) {},
            //recordsLoaded: function ( data ) {},
            recordUpdated: function ( event, options, record ) {},
            selectionChanged: function ( data ) {},
            listBatchUpdateDone: function ( event, options, dataToSend ) {}
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
        
        templates: {
            declaredRemotePageUrls: [],
            busyTemplate: "busyDefaultTemplate@templates/misc.html"
        },
        
        ajax:{
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
        
        serverDataFormat: {
            datetime: 'm/d/Y H:i',
            date: 'm/d/Y',
            time: 'H:i',
            decimalSeparator: '.'
        },
        
        logging: {
            isOn: false,
            level: log4javascript.Level.ERROR,
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
        
        if ( options.listId == undefined ){
            options.listId = 'zcrud-list-' + options.entityId;
        }
        if ( options.listTableId == undefined ){
            options.listTableId = 'zcrud-list-table-' + options.entityId;
        }
        if ( options.listTbodyId == undefined ){
            options.listTbodyId = 'zcrud-list-tbody-' + options.entityId;
        }
        if ( options.formId == undefined ){
            options.formId = 'zcrud-form-' + options.entityId;
        }
        
        // Normalize list options
        var listOptions = options.pages.list;
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
    var normalizeFieldOptions = function ( id, field, options ) {
        
        // Set id
        field.id = id;
                
        // Set the key
        if ( field.key ){
            options.key = id;
        }
        
        // Set defaults when undefined
        if ( field.type == undefined ) {
            field.type = 'text';
        }
        if ( field.elementId == undefined ) {
            field.elementId = 'zcrud-' + id;
        }
        field.labelFor = fieldBuilder.getLabelFor( field, options );
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
        
        // Convert dependsOn to array if it's a comma seperated lists
        if ( field.dependsOn && $.type( field.dependsOn ) === 'string' ) {
            var dependsOnArray = field.dependsOn.split( ',' );
            field.dependsOn = [];
            for ( var i = 0; i < dependsOnArray.length; i++ ) {
                field.dependsOn.push( $.trim( dependsOnArray[ i ] ) );
            }
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
                root: document.body,
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
    
    log.info( 'Initializing zCrud...' );
    
    // Init I18n
    initI18n();
    
    // Register options using jquery selector 
    context.putOptions( 
        context.getSelectorString( options.target ), 
        options );
    
    log.info( '...zCrud initialized.' );
};

// Returns a listPage instance. Value can be an object (then use its listId property) 
// or a string (then use it as the listId)
var getListPageFromValue = function( value ){
    
    var listPageId = typeof value === 'object'? value.listId: value;
    var listPage = context.getPage( listPageId  );
    if ( ! listPage ){
        alert( 'List page not found in context!' );
        return false;
    }
    return listPage;
};

exports.load = function( options, filter, callback ){

    log.info( 'Showing list...' );
    
    var listPage =  new ListPage( options, filter );
    //listPage.configure();
    context.putPage( listPage.getId(), listPage );
    listPage.show( true, undefined, undefined, callback );
    
    log.info( '...showing list finished.' );
};

exports.reload = function( value, callback ){
    
    var listPage = getListPageFromValue( value );
    if ( ! listPage ){
        return;
    }
    listPage.show( true, undefined, undefined, callback );
};

exports.destroy = function( options ){
    options.target.empty();
};

exports.showCreateForm = function( value ){
    
    var listPage = getListPageFromValue( value );
    if ( ! listPage ){
        return;
    }
    listPage.showCreateForm();
};

exports.getRecordByKey = function( value, key ){
    
    var listPage = getListPageFromValue( value );
    if ( ! listPage ){
        return;
    }
    return listPage.getRecordByKey( key );
};

exports.addRecord = function( value, record, event ){

    var listPage = getListPageFromValue( value );
    if ( ! listPage ){
        return;
    }
    FormPage.createRecord( listPage.getOptions(), record, event );
};

exports.updateRecord = function( value, record, event ){

    var listPage = getListPageFromValue( value );
    if ( ! listPage ){
        return;
    }
    FormPage.updateRecord( listPage.getOptions(), record, event );
};

exports.deleteRecord = function( value, key, event ){

    var listPage = getListPageFromValue( value );
    if ( ! listPage ){
        return;
    }
    FormPage.deleteRecord( listPage.getOptions(), key, event );
};

exports.selectRows = function( value, rows ){

    var listPage = getListPageFromValue( value );
    if ( ! listPage ){
        return;
    }
    listPage.selectRows( rows );
};

exports.selectedRows = function( value ){

    var listPage = getListPageFromValue( value );
    if ( ! listPage ){
        return;
    }
    return listPage.selectedRows();
};

exports.selectedRecords = function( value ){

    var listPage = getListPageFromValue( value );
    if ( ! listPage ){
        return;
    }
    return listPage.selectedRecords();
};

exports.undoListAction = function( value ){

    var listPage = getListPageFromValue( value );
    if ( ! listPage ){
        return;
    }
    return listPage.undo();
};

exports.redoListAction = function( value ){

    var listPage = getListPageFromValue( value );
    if ( ! listPage ){
        return;
    }
    return listPage.redo();
};

exports.saveList = function( value ){

    var listPage = getListPageFromValue( value );
    if ( ! listPage ){
        return;
    }
    return listPage.save();
};

/* I18n and i18nHelp classes */
//exports.I18n = require( './i18n/i18n.js' );
//exports.i18nHelper = require( './i18n/i18nHelper.js' );

/* Support RequireJS module pattern */
/*
if ( typeof define === 'function' && define.amd ) {
    define( 'zpt.run', exports.run );
    define( 'zpt.I18n', exports.I18n );
    define( 'zpt.i18nHelper', exports.i18nHelper );
}
*/
