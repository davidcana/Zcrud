/*
    OptionsField class
*/
"use strict";

var Field = require( './field.js' );
var context = require( '../context.js' );
var optionProvider = require( './optionProvider.js' );
var $ = require( 'jquery' );
var zpt = require( 'zpt' );

var OptionsField = function( properties ) {
    Field.call( this, properties );
};

OptionsField.prototype = new Field();
OptionsField.prototype.constructor = OptionsField;

OptionsField.prototype.afterProcessTemplateForFieldInCreateOrUpdate = function( params, $selection ){

    if ( ! this.dependsOn ){
        return;
    }

    var page = this.page;
    var $thisDropdown = $selection.find( "[name='" + this.name + "']");

    // Build dictionary
    //var dictionary = $.extend( {}, params.dictionary );
    var dictionary = $.extend( true, {}, this.page.getDictionary() );
    dictionary.field = this;
    dictionary.type = this.type;
    dictionary.value = params.value;

    // For each dependency
    $.each( this.dependsOn, function ( index, dependsOn ) {
        var dependsOnField = context.getField( page.getOptions().fields, dependsOn );

        // Find the depended combobox
        var $dependsOnDropdown = $selection.find( "[name='" + dependsOnField.name + "']");
        
        // When depended combobox changes
        $dependsOnDropdown.change(
            function (){
                // Refresh options
                params.dependedValues = optionProvider.createDependedValuesUsingForm( 
                    params.field, 
                    page.getOptions(), 
                    $selection, 
                    params ) ;
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

                // Trigger change event to refresh multi cascade dropdowns.
                $thisDropdown.trigger( "change", [ true ] );
            }
        );
    });
};

OptionsField.prototype.afterProcessTemplateForField = function( params, $selection ){
    
    switch( params.source ) {
        case 'create':
        case 'update':
        case 'list':
            this.afterProcessTemplateForFieldInCreateOrUpdate( params, $selection );
            break;
        case 'delete':
            // Nothing to do
            break; 
        default:
            throw "Unknown source in OptionsField: " + params.source;
    }
};

OptionsField.prototype.getValueFromSelectionAndField = function( $selection ){
    
    var $checkboxesContainer = $selection.parents( '.zcrud-checkboxes-container' ).first();
    return $checkboxesContainer.find( "input[type='checkbox']:checked" ).map(
        function() {
            return $( this ).val();
        }
    ).get();
};

OptionsField.prototype.getValueFromForm = function( $selection ){
    
    switch( this.type ) {
        case 'checkboxes':
            return this.getValueFromSelectionAndField( $selection );
        case 'radio':
            var $selectedRadio = $selection.find( "input[type='radio'][name='" + this.name + "[0]']:checked" );
            return $selectedRadio.length > 0? $selectedRadio.val(): undefined;
        case 'select':
            return $selection.find( "select[name='" + this.name + "']").val();
        //case 'optgroup':
        case 'datalist':
            return $selection.find( "input[name='" + this.name + "']").val();
    }

    throw "Unknown field type in optionsField: " + this.type;
};

OptionsField.prototype.setValueToForm = function( value, $this ){
    
    switch( this.type ) {
        case 'checkboxes':  
            var $checkboxesContainer = $this.parents( '.zcrud-checkboxes-container' ).first();
            var $checkboxes = $checkboxesContainer.find( 'input:checkbox.zcrud-active' );
            $checkboxes.prop( 'checked', false ); 
            if ( value ){
                for ( var i = 0; i < value.length; ++i ){
                    $checkboxes.filter( '[value=' + value[ i ] + ']' ).prop( 'checked', true );   
                }
            }
            this.throwEventsForSetValueToForm( $this );
            return;
        case 'radio':
            var $radiosContainer = $this.parents( '.zcrud-radio-container' ).first();
            var $radios = $radiosContainer.find( 'input:radio.zcrud-active' );
            if ( value ){
                $radios.filter( '[value=' + value + ']' ).prop( 'checked', true );   
            } else {
                $radios.prop( 'checked', false ); 
            }
            this.throwEventsForSetValueToForm( $this );
            return;
        case 'select':
        //case 'optgroup':
        case 'datalist':
            $this.val( value );
            $this.trigger( "change", [ true ] );
            this.throwEventsForSetValueToForm( $this );
            return;
    }

    throw "Unknown field type in optionsField: " + this.type;
};

OptionsField.prototype.getValue = function( $this ){
    
    switch( this.type ) {
        case 'checkboxes':
            return this.getValueFromSelectionAndField( $this );
        case 'radio':
        case 'select':
        //case 'optgroup':
        case 'datalist':
            return $this.val();
    }

    throw "Unknown field type in optionsField: " + this.type;
};

OptionsField.prototype.getValueFromRecord = function( record, params ){
    
    switch( params.source ) {
        case 'create':
        case 'update':
            return record[ this.id ];
        case 'delete':
        case 'list':
            var optionsList = this.getOptionsFromRecord( record, this.page.getOptions() );
            var tempValue = record[ this.id ];
            try {
                var map = this.getDisplayTextMapFromArrayOptions( optionsList );
                if ( this.type == 'checkboxes' ){
                    return this.getMultipleValueFromRecord( map, tempValue );
                }
                var inMapValue = map[ tempValue ];
                return inMapValue? inMapValue: tempValue;
            } catch ( e ){
                return tempValue;
            }
        default:
            throw "Unknown source in OptionsField: " + params.source;
    }
};

OptionsField.prototype.getMultipleValueFromRecord = function( optionsMap, value ){
    
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

OptionsField.prototype.getDisplayTextMapFromArrayOptions = function( optionsArray ){

    var map = {};

    for ( var i = 0; i < optionsArray.length; i++ ) {
        var option = optionsArray[ i ];
        map[ option.value ] = this.translateOptions? context.translate( option.displayText ): option.displayText;
    }

    return map;
};

OptionsField.prototype.getTemplate = function(){
    return this.type + '@templates/fields/basic.html'
};

OptionsField.prototype.getPostTemplate = function(){
    
    switch( this.type ) {
        case 'checkboxes':
        case 'radio':
        case 'select':
        //case 'optgroup':
            return;
        case 'datalist':
            return 'datalist-definition@templates/fields/basic.html';
    }

    throw "Unknown field type in optionsField: " + this.type;
};

OptionsField.prototype.mustHideLabel = function(){
    
    switch( this.type ) {
        case 'checkboxes':
        case 'radio':
            return true;
        case 'select':
            //case 'optgroup':
        case 'datalist':
            return false;
    }

    throw "Unknown field type in optionsField: " + this.type;
};

OptionsField.prototype.getOptionsFromBlank = function( options ){
    return optionProvider.getOptionsFromBlank( this, options );
};

OptionsField.prototype.getOptionsFromRecord = function( record, options ){
    return optionProvider.getOptionsFromRecord( record, this, options );
};

module.exports = OptionsField;