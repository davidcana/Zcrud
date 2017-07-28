/*
    run function
*/
exports.run = function( userOptions ){
    var $ = require( 'jquery' );
    var ListPage = require( './pages/listPage.js' );
    var fieldBuilder = require( './fields/fieldBuilder.js' );
    
    /************************************************************************
    * DEFAULT OPTIONS / EVENTS                                              *
    *************************************************************************/
    var defaultOptions = {

        //Options
        actions: {},
        fields: {},
        animationsEnabled: true,
        defaultDateFormat: 'yy-mm-dd',
        dialogShowEffect: 'fade',
        dialogHideEffect: 'fade',
        showCloseButton: false,
        loadingAnimationDelay: 500,
        saveUserPreferences: true,
        jqueryuiTheme: false,
        unAuthorizedRequestRedirectUrl: null,
        toolbar: {
            hoverAnimation: true,
            hoverAnimationDuration: 60,
            hoverAnimationEasing: undefined,
            items: []
        },
        
        // Forms
        entityId: 'entity',

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
    
    // Init options
    var options = $.extend( true, {}, defaultOptions, userOptions );
    normalizeFieldsOptions();
    
    // Init  eventsManager
    //eventsManager.setEvents( options.events );
    
    // Create and show list page
    var listPage =  new ListPage( options );
    listPage.show();
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
