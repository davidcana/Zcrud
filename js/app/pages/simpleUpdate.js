/* 
    Class SimpleUpdate 
*/
module.exports = function ( optionsToApply ) {
    "use strict";
    
    var context = require( '../context.js' );
    var $ = require( 'jquery' );
    var zpt = require( 'zpt' );
    
    var options = optionsToApply;
    var dictionary = undefined;
    var record = undefined;

    //
    var run = function(){
        configureTemplate();
        parseTemplate();
    };
    
    // Set and get record
    var setRecord = function( recordToApply ){
        record = recordToApply;
    };
    var getRecord = function(){
        return record;
    };
    
    var configureTemplate = function( templatePath ){
        //alert( templatePath );
        options.target.attr(
            'data-muse-macro', options.updateTemplate );
    };
    
    //
    var parseTemplate = function(){
        
        if ( ! record ){
            throw "No record set in update!";
        }
        
        updateDictionary();
        
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
        alert( 'submitForm' );
    };

    var cancelForm = function( event ){
        alert( 'cancelForm' );
    };
    
    return {
        run: run,
        setRecord: setRecord,
        getRecord: getRecord
    };
};