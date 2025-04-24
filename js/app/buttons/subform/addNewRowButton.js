/*
    AddNewRowButton class
*/
'use strict';

var Button = require( '../button.js' );

var AddNewRowButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( AddNewRowButton );

AddNewRowButton.prototype.type = 'subform_addNewRow';

AddNewRowButton.prototype.cssClass = 'zcrud-new-row-command-button';

//AddNewRowButton.prototype.selector = '.' + AddNewRowButton.prototype.cssClass;

AddNewRowButton.prototype.bindableIn = {
    subformToolbar: true
};
AddNewRowButton.prototype.notUseInPages = [ 'delete' ];

AddNewRowButton.prototype.getTextsBundle = function(){

    return {
        title: {
            translate: true,
            text: 'Add new record'
        },
        content: {
            translate: false,
            text: '+'
        }
    };
};

AddNewRowButton.prototype.run = function( event, subformInstance, params ){
    
    event.preventDefault();
    event.stopPropagation();
    
    if ( ! this.checkComponents() ){
        return;
    }
    
    subformInstance.addNewRow( params );
};

module.exports = AddNewRowButton;
