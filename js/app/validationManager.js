/* 
    validationsManager singleton class
*/
module.exports = (function() {
    "use strict";
    
    var context = require( './context.js' );
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

    var initFormValidation = function( formId, $item, options ){

        // Define change event listener
        var instance = this;
        $item.find( selector )
            .on(
                'change',
                function ( event ) {
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

        //const $label = $( el ).parents( 'label' ).first();
        const $field = $( el ).parents( '.zcrud-like-field' ).first();
        const $valMessageEl = $field.find( '.zcrud-validationMessage' ).first();

        $valMessageEl.text( message );
    };

    /*
        Try to translate through the next list, stop when a i18n message is found:
            'validation_' + el.name + '_' + validityName,
            'validation_' + el.name,
            'validation_' + validityName
    */
    var getErrorMessage = function( el, options, validity ){

        // Use browser validation message if configured
        if ( options.validation.useBrowserMessages ){
            return el.validationMessage;
        }

        // Use custom validation messages instead
        for ( const validityName of validityNames ) {
            if ( validity[ validityName ] ) {
                return context.translateAlternatives(
                    [
                        'validation_' + el.name + '_' + validityName,
                        'validation_' + el.name,
                        'validation_' + validityName
                    ]
                );
            }
        }

        return 'No i18n error message found!';
    };

    var formIsValid = function( options, eventData ){
        
        // Check using formSubmitting event: get eventResult
        var eventResultValue = options.events.formSubmitting( eventData, options );
        var eventResult = eventResultValue === undefined || eventResultValue == true;

        // Check using standard HTML form validation: get standardValidationResult
        var form = eventData.$form.el;
        var standardValidationResult = form? form.checkValidity(): true;

        if ( form ){
            if ( ! standardValidationResult ){
                showErrorsForForm( eventData.$form, options );
            }
            
            var report = form.reportValidity();
        }

        // If both results are true the form is valid
        return standardValidationResult && eventResult;
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
