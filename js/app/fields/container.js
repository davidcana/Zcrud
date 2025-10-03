/* 
    Container class
*/

import { buttonUtils } from '../buttons/buttonUtils.js';
import { utils } from '../utils.js';

export const Container = function( properties ) {
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

