/* 
    fieldBuilder singleton class
*/
module.exports = (function() {
    "use strict";
    
    var context = require( '../context.js' );
    var $ = require( 'jquery' );
    
    var fieldManagers = {};
    
    var register = function( fieldManager, fieldTypes ) {
        
        var fieldTypes = fieldTypes || fieldManager.types;
        
        if ( $.isArray( fieldTypes ) ){ 
            for ( var c = 0; c < fieldTypes.length; c++ ) {
                fieldManagers[ fieldTypes[ c ] ] = fieldManager;
            }
            
        } else {
            fieldManagers[ fieldTypes ] = expressionsManager
        }
    };
    
    var unregister = function( fieldManager, fieldTypes ) {
        
        var fieldTypes = fieldTypes || fieldManager.types;
        
        if ( $.isArray( fieldTypes ) ){
            for ( var c = 0; c < fieldTypes.length; c++ ) {
                delete fieldManagers[ fieldTypes[ c ] ];
            }
            
        } else { 
            delete fieldManagers[ fieldTypes ];
        }
    };
    
    var registerAll = function(){
        register( require( './datetimeFieldManager.js' ) );
        register( require( './optionListProviderManager.js' ) );
    }();
    
    var beforeProcessTemplateForField = function( params ){
        
        var fieldManager = fieldManagers[ params.field.type ];
        
        if ( fieldManager ){
            fieldManager.beforeProcessTemplateForField( params );
        }
    };
    
    var afterProcessTemplateForField = function( params ){
        
        var fieldManager = fieldManagers[ params.field.type ];
        
        if ( fieldManager ){
            fieldManager.afterProcessTemplateForField( params );
        }
    };
    
    var getValue = function( field, elementId ){
        
        var fieldManager = fieldManagers[ field.type ];
        
        if ( fieldManager && $.isFunction( fieldManager.getValue ) ){
            return fieldManager.getValue( field, elementId );
        }
        
        return $( '#' + elementId ).val();
    };
    
    return {
        register: register,
        unregister: unregister,
        registerAll: registerAll,
        beforeProcessTemplateForField: beforeProcessTemplateForField,
        afterProcessTemplateForField: afterProcessTemplateForField,
        getValue: getValue
    };
})();
