/*
    OptionListProviderManager singleton class
*/
"use strict";

var context = require( '../context.js' );
var optionProvider = require( './optionProvider.js' );
var $ = require( 'jquery' );
var zpt = require( 'zpt' );
    
var OptionListProviderManager = function() {
    
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
            throw "Unknown source in OptionListProviderManager: " + params.source;
        }
    };
    
    var getValueFromForm = function( field, options, $selection ){

        switch( field.type ) {
            case 'radio':
                var selected = $selection.find( "input[type='radio'][name='" + field.name + "[0]']:checked" );
                return selected.length > 0? selected.val(): undefined;
            case 'select':
                return $selection.find( "select[name='" + field.name + "']").val();
            //case 'optgroup':
            case 'datalist':
                return $selection.find( "input[name='" + field.name + "']").val();
        }

        throw "Unknown field type in optionListProviderManager: " + field.type;
    };
    
    var setValueToForm = function( field, value, $this ){
        
        switch( field.type ) {
        case 'radio':
            var $container = $this.parents( '.zcrud-radio-container' ).first();
            var $radios = $container.find( 'input:radio.zcrud-active' );
            if ( value ){
                $radios.filter( '[value=' + value + ']' ).prop( 'checked', true );   
            } else {
                $radios.prop( 'checked', false ); 
            }
            //$this.prop( 'checked', value? true: false );
            return;
        case 'select':
        //case 'optgroup':
        case 'datalist':
            $this.val( value );
            $this.trigger( "change", [ true ] );
            //$this.change(); 
            return;
        }
        
        throw "Unknown field type in optionListProviderManager: " + field.type;
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
                    var inMapValue = map[ tempValue ];
                    return inMapValue? inMapValue: tempValue;
                } catch ( e ){
                    return tempValue;
                }
            default:
                throw "Unknown source in OptionListProviderManager: " + params.source;
        }
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
            case 'radio':
            case 'select':
            //case 'optgroup':
                return;
            case 'datalist':
                return 'datalist-definition@templates/fields/basic.html';
        }

        throw "Unknown field type in optionListProviderManager: " + field.type;
    };

    var mustHideLabel = function( field ){
        
        switch( field.type ) {
            case 'radio':
                return true;
            case 'select':
            //case 'optgroup':
            case 'datalist':
                return false;
        }

        throw "Unknown field type in optionListProviderManager: " + field.type;
    };
    
    var getOptionsFromBlank = function( field, options ){
        return optionProvider.getOptionsFromBlank( field, options );
    };

    var getOptionsFromRecord = function( record, field, options ){
        return optionProvider.getOptionsFromRecord( record, field, options );
    };
    
    return {
        id: 'optionListProviderManager',
        addToDictionary: true,
        afterProcessTemplateForField: afterProcessTemplateForField,
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
//OptionListProviderManager.types = [ 'datalist', 'select', 'optgroup', 'radio' ];

module.exports = OptionListProviderManager;