/* 
    Class FormPage
*/
"use strict";

var context = require( '../context.js' );
var pageUtils = require( './pageUtils.js' );
var Page = require( './page.js' );
var validationManager = require( '../validationManager.js' );
var $ = require( 'jquery' );
var crudManager = require( '../crudManager.js' );
var History = require( '../history/history.js' );
var fieldListBuilder = require( '../fields/fieldListBuilder.js' );
var fieldUtils = require( '../fields/fieldUtils.js' );
var ComponentsMap = require( '../components/componentsMap.js' );

var FormPage = function ( optionsToApply, userDataToApply ) {
    
    Page.call( this, optionsToApply, userDataToApply );
    
    this.type;
    this.parentPage;
    this.record;
    this.userRecord;
    this.loadAtFirstExecution;
    this.isFirstExecution = true;
    this.id = this.options.formId;
    this.title = undefined;
    this.dictionary = undefined;
    this.submitFunction = undefined;
    this.view = undefined;
    this.successMessage = undefined;
    this.eventFunction = undefined;
    
    this.initFromOptions( userDataToApply || {} );
    this.configure();
};
Page.doSuperClassOf( FormPage );

FormPage.prototype.initFromOptions = function( userData ){

    this.type = userData.type; 
    this.parentPage = userData.parentPage;
    this.userRecord = userData.record;
    this.loadAtFirstExecution = userData.load == undefined? true: userData.load;
};
    
    
FormPage.prototype.getParentPage = function(){
    return this.parentPage;
};
    
FormPage.prototype.getType = function(){
    return this.type;
};
    
FormPage.prototype.setRecord = function( recordToApply ){
    this.record = recordToApply;
};

FormPage.prototype.getRecord = function(){
    return this.record;
};
FormPage.prototype.updateRecordProperty = function( id, value ){

    if ( ! this.record ){
        this.record = {};
    }

    this.record[ id ] = value;
};
    
FormPage.prototype.get$form = function(){
    return $( '#' + this.id );
};
    
FormPage.prototype.getTitle = function(){
    return this.title;
};

FormPage.prototype.getSubmitFunction = function(){
    return this.submitFunction;
};
    

FormPage.prototype.getView = function(){
    return this.view;
};
    
FormPage.prototype.getField = function( fieldId, parentId ){
    return parentId? this.fieldsMap[ parentId ].fields[ fieldId ]: this.fieldsMap[ fieldId ];
};

FormPage.prototype.getFieldByName = function( fieldName ){

    // Must remove [] and its contents
    var arraySeparatorIndex = fieldName.indexOf( '[' );
    var tempFieldName = arraySeparatorIndex === -1? fieldName: fieldName.substring( 0, arraySeparatorIndex );

    // Get parent
    var parentSeparatorIndex = tempFieldName.indexOf( context.subformSeparator );
    var parentId = parentSeparatorIndex === -1? null: tempFieldName.substring( 0, parentSeparatorIndex );
    if ( parentSeparatorIndex !== -1 ){
        tempFieldName = tempFieldName.substring( 1 + parentSeparatorIndex );
    }

    return this.getField( tempFieldName, parentId );
};

FormPage.prototype.getParentFieldByName = function( fieldName ){

    // Must remove [] and its contents
    var arraySeparatorIndex = fieldName.indexOf( '[' );
    var tempFieldName = arraySeparatorIndex === -1? fieldName: fieldName.substring( 0, arraySeparatorIndex );

    // Get parent
    var parentSeparatorIndex = tempFieldName.indexOf( context.subformSeparator );
    var parentId = parentSeparatorIndex === -1? null: tempFieldName.substring( 0, parentSeparatorIndex );

    return parentId? this.fieldsMap[ parentId ]: null;
};
    
