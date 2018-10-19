/* 
    Container class
*/
"use strict";

var $ = require( 'jquery' );
var buttonUtils = require( '../buttons/buttonUtils.js' );

var Container = function( properties ) {
    $.extend( true, this, properties );
};

Container.prototype.getToolbarButtons = function(){

    if ( this.toolbarButtons == undefined && this.buttons ){
        this.toolbarButtons = buttonUtils.getButtonList( 
            this.buttons, 
            'containerToolbar', 
            this,
            this.options );
    }

    return this.toolbarButtons;
};

module.exports = Container;
