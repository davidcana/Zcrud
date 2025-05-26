/*
    OptionsField class
*/
'use strict';

var Field = require( './field.js' );
var context = require( '../context.js' );
var optionProvider = require( './optionProvider.js' );
//var zzDOM = require( '../../../lib/zzDOM-closures-full.js' );
var zzDOM = require( 'zzdom' );
var $ = zzDOM.zz;
var zpt = require( 'zpt' );
var utils  = require( '../utils.js' );

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
    var $thisDropdown = $selection.find( '[name="' + this.name + '"]' );

    // Build dictionary
    var dictionary = {};
    dictionary.field = this;
    dictionary.type = this.type;
    dictionary.value = params.value;

    // For each dependency
    for ( var index in this.dependsOn ){
        var dependsOn = this.dependsOn[ index ];
        var dependsOnField = context.getField( page.getOptions().fields, dependsOn );

        // Find the depended combobox
        var $dependsOnDropdown = $selection.find( '[name="' + dependsOnField.name + '"]' );
        
        // When depended combobox changes
        $dependsOnDropdown.on(
            'change',
            function (){
                // Refresh options
                params.dependedValues = optionProvider.createDependedValuesUsingForm( 
                    params.field, 
                    page.getOptions(), 
                    $selection, 
                    params 
                );

                optionProvider.buildOptions(
                    params,
                    function( optionsList ){
                        // optionsList does not contain any values, exit
                        if ( ! optionsList ){
                            return;
                        }

                        // optionsList contains values, continue
                        dictionary.optionsListFromForm = optionsList;
                        dictionary.record = params.record;
                        dictionary.value = params.record[ params.field.id ];
                        dictionary.field = params.field;
                        dictionary.type = params.field.type;
                        dictionary.value = params.value;
        
                        // Refresh template
                        zpt.run({
                            root: $thisDropdown[ 0 ],
                            dictionaryExtension: dictionary
                        });
        
                        // Trigger change event to refresh multi cascade dropdowns.
                        $thisDropdown.trigger(
                            'change',
                            //[ true ]
                            {
                                'disableHistory': true
                            }
                        );
                    }
                )
            }
        );
    }
};

OptionsField.prototype.afterProcessTemplateForField = function( params, $selection ){
    
    if ( this.page.isReadOnly() ){
        return;
    }
    
    this.afterProcessTemplateForFieldInCreateOrUpdate( params, $selection );
};

OptionsField.prototype.getValueFromSelectionAndField = function( $selection ){
    
    var $checkboxesContainer = $selection.parents( '.zcrud-checkboxes-container' ).first();
    return $checkboxesContainer.find( 'input[type="checkbox"]:checked' ).map(
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
            var $selectedRadio = $selection.find( 'input[type="radio"][name="' + this.name + '[0]"]:checked' );
            return $selectedRadio.length > 0? $selectedRadio.val(): undefined;
        case 'select':
            return $selection.find( 'select[name="' + this.name + '"]' ).val();
        case 'datalist':
            return $selection.find( 'input[name="' + this.name + '"]' ).val();
    }

    throw 'Unknown field type in optionsField: ' + this.type;
};

OptionsField.prototype.setValueToForm = function( value, $this ){
    
    switch( this.type ) {
        case 'checkboxes':  
            var $checkboxesContainer = $this.parents( '.zcrud-checkboxes-container' ).first();
            var $checkboxes = $checkboxesContainer.find( 'input[type="checkbox"].zcrud-active' );
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
            var $radios = $radiosContainer.find( 'input[type="radio"].zcrud-active' );
            if ( value ){
                $radios.filter( '[value="' + value + '"]' ).prop( 'checked', true );
            } else {
                $radios.prop( 'checked', false ); 
            }
            this.throwEventsForSetValueToForm( $this );
            return;
        case 'select':
        case 'datalist':
            $this.val( value );
            $this.trigger(
                'change',
                {
                    'disableHistory': true
                }
            );
            this.throwEventsForSetValueToForm( $this );
            return;
    }

    throw 'Unknown field type in optionsField: ' + this.type;
};

OptionsField.prototype.getValue = function( $this ){
    
    switch( this.type ) {
        case 'checkboxes':
            return this.getValueFromSelectionAndField( $this );
        case 'radio':
        case 'select':
        case 'datalist':
            return $this.val();
    }

    throw 'Unknown field type in optionsField: ' + this.type;
};

OptionsField.prototype.getViewValueFromRecord = function( record ){

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
            return;
        case 'datalist':
            return 'datalist-definition@templates/fields/basic.html';
    }

    throw 'Unknown field type in optionsField: ' + this.type;
};

OptionsField.prototype.mustHideLabel = function(){
    
    switch( this.type ) {
        case 'checkboxes':
        case 'radio':
            return true;
        case 'select':
        case 'datalist':
            return false;
    }

    throw 'Unknown field type in optionsField: ' + this.type;
};

OptionsField.prototype.getOptionsFromBlank = function( options ){
    return optionProvider.getOptionsFromBlank( this, options );
};

OptionsField.prototype.getOptionsFromRecord = function( record, options ){
    return optionProvider.getOptionsFromRecord( record, this, options );
};

OptionsField.prototype.getAsync = function( record, callback ){
    optionProvider.asyncGetOptions( record, this, this.page.getOptions(), callback );
};

OptionsField.prototype.builNonDependentAsyncFieldList = function(){
    var optionsSource = this.options;
    return ( typeof optionsSource == 'string' || utils.isFunction( optionsSource ) && ! this.dependsOn )?
        [ this ]:
        [];
};

OptionsField.prototype.buildDependentAsyncFieldList = function( record ){
    var optionsSource = this.options;
    return ( typeof optionsSource == 'string' || utils.isFunction( optionsSource ) && this.dependsOn )?
        [
            {
                record: this.dependsOn? record: {},
                field: this
            }
        ]:
        [];
};

module.exports = OptionsField;
