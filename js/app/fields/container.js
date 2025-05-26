/* 
    Container class
*/
'use strict';

var buttonUtils = require( '../buttons/buttonUtils.js' );
var utils = require( '../utils.js' );

var Container = function( properties ) {
    utils.extend( this, properties );
    //utils.extend( true, this, properties );
};

Container.prototype.getToolbarButtons = function(){

    if ( this.toolbarButtons == undefined && this.buttons ){
        
        // Build list of buttons
        this.toolbarButtons = buttonUtils.getButtonList( 
            this.buttons, 
            'containerToolbar', 
            this,
            this.options
        );
        
        // Set the container of all buttons
        for ( var i = 0; i < this.toolbarButtons.length; ++i ){
            this.toolbarButtons[ i ].setContainer( this );
        }
    }

    return this.toolbarButtons;
};

module.exports = Container;
