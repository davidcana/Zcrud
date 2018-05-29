/*
    OptionsFieldManager singleton class
*/
"use strict";

var context = require( '../context.js' );
var optionProvider = require( './optionProvider.js' );
var $ = require( 'jquery' );
var zpt = require( 'zpt' );
    
var OptionsFieldManager = function() {
    
    var afterProcessTemplateForFieldInCreateOrUpdate = function( params, $selection ){
        
        if ( ! params.field.dependsOn ){
            return;
        }
        
        var $thisDropdown = $selection.find( "[name='" + params.field.name + "']");

        // Build dictionary
        var dictionary = $.extend( {}, params.dictionary );
        dictionary.field = params.field;
        dictionary.type = params.field.type;
        dictionary.value = params.value;
        
        //for each dependency
        $.each( params.field.dependsOn, function ( index, dependsOn ) {
            var dependsOnField = context.getField( params.options.fields, dependsOn );
            
            //find the depended combobox
            var $dependsOnDropdown = $selection.find( "[name='" + dependsOnField.name + "']");
            
            //when depended combobox changes
            $dependsOnDropdown.change(function () {
                
                //Refresh options
                params.dependedValues = optionProvider.createDependedValuesUsingForm( params.field, params.options, $selection, params ) ;
                dictionary.optionsListFromForm = optionProvider.buildOptions( params );
                dictionary.record = params.record;
                dictionary.value = params.record[ params.field.id ];
                dictionary.field = params.field;
                dictionary.type = params.field.type;
                dictionary.value = params.value;
                
                // Refresh template
                context.getZPTParser().run({
                    root: $thisDropdown[ 0 ],
                    dictionary: dictionary,
                    notRemoveGeneratedTags: false
                });

                //Thigger change event to refresh multi cascade dropdowns.
                $thisDropdown.trigger( "change", [ true ] );
            });
        });
    };
    
    var afterProcessTemplateForField = function( params, $selection ){
        switch( params.source ) {
        case 'create':
        case 'update':
                afterProcessTemplateForFieldInCreateOrUpdate( params, $selection );
            break;
        case 'delete':
            // Nothing to do
            break; 
        default:
            throw "Unknown source in OptionsFieldManager: " + params.source;
        }
    };
    
    var getValueFromSelectionAndField = function( field, $selection ){
        
        var $checkboxesContainer = $selection.parents( '.zcrud-checkboxes-container' ).first();
        //return $checkboxesContainer.find( "input[type='checkbox'][name='" + field.name + "[0]']:checked" ).map(
        return $checkboxesContainer.find( "input[type='checkbox']:checked" ).map(
            function() {
                return $( this ).val();
            }
        ).get();
    };
    
    var getValueFromForm = function( field, options, $selection ){

        switch( field.type ) {
            case 'checkboxes':
                return getValueFromSelectionAndField( field, $selection );
            case 'radio':
                var $selectedRadio = $selection.find( "input[type='radio'][name='" + field.name + "[0]']:checked" );
                return $selectedRadio.length > 0? $selectedRadio.val(): undefined;
            case 'select':
                return $selection.find( "select[name='" + field.name + "']").val();
            //case 'optgroup':
            case 'datalist':
                return $selection.find( "input[name='" + field.name + "']").val();
        }

        throw "Unknown field type in optionsFieldManager: " + field.type;
    };
    
    var setValueToForm = function( field, value, $this ){
        
        switch( field.type ) {
            case 'checkboxes':  
                var $checkboxesContainer = $this.parents( '.zcrud-checkboxes-container' ).first();
                var $checkboxes = $checkboxesContainer.find( 'input:checkbox.zcrud-active' );
                $checkboxes.prop( 'checked', false ); 
                if ( value ){
                    for ( var i = 0; i < value.length; ++i ){
                        $checkboxes.filter( '[value=' + value[ i ] + ']' ).prop( 'checked', true );   
                    }
                }
                return;
            case 'radio':
                var $radiosContainer = $this.parents( '.zcrud-radio-container' ).first();
                var $radios = $radiosContainer.find( 'input:radio.zcrud-active' );
                if ( value ){
                    $radios.filter( '[value=' + value + ']' ).prop( 'checked', true );   
                } else {
                    $radios.prop( 'checked', false ); 
                }
                return;
            case 'select':
            //case 'optgroup':
            case 'datalist':
                $this.val( value );
                $this.trigger( "change", [ true ] ); 
                return;
        }
        
        throw "Unknown field type in optionsFieldManager: " + field.type;
    };
    
    var getValue = function( $this, field ){

        switch( field.type ) {
            case 'checkboxes':
                return getValueFromSelectionAndField( field, $this );
            case 'radio':
            case 'select':
            //case 'optgroup':
            case 'datalist':
                return $this.val();
        }

        throw "Unknown field type in optionsFieldManager: " + field.type;
    };
    
    var getValueFromRecord = function( field, record, params ){

        switch( params.source ) {
            case 'create':
            case 'update':
                return record[ field.id ];
            case 'delete':
                var optionsList = getOptionsFromRecord( record, field, params.options );
                var tempValue = record[ field.id ];
                try {
                    var map = getDisplayTextMapFromArrayOptions( optionsList, field );
                    if ( field.type == 'checkboxes' ){
                        return getMultipleValueFromRecord( map, tempValue );
                    }
                    var inMapValue = map[ tempValue ];
                    return inMapValue? inMapValue: tempValue;
                } catch ( e ){
                    return tempValue;
                }
            default:
                throw "Unknown source in OptionsFieldManager: " + params.source;
        }
    };
    
    var getMultipleValueFromRecord = function( optionsMap, value ){ 
        
        var result = '';
        
        for ( var i in value ) {
            var currentValue = value[ i ];
            var translatedText = optionsMap[ currentValue ];
            if ( i > 0 ){
                result += ', ';
            }
            result += translatedText;
        }
        
        return result;
    };
    
    var getDisplayTextMapFromArrayOptions = function( optionsArray, field ){
        
        var map = {};
        
        for ( var i = 0; i < optionsArray.length; i++ ) {
            var option = optionsArray[ i ];
            map[ option.value ] = field.translateOptions? context.translate( option.displayText ): option.displayText;
        }
        
        return map;
    };
    
    var getTemplate = function( field ){
        return field.type + '@templates/fields/basic.html'
    };
    
    var getPostTemplate = function( field ){

        switch( field.type ) {
            case 'checkboxes':
            case 'radio':
            case 'select':
            //case 'optgroup':
                return;
            case 'datalist':
                return 'datalist-definition@templates/fields/basic.html';
        }

        throw "Unknown field type in optionsFieldManager: " + field.type;
    };

    var mustHideLabel = function( field ){
        
        switch( field.type ) {
            case 'checkboxes':
            case 'radio':
                return true;
            case 'select':
            //case 'optgroup':
            case 'datalist':
                return false;
        }

        throw "Unknown field type in optionsFieldManager: " + field.type;
    };
    
    var getOptionsFromBlank = function( field, options ){
        return optionProvider.getOptionsFromBlank( field, options );
    };

    var getOptionsFromRecord = function( record, field, options ){
        return optionProvider.getOptionsFromRecord( record, field, options );
    };
    
    return {
        id: 'optionsFieldManager',
        addToDictionary: true,
        afterProcessTemplateForField: afterProcessTemplateForField,
        getValue: getValue,
        getValueFromForm: getValueFromForm,
        setValueToForm: setValueToForm,
        getValueFromRecord: getValueFromRecord,
        getTemplate: getTemplate,
        getOptionsFromBlank: getOptionsFromBlank,
        getOptionsFromRecord: getOptionsFromRecord,
        getPostTemplate: getPostTemplate,
        mustHideLabel: mustHideLabel
    };
}();

// TODO Implement support of optgroup
//OptionsFieldManager.types = [ 'datalist', 'select', 'optgroup', 'radio' ];

module.exports = OptionsFieldManager;