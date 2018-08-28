/*
    CopySubformRowsButton class
*/
"use strict";

var $ = require( 'jquery' );
var context = require( '../../context.js' );
var Button = require( '../button.js' );

var CopySubformRowsButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( CopySubformRowsButton );

CopySubformRowsButton.prototype.id = 'form_copySubformRowsButton';

CopySubformRowsButton.prototype.selector = 'button.zcrud-copy-subform-rows-command-button';

CopySubformRowsButton.prototype.bindableIn = {
    formToolbar: true
};

CopySubformRowsButton.prototype.getTextsBundle = function(){

    return {
        title: {
            translate: false,
            text: ''
        },
        content: {
            translate: true,
            text: this.title || 'zcrud-copy-' + this.source + '-button'
        }
    };
};

CopySubformRowsButton.prototype.run = function( event, formPage, $form, eventThis ){
    
    event.preventDefault();
    event.stopPropagation();
    
    // Get thisButtonOptions from data-tButtonId attr and toolbar
    var $this = $( eventThis );
    var thisButtonId = $this.attr( 'data-tButtonId' );
    var thisButtonOptions = formPage.getThisOptions().buttons.toolbar.copySubformRowsItems[ thisButtonId ]; // TODO get thisButtonOptions from button instance

    // Get conf options from thisButtonOptions
    var targetId = thisButtonOptions.target;
    var sourceId = thisButtonOptions.source;
    var onlySelected = thisButtonOptions.onlySelected;
    var removeFromSource = thisButtonOptions.removeFromSource;
    var deselect = thisButtonOptions.deselect;

    // Get the selectedRecords
    var targetField = formPage.getField( targetId );
    var selectedRecords = targetField.addNewRowsFromSubform( 
        sourceId, 
        onlySelected, 
        removeFromSource,
        deselect );
    if ( selectedRecords.length == 0 ){
        context.showError( 
            formPage.getOptions(), 
            false, 
            'Please, select at least one item!' );
    }
    /*
    if ( autoSaveMode ){
        save( event );
    }
    */
};

module.exports = CopySubformRowsButton;
