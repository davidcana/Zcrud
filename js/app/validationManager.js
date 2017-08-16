/* 
    validationsManager singleton class
*/
module.exports = (function() {
    "use strict";
    
    var $ = require( 'jquery' );
    require( 'jquery-form-validator' );
    var context = require( './context.js' );
    var errorClass = 'error';
    var myLanguage = {
        errorTitle: 'Form submission failed!',
        requiredFields: 'You have not answered all required fields',
        badTime: 'You have not given a correct time',
        badEmail: 'You have not given a correct e-mail address',
        badTelephone: 'You have not given a correct phone number',
        badSecurityAnswer: 'You have not given a correct answer to the security question',
        badDate: 'You have not given a correct date',
        lengthBadStart: 'The input value must be between ',
        lengthBadEnd: ' characters',
        lengthTooLongStart: 'The input value is longer than ',
        lengthTooShortStart: 'The input value is shorter than ',
        notConfirmed: 'Input values could not be confirmed',
        badDomain: 'Incorrect domain value',
        badUrl: 'The input value is not a correct URL',
        badCustomVal: 'The input value is incorrect',
        andSpaces: ' and spaces ',
        badInt: 'The input value was not a correct number!!!!!!!!!!',
        badSecurityNumber: 'Your social security number was incorrect',
        badUKVatAnswer: 'Incorrect UK VAT Number',
        badStrength: 'The password isn\'t strong enough',
        badNumberOfSelectedOptionsStart: 'You have to choose at least ',
        badNumberOfSelectedOptionsEnd: ' answers',
        badAlphaNumeric: 'The input value can only contain alphanumeric characters ',
        badAlphaNumericExtra: ' and ',
        wrongFileSize: 'The file you are trying to upload is too large (max %s)',
        wrongFileType: 'Only files of type %s is allowed',
        groupCheckedRangeStart: 'Please choose between ',
        groupCheckedTooFewStart: 'Please choose at least ',
        groupCheckedTooManyStart: 'Please choose a maximum of ',
        groupCheckedEnd: ' item(s)',
        badCreditCard: 'The credit card number is not correct',
        badCVV: 'The CVV number was not correct',
        wrongFileDim : 'Incorrect image dimensions,',
        imageTooTall : 'the image can not be taller than',
        imageTooWide : 'the image can not be wider than',
        imageTooSmall : 'the image was too small',
        min : 'min',
        max : 'max',
        imageRatioNotAccepted : 'Image ratio is not accepted'
    };
    
    var validationOn = function( options ){
        return options.validation && options.validation.rules;
    };
    
    var initFormValidation = function( options ){

        // Return if there is nothing to do
        if ( ! validationOn( options ) ){
            return;
        }
        
        // Load the modules used in the form
        if ( options.validation.modules ){
            $.formUtils.loadModules( options.validation.modules );
        }
        
        // Add validation attributes
        addAttributes( options );
        
        // Set up form validation
        $.validate({
            form : '#' + options.currentForm.id,
            borderColorOnError : '',
            //lang : options.i18n.language,
            language: myLanguage,
            decimalSeparator : context.translate( 'decimalSeparator' )
        });
    };
    
    var addAttributes = function( options ){
        
        var fieldValidationOptions = buildFieldOptions();
        var validate = $.extend( true, {}, options.validation.rules, fieldValidationOptions );
        addGeneralAttributes( options, validate );
    };
    
    var addGeneralAttributes = function( options, validate ){
        
        var $forms = options.currentForm.$form;
        $.each( validate || {}, function( elemRef, attr ) {
            var $elem;
            if ( elemRef[ 0 ] === '#' ) {
              $elem = $( elemRef );
            } else if ( elemRef[ 0 ] === '.' ) {
              $elem = $forms.find( elemRef );
            } else {
              $elem = $forms.find( '*[name="' + elemRef + '"]' );
            }

            $elem.attr( 'data-validation', attr.validation );

            $.each( attr, function( name, val ) {
              if ( name !== 'validation' && val !== false ) {
                if (  val === true ) {
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
        });
    };
    
    var formIsValid = function( options, dataToSend ){
        
        if ( ! validationOn( options ) ){
            return false != options.events.formSubmitting( options, dataToSend );
        }
        
        return ! errorsExist() && false != options.events.formSubmitting( options, dataToSend );
        /*
        return $( '#' + options.currentForm.id ).isValid( {}, {}, true )
            && false != options.events.formSubmitting( options, dataToSend );*/
    };
    
    var errorsExist = function(){
        return $( '.' + errorClass ).length > 0;
    };
    
    var buildFieldOptions = function( options ){
        return {};
    };
    /*
    var initFormValidation = function(){
        
        var config = {
            form : '#zcrud-form',
            borderColorOnError : '',
            validate: options.validate || {}
        };
        $.validate({
            modules : 'jsconf, security',
            onModulesLoaded : function() {
            $.setupValidation( config );
           }
        });
        
        
        // Manually load the modules used in this form
        $.formUtils.loadModules( 
            'jsconf, security, date',
            undefined,
            function(){
                // Set up form validation
                var config = {
                    form : '#zcrud-form',
                    borderColorOnError : '',
                    validate: options.validate || {}
                };
                $.setupValidation( config );
                $.validate( config );
            }
        );
    };*/
    /*
    var runIfFormIsValid = function( dataToSend, callback ){
        
        // Manually load the modules used in this form
        $.formUtils.loadModules( 'security, date' );
        
        $.validate({
            form : '#zcrud-form',
            onSuccess : function( $form ) {
                    if ( false != options.events.formSubmitting( options, dataToSend ) ){
                        callback();
                    }
                }
        });
        
        return $( '#zcrud-form' ).isValid(
            { }, 
            {
                onSuccess : function( $form ) {
                    if ( false != options.events.formSubmitting( options, dataToSend ) ){
                        callback();
                    }
                }
            }, 
            true );
    };*/
    return {
        initFormValidation: initFormValidation,
        formIsValid: formIsValid
    };
})();
