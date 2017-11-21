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

var FormPage = function ( optionsToApply, typeToApply ) {
    "use strict";

    var options = optionsToApply;
    var type = typeToApply;
    
    var id = options.formId;
    var $form = $( '#' + id );
    var dictionary = undefined;
    var record = undefined;
    var template = undefined;
    var submitFunction = undefined;
    var cancelFunction = undefined;
    var recordFunction = undefined;
    
    // Configure instance depending on type parameter
    var configure = function(){
        
        // TODO Refactorize this, remove options.currentForm
        options.currentForm = {};
        options.currentForm.type = type;
        options.currentForm.id = id;
        options.currentForm.$form = $form;
        switch ( type ) {
        case 'create':
            template = "'" + options.pages.create.template + "'";
            options.currentForm.title = "Create form";
            submitFunction = submitCreateForm;
            cancelFunction = cancelForm;
            options.currentForm.fields = buildFields(
                function( field ){
                    return field.create;
                });
                /*
            recordFunction = function(){
                return record;
            };*/
            recordFunction = buildRecord;
            break;
        case 'update':
            template = "'" + options.pages.update.template + "'";
            options.currentForm.title = "Edit form";
            submitFunction = submitUpdateForm;
            cancelFunction = cancelForm;
            options.currentForm.fields = buildFields(
                function( field ){
                    return field.edit;
                });/*
            recordFunction = function(){
                return record;
            };*/
            recordFunction = buildRecord;
            break;
        case 'delete':
            template =  "'" + options.pages.delete.template + "'";
            options.currentForm.title = "Delete form";
            submitFunction = submitDeleteForm;
            cancelFunction = cancelForm;
            options.currentForm.fields = buildFields(
                function( field ){
                    return field.delete;
                });
            /*recordFunction = function(){
                return record;
            };*/
            recordFunction = buildRecord;
            break; 
        default:
            throw "Unknown FormPage type: " + type;
        }
    };
    
    var buildFields = function( filterFunction ){
        
        var fields = [];
        
        $.each( options.fields, function ( fieldId, field ) {
            var filtered = filterFunction( field );
            
            if ( options.key == field.id && ! filtered ) {
                return;
            }
            if ( filtered == false ){
                return;
            }
            fields.push( field );
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
            
            pageUtils.configureTemplate( options, template );

            zpt.run({
                //root: options.target[0],
                root: options.body,
                dictionary: dictionary,
                declaredRemotePageUrls: options.templates.declaredRemotePageUrls
            });
            
            afterProcessTemplate();
            
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
    var updateRecordFromForm = function(){
        record = {};
        
        for ( var c = 0; c < options.currentForm.fields.length; c++ ) {
            var field = options.currentForm.fields[ c ];
            record[ field.id ] = fieldBuilder.getValueFromForm( field, options );
        }
    };
    var updateRecordFromDefaultValues = function(){
        record = {};
        
        for ( var c = 0; c < options.currentForm.fields.length; c++ ) {
            var field = options.currentForm.fields[ c ];
            if ( field.defaultValue ){
                record[ field.id ] = field.defaultValue;
            }
        }
    };
    var buildRecord = function(){
        var newRecord = {};

        for ( var c = 0; c < options.currentForm.fields.length; c++ ) {
            var field = options.currentForm.fields[ c ];
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
            record: recordFunction()
        }, options.dictionary );
    };
    
    var buildProcessTemplateParams = function( field ){
        
        return {
            field: field, 
            value: record[ field.id ],
            options: options,
            record: record,
            source: options.currentForm.type,
            dictionary: dictionary
        };
    };
    
    var beforeProcessTemplate = function(){
        
        updateDictionary();
        
        for ( var c = 0; c < options.currentForm.fields.length; c++ ) {
            var field = options.currentForm.fields[ c ];
            fieldBuilder.beforeProcessTemplateForField(
                buildProcessTemplateParams( field )
            );
        }
    };
    
    var afterProcessTemplate = function(){
                
        validationManager.initFormValidation( id, $form, options );
        addButtonsEvents();
        
        for ( var c = 0; c < options.currentForm.fields.length; c++ ) {
            var field = options.currentForm.fields[ c ];
            fieldBuilder.afterProcessTemplateForField(
                buildProcessTemplateParams( field )
            );
        }
        
        options.events.formCreated( options );
    };
    
    var addButtonsEvents = function() {

        $( '#form-submit-button' )
            .click(function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                submitFunction( event );
            });
        $( '#form-cancel-button' )
            .click(function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                cancelFunction( event );
            });
    };
    
    var submitCreateForm = function( event ){
        
        updateRecordFromForm();
        FormPage.createRecord( options, record, event );
    };
    
    var submitUpdateForm = function( event ){
        
        updateRecordFromForm();
        FormPage.updateRecord( options, record, event );
    };
    
    var submitDeleteForm = function( event ){
        
        FormPage.deleteRecord( options, $( '#zcRecordKey' ).val(), event );
    };
    
    var cancelForm = function( event ){
        options.events.formClosed( event, options );
        context.getListPage( options ).show( false );
    };
    
    configure();
    
    return {
        show: show,
        setRecord: setRecord,
        getRecord: getRecord,
        updateRecordFromDefaultValues: updateRecordFromDefaultValues
    };
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
