/* 
    Class FormPage
*/
module.exports = function ( optionsToApply, type ) {
    "use strict";
    
    var context = require( '../context.js' );
    var pageUtils = require( './pageUtils.js' );
    var fieldBuilder = require( '../fields/fieldBuilder' );
    var validationManager = require( '../validationManager.js' );
    var crudManager = require( '../crudManager.js' );
    var $ = require( 'jquery' );
    var zpt = require( 'zpt' );
    
    //var self = this;
    var options = optionsToApply;
    var dictionary = undefined;
    var record = undefined;
    var template = undefined;
    var submitFunction = undefined;
    var cancelFunction = undefined;
    var recordFunction = undefined;
    
    // Configure instance depending on type parameter
    var configure = function(){
        options.currentForm = {};
        options.currentForm.type = type;
        options.currentForm.id = options.formId;
        options.currentForm.$form = $( '#' + options.currentForm.id );
        switch ( type ) {
        case 'create':
            template = options.createTemplate;
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
            template = options.updateTemplate;
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
            template = options.deleteTemplate;
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

            var self = this;
            
            beforeProcessTemplate( self );
            
            pageUtils.configureTemplate( options, template );

            zpt.run({
                //root: options.target[0],
                root: options.body,
                dictionary: dictionary,
                declaredRemotePageUrls: options.declaredRemotePageUrls,
                callback: function(){ 
                    afterProcessTemplate( self );
                }
            });
            
        } catch( e ){
            alert ( e );    
        }
    };
    
    // Set, get and update record
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
    
    var updateDictionary = function(){

        dictionary = $.extend( {
            options: options,
            record: recordFunction()
        }, options.dictionary );
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
    
    var buildProcessTemplateParams = function( field, self ){
        return {
            field: field, 
            value: record[ field.id ],
            options: options,
            record: record,
            source: options.currentForm.type,
            //form: self,
            dictionary: dictionary
        };
    };
    
    var beforeProcessTemplate = function( field, self ){
        
        updateDictionary();
        
        for ( var c = 0; c < options.currentForm.fields.length; c++ ) {
            var field = options.currentForm.fields[ c ];
            fieldBuilder.beforeProcessTemplateForField(
                buildProcessTemplateParams( field, self )
            );
        }
    };
    
    var afterProcessTemplate = function( field, self ){
                
        validationManager.initFormValidation( options );
        addButtonsEvents();
        
        for ( var c = 0; c < options.currentForm.fields.length; c++ ) {
            var field = options.currentForm.fields[ c ];
            fieldBuilder.afterProcessTemplateForField(
                buildProcessTemplateParams( field, self )
            );
        }
        
        options.events.formCreated( options );
    };
    
    var addButtonsEvents = function() {

        var submitButton = $( '#form-submit-button' )
            .click(function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                submitFunction( event );
            });
        var cancelButton = $( '#form-cancel-button' )
            .click(function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                cancelFunction( event );
            });
    };
    
    var submitCreateForm = function( event ){

        submitCreateAndUpdateForms( 
            event, 
            'createSuccess' );
    };
    
    var submitUpdateForm = function( event ){
        
        submitCreateAndUpdateForms( 
            event, 
            'updateSuccess' );
    };
    
    var submitCreateAndUpdateForms = function( event, successMessage ){
        
        updateRecordFromForm();
        
        var data = {
            record: record,
            success: function( dataFromServer ){
                context.getMainPage().show(
                    true,
                    {
                        status: {
                            message: successMessage,
                            date: new Date().toLocaleString()
                        }
                    });
            },
            error: function( dataFromServer ){
                context.showError( 'serverCommunicationError', true );
            }
        };
        
        crudManager.updateRecord( data, options, event );
    };
    
    var submitDeleteForm = function( event ){
        
        var data = {
            key: $( '#zcRecordKey' ).val(),
            success: function( dataFromServer ){
                context.getMainPage().show(
                    true,
                    {
                        status: {
                            message: 'deleteSuccess',
                            date: new Date().toLocaleString()
                        }
                    });
            },
            error: function( dataFromServer ){
                context.showError( 'serverCommunicationError', true );
            }
        };

        crudManager.deleteRecord( data, options, event );
    };
    
    var cancelForm = function( event ){
        //alert( 'cancelForm' );
        options.events.formClosed( event, options );
        context.getMainPage().show( false );
    };
    
    configure();
    
    return {
        show: show,
        setRecord: setRecord,
        getRecord: getRecord,
        updateRecordFromDefaultValues: updateRecordFromDefaultValues
    };
};