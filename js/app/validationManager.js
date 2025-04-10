/* 
    validationsManager singleton class
*/
module.exports = (function() {
    "use strict";
    
    //var $ = require( 'jquery' );
    //require( 'jquery-form-validator' );
    var context = require( './context.js' );
    var utils = require( './utils.js' );
    var zzDOM = require( '../../lib/zzDOM-closures-full.js' );
    var $ = zzDOM.zz;
    /*
    required:
        Specifies whether a form field needs to be filled in before the form can be submitted.
    minlength and maxlength:
        Specifies the minimum and maximum length of textual data (strings).
    min, max, and step:
        Specifies the minimum and maximum values of numerical input types, and the increment, or step, for values, starting from the minimum.
    type:
        Specifies whether the data needs to be a number, an email address, or some other specific preset type.
    pattern:
        Specifies a regular expression that defines a pattern the entered data needs to follow.
    */
    
    //var errorClass = 'error';
    //var initialized = false;
    //var force = ".historyField";

    var validityNames = [
        'badInput',
        'patternMismatch',
        'rangeOverflow',
        'rangeUnderflow',
        'stepMismatch',
        'tooLong',
        'tooShort',
        'typeMismatch',
        'valueMissing'
    ];
    
    const selector = 'input.historyField, textarea.historyField, select.historyField';

    /*
    var validationOn = function( options ){
        return options.validation && options.validation.rules;
    };
    */
    /*
    var initFormValidation = function( id, $forms, options ){
        
        // Return if there is nothing to do
        if ( ! validationOn( options ) ){
            return;
        }
        
        // Load the modules used in the form
        if ( options.validation.modules && ! initialized ){
            $.formUtils.loadModules( options.validation.modules );
            initialized = true;
        }

        // Add validation attributes
        addAttributes( $forms, options );
        
        // Set up form validation
        var defaultConfigurationOptions = {
            form: '#' + id,
            language: context.getFormValidationLanguage(),
            decimalSeparator: context.translate( 'decimalSeparator' )
        };
        var configurationOptionsToApply = utils.extend( {}, defaultConfigurationOptions, options.validation.configuration );
        $.validate( configurationOptionsToApply );
    };
    */
    /*
    var addAttributes = function( $forms, options ){
        
        var fieldValidationOptions = buildFieldOptions();
        var validate = utils.extend( true, {}, options.validation.rules, fieldValidationOptions );
        addGeneralAttributes( $forms, options, validate );
    };
    
    var addGeneralAttributes = function( $forms, options, validate ){

        $.each( validate || {}, function( elemRef, attr ) {
            var $1elem = undefined;
            var $elems = undefined;
            if ( elemRef[ 0 ] === '#' ) {
                $1elem = $( elemRef + force );
            } else if ( elemRef[ 0 ] === '.' ) {
                $elems = $forms.find( elemRef + force );
            } else {
                $elems = $forms.find( "[name='" + elemRef + "']" + force );
            }
            
            if ( $1elem ){
                addAttribute( $1elem, attr );
            } else {
                $elems.each( function() {
                    addAttribute( $( this ), attr );
                });
            }
        });
    };
    
    var addAttribute = function( $elem, attr ){
        
        $elem.attr( 'data-validation', attr.validation );
        
        $.each( attr, function( name, val ) {
            if ( name !== 'validation' && val !== false ) {
                if ( val === true ) {
                    val = 'true';
                }
                if ( name[ 0 ] === '_' ) {
                    name = name.substring( 1 );
                    if( val === false ) {
                        $elem.removeAttr( name );
                    } else {
                        $elem.attr( name, val );
                    }
                } else {
                    $elem.valAttr( name, val );
                }
            }
        });

    };
    
    var formIsValid = function( options, eventData ){
        
        var eventResult = options.events.formSubmitting( eventData, options );
        var eventResultIsValid = eventResult === undefined || eventResult == true;
        
        if ( ! validationOn( options ) ){
            return eventResultIsValid;
        }
        
        var isValid = $( '.' + errorClass ).length === 0 && eventResultIsValid;
        
        // Return result
        if ( isValid ){
            return true;
        }
        return utils.isPlainObject( eventResult )? eventResult: false;
    };
    
    var buildFieldOptions = function( options ){
        return {};
    };
    */

    var initFormValidation = function( formId, $item, options ){

        // Define change event listener
        var instance = this;
        $item.find( selector )
            .on(
                'change',
                function ( event ) {
                    /*
                    var disableHistory = utils.getParam( event.params, 'disableHistory' );
                    if ( disableHistory ){
                        return;
                    }
                    */
                    //var $this = $( this );
                    instance.showErrorForField( this, options, true );
                }
        );
    };

    var showErrorForField = function( el, options, reportValidity ){

        const validity = el.validity;

        // Check if the for is valid
        if ( validity.valid ) {

            // No validation error
            
            // Remove previous validation error message, if any
            setValidationMessage( el, '' );
            return;
        }

        // A validation error occured

        // Get error message
        const message = getErrorMessage( el, options, validity );
        //alert( message );

        // Set validation error message
        setValidationMessage( el, message );

        // Show validation error message using browser facility
        if ( reportValidity ){
            el.reportValidity();
        }
    };

    var setValidationMessage = function( el, message ){

        const $label = $( el ).parents( 'label' ).first();
        const $valMessageEl = $label.find( '.zcrud-validationMessage' ).first();

        $valMessageEl.text( message );
    };

    /*
        Try to translate through the next list, stop when a i18n message is found:
            'validation_' + options.entityId + '_' + el.name + '_' + id,
            'validation_' + options.entityId + '_' + el.name,
            'validation_' + options.entityId + '_' + id
            'validation_' + options.entityId
            'validation_' + id
    */
    var getErrorMessage = function( el, options, validity ){

        for ( const id of validityNames ) {
            if ( validity[ id ] ) {
                return context.translateAlternatives(
                    [
                        'validation_' + options.entityId + '_' + el.name + '_' + id,
                        'validation_' + options.entityId + '_' + el.name,
                        'validation_' + options.entityId + '_' + id,
                        'validation_' + options.entityId,
                        'validation_' + id
                    ]
                );
            }
        }

        return 'Unknown error found in form!';
    };

    var formIsValid = function( options, eventData ){

        var form = eventData.$form.el;
        var result = form.checkValidity();

        if ( ! result ){
            showErrorsForForm( eventData.$form, options );
        }
        
        var report = form.reportValidity();
        
        return result;
    };

    var showErrorsForForm = function( $item, options ){

        var elements = $item.find( selector ).get();

        for ( const el of elements ) {
            showErrorForField( el, options );
        }
    };

    return {
        initFormValidation: initFormValidation,
        formIsValid: formIsValid,
        showErrorForField: showErrorForField
    };
})();
