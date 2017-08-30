/* 
    filteringComponent class
*/
module.exports = function( optionsToApply, listPageToApply ) {
    "use strict";
    
    var context = require( '../context.js' );
    var $ = require( 'jquery' );
    var pageUtils = require( './pageUtils.js' );
    
    var options = optionsToApply;
    var listPage = listPageToApply;
    
    var thisOptions = options.filtering;
    
    var bindEvents = function(){

    };
    
    var getThisOptions = function(){
        return thisOptions;
    };
    
    var resetPage = function(){

    };
    
    var normalizeOptions = function(){
        
        var edited = [];
        
        $.each( thisOptions.fields, function ( filterFieldId, filterField ) {
            
            var newFilterField = undefined;
            
            if ( $.type( filterField ) === 'string' ){
                newFilterField = options.fields[ filterField ];
            } else {
                newFilterField = filterField;
            }
            
            newFilterField.elementId += thisOptions.elementIdSuffix;
            edited.push( newFilterField );
            
            context.declareRemotePageUrl( newFilterField.template, options );
        });
        
        thisOptions.fields = edited;
    }();
    
    return {
        bindEvents: bindEvents,
        getThisOptions: getThisOptions,
        resetPage: resetPage
    };
};
