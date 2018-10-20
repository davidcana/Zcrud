/* 
    Class FormPage
*/
var context = require( '../context.js' );
var pageUtils = require( './pageUtils.js' );
var validationManager = require( '../validationManager.js' );
var $ = require( 'jquery' );
var crudManager = require( '../crudManager.js' );
var History = require( '../history/history.js' );
var fieldListBuilder = require( '../fields/fieldListBuilder.js' );
var fieldUtils = require( '../fields/fieldUtils.js' );
var buttonUtils = require( '../buttons/buttonUtils.js' );

var FormPage = function ( optionsToApply, userDataToApply ) {
    "use strict";

    var options = optionsToApply;
    var getOptions = function(){
        return options;
    };
    
    var type,
        parentPage,
        record,
        userRecord,
        loadAtFirstExecution;
    var isFirstExecution = true;
    var initFromOptions = function( userData ){

        type = userData.type; 
        parentPage = userData.parentPage;
        //record = userData.record;
        userRecord = userData.record;
        loadAtFirstExecution = userData.load == undefined? true: userData.load;
    };
    initFromOptions( userDataToApply || {} );
    
    var getParentPage = function(){
        return parentPage;
    };
    
    var getType = function(){
        return type;
    };
    
    var setRecord = function( recordToApply ){
        record = recordToApply;
    };
    var getRecord = function(){
        return record;
    };
    var updateRecordProperty = function( id, value ){
        
        if ( ! record ){
            record = {};
        }
        
        record[ id ] = value;
    };
    
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
    var getSubmitFunction = function(){
        return submitFunction;
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
                eventFunction = options.events.formBatchUpdated;
                successMessage = 'formListUpdateSuccess';
                if ( ! record ) {
                    record = fieldUtils.buildDefaultValuesRecord( fields );
                }
                break; 
            default:
                throw "Unknown FormPage type: " + type;
        }
        
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
    
    var buildDataUsingRecord = function( recordToUse ) {

        var data = {};

        data.result = 'OK';
        data.message = '';
        data.record = recordToUse;
        data.fieldsData = {}; // TODO Build this object with data from recordToUse

        return data;
    };
    
    var showUsingRecord = function( recordToUse, dictionaryExtension, root, callback, dataFromServer ) {
        
        // Update record
        if ( ! recordToUse ){
            throw "No record to show in form!";
        }
        record = recordToUse;

        // Process dataFromServer
        if ( ! dataFromServer ){
            dataFromServer = buildDataUsingRecord( record );
        }
        processDataFromServer( dataFromServer );
        
        // Render template
        beforeProcessTemplate( dictionaryExtension );
        pageUtils.configureTemplate( 
            options, 
            "'" + thisOptions.template + "'" );
        /*
        zpt.run({
            //root: options.target[0],
            root: root || options.body,
            dictionary: dictionary,
            declaredRemotePageUrls: options.templates.declaredRemotePageUrls
        });*/
        context.getZPTParser().run({
            //root: options.target[0],
            //root: root || options.body,
            root: root || ( options.target? options.target[0]: null ) || options.body,
            dictionary: dictionary,
            declaredRemotePageUrls: options.templates.declaredRemotePageUrls
        });
        afterProcessTemplate( get$form() );
        
        // Process callback
        if ( callback ){
            callback( true );
        }
    }
    
    var show = function( params ){
        
        // Init params
        params = params || {};
        var dictionaryExtension = params.dictionaryExtension;
        var root = params.root;
        var callback = params.callback;
        var key = params.key;
        var getRecordURL = params.getRecordURL;
        var filter = params.filter;
        
        //dictionaryExtension.key = key;
        
        // Show form using user record
        if ( userRecord ){
            showUsingRecord( userRecord, dictionaryExtension, root, callback );
            isFirstExecution = false;
            return;
        }

        // Show form using no record
        if ( isFirstExecution && ! loadAtFirstExecution ){
            showUsingRecord( [], dictionaryExtension, root, callback );
            isFirstExecution = false;
            return;
        }
        
        // Show form using record from server
        showUsingServer( key, getRecordURL, dictionaryExtension, root, callback, filter );
        isFirstExecution = false;
    };
    
    var buildSearch = function( key, filter ){
        
        var search = {};
        
        if ( key != undefined ){
            search.key = key;
        }
        if ( filter != undefined ){
            search.filter = filter;
        }
        
        addToDataToSend( search );
        
        return search;
    };
    
    var showUsingServer = function( key, getRecordURL, dictionaryExtension, root, callback, filter ) {

        // Get the record from the server and show the form
        crudManager.getRecord( 
            {
                url: getRecordURL || thisOptions.getRecordURL,
                search: buildSearch( key, filter ),
                success: function( dataFromServer ){
                    showUsingRecord( 
                        dataFromServer.record, 
                        dictionaryExtension, 
                        root, 
                        callback, 
                        dataFromServer );
                },
                error: function(){
                    context.showError( options, false, 'Server communication error!' );
                }
            }, 
            options 
        );
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
        var key = getKeyFieldId();
        if ( newRecord[ key ] == undefined ){
            newRecord[ key ] = record[ key ];
        }
        
        return newRecord;
    };
    
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
    
    var bindButtonEvent = function( $form, button ){
        
        // Return if the button does not implement run method
        if ( ! $.isFunction( button.run ) ){
            return;    
        }
        
        $form
            .find( button.getSelector() )
            .off()
            .click(
                function( event ){
                    button.run( event, self, $form, this );     
                }
            );
    };

    var bindEvents = function( $form ) {
        
        // Bind events of buttons
        var buttons = getToolbarButtons();
        for ( var c = 0; c < buttons.length; ++c ){
            var button = buttons[ c ];
            bindButtonEvent( $form, button );
        }

        // Bind change event
        $form
            .find( 'input.historyField, textarea.historyField, select.historyField' )
            .not( "[name*='" + context.subformSeparator + "']" )  // Must exclude fields in subforms
            .change(
                function ( event, disableHistory ) {
                    if ( disableHistory ){
                        return;
                    }
                    var $this = $( this );
                    var field = getFieldByName( $this.prop( 'name' ) );
                    context.getHistory().putChange( 
                        $this, 
                        field.getValue( $this ), 
                        0,
                        '1',
                        id,
                        field );
                    /*if ( autoSaveMode ){
                        save( event );
                    }*/
                }
            );
    };
    
    var updateRecordFromJSON = function( jsonObject ) {
        
        switch ( type ) {
            case 'create':
            case 'update':
            case 'list':
                record = context.getJSONBuilder( options ).getRecordFromJSON( 
                    jsonObject, 
                    type, 
                    record, 
                    context.getHistory() );
                break;
            case 'delete':
                // Nothing to do
                break;
            default:
                throw "Unknown FormPage type in updateRecordFromJSON method: " + type;
        }
    }

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
            updateRecordFromJSON( jsonObject );
             
            // Trigger events
            eventFunction(
                {
                    record: record,
                    serverResponse: dataFromServer,
                    options: options
                }, 
                event );
            triggerFormClosedEvent( event, $form );
            
            // Show list or update status
            updatePage( dataFromServer, jsonObject );

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
    
    var updatePage = function( dataFromServer, jsonObject ){
        
        var dictionaryExtension = {
            status: {
                message: successMessage,
                date: new Date().toLocaleString()
            }
        };
        
        if ( ! parentPage ){
            showStatusMessage( dictionaryExtension );
            updateKeys( dataFromServer );
            return;
        }
        
        if ( dataFromServer.clientOnly ){
            parentPage.showFromClientOnly( dictionaryExtension, jsonObject );
        } else {
            parentPage.show( 
                {
                    dictionaryExtension: dictionaryExtension
                }
            );
        }
    };
    
    var showStatusMessage = function( dictionaryExtension ){
        pageUtils.showStatusMessage( get$(), dictionary, dictionaryExtension, context );
    };
    
    var updateKeys = function( dataFromServer ){

        for ( var c = 0; c < fields.length; c++ ) {
            var field = fields[ c ];
            var dataFromServerOfField = dataFromServer[ field.id ];
            if ( dataFromServerOfField ){
                updateKeysForField( field, dataFromServerOfField );
            }
        }
    };
    
    var updateKeysForField = function( field, dataFromServerOfField ){
        
        // Get records an $trArray
        var records = dataFromServerOfField.newRecords;
        var $trArray = context.getHistory().getAllTr$FromCreateItems( field.id );
        
        // Check lengths are equals
        if ( $trArray.length != records.length ){
            context.showError( 
                options, 
                true, 
                'Error trying to update keys of field "' + field.id + '": $trArray and records length does not match!' );
            return;
        }
        
        // Iterate and update field values and data-record-key attr
        var key = field.subformKey;
        for ( var c = 0; c < records.length; ++c ){
            var record = records[ c ];
            var $tr = $trArray[ c ];
            var value = record[ key ];

            // Check key value is not undefined
            if ( value == undefined ){
                context.showError( 
                    options, 
                    true, 
                    'Error trying to update keys of field "' + field.id + '": undefined key value found!' );
                return;
            }

            // Update key value of field
            $tr.find( "[name='" + key + "']").val( value );

            // Update key value in attribute of $tr
            $tr.attr( 'data-record-key', value );
        }
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
                thisOptions.key, //undefined
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
                getKeyFieldId(), 
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
                getKeyFieldId(), 
                [ record ], 
                fields,
                undefined,
                context.getHistory() ),
            $form );
    };
    
    var updateRecord = function( userData ){
        
        if ( ! userData ){
            context.showError( options, true, 'Data configuration undefined in updateRecord method!' );
            return;
        }
        
        var event = undefined;
        var $form = get$form();

        if ( ! userRecord ){
            context.showError( options, true, 'Current record not found in updateRecord method!' );
            return;
        }
        
        var jsonObject = context.getJSONBuilder( options ).buildJSONForUpdateRecordMethod( 
            getKeyFieldId(),
            userRecord,
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
                [ getKey() ] ),
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
    
    var getKeyFieldId = function(){
        return thisOptions.key || options.key;
    };
    var getKey = function(){
        return record[ getKeyFieldId() ];
    };
    
    var isReadOnly = function(){
        return !! thisOptions.readOnly || type == 'delete';
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
    
    var toolbarButtons = undefined;
    var getToolbarButtons = function(){

        if ( toolbarButtons == undefined ){
            toolbarButtons = buttonUtils.getButtonList( 
                thisOptions.buttons.toolbar, 
                'formToolbar',
                self,
                options );
        }

        return toolbarButtons;
    };
    
    var self = {
        show: show,
        getParentPage: getParentPage,
        setRecord: setRecord,
        getRecord: getRecord,
        updateRecordProperty: updateRecordProperty,
        getDictionary: getDictionary,
        getThisOptions: getThisOptions,
        getType: getType,
        getId: getId,
        getTitle: getTitle,
        getFields: getFields,
        getField: getField,
        getView: getView,
        getFieldByName: getFieldByName,
        getParentFieldByName: getParentFieldByName,
        getKey: getKey,
        addRecord: addRecord,
        updateRecord: updateRecord,
        deleteRecord: deleteRecord,
        get$: get$,
        getOptions: getOptions,
        getFieldValue: getFieldValue,
        isReadOnly: isReadOnly,
        addToDataToSend: addToDataToSend,
        processDataFromServer: processDataFromServer,
        buildProcessTemplateParams: buildProcessTemplateParams,
        cancelForm: cancelForm,
        getSubmitFunction: getSubmitFunction,
        getToolbarButtons: getToolbarButtons
    };
    
    configure();
    
    return self;
};

module.exports = FormPage;
