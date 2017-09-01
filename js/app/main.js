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
var fieldBuilder = require( './fields/fieldBuilder.js' );
var context = require( './context.js' );
var ListPage = require( './pages/listPage.js' );
var FormPage = require( './pages/formPage.js' );

exports.init = function( userOptions, callback ){
    
    /************************************************************************
    * DEFAULT OPTIONS / EVENTS                                              *
    *************************************************************************/
    var defaultOptions = {

        // Options
        actions: {},
        fields: {},        
        //animationsEnabled: true,
        //loadingAnimationDelay: 500,
        saveUserPreferences: true,
        /*
        toolbar: {
            hoverAnimation: true,
            hoverAnimationDuration: 60,
            hoverAnimationEasing: undefined,
            items: []
        },*/
        validate : {},
        
        // Forms
        entityId: 'entity',
        
        // Events
        events: {
            formClosed: function ( event, options ) { },
            formCreated: function ( options ) { },
            formSubmitting: function ( options, dataToSend ) { },
            //loadingRecords: function ( options, url ) { },
            recordAdded: function ( event, options, record ) { },
            recordDeleted: function ( event, options, key ) { },
            //recordsLoaded: function ( data ) { },
            recordUpdated: function ( event, options, record ) { },
            /*
            rowInserted: function ( data ) { },
            rowsRemoved: function ( data ) { },
            rowUpdated: function ( data ) { },*/
            selectionChanged: function ( data ) { }
        },
        
        // Templates
        listTemplate: "'listTemplate'",
        createTemplate: "'formTemplate'",
        updateTemplate: "'formTemplate'",
        declaredRemotePageUrls: [],
        
        // AJAX
        ajax: $.ajax,
        defaultFormAjaxOptions: {
            dataType   : 'json',
            contentType: 'application/json; charset=UTF-8',
            type       : 'POST'
        },
        ajaxPreFilter : function( data ){
            return data;
        },
        ajaxPostFilter : function( data ){
            return data;
        },
        
        // Default fields options
        getDefaultFieldTemplate: function( field ){
            return field.type + '@templates/fields/basic.html';
        },
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
        
        // Paging
        paging: {
            isOn: true,
            pagingComponentId: 'zcrud-paging',
            goToPageComboboxId: 'zcrud-go-to-page-combobox',
            defaultPageSize: 10,
            pageSizes: [10, 25, 50, 100, 250, 500],
            pageSizeChangeArea: true,
            pageSizeChangeComboboxId: 'zcrud-pageSizeChange',
            gotoPageArea: 'combobox', //possible values: 'textbox', 'combobox', 'none'
            maxNumberOfAllShownPages: 5,
            block1NumberOfPages: 1,
            block2NumberOfPages: 5,
            block3NumberOfPages: 1
        },
        
        // Selecting
        selecting: {
            isOn: false,
            multiple: true,
            mode: [ 'checkbox', 'onRowClick' ] // Options are checkbox and onRowClick
        },
        
        // Dictionary
        dictionary: {},
        
        // I18n and L10n
        i18n: {
            language: 'en',
            filesPath: 'i18n',
            i18nArrayVarName: 'i18nArray',
            files: {}
        },
        
        // Sorting
        sorting: {
            isOn: false,
            default: {
                fieldId: undefined,
                type: undefined
            },
            allowUser: false
        },
        
        // Filtering
        filtering: {
            isOn: false,
            filteringComponentId: 'zcrud-filtering',
            elementIdSuffix: '-filter'
        },
        
        // Server data format stuff
        serverDataFormat: {
            datetime: 'm/d/Y H:i',
            date: 'm/d/Y',
            time: 'H:i',
            decimalSeparator: '.'
        },
        
        // Logging
        logging: {
            isOn: false
        }
    };
    
    // Normalizes some options (sets default values)
    var normalizeOptions = function() {
        
        normalizeGeneralOptions();
        
        $.each( options.fields, function ( fieldId, field ) {
            normalizeFieldOptions( fieldId, field, options );
        });
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
        //declareRemotePageUrl( field.template, options );
        context.declareRemotePageUrl( field.template, options );
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
    
    // Add to options.declaredRemotePageUrls all non repeated urls
    /*
    var declareRemotePageUrl = function( template, options ){
        
        if ( ! template ){
            return;
        }
        
        var index = template.indexOf( '@' );
        if ( index != -1 ){
            var url = template.substring( 1 + index );
            if ( options.declaredRemotePageUrls.indexOf( url ) == -1 ){
                options.declaredRemotePageUrls.push( url );
            }
        }
    };*/
    
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
                var fileName = fileNames[ c ];
                var i18n =  new zpt.I18n( options.i18n.language, i18nMap[ filePath ] );
                i18nArray.push( i18n );
            }
            context.setI18nArray( i18nArray, options );
            if ( callback ){
                callback( options );
            }
        });
    };
    
    // Init options
    var options = $.extend( true, {}, defaultOptions, userOptions );
    normalizeOptions();
    
    // Configure ZPT
    //zpt.context.getConf().loggingOn = true;
    zpt.context.getConf().loggingOn = options.logging.isOn;
    
    // Init I18n
    initI18n();
    
    // Register options using jquery selector 
    context.putOptions( 
        context.getSelectorString( options.target ), 
        options );
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
    
    var listPage =  new ListPage( options, filter );
    //listPage.configure();
    context.putPage( listPage.getId(), listPage );
    listPage.show( true, undefined, undefined, callback );
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