// Configure instance depending on type parameter
FormPage.prototype.configure = function(){
        
    this.thisOptions = this.options.pageConf.pages[ this.type ];
    this.buildFields();

    switch ( this.type ) {
        case 'create':
            this.title = "Create form";
            this.submitFunction = this.submitCreate;
            this.eventFunction = this.options.events.recordAdded;
            this.successMessage = 'createSuccess';
            if ( ! this.record ) {
                this.record = fieldUtils.buildDefaultValuesRecord( this.fields );
            }
            break;
        case 'update':
            this.title = "Edit form";
            this.submitFunction = this.submitUpdate;
            this.eventFunction = this.options.events.recordUpdated;
            this.successMessage = 'updateSuccess';
            break;
        case 'delete':
            this.title = "Delete form";
            this.submitFunction = this.submitDelete;
            this.eventFunction = this.options.events.recordDeleted;
            this.successMessage = 'deleteSuccess';
            break;
        case 'list':
            this.title = "List form";
            this.submitFunction = this.submitList;
            this.eventFunction = this.options.events.formBatchUpdated;
            this.successMessage = 'formListUpdateSuccess';
            if ( ! this.record ) {
                this.record = fieldUtils.buildDefaultValuesRecord( this.fields );
            }
            break; 
        default:
            throw "Unknown FormPage type: " + this.type;
    }

    this.componentsMap = new ComponentsMap( 
        this.options, 
        this.thisOptions.components, 
        this, 
        this );

    context.setHistory(
        new History( 
            this.options, 
            this.thisOptions,
            this, 
            true ) 
    );
};

FormPage.prototype.buildFields = function(){

    var fieldsCache = fieldListBuilder.getForPage( this.type, this.options, undefined, this );
    this.fields = fieldsCache.fieldsArray;
    this.fieldsMap = fieldsCache.fieldsMap;
    this.view = fieldsCache.view;
};
    
FormPage.prototype.buildDataUsingRecord = function( recordToUse ) {

    var data = {};

    data.result = 'OK';
    data.message = '';
    data.record = recordToUse;
    data.fieldsData = {}; // TODO Build this object with data from recordToUse

    return data;
};
    
FormPage.prototype.showUsingRecord = function( recordToUse, dictionaryExtension, root, callback, dataFromServer ) {

    // Update record
    if ( ! recordToUse ){
        throw "No record to show in form!";
    }
    this.record = recordToUse;

    // Process dataFromServer
    if ( ! dataFromServer ){
        dataFromServer = this.buildDataUsingRecord( this.record );
    }
    this.processDataFromServer( dataFromServer );

    // Render template
    this.beforeProcessTemplate( dictionaryExtension );
    if ( ! root ){
        pageUtils.configureTemplate( 
            this.options, 
            "'" + this.thisOptions.template + "'" );
    }

    context.getZPTParser().run({
        root: root || ( this.options.target? this.options.target[0]: null ) || this.options.body,
        dictionary: this.dictionary,
        declaredRemotePageUrls: this.options.templates.declaredRemotePageUrls,
        notRemoveGeneratedTags: false
    });
    this.afterProcessTemplate( this.get$form() );

    // Process callback
    if ( callback ){
        callback( true );
    }
}
    
FormPage.prototype.show = function( params ){

    // Init params
    params = params || {};
    var dictionaryExtension = params.dictionaryExtension;
    var root = params.root;
    var callback = params.callback;
    var key = params.key;
    var getRecordURL = params.getRecordURL;

    // Show form using user record
    if ( this.userRecord ){
        this.showUsingRecord( this.userRecord, dictionaryExtension, root, callback );
        this.isFirstExecution = false;
        return;
    }

    // Show form using no record
    if ( this.isFirstExecution && ! this.loadAtFirstExecution ){
        this.showUsingRecord( [], dictionaryExtension, root, callback );
        this.isFirstExecution = false;
        return;
    }

    // Show form using record from server
    this.showUsingServer( key, getRecordURL, dictionaryExtension, root, callback );
    this.isFirstExecution = false;
};
    
FormPage.prototype.buildSearch = function( key ){

    var search = {};

    if ( key != undefined ){
        search.key = key;
    }

    this.componentsMap.addToDataToSend( search );

    this.addToDataToSend( search );

    return search;
};
    
FormPage.prototype.showUsingServer = function( key, getRecordURL, dictionaryExtension, root, callback, filter ) {

    // Get the record from the server and show the form
    var instance = this;
    crudManager.getRecord( 
        {
            url: getRecordURL || this.thisOptions.getRecordURL,
            search: this.buildSearch( key, filter ),
            success: function( dataFromServer ){
                instance.showUsingRecord.call( 
                    instance,
                    dataFromServer.record, 
                    dictionaryExtension, 
                    root, 
                    callback, 
                    dataFromServer );
            },
            error: function(){
                context.showError( instance.options, false, 'Server communication error!' );
            }
        }, 
        this.options 
    );
};
    
FormPage.prototype.buildRecordForDictionary = function(){

    var newRecord = {};

    for ( var c = 0; c < this.fields.length; c++ ) {
        var field = this.fields[ c ];
        newRecord[ field.id ] = field.getValueFromRecord( 
            this.record, 
            this.buildProcessTemplateParams( field ) );
    }

    // Add key if there is no field key
    var key = this.getKey();
    if ( newRecord[ key ] == undefined ){
        newRecord[ key ] = this.record[ key ];
    }

    return newRecord;
};
    
FormPage.prototype.updateDictionary = function( dictionaryExtension ){

    var thisDictionary = $.extend( 
        {
            options: this.options,
            record: this.buildRecordForDictionary()
        }, 
        this.options.dictionary );

    if ( dictionaryExtension ){
        this.dictionary = $.extend( {}, thisDictionary, dictionaryExtension );
    } else {
        this.dictionary = thisDictionary;
    }

    this.dictionary.instance = this;
};
    
FormPage.prototype.buildProcessTemplateParams = function( field ){

    return {
        field: field, 
        value: this.record[ field.id ],
        options: this.options,
        record: this.record,
        source: this.type,
        dictionary: this.dictionary,
        formPage: this
    };
};
    
FormPage.prototype.beforeProcessTemplate = function( dictionaryExtension ){        
    this.updateDictionary( dictionaryExtension );
};
    
FormPage.prototype.afterProcessTemplate = function( $form ){

    validationManager.initFormValidation( this.id, $form, this.options );
    this.bindEvents( $form );

    for ( var c = 0; c < this.fields.length; c++ ) {
        var field = this.fields[ c ];
        field.afterProcessTemplateForField(
            this.buildProcessTemplateParams( field ),
            $form
        );
    }

    this.triggerFormCreatedEvent( $form );
};
    
FormPage.prototype.bindButtonEvent = function( $form, button ){

    // Return if the button does not implement run method
    if ( ! $.isFunction( button.run ) ){
        return;    
    }

    var instance = this;
    $form
        .find( button.getSelector() )
        .off()
        .click(
            function( event ){
                button.run( event, instance, $form, this );     
            }
        );
};

FormPage.prototype.bindEvents = function( $form ) {

    // Bind events of buttons
    var buttons = this.getToolbarButtons();
    for ( var c = 0; c < buttons.length; ++c ){
        var button = buttons[ c ];
        this.bindButtonEvent( $form, button );
    }

    // Bind change event
    var instance = this;
    $form
        .find( 'input.historyField, textarea.historyField, select.historyField' )
        .not( "[name*='" + context.subformSeparator + "']" )  // Must exclude fields in subforms
        .change(
            function ( event, disableHistory ) {
                if ( disableHistory ){
                    return;
                }
                var $this = $( this );
                var field = instance.getFieldByName.call( instance, $this.prop( 'name' ) );
                context.getHistory().putChange( 
                    $this, 
                    field.getValue( $this ), 
                    0,
                    '1',
                    instance.id,
                    field );
            }
        );

    // Bind events of components
    this.componentsMap.bindEvents();
};
    
FormPage.prototype.updateRecordFromJSON = function( jsonObject ) {

    switch ( this.type ) {
        case 'create':
        case 'update':
        case 'list':
            this.record = context.getJSONBuilder( this.options ).getRecordFromJSON( 
                jsonObject, 
                this.type, 
                this.record, 
                context.getHistory(),
                this.options
            );
            break;
        case 'delete':
            // Nothing to do
            break;
        default:
            throw "Unknown FormPage type in updateRecordFromJSON method: " + this.type;
    }
};

FormPage.prototype.saveCommon = function( elementId, event, jsonObject, $form ){

    // Return if there is no operation to do
    if ( ! jsonObject ){
        context.showError( this.options, false, 'No operation to do!' );
        return false;
    }

    // Add filter if needed
    this.componentsMap.addToDataToSend( jsonObject );

    // Add success and error functions to data if not present yet. Add URL to data if not present yet
    var userSuccess = jsonObject.success;
    var userError = jsonObject.error;

    var instance = this;
    jsonObject.success = function( dataFromServer ){

        // Check server side validation
        if ( ! dataFromServer || dataFromServer.result != 'OK' ){
            pageUtils.serverSideError( dataFromServer, instance.options, context, userError );
            return false;
        }

        // Update record if needed
        instance.updateRecordFromJSON.call( instance, jsonObject );

        // Trigger events
        instance.eventFunction.call(
            instance,
            {
                record: instance.record,
                serverResponse: dataFromServer,
                options: instance.options
            }, 
            event );
        instance.triggerFormClosedEvent.call( instance, event, $form );

        // Show list or update status
        instance.updatePage.call( instance, dataFromServer, jsonObject );

        context.getHistory().reset( elementId );

        if ( userSuccess ){
            userSuccess();
        }
    };

    jsonObject.error = function( request, status, error ){
        pageUtils.ajaxError( request, status, error, instance.options, context, userError );
    };

    if ( jsonObject.url == undefined ){
        jsonObject.url = this.thisOptions.updateURL;
    }
    
    // Do the CRUD!
    crudManager.batchUpdate( 
        jsonObject, 
        this.options, 
        {
            $form: $form,
            formType: this.type,
            dataToSend: jsonObject,
            options: this.options
        }
    );

    return jsonObject;
};
    
