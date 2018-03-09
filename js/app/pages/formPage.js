/* 
    Class FormPage
*/
var context = require( '../context.js' );
var pageUtils = require( './pageUtils.js' );
var fieldBuilder = require( '../fields/fieldBuilder' );
var validationManager = require( '../validationManager.js' );
var $ = require( 'jquery' );
var zpt = require( 'zpt' );
var crudManager = require( '../crudManager.js' );
var History = require( '../history/history.js' );
var optionListProviderManager = require( '../fields/optionListProviderManager.js' );
var datetimeFieldManager = require( '../fields/datetimeFieldManager.js' );

var FormPage = function ( optionsToApply, typeToApply, recordToApply ) {
    "use strict";

    var options = optionsToApply;
    
    var type = typeToApply;
    var getType = function(){
        return type;
    };
    
    var record = recordToApply;
    var setRecord = function( recordToApply ){
        record = recordToApply;
    };
    var getRecord = function(){
        return record;
    };
    
    var id = options.formId;
    var getId = function(){
        return id;
    };
    
    var title = undefined;
    var getTitle = function(){
        return title;
    };
    
    var dictionary = undefined;
    var submitFunction = undefined;
    
    var history = undefined;
    var getHistory = function(){
        return history;
    };
    //var autoSaveMode = false;
    
    var fieldsMap = undefined;
    var fields = undefined;
    var getFields = function(){
        return fields;
    };
    var getField = function( fieldId, parentId ){
        return parentId? fieldsMap[ parentId ].fields[ fieldId ]: fieldsMap[ fieldId ];
    };
    var getFieldByName = function( fieldName ){

        // Must remove [] and its contents
        var arraySeparatorIndex = fieldName.indexOf( '[' );
        var tempFieldName = arraySeparatorIndex === -1? fieldName: fieldName.substring( 0, arraySeparatorIndex );
        
        // Get parent
        var parentSeparatorIndex = tempFieldName.indexOf( '/' );
        var parentId = parentSeparatorIndex === -1? null: tempFieldName.substring( 0, parentSeparatorIndex );
        if ( parentSeparatorIndex !== -1 ){
            tempFieldName = tempFieldName.substring( 1 + parentSeparatorIndex );
        }
        
        return getField( tempFieldName, parentId );
    };
    var getParentFieldByName = function( fieldName ){

        // Must remove [] and its contents
        var arraySeparatorIndex = fieldName.indexOf( '[' );
        var tempFieldName = arraySeparatorIndex === -1? fieldName: fieldName.substring( 0, arraySeparatorIndex );

        // Get parent
        var parentSeparatorIndex = tempFieldName.indexOf( '/' );
        var parentId = parentSeparatorIndex === -1? null: tempFieldName.substring( 0, parentSeparatorIndex );

        return parentId? fieldsMap[ parentId ]: null;
    };
    /*
    var getFieldByName = function( fieldName ){

        // Must remove [] and its contents
        var index = fieldName.indexOf( '[' );
        return getField( index === -1? fieldName: fieldName.substring( 0, index ) );
    };*/
    
    var successMessage = undefined;
    
    var thisOptions = undefined;
    var getThisOptions = function(){
        return thisOptions;
    };
    
    // Configure instance depending on type parameter
    var configure = function(){
        
        switch ( type ) {
        case 'create':
            thisOptions = options.pages.create;
            title = "Create form";
            submitFunction = submitCreateForm;
            buildFields(
                function( field ){
                    return field.create;
                });
            successMessage = 'createSuccess';
            if ( ! record ) {
                record = buildDefaultValuesRecord();
            }
            break;
        case 'update':
            thisOptions = options.pages.update;
            title = "Edit form";
            submitFunction = submitUpdateForm;
            buildFields(
                function( field ){
                    return field.edit;
                });
            successMessage = 'updateSuccess';
            break;
        case 'delete':
            thisOptions = options.pages.delete;
            title = "Delete form";
            submitFunction = submitDeleteForm;
            buildFields(
                function( field ){
                    return field.delete;
                });
            successMessage = 'deleteSuccess';
            break; 
        default:
            throw "Unknown FormPage type: " + type;
        }
        
        history = new History( 
            options, 
            thisOptions.formConf || options.defaultFormConf, 
            self, 
            true );
    };
    
    var buildFields = function( filterFunction ){
        
        fields = [];
        fieldsMap = {};
        
        $.each( options.fields, function ( fieldId, field ) {
            var filtered = filterFunction( field );
            
            if ( options.key == field.id && ! filtered ) {
                return;
            }
            if ( filtered == false ){
                return;
            }
            fields.push( field );
            fieldsMap[ fieldId ] = field;
            
            fieldBuilder.buildFields( field );
        });
    };
    
    // Build the form
    var show = function(){
        
        try {
            if ( ! record ){
                throw "No record set in form!";
            }
            
            beforeProcessTemplate();
            
            pageUtils.configureTemplate( 
                options, 
                "'" + thisOptions.template + "'" );

            zpt.run({
                //root: options.target[0],
                root: options.body,
                dictionary: dictionary,
                declaredRemotePageUrls: options.templates.declaredRemotePageUrls
            });
            
            afterProcessTemplate( $( '#' + id ) );
            
        } catch( e ){
            alert ( 'Error trying to show form: ' + e );    
        }
    };
    
    // Set, get, update and build record
    /*
    var updateRecordFromForm = function(){
        record = {};
        
        for ( var c = 0; c < fields.length; c++ ) {
            var field = fields[ c ];
            record[ field.id ] = fieldBuilder.getValueFromForm( field, options );
        }
    };*/
    /*
    var updateRecordFromDefaultValues = function(){
        
        record = {};
        
        for ( var c = 0; c < fields.length; c++ ) {
            var field = fields[ c ];
            if ( field.defaultValue ){
                record[ field.id ] = field.defaultValue;
            }
        }
    };*/
    
    var buildDefaultValuesRecord = function(){

        var defaultRecord = {};

        for ( var c = 0; c < fields.length; c++ ) {
            var field = fields[ c ];
            defaultRecord[ field.id ] = field.defaultValue === undefined? '': field.defaultValue;
        }
        
        return defaultRecord;
    };
    
    var buildRecordForDictionary = function(){
        
        var newRecord = {};

        for ( var c = 0; c < fields.length; c++ ) {
            var field = fields[ c ];
            newRecord[ field.id ] = fieldBuilder.getValueFromRecord( 
                field, 
                record, 
                buildProcessTemplateParams( field ) );
        }
        /*
        if ( record._optionsList ){
            newRecord._optionsList = record._optionsList;
        }*/
        
        return newRecord;
    };
    
    var updateDictionary = function(){

        dictionary = $.extend( {
            options: options,
            record: buildRecordForDictionary()
        }, options.dictionary );
        
        dictionary.instance = self;
        dictionary.optionListProviderManager = optionListProviderManager;
        dictionary.datetimeFieldManager = datetimeFieldManager;
    };
    
    var buildProcessTemplateParams = function( field ){
        
        return {
            field: field, 
            value: record[ field.id ],
            options: options,
            record: record,
            source: type,
            dictionary: dictionary,
            formPage: self,
            fieldBuilder: fieldBuilder
        };
    };
    
    var beforeProcessTemplate = function(){
        /*
        for ( var c = 0; c < fields.length; c++ ) {
            var field = fields[ c ];
            fieldBuilder.beforeProcessTemplateForField(
                buildProcessTemplateParams( field )
            );
        }*/
        
        updateDictionary();
    };
    
    var afterProcessTemplate = function( $form ){
                
        validationManager.initFormValidation( id, $form, options );
        bindEvents( $form );
        
        for ( var c = 0; c < fields.length; c++ ) {
            var field = fields[ c ];
            fieldBuilder.afterProcessTemplateForField(
                buildProcessTemplateParams( field ),
                $form
            );
        }
        
        //bindEvents( $form );
        options.events.formCreated( options );
    };
    
    var bindEvents = function( $form ) {
        
        $form
            .find( '.zcrud-form-submit-command-button' )
            .off()
            .click(function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                submitFunction( event );
            });
        
        $form
            .find( '.zcrud-form-cancel-command-button' )
            .off()
            .click(function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                cancelForm( event );
            });
        
        $form
            .find( '.zcrud-undo-command-button' )
            .off()
            .click( function ( event ) {
                event.preventDefault();
                event.stopPropagation();
            
                history.undo( id );
                /*if ( autoSaveMode ){
                    save( event );
                }*/
        });
        
        $form
            .find( '.zcrud-redo-command-button' )
            .off()
            .click( function ( event ) {
                event.preventDefault();
                event.stopPropagation();
            
                history.redo( id );
                /*if ( autoSaveMode ){
                    save( event );
                }*/
        });
        
        $form
            .find( 'input.historyField, textarea.historyField, select.historyField' )
            .not( "[name*='/']" )  // Must exclude fields in subforms
            .change( function ( event ) {
                var $this = $( this );
                var field = getFieldByName( $this.prop( 'name' ) );
                history.putChange( 
                    $this, 
                    fieldBuilder.getValue( field, $this ), 
                    0,
                    id,
                    field );
                /*if ( autoSaveMode ){
                    save( event );
                }*/
        });
    };
    
    var saveCommon = function( elementId, event, data ){

        // Return if there is no operation to do
        if ( ! data ){
            alert( 'No operation to do!' );
            return false;
        }
        
        // Add success and error functions to data. Add URL to data
        data.success = function( dataFromServer ){
            context.getListPage( options ).show(
                true,
                {
                    status: {
                        message: successMessage,
                        date: new Date().toLocaleString()
                    }
                });
            history.reset( elementId );
        };
        data.error = function( dataFromServer ){
            if ( dataFromServer.message ){
                context.showError( options, dataFromServer.message, false );
            } else {
                context.showError( options, 'serverCommunicationError', true );
            }
        };
        data.url = thisOptions.action || options.defaultFormConf.action;
        alert( data + '\n' + JSON.stringify( data ) );
        
        // Do the CRUD!
        crudManager.batchUpdate( data, options, event );

        return data;
    };
    
    var submitCreateForm = function( event ){

        return saveCommon( 
            id, 
            event,
            history.buildDataToSend( 
                options, 
                options.defaultFormConf, 
                [ ],
                fields ) );
    };
    
    var submitUpdateForm = function( event ){

        return saveCommon( 
            id, 
            event,
            history.buildDataToSend( 
                options, 
                options.defaultFormConf, 
                [ record ], 
                fields ) );
    };

    var submitDeleteForm = function( event ){

        return saveCommon( 
            id, 
            event,
            history.buildDataToSendForRemoving( 
                [ $( '#zcRecordKey' ).val() ] ) );
    };
    
    var cancelForm = function( event ){
        options.events.formClosed( event, options );
        context.getListPage( options ).show( false );
    };
    
    var getDictionary = function(){
        return dictionary;
    };

    var getPostTemplate = function( field ){
        return fieldBuilder.getPostTemplate( field );
    };
        
    var mustHideLabel = function( field ){
        return fieldBuilder.mustHideLabel( field );
    };
    
    var self = {
        show: show,
        setRecord: setRecord,
        getRecord: getRecord,
        //updateRecordFromDefaultValues: updateRecordFromDefaultValues,
        getDictionary: getDictionary,
        getThisOptions: getThisOptions,
        getType: getType,
        getId: getId,
        getTitle: getTitle,
        getFields: getFields,
        getPostTemplate: getPostTemplate,
        mustHideLabel: mustHideLabel,
        getHistory: getHistory,
        getFieldByName: getFieldByName,
        getParentFieldByName: getParentFieldByName
    };
    
    configure();
    
    return self;
};

module.exports = FormPage;
