/*
    buttonUtils singleton class
*/
"use strict";

//var context = require( '../context.js' );
//var $ = require( 'jquery' );

var ButtonUtils = function() {
    
    var getButtonList = function( source, type, options ){
        
        if ( ! source ){
            throw 'Undefined source in getButtonList method with type "' + type + '"!'
        }
        
        var result = [];
        
        for ( var c = 0; c < source.length; ++c ){
            var sourceItem = source[ c ];
            var button = getButton( sourceItem, options );
            if ( button.isBindable( type ) ){
                result.push( button );
            } else {
                throw 'Button "' + button + '" not bindable to type "' + type + '"!';
            }
        }
        
        return result;
    };
    
    var getButton = function( sourceItem, options ){
        return getButtonById( sourceItem, options );
    };
    
    var getButtonById = function( id, options ){
        return new options.buttons[ id ]();
    };
    
    return {
        getButtonList: getButtonList
    };
}();

module.exports = ButtonUtils;