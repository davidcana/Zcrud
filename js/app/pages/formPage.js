/* 
    Class FormPage
*/
module.exports = function ( optionsToApply, type ) {
    "use strict";
    
    var context = require( '../context.js' );
    var pageUtils = require( './pageUtils.js' );
    var $ = require( 'jquery' );
    var zpt = require( 'zpt' );
    
    var self = this;
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
            break;
        case 'update':
            template = options.updateTemplate;
            options.currentForm.title = "Edit form";
            submitFunction = submitUpdateForm;
            cancelFunction = cancelForm;
            break;
        case 'delete':
            template = options.deleteTemplate;
            options.currentForm.title = "Delete form";
            submitFunction = submitDeleteForm;
            cancelFunction = cancelForm;
            break; 
        default:
            throw "Unknown FormPage type: " + type;
        }
    };
    
    // Main method
    var show = function(){
        updateDictionary();
        buildHTMLAndJavascript();
    };
    
    // Set and get record
    var setRecord = function( recordToApply ){
        record = recordToApply;
    };
    var getRecord = function(){
        return record;
    };
    
    var buildHTMLAndJavascript = function(){
        
        if ( ! record ){
            throw "No record set in update!";
        }
        
        pageUtils.configureTemplate( options, template );
        
        zpt.run({
            //root: options.target[0],
            root: options.body,
            dictionary: dictionary,
            callback: addButtonsEvents
        });
    };
    
    var updateDictionary = function(){
        
        dictionary = {
            options: options,
            record: record
        };
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
        context.getMainPage().show();
    };
    
    var submitUpdateForm = function( event ){
        //alert( 'submitUpdateForm' );
        context.getMainPage().show();
    };
    
    var submitDeleteForm = function( event ){
        //alert( 'submitDeleteForm' );
        context.getMainPage().show();
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