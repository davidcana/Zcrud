/*
    CopySubformRowsButton class
*/
'use strict';

var context = require( '../../context.js' );
var Button = require( '../button.js' );

var CopySubformRowsButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( CopySubformRowsButton );

CopySubformRowsButton.prototype.type = 'form_copySubformRows';

CopySubformRowsButton.prototype.cssClass = 'zcrud-copy-subform-rows-command-button';

//CopySubformRowsButton.prototype.selector = 'button.' + CopySubformRowsButton.prototype.cssClass;

CopySubformRowsButton.prototype.bindableIn = {
    formToolbar: true
};

CopySubformRowsButton.prototype.getTextsBundle = function(){

    return {
        title: undefined,
        content: {
            translate: true,
            text: this.title || 'Copy rows'
        }
    };
};

CopySubformRowsButton.prototype.run = function( event, formPage, $form, eventThis ){
    
    event.preventDefault();
    event.stopPropagation();

    if ( ! this.checkComponents() ){
        return;
    }
    
    // Get the selectedRecords
    var targetField = formPage.getField( this.target );
    var selectedRecords = targetField.addNewRowsFromSubform( 
        this.source, 
        this.onlySelected, 
        this.removeFromSource,
        this.deselect
    );
    if ( selectedRecords.length == 0 ){
        context.showError(
            formPage.getOptions(),
            false,
            'selectAtLeastOneItem', // Please, select at least one item!
            true
        );
    }
};

module.exports = CopySubformRowsButton;
