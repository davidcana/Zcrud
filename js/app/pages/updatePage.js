/* 
    Class UpdatePage
*/
module.exports = function ( optionsToApply ) {
    "use strict";
    
    var context = require( '../context.js' );
    var pageUtils = require( './pageUtils.js' );
    var $ = require( 'jquery' );
    var zpt = require( 'zpt' );
    
    var options = optionsToApply;
    var dictionary = undefined;
    var record = undefined;

    //
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
        
        //configureTemplate();
        pageUtils.configureTemplate( options, options.updateTemplate );
        
        zpt.run({
            //root: options.target[0],
            root: options.body,
            dictionary: dictionary,
            callback: addButtonsEvents
        });
    };
    /*
    var configureTemplate = function(){
        options.target.attr(
            'data-muse-macro', options.updateTemplate );
    };*/
    
    var updateDictionary = function(){
        
        dictionary = {
            options: options,
            record: record
        };
    };
    
    var addButtonsEvents = function() {

        var submitButton = $( '#Edit-submit-button' )
            .click(function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                submitForm( event );
            });
        var cancelButton = $( '#Edit-cancel-button' )
            .click(function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                cancelForm( event );
            });
    };
    
    var submitForm = function( event ){
        //alert( 'submitForm' );
        context.getMainPage().show();
    };

    var cancelForm = function( event ){
        //alert( 'cancelForm' );
        context.getMainPage().show();
    };
    
    return {
        show: show,
        setRecord: setRecord,
        getRecord: getRecord
    };
};