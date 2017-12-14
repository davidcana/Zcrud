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

var FormPage = function ( optionsToApply, typeToApply ) {
    "use strict";

    var options = optionsToApply;
    
    var type = typeToApply;
    var getType = function(){
        return type;
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
    var record = undefined;
    var submitFunction = undefined;
    var history = undefined;
    var autoSaveMode = false;
    var fieldsMap = {};
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
            thisOptions.fields = buildFields(
                function( field ){
                    return field.create;
                });
            successMessage = 'createSuccess';
            updateRecordFromDefaultValues();
            break;
        case 'update':
            thisOptions = options.pages.update;
            title = "Edit form";
            submitFunction = submitUpdateForm;
            thisOptions.fields = buildFields(
                function( field ){
                    return field.edit;
                });
            successMessage = 'updateSuccess';
            break;
        case 'delete':
            thisOptions = options.pages.delete;
            title = "Delete form";
            submitFunction = submitDeleteForm;
            thisOptions.fields = buildFields(
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
        
        var fields = [];
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
        });
        
        return fields;
    };
    
    // Main method
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
    var setRecord = function( recordToApply ){
        record = recordToApply;
    };
    var getRecord = function(){
        return record;
    };
    /*
    var updateRecordFromForm = function(){
        record = {};
        
        for ( var c = 0; c < options.currentForm.fields.length; c++ ) {
            var field = options.currentForm.fields[ c ];
            record[ field.id ] = fieldBuilder.getValueFromForm( field, options );
        }
    };*/
    var updateRecordFromDefaultValues = function(){
        record = {};
        
        for ( var c = 0; c < thisOptions.fields.length; c++ ) {
            var field = thisOptions.fields[ c ];
            if ( field.defaultValue ){
                record[ field.id ] = field.defaultValue;
            }
        }
    };
    var buildRecord = function(){
        var newRecord = {};

        for ( var c = 0; c < thisOptions.fields.length; c++ ) {
            var field = thisOptions.fields[ c ];
            newRecord[ field.id ] = fieldBuilder.getValueFromRecord( 
                field, 
                record, 
                buildProcessTemplateParams( field ) );
        }

        return newRecord;
    };
    
    var updateDictionary = function(){

        dictionary = $.extend( {
            options: options,
            record: buildRecord()
        }, options.dictionary );
        
        dictionary.instance = self;
    };
    
    var buildProcessTemplateParams = function( field ){
        
        return {
            field: field, 
            value: record[ field.id ],
            options: options,
            record: record,
            source: type,
            dictionary: dictionary
        };
    };
    
    var beforeProcessTemplate = function(){
        
        updateDictionary();
        
        for ( var c = 0; c < thisOptions.fields.length; c++ ) {
            var field = thisOptions.fields[ c ];
            fieldBuilder.beforeProcessTemplateForField(
                buildProcessTemplateParams( field )
            );
        }
    };
    
    var afterProcessTemplate = function( $form ){
                
        validationManager.initFormValidation( id, $form, options );
        
        for ( var c = 0; c < thisOptions.fields.length; c++ ) {
            var field = thisOptions.fields[ c ];
            fieldBuilder.afterProcessTemplateForField(
                buildProcessTemplateParams( field )
            );
        }
        
        bindEvents( $form );
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
                if ( autoSaveMode ){
                    //save( event );
                }
        });
        
        $form
            .find( '.zcrud-redo-command-button' )
            .off()
            .click( function ( event ) {
                event.preventDefault();
                event.stopPropagation();
            
                history.redo( id );
                if ( autoSaveMode ){
                    //save( event );
                }
        });
        
        $form
            .find( 'input, textarea, select' )
            .change( function ( event ) {
                var $this = $( this );
                var field = fieldsMap[ $this.prop('name') ];
                history.putChange( 
                    $this, 
                    fieldBuilder.getValue( field, $this ), 
                    0,
                    id,
                    field );
                if ( autoSaveMode ){
                    //save( event );
                }
        });
        
        $form
            .find( '.zcrud-save-command-button' )
            .off()
            .click( function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                save( event );
        });
    };
    
    var save = function( event ){
        alert( 'Save form!' );

        return saveCommon( 
            options.defaultFormConf, 
            [ record ], 
            id, 
            event );
    };
    
    var saveCommon = function( historyOptions, records, elementId, event ){

        var data = history.buildDataToSend( options, historyOptions, records );

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
        //data.url = thisOptions.action || options.defaultFormConf.action;
        data.url = 'http://localhost:8080/cerbero/CRUDManager.do?cmd=LIST_BATCH_UPDATE&table=department';
        //alert( historyOptions.dataToSend + '\n' + JSON.stringify( data ) );
        
        // Do the CRUD!
        crudManager.listBatchUpdate( data, options, event );

        return data;
    };
    
    var submitCreateForm = function( event ){
        //alert( 'submitCreateForm!' );

        return saveCommon( 
            options.defaultFormConf, 
            [ ], 
            id, 
            event );
    };
    /*
    var submitCreateForm = function( event ){
        
        updateRecordFromForm();
        FormPage.createRecord( options, record, event );
    };*/
    
    var submitUpdateForm = function( event ){
        //alert( 'submitUpdateForm!' );

        return saveCommon( 
            options.defaultFormConf, 
            [ record ], 
            id, 
            event );
    };
    /*
    var submitUpdateForm = function( event ){

        updateRecordFromForm();
        FormPage.updateRecord( options, record, event );
    };*/
    
    var submitDeleteForm = function( event ){
        
        FormPage.deleteRecord( options, $( '#zcRecordKey' ).val(), event );
    };
    
    var cancelForm = function( event ){
        options.events.formClosed( event, options );
        context.getListPage( options ).show( false );
    };
    
    var getDictionary = function(){
        return dictionary;
    };
    
    var self = {
        show: show,
        setRecord: setRecord,
        getRecord: getRecord,
        updateRecordFromDefaultValues: updateRecordFromDefaultValues,
        getDictionary: getDictionary,
        getThisOptions: getThisOptions,
        getType: getType,
        getId: getId,
        getTitle: getTitle
    };
    
    configure();
    
    return self;
};

