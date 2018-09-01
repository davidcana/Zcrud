/*
    buttonUtils singleton class
*/
"use strict";

//var context = require( '../context.js' );
var $ = require( 'jquery' );

var ButtonUtils = function() {
    
    var getButtonList = function( source, type, parent, options ){
        
        if ( ! source ){
            throw 'Undefined source in getButtonList method with type "' + type + '"!'
        }
        
        var result = [];
        
        for ( var c = 0; c < source.length; ++c ){
            var sourceItem = source[ c ];
            var button = getButton( sourceItem, type, parent, options );
            result.push( button );
        }
        
        return result;
    };
    
    var getButton = function( sourceItem, type, parent, options ){
        
        var button = undefined;
        var checkBindable = true;
        
        if ( $.isPlainObject( sourceItem ) ){
            button = buildButton( 'generic', sourceItem, parent, options );
            checkBindable = false;
        } else {
            button = buildButton( sourceItem, {}, parent, options );
        }
        
        if ( checkBindable && ! button.isBindable( type ) ){
            throw 'Button "' + button + '" not bindable to type "' + type + '"!';
        }
        
        return button;
    };
    
    var buildButton = function( buttonType, properties, parent, options ){
        return new options.buttons[ buttonType ]( properties, parent );
    };
    
    return {
        getButtonList: getButtonList
    };
}();

module.exports = ButtonUtils;