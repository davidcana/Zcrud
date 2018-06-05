/* 
    Class ComponentsMap 
*/
var context = require( '../context.js' );
var $ = require( 'jquery' );

var ComponentsMap = function ( optionsToApply, thisOptionsToApply, pageToApply ) {
    "use strict";
    
    var options = optionsToApply;
    var thisOptions = thisOptionsToApply;
    var page = pageToApply;
    var components = {};
    
    // Initial configuration
    var configure = function(){
        registerAllComponents();
    };
    
    var registerAllComponents = function() {
        
        for ( var componentId in thisOptions ){
            var component = thisOptions[ componentId ];
            var ConstructorClass = component.constructorClass;
            registerComponent( 
                componentId,
                component, 
                function(){
                    return new ConstructorClass( options, component, page );
                }
            );
        }
    }

    var registerComponent = function( componentId, component, constructorFunction ){
        
        var thisComponent = component.isOn? constructorFunction(): undefined;
        if ( thisComponent ){
            components[ componentId ] = thisComponent;
        }
    };
    
    var getComponent = function( id ){
        return components[ id ];
    };
    
    var getSecureComponent = function( id ){
        
        var component = getComponent( id );
        if ( component ){
            return component;
        }
        
        throw 'Error in componentsMap trying to get component: ' + id;
    };

    // Reset all components
    var resetPage = function(){

        for ( var id in components ){
            var component = components[ id ];
            if ( component && $.isFunction( component.resetPage ) ){
                component.resetPage();
            }
        }
    };
    
    var buildDataToSend = function( data ){

        for ( var id in components ){
            var component = components[ id ];
            if ( component && $.isFunction( component.addToDataToSend ) ){
                component.addToDataToSend( data );
            }
        }

        return data;
    };

    var dataFromServer = function( data ){

        for ( var id in components ){
            var component = components[ id ];
            if ( component && $.isFunction( component.dataFromServer ) ){
                component.dataFromServer( data );
            }
        }
    };
    
    var beforeProcessTemplate = function(){

        for ( var id in components ){
            var component = components[ id ];
            if ( component && $.isFunction( component.beforeProcessTemplate ) ){
                component.beforeProcessTemplate();
            }
        }
    };
    
    var bindEvents = function() {

        for ( var id in components ){
            var component = components[ id ];
            component.bindEvents();
        }
    };
    
    var self = {
        getComponent: getComponent,
        getSecureComponent: getSecureComponent,
        resetPage: resetPage,
        buildDataToSend: buildDataToSend,
        dataFromServer: dataFromServer,
        beforeProcessTemplate: beforeProcessTemplate,
        bindEvents: bindEvents
    };
    
    configure();
    
    return self;
};

module.exports = ComponentsMap;
