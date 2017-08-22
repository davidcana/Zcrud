/* 

Public methods of zCrud:
-----------------------

 - init: Set options and normalize them.
 - load: Show the list page
 - reload: Show again a list page without configuring options or filters
*/
var $ = require( 'jquery' );
var zpt = require( 'zpt' );
var fieldBuilder = require( './fields/fieldBuilder.js' );
var context = require( './context.js' );
var ListPage = require( './pages/listPage.js' );

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
            recordUpdated: function ( event, options, record ) { }
            /*
            rowInserted: function ( data ) { },
            rowsRemoved: function ( data ) { },
            rowUpdated: function ( data ) { },
            selectionChanged: function ( data ) { }*/
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
        
        // Server data format stuff
        serverDataFormat: {
            datetime: 'm/d/Y H:i',
            date: 'm/d/Y',
            time: 'H:i',
            decimalSeparator: '.'
        }
    };
    
    var normalizeOptions = function() {
        
        normalizeGeneralOptions();
        
        $.each( options.fields, function ( fieldId, field ) {
            normalizeFieldOptions( fieldId, field, options );
        });
    };
    
    // Normalizes some options (sets default values)
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

    /* Normalizes some options for a field (sets default values).
    *************************************************************************/
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
        declareRemotePageUrl( field.template, options );
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
                var fileName = fileNames[ c ];
                var i18n =  new zpt.I18n( options.i18n.language, i18nMap[ filePath ] );
                i18nArray.push( i18n );
            }
            context.setI18nArray( i18nArray, options );
            context.putOptions( options.entityId, options );
            if ( callback ){
                callback( options );
            }
        });
    };
    
    // Init options
    var options = $.extend( true, {}, defaultOptions, userOptions );
    normalizeOptions();
    
    // Init I18n
    initI18n();
};

exports.load = function( options, filter, callback ){
    var listPage =  new ListPage( options, filter );
    context.setMainPage( listPage );
    context.putPage( listPage.getId(), listPage );
    listPage.show( true, undefined, undefined, callback );
};

exports.reload = function( listPageId, callback ){
    var listPage = context.getPage( listPageId  );
    if ( ! listPage ){
        alert( 'List page not found in context!' );
        return;
    }
    listPage.show( true, undefined, undefined, callback );
};

exports.destroy = function( target ){
    target.empty();
};

exports.showCreateForm = function( listPageId ){
    var listPage = context.getPage( listPageId  );
    if ( ! listPage ){
        alert( 'List page not found in context!' );
        return;
    }
    listPage.showCreateForm();
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
