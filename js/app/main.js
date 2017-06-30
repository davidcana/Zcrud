/*
    run function
*/
exports.run = function( userOptions ){
    var $ = require( 'jquery' );
    var Table = require( './pages/table.js' );
    
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

        ajaxSettings: {
            //type: 'POST',
            type: 'GET',
            dataType: 'json'
        },

        toolbar: {
            hoverAnimation: true,
            hoverAnimationDuration: 60,
            hoverAnimationEasing: undefined,
            items: []
        },

        //Events
        closeRequested: function (event, data) { },
        formCreated: function (event, data) { },
        formSubmitting: function (event, data) { },
        formClosed: function (event, data) { },
        loadingRecords: function (event, data) { },
        recordsLoaded: function (event, data) { },
        rowInserted: function (event, data) { },
        rowsRemoved: function (event, data) { },

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
            cannotLoadOptionsFor: 'Can not load options for field {0}'
        },
        
        //Templates
        listTemplate: 'listTemplate',
        createTemplate: 'formTemplate',
        updateTemplate: 'formTemplate'
    };
    
    /* Normalizes some options for all fields (sets default values).
    *************************************************************************/
    var normalizeFieldsOptions = function () {
        var self = this;
        $.each(self.options.fields, function (fieldName, props) {
            normalizeFieldOptions(fieldName, props);
        });
    };

    /* Normalizes some options for a field (sets default values).
    *************************************************************************/
    var normalizeFieldOptions = function (fieldName, props) {
        if (props.listClass == undefined) {
            props.listClass = '';
        }
        if (props.inputClass == undefined) {
            props.inputClass = '';
        }
        if (props.placeholder == undefined) {
            props.placeholder = '';
        }

        //Convert dependsOn to array if it's a comma seperated lists
        if (props.dependsOn && $.type(props.dependsOn) === 'string') {
            var dependsOnArray = props.dependsOn.split(',');
            props.dependsOn = [];
            for (var i = 0; i < dependsOnArray.length; i++) {
                props.dependsOn.push($.trim(dependsOnArray[i]));
            }
        }
    };
    
    var options = $.extend( {}, defaultOptions, userOptions );
    
    var table =  new Table( options );
    table.run();
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
