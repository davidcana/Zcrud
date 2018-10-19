/*
    FilterButton class
*/
"use strict";

var Button = require( '../button.js' );

var FilterButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( FilterButton );

FilterButton.prototype.type = 'form_filter';

FilterButton.prototype.cssClass = 'zcrud-form-submit-filter-command-button';

FilterButton.prototype.bindableIn = {
    containerToolbar: true
};

FilterButton.prototype.getTextsBundle = function(){

    return {
        title: undefined,
        content: {
            translate: true,
            text: 'Filter'
        }
    };
};

FilterButton.prototype.run = function( event, formPage, $form ){
    
    event.preventDefault();
    event.stopPropagation();
    
    formPage.getSubmitFunction()( event, $form );
};

module.exports = FilterButton;
