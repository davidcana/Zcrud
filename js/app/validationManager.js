/* 
    validationsManager singleton class
*/
module.exports = (function() {
    "use strict";
    
    var $ = require( 'jquery' );
    require( 'jquery-form-validator' );
    
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
            borderColorOnError : ''
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
            return true;
        }
        
        return $( '#' + options.currentForm.id ).isValid( {}, {}, true )
            && false != options.events.formSubmitting( options, dataToSend );
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
