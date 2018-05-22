/* 
    fieldBuilder singleton class
*/
module.exports = (function() {
    "use strict";
    
    var $ = require( 'jquery' );
    
    var fieldManagers = {};
    var dictionaryAddOn = {};
    
    var register = function( fieldManager, fieldTypes ) {
        
        fieldTypes = fieldTypes || fieldManager.types;
        
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

    var registerAll = function( managers ){

        for ( var i = 0; i < managers.length; ++i ){
            var item = managers[ i ];
            register( item.fieldManager, item.fieldTypes );
        }
    };
    
    var afterProcessTemplateForField = function( params, $selection ){
        
        var fieldManager = fieldManagers[ params.field.type ];
        
        if ( fieldManager && $.isFunction( fieldManager.afterProcessTemplateForField ) ){
            fieldManager.afterProcessTemplateForField( params, $selection );
        }
    };
    
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
    /*
    var getValueFromRecordForViewing = function( field, record, params ){

        var fieldManager = fieldManagers[ field.type ];

        if ( fieldManager && $.isFunction( fieldManager.getValueFromRecordForViewing ) ){
            return fieldManager.getValueFromRecordForViewing( field, record, params );
        }

        return record[ field.id ];
    };*/
    
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
    
    var getViewTemplate = function( field ){

        var fieldManager = fieldManagers[ field.type ];

        if ( fieldManager && $.isFunction( fieldManager.getViewTemplate ) ){
            return fieldManager.getViewTemplate( field );
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
        //unregister: unregister,
        registerAll: registerAll,
        //beforeProcessTemplateForField: beforeProcessTemplateForField,
        afterProcessTemplateForField: afterProcessTemplateForField,
        //afterProcessTemplateForFieldAndRecords: afterProcessTemplateForFieldAndRecords,
        getValue: getValue,
        getValueFromForm: getValueFromForm,
        getValueFromRecord: getValueFromRecord,
        //getValueFromRecordForViewing: getValueFromRecordForViewing,
        getTemplate: getTemplate,
        getPostTemplate: getPostTemplate,
        getViewTemplate: getViewTemplate,
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
