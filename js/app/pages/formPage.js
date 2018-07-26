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
var fieldUtils = require( '../fields/fieldUtils.js' );

var FormPage = function ( optionsToApply, typeToApply, recordToApply, parentPageToApply ) {
    "use strict";

    var options = optionsToApply;
    var getOptions = function(){
        return options;
    };
    
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
    
    var parentPage = parentPageToApply;
    
    var id = options.formId;
    var getId = function(){
        return id;
    };
    
    var get$form = function(){
        return $( '#' + id );
    };
    var get$ = function(){
        return $( '#' + id );
    };
    
    var title = undefined;
    var getTitle = function(){
        return title;
    };
    
    var dictionary = undefined;
    var submitFunction = undefined;
    
    /*
    var history = undefined;
    var getHistory = function(){
        return history;
    };*/
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
                record = fieldUtils.buildDefaultValuesRecord( fields );
            }
            break;
        case 'update':
            title = "Edit form";
            submitFunction = submitUpdate;
            eventFunction = options.events.recordUpdated;
            successMessage = 'updateSuccess';
            break;
        case 'delete':
            title = "Delete form";
            submitFunction = submitDelete;
            eventFunction = options.events.recordDeleted;
            successMessage = 'deleteSuccess';
            break;
        case 'list':
            title = "List form";
            submitFunction = submitList;
            eventFunction = undefined;
            successMessage = undefined;
            if ( ! record ) {
                record = fieldUtils.buildDefaultValuesRecord( fields );
            }
            break; 
        default:
            throw "Unknown FormPage type: " + type;
        }
        
        /*
        history = new History( 
            options, 
            thisOptions,
            self, 
            true );*/
        context.setHistory(
            new History( 
                options, 
                thisOptions,
                self, 
                true ) 
        );
    };

    var buildFields = function(){
        
        var fieldsCache = fieldListBuilder.getForPage( type, options, undefined, self );
        fields = fieldsCache.fieldsArray;
        fieldsMap = fieldsCache.fieldsMap;
        view = fieldsCache.view;
    };
    
    // Build the form
    var show = function( dictionaryExtension, root ){
        
        try {
            if ( ! record ){
                throw "No record set in form!";
            }
            
            beforeProcessTemplate( dictionaryExtension );
            
            pageUtils.configureTemplate( 
                options, 
                "'" + thisOptions.template + "'" );

            zpt.run({
                //root: options.target[0],
                root: root || options.body,
                dictionary: dictionary,
                declaredRemotePageUrls: options.templates.declaredRemotePageUrls
            });
            
            afterProcessTemplate( get$form() );
            
        } catch( e ){
            context.showError( options, true, 'Error trying to show form: ' + e );    
        }
    };
    
    var buildRecordForDictionary = function(){
        
        var newRecord = {};

        for ( var c = 0; c < fields.length; c++ ) {
            var field = fields[ c ];
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
    
    /*
    var updateDictionary = function(){

        dictionary = $.extend( {
            options: options,
            record: buildRecordForDictionary()
        }, options.dictionary );

        dictionary.instance = self;
    };*/
    var updateDictionary = function( dictionaryExtension ){

        var thisDictionary = $.extend( 
            {
                options: options,
                record: buildRecordForDictionary()
            }, 
            options.dictionary );
        
        if ( dictionaryExtension ){
            dictionary = $.extend( {}, thisDictionary, dictionaryExtension );
        } else {
            dictionary = thisDictionary;
        }
        
        dictionary.instance = self;
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
        };
    };
    
    var beforeProcessTemplate = function( dictionaryExtension ){        
        updateDictionary( dictionaryExtension );
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
        
        // Bind events of submit, cancel, undo and redo buttons; also change event
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
            
                context.getHistory().undo( id );
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
            
                context.getHistory().redo( id );
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
                context.getHistory().putChange( 
                    $this, 
                    field.getValue( $this ), 
                    0,
                    id,
                    field );
                /*if ( autoSaveMode ){
                    save( event );
                }*/
        });
        
        $form
            .find( 'button.zcrud-copy-subform-rows-command-button' )
            .off()
            .click( 
                function ( event ) {
                    event.preventDefault();
                    event.stopPropagation();
                    //alert( 'button.zcrud-copy-subform-rows-command-button' );
                    
                    // Get thisButtonOptions from data-tButtonId attr and toolbar
                    var $this = $( this );
                    var thisButtonId = $this.attr( 'data-tButtonId' );
                    var thisButtonOptions = thisOptions.buttons.toolbar.copySubformRowsItems[ thisButtonId ];
                    
                    // Get conf options from thisButtonOptions
                    var targetId = thisButtonOptions.target;
                    var sourceId = thisButtonOptions.source;
                    var onlySelected = thisButtonOptions.onlySelected;
                    var removeFromSource = thisButtonOptions.removeFromSource;
                    
                    // Get the selectedRecords
                    var targetField = getField( targetId );
                    var selectedRecords = targetField.addNewRowsFromSubform( 
                        sourceId, 
                        onlySelected, 
                        removeFromSource );
                    if ( selectedRecords.length == 0 ){
                        context.showError( options, false, 'Please, select at least one item!' );
                    }
                    /*if ( autoSaveMode ){
                            save( event );
                    }*/
                }
            );
    };
    
    var getToolbarItemsArray = function( buttonId ){
        
        var result = [];
        var thisButtonOptions = thisOptions.buttons.toolbar[ buttonId ];

        for ( var id in thisButtonOptions ) {
            var item = thisButtonOptions[ id ];
            item.id = id;
            result.push( item );
        }
        
        return result;
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
                parentPage.showFromClientOnly( dictionaryExtension, jsonObject );
            } else {
                parentPage.show( dictionaryExtension );
            }

            context.getHistory().reset( elementId );
            
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
    
    var processDataFromServer = function( data ){
        
        for ( var c = 0; c < fields.length; c++ ) {
            var field = fields[ c ];
            field.dataFromServer( data );
        }
    };
    
    var submitList = function( event, $form ){

        return saveCommon( 
            id, 
            event,
            context.getJSONBuilder( options ).buildJSONForAll( 
                //options.key, 
                undefined,
                [ ],
                fields,
                undefined,
                context.getHistory() ),
            $form );
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
                context.getHistory() ),
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
                context.getHistory() ),
            $form );
    };
    
    var updateRecord = function( userData ){

        var event = undefined;
        var $form = get$form();
        
        if ( ! record ){
            context.showError( options, true, 'Current record not found in updateRecord method!' );
            return;
        }
        
        var jsonObject = context.getJSONBuilder( options ).buildJSONForUpdateRecordMethod( 
            options.key,
            record,
            userData.record,
            fieldsMap,
            fields,
            context.getHistory() );

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
        context.getHistory().reset( id );
        parentPage.show();
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
    
    var getFieldValue = function( fieldId ){
        return record[ fieldId ];
    };
    
    var getKey = function(){
        return getFieldValue( options.key );
    };
    
    var isReadOnly = function(){
        return !! thisOptions.readOnly;
    };
    
    var addToDataToSend = function( dataToSend ){
        
        for ( var c = 0; c < fields.length; c++ ) {
            var field = fields[ c ];
            var fieldDataToSend = field.buildDataToSend();
            
            if ( fieldDataToSend ){
                dataToSend[ field.id ] = fieldDataToSend;
            }
        }
    };
    
    var updateUsingRecordFromServer = function( key, getRecordURL ){
        
        // Build the data to send to the server
        var search = {};
        if ( key != undefined ){
            search.key = key;
        }
        addToDataToSend( search );

        // Get the record from the server and show the form
        crudManager.getRecord( 
            {
                url: getRecordURL || thisOptions.getRecordURL,
                search: search,
                success: function( dataFromServer ){
                    setRecord( dataFromServer.record );
                    processDataFromServer( dataFromServer );
                    show();
                },
                error: function(){
                    context.showError( options, false, 'Server communication error!' );
                }
            }, 
            options );
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
        getField: getField,
        getView: getView,
        //getHistory: getHistory,
        getFieldByName: getFieldByName,
        getParentFieldByName: getParentFieldByName,
        addRecord: addRecord,
        updateRecord: updateRecord,
        deleteRecord: deleteRecord,
        get$: get$,
        getOptions: getOptions,
        getFieldValue: getFieldValue,
        getKey: getKey,
        isReadOnly: isReadOnly,
        addToDataToSend: addToDataToSend,
        processDataFromServer: processDataFromServer,
        buildProcessTemplateParams: buildProcessTemplateParams,
        updateUsingRecordFromServer: updateUsingRecordFromServer,
        getToolbarItemsArray: getToolbarItemsArray
    };
    
    configure();
    
    return self;
};

module.exports = FormPage;
