/* 
    validationManager singleton class
*/

import { context } from './context.js';
import { zzDOM } from '../../node_modules/zzdom/index.js';
var $ = zzDOM.zz;
import { utils } from './utils.js';

export const validationManager = (function() {
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

    var initFormValidation = function( $item, page ){

        // Define change event listener
        var instance = this;
        $item.find( selector )
            .on(
                'change',
                function ( event ) {
                    // Get the field instance and check it
                    var field = page.getFieldByName( event.currentTarget.name );
                    instance.showErrorForField(
                        this,
                        field,
                        page
                    );

                    // Check the fields in fieldsToCheckOnChange property
                    if ( field.fieldsToCheckOnChange ){
                        for ( const fieldId of field.fieldsToCheckOnChange ) {
                            field = page.getFieldByName( fieldId );
                            instance.showErrorForField(
                                field.get$Input().el,
                                field,
                                page
                            );
                        }
                    }
                }
        );
    };

    var fieldValidation = function( el, field, page ){

        if ( ! field ){
            return true;
        }

        // Get value
        const value = $( el ).val();

        // Check field validation
        var fieldValidation = field.validate( value );
        if ( utils.isString( fieldValidation ) ){
            // A validation error happened
            return fieldValidation;
        }

        // Check custom field validation
        return customFieldValidation( field, value, page );
    };

    var customFieldValidation = function( field, value, page ){

        const options = page.getOptions();

        // Iterate customValidations
        for ( const customValidation in options.validation.customValidations ) {
            if ( field[ customValidation ] ){
                var customValidationF = options.validation.customValidations[ customValidation ];
                var result = customValidationF(
                    field[ customValidation ],
                    field,
                    value,
                    page
                );

                // If result is a string a validation error happened
                if ( utils.isString( result ) ){
                    return result;
                }
            }
        }

        return true;
    };

    var showErrorForField = function( el, field, page ){

        const options = page.getOptions();
        const validity = el.validity;
  
        // Force element as valid so the next checks work properly
        el.setCustomValidity( '' );

        // Check if the for is valid
        const fieldValidationValue = fieldValidation( el, field, page );
        const isValid = validity.valid && fieldValidationValue == true;
        if ( isValid ) {

            // No validation error
            
            // Remove previous validation error message, if any
            clearValidationMessage( el, '' );

            return;
        }

        // A validation error occured

        if ( options.validation.showBrowserMessageBubbles ){
            // Show validation error message using browser facility

            const message = options.validation.useBrowserMessages?
                true:
                getErrorMessage( el, field, options, validity, fieldValidationValue );
            el.setCustomValidity( message );    // To force input:invalid in HTML
            el.reportValidity();

        } else {
            // Show validation error message using zcrud-validationMessage HTML elements
            
            const message = getErrorMessage( el, field, options, validity, fieldValidationValue );
            el.setCustomValidity( message );    // To force input:invalid in HTML
            showValidationMessage( el, message );
        }
    };

    var clearValidationMessage = function( el ){

        setValidationMessage( el, '' )
            .addClass( 'zcrud-hidden' );
    };
    
    var showValidationMessage = function( el, message ){

        setValidationMessage( el, message )
            .removeClass( 'zcrud-hidden' );
    };

    var setValidationMessage = function( el, message ){

        //const $field = $( el ).parents( '.zcrud-like-field' ).first();
        const $field = $( el ).closest( '.zcrud-like-field' );
        const $valMessageEl = $field.find( '.zcrud-validationMessage' ).first();

        $valMessageEl.text( message );

        return $valMessageEl;
    };

    /*
        Try to translate through the next list, stop when a i18n message is found:
            'validation_' + el.name + '_' + validityName,
            'validation_' + el.name,
            'validation_' + field.type + '_' + validityName,
            'validation_' + field.type,
            'validation_' + validityName
    */
    var getErrorMessage = function( el, field, options, validity, fieldValidationValue ){

        // Use browser validation message if configured
        if ( options.validation.useBrowserMessages ){
            return el.validationMessage;
        }

        // Use custom validation messages instead
        
        // Clone validity
        const validityClone = utils.extend( true, [], validity );
        if ( utils.isString( fieldValidationValue ) ){
            validityClone[ fieldValidationValue ] = true;
        }

        // Iterate validityNames
        for ( const validityName of validityNames ) {
            if ( validityClone[ validityName ] ) {
                return context.translate(
                    [
                        'validation_' + el.name + '_' + validityName,
                        'validation_' + el.name,
                        'validation_' + field.type + '_' + validityName,
                        'validation_' + field.type,
                        'validation_' + validityName
                    ]
                );
            }
        }

        return 'No i18n error message found!';
    };

    var formIsValid = function( eventData, page ){
        
        const options = page.getOptions();

        // Check using formSubmitting event: get eventResult
        var eventResultValue = options.events.formSubmitting( eventData, options );
        var eventResult = eventResultValue === undefined || eventResultValue == true;

        // Check using standard HTML form validation: get standardValidationResult
        var form = eventData.$form.el;
        var standardValidationResult = form? form.checkValidity(): true;

        if ( form ){
            //if ( ! standardValidationResult ){
                showErrorsForForm( eventData.$form, page );
            //}
            
            // Show browser validation message if configured
            if ( options.validation.useBrowserMessages ){
                form.reportValidity();
            }
        }

        // If both results are true the form is valid
        return standardValidationResult && eventResult;
    };

    var showErrorsForForm = function( $item, page ){

        var elements = $item.find( selector ).get();

        for ( const el of elements ) {
            showErrorForField(
                el,
                page.getFieldByName( el.name ),
                page
            );
        }
    };

    return {
        initFormValidation: initFormValidation,
        formIsValid: formIsValid,
        showErrorForField: showErrorForField
    };
})();
