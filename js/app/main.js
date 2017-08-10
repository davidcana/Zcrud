/*
    run function
*/
exports.run = function( userOptions ){
    var $ = require( 'jquery' );
    var zpt = require( 'zpt' );
    var ListPage = require( './pages/listPage.js' );
    var fieldBuilder = require( './fields/fieldBuilder.js' );
    
    /************************************************************************
    * DEFAULT OPTIONS / EVENTS                                              *
    *************************************************************************/
    var defaultOptions = {

        //Options
        actions: {},
        fields: {},        
        //animationsEnabled: true,
        //defaultDateFormat: 'yy-mm-dd',
        //loadingAnimationDelay: 500,
        saveUserPreferences: true,
        //unAuthorizedRequestRedirectUrl: null,
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
        listId: 'zcrud-list',
        listTbodyId: 'zcrud-list-tbody',
        formId: 'zcrud-form',
        
        //Events
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

        //Localization
        messages: {
            serverCommunicationError: 'An error occured while communicating to the server.',
            loadingMessage: 'Loading records...',
            noDataAvailable: 'No data available!',
            areYouSure: 'Are you sure?',
            save: 'Save',
            saving: 'Saving',
            cancel: 'Cancel',
            error: 'Error',
            close: 'Close',
            cannotLoadOptionsFor: 'Can not load options for field ',
            
            createSuccess: 'Record added!',
            updateSuccess: 'Record updated!',
            deleteSuccess: 'Record deleted!'
        },
        
        //Templates
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
                inline: false,
                format: 'd/m/Y H:i',
                formatTime:'H:i',
                formatDate:'d/m/Y'
            },
            date: {
                inline: false,
                timepicker: false,
                format: 'd/m/Y',
                formatDate:'d/m/Y'
            },
            time: {
                inline: false,
                datepicker: false,
                format: 'H:i',
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
            language: 'es',
            filesPath: 'i18n',
            files: { 
                en: [ 'en-common.json', 'en-services.json' ],
                es: [ 'es-common.json', 'es-services.json' ] 
            }
        }
    };
    
    /* Normalizes some options for all fields (sets default values).
    *************************************************************************/
    var normalizeFieldsOptions = function () {
        
        $.each( options.fields, function ( fieldId, field ) {
            normalizeFieldOptions( fieldId, field, options );
        });
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
        
        // Convert dependsOn to array if it's a comma seperated lists
        if ( field.dependsOn && $.type( field.dependsOn ) === 'string' ) {
            var dependsOnArray = field.dependsOn.split( ',' );
            field.dependsOn = [];
            for ( var i = 0; i < dependsOnArray.length; i++ ) {
                field.dependsOn.push( $.trim( dependsOnArray[ i ] ) );
            }
        }
    };
    
    // Add to options.declaredRemotePageUrls all not repeated urls
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
    
    var buildI18nEntryId = function( fileName ){
        
        // Remove -
        var index = fileName.indexOf( '-' );
        var tmp = index == -1? fileName: fileName.substr( 1 + index );
        
        // Remove .
        index = tmp.indexOf( '.' );
        return index == -1? tmp: tmp.substr( 0, index );
    };
    
    // Register in options.dictionary I18n instances
    var initI18n = function( callback ){
        
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
            for ( var c = 0; c < filePaths.length; c++ ) {
                var filePath = filePaths[ c ];
                var fileName = fileNames[ c ];
                var i18n =  new zpt.I18n( options.i18n.language, i18nMap[ filePath ] );
                options.dictionary[ buildI18nEntryId( fileName ) ] = i18n;
            }
            callback();
        });
    };
    
    // Create and show list page
    var showListPage = function(){
        var listPage =  new ListPage( options );
        //context.setMainPage( listPage );
        listPage.show( true );
    };
    
    // Init options
    var options = $.extend( true, {}, defaultOptions, userOptions );
    normalizeFieldsOptions();
    
    // Init I18n
    initI18n( showListPage );
    /*
    var listPage =  new ListPage( options );
    listPage.show( true );*/
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
