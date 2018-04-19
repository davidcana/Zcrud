/* 
    context singleton class
*/

module.exports = (function() {
    "use strict";
    
    var $ = require( 'jquery' );
    
    /*
    var configureTemplate = function( options, templatePath ){
        options.target.attr(
            'data-muse-macro', templatePath );
    };*/
    
    var configureTemplate = function( options, templatePath ){
        
        var $containerDiv = $('<div />')
            .attr( 'data-muse-macro', templatePath );
        options.target.html( $containerDiv );
    };
    
    /* Normalizes a number between given bounds or sets to a defaultValue
    *  if it is undefined
    *************************************************************************/
    var normalizeNumber = function ( number, min, max, defaultValue ) {
        
        if ( number == undefined || number == null || isNaN( number ) ) {
            return defaultValue;
        }

        if ( number < min ) {
            return min;
        }

        if ( number > max ) {
            return max;
        }

        return number;
    };
    
    /* Finds index of an element in an array according to given comparision function
        *************************************************************************/
    var findIndexInArray = function ( value, array, compareFunc ) {

        // If not defined, use default comparision
        if ( ! compareFunc ) {
            compareFunc = function ( a, b ) {
                return a == b;
            };
        }
        
        for ( var i = 0; i < array.length; i++ ) {
            if ( compareFunc( value, array[i] ) ) {
                return i;
            }
        }
        return -1;
        
        /*
        var result = -1;
        array.each( function( index ) {
            if ( compareFunc( value, $( this ) ) ) {
                result = index;
                return false;
            }
        });
        
        return result;*/
    };
    
    var ajaxError = function( request, status, error, options, context, userErrorFunction ){
        
        context.showError( options, request.responseText, false );
        
        if ( userErrorFunction ){
            userErrorFunction( request, status, error, options, context );
        }
    };
    
    return {
        configureTemplate: configureTemplate,
        normalizeNumber: normalizeNumber,
        findIndexInArray: findIndexInArray,
        ajaxError: ajaxError
    };
})();
