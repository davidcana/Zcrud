/* 
    fieldBuilder singleton class
*/
module.exports = (function() {
    "use strict";
    
    var $ = require( 'jquery' );
    
    var fieldManagers = {};
    var dictionaryAddOn = {};
    
    var register = function( fieldManager, fieldTypes ) {
        
        var fieldTypes = fieldTypes || fieldManager.types;
        
        if ( $.isArray( fieldTypes ) ){ 
            for ( var c = 0; c < fieldTypes.length; c++ ) {
                fieldManagers[ fieldTypes[ c ] ] = fieldManager;
            }
            
        } else {
            fieldManagers[ fieldTypes ] = fieldManager;
        }
        
        if ( fieldManager.addToDictionary ){
            dictionaryAddOn[ fieldManager.id ] = fieldManager;
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
        register( require( './subformManager.js' ) );
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
    /*
    var setValueToForm = function( field, value, $this, defaultBlur ){

        var fieldManager = fieldManagers[ field.type ];

        if ( fieldManager && $.isFunction( fieldManager.setValueToForm ) ){
            fieldManager.setValueToForm( field, value, $this );
            return;
        }

        $this.val( value );
        //if ( defaultBlur ){
            //$this.blur();
            $this.keyup();
        //}
    };*/
    
    var setValueToForm = function( field, value, $this, defaultBlur ){

        var fieldManager = fieldManagers[ field.type ];

        if ( fieldManager && $.isFunction( fieldManager.setValueToForm ) ){
            fieldManager.setValueToForm( field, value, $this );
        } else {
            $this.val( value );
        }
        
        //if ( defaultBlur ){
            //$this.blur();
            $this.keyup();
        //}
    };
    
    var getValue = function( field, $this ){

        var fieldManager = fieldManagers[ field.type ];

        if ( fieldManager && $.isFunction( fieldManager.getValue ) ){
            return fieldManager.getValue( $this, field );
        }

        return $this.val();
    };
    
    var getValueFromForm = function( field, options, $selection ){
        
        var fieldManager = fieldManagers[ field.type ];
        
        if ( fieldManager && $.isFunction( fieldManager.getValueFromForm ) ){
            return fieldManager.getValueFromForm( field, options, $selection );
        }
        
        return $selection.find( "[name='" + field.id + "']").val();
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
    
    var getPostTemplate = function( field ){

        var fieldManager = fieldManagers[ field.type ];

        if ( fieldManager && $.isFunction( fieldManager.getPostTemplate ) ){
            return fieldManager.getPostTemplate( field );
        }

        return undefined;
    };
    /*
    var getLabelFor = function( field, options ){
        
        var fieldManager = fieldManagers[ field.type ];
        
        if ( fieldManager && $.isFunction( fieldManager.getLabelFor ) ){
            return fieldManager.getLabelFor( field );
        }
        
        return field.elementId;
    };*/
    
    var mustHideLabel = function( field ){

        var fieldManager = fieldManagers[ field.type ];

        if ( fieldManager && $.isFunction( fieldManager.mustHideLabel ) ){
            return fieldManager.mustHideLabel( field );
        }

        return false;
    };
    
    var buildFields = function( field ){

        var fieldManager = fieldManagers[ field.type ];

        if ( fieldManager && $.isFunction( fieldManager.buildFields ) ){
            fieldManager.buildFields( field );
        }
    };
    
    var filterValue = function( record, field ){

        var fieldManager = fieldManagers[ field.type ];

        if ( fieldManager && $.isFunction( fieldManager.filterValue ) ){
            return fieldManager.filterValue( record, field, self );
        }

        return record[ field.id ];
    };
    
    var filterValues = function( record, fields ){
        
        var newRecord = {};
        
        for ( var index in fields ){
            var field = fields[ index ];
            var value = filterValue( record, field );
            if ( value != undefined ){
                newRecord[ field.id ] = value;
            }
        }
        
        return newRecord;
    };
    
    var addFieldManagersToDictionary = function( dictionary ){
        $.extend( dictionary, dictionaryAddOn );
    };
    
    var self = {
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
        getPostTemplate: getPostTemplate,
        //getLabelFor: getLabelFor,
        setValueToForm: setValueToForm,
        mustHideLabel: mustHideLabel,
        buildFields: buildFields,
        filterValues: filterValues,
        filterValue: filterValue,
        addFieldManagersToDictionary: addFieldManagersToDictionary
    };
    
    return self;
})();