FormPage.createRecord = function( options, currentRecord, event ){

    var data = FormPage.buildDataForCreateAndUpdate( 
        options,
        currentRecord,
        event, 
        'createSuccess' );

    crudManager.createRecord( data, options, event );
};

FormPage.updateRecord = function( options, currentRecord, event ){

    var data = FormPage.buildDataForCreateAndUpdate( 
        options,
        currentRecord,
        event, 
        'updateSuccess' );

    crudManager.updateRecord( data, options, event );
};

FormPage.buildDataForCreateAndUpdate = function( options, currentRecord, event, successMessage ){

    var data = {
        record: currentRecord,
        success: function( dataFromServer ){
            context.getListPage( options ).show(
                true,
                {
                    status: {
                        message: successMessage,
                        date: new Date().toLocaleString()
                    }
                });
        },
        error: function( dataFromServer ){
            if ( dataFromServer.message ){
                context.showError( options, dataFromServer.message, false );
            } else {
                context.showError( options, 'serverCommunicationError', true );
            }
        }
    };

    return data;
};

FormPage.deleteRecord = function( options, key, event ){

    var data = {
        key: key,
        success: function( dataFromServer ){
            context.getListPage( options ).show(
                true,
                {
                    status: {
                        message: 'deleteSuccess',
                        date: new Date().toLocaleString()
                    }
                });
        },
        error: function( dataFromServer ){
            if ( dataFromServer.message ){
                context.showError( options, dataFromServer.message, false );
            } else {
                context.showError( options, 'serverCommunicationError', true );
            }
        }
    };

    crudManager.deleteRecord( data, options, event );
};

module.exports = FormPage;
