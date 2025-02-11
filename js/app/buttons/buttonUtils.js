/*
    buttonUtils singleton class
*/
"use strict";

var $ = require( 'jquery' );
var utils = require( '../utils.js' );

var ButtonUtils = function() {
    
    var getButtonList = function( source, type, parent, options ){
        
        if ( ! source ){
            throw 'Undefined source in getButtonList method with type "' + type + '"!'
        }
        
        var result = [];
        
        for ( var c = 0; c < source.length; ++c ){
            var sourceItem = source[ c ];
            var button = getButton( sourceItem, type, parent, options );
            
            // Exclude the button if the type of the parent is included in the notUseInPages list of the buttton
            if ( -1 == button.notUseInPages.indexOf( parent.getType() ) ){
                result.push( button );
            }
        }
        
        return result;
    };
    
    var getButton = function( sourceItem, type, parent, options ){
        
        var button = undefined;
        
        if ( utils.isPlainObject( sourceItem ) ){
            button = buildButton( 
                sourceItem.type || 'generic', 
                sourceItem, 
                parent, 
                options );
        } else {
            button = buildButton( sourceItem, {}, parent, options );
        }
        
        if ( ! button.isBindable( type ) ){
            throw 'Button "' + button + '" not bindable to type "' + type + '"!';
        }
        
        return button;
    };
    
    var buildButton = function( buttonType, properties, parent, options ){
        
        var constructor = options.buttons[ buttonType ];
        if ( ! constructor ){
            throw 'Unknown button type to build: ' + buttonType;
        }
        return new constructor( properties, parent );
    };
    
    return {
        getButtonList: getButtonList
    };
}();

module.exports = ButtonUtils;