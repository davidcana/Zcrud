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
    
    //var beforeProcessTemplate = function( field, elementId, options, record ){
    var beforeProcessTemplateForField = function( params ){
        
        var fieldManager = fieldManagers[ params.field.type ];
        
        if ( fieldManager ){
            //fieldManager.beforeProcessTemplate( field, elementId, options, record );
            fieldManager.beforeProcessTemplateForField( params );
        }
    };
    
    //var afterProcessTemplate = function( field, elementId, options, record ){
    var afterProcessTemplateForField = function( params ){
        
        var fieldManager = fieldManagers[ params.field.type ];
        
        if ( fieldManager ){
            //fieldManager.afterProcessTemplate( field, elementId, options, record );
            fieldManager.afterProcessTemplateForField( params );
        }
    };
    
    return {
        register: register,
        unregister: unregister,
        registerAll: registerAll,
        beforeProcessTemplateForField: beforeProcessTemplateForField,
        afterProcessTemplateForField: afterProcessTemplateForField
    };
})();