FormPage.prototype.updatePage = function( dataFromServer, jsonObject ){

    var dictionaryExtension = {
        status: {
            message: this.successMessage,
            date: new Date().toLocaleString()
        }
    };

    if ( ! this.parentPage ){
        this.showStatusMessage( dictionaryExtension );
        this.updateKeys( dataFromServer );
        return;
    }

    if ( dataFromServer.clientOnly ){
        this.parentPage.showFromClientOnly( dictionaryExtension, jsonObject );
    } else {
        this.parentPage.show( 
            {
                dictionaryExtension: dictionaryExtension
            }
        );
    }
};
    
FormPage.prototype.updateKeys = function( dataFromServer ){

    var subformsDataFromServer = dataFromServer.subforms;
    if ( ! subformsDataFromServer ){
        return;
    }

    for ( var c = 0; c < this.fields.length; c++ ) {
        var field = this.fields[ c ];
        var dataFromServerOfField = subformsDataFromServer[ field.id ];
        if ( dataFromServerOfField ){
            this.updateKeysForField( field, dataFromServerOfField );
        }
    }
};
    
FormPage.prototype.updateKeysForField = function( field, dataFromServerOfField ){

    // Get records an $trArray
    var records = dataFromServerOfField.newRecords;
    var $trArray = context.getHistory().getAllTr$FromCreateItems( field.id );

    // Check lengths are equals
    if ( $trArray.length != records.length ){
        context.showError( 
            this.options, 
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
                this.options, 
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
    
FormPage.prototype.processDataFromServer = function( data ){

    for ( var c = 0; c < this.fields.length; c++ ) {
        var field = this.fields[ c ];
        field.dataFromServer( data );
    }
};

FormPage.prototype.submitList = function( event, $form ){

    var instance = this;
    this.processDirty(
        this.thisOptions.confirm.save,
        'OnlyForm',
        function(){
            instance.doSubmitList( event, $form );
        }
    );
};
FormPage.prototype.doSubmitList = function( event, $form ){

    var keyFieldId = this.getKey();
    return this.saveCommon( 
        this.id, 
        event,
        context.getJSONBuilder( this.options ).buildJSONForAll( 
            keyFieldId,
            this.record[ keyFieldId ]? [ this.record ]: [],
            this.fields,
            undefined,
            context.getHistory() 
        ),
        $form 
    );
};
    
FormPage.prototype.submitCreate = function( event, $form ){

    var instance = this;
    this.processDirty(
        this.thisOptions.confirm.save,
        'Create',
        function(){
            instance.doSubmitCreate( event, $form );
        }
    );
};
FormPage.prototype.doSubmitCreate = function( event, $form ){

    return this.saveCommon( 
        this.id, 
        event,
        context.getJSONBuilder( this.options ).buildJSONForAll( 
            this.getKey(), 
            [ ],
            this.fields,
            undefined,
            context.getHistory() 
        ),
        $form 
    );
};

FormPage.prototype.addRecord = function( userData ){

    var event = undefined;
    var $form = this.get$form();
    var jsonObject = context.getJSONBuilder( this.options ).buildJSONForAddRecordMethod( userData.record );

    this.addAllRecordMethodProperties( userData, jsonObject );

    return this.saveCommon( 
        this.id, 
        event,
        jsonObject,
        $form 
    );
};
    
FormPage.prototype.addAllRecordMethodProperties = function( fromObject, toObject ){
    this.addProperties( fromObject, toObject, [ 'clientOnly', 'url', 'success', 'error' ] );
};
FormPage.prototype.addProperties = function( fromObject, toObject, properties ){

    for ( var c = 0; c < properties.length; ++c ){
        var property = properties[ c ];
        var value = fromObject[ property ];
        if ( value != undefined ){
            toObject[ property ] = value;
        }
    }
};
    
FormPage.prototype.submitUpdate = function( event, $form ){
    
    var instance = this;
    this.processDirty(
        this.thisOptions.confirm.save,
        'Update',
        function(){
            instance.doSubmitUpdate( event, $form );
        }
    );
};
FormPage.prototype.doSubmitUpdate = function( event, $form ){

    return this.saveCommon( 
        this.id, 
        event,
        context.getJSONBuilder( this.options ).buildJSONForAll(
            this.getKey(), 
            [ this.record ], 
            this.fields,
            undefined,
            context.getHistory() ),
        $form 
    );
};

FormPage.prototype.updateRecord = function( userData ){

    if ( ! userData ){
        context.showError( this.options, true, 'Data configuration undefined in updateRecord method!' );
        return;
    }

    var event = undefined;
    var $form = this.get$form();

    if ( ! this.userRecord ){
        context.showError( this.options, true, 'Current record not found in updateRecord method!' );
        return;
    }

    var jsonObject = context.getJSONBuilder( this.options ).buildJSONForUpdateRecordMethod( 
        this.getKey(),
        this.userRecord,
        userData.record,
        this.fieldsMap,
        this.fields,
        context.getHistory()
    );

    this.addAllRecordMethodProperties( userData, jsonObject );

    return this.saveCommon( 
        this.id, 
        event,
        jsonObject,
        $form 
    );
};
    
FormPage.prototype.submitDelete = function( event, $form ){

    var instance = this;
    this.processDirty(
        this.thisOptions.confirm.save,
        'Delete',
        function(){
            instance.doSubmitDelete( event, $form );
        }, 
        true
    );
};
FormPage.prototype.doSubmitDelete = function( event, $form ){

    return this.saveCommon( 
        this.id, 
        event,
        context.getJSONBuilder( this.options ).buildJSONForRemoving(
            [ this.getKeyValue() ] ),
        $form 
    );
};

FormPage.prototype.deleteRecord = function( userData ){

    var event = undefined;
    var $form = this.get$form();
    var jsonObject = context.getJSONBuilder( this.options ).buildJSONForRemoving(
        [ userData.key ] );

    this.addAllRecordMethodProperties( userData, jsonObject );

    return this.saveCommon( 
        this.id, 
        event,
        jsonObject,
        $form 
    );
};
    
FormPage.prototype.cancelForm = function( event, $form ){

    var instance = this;
    this.processDirty(
        this.thisOptions.confirm.cancel,
        'Cancel',
        function(){
            instance.doCancelForm( event, $form );
        }
    );
};
FormPage.prototype.doCancelForm = function( event, $form ){
    
    this.triggerFormClosedEvent( event, $form );
    context.getHistory().reset( this.id );
    this.parentPage.show();
};

/* Events */
FormPage.prototype.triggerFormClosedEvent = function( event, $form ){

    this.options.events.formClosed( 
        {
            $form: $form,
            formType: this.type,
            options: this.options
        },
        event 
    );
};
FormPage.prototype.triggerFormCreatedEvent = function( $form ){

    this.options.events.formCreated(
        {
            $form: $form,
            formType: this.type,
            options: this.options
        }
    );
};
    
FormPage.prototype.getFieldValue = function( fieldId ){
    return this.record[ fieldId ];
};
    
FormPage.prototype.getKeyValue = function(){
    return this.record[ this.getKey() ];
};
    
FormPage.prototype.isReadOnly = function(){
    return !! this.thisOptions.readOnly || this.type == 'delete';
};
    
FormPage.prototype.addToDataToSend = function( dataToSend ){

    for ( var c = 0; c < this.fields.length; c++ ) {
        var field = this.fields[ c ];
        var fieldDataToSend = field.buildDataToSend();

        if ( fieldDataToSend ){
            dataToSend[ field.id ] = fieldDataToSend;
        }
    }
};

FormPage.prototype.getToolbarButtons = function(){
    return this.getPageToolbarButtons( 'formToolbar' );
};
    
FormPage.prototype.update = function(){

    this.show(
        {
            root: this.get$().find( '.zcrud-form-updatable' )[0]
        }
    );
};

FormPage.prototype.removeChanges = function(){
    context.getHistory().reset( this.id );
};
    
FormPage.prototype.goToFirstPage = function(){

    for ( var c = 0; c < this.fields.length; c++ ) {
        var field = this.fields[ c ];
        field.goToFirstPage();
    }
};

module.exports = FormPage;
