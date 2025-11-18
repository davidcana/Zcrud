/* 
    TemplatingComponent class
*/

import { Component } from './component.js';
import { utils } from '../utils.js';

export const TemplatingComponent = function( optionsToApply, thisOptionsToApply, parentToApply ) {
    Component.call( this, optionsToApply, thisOptionsToApply, parentToApply );
};
Component.doSuperClassOf( TemplatingComponent );

TemplatingComponent.prototype.bindEvents = function(){

    const mapping = this.thisOptions.mapping;
    for ( const itemId in mapping ){
        const itemFunction = mapping[ itemId ];
        if ( utils.isFunction( itemFunction ) ){
            itemFunction();
        }
    }
};

