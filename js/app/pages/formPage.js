/* 
    Class FormPage
*/
module.exports = function ( optionsToApply, type ) {
    "use strict";
    
    var context = require( '../context.js' );
    var pageUtils = require( './pageUtils.js' );
    var $ = require( 'jquery' );
    var zpt = require( 'zpt' );
    var fieldBuilder = require( '../fields/fieldBuilder' );
    
    //var self = this;
    var options = optionsToApply;
    var dictionary = undefined;
    var record = undefined;
    var template = undefined;
    var submitFunction = undefined;
    var cancelFunction = undefined;
    
    // Configure instance depending on type parameter
    var configure = function(){
        options.currentForm = {};
        options.currentForm.type = type;
        switch( type ) {
        case 'create':
            template = options.createTemplate;
            options.currentForm.title = "Create form";
            submitFunction = submitCreateForm;
            cancelFunction = cancelForm;
            options.currentForm.fields = buildFields(
                function( field ){
                    return field.create;
                });
            break;
        case 'update':
            template = options.updateTemplate;
            options.currentForm.title = "Edit form";
            submitFunction = submitUpdateForm;
            cancelFunction = cancelForm;
            options.currentForm.fields = buildFields(
                function( field ){
                    return field.edit;
                });
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
                callback: function(){ 
                    afterProcessTemplate( self ) 
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
    var updateRecord = function(){
        record = {};
        
        for ( var c = 0; c < options.currentForm.fields.length; c++ ) {
            var field = options.currentForm.fields[ c ];
            record[ field.id ] = fieldBuilder.getValue( field );
        }
    };
    
    var updateDictionary = function(){
        
        dictionary = {
            options: options,
            record: record
        };
    };
    
    var buildProcessTemplateParams = function( field, self ){
        return {
            field: field, 
            value: record[ field.id ],
            options: options,
            record: record,
            source: options.currentForm.type,
            form: self,
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
        
        addButtonsEvents();
        
        for ( var c = 0; c < options.currentForm.fields.length; c++ ) {
            var field = options.currentForm.fields[ c ];
            fieldBuilder.afterProcessTemplateForField(
                buildProcessTemplateParams( field, self )
            );
        }
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
        //alert( 'submitCreateForm' );
        
        submitCreateAndUpdateForms( 
            event, 
            options.actions.createAction,
            'create', 
            options.messages.createSuccess );
    };
    
    var submitUpdateForm = function( event ){
        //alert( 'submitUpdateForm' );
        
        submitCreateAndUpdateForms( 
            event, 
            options.actions.updateAction,
            'update', 
            options.messages.updateSuccess );
    };
    
    var submitCreateAndUpdateForms = function( event, url, command, successMessage ){
        //alert( 'submitCreateForm' );
        
        updateRecord();
        
        var dataToSend = {
            command: command,
            records: [ record ]
        };
        
        var thisOptions = {
            url        : url,
            data       : options.ajaxPreFilter( dataToSend ),
            success    : function ( data ) {
                data = options.ajaxPostFilter( data );
                context.getMainPage().show({
                        status: {
                            message: successMessage,
                            date: new Date().toLocaleString()
                        }
                });
            },
            error      : function ( data ) {
                data = options.ajaxPostFilter( data );
                context.showError( options.messages.serverCommunicationError );
            }
        };
        
        options.ajax(
            $.extend( {}, options.defaultFormAjaxOptions, thisOptions ) );
    };
    
    var submitDeleteForm = function( event ){
        //alert( 'submitDeleteForm' );
        
        var key = $( '#zcRecordKey' ).val();
        var command = 'delete';
        var url = options.actions.deleteAction;
        var successMessage = options.messages.deleteSuccess;
        
        var dataToSend = {
            command: command,
            keys: [ key ]
        };
            
        var thisOptions = {
            url        : url,
            data       : options.ajaxPreFilter( dataToSend ),
            success    : function ( data ) {
                data = options.ajaxPostFilter( data );
                context.getMainPage().show({
                        status: {
                            message: successMessage,
                            date: new Date().toLocaleString()
                        }
                });
            },
            error      : function ( data ) {
                data = options.ajaxPostFilter( data );
                context.showError( options.messages.serverCommunicationError );
            }
        };
        
        options.ajax(
            $.extend( {}, options.defaultFormAjaxOptions, thisOptions ) );
    };
    
    var cancelForm = function( event ){
        //alert( 'cancelForm' );
        context.getMainPage().show();
    };
    
    configure();
    
    return {
        show: show,
        setRecord: setRecord,
        getRecord: getRecord
    };
};