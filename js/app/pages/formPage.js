/* 
    Class FormPage
*/
var context = require( '../context.js' );
var pageUtils = require( './pageUtils.js' );
var validationManager = require( '../validationManager.js' );
var $ = require( 'jquery' );
var zpt = require( 'zpt' );
var crudManager = require( '../crudManager.js' );
var History = require( '../history/history.js' );
var fieldListBuilder = require( '../fields/fieldListBuilder.js' );

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
    
    var view = undefined;
    var getView = function(){
        return view;
    };
    
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
        
        thisOptions = options.pageConf.pages[ type ];
        buildFields();
        
        switch ( type ) {
        case 'create':
            title = "Create form";
            submitFunction = submitCreate;
            eventFunction = options.events.recordAdded;
            successMessage = 'createSuccess';
            if ( ! record ) {
                record = buildDefaultValuesRecord();
            }
            break;
        case 'update':
            title = "Edit form";
            submitFunction = submitUpdate;
            eventFunction = options.events.recordUpdated;
            successMessage = 'updateSuccess';
            break;
        case 'delete':
            //thisOptions = options.pageConf.pages.delete;
            title = "Delete form";
            submitFunction = submitDelete;
            eventFunction = options.events.recordDeleted;
            successMessage = 'deleteSuccess';
            break; 
        default:
            throw "Unknown FormPage type: " + type;
        }
        
        history = new History( 
            options, 
            thisOptions,
            self, 
            true );
    };

    var buildFields = function(){
        
        var fieldsCache = fieldListBuilder.get( type, options );
        fields = fieldsCache.fieldsArray;
        fieldsMap = fieldsCache.fieldsMap;
        view = fieldsCache.view;
        
        for ( var c = 0; c < fields.length; ++c ){
            fields[ c ].configure( options, self );
        }
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
            context.showError( options, true, 'Error trying to show form: ' + e );    
        }
    };
    
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
            /*
            newRecord[ field.id ] = context.getFieldBuilder().getValueFromRecord( 
                field, 
                record, 
                buildProcessTemplateParams( field ) );*/
            newRecord[ field.id ] = field.getValueFromRecord( 
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
        
        //context.getFieldBuilder().addFieldManagersToDictionary( dictionary );
    };
    
    var buildProcessTemplateParams = function( field ){
        
        return {
            field: field, 
            value: record[ field.id ],
            options: options,
            record: record,
            source: type,
            dictionary: dictionary,
            formPage: self
            //fieldBuilder: fieldBuilder
        };
    };
    
    var beforeProcessTemplate = function(){        
        updateDictionary();
    };
    
    var afterProcessTemplate = function( $form ){
                
        validationManager.initFormValidation( id, $form, options );
        bindEvents( $form );
        
        for ( var c = 0; c < fields.length; c++ ) {
            var field = fields[ c ];
            field.afterProcessTemplateForField(
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
                    //context.getFieldBuilder().getValue( field, $this ), 
                    field.getValue( $this ), 
                    0,
                    id,
                    field );
                /*if ( autoSaveMode ){
                    save( event );
                }*/
        });
    };
    
    var saveCommon = function( elementId, event, jsonObject, $form ){

        // Return if there is no operation to do
        if ( ! jsonObject ){
            context.showError( options, false, 'No operation to do!' );
            return false;
        }
        
        // Add success and error functions to data if not present yet. Add URL to data if not present yet
        var userSuccess = jsonObject.success;
        var userError = jsonObject.error;
        
        jsonObject.success = function( dataFromServer ){

            // Check server side validation
            if ( ! dataFromServer || dataFromServer.result != 'OK' ){
                pageUtils.serverSideError( dataFromServer, options, context, userError );
                return false;
            }
            
            // Update record if needed
            if ( type != 'delete' ){
                record = context.getJSONBuilder( options ).getRecordFromJSON( jsonObject, type );
                //var recordFromJSON = context.getJSONBuilder( options ).getRecordFromJSON( jsonObject, type );
                //record = $.extend( true, {}, record, recordFromJSON );
            }
             
            // Trigger event
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
                listPage.showFromClientOnly( true, dictionaryExtension, jsonObject );
            } else {
                listPage.show( true, dictionaryExtension );
            }

            history.reset( elementId );
            
            if ( userSuccess ){
                userSuccess();
            }
        };
        
        jsonObject.error = function( request, status, error ){
            pageUtils.ajaxError( request, status, error, options, context, userError );
        };
        
        if ( jsonObject.url == undefined ){
            jsonObject.url = thisOptions.url;
        }
        
        // Do the CRUD!
        crudManager.batchUpdate( 
            jsonObject, 
            options, 
            event,
            {
                $form: $form,
                formType: type,
                dataToSend: jsonObject,
                options: options
            });
        
        return jsonObject;
    };
    
    var submitCreate = function( event, $form ){

        return saveCommon( 
            id, 
            event,
            context.getJSONBuilder( options ).buildJSONForAll( 
                options.key, 
                [ ],
                fields,
                undefined,
                history ),
            $form );
    };
    
    var addRecord = function( userData ){
        
        var event = undefined;
        var $form = get$form();
        var jsonObject = context.getJSONBuilder( options ).buildJSONForAddRecordMethod( userData.record );
        
        addAllRecordMethodProperties( userData, jsonObject );
        
        return saveCommon( 
            id, 
            event,
            jsonObject,
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
            context.getJSONBuilder( options ).buildJSONForAll(
                options.key, 
                [ record ], 
                fields,
                undefined,
                history ),
            $form );
    };
    
    var updateRecord = function( userData ){

        var event = undefined;
        var $form = get$form();
        
        var currentRecord = listPage.getRecordByKey( userData.key );
        
        if ( ! currentRecord ){
            context.showError( options, true, 'Current record not found in updateRecord method!' );
            return;
        }
        
        var jsonObject = context.getJSONBuilder( options ).buildJSONForUpdateRecordMethod( 
            options.key,
            currentRecord,
            userData.record,
            fieldsMap,
            fields,
            history );

        addAllRecordMethodProperties( userData, jsonObject );

        return saveCommon( 
            id, 
            event,
            jsonObject,
            $form );
    };
    
    var submitDelete = function( event, $form ){

        return saveCommon( 
            id, 
            event,
            context.getJSONBuilder( options ).buildJSONForRemoving(
                [ $( '#zcRecordKey' ).val() ] ),
            $form );
    };
    
    var deleteRecord = function( userData ){

        var event = undefined;
        var $form = get$form();
        var jsonObject = context.getJSONBuilder( options ).buildJSONForRemoving(
            [ userData.key ] );

        addAllRecordMethodProperties( userData, jsonObject );

        return saveCommon( 
            id, 
            event,
            jsonObject,
            $form );
    };
    
    var cancelForm = function( event, $form ){
        triggerFormClosedEvent( event, $form );
        listPage.show( false );
    };
    
    var getDictionary = function(){
        return dictionary;
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
        getDictionary: getDictionary,
        getThisOptions: getThisOptions,
        getType: getType,
        getId: getId,
        getTitle: getTitle,
        getFields: getFields,
        getView: getView,
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
