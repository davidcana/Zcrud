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
var fieldListBuilder = require( '../fieldListBuilder.js' );

var FormPage = function ( optionsToApply, typeToApply, recordToApply, listPageToApply ) {
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
    
    var listPage = listPageToApply;
    
    var id = options.formId;
    var getId = function(){
        return id;
    };
    
    var get$form = function(){
        return $( '#' + id );
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
        var parentSeparatorIndex = tempFieldName.indexOf( context.subformSeparator );
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
        var parentSeparatorIndex = tempFieldName.indexOf( context.subformSeparator );
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
    
    var eventFunction = undefined;
    
    // Configure instance depending on type parameter
    var configure = function(){
        
        switch ( type ) {
        case 'create':
            thisOptions = options.pages.create;
            title = "Create form";
            submitFunction = submitCreate;
            eventFunction = options.events.recordAdded;
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
            submitFunction = submitUpdate;
            eventFunction = options.events.recordUpdated;
            buildFields(
                function( field ){
                    return field.edit;
                });
            successMessage = 'updateSuccess';
            break;
        case 'delete':
            thisOptions = options.pages.delete;
            title = "Delete form";
            submitFunction = submitDelete;
            eventFunction = options.events.recordDeleted;
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
    /*
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
    };*/
    /*
    var buildFields = function( filterFunction ){
        
        fields = fieldListBuilder.build( thisOptions.fields, options );
        fieldsMap = fieldListBuilder.buildMapFromArray( fields, fieldBuilder.buildFields );
    };*/
    var buildFields = function(){
        
        var fieldsCache = fieldListBuilder.get( type, options );
        fields = fieldsCache.fieldsArray;
        fieldsMap = fieldsCache.fieldsMap;
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
            
            afterProcessTemplate( get$form() );
            
        } catch( e ){
            alert ( 'Error trying to show form: ' + e );    
        }
    };
    
    // Set, get, update and build record
    var buildRecordFromForm = function( $form ){
        
        var newRecord = {};
        
        for ( var c = 0; c < fields.length; c++ ) {
            var field = fields[ c ];
            newRecord[ field.id ] = fieldBuilder.getValueFromForm( field, options, $form );
        }
        
        return newRecord;
    };
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
        
        // Add key if there is no field key
        if ( newRecord[ options.key ] == undefined ){
            newRecord[ options.key ] = record[ options.key ];
        }
        
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
        
        triggerFormCreatedEvent( $form );
    };
    
    var bindEvents = function( $form ) {
        
        $form
            .find( '.zcrud-form-submit-command-button' )
            .off()
            .click(function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                submitFunction( event, $form );
            });
        
        $form
            .find( '.zcrud-form-cancel-command-button' )
            .off()
            .click(function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                cancelForm( event, $form );
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
            .not( "[name*='" + context.subformSeparator + "']" )  // Must exclude fields in subforms
            .change( function ( event, disableHistory ) {
                if ( disableHistory ){
                    return;
                }
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
    
    var saveCommon = function( elementId, event, data, $form ){

        // Return if there is no operation to do
        if ( ! data ){
            alert( 'No operation to do!' );
            return false;
        }
        
        // Add success and error functions to data if not present yet. Add URL to data if not present yet
        var userSuccess = data.success;
        var userError = data.error;
        
        data.success = function( dataFromServer ){

            // Check server side validation
            if ( ! dataFromServer || dataFromServer.result != 'OK' ){
                pageUtils.serverSideError( dataFromServer, options, context, userError );
                return false;
            }
            
            // Update record
            record = type == 'delete'? record: history.getRegisterFromDataToSend( data, type );

            eventFunction(
                {
                    record: record,
                    serverResponse: dataFromServer,
                    options: options
                }, 
                event );
            triggerFormClosedEvent( event, $form );

            // Show list
            var dictionaryExtension = {
                status: {
                    message: successMessage,
                    date: new Date().toLocaleString()
                }
            };
            if ( dataFromServer.clientOnly ){
                listPage.showFromClientOnly( true, dictionaryExtension, data );
            } else {
                //context.getListPage( options ).show(
                listPage.show( true, dictionaryExtension );
            }

            history.reset( elementId );
            
            if ( userSuccess ){
                userSuccess();
            }
        };
        
        data.error = function( request, status, error ){
            pageUtils.ajaxError( request, status, error, options, context, userError );
        };
        /*
        data.error = function( dataFromServer ){
            if ( dataFromServer.message ){
                context.showError( options, dataFromServer.message, false );
            } else {
                context.showError( options, 'serverCommunicationError', true );
            }

            if ( userError ){
                userError();
            }
        };*/
        
        if ( data.url == undefined ){
            data.url = thisOptions.url || options.defaultFormConf.url;
        }
        
        // Do the CRUD!
        crudManager.batchUpdate( 
            data, 
            options, 
            event,
            {
                $form: $form,
                formType: type,
                dataToSend: data,
                options: options
            });
        
        return data;
    };
    
    var submitCreate = function( event, $form ){

        return saveCommon( 
            id, 
            event,
            history.buildDataToSend( 
                options.key, 
                options.defaultFormConf.dataToSend, 
                [ ],
                fields ),
            $form );
    };
    
    var addRecord = function( userData ){
        
        var event = undefined;
        var $form = get$form();
        var data = history.buildDataToSendForAddRecordMethod( userData.record );
        
        addAllRecordMethodProperties( userData, data );
        
        return saveCommon( 
            id, 
            event,
            data,
            $form );
    };
    
    var addAllRecordMethodProperties = function( fromObject, toObject ){
        addProperties( fromObject, toObject, [ 'clientOnly', 'url', 'success', 'error' ] );
    };
    
    var addProperties = function( fromObject, toObject, properties ){
        
        for ( var c = 0; c < properties.length; ++c ){
            var property = properties[ c ];
            var value = fromObject[ property ];
            if ( value != undefined ){
                toObject[ property ] = value;
            }
        }
    };
    
    var submitUpdate = function( event, $form ){

        return saveCommon( 
            id, 
            event,
            history.buildDataToSend( 
                options.key, 
                options.defaultFormConf.dataToSend, 
                [ record ], 
                fields ),
            $form );
    };
    
    var updateRecord = function( userData ){

        var event = undefined;
        var $form = get$form();
        
        var currentRecord = listPage.getRecordByKey( userData.key );
        
        if ( ! currentRecord ){
            alert( 'Current record not found in updateRecord method!' );
            return;
        }
        
        var data = history.buildDataToSendForUpdateRecordMethod( 
            options.key,
            options.defaultFormConf.dataToSend, 
            currentRecord,
            userData.record,
            fieldsMap,
            fields );

        addAllRecordMethodProperties( userData, data );

        return saveCommon( 
            id, 
            event,
            data,
            $form );
    };
    
    var submitDelete = function( event, $form ){

        return saveCommon( 
            id, 
            event,
            history.buildDataToSendForRemoving( 
                [ $( '#zcRecordKey' ).val() ] ),
            $form );
    };
    
    var deleteRecord = function( userData ){

        var event = undefined;
        var $form = get$form();
        var data = history.buildDataToSendForRemoving( 
            [ userData.key ] );

        addAllRecordMethodProperties( userData, data );

        return saveCommon( 
            id, 
            event,
            data,
            $form );
    };
    
    var cancelForm = function( event, $form ){
        triggerFormClosedEvent( event, $form );
        listPage.show( false );
        //context.getListPage( options ).show( false );
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
    
    /* Events */
    var triggerFormClosedEvent = function( event, $form ){

        options.events.formClosed( 
            {
                $form: $form,
                formType: type,
                options: options
            },
            event );
    };
    var triggerFormCreatedEvent = function( $form ){

        options.events.formCreated(
            {
                $form: $form,
                formType: type,
                options: options
            });
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
        getParentFieldByName: getParentFieldByName,
        addRecord: addRecord,
        updateRecord: updateRecord,
        deleteRecord: deleteRecord
    };
    
    configure();
    
    return self;
};

module.exports = FormPage;
