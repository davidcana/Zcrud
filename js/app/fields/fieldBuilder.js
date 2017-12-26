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
        register( require( './checkboxFieldManager.js' ) );
    }();
    /*
    var beforeProcessTemplateForField = function( params ){
        
        var fieldManager = fieldManagers[ params.field.type ];
        
        if ( fieldManager && $.isFunction( fieldManager.beforeProcessTemplateForField ) ){
            fieldManager.beforeProcessTemplateForField( params );
        }
    };*/
    
    var afterProcessTemplateForField = function( params, $selection ){
        
        var fieldManager = fieldManagers[ params.field.type ];
        
        if ( fieldManager && $.isFunction( fieldManager.afterProcessTemplateForField ) ){
            fieldManager.afterProcessTemplateForField( params, $selection );
        }
    };
    /*
    var afterProcessTemplateForFieldAndRecords = function( params, records ){

        var fieldManager = fieldManagers[ params.field.type ];

        if ( fieldManager && $.isFunction( fieldManager.afterProcessTemplateForField ) ){
            for ( var i = 0; i < records.length; i++ ) {
                var record = records[ i ];
                params.record = record;
                params.value = record[ params.field.id ];
                fieldManager.afterProcessTemplateForField( params );
            }
        }
    };*/
    
    var setValueToForm = function( field, value, $this, defaultBlur ){

        var fieldManager = fieldManagers[ field.type ];

        if ( fieldManager && $.isFunction( fieldManager.setValueToForm ) ){
            fieldManager.setValueToForm( field, value, $this );
            return;
        }

        $this.val( value );
        if ( defaultBlur ){
            $this.blur();
        }
    };
    
    var getValue = function( field, $this ){

        var fieldManager = fieldManagers[ field.type ];

        if ( fieldManager && $.isFunction( fieldManager.getValue ) ){
            return fieldManager.getValue( $this );
        }

        return $this.val();
    };
    
    var getValueFromForm = function( field, options ){
        
        var fieldManager = fieldManagers[ field.type ];
        
        if ( fieldManager && $.isFunction( fieldManager.getValueFromForm ) ){
            return fieldManager.getValueFromForm( field, options );
        }
        
        return $( '#' + field.elementId ).val();
    };
    
    var getValueFromRecord = function( field, record, params ){
        
        var fieldManager = fieldManagers[ field.type ];
        
        if ( fieldManager && $.isFunction( fieldManager.getValueFromRecord ) ){
            return fieldManager.getValueFromRecord( field, record, params );
        }
        
        return record[ field.id ];
    };
    
    var getTemplate = function( field, options ){
        
        var fieldManager = fieldManagers[ field.type ];
        
        if ( fieldManager && $.isFunction( fieldManager.getTemplate ) ){
            return fieldManager.getTemplate( field );
        }
        
        return options.fieldsConfig.getDefaultFieldTemplate( field );
    };
    
    var getLabelFor = function( field, options ){
        
        var fieldManager = fieldManagers[ field.type ];
        
        if ( fieldManager && $.isFunction( fieldManager.getLabelFor ) ){
            return fieldManager.getLabelFor( field );
        }
        
        return field.elementId;
    };
    
    return {
        register: register,
        unregister: unregister,
        registerAll: registerAll,
        //beforeProcessTemplateForField: beforeProcessTemplateForField,
        afterProcessTemplateForField: afterProcessTemplateForField,
        //afterProcessTemplateForFieldAndRecords: afterProcessTemplateForFieldAndRecords,
        getValue: getValue,
        getValueFromForm: getValueFromForm,
        getValueFromRecord: getValueFromRecord,
        getTemplate: getTemplate,
        getLabelFor: getLabelFor,
        setValueToForm: setValueToForm
    };
})();
