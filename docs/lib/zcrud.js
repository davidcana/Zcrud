(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(_dereq_,module,exports){
/* 
    Button class
    
    run: a function with the code to run
*/
'use strict';

var pageUtils = _dereq_( '../pages/pageUtils.js' );
var context = _dereq_( '../context.js' );
var utils = _dereq_( '../utils.js' );

var Button = function( properties, parentToSet ) {
    
    if ( properties ){
        utils.extend( true, this, properties );
    }
    this.parent = parentToSet;
    this.id = 'button-' + pageUtils.generateId();
};

Button.prototype.type = '"type" not set in button!';

Button.prototype.cssClass = undefined;
Button.prototype.getCssClass = function(){
    return this.cssClass? this.cssClass: this.type;
};

Button.prototype.selector = undefined;
Button.prototype.getSelector = function(){
    return 'button.' + this.id;
};

Button.prototype.bindableIn = {};
Button.prototype.notUseInPages = [];

Button.prototype.disabled = false;

Button.prototype.textsBundle = undefined;
Button.prototype.getTextsBundle = function(){
    
    if ( this.textsBundle ){
        return this.textsBundle;
    }
    
    throw '"textsBundle" property not set in ' + this + '!';
};

Button.doSuperClassOf = function( ChildButtonClass ){
    
    ChildButtonClass.prototype = new Button();
    ChildButtonClass.prototype.constructor = ChildButtonClass;
};

Button.prototype.isBindable = function( type ){
    return !! this.bindableIn[ type ];
};

Button.prototype.toString = function(){
    return this.type + ' button (' + this.id + ')';
};

Button.prototype.checkComponents = function(){
    
    var page = this.parent.getPage();
    var validationData = page.componentsMap.validate();
    if ( validationData === true ){
        return true;
    }
    
    context.showError( 
        page.getOptions(), 
        false, 
        validationData.message, 
        validationData.translate 
    );
    
    return false;
};

module.exports = Button;

},{"../context.js":27,"../pages/pageUtils.js":54,"../utils.js":57}],2:[function(_dereq_,module,exports){
/*
    buttonUtils singleton class
*/
'use strict';

var utils = _dereq_( '../utils.js' );

var ButtonUtils = function() {
    
    var getButtonList = function( source, type, parent, options ){
        
        if ( ! source ){
            throw 'Undefined source in getButtonList method with type "' + type + '"!'
        }
        
        var result = [];
        
        for ( var c = 0; c < source.length; ++c ){
            var sourceItem = source[ c ];
            var button = getButton( sourceItem, type, parent, options );
            
            // Exclude the button if the type of the parent is included in the notUseInPages list of the buttton
            if ( -1 == button.notUseInPages.indexOf( parent.getType() ) ){
                result.push( button );
            }
        }
        
        return result;
    };
    
    var getButton = function( sourceItem, type, parent, options ){
        
        var button = undefined;
        
        if ( utils.isPlainObject( sourceItem ) ){
            button = buildButton( 
                sourceItem.type || 'generic', 
                sourceItem, 
                parent, 
                options );
        } else {
            button = buildButton( sourceItem, {}, parent, options );
        }
        
        if ( ! button.isBindable( type ) ){
            throw 'Button "' + button + '" not bindable to type "' + type + '"!';
        }
        
        return button;
    };
    
    var buildButton = function( buttonType, properties, parent, options ){
        
        var constructor = options.buttons[ buttonType ];
        if ( ! constructor ){
            throw 'Unknown button type to build: ' + buttonType;
        }
        return new constructor( properties, parent );
    };
    
    return {
        getButtonList: getButtonList
    };
}();

module.exports = ButtonUtils;
},{"../utils.js":57}],3:[function(_dereq_,module,exports){
/*
    CancelButton class
*/
'use strict';

var Button = _dereq_( '../button.js' );

var CancelButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};

Button.doSuperClassOf( CancelButton );

CancelButton.prototype.type = 'form_cancel';

CancelButton.prototype.cssClass = 'zcrud-form-cancel-command-button';

//CancelButton.prototype.selector = '.' + CancelButton.prototype.cssClass;

CancelButton.prototype.bindableIn = {
    formToolbar: true
};

CancelButton.prototype.getTextsBundle = function(){

    return {
        title: undefined,
        content: {
            translate: true,
            text: 'Cancel'
        }
    };
};

CancelButton.prototype.run = function( event, formPage, $form ){
    
    event.preventDefault();
    event.stopPropagation();
    
    formPage.cancelForm( event, $form );
};

module.exports = CancelButton;

},{"../button.js":1}],4:[function(_dereq_,module,exports){
/*
    CopySubformRowsButton class
*/
'use strict';

var context = _dereq_( '../../context.js' );
var Button = _dereq_( '../button.js' );

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
        this.deselect );
    if ( selectedRecords.length == 0 ){
        context.showError( 
            formPage.getOptions(), 
            false, 
            'Please, select at least one item!' );
    }
};

module.exports = CopySubformRowsButton;

},{"../../context.js":27,"../button.js":1}],5:[function(_dereq_,module,exports){
/*
    SubmitButton class
*/
'use strict';

var Button = _dereq_( '../button.js' );

var SubmitButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( SubmitButton );

SubmitButton.prototype.type = 'form_submit';

SubmitButton.prototype.cssClass = 'zcrud-form-submit-command-button';

//SubmitButton.prototype.selector = '.' + SubmitButton.prototype.cssClass;

SubmitButton.prototype.bindableIn = {
    formToolbar: true
};

SubmitButton.prototype.getTextsBundle = function(){

    return {
        title: undefined,
        content: {
            translate: true,
            text: this.parent.getType() == 'delete'? 'Delete': 'Save' 
        }
    }
};

SubmitButton.prototype.run = function( event, formPage, $form ){
    
    event.preventDefault();
    event.stopPropagation();
    
    formPage.getSubmitFunction().call( formPage, event, $form );
};

module.exports = SubmitButton;

},{"../button.js":1}],6:[function(_dereq_,module,exports){
/*
    GenericButton class
*/
'use strict';

var Button = _dereq_( './button.js' );

var GenericButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( GenericButton );

Button.prototype.isBindable = function(){
    return true;
};

module.exports = GenericButton;

},{"./button.js":1}],7:[function(_dereq_,module,exports){
/*
    AddNewRowButton class
*/
'use strict';

var Button = _dereq_( '../button.js' );

var AddNewRowButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( AddNewRowButton );

AddNewRowButton.prototype.type = 'list_addNewRow';

AddNewRowButton.prototype.cssClass = 'zcrud-new-row-command-button';

//AddNewRowButton.prototype.selector = '.' + AddNewRowButton.prototype.cssClass;

AddNewRowButton.prototype.bindableIn = {
    listToolbar: true
};

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

AddNewRowButton.prototype.run = function( event, listPage ){
    
    event.preventDefault();
    event.stopPropagation();
    
    listPage.getComponent( 'editing' ).addNewRow( event );
};

module.exports = AddNewRowButton;

},{"../button.js":1}],8:[function(_dereq_,module,exports){
/*
    DeleteRowButton class
*/
'use strict';

var Button = _dereq_( '../button.js' );

var DeleteRowButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( DeleteRowButton );

DeleteRowButton.prototype.type = 'list_deleteRow';

DeleteRowButton.prototype.cssClass = 'zcrud-delete-row-command-button';

//DeleteRowButton.prototype.selector = '.' + DeleteRowButton.prototype.cssClass;

DeleteRowButton.prototype.bindableIn = {
    listRow: true
};

DeleteRowButton.prototype.getTextsBundle = function(){

    return {
        title: {
            translate: false,
            text: 'Delete record'
        },
        content: undefined
    };
};

DeleteRowButton.prototype.run = function( event, listPage ){
    
    event.preventDefault();
    event.stopPropagation();
    
    listPage.getComponent( 'editing' ).deleteRow( event );
};

module.exports = DeleteRowButton;

},{"../button.js":1}],9:[function(_dereq_,module,exports){
/*
    ShowCreateFormButton class
*/
'use strict';

var Button = _dereq_( '../button.js' );

var ShowCreateFormButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( ShowCreateFormButton );

ShowCreateFormButton.prototype.type = 'list_showCreateForm';

ShowCreateFormButton.prototype.cssClass = 'zcrud-new-command-button';

//ShowCreateFormButton.prototype.selector = '.' + ShowCreateFormButton.prototype.cssClass;

ShowCreateFormButton.prototype.bindableIn = {
    listToolbar: true
};

ShowCreateFormButton.prototype.getTextsBundle = function(){

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

ShowCreateFormButton.prototype.run = function( event, listPage ){
    
    event.preventDefault();
    event.stopPropagation();
    
    listPage.showCreateForm( event );
};

module.exports = ShowCreateFormButton;

},{"../button.js":1}],10:[function(_dereq_,module,exports){
/*
    ShowDeleteFormButton class
*/
'use strict';

var Button = _dereq_( '../button.js' );

var ShowDeleteFormButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( ShowDeleteFormButton );

ShowDeleteFormButton.prototype.type = 'list_showDeleteForm';

ShowDeleteFormButton.prototype.cssClass = 'zcrud-delete-command-button';

//ShowDeleteFormButton.prototype.selector = '.' + ShowDeleteFormButton.prototype.cssClass;

ShowDeleteFormButton.prototype.bindableIn = {
    listRow: true
};

ShowDeleteFormButton.prototype.getTextsBundle = function(){

    return {
        title: {
            translate: false,
            text: 'Delete record'
        },
        content: undefined
    };
};

ShowDeleteFormButton.prototype.run = function( event, listPage ){
    
    event.preventDefault();
    event.stopPropagation();
    
    listPage.showDeleteForm( event );
};

module.exports = ShowDeleteFormButton;

},{"../button.js":1}],11:[function(_dereq_,module,exports){
/*
    ShowEditFormButton class
*/
'use strict';

var Button = _dereq_( '../button.js' );

var ShowEditFormButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( ShowEditFormButton );

ShowEditFormButton.prototype.type = 'list_showEditForm';

ShowEditFormButton.prototype.cssClass = 'zcrud-edit-command-button';

//ShowEditFormButton.prototype.selector = '.' + ShowEditFormButton.prototype.cssClass;

ShowEditFormButton.prototype.bindableIn = {
    listRow: true
};

ShowEditFormButton.prototype.getTextsBundle = function(){
    
    return {
        title: {
            translate: false,
            text: 'Edit record'
        },
        content: undefined
    };
};

ShowEditFormButton.prototype.run = function( event, listPage ){
    
    event.preventDefault();
    event.stopPropagation();
    
    listPage.showEditForm( event );
};

module.exports = ShowEditFormButton;

},{"../button.js":1}],12:[function(_dereq_,module,exports){
/*
    SubmitButton class
*/
'use strict';

var Button = _dereq_( '../button.js' );

var SubmitButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( SubmitButton );

SubmitButton.prototype.type = 'list_submit';

SubmitButton.prototype.cssClass = 'zcrud-save-command-button';

//SubmitButton.prototype.selector = '.' + SubmitButton.prototype.cssClass;

SubmitButton.prototype.bindableIn = {
    listToolbar: true
};

SubmitButton.prototype.getTextsBundle = function(){

    return {
        title: undefined,
        content: {
            translate: true,
            text: 'Save'
        }
    };
};

SubmitButton.prototype.run = function( event, listPage ){
    
    event.preventDefault();
    event.stopPropagation();
    
    listPage.getComponent( 'editing' ).submit( event );
};

module.exports = SubmitButton;

},{"../button.js":1}],13:[function(_dereq_,module,exports){
/*
    RedoButton class
*/
'use strict';

var context = _dereq_( '../context.js' );
var Button = _dereq_( './button.js' );

var RedoButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( RedoButton );

RedoButton.prototype.type = 'redo';

RedoButton.prototype.cssClass = 'zcrud-redo-command-button';

//RedoButton.prototype.selector = '.' + RedoButton.prototype.cssClass;

RedoButton.prototype.bindableIn = {
    formToolbar: true,
    listToolbar: true
};

RedoButton.prototype.disabled = true;

RedoButton.prototype.getTextsBundle = function(){

    return {
        title: undefined,
        content: {
            translate: true,
            text: 'Redo'
        }
    };
};

RedoButton.prototype.run = function( event, page ){
    
    event.preventDefault();
    event.stopPropagation();
    
    context.getHistory().redo( page.getId() );
};

module.exports = RedoButton;

},{"../context.js":27,"./button.js":1}],14:[function(_dereq_,module,exports){
/*
    AddNewRowButton class
*/
'use strict';

var Button = _dereq_( '../button.js' );

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

},{"../button.js":1}],15:[function(_dereq_,module,exports){
/*
    DeleteRowButton class
*/
'use strict';

var Button = _dereq_( '../button.js' );

var DeleteRowButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( DeleteRowButton );

DeleteRowButton.prototype.type = 'subform_deleteRow';

DeleteRowButton.prototype.cssClass = 'zcrud-delete-row-command-button';

//DeleteRowButton.prototype.selector = '.' + DeleteRowButton.prototype.cssClass;

DeleteRowButton.prototype.bindableIn = {
    subformRow: true
};
DeleteRowButton.prototype.notUseInPages = [ 'delete' ];

DeleteRowButton.prototype.getTextsBundle = function(){

    return {
        title: {
            translate: false,
            text: 'Delete record'
        },
        content: undefined
    };
};

DeleteRowButton.prototype.run = function( event, subformInstance ){
    
    event.preventDefault();
    event.stopPropagation();
    
    subformInstance.deleteRow( event );
};

module.exports = DeleteRowButton;

},{"../button.js":1}],16:[function(_dereq_,module,exports){
/*
    ShowCreateFormButton class
*/
'use strict';

var Button = _dereq_( '../button.js' );

var ShowCreateFormButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( ShowCreateFormButton );

ShowCreateFormButton.prototype.type = 'subform_showCreateForm';

ShowCreateFormButton.prototype.cssClass = 'zcrud-new-command-button';

//ShowCreateFormButton.prototype.selector = '.' + ShowCreateFormButton.prototype.cssClass;

ShowCreateFormButton.prototype.bindableIn = {
    subformToolbar: true
};
ShowCreateFormButton.prototype.notUseInPages = [ 'delete' ];

ShowCreateFormButton.prototype.getTextsBundle = function(){

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

ShowCreateFormButton.prototype.run = function( event, subformInstance ){
    
    event.preventDefault();
    event.stopPropagation();
    
    subformInstance.showCreateForm( event );
};

module.exports = ShowCreateFormButton;

},{"../button.js":1}],17:[function(_dereq_,module,exports){
/*
    ShowDeleteFormButton class
*/
'use strict';

var Button = _dereq_( '../button.js' );

var ShowDeleteFormButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( ShowDeleteFormButton );

ShowDeleteFormButton.prototype.type = 'subform_showDeleteForm';

ShowDeleteFormButton.prototype.cssClass = 'zcrud-delete-command-button';

//ShowDeleteFormButton.prototype.selector = '.' + ShowDeleteFormButton.prototype.cssClass;

ShowDeleteFormButton.prototype.bindableIn = {
    subformRow: true
};
ShowDeleteFormButton.prototype.notUseInPages = [ 'delete' ];

ShowDeleteFormButton.prototype.getTextsBundle = function(){

    return {
        title: {
            translate: false,
            text: 'Delete record'
        },
        content: undefined
    };
};

ShowDeleteFormButton.prototype.run = function( event, subformInstance ){
    
    event.preventDefault();
    event.stopPropagation();
    
    subformInstance.showNewFormUsingRecordFromServer( 'delete', event );
};

module.exports = ShowDeleteFormButton;

},{"../button.js":1}],18:[function(_dereq_,module,exports){
/*
    ShowEditFormButton class
*/
'use strict';

var Button = _dereq_( '../button.js' );

var ShowEditFormButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( ShowEditFormButton );

ShowEditFormButton.prototype.type = 'subform_showEditForm';

ShowEditFormButton.prototype.cssClass = 'zcrud-edit-command-button';

//ShowEditFormButton.prototype.selector = '.' + ShowEditFormButton.prototype.cssClass;

ShowEditFormButton.prototype.bindableIn = {
    subformRow: true
};
ShowEditFormButton.prototype.notUseInPages = [ 'delete' ];

ShowEditFormButton.prototype.getTextsBundle = function(){

    return {
        title: {
            translate: false,
            text: 'Edit record'
        },
        content: undefined
    };
};

ShowEditFormButton.prototype.run = function( event, subformInstance ){
    
    event.preventDefault();
    event.stopPropagation();
    
    subformInstance.showNewFormUsingRecordFromServer( 'update', event );
};

module.exports = ShowEditFormButton;

},{"../button.js":1}],19:[function(_dereq_,module,exports){
/*
    UndoButton class
*/
'use strict';

var context = _dereq_( '../context.js' );
var Button = _dereq_( './button.js' );

var UndoButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( UndoButton );

UndoButton.prototype.type = 'undo';

UndoButton.prototype.cssClass = 'zcrud-undo-command-button';

//UndoButton.prototype.selector = '.' + UndoButton.prototype.cssClass;

UndoButton.prototype.bindableIn = {
    formToolbar: true,
    listToolbar: true
};

UndoButton.prototype.disabled = true;

UndoButton.prototype.getTextsBundle = function(){

    return {
        title: undefined,
        content: {
            translate: true,
            text: 'Undo'
        }
    };
};

UndoButton.prototype.run = function( event, page ){
    
    event.preventDefault();
    event.stopPropagation();
    
    context.getHistory().undo( page.getId() );
};

module.exports = UndoButton;

},{"../context.js":27,"./button.js":1}],20:[function(_dereq_,module,exports){
/* 
    Component class
*/
'use strict';

var context = _dereq_( '../context.js' );

var Component = function( optionsToApply, thisOptionsToApply, parentToApply, pageToApply ) {
    
    this.options = optionsToApply;
    this.thisOptions = thisOptionsToApply;
    this.parent = parentToApply;
    this.page = pageToApply;
};

Component.prototype.processDirty = function( callback ){

    if ( ! this.parent.isDirty() ){
        callback();
        return;
    }

    // Component is dirty!
    var instance = this;
    context.confirm(
        this.options,
        {
            title: context.translate( 'dirtyPagingTitle' ),
            text: context.translate( 'dirtyPagingText' ),
            className: 'wideConfirm',
            buttons: {
                cancel: context.translate( 'dirtyPagingCancel' ),
                /*save: {
                        text: context.translate( 'dirtyPagingSave' ),
                        value: 'save',
                    },*/
                discard: {
                    text: context.translate( 'dirtyPagingDiscard' ),
                    value: 'discard',
                }
            }
        },
        function( value ){
            if ( value == 'discard' ) {
                instance.parent.removeChanges();
                callback();
            }
        }
    );
};

Component.prototype.getOptions = function(){
    return this.options;
};

Component.prototype.getThisOptions = function(){
    return this.thisOptions;
};

Component.prototype.getParent = function(){
    return this.parent;
};

Component.prototype.getPage = function(){
    return this.page;
};

Component.prototype.validate = function(){
    return true;
};

Component.prototype.resetPage = function(){};
Component.prototype.addToDataToSend = function(){};
Component.prototype.dataFromServer = function(){};
Component.prototype.bindEvents = function(){};
Component.prototype.bindEventsIn1Row = function(){};

Component.doSuperClassOf = function( ChildClass ){

    ChildClass.prototype = new Component();
    ChildClass.prototype.constructor = ChildClass;
};

module.exports = Component;

},{"../context.js":27}],21:[function(_dereq_,module,exports){
/* 
    Class ComponentsMap 
*/
'use strict';

//var context = require( '../context.js' );
var utils = _dereq_( '../utils.js' );

var ComponentsMap = function ( optionsToApply, thisOptionsToApply, parentToApply, pageToApply ) {
    
    var options = optionsToApply;
    var thisOptions = thisOptionsToApply;
    var parent = parentToApply;
    var page = pageToApply;
    var components = {};
    
    // Initial configuration
    var configure = function(){
        registerAllComponents();
    };
    
    var registerAllComponents = function() {

        for ( var componentId in thisOptions ){
            var component = thisOptions[ componentId ];
            if ( component.isOn ){
                registerComponent( componentId, component );
            }
        }
    }

    var registerComponent = function( componentId, component ){
        
        // Get ConstructorClass
        var ConstructorClass = component.constructorClass;
        
        // Build component using ConstructorClass and add to components
        components[ componentId ] = new ConstructorClass( options, component, parent, page );
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
            component.resetPage();
        }
    };
    
    var addToDataToSend = function( data ){

        for ( var id in components ){
            var component = components[ id ];
            component.addToDataToSend( data );
        }

        return data;
    };

    var dataFromServer = function( data ){

        for ( var id in components ){
            var component = components[ id ];
            component.dataFromServer( data );
        }
    };
    
    var bindEvents = function() {

        for ( var id in components ){
            var component = components[ id ];
            component.bindEvents();
        }
    };
    
    var bindEventsIn1Row = function( $row ) {

        for ( var id in components ){
            var component = components[ id ];
            component.bindEventsIn1Row( $row );
        }
    };
    
    var validate = function() {

        for ( var id in components ){
            var component = components[ id ];
            var validation = component.validate();
            if ( validation === true ){
                continue;
            }
            return utils.isPlainObject( validation )? validation: false;
        }
        
        return true;
    };
    
    var self = {
        getComponent: getComponent,
        getSecureComponent: getSecureComponent,
        resetPage: resetPage,
        addToDataToSend: addToDataToSend,
        dataFromServer: dataFromServer,
        bindEvents: bindEvents,
        bindEventsIn1Row: bindEventsIn1Row,
        validate: validate
    };
    
    configure();
    
    return self;
};

module.exports = ComponentsMap;

},{"../utils.js":57}],22:[function(_dereq_,module,exports){
/* 
    EditingComponent class
*/
'use strict';

//var $ = require( 'zzdom' );
var zzDOM = _dereq_( '../../../lib/zzDOM-closures-full.js' );
var $ = zzDOM.zz;
var context = _dereq_( '../context.js' );
var Component = _dereq_( './component.js' );
var pageUtils = _dereq_( '../pages/pageUtils.js' );
var History = _dereq_( '../history/history.js' );
var crudManager = _dereq_( '../crudManager.js' );
var validationManager = _dereq_( '../validationManager.js' );
var fieldUtils = _dereq_( '../fields/fieldUtils.js' );
var utils = _dereq_( '../utils.js' );

var EditingComponent = function( optionsToApply, thisOptionsToApply, listPageToApply ) {
    
    Component.call( this, optionsToApply, thisOptionsToApply, listPageToApply );
    
    this.listPage = listPageToApply;
    this.autoSubmitMode = false;
    
    context.setHistory( 
        new History( 
            this.options, 
            this.thisOptions, 
            this.listPage ) );
};
Component.doSuperClassOf( EditingComponent );

EditingComponent.prototype.bindEvents = function(){

    var $this = $( '#' + this.listPage.getId() );

    // Register change of the field
    this.bindEventsInRows( $this );

    // Setup validation
    var formId = this.listPage.getThisOptions().formId;
    validationManager.initFormValidation( 
        formId, 
        $( '#' + formId ), 
        this.options );
};

EditingComponent.prototype.bindEventsInRows = function( $preselection, record ){

    var instance = this;
    $preselection
        .find( '.zcrud-column-data input.historyField, .zcrud-column-data textarea.historyField, .zcrud-column-data select.historyField' )
        .on(
            'change',
            function ( event ) {
                //var disableHistory = utils.getParam( params, 'disableHistory' );
                var disableHistory = utils.getParam( event.params, 'disableHistory' );
                if ( disableHistory ){
                    return;
                }
                var $this = $( this );
                var field = instance.listPage.getFieldByName( $this.attr( 'name' ) );
                //var field = instance.listPage.getFieldByName( $this.prop( 'name' ) );
                var $tr = $this.parents( 'tr' ).first();
                //var $tr = $this.closest( 'tr' );
                context.getHistory().putChange( 
                    $this, 
                    field.getValueForHistory( $this ),
                    $tr.attr( 'data-record-index' ),
                    $tr.attr( 'data-record-id' ),
                    instance.listPage.getId(),
                    field );
                if ( instance.autoSubmitMode ){
                    instance.submit.call( instance, event );
                }
            }
    );

    this.listPage.bindButtonsEvent( this.listPage.getByRowButtons() );

    // Bind events for fields
    var dictionary = this.listPage.getInstanceDictionaryExtension();
    var fields = this.listPage.getFields();

    if ( record ){
        this.bindEventsForFieldsAnd1Record( 
            fields, 
            dictionary, 
            record, 
            $preselection 
        );
    } else {
        this.bindEventsForFieldsAndAllRecords( 
            fields, 
            dictionary,
            dictionary.records 
        );
    }
};

EditingComponent.prototype.bindEventsForFieldsAndAllRecords = function( fields, dictionary, records ){

    var $rows = $( '#' + this.listPage.getThisOptions().tbodyId ).children().filter( '.zcrud-data-row' );
    for ( var i = 0; i < records.length; i++ ) {
        var record = records[ i ];
        this.bindEventsForFieldsAnd1Record(
            fields,
            dictionary,
            record,
            $rows.list[ i ] );
    }
};

EditingComponent.prototype.bindEventsForFieldsAnd1Record = function( fields, dictionary, record, $row ){

    for ( var c = 0; c < fields.length; c++ ) {
        var field = fields[ c ];
        field.afterProcessTemplateForField(
            this.buildProcessTemplateParams( field, record, dictionary ),
            $row
        );
    }
};

EditingComponent.prototype.buildProcessTemplateParams = function( field, record, dictionary ){

    return {
        field: field, 
        value: record[ field.id ],
        options: this.options,
        record: record,
        source: 'update',
        dictionary: dictionary
    };
};

EditingComponent.prototype.deleteRow = function( event ){

    var $tr = $( event.target ).parents( 'tr' ).first();
    //var $tr = $( event.target ).closest( 'tr' );

    context.getHistory().putDelete( 
        this.listPage.getId(), 
        $tr.attr( 'data-record-id' ),
        $tr.attr( 'data-record-index' ), 
        $tr.attr( 'data-record-key' ), 
        $tr );

    if ( this.autoSubmitMode ){
        this.submit( event );
    }
};

EditingComponent.prototype.addNewRow = function( event ){

    var newRecord = fieldUtils.buildDefaultValuesRecord( this.listPage.getFields() );
    var thisDictionary = this.buildDictionaryForNewRow( newRecord );

    var createHistoryItem = context.getHistory().putCreate( 
        this.listPage.getId(), 
        thisDictionary,
        $( '#' + this.listPage.getThisOptions().tbodyId ),
        newRecord 
    );
    var $tr = createHistoryItem.get$Tr();

    // Bind events
    this.bindEventsInRows( $tr, newRecord );
    validationManager.initFormValidation( 
        this.listPage.getThisOptions().formId, 
        $tr, 
        this.options 
    );
};

EditingComponent.prototype.buildDictionaryForNewRow = function( newRecord ){

    var thisDictionary = utils.extend( {}, this.listPage.getInstanceDictionaryExtension() );
    //var thisDictionary = utils.extend( true, {}, this.listPage.getDictionary() );
    
    thisDictionary.records = [ newRecord ];
    thisDictionary.editable = true;

    return thisDictionary;
};

// History methods
EditingComponent.prototype.undo = function( event ){
    context.getHistory().undo( this.listPage.getId() );
};
EditingComponent.prototype.redo = function( event ){
    context.getHistory().redo( this.listPage.getId() );
};

EditingComponent.prototype.submit = function( event ){
    
    var instance = this;
    this.parent.processDirty(
        this.thisOptions.confirm.save,
        'EditableList',
        function(){
            instance.doSubmit( event );
        }
    );
};
EditingComponent.prototype.doSubmit = function( event ){

    var instance = this;
    var jsonObject = context.getJSONBuilder( this.options ).buildJSONForAll(
        this.thisOptions.key || this.options.key, 
        this.listPage.getInstanceDictionaryExtension().records,
        this.listPage.getFields(),
        undefined,
        context.getHistory()
    );

    // Return if there is no operation to do
    if ( ! jsonObject ){
        context.showError(
            this.options,
            false,
            context.translate( 'errorNoOpToDo' )
            //'No operation to do!'
        );
        return false;
    }

    var newJSONObject = {
        existingRecords: jsonObject.existingRecords,
        newRecords: jsonObject.newRecords,
        recordsToRemove: jsonObject.recordsToRemove,
        success: function( dataFromServer ){

            instance.listPage.showStatusMessage({
                status:{
                    message: 'listUpdateSuccess',
                    date: new Date().toLocaleString()   
                }
            });

            // Update records in list and update paging component
            var delta = instance.updateRecords( jsonObject, dataFromServer );
            var pagingComponent = instance.listPage.getSecureComponent( 'paging' );
            if ( pagingComponent ){
                pagingComponent.dataFromClient( delta );
            }
            instance.listPage.updateBottomPanel();

            instance.updateKeys( 
                context.getHistory().getAllTr$FromCreateItems(), 
                dataFromServer.newRecords );
            context.getHistory().reset( instance.listPage.getId() );

        },
        error: function( request, status, error ){
            pageUtils.ajaxError( request, status, error, instance.options, context, undefined );
        },
        url: this.thisOptions.updateURL
    };
    
    crudManager.batchUpdate( 
        newJSONObject, 
        this.options, 
        {
            $form: this.listPage.get$form(),
            formType: 'list',
            dataToSend: newJSONObject,
            options: this.options
        }
    );

    return jsonObject;
};

EditingComponent.prototype.updateRecords = function( jsonObjectToSend, dataFromServer ){

    var delta = 0;
    var records = this.listPage.getRecords();

    // Update all existing records
    for ( var key in jsonObjectToSend.existingRecords ) {
        var modifiedRecord = jsonObjectToSend.existingRecords[ key ];
        var currentRecord = records[ key ];
        var newKey = modifiedRecord[ this.options.key ];
        var extendedRecord = utils.extend( true, {}, currentRecord, modifiedRecord );

        var currentKey = key;
        if ( newKey && key !== newKey ){
            delete records[ key ];
            key = newKey;
        }
        this.listPage.updateRecord( currentKey, extendedRecord );
        this.triggerEvent( 
            this.options.events.recordUpdated, 
            records[ key ], 
            dataFromServer );
    }

    // Add all new records using dataFromServer
    for ( var index in dataFromServer.newRecords ) {
        ++delta;
        var newRecord = dataFromServer.newRecords[ index ];
        key = newRecord[ this.options.key ];
        this.listPage.addRecord( key, newRecord );
        this.triggerEvent( 
            this.options.events.recordAdded, 
            newRecord, 
            dataFromServer );
    }

    // Remove all records to remove
    for ( var c = 0; c < jsonObjectToSend.recordsToRemove.length; c++ ) {
        --delta;
        key = jsonObjectToSend.recordsToRemove[ c ];
        var deletedRecord = utils.extend( true, {}, records[ key ] );
        this.listPage.deleteRecord( key );
        this.triggerEvent( 
            this.options.events.recordDeleted, 
            deletedRecord, 
            dataFromServer );
    }

    return delta;
};

EditingComponent.prototype.triggerEvent = function( eventFunction, record, dataFromServer ){

    eventFunction({
        record: record,
        serverResponse: dataFromServer,
        options: this.options
    });
};

EditingComponent.prototype.updateKeys = function( $trArray, records ){

    if ( $trArray.length != records.length ){
        context.showError( 
            this.options, 
            true, 
            'Error trying to update keys: $trArray and records length does not match!' );
        return;    
    }

    var field = this.listPage.getField( this.options.key );

    for ( var c = 0; c < records.length; ++c ){
        var record = records[ c ];
        var $tr = $trArray[ c ];
        var value = record[ this.options.key ];

        // Update key value of field
        if ( field ){
            $tr.find( '[name="' + field.id + '"]' ).val( value );
        }

        // Update key value in attribute of $tr
        $tr.attr( 'data-record-key', value );
    }
};

EditingComponent.prototype.removeChanges = function(){
    context.getHistory().reset( this.listPage.getId() );
};

module.exports = EditingComponent;

},{"../../../lib/zzDOM-closures-full.js":61,"../context.js":27,"../crudManager.js":28,"../fields/fieldUtils.js":36,"../history/history.js":45,"../pages/pageUtils.js":54,"../utils.js":57,"../validationManager.js":58,"./component.js":20}],23:[function(_dereq_,module,exports){
/* 
    FilteringComponent class
*/
'use strict';

//var context = require( '../context.js' );
var Component = _dereq_( './component.js' );
//var pageUtils = require( '../pages/pageUtils.js' );
var fieldUtils = _dereq_( '../fields/fieldUtils.js' );
var fieldListBuilder = _dereq_( '../fields/fieldListBuilder.js' );
var utils = _dereq_( '../utils.js' );

var FilteringComponent = function( optionsToApply, thisOptionsToApply, parentToApply ) {
    
    Component.call( this, optionsToApply, thisOptionsToApply, parentToApply );
    
    this.cssClass = 'zcrud-filter-panel';
    this.filterRecord = undefined;
    this.fullFilter = undefined;
    this.fields = undefined;
};
Component.doSuperClassOf( FilteringComponent );

FilteringComponent.prototype.getClass = function(){
    return this.cssClass;
};

FilteringComponent.prototype.getFilter = function(){
    return this.fullFilter;
};

FilteringComponent.prototype.bindEvents = function(){

    var instance = this;
    this.get$()
        .find( '.zcrud-filter-submit-button' )
        .off() // Remove previous event handlers
        .on( 
            'click',  
            function ( e ) {
                e.preventDefault();
                instance.filter();
            }
    );
};

FilteringComponent.prototype.filter = function(){
    
    var instance = this;
    this.processDirty(
        function(){
            instance.doFilter();
        }
    );
};

FilteringComponent.prototype.doFilter = function(){

    this.filterRecord = fieldUtils.buildRecord( 
        this.getFields(), 
        this.parent.get$() 
    );

    this.parent.goToFirstPage();

    this.updateParent();
};

FilteringComponent.prototype.addToDataToSend = function( dataToSend ){

    this.fullFilter = utils.extend( true, {}, this.filterRecord, dataToSend.filter );
    if ( ! utils.isEmptyObject( this.fullFilter ) ){
        dataToSend.filter = this.fullFilter;
    }
};

FilteringComponent.prototype.updateParent = function(){

    if ( this.parent.type == 'subform' ){
        this.parent.update(
            [
                this.parent.get$().find( 'thead' )[0],
                this.parent.get$().find( 'tbody' )[0],
                this.parent.getPagingComponent().get$()[0]
            ]
        );
        return;
    }
    
    this.parent.update();
};

FilteringComponent.prototype.get$ = function(){
    return this.parent.get$().find( '.' + this.cssClass );
};

FilteringComponent.prototype.getFields = function(){

    if ( ! this.fields ){
        this.fields = this.buildFields();
    }

    return this.fields;
};

FilteringComponent.prototype.buildFields = function(){

    var fieldsCache = fieldListBuilder.getForList( 
        this.thisOptions, 
        this.options, 
        this.parent.getFieldsSource() );
    return fieldsCache.fieldsArray;
};

FilteringComponent.prototype.filterIsOn = function(){

    if ( ! this.fullFilter ){
        return false;
    }

    for ( var index in this.fullFilter ){
        var filterFieldValue = this.fullFilter[ index ];
        if ( filterFieldValue != undefined ){
            return true;
        }
    }

    return false;
};

FilteringComponent.prototype.getInitialRecord = function(){
    return {};
};

FilteringComponent.prototype.getParent = function(){
    return this.parent;
};

FilteringComponent.prototype.validate = function(){
    
    if ( ! this.thisOptions.forceToFilter ){
        return true;
    }
    
    return this.filterIsOn()?
        true:
        {
            translate: true,
            message: 'forcedFilter'
        };
};

module.exports = FilteringComponent;

},{"../fields/fieldListBuilder.js":35,"../fields/fieldUtils.js":36,"../utils.js":57,"./component.js":20}],24:[function(_dereq_,module,exports){
/* 
    PagingComponent class
*/
'use strict';

//var context = require( '../context.js' );
var Component = _dereq_( './component.js' );
var pageUtils = _dereq_( '../pages/pageUtils.js' );
//var $ = require( 'zzdom' );
var zzDOM = _dereq_( '../../../lib/zzDOM-closures-full.js' );
var $ = zzDOM.zz;

var PagingComponent = function( optionsToApply, thisOptionsToApply, parentToApply ) {

    Component.call( this, optionsToApply, thisOptionsToApply, parentToApply );
    
    this.cssClass = 'zcrud-bottom-panel';
    
    // Init some vars if needed
    if ( this.thisOptions.goToPageFieldClass == undefined ){
        this.thisOptions.goToPageFieldClass = 'zcrud-go-to-page-field';
    }
    if ( this.thisOptions.pageSizeChangeFieldClass == undefined ){
        this.thisOptions.pageSizeChangeFieldClass = 'zcrud-page-size-change-field';
    }
    
    this.pageNumber = 1; // The current page
    this.totalNumberOfRecords = undefined;
    this.pageSize = parseInt( this.thisOptions.defaultPageSize );
    this.pageSizeLocalStorageId = 'page-size';
    this.thisPageSize = undefined;
    this.records = undefined;
    this.localStorage = localStorage;

    this.loadSettings();
};
Component.doSuperClassOf( PagingComponent );

PagingComponent.prototype.getClass = function(){
    return this.cssClass;
};

PagingComponent.prototype.getRecords = function(){
    return this.records;
};

PagingComponent.prototype.loadSettings = function(){

    if ( ! this.options.saveUserPreferences ) {
        return;
    }

    var localStoragePageSize = this.localStorage.getItem( this.pageSizeLocalStorageId );
    if ( localStoragePageSize ) {
        this.pageSize = pageUtils.normalizeNumber( 
            localStoragePageSize, 
            1, 
            1000000, 
            this.thisOptions.defaultPageSize
        );
    }
};

PagingComponent.prototype.saveSettings = function() {

    if ( ! this.options.saveUserPreferences ) {
        return;
    }

    this.localStorage.setItem( this.pageSizeLocalStorageId, this.pageSize );
};

PagingComponent.prototype.bindEventsToPageSizeChangeCombobox = function(){

    if ( ! this.thisOptions.pageSizeChangeArea ) {
        return;
    }

    // Change page size on combobox change
    var instance = this;
    this.get$().find( '.' + this.thisOptions.pageSizeChangeFieldClass )
        .off() // Remove previous event handlers
        .on(
            'change',
            function() {
                instance.changePageSize(
                    parseInt( $( this ).val() )
                );
            }
    );
};

PagingComponent.prototype.updateParent = function(){

    if ( this.parent.type == 'subform' ){
        this.parent.update();
        return;
    }

    this.parent.show( 
        {
            root: [ $( '#' + this.parent.getThisOptions().tbodyId )[0], this.get$()[0] ] 
        }
    );
};

// Change current page to given value
PagingComponent.prototype.changePage = function ( newPageNumber ) {

    var instance = this;
    this.processDirty(
        function(){
            instance.doChangePage( newPageNumber );
        }
    );
};

PagingComponent.prototype.doChangePage = function( newPageNumber ) {

    newPageNumber = pageUtils.normalizeNumber( parseInt( newPageNumber ), 1, this.calculatePageCount(), 1 );
    if ( newPageNumber == this.pageNumber ) {
        return;
    }

    this.pageNumber = newPageNumber;

    this.updateParent();
}

PagingComponent.prototype.changePageSize = function( newPageSize ) {

    // If newPageSize is not in pageSizes return
    if ( -1 == this.thisOptions.pageSizes.indexOf( newPageSize ) ){
        return;
    }

    // If the new size is the current size return
    if ( newPageSize == this.pageSize ) {
        return;
    }
    
    var instance = this;
    this.processDirty(
        function(){
            instance.doChangePageSize( newPageSize );
        }
    );
};

PagingComponent.prototype.doChangePageSize = function( newPageSize ) {

    this.pageSize = parseInt( newPageSize );
    this.pageNumber = 1;

    this.saveSettings();

    this.updateParent();
}

PagingComponent.prototype.bindEventsToGoToPage = function() {
    
    var instance = this;
    
    if ( ! this.thisOptions.gotoPageFieldType || this.thisOptions.gotoPageFieldType == 'none' ) {
        return;
    }

    // Goto page input
    if ( this.thisOptions.gotoPageFieldType == 'combobox' ) {
        this.get$().find( '.' + this.thisOptions.goToPageFieldClass )
            .off() // Remove previous event handlers
            .on(
                'change',
                function() {
                    instance.changePage(
                        parseInt( $( this ).val() ) );
                }
            );
        return;

    } else if ( this.thisOptions.gotoPageFieldType == 'textbox' ) {
        this.get$().find( '.' + this.thisOptions.goToPageFieldClass )
            .off() // Remove previous event handlers
            .on( 
                'keypress',
                function( event ) {
                    if ( event.which == 13 ) { // enter
                        event.preventDefault();
                        instance.changePage(
                            parseInt( $( this ).val() ) );
                    } else if ( event.which == 43 ) { // +
                        event.preventDefault();
                        instance.changePage( instance.pageNumber + 1 );
                        instance.get$().find( '.' + instance.thisOptions.goToPageFieldClass ).trigger( 'focus' );
                    } else if ( event.which == 45 ) { // -
                        event.preventDefault();
                        instance.changePage( instance.pageNumber - 1 );
                        instance.get$().find( '.' + instance.thisOptions.goToPageFieldClass ).trigger( 'focus' );
                    } else {
                        // Allow only digits
                        var isValid =
                            ( 47 < event.keyCode && event.keyCode < 58 && event.shiftKey == false && event.altKey == false )
                            || ( event.keyCode == 8 )
                            || ( event.keyCode == 9 );

                        if ( ! isValid ) {
                            event.preventDefault();
                        }
                    }
                }
            );
        return;
    }

    throw 'Not valid paging component / gotoPageFieldType value:' + this.thisOptions.gotoPageFieldType;
};

// Bind click events of all page links to change the page
PagingComponent.prototype.bindEventsToPageNumberButtons = function () {
    
    var instance = this;
    this.get$()
        .find( '.zcrud-page-number,.zcrud-page-number-previous,.zcrud-page-number-next,.zcrud-page-number-first,.zcrud-page-number-last' )
        //.not( '.zcrud-page-number-disabled' )
        .off() // Remove previous event handlers
        .on(
            'click',  
            function ( e ) {
                e.preventDefault();
                var $this = $( this );

                // Exclude zcrud-page-number-disabled class
                if ( ! $this.hasClass( '.zcrud-page-number-disabled' ) ){
                    instance.changePage( $this.attr( 'data-page' ) );
                }
                //instance.changePage( $( this )[ 0 ].getAttribute( 'data-page' ) );
            }
        );
};

PagingComponent.prototype.bindEvents = function(){
    
    this.bindEventsToPageNumberButtons();
    this.bindEventsToGoToPage();
    this.bindEventsToPageSizeChangeCombobox();
};

PagingComponent.prototype.getPageSizes = function(){
    return this.thisOptions.pageSizes;
};

PagingComponent.prototype.addToDataToSend = function( dataToSend ){
    dataToSend.pageNumber = parseInt( this.pageNumber);
    dataToSend.pageSize = parseInt( this.pageSize );
};

PagingComponent.prototype.builPageList = function( numberOfPages, pageStep, pageStart ){

    var pages = [];

    for ( var c = 0; c < ( numberOfPages * pageStep ); c += pageStep ) {
        pages.push( pageStart + c );
    }

    return pages;
};

PagingComponent.prototype.buildPageListInfo = function( numberOfPages ){

    var info = {};

    info.block1OfPages = [];
    info.block2OfPages = [];
    info.block3OfPages = [];

    var maxNumberOfAllShownPages = pageUtils.normalizeNumber( this.thisOptions.maxNumberOfAllShownPages, 4, 100, 4 );

    // Show all pages
    if ( numberOfPages < maxNumberOfAllShownPages ){
        info.block1OfPages = this.builPageList( numberOfPages, 1, 1 );

    // At first pages            
    } else if ( this.pageNumber < maxNumberOfAllShownPages ){
        var block2NumberOfPages = pageUtils.normalizeNumber( this.thisOptions.block2NumberOfPages, 2, 100, 5 );
        info.block2OfPages = this.builPageList( 
            block2NumberOfPages, 
            1, 
            1);
        var block3NumberOfPages = pageUtils.normalizeNumber( this.thisOptions.block3NumberOfPages, 0, 100, 2 );
        info.block3OfPages = this.builPageList( 
            block3NumberOfPages,
            1, 
            numberOfPages - block3NumberOfPages + 1 );

    // At last pages
    } else if ( this.pageNumber > ( 1 + numberOfPages - maxNumberOfAllShownPages ) ){
        info.block1OfPages = this.builPageList( 
            pageUtils.normalizeNumber( this.thisOptions.block1NumberOfPages, 0, 100, 2 ), 
            1, 
            1 );
        block2NumberOfPages = pageUtils.normalizeNumber( this.thisOptions.block2NumberOfPages, 2, 100, 3 );
        info.block2OfPages = this.builPageList( 
            block2NumberOfPages, 
            1, 
            numberOfPages - block2NumberOfPages + 1 );

    // Intermediate
    } else {
        info.block1OfPages = this.builPageList( 
            pageUtils.normalizeNumber( this.thisOptions.block1NumberOfPages, 0, 100, 2 ), 
            1, 
            1 );
        block2NumberOfPages = pageUtils.normalizeNumber( this.thisOptions.block2NumberOfPages, 3, 100, 3 );
        info.block2OfPages = this.builPageList( 
            block2NumberOfPages, 
            1, 
            Math.floor( this.pageNumber - block2NumberOfPages / 2 + 1 ) );
        block3NumberOfPages = pageUtils.normalizeNumber( this.thisOptions.block3NumberOfPages, 0, 100, 2 );
        info.block3OfPages = this.builPageList( 
            block3NumberOfPages,
            1, 
            numberOfPages - block3NumberOfPages + 1 );
    }

    this.mixBlocksOfPages( info );

    return info;
};

PagingComponent.prototype.mixBlocksOfPages = function( info ){

    // Mix block 2 and block 3
    var mix = this.mix2BlocksOfPages( info.block2OfPages, info.block3OfPages );
    if ( mix ){
        info.block2OfPages = mix;
        info.block3OfPages = [];
    }

    // Mix block 1 and block 2
    mix = this.mix2BlocksOfPages( info.block1OfPages, info.block2OfPages );
    if ( mix ){
        info.block1OfPages = mix;
        info.block2OfPages = [];
    }
};

PagingComponent.prototype.mix2BlocksOfPages = function( block1, block2 ){

    // Return block2 if block1 is empty
    if ( block1.length == 0 ){
        return block2;
    }

    // Check blocks are not contigous
    if ( 1 + block1[ block1.length - 1 ] < block2[ 0 ] ){
        return undefined;
    }

    // Check blocks are contigous: concat them
    if ( 1 + block1[ block1.length - 1 ] == block2[ 0 ] ){
        return block1.concat( block2 );
    }

    // Blocks overlap: mix them
    return block1.concat( block2.filter( function ( item ) {
        return block1.indexOf( item ) < 0;
    }));
};

PagingComponent.prototype.buildInfo = function(){

    var firstElementIndex = ( this.pageNumber - 1 ) * this.pageSize;
    var numberOfPages = this.calculatePageCount();

    return {
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        first: 1 + firstElementIndex,
        last: 1 + firstElementIndex + this.thisPageSize - 1,
        totalNumberOfRecords: this.totalNumberOfRecords,
        numberOfPages: numberOfPages,
        goToPageList: this.buildGoToPageList( numberOfPages ),
        pageListInfo: this.buildPageListInfo( numberOfPages ),
        isFirstPage: this.pageNumber == 1,
        isLastPage: this.pageNumber == numberOfPages || numberOfPages == 0
    };
};

PagingComponent.prototype.dataFromServer = function( data ){

    this.totalNumberOfRecords = data.totalNumberOfRecords;
    this.records = data.records || [];
    this.thisPageSize = this.records.length;
};

PagingComponent.prototype.dataFromClient = function( delta ){

    this.totalNumberOfRecords += delta;
    this.thisPageSize += delta;
};

PagingComponent.prototype.buildGoToPageList = function( numberOfPages ){

    // Skip some pages is there are too many pages
    var pageStep = 1;
    if ( numberOfPages > 10000 ) {
        pageStep = 100;
    } else if ( numberOfPages > 5000 ) {
        pageStep = 10;
    } else if ( numberOfPages > 2000 ) {
        pageStep = 5;
    } else if ( numberOfPages > 1000 ) {
        pageStep = 2;
    }

    var pages = [];

    for ( var c = pageStep; c <= numberOfPages; c += pageStep ) {
        pages.push( c );
    }

    return pages;
};

PagingComponent.prototype.calculatePageCount = function (){

    var pageCount = Math.floor( this.totalNumberOfRecords / this.pageSize );
    if ( this.totalNumberOfRecords % this.pageSize != 0 ) {
        ++pageCount;
    }

    return pageCount;
};

PagingComponent.prototype.getPageSize = function(){
    return this.pageSize;
};

PagingComponent.prototype.setPageNumber = function( pageNumberToSet ){
    this.pageNumber = pageNumberToSet;
};

PagingComponent.prototype.goToFirstPage = function(){
    this.setPageNumber( 1 );
};

PagingComponent.prototype.getTotalNumberOfRecords = function(){
    return this.totalNumberOfRecords;
};

PagingComponent.prototype.get$ = function(){
    return this.parent.get$().find( '.' + this.cssClass );
};

module.exports = PagingComponent;

},{"../../../lib/zzDOM-closures-full.js":61,"../pages/pageUtils.js":54,"./component.js":20}],25:[function(_dereq_,module,exports){
/* 
    SelectingComponent class
*/
'use strict';

//var $ = require( 'zzdom' );
var zzDOM = _dereq_( '../../../lib/zzDOM-closures-full.js' );
var $ = zzDOM.zz;
//var context = require( '../context.js' );
var Component = _dereq_( './component.js' );
var pageUtils = _dereq_( '../pages/pageUtils.js' );
//var fieldUtils = require( '../fields/fieldUtils.js' );

var SelectingComponent = function( optionsToApply, thisOptionsToApply, parentToApply, pageToApply ) {

    Component.call( this, optionsToApply, thisOptionsToApply, parentToApply, pageToApply );
    
    this.shiftKeyDown = false; // True, if shift key is currently down
    this.modeOnRowClickOn =  -1 != this.thisOptions.mode.indexOf( 'onRowClick' );
    this.modeCheckBoxOn =  -1 != this.thisOptions.mode.indexOf( 'checkbox' );
};
Component.doSuperClassOf( SelectingComponent );

SelectingComponent.prototype.bindKeyboardEvents = function (){
    
    // Register to events to set shiftKeyDown value
    var instance = this;
    
    $( document.body )
        .on(
            'keydown',
            function ( event ) {
                switch ( event.key ) {
                    case 'Shift':
                        instance.shiftKeyDown = true;
                        break;
                }
            }
    )
        .on(
            'keyup',
            function ( event ) {
                switch ( event.key ) {
                    case 'Shift':
                        instance.shiftKeyDown = false;
                        break;
                }
            }
    );
};

// Return a reference to the 'select/deselect all' checkbox ($item)
SelectingComponent.prototype.get$selectAllCheckbox = function(){
    return this.parent.get$().find( '.zcrud-select-all-rows' );
};

SelectingComponent.prototype.get$allTableRows = function(){
    return this.parent.get$().find( 'tr.zcrud-data-row' );
};

SelectingComponent.prototype.bindSelectAllHeader = function(){

    var instance = this;
    this.get$selectAllCheckbox().on(
        'change',  
        function () {
            var allTableRows = instance.get$allTableRows();
            if ( allTableRows.length <= 0 ) {
                instance.get$selectAllCheckbox().attr( 'checked', false );
                return;
            }
            
            //if ( $( this ).is( ':checked' ) ) {
            if ( $( this ).checked() ) {
                instance._selectRows( allTableRows );
            } else {
                instance._deselectRows( allTableRows );
            }

            instance.onSelectionChanged();
        }
    );
};

SelectingComponent.prototype.bindRowsEvents = function( $selection ){

    var instance = this;
    
    // Select/deselect on row click
    if ( this.modeOnRowClickOn ) {
        $selection.on( 
            'click',  
            function () {
                instance.invertRowSelection( $( this ) );
            }
        );
    }

    // Select/deselect checkbox column
    if ( ! this.modeOnRowClickOn && this.modeCheckBoxOn ) {
        $selection.find( '.zcrud-select-row' ).on(
            'click',  
            function () {
                instance.invertRowSelection( $( this ).parents( 'tr' ) );
            }
        );
    }
};

SelectingComponent.prototype.bindEventsIn1Row = function( $row ){
    this.bindRowsEvents( $row );
};

SelectingComponent.prototype.bindEvents = function(){

    this.bindKeyboardEvents();   
    this.bindSelectAllHeader();
    this.bindRowsEvents( this.get$allTableRows() );
};

// Invert selection state of a single row
SelectingComponent.prototype.invertRowSelection = function ( $row ) {

    if ( $row.hasClass( 'zcrud-row-selected' ) ) {
        this._deselectRows( $row );

    } else {
        // Shift key?
        if ( this.shiftKeyDown ) {
            var $mappedArray = this.buildMappedArray( this.get$allTableRows() );
            var rowIndex = this.findRowIndex( $row, $mappedArray );

            // Try to select row and above rows until first selected row
            var beforeIndex = this.findFirstSelectedRowIndexBeforeIndex( rowIndex, $mappedArray ) + 1;
            if ( beforeIndex > 0 && beforeIndex < rowIndex ) {
                this._selectRows( 
                    this.build$Wrapped(
                        $mappedArray.slice( beforeIndex, rowIndex + 1 ) ) );
            } else {
                // Try to select row and below rows until first selected row
                var afterIndex = this.findFirstSelectedRowIndexAfterIndex( rowIndex, $mappedArray ) - 1;
                if ( afterIndex > rowIndex ) {
                    this._selectRows( 
                        this.build$Wrapped(
                            $mappedArray.slice( rowIndex, afterIndex + 1 ) ) );
                } else {
                    // Just select this row
                    this._selectRows( $row );
                }
            }
        } else {
            this._selectRows( $row );
        }
    }

    this.onSelectionChanged();
};

// Find index of a row in table.
SelectingComponent.prototype.findRowIndex = function ( $row, $tableRows ) {

    return pageUtils.findIndexInArray( $row, $tableRows, function ( $row1, $row2 ) {
        return $row1.html() === $row2.html();
    });
};

SelectingComponent.prototype.buildMappedArray = function( $tableRows ){

    return $tableRows.map( function( index, element ) {
        return $( this );
    }).get();
};

SelectingComponent.prototype.build$Wrapped = function( arrayOf$items ){

    var nodes = arrayOf$items.map( function ( x ){
        return x.el;
    });

    return $( nodes );
};

// Look for a selected row (that is before given row index) to up and returns it's index 
SelectingComponent.prototype.findFirstSelectedRowIndexBeforeIndex = function ( rowIndex, $tableRows ) {

    for ( var i = rowIndex - 1; i >= 0; --i ) {
        if ( $tableRows[i].hasClass( 'zcrud-row-selected' ) ) {
            return i;
        }
    }
    
    return -1;
};

// Look for a selected row (that is after given row index) to down and returns it's index 
SelectingComponent.prototype.findFirstSelectedRowIndexAfterIndex = function ( rowIndex, $tableRows ) {

    for ( var i = rowIndex + 1; i < $tableRows.length; ++i ) {
        if ( $tableRows[i].hasClass( 'zcrud-row-selected' ) ) {
            return i;
        }
    }
    return -1;
};

// Make row/rows 'selected'
SelectingComponent.prototype._selectRows = function ( $rows ) {

    if ( ! this.thisOptions.multiple ) {
        this._deselectRows( this.get$selectedRows() );
    }

    $rows.addClass( 'zcrud-row-selected' );

    if ( this.modeCheckBoxOn ) {
        $rows.find( '.zcrud-select-row' ).prop( 'checked', true );
    }

    this.refreshSelectAllCheckboxState();
};

// Make row/rows 'non selected'
SelectingComponent.prototype._deselectRows =  function ( $rows ) {

    $rows.removeClass( 'zcrud-row-selected' );
    if ( this.modeCheckBoxOn ) {
        $rows.find( '.zcrud-select-row' ).prop( 'checked', false );
    }

    this.refreshSelectAllCheckboxState();
};

// Update state of the 'select/deselect' all checkbox according to count of selected rows
SelectingComponent.prototype.refreshSelectAllCheckboxState = function () {

    if ( ! this.modeCheckBoxOn || ! this.thisOptions.multiple ) {
        return;
    }

    var totalRowCount = this.get$allTableRows().length;
    var selectedRowCount = this.get$selectedRows().length;

    if ( selectedRowCount == 0 ) {
        //this.get$selectAllCheckbox()[0].indeterminate = false;
        this.get$selectAllCheckbox().prop( 'indeterminate', false );
        //this.get$selectAllCheckbox().attr( 'checked', false );
        this.get$selectAllCheckbox().prop( 'checked', false );

    } else if ( selectedRowCount == totalRowCount ) {
        //this.get$selectAllCheckbox()[0].indeterminate = false;
        this.get$selectAllCheckbox().prop( 'indeterminate', false );
        //this.get$selectAllCheckbox().attr( 'checked', true );
        this.get$selectAllCheckbox().prop( 'checked', true );

    } else {
        //this.get$selectAllCheckbox()[0].indeterminate = true;
        this.get$selectAllCheckbox().prop( 'indeterminate', true );
        //this.get$selectAllCheckbox().attr( 'checked', false );
        this.get$selectAllCheckbox().prop( 'checked', false );
    }
};

SelectingComponent.prototype.deselectAll = function(){
    this.deselectRows( this.get$allTableRows() );
};

SelectingComponent.prototype.selectRows = function( $rows ){
    this._selectRows( $rows );
    this.onSelectionChanged(); //TODO: trigger only if selected rows changes?
};

SelectingComponent.prototype.deselectRows = function( $rows ){
    this._deselectRows( $rows );
    this.onSelectionChanged(); //TODO: trigger only if selected rows changes?
};

SelectingComponent.prototype.selectRecords = function( records ){
    this.selectionOperationOnRecords( records, this.selectRows );
};

SelectingComponent.prototype.deselectRecords = function( records ){
    this.selectionOperationOnRecords( records, this.deselectRows );
};

SelectingComponent.prototype.selectionOperationOnRecords = function( records, operationFunction ){

    if ( ! records ){
        return;
    }

    var selector = '';
    for ( var c = 0; c < records.length; ++c ){
        var record = records[ c ];
        if ( c > 0 ){
            selector += ', ';
        }
        var key = record[ this.options.key ];
        selector += '[data-record-key="' + key + '"]';
    }

    if ( selector ){
        operationFunction.call( this, this.get$allTableRows().filter( selector ) );
    }
};

// Get all selected rows
SelectingComponent.prototype.get$selectedRows = function(){
    return this.parent.get$().find( '.zcrud-row-selected:not(.zcrud-hide-marker)' );
};
SelectingComponent.prototype.getSelectedRows = SelectingComponent.prototype.get$selectedRows;

SelectingComponent.prototype.getSelectedRecords = function(){

    var result = [];
    var instance = this;
    
    var $selectedRows = this.get$selectedRows();
    $selectedRows.each( 
        function( index ) {
            var $row = $( this );

            // Get record
            var record;
            var key = $row.attr( 'data-record-key' );
            if ( key != undefined ){
                record = instance.parent.getRecordByKey( key, $row, true );
            } else {
                var recordId = $row.attr( 'data-record-id' );
                if ( recordId != undefined ){
                    record = instance.parent.getFromAddedRecords( recordId );
                } else {
                    throw 'No selected row!';
                }
            }

            result.push( record );
        }
    );

    return result;
};

SelectingComponent.prototype.onSelectionChanged = function () {

    this.options.events.selectionChanged({
        '$rows': this.get$selectedRows(),
        records: this.getSelectedRecords(),
        options: this.options
    });
};

SelectingComponent.prototype.resetPage = function(){

    this.get$selectAllCheckbox().prop( 'indeterminate', false )
        .attr( 'checked', false );
};

module.exports = SelectingComponent;

},{"../../../lib/zzDOM-closures-full.js":61,"../pages/pageUtils.js":54,"./component.js":20}],26:[function(_dereq_,module,exports){
/* 
    SortingComponent class
*/
'use strict';

//var context = require( '../context.js' );
var Component = _dereq_( './component.js' );
//var $ = require( 'zzdom' );
var zzDOM = _dereq_( '../../../lib/zzDOM-closures-full.js' );
var $ = zzDOM.zz;

var SortingComponent = function( optionsToApply, thisOptionsToApply, parentToApply ) {

    Component.call( this, optionsToApply, thisOptionsToApply, parentToApply );
    
    this.localStorage = localStorage;
    this.sortFieldId = this.thisOptions.default.fieldId;
    this.sortType = this.thisOptions.default.type;
    this.sortFieldIdLocalStorageId = 'sort-field-id';
    this.sortTypeLocalStorageId = 'sort-type';
    
    this.loadSettings();
};
Component.doSuperClassOf( SortingComponent );

SortingComponent.prototype.loadSettings = function(){

    if ( ! this.options.saveUserPreferences || ! this.thisOptions.loadFromLocalStorage ) {
        return;
    }

    var sortFieldIdLocalStorage = this.localStorage.getItem( this.sortFieldIdLocalStorageId );
    if ( sortFieldIdLocalStorage ) {
        this.sortFieldId = sortFieldIdLocalStorage;
    }

    var sortTypeLocalStorage = this.localStorage.getItem( this.sortTypeLocalStorageId );
    if ( sortTypeLocalStorage ) {
        this.sortType = sortTypeLocalStorage;
    }
};

SortingComponent.prototype.saveSettings = function() {

    if ( ! this.options.saveUserPreferences ) {
        return;
    }

    this.localStorage.setItem( this.sortFieldIdLocalStorageId, this.sortFieldId );
    this.localStorage.setItem( this.sortTypeLocalStorageId, this.sortType );
};

SortingComponent.prototype.bindEvents = function(){

    var instance = this;
    this.parent.get$()
        .find( '.zcrud-column-header-sortable' )
        .off() // Remove previous event handlers
        .on(
            'click',  
            function ( e ) {
                e.preventDefault();
                instance.changeSort( 
                    $( this ).attr( 'data-sort-field-id' ),
                    $( this ).attr( 'data-sort-type' ) );
            }
    );
};

SortingComponent.prototype.changeSort = function ( formFieldId, formType ) {

    var instance = this;
    this.processDirty(
        function(){
            instance.doChangeSort( formFieldId, formType );
        }
    );
};

SortingComponent.prototype.doChangeSort = function ( formFieldId, formType ) {

    // Update sortFieldId
    this.sortFieldId = formFieldId;

    // Update sortType
    if ( ! formType ){
        this.sortType = 'asc';
    } else {
        this.sortType = formType == 'asc'? 'desc': 'asc';
    }

    this.saveSettings();
    this.updateParent();
};

SortingComponent.prototype.updateParent = function(){

    if ( this.parent.type == 'subform' ){
        this.parent.update(
            [
                this.parent.get$().find( 'thead' )[0],
                this.parent.get$().find( 'tbody' )[0],
                this.parent.getPagingComponent().get$()[0]
            ]
        );
        return;
    }

    this.parent.show( 
        {
            root: [ $( '#' + this.parent.getThisOptions().tableId )[0] ] 
        }
    );
};

SortingComponent.prototype.addToDataToSend = function( dataToSend ){

    if ( this.sortFieldId ){
        dataToSend.sortFieldId = this.sortFieldId;
    }

    if ( this.sortType ){
        dataToSend.sortType = this.sortType;
    }
};

SortingComponent.prototype.getSortFieldId = function(){
    return this.sortFieldId;
};

SortingComponent.prototype.getSortType = function(){
    return this.sortType;
};

SortingComponent.prototype.getTypeForFieldId = function( fieldId ){
    return fieldId !== this.sortFieldId? null: this.sortType;
};

module.exports = SortingComponent;

},{"../../../lib/zzDOM-closures-full.js":61,"./component.js":20}],27:[function(_dereq_,module,exports){
/* 
    context singleton class
*/
'use strict';
    
var zpt = _dereq_( 'zpt' );
//var pageUtils = require( './pages/pageUtils.js' );

module.exports = (function() {
    
    //var zptParser = undefined;
    var subformSeparator = '-';
    
    // Cache
    var cache = {};
    var put = function ( id, data ){
        cache[ id ] = data;
    };
    var get = function ( id ){
        return cache[ id ];
    };
    
    // I18n
    var i18nArray = undefined;
    var setI18nArray = function( i18nArrayToApply ){
        i18nArray = i18nArrayToApply;
    };
    var translate = function( id, params, format, subformat ){
        return zpt.i18nHelper.tr( i18nArray, id, params, format || 'string', subformat );
    };
    var i18nExists = function( id ){ //TODO Reimplement this using i18n.exists
        var translated = translate( id );
        return translated !== 'I18n resource "' + id + '" not found!'
    };
    var translateAlternatives = function( ids, params, format, subformat ){
        for ( const id of ids ) {
            if ( i18nExists( id ) ){
                return zpt.i18nHelper.tr( i18nArray, id, params, format || 'string', subformat );
            }
        }
        return 'No i18n resource found: ' + ids;
    };

    // Errors
    var showError = function ( options, throwException, message, mustTranslate, params, format, subformat ) {
        var translated = 
            mustTranslate? 
            translate( message, params, format, subformat ): 
            message;
        options.errorFunction( translated );
        if ( throwException ){
            throw translated;
        }
    };
    var confirm = function ( options, confirmOptions, onFulfilled ) {
        options.confirmFunction( confirmOptions, onFulfilled );
    };
    var showMessage = function ( options, messageOptions ) {
        options.showMessageFunction( messageOptions );
    };
    
    // Form validation language
    /*
    var getFormValidationLanguage = function( lang ){
    
        var cacheId = lang + '-formValidationLanguage';
        var language = get( cacheId );
        if ( ! language ){
            language = {
                errorTitle: translate( 'errorTitle' ),
                requiredFields: translate( 'requiredFields' ),
                badTime: translate( 'badTime' ),
                badEmail: translate( 'badEmail' ),
                badTelephone: translate( 'badTelephone' ),
                badSecurityAnswer: translate( 'badSecurityAnswer' ),
                badDate: translate( 'badDate' ),
                lengthBadStart: translate( 'lengthBadStart' ),
                lengthBadEnd: translate( 'lengthBadEnd' ),
                lengthTooLongStart: translate( 'lengthTooLongStart' ),
                lengthTooShortStart: translate( 'lengthTooShortStart' ),
                notConfirmed: translate( 'notConfirmed' ),
                badDomain: translate( 'badDomain' ),
                badUrl: translate( 'badUrl' ),
                badCustomVal: translate( 'badCustomVal' ),
                andSpaces: translate( 'andSpaces' ),
                badInt: translate( 'badInt' ),
                badSecurityNumber: translate( 'badSecurityNumber' ),
                badUKVatAnswer: translate( 'badUKVatAnswer' ),
                badStrength: translate( 'badStrength' ),
                badNumberOfSelectedOptionsStart: translate( 'badNumberOfSelectedOptionsStart' ),
                badNumberOfSelectedOptionsEnd: translate( 'badNumberOfSelectedOptionsEnd' ),
                badAlphaNumeric: translate( 'badAlphaNumeric' ),
                badAlphaNumericExtra: translate( 'badAlphaNumericExtra' ),
                wrongFileSize: translate( 'wrongFileSize' ),
                wrongFileType: translate( 'wrongFileType' ),
                groupCheckedRangeStart: translate( 'groupCheckedRangeStart' ),
                groupCheckedTooFewStart: translate( 'groupCheckedTooFewStart' ),
                groupCheckedTooManyStart: translate( 'groupCheckedTooManyStart' ),
                groupCheckedEnd: translate( 'groupCheckedEnd' ),
                badCreditCard: translate( 'badCreditCard' ),
                badCVV: translate( 'badCVV' ),
                wrongFileDim : translate( 'wrongFileDim' ),
                imageTooTall : translate( 'imageTooTall' ),
                imageTooWide : translate( 'imageTooWide' ),                                                                                     imageTooSmall : translate( 'imageTooSmall' ),
                min : translate( 'min' ),
                max : translate( 'max' ),
                imageRatioNotAccepted : translate( 'imageRatioNotAccepted' )
            };
            put( cacheId, language );
        }
        
        return language;
    };
    */

    // Options
    var putOptions = function( $item, options ){
        put( 'options_' + getSelectorString( $item ), options );
    };
    var getOptions = function( $item ){
        return get( 'options_' + getSelectorString( $item ) );
    };
    /*
    var putOptions = function( id, options ){
        put( 'options_' + id, options );
    };
    var getOptions = function( id ){
        return get( 'options_' + id );
    };*/
    
    // Pages
    var putPage = function( id, page ){
        put( 'page_' + id, page );
    };
    var getPage = function( id ){
        return get( 'page_' + id );
    };

    var getSelectorString = function( $item ){
        
        var selector = (typeof($item.attr('id')) !== 'undefined' || $item.attr('id') !== null) ? '#' + $item.attr('id') :  '.' + $item.attr('class');
        return selector;
    };
    
    var getListPage = function( listPageIdSource ){
        
        try {
            var listPageId = typeof listPageIdSource === 'object'? listPageIdSource.pageConf.pages.list.id: listPageIdSource;
        } catch ( e ) {
            alert( 'Exception trying to get options.pageConf.pages.list.id!' );
            return false;
        }
        
        return getPage( listPageId );
    };    
    
    var getFormPage = function( formPageIdSource ){

        try {
            var formPageId = typeof formPageIdSource === 'object'? formPageIdSource.formId: formPageIdSource;
        } catch ( e ) {
            alert( 'Exception trying to get options.pageConf.pages.list.id!' );
            return false;
        }

        return getPage( formPageId );
    }; 
    
    // Add to declaredRemotePageUrls all non repeated urls
    var declareRemotePageUrl = function( template, declaredRemotePageUrls ){

        if ( ! template ){
            return;
        }

        var index = template.indexOf( '@' );
        if ( index != -1 ){
            var url = template.substring( 1 + index );
            if ( declaredRemotePageUrls.indexOf( url ) == -1 ){
                declaredRemotePageUrls.push( url );
            }
        }
    };
    
    // ZPT
    /*
    var getZPTParser = function(){
        return zptParser;
    };
    var setZPTParser = function( zptParserToApply ){
        zptParser = zptParserToApply;
    };
    */
    
    // Update visible fields (for testing purposes)
    var updateFormVisibleFields = function( options, fieldIdList ){
        options.pageConf.pages.create.fields = fieldIdList;
        options.pageConf.pages.update.fields = fieldIdList;
        options.pageConf.pages.delete.fields = fieldIdList;
    };
    var updateListVisibleFields = function( options, fieldIdList ){
        options.pageConf.pages.list.fields = fieldIdList;
    };
    var updateSubformFields = function( subformField, fieldIdList ){
        
        var fields = subformField.fields;
        var temp = {};
        for ( var c = 0; c < fieldIdList.length; ++c ){
            var id = fieldIdList[ c ];
            temp[ id ] = fields[ id ];
        }  
        subformField.fields = temp;
    };
    
    // Fields
    var getField = function( fields, fullName ){

        var fieldData = getFieldData( fullName );
        return fieldData.subformName? fields[ fieldData.subformName ].fields[ fieldData.name ]: fields[ fieldData.name ];
    };
    var getFieldData = function( fullName ){

        var subformSeparatorIndex = fullName.indexOf( subformSeparator );
        return {
            subformName: subformSeparatorIndex === -1? null: fullName.substring( 0, subformSeparatorIndex ),
            name: subformSeparatorIndex === -1? fullName: fullName.substring( 1 + subformSeparatorIndex )
        };
    };
    
    // JSONBuilder
    var getJSONBuilder = function( options ){
        return options.jsonBuilder;
    };

    // Field builder
    var fieldBuilder = undefined;
    var setFieldBuilder = function( fieldBuildertoApply ){
        fieldBuilder = fieldBuildertoApply;
    };
    var getFieldBuilder = function(){
        return fieldBuilder;
    };
    
    // History
    var history = undefined;
    var setHistory = function( historytoApply ){
        history = historytoApply;
    };
    var getHistory = function(){
        return history;
    };
    
    // Subforms
    var buildSubformsRecordsIdFromFieldId = function( options, subformsRecordsId ){
        return subformsRecordsId + options.subformsRecordsSuffix;
    };
    var buildFieldIdFromSubformsRecordsId = function( options, subformsRecordsId ){
        return removeChars( subformsRecordsId, options.subformsRecordsSuffix );
    };
    var removeChars = function( string, toRemove ){
        return string.replace( toRemove, '' );
    };
    
    // Dictionary
    var dictionary;
    var setDictionary = function( _dictionary ){
        dictionary = _dictionary;
    };
    var getDictionary = function(){
        return dictionary;
    };
    
    return {
        put: put,
        get: get,
        setI18nArray: setI18nArray,
        translate: translate,
        translateAlternatives: translateAlternatives,
        showError: showError,
        confirm: confirm,
        showMessage: showMessage,
        //getFormValidationLanguage: getFormValidationLanguage,
        putOptions: putOptions,
        getOptions: getOptions,
        putPage: putPage,
        getPage: getPage,
        getSelectorString: getSelectorString,
        getListPage: getListPage,
        getFormPage: getFormPage,
        declareRemotePageUrl: declareRemotePageUrl,
        //getZPTParser: getZPTParser,
        //setZPTParser: setZPTParser,
        updateFormVisibleFields: updateFormVisibleFields,
        updateListVisibleFields: updateListVisibleFields,
        updateSubformFields: updateSubformFields,
        getField: getField,
        getFieldData: getFieldData,
        subformSeparator: subformSeparator,
        getJSONBuilder: getJSONBuilder,
        setFieldBuilder: setFieldBuilder,
        getFieldBuilder: getFieldBuilder,
        setHistory: setHistory,
        getHistory: getHistory,
        buildSubformsRecordsIdFromFieldId: buildSubformsRecordsIdFromFieldId,
        buildFieldIdFromSubformsRecordsId: buildFieldIdFromSubformsRecordsId,
        setDictionary: setDictionary,
        getDictionary: getDictionary
    };
})();

},{"zpt":135}],28:[function(_dereq_,module,exports){
/* 
    crudManager singleton class
*/
'use strict';

var context = _dereq_( './context.js' );
var validationManager = _dereq_( './validationManager.js' );
var pageUtils = _dereq_( './pages/pageUtils.js' );
var utils = _dereq_( './utils.js' );

module.exports = (function() {
    
    var generalSuccessFunction = function( data, options, dataFromServer ){
        
        try {
            if ( dataFromServer.result != 'OK' ) {
                pageUtils.serverSideError( dataFromServer, options, context );
                return;
            }

            if ( ! data.ajaxPostFilterOff ) {
                dataFromServer = options.ajax.ajaxPostFilter( dataFromServer );
            }

            if ( data.success ){
                data.success( dataFromServer );
            }
            
        } catch ( e ) {
            context.showError( 
                options, 
                false, 
                'Error in crudManager: ' + ( e.message || e )
            );
        }
    };
    
    var generalErrorFunction = function( data, options, dataFromServer ){
        
        if ( ! data.ajaxPostFilterOff ) {
            dataFromServer = options.ajax.ajaxPostFilter( dataFromServer );
        }
        if ( data.error ){
            data.error( dataFromServer );
        }
    };
    
    var authIsOK = function( data, options, eventData ){
        
        return data.formValidationOff? 
            true: 
            validationManager.formIsValid( options, eventData );
    };
    
    /* 
    data format:
        - ajaxPreFilterOff: a function that makes a before sending data filtering
        - ajaxPostFilterOff: a function that makes an after receiving data filtering
        - clientOnly: if true the command is not send to the server
        - error: a function executed whenever there is some error
        - success: a function executed whenever the operation is OK
        - url: an url that overwrite the default one
        
        - search: the data to send to the server
            - filter: an array of expressions to filter records
            - records: use this records. Use clientOnly = true to use these values
            - sortFieldId: the field id to sort records
            - sortType: the type of sort
            - pageNumber: the page number to retrive
            - pageSize: the number of records per page
            - search: the data to send to the server
    */
    var listRecords = function( data, options ){
        
        var dataToSend = data.search;
        dataToSend.command = 'listRecords';
        
        var successFunction = function( dataFromServer ){
            generalSuccessFunction( data, options, dataFromServer );
        };

        var errorFunction = function( dataFromServer ){
            generalErrorFunction( data, options, dataFromServer );
        };
        
        if ( data.clientOnly ){
            successFunction(
                data.ajaxPreFilterOff? data.records: options.ajax.ajaxPreFilter( data.records ) );
            return;
        }
        
        var thisOptions = {
            url    : data.url,
            data   : data.ajaxPreFilterOff? dataToSend: options.ajax.ajaxPreFilter( dataToSend ),
            success: successFunction,
            error  : errorFunction
        };
        
        options.ajax.ajaxFunction( thisOptions );
        /*
        options.ajax.ajaxFunction(
            utils.extend( {}, options.ajax.defaultFormAjaxOptions, thisOptions )
        );
        */
    };
    
    /* 
    data format:
        - ajaxPreFilterOff: a function that makes a before sending data filtering
        - ajaxPostFilterOff: a function that makes an after receiving data filtering
        - clientOnly: if true the command is not send to the server
        - error: a function executed whenever there is some error
        - success: a function executed whenever the operation is OK
        - url: the url to retrieve data from server
        - componentValidation:
        
        - existingRecords: the list of modified records
        - newRecords: the list of new records
        - recordsToRemove: the list of the ids of the records to remove
    */
    var batchUpdate = function( data, options, eventData ){
        
        var dataToSend = data;
        dataToSend.command = 'batchUpdate';

        var successFunction = function( dataFromServer ){
            generalSuccessFunction( data, options, dataFromServer );
        };

        var errorFunction = function( dataFromServer ){
            generalErrorFunction( data, options, dataFromServer );
        };

        var validationData = authIsOK( data, options, eventData );
        
        if ( data.clientOnly ){
            if ( validationData === true ){
                dataToSend.result = 'OK';
                successFunction(
                    data.ajaxPreFilterOff? dataToSend: options.ajax.ajaxPreFilter( dataToSend ) );
            } else {
                errorFunction(
                    data.ajaxPreFilterOff? dataToSend: options.ajax.ajaxPreFilter( dataToSend ) );
            }
            return;
        }

        var thisOptions = {
            url    : data.url,
            data   : data.ajaxPreFilterOff? dataToSend: options.ajax.ajaxPreFilter( dataToSend ),
            success: successFunction,
            error  : errorFunction
        };

        if ( validationData === true ){
            options.ajax.ajaxFunction( thisOptions );
            /*
            options.ajax.ajaxFunction(
                utils.extend( false, {}, options.ajax.defaultFormAjaxOptions, thisOptions ) 
            );
            */
        } else {
            // Do not show any error message if browser messages must be shown, it dos not work properly (browser messages are not shown)
            if ( ! options.validation.showBrowserMessageBubbles ){

                // Show custom or default error message
                var message, translate;
                if ( validationData.message ){
                    message = validationData.message;
                    translate = validationData.translate;
                } else {
                    message = 'invalidFormData';
                    translate = true;
                }
                context.showError( options, false, message, translate );
            }
        }
    };
    
    /* 
    data format:
        - ajaxPreFilterOff: a function that makes a before sending data filtering
        - ajaxPostFilterOff: a function that makes an after receiving data filtering
        - error: a function executed whenever there is some error
        - success: a function executed whenever the operation is OK
        - url: the url to retrieve data from server
        
        - search: the data to send to the server
            - key: the key of the record to retrieve
            - fieldsConf: an object with configuration of fields (use the id of the field as key)
                - [ id of field ]
                    - filter: an array of expressions to filter records
                    - sortFieldId: the field id to sort records
                    - sortType: the type of sort
                    - pageNumber: the page number to retrive
                    - pageSize: the number of records per page
        
    */
    var getRecord = function( data, options ){

        if ( ! data.url ){
            context.showError( options, false, 'Please, set URL to get record from server!' );
            return;
        }
        
        var dataToSend = data.search;
        dataToSend.command = 'getRecord';
        
        var successFunction = function( dataFromServer ){
            generalSuccessFunction( data, options, dataFromServer );
        };

        var errorFunction = function( dataFromServer ){
            generalErrorFunction( data, options, dataFromServer );
        };

        var thisOptions = {
            url    : data.url,
            data   : data.ajaxPreFilterOff? dataToSend: options.ajax.ajaxPreFilter( dataToSend ),
            success: successFunction,
            error  : errorFunction
        };

        options.ajax.ajaxFunction( thisOptions );
        /*
        options.ajax.ajaxFunction(
            utils.extend( false, {}, options.ajax.defaultFormAjaxOptions, thisOptions )
        );
        */
    };

    var getOptions = function ( fieldId, url, options, callback ) {

        //var result = [];

        var thisOptions = {
            url    : url,
            //async  : false,
            success: function ( data ) {
                data = options.ajax.ajaxPostFilter( data );
                if ( data.result != 'OK' ) {
                    throw 'Error downloading options:' + data.message;
                }

                //result = data.options;
                callback( data.options );
            },
            error  : function () {
                throw 'Can not load options for ' + fieldId;
            }
        };

        options.ajax.ajaxFunction( thisOptions );
        /*
        options.ajax.ajaxFunction(
            utils.extend( false, {}, options.ajax.defaultFormAjaxOptions, thisOptions )
        );
        */

        //return result;
    };
    
    return {
        listRecords: listRecords,
        batchUpdate: batchUpdate,
        getRecord: getRecord,
        getOptions: getOptions
    };
})();

},{"./context.js":27,"./pages/pageUtils.js":54,"./utils.js":57,"./validationManager.js":58}],29:[function(_dereq_,module,exports){
'use strict';

var utils = _dereq_( './utils.js' );
var requestHelper = _dereq_( './requestHelper.js' );
const context = _dereq_( './context.js' );

module.exports = {

    validation: {
        showBrowserMessageBubbles: false,
        useBrowserMessages: false,
    },

    dictionary: {},

    saveUserPreferences: true,
    entityId: 'entity',
    
    defaultComponentsConfig: {
        paging: {
            isOn: false,
            constructorClass: _dereq_( './components/pagingComponent.js' ),
            defaultPageSize: 10,
            pageSizes: [10, 25, 50, 100, 250, 500],
            pageSizeChangeArea: true,
            gotoPageFieldType: 'combobox', // possible values: 'textbox', 'combobox', 'none'
            gotoPageFieldAttributes: {},
            maxNumberOfAllShownPages: 5,
            block1NumberOfPages: 1,
            block2NumberOfPages: 5,
            block3NumberOfPages: 1
        },
        sorting: {
            isOn: false,
            constructorClass: _dereq_( './components/sortingComponent.js' ),
            loadFromLocalStorage: true,
            default: {
                fieldId: undefined,
                type: undefined
            },
            allowUser: false
        },
        filtering: {
            isOn: false,
            constructorClass: _dereq_( './components/filteringComponent.js' ),
            fieldsTemplate: 'compact-editable@templates/fieldLists.html'
        },
        selecting: {
            isOn: false,
            constructorClass: _dereq_( './components/selectingComponent.js' ),
            multiple: true,
            mode: [ 'checkbox', 'onRowClick' ] // possible values: 'checkbox' and 'onRowClick'
        },
        editing: {
            isOn: false,
            constructorClass: _dereq_( './components/editingComponent.js' ),
            modifiedFieldsClass: 'zcrud-modified-field',
            modifiedRowsClass: 'zcrud-modified-row',
            hideTr: function( $tr ){
                $tr.fadeOut();
            },
            showTr: function( $tr ){
                $tr.fadeIn();
            },
            confirm: {
                save: true
            }
        }
    },
    
    fields: {},
    fieldsConfig: {
        constructors: {
            default: _dereq_( './fields/field.js' ),
            mapping: [
                {
                    fieldTypes: [ 'date', 'datetime', 'time' ],
                    constructor: _dereq_( './fields/datetime.js' )
                },
                {
                    fieldTypes: [ 'datalist', 'select', 'radio', 'checkboxes' ],
                    constructor: _dereq_( './fields/optionsField.js' )
                },
                {
                    fieldTypes: [ 'checkbox' ],
                    constructor: _dereq_( './fields/checkbox.js' )
                },
                {
                    fieldTypes: [ 'subform' ],
                    constructor: _dereq_( './fields/subform.js' )
                }
            ]
        },
        defaultFieldOptions: {
            datetime: {
                inline: false,
                minYear: 1950,
                maxYear: 2050,
                maxHour: 23,
                minutesStep: 5,
                timerDelay: 100
            },
            date: {
                inline: false,
                minYear: 1950,
                maxYear: 2050
            },
            time: {
                inline: false,
                maxHour: 99,
                minutesStep: 5,
                timerDelay: 100
            },
            subform: {
                buttons: {
                    toolbar: [ 'subform_addNewRow' ],
                    byRow: [ 'subform_deleteRow' ]  
                },
                components: {}
            },
            textarea: {
                attributes: {
                    field: {
                        rows: 6,
                        cols: 80
                    }
                }
            },
            number: {
                templateMacro: 'text'
            }
        },
        getDefaultFieldTemplate: function( field ){
            return ( field.templateMacro || field.type ) + '@templates/fields/basic.html';
        }
    },

    containers: {
        types: {
            'fieldSet': {
                template: 'fieldSet@templates/containers/basic.html'
            },
            'div': {
                template: 'div@templates/containers/basic.html'
            },
            'custom': {}
        }
    },
    
    events: {
        formClosed: function ( data, event ) {},
        formCreated: function ( data ) {},
        formSubmitting: function ( data, event ) {},
        recordAdded: function ( data, event ) {},
        recordDeleted: function ( data, event ) {},
        recordUpdated: function ( data, event ) {},
        formBatchUpdated: function ( data, event ) {},
        selectionChanged: function ( data ) {},
        listCreated: function ( data ) {}
    },

    buttons: {
        generic: _dereq_( './buttons/genericButton.js' ),
        undo: _dereq_( './buttons/undoButton.js' ),
        redo: _dereq_( './buttons/redoButton.js' ),

        form_cancel: _dereq_( './buttons/formPage/cancelButton.js' ),
        form_copySubformRows: _dereq_( './buttons/formPage/copySubformRowsButton.js' ),
        form_submit: _dereq_( './buttons/formPage/submitButton.js' ),
        
        list_addNewRow: _dereq_( './buttons/listPage/addNewRowButton.js' ),
        list_deleteRow: _dereq_( './buttons/listPage/deleteRowButton.js' ),
        list_showCreateForm: _dereq_( './buttons/listPage/showCreateFormButton.js' ),
        list_showDeleteForm: _dereq_( './buttons/listPage/showDeleteFormButton.js' ),
        list_showEditForm: _dereq_( './buttons/listPage/showEditFormButton.js' ),
        list_submit: _dereq_( './buttons/listPage/submitButton.js' ),
        
        subform_addNewRow: _dereq_( './buttons/subform/addNewRowButton.js' ),
        subform_deleteRow: _dereq_( './buttons/subform/deleteRowButton.js' ),
        subform_showCreateForm: _dereq_( './buttons/subform/showCreateFormButton.js' ),
        subform_showDeleteForm: _dereq_( './buttons/subform/showDeleteFormButton.js' ),
        subform_showEditForm: _dereq_( './buttons/subform/showEditFormButton.js' )
    },
    
    pageConf: {
        defaultPageConf: {
            showStatus: false,
            modifiedFieldsClass: 'zcrud-modified-field',
            modifiedRowsClass: 'zcrud-modified-row',
            hideTr: function( $tr ){
                $tr.fadeOut();
            },
            showTr: function( $tr ){
                $tr.fadeIn();
            },
            buttons: {
                byRow: []
            },
            confirm: {
                save: true,
                cancel: true
            }
        },
        pages: {
            list: {
                template: 'listDefaultTemplate@templates/lists.html',
                showStatus: true,
                components: {
                    paging: {
                        isOn: true
                    }
                },
                buttons: {
                    toolbar: [ 'list_showCreateForm' ],
                    byRow: [ 'list_showEditForm', 'list_showDeleteForm' ]
                }
            }, 
            create: {
                template: 'formDefaultTemplate@templates/forms.html',
                components: {},
                buttons: {
                    toolbar: [ 'undo', 'redo', 'form_cancel', 'form_submit' ]
                }
            }, 
            update: {
                template: 'formDefaultTemplate@templates/forms.html',
                components: {},
                buttons: {
                    toolbar: [ 'undo', 'redo', 'form_cancel', 'form_submit' ]
                }
            }, 
            delete: {
                template: 'deleteDefaultTemplate@templates/forms.html',
                components: {},
                buttons: {
                    toolbar: [ 'form_cancel', 'form_submit' ]
                }
            },
            customForm: {
                template: 'formDefaultTemplate@templates/forms.html',
                showStatus: true,
                components: {
                    paging: {
                        isOn: true
                    }
                },
                buttons: {
                    toolbar: [ 'list_showCreateForm' ],
                    byRow: [ 'list_showEditForm', 'list_showDeleteForm' ]
                }
            }
        }
    },
    
    filesPathPrefix: '',
    
    templates: {
        filesPath: '/',
        declaredRemotePageUrls: [ 'templates/lists.html', 'templates/fieldLists.html' ]
    },

    ajax: {
        ajaxFunction: requestHelper.fetch,
        //defaultFormAjaxOptions: {
        //    dataType   : 'json',
        //    contentType: 'application/json; charset=UTF-8',
        //    type       : 'POST'
        //},
        ajaxPreFilter: function( data ){
            return data;
        },
        ajaxPostFilter : function( data ){
            return data;
        }
    },

    i18n: {
        language: 'en',
        filesPath: '/i18n/',
        files: { 
            en: [ 'en-common.json' ],
            es: [ 'es-common.json' ] 
        }
    },

    logging: {
        isOn: false,
        level: 'error'
    },

    jsonBuilder: _dereq_( './jsonBuilders/onlyChangesJSONBuilder.js' ),
    
    defaultErrorOptions: {
        icon: 'error',
        closeOnClickOutside: false,
        i18nTitle: 'errorTitle'
    },
    errorFunction: function( message ){
        var swal = _dereq_( 'sweetalert' );
        var thisOptions = utils.extend( true, {}, this.defaultErrorOptions );
        if ( ! thisOptions.title ){
            thisOptions.title = context.translate( this.defaultErrorOptions.i18nTitle );
        }
        thisOptions.text = message;
        swal( thisOptions );
    },
    
    defaultConfirmOptions: {
        icon: 'warning',
        dangerMode: true,
        closeOnClickOutside: false,
        className: 'confirm'
    },
    confirmFunction: function( confirmOptions, onFulfilled ){
        var swal = _dereq_( 'sweetalert' );
        var thisOptions = utils.extend( true, {}, this.defaultConfirmOptions, confirmOptions );
        swal( thisOptions ).then( onFulfilled );
    },
    
    defaultShowMessageOptions: {
        icon: 'info',
        closeOnClickOutside: false,
        className: 'showMessage'
    },
    showMessageFunction: function( messageOptions ){
        var swal = _dereq_( 'sweetalert' );
        var thisOptions = utils.extend( true, {}, this.defaultShowMessageOptions, messageOptions );
        swal( thisOptions );
    },
    
    subformsRecordsSuffix: 'ZCrudRecords'
};
},{"./buttons/formPage/cancelButton.js":3,"./buttons/formPage/copySubformRowsButton.js":4,"./buttons/formPage/submitButton.js":5,"./buttons/genericButton.js":6,"./buttons/listPage/addNewRowButton.js":7,"./buttons/listPage/deleteRowButton.js":8,"./buttons/listPage/showCreateFormButton.js":9,"./buttons/listPage/showDeleteFormButton.js":10,"./buttons/listPage/showEditFormButton.js":11,"./buttons/listPage/submitButton.js":12,"./buttons/redoButton.js":13,"./buttons/subform/addNewRowButton.js":14,"./buttons/subform/deleteRowButton.js":15,"./buttons/subform/showCreateFormButton.js":16,"./buttons/subform/showDeleteFormButton.js":17,"./buttons/subform/showEditFormButton.js":18,"./buttons/undoButton.js":19,"./components/editingComponent.js":22,"./components/filteringComponent.js":23,"./components/pagingComponent.js":24,"./components/selectingComponent.js":25,"./components/sortingComponent.js":26,"./context.js":27,"./fields/checkbox.js":30,"./fields/datetime.js":32,"./fields/field.js":33,"./fields/optionsField.js":38,"./fields/subform.js":39,"./jsonBuilders/onlyChangesJSONBuilder.js":48,"./requestHelper.js":55,"./utils.js":57,"sweetalert":66}],30:[function(_dereq_,module,exports){
/*
    Checkbox class
*/
'use strict';

var Field = _dereq_( './field.js' );
var context = _dereq_( '../context.js' );

var Checkbox = function( properties ) {
    Field.call( this, properties );
};

Checkbox.prototype = new Field();
Checkbox.prototype.constructor = Checkbox;

Checkbox.prototype.getValue = function( $this ){
    return $this.checked();
    //return $this.is( ':checked' );
};

Checkbox.prototype.getValueFromForm = function( $selection ){
    return $selection.find( '[name="' + this.name + '"]').checked();
    //return $selection.find( '[name='' + this.name + '']' ).is( ':checked' );
}

Checkbox.prototype.setValueToForm = function( value, $this ){
    $this.prop( 'checked', value === undefined? false: value );
    this.throwEventsForSetValueToForm( $this );
};

Checkbox.prototype.getValueFromRecord = function( record ){

    var value = record[ this.id ];
    return value === false || value === true? value: value == 'true';
};

Checkbox.prototype.getViewValueFromRecord = function( record ){

    var value = this.getValueFromRecord( record );
    return value? context.translate( 'true' ): context.translate( 'false' )
};

Checkbox.prototype.getValueFromSelection = function( $selection ){
    
    var stringValue = Field.prototype.getValueFromSelection.call( this, $selection ).toLowerCase();
    return stringValue == 'true';
};

module.exports = Checkbox;
},{"../context.js":27,"./field.js":33}],31:[function(_dereq_,module,exports){
/* 
    Container class
*/
'use strict';

var buttonUtils = _dereq_( '../buttons/buttonUtils.js' );
var utils = _dereq_( '../utils.js' );

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
            this.options );
        
        // Set the container of all buttons
        for ( var i = 0; i < this.toolbarButtons.length; ++i ){
            this.toolbarButtons[ i ].setContainer( this );
        }
    }

    return this.toolbarButtons;
};

module.exports = Container;

},{"../buttons/buttonUtils.js":2,"../utils.js":57}],32:[function(_dereq_,module,exports){
/*
    Datetime class
*/
'use strict';

var Field = _dereq_( './field.js' );
var context = _dereq_( '../context.js' );
//var $ = require( 'zzdom' );
var zzDOM = _dereq_( '../../../lib/zzDOM-closures-full.js' );
var $ = zzDOM.zz;
var zpt = _dereq_( 'zpt' );
var DateFormatter = _dereq_( '../../../lib/php-date-formatter.js' );
var utils = _dereq_( '../utils.js' );

var Datetime = function( properties ) {
    Field.call( this, properties );
    
    this.dictionary = undefined;
    this.currentTimer = undefined;
};

Datetime.prototype = new Field();
Datetime.prototype.constructor = Datetime;

Datetime.prototype.selectedDateClass = 'current';
Datetime.prototype.pickerValueAttr = 'data-picker-value';
Datetime.prototype.weekDays = [ 
    'Sun', 
    'Mon', 
    'Tue', 
    'Wed', 
    'Thu', 
    'Fri', 
    'Sat'
];
Datetime.prototype.monthNames = [ 
    'January' , 
    'February', 
    'March', 
    'April', 
    'May', 
    'June', 
    'July', 
    'August', 
    'September', 
    'October', 
    'November', 
    'December' 
];
Datetime.prototype.weekInitDone = false;
Datetime.prototype.dateFormatter = new DateFormatter();

Datetime.prototype.filterValue = function( record ){
    return this.getValueFromString( record[ this.id ]);
};

Datetime.prototype.setValueToForm = function( value, $this ){
    
    switch( this.type ) {
        case 'datetime':
            var manageTime = true;
        case 'date':
            this.setValueToFormForDatetime( value, $this, manageTime );
            this.throwEventsForSetValueToForm( $this );
            return;
        case 'time':
            this.setValueToFormForTime( value, $this );
            this.throwEventsForSetValueToForm( $this );
            return;
    }

    throw 'Unknown type in Datetime: ' + this.type;
};

Datetime.prototype.setValueToFormForTime = function( _value, $this ){

    // Set value to null instead of undefined so zzDOM sets the value properly
    const value = _value === undefined? null: _value;

    $this
        .val( value )
        .attr( this.pickerValueAttr, value );

    if ( this.inline ){
        var $datetime = this.get$datetime( 
            $this.parents( '.zcrud-data-entity' ).first() );
        var timeObject = this.buildTimeObjectFromString( value );
        this.updateTime( $datetime, timeObject );
    }
};

Datetime.prototype.setValueToFormForDatetime = function( value, $this, manageTime ){
    
    var formattedValue = this.formatToClient( value );
    $this
        .val( formattedValue || value )  // Use string value if formattedValue is not a valid date
        .attr( this.pickerValueAttr, formattedValue );

    if ( this.inline ){
        var $datetime = this.get$datetime( $this.parents( '.zcrud-data-entity' ).first() );

        // Update dictionary
        this.dictionary.field = this;
        this.dictionary.value = value;

        this.goToDate( 
            value,
            $datetime, 
            this.dictionary
        );

        if ( manageTime ){
            var timeObject = this.buildTimeObjectFromHoursAndMinutes( 
                value? value.getHours(): 0, 
                value? value.getMinutes(): 0 );
            this.updateTime( $datetime, timeObject );
        }
    }
};

Datetime.prototype.updateTime = function( $datetime, timeObject ){
    
    var $timePicker = this.get$timePicker( $datetime );
    this.get$hoursByTimePicker( $timePicker ).text( 
        timeObject.hoursToShow );
    this.get$minutesByTimePicker( $timePicker ).text( 
        timeObject.minutesToShow );
};

Datetime.prototype.parseDate = function( datetimeString ){

    try {
        return this.dateFormatter.parseDate( datetimeString, this.getI18nFormat() );

    } catch ( error ) {
        return null;
    }
};

Datetime.prototype.getValueFromString = function( stringValue ){
    
    switch( this.type ) {
        case 'date':
        case 'datetime':
            return stringValue? this.parseDate( stringValue ): undefined;
        case 'time':
            return stringValue;
    }

    throw 'Unknown type in Datetime: ' + this.type;
};

Datetime.prototype.getValue = function( $this ){
    return this.getValueFromString( $this.val() );
};

Datetime.prototype.getValueForHistory = function( $this ){
    const value = this.getValue( $this );
    return value? value: $this.val();
};

Datetime.prototype.afterProcessTemplateForField = function( params, $selection ){
    
    if ( this.isReadOnly() ){
        return;
    }
    
    this.afterProcessTemplateForFieldInCreateOrUpdate( params, $selection );
};

Datetime.prototype.afterProcessTemplateForFieldInCreateOrUpdate = function( params, $selection ){
    
    var date = false;
    var time = false;

    switch ( this.type ) {
        case 'date':
            date = true;
            break;
        case 'datetime':
            date = true;
            time = true;
            break;
        case 'time':
            time = true;
            break;
        default:
            throw 'Unknown type in Datetime: ' + this.type;
    }

    this.buildDictionaryFromParams( params );
    this.bindEvents( params, $selection, date, time );
};

Datetime.prototype.getTemplate = function(){
    return this.type + '@templates/fields/datetime.html';
};

Datetime.prototype.getI18nFormat = function(){
    
    var formatI18nId = this.type + 'Format';
    return context.translate( formatI18nId );
};
/*
Datetime.prototype.getI18nPattern = function(){
    
    var patternI18nId = this.type + 'Pattern';
    return context.translate( patternI18nId );
};
*/
Datetime.prototype.getValueFromForm = function( $selection ){
    
    return this.inline? 
           this.getValueFromFormForInline( $selection ): 
           this.getValueFromFormForNotInline( $selection );
};

Datetime.prototype.getValueFromFormForNotInline = function( $selection ){
    
    var datetimeString = $selection.find( '[name="' + this.name + '"]' ).val();

    if ( ! datetimeString || datetimeString.length == 0 || this.type == 'time' ){
        return datetimeString;
    }

    return this.parseDate( datetimeString );
};

Datetime.prototype.getValueFromFormForInline = function( $selection ){
    
    return this.buildDatetimeInstance( 
                this.get$datetime( $selection ) );
};

Datetime.prototype.getValueFromRecord = function( record ){

    var value = record[ this.id ];
    if ( ! value || value.length == 0 ){
        return value;
    }

    switch( this.type ) {
        case 'date':
        case 'datetime':
            return new Date( value );
        case 'time':
            return value;
    }

    throw 'Unknown type in Datetime: ' + this.type;
};

Datetime.prototype.getViewValueFromRecord = function( record ){

    var value = record[ this.id ];
    if ( ! value || value.length == 0 ){
        return value;
    }

    switch( this.type ) {
        case 'date':
        case 'datetime':
            var dateInstance = new Date( value );
            return this.formatToClient( dateInstance );
        case 'time':
            return value;
    }

    throw 'Unknown type in Datetime: ' + this.type;
};

Datetime.prototype.getTimeInfo = function(  timeString ){
    return this.buildTimeObjectFromString( timeString );
};

Datetime.prototype.buildTimeObjectFromString = function( timeString ){
    
    var minutes = 0;
    var hours = 0;

    // Validate time
    var timeArray = timeString? timeString.split( ':' ): undefined;

    if ( timeArray
        && timeArray.length == 2 
        && ! isNaN( timeArray[0] ) && ! isNaN( timeArray[1] )
        && timeArray[0] >= 0 && timeArray[1] >= 0 
        && timeArray[0] <= this.maxHour && timeArray[1] <= 59 ){

        hours = timeArray[0];
        minutes = timeArray[1];
    }

    return this.buildTimeObjectFromHoursAndMinutes( hours, minutes );
};

Datetime.prototype.buildTimeObjectFromDateInstance = function( date ){
    
    var minutes = date? date.getMinutes(): 0;
    var hours = date? date.getHours(): 0;

    return this.buildTimeObjectFromHoursAndMinutes( hours, minutes );
};

Datetime.prototype.buildTimeObjectFromHoursAndMinutes = function( hours, minutes ){

    return {
        minutes: minutes,
        minutesToShow: this.formatTimeNumber( minutes, 59 ),
        hours: hours,
        hoursToShow: this.formatTimeNumber( hours, this.maxHour )
    };
};

Datetime.prototype.formatTimeNumber = function( number, maxNumber ) {
    
    var numberOfDigits = ( '' + maxNumber ).length;
    var string = '' + number;
    return string.length >= numberOfDigits?
        string: 
    new Array( numberOfDigits - string.length + 1 ).join( '0' ) + string;
};

Datetime.prototype.getDateInfo = function( selectedDate ){
    
    var referenceDate = this.getReferenceDate( selectedDate );
    return this.getDateInfoFromObject( referenceDate, selectedDate );
};

Datetime.prototype.getDateInfoFromObject = function( referenceDate, selectedDate ){
    
    return {
        years: this.buildYears( referenceDate ),
        months: this.buildMonths( referenceDate ),
        weekDays: this.getWeekDays(),
        daysInWeeks: this.buildDaysInWeeks( 
            referenceDate, 
            selectedDate,
            context.translate( 'dayOfWeekStart' ) )
    };
};

Datetime.prototype.getReferenceDate = function( selectedDate ){
    
    var referenceDate = undefined;

    if ( selectedDate ){
        referenceDate = selectedDate;
    } else {
        referenceDate =  new Date();
        referenceDate.setHours( 0 );
        referenceDate.setMinutes( 0 );
    }

    return referenceDate;
};

Datetime.prototype.getDateTimeInfo = function( selectedDate ){
    
    var referenceDate = this.getReferenceDate( selectedDate );
    var timeString = this.buildTimeStringFromDate( referenceDate );

    return {
        dateInfo: this.getDateInfoFromObject( referenceDate, selectedDate ),
        timeInfo: this.getTimeInfo( timeString )
    };
};

Datetime.prototype.buildTimeStringFromDate = function( date ){
    return this.buildTimeString( date.getHours(), date.getMinutes() );
};

Datetime.prototype.getWeekDays = function(){
    
    if ( ! this.weekInitDone ){
        // Sort the list of days in a week
        var dayOfWeekStart = context.translate( 'dayOfWeekStart' );
        if ( dayOfWeekStart != 0 ){
            this.weekDays = this.weekDays.slice( dayOfWeekStart ).concat( 
                this.weekDays.slice( 0, dayOfWeekStart ) );
        }
        this.weekInitDone = true;
    }

    return this.weekDays;
};

Datetime.prototype.buildYears = function( referenceDate ){
    
    var currentYear = referenceDate.getFullYear();
    var minYear = this.minYear;
    var maxYear = this.maxYear;

    var years = [];
    for ( var c = minYear; c <= maxYear; ++c ){
        years.push(
            {
                value: c,
                current: currentYear == c
            }
        );
    }
    return years;
};

Datetime.prototype.buildMonths = function( referenceDate ){
    
    var currentMonth = referenceDate.getMonth();
    var months = [];

    for ( var c = 0; c < 12; ++c ){
        months.push(
            {
                value: c,
                name: this.monthNames[ c ],
                current: currentMonth == c
            }
        );
    }

    return months;
};

Datetime.prototype.buildDaysInWeeks = function( referenceDate, selectedDate, dayOfWeekStart ){

    var totalNumberOfDays = referenceDate.countDaysInMonth();

    // Set start date to day 1/current month/current day/00:00:00
    var tempDate = new Date( referenceDate.getFullYear(), referenceDate.getMonth(), 1, 0, 0, 0 );

    // Make the start date to start the week
    while ( tempDate.getDay() != dayOfWeekStart ) {
        tempDate.setDate( tempDate.getDate() - 1 );
        ++totalNumberOfDays;
    }

    // Build today
    var today = new Date();
    today = new Date( today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0 );

    // Build days
    var week = [];
    var weeksArray = [];
    var c = 0;
    while ( ++c <= totalNumberOfDays || tempDate.getDay() != dayOfWeekStart ) {
        var dayOfWeek = tempDate.getDay();
        var thisDay = {
            day: tempDate.getDate(),                                      // data-day atttr and content of td
            month: tempDate.getMonth(),                                   // data-month atttr
            year: tempDate.getFullYear(),                                 // data-year atttr
            dayOfWeek: tempDate.getDay(),                                 // day_of_week{dayOfWeek} class
            current: tempDate.dateEquals( selectedDate ),                 // current class if true
            today: today.dateEquals( tempDate ),                          // today class if true
            otherMonth: referenceDate.getMonth() !== tempDate.getMonth(), // other-month class if true
            weekEnd: dayOfWeek == 0 || dayOfWeek == 6                     // weekend class if true
        };

        week.push( thisDay );

        if ( c % 7 === 0 ){
            var fullWeek = week.slice();
            weeksArray.push( fullWeek );
            week = [];
        }

        tempDate.setDate( tempDate.getDate() + 1 );
    }

    return weeksArray;
};

Datetime.prototype.get$datePicker = function( event ){
    return $( event.target ).parents( '.datepicker' ).first();
    //return $( event.target ).closest( '.datepicker' );
};

Datetime.prototype.getSelectedDate = function( event, selectDay, $datePicker ){

    $datePicker = $datePicker || this.get$datePicker( event );

    var year = $datePicker.find( '[name="datepicker-year"]' ).val();
    var month = $datePicker.find( '[name="datepicker-month"]' ).val();
    var day = selectDay? 1: 1;

    return new Date( year, month, day, 0, 0, 0 );
};

Datetime.prototype.getSelectedYearAndMonthDate = function( event, $datePicker ){
    return this.getSelectedDate( event, undefined, $datePicker );
};

Datetime.prototype.goToPreviousMonth = function( event, $datetime, params ){
    
    var thisDate = this.getSelectedYearAndMonthDate( event );

    if ( thisDate.getMonth() == 0 ){
        thisDate.setFullYear( thisDate.getFullYear() - 1 );
        thisDate.setMonth( 11 );
    } else {
        thisDate.setMonth( thisDate.getMonth() - 1 );
    }

    this.goToDate( 
        thisDate, 
        $datetime, 
        this.buildDictionaryFromParams( params ) );
};

Datetime.prototype.goToNextMonth = function( event, $datetime, params ){
    
    var thisDate = this.getSelectedYearAndMonthDate( event );

    if ( thisDate.getMonth() == 11 ){
        thisDate.setFullYear( thisDate.getFullYear() + 1 );
        thisDate.setMonth( 0 );
    } else {
        thisDate.setMonth( thisDate.getMonth() + 1 );
    }

    this.goToDate( 
        thisDate, 
        $datetime, 
        this.buildDictionaryFromParams( params ) );
};

Datetime.prototype.goToPreviousYear = function( event, $datetime, params ){
    
    var thisDate = this.getSelectedYearAndMonthDate( event );
    thisDate.setFullYear( thisDate.getFullYear() - 1 );

    this.goToDate( 
        thisDate, 
        $datetime, 
        this.buildDictionaryFromParams( params ) );
};

Datetime.prototype.goToNextYear = function( event, $datetime, params ){
    
    var thisDate = this.getSelectedYearAndMonthDate( event );
    thisDate.setFullYear( thisDate.getFullYear() + 1 );

    this.goToDate( 
        thisDate, 
        $datetime, 
        this.buildDictionaryFromParams( params ) );
};

Datetime.prototype.update = function( event, $datetime, params ){
    
    var thisDate = this.getSelectedYearAndMonthDate( event );
    this.goToDate( 
        thisDate, 
        $datetime, 
        this.buildDictionaryFromParams( params ) );
};

Datetime.prototype.goToday = function( event, $datetime, params ){
    
    this.goToDate( 
        new Date(), 
        $datetime, 
        this.buildDictionaryFromParams( params ) );
};

Datetime.prototype.buildDictionaryFromParams = function( params ){
    
    //this.dictionary = utils.extend( params.dictionary );
    this.dictionary = {};
    this.dictionary.field = this;

    return this.dictionary;
};

Datetime.prototype.goToDate = function( referenceDate, $datetime, dictionary ){
    
    // Build selectedDate
    var selectedDate = dictionary.value? 
        new Date( dictionary.value ):
        undefined;

    // Update the date picker
    this.updateDatePicker( 
        referenceDate, 
        selectedDate, 
        $datetime );
};

Datetime.prototype.updateDatePicker = function( referenceDate, selectedDate, $datetime ){
    
    this.dictionary.dateInfo = this.getDateInfoFromObject( 
        referenceDate? referenceDate: this.getSelectedYearAndMonthDate( undefined, $datetime ), 
        selectedDate );

    // Refresh template
    zpt.run({
    //context.getZPTParser().run({
        root: $datetime.find( '.datepicker' )[ 0 ],
        dictionaryExtension: this.dictionary
        //notRemoveGeneratedTags: false
    });

    // Bind events
    this.bindDatePickerEvents( $datetime );
};

Datetime.prototype.get$datetime = function( $selection ){
    return $selection.find( '.zcrud-like-field-' + this.name );
};

Datetime.prototype.bindEvents = function( params, $selection, dateEvents, timeEvents ){
    
    var $datetime = this.get$datetime( $selection );
    this.bindCommonEvents( params, $selection, $datetime );

    if ( dateEvents ){
        this.bindDateEvents( params, $selection, $datetime );
    }

    if ( timeEvents ){
        this.bindTimeEvents( params, $selection, $datetime );
    }
};

Datetime.prototype.bindCommonEvents = function( params, $selection, $datetime ){
    
    var datetimeInstance = this;
    $datetime
        .find( '.save-button' )
        .on(
            'click',  
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                datetimeInstance.save( $datetime, true );
            }
    );
    $datetime
        .find( '.cancel-button' )
        .on(
            'click',  
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                datetimeInstance.cancel( event, $datetime, params );
            }
    );
    $datetime
        .find( '.toggle-picker' )
        .off( 'click' )
        .on(
            'click',  
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                datetimeInstance.toggle( event, $datetime, params );
            }
    );
};

Datetime.prototype.bindTimeEvents = function( params, $selection, $datetime ){
    
    var datetimeInstance = this;
    var delay = this.timerDelay;
    var minutesStep = this.minutesStep;
    var hoursStep = 1;

    var mouseupFunction = function( event ){
        event.preventDefault();
        event.stopPropagation();
        clearInterval( datetimeInstance.currentTimer );
    };

    $datetime
        .find( '.prev-hour' )
        .on(
            'mousedown',
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                datetimeInstance.addHoursInterval( event, $datetime, -hoursStep, delay );
            }
        ).on( 'mouseup', mouseupFunction );

    $datetime
        .find( '.prev-minute' )
        .on(
            'mousedown',
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                datetimeInstance.addMinutesInterval( event, $datetime, -minutesStep, delay );
            }
        ).on( 'mouseup', mouseupFunction );

    $datetime
        .find( '.next-hour' )
        .on(
            'mousedown',
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                datetimeInstance.addHoursInterval( event, $datetime, hoursStep, delay );
            }
        ).on( 'mouseup', mouseupFunction );

    $datetime
        .find( '.next-minute' )
        .on(
            'mousedown',
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                datetimeInstance.addMinutesInterval( event, $datetime, minutesStep, delay );
            }
        ).on( 'mouseup', mouseupFunction );
};

Datetime.prototype.bindDateEvents = function( params, $selection, $datetime ){
    
    var datetimeInstance = this;
    $datetime
        .find( '.today-button' )
        .on(
            'click',
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                datetimeInstance.goToday( event, $datetime, params );
            }
    );

    $datetime
        .find( '.prev-month' )
        .on(
            'click',
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                datetimeInstance.goToPreviousMonth( event, $datetime, params );
            }
    );

    $datetime
        .find( '.next-month' )
        .on(
            'click',
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                datetimeInstance.goToNextMonth( event, $datetime, params );
            }
    );

    $datetime
        .find( '.prev-year' )
        .on(
            'click',
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                datetimeInstance.goToPreviousYear( event, $datetime, params );
            }
    );

    $datetime
        .find( '.next-year' )
        .on(
            'click',
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                datetimeInstance.goToNextYear( event, $datetime, params );
            }
    );

    $datetime
        .find( '[name="datepicker-month"], [name="datepicker-year"]' )
        .on(
            'change',
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                datetimeInstance.update( event, $datetime, params );
            }
    );

    this.bindDatePickerEvents( $datetime );
};

Datetime.prototype.bindDatePickerEvents = function( $datetime ){
    
    var datetimeInstance = this;
    $datetime
        .find( '.date' )
        .on(
            'click',
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                datetimeInstance.updateCalendarValue( $datetime, $( this ) );
            }
    );
};

Datetime.prototype.addHours = function( event, $datetime, valueToAdd ){
    
    var $hours = this.get$hours( $datetime );
    var currentValue = parseInt( $hours.text() );
    var maxHourPlus1 = 1 + this.maxHour;

    // Get the new value
    currentValue += valueToAdd;
    while ( currentValue < 0 ){
        currentValue += maxHourPlus1;
    }
    if ( currentValue >= maxHourPlus1 ){
        currentValue -= maxHourPlus1;
    }

    // Update value
    $hours.text(
        this.formatTimeNumber( currentValue, this.maxHour ) );

    // Save value if inline
    if ( this.inline ){
        this.save( $datetime, false );
    }
};

Datetime.prototype.addHoursInterval = function( event, $datetime, valueToAdd, delay ){
    
    var datetimeInstance = this;
    clearInterval( this.currentTimer );
    this.addHours( event, $datetime, valueToAdd );

    this.currentTimer = setInterval( 
        function(){
            datetimeInstance.addHours( event, $datetime, valueToAdd );
        }, 
        delay );
};

Datetime.prototype.addMinutesInterval = function( event, $datetime, valueToAdd, delay ){
    
    var datetimeInstance = this;
    clearInterval( this.currentTimer );
    this.addMinutes( event, $datetime, valueToAdd );

    this.currentTimer = setInterval( 
        function(){
            datetimeInstance.addMinutes( event, $datetime, valueToAdd );
        }, 
        delay );
};

Datetime.prototype.addMinutes = function( event, $datetime, valueToAdd ){
    
    var $minutes = this.get$minutes( $datetime );
    var currentValue = parseInt( $minutes.text() );

    // Get the new value
    currentValue += valueToAdd;
    if ( currentValue < 0 ){
        currentValue += 60;
        this.addHours( event, $datetime, -1 );
    }
    if ( currentValue >= 60 ){
        currentValue -= 60;
        this.addHours( event, $datetime, 1 );
    }

    // Update value
    $minutes.text( 
        this.formatTimeNumber( currentValue, 59 ) );

    // Save value if inline
    if ( this.inline ){
        this.save( $datetime, false );
    }
};

Datetime.prototype.get$timePicker = function( $datetime ){
    return $datetime.find( '.timepicker' );
};

Datetime.prototype.get$hours = function( $datetime ){
    return this.get$hoursByTimePicker( this.get$timePicker( $datetime ) );
};

Datetime.prototype.get$hoursByTimePicker = function( $timePicker ){
    return $timePicker.find( '.hours' );
};

Datetime.prototype.get$minutes = function( $datetime ){
    return this.get$minutesByTimePicker( this.get$timePicker( $datetime ) );
};

Datetime.prototype.get$minutesByTimePicker = function( $timePicker ){
    return $timePicker.find( '.minutes' );
};

Datetime.prototype.updateCalendarValue = function( $datetime, $cell ){
    
    $datetime.find( '.' + this.selectedDateClass ).removeClass( this.selectedDateClass );
    $cell.addClass( this.selectedDateClass );

    if ( this.inline ){
        this.save( $datetime, false );
    }
};

Datetime.prototype.get$selectedCell = function( $datetime ){
    return $datetime.find( '.' + this.selectedDateClass );
};

Datetime.prototype.buildDatetimeInstance = function( $datetime ){
    
    var processDate = false;
    var processTime = false;

    switch( this.type ) {
        case 'date':
            processDate = true;
            break;
        case 'datetime':
            processDate = true;
            processTime = true;
            break;
        case 'time':
            processTime = true;
            break;
        default:
            throw 'Unknown type in Datetime: ' + this.type;
    }

    // Get items from datatime picker
    var day = 0;
    var month = 0;
    var year = 0;
    var hours = 0;
    var minutes = 0;

    if ( processDate ){
        var $selectedDate = this.get$selectedCell( $datetime );
        if ( ! $selectedDate.length ){
            context.showError(
                this.page.getOptions(),
                false,
                context.translate( 'noSelectedDate' )
            );
            return undefined;
        } else {
            day = $selectedDate.attr( 'data-date' );
            month = $selectedDate.attr( 'data-month' );
            year = $selectedDate.attr( 'data-year' );
        }
    }
    if ( processTime ){
        hours = parseInt( this.get$hours( $datetime ).text() );
        minutes = parseInt( this.get$minutes( $datetime ).text() );
    }

    return new Date( year, month, day, hours, minutes );
};

Datetime.prototype.formatToClient = function( dateInstance ){
    
    try {
        return dateInstance?
            this.dateFormatter.formatDate( dateInstance, this.getI18nFormat() ):
            '';
    } catch ( error ) {
        return '';
    }
};

Datetime.prototype.buildDatetimeValue = function( $datetime ){
    
    var datatimeInstance = this.buildDatetimeInstance( $datetime );
    return this.formatToClient( datatimeInstance );
};

Datetime.prototype.get$picker = function( $datetime ){
    return $datetime.find( '.datetime' );
};

Datetime.prototype.get$input = function( $datetime ){
    return $datetime.find( '[name="' + this.name + '"]' );
};

Datetime.prototype.save = function( $datetime, hide ){
    
    // Build client values
    var value = undefined;
    switch( this.type ) {
        case 'datetime':
        case 'date':
            value = this.buildDatetimeValue( $datetime );
            break;
        case 'time':
            value = this.buildTimeValue( $datetime );
            break;
        default:
            throw 'Unknown type in Datetime: ' + this.type;
    }

    // Do nothing if the user did not select any date
    if ( ! value ){
        return;
    }

    // Set values and trigger event
    var $input = this.get$input( $datetime );
    $input.val( value )
        .attr( this.pickerValueAttr, value )
        .trigger( 'change' );

    if ( hide ){
        this.get$picker( $datetime ).hide();
    }
};

Datetime.prototype.buildTimeValue = function( $datetime ){
    
    var $timePicker = this.get$timePicker( $datetime );
    var $hours = this.get$hoursByTimePicker( $timePicker );
    var $minutes = this.get$minutesByTimePicker( $timePicker );

    return this.buildTimeString( $hours.text(), $minutes.text() );
};

Datetime.prototype.buildTimeString = function( hours, minutes ){
    return '' + hours + ':' + minutes;
};

Datetime.prototype.cancel = function( event, $datetime, params ){
    this.get$picker( $datetime ).hide();
};

Datetime.prototype.show = function( event, $datetime, params ){
    this.get$picker( $datetime ).show();
};

Datetime.prototype.toggle = function( event, $datetime, params ){
    
    var $picker = this.get$picker( $datetime );

    // If the picker is not visible update it if needed
    //if ( ! $picker.is( ':visible' ) ){
    if ( ! $picker.isVisible() ){
        var $input = this.get$input( $datetime );
        var currentValue = $input.val();
        var pickerValue = $input.attr( this.pickerValueAttr );

        if ( pickerValue !== currentValue ){
            this.updateDatetime( currentValue, $datetime );
            $input.attr( this.pickerValueAttr, currentValue );
        }
    }

    $picker.toggle();
};

Datetime.prototype.updateDatetime = function( value, $datetime ){
    
    var date = false;
    var time = false;

    switch( this.type ) {
        case 'date':
            date = true;
            break;
        case 'datetime':
            date = true;
            time = true;
            break;
        case 'time':
            time = true;
            break;
        default:
            throw 'Unknown type in Datetime: ' + this.type;
    }

    if ( date ){
        var selectedDate = 
            value? 
            this.parseDate( value ): 
        undefined;
        var referenceDate = this.getReferenceDate( selectedDate );
        this.updateDatePicker( referenceDate, selectedDate, $datetime );         
    }

    if ( time ){
        var timeObject = this.type == 'time'? 
            this.buildTimeObjectFromString( value ):
            this.buildTimeObjectFromDateInstance( selectedDate );
        this.updateTime( $datetime, timeObject );
    }
};

Datetime.prototype.validate = function( value ){
    
    switch( this.type ) {
        case 'date':
            return this.validateDate( value );
        case 'datetime':
            return this.validateDatetime( value );
        case 'time':
            return this.validateTime( value );
        default:
            throw 'Unknown type in Datetime: ' + this.type;
    }
};

Datetime.prototype.validateDate = function( value ){
    if ( ! utils.stringDateIsValid( value ) ){
        return 'typeMismatch';
    }

    return this.validateDatePart( value );
};

Datetime.prototype.validateDatePart = function( value ){
    const dateObject = utils.extractDateItems( value );
    if ( dateObject.year > this.maxYear ){
        return 'rangeOverflow';
    }
    if ( dateObject.year < this.minYear ){
        return 'rangeUnderflow';
    }

    return true;
};

Datetime.prototype.validateTimePart = function( value ){

    // Split datetime into date and time
    var timeArray = value.split( ':' );
    var hour = parseInt( timeArray[ 0 ], 10 );

    if ( hour > this.maxHour ){
        return 'rangeOverflow';
    }

    return true;
};

Datetime.prototype.validateDatetime = function( value ){

    // Validations must be ok if thre is no value
    if ( ! value ){
        return true;
    }

    // If the datetime value is not valid, return typeMismatch
    if ( ! utils.stringDatetimeIsValid( value ) ){
        return 'typeMismatch';
    }

    // Must check datePart and timePart

    // Split datetime into date and time
    var datetimeArray = value.split( ' ' );
    var stringDate = datetimeArray[ 0 ];
    var stringTime = datetimeArray[ 1 ];

    // Validate date
    var datePartValidation = this.validateDatePart( stringDate );
    if ( utils.isString( datePartValidation ) ){
        return datePartValidation;
    }

    // Validate time
    var dateTimeValidation = this.validateTimePart( stringTime );
    if ( utils.isString( dateTimeValidation ) ){
        return dateTimeValidation;
    }

    return true;
};

Datetime.prototype.validateTime = function( value ){
    return value?
        this.validateTimePart( value ):
        true;
};

Date.prototype.countDaysInMonth = function () {
    return new Date( this.getFullYear(), this.getMonth() + 1, 0 ).getDate();
};

Date.prototype.dateEquals = function ( otherDate ) {
    
    if ( ! otherDate ){
        return false;
    }

    return this.getFullYear() === otherDate.getFullYear()
        && this.getMonth() === otherDate.getMonth()
        && this.getDate() === otherDate.getDate();
};
/*
Datetime.validateDatetime = function( value, type ){
    //return !isNaN( new Date( value ) );
    const dateInstance = new Date( value );
    if ( ! isNaN( dateInstance ) ){
        return false;
    }
    const dateFormatter = new DateFormatter();
    
    var formatI18nId = type + 'Format';
    const i18nFormat = context.translate( formatI18nId );

    const dateString = dateFormatter.formatDate( dateInstance, i18nFormat );
};
*/

module.exports = Datetime;
},{"../../../lib/php-date-formatter.js":60,"../../../lib/zzDOM-closures-full.js":61,"../context.js":27,"../utils.js":57,"./field.js":33,"zpt":135}],33:[function(_dereq_,module,exports){
/* 
    Field class
*/
'use strict';

var utils = _dereq_( '../utils.js' );

var Field = function( properties ) {
    utils.extend( true, this, properties );
};

Field.prototype.setPage = function( pageToApply ){
    this.page = pageToApply;
};

Field.prototype.getPage = function(){
    return this.page;
};

Field.prototype.afterProcessTemplateForField = function( params, $selection ){
    // Nothing to do
};

Field.prototype.throwEventsForSetValueToForm = function( $this ){
    //$this.keyup();
    $this.trigger( 'keyup' );
    $this.trigger(
        'change',
        {
            'disableHistory': true
        }
    );
};

Field.prototype.setValueToForm = function( value, $this ){
    $this.val( value );
    this.throwEventsForSetValueToForm( $this );
};

Field.prototype.getValue = function( $this ){
    return $this.val();
};

Field.prototype.getValueForHistory = function( $this ){
    return this.getValue( $this );
};

Field.prototype.getValueFromForm = function( $selection ){
    return $selection.find( '[name="' + this.name + '"]' ).val();
};

Field.prototype.getValueFromRecord = function( record ){
    return record[ this.id ];
};

Field.prototype.getViewValueFromRecord = function( record ){
    return record[ this.id ];
};

Field.prototype.getValueFromSelection = function( $selection ){
    return $selection.find( '.zcrud-like-field-' + this.name ).text().trim();
};

Field.prototype.getTemplate = function( options ){
    return options.fieldsConfig.getDefaultFieldTemplate( this );
};

Field.prototype.getPostTemplate = function(){
    return undefined;
};

Field.prototype.getViewTemplate = function(){
    return undefined;
};

Field.prototype.mustHideLabel = function(){
    return false;
};

Field.prototype.buildFields = function(){
    // Nothing to do
};

Field.prototype.filterValue = function( record ){
    return record[ this.id ];
};

Field.prototype.getThisOptions = function(){
    return this;
};

Field.prototype.get$ = function(){
    return this.page.get$().find( '.zcrud-field-' + this.id );
};

Field.prototype.isReadOnly = function(){
    return this.page.isReadOnly() || ( this.parentField && this.parentField.isReadOnly() ) || this.readOnly;
};

Field.prototype.setParentField = function( parentFieldToApply ){
    this.parentField = parentFieldToApply;
};

Field.prototype.buildDataToSend = function(){
    return undefined;
};

Field.prototype.dataFromServer = function(){
    // Nothing to do
};

Field.prototype.getId = function(){
    return this.id;
};

Field.prototype.getFields = function(){
    return undefined;
};

Field.prototype.goToFirstPage = function(){
    // Nothing to do
};

Field.prototype.getAttributesFor = function( fieldAttributes ){
    return this.attributes[
        fieldAttributes?
        fieldAttributes:
        'field'
    ];
};

Field.prototype.validate = function( value ){
    return true;
};

module.exports = Field;

},{"../utils.js":57}],34:[function(_dereq_,module,exports){
/* 
    fieldBuilder singleton class
*/
'use strict';
    
var utils = _dereq_( '../utils.js' );

module.exports = (function() {

    var defaultConstructor = undefined;
    var constructors = {};
    
    var createFieldInstance = function( field ){

        var constructor = constructors[ field.type ];
        if ( ! constructor ){
            constructor = defaultConstructor;
        }
        
        var newFieldInstance = new constructor( field );
        return newFieldInstance;
    };
    
    var registerAllConstructors = function( constructorsConf ){

        defaultConstructor = constructorsConf.default;

        for ( var i = 0; i < constructorsConf.mapping.length; ++i ){
            var item = constructorsConf.mapping[ i ];
            registerConstructor( item.constructor, item.fieldTypes );
        }
    };
    
    var registerConstructor = function( constructor, fieldTypes ) {

        fieldTypes = fieldTypes || constructor.types;

        if ( utils.isArray( fieldTypes ) ){
            for ( var c = 0; c < fieldTypes.length; c++ ) {
                constructors[ fieldTypes[ c ] ] = constructor;
            }

        } else {
            constructors[ fieldTypes ] = constructor;
        }
    };
    
    var filterValues = function( record, fields ){

        var newRecord = {};

        for ( var index in fields ){
            var field = fields[ index ];
            var value = field.filterValue( record );
            if ( value != undefined ){
                newRecord[ field.id ] = value;
            }
        }

        return newRecord;
    };
    /*
    var bindEvents = function( fields ){
        
        for ( var index in fields ){
            var field = fields[ index ];

        }
    };*/
    
    var self = {
        createFieldInstance: createFieldInstance,
        registerAllConstructors: registerAllConstructors,
        filterValues: filterValues
    };
    
    return self;
})();

},{"../utils.js":57}],35:[function(_dereq_,module,exports){
/* 
    fieldListBuilder singleton class
*/
'use strict';

//var context = require( '../context.js' );
var normalizer = _dereq_( '../normalizer.js' );
var Container = _dereq_( './container.js' );
var utils = _dereq_( '../utils.js' );

module.exports = (function() {
    
    var getForList = function( listOptions, options, fields ){

        if ( listOptions.fieldsCache ){
            return listOptions.fieldsCache;
        }

        var fieldsCache = build( 
            listOptions.fields, 
            options, 
            undefined, 
            function( field ){
                field.buildFields();
            },
            fields );

        listOptions.fieldsCache = fieldsCache;

        return fieldsCache;
    };
    
    var getForPage = function( pageId, options, pageIdArray, page ){
        
        var pageOptions = options.pageConf.pages[ pageId ];
        if ( ! pageOptions ){
            throw 'Page id not found: ' + pageId;
        }
        
        if ( pageOptions.fieldsCache ){
            setPageToFields( pageOptions.fieldsCache, page );
            return pageOptions.fieldsCache;
        }
        
        // To avoid circular references
        if ( ! pageIdArray ){
            pageIdArray = [];
        } else if ( -1 !== pageIdArray.indexOf( pageId ) ){
            throw 'Circular reference trying to build fields for ' + pageId + ' page!';
        }
        pageIdArray.push( pageId );
        
        var fieldsCache = build( 
            pageOptions.fields, 
            options, 
            pageIdArray, 
            function( field ){
                field.buildFields();
            } );

        pageOptions.fieldsCache = fieldsCache;
        setPageToFields( pageOptions.fieldsCache, page );
        
        return fieldsCache;
    };
    
    // Set the page to all fields if needed
    var setPageToFields = function( fieldsCache, page ){
        
        if ( page ){
            for ( var c = 0; c < fieldsCache.fieldsArray.length; ++c ){
                fieldsCache.fieldsArray[ c ].setPage( page );
            }
        }
    };
    
    var build = function( items, options, pageIdArray, functionToApplyToField, fields ) {
        
        var result = {
            fieldsArray: [],
            fieldsMap: {},
            view: []
        };
        
        for ( var c = 0; c < items.length; ++c ){
            build1Pass( 
                result, 
                fields || options.fields,
                items[ c ], 
                options, 
                pageIdArray, 
                functionToApplyToField );
        }
    
        return result;
    };
    
    var build1Pass = function( result, fields, item, options, pageIdArray, functionToApplyToField, containerType, containerId, container ) {

        // Is string?
        if ( utils.isString( item ) ){
            addField( 
                getFieldUsingId( fields, item ), 
                result, 
                options, 
                functionToApplyToField, 
                containerType, 
                containerId, 
                container );
            //addField( fields[ item ], result, options, functionToApplyToField, containerType, containerId, container );
            
        // Is fieldsGroup?
        } else if ( item.type == 'fieldsGroup' ){
            buildFieldsFromFieldsGroup( result, fields, item, options, pageIdArray, functionToApplyToField, containerType, containerId, container );

        // Must be a field instance
        } else {
            var newField = normalizer.buildFullFieldInstance( item.id, item, options );
            addField( newField, result, options, functionToApplyToField, containerType, containerId, container );
        }
    };
    
    var buildFieldsFromFieldsGroup = function( result, fields, item, options, pageIdArray, functionToApplyToField, containerType, containerId ) {
        
        var container;
        
        // Get configuration if it is a container
        if ( item.container && item.container.containerType != 'none' ){
            containerType = item.container.containerType;
            containerId = item.container.id;
            container = item.container;
        }
        
        // Get configuration from item
        var start = item.start;
        var end = item.end;
        var except = item.except;
        var source = item.source; // 'default' or page id

        var view = buildFieldsFromSource( source, options, pageIdArray );

        // Must add a containerInstance to result.view if there are no fields to add
        // Needed to support custom containerType with no fields
        if ( ! view.length ){
            const containerInstance = buildContainerInstance( container, options );
            result.view.push( containerInstance );
            return;
        }

        // There are fields to add!
        var started = ! start;
        var ended = false;

        for ( var c = 0; c < view.length; ++c ){
            var viewItem = view[ c ];
            var id = viewItem.id;

            if ( id === start ){
                started = true;
            }
            if ( id === end ){
                ended = true;
            }

            if ( started && ( except? -1 === except.indexOf( id ): true ) ){

                // Is a fieldContainer?
                if ( viewItem.type == 'fieldContainer' ){
                    container = viewItem;
                    for ( var i = 0; i < container.fields.length; ++i ){
                        addField( 
                            container.fields[ i ], 
                            result, 
                            options, 
                            functionToApplyToField, 
                            container.containerType, 
                            container.id,
                            container, 
                            true );
                    }   

                // Must be a field
                } else {
                    build1Pass( 
                        result, 
                        fields,
                        viewItem, 
                        options, 
                        pageIdArray, 
                        functionToApplyToField,  
                        containerType, 
                        containerId,
                        container );
                }
            }

            if ( ended ){
                return;
            }
        }
        
    };
    
    var buildContainerInstance = function( container, options ){
        
        utils.extend( 
            true, 
            container,
            {
                type: 'fieldContainer',
                template: options.containers.types[ container.containerType ].template,
                fields: []
            }
        );
        container.options = options;
        /*
        utils.extend( 
            true, 
            container,
            {
                type: 'fieldContainer',
                template: options.containers.types[ container.containerType ].template,
                fields: [],
                options: options
            }
        );*/
        
        return new Container( container );
    };
    
    var addField = function( field, result, options, functionToApplyToField, containerType, containerId, newContainer, dontAddToContainer ){
        
        result.fieldsArray.push( field );
        result.fieldsMap[ field.id ] = field;
        
        if ( containerId ){ 
            var container = result.view[ result.view.length - 1 ];
            
            //if ( newContainer ){
            if ( ! container || container.id != containerId ){
                
                container = buildContainerInstance( newContainer, options );
                
                if ( ! container.template ){
                    throw 'Container with containerId "' + containerId + '" has got no template!';
                }
                result.view.push( container );
            }
            if ( ! dontAddToContainer ){
                container.fields.push( field );
            }
        } else {
            result.view.push( field );
        }
        
        if ( functionToApplyToField ){
            functionToApplyToField( field );
        }
    };
    
    var buildFieldsFromSource = function( source, options, pageIdArray ){
        
        var result = undefined;
        
        // Is array?
        if ( utils.isArray( source ) ){
            result = [];
            for ( var i = 0; i < source.length; ++i ){
                var item = source[ i ];
                
                // Is string?
                if ( utils.isString( item ) ){
                    result.push( options.fields[ item ] );

                // Must be a field instance
                } else {
                    var newField = normalizer.buildFullFieldInstance( item.id, item, options );
                    result.push( newField );
                }
            }
            return result;
        }
        
        // Is default?
        if ( ! source || source === '' || source === 'default' ){
            result = [];
            for ( var fieldId in options.fields ){
                var field = options.fields[ fieldId ];
                result.push( field );
            }
            /*
            $.each( options.fields, function ( fieldId, field ) {
                result.push( field );
            });
            */
            return result;
        }
        
        // Is subform?
        if ( source.startsWith( 'subform/' ) ){
            var subformId = source.substring( 'subform/'.length );
            result = [];

            for ( var fieldId in options.fields[ subformId ].fields ){
                var field = options.fields[ subformId ].fields[ fieldId ];
                result.push( field );
            }
            /*
            $.each( options.fields[ subformId ].fields, function ( fieldId, field ) {
                result.push( field );
            });
            */
            return result;
        }
        
        // Must be a page id
        result = getForPage( source, options, pageIdArray ).view;
        return result;
    };
    
    /*
    var getSubformIdFromName = function( source ){
        return source.startsWith( 'subform/' )? source.substring( 'subform/'.length ): undefined;
    };*/
    
    var validateField = function( field, id ){
        
        if ( field ){
            return field;
        }
        
        throw 'Field with id "' + id + '" not found!';
    };
    
    var getFieldUsingId = function( fields, id ){
        
        var index = id.indexOf( '/' );
        
        if ( index === -1 ){
            return validateField( 
                fields[ id ], 
                id );
        }
        
        var subformId = id.substring( 0, index );
        var subformFieldId = id.substring( 1 + index );
        var subform = fields[ subformId ];
        
        if ( ! subform ){
            throw 'Subform with id "' + subformId + '" not found!';
        }
        
        return validateField( 
            subform.fields[ subformFieldId ], 
            id );
    };
    
    var self = {
        getForPage: getForPage,
        getForList: getForList,
        build: build
    };
    
    return self;
})();

},{"../normalizer.js":50,"../utils.js":57,"./container.js":31}],36:[function(_dereq_,module,exports){
/*
    fieldUtils singleton class
*/
'use strict';

//var context = require( '../context.js' );

var FieldUtils = function() {
    
    var buildRecord = function( fieldsArray, $selection ){

        var record = {};

        for ( var c = 0; c < fieldsArray.length; c++ ) {
            var field = fieldsArray[ c ];
            var value = field.getValueFromForm( $selection );

            if ( value != undefined && value != '' ){
                record[ field.id ] = value;
            }
        }

        return record;
    };
    
    var updateRecordFromFormSelection = function( record, fieldsArray, $selection ){

        for ( var c = 0; c < fieldsArray.length; c++ ) {
            var field = fieldsArray[ c ];
            var value = field.isReadOnly()?
                undefined:
                field.getValueFromForm( $selection );

            if ( value != undefined && value != '' ){
                record[ field.id ] = value;
            }
        }
    };
    /*
    var buildRecordFromSelection = function( fieldsArray, $selection ){

        var record = {};

        for ( var c = 0; c < fieldsArray.length; c++ ) {
            var field = fieldsArray[ c ];
            var value = field.isReadOnly()?
                field.getValueFromSelection( $selection ):
            field.getValueFromForm( $selection );

            if ( value != undefined && value != '' ){
                record[ field.id ] = value;
            }
        }

        return record;
    };
    */
    var buildDefaultValuesRecord = function( fieldsArray ){

        var defaultRecord = {};

        for ( var c = 0; c < fieldsArray.length; c++ ) {
            var field = fieldsArray[ c ];
            if ( field.defaultValue !== undefined ){
                defaultRecord[ field.id ] = field.defaultValue;
            }
        }

        return defaultRecord;
    };
    
    var buildRecordsMap = function( recordsArray, keyField ){

        recordsArray = recordsArray || [];
        var recordsMap = {};
        
        for ( var c = 0; c < recordsArray.length; c++ ) {
            var record = recordsArray[ c ];
            var key = record[ keyField ];
            recordsMap[ key ] = record;
        }

        return recordsMap;
    };
    
    return {
        buildRecord: buildRecord,
        updateRecordFromFormSelection: updateRecordFromFormSelection,
        buildDefaultValuesRecord: buildDefaultValuesRecord,
        buildRecordsMap: buildRecordsMap
    };
}();

module.exports = FieldUtils;
},{}],37:[function(_dereq_,module,exports){
/*
    OptionProvider singleton class
*/
'use strict';

var context = _dereq_( '../context.js' );
var crudManager = _dereq_( '../crudManager.js' );
var utils = _dereq_( '../utils.js' );

var OptionProvider = function() {
    
    var cache = {};
    var resetCache = function(){
        cache = {};
    };

    var getOptionsFromBlank = function( field, options ){
        return getOptionsFromRecord( [], field, options );
    };
    
    var getOptionsFromRecord = function( record, field, options ){
        
        var params = {
            field: field, 
            value: record[ field.id ],
            options: options,
            record: record
        };
        params.dependedValues = createDependedValuesUsingRecord( record, field );
        
        return buildOptions( params );
    };
    
    var asyncGetOptions = function( record, field, options, callback ){
        
        var params = {
            field: field,
            value: record[ field.id ],
            options: options,
            record: record
        };
        params.dependedValues = createDependedValuesUsingRecord( record, field );
        //params.dependedValues = {};

        buildOptions( params, callback );
    };

    var buildOptions = function( params, callback ){

        var optionsSource = params.field.options;
        var funcParams = params;
        var mustGetOptionsFromCRUD = false;

        // Check if it is a function
        if ( utils.isFunction( optionsSource ) ) {
            // Prepare parameter to the function
            funcParams = buildFuncParams( funcParams );
            
            // Call function and get actual options source
            optionsSource = optionsSource( funcParams );
        }
        
        // Get optionsList according to its source type
        var optionsList = undefined;
        if ( typeof optionsSource !== 'string' ) { // Check it is NOT an URL

            // It is NOT an URL, must build optionsList
            optionsList = buildOptionsFromArrayOrObject( optionsSource, params.field );

        } else {
            // It is an URL, must download options

            // Try to get values from cache
            var cacheKey = 'options_' + params.field.id + '_' + optionsSource; // Create an unique cache key
            optionsList = cache[ cacheKey ];

            if ( ! optionsList ) {
                // Options are not found in the cache, download options
                mustGetOptionsFromCRUD = true;

                // Download options
                crudManager.getOptions(
                    params.field.id, 
                    optionsSource, 
                    params.options,
                    function( newValues ){

                        // Build optionsList
                        optionsList = buildOptionsFromArrayOrObject(
                            newValues,
                            params.field
                        );
                        // Add optionsList to cache
                        cache[ cacheKey ] = optionsList;

                        // Sort values
                        sortFieldOptions(
                            cache[ cacheKey ],
                            params.field.optionsSorting
                        );

                        // Add current value if needed
                        if ( params.field.addCurrentValueToOptions ){
                            optionsList = addCurrentValue( optionsList, params );
                        }

                        // Run callback if needed
                        if ( callback ){
                            callback( optionsList );
                        }

                        return;
                    }
                );
            }
        }

        // Return undefined if must build optionsList
        if ( ! optionsList && mustGetOptionsFromCRUD ){
            return undefined;
        }
        
        // Add current value if needed
        if ( params.field.addCurrentValueToOptions ){
            optionsList = addCurrentValue( optionsList, params );
        }
        
        // Run callback if needed
        if ( callback ){
            callback( optionsList );
            return;
        }

        return optionsList;
    };
    
    var buildFuncParams = function( funcParams ){
        
        var newFuncParams = {
            dependedValues: {}
        };
        
        for ( var i in funcParams ){
            newFuncParams[ i ] = i == 'options' || i == 'dictionary'|| i == 'formPage'?
                funcParams[ i ]:
                utils.extend( true, {}, funcParams[ i ] );
        }
        
        return newFuncParams;
    };
    
    var buildItem = function( value, text ){
        
        return {
            value: value,
            displayText: text? text: value
        };
    };
    
    var addCurrentValue = function( list, params ){
        
        var result = [];
        
        // Add the value
        var value = params.value;
        if ( value ){
            result.push( buildItem( value ) );
        }
        
        // Add all the items of list
        for ( var i = 0; i < list.length; i++ ) {
            result.push( list[ i ] );
        }
        
        return result;
    };
    
    var buildOptionsFromArrayOrObject = function( optionsSource, field ){
        
        var optionsList = undefined;
        
        if ( utils.isArray( optionsSource ) ) { // It is an array
            optionsList = buildOptionsFromArray( optionsSource );
            sortFieldOptions( optionsList, field.optionsSorting );
            
        } else { // It is an object
            optionsList = buildOptionsArrayFromObject( optionsSource );
            sortFieldOptions( optionsList, field.optionsSorting );
        }
        
        return optionsList;
    };
    
    // Create array of options from giving options array
    var buildOptionsFromArray = function ( optionsArray ) {
        
        var list = [];

        for ( var i = 0; i < optionsArray.length; i++ ) {
            if ( utils.isPlainObject( optionsArray[ i ] ) ) {
                list.push( optionsArray[ i ] );
            } else { // Assumed as primitive type (int, string...)
                list.push( buildItem( optionsArray[ i ] ) );
                /*list.push({
                    value: optionsArray[ i ],
                    displayText: optionsArray[ i ]
                });*/
            }
        }

        return list;
    };
    
    // Sort given options according to sorting parameter
    var sortFieldOptions = function ( options, sorting ) {

        if ( ( ! options ) || ( ! options.length ) || ( ! sorting ) ) {
            return;
        }

        var dataSelector = undefined;
        if ( sorting.indexOf( 'value' ) == 0) {
            dataSelector = function ( option ) {
                return option.value;
            };
        } else { // Assume as text
            dataSelector = function ( option ) {
                return option.displayText;
            };
        }

        var compareFunc = undefined;
        if ( utils.isString( dataSelector( options[ 0 ] ) ) ) {
            compareFunc = function ( option1, option2 ) {
                return dataSelector( option1 ).localeCompare( dataSelector( option2 ) );
            };
        } else { // Assume as numeric
            compareFunc = function ( option1, option2 ) {
                return dataSelector( option1 ) - dataSelector( option2 );
            };
        }

        if ( sorting.indexOf( 'desc' ) > 0 ) {
            options.sort( function ( a, b ) {
                return compareFunc( b, a );
            });
        } else { // Assume as asc
            options.sort( function ( a, b ) {
                return compareFunc( a, b );
            });
        }
    };
    /*
    // Find an option object by given value
    var findOptionByValue = function (options, value) {
        return findItemByProperty( options, 'value', value );
    };
    
    // Find an option object by given value
    var findItemByProperty = function ( items, key, value ) {
        
        for ( var i = 0; i < items.length; i++ ) {
            if ( items[ i ][ key ] == value ) {
                return items[ i ];
            }
        }

        return {};
    };
    */
    // Create an array of options from given object
    var buildOptionsArrayFromObject = function ( options ) {
        
        var list = [];

        for ( var propName in options ){
            var propValue = options[ propName ];
            list.push( buildItem( propName, propValue ) );
        }
        /*
        $.each( options, function ( propName, propValue ) {
            list.push( buildItem( propName, propValue ) );
        });
        */
       
        return list;
    };
    
    // Create and return an object with properties are depended values of a record
    var createDependedValuesUsingRecord = function ( record, field ) {
        
        var dependsOn = field.dependsOn;
        if ( ! dependsOn ) {
            return {};
        }

        var dependedValues = {};
        for ( var i = 0; i < dependsOn.length; i++ ) {
            var fieldName = dependsOn[ i ];
            var fieldId = context.getFieldData( fieldName ).name;
            dependedValues[ fieldName ] = record[ fieldId ];
        }

        return dependedValues;
    };
    
    var createDependedValuesUsingForm = function ( field, options, $selection, params ) {
        
        var dependedValues = {};
        
        for ( var i = 0; i < field.dependsOn.length; i++ ) {
            var dependedFieldId = field.dependsOn[ i ];
            var dependedField = context.getField( params.options.fields, dependedFieldId );
            dependedValues[ dependedFieldId ] = $selection.find( '[name="' + dependedField.name + '"]' ).val();
        }
        
        return dependedValues;
    };
    
    return {
        buildOptions: buildOptions,
        getOptionsFromBlank: getOptionsFromBlank,
        getOptionsFromRecord: getOptionsFromRecord,
        asyncGetOptions: asyncGetOptions,
        createDependedValuesUsingForm: createDependedValuesUsingForm,
        resetCache: resetCache
    };
}();

module.exports = OptionProvider;
},{"../context.js":27,"../crudManager.js":28,"../utils.js":57}],38:[function(_dereq_,module,exports){
/*
    OptionsField class
*/
'use strict';

var Field = _dereq_( './field.js' );
var context = _dereq_( '../context.js' );
var optionProvider = _dereq_( './optionProvider.js' );
//var $ = require( 'zzdom' );
var zzDOM = _dereq_( '../../../lib/zzDOM-closures-full.js' );
var $ = zzDOM.zz;
var zpt = _dereq_( 'zpt' );
var utils  = _dereq_( '../utils.js' );

var OptionsField = function( properties ) {
    Field.call( this, properties );
};

OptionsField.prototype = new Field();
OptionsField.prototype.constructor = OptionsField;

OptionsField.prototype.afterProcessTemplateForFieldInCreateOrUpdate = function( params, $selection ){

    if ( ! this.dependsOn ){
        return;
    }

    var page = this.page;
    var $thisDropdown = $selection.find( '[name="' + this.name + '"]' );

    // Build dictionary
    var dictionary = {};
    dictionary.field = this;
    dictionary.type = this.type;
    dictionary.value = params.value;

    // For each dependency
    for ( var index in this.dependsOn ){
        var dependsOn = this.dependsOn[ index ];
        var dependsOnField = context.getField( page.getOptions().fields, dependsOn );

        // Find the depended combobox
        var $dependsOnDropdown = $selection.find( '[name="' + dependsOnField.name + '"]' );
        
        // When depended combobox changes
        $dependsOnDropdown.on(
            'change',
            function (){
                // Refresh options
                params.dependedValues = optionProvider.createDependedValuesUsingForm( 
                    params.field, 
                    page.getOptions(), 
                    $selection, 
                    params 
                );

                optionProvider.buildOptions(
                    params,
                    function( optionsList ){
                        // optionsList does not contain any values, exit
                        if ( ! optionsList ){
                            return;
                        }

                        // optionsList contains values, continue
                        dictionary.optionsListFromForm = optionsList;
                        dictionary.record = params.record;
                        dictionary.value = params.record[ params.field.id ];
                        dictionary.field = params.field;
                        dictionary.type = params.field.type;
                        dictionary.value = params.value;
        
                        // Refresh template
                        zpt.run({
                            root: $thisDropdown[ 0 ],
                            dictionaryExtension: dictionary
                        });
        
                        // Trigger change event to refresh multi cascade dropdowns.
                        $thisDropdown.trigger(
                            'change',
                            //[ true ]
                            {
                                'disableHistory': true
                            }
                        );
                    }
                )
                /*
                dictionary.optionsListFromForm = optionProvider.buildOptions( params );
                dictionary.record = params.record;
                dictionary.value = params.record[ params.field.id ];
                dictionary.field = params.field;
                dictionary.type = params.field.type;
                dictionary.value = params.value;

                // Refresh template
                zpt.run({
                    root: $thisDropdown[ 0 ],
                    dictionaryExtension: dictionary
                });

                // Trigger change event to refresh multi cascade dropdowns.
                $thisDropdown.trigger(
                    'change',
                    //[ true ]
                    {
                        'disableHistory': true
                    }
                );
                */
            }
        );
    }
};

OptionsField.prototype.afterProcessTemplateForField = function( params, $selection ){
    
    if ( this.page.isReadOnly() ){
        return;
    }
    
    this.afterProcessTemplateForFieldInCreateOrUpdate( params, $selection );
};

OptionsField.prototype.getValueFromSelectionAndField = function( $selection ){
    
    var $checkboxesContainer = $selection.parents( '.zcrud-checkboxes-container' ).first();
    return $checkboxesContainer.find( 'input[type="checkbox"]:checked' ).map(
        function() {
            return $( this ).val();
        }
    ).get();
};

OptionsField.prototype.getValueFromForm = function( $selection ){
    
    switch( this.type ) {
        case 'checkboxes':
            return this.getValueFromSelectionAndField( $selection );
        case 'radio':
            var $selectedRadio = $selection.find( 'input[type="radio"][name="' + this.name + '[0]"]:checked' );
            return $selectedRadio.length > 0? $selectedRadio.val(): undefined;
        case 'select':
            return $selection.find( 'select[name="' + this.name + '"]' ).val();
        case 'datalist':
            return $selection.find( 'input[name="' + this.name + '"]' ).val();
    }

    throw 'Unknown field type in optionsField: ' + this.type;
};

OptionsField.prototype.setValueToForm = function( value, $this ){
    
    switch( this.type ) {
        case 'checkboxes':  
            var $checkboxesContainer = $this.parents( '.zcrud-checkboxes-container' ).first();
            var $checkboxes = $checkboxesContainer.find( 'input[type="checkbox"].zcrud-active' );
            //var $checkboxes = $checkboxesContainer.find( 'input:checkbox.zcrud-active' );
            $checkboxes.prop( 'checked', false ); 
            if ( value ){
                for ( var i = 0; i < value.length; ++i ){
                    $checkboxes.filter( '[value=' + value[ i ] + ']' ).prop( 'checked', true );   
                }
            }
            this.throwEventsForSetValueToForm( $this );
            return;
        case 'radio':
            var $radiosContainer = $this.parents( '.zcrud-radio-container' ).first();
            var $radios = $radiosContainer.find( 'input[type="radio"].zcrud-active' );
            //var $radios = $radiosContainer.find( 'input:radio.zcrud-active' );
            if ( value ){
                $radios.filter( '[value="' + value + '"]' ).prop( 'checked', true );
            } else {
                $radios.prop( 'checked', false ); 
            }
            this.throwEventsForSetValueToForm( $this );
            return;
        case 'select':
        case 'datalist':
            $this.val( value );
            $this.trigger(
                'change',
                //[ true ]
                {
                    'disableHistory': true
                }
            );
            this.throwEventsForSetValueToForm( $this );
            return;
    }

    throw 'Unknown field type in optionsField: ' + this.type;
};

OptionsField.prototype.getValue = function( $this ){
    
    switch( this.type ) {
        case 'checkboxes':
            return this.getValueFromSelectionAndField( $this );
        case 'radio':
        case 'select':
        case 'datalist':
            return $this.val();
    }

    throw 'Unknown field type in optionsField: ' + this.type;
};

OptionsField.prototype.getViewValueFromRecord = function( record ){

        var optionsList = this.getOptionsFromRecord( record, this.page.getOptions() );
        var tempValue = record[ this.id ];
        try {
            var map = this.getDisplayTextMapFromArrayOptions( optionsList );
            if ( this.type == 'checkboxes' ){
                return this.getMultipleValueFromRecord( map, tempValue );
            }
            var inMapValue = map[ tempValue ];
            return inMapValue? inMapValue: tempValue;
        } catch ( e ){
            return tempValue;
        }
};

OptionsField.prototype.getMultipleValueFromRecord = function( optionsMap, value ){
    
    var result = '';

    for ( var i in value ) {
        var currentValue = value[ i ];
        var translatedText = optionsMap[ currentValue ];
        if ( i > 0 ){
            result += ', ';
        }
        result += translatedText;
    }

    return result;
};

OptionsField.prototype.getDisplayTextMapFromArrayOptions = function( optionsArray ){

    var map = {};

    for ( var i = 0; i < optionsArray.length; i++ ) {
        var option = optionsArray[ i ];
        map[ option.value ] = this.translateOptions? context.translate( option.displayText ): option.displayText;
    }

    return map;
};

OptionsField.prototype.getTemplate = function(){
    return this.type + '@templates/fields/basic.html'
};

OptionsField.prototype.getPostTemplate = function(){
    
    switch( this.type ) {
        case 'checkboxes':
        case 'radio':
        case 'select':
            return;
        case 'datalist':
            return 'datalist-definition@templates/fields/basic.html';
    }

    throw 'Unknown field type in optionsField: ' + this.type;
};

OptionsField.prototype.mustHideLabel = function(){
    
    switch( this.type ) {
        case 'checkboxes':
        case 'radio':
            return true;
        case 'select':
        case 'datalist':
            return false;
    }

    throw 'Unknown field type in optionsField: ' + this.type;
};

OptionsField.prototype.getOptionsFromBlank = function( options ){
    return optionProvider.getOptionsFromBlank( this, options );
};

OptionsField.prototype.getOptionsFromRecord = function( record, options ){
    return optionProvider.getOptionsFromRecord( record, this, options );
};

OptionsField.prototype.getAsync = function( record, callback ){
    optionProvider.asyncGetOptions( record, this, this.page.getOptions(), callback );
};

OptionsField.prototype.builNonDependentAsyncFieldList = function(){
    var optionsSource = this.options;
    return ( typeof optionsSource == 'string' || utils.isFunction( optionsSource ) && ! this.dependsOn )?
        [ this ]:
        [];
};

OptionsField.prototype.buildDependentAsyncFieldList = function( record ){
    var optionsSource = this.options;
    return ( typeof optionsSource == 'string' || utils.isFunction( optionsSource ) && this.dependsOn )?
        [
            {
                record: this.dependsOn? record: {},
                field: this
            }
        ]:
        [];
};

module.exports = OptionsField;

},{"../../../lib/zzDOM-closures-full.js":61,"../context.js":27,"../utils.js":57,"./field.js":33,"./optionProvider.js":37,"zpt":135}],39:[function(_dereq_,module,exports){
/*
    Subform class
*/
'use strict';

var Field = _dereq_( './field.js' );
var context = _dereq_( '../context.js' );
//var $ = require( 'zzdom' );
var zzDOM = _dereq_( '../../../lib/zzDOM-closures-full.js' );
var $ = zzDOM.zz;
var zpt = _dereq_( 'zpt' );
var validationManager = _dereq_( '../validationManager.js' );
var ComponentsMap = _dereq_( '../components/componentsMap.js' );
var fieldUtils = _dereq_( './fieldUtils.js' );
var HistoryCreate = _dereq_( '../history/create.js' );
var HistoryDelete = _dereq_( '../history/delete.js' );
var HistoryComposition = _dereq_( '../history/composition.js' );
var crudManager = _dereq_( '../crudManager.js' );
var pageUtils = _dereq_( '../pages/pageUtils.js' );
var FormPage = _dereq_( '../pages/formPage.js' );
var buttonUtils = _dereq_( '../buttons/buttonUtils.js' );
var utils = _dereq_( '../utils.js' );

var Subform = function( properties ) {
    Field.call( this, properties );
    
    this.fieldsArray = [];
    this.fieldsMap = {};
    this.filter = undefined;
    this.currentFormPage = undefined;
    this.addedRecords = {};
    this.toolbarButtons = undefined;
    this.byRowButtons = undefined;
};

Subform.prototype = new Field();
Subform.prototype.constructor = Subform;

Subform.prototype.getFromAddedRecords = function( recordId ){
    return this.addedRecords[ recordId ];
};

Subform.prototype.filterValue = function( record ){
    
    var newRecords = [];
    var subformRecords = record[ this.id ];
    var subformFields = this.fields;

    for ( var i = 0; i < subformRecords.length; i++ ) {
        var subformRecord = subformRecords[ i ];
        var newRecord = {};
        newRecords.push( newRecord );
        for ( var c in subformFields ){
            var subformField = subformFields[ c ];
            var value = subformRecord[ subformField.id ];
            if ( value != undefined ){
                newRecord[ subformField.id ] = subformField.filterValue( subformRecord );
            }
        }
    }

    return newRecords;
};

Subform.prototype.getValueFromRecord = function( record ){
    
    var subformRecords = record[ this.id ] || [];
    var subformFields = this.fields;

    for ( var i = 0; i < subformRecords.length; i++ ) {
        var subformRecord = subformRecords[ i ];
        for ( var c in subformFields ){
            var subformField = subformFields[ c ];
            subformRecord[ subformField.id ] = subformField.getValueFromRecord( subformRecord );
        }
    }

    return subformRecords;
};

Subform.prototype.getViewValueFromRecord = function( record ){

    var subformRecords = record[ this.id ] || [];
    var subformFields = this.fields;

    for ( var i = 0; i < subformRecords.length; i++ ) {
        var subformRecord = subformRecords[ i ];
        for ( var c in subformFields ){
            var subformField = subformFields[ c ];
            subformRecord[ subformField.id ] = subformField.getViewValueFromRecord( subformRecord );
        }
    }

    return subformRecords;
};

Subform.prototype.afterProcessTemplateForField = function( params ){
    
    var $subform = this.get$();
    this.bindEventsInRows( params, $subform, undefined );
    
    this.bindButtonsEvent( this.getToolbarButtons(), $subform, params );

    // Bind events of components
    this.componentsMap.bindEvents();
};

Subform.prototype.showCreateForm = function(){
    this.showNewForm( 'create' );
};

Subform.prototype.showNewForm = function( type, record ){

    this.currentFormPage = new FormPage( 
        this.page.getOptions(), 
        {
            type: type, 
            parentPage: this.page,
            record: record
        }
    ); 

    this.currentFormPage.show();
};

Subform.prototype.buildDictionary = function( newRecord ){
    
    var thisDictionary = utils.extend( {}, context.getDictionary(), {} );
    
    thisDictionary.editable = true;
    thisDictionary.instance = this;
    thisDictionary.records = [ newRecord ];
    thisDictionary.hideRowButtons = this.isReadOnly();
    
    return thisDictionary;
};

Subform.prototype.addNewRow = function( params ){
    
    var createHistoryItem = this.buildHistoryItemForNewRow( params );
    context.getHistory().put( 
        this.page.getId(), 
        createHistoryItem );
    this.addToAddedRecords( createHistoryItem );
};

Subform.prototype.addToAddedRecords = function( createHistoryItem ){
    this.addedRecords[ createHistoryItem.recordId ] = createHistoryItem.record;
};

Subform.prototype.buildHistoryItemForNewRow = function( params ){
    
    var newRecord = params.defaultRecord?
        params.defaultRecord:
        fieldUtils.buildDefaultValuesRecord( this.fieldsArray );
    
    var thisDictionary = this.buildDictionary( newRecord );
    
    var createHistoryItem = new HistoryCreate( 
        context.getHistory(),
        thisDictionary,
        $( '#' + this.page.getId() + ' .zcrud-field-' + this.id + ' tbody'),
        newRecord,
        this.id );
    var $tr = createHistoryItem.get$Tr(); 

    // Bind events
    this.bindEventsInRows( params, undefined, $tr );
    this.componentsMap.bindEventsIn1Row( $tr );
    
    // Configure form validation
    validationManager.initFormValidation( 
        this.page.getId(), 
        $tr, 
        this.page.getOptions() );
    
    return createHistoryItem;
};

Subform.prototype.bindButtonEvent = function( $selection, button, subformInstance, params ){
    
    // Return if the button does not implement run method
    if ( ! utils.isFunction( button.run ) ){
        return;    
    }
    
    $selection
        .find( button.getSelector() )
        .off()
        .on(
            'click',
            function( event ){
                button.run( event, subformInstance, params );   
            }
        );
};

Subform.prototype.bindEventsInRows = function( params, $subform, $tr ){
    
    var $selection = $subform || $tr;
    var page = this.page;
    
    $selection
        .find( 'input.historyField, textarea.historyField, select.historyField' )
        //.off()
        .on(
            'change',
            function ( event ) {
                //var disableHistory = utils.getParam( params, 'disableHistory' );
                var disableHistory = utils.getParam( event.params, 'disableHistory' );
                if ( disableHistory ){
                    return;
                }
                var $this = $( this );
                var fullName = $this.attr( 'name' );
                //var fullName = $this.prop( 'name' );
                var field = page.getFieldByName( fullName );
                var $tr = $tr || $this.parents( 'tr' ).first();
                //var $tr = $tr || $this.closest( 'tr' );
                context.getHistory().putChange( 
                    $this, 
                    field.getValueForHistory( $this ), 
                    0,
                    $tr.attr( 'data-record-id' ),
                    page.getId(),
                    field,
                    $tr.attr( 'data-record-index' ),
                    $tr.attr( 'data-record-key' ) );
            }
        );
    
    this.bindButtonsEvent( this.getByRowButtons(), $selection, params );

    if ( $tr ){
        this. bindEventsForFieldsIn1Row( 
            $tr, 
            this.fields, 
            [], 
            page.getDictionary(), 
            params );
    } else {
        this.bindEventsForFields(
            $subform,
            this.fields,
            page.getDictionary(),
            params
        );
    }
};

Subform.prototype.bindEventsForFields = function( $subform, fields, dictionary, params ){
    
    var records = params.value || [];
    var $rows = $subform.find( 'tbody' ).children().filter( '.zcrud-data-row' );
    for ( var i = 0; i < records.length; i++ ) {
        var record = records[ i ];
        var $row = $rows.list[ i ];
        //var $row = $rows.filter( ':nth-child(' + (1 + i) + ')' );
        //var $row = $rows.filter( ':eq(' + i + ')' );
        this.bindEventsForFieldsIn1Row( $row, fields, record, dictionary, params );
    }
};

Subform.prototype.bindEventsForFieldsIn1Row = function( $row, fields, record, dictionary, params ){

    for ( var c in fields ){
        var field = fields[ c ];
        field.afterProcessTemplateForField(
            this.buildProcessTemplateParams( field, record, dictionary, params ),
            $row
        );
    }
};

Subform.prototype.buildProcessTemplateParams = function( field, record, dictionary, params ){
    
    return {
        field: field, 
        value: record? record[ field.id ]: undefined,
        options: params.options,
        record: record,
        source: params.source,
        dictionary: dictionary,
        formPage: params.formPage
    };
};

Subform.prototype.deleteRow = function( event ){

    var $tr = $( event.target ).parents( 'tr' ).first();
    //var $tr = $( event.target ).closest( 'tr' );

    context.getHistory().putDelete( 
        this.page.getId(), 
        $tr.attr( 'data-record-id' ),
        0, 
        $tr.attr( 'data-record-key' ), 
        $tr,
        this,
        $tr.attr( 'data-record-index' )
    );
};

Subform.prototype.getTemplate = function(){
    return 'subform@templates/fields/subforms.html';   
};

Subform.prototype.getViewTemplate = function(){
    return 'view@templates/fields/subforms.html';   
};

Subform.prototype.buildFields = function(){
    
    var subformInstance = this;
    this.fieldsArray = [];
    this.fieldsMap = {};
    
    for ( var subfieldId in this.fields ){
        var subfield = this.fields[ subfieldId ];
        subformInstance.fieldsArray.push( subfield );
        subformInstance.fieldsMap[ subfieldId ] = subfield;
        subfield.setParentField( subformInstance );
    }
    /*
    $.each( 
        this.fields, 
        function ( subfieldId, subfield ) {
            subformInstance.fieldsArray.push( subfield );
            subformInstance.fieldsMap[ subfieldId ] = subfield;
            subfield.setParentField( subformInstance );
        }
    );
    */
};

Subform.prototype.getFields = function(){
    return this.fieldsArray;
};

Subform.prototype.mustHideLabel = function(){
    return true;
};

Subform.prototype.getComponent = function( id ){
    return this.componentsMap.getComponent( id );
};

Subform.prototype.getSecureComponent = function( id ){
    return this.componentsMap.getSecureComponent( id );
};

Subform.prototype.getKey = function(){
    return this.subformKey;
};

Subform.prototype.setPage = function( pageToApply ){
    
    this.page = pageToApply;
    this.componentsMap = new ComponentsMap( this.page.getOptions(), this.components, this, this.page );
    
    for ( var c = 0; c < this.fieldsArray.length; ++c ){
        this.fieldsArray[ c ].setPage( this.page );
    }
};

Subform.prototype.buildMapValue = function(){
    
    return fieldUtils.buildRecordsMap( 
        this.page.getFieldValue( this.id ), 
        this.getKey() );
};

Subform.prototype.getRecordByKey = function( key, $row, mustUpdateRecordFromSelection ){
    
    var record = this.buildMapValue()[ key ];
    
    if ( mustUpdateRecordFromSelection && ! this.readOnly ){
        fieldUtils.updateRecordFromFormSelection( record, this.fieldsArray, $row );
    }
    
    return record;
};

Subform.prototype.addNewRowsFromSubform = function( fromSubformId, useSelection, deleteFrom, deselect ){
    
    // Get the selectingComponent if needed
    var selectingComponent = useSelection? this.page.getField( fromSubformId ).getComponent( 'selecting' ): undefined;
    
    // Get records from selection or get all
    var records = useSelection?
        selectingComponent.getSelectedRecords():
        this.page.getFieldValue( fromSubformId );
    
    var result = this.addNewRows_common( 
        records, 
        deleteFrom? 
            this.page.getField( fromSubformId ): 
            undefined,
        useSelection? 
            selectingComponent.getSelectedRows(): 
            undefined );
    
    if ( ! deleteFrom && useSelection && deselect ){
        selectingComponent.deselectAll();
    }
    
    return result;
};

Subform.prototype.addNewRows_common = function( records, subformToDeleteFrom, $selectedRows ){

    if ( ! records || records.length == 0 ){
        return [];
    }
    
    var composition = new HistoryComposition( context.getHistory() );

    for ( var c = 0; c < records.length; ++c ){
        var currentRecord = records[ c ];        

        // Add creation
        var createHistoryItem = this.buildHistoryItemForNewRow(
            {
                field: this, 
                defaultRecord: currentRecord
            }
        );
        composition.add( createHistoryItem );
        
        this.addToAddedRecords( createHistoryItem );
        
        // Add deletion if needed
        if ( subformToDeleteFrom ){
            var $tr = $selectedRows.list[ c ];
            //var $tr = $( $selectedRows.get( c ) );
            composition.add( 
                new HistoryDelete( 
                    context.getHistory(), 
                    $tr.attr( 'data-record-id' ),
                    0, 
                    $tr.attr( 'data-record-key' ), 
                    $tr,
                    subformToDeleteFrom.name 
                )
            );
        }
    }

    context.getHistory().put( this.page.getId(), composition );
    
    return records;
};

Subform.prototype.addNewRows = function( records ){
    return this.addNewRows_common( records );
};

Subform.prototype.getPagingComponent = function(){
    return this.componentsMap.getComponent( 'paging' );
};

Subform.prototype.getTotalNumberOfRecords = function(){
    
    var paging = this.getPagingComponent();
    
    return paging?
        paging.getTotalNumberOfRecords():
        this.getRecords().length;
};

Subform.prototype.getRecords = function(){
    return this.page.getFieldValue( this.id );
};

Subform.prototype.dataFromServer = function( data ){
    
    this.componentsMap.dataFromServer(
        {
            totalNumberOfRecords: data.fieldsData && data.fieldsData[ this.id ]? data.fieldsData[ this.id ].totalNumberOfRecords: 0,
            records: data.record? data.record[ this.id ]: []
        }
    );
};

Subform.prototype.update = function ( root, dictionaryExtension, callback ) {

    var subformInstance = this;
    
    crudManager.listRecords( 
        {
            url: this.getGroupOfRecordsURL,
            search: this.buildDataToSendForUpdate(),
            success: function( data ){
                subformInstance.clientAndServerSuccessFunction.call( subformInstance, data, root, dictionaryExtension );
            },
            error: function( dataFromServer ){
                context.showError( 
                    subformInstance.page.getOptions(), 
                    false, 
                    dataFromServer.message || 'Server communication error!'
                );
                if ( callback ){
                    callback( false );
                }
            }
        }, 
        this.page.getOptions()
    );
};

Subform.prototype.buildDataToSendForUpdate = function(){
    
    var data = this.buildDataToSend();

    // Add key only if needed
    var key = this.page.getKeyValue()
    if ( key ){
        data.key = key;
    }

    return data;
};

Subform.prototype.buildDataToSend = function(){
    
    var data = {};
    
    if ( ! utils.isEmptyObject( this.filter ) ){
        data.filter = this.filter;
    }

    this.componentsMap.addToDataToSend( data );
    this.page.getComponentMap().addToDataToSend( data );

    return data;
};

Subform.prototype.beforeProcessTemplate = function( data ){
    
    this.componentsMap.dataFromServer( data );
    this.page.filterArrayOfRecordsFromServerData( data.records, this.fieldsArray );
    this.updateRecords( data.records );
};

Subform.prototype.clientAndServerSuccessFunction = function( data, root, dictionaryExtension, callback ){

    this.beforeProcessTemplate( data );
    this.processTemplate( root, dictionaryExtension );
    this.afterProcessTemplate();
    
    if ( callback ){
        callback( true );
    }
};

Subform.prototype.processTemplate = function( root, dictionaryExtension ){
    
    zpt.run({
        root: root || [ 
            this.get$().find( 'tbody' )[0], 
            this.getPagingComponent()? this.getPagingComponent().get$()[0]: undefined
        ],
        dictionaryExtension: this.buildDictionaryForUpdate( dictionaryExtension )
    });
};

Subform.prototype.afterProcessTemplate = function(){
    
    this.afterProcessTemplateForField(
        this.page.buildProcessTemplateParams( this )
    );
};

Subform.prototype.buildDictionaryForUpdate = function( dictionaryExtension ){

    var dictionary = {};
    
    if ( dictionaryExtension ){
        utils.extend( dictionary, dictionaryExtension );
    }
    
    dictionary.records = this.getRecords();
    dictionary.field = this;
    dictionary.editable = ! this.isReadOnly();
    dictionary.instance = this;
    
    return dictionary;
};

Subform.prototype.isFiltered = function(){
    
    var filterComponent = this.getComponent( 'filtering' );
    return filterComponent && filterComponent.filterIsOn();
};

Subform.prototype.getFieldsSource = function(){
    return this.fieldsMap;
};

Subform.prototype.generateId = function(){
    return pageUtils.generateId();
};

Subform.prototype.getName = function(){
    return this.id;
};

Subform.prototype.showNewFormUsingRecordFromServer = function( type, event ){

    // Get the key of the record to get
    var key = pageUtils.getKeyFromButton( event );
    if ( key == undefined ){
        throw 'Error trying to load record in formPage: key is null!';
    }

    // Build the form instance
    this.currentFormPage = new FormPage( 
        this.page.getOptions(), 
        {
            type: type, 
            parentPage: this.page
        }
    ); 

    // Update form retrieving record from server
    this.currentFormPage.show( 
        {
            key: key, 
            getRecordURL: this.getRecordURL 
        }
    );
};

Subform.prototype.updateRecords = function( newRecordsArray ){
    this.page.updateRecordProperty( this.id, newRecordsArray );
};

Subform.prototype.isDirty = function(){
    
    var history = context.getHistory();
    return history? history.isSubformDirty( this.id ): false;
};

Subform.prototype.getToolbarButtons = function(){

    if ( this.toolbarButtons == undefined ){
        this.toolbarButtons = buttonUtils.getButtonList( 
            this.buttons.toolbar, 
            'subformToolbar', 
            this,
            this.page.getOptions() );
    }

    return this.toolbarButtons;
};

Subform.prototype.getByRowButtons = function(){

    if ( this.byRowButtons == undefined ){
        this.byRowButtons = buttonUtils.getButtonList( 
            this.buttons.byRow, 
            'subformRow', 
            this,
            this.page.getOptions() );
    }

    return this.byRowButtons;
};

Subform.prototype.bindButtonsEvent = function( buttons, $subform, params ){
    
    for ( var c = 0; c < buttons.length; ++c ){
        var button = buttons[ c ];
        this.bindButtonEvent( $subform, button, this, params );
    }
};

Subform.prototype.removeChanges = function(){
    
    context.getHistory().removeSubformChanges( 
        this.page.getId(), 
        this.id );
};

Subform.prototype.goToFirstPage = function(){

    var pagingComponent = this.getPagingComponent();
    if ( pagingComponent ){
        pagingComponent.goToFirstPage();
    }
};

Subform.prototype.getType = function(){
    return this.page.getType();
};
/*
Subform.prototype.getAsync = function( record, callback ){

    for ( var c = 0; c < this.fieldsArray.length; ++c ){
        var field = this.fieldsArray[ c ]
        if ( utils.isFunction( field.getAsync ) ){
            field.getAsync( record, callback );
        }
    }
};
*/
Subform.prototype.builNonDependentAsyncFieldList = function(){

    var result = [];

    for ( var c = 0; c < this.fieldsArray.length; ++c ){
        var field = this.fieldsArray[ c ]
        if ( utils.isFunction( field.builNonDependentAsyncFieldList ) ){
            result = result.concat(
                field.builNonDependentAsyncFieldList()
            );
        }
    }

    return result;
};

Subform.prototype.buildDependentAsyncFieldList = function( record ){

    var result = [];
    var subformRecords = this.getValueFromRecord( record );

    for ( var i = 0; i < subformRecords.length; i++ ) {
        var subformRecord = subformRecords[ i ];

        for ( var c = 0; c < this.fieldsArray.length; ++c ){
            var field = this.fieldsArray[ c ]
            if ( utils.isFunction( field.buildDependentAsyncFieldList ) ){
                result = result.concat(
                    field.buildDependentAsyncFieldList( subformRecord )
                );
            }
        }
    }

    return result;
};

/*
Subform.prototype.buildAsyncFieldList = function(){

    var result = [];

    for ( var c = 0; c < this.fieldsArray.length; ++c ){
        var field = this.fieldsArray[ c ]
        if ( utils.isFunction( field.buildAsyncFieldList ) ){
            result = result.concat(
                field.buildAsyncFieldList( subformRecord )
            );
        }
    }

    return result;
};
*/

module.exports = Subform;


},{"../../../lib/zzDOM-closures-full.js":61,"../buttons/buttonUtils.js":2,"../components/componentsMap.js":21,"../context.js":27,"../crudManager.js":28,"../history/composition.js":42,"../history/create.js":43,"../history/delete.js":44,"../pages/formPage.js":51,"../pages/pageUtils.js":54,"../utils.js":57,"../validationManager.js":58,"./field.js":33,"./fieldUtils.js":36,"zpt":135}],40:[function(_dereq_,module,exports){
/* 
    AbstractHistoryAction class
*/
'use strict';

var pageUtils = _dereq_( '../pages/pageUtils.js' );

var AbstractHistoryAction = function( historyToApply, recordIdToApply ){
    
    this.history = historyToApply;
    this.recordId = recordIdToApply;
    this.id = pageUtils.generateId();
};

AbstractHistoryAction.prototype.getId = function(){
    return this.id;
};

AbstractHistoryAction.prototype.getRecordId = function(){
    return this.recordId;
};

AbstractHistoryAction.prototype.undo = function(){
    throw 'Method undo not implemented!';
};

AbstractHistoryAction.prototype.redo = function(){
    throw 'Method redo not implemented!';
};

AbstractHistoryAction.prototype.isRelatedToField = function( rowIndexToCheck, nameToCheck, subformNameToCheck, subformRowIndexToCheck ){
    
    return this.rowIndex == rowIndexToCheck 
        && this.subformName == subformNameToCheck
        && this.subformRowIndex == subformRowIndexToCheck;
};

AbstractHistoryAction.prototype.isRelatedToRow = function( rowIndexToCheck, subformNameToCheck, subformRowIndexToCheck ){
    
    return this.rowIndex == rowIndexToCheck
        && this.subformName == subformNameToCheck 
        && this.subformRowIndex == subformRowIndexToCheck;
};

AbstractHistoryAction.prototype.doAction = function(){
    throw 'Method doAction not implemented!';
};

AbstractHistoryAction.prototype.doActionIfNotOff = function( actionsObject, records, historyCleaner, defaultValue, fieldsMap ){
    
    if ( historyCleaner.historyItemIsOn( this ) ){
        return this.doAction( actionsObject, records, defaultValue, fieldsMap );
    }
};

AbstractHistoryAction.prototype.getNewValue = function(){
    throw 'Method getNewValue not implemented!';
};

AbstractHistoryAction.prototype.saveEnabled = function(){
    throw 'Method saveEnabled not implemented!';
};

AbstractHistoryAction.prototype.isDirty = function(){
    throw 'Method isDirty not implemented!';
};

AbstractHistoryAction.prototype.getAtomicItems = function(){
    return [ this ];
};

AbstractHistoryAction.prototype.getCreationItems = function(){
    throw 'Method getCreationItems not implemented!';
};

AbstractHistoryAction.prototype.isNew = function(){
    return false;
};

AbstractHistoryAction.prototype.type = 'AbstractHistoryAction';

module.exports = AbstractHistoryAction;

},{"../pages/pageUtils.js":54}],41:[function(_dereq_,module,exports){
/*
    Change class
*/
'use strict';

//var $ = require( 'zzdom' );
var zzDOM = _dereq_( '../../../lib/zzDOM-closures-full.js' );
var $ = zzDOM.zz;
//var context = require( '../../../js/app/context.js' );
var AbstractHistoryAction = _dereq_( './abstractHistoryAction.js' );
//var fieldUtils = require( '../fields/fieldUtils.js' );
var utils = _dereq_( '../../../js/app/utils.js' );

var Change = function( historyToApply, optionsToApply, recordIdToApply, rowIndexToApply, nameToApply, newValueToApply, previousValueToApply, $thisToApply, fieldToApply, subformNameToApply, subformRowIndexToApply, subformRowKeyToApply ) {
    
    AbstractHistoryAction.call( this, historyToApply, recordIdToApply );
    
    this.options = optionsToApply;
    this.rowIndex = rowIndexToApply;
    this.name = nameToApply;
    this.newValue = newValueToApply;
    this.previousValue = previousValueToApply;
    this.$this = $thisToApply;
    this.field = fieldToApply;
    this.subformName = subformNameToApply;
    this.subformRowIndex = subformRowIndexToApply;
    this.subformRowKey = subformRowKeyToApply;

    this.updateCSS( true, true );
};

Change.prototype = new AbstractHistoryAction();
Change.prototype.constructor = Change;

Change.prototype.setValue = function( value ){

    this.field.setValueToForm(  
        value === undefined? null: value, 
        this.$this, 
        ! this.history.isFormMode(), 
        this.options );
};

Change.prototype.undo = function(){

    this.setValue( this.previousValue );

    var previousItem = this.history.getPreviousItem( 
        this.rowIndex, 
        this.name, 
        this.subformName, 
        this.subformRowIndex );
    
    this.updateCSS(
        previousItem? previousItem.isDirty(): false, 
        this.history.getPreviousRecordItem( 
            this.rowIndex, 
            this.subformName, 
            this.subformRowIndex ) );
};

Change.prototype.redo = function(){

    this.setValue( this.newValue );
    this.updateCSS( true, true );
};

Change.prototype.updateCSS = function( fieldChanged, registerChanged ){

    if ( ! this.$this ){
        return;
    }

    if ( this.history.isFormMode() && ! this.subformName ){
        if ( fieldChanged ){
            this.$this.parents( '.zcrud-field' ).first().addClass(
            //this.$this.closest( '.zcrud-field' ).addClass(
                this.history.getEditableOptions().modifiedFieldsClass
            );
        } else {
            this.$this.parents( '.zcrud-field' ).first().removeClass(
            //this.$this.closest( '.zcrud-field' ).removeClass(
                this.history.getEditableOptions().modifiedFieldsClass
            );
        }
        return;    
    }

    if ( fieldChanged ){
        this.$this.parents( 'td' ).first().addClass(
        //this.$this.closest( 'td' ).addClass(
            this.history.getEditableOptions().modifiedFieldsClass
        );
    } else {
        this.$this.parents( 'td' ).first().removeClass(
        //this.$this.closest( 'td' ).removeClass(
            this.history.getEditableOptions().modifiedFieldsClass
        );
    }

    if ( registerChanged ){
        this.$this.parents( 'tr' ).first().addClass(
        //this.$this.closest( 'tr' ).addClass(
            this.history.getEditableOptions().modifiedRowsClass
        );
    } else {
        this.$this.parents( 'tr' ).first().removeClass(
        //this.$this.closest( 'tr' ).removeClass(
            this.history.getEditableOptions().modifiedRowsClass
        );
    }
};

Change.prototype.getNewValue = function(){
    return this.newValue;
};

Change.prototype.doAction = function( actionsObject, records, defaultValue, fieldsMap ){

    // Build or get row and then attach it to actionsObject
    var row = this.history.buildAndAttachRowForDoAction( 
        actionsObject, 
        records, 
        this.rowIndex, 
        this.subformName, 
        this.subformRowIndex, 
        this.subformRowKey,
        undefined,
        true );

    //
    this.processDefaultValue( actionsObject, records, defaultValue, fieldsMap, row );
    
    // Set new value
    row[ this.name ] = this.newValue;
};

Change.prototype.processDefaultValue = function( actionsObject, records, defaultValue, fieldsMap, row ){

    // Return if it is not needed
    if ( ! utils.isEmptyObject( row ) || ! this.isNew( records ) ){
        return;
    }
    
    // Copy properties from defaultRow to row excluding arrays
    var defaultRow = this.subformName? 
                     this.buildSubformRowDefaultValue( defaultValue ):
                     this.buildFirstRowDefaultValue( defaultValue );
    this.copyProperties( defaultRow, row, false );
    
    // Add default subforms
    this.addDefaultSubformsToActionsObject( actionsObject, defaultValue, fieldsMap, row );
};

Change.prototype.addDefaultSubformsToActionsObject = function( actionsObject, defaultValue, fieldsMap, row ){
    
    for ( var id in defaultValue ){
        var value = defaultValue[ id ];
        var field = fieldsMap[ id ];

        if ( utils.isArray( value ) && field && field.type == 'subform' ){
            var subformActionsObject = this.history.buildEmptyActionsObject();
            row[ id ] = subformActionsObject;
            
            for ( var c = 0; c < value.length; ++c ){
                var arrayItem = value[ c ];
                subformActionsObject.new[ c ] = arrayItem;
            }
        }
    }
};

Change.prototype.buildSubformRowDefaultValue = function( defaultValue ){

    var subformRecords = defaultValue[ this.subformName ];
    if ( ! subformRecords ){
        return undefined;
    }
    
    var defaultSubformValue = subformRecords[ this.subformRowIndex ];
    if ( ! defaultSubformValue ){
        return undefined;
    }
    
    return this.buildFirstRowDefaultValue( defaultSubformValue );
};

Change.prototype.buildFirstRowDefaultValue = function( defaultValue ){
    
    var result = {};
    
    this.copyProperties( defaultValue, result, true );
    
    return result;
};

Change.prototype.copyProperties = function( from, to, excludeArrays ){

    if ( ! from ){
        return;
    }
    
    for ( var id in from ){
        var itemValue = from[ id ];
        if ( ! excludeArrays || ! utils.isArray( itemValue ) ){
            to[ id ] = itemValue;
        }
    }
};

Change.prototype.isNew = function( records ){
    return this.history.isNew( records, this.rowIndex );
};
/*
Change.prototype.isNew = function( records ){
    return ! records[ this.rowIndex ];
};
*/
Change.prototype.saveEnabled = function(){
    return true;
};

Change.prototype.isDirty = function(){
    return true;
};

Change.prototype.isRelatedToField = function( rowIndexToCheck, nameToCheck, subformNameToCheck, subformRowIndexToCheck ){

    return this.rowIndex == rowIndexToCheck 
        && this.name == nameToCheck
        && this.subformName == subformNameToCheck
        && this.subformRowIndex == subformRowIndexToCheck;
};

Change.prototype.getCreationItems = function(){
    return [];
};

Change.resetCSS = function( $list, editableOptions ){

    $list.find( '.' + editableOptions.modifiedFieldsClass ).removeClass( editableOptions.modifiedFieldsClass );
    $list.find( '.' + editableOptions.modifiedRowsClass ).removeClass( editableOptions.modifiedRowsClass );
};

Change.prototype.type = 'change';

module.exports = Change;
},{"../../../js/app/utils.js":57,"../../../lib/zzDOM-closures-full.js":61,"./abstractHistoryAction.js":40}],42:[function(_dereq_,module,exports){
/*
    Composition class
*/
'use strict';

//var context = require( '../context.js' );
var AbstractHistoryAction = _dereq_( './abstractHistoryAction.js' );

var Composition = function( historyToApply ) {
    
    AbstractHistoryAction.call( this, historyToApply );
    
    this.items = [];
};

Composition.prototype = new AbstractHistoryAction();
Composition.prototype.constructor = Composition;

Composition.prototype.add = function( item ){
    this.items.push( item );
};

Composition.prototype.runMethodForAll = function( name /*, args */ ){

    var args = Array.prototype.slice.call( arguments, 1 )[ 0 ];

    for ( var c = 0; c < this.items.length; ++c ){
        var thisItem = this.items[ c ];
        thisItem[ name ].apply( thisItem, args );
    }
};

Composition.prototype.runMethodForAllUsingOr = function( name /*, args */ ){

    var args = Array.prototype.slice.call( arguments, 1 )[ 0 ];

    for ( var c = 0; c < this.items.length; ++c ){
        var thisItem = this.items[ c ];
        var value = thisItem[ name ].apply( thisItem, args );
        if ( value ){
            return true;
        }
    }

    return false;
};

Composition.prototype.runMethodForAllUsingNotUndefined = function( name /*, args */ ){

    var args = Array.prototype.slice.call( arguments, 1 )[ 0 ];

    for ( var c = 0; c < this.items.length; ++c ){
        var thisItem = this.items[ c ];
        var value = thisItem[ name ].apply( thisItem, args );
        if ( value != undefined ){
            return value;
        }
    }

    return undefined;
};

Composition.prototype.undo = function(){
    this.runMethodForAll.apply( this, [ 'undo' ] );
};

Composition.prototype.redo = function(){
    this.runMethodForAll.apply( this, [ 'redo' ] );
};

/*
Composition.prototype.getNewValue = function( name ){
    return this.runMethodForAllUsingNotUndefined.apply( this, [ 'getNewValue', arguments ] );
};*/
Composition.prototype.getNewValue = function( rowIndexToGet, nameToGet, subformNameToGet, subformRowIndexToGet ){
    
    for ( var c = 0; c < this.items.length; ++c ){
        var item = this.items[ c ];
        if ( item.isRelatedToField( rowIndexToGet, nameToGet, subformNameToGet, subformRowIndexToGet ) ){
            return item.getNewValue( rowIndexToGet, nameToGet, subformNameToGet, subformRowIndexToGet );
        }
    }
    
    return undefined;
};

Composition.prototype.isRelatedToField = function(){
    return this.runMethodForAllUsingOr.apply( this, [ 'isRelatedToField', arguments ] );
};

Composition.prototype.isRelatedToRow = function(){
    return this.runMethodForAllUsingOr.apply( this, [ 'isRelatedToRow', arguments ] );
};

Composition.prototype.doAction = function(){
    this.runMethodForAll.apply( this, [ 'doAction', arguments ] );
};

Composition.prototype.doActionIfNotOff = function(){
    this.runMethodForAll.apply( this, [ 'doActionIfNotOff', arguments ] );
};

Composition.prototype.saveEnabled = function(){
    return true;
};

Composition.prototype.isDirty = function(){
    return this.runMethodForAllUsingOr.apply( this, [ 'isDirty', arguments ] );
};

Composition.prototype.getAtomicItems = function(){
    
    var result = [];
    
    for ( var c = 0; c < this.items.length; ++c ){
        var item = this.items[ c ];
        result = result.concat( item.getAtomicItems() );
    }
    
    return result;
};

Composition.prototype.getCreationItems = function( subformId ){
    
    var result = [];

    for ( var c = 0; c < this.items.length; ++c ){
        var item = this.items[ c ];
        result = result.concat( item.getCreationItems( subformId ) );
    }

    return result;
};

Composition.prototype.type = 'composition';

module.exports = Composition;
},{"./abstractHistoryAction.js":40}],43:[function(_dereq_,module,exports){
/*
    Create class
*/
'use strict';

var zpt = _dereq_( 'zpt' );
//var context = require( '../context.js' );
var AbstractHistoryAction = _dereq_( './abstractHistoryAction.js' );
var utils = _dereq_( '../utils.js' );

var Create = function( historyToApply, thisDictionaryToApply, $tbodyToApply, recordToApply, subformNameToApply ) {
    
    AbstractHistoryAction.call( this, historyToApply );
    
    this.thisDictionary = thisDictionaryToApply;
    this.$tbody = $tbodyToApply;
    this.record = recordToApply;
    this.subformName = subformNameToApply;
    this.isSubform = this.subformName !== undefined;
    
    this.$tr = undefined;
    this.rowIndex = 0;
    this.subformRowIndex = undefined;
    
    var buildDictionary = function( dictionary ){
        
        var result = utils.extend( {}, dictionary );
        result[ 'omitKey' ] = true;
        
        return result;
    };
    this.thisDictionary = buildDictionary( this.thisDictionary );
    
    this.addRow();
    this.recordId = this.$tr.attr( 'data-record-id' );
    this.updateCSS( true );
};

Create.prototype = new AbstractHistoryAction();
Create.prototype.constructor = Create;

Create.prototype.undo = function(){
    this.history.hideTr( this.$tr );
};

Create.prototype.redo = function(){
    this.history.showTr( this.$tr );
    this.updateCSS( true );
};

Create.prototype.addRow = function(){
    
    zpt.run({
        root: this.$tbody[ 0 ],
        dictionaryExtension: this.thisDictionary,
        notRemoveGeneratedTags: true
    });
    
    this.$tr = this.$tbody.find( 'tr.zcrud-data-row:last-child' );
    //this.$tr = this.$tbody.find( 'tr.zcrud-data-row:last' );

    var recordIndex = this.$tr.attr( 'data-record-index' );
    if ( this.isSubform ){
        this.subformRowIndex = recordIndex;
    } else {
        this.rowIndex = recordIndex;
    }
};

Create.prototype.updateCSS = function( visible ){

    if ( visible ){
        this.$tr.addClass( 
            this.history.getEditableOptions().modifiedRowsClass );
    } else {
        this.$tr.removeClass( 
            this.history.getEditableOptions().modifiedRowsClass );
    }
};

Create.prototype.getNewValue = function( rowIndexToGet, nameToGet, subformNameToGet, subformRowIndexToGet ){
    return this.record[ nameToGet ];
};

Create.prototype.doAction = function( actionsObject, records ){

    // Build or get row and then attach it to actionsObject
    this.history.buildAndAttachRowForDoAction( 
        actionsObject, 
        records, 
        this.rowIndex, 
        this.subformName, 
        this.subformRowIndex,
        undefined,
        this.record,
        false );
};

Create.prototype.get$Tr = function(){
    return this.$tr;
};

Create.prototype.saveEnabled = function(){
    return false;
};

Create.prototype.isDirty = function(){
    return false;
};

Create.prototype.updateFromChange = function( changeHistoryItem ){
    this.record[ changeHistoryItem.name ] = changeHistoryItem.newValue;
};

Create.prototype.getCreationItems = function( subformId ){
    return this.subformName == subformId? [ this ]: [];
};

Create.resetCSS = function(){};

Create.prototype.type = 'create';

module.exports = Create;

},{"../utils.js":57,"./abstractHistoryAction.js":40,"zpt":135}],44:[function(_dereq_,module,exports){
/*
    Delete class
*/
'use strict';

//var context = require( '../context.js' );
var AbstractHistoryAction = _dereq_( './abstractHistoryAction.js' );

var Delete = function( historyToApply, recordIdToApply, rowIndexToApply, keyToApply, $trToApply, subformNameToApply, subformRowIndexToApply ) {
    
    AbstractHistoryAction.call( this, historyToApply, recordIdToApply );
    
    this.rowIndex = rowIndexToApply;
    this.key = keyToApply;
    this.$tr = $trToApply;
    this.subformName = subformNameToApply;
    this.subformRowIndex = subformRowIndexToApply || 0;
    
    if ( this.$tr ){
        this.history.hideTr( this.$tr );
    }
};

Delete.prototype = new AbstractHistoryAction();
Delete.prototype.constructor = Delete;

Delete.prototype.undo = function(){
    this.history.showTr( this.$tr );
};

Delete.prototype.redo = function(){
    this.history.hideTr( this.$tr );
};

Delete.prototype.getNewValue = function(){
    return undefined;
};

Delete.prototype.isRelatedToField = function(){
    return false;
};

Delete.prototype.isRelatedToRow = function( rowIndexToCheck ){
    return this.rowIndex == rowIndexToCheck;
};

Delete.prototype.getDeletedMap = function( actionsObject, records ){

    var record = records[ this.rowIndex ];
    var map = record? actionsObject.modified: actionsObject.new;

    if ( ! map[ this.rowIndex ] || ! map[ this.rowIndex ][ this.subformName ] ){
        this.history.createNestedObject( 
            map, 
            [ this.rowIndex, this.subformName ], 
            this.history.buildEmptyActionsObject() );
    }

    return map[ this.rowIndex ][ this.subformName ].deleted;
};

Delete.prototype.doAction = function( actionsObject, records ){

    // The deleted row is new
    if ( this.key == undefined ){
        if ( this.subformName ){
            delete actionsObject.new[ 0 ][ this.subformName ].new[ this.subformRowIndex ];
            return;
        }
        throw 'No subform name found trying to delete subform row!';
    }
    
    // The deleted row is NOT new
    var deletedMap = 
        this.subformName? 
        this.getDeletedMap( actionsObject, records ):
        actionsObject.deleted;

    if ( deletedMap.indexOf( this.key ) == -1 ){
        deletedMap.push( this.key );
    }
};

Delete.prototype.get$Tr = function(){
    return this.$tr;
};

Delete.prototype.getKey = function(){
    return this.key;
};

Delete.prototype.saveEnabled = function(){
    return this.key !== undefined;
};

Delete.prototype.isDirty = function(){
    return false;
};

Delete.prototype.getCreationItems = function(){
    return [];
};

Delete.resetCSS = function(){};

Delete.prototype.type = 'delete';

module.exports = Delete;

},{"./abstractHistoryAction.js":40}],45:[function(_dereq_,module,exports){
/* 
    Class History 
*/
'use strict';

var HistoryChange = _dereq_( './change.js' );
var HistoryCreate = _dereq_( './create.js' );
var HistoryDelete = _dereq_( './delete.js' );
var HistoryCleaner = _dereq_( './historyCleaner.js' );
//var crudManager = require( '../crudManager.js' );
var context = _dereq_( '../context.js' );
//var $ = require( 'zzdom' );
var zzDOM = _dereq_( '../../../lib/zzDOM-closures-full.js' );
var $ = zzDOM.zz;
var utils = _dereq_( '../utils.js' );

var History = function( optionsToApply, editableOptionsToApply, dictionaryProviderToApply, formModeToApply ) {
    'use strict';
    
    var options = optionsToApply;
    var editableOptions = editableOptionsToApply;
    var dictionaryProvider = dictionaryProviderToApply;
    var formMode = formModeToApply;
    
    var getEditableOptions = function(){
        return editableOptions;
    };
    
    var isFormMode = function(){
        return formMode === true;
    };
    
    var items = [];
    var current = 0;
    var modified = {};
    
    var getModified = function(){
        return modified;
    };
    
    var isVoid = function( value ){
        return value == undefined || value == '';
    };
    
    var areEquivalent = function( value1, value2 ){
        
        var value1IsVoid = isVoid( value1 );
        var value2IsVoid = isVoid( value2 );
        
        return value1IsVoid || value2IsVoid? value1IsVoid && value2IsVoid: value1 === value2;
    };
    
    var isRepeated = function( newValue, rowIndex, name, subformName, subformRowIndex ){

        var previousItem = getPreviousItem( rowIndex, name, subformName, subformRowIndex );
        return previousItem? 
               newValue === previousItem.getNewValue( rowIndex, name, subformName, subformRowIndex ):
               areEquivalent( 
                    newValue, 
                    getValueFromRecord( rowIndex, name, subformName, subformRowIndex ) );
    };

    var buildNameObject = function( field ){

        var fullName = field.name;
        var subformSeparatorIndex = fullName.indexOf( context.subformSeparator );

        return {
            subformName: subformSeparatorIndex === -1? null: fullName.substring( 0, subformSeparatorIndex ),
            name: subformSeparatorIndex === -1? fullName: fullName.substring( 1 + subformSeparatorIndex )
        };
    };
    
    var putChange = function( $this, newValue, rowIndex, recordId, id, field, subformRowIndex, subformRowKey ) {
        
        // Build name object
        var nameObject = buildNameObject( field );
        
        // If repeated do nothing
        if ( isRepeated( newValue, rowIndex, nameObject.name, nameObject.subformName, subformRowIndex ) ){
            return undefined;
        }
        
        // Instance, put and return historyItem
        var historyItem = new HistoryChange(
            self,
            options,
            recordId,
            rowIndex,
            nameObject.name,
            newValue,
            getPreviousValue( 
                rowIndex, 
                nameObject.name, 
                nameObject.subformName, 
                subformRowIndex ),
            $this,
            field,
            nameObject.subformName,
            subformRowIndex,
            subformRowKey );
        
        put( id, historyItem );
        
        return historyItem;
    };
    
    var instanceChange = function( newValue, rowIndex, field, subformRowIndex, subformRowKey ) {

        // Build name object
        var nameObject = buildNameObject( field );
        
        // Instance and return historyItem
        var $this = undefined;
        var historyItem = new HistoryChange(
            self,
            options, 
            '1',
            rowIndex,
            nameObject.name,
            newValue,
            getPreviousValue( 
                rowIndex, 
                nameObject.name, 
                nameObject.subformName, 
                subformRowIndex ),
            $this,
            field,
            nameObject.subformName,
            subformRowIndex,
            subformRowKey );

        return historyItem;
    };
    
    var putCreate = function( id, thisDictionary, $selection, record, subformName ) {
        
        var historyItem = new HistoryCreate( 
            self,
            thisDictionary,
            $selection,
            record,
            subformName );

        put( id, historyItem );
        
        return historyItem;
    };
    
    var putDelete = function( id, recordId, rowIndex, key, $tr, field, subformRowIndex ) {

        var historyItem = new HistoryDelete( 
            self, 
            recordId,
            rowIndex, 
            key, 
            $tr,
            field? field.name: undefined, 
            subformRowIndex
        );

        put( id, historyItem );
        
        return historyItem;
    };
    
    var put = function( id, historyItem ) {

        // Add to items
        items[ current++ ] = historyItem;
        
        // Remove non accesible history items
        if ( isRedoEnabled() ){
            items.splice( current, items.length - current );
        }
        
        // Update CSS and HTML
        updateHTML( id );
    };
    
    var removeSubformChanges = function( id, subformName ) {
        
        // Fill the list of historyItem to remove
        var toRemove = [];
        for ( var c = 0; c < current; ++c ){
            var historyItem = items[ c ];
            if ( historyItem.type == 'change' && historyItem.subformName == subformName ){
                toRemove.push( c );
            }
        }

        // Remove history items
        for ( var i = 0; i < toRemove.length; ++i ){
            items.splice( i );
        }
        
        // Update current
        current -= toRemove.length;
            
        // Update CSS and HTML
        updateHTML( id );
    };
    
    var reset = function( id ){
        items = [];
        current = 0;
        modified = {};
        
        resetCSS( id );
        updateHTML( id, true );
    };
    
    var resetCSS = function( id ){
        
        var $list = $( '#' + id );
        
        HistoryChange.resetCSS( $list, editableOptions );
        HistoryCreate.resetCSS( $list, editableOptions );
        HistoryDelete.resetCSS( $list, editableOptions );
    };
    
    var getValueFromRecord = function( rowIndex, name, subformName, subformRowIndex ){
        
        var dictionary = dictionaryProvider.getInstanceDictionaryExtension();

        // Try to get the record
        try {
            var record = rowIndex? dictionary.records[ rowIndex ]: dictionary.record;
            
            if ( ! record ){
                return '';
            }
            
            if ( subformRowIndex ){
                record = record[ subformName ][ subformRowIndex ];
            }
        }
        catch ( error ) {
            // Nothing to do
        }
        
        var temp = record? record[ name ]: undefined;
        return temp !== undefined? temp:  '';
        //return record? record[ name ]: undefined;
    };
    
    var getPreviousValue = function( rowIndex, name, subformName, subformRowIndex ){

        var previousItem = getPreviousItem( rowIndex, name, subformName, subformRowIndex );
        return previousItem? 
               previousItem.getNewValue( rowIndex, name, subformName, subformRowIndex ): 
               getValueFromRecord( rowIndex, name, subformName, subformRowIndex  );
    };
    
    var getPreviousItem = function( rowIndex, name, subformName, subformRowIndex ){

        for ( var c = current - 1; c >= 0; --c ){
            var historyItem = items[ c ];
            if ( historyItem.isRelatedToField( rowIndex, name, subformName, subformRowIndex ) ){
                return historyItem;
            }
        }

        return undefined;
    };
    
    var getPreviousRecordItem = function( rowIndex, subformName, subformRowIndex ){

        for ( var c = current - 1; c >= 0; --c ){
            var historyItem = items[ c ];
            if ( historyItem.isRelatedToRow( rowIndex, subformName, subformRowIndex ) ){
                return historyItem;
            }
        }

        return undefined;
    };
    
    var isUndoEnabled = function(){
        return current > 0;
    };
    var undo = function( id ){
        
        var historyItem = isUndoEnabled()? items[ --current ]: undefined;
        if ( ! historyItem ){
            context.showError( options, false, 'Unable to undo!' );
            return;
        }

        historyItem.undo();
        
        updateHTML( id );
    };
    
    var isRedoEnabled = function(){
        return current < items.length;
    };
    var redo = function( id ){
        
        var historyItem = isRedoEnabled()? items[ current++ ]: undefined;
        if ( ! historyItem ){
            context.showError( options, false, 'Unable to redo!' );
            return;
        }

        historyItem.redo();
        
        updateHTML( id );
    };
    
    var getNumberOfUndo = function(){
        return current;
    };
    
    var getNumberOfRedo = function(){
        return items.length - current;
    };
    
    var getFixedPartOfButtonText = function( text, prefix ){
        
        var i = text.indexOf( prefix );
        return i == -1? text: text.substring( 0, i );
    };
    
    var updateButton = function( $list, selector, newNumber ){
        
        var $buttton = $list.find( selector );

        if ( ! $buttton.length ){
            return;
        }

        var text = $buttton.text();
        var fixedPart = getFixedPartOfButtonText( text, ' (' );
        
        $buttton.text( 
            newNumber == 0?
            fixedPart:
            fixedPart + ' (' + newNumber + ')');
        //$buttton[0].disabled = newNumber == 0;
        $buttton.prop( 'disabled', newNumber == 0 );
    };
    
    var updateHTML = function( id, removeHidden ){
        
        var $list = $( '#' + id );
        
        // Update numbers
        updateButton( $list, '.zcrud-undo-command-button', getNumberOfUndo() );
        updateButton( $list, '.zcrud-redo-command-button', getNumberOfRedo() );
        
        // Set disabled of save button
        /*
        var saveCommandButton = $list.find( '.zcrud-save-command-button' )[0];
        if ( saveCommandButton ){
            saveCommandButton.disabled = ! isSaveEnabled();
        }
        */
        $list.find( '.zcrud-save-command-button' ).prop( 'disabled', ! isSaveEnabled() );

        // Remove hidden trs
        if ( removeHidden ){
            $list.find( 'tr.zcrud-data-row.zcrud-hide-marker' ).remove();
            //$list.find( 'tr.zcrud-data-row:hidden' ).remove();
        }
    };
    
    var isSaveEnabled = function(){
        
        if ( current == 0 ){
            return false;
        }
        
        for ( var c = 0; c < current; ++c ){
            var historyItem = items[ c ];
            if ( historyItem.saveEnabled() ){
                return true;
            }
        }
        
        return false;
    };
    
    var buildEmptyActionsObject = function(){
        
        return {
            modified: {},
            new: {},
            deleted: []
        };
    };
    
    var hideTr = function( $tr ){
        $tr.addClass( 'zcrud-hide-marker' );
        editableOptions.hideTr( $tr );
    };
    
    var showTr = function( $tr ){
        $tr.removeClass( 'zcrud-hide-marker' );
        editableOptions.showTr( $tr );
    };
    
    // Function: createNestedObject( base, names[, value] )
    //   base: the object on which to create the hierarchy
    //   names: an array of strings contaning the names of the objects
    //   value (optional): if given, will be the last object in the hierarchy
    // Returns: the last object in the hierarchy
    var createNestedObject = function( base, names, value ) {
        
        // If a value is given, remove the last name and keep it for later:
        var lastName = arguments.length === 3 ? names.pop() : false;

        // Walk the hierarchy, creating new objects where needed.
        // If the lastName was removed, then the last object is not set yet:
        for( var i = 0; i < names.length; i++ ) {
            base = base[ names[i] ] = base[ names[i] ] || {};
        }

        // If a value was given, set it to the last name:
        if( lastName ) base = base[ lastName ] = value;

        // Return the last object in the hierarchy:
        return base;
    };
    
    var getAllTr$FromCreateItems = function( subformId ){

        var result = [];

        for ( var c = 0; c < current; ++c ){
            var historyItem = items[ c ];
            var creationHistoryItems = historyItem.getCreationItems( subformId );
            for ( var d = 0; d < creationHistoryItems.length; ++d ){
                var $tr = creationHistoryItems[ d ].get$Tr();
                if ( ! $tr.hasClass( 'zcrud-hide-marker' ) ){
                    result.push( $tr );
                }
            }
        }

        return result;
    };

    var buildActionsObject = function( records, defaultValue, fieldsMap ){
        
        var actionsObject = buildEmptyActionsObject();
        
        var historyCleaner = new HistoryCleaner();
        historyCleaner.run( buildIterator() );
        
        for ( var c = 0; c < current; ++c ){
            var historyItem = items[ c ];
            historyItem.doActionIfNotOff( actionsObject, records, historyCleaner, defaultValue, fieldsMap );
        }
        
        return actionsObject;
    };
    
    var buildAndAttachRowForDoAction = function( actionsObject, records, rowIndex, subformName, subformRowIndex, subformRowKey, record, searchRow ){

        var subformElementIsNew = subformRowKey == '' || ! subformRowKey? true: false;
        var map = getMap( actionsObject, records, rowIndex );
        var subformMapKey = subformName? getSubformMapKey( ! subformElementIsNew ): undefined;

        // Search row
        var row = undefined;
        if ( searchRow ){
            row = map[ rowIndex ];
            if ( subformName ){
                row = getSubformRow( 
                    row, 
                    subformMapKey, 
                    subformElementIsNew, 
                    subformName, 
                    subformRowIndex, 
                    subformRowKey );
            }
        }
        
        // Build empty row if not found
        if ( ! row ){
            row = record || {};
            if ( subformName ){
                pushNewSubformRow( 
                    map, 
                    row, 
                    subformMapKey, 
                    subformElementIsNew, 
                    subformName, 
                    rowIndex, 
                    subformRowIndex, 
                    subformRowKey );
            } else {
                map[ rowIndex ] = row;
            }
        }

        return row;
    };
    
    var isNew = function( records, rowIndex ){
        return ! records[ rowIndex ];
    };
    
    var getMap = function( actionsObject, records, rowIndex ){
        return isNew( records, rowIndex )? actionsObject.new: actionsObject.modified;
    };
    /*
    var getMap = function( actionsObject, records, rowIndex ){

        var record = records[ rowIndex ];
        return record? actionsObject.modified: actionsObject.new;
    };
    */
    var getSubformMapKey = function( exists ){
        return exists? 'modified': 'new';
    };
    
    var getSubformRow = function( row, subformMapKey, isNew, subformName, subformRowIndex, subformRowKey ){

        var lastKey = isNew? subformRowIndex: subformRowKey;

        if ( row && row[ subformName ] && row[ subformName ][ subformMapKey ] && row[ subformName ][ subformMapKey ][ lastKey ] ){
            row = row[ subformName ][ subformMapKey ][ lastKey ];
        } else {
            row = undefined;
        }

        return row;
    };
    
    var pushNewSubformRow = function( map, row, subformMapKey, isNew, subformName, rowIndex, subformRowIndex, subformRowKey ){

        var subformRows = undefined;
        if ( ! map[ rowIndex ] || ! map[ rowIndex ][ subformName ] ){
            var subformActionObject = createNestedObject( 
                map, 
                [ rowIndex, subformName ], 
                buildEmptyActionsObject() 
            );
            subformRows = subformActionObject[ subformMapKey ];
        } else {
            subformRows = map[ rowIndex ][ subformName ][ subformMapKey ];
        }
        subformRows[ isNew? subformRowIndex: subformRowKey ] = row;
    };
    
    var buildIterator = function(){
        
        var c = 0;

        return {
           next: function(){
               return c < current?
                    items[ c++ ]:
                    false;
           }
        }
    }
    
    var updateRecord = function( record, items, options ){
        
        for ( var id in items ){
            
            var item = items[ id ];
            
            if ( ! utils.isPlainObject( item ) ){
                record[ id ] = item;
                continue;
            }

            var fieldId = context.buildFieldIdFromSubformsRecordsId( options, id );
            if ( record[ fieldId ] == undefined ){
                record[ fieldId ] = [];
            }
            
            // Add new records
            record[ fieldId ] = record[ fieldId ].concat( item.newRecords );
            
            // Update modified records
            var keyField = options.fields[ fieldId ].subformKey;
            for ( var modifiedId in item.existingRecords ){
                var existingRecord = item.existingRecords[ modifiedId ];
                var done = false;
                var i = 0;
                while ( ! done ){
                    var row = record[ fieldId ][ i++ ];
                    if ( ! row ){
                        throw 'Error trying to update record: row not found!';
                    } else if ( row[ keyField ] == modifiedId ){
                        utils.extend( true, row, existingRecord );
                        done = true;
                    }
                }
            }
            
            // Delete removed records
            for ( var c = 0; c < item.recordsToRemove.length; ++c ){
                record[ fieldId ].splice( c, 1 );
            }
        } 
    };
    
    var isDirty = function(){
        return current > 0;
    };
    
    var isSubformDirty = function( subformName ){

        for ( var c = 0; c < current; ++c ){
            var historyItem = items[ c ];
            if ( historyItem.subformName == subformName ){
                return true;
            }
        }
        
        return false;
    };
    
    var getOptions = function(){
        return options;
    };
    
    var self = {
        putChange: putChange,
        putCreate: putCreate,
        putDelete: putDelete,
        put: put,
        removeSubformChanges: removeSubformChanges,
        undo: undo,
        redo: redo,
        isUndoEnabled: isUndoEnabled,
        isRedoEnabled: isRedoEnabled,
        //isSaveEnabled: isSaveEnabled,
        getNumberOfUndo: getNumberOfUndo,
        getNumberOfRedo: getNumberOfRedo,
        getModified: getModified,
        reset: reset,
        getPreviousItem: getPreviousItem,
        getPreviousRecordItem: getPreviousRecordItem,
        hideTr: hideTr,
        showTr: showTr,
        isFormMode: isFormMode,
        buildEmptyActionsObject: buildEmptyActionsObject,
        createNestedObject: createNestedObject,
        getAllTr$FromCreateItems: getAllTr$FromCreateItems,
        instanceChange: instanceChange,
        buildActionsObject: buildActionsObject,
        getSubformMapKey: getSubformMapKey,
        getMap: getMap,
        pushNewSubformRow: pushNewSubformRow,
        buildAndAttachRowForDoAction: buildAndAttachRowForDoAction,
        getEditableOptions: getEditableOptions,
        buildIterator: buildIterator,
        updateRecord: updateRecord,
        isDirty: isDirty,
        isSubformDirty: isSubformDirty,
        getOptions: getOptions,
        isNew: isNew
    };
    
    return self;
};

History.updateRecordsMap = function( records, jsonObject, keyField ){

    var diff = 0;
    
    for ( var id in jsonObject.existingRecords ){
        var record = jsonObject.existingRecords[ id ];
        var currentRecord = records[ id ];
        records[ id ] = utils.extend( true, {}, currentRecord, record );
    }
    /*
    $.each( jsonObject.existingRecords, function ( id, record ) {
        var currentRecord = records[ id ];
        records[ id ] = utils.extend( true, {}, currentRecord, record );
    });
    */
   
    for ( var c = 0; c < jsonObject.newRecords.length; ++c ){
        var currentRecord = jsonObject.newRecords[ c ];
        var key = currentRecord[ keyField ];
        records[ key ] = currentRecord;
        ++diff;
    }

    for ( c = 0; c < jsonObject.recordsToRemove.length; ++c ){
        delete records[ jsonObject.recordsToRemove[ c ] ];
        --diff;
    }
    
    return diff;
};

module.exports = History;

},{"../../../lib/zzDOM-closures-full.js":61,"../context.js":27,"../utils.js":57,"./change.js":41,"./create.js":43,"./delete.js":44,"./historyCleaner.js":46}],46:[function(_dereq_,module,exports){
/*
    HistoryCleaner class
*/
'use strict';

//var context = require( '../context.js' );

var HistoryCleaner = function() {
    
    //var history = historyToApply;
    var data = {};
    var offItems = {};

    var run = function( iterator ){
        
        buildData( iterator );
        analyzeData();
    };    
        
    var buildData = function( iterator ){
        
        data = {};
        
        //var iterator = history.buildIterator();
        var historyItem = iterator.next();
        
        while ( historyItem ){
            var items = historyItem.getAtomicItems();
            for ( var c = 0; c < items.length; c++ ){
                add( items[ c ] );
            }
            historyItem = iterator.next();
        }
    };
  
    var add = function( item ){
        
        var index = item.getRecordId();
        var entry = data[ index ];
        
        if ( ! entry ){
            entry = [];
            data[ index ] = entry;
        }
        
        entry.push( item );
    };
    
    var analyzeData = function(){
        
        offItems = {};
        
        for ( var recordId in data ){
            var recordItems = data[ recordId ];
            
            var firstItemIsCreate = recordItems[ 0 ].type == 'create';
            var lastItemIsDelete = recordItems[ recordItems.length - 1 ].type == 'delete';
            
            if ( lastItemIsDelete ){
                offBeforeDeleteItems( recordItems, firstItemIsCreate );
            } 
            /*
            else if ( firstItemIsCreate ){
                offChangeItems( recordItems );
            }*/
        }
    };
    
    var offBeforeDeleteItems = function( recordItems, firstItemIsCreate ){
        
        // Don't include last item in loop!
        for ( var c = 0; c < recordItems.length - 1; c++ ){
            var item = recordItems[ c ];
            offItems[ item.getId() ] = true;
        }
        
        // If the first item is a create item the delete item (the last one) must also be off
        if ( firstItemIsCreate ){
            item = recordItems[ recordItems.length - 1 ];
            offItems[ item.getId() ] = true;
        }
    };
    /*
    var offChangeItems = function( recordItems ){
        
        var createItem = recordItems[ 0 ];
        
        // Update createItem and off the change
        // Don't include first item in loop! (it is the create item)
        for ( var c = 1; c < recordItems.length; c++ ){
            var item = recordItems[ c ];
            createItem.updateFromChange( item );
            offItems[ item.getId() ] = true;
        }
    };
    */
    var historyItemIsOn = function( historyItem ){
        return ! offItems[ historyItem.getId() ];
    };
    
    return {
        run: run,
        historyItemIsOn: historyItemIsOn
    };
};

module.exports = HistoryCleaner;
},{}],47:[function(_dereq_,module,exports){
/* 
    Class defaultJSONBuilder 
*/
'use strict';

var HistoryDelete = _dereq_( '../history/delete.js' );
//var $ = require( 'zzdom' );
//var zzDOM = require( '../../../lib/zzDOM-closures-full.js' );
//var $ = zzDOM.zz;
var context = _dereq_( '../context.js' );
var utils = _dereq_( '../utils.js' );

module.exports = (function() {
    
    var buildEmpty = function(){
        
        return {
            existingRecords: {},
            newRecords: [],
            recordsToRemove: []
        };
    };
    
    var buildJSONForRemoving = function( recordsToRemove ){
        
        var data = buildEmpty();
        data.recordsToRemove = recordsToRemove;
        return data;
    };
    /*
    var getFieldFromFieldsArray = function( fields, id ){
        
        for ( var c = 0; c < fields.length; c++ ) {
            var field = fields[ c ];
            if ( field.id == id ){
                return field;
            }
        }
        
        return null;
    };
    */
    var filterSubforms = function( row, fields, options ){
        
        var result = utils.extend( true, {}, row );
        
        for ( var c = 0; c < fields.length; c++ ) {
            var field = fields[ c ];
            if ( field.type === 'subform' ){
                var fieldId = buildSubformRecordsId( field, options );
                var value = row[ fieldId ];
                if ( value !== undefined ){
                    result[ fieldId ] = value;
                }
                delete result[ field.id ];
            }
        }
        
        return result;
    };
    
    var build1Row = function( actionsObject, records, sendOnlyModified, keyField, fields, options ){
        
        var jsonObject = buildEmpty();
        
        // Build modified
        for ( var rowIndex in actionsObject.modified ){
            var row = actionsObject.modified[ rowIndex ];
            var record = records[ rowIndex ];
            var key = record[ keyField ];

            if ( key == undefined ){
                throw 'Undefined key found trying to build JSON!';
            }
            
            if ( actionsObject.deleted.indexOf( key ) != -1 ){
                continue;
            }

            if ( ! sendOnlyModified ){
                row = utils.extend( true, {}, record, row );
            }
            //jsonObject.existingRecords[ key ] = filterSubforms( row, fields );
            //jsonObject.existingRecords[ key ] = row;
            
            buildSubformsRow( row, record, sendOnlyModified, fields, options  );
            jsonObject.existingRecords[ key ] = filterSubforms( row, fields, options );
        }

        // Build new
        for ( rowIndex in actionsObject.new ){
            row = actionsObject.new[ rowIndex ];
            key = row[ keyField ];

            //jsonObject.newRecords.push( filterSubforms( row, fields ) );
            //jsonObject.newRecords.push( row );
            
            buildNewSubformsRow( row, sendOnlyModified, fields, options  );
            jsonObject.newRecords.push( filterSubforms( row, fields, options ) );
        }
        
        // Build delete
        if ( actionsObject.deleted ){
            jsonObject.recordsToRemove = actionsObject.deleted;
        }
        
        return jsonObject;
    };
    
    var buildSubformRecordsId = function( field, options ){
        return context.buildSubformsRecordsIdFromFieldId( options, field.id );
    };
    
    var buildNewSubformsRow = function( row, sendOnlyModified, fields, options ){

        for ( var c = 0; c < fields.length; c++ ) {
            var field = fields[ c ];
            if ( field.type == 'subform' && row[ field.id ] ){
                var subform = build1Row( 
                    row[ field.id ], 
                    {}, 
                    sendOnlyModified, 
                    field.subformKey, 
                    buildFieldArrayFromMap( field.fields ),
                    options
                );
                row[ buildSubformRecordsId( field, options ) ] = subform;
            }
        }
    };
    
    var buildSubformsRow = function( row, record, sendOnlyModified, fields, options ){
    
        for ( var c = 0; c < fields.length; c++ ) {
            var field = fields[ c ];
            if ( field.type == 'subform' && row[ field.id ] ){
            //if ( field.type == 'subform' && record[ field.id ] && row[ field.id ] ){
                var subform = build1Row( 
                    row[ field.id ], 
                    buildRecordsMap( 
                        record[ field.id ], 
                        field.subformKey ), 
                    sendOnlyModified, 
                    field.subformKey, 
                    buildFieldArrayFromMap( field.fields ),
                    options
                );
                row[ buildSubformRecordsId( field, options ) ] = subform;
            }
        }
    };
    
    var buildFieldArrayFromMap = function( fieldMap ){
        
        var result = [];
        for ( var index in fieldMap ){
            var field = fieldMap[ index ];
            result.push( field );
        }
        return result;
    };
    
    var buildRecordsMap = function( recordsArray, keyField ){
        
        var recordsMap = {};
        
        if ( recordsArray ){
            for ( var c = 0; c < recordsArray.length; c++ ) {
                var record = recordsArray[ c ];
                if ( record ){
                    var key = record[ keyField ];
                    recordsMap[ key ] = record;
                }
            }
        }
        return recordsMap;
    };
    
    var buildJSONForAll = function( sendOnlyModified, keyField, records, fields, forcedActionsObject, history, defaultValue, fieldsMap ){
        
        var actionsObject = forcedActionsObject || history.buildActionsObject( records, defaultValue, fieldsMap );

        // Build jsonObject now
        var jsonObject = build1Row( 
            actionsObject, 
            records, 
            sendOnlyModified, 
            keyField, 
            fields,
            history.getOptions()
        );

        // Return false if there is no record to modify, to create or to delete
        if ( Object.keys( jsonObject.existingRecords ).length == 0 
            && jsonObject.newRecords.length == 0 
            && jsonObject.recordsToRemove.length == 0 ){
            return false;
        }
        return jsonObject;
    };
    
    var buildJSONForAddRecordMethod = function( record ){

        var data = buildEmpty();
        data.newRecords.push( record );
        return data;
    };
    
    var buildJSONForUpdateRecordMethod = function( sendOnlyModified, keyField, currentRecord, editedRecord, fieldsMap, fields, history ){

        // Build actionsObject
        var records = [ currentRecord ];
        var actionsObject = history.buildEmptyActionsObject();
        
        for ( var id in editedRecord ){
            var newValue = editedRecord[ id ];
            var currentValue = currentRecord[ id ];
            if ( newValue != currentValue ){
                var field = fieldsMap[ id ];
                
                if ( field.type == 'subform' ){
                    buildSubform( actionsObject, records, field, currentValue, newValue, field.subformKey, history );
                    
                } else {
                    var historyItem = history.instanceChange( 
                        newValue, 
                        0,
                        field );
                    historyItem.doAction( actionsObject, records );
                }
            }
        }
        /*
        $.each( editedRecord, function ( id, newValue ) {
            
            var currentValue = currentRecord[ id ];
            if ( newValue != currentValue ){
                var field = fieldsMap[ id ];
                
                if ( field.type == 'subform' ){
                    buildSubform( actionsObject, records, field, currentValue, newValue, field.subformKey, history );
                    
                } else {
                    var historyItem = history.instanceChange( 
                        newValue, 
                        0,
                        field );
                    historyItem.doAction( actionsObject, records );
                }
            }
        });
        */
        
        return buildJSONForAll( 
            sendOnlyModified,
            keyField,  
            records, 
            fields,
            actionsObject,
            history
        );
    };
    
    var buildMap = function( rows, keyField ){
        
        var object = {};
        for ( var rowIndex = 0; rowIndex < rows.length; ++rowIndex ){
            var row = rows[ rowIndex ];
            var key = row[ keyField ];
            object[ key ] = row;
        }
        return object;
    };
    
    var buildSubform = function( actionsObject, records, field, currentRows, newRows, keyField, history ){
        
        var currentRowsMap = buildMap( currentRows, keyField );
        var newRowsMap = buildMap( newRows, keyField );
        var historyItem = undefined;
        var rowIndex = undefined;
        var newRow = undefined;
        var currentRow = undefined;
        var key = undefined;
        
        for ( rowIndex = 0; rowIndex < newRows.length; ++rowIndex ){
            newRow = newRows[ rowIndex ];
            key = newRow[ keyField ];
            currentRow = currentRowsMap[ key ];
            
            if ( currentRow === undefined ){
                // new row
                buildSubform_creates( actionsObject, records, newRow, rowIndex, field.fields, history );

            } else {
                // update row
                buildSubform_updates( actionsObject, records, newRow, currentRow, rowIndex, field.fields, field, history );
            }
        }
        
        for ( rowIndex = 0; rowIndex < currentRows.length; ++rowIndex ){
            currentRow = currentRows[ rowIndex ];
            key = currentRow[ keyField ];
            newRow = newRowsMap[ key ];
            
            if ( newRow === undefined ){
                // delete row
                historyItem = new HistoryDelete( 
                    self, 
                    rowIndex,
                    0, 
                    key, 
                    undefined,
                    field.name );
                historyItem.doAction( actionsObject, records );
            }
        }
    };
    
    var buildSubform_creates = function( actionsObject, records, newRow, rowIndex, fields, history ){

        var id = undefined;
        var idsDone = {};

        for ( id in newRow ){
            if( newRow.hasOwnProperty( id ) ){
                var historyItem = history.instanceChange( 
                    newRow[ id ], 
                    0, 
                    fields[ id ], 
                    rowIndex, 
                    undefined );
                historyItem.doAction( actionsObject, records );
                idsDone[ id ] = true;
            }
        }
    };
    
    var buildSubform_updates = function( actionsObject, records, newRow, currentRow, rowIndex, fields, parentField, history ){
        
        var id = undefined;
        var historyItem = undefined;
        var idsDone = {};
        
        for ( id in newRow ){
            if( newRow.hasOwnProperty( id ) ){
                if( newRow[ id ] !== currentRow[ id ] ){
                    historyItem = history.instanceChange( 
                        newRow[ id ], 
                        0, 
                        fields[ id ], 
                        rowIndex, 
                        newRow[ parentField.subformKey ] );
                    historyItem.doAction( actionsObject, records );
                    idsDone[ id ] = true;
                }
            }
        }
    };
    
    var getRecordFromJSON = function( jsonObject, formType, record, history, options ){

        switch ( formType ) {
            case 'create':
                return jsonObject.newRecords[ 0 ];
            case 'update':
                return jsonObject.existingRecords[ Object.keys( jsonObject.existingRecords )[ 0 ] ];
            case 'delete':
                return jsonObject.recordsToRemove[ 0 ];
            case 'customForm':
                history.updateRecord( 
                    record, 
                    jsonObject.newRecords[ 0 ] || jsonObject.existingRecords[ Object.keys( jsonObject.existingRecords )[ 0 ] ],
                    options
                );
                return record;
            default:
                throw 'Unknown FormPage type: ' + formType;
        }
    };
    
    var self = {
        buildJSONForAll: buildJSONForAll,
        buildJSONForRemoving: buildJSONForRemoving,
        buildJSONForAddRecordMethod: buildJSONForAddRecordMethod,
        buildJSONForUpdateRecordMethod: buildJSONForUpdateRecordMethod,
        getRecordFromJSON: getRecordFromJSON
    };
    
    return self;
})();


},{"../context.js":27,"../history/delete.js":44,"../utils.js":57}],48:[function(_dereq_,module,exports){
/* 
    Class onlyChangesJSONBuilder
*/
'use strict';

var defaultJSONBuilder = _dereq_( './defaultJSONBuilder.js' );

module.exports = (function() {
    
    var sendOnlyModified = true;
    
    var buildJSONForRemoving = function( recordsToRemove ){
        return defaultJSONBuilder.buildJSONForRemoving( recordsToRemove );
    };

    var buildJSONForAll = function( keyField, records, fields, forcedActionsObject, history, defaultValue, fieldsMap ){
        return defaultJSONBuilder.buildJSONForAll( sendOnlyModified, keyField, records, fields, forcedActionsObject, history, defaultValue, fieldsMap );
    };
    
    var buildJSONForAddRecordMethod = function( record ){
        return defaultJSONBuilder.buildJSONForAddRecordMethod( record );
    };
    
    var buildJSONForUpdateRecordMethod = function( keyField, currentRecord, editedRecord, fieldsMap, fields, history ){
        return defaultJSONBuilder.buildJSONForUpdateRecordMethod( sendOnlyModified, keyField, currentRecord, editedRecord, fieldsMap, fields, history );
    };
    
    var getRecordFromJSON = function( jsonObject, formType, record, history, options ){
        return defaultJSONBuilder.getRecordFromJSON( jsonObject, formType, record, history, options );
    };
    
    var self = {
        buildJSONForAll: buildJSONForAll,
        buildJSONForRemoving: buildJSONForRemoving,
        buildJSONForAddRecordMethod: buildJSONForAddRecordMethod,
        buildJSONForUpdateRecordMethod: buildJSONForUpdateRecordMethod,
        getRecordFromJSON: getRecordFromJSON
    };
    
    return self;
})();


},{"./defaultJSONBuilder.js":47}],49:[function(_dereq_,module,exports){
/* 
    Main class of ZCrud
*/
'use strict';

var zpt = _dereq_( 'zpt' );
var log = zpt.logHelper;
var context = _dereq_( './context.js' );
var ListPage = _dereq_( './pages/listPage.js' );
var FormPage = _dereq_( './pages/formPage.js' );
var normalizer = _dereq_( './normalizer.js' );
var fieldBuilder = _dereq_( './fields/fieldBuilder' );
var defaultOptions = _dereq_( './defaultOptions.js' );
var utils = _dereq_( './utils.js' );

exports.version = '0.2.0-SNAPSHOT';

exports.init = function( userOptions, callback, failCallback ){
    
    // Register in options.dictionary I18n instances
    var initI18n = function( dictionary ){

        // Build the list of file paths
        var fileNames = options.i18n.files[ options.i18n.language ];
        if ( ! fileNames ){
            throw( 'No file names set to init i18n subsystem!' );
        }

        // Build ZPT options
        var zptOptions = {
            command: 'preload',
            root: document.body,
            //root: ( options.target? options.target[0]: null ) || options.body,
            dictionary: dictionary,
            declaredRemotePageUrls: options.allDeclaredRemotePageUrls,
            notRemoveGeneratedTags: true,
            i18n: {
                urlPrefix: options.filesPathPrefix + options.i18n.filesPath,
                files: {}
            },
            callback: function(){
                context.setI18nArray( dictionary.i18nArray );
                if ( callback && utils.isFunction( callback ) ){
                    callback( options );
                }
            },
            failCallback: function( msg ){
                if ( failCallback && utils.isFunction( failCallback ) ){
                    failCallback( msg );
                }
            }
        };
        zptOptions.i18n.files[ options.i18n.language ] = fileNames;
        if ( options.templates.filesPath ){
            zpt.context.getConf().externalMacroPrefixURL = options.filesPathPrefix + options.templates.filesPath;
        }
                    
        // Init ZPT parser
        zpt.run( zptOptions );
    };

    // Init options
    var options = utils.extend( true, {}, defaultOptions, userOptions );
    
    // Init dictionary, set in context and remove 
    var dictionary = options.dictionary;
    dictionary.options = options;
    context.setDictionary( dictionary );
    delete options.dictionary;
    
    // Configure logging
    zpt.context.getConf().loggingOn = options.logging.isOn;
    zpt.context.getConf().loggingLevel = utils.buildLoggingLevel( options.logging.level );

    log.info( 'Initializing ZCrud...' );
    
    // Register all field managers
    fieldBuilder.registerAllConstructors( options.fieldsConfig.constructors );
    context.setFieldBuilder( fieldBuilder );
    
    // Normalize options
    normalizer.run( options, userOptions );
    
    // Init I18n
    initI18n( dictionary );
    
    log.info( '...ZCrud initialized.' );
    
    return options;
};

exports.renderList = function( options, data, callback ){

    try {
        log.info( 'Rendering list...' );

        var listPage =  new ListPage( options, data );
        context.putPage( listPage.getId(), listPage );
        listPage.show( 
            {
                callback: callback
            } 
        );

        log.info( '...list rendering finished.' );
        
    } catch ( e ) {
        context.showError( 
            options, 
            false, 
            'Error trying to render list: ' + ( e.message || e )
        );
    }
};

exports.renderForm = function( options, data, callback ){

    try {
        log.info( 'Rendering form...' );

        data = data || {};
        data.type = 'customForm';
        var formPage = new FormPage( options, data ); 

        context.putPage( formPage.getId(), formPage );
        formPage.show( 
            {
                callback: callback
            } 
        );

        log.info( '...form rendering finished.' );
        
    } catch ( e ) {
        context.showError( 
            options, 
            false, 
            'Error trying to render form: ' + ( e.message || e )
        );
    }
};

exports.destroy = function( options ){
    options.target.empty();
};

exports.showCreateForm = function( listPageIdSource ){
    
    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        //alert( 'No list found using that source:' + listPageIdSource );
        context.showError( 
            options, 
            false, 
            'No list found using that source:' + listPageIdSource
        );
        return;
    }
    listPage.showCreateForm();
};

exports.showUpdateForm = function( listPageIdSource, key ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    listPage.showEditForm( undefined, key );
};

exports.showDeleteForm = function( listPageIdSource, key ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    listPage.showDeleteForm( undefined, key );
};

exports.getRecordByKey = function( listPageIdSource, key ){
    
    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    return listPage.getRecordByKey( key );
};

exports.getRecords = function( listPageIdSource ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    return listPage.getRecordsArray();
};

exports.getRowByKey = function( listPageIdSource, key ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    return listPage.getRowByKey( key );
};

exports.selectRecords = function( listPageIdSource, rows ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    listPage.getSecureComponent( 'selecting' ).selectRecords( rows );
};

exports.deselectRecords = function( listPageIdSource, rows ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    listPage.getSecureComponent( 'selecting' ).deselectRecords( rows );
};

exports.selectRows = function( listPageIdSource, rows ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    listPage.getSecureComponent( 'selecting' ).selectRows( rows );
};

exports.deselectRows = function( listPageIdSource, rows ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    listPage.getSecureComponent( 'selecting' ).deselectRows( rows );
};

exports.getSelectedRows = function( listPageIdSource ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    return listPage.getSecureComponent( 'selecting' ).getSelectedRows();
};

exports.getSelectedRecords = function( listPageIdSource ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    return listPage.getSecureComponent( 'selecting' ).getSelectedRecords();
};

var recordOperationCommon = function( listPageIdSource, data, checkRecord, checkKey, method, type ){
    
    if ( checkRecord && ! data.record ){
        alert( 'Record not set in ' + method + ' method!' );
        return false;
    }
    
    if ( checkKey && ! data.key ){
        alert( 'Key not set in ' + method + ' method!' );
        return false;
    }
    
    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return false;
    }
    
    return listPage.instanceNewForm( type, data.key );
};

exports.addRecord = function( listPageIdSource, data ){
    
    var formPage = recordOperationCommon( listPageIdSource, data, true, false, 'addRecord', 'create' );
    if ( formPage ){
        formPage.addRecord( data );
    }
};

exports.updateRecord = function( listPageIdSource, data ){
    
    var formPage = recordOperationCommon( listPageIdSource, data, true, true, 'updateRecord', 'update' );
    if ( formPage ){
        formPage.updateRecord( data );
    }
};

exports.deleteRecord = function( listPageIdSource, data ){

    var formPage = recordOperationCommon( listPageIdSource, data, false, true, 'deleteRecord', 'delete' );
    if ( formPage ){
        formPage.deleteRecord( data );
    }
};

exports.getListPage = function( listPageIdSource ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    return listPage;
};

exports.getFormPage = function( formPageIdSource ){

    var formPage = context.getFormPage( formPageIdSource );
    if ( ! formPage ){
        alert( 'No form found using that source:' + formPageIdSource );
        return;
    }
    return formPage;
};

exports.utils = utils;

},{"./context.js":27,"./defaultOptions.js":29,"./fields/fieldBuilder":34,"./normalizer.js":50,"./pages/formPage.js":51,"./pages/listPage.js":52,"./utils.js":57,"zpt":135}],50:[function(_dereq_,module,exports){
/* 
    normalizer singleton class
*/
'use strict';

var context = _dereq_( './context.js' );
var utils = _dereq_( './utils.js' );

module.exports = (function() {

    // Normalizes some options (sets default values)
    var run = function( options, userOptions ) {
        
        normalizeGeneralOptions( options );
        
        options.fields = normalizeFieldGroupOptions( options.fields, options );
        
        normalizePagesOptions( options );
        
        normalizeGeneralOptionsPostFields( options );
        
        fixArrays( options, userOptions );
    };

    // Rewrite arrays in userOptions to options
    var fixArrays = function( options, userOptions ) {
        
        for ( var id in userOptions ){
            var value = userOptions[ id ];
            if ( utils.isArray( value ) ){
                options[ id ] = value;
            } else if ( utils.isPlainObject( value ) ) {
                fixArrays( options[ id ], userOptions[ id ] );
            }
        }
    };
    
    // Normalizes some general options (non related to fields)
    var normalizeGeneralOptions = function( options ) {

        if ( options.formId == undefined ){
            options.formId = 'zcrud-form-' + options.entityId;
        }

        // Normalize list options
        var listOptions = options.pageConf.pages.list;
        if ( listOptions.formId == undefined ){
            listOptions.formId = 'zcrud-list-form-' + options.entityId;
        }
        if ( listOptions.id == undefined ){
            listOptions.id = 'zcrud-list-' + options.entityId;
        }
        if ( listOptions.tableId == undefined ){
            listOptions.tableId = 'zcrud-list-table-' + options.entityId;
        }
        if ( listOptions.tbodyId == undefined ){
            listOptions.tbodyId = 'zcrud-list-tbody-' + options.entityId;
        }
    };
    
    var normalizeFieldGroupOptions = function ( fields, options, parent ) {

        var fieldInstances = {};
        
        for ( var fieldId in fields ){
            fieldInstances[ fieldId ] = buildFullFieldInstance(
                fieldId,
                fields[ fieldId ],
                options,
                parent
            );
        }
        /*
        $.each( fields, function ( fieldId, field ) {
            fieldInstances[ fieldId ] = buildFullFieldInstance( fieldId, field, options, parent );
        });
        */

        return fieldInstances;
    };
    
    var buildFullFieldInstance = function( id, field, options, parent ){
        
        field = copyDefaultFieldProperties( field, options );
        
        var newFieldInstance = buildFieldInstance( id, field );
        
        normalizeFieldInstance( id, newFieldInstance, options, parent );
        
        return newFieldInstance;
    };
    
    var buildFieldInstance = function ( id, field ) {

        // Set id
        field.id = id;

        // Set type
        if ( field.type == undefined ) {
            field.type = 'text';
        }
        
        return context.getFieldBuilder().createFieldInstance( field );
    };

    // Normalizes some options for a field (sets default values)
    var normalizeFieldInstance = function ( id, field, options, parent ) {

        // Set the name
        field.name = parent? parent.id + context.subformSeparator + id: id;
        
        // Set defaults when undefined
        if ( field.elementId == undefined ) {
            field.elementId = 'zcrud-' + id;
        }
        if ( field.template == undefined ){
            field.template = field.getTemplate( options );
        }
        if ( field.viewTemplate == undefined ){
            field.viewTemplate = field.getViewTemplate();
        }
        context.declareRemotePageUrl( field.template, options.templates.declaredRemotePageUrls );
        if ( field.attributes == undefined ){
            field.attributes = {};
        }
        if ( field.sorting == undefined ){
            field.sorting = true;
        }

        // Convert dependsOn to array if it's a comma separated lists
        if ( field.dependsOn && utils.isString( field.dependsOn ) ) {
            var dependsOnArray = field.dependsOn.split( ',' );
            field.dependsOn = [];
            for ( var i = 0; i < dependsOnArray.length; i++ ) {
                field.dependsOn.push( dependsOnArray[ i ].trim() );
            }
        }
        
        // Normalize components if any
        if ( field.components ){
            field.components = utils.extend( true, {}, options.defaultComponentsConfig, field.components );
        }
        
        // Normalize subfields in this field
        if ( field.fields ){
            field.fields = normalizeFieldGroupOptions( field.fields, options, field );
        }
    };
    
    var copyDefaultFieldProperties = function( field, options ){

        var defaultFieldOptions = options.fieldsConfig.defaultFieldOptions[ field.type ];
        if ( ! defaultFieldOptions ){
            return field;
        }

        return utils.extend( true, {}, defaultFieldOptions, field );
    };
    
    var normalizeGeneralOptionsPostFields = function( options ) {

        // Add remote page URLs to allDeclaredRemotePageUrls array
        options.allDeclaredRemotePageUrls = options.templates.declaredRemotePageUrls.slice();
        //context.declareRemotePageUrl( options.templates.busyTemplate, options.allDeclaredRemotePageUrls );

        for ( var i in options.pageConf.pages ) {
            var template = options.pageConf.pages[ i ].template;
            context.declareRemotePageUrl( template, options.allDeclaredRemotePageUrls );
        }
        
        for ( i in options.containers.types ) {
            template = options.containers.types[ i ].template;
            context.declareRemotePageUrl( template, options.allDeclaredRemotePageUrls );
        }
    };

    var normalizePagesOptions = function( options ){
        
        var defaultPageConf = options.pageConf.defaultPageConf;
        var defaultComponentsConfig = options.defaultComponentsConfig;
        for ( var pageId in options.pageConf.pages ){
            var page = options.pageConf.pages[ pageId ];
            var pageConf = utils.extend( true, {}, defaultPageConf, page );
            options.pageConf.pages[ pageId ] = pageConf;
            var componentsConf = utils.extend( true, {}, defaultComponentsConfig, pageConf.components );
            pageConf.components = componentsConf;
        }
        /*
        $.each( options.pageConf.pages, function ( pageId, page ) {
            var pageConf = utils.extend( true, {}, defaultPageConf, page );
            options.pageConf.pages[ pageId ] = pageConf;
            var componentsConf = utils.extend( true, {}, defaultComponentsConfig, pageConf.components );
            pageConf.components = componentsConf;
        });
        */
    };
    
    return {
        run: run,
        buildFullFieldInstance: buildFullFieldInstance
    };
})();

},{"./context.js":27,"./utils.js":57}],51:[function(_dereq_,module,exports){
/* 
    Class FormPage
*/
'use strict';

var context = _dereq_( '../context.js' );
var pageUtils = _dereq_( './pageUtils.js' );
var Page = _dereq_( './page.js' );
var validationManager = _dereq_( '../validationManager.js' );
//var $ = require( 'zzdom' );
var zzDOM = _dereq_( '../../../lib/zzDOM-closures-full.js' );
var $ = zzDOM.zz;
var zpt = _dereq_( 'zpt' );
var crudManager = _dereq_( '../crudManager.js' );
var History = _dereq_( '../history/history.js' );
var fieldListBuilder = _dereq_( '../fields/fieldListBuilder.js' );
var fieldUtils = _dereq_( '../fields/fieldUtils.js' );
var ComponentsMap = _dereq_( '../components/componentsMap.js' );
var utils = _dereq_( '../utils.js' );

var FormPage = function ( optionsToApply, userDataToApply ) {
    
    Page.call( this, optionsToApply, userDataToApply );
    
    this.type;
    this.parentPage;
    this.record;
    this.userRecord;
    this.loadAtFirstExecution;
    this.isFirstExecution = true;
    this.id = this.options.formId;
    this.title = undefined;
    this.submitFunction = undefined;
    this.view = undefined;
    this.successMessage = undefined;
    this.eventFunction = undefined;
    this.omitKey = false;
    this.forceKey = false;
    
    this.initFromOptions( userDataToApply || {} );
    this.configure();
};
Page.doSuperClassOf( FormPage );

FormPage.prototype.initFromOptions = function( userData ){

    this.type = userData.type; 
    this.parentPage = userData.parentPage;
    this.userRecord = userData.record;
    this.loadAtFirstExecution = userData.load == undefined? true: userData.load;
};
    
FormPage.prototype.getParentPage = function(){
    return this.parentPage;
};
    
FormPage.prototype.getType = function(){
    return this.type;
};
    
FormPage.prototype.setRecord = function( recordToApply ){
    this.record = recordToApply;
};

FormPage.prototype.getRecord = function(){
    return this.record;
};
FormPage.prototype.updateRecordProperty = function( id, value ){

    if ( ! this.record ){
        this.record = {};
    }

    this.record[ id ] = value;
};
    
FormPage.prototype.get$form = function(){
    return $( '#' + this.id );
};
    
FormPage.prototype.getTitle = function(){
    return this.title;
};

FormPage.prototype.getSubmitFunction = function(){
    return this.submitFunction;
};
    

FormPage.prototype.getView = function(){
    return this.view;
};
    
FormPage.prototype.getField = function( fieldId, parentId ){
    return parentId? this.fieldsMap[ parentId ].fields[ fieldId ]: this.fieldsMap[ fieldId ];
};

FormPage.prototype.getFieldByName = function( fieldName ){

    // Must remove [] and its contents
    var arraySeparatorIndex = fieldName.indexOf( '[' );
    var tempFieldName = arraySeparatorIndex === -1? fieldName: fieldName.substring( 0, arraySeparatorIndex );

    // Get parent
    var parentSeparatorIndex = tempFieldName.indexOf( context.subformSeparator );
    var parentId = parentSeparatorIndex === -1? null: tempFieldName.substring( 0, parentSeparatorIndex );
    if ( parentSeparatorIndex !== -1 ){
        tempFieldName = tempFieldName.substring( 1 + parentSeparatorIndex );
    }

    return this.getField( tempFieldName, parentId );
};

FormPage.prototype.getParentFieldByName = function( fieldName ){

    // Must remove [] and its contents
    var arraySeparatorIndex = fieldName.indexOf( '[' );
    var tempFieldName = arraySeparatorIndex === -1? fieldName: fieldName.substring( 0, arraySeparatorIndex );

    // Get parent
    var parentSeparatorIndex = tempFieldName.indexOf( context.subformSeparator );
    var parentId = parentSeparatorIndex === -1? null: tempFieldName.substring( 0, parentSeparatorIndex );

    return parentId? this.fieldsMap[ parentId ]: null;
};
    
// Configure instance depending on type parameter
FormPage.prototype.configure = function(){
        
    this.thisOptions = this.options.pageConf.pages[ this.type ];
    this.buildFields();

    switch ( this.type ) {
        case 'create':
            this.title = 'Create form';
            this.submitFunction = this.submitCreate;
            this.eventFunction = this.options.events.recordAdded;
            this.successMessage = 'createSuccess';
            if ( ! this.userRecord ) {
                this.userRecord = fieldUtils.buildDefaultValuesRecord( this.fields );
            }
            this.omitKey = true;
            break;
        case 'update':
            this.title = 'Edit form';
            this.submitFunction = this.submitUpdate;
            this.eventFunction = this.options.events.recordUpdated;
            this.successMessage = 'updateSuccess';
            break;
        case 'delete':
            this.title = 'Delete form';
            this.submitFunction = this.submitDelete;
            this.eventFunction = this.options.events.recordDeleted;
            this.successMessage = 'deleteSuccess';
            break;
        case 'customForm':
            this.title = 'Custom form';
            this.submitFunction = this.submitCustomForm;
            this.eventFunction = this.options.events.formBatchUpdated;
            this.successMessage = 'formListUpdateSuccess';
            if ( ! this.record ) {
                this.record = fieldUtils.buildDefaultValuesRecord( this.fields );
            }
            this.forceKey = true;
            break; 
        default:
            throw 'Unknown FormPage type: ' + this.type;
    }

    this.componentsMap = new ComponentsMap( 
        this.options, 
        this.thisOptions.components, 
        this, 
        this );

    context.setHistory(
        new History( 
            this.options, 
            this.thisOptions,
            this, 
            true ) 
    );
};

FormPage.prototype.buildFields = function(){

    var fieldsCache = fieldListBuilder.getForPage( this.type, this.options, undefined, this );
    this.fields = fieldsCache.fieldsArray;
    this.fieldsMap = fieldsCache.fieldsMap;
    this.view = fieldsCache.view;
};
    
FormPage.prototype.buildDataUsingRecord = function( recordToUse ) {

    var data = {};

    data.result = 'OK';
    data.message = '';
    data.record = recordToUse;
    data.fieldsData = {}; // TODO Build this object with data from recordToUse

    return data;
};
    
FormPage.prototype.showUsingRecord = function( recordToUse, dictionaryExtension, root, callback, dataFromServer ) {

    this.beforeProcessTemplate( recordToUse, dictionaryExtension, dataFromServer );

    var self = this;
    this.run1RecordAsync(
        recordToUse,
        function(){
            self.processTemplate( root );
            self.afterProcessTemplate( self.get$form() );
        
            if ( callback ){
                callback( true );
            }
        }
    );
};

FormPage.prototype.processTemplate = function( root ) {
    
    if ( ! root ){
        pageUtils.configureTemplate( 
            this.options, 
            "'" + this.thisOptions.template + "'" );
    }

    zpt.run({
        root: root || ( this.options.target? this.options.target[0]: null ) || document.body,
        dictionaryExtension: this.instanceDictionaryExtension
    });
};

FormPage.prototype.show = function( params ){

    // Init params
    params = params || {};
    var dictionaryExtension = params.dictionaryExtension;
    var root = params.root;
    var callback = params.callback;
    var key = params.key;
    var getRecordURL = params.getRecordURL;

    // Show form using user record
    if ( this.userRecord ){
        this.showUsingRecord( this.userRecord, dictionaryExtension, root, callback );
        this.isFirstExecution = false;
        return;
    }

    // Show form using no record
    if ( this.isFirstExecution && ! this.loadAtFirstExecution ){
        this.showUsingRecord( [], dictionaryExtension, root, callback );
        this.isFirstExecution = false;
        return;
    }

    // Show form using record from server
    this.showUsingServer( key, getRecordURL, dictionaryExtension, root, callback );
    this.isFirstExecution = false;
};
    
FormPage.prototype.buildSearch = function( key ){

    var search = {};

    if ( key != undefined ){
        search.key = key;
    }

    this.componentsMap.addToDataToSend( search );

    this.addToDataToSend( search );

    return search;
};
    
FormPage.prototype.showUsingServer = function( key, getRecordURL, dictionaryExtension, root, callback ) {

    // Get the record from the server and show the form
    var instance = this;
    crudManager.getRecord( 
        {
            url: getRecordURL || this.thisOptions.getRecordURL,
            search: this.buildSearch( key ),
            success: function( dataFromServer ){
                instance.showUsingRecord.call( 
                    instance,
                    dataFromServer.record, 
                    dictionaryExtension, 
                    root, 
                    callback, 
                    dataFromServer
                );
            },
            error: function( dataFromServer ){
                context.showError( 
                    instance.options, 
                    false, 
                    dataFromServer.message || 'Server communication error!'
                );
            }
        }, 
        this.options 
    );
};

FormPage.prototype.buildRecordForDictionary = function(){

    var newRecord = {};

    for ( var c = 0; c < this.fields.length; c++ ) {
        var field = this.fields[ c ];
        newRecord[ field.id ] = this.record[ field.id ];
    }

    // Add key if there is no field key
    var key = this.getKey();
    if ( newRecord[ key ] == undefined ){
        newRecord[ key ] = this.record[ key ];
    }

    return newRecord;
};

FormPage.prototype.updateDictionary = function( dictionaryExtension ){
    
    this.instanceDictionaryExtension = {};
    this.instanceDictionaryExtension.instance = this;
    this.instanceDictionaryExtension.record = this.buildRecordForDictionary();

    // Set omitKey to true to make default value of subforms to work
    if ( this.omitKey ){
        this.instanceDictionaryExtension.omitKey = true;
    }

    if ( dictionaryExtension ){
        utils.extend( this.instanceDictionaryExtension, dictionaryExtension );
    }
};

FormPage.prototype.buildProcessTemplateParams = function( field ){

    return {
        field: field, 
        value: this.record[ field.id ],
        options: this.options,
        record: this.record,
        source: this.type,
        dictionary: context.getDictionary(),
        formPage: this
    };
};
    
FormPage.prototype.beforeProcessTemplate = function( recordToUse, dictionaryExtension, dataFromServer ){
    
    // Update record
    if ( ! recordToUse ){
        throw 'No record to show in form!';
    }
    this.record = recordToUse;
    
    // Add a default key if needed
    if ( this.forceKey && this.record[ this.getKey() ] == undefined ){
        this.record[ this.getKey() ] = 0;
    }
    
    // Process dataFromServer
    if ( dataFromServer ){
        this.filterRecordFromServerData( dataFromServer.record, this.fields );
    } else {
        dataFromServer = this.buildDataUsingRecord( this.record );
    }
    this.processDataFromServer( dataFromServer );
    
    this.updateDictionary( dictionaryExtension );
};
    
FormPage.prototype.afterProcessTemplate = function( $form ){

    validationManager.initFormValidation( this.id, $form, this.options );
    this.bindEvents( $form );

    for ( var c = 0; c < this.fields.length; c++ ) {
        var field = this.fields[ c ];
        field.afterProcessTemplateForField(
            this.buildProcessTemplateParams( field ),
            $form
        );
    }

    this.triggerFormCreatedEvent( $form );
};
    
FormPage.prototype.bindButtonEvent = function( $form, button ){

    // Return if the button does not implement run method
    if ( ! utils.isFunction( button.run ) ){
        return;    
    }

    var instance = this;
    $form
        .find( button.getSelector() )
        .off()
        .on(
            'click',
            function( event ){
                button.run( event, instance, $form, this );     
            }
        );
};

FormPage.prototype.bindEvents = function( $form ) {

    // Bind events of buttons
    var buttons = this.getToolbarButtons();
    for ( var c = 0; c < buttons.length; ++c ){
        var button = buttons[ c ];
        this.bindButtonEvent( $form, button );
    }

    // Build the selector, is a bit complex
    var nameNot = ':not([name*="' + context.subformSeparator + '"])'; // Must exclude fields in subforms
    var selector = `input.historyField${nameNot}, textarea.historyField${nameNot}, select.historyField${nameNot}`;

    // Bind change event
    var instance = this;
    $form
        .find( selector )
        //.find( 'input.historyField, textarea.historyField, select.historyField' )
        //.not( "[name*='" + context.subformSeparator + "']" )  // Must exclude fields in subforms
        .on(
            'change',
            function ( event ) {
                //var disableHistory = utils.getParam( params, 'disableHistory' );
                var disableHistory = utils.getParam( event.params, 'disableHistory' );
                if ( disableHistory ){
                    return;
                }
                var $this = $( this );
                var field = instance.getFieldByName.call( instance, $this.attr( 'name' ) );
                //var field = instance.getFieldByName.call( instance, $this.prop( 'name' ) );
                context.getHistory().putChange( 
                    $this, 
                    field.getValueForHistory( $this ), 
                    0,
                    '1',
                    instance.id,
                    field );
            }
        );

    // Bind events of components
    this.componentsMap.bindEvents();
};
    
FormPage.prototype.updateRecordFromJSON = function( jsonObject ) {

    switch ( this.type ) {
        case 'create':
        case 'update':
        case 'customForm':
            this.record = context.getJSONBuilder( this.options ).getRecordFromJSON( 
                jsonObject, 
                this.type, 
                this.record, 
                context.getHistory(),
                this.options
            );
            break;
        case 'delete':
            // Nothing to do
            break;
        default:
            throw 'Unknown FormPage type in updateRecordFromJSON method: ' + this.type;
    }
};

FormPage.prototype.saveCommon = function( elementId, event, jsonObject, $form ){

    // Return if there is no operation to do
    if ( ! jsonObject ){
        context.showError(
            this.options,
            false,
            context.translate( 'errorNoOpToDo' )
            //'No operation to do!'
        );
        return false;
    }

    // Add filter if needed
    this.componentsMap.addToDataToSend( jsonObject );

    // Add success and error functions to data if not present yet. Add URL to data if not present yet
    var userSuccess = jsonObject.success;
    var userError = jsonObject.error;

    var instance = this;
    jsonObject.success = function( dataFromServer ){

        // Update record if needed
        instance.updateRecordFromJSON.call( instance, jsonObject );

        // Trigger events
        instance.eventFunction.call(
            instance,
            {
                record: instance.record,
                serverResponse: dataFromServer,
                options: instance.options
            }, 
            event 
        );
        instance.triggerFormClosedEvent.call( instance, event, $form );

        // Show list or update status
        instance.updatePage.call( instance, dataFromServer, jsonObject );

        context.getHistory().reset( elementId );

        if ( userSuccess ){
            userSuccess();
        }
    };

    jsonObject.error = function( request, status, error ){
        pageUtils.ajaxError( request, status, error, instance.options, context, userError );
    };

    if ( jsonObject.url == undefined ){
        jsonObject.url = this.thisOptions.updateURL;
    }
    
    // Do the CRUD!
    crudManager.batchUpdate( 
        jsonObject, 
        this.options, 
        {
            $form: $form,
            formType: this.type,
            dataToSend: jsonObject,
            options: this.options
        }
    );

    return jsonObject;
};
    
FormPage.prototype.updatePage = function( dataFromServer, jsonObject ){

    var dictionaryExtension = {
        status: {
            message: this.successMessage,
            date: new Date().toLocaleString()
        }
    };

    if ( ! this.parentPage ){
        this.showStatusMessage( dictionaryExtension );
        this.updateKeys( dataFromServer );
        return;
    }

    if ( dataFromServer.clientOnly ){
        this.parentPage.showFromClientOnly( dictionaryExtension, jsonObject );
    } else {
        this.parentPage.show( 
            {
                dictionaryExtension: dictionaryExtension
            }
        );
    }
};
    
FormPage.prototype.updateKeys = function( dataFromServer ){

    var subformsDataFromServer = dataFromServer.subforms;
    if ( ! subformsDataFromServer ){
        return;
    }

    for ( var c = 0; c < this.fields.length; c++ ) {
        var field = this.fields[ c ];
        var dataFromServerOfField = subformsDataFromServer[ field.id ];
        if ( dataFromServerOfField ){
            this.updateKeysForField( field, dataFromServerOfField );
        }
    }
};
    
FormPage.prototype.updateKeysForField = function( field, dataFromServerOfField ){

    // Get records an $trArray
    var records = dataFromServerOfField.newRecords;
    var $trArray = context.getHistory().getAllTr$FromCreateItems( field.id );

    // Check lengths are equals
    if ( $trArray.length != records.length ){
        context.showError( 
            this.options, 
            true, 
            'Error trying to update keys of field "' + field.id + '": $trArray and records length does not match!' 
        );
        return;
    }

    // Iterate and update field values and data-record-key attr
    var key = field.subformKey;
    for ( var c = 0; c < records.length; ++c ){
        var record = records[ c ];
        var $tr = $trArray[ c ];
        var value = record[ key ];

        // Check key value is not undefined
        if ( value == undefined ){
            context.showError( 
                this.options, 
                true, 
                'Error trying to update keys of field "' + field.id + '": undefined key value found!' );
            return;
        }

        // Update key value of field
        $tr.find( '[name="' + key + '"]' ).val( value );

        // Update key value in attribute of $tr
        $tr.attr( 'data-record-key', value );
    }
};
    
FormPage.prototype.processDataFromServer = function( data ){

    for ( var c = 0; c < this.fields.length; c++ ) {
        var field = this.fields[ c ];
        field.dataFromServer( data );
    }
};

FormPage.prototype.submitCustomForm = function( event, $form ){

    var instance = this;
    this.processDirty(
        this.thisOptions.confirm.save,
        'OnlyForm',
        function(){
            instance.doSubmitCustomForm( event, $form );
        }
    );
};
FormPage.prototype.doSubmitCustomForm = function( event, $form ){
    
    return this.saveCommon( 
        this.id, 
        event,
        context.getJSONBuilder( this.options ).buildJSONForAll( 
            this.getKey(),
            [ this.record ],
            this.fields,
            undefined,
            context.getHistory(),
            {}
        ),
        $form 
    );
};
    
FormPage.prototype.submitCreate = function( event, $form ){

    var instance = this;
    this.processDirty(
        this.thisOptions.confirm.save,
        'Create',
        function(){
            instance.doSubmitCreate( event, $form );
        }
    );
};
FormPage.prototype.doSubmitCreate = function( event, $form ){

    return this.saveCommon( 
        this.id, 
        event,
        context.getJSONBuilder( this.options ).buildJSONForAll( 
            this.getKey(), 
            [ ],
            this.fields,
            undefined,
            context.getHistory(),
            this.userRecord,
            this.fieldsMap
        ),
        $form 
    );
};

FormPage.prototype.addRecord = function( userData ){

    var event = undefined;
    var $form = this.get$form();
    var jsonObject = context.getJSONBuilder( this.options ).buildJSONForAddRecordMethod( userData.record );

    this.addAllRecordMethodProperties( userData, jsonObject );

    return this.saveCommon( 
        this.id, 
        event,
        jsonObject,
        $form 
    );
};
    
FormPage.prototype.addAllRecordMethodProperties = function( fromObject, toObject ){
    this.addProperties( fromObject, toObject, [ 'clientOnly', 'url', 'success', 'error' ] );
};
FormPage.prototype.addProperties = function( fromObject, toObject, properties ){

    for ( var c = 0; c < properties.length; ++c ){
        var property = properties[ c ];
        var value = fromObject[ property ];
        if ( value != undefined ){
            toObject[ property ] = value;
        }
    }
};
    
FormPage.prototype.submitUpdate = function( event, $form ){
    
    var instance = this;
    this.processDirty(
        this.thisOptions.confirm.save,
        'Update',
        function(){
            instance.doSubmitUpdate( event, $form );
        }
    );
};
FormPage.prototype.doSubmitUpdate = function( event, $form ){

    return this.saveCommon( 
        this.id, 
        event,
        context.getJSONBuilder( this.options ).buildJSONForAll(
            this.getKey(), 
            [ this.record ], 
            this.fields,
            undefined,
            context.getHistory()
        ),
        $form 
    );
};

FormPage.prototype.updateRecord = function( userData ){

    if ( ! userData ){
        context.showError( this.options, true, 'Data configuration undefined in updateRecord method!' );
        return;
    }

    var event = undefined;
    var $form = this.get$form();

    if ( ! this.userRecord ){
        context.showError( this.options, true, 'Current record not found in updateRecord method!' );
        return;
    }

    var jsonObject = context.getJSONBuilder( this.options ).buildJSONForUpdateRecordMethod( 
        this.getKey(),
        this.userRecord,
        userData.record,
        this.fieldsMap,
        this.fields,
        context.getHistory()
    );

    this.addAllRecordMethodProperties( userData, jsonObject );

    return this.saveCommon( 
        this.id, 
        event,
        jsonObject,
        $form 
    );
};
    
FormPage.prototype.submitDelete = function( event, $form ){

    var instance = this;
    this.processDirty(
        this.thisOptions.confirm.save,
        'Delete',
        function(){
            instance.doSubmitDelete( event, $form );
        }, 
        true
    );
};
FormPage.prototype.doSubmitDelete = function( event, $form ){

    return this.saveCommon( 
        this.id, 
        event,
        context.getJSONBuilder( this.options ).buildJSONForRemoving(
            [ this.getKeyValue() ] ),
        $form 
    );
};

FormPage.prototype.deleteRecord = function( userData ){

    var event = undefined;
    var $form = this.get$form();
    var jsonObject = context.getJSONBuilder( this.options ).buildJSONForRemoving(
        [ userData.key ] );

    this.addAllRecordMethodProperties( userData, jsonObject );

    return this.saveCommon( 
        this.id, 
        event,
        jsonObject,
        $form 
    );
};
    
FormPage.prototype.cancelForm = function( event, $form ){

    var instance = this;
    this.processDirty(
        this.thisOptions.confirm.cancel,
        'Cancel',
        function(){
            instance.doCancelForm( event, $form );
        }
    );
};
FormPage.prototype.doCancelForm = function( event, $form ){
    
    this.triggerFormClosedEvent( event, $form );
    context.getHistory().reset( this.id );
    this.parentPage.show();
};

/* Events */
FormPage.prototype.triggerFormClosedEvent = function( event, $form ){

    this.options.events.formClosed( 
        {
            $form: $form,
            formType: this.type,
            options: this.options
        },
        event 
    );
};
FormPage.prototype.triggerFormCreatedEvent = function( $form ){

    this.options.events.formCreated(
        {
            $form: $form,
            formType: this.type,
            options: this.options
        }
    );
};
    
FormPage.prototype.getFieldValue = function( fieldId ){
    return this.record[ fieldId ];
};
    
FormPage.prototype.getKeyValue = function(){
    return this.record[ this.getKey() ];
};
    
FormPage.prototype.isReadOnly = function(){
    return !! this.thisOptions.readOnly || this.type == 'delete';
};
    
FormPage.prototype.addToDataToSend = function( dataToSend ){

    for ( var c = 0; c < this.fields.length; c++ ) {
        var field = this.fields[ c ];
        var fieldDataToSend = field.buildDataToSend();

        if ( fieldDataToSend && ! utils.isEmptyObject( fieldDataToSend ) ){
            this.addFieldToDataToSend( dataToSend, fieldDataToSend, field );
        }
    }
};

FormPage.prototype.addFieldToDataToSend = function( dataToSend, fieldDataToSend, field ){
    
    if ( ! dataToSend.searchFieldsData ){
        dataToSend.searchFieldsData = {};
    }
    
    dataToSend.searchFieldsData[ field.id ] = fieldDataToSend;
};

FormPage.prototype.getToolbarButtons = function(){
    return this.getPageToolbarButtons( 'formToolbar' );
};
    
FormPage.prototype.update = function(){

    this.show(
        {
            root: this.get$().find( '.zcrud-form-updatable' )[0]
        }
    );
};

FormPage.prototype.removeChanges = function(){
    context.getHistory().reset( this.id );
};
    
FormPage.prototype.goToFirstPage = function(){

    for ( var c = 0; c < this.fields.length; c++ ) {
        var field = this.fields[ c ];
        field.goToFirstPage();
    }
};

module.exports = FormPage;

},{"../../../lib/zzDOM-closures-full.js":61,"../components/componentsMap.js":21,"../context.js":27,"../crudManager.js":28,"../fields/fieldListBuilder.js":35,"../fields/fieldUtils.js":36,"../history/history.js":45,"../utils.js":57,"../validationManager.js":58,"./page.js":53,"./pageUtils.js":54,"zpt":135}],52:[function(_dereq_,module,exports){
/* 
    Class ListPage 
*/
'use strict';

var context = _dereq_( '../context.js' );
var pageUtils = _dereq_( './pageUtils.js' );
var Page = _dereq_( './page.js' );
var FormPage = _dereq_( './formPage.js' );
var crudManager = _dereq_( '../crudManager.js' );
var History = _dereq_( '../history/history.js' );
var fieldListBuilder = _dereq_( '../fields/fieldListBuilder.js' );
var ComponentsMap = _dereq_( '../components/componentsMap.js' );
var buttonUtils = _dereq_( '../buttons/buttonUtils.js' );
//var $ = require( 'zzdom' );
var zzDOM = _dereq_( '../../../lib/zzDOM-closures-full.js' );
var $ = zzDOM.zz;
var zpt = _dereq_( 'zpt' );
var utils = _dereq_( '../utils.js' );

var ListPage = function ( optionsToApply, userDataToApply ) {
    
    Page.call( this, optionsToApply, userDataToApply );
    
    this.isFirstExecution = true;
    this.thisOptions = this.options.pageConf.pages.list;
    this.records = {};
    this.id = this.thisOptions.id;
    this.currentFormPage = undefined;
    this.byRowButtons = undefined;
    
    this.initFromOptions( userDataToApply || {} );
    this.configure();
}
Page.doSuperClassOf( ListPage );
    
ListPage.prototype.initFromOptions = function( userData ){

    userData = userData || {};
    this.filter = userData.filter || {};
    this.userRecords = userData.records;
    this.loadAtFirstExecution = userData.load == undefined? true: userData.load;
};

ListPage.prototype.getField = function( fieldId ){
    return this.fieldsMap[ fieldId ];
};
ListPage.prototype.getFieldByName = function( fieldName ){

    // Must remove [] and its contents
    var index = fieldName.indexOf( '[' );
    return this.getField( index === -1? fieldName: fieldName.substring( 0, index ) );
};

ListPage.prototype.getCurrentFormPage = function(){
    return this.currentFormPage;
};
    
// Initial configuration
ListPage.prototype.configure = function(){

    this.buildFields();
    this.componentsMap = new ComponentsMap( this.options, this.thisOptions.components, this, this );
};

ListPage.prototype.buildFields = function(){

    var fieldsCache = fieldListBuilder.getForPage( 'list', this.options, undefined, this );
    this.fields = fieldsCache.fieldsArray;
    this.fieldsMap = fieldsCache.fieldsMap;
};
    
ListPage.prototype.buildDataToSend = function(){

    var data = {};

    data.filter = this.filter;
    this.componentsMap.addToDataToSend( data );

    return data;
};
    
ListPage.prototype.buildDataFromClient = function( dataToSendToServer, recordsDiff ) {

    var data = {};

    data.result = 'OK';
    data.message = '';
    data.records = this.buildRecordsArray();
    data.totalNumberOfRecords = recordsDiff + this.getTotalNumberOfRecords();

    return data;
};
    
ListPage.prototype.showFromClientOnly = function ( dictionaryExtension, dataToSendToServer ) {

    var recordsDiff = History.updateRecordsMap( this.records, dataToSendToServer, this.options.key );

    this.clientAndServerSuccessFunction( 
        this.buildDataFromClient( dataToSendToServer, recordsDiff ),
        dictionaryExtension );
};
    
ListPage.prototype.getRecordsPaging = function( recordsArray, data ){

    if ( data.pageNumber && data.pageSize ){
        var firstElementIndex = ( data.pageNumber - 1 ) * data.pageSize;
        return recordsArray.slice(
            firstElementIndex, 
            firstElementIndex + data.pageSize ); 
    }

    return recordsArray;
};
    
ListPage.prototype.buildDataUsingRecords = function( recordsToUse ) {

    var data = {};

    data.result = 'OK';
    data.message = '';
    data.records = this.getRecordsPaging( recordsToUse, this.buildDataToSend() );
    data.totalNumberOfRecords = recordsToUse.length;

    return data;
};
    
ListPage.prototype.showUsingRecords = function ( recordsToUse, dictionaryExtension, root, callback ) {

    this.clientAndServerSuccessFunction( 
        this.buildDataUsingRecords( recordsToUse ),
        dictionaryExtension, 
        root, 
        callback );
};

ListPage.prototype.clientAndServerSuccessFunction = function( data, dictionaryExtension, root, callback ){

    this.beforeProcessTemplate( data, dictionaryExtension );

    var self = this;
    this.runRecordsAsync(
        data.records,
        function(){
            self.processTemplate( root );
            self.afterProcessTemplate( self.get$form() );
        
            if ( callback ){
                callback( true );
            }
        }
    );
};
    
ListPage.prototype.show = function( params ){

    // Init params
    params = params || {};
    var dictionaryExtension = params.dictionaryExtension;
    var root = params.root;
    var callback = params.callback;

    // Show list using user records
    if ( this.userRecords ){
        this.showUsingRecords( this.userRecords, dictionaryExtension, root, callback );
        this.isFirstExecution = false;
        return;
    }

    // Show list using no records
    if ( this.isFirstExecution && ! this.loadAtFirstExecution ){
        this.showUsingRecords( [], dictionaryExtension, root, callback );
        this.isFirstExecution = false;
        return;
    }

    // Show list using records from server
    this.showUsingServer( dictionaryExtension, root, callback );
    this.isFirstExecution = false;
};
    
ListPage.prototype.showUsingServer = function( dictionaryExtension, root, callback ) {

    var listInstance = this;
    crudManager.listRecords( 
        {
            url: this.thisOptions.getGroupOfRecordsURL,
            search: this.buildDataToSend(),
            success: function( data ){
                listInstance.clientAndServerSuccessFunction.call( 
                    listInstance, 
                    data, 
                    dictionaryExtension, 
                    root, 
                    callback );
            },
            error: function( dataFromServer ){
                context.showError( 
                    listInstance.options, 
                    false, 
                    dataFromServer.message || 'Server communication error!'
                );
                if ( callback ){
                    callback( false );
                }
            }
        }, 
        this.options );
};
    
ListPage.prototype.beforeProcessTemplate = function( data, dictionaryExtension ){

    this.componentsMap.dataFromServer( data );
    this.filterArrayOfRecordsFromServerData( data.records, this.fields );
    this.updateRecords( data.records );
    this.updateDictionary( data.records, dictionaryExtension );
};

ListPage.prototype.updateDictionary = function( newRecordsArray, dictionaryExtension ){

    this.instanceDictionaryExtension = {
        records: newRecordsArray,
        instance: this,
        editable: this.isEditable(),
        omitKey: false
    };
    
    if ( dictionaryExtension ){
        utils.extend( this.instanceDictionaryExtension, dictionaryExtension );
    }
};

ListPage.prototype.processTemplate = function( root ){

    if ( ! root ){
        pageUtils.configureTemplate(
            this.options,
            "'" + this.thisOptions.template + "'"
        );
    } else {
        this.componentsMap.resetPage();
    }

    // Build zptOptions
    var zptOptions = {
        root: root || ( this.options.target? this.options.target[0]: null ) || document.body,
        dictionaryExtension: this.instanceDictionaryExtension  
    };
    
    zpt.run( zptOptions );
};
    
ListPage.prototype.afterProcessTemplate = function( $form ){

    this.bindEvents();
    this.triggerListCreatedEvent( $form );
};
    
ListPage.prototype.triggerListCreatedEvent = function( $form ){

    this.options.events.listCreated(
        {
            $form: $form,
            options: this.options
        });
};
    
ListPage.prototype.bindButtonEvent = function( button ){

    // Return if the button does not implement run method
    if ( ! utils.isFunction( button.run ) ){
        return;    
    }

    var instance = this;
    $( button.getSelector() )
        .off()
        .on(
            'click',
            function( event ){
                button.run( event, instance, this );   
            }
        );
};
    
ListPage.prototype.bindButtonsEvent = function( buttons ){

    for ( var c = 0; c < buttons.length; ++c ){
        var button = buttons[ c ];
        this.bindButtonEvent( button );
    }
};
    
ListPage.prototype.bindEvents = function() {

    // Bind events of buttons
    this.bindButtonsEvent( this.getToolbarButtons() );
    this.bindButtonsEvent( this.getByRowButtons() );

    // Bind events of components
    this.componentsMap.bindEvents();
};
    
ListPage.prototype.showCreateForm = function( event ){
    this.showNewForm( 'create' );
};

ListPage.prototype.showNewFormUsingRecordFromServer = function( type, event, forcedKey ){

    // Get the key of the record to get
    var key = forcedKey || pageUtils.getKeyFromButton( event );
    if ( key == undefined ){
        throw 'Error trying to load record in listPage: key is null!';
    }

    // Build the form instance
    this.currentFormPage = new FormPage( 
        this.options, 
        {
            type: type, 
            parentPage: this
        }
    ); 

    // Update form retrieving record from server
    this.currentFormPage.show( 
        {
            key: key, 
            getRecordURL: this.thisOptions.getRecordURL 
        }
    );
};
    
ListPage.prototype.showEditForm = function( event, forcedKey ){
    this.showNewFormUsingRecordFromServer( 'update', event, forcedKey );
};
    
ListPage.prototype.showDeleteForm = function( event, forcedKey ){
    this.showNewFormUsingRecordFromServer( 'delete', event, forcedKey );
};
    
ListPage.prototype.showNewForm = function( type, record ){

    this.currentFormPage = new FormPage( 
        this.options, 
        {
            type: type, 
            parentPage: this,
            record: record
        }
    ); 

    this.currentFormPage.show();
};
    
ListPage.prototype.instanceNewForm = function( type, key ){

    return new FormPage( 
        this.options, 
        {
            type: type, 
            parentPage: this,
            record: this.getRecordByKey( key )
        }
    );
}
    
// Iterate dictionary.records (an array) and put them into records (a map) using the id of each record as the key
ListPage.prototype.updateRecords = function( newRecordsArray ){

    this.records = {};
    for ( var c = 0; c < newRecordsArray.length; c++ ) {
        var record = newRecordsArray[ c ];
        this.records[ record[ this.options.key ] ] = record;
    }
};
ListPage.prototype.buildRecordsArray = function(){

    var recordsArray = [];
    for ( var index in this.records ) {
        var record = this.records[ index ];
        recordsArray.push( record );
    }
    return recordsArray;
};
    
ListPage.prototype.getRecordByKey = function( key, mustUpdateRecordFromSelection ){

    var record = this.records[ key ];

    if ( mustUpdateRecordFromSelection && ! this.readOnly ){
        // TODO Implement fieldUtils.updateRecordFromListSelection
        //fieldUtils.updateRecordFromListSelection( record, this.fieldsArray, $row );
    }

    return record;
};
ListPage.prototype.getRowByKey = function( key ){
    return this.get$().find( '[data-record-key="' + key + '"]' );
};
    
ListPage.prototype.updateBottomPanel = function( dictionaryExtension ){

    var thisDictionary = utils.extend( {}, this.instanceDictionaryExtension, dictionaryExtension );

    zpt.run({
        root: this.getComponent( 'paging' ).get$()[0],
        dictionaryExtension: thisDictionary
    });

    this.bindEvents();
};

ListPage.prototype.getRecords = function(){
    return this.records;
};
ListPage.prototype.getRecordsArray = function(){
    return this.buildRecordsArray();
};

ListPage.prototype.get$form = function(){
    return $( '#' + this.thisOptions.formId );
};

ListPage.prototype.getTotalNumberOfRecords = function(){

    var pagingComponent = this.getComponent( 'paging' );
    if ( ! pagingComponent ){
        return Object.keys( this.records ).length;
    }
    return pagingComponent.getTotalNumberOfRecords();
};
    
ListPage.prototype.addRecord = function( key, record ){

    this.records[ key ] = record;
    this.instanceDictionaryExtension.records.push( record );
};
ListPage.prototype.updateRecord = function( key, record ){

    this.records[ key ] = record;
    this.instanceDictionaryExtension.records[ this.getIndexInDictionaryByKey( key ) ] = record;
};
ListPage.prototype.deleteRecord = function( key ){

    delete this.records[ key ];
    this.instanceDictionaryExtension.records.splice( this.getIndexInDictionaryByKey( key ), 1 );
};
ListPage.prototype.getIndexInDictionaryByKey = function( key ){

    for ( var c = 0; c < this.instanceDictionaryExtension.records.length; c++ ) {
        var record = this.instanceDictionaryExtension.records[ c ];
        if ( key == record[ this.options.key ] ){
            return c;
        }
    }

    var message = 'Record not found in dictionary!'
    alert( message );
    throw message;
};
    
ListPage.prototype.isEditable = function(){
    return this.getComponent( 'editing' )? true: false;
};
ListPage.prototype.isReadOnly = function(){
    return ! this.isEditable();
};
    
ListPage.prototype.isFiltered = function(){

    var filterComponent = this.getComponent( 'filtering' );
    return filterComponent && filterComponent.filterIsOn();
};
    
ListPage.prototype.generateId = function(){
    return pageUtils.generateId();
};


ListPage.prototype.getByRowButtons = function(){

    if ( this.byRowButtons == undefined ){
        this.byRowButtons = buttonUtils.getButtonList( 
            this.thisOptions.buttons.byRow, 
            'listRow', 
            this,
            this.options );
    }

    return this.byRowButtons;
};
ListPage.prototype.getToolbarButtons = function(){
    return this.getPageToolbarButtons( 'listToolbar' );
};
    
ListPage.prototype.removeChanges = function(){
    this.getSecureComponent( 'editing' ).removeChanges();
};
    
ListPage.prototype.update = function(){
        
    // Get root
    var root = [ $( '#' + this.thisOptions.tbodyId )[0] ];

    // Add pagingComponent to root
    var pagingComponent = this.getComponent( 'paging' );
    if ( pagingComponent ){
        root.push( pagingComponent.get$()[0] );
    }

    // Show list page
    this.show(
        {
            root: root
        }
    );
};
    
ListPage.prototype.goToFirstPage = function(){

    var pagingComponent = this.getComponent( 'paging' );
    if ( pagingComponent ){
        pagingComponent.goToFirstPage();
    }
};
    
ListPage.prototype.getType = function(){
    return 'list';
};

module.exports = ListPage;

},{"../../../lib/zzDOM-closures-full.js":61,"../buttons/buttonUtils.js":2,"../components/componentsMap.js":21,"../context.js":27,"../crudManager.js":28,"../fields/fieldListBuilder.js":35,"../history/history.js":45,"../utils.js":57,"./formPage.js":51,"./page.js":53,"./pageUtils.js":54,"zpt":135}],53:[function(_dereq_,module,exports){
/* 
    Page class
*/
'use strict';

//var $ = require( 'zzdom' );
var zzDOM = _dereq_( '../../../lib/zzDOM-closures-full.js' );
var $ = zzDOM.zz;
var context = _dereq_( '../context.js' );
var pageUtils = _dereq_( './pageUtils.js' );
var buttonUtils = _dereq_( '../buttons/buttonUtils.js' );
var utils = _dereq_( '../utils.js' );

var Page = function( optionsToApply, userDataToApply ) {
    
    this.options = optionsToApply;
    
    this.fieldsMap = {};
    this.fields = [];
    this.toolbarButtons = undefined;
    this.componentsMap = undefined;
};

Page.prototype.getPage = function(){
    return this;
};

Page.prototype.initFromOptions = function(){
    throw 'initFromOptions method not implemented in Page class!';
};

Page.prototype.configure = function(){
    throw 'configure method not implemented in Page class!';
};

Page.prototype.processDirty = function( confirm, id, callback, noCheckDirty ){

    if ( ! confirm || ( ! noCheckDirty && ! this.isDirty() ) ){
        callback();
        return;
    }

    // Page is dirty!
    context.confirm(
        this.options,
        {
            title: context.translate( 'confirm' + id + 'Title' ),
            text: context.translate( 'confirm' + id + 'Text' ),
            className: 'wideConfirm',
            buttons: {
                cancel: context.translate( 'confirm' + id + 'CancelButton' ),
                continue: {
                    text: context.translate( 'confirm' + id + 'ContinueButton' ),
                    value: 'continue',
                }
            }
        },
        function( value ){
            if ( value == 'continue' ) {
                callback();
            }
        }
    );
};

Page.prototype.getOptions = function(){
    return this.options;
};

Page.prototype.getThisOptions = function(){
    return this.thisOptions;
};

Page.prototype.show = function(){
    throw 'show method not implemented in Page class!';
};

Page.prototype.getDictionary = function(){
    return this.dictionary;
};

Page.prototype.getInstanceDictionaryExtension = function(){
    return this.instanceDictionaryExtension;
};

Page.prototype.getType = function(){
    throw 'getType method not implemented in Page class!';
};

Page.prototype.getId = function(){
    return this.id;
};

Page.prototype.getFields = function(){
    return this.fields;
};
Page.prototype.getField = function(){
    throw 'getField method not implemented in Page class!';
};
Page.prototype.getFieldByName = function(){
    throw 'getFieldByName method not implemented in Page class!';
};

Page.prototype.get$form = function(){
    throw 'get$form method not implemented in Page class!';
};

Page.prototype.getKey = function(){
    return this.thisOptions.key || this.options.key;
};

Page.prototype.get$ = function(){
    return $( '#' + this.id );
};

Page.prototype.isReadOnly = function(){
    throw 'isReadOnly method not implemented in Page class!';
};

Page.prototype.getPageToolbarButtons = function( type ){

    if ( this.toolbarButtons == undefined ){
        this.toolbarButtons = buttonUtils.getButtonList( 
            this.thisOptions.buttons.toolbar, 
            type,
            this,
            this.options );
    }

    return this.toolbarButtons;
};

Page.prototype.getComponentMap = function(){
    return this.componentsMap;
};
Page.prototype.getComponent = function( id ){
    return this.componentsMap.getComponent( id );
};
Page.prototype.getSecureComponent = function( id ){
    return this.componentsMap.getSecureComponent( id );
};

Page.prototype.getName = function(){
    return this.options.entityId;     
};

Page.prototype.getField = function(){
    throw 'getField method not implemented in Page class!';
};
Page.prototype.getFieldByName = function(){
    throw 'getFieldByName method not implemented in Page class!';
};
Page.prototype.getFieldsSource = function(){
    return this.options.fields;
};

Page.prototype.isDirty = function(){

    var history = context.getHistory();
    return history? history.isDirty(): false;
};

Page.prototype.update = function(){
    throw 'update method not implemented in Page class!';
};

Page.prototype.removeChanges = function(){
    throw 'removeChanges method not implemented in Page class!';
};

Page.prototype.goToFirstPage = function(){
    throw 'goToFirstPage method not implemented in Page class!';
};

Page.prototype.showStatusMessage = function( dictionaryExtension ){
    
    pageUtils.showStatusMessage( 
        this.get$(), 
        //this.dictionary, 
        dictionaryExtension
        //context 
    );
};

Page.prototype.filterRecordFromServerData = function( serverDataRecord, thisFields ){
    
    for ( var c = 0; c < thisFields.length; c++ ) {
        var field = thisFields[ c ];
        if ( serverDataRecord.hasOwnProperty( field.id ) ){
            serverDataRecord[ field.id ] = field.getValueFromRecord( serverDataRecord );
        }
    }
};

Page.prototype.filterArrayOfRecordsFromServerData = function( serverDataArrayOfRecords, thisFields ){

    for ( var c = 0; c < serverDataArrayOfRecords.length; c++ ) {
        var record = serverDataArrayOfRecords[ c ];
        this.filterRecordFromServerData( record, thisFields );
    }
};

Page.prototype.run1RecordAsync = function( record, callback ){

    // Get the list of getAsync functions
    var asyncFields = [];
    for ( var c = 0; c < this.fields.length; c++ ) {
        var field = this.fields[ c ];
        if ( utils.isFunction( field.builNonDependentAsyncFieldList ) ){
            var nonDependentList = field.builNonDependentAsyncFieldList();
            for ( const field  of nonDependentList ) {
                asyncFields.push(
                    {
                        record: {},
                        field: field
                    }
                );
            }
        }
        if ( utils.isFunction( field.buildDependentAsyncFieldList ) ){
            var dependent = field.buildDependentAsyncFieldList( record );
            asyncFields = asyncFields.concat( dependent );
        }
    }

    // Run them; afterwards run the callback
    this.runRecordsAsyncFunctions( asyncFields, callback );
};

/*
Page.prototype.run1RecordAsync = function( record, callback ){

    // Get the list of getAsync functions
    var asyncFields = this.buildListOfAsyncFunctionsFields( record );

    // Run them; afterwards run the callback
    this.runRecordsAsyncFunctions( asyncFields, callback );
};
*/
/*
Page.prototype.run1RecordAsync = function( record, callback ){

    // Get the list of getAsync functions
    var asyncFields = this.buildListOfAsyncFunctionsFields();

    // Run them; afterwards run the callback
    this.run1RecordAsyncFunctions( record, asyncFields, callback );
};
*/
Page.prototype.runRecordsAsync = function( records, callback ){

    // Get the list of getAsync functions
    var asyncFields = [];
    for ( var c = 0; c < this.fields.length; c++ ) {
        var field = this.fields[ c ];
        if ( utils.isFunction( field.builNonDependentAsyncFieldList ) ){
            var nonDependentList = field.builNonDependentAsyncFieldList();
            for ( const field of nonDependentList ) {
                asyncFields.push(
                    {
                        record: {},
                        field: field
                    }
                );
            }
        }
        if ( utils.isFunction( field.buildDependentAsyncFieldList ) ){
            for ( const record of records ){
                var dependent = field.buildDependentAsyncFieldList( record );
                asyncFields = asyncFields.concat( dependent );
            }
        }
    }

    // Run them; afterwards run the callback
    this.runRecordsAsyncFunctions( asyncFields, callback );
};
/*
Page.prototype.runRecordsAsync = function( records, callback ){

    // Get the list of getAsync functions
    var asyncFieldsObject = this.buildObjectOfAsyncFunctionsFields();

    // Build the list of fields to run later
    var listOfAsyncFunctionsForRecords = this.buildListOfAsyncFunctionsForRecords( records, asyncFieldsObject );

    // Run them; afterwards run the callback
    this.runRecordsAsyncFunctions( listOfAsyncFunctionsForRecords, callback );
};
*/
/*
Page.prototype.runRecordsAsync = function( records, callback ){

    // Get the list of getAsync functions
    var asyncFieldsObject = this.buildObjectOfAsyncFunctionsFields();

    // Build the list of fields to run later
    var listOfAsyncFunctionsForRecords = this.buildListOfAsyncFunctionsForRecords( records, asyncFieldsObject );

    // Run them; afterwards run the callback
    this.runRecordsAsyncFunctions( listOfAsyncFunctionsForRecords, callback );
};
*/
/*
Page.prototype.buildListOfAsyncFunctionsForRecords = function( records, asyncFieldsObject ){

    var result = [];

    // Non dependent
    var nonDependent = asyncFieldsObject.nonDependent;
    for ( var c = 0; c < nonDependent.length; c++ ) {
        var field = nonDependent[ c ];
        result.push(
            {
                record: {},
                field: field
            }
        );

    }

    // Dependent
    var dependent = asyncFieldsObject.dependent;
    for ( var c = 0; c < dependent.length; c++ ) {
        var field = dependent[ c ];
        for ( var i = 0; i < records.length; i++ ) {
            var record = records[ i ];
            result.push(
                {
                    record: record,
                    field: field
                }
            );
        }
    }

    return result;
};
*/
/*
Page.prototype.buildObjectOfAsyncFunctionsFields = function( record ){

    var result = {
        dependent: [],
        nonDependent: []
    };

    for ( var c = 0; c < this.fields.length; c++ ) {

        var field = this.fields[ c ];

        if ( utils.isFunction( field.buildAsyncFieldList ) ){
            field.buildAsyncFieldList( result, record );
        }
    }

    return result;
};
*/
/*
Page.prototype.buildObjectOfAsyncFunctionsFields = function(){

    var dependent = [];
    var nonDependent = [];

    for ( var c = 0; c < this.fields.length; c++ ) {

        var field = this.fields[ c ];

        if ( utils.isFunction( field.buildAsyncFieldList ) ){

            // Get the async fields
            var temp = field.buildAsyncFieldList();
            for ( var i = 0; i < temp.length; i++ ) {
                this.addFieldToList( dependent, nonDependent, temp[ i ] );
            }
        }
    }

    return {
        dependent: dependent,
        nonDependent: nonDependent
    };
};

Page.prototype.addFieldToList = function( dependent, nonDependent, field ){

    var list = field.dependsOn? dependent: nonDependent;
    list.push( field );
};
*/
/*
Page.prototype.buildListOfAsyncFunctionsFields = function(){

    var asyncFields = [];

    for ( var c = 0; c < this.fields.length; c++ ) {
        var field = this.fields[ c ];
        if ( utils.isFunction( field.buildAsyncFieldList ) ){
            var temp = field.buildAsyncFieldList();

            // temp can be a sigle field or an array of fields
            if ( utils.isArray( temp ) ){
                asyncFields = asyncFields.concat( temp );
            } else if ( temp ) {
                asyncFields.push( temp );
            }
        }
    }

    return asyncFields;
};
*/
/*
Page.prototype.buildListOfAsyncFunctionsFields = function( record ){

    var dependent = [];
    var nonDependent = [];

    for ( var c = 0; c < this.fields.length; c++ ) {
        var field = this.fields[ c ];
        if ( utils.isFunction( field.builNonDependentAsyncFieldList ) ){
            nonDependent = nonDependent.concat(
                field.builNonDependentAsyncFieldList()
            );
        }
        if ( utils.isFunction( field.buildDependentAsyncFieldList ) ){
            dependent = dependent.concat(
                field.buildDependentAsyncFieldList( record )
            );
        }
    }

    return {
        dependent: dependent,
        nonDependent: nonDependent
    };
};
*/
/*
Page.prototype.run1RecordAsyncFunctions = function( record, asyncFields, callback ){

    // Get the first item and remove it from asyncFunctions
    var firstAsyncField = asyncFields.shift();

    // Run callback and exit if there is no more items
    if ( ! firstAsyncField ){
        if ( callback && utils.isFunction( callback ) ){
            callback();
        }
        return;
    }

    // Run firstAsyncFunction and continue
    var self = this;
    firstAsyncField.getAsync(
        record,
        function(){
            self.run1RecordAsyncFunctions( record, asyncFields, callback );
        }
    );
};
*/
Page.prototype.runRecordsAsyncFunctions = function( listOfAsyncFunctionsForRecords, callback ){

    // Get the first item and remove it
    var object = listOfAsyncFunctionsForRecords.shift();

    // Run callback and exit if there is no more items
    if ( ! object ){
        if ( callback && utils.isFunction( callback ) ){
            callback();
        }
        return;
    }

    // Run getAsync and continue
    var field = object.field;
    var record = object.record;
    var self = this;
    field.getAsync(
        record,
        function(){
            self.runRecordsAsyncFunctions( listOfAsyncFunctionsForRecords, callback );
        }
    );
};

Page.doSuperClassOf = function( ChildClass ){

    ChildClass.prototype = new Page();
    ChildClass.prototype.constructor = ChildClass;
};

module.exports = Page;

},{"../../../lib/zzDOM-closures-full.js":61,"../buttons/buttonUtils.js":2,"../context.js":27,"../utils.js":57,"./pageUtils.js":54}],54:[function(_dereq_,module,exports){
/* 
    context singleton class
*/
'use strict';

//var $ = require( 'zzdom' );
var zzDOM = _dereq_( '../../../lib/zzDOM-closures-full.js' );
var $ = zzDOM.zz;
var zpt = _dereq_( 'zpt' );

module.exports = (function() {
    
    var configureTemplate = function( options, templatePath ){
        
        options.target.html(
            `<div data-use-macro="${templatePath}"></div>`
        );
    };
    /*
    var configureTemplate = function( options, templatePath ){
        
        var $containerDiv = $('<div />')
            .attr( 'data-use-macro', templatePath );
        options.target.html( $containerDiv );
    };
    */

    // Normalizes a number between given bounds or sets to a defaultValue if it is undefined
    var normalizeNumber = function ( number, min, max, defaultValue ) {
        
        if ( number == undefined || number == null || isNaN( number ) ) {
            return defaultValue;
        }

        if ( number < min ) {
            return min;
        }

        if ( number > max ) {
            return max;
        }

        return number;
    };
    
    // Finds index of an element in an array according to given comparision function
    var findIndexInArray = function ( value, array, compareFunc ) {

        // If not defined, use default comparision
        if ( ! compareFunc ) {
            compareFunc = function ( a, b ) {
                return a == b;
            };
        }
        
        for ( var i = 0; i < array.length; i++ ) {
            if ( compareFunc( value, array[i] ) ) {
                return i;
            }
        }
        return -1;
    };
    
    var ajaxError = function( request, status, error, options, context, userErrorFunction ){
        
        context.showError( 
            options, 
            false, 
            request && request.responseText? request.responseText: 'Undefined error' );
        
        if ( userErrorFunction ){
            userErrorFunction( 
                {
                    request: request,
                    status: status,
                    error: error,
                    options: options,
                    context: context
                }
            );
        }
    };
    
    var serverSideError = function( dataFromServer, options, context, userErrorFunction ){

        context.showError( 
            options, 
            false,
            dataFromServer && dataFromServer.message? dataFromServer.message: 'Undefined error', 
            dataFromServer && dataFromServer.translateMessage );

        if ( userErrorFunction ){
            userErrorFunction( 
                {
                    dataFromServer: dataFromServer,
                    options: options,
                    context: context
                }
            );
        }
    };
    
    var generateId = function ( len, charSet ) {
        
        // Init parameters
        charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        len = len || 6;
        
        // Generate id using these parameters
        var result = '';
        for ( var i = 0; i < len; i++ ) {
            var pos = Math.floor( Math.random() * charSet.length );
            result += charSet.substring( pos, pos+1 );
        }
        return result;
    }
    
    var showStatusMessage = function( $this, dictionaryExtension ){

        zpt.run({
            root: $this.find( '.zcrud-status' )[0],
            dictionaryExtension: dictionaryExtension
        });
    };
    
    var getKeyFromButton = function( event ){

        if ( ! event ){
            return;
        }

        return $( event.target ).parents( '.zcrud-data-row' ).first().attr( 'data-record-key' );
        //return $( event.target ).closest( '.zcrud-data-row' ).attr( 'data-record-key' );
    };
    /*
    var getPostTemplates = function( fields ){

        var result = [];

        for ( var c = 0; c < fields.length; ++c ){
            var field = fields[ c ];
            var postTemplates = field.getPostTemplates();
            if ( postTemplates ){
                result = result.concat( postTemplates );
            }
        }

        // Filter repeated items
        result = result.filter(
            function ( item, pos ) {
                return result.indexOf( item ) == pos;
            }
        );

        return result.length == 0? undefined: result;
    };*/
    
    return {
        configureTemplate: configureTemplate,
        normalizeNumber: normalizeNumber,
        findIndexInArray: findIndexInArray,
        ajaxError: ajaxError,
        serverSideError: serverSideError,
        generateId: generateId,
        showStatusMessage: showStatusMessage,
        getKeyFromButton: getKeyFromButton
        //getPostTemplates: getPostTemplates
    };
})();

},{"../../../lib/zzDOM-closures-full.js":61,"zpt":135}],55:[function(_dereq_,module,exports){
/* 
    requestHelper singleton class
*/
'use strict';

module.exports = (function() {

    /**
     * @param {string} url
     * @param {Object|undefined} object
     * @param {Function} successCallback
     * @param {Function=} errorCallback
     * 
     */
    var post = function( url, object, successCallback, errorCallback ){

        // Build formData object.
        //let formData = new FormData();
        //for ( var key in object ){
        //    formData.append( key, object[ key ]);
        //}
        const data = new URLSearchParams();
        for ( var key in object ){
            const value = object[ key ];
            
            if ( Array.isArray( value ) ) {
                for ( var i = 0; i < value.length; ++i ){
                    data.append( key + '[]', value[ i ] );
                }
            } else {
                data.append( key, value );
            }
        }

        const requestOptions = {
            'method': 'POST',
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            'body': data
        };
        fetch(
            url,
            requestOptions
        ).then(
            function( response ){
                if ( ! response.ok ){
                    runErrorCallback( errorCallback, response );
                    return;
                }
                return response.json();
            }
        ).then(
            function( data ){
                if ( data ){
                    successCallback( data );
                    /*
                    if ( data === true || data[ 'result' ]  === 'true' ){
                        successCallback( data );
                    } else {
                        runErrorCallback( errorCallback, undefined, undefined, data[ 'error' ] );
                    }
                    */
                }
            }
        ).catch(
            function( error ){
                runErrorCallback( errorCallback, error );
            }
        );
    };

    /**
     * @param {Object} fecthOptions
     * 
     */
    var requestFetch = function( fecthOptions ){

        post(
            fecthOptions.url,
            fecthOptions.data,
            fecthOptions.success,
            fecthOptions.error
        );
    };

    /**
     * @param {Function} errorCallback
     * @param {*=} errorInstance
     * 
     */
    var runErrorCallback = function( errorCallback, errorInstance ){
        errorCallback( errorInstance );
    };

    return {
        fetch: requestFetch
    };
})();

},{}],56:[function(_dereq_,module,exports){
(function (global){(function (){
/* Standalone version of ZCrud */

//global.window.$ = require( 'jquery' );
global.window.zpt = _dereq_( 'zpt' );
global.window.zcrud = _dereq_( './main.js' );
_dereq_( './zzDOMPlugin.js' );

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./main.js":49,"./zzDOMPlugin.js":59,"zpt":135}],57:[function(_dereq_,module,exports){
/* 
    utils singleton class
*/
'use strict';

var log4javascript = _dereq_( 'log4javascript' );
var context = _dereq_( './context.js' );

module.exports = (function() {

    /* 
        Jquery's extend function
        MIT license
        https://github.com/jquery/jquery/blob/main/src/core.js
    */
    /*
    var extend = function( ...args ) {
        return $.extend( ...args );
    };
    */
    var hasOwn = {}.hasOwnProperty;
    var fnToString = hasOwn.toString;
    var ObjectFunctionString = fnToString.call( Object );
    var isPlainObject = function( obj ) {
        //return typeof x === 'object' && ! Array.isArray( x ) && x !== null;
        var proto, Ctor;

        // Detect obvious negatives

        // Use toString instead of jQuery.type to catch host objects

        if ( !obj || toString.call( obj ) !== '[object Object]' ) {
            return false;
        }

        proto = Object.getPrototypeOf( obj );

        // Objects with no prototype (e.g., `Object.create( null )`) are plain

        if ( !proto ) {
            return true;
        }

        // Objects with prototype are plain iff they were constructed by a global Object function
        Ctor = hasOwn.call( proto, 'constructor' ) && proto.constructor;
		return typeof Ctor === 'function' && fnToString.call( Ctor ) === ObjectFunctionString;
    };
    var extend = function() {
        var options, name, src, copy, copyIsArray, clone,
            target = arguments[ 0 ] || {},
            i = 1,
            length = arguments.length,
            deep = false;
    
        // Handle a deep copy situation
        if ( typeof target === 'boolean' ) {
            deep = target;
    
            // Skip the boolean and the target
            target = arguments[ i ] || {};
            i++;
        }
    
        // Handle case when target is a string or something (possible in deep copy)
        if ( typeof target !== 'object' && typeof target !== 'function' ) {
            target = {};
        }
    
        // Extend jQuery itself if only one argument is passed
        if ( i === length ) {
            target = this;
            i--;
        }
        
        for ( ; i < length; i++ ) {
    
            // Only deal with non-null/undefined values
            if ( ( options = arguments[ i ] ) != null ) {
    
                // Extend the base object
                for ( name in options ) {
                    copy = options[ name ];
    
                    // Prevent Object.prototype pollution
                    // Prevent never-ending loop
                    if ( name === '__proto__' || target === copy ) {
                        continue;
                    }
    
                    // Recurse if we're merging plain objects or arrays
                    if ( deep && copy && ( isPlainObject( copy ) ||
                        ( copyIsArray = Array.isArray( copy ) ) ) ) {
                        src = target[ name ];
    
                        // Ensure proper type for the source value
                        if ( copyIsArray && !Array.isArray( src ) ) {
                            clone = [];
                        } else if ( !copyIsArray && !isPlainObject( src ) ) {
                            clone = {};
                        } else {
                            clone = src;
                        }
                        copyIsArray = false;
    
                        // Never move original objects, clone them
                        target[ name ] = extend( deep, clone, copy );
    
                    // Don't bring in undefined values
                    } else if ( copy !== undefined ) {
                        target[ name ] = copy;
                    }
                }
            }
        }
    
        // Return the modified object
        return target;
    };
    
    var isFunction = function( x ) {

        // Support: Chrome <=57, Firefox <=52
        // In some browsers, typeof returns 'function' for HTML <object> elements
        // (i.e., `typeof document.createElement( 'object' ) === 'function'`).
        // We don't want to classify *any* DOM node as a function.
        return typeof x === 'function' && typeof x.nodeType !== 'number';
    };

    var isArray = function( x ) {
        return Array.isArray( x );
    };

    var isEmptyObject = function( x ) {
        return isPlainObject( x ) && Object.keys( x ).length === 0;
    };

    var isString = function( x ) {
        return typeof x === 'string';
    };

    // Return a log4javascript Level object
    var levels = {
        'off'  : log4javascript.Level.OFF,
        'all'  : log4javascript.Level.ALL,
        'debug': log4javascript.Level.DEBUG,
        'info' : log4javascript.Level.INFO,
        'warn' : log4javascript.Level.WARN,
        'error': log4javascript.Level.ERROR,
        'fatal': log4javascript.Level.FATAL
    };
    var buildLoggingLevel = function( string ){
        return levels[ string ];
    };

    var getParam = function( params, paramId ){
        return isPlainObject( params )? params[ paramId ]: undefined;
    };

    var extractDateItems = function( stringDate, del = '/' ){

        var dayIndex = parseInt( context.translate( 'dayIndex' ), 10 );
        var monthIndex = parseInt( context.translate( 'monthIndex' ), 10 );
        var yearIndex = parseInt( context.translate( 'yearIndex' ), 10 );

        var dateArray = stringDate.split( del );
        var day = dateArray[ dayIndex ];            // In spanish 0, in english 1
        var month = dateArray[ monthIndex ] - 1;    // In spanish 1, in english 0
        var year = dateArray[ yearIndex ];          // In spanish 2, in english 2

        return {
            day: day,
            month: month,
            year: year
        };
    };

    var stringDateIsValid = function( stringDate, del = '/' ){

        // If the stringDate is empty is also valid
        if ( ! stringDate ){
            return true;
        }
        /*
        var dayIndex = parseInt( context.translate( 'dayIndex' ), 10 );
        var monthIndex = parseInt( context.translate( 'monthIndex' ), 10 );
        var yearIndex = parseInt( context.translate( 'yearIndex' ), 10 );

        var dateArray = stringDate.split( del );
        var day = dateArray[ dayIndex ];            // In spanish 0, in english 1
        var month = dateArray[ monthIndex ] - 1;    // In spanish 1, in english 0
        var year = dateArray[ yearIndex ];          // In spanish 2, in english 2
        */
        // Get day, month and date from stringDate
        var dateObject = extractDateItems( stringDate, del );
        var day = dateObject.day;
        var month = dateObject.month;
        var year = dateObject.year;

        // Build a date instance
        // If a parameter you specify is outside of the expected range, other parameters and the date information in the Date object are updated
        // accordingly. For example, if you specify 15 for monthValue, the year is incremented by 1, and 3 is used for month.
        var dateInstance = new Date( year, month, day );
        
        // Check the date is what is supposed to be
        if ( dateInstance.getDate() != day ){
            return false;
        }
        if ( dateInstance.getMonth() != month ){
            return false;
        }
        if ( dateInstance.getFullYear() != year ){
            return false;
        }

        return true;
    };
    
    var stringDatetimeIsValid = function( stringDatetime, del = '/' ){

        // If the stringDatetime is empty is also valid
        if ( ! stringDatetime ){
            return true;
        }
        
        var datetimeArray = stringDatetime.split( ' ' );
        var stringDate = datetimeArray[ 0 ];
        //var stringTime = datetimeArray[ 1 ];

        // Check onkly stringDate, stringTime is checked using RE
        return stringDateIsValid( stringDate, del );
    };

    return {
        extend: extend,
        isFunction: isFunction,
        isArray: isArray,
        isPlainObject: isPlainObject,
        isEmptyObject: isEmptyObject,
        isString: isString,
        buildLoggingLevel: buildLoggingLevel,
        getParam: getParam,
        extractDateItems: extractDateItems,
        stringDateIsValid: stringDateIsValid,
        stringDatetimeIsValid: stringDatetimeIsValid
    };
})();

},{"./context.js":27,"log4javascript":63}],58:[function(_dereq_,module,exports){
/* 
    validationsManager singleton class
*/
'use strict';
    
var context = _dereq_( './context.js' );
var zzDOM = _dereq_( '../../lib/zzDOM-closures-full.js' );
var $ = zzDOM.zz;
var utils = _dereq_( './utils.js' );

module.exports = (function() {
    /*
    required:
        Specifies whether a form field needs to be filled in before the form can be submitted.
    minlength and maxlength:
        Specifies the minimum and maximum length of textual data (strings).
    min, max, and step:
        Specifies the minimum and maximum values of numerical input types, and the increment, or step, for values, starting from the minimum.
    type:
        Specifies whether the data needs to be a number, an email address, or some other specific preset type.
    pattern:
        Specifies a regular expression that defines a pattern the entered data needs to follow.
    */

    var validityNames = [
        'badInput',
        'patternMismatch',
        'rangeOverflow',
        'rangeUnderflow',
        'stepMismatch',
        'tooLong',
        'tooShort',
        'typeMismatch',
        'valueMissing'
    ];
    
    const selector = 'input.historyField, textarea.historyField, select.historyField';

    var initFormValidation = function( formId, $item, options ){

        // Define change event listener
        var instance = this;
        $item.find( selector )
            .on(
                'change',
                function ( event ) {
                    instance.showErrorForField(
                        this,
                        options.fields[ event.currentTarget.name ],
                        options
                    );
                }
        );
    };

    var fieldValidation = function( el, field ){

        const $el = $( el );
        return field? field.validate( $el.val() ): true;
    };
    /*
    var fieldValidation = function( el, field ){

        const $el = $( el );
        const type = $el.attr( 'data-fieldValidation' );

        if ( ! type ){
            return true;
        }

        return validateField( type, $el.val() );
    };

    var validateField = function( type, value ){

        if ( type == 'date' ){
            return utils.stringDateIsValid( value );
        }
        if ( type == 'datetime' ){
            return utils.stringDatetimeIsValid( value );
        }

        throw 'ValidateManager can not manage that type: ' + type;
    };
    */

    var showErrorForField = function( el, field, options ){

        const validity = el.validity;
  
        // Force element as valid so the next checks work properly
        el.setCustomValidity( '' );

        // Check if the for is valid
        const fieldValidationValue = fieldValidation( el, field );
        const isValid = validity.valid && fieldValidationValue == true;
        if ( isValid ) {

            // No validation error
            
            // Remove previous validation error message, if any
            clearValidationMessage( el, '' );

            return;
        }

        // A validation error occured

        if ( options.validation.showBrowserMessageBubbles ){
            // Show validation error message using browser facility

            const message = options.validation.useBrowserMessages?
                true:
                getErrorMessage( el, options, validity, fieldValidationValue );
            el.setCustomValidity( message );    // To force input:invalid in HTML
            el.reportValidity();

        } else {
            // Show validation error message using zcrud-validationMessage HTML elements
            
            const message = getErrorMessage( el, options, validity, fieldValidationValue );
            el.setCustomValidity( message );    // To force input:invalid in HTML
            showValidationMessage( el, message );
        }
    };

    var clearValidationMessage = function( el ){

        setValidationMessage( el, '' )
            .addClass( 'zcrud-hidden' );
    };
    
    var showValidationMessage = function( el, message ){

        setValidationMessage( el, message )
            .removeClass( 'zcrud-hidden' );
    };

    var setValidationMessage = function( el, message ){

        const $field = $( el ).parents( '.zcrud-like-field' ).first();
        const $valMessageEl = $field.find( '.zcrud-validationMessage' ).first();

        $valMessageEl.text( message );

        return $valMessageEl;
    };

    /*
        Try to translate through the next list, stop when a i18n message is found:
            'validation_' + el.name + '_' + validityName,
            'validation_' + el.name,
            'validation_' + validityName
    */
    var getErrorMessage = function( el, options, validity, fieldValidationValue ){

        // Use browser validation message if configured
        if ( options.validation.useBrowserMessages ){
            return el.validationMessage;
        }

        // Use custom validation messages instead
        
        // Clone validity
        const validityClone = utils.extend( true, [], validity );
        //if ( ! fieldValidationValue ){
        //    validityClone[ 'typeMismatch' ] = true;
        //}
        if ( utils.isString( fieldValidationValue ) ){
            validityClone[ fieldValidationValue ] = true;
        }

        // Iterate validityNames
        for ( const validityName of validityNames ) {
            if ( validityClone[ validityName ] ) {
                return context.translateAlternatives(
                    [
                        'validation_' + el.name + '_' + validityName,
                        'validation_' + el.name,
                        'validation_' + validityName
                    ]
                );
            }
        }

        return 'No i18n error message found!';
    };

    var formIsValid = function( options, eventData ){
        
        // Check using formSubmitting event: get eventResult
        var eventResultValue = options.events.formSubmitting( eventData, options );
        var eventResult = eventResultValue === undefined || eventResultValue == true;

        // Check using standard HTML form validation: get standardValidationResult
        var form = eventData.$form.el;
        var standardValidationResult = form? form.checkValidity(): true;

        if ( form ){
            if ( ! standardValidationResult ){
                showErrorsForForm( eventData.$form, options );
            }
            
            // Show browser validation message if configured
            if ( options.validation.useBrowserMessages ){
                form.reportValidity();
            }
        }

        // If both results are true the form is valid
        return standardValidationResult && eventResult;
    };

    var showErrorsForForm = function( $item, options ){

        var elements = $item.find( selector ).get();

        for ( const el of elements ) {
            showErrorForField(
                el,
                options.fields[ el.name ],
                options
            );
        }
    };

    return {
        initFormValidation: initFormValidation,
        formIsValid: formIsValid,
        showErrorForField: showErrorForField
    };
})();

},{"../../lib/zzDOM-closures-full.js":61,"./context.js":27,"./utils.js":57}],59:[function(_dereq_,module,exports){
'use strict';

//var $ = require( 'zzdom' );
var zzDOM = _dereq_( '../../lib/zzDOM-closures-full.js' );
//var $ = zzDOM.zz;
var context = _dereq_( './context.js' );
var zcrud = _dereq_( './main.js' );
    
var getOptions = function( $item ){
    return context.getOptions( $item )
};

zzDOM.SS.prototype.zcrud = function( action ){
    switch ( action ){
        case 'addRecord':
            zcrud.addRecord( getOptions( this ), arguments[1] );
            break;
        case 'deleteRecord':
            zcrud.deleteRecord( getOptions( this ), arguments[1] );
            break;
        case 'deselectRecords':
            zcrud.deselectRecords( getOptions( this ), arguments[1] );
            break;
        case 'deselectRows':
            zcrud.deselectRows( getOptions( this ), arguments[1] );
            break;
        case 'destroy':
            zcrud.destroy( getOptions( this ) );
            break;
        case 'getRecordByKey':
            return zcrud.getRecordByKey( getOptions( this ), arguments[1] );
        case 'getRecords':
            return zcrud.getRecords( getOptions( this ) );
        case 'getRowByKey':
            return zcrud.getRowByKey( getOptions( this ), arguments[1] );
        case 'getSelectedRecords':
            return zcrud.getSelectedRecords( getOptions( this ) );
        case 'getSelectedRows':
            return zcrud.getSelectedRows( getOptions( this ) );
        case 'init':
            var options = zcrud.init( arguments[1], arguments[2], arguments[3] );
            options.target = this;
            context.putOptions( this, options );
            break;
        case 'renderList':
            zcrud.renderList( getOptions( this ), arguments[1], arguments[2] );
            break;
        case 'renderForm':
            zcrud.renderForm( getOptions( this ), arguments[1], arguments[2] );
            break;
        case 'selectRecords':
            zcrud.selectRecords( getOptions( this ), arguments[1] );
            break;
        case 'selectRows':
            zcrud.selectRows( getOptions( this ), arguments[1] );
            break;
        case 'showCreateForm':
            zcrud.showCreateForm( getOptions( this ) );
            break;
        case 'showUpdateForm':
            zcrud.showUpdateForm( getOptions( this ), arguments[1] );
            break;
        case 'showDeleteForm':
            zcrud.showDeleteForm( getOptions( this ), arguments[1] );
            break;
        case 'updateRecord':
            zcrud.updateRecord( getOptions( this ), arguments[1] );
            break;
        case 'getListPage':
            return zcrud.getListPage( getOptions( this ) );
        case 'getFormPage':
            return zcrud.getFormPage( getOptions( this ) );
        default:
            alert( 'Unknown action: ' + action );
            return false;
    }

    return this;
};

zzDOM.MM.prototype.zcrud = function () {
    return zzDOM.MM.constructors.default( this, zzDOM.SS.prototype.zcrud, arguments );
};
    
module.exports = zzDOM;

},{"../../lib/zzDOM-closures-full.js":61,"./context.js":27,"./main.js":49}],60:[function(_dereq_,module,exports){
/*!
 * @copyright Copyright &copy; Kartik Visweswaran, Krajee.com, 2014 - 2016
 * @version 1.3.4
 *
 * Date formatter utility library that allows formatting date/time variables or Date objects using PHP DateTime format.
 * @see http://php.net/manual/en/function.date.php
 *
 * For more JQuery plugins visit http://plugins.krajee.com
 * For more Yii related demos visit http://demos.krajee.com
 */
"use strict";
var DateFormatter = function (options) {
    var DAY = 1000 * 60 * 60 * 24;
    var HOUR = 3600;
	/*
    var _lpad = function (value, length, char) {
        var chr = char || '0', val = value.toString();
        return val.length < length ? _lpad(chr + val, length) : val;
    };*/

    var _compare = function (str1, str2) {
        return typeof(str1) === 'string' && typeof(str2) === 'string' && str1.toLowerCase() === str2.toLowerCase();
    };
    var _extend = function (out) {
        var i, obj;
        out = out || {};
        for (i = 1; i < arguments.length; i++) {
            obj = arguments[i];
            if (!obj) {
                continue;
            }
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (typeof obj[key] === 'object') {
                        _extend(out[key], obj[key]);
                    } else {
                        out[key] = obj[key];
                    }
                }
            }
        }
        return out;
    };
    var _indexOf = function (val, arr) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].toLowerCase() === val.toLowerCase()) {
                return i;
            }
        }
        return -1;
    };
    var defaultSettings = {
        dateSettings: {
            days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            months: [
                'January', 'February', 'March', 'April', 'May', 'June', 'July',
                'August', 'September', 'October', 'November', 'December'
            ],
            monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            meridiem: ['AM', 'PM'],
            ordinal: function (number) {
                var n = number % 10, suffixes = {1: 'st', 2: 'nd', 3: 'rd'};
                return Math.floor(number % 100 / 10) === 1 || !suffixes[n] ? 'th' : suffixes[n];
            }
        },
        separators: /[ \-+\/\.T:@]/g,
        validParts: /[dDjlNSwzWFmMntLoYyaABgGhHisueTIOPZcrU]/g,
        intParts: /[djwNzmnyYhHgGis]/g,
        tzParts: /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        tzClip: /[^-+\dA-Z]/g
    };

    //var DateFormatter = function (options) {
        var self = this, config = _extend(defaultSettings, options);
        self.dateSettings = config.dateSettings;
        self.separators = config.separators;
        self.validParts = config.validParts;
        self.intParts = config.intParts;
        self.tzParts = config.tzParts;
        self.tzClip = config.tzClip;
    //};


};

DateFormatter.prototype = {
    constructor: DateFormatter,
	
    _lpad : function (value, length, char) {
        var chr = char || '0', val = value.toString();
        return val.length < length ? this._lpad(chr + val, length) : val;
    },

    getMonth: function (val) {
        var self = this, i;
        i = this._indexOf(val, self.dateSettings.monthsShort) + 1;
        if (i === 0) {
            i = this._indexOf(val, self.dateSettings.months) + 1;
        }
        return i;
    },
    parseDate: function (vDate, vFormat) {
        var self = this, vFormatParts, vDateParts, i, vDateFlag = false, vTimeFlag = false, vDatePart, iDatePart,
            vSettings = self.dateSettings, vMonth, vMeriIndex, vMeriOffset, len, mer,
            out = {date: null, year: null, month: null, day: null, hour: 0, min: 0, sec: 0};
        if (!vDate) {
            return null;
        }
        if (vDate instanceof Date) {
            return vDate;
        }
        if (vFormat === 'U') {
            i = parseInt(vDate);
            return i ? new Date(i * 1000) : vDate;
        }
        switch (typeof vDate) {
            case 'number':
                return new Date(vDate);
            case 'string':
                break;
            default:
                return null;
        }
        vFormatParts = vFormat.match(self.validParts);
        if (!vFormatParts || vFormatParts.length === 0) {
            throw new Error("Invalid date format definition.");
        }
        vDateParts = vDate.replace(self.separators, '\0').split('\0');
        for (i = 0; i < vDateParts.length; i++) {
            vDatePart = vDateParts[i];
            iDatePart = parseInt(vDatePart);
            switch (vFormatParts[i]) {
                case 'y':
                case 'Y':
                    if (iDatePart) {
                        len = vDatePart.length;
                        out.year = len === 2 ? parseInt((iDatePart < 70 ? '20' : '19') + vDatePart) : iDatePart;
                    } else {
                        return null;
                    }
                    vDateFlag = true;
                    break;
                case 'm':
                case 'n':
                case 'M':
                case 'F':
                    if (isNaN(iDatePart)) {
                        vMonth = self.getMonth(vDatePart);
                        if (vMonth > 0) {
                            out.month = vMonth;
                        } else {
                            return null;
                        }
                    } else {
                        if (iDatePart >= 1 && iDatePart <= 12) {
                            out.month = iDatePart;
                        } else {
                            return null;
                        }
                    }
                    vDateFlag = true;
                    break;
                case 'd':
                case 'j':
                    if (iDatePart >= 1 && iDatePart <= 31) {
                        out.day = iDatePart;
                    } else {
                        return null;
                    }
                    vDateFlag = true;
                    break;
                case 'g':
                case 'h':
                    vMeriIndex = (vFormatParts.indexOf('a') > -1) ? vFormatParts.indexOf('a') :
                        (vFormatParts.indexOf('A') > -1) ? vFormatParts.indexOf('A') : -1;
                    mer = vDateParts[vMeriIndex];
                    if (vMeriIndex > -1) {
                        vMeriOffset = this._compare(mer, vSettings.meridiem[0]) ? 0 :
                            (this._compare(mer, vSettings.meridiem[1]) ? 12 : -1);
                        if (iDatePart >= 1 && iDatePart <= 12 && vMeriOffset > -1) {
                            out.hour = iDatePart + vMeriOffset - 1;
                        } else if (iDatePart >= 0 && iDatePart <= 23) {
                            out.hour = iDatePart;
                        }
                    } else {
                        if (iDatePart >= 0 && iDatePart <= 23) {
                            out.hour = iDatePart;
                        } else {
                            return null;
                        }
                    }
                    vTimeFlag = true;
                    break;
                case 'G':
                case 'H':
                    if (iDatePart >= 0 && iDatePart <= 23) {
                        out.hour = iDatePart;
                    } else {
                        return null;
                    }
                    vTimeFlag = true;
                    break;
                case 'i':
                    if (iDatePart >= 0 && iDatePart <= 59) {
                        out.min = iDatePart;
                    } else {
                        return null;
                    }
                    vTimeFlag = true;
                    break;
                case 's':
                    if (iDatePart >= 0 && iDatePart <= 59) {
                        out.sec = iDatePart;
                    } else {
                        return null;
                    }
                    vTimeFlag = true;
                    break;
            }
        }
        if (vDateFlag === true && out.year && out.month && out.day) {
            out.date = new Date(out.year, out.month - 1, out.day, out.hour, out.min, out.sec, 0);
        } else {
            if (vTimeFlag !== true) {
                return null;
            }
            out.date = new Date(0, 0, 0, out.hour, out.min, out.sec, 0);
        }
        return out.date;
    },
    guessDate: function (vDateStr, vFormat) {
        if (typeof vDateStr !== 'string') {
            return vDateStr;
        }
        var self = this, vParts = vDateStr.replace(self.separators, '\0').split('\0'), vPattern = /^[djmn]/g, len,
            vFormatParts = vFormat.match(self.validParts), vDate = new Date(), vDigit = 0, vYear, i, n, iPart, iSec;

        if (!vPattern.test(vFormatParts[0])) {
            return vDateStr;
        }

        for (i = 0; i < vParts.length; i++) {
            vDigit = 2;
            iPart = vParts[i];
            iSec = parseInt(iPart.substr(0, 2));
            if (isNaN(iSec)) {
                return null;
            }
            switch (i) {
                case 0:
                    if (vFormatParts[0] === 'm' || vFormatParts[0] === 'n') {
                        vDate.setMonth(iSec - 1);
                    } else {
                        vDate.setDate(iSec);
                    }
                    break;
                case 1:
                    if (vFormatParts[0] === 'm' || vFormatParts[0] === 'n') {
                        vDate.setDate(iSec);
                    } else {
                        vDate.setMonth(iSec - 1);
                    }
                    break;
                case 2:
                    vYear = vDate.getFullYear();
                    len = iPart.length;
                    vDigit = len < 4 ? len : 4;
                    vYear = parseInt(len < 4 ? vYear.toString().substr(0, 4 - len) + iPart : iPart.substr(0, 4));
                    if (!vYear) {
                        return null;
                    }
                    vDate.setFullYear(vYear);
                    break;
                case 3:
                    vDate.setHours(iSec);
                    break;
                case 4:
                    vDate.setMinutes(iSec);
                    break;
                case 5:
                    vDate.setSeconds(iSec);
                    break;
            }
            n = iPart.substr(vDigit);
            if (n.length > 0) {
                vParts.splice(i + 1, 0, n);
            }
        }
        return vDate;
    },
    parseFormat: function (vChar, vDate) {
        var self = this, vSettings = self.dateSettings, fmt, backslash = /\\?(.?)/gi, doFormat = function (t, s) {
            return fmt[t] ? fmt[t]() : s;
        };
        fmt = {
            /////////
            // DAY //
            /////////
            /**
             * Day of month with leading 0: `01..31`
             * @return {string}
             */
            d: function () {
                return self._lpad(fmt.j(), 2);
            },
            /**
             * Shorthand day name: `Mon...Sun`
             * @return {string}
             */
            D: function () {
                return vSettings.daysShort[fmt.w()];
            },
            /**
             * Day of month: `1..31`
             * @return {number}
             */
            j: function () {
                return vDate.getDate();
            },
            /**
             * Full day name: `Monday...Sunday`
             * @return {number}
             */
            l: function () {
                return vSettings.days[fmt.w()];
            },
            /**
             * ISO-8601 day of week: `1[Mon]..7[Sun]`
             * @return {number}
             */
            N: function () {
                return fmt.w() || 7;
            },
            /**
             * Day of week: `0[Sun]..6[Sat]`
             * @return {number}
             */
            w: function () {
                return vDate.getDay();
            },
            /**
             * Day of year: `0..365`
             * @return {number}
             */
            z: function () {
                var a = new Date(fmt.Y(), fmt.n() - 1, fmt.j()), b = new Date(fmt.Y(), 0, 1);
                return Math.round((a - b) / DAY);
            },

            //////////
            // WEEK //
            //////////
            /**
             * ISO-8601 week number
             * @return {number}
             */
            W: function () {
                var a = new Date(fmt.Y(), fmt.n() - 1, fmt.j() - fmt.N() + 3), b = new Date(a.getFullYear(), 0, 4);
                return self._lpad(1 + Math.round((a - b) / DAY / 7), 2);
            },

            ///////////
            // MONTH //
            ///////////
            /**
             * Full month name: `January...December`
             * @return {string}
             */
            F: function () {
                return vSettings.months[vDate.getMonth()];
            },
            /**
             * Month w/leading 0: `01..12`
             * @return {string}
             */
            m: function () {
                return self._lpad(fmt.n(), 2);
            },
            /**
             * Shorthand month name; `Jan...Dec`
             * @return {string}
             */
            M: function () {
                return vSettings.monthsShort[vDate.getMonth()];
            },
            /**
             * Month: `1...12`
             * @return {number}
             */
            n: function () {
                return vDate.getMonth() + 1;
            },
            /**
             * Days in month: `28...31`
             * @return {number}
             */
            t: function () {
                return (new Date(fmt.Y(), fmt.n(), 0)).getDate();
            },

            //////////
            // YEAR //
            //////////
            /**
             * Is leap year? `0 or 1`
             * @return {number}
             */
            L: function () {
                var Y = fmt.Y();
                return (Y % 4 === 0 && Y % 100 !== 0 || Y % 400 === 0) ? 1 : 0;
            },
            /**
             * ISO-8601 year
             * @return {number}
             */
            o: function () {
                var n = fmt.n(), W = fmt.W(), Y = fmt.Y();
                return Y + (n === 12 && W < 9 ? 1 : n === 1 && W > 9 ? -1 : 0);
            },
            /**
             * Full year: `e.g. 1980...2010`
             * @return {number}
             */
            Y: function () {
                return vDate.getFullYear();
            },
            /**
             * Last two digits of year: `00...99`
             * @return {string}
             */
            y: function () {
                return fmt.Y().toString().slice(-2);
            },

            //////////
            // TIME //
            //////////
            /**
             * Meridian lower: `am or pm`
             * @return {string}
             */
            a: function () {
                return fmt.A().toLowerCase();
            },
            /**
             * Meridian upper: `AM or PM`
             * @return {string}
             */
            A: function () {
                var n = fmt.G() < 12 ? 0 : 1;
                return vSettings.meridiem[n];
            },
            /**
             * Swatch Internet time: `000..999`
             * @return {string}
             */
            B: function () {
                var H = vDate.getUTCHours() * HOUR, i = vDate.getUTCMinutes() * 60, s = vDate.getUTCSeconds();
                return self._lpad(Math.floor((H + i + s + HOUR) / 86.4) % 1000, 3);
            },
            /**
             * 12-Hours: `1..12`
             * @return {number}
             */
            g: function () {
                return fmt.G() % 12 || 12;
            },
            /**
             * 24-Hours: `0..23`
             * @return {number}
             */
            G: function () {
                return vDate.getHours();
            },
            /**
             * 12-Hours with leading 0: `01..12`
             * @return {string}
             */
            h: function () {
                return self._lpad(fmt.g(), 2);
            },
            /**
             * 24-Hours w/leading 0: `00..23`
             * @return {string}
             */
            H: function () {
                return self._lpad(fmt.G(), 2);
            },
            /**
             * Minutes w/leading 0: `00..59`
             * @return {string}
             */
            i: function () {
                return self._lpad(vDate.getMinutes(), 2);
            },
            /**
             * Seconds w/leading 0: `00..59`
             * @return {string}
             */
            s: function () {
                return self._lpad(vDate.getSeconds(), 2);
            },
            /**
             * Microseconds: `000000-999000`
             * @return {string}
             */
            u: function () {
                return self._lpad(vDate.getMilliseconds() * 1000, 6);
            },

            //////////////
            // TIMEZONE //
            //////////////
            /**
             * Timezone identifier: `e.g. Atlantic/Azores, ...`
             * @return {string}
             */
            e: function () {
                var str = /\((.*)\)/.exec(String(vDate))[1];
                return str || 'Coordinated Universal Time';
            },
            /**
             * DST observed? `0 or 1`
             * @return {number}
             */
            I: function () {
                var a = new Date(fmt.Y(), 0), c = Date.UTC(fmt.Y(), 0),
                    b = new Date(fmt.Y(), 6), d = Date.UTC(fmt.Y(), 6);
                return ((a - c) !== (b - d)) ? 1 : 0;
            },
            /**
             * Difference to GMT in hour format: `e.g. +0200`
             * @return {string}
             */
            O: function () {
                var tzo = vDate.getTimezoneOffset(), a = Math.abs(tzo);
                return (tzo > 0 ? '-' : '+') + this._lpad(Math.floor(a / 60) * 100 + a % 60, 4);
            },
            /**
             * Difference to GMT with colon: `e.g. +02:00`
             * @return {string}
             */
            P: function () {
                var O = fmt.O();
                return (O.substr(0, 3) + ':' + O.substr(3, 2));
            },
            /**
             * Timezone abbreviation: `e.g. EST, MDT, ...`
             * @return {string}
             */
            T: function () {
                var str = (String(vDate).match(self.tzParts) || [""]).pop().replace(self.tzClip, "");
                return str || 'UTC';
            },
            /**
             * Timezone offset in seconds: `-43200...50400`
             * @return {number}
             */
            Z: function () {
                return -vDate.getTimezoneOffset() * 60;
            },

            ////////////////////
            // FULL DATE TIME //
            ////////////////////
            /**
             * ISO-8601 date
             * @return {string}
             */
            c: function () {
                return 'Y-m-d\\TH:i:sP'.replace(backslash, doFormat);
            },
            /**
             * RFC 2822 date
             * @return {string}
             */
            r: function () {
                return 'D, d M Y H:i:s O'.replace(backslash, doFormat);
            },
            /**
             * Seconds since UNIX epoch
             * @return {number}
             */
            U: function () {
                return vDate.getTime() / 1000 || 0;
            }
        };
        return doFormat(vChar, vChar);
    },
    formatDate: function (vDate, vFormat) {
        var self = this, i, n, len, str, vChar, vDateStr = '', BACKSLASH = '\\';
        if (typeof vDate === 'string') {
            vDate = self.parseDate(vDate, vFormat);
            if (!vDate) {
                return null;
            }
        }
        if (vDate instanceof Date) {
            len = vFormat.length;
            for (i = 0; i < len; i++) {
                vChar = vFormat.charAt(i);
                if (vChar === 'S' || vChar === BACKSLASH) {
                    continue;
                }
                if (i > 0 && vFormat.charAt(i - 1) === BACKSLASH) {
                    vDateStr += vChar;
                    continue;
                }
                str = self.parseFormat(vChar, vDate);
                if (i !== (len - 1) && self.intParts.test(vChar) && vFormat.charAt(i + 1) === 'S') {
                    n = parseInt(str) || 0;
                    str += self.dateSettings.ordinal(n);
                }
                vDateStr += str;
            }
            return vDateStr;
        }
        return '';
    }
};

module.exports = DateFormatter;

},{}],61:[function(_dereq_,module,exports){
/*! zzdom - v0.4.0b - 2025-04-07 12:45:35 */
/**
 * A namespace.
 * @const
 */
var zzDOM = {};

/*
    zz function
    
    zz( '#', 'id' );
    zz( '.', 'className' );
    zz( 't', 'tagName' );
    zz( 'tn', 'namespace', 'tagName' );
    zz( 'n', 'name' );
    zz( 's', 'string selector' );
    zz( document.getElementById( 'id' ) ); // Element
    zz( document.getElementsByClassName( 'className' ) ); // HTMLCollection
    zz( document.getElementsByName( 'name' ) ); // NodeList
    zz( 'table.className tr td' ); // String selector
    zz( '<div>New div</div>' ); // HTML code in string
*/
/**
 * @param {string|Element|HTMLCollection|NodeList} x
 * @param {string=} s1
 * @param {string=} s2 
 */
zzDOM.zz = function( x, s1, s2 ){
    
    // Redefine x if a selector id is found
    if ( s1 ){
        switch ( x ){
        case '#':
            x = document.getElementById( s1 );
            break;
        case '.':
            x = document.getElementsByClassName( s1 );
            break;
        case 't':
            x = document.getElementsByTagName( s1 );
            break;
        case 'tn':
            x = document.getElementsByTagNameNS( s1, s2 || '' );
            break;
        case 'n':
            x = document.getElementsByName( s1 );
            break;
        case 's':
            x = document.querySelector( s1 );
            break;
        default:
            throw 'Unsupported selector id found running zz function: ' + x;
        }
    }
    
    // Is it an Element?
    if ( x instanceof Element ){
        return new zzDOM.SS( x );
    }
    
    // Is it an HTMLCollection, a NodeList or an array?
    if ( x instanceof HTMLCollection || x instanceof NodeList || Array.isArray( x ) ){
        return zzDOM._build( x );
    }
    
    if ( typeof x === 'string' ){
        x = x.trim();
        return zzDOM._build(
            x.charAt( 0 ) === '<'? // Is it HTML code?
                zzDOM._htmlToElement( x ):
                document.querySelectorAll( x ) // Must be a standard selector
        );
    }
    
    throw 'Unsupported selector type found running zz function.';
};

// Build args array with toInsert as first position and then the arguments of this function
zzDOM._args = function( previousArgs, toInsert ){
    var result = Array.prototype.slice.call( previousArgs );
    result.push( toInsert );
    return result;
};

zzDOM._build = function ( x ) {
    if ( x instanceof Element || typeof x === 'string' ){ // Allow string to support map method
        return new zzDOM.SS( x );
    }
    if ( x instanceof HTMLCollection || x instanceof NodeList || Array.isArray( x ) ){
        x = Array.prototype.slice.call( x );
    }
    return x.length === 1? new zzDOM.SS( x[ 0 ] ): new zzDOM.MM( x );
};

zzDOM._getError = function ( method ) {
    return 'Method "' + method + '" not ready for that type!';
};

zzDOM._htmlToElement = function ( html ) {
    var template = document.createElement( 'template' );
    template.innerHTML = html.trim();
    return template.content.childElementCount === 1?
        template.content.firstChild:
        template.content.childNodes;
};

zzDOM._get = function ( nodes, i ) {
    if ( i == null ){
        return nodes;
    }
    if ( Number.isInteger( i ) ){
        return nodes[ i ];
    }
    throw zzDOM._getError( 'get' );
};

// Register zz function
var zz;
(function() { 
    zz = zzDOM.zz; 
})();

zzDOM._events = {};

zzDOM._addEventListener = function( ss, eventName, listener, useCapture ){
    var el = ss.el;
    var elId = ss._getElId();
    var thisEvents = zzDOM._events[ elId ];
    if ( ! thisEvents ){
        thisEvents = {};
        zzDOM._events[ elId ] = thisEvents;
    }
    var thisListeners = thisEvents[ eventName ];
    if ( ! thisListeners ){
        thisListeners = [];
        thisEvents[ eventName ] = thisListeners;
    }
    thisListeners.push( listener );
    
    // addEventListener
    el.addEventListener( eventName, listener, useCapture );
};

//TODO must remove all listeners when an element is removed
zzDOM._removeEventListener = function( ss, eventName, listener, useCapture ){
    var el = ss.el;
    var elId = ss._getElId();
    var thisEvents = zzDOM._events[ elId ];
    if ( ! thisEvents ){
        return;
    }
    
    if ( ! eventName ){ 
        // Must remove all events
        for ( var currentEventName in thisEvents ){
            var currentListeners = thisEvents[ currentEventName ];
            zzDOM._removeListeners( el, currentListeners, null, useCapture, currentEventName );
        }
        return;
    }
    
    // Must remove listeners of only one event
    var thisListeners = thisEvents[ eventName ];
    zzDOM._removeListeners( el, thisListeners, listener, useCapture, eventName );
};

//TODO test all the listeners are removed
zzDOM._removeListeners = function( el, thisListeners, listener, useCapture, eventName ){
    if ( ! thisListeners ){
        return;
    }
    for ( var i = 0; i < thisListeners.length; ++i ){
        var currentListener = thisListeners[ i ];
        if ( ! listener || currentListener === listener ){
            thisListeners.splice( i, 1 ); // Delete listener at i position
            el.removeEventListener( eventName, currentListener, useCapture );
            if ( listener ){
                return;
            }
        }
    } 
};
/* End of events */

zzDOM._dd = {};

zzDOM._getDefaultDisplay = function( el ) {
    var nodeName = el.nodeName;
    var display = zzDOM._dd[ nodeName ];

    if ( display ) {
        return display;
    }

    var doc = el.ownerDocument;
    var temp = doc.body.appendChild( doc.createElement( nodeName ) );
    display = getComputedStyle( temp )[ 'display' ];

    temp.parentNode.removeChild( temp );

    if ( display === 'none' ) {
        display = 'block';
    }
    zzDOM._dd[ nodeName ] = display;

    return display;
};
/* End of visible */

/* It depends on forms plugin! */
// Serialize a ss instance, a mm instance or an object into a query string
zzDOM._paramItem = function( r, key, value ) {
    r.push( 
        encodeURIComponent( key ) + '=' + encodeURIComponent( value == null? '': value )
    );
};
/** @nocollapse */
zzDOM.param = function( x ) {
	
    if ( x == null ) {
        return '';
    }

    var r = [];
    
    if ( x instanceof zzDOM.SS ){
        zzDOM._paramItem( r, x.attr( 'name' ), x.val() );
    } else if ( x instanceof zzDOM.MM ){
        for ( var c = 0; c < x.list.length; ++c ){
            var ss = x.list[ c ];
            zzDOM._paramItem( r, ss.attr( 'name' ), ss.val() );
        }
    } else if ( typeof x === 'object' ){  
        for ( var i in x ) {
            zzDOM._paramItem( r, i, x[ i ] );
        }
    } else {
        throw zzDOM._getError( 'param' );
    }

    return r.join( '&' );
};
/* end of utils */

/** @constructor */
zzDOM.SS = function ( _el ) {
    this.list = [ this ];
    this.el = _el;
    this.nodes = [ _el ];
    
    // Array like
    this.length = 1;
    this[ 0 ] = _el;
};

/* Methods NOT included in jquery */
zzDOM.SS.prototype._gcs = function ( self, property ) {
    var x = getComputedStyle( self.el, null )[ property ].replace( 'px', '' );
    return isNaN( x )? x: parseFloat( x );
};

zzDOM.SS.prototype._getElId = function(){
    var elId = this.el.getAttribute( 'data-elId' );
    if ( ! elId ){
        // Generate a random string with 4 chars
        elId = Math.floor( ( 1 + Math.random() ) * 0x10000 )
            .toString( 16 )
            .substring( 1 );
        this.el.setAttribute( 'data-elId', elId );
    }
    return elId;
};

zzDOM.SS.prototype._insertHelper = function ( position, x ) {
    if ( x instanceof Element ){
        this.el.insertAdjacentElement( position, x );
    } else if ( x instanceof zzDOM.SS ){
        this.el.insertAdjacentElement( position, x.el );
    } else if ( typeof x === 'string' ) {
        this.el.insertAdjacentHTML( position, x );
    } else {
        throw 'Insert operation not ready for that type!';
    }
    return this;
};

zzDOM.SS.prototype._iterate = function( value, fn ){
    if ( Array.isArray( value ) ){
        for ( var i = 0; i < value.length; ++i ){
            fn( this, value[ i ] );
        }
    } else {
        fn( this, value );   
    }
    return this;
};

zzDOM.SS.prototype._outer = function ( property, linked1, linked2, withMargin ) {
    if ( this.el[ 'offset' + property ] ) {
        return zzDOM.SS._outerCalc( this, property, linked1, linked2, withMargin );
    }
    
    var self = this;
    return this._swap( 
        this.el, 
        function(){
            return zzDOM.SS._outerCalc( self, property, linked1, linked2, withMargin );
        } 
    );
};

zzDOM.SS._outerCalc = function ( ss, property, linked1, linked2, withMargin ) {
    var value = ss._gcs( ss, property.toLowerCase() );
    var padding = ss._gcs( ss, 'padding' + linked1 ) + ss._gcs( ss, 'padding' + linked2 );
    var border = ss._gcs( ss, 'border' + linked1 + 'Width' ) + ss._gcs( ss, 'border' + linked2 + 'Width' );
    
    var total = value + padding + border;
    
    // No margin
    if ( ! withMargin ){
        return total;
    }
    
    var margin = ss._gcs( ss, 'margin' + linked1 ) + ss._gcs( ss, 'margin' + linked2 );
    return total + margin;
};

zzDOM.SS.prototype._setCssUsingKeyValue = function ( key, value ) {
    if ( typeof value === 'function' ) {
        value = value.call( this.el, this._i === undefined? 0: this._i, this );
    }
    this.el.style[ key ] = 
        typeof value === 'string' && ! /^-?\d+\.?\d*$/.test( value )? // if it is a string and is not a float number
            value: 
            value + 'px';
};

zzDOM.SS.prototype._setCssUsingObject = function ( object ) {
    for ( var key in object ) {
        this._setCssUsingKeyValue( key, object[ key ] );
    }
};

/**
 * @param {string} property
 * @param {string|Function=} value
 */
zzDOM.SS.prototype._styleProperty = function ( property, value ) {
    // get
    if ( value === undefined ){
        var self = this;
        value = this._gcs( this, property );
        return parseFloat( 
            value !== 'auto'? 
                value: 
                this._swap( 
                    this.el, 
                    function(){
                        return self._gcs( self, property );
                    } 
                )
        );
    }

    // set
    this._setCssUsingKeyValue( property, value );
    return this;
};

zzDOM.SS.prototype._swap = function( _el, callback ) {
    var old = {};
    var options = {
        display: 'block',
        position: 'absolute',
        visibility: 'hidden'
    };

    // Remember the old values and insert the new ones
    for ( var name in options ) {
        old[ name ] = _el.style[ name ];
        _el.style[ name ] = options[ name ];
    }

    var val = callback.call( _el );

    // Revert the old values
    for ( name in options ) {
        _el.style[ name ] = old[ name ];
    }

    return val;
};

/* Methods included in jquery */
zzDOM.SS.prototype.addClass = function ( name ) {
    return this._iterate(
        name,
        function( self, v ){
            self.el.classList.add( v ); 
        }
    );
};

zzDOM.SS.prototype.after = function ( x ) {
    return this._insertHelper( 'afterend', x );
};

zzDOM.SS.prototype.append = function ( x ) {
    if ( x instanceof Element ){
        this.el.appendChild( x );
    } else if ( x instanceof zzDOM.SS ){
        this.el.appendChild( x.el );
    } else if ( typeof x === 'string' ) {
        this.el.insertAdjacentHTML( 'beforeend', x );
    } else {
        throw zzDOM._getError( 'append' );
    }
    return this;
};

zzDOM.SS.prototype.appendTo = function ( x ) {
    // Do nothing and return this if it is null
    if ( x == null ){
        return this;    
    }
    
    // Is it a Element?
    if ( x instanceof Element ){
        x.appendChild( this.el );
        return this;
    }
    
    // Is it a string?
    if ( typeof x === 'string' ){
        x = zzDOM._build(
            document.querySelectorAll( x )
        );
    }
    
    // Is it a zzDOM.SS?
    if ( x instanceof zzDOM.SS ) {
        x.el.appendChild( this.el );
        return this;
    }
    
    // Is it a zzDOM.MM?
    if ( x instanceof zzDOM.MM ) {
        for ( var i = 0; i < x.nodes.length; ++i ){
            x.nodes[ i ].appendChild( this.el.cloneNode( true ) );
        }
        return this;
    } 
    
    throw zzDOM._getError( 'is' );
};

//TODO add support of function type in value
/**
 * @param {string|Object} x
 * @param {string=} value
 */
zzDOM.SS.prototype.attr = function ( x, value ) {
    // set using object
    if ( typeof x === 'object' ){
        for ( var key in x ) {
            this.attr( key, x[ key ] );
        }
        return this;
    }
    
    // get
    if ( value === undefined ){
        return this.el.getAttribute( x );
    }
    
    // remove attr
    if ( value === null ){
        return this.removeAttr( x );    
    }
    
    // set
    this.el.setAttribute( x, value );
    return this;
};

zzDOM.SS.prototype.before = function ( x ) {
    return this._insertHelper( 'beforebegin', x );
};

zzDOM.SS.prototype.children = function ( selector ) {
    return zzDOM._build( 
        selector?
            Array.prototype.filter.call(
                this.el.children, 
                function( child ){
                    return child.matches( selector );
                }
            ):
            this.el.children 
    );
};

zzDOM.SS.prototype.clone = function (  ) {
    return new zzDOM.SS( this.el.cloneNode( true ) );
};

//TODO add support of function type in value
/**
 * @param {string|Object} x1
 * @param {string|number=} x2
 */
zzDOM.SS.prototype.css = function ( x1, x2 ) {
    var number = arguments.length;
    
    if ( number === 1 ){
        if ( ! x1 ){
            throw 'Null value not allowed in css method!';
        }
        
        // get
        if ( typeof x1 === 'string' ) {
            return getComputedStyle( this.el )[ x1 ];
        }
        
        // set using object
        if ( typeof x1 === 'object' ){
            this._setCssUsingObject( x1 );
            return this;
        }
        
        throw 'Wrong type or argument in css method!';
    }
    
    // set using key value pair
    if ( number === 2 ){
        this._setCssUsingKeyValue( x1, x2 );
        return this;
    }
    
    throw 'Wrong number of arguments in css method!';
};

zzDOM.SS.prototype.each = function ( eachFn ) {
    eachFn.call( this.el, 0, this, this.nodes );
    return this;
};

zzDOM.SS.prototype.empty = function (  ) {
    while( this.el.firstChild ){
        this.el.removeChild( this.el.firstChild );
    }
    return this;
};

zzDOM.SS.prototype.filter = function ( x ) {
    if ( typeof x === 'string' ){ // Is a string selector
        return zzDOM._build( 
            this.el.matches( x )? [ this.el ]: []
        );
    }
    
    if ( typeof x === 'function' ){ // Is a function
        return zzDOM._build(
            x.call( this.el, this._i === undefined? 0: this._i, this )? [ this.el ]: []
        );
    }  
    
    throw zzDOM._getError( 'filter' );
};

zzDOM.SS.prototype.find = function ( selector ) {
    return zzDOM._build( 
        this.el.querySelectorAll( selector )
    );
};

zzDOM.SS.prototype.first = function () {
    return this;
};

zzDOM.SS.prototype.hasClass = function ( name ) {
    return this.el.classList.contains( name );
};

zzDOM.SS.prototype.height = function ( value ) {
    return this._styleProperty( 'height', value );
};

//TODO add support of function type in value
zzDOM.SS.prototype.html = function ( value ) {
    // get
    if ( value === undefined ){
        return this.el.innerHTML;
    }

    // set
    this.el.innerHTML = value;
    return this;
};

zzDOM.SS.prototype.index = function () {
    if ( ! this.el ){
        return -1;
    }
    
    var i = 0;
    var currentEl = this.el;
    do {
        i++;
    } while ( currentEl = currentEl.previousElementSibling );
    
    return i;
};

zzDOM.SS.prototype.is = function ( x ) {
    if ( x == null ){
        return false;    
    }
    
    if ( x instanceof Element ){
        return this.el === x;
    }
    
    if ( x instanceof zzDOM.SS ) {
        return this.el === x.el;
    } 

    if ( x instanceof zzDOM.MM ) {
        for ( var i = 0; i < x.nodes.length; ++i ){
            if ( this.el === x.nodes[ i ] ){
                return true;
            }
        }
        return false;
    } 

    if ( typeof x === 'string' ){
        return this.el.matches( x );
    }
    
    return false;
};

zzDOM.SS.prototype.next = function () {
    return new zzDOM.SS( this.el.nextElementSibling );
};

zzDOM.SS.prototype.offset = function ( c ) {
    
    // set top and left using css
    if ( c ){
        this._styleProperty( 'top', c.top );
        this._styleProperty( 'left', c.left );
        return this;
    }
    
    // get
    var rect = this.el.getBoundingClientRect();
    return {
        top: rect.top + document.body.scrollTop,
        left: rect.left + document.body.scrollLeft
    };
};

zzDOM.SS.prototype.offsetParent = function () {
    var offsetParent = this.el.offsetParent;
    return offsetParent? new zzDOM.SS( offsetParent ): this;
};

/**
 * @param {boolean=} withMargin
 */
zzDOM.SS.prototype.outerHeight = function ( withMargin ) {
    return this._outer( 'Height', 'Top', 'Bottom', withMargin );
};

/**
 * @param {boolean=} withMargin
 */
zzDOM.SS.prototype.outerWidth = function ( withMargin ) {
    return this._outer( 'Width', 'Left', 'Right', withMargin );
};

zzDOM.SS.prototype.parent = function () {
    return new zzDOM.SS( this.el.parentNode );
};

zzDOM.SS.prototype.parents = function ( selector ) {
    var nodes = [];
    var node = this.el;
    while ( ( node = node.parentNode ) && node !== document ) {
        if ( ! selector || node.matches( selector ) ){
            nodes.push( node );
        }
    }
    return zzDOM._build( nodes );
};

zzDOM.SS.prototype.position = function ( relativeToViewport ) {
    return relativeToViewport?
        this.el.getBoundingClientRect():
        { 
            left: this.el.offsetLeft, 
            top: this.el.offsetTop
        };
};

zzDOM.SS.prototype.prepend = function ( x ) {
    if ( x instanceof Element ){
        this.el.insertBefore( x, this.el.firstChild );
    } else if ( x instanceof zzDOM.SS ){
        this.el.insertBefore( x.el, this.el.firstChild );
    } else if ( typeof x === 'string' ){
        this.el.insertAdjacentHTML( 'afterbegin', x );
    } else {
        throw zzDOM._getError( 'prepend' );
    }
    return this;
};

zzDOM.SS.prototype.prev = function () {
    return new zzDOM.SS( this.el.previousElementSibling );
};

zzDOM.SS.prototype.remove = function () {
    this.el.parentNode.removeChild( this.el );
    return this;
};

zzDOM.SS.prototype.removeAttr = function ( name ) {
    this.el.removeAttribute( name );
    return this;
};

zzDOM.SS.prototype.removeClass = function ( name ) {
    if ( ! name ){
        this.el.className = '';
        return this;
    }
    
    return this._iterate(
        name,
        function( self, v ){
            self.el.classList.remove( v );
        }
    );
};

zzDOM.SS.prototype.replaceWith = function ( value ) {
    this.el.outerHTML = value;
    return this;
};

zzDOM.SS.prototype.siblings = function ( selector ) {
    var self = this;
    var nodes = Array.prototype.filter.call( 
        this.el.parentNode.children, 
        selector?
            function( child ){
                return child !== self.el && child.matches( selector );
            }:
            function( child ){
                return child !== self.el;
            }
    );
    return zzDOM._build( nodes );
};

//TODO add support of function type in value
zzDOM.SS.prototype.text = function ( value ) {
    // get
    if ( value === undefined ){
        return this.el.textContent;
    }

    // set
    this.el.textContent = value;
    return this;
};

zzDOM.SS.prototype.toggleClass = function ( name, state ) {
    return this._iterate(
        name,
        state === undefined?
            function( self, v ){
                self.el.classList.toggle( v );
            }:
            function( self, v ){
                self.el.classList.toggle( v, state );
            }
    );
};

zzDOM.SS.prototype.width = function ( value ) {
    return this._styleProperty( 'width', value );
};



zzDOM.SS.prototype.map = function ( mapFn ) {
    return zzDOM._build(
        mapFn.call( this.el, 0, this.el )
    );
};

zzDOM.SS.prototype.get = function ( i ) {
    return zzDOM._get( this.nodes, i );
};

zzDOM.SS.prototype.off = function ( eventName, listener, useCapture ) {
    zzDOM._removeEventListener( this, eventName, listener, useCapture );
    return this;
};

zzDOM.SS.prototype.on = function ( eventName, listener, data, useCapture ) {
    zzDOM._addEventListener( 
        this, 
        eventName, 
        data? 
            function( e ){
                e.data = data;
                return listener.call( e.currentTarget, e );
            }:
            listener, 
        useCapture 
    );
    return this;
};

zzDOM.SS.prototype.trigger = function ( eventName, params ) {
    var event = new Event( eventName, { bubbles: true, cancelable: false } );
    if ( params ){
        event.params = params;
    }
    this.el.dispatchEvent( event );
    return this;
};
/* End of events */

zzDOM.SS.prototype.hide = function () {
    if ( this.isVisible() ){
        this.attr( 
            'data-display', 
            getComputedStyle( this.el, null )[ 'display' ]
        );
        this.el.style.display = 'none';
    }
    return this;
};

zzDOM.SS.prototype.isVisible = function () {
    return !! this.el.offsetParent;
    //return getComputedStyle( this.el, null ).getPropertyValue( 'display' ) !== 'none';
};

zzDOM.SS.prototype.show = function () {
    if ( ! this.isVisible() ){
        var display = this.attr( 'data-display' );
        this.el.style.display = display? display: zzDOM._getDefaultDisplay( this.el );
    }
    return this;
};

zzDOM.SS.prototype.toggle = function ( state ) {
    var value = state !== undefined? ! state: this.isVisible();
    return value? this.hide(): this.show();
};

/** @suppress {missingProperties} */
zzDOM.SS.prototype.fadeIn = function ( params = {} ) {
    var { ms, callback } = params;
    ms = ms || 400;
    var finishFadeIn = () => {
        this.el.removeEventListener( 'transitionend', finishFadeIn );
        callback && callback();
    };
    this.el.style.transition = 'opacity 0s';
    this.el.style.display = '';
    this.el.style.opacity = 0;
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            this.el.addEventListener( 'transitionend', finishFadeIn );
            this.el.style.transition = `opacity ${ms/1000}s`;
            this.el.style.opacity = 1;
        });
    });
    return this;
};

/** @suppress {missingProperties} */
zzDOM.SS.prototype.fadeOut = function ( params = {} ) {
    var { ms, callback } = params;
    ms = ms || 400;
    var finishFadeOut = () => {
        this.el.style.display = 'none';
        this.el.removeEventListener( 'transitionend', finishFadeOut );
        callback && callback();
    };
    this.el.style.transition = 'opacity 0s';
    this.el.style.opacity = 1;
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            this.el.style.transition = `opacity ${ms/1000}s`;
            this.el.addEventListener( 'transitionend', finishFadeOut );
            this.el.style.opacity = 0;
        });
    });
    return this;
};
/* End of visible */

// checked only works on radio, checkbox and option
zzDOM.SS.prototype.checked = function ( value ) {
    return this.prop( 'checked', value );
};

// disabled only works on button, fieldset, optgroup, option, select, textarea and input
zzDOM.SS.prototype.disabled = function ( value ) {
    return this.prop( 'disabled', value );
};

// indeterminate only works on checkbox, radio and progress
zzDOM.SS.prototype.indeterminate = function ( value ) {
    return this.prop( 'indeterminate', value );
};

//TODO add support of object and function types in value
zzDOM.SS.prototype.prop = function ( key, value ) {
    
    // get
    if ( value === undefined ){
        return !! this.el[ key ];
    }
    
    // set
    this.el[ key ] = value;
    return this;
};

/**
 * @param {Array<?>|String=} value
 */
zzDOM.SS.prototype.val = function ( value ) {
    // get
    if ( value === undefined ){
        switch ( this.el.nodeName ) {
        case 'INPUT':
        case 'TEXTAREA':
        case 'BUTTON':
        case 'OPTION':
        case 'CHECKBOX':
            return this.el.value;
        case 'SELECT':
            var values = [];
            for ( var i = 0; i < this.el.length; ++i ) {
                if ( this.el[ i ].selected ) {
                    values.push( this.el[ i ].value );
                }
            }
            return values.length > 1? values: values[ 0 ];
        default:
            throw zzDOM._getError( 'val' );
        }
    }
    
    // set
    switch ( this.el.nodeName ) {
    case 'INPUT':
    case 'TEXTAREA':
    case 'BUTTON':
    case 'OPTION':
    case 'CHECKBOX':
        this.el.value = value;
        break;
    case 'SELECT':
        if ( typeof value === 'string' || typeof value === 'number' || value == null ) {
            value = [ value ];
        }
        for ( i = 0; i < this.el.length; ++i ) {
            for ( var j = 0; j < value.length; ++j ) {
                this.el[ i ].selected = '';
                if ( this.el[ i ].value == value[ j ] ) {
                    this.el[ i ].selected = 'selected';
                    break;
                }
            }
        }
        break;
    default:
        throw zzDOM._getError( 'val' );
    }
    
    return this;
};
/* End of forms */

zzDOM.SS.prototype.getXCenter = function() {
    return ( document.documentElement.clientWidth - this.outerWidth() ) / 2;
};

zzDOM.SS.prototype.getYCenter = function() {
    return ( document.documentElement.clientHeight - this.outerHeight() ) / 2;
};

zzDOM.SS.prototype.getCenter = function() {
    return {
        left: this.getXCenter(),
        top: this.getYCenter()
    };
};

zzDOM.SS.prototype.center = function() {
    this.offset( 
        this.getCenter() 
    );
    return this;
};

zzDOM.SS.prototype.centerX = function() {
    this.css( 'left', this.getXCenter() );
    return this;
};

zzDOM.SS.prototype.centerY = function() {
    this.css( 'top', this.getYCenter() );
    return this;
};
/* End of center */

/** @constructor */
zzDOM.MM = function ( _nodes ) {    
    this.list = [];
    this.nodes = _nodes.filter( n => n ); // Remove null elements
    this.length = this.nodes.length;
    
    // Init nodes
    for ( var i = 0; i < this.length; i++ ) {
        var el = this.nodes[ i ];
        this[ i ] = el; // for array like
        var ss = new zzDOM.SS( el );
        this.list.push( ss );
        ss._i = i; // for index in functions
    }
};

/*
Unify the definition of a function of zzDOM.SS.prototype and a definition of zzDOM.MM.prototype. Example:

    zzDOM.add( 
        zzDOM.SS.prototype.myCustomFunction = function(){
            ...
            return this;
        },
        zzDOM.MM.constructors.concat
    );
);
*/
/**
 * @param {Function} ssPrototype
 * @param {Function=} constructor
 */
zzDOM.add = function( ssPrototype, constructor ){
    for ( var id in zzDOM.SS.prototype ){
        var current = zzDOM.SS.prototype[ id ];
        if ( ssPrototype === current ){
            var closure = function(){
                var functionId = id;
                return constructor? constructor( functionId ): zzDOM.MM.constructors.default( functionId );
            };
            zzDOM.MM.prototype[ id ] = closure();
            return;
        }
    }
    
    throw 'Error registering zzDOM.MM: zzDOM.SS not found.';
};

zzDOM.MM.constructors = {};
zzDOM.MM.constructors.booleanOr = function( functionId ){
    return function(){
        for ( var i = 0; i < this.list.length; i++ ) {
            var ss = this.list[ i ];
            var x = ss[ functionId ].apply( ss, arguments );
            if ( x ){
                return true;
            }
        }
        return false;
    };
};
zzDOM.MM.constructors.concat = function( functionId ){
    return function(){
        var newNodes = [];
        for ( var i = 0; i < this.list.length; i++ ) {
            var ss = this.list[ i ];
            var x = ss[ functionId ].apply( ss, arguments );
            newNodes = [...new Set([...newNodes, ...x.nodes])]; // Concat not adding duplicates
            //newNodes = newNodes.concat( x.nodes );
        }
        return zzDOM._build( newNodes );
    };
};
zzDOM.MM.constructors.default = function( functionId ){
    return function(){
        for ( var i = 0; i < this.list.length; i++ ) {
            var ss = this.list[ i ];
            var r = ss[ functionId ].apply( ss, arguments );
            if ( i === 0 && ! ( r instanceof zzDOM.SS ) ){
                return r;
            }
        }
        return this;
    };
};
zzDOM.MM.constructors.callback = function( functionId ){
    return function(){
        if ( ! arguments[ 0 ] ){
            arguments[ 0 ] = {};
        }
        var callback = arguments[ 0 ].callback;
        for ( var i = 0; i < this.list.length; i++ ) {
            var ss = this.list[ i ];
            arguments[ 0 ].callback = i !== this.list.length - 1? undefined: callback; // Run callback just once (the last one)
            ss[ functionId ].apply( ss, arguments );
        }
        return this;
    };
};
zzDOM.MM.constructors.appendText = function( functionId ){
    return function(){
        var text = '';
        var textMode = false;
        for ( var i = 0; i < this.list.length; i++ ) {
            var ss = this.list[ i ];
            var x = ss[ functionId ].apply( ss, arguments );
            if ( typeof x === 'string' ){
                text += ( text == ''? '': ' ' ) + x;
                textMode = true;
            }
        }
        //return textMode? text: this;
        return ! this.list.length && ! arguments.length?
            null:
            textMode? text: this;
    };
};
/*
zzDOM.MM.constructors.val = function( functionId ){
    return function(){
        for ( var i = 0; i < this.list.length; i++ ) {
            var ss = this.list[ i ];
            var r = ss[ functionId ].apply( ss, arguments );
            if ( i === 0 && ! ( r instanceof zzDOM.SS ) ){
                return r;
            }
        }
        return ! this.list.length && ! arguments.length? null: this;
    };
};
*/
zzDOM.MM.constructors.val = function( functionId, len ){
    return function(){
        for ( var i = 0; i < this.list.length; i++ ) {
            var ss = this.list[ i ];
            var r = ss[ functionId ].apply( ss, arguments );
            if ( i === 0 && ! ( r instanceof zzDOM.SS ) ){
                return r;
            }
        }
        return ! this.list.length && arguments.length === len? null: this;
    };
};
zzDOM.MM.constructors.val0 = function( functionId ){
    return zzDOM.MM.constructors.val( functionId, 0 );
};
zzDOM.MM.constructors.val1 = function( functionId ){
    return zzDOM.MM.constructors.val( functionId, 1 );
};

// Init prototype functions from zzDOM.SS
zzDOM.MM.init = function(){
    // Concat functions
    var concatF = [
        'children',
        'clone',
        'filter',
        'find',
        'next',
        'offsetParent',
        'parent',
        'parents',
        'prev',
        'siblings'
    ];
    // Boolean functions
    var booleanOrF = [
        'hasClass',
        'is'
    ];
    // Callback functions
    var callbackF = [
        'fadeIn',
        'fadeOut'
    ];
    // Append text functions
    var appendF = [
        'text'
    ];
    // Val functions
    var val0F = [
        'checked',
        'disabled',
        'html',
        'indeterminate',
        'val'
    ];
    var val1F = [
        'prop'
    ];
    for ( var id in zzDOM.SS.prototype ){
        var closure = function(){
            var functionId = id;
            
            if ( concatF.indexOf( functionId ) !== -1 ){
                return zzDOM.MM.constructors.concat( functionId );
            }
            if ( booleanOrF.indexOf( functionId ) !== -1 ){
                return zzDOM.MM.constructors.booleanOr( functionId );
            }
            if ( callbackF.indexOf( functionId ) !== -1 ){
                return zzDOM.MM.constructors.callback( functionId );
            }
            if ( appendF.indexOf( functionId ) !== -1 ){
                return zzDOM.MM.constructors.appendText( functionId );
            }
            if ( val0F.indexOf( functionId ) !== -1 ){
                return zzDOM.MM.constructors.val0( functionId );
            }
            if ( val1F.indexOf( functionId ) !== -1 ){
                return zzDOM.MM.constructors.val1( functionId );
            }
            return zzDOM.MM.constructors.default( functionId );
        };
        zzDOM.MM.prototype[ id ] = closure();
    }
}();

/* Methods included in jquery */
zzDOM.MM.prototype.each = function ( eachFn ) {
    var self = this;
    Array.prototype.forEach.call( 
        this.list, 
        function( currentValue, index ){
            eachFn.call( currentValue.el, index, currentValue, self.nodes );
        }
    );
    return this;
};

zzDOM.MM.prototype.first = function () {
    return this.length == 0? this: this.list[ 0 ];
};

zzDOM.MM.prototype.map = function ( mapFn ) {
    var newNodes = this.nodes.map( ( node, i ) => {
        return mapFn.call( node, i, node );
    });
    return zzDOM._build( newNodes );
};

zzDOM.MM.prototype.get = function ( i ) {
    return zzDOM._get( this.nodes, i );
};

// Register zzDOM if we are using Node
if ( typeof module === 'object' && module.exports ) {
    module.exports = zzDOM;
}

},{}],62:[function(_dereq_,module,exports){
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.loadjs = factory();
  }
}(this, function() {
/**
 * Global dependencies.
 * @global {Object} document - DOM
 */

var devnull = function() {},
    bundleIdCache = {},
    bundleResultCache = {},
    bundleCallbackQueue = {};


/**
 * Subscribe to bundle load event.
 * @param {string[]} bundleIds - Bundle ids
 * @param {Function} callbackFn - The callback function
 */
function subscribe(bundleIds, callbackFn) {
  // listify
  bundleIds = bundleIds.push ? bundleIds : [bundleIds];

  var depsNotFound = [],
      i = bundleIds.length,
      numWaiting = i,
      fn,
      bundleId,
      r,
      q;

  // define callback function
  fn = function (bundleId, pathsNotFound) {
    if (pathsNotFound.length) depsNotFound.push(bundleId);

    numWaiting--;
    if (!numWaiting) callbackFn(depsNotFound);
  };

  // register callback
  while (i--) {
    bundleId = bundleIds[i];

    // execute callback if in result cache
    r = bundleResultCache[bundleId];
    if (r) {
      fn(bundleId, r);
      continue;
    }

    // add to callback queue
    q = bundleCallbackQueue[bundleId] = bundleCallbackQueue[bundleId] || [];
    q.push(fn);
  }
}


/**
 * Publish bundle load event.
 * @param {string} bundleId - Bundle id
 * @param {string[]} pathsNotFound - List of files not found
 */
function publish(bundleId, pathsNotFound) {
  // exit if id isn't defined
  if (!bundleId) return;

  var q = bundleCallbackQueue[bundleId];

  // cache result
  bundleResultCache[bundleId] = pathsNotFound;

  // exit if queue is empty
  if (!q) return;

  // empty callback queue
  while (q.length) {
    q[0](bundleId, pathsNotFound);
    q.splice(0, 1);
  }
}


/**
 * Execute callbacks.
 * @param {Object or Function} args - The callback args
 * @param {string[]} depsNotFound - List of dependencies not found
 */
function executeCallbacks(args, depsNotFound) {
  // accept function as argument
  if (args.call) args = {success: args};

  // success and error callbacks
  if (depsNotFound.length) (args.error || devnull)(depsNotFound);
  else (args.success || devnull)(args);
}


/**
 * Load individual file.
 * @param {string} path - The file path
 * @param {Function} callbackFn - The callback function
 */
function loadFile(path, callbackFn, args, numTries) {
  var doc = document,
      async = args.async,
      maxTries = (args.numRetries || 0) + 1,
      beforeCallbackFn = args.before || devnull,
      pathname = path.replace(/[\?|#].*$/, ''),
      pathStripped = path.replace(/^(css|img|module|nomodule)!/, ''),
      isLegacyIECss,
      hasModuleSupport,
      e;

  numTries = numTries || 0;

  if (/(^css!|\.css$)/.test(pathname)) {
    // css
    e = doc.createElement('link');
    e.rel = 'stylesheet';
    e.href = pathStripped;

    // tag IE9+
    isLegacyIECss = 'hideFocus' in e;

    // use preload in IE Edge (to detect load errors)
    if (isLegacyIECss && e.relList) {
      isLegacyIECss = 0;
      e.rel = 'preload';
      e.as = 'style';
    }
  } else if (/(^img!|\.(png|gif|jpg|svg|webp)$)/.test(pathname)) {
    // image
    e = doc.createElement('img');
    e.src = pathStripped;    
  } else {
    // javascript
    e = doc.createElement('script');
    e.src = pathStripped;
    e.async = async === undefined ? true : async;

    // handle es modules
    // modern browsers:
    //   module: add to dom with type="module"
    //   nomodule: call success() callback without adding to dom
    // legacy browsers:
    //   module: call success() callback without adding to dom
    //   nomodule: add to dom with default type ("text/javascript")
    hasModuleSupport = 'noModule' in e;
    if (/^module!/.test(pathname)) {
      if (!hasModuleSupport) return callbackFn(path, 'l');
      e.type = "module";
    } else if (/^nomodule!/.test(pathname) && hasModuleSupport) return callbackFn(path, 'l');
  }

  e.onload = e.onerror = e.onbeforeload = function (ev) {
    var result = ev.type[0];

    // treat empty stylesheets as failures to get around lack of onerror
    // support in IE9-11
    if (isLegacyIECss) {
      try {
        if (!e.sheet.cssText.length) result = 'e';
      } catch (x) {
        // sheets objects created from load errors don't allow access to
        // `cssText` (unless error is Code:18 SecurityError)
        if (x.code != 18) result = 'e';
      }
    }

    // handle retries in case of load failure
    if (result == 'e') {
      // increment counter
      numTries += 1;

      // exit function and try again
      if (numTries < maxTries) {
        return loadFile(path, callbackFn, args, numTries);
      }
    } else if (e.rel == 'preload' && e.as == 'style') {
      // activate preloaded stylesheets
      return e.rel = 'stylesheet'; // jshint ignore:line
    }
    
    // execute callback
    callbackFn(path, result, ev.defaultPrevented);
  };

  // add to document (unless callback returns `false`)
  if (beforeCallbackFn(path, e) !== false) doc.head.appendChild(e);
}


/**
 * Load multiple files.
 * @param {string[]} paths - The file paths
 * @param {Function} callbackFn - The callback function
 */
function loadFiles(paths, callbackFn, args) {
  // listify paths
  paths = paths.push ? paths : [paths];

  var numWaiting = paths.length,
      x = numWaiting,
      pathsNotFound = [],
      fn,
      i;

  // define callback function
  fn = function(path, result, defaultPrevented) {
    // handle error
    if (result == 'e') pathsNotFound.push(path);

    // handle beforeload event. If defaultPrevented then that means the load
    // will be blocked (ex. Ghostery/ABP on Safari)
    if (result == 'b') {
      if (defaultPrevented) pathsNotFound.push(path);
      else return;
    }

    numWaiting--;
    if (!numWaiting) callbackFn(pathsNotFound);
  };

  // load scripts
  for (i=0; i < x; i++) loadFile(paths[i], fn, args);
}


/**
 * Initiate script load and register bundle.
 * @param {(string|string[])} paths - The file paths
 * @param {(string|Function|Object)} [arg1] - The (1) bundleId or (2) success
 *   callback or (3) object literal with success/error arguments, numRetries,
 *   etc.
 * @param {(Function|Object)} [arg2] - The (1) success callback or (2) object
 *   literal with success/error arguments, numRetries, etc.
 */
function loadjs(paths, arg1, arg2) {
  var bundleId,
      args;

  // bundleId (if string)
  if (arg1 && arg1.trim) bundleId = arg1;

  // args (default is {})
  args = (bundleId ? arg2 : arg1) || {};

  // throw error if bundle is already defined
  if (bundleId) {
    if (bundleId in bundleIdCache) {
      throw "LoadJS";
    } else {
      bundleIdCache[bundleId] = true;
    }
  }

  function loadFn(resolve, reject) {
    loadFiles(paths, function (pathsNotFound) {
      // execute callbacks
      executeCallbacks(args, pathsNotFound);
      
      // resolve Promise
      if (resolve) {
        executeCallbacks({success: resolve, error: reject}, pathsNotFound);
      }

      // publish bundle load event
      publish(bundleId, pathsNotFound);
    }, args);
  }
  
  if (args.returnPromise) return new Promise(loadFn);
  else loadFn();
}


/**
 * Execute callbacks when dependencies have been satisfied.
 * @param {(string|string[])} deps - List of bundle ids
 * @param {Object} args - success/error arguments
 */
loadjs.ready = function ready(deps, args) {
  // subscribe to bundle load event
  subscribe(deps, function (depsNotFound) {
    // execute callbacks
    executeCallbacks(args, depsNotFound);
  });

  return loadjs;
};


/**
 * Manually satisfy bundle dependencies.
 * @param {string} bundleId - The bundle id
 */
loadjs.done = function done(bundleId) {
  publish(bundleId, []);
};


/**
 * Reset loadjs dependencies statuses
 */
loadjs.reset = function reset() {
  bundleIdCache = {};
  bundleResultCache = {};
  bundleCallbackQueue = {};
};


/**
 * Determine if bundle has already been defined
 * @param String} bundleId - The bundle id
 */
loadjs.isDefined = function isDefined(bundleId) {
  return bundleId in bundleIdCache;
};


// export
return loadjs;

}));

},{}],63:[function(_dereq_,module,exports){
/**
 * Copyright 2015 Tim Down.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


(function(factory,root){if(typeof define=="function"&&define.amd){define(factory);}else if(typeof module!="undefined"&&typeof exports=="object"){module.exports=factory();}else{root.log4javascript=factory();}})(function(){if(!Array.prototype.push){Array.prototype.push=function(){for(var i=0,len=arguments.length;i<len;i++){this[this.length]=arguments[i];}
return this.length;};}
if(!Array.prototype.shift){Array.prototype.shift=function(){if(this.length>0){var firstItem=this[0];for(var i=0,len=this.length-1;i<len;i++){this[i]=this[i+1];}
this.length=this.length-1;return firstItem;}};}
if(!Array.prototype.splice){Array.prototype.splice=function(startIndex,deleteCount){var itemsAfterDeleted=this.slice(startIndex+deleteCount);var itemsDeleted=this.slice(startIndex,startIndex+deleteCount);this.length=startIndex;var argumentsArray=[];for(var i=0,len=arguments.length;i<len;i++){argumentsArray[i]=arguments[i];}
var itemsToAppend=(argumentsArray.length>2)?itemsAfterDeleted=argumentsArray.slice(2).concat(itemsAfterDeleted):itemsAfterDeleted;for(i=0,len=itemsToAppend.length;i<len;i++){this.push(itemsToAppend[i]);}
return itemsDeleted;};}
function isUndefined(obj){return typeof obj=="undefined";}
function EventSupport(){}
EventSupport.prototype={eventTypes:[],eventListeners:{},setEventTypes:function(eventTypesParam){if(eventTypesParam instanceof Array){this.eventTypes=eventTypesParam;this.eventListeners={};for(var i=0,len=this.eventTypes.length;i<len;i++){this.eventListeners[this.eventTypes[i]]=[];}}else{handleError("log4javascript.EventSupport ["+this+"]: setEventTypes: eventTypes parameter must be an Array");}},addEventListener:function(eventType,listener){if(typeof listener=="function"){if(!array_contains(this.eventTypes,eventType)){handleError("log4javascript.EventSupport ["+this+"]: addEventListener: no event called '"+eventType+"'");}
this.eventListeners[eventType].push(listener);}else{handleError("log4javascript.EventSupport ["+this+"]: addEventListener: listener must be a function");}},removeEventListener:function(eventType,listener){if(typeof listener=="function"){if(!array_contains(this.eventTypes,eventType)){handleError("log4javascript.EventSupport ["+this+"]: removeEventListener: no event called '"+eventType+"'");}
array_remove(this.eventListeners[eventType],listener);}else{handleError("log4javascript.EventSupport ["+this+"]: removeEventListener: listener must be a function");}},dispatchEvent:function(eventType,eventArgs){if(array_contains(this.eventTypes,eventType)){var listeners=this.eventListeners[eventType];for(var i=0,len=listeners.length;i<len;i++){listeners[i](this,eventType,eventArgs);}}else{handleError("log4javascript.EventSupport ["+this+"]: dispatchEvent: no event called '"+eventType+"'");}}};var applicationStartDate=new Date();var uniqueId="log4javascript_"+applicationStartDate.getTime()+"_"+
Math.floor(Math.random()*100000000);var emptyFunction=function(){};var newLine="\r\n";var pageLoaded=false;function Log4JavaScript(){}
Log4JavaScript.prototype=new EventSupport();var log4javascript=new Log4JavaScript();log4javascript.version="1.4.13";log4javascript.edition="log4javascript";function toStr(obj){if(obj&&obj.toString){return obj.toString();}else{return String(obj);}}
function getExceptionMessage(ex){if(ex.message){return ex.message;}else if(ex.description){return ex.description;}else{return toStr(ex);}}
function getUrlFileName(url){var lastSlashIndex=Math.max(url.lastIndexOf("/"),url.lastIndexOf("\\"));return url.substr(lastSlashIndex+1);}
function getExceptionStringRep(ex){if(ex){var exStr="Exception: "+getExceptionMessage(ex);try{if(ex.lineNumber){exStr+=" on line number "+ex.lineNumber;}
if(ex.fileName){exStr+=" in file "+getUrlFileName(ex.fileName);}}catch(localEx){logLog.warn("Unable to obtain file and line information for error");}
if(showStackTraces&&ex.stack){exStr+=newLine+"Stack trace:"+newLine+ex.stack;}
return exStr;}
return null;}
function bool(obj){return Boolean(obj);}
function trim(str){return str.replace(/^\s+/,"").replace(/\s+$/,"");}
function splitIntoLines(text){var text2=text.replace(/\r\n/g,"\n").replace(/\r/g,"\n");return text2.split("\n");}
var urlEncode=(typeof window.encodeURIComponent!="undefined")?function(str){return encodeURIComponent(str);}:function(str){return escape(str).replace(/\+/g,"%2B").replace(/"/g,"%22").replace(/'/g,"%27").replace(/\//g,"%2F").replace(/=/g,"%3D");};function array_remove(arr,val){var index=-1;for(var i=0,len=arr.length;i<len;i++){if(arr[i]===val){index=i;break;}}
if(index>=0){arr.splice(index,1);return true;}else{return false;}}
function array_contains(arr,val){for(var i=0,len=arr.length;i<len;i++){if(arr[i]==val){return true;}}
return false;}
function extractBooleanFromParam(param,defaultValue){if(isUndefined(param)){return defaultValue;}else{return bool(param);}}
function extractStringFromParam(param,defaultValue){if(isUndefined(param)){return defaultValue;}else{return String(param);}}
function extractIntFromParam(param,defaultValue){if(isUndefined(param)){return defaultValue;}else{try{var value=parseInt(param,10);return isNaN(value)?defaultValue:value;}catch(ex){logLog.warn("Invalid int param "+param,ex);return defaultValue;}}}
function extractFunctionFromParam(param,defaultValue){if(typeof param=="function"){return param;}else{return defaultValue;}}
function isError(err){return(err instanceof Error);}
if(!Function.prototype.apply){Function.prototype.apply=function(obj,args){var methodName="__apply__";if(typeof obj[methodName]!="undefined"){methodName+=String(Math.random()).substr(2);}
obj[methodName]=this;var argsStrings=[];for(var i=0,len=args.length;i<len;i++){argsStrings[i]="args["+i+"]";}
var script="obj."+methodName+"("+argsStrings.join(",")+")";var returnValue=eval(script);delete obj[methodName];return returnValue;};}
if(!Function.prototype.call){Function.prototype.call=function(obj){var args=[];for(var i=1,len=arguments.length;i<len;i++){args[i-1]=arguments[i];}
return this.apply(obj,args);};}
var logLog={quietMode:false,debugMessages:[],setQuietMode:function(quietMode){this.quietMode=bool(quietMode);},numberOfErrors:0,alertAllErrors:false,setAlertAllErrors:function(alertAllErrors){this.alertAllErrors=alertAllErrors;},debug:function(message){this.debugMessages.push(message);},displayDebug:function(){alert(this.debugMessages.join(newLine));},warn:function(message,exception){},error:function(message,exception){if(++this.numberOfErrors==1||this.alertAllErrors){if(!this.quietMode){var alertMessage="log4javascript error: "+message;if(exception){alertMessage+=newLine+newLine+"Original error: "+getExceptionStringRep(exception);}
alert(alertMessage);}}}};log4javascript.logLog=logLog;log4javascript.setEventTypes(["load","error"]);function handleError(message,exception){logLog.error(message,exception);log4javascript.dispatchEvent("error",{"message":message,"exception":exception});}
log4javascript.handleError=handleError;var enabled=!((typeof log4javascript_disabled!="undefined")&&log4javascript_disabled);log4javascript.setEnabled=function(enable){enabled=bool(enable);};log4javascript.isEnabled=function(){return enabled;};var useTimeStampsInMilliseconds=true;log4javascript.setTimeStampsInMilliseconds=function(timeStampsInMilliseconds){useTimeStampsInMilliseconds=bool(timeStampsInMilliseconds);};log4javascript.isTimeStampsInMilliseconds=function(){return useTimeStampsInMilliseconds;};log4javascript.evalInScope=function(expr){return eval(expr);};var showStackTraces=false;log4javascript.setShowStackTraces=function(show){showStackTraces=bool(show);};var Level=function(level,name){this.level=level;this.name=name;};Level.prototype={toString:function(){return this.name;},equals:function(level){return this.level==level.level;},isGreaterOrEqual:function(level){return this.level>=level.level;}};Level.ALL=new Level(Number.MIN_VALUE,"ALL");Level.TRACE=new Level(10000,"TRACE");Level.DEBUG=new Level(20000,"DEBUG");Level.INFO=new Level(30000,"INFO");Level.WARN=new Level(40000,"WARN");Level.ERROR=new Level(50000,"ERROR");Level.FATAL=new Level(60000,"FATAL");Level.OFF=new Level(Number.MAX_VALUE,"OFF");log4javascript.Level=Level;function Timer(name,level){this.name=name;this.level=isUndefined(level)?Level.INFO:level;this.start=new Date();}
Timer.prototype.getElapsedTime=function(){return new Date().getTime()-this.start.getTime();};var anonymousLoggerName="[anonymous]";var defaultLoggerName="[default]";var nullLoggerName="[null]";var rootLoggerName="root";function Logger(name){this.name=name;this.parent=null;this.children=[];var appenders=[];var loggerLevel=null;var isRoot=(this.name===rootLoggerName);var isNull=(this.name===nullLoggerName);var appenderCache=null;var appenderCacheInvalidated=false;this.addChild=function(childLogger){this.children.push(childLogger);childLogger.parent=this;childLogger.invalidateAppenderCache();};var additive=true;this.getAdditivity=function(){return additive;};this.setAdditivity=function(additivity){var valueChanged=(additive!=additivity);additive=additivity;if(valueChanged){this.invalidateAppenderCache();}};this.addAppender=function(appender){if(isNull){handleError("Logger.addAppender: you may not add an appender to the null logger");}else{if(appender instanceof log4javascript.Appender){if(!array_contains(appenders,appender)){appenders.push(appender);appender.setAddedToLogger(this);this.invalidateAppenderCache();}}else{handleError("Logger.addAppender: appender supplied ('"+
toStr(appender)+"') is not a subclass of Appender");}}};this.removeAppender=function(appender){array_remove(appenders,appender);appender.setRemovedFromLogger(this);this.invalidateAppenderCache();};this.removeAllAppenders=function(){var appenderCount=appenders.length;if(appenderCount>0){for(var i=0;i<appenderCount;i++){appenders[i].setRemovedFromLogger(this);}
appenders.length=0;this.invalidateAppenderCache();}};this.getEffectiveAppenders=function(){if(appenderCache===null||appenderCacheInvalidated){var parentEffectiveAppenders=(isRoot||!this.getAdditivity())?[]:this.parent.getEffectiveAppenders();appenderCache=parentEffectiveAppenders.concat(appenders);appenderCacheInvalidated=false;}
return appenderCache;};this.invalidateAppenderCache=function(){appenderCacheInvalidated=true;for(var i=0,len=this.children.length;i<len;i++){this.children[i].invalidateAppenderCache();}};this.log=function(level,params){if(enabled&&level.isGreaterOrEqual(this.getEffectiveLevel())){var exception;var finalParamIndex=params.length-1;var lastParam=params[finalParamIndex];if(params.length>1&&isError(lastParam)){exception=lastParam;finalParamIndex--;}
var messages=[];for(var i=0;i<=finalParamIndex;i++){messages[i]=params[i];}
var loggingEvent=new LoggingEvent(this,new Date(),level,messages,exception);this.callAppenders(loggingEvent);}};this.callAppenders=function(loggingEvent){var effectiveAppenders=this.getEffectiveAppenders();for(var i=0,len=effectiveAppenders.length;i<len;i++){effectiveAppenders[i].doAppend(loggingEvent);}};this.setLevel=function(level){if(isRoot&&level===null){handleError("Logger.setLevel: you cannot set the level of the root logger to null");}else if(level instanceof Level){loggerLevel=level;}else{handleError("Logger.setLevel: level supplied to logger "+
this.name+" is not an instance of log4javascript.Level");}};this.getLevel=function(){return loggerLevel;};this.getEffectiveLevel=function(){for(var logger=this;logger!==null;logger=logger.parent){var level=logger.getLevel();if(level!==null){return level;}}};this.group=function(name,initiallyExpanded){if(enabled){var effectiveAppenders=this.getEffectiveAppenders();for(var i=0,len=effectiveAppenders.length;i<len;i++){effectiveAppenders[i].group(name,initiallyExpanded);}}};this.groupEnd=function(){if(enabled){var effectiveAppenders=this.getEffectiveAppenders();for(var i=0,len=effectiveAppenders.length;i<len;i++){effectiveAppenders[i].groupEnd();}}};var timers={};this.time=function(name,level){if(enabled){if(isUndefined(name)){handleError("Logger.time: a name for the timer must be supplied");}else if(level&&!(level instanceof Level)){handleError("Logger.time: level supplied to timer "+
name+" is not an instance of log4javascript.Level");}else{timers[name]=new Timer(name,level);}}};this.timeEnd=function(name){if(enabled){if(isUndefined(name)){handleError("Logger.timeEnd: a name for the timer must be supplied");}else if(timers[name]){var timer=timers[name];var milliseconds=timer.getElapsedTime();this.log(timer.level,["Timer "+toStr(name)+" completed in "+milliseconds+"ms"]);delete timers[name];}else{logLog.warn("Logger.timeEnd: no timer found with name "+name);}}};this.assert=function(expr){if(enabled&&!expr){var args=[];for(var i=1,len=arguments.length;i<len;i++){args.push(arguments[i]);}
args=(args.length>0)?args:["Assertion Failure"];args.push(newLine);args.push(expr);this.log(Level.ERROR,args);}};this.toString=function(){return"Logger["+this.name+"]";};}
Logger.prototype={trace:function(){this.log(Level.TRACE,arguments);},debug:function(){this.log(Level.DEBUG,arguments);},info:function(){this.log(Level.INFO,arguments);},warn:function(){this.log(Level.WARN,arguments);},error:function(){this.log(Level.ERROR,arguments);},fatal:function(){this.log(Level.FATAL,arguments);},isEnabledFor:function(level){return level.isGreaterOrEqual(this.getEffectiveLevel());},isTraceEnabled:function(){return this.isEnabledFor(Level.TRACE);},isDebugEnabled:function(){return this.isEnabledFor(Level.DEBUG);},isInfoEnabled:function(){return this.isEnabledFor(Level.INFO);},isWarnEnabled:function(){return this.isEnabledFor(Level.WARN);},isErrorEnabled:function(){return this.isEnabledFor(Level.ERROR);},isFatalEnabled:function(){return this.isEnabledFor(Level.FATAL);}};Logger.prototype.trace.isEntryPoint=true;Logger.prototype.debug.isEntryPoint=true;Logger.prototype.info.isEntryPoint=true;Logger.prototype.warn.isEntryPoint=true;Logger.prototype.error.isEntryPoint=true;Logger.prototype.fatal.isEntryPoint=true;var loggers={};var loggerNames=[];var ROOT_LOGGER_DEFAULT_LEVEL=Level.DEBUG;var rootLogger=new Logger(rootLoggerName);rootLogger.setLevel(ROOT_LOGGER_DEFAULT_LEVEL);log4javascript.getRootLogger=function(){return rootLogger;};log4javascript.getLogger=function(loggerName){if(typeof loggerName!="string"){loggerName=anonymousLoggerName;logLog.warn("log4javascript.getLogger: non-string logger name "+
toStr(loggerName)+" supplied, returning anonymous logger");}
if(loggerName==rootLoggerName){handleError("log4javascript.getLogger: root logger may not be obtained by name");}
if(!loggers[loggerName]){var logger=new Logger(loggerName);loggers[loggerName]=logger;loggerNames.push(loggerName);var lastDotIndex=loggerName.lastIndexOf(".");var parentLogger;if(lastDotIndex>-1){var parentLoggerName=loggerName.substring(0,lastDotIndex);parentLogger=log4javascript.getLogger(parentLoggerName);}else{parentLogger=rootLogger;}
parentLogger.addChild(logger);}
return loggers[loggerName];};var defaultLogger=null;log4javascript.getDefaultLogger=function(){if(!defaultLogger){defaultLogger=createDefaultLogger();}
return defaultLogger;};var nullLogger=null;log4javascript.getNullLogger=function(){if(!nullLogger){nullLogger=new Logger(nullLoggerName);nullLogger.setLevel(Level.OFF);}
return nullLogger;};log4javascript.resetConfiguration=function(){rootLogger.setLevel(ROOT_LOGGER_DEFAULT_LEVEL);loggers={};};var LoggingEvent=function(logger,timeStamp,level,messages,exception){this.logger=logger;this.timeStamp=timeStamp;this.timeStampInMilliseconds=timeStamp.getTime();this.timeStampInSeconds=Math.floor(this.timeStampInMilliseconds/1000);this.milliseconds=this.timeStamp.getMilliseconds();this.level=level;this.messages=messages;this.exception=exception;};LoggingEvent.prototype={getThrowableStrRep:function(){return this.exception?getExceptionStringRep(this.exception):"";},getCombinedMessages:function(){return(this.messages.length==1)?this.messages[0]:this.messages.join(newLine);},toString:function(){return"LoggingEvent["+this.level+"]";}};log4javascript.LoggingEvent=LoggingEvent;var Layout=function(){};Layout.prototype={defaults:{loggerKey:"logger",timeStampKey:"timestamp",millisecondsKey:"milliseconds",levelKey:"level",messageKey:"message",exceptionKey:"exception",urlKey:"url"},loggerKey:"logger",timeStampKey:"timestamp",millisecondsKey:"milliseconds",levelKey:"level",messageKey:"message",exceptionKey:"exception",urlKey:"url",batchHeader:"",batchFooter:"",batchSeparator:"",returnsPostData:false,overrideTimeStampsSetting:false,useTimeStampsInMilliseconds:null,format:function(){handleError("Layout.format: layout supplied has no format() method");},ignoresThrowable:function(){handleError("Layout.ignoresThrowable: layout supplied has no ignoresThrowable() method");},getContentType:function(){return"text/plain";},allowBatching:function(){return true;},setTimeStampsInMilliseconds:function(timeStampsInMilliseconds){this.overrideTimeStampsSetting=true;this.useTimeStampsInMilliseconds=bool(timeStampsInMilliseconds);},isTimeStampsInMilliseconds:function(){return this.overrideTimeStampsSetting?this.useTimeStampsInMilliseconds:useTimeStampsInMilliseconds;},getTimeStampValue:function(loggingEvent){return this.isTimeStampsInMilliseconds()?loggingEvent.timeStampInMilliseconds:loggingEvent.timeStampInSeconds;},getDataValues:function(loggingEvent,combineMessages){var dataValues=[[this.loggerKey,loggingEvent.logger.name],[this.timeStampKey,this.getTimeStampValue(loggingEvent)],[this.levelKey,loggingEvent.level.name],[this.urlKey,window.location.href],[this.messageKey,combineMessages?loggingEvent.getCombinedMessages():loggingEvent.messages]];if(!this.isTimeStampsInMilliseconds()){dataValues.push([this.millisecondsKey,loggingEvent.milliseconds]);}
if(loggingEvent.exception){dataValues.push([this.exceptionKey,getExceptionStringRep(loggingEvent.exception)]);}
if(this.hasCustomFields()){for(var i=0,len=this.customFields.length;i<len;i++){var val=this.customFields[i].value;if(typeof val==="function"){val=val(this,loggingEvent);}
dataValues.push([this.customFields[i].name,val]);}}
return dataValues;},setKeys:function(loggerKey,timeStampKey,levelKey,messageKey,exceptionKey,urlKey,millisecondsKey){this.loggerKey=extractStringFromParam(loggerKey,this.defaults.loggerKey);this.timeStampKey=extractStringFromParam(timeStampKey,this.defaults.timeStampKey);this.levelKey=extractStringFromParam(levelKey,this.defaults.levelKey);this.messageKey=extractStringFromParam(messageKey,this.defaults.messageKey);this.exceptionKey=extractStringFromParam(exceptionKey,this.defaults.exceptionKey);this.urlKey=extractStringFromParam(urlKey,this.defaults.urlKey);this.millisecondsKey=extractStringFromParam(millisecondsKey,this.defaults.millisecondsKey);},setCustomField:function(name,value){var fieldUpdated=false;for(var i=0,len=this.customFields.length;i<len;i++){if(this.customFields[i].name===name){this.customFields[i].value=value;fieldUpdated=true;}}
if(!fieldUpdated){this.customFields.push({"name":name,"value":value});}},hasCustomFields:function(){return(this.customFields.length>0);},formatWithException:function(loggingEvent){var formatted=this.format(loggingEvent);if(loggingEvent.exception&&this.ignoresThrowable()){formatted+=loggingEvent.getThrowableStrRep();}
return formatted;},toString:function(){handleError("Layout.toString: all layouts must override this method");}};log4javascript.Layout=Layout;var Appender=function(){};Appender.prototype=new EventSupport();Appender.prototype.layout=new PatternLayout();Appender.prototype.threshold=Level.ALL;Appender.prototype.loggers=[];Appender.prototype.doAppend=function(loggingEvent){if(enabled&&loggingEvent.level.level>=this.threshold.level){this.append(loggingEvent);}};Appender.prototype.append=function(loggingEvent){};Appender.prototype.setLayout=function(layout){if(layout instanceof Layout){this.layout=layout;}else{handleError("Appender.setLayout: layout supplied to "+
this.toString()+" is not a subclass of Layout");}};Appender.prototype.getLayout=function(){return this.layout;};Appender.prototype.setThreshold=function(threshold){if(threshold instanceof Level){this.threshold=threshold;}else{handleError("Appender.setThreshold: threshold supplied to "+
this.toString()+" is not a subclass of Level");}};Appender.prototype.getThreshold=function(){return this.threshold;};Appender.prototype.setAddedToLogger=function(logger){this.loggers.push(logger);};Appender.prototype.setRemovedFromLogger=function(logger){array_remove(this.loggers,logger);};Appender.prototype.group=emptyFunction;Appender.prototype.groupEnd=emptyFunction;Appender.prototype.toString=function(){handleError("Appender.toString: all appenders must override this method");};log4javascript.Appender=Appender;function SimpleLayout(){this.customFields=[];}
SimpleLayout.prototype=new Layout();SimpleLayout.prototype.format=function(loggingEvent){return loggingEvent.level.name+" - "+loggingEvent.getCombinedMessages();};SimpleLayout.prototype.ignoresThrowable=function(){return true;};SimpleLayout.prototype.toString=function(){return"SimpleLayout";};log4javascript.SimpleLayout=SimpleLayout;function NullLayout(){this.customFields=[];}
NullLayout.prototype=new Layout();NullLayout.prototype.format=function(loggingEvent){return loggingEvent.messages;};NullLayout.prototype.ignoresThrowable=function(){return true;};NullLayout.prototype.formatWithException=function(loggingEvent){var messages=loggingEvent.messages,ex=loggingEvent.exception;return ex?messages.concat([ex]):messages;};NullLayout.prototype.toString=function(){return"NullLayout";};log4javascript.NullLayout=NullLayout;function XmlLayout(combineMessages){this.combineMessages=extractBooleanFromParam(combineMessages,true);this.customFields=[];}
XmlLayout.prototype=new Layout();XmlLayout.prototype.isCombinedMessages=function(){return this.combineMessages;};XmlLayout.prototype.getContentType=function(){return"text/xml";};XmlLayout.prototype.escapeCdata=function(str){return str.replace(/\]\]>/,"]]>]]&gt;<![CDATA[");};XmlLayout.prototype.format=function(loggingEvent){var layout=this;var i,len;function formatMessage(message){message=(typeof message==="string")?message:toStr(message);return"<log4javascript:message><![CDATA["+
layout.escapeCdata(message)+"]]></log4javascript:message>";}
var str="<log4javascript:event logger=\""+loggingEvent.logger.name+"\" timestamp=\""+this.getTimeStampValue(loggingEvent)+"\"";if(!this.isTimeStampsInMilliseconds()){str+=" milliseconds=\""+loggingEvent.milliseconds+"\"";}
str+=" level=\""+loggingEvent.level.name+"\">"+newLine;if(this.combineMessages){str+=formatMessage(loggingEvent.getCombinedMessages());}else{str+="<log4javascript:messages>"+newLine;for(i=0,len=loggingEvent.messages.length;i<len;i++){str+=formatMessage(loggingEvent.messages[i])+newLine;}
str+="</log4javascript:messages>"+newLine;}
if(this.hasCustomFields()){for(i=0,len=this.customFields.length;i<len;i++){str+="<log4javascript:customfield name=\""+
this.customFields[i].name+"\"><![CDATA["+
this.customFields[i].value.toString()+"]]></log4javascript:customfield>"+newLine;}}
if(loggingEvent.exception){str+="<log4javascript:exception><![CDATA["+
getExceptionStringRep(loggingEvent.exception)+"]]></log4javascript:exception>"+newLine;}
str+="</log4javascript:event>"+newLine+newLine;return str;};XmlLayout.prototype.ignoresThrowable=function(){return false;};XmlLayout.prototype.toString=function(){return"XmlLayout";};log4javascript.XmlLayout=XmlLayout;function escapeNewLines(str){return str.replace(/\r\n|\r|\n/g,"\\r\\n");}
function JsonLayout(readable,combineMessages){this.readable=extractBooleanFromParam(readable,false);this.combineMessages=extractBooleanFromParam(combineMessages,true);this.batchHeader=this.readable?"["+newLine:"[";this.batchFooter=this.readable?"]"+newLine:"]";this.batchSeparator=this.readable?","+newLine:",";this.setKeys();this.colon=this.readable?": ":":";this.tab=this.readable?"\t":"";this.lineBreak=this.readable?newLine:"";this.customFields=[];}
JsonLayout.prototype=new Layout();JsonLayout.prototype.isReadable=function(){return this.readable;};JsonLayout.prototype.isCombinedMessages=function(){return this.combineMessages;};JsonLayout.prototype.format=function(loggingEvent){var layout=this;var dataValues=this.getDataValues(loggingEvent,this.combineMessages);var str="{"+this.lineBreak;var i,len;function formatValue(val,prefix,expand){var formattedValue;var valType=typeof val;if(val instanceof Date){formattedValue=String(val.getTime());}else if(expand&&(val instanceof Array)){formattedValue="["+layout.lineBreak;for(var i=0,len=val.length;i<len;i++){var childPrefix=prefix+layout.tab;formattedValue+=childPrefix+formatValue(val[i],childPrefix,false);if(i<val.length-1){formattedValue+=",";}
formattedValue+=layout.lineBreak;}
formattedValue+=prefix+"]";}else if(valType!=="number"&&valType!=="boolean"){formattedValue="\""+escapeNewLines(toStr(val).replace(/\"/g,"\\\""))+"\"";}else{formattedValue=val;}
return formattedValue;}
for(i=0,len=dataValues.length-1;i<=len;i++){str+=this.tab+"\""+dataValues[i][0]+"\""+this.colon+formatValue(dataValues[i][1],this.tab,true);if(i<len){str+=",";}
str+=this.lineBreak;}
str+="}"+this.lineBreak;return str;};JsonLayout.prototype.ignoresThrowable=function(){return false;};JsonLayout.prototype.toString=function(){return"JsonLayout";};JsonLayout.prototype.getContentType=function(){return"application/json";};log4javascript.JsonLayout=JsonLayout;function HttpPostDataLayout(){this.setKeys();this.customFields=[];this.returnsPostData=true;}
HttpPostDataLayout.prototype=new Layout();HttpPostDataLayout.prototype.allowBatching=function(){return false;};HttpPostDataLayout.prototype.format=function(loggingEvent){var dataValues=this.getDataValues(loggingEvent);var queryBits=[];for(var i=0,len=dataValues.length;i<len;i++){var val=(dataValues[i][1]instanceof Date)?String(dataValues[i][1].getTime()):dataValues[i][1];queryBits.push(urlEncode(dataValues[i][0])+"="+urlEncode(val));}
return queryBits.join("&");};HttpPostDataLayout.prototype.ignoresThrowable=function(loggingEvent){return false;};HttpPostDataLayout.prototype.toString=function(){return"HttpPostDataLayout";};log4javascript.HttpPostDataLayout=HttpPostDataLayout;function formatObjectExpansion(obj,depth,indentation){var objectsExpanded=[];function doFormat(obj,depth,indentation){var i,len,childDepth,childIndentation,childLines,expansion,childExpansion;if(!indentation){indentation="";}
function formatString(text){var lines=splitIntoLines(text);for(var j=1,jLen=lines.length;j<jLen;j++){lines[j]=indentation+lines[j];}
return lines.join(newLine);}
if(obj===null){return"null";}else if(typeof obj=="undefined"){return"undefined";}else if(typeof obj=="string"){return formatString(obj);}else if(typeof obj=="object"&&array_contains(objectsExpanded,obj)){try{expansion=toStr(obj);}catch(ex){expansion="Error formatting property. Details: "+getExceptionStringRep(ex);}
return expansion+" [already expanded]";}else if((obj instanceof Array)&&depth>0){objectsExpanded.push(obj);expansion="["+newLine;childDepth=depth-1;childIndentation=indentation+"  ";childLines=[];for(i=0,len=obj.length;i<len;i++){try{childExpansion=doFormat(obj[i],childDepth,childIndentation);childLines.push(childIndentation+childExpansion);}catch(ex){childLines.push(childIndentation+"Error formatting array member. Details: "+
getExceptionStringRep(ex)+"");}}
expansion+=childLines.join(","+newLine)+newLine+indentation+"]";return expansion;}else if(Object.prototype.toString.call(obj)=="[object Date]"){return obj.toString();}else if(typeof obj=="object"&&depth>0){objectsExpanded.push(obj);expansion="{"+newLine;childDepth=depth-1;childIndentation=indentation+"  ";childLines=[];for(i in obj){try{childExpansion=doFormat(obj[i],childDepth,childIndentation);childLines.push(childIndentation+i+": "+childExpansion);}catch(ex){childLines.push(childIndentation+i+": Error formatting property. Details: "+
getExceptionStringRep(ex));}}
expansion+=childLines.join(","+newLine)+newLine+indentation+"}";return expansion;}else{return formatString(toStr(obj));}}
return doFormat(obj,depth,indentation);}
var SimpleDateFormat;(function(){var regex=/('[^']*')|(G+|y+|M+|w+|W+|D+|d+|F+|E+|a+|H+|k+|K+|h+|m+|s+|S+|Z+)|([a-zA-Z]+)|([^a-zA-Z']+)/;var monthNames=["January","February","March","April","May","June","July","August","September","October","November","December"];var dayNames=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];var TEXT2=0,TEXT3=1,NUMBER=2,YEAR=3,MONTH=4,TIMEZONE=5;var types={G:TEXT2,y:YEAR,M:MONTH,w:NUMBER,W:NUMBER,D:NUMBER,d:NUMBER,F:NUMBER,E:TEXT3,a:TEXT2,H:NUMBER,k:NUMBER,K:NUMBER,h:NUMBER,m:NUMBER,s:NUMBER,S:NUMBER,Z:TIMEZONE};var ONE_DAY=24*60*60*1000;var ONE_WEEK=7*ONE_DAY;var DEFAULT_MINIMAL_DAYS_IN_FIRST_WEEK=1;var newDateAtMidnight=function(year,month,day){var d=new Date(year,month,day,0,0,0);d.setMilliseconds(0);return d;};Date.prototype.getDifference=function(date){return this.getTime()-date.getTime();};Date.prototype.isBefore=function(d){return this.getTime()<d.getTime();};Date.prototype.getUTCTime=function(){return Date.UTC(this.getFullYear(),this.getMonth(),this.getDate(),this.getHours(),this.getMinutes(),this.getSeconds(),this.getMilliseconds());};Date.prototype.getTimeSince=function(d){return this.getUTCTime()-d.getUTCTime();};Date.prototype.getPreviousSunday=function(){var midday=new Date(this.getFullYear(),this.getMonth(),this.getDate(),12,0,0);var previousSunday=new Date(midday.getTime()-this.getDay()*ONE_DAY);return newDateAtMidnight(previousSunday.getFullYear(),previousSunday.getMonth(),previousSunday.getDate());};Date.prototype.getWeekInYear=function(minimalDaysInFirstWeek){if(isUndefined(this.minimalDaysInFirstWeek)){minimalDaysInFirstWeek=DEFAULT_MINIMAL_DAYS_IN_FIRST_WEEK;}
var previousSunday=this.getPreviousSunday();var startOfYear=newDateAtMidnight(this.getFullYear(),0,1);var numberOfSundays=previousSunday.isBefore(startOfYear)?0:1+Math.floor(previousSunday.getTimeSince(startOfYear)/ONE_WEEK);var numberOfDaysInFirstWeek=7-startOfYear.getDay();var weekInYear=numberOfSundays;if(numberOfDaysInFirstWeek<minimalDaysInFirstWeek){weekInYear--;}
return weekInYear;};Date.prototype.getWeekInMonth=function(minimalDaysInFirstWeek){if(isUndefined(this.minimalDaysInFirstWeek)){minimalDaysInFirstWeek=DEFAULT_MINIMAL_DAYS_IN_FIRST_WEEK;}
var previousSunday=this.getPreviousSunday();var startOfMonth=newDateAtMidnight(this.getFullYear(),this.getMonth(),1);var numberOfSundays=previousSunday.isBefore(startOfMonth)?0:1+Math.floor(previousSunday.getTimeSince(startOfMonth)/ONE_WEEK);var numberOfDaysInFirstWeek=7-startOfMonth.getDay();var weekInMonth=numberOfSundays;if(numberOfDaysInFirstWeek>=minimalDaysInFirstWeek){weekInMonth++;}
return weekInMonth;};Date.prototype.getDayInYear=function(){var startOfYear=newDateAtMidnight(this.getFullYear(),0,1);return 1+Math.floor(this.getTimeSince(startOfYear)/ONE_DAY);};SimpleDateFormat=function(formatString){this.formatString=formatString;};SimpleDateFormat.prototype.setMinimalDaysInFirstWeek=function(days){this.minimalDaysInFirstWeek=days;};SimpleDateFormat.prototype.getMinimalDaysInFirstWeek=function(){return isUndefined(this.minimalDaysInFirstWeek)?DEFAULT_MINIMAL_DAYS_IN_FIRST_WEEK:this.minimalDaysInFirstWeek;};var padWithZeroes=function(str,len){while(str.length<len){str="0"+str;}
return str;};var formatText=function(data,numberOfLetters,minLength){return(numberOfLetters>=4)?data:data.substr(0,Math.max(minLength,numberOfLetters));};var formatNumber=function(data,numberOfLetters){var dataString=""+data;return padWithZeroes(dataString,numberOfLetters);};SimpleDateFormat.prototype.format=function(date){var formattedString="";var result;var searchString=this.formatString;while((result=regex.exec(searchString))){var quotedString=result[1];var patternLetters=result[2];var otherLetters=result[3];var otherCharacters=result[4];if(quotedString){if(quotedString=="''"){formattedString+="'";}else{formattedString+=quotedString.substring(1,quotedString.length-1);}}else if(otherLetters){}else if(otherCharacters){formattedString+=otherCharacters;}else if(patternLetters){var patternLetter=patternLetters.charAt(0);var numberOfLetters=patternLetters.length;var rawData="";switch(patternLetter){case"G":rawData="AD";break;case"y":rawData=date.getFullYear();break;case"M":rawData=date.getMonth();break;case"w":rawData=date.getWeekInYear(this.getMinimalDaysInFirstWeek());break;case"W":rawData=date.getWeekInMonth(this.getMinimalDaysInFirstWeek());break;case"D":rawData=date.getDayInYear();break;case"d":rawData=date.getDate();break;case"F":rawData=1+Math.floor((date.getDate()-1)/7);break;case"E":rawData=dayNames[date.getDay()];break;case"a":rawData=(date.getHours()>=12)?"PM":"AM";break;case"H":rawData=date.getHours();break;case"k":rawData=date.getHours()||24;break;case"K":rawData=date.getHours()%12;break;case"h":rawData=(date.getHours()%12)||12;break;case"m":rawData=date.getMinutes();break;case"s":rawData=date.getSeconds();break;case"S":rawData=date.getMilliseconds();break;case"Z":rawData=date.getTimezoneOffset();break;}
switch(types[patternLetter]){case TEXT2:formattedString+=formatText(rawData,numberOfLetters,2);break;case TEXT3:formattedString+=formatText(rawData,numberOfLetters,3);break;case NUMBER:formattedString+=formatNumber(rawData,numberOfLetters);break;case YEAR:if(numberOfLetters<=3){var dataString=""+rawData;formattedString+=dataString.substr(2,2);}else{formattedString+=formatNumber(rawData,numberOfLetters);}
break;case MONTH:if(numberOfLetters>=3){formattedString+=formatText(monthNames[rawData],numberOfLetters,numberOfLetters);}else{formattedString+=formatNumber(rawData+1,numberOfLetters);}
break;case TIMEZONE:var isPositive=(rawData>0);var prefix=isPositive?"-":"+";var absData=Math.abs(rawData);var hours=""+Math.floor(absData/60);hours=padWithZeroes(hours,2);var minutes=""+(absData%60);minutes=padWithZeroes(minutes,2);formattedString+=prefix+hours+minutes;break;}}
searchString=searchString.substr(result.index+result[0].length);}
return formattedString;};})();log4javascript.SimpleDateFormat=SimpleDateFormat;function PatternLayout(pattern){if(pattern){this.pattern=pattern;}else{this.pattern=PatternLayout.DEFAULT_CONVERSION_PATTERN;}
this.customFields=[];}
PatternLayout.TTCC_CONVERSION_PATTERN="%r %p %c - %m%n";PatternLayout.DEFAULT_CONVERSION_PATTERN="%m%n";PatternLayout.ISO8601_DATEFORMAT="yyyy-MM-dd HH:mm:ss,SSS";PatternLayout.DATETIME_DATEFORMAT="dd MMM yyyy HH:mm:ss,SSS";PatternLayout.ABSOLUTETIME_DATEFORMAT="HH:mm:ss,SSS";PatternLayout.prototype=new Layout();PatternLayout.prototype.format=function(loggingEvent){var regex=/%(-?[0-9]+)?(\.?[0-9]+)?([acdfmMnpr%])(\{([^\}]+)\})?|([^%]+)/;var formattedString="";var result;var searchString=this.pattern;while((result=regex.exec(searchString))){var matchedString=result[0];var padding=result[1];var truncation=result[2];var conversionCharacter=result[3];var specifier=result[5];var text=result[6];if(text){formattedString+=""+text;}else{var replacement="";switch(conversionCharacter){case"a":case"m":var depth=0;if(specifier){depth=parseInt(specifier,10);if(isNaN(depth)){handleError("PatternLayout.format: invalid specifier '"+
specifier+"' for conversion character '"+conversionCharacter+"' - should be a number");depth=0;}}
var messages=(conversionCharacter==="a")?loggingEvent.messages[0]:loggingEvent.messages;for(var i=0,len=messages.length;i<len;i++){if(i>0&&(replacement.charAt(replacement.length-1)!==" ")){replacement+=" ";}
if(depth===0){replacement+=messages[i];}else{replacement+=formatObjectExpansion(messages[i],depth);}}
break;case"c":var loggerName=loggingEvent.logger.name;if(specifier){var precision=parseInt(specifier,10);var loggerNameBits=loggingEvent.logger.name.split(".");if(precision>=loggerNameBits.length){replacement=loggerName;}else{replacement=loggerNameBits.slice(loggerNameBits.length-precision).join(".");}}else{replacement=loggerName;}
break;case"d":var dateFormat=PatternLayout.ISO8601_DATEFORMAT;if(specifier){dateFormat=specifier;if(dateFormat=="ISO8601"){dateFormat=PatternLayout.ISO8601_DATEFORMAT;}else if(dateFormat=="ABSOLUTE"){dateFormat=PatternLayout.ABSOLUTETIME_DATEFORMAT;}else if(dateFormat=="DATE"){dateFormat=PatternLayout.DATETIME_DATEFORMAT;}}
replacement=(new SimpleDateFormat(dateFormat)).format(loggingEvent.timeStamp);break;case"f":if(this.hasCustomFields()){var fieldIndex=0;if(specifier){fieldIndex=parseInt(specifier,10);if(isNaN(fieldIndex)){handleError("PatternLayout.format: invalid specifier '"+
specifier+"' for conversion character 'f' - should be a number");}else if(fieldIndex===0){handleError("PatternLayout.format: invalid specifier '"+
specifier+"' for conversion character 'f' - must be greater than zero");}else if(fieldIndex>this.customFields.length){handleError("PatternLayout.format: invalid specifier '"+
specifier+"' for conversion character 'f' - there aren't that many custom fields");}else{fieldIndex=fieldIndex-1;}}
var val=this.customFields[fieldIndex].value;if(typeof val=="function"){val=val(this,loggingEvent);}
replacement=val;}
break;case"n":replacement=newLine;break;case"p":replacement=loggingEvent.level.name;break;case"r":replacement=""+loggingEvent.timeStamp.getDifference(applicationStartDate);break;case"%":replacement="%";break;default:replacement=matchedString;break;}
var l;if(truncation){l=parseInt(truncation.substr(1),10);var strLen=replacement.length;if(l<strLen){replacement=replacement.substring(strLen-l,strLen);}}
if(padding){if(padding.charAt(0)=="-"){l=parseInt(padding.substr(1),10);while(replacement.length<l){replacement+=" ";}}else{l=parseInt(padding,10);while(replacement.length<l){replacement=" "+replacement;}}}
formattedString+=replacement;}
searchString=searchString.substr(result.index+result[0].length);}
return formattedString;};PatternLayout.prototype.ignoresThrowable=function(){return true;};PatternLayout.prototype.toString=function(){return"PatternLayout";};log4javascript.PatternLayout=PatternLayout;function AlertAppender(){}
AlertAppender.prototype=new Appender();AlertAppender.prototype.layout=new SimpleLayout();AlertAppender.prototype.append=function(loggingEvent){alert(this.getLayout().formatWithException(loggingEvent));};AlertAppender.prototype.toString=function(){return"AlertAppender";};log4javascript.AlertAppender=AlertAppender;function BrowserConsoleAppender(){}
BrowserConsoleAppender.prototype=new log4javascript.Appender();BrowserConsoleAppender.prototype.layout=new NullLayout();BrowserConsoleAppender.prototype.threshold=Level.DEBUG;BrowserConsoleAppender.prototype.append=function(loggingEvent){var appender=this;var getFormattedMessage=function(concatenate){var formattedMessage=appender.getLayout().formatWithException(loggingEvent);return(typeof formattedMessage=="string")?(concatenate?formattedMessage:[formattedMessage]):(concatenate?formattedMessage.join(" "):formattedMessage);};var console=window.console;if(console&&console.log){var consoleMethodName;if(console.debug&&Level.DEBUG.isGreaterOrEqual(loggingEvent.level)){consoleMethodName="debug";}else if(console.info&&Level.INFO.equals(loggingEvent.level)){consoleMethodName="info";}else if(console.warn&&Level.WARN.equals(loggingEvent.level)){consoleMethodName="warn";}else if(console.error&&loggingEvent.level.isGreaterOrEqual(Level.ERROR)){consoleMethodName="error";}else{consoleMethodName="log";}
if(typeof console[consoleMethodName].apply=="function"){console[consoleMethodName].apply(console,getFormattedMessage(false));}else{console[consoleMethodName](getFormattedMessage(true));}}else if((typeof opera!="undefined")&&opera.postError){opera.postError(getFormattedMessage(true));}};BrowserConsoleAppender.prototype.group=function(name){if(window.console&&window.console.group){window.console.group(name);}};BrowserConsoleAppender.prototype.groupEnd=function(){if(window.console&&window.console.groupEnd){window.console.groupEnd();}};BrowserConsoleAppender.prototype.toString=function(){return"BrowserConsoleAppender";};log4javascript.BrowserConsoleAppender=BrowserConsoleAppender;var xhrFactory=function(){return new XMLHttpRequest();};var xmlHttpFactories=[xhrFactory,function(){return new ActiveXObject("Msxml2.XMLHTTP");},function(){return new ActiveXObject("Microsoft.XMLHTTP");}];var withCredentialsSupported=false;var getXmlHttp=function(errorHandler){var xmlHttp=null,factory;for(var i=0,len=xmlHttpFactories.length;i<len;i++){factory=xmlHttpFactories[i];try{xmlHttp=factory();withCredentialsSupported=(factory==xhrFactory&&("withCredentials"in xmlHttp));getXmlHttp=factory;return xmlHttp;}catch(e){}}
if(errorHandler){errorHandler();}else{handleError("getXmlHttp: unable to obtain XMLHttpRequest object");}};function isHttpRequestSuccessful(xmlHttp){return isUndefined(xmlHttp.status)||xmlHttp.status===0||(xmlHttp.status>=200&&xmlHttp.status<300)||xmlHttp.status==1223;}
function AjaxAppender(url,withCredentials){var appender=this;var isSupported=true;if(!url){handleError("AjaxAppender: URL must be specified in constructor");isSupported=false;}
var timed=this.defaults.timed;var waitForResponse=this.defaults.waitForResponse;var batchSize=this.defaults.batchSize;var timerInterval=this.defaults.timerInterval;var requestSuccessCallback=this.defaults.requestSuccessCallback;var failCallback=this.defaults.failCallback;var postVarName=this.defaults.postVarName;var sendAllOnUnload=this.defaults.sendAllOnUnload;var contentType=this.defaults.contentType;var sessionId=null;var queuedLoggingEvents=[];var queuedRequests=[];var headers=[];var sending=false;var initialized=false;function checkCanConfigure(configOptionName){if(initialized){handleError("AjaxAppender: configuration option '"+
configOptionName+"' may not be set after the appender has been initialized");return false;}
return true;}
this.getSessionId=function(){return sessionId;};this.setSessionId=function(sessionIdParam){sessionId=extractStringFromParam(sessionIdParam,null);this.layout.setCustomField("sessionid",sessionId);};this.setLayout=function(layoutParam){if(checkCanConfigure("layout")){this.layout=layoutParam;if(sessionId!==null){this.setSessionId(sessionId);}}};this.isTimed=function(){return timed;};this.setTimed=function(timedParam){if(checkCanConfigure("timed")){timed=bool(timedParam);}};this.getTimerInterval=function(){return timerInterval;};this.setTimerInterval=function(timerIntervalParam){if(checkCanConfigure("timerInterval")){timerInterval=extractIntFromParam(timerIntervalParam,timerInterval);}};this.isWaitForResponse=function(){return waitForResponse;};this.setWaitForResponse=function(waitForResponseParam){if(checkCanConfigure("waitForResponse")){waitForResponse=bool(waitForResponseParam);}};this.getBatchSize=function(){return batchSize;};this.setBatchSize=function(batchSizeParam){if(checkCanConfigure("batchSize")){batchSize=extractIntFromParam(batchSizeParam,batchSize);}};this.isSendAllOnUnload=function(){return sendAllOnUnload;};this.setSendAllOnUnload=function(sendAllOnUnloadParam){if(checkCanConfigure("sendAllOnUnload")){sendAllOnUnload=extractBooleanFromParam(sendAllOnUnloadParam,sendAllOnUnload);}};this.setRequestSuccessCallback=function(requestSuccessCallbackParam){requestSuccessCallback=extractFunctionFromParam(requestSuccessCallbackParam,requestSuccessCallback);};this.setFailCallback=function(failCallbackParam){failCallback=extractFunctionFromParam(failCallbackParam,failCallback);};this.getPostVarName=function(){return postVarName;};this.setPostVarName=function(postVarNameParam){if(checkCanConfigure("postVarName")){postVarName=extractStringFromParam(postVarNameParam,postVarName);}};this.getHeaders=function(){return headers;};this.addHeader=function(name,value){if(name.toLowerCase()=="content-type"){contentType=value;}else{headers.push({name:name,value:value});}};function sendAll(){if(isSupported&&enabled){sending=true;var currentRequestBatch;if(waitForResponse){if(queuedRequests.length>0){currentRequestBatch=queuedRequests.shift();sendRequest(preparePostData(currentRequestBatch),sendAll);}else{sending=false;if(timed){scheduleSending();}}}else{while((currentRequestBatch=queuedRequests.shift())){sendRequest(preparePostData(currentRequestBatch));}
sending=false;if(timed){scheduleSending();}}}}
this.sendAll=sendAll;function sendAllRemaining(){var sendingAnything=false;if(isSupported&&enabled){var actualBatchSize=appender.getLayout().allowBatching()?batchSize:1;var currentLoggingEvent;var batchedLoggingEvents=[];while((currentLoggingEvent=queuedLoggingEvents.shift())){batchedLoggingEvents.push(currentLoggingEvent);if(queuedLoggingEvents.length>=actualBatchSize){queuedRequests.push(batchedLoggingEvents);batchedLoggingEvents=[];}}
if(batchedLoggingEvents.length>0){queuedRequests.push(batchedLoggingEvents);}
sendingAnything=(queuedRequests.length>0);waitForResponse=false;timed=false;sendAll();}
return sendingAnything;}
this.sendAllRemaining=sendAllRemaining;function preparePostData(batchedLoggingEvents){var formattedMessages=[];var currentLoggingEvent;var postData="";while((currentLoggingEvent=batchedLoggingEvents.shift())){formattedMessages.push(appender.getLayout().formatWithException(currentLoggingEvent));}
if(batchedLoggingEvents.length==1){postData=formattedMessages.join("");}else{postData=appender.getLayout().batchHeader+
formattedMessages.join(appender.getLayout().batchSeparator)+
appender.getLayout().batchFooter;}
if(contentType==appender.defaults.contentType){postData=appender.getLayout().returnsPostData?postData:urlEncode(postVarName)+"="+urlEncode(postData);if(postData.length>0){postData+="&";}
postData+="layout="+urlEncode(appender.getLayout().toString());}
return postData;}
function scheduleSending(){window.setTimeout(sendAll,timerInterval);}
function xmlHttpErrorHandler(){var msg="AjaxAppender: could not create XMLHttpRequest object. AjaxAppender disabled";handleError(msg);isSupported=false;if(failCallback){failCallback(msg);}}
function sendRequest(postData,successCallback){try{var xmlHttp=getXmlHttp(xmlHttpErrorHandler);if(isSupported){xmlHttp.onreadystatechange=function(){if(xmlHttp.readyState==4){if(isHttpRequestSuccessful(xmlHttp)){if(requestSuccessCallback){requestSuccessCallback(xmlHttp);}
if(successCallback){successCallback(xmlHttp);}}else{var msg="AjaxAppender.append: XMLHttpRequest request to URL "+
url+" returned status code "+xmlHttp.status;handleError(msg);if(failCallback){failCallback(msg);}}
xmlHttp.onreadystatechange=emptyFunction;xmlHttp=null;}};xmlHttp.open("POST",url,true);if(withCredentials&&withCredentialsSupported){xmlHttp.withCredentials=true;}
try{for(var i=0,header;header=headers[i++];){xmlHttp.setRequestHeader(header.name,header.value);}
xmlHttp.setRequestHeader("Content-Type",contentType);}catch(headerEx){var msg="AjaxAppender.append: your browser's XMLHttpRequest implementation"+" does not support setRequestHeader, therefore cannot post data. AjaxAppender disabled";handleError(msg);isSupported=false;if(failCallback){failCallback(msg);}
return;}
xmlHttp.send(postData);}}catch(ex){var errMsg="AjaxAppender.append: error sending log message to "+url;handleError(errMsg,ex);isSupported=false;if(failCallback){failCallback(errMsg+". Details: "+getExceptionStringRep(ex));}}}
this.append=function(loggingEvent){if(isSupported){if(!initialized){init();}
queuedLoggingEvents.push(loggingEvent);var actualBatchSize=this.getLayout().allowBatching()?batchSize:1;if(queuedLoggingEvents.length>=actualBatchSize){var currentLoggingEvent;var batchedLoggingEvents=[];while((currentLoggingEvent=queuedLoggingEvents.shift())){batchedLoggingEvents.push(currentLoggingEvent);}
queuedRequests.push(batchedLoggingEvents);if(!timed&&(!waitForResponse||(waitForResponse&&!sending))){sendAll();}}}};function init(){initialized=true;if(sendAllOnUnload){var oldBeforeUnload=window.onbeforeunload;window.onbeforeunload=function(){if(oldBeforeUnload){oldBeforeUnload();}
sendAllRemaining();};}
if(timed){scheduleSending();}}}
AjaxAppender.prototype=new Appender();AjaxAppender.prototype.defaults={waitForResponse:false,timed:false,timerInterval:1000,batchSize:1,sendAllOnUnload:false,requestSuccessCallback:null,failCallback:null,postVarName:"data",contentType:"application/x-www-form-urlencoded"};AjaxAppender.prototype.layout=new HttpPostDataLayout();AjaxAppender.prototype.toString=function(){return"AjaxAppender";};log4javascript.AjaxAppender=AjaxAppender;function setCookie(name,value,days,path){var expires;path=path?"; path="+path:"";if(days){var date=new Date();date.setTime(date.getTime()+(days*24*60*60*1000));expires="; expires="+date.toGMTString();}else{expires="";}
document.cookie=escape(name)+"="+escape(value)+expires+path;}
function getCookie(name){var nameEquals=escape(name)+"=";var ca=document.cookie.split(";");for(var i=0,len=ca.length;i<len;i++){var c=ca[i];while(c.charAt(0)===" "){c=c.substring(1,c.length);}
if(c.indexOf(nameEquals)===0){return unescape(c.substring(nameEquals.length,c.length));}}
return null;}
function getBaseUrl(){var scripts=document.getElementsByTagName("script");for(var i=0,len=scripts.length;i<len;++i){if(scripts[i].src.indexOf("log4javascript")!=-1){var lastSlash=scripts[i].src.lastIndexOf("/");return(lastSlash==-1)?"":scripts[i].src.substr(0,lastSlash+1);}}
return null;}
function isLoaded(win){try{return bool(win.loaded);}catch(ex){return false;}}
var ConsoleAppender;(function(){var getConsoleHtmlLines=function(){return['<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">','<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">','<head>','<title>log4javascript</title>','<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />','<!-- Make IE8 behave like IE7, having gone to all the trouble of making IE work -->','<meta http-equiv="X-UA-Compatible" content="IE=7" />','<script type="text/javascript">var isIe = false, isIePre7 = false;</script>','<!--[if IE]><script type="text/javascript">isIe = true</script><![endif]-->','<!--[if lt IE 7]><script type="text/javascript">isIePre7 = true</script><![endif]-->','<script type="text/javascript">','//<![CDATA[','var loggingEnabled=true;var logQueuedEventsTimer=null;var logEntries=[];var logEntriesAndSeparators=[];var logItems=[];var renderDelay=100;var unrenderedLogItemsExist=false;var rootGroup,currentGroup=null;var loaded=false;var currentLogItem=null;var logMainContainer;function copyProperties(obj,props){for(var i in props){obj[i]=props[i];}}','function LogItem(){}','LogItem.prototype={mainContainer:null,wrappedContainer:null,unwrappedContainer:null,group:null,appendToLog:function(){for(var i=0,len=this.elementContainers.length;i<len;i++){this.elementContainers[i].appendToLog();}','this.group.update();},doRemove:function(doUpdate,removeFromGroup){if(this.rendered){for(var i=0,len=this.elementContainers.length;i<len;i++){this.elementContainers[i].remove();}','this.unwrappedElementContainer=null;this.wrappedElementContainer=null;this.mainElementContainer=null;}','if(this.group&&removeFromGroup){this.group.removeChild(this,doUpdate);}','if(this===currentLogItem){currentLogItem=null;}},remove:function(doUpdate,removeFromGroup){this.doRemove(doUpdate,removeFromGroup);},render:function(){},accept:function(visitor){visitor.visit(this);},getUnwrappedDomContainer:function(){return this.group.unwrappedElementContainer.contentDiv;},getWrappedDomContainer:function(){return this.group.wrappedElementContainer.contentDiv;},getMainDomContainer:function(){return this.group.mainElementContainer.contentDiv;}};LogItem.serializedItemKeys={LOG_ENTRY:0,GROUP_START:1,GROUP_END:2};function LogItemContainerElement(){}','LogItemContainerElement.prototype={appendToLog:function(){var insertBeforeFirst=(newestAtTop&&this.containerDomNode.hasChildNodes());if(insertBeforeFirst){this.containerDomNode.insertBefore(this.mainDiv,this.containerDomNode.firstChild);}else{this.containerDomNode.appendChild(this.mainDiv);}}};function SeparatorElementContainer(containerDomNode){this.containerDomNode=containerDomNode;this.mainDiv=document.createElement("div");this.mainDiv.className="separator";this.mainDiv.innerHTML="&nbsp;";}','SeparatorElementContainer.prototype=new LogItemContainerElement();SeparatorElementContainer.prototype.remove=function(){this.mainDiv.parentNode.removeChild(this.mainDiv);this.mainDiv=null;};function Separator(){this.rendered=false;}','Separator.prototype=new LogItem();copyProperties(Separator.prototype,{render:function(){var containerDomNode=this.group.contentDiv;if(isIe){this.unwrappedElementContainer=new SeparatorElementContainer(this.getUnwrappedDomContainer());this.wrappedElementContainer=new SeparatorElementContainer(this.getWrappedDomContainer());this.elementContainers=[this.unwrappedElementContainer,this.wrappedElementContainer];}else{this.mainElementContainer=new SeparatorElementContainer(this.getMainDomContainer());this.elementContainers=[this.mainElementContainer];}','this.content=this.formattedMessage;this.rendered=true;}});function GroupElementContainer(group,containerDomNode,isRoot,isWrapped){this.group=group;this.containerDomNode=containerDomNode;this.isRoot=isRoot;this.isWrapped=isWrapped;this.expandable=false;if(this.isRoot){if(isIe){this.contentDiv=logMainContainer.appendChild(document.createElement("div"));this.contentDiv.id=this.isWrapped?"log_wrapped":"log_unwrapped";}else{this.contentDiv=logMainContainer;}}else{var groupElementContainer=this;this.mainDiv=document.createElement("div");this.mainDiv.className="group";this.headingDiv=this.mainDiv.appendChild(document.createElement("div"));this.headingDiv.className="groupheading";this.expander=this.headingDiv.appendChild(document.createElement("span"));this.expander.className="expander unselectable greyedout";this.expander.unselectable=true;var expanderText=this.group.expanded?"-":"+";this.expanderTextNode=this.expander.appendChild(document.createTextNode(expanderText));this.headingDiv.appendChild(document.createTextNode(" "+this.group.name));this.contentDiv=this.mainDiv.appendChild(document.createElement("div"));var contentCssClass=this.group.expanded?"expanded":"collapsed";this.contentDiv.className="groupcontent "+contentCssClass;this.expander.onclick=function(){if(groupElementContainer.group.expandable){groupElementContainer.group.toggleExpanded();}};}}','GroupElementContainer.prototype=new LogItemContainerElement();copyProperties(GroupElementContainer.prototype,{toggleExpanded:function(){if(!this.isRoot){var oldCssClass,newCssClass,expanderText;if(this.group.expanded){newCssClass="expanded";oldCssClass="collapsed";expanderText="-";}else{newCssClass="collapsed";oldCssClass="expanded";expanderText="+";}','replaceClass(this.contentDiv,newCssClass,oldCssClass);this.expanderTextNode.nodeValue=expanderText;}},remove:function(){if(!this.isRoot){this.headingDiv=null;this.expander.onclick=null;this.expander=null;this.expanderTextNode=null;this.contentDiv=null;this.containerDomNode=null;this.mainDiv.parentNode.removeChild(this.mainDiv);this.mainDiv=null;}},reverseChildren:function(){var node=null;var childDomNodes=[];while((node=this.contentDiv.firstChild)){this.contentDiv.removeChild(node);childDomNodes.push(node);}','while((node=childDomNodes.pop())){this.contentDiv.appendChild(node);}},update:function(){if(!this.isRoot){if(this.group.expandable){removeClass(this.expander,"greyedout");}else{addClass(this.expander,"greyedout");}}},clear:function(){if(this.isRoot){this.contentDiv.innerHTML="";}}});function Group(name,isRoot,initiallyExpanded){this.name=name;this.group=null;this.isRoot=isRoot;this.initiallyExpanded=initiallyExpanded;this.elementContainers=[];this.children=[];this.expanded=initiallyExpanded;this.rendered=false;this.expandable=false;}','Group.prototype=new LogItem();copyProperties(Group.prototype,{addChild:function(logItem){this.children.push(logItem);logItem.group=this;},render:function(){if(isIe){var unwrappedDomContainer,wrappedDomContainer;if(this.isRoot){unwrappedDomContainer=logMainContainer;wrappedDomContainer=logMainContainer;}else{unwrappedDomContainer=this.getUnwrappedDomContainer();wrappedDomContainer=this.getWrappedDomContainer();}','this.unwrappedElementContainer=new GroupElementContainer(this,unwrappedDomContainer,this.isRoot,false);this.wrappedElementContainer=new GroupElementContainer(this,wrappedDomContainer,this.isRoot,true);this.elementContainers=[this.unwrappedElementContainer,this.wrappedElementContainer];}else{var mainDomContainer=this.isRoot?logMainContainer:this.getMainDomContainer();this.mainElementContainer=new GroupElementContainer(this,mainDomContainer,this.isRoot,false);this.elementContainers=[this.mainElementContainer];}','this.rendered=true;},toggleExpanded:function(){this.expanded=!this.expanded;for(var i=0,len=this.elementContainers.length;i<len;i++){this.elementContainers[i].toggleExpanded();}},expand:function(){if(!this.expanded){this.toggleExpanded();}},accept:function(visitor){visitor.visitGroup(this);},reverseChildren:function(){if(this.rendered){for(var i=0,len=this.elementContainers.length;i<len;i++){this.elementContainers[i].reverseChildren();}}},update:function(){var previouslyExpandable=this.expandable;this.expandable=(this.children.length!==0);if(this.expandable!==previouslyExpandable){for(var i=0,len=this.elementContainers.length;i<len;i++){this.elementContainers[i].update();}}},flatten:function(){var visitor=new GroupFlattener();this.accept(visitor);return visitor.logEntriesAndSeparators;},removeChild:function(child,doUpdate){array_remove(this.children,child);child.group=null;if(doUpdate){this.update();}},remove:function(doUpdate,removeFromGroup){for(var i=0,len=this.children.length;i<len;i++){this.children[i].remove(false,false);}','this.children=[];this.update();if(this===currentGroup){currentGroup=this.group;}','this.doRemove(doUpdate,removeFromGroup);},serialize:function(items){items.push([LogItem.serializedItemKeys.GROUP_START,this.name]);for(var i=0,len=this.children.length;i<len;i++){this.children[i].serialize(items);}','if(this!==currentGroup){items.push([LogItem.serializedItemKeys.GROUP_END]);}},clear:function(){for(var i=0,len=this.elementContainers.length;i<len;i++){this.elementContainers[i].clear();}}});function LogEntryElementContainer(){}','LogEntryElementContainer.prototype=new LogItemContainerElement();copyProperties(LogEntryElementContainer.prototype,{remove:function(){this.doRemove();},doRemove:function(){this.mainDiv.parentNode.removeChild(this.mainDiv);this.mainDiv=null;this.contentElement=null;this.containerDomNode=null;},setContent:function(content,wrappedContent){if(content===this.formattedMessage){this.contentElement.innerHTML="";this.contentElement.appendChild(document.createTextNode(this.formattedMessage));}else{this.contentElement.innerHTML=content;}},setSearchMatch:function(isMatch){var oldCssClass=isMatch?"searchnonmatch":"searchmatch";var newCssClass=isMatch?"searchmatch":"searchnonmatch";replaceClass(this.mainDiv,newCssClass,oldCssClass);},clearSearch:function(){removeClass(this.mainDiv,"searchmatch");removeClass(this.mainDiv,"searchnonmatch");}});function LogEntryWrappedElementContainer(logEntry,containerDomNode){this.logEntry=logEntry;this.containerDomNode=containerDomNode;this.mainDiv=document.createElement("div");this.mainDiv.appendChild(document.createTextNode(this.logEntry.formattedMessage));this.mainDiv.className="logentry wrapped "+this.logEntry.level;this.contentElement=this.mainDiv;}','LogEntryWrappedElementContainer.prototype=new LogEntryElementContainer();LogEntryWrappedElementContainer.prototype.setContent=function(content,wrappedContent){if(content===this.formattedMessage){this.contentElement.innerHTML="";this.contentElement.appendChild(document.createTextNode(this.formattedMessage));}else{this.contentElement.innerHTML=wrappedContent;}};function LogEntryUnwrappedElementContainer(logEntry,containerDomNode){this.logEntry=logEntry;this.containerDomNode=containerDomNode;this.mainDiv=document.createElement("div");this.mainDiv.className="logentry unwrapped "+this.logEntry.level;this.pre=this.mainDiv.appendChild(document.createElement("pre"));this.pre.appendChild(document.createTextNode(this.logEntry.formattedMessage));this.pre.className="unwrapped";this.contentElement=this.pre;}','LogEntryUnwrappedElementContainer.prototype=new LogEntryElementContainer();LogEntryUnwrappedElementContainer.prototype.remove=function(){this.doRemove();this.pre=null;};function LogEntryMainElementContainer(logEntry,containerDomNode){this.logEntry=logEntry;this.containerDomNode=containerDomNode;this.mainDiv=document.createElement("div");this.mainDiv.className="logentry nonielogentry "+this.logEntry.level;this.contentElement=this.mainDiv.appendChild(document.createElement("span"));this.contentElement.appendChild(document.createTextNode(this.logEntry.formattedMessage));}','LogEntryMainElementContainer.prototype=new LogEntryElementContainer();function LogEntry(level,formattedMessage){this.level=level;this.formattedMessage=formattedMessage;this.rendered=false;}','LogEntry.prototype=new LogItem();copyProperties(LogEntry.prototype,{render:function(){var logEntry=this;var containerDomNode=this.group.contentDiv;if(isIe){this.formattedMessage=this.formattedMessage.replace(/\\r\\n/g,"\\r");this.unwrappedElementContainer=new LogEntryUnwrappedElementContainer(this,this.getUnwrappedDomContainer());this.wrappedElementContainer=new LogEntryWrappedElementContainer(this,this.getWrappedDomContainer());this.elementContainers=[this.unwrappedElementContainer,this.wrappedElementContainer];}else{this.mainElementContainer=new LogEntryMainElementContainer(this,this.getMainDomContainer());this.elementContainers=[this.mainElementContainer];}','this.content=this.formattedMessage;this.rendered=true;},setContent:function(content,wrappedContent){if(content!=this.content){if(isIe&&(content!==this.formattedMessage)){content=content.replace(/\\r\\n/g,"\\r");}','for(var i=0,len=this.elementContainers.length;i<len;i++){this.elementContainers[i].setContent(content,wrappedContent);}','this.content=content;}},getSearchMatches:function(){var matches=[];var i,len;if(isIe){var unwrappedEls=getElementsByClass(this.unwrappedElementContainer.mainDiv,"searchterm","span");var wrappedEls=getElementsByClass(this.wrappedElementContainer.mainDiv,"searchterm","span");for(i=0,len=unwrappedEls.length;i<len;i++){matches[i]=new Match(this.level,null,unwrappedEls[i],wrappedEls[i]);}}else{var els=getElementsByClass(this.mainElementContainer.mainDiv,"searchterm","span");for(i=0,len=els.length;i<len;i++){matches[i]=new Match(this.level,els[i]);}}','return matches;},setSearchMatch:function(isMatch){for(var i=0,len=this.elementContainers.length;i<len;i++){this.elementContainers[i].setSearchMatch(isMatch);}},clearSearch:function(){for(var i=0,len=this.elementContainers.length;i<len;i++){this.elementContainers[i].clearSearch();}},accept:function(visitor){visitor.visitLogEntry(this);},serialize:function(items){items.push([LogItem.serializedItemKeys.LOG_ENTRY,this.level,this.formattedMessage]);}});function LogItemVisitor(){}','LogItemVisitor.prototype={visit:function(logItem){},visitParent:function(logItem){if(logItem.group){logItem.group.accept(this);}},visitChildren:function(logItem){for(var i=0,len=logItem.children.length;i<len;i++){logItem.children[i].accept(this);}},visitLogEntry:function(logEntry){this.visit(logEntry);},visitSeparator:function(separator){this.visit(separator);},visitGroup:function(group){this.visit(group);}};function GroupFlattener(){this.logEntriesAndSeparators=[];}','GroupFlattener.prototype=new LogItemVisitor();GroupFlattener.prototype.visitGroup=function(group){this.visitChildren(group);};GroupFlattener.prototype.visitLogEntry=function(logEntry){this.logEntriesAndSeparators.push(logEntry);};GroupFlattener.prototype.visitSeparator=function(separator){this.logEntriesAndSeparators.push(separator);};window.onload=function(){if(location.search){var queryBits=unescape(location.search).substr(1).split("&"),nameValueBits;for(var i=0,len=queryBits.length;i<len;i++){nameValueBits=queryBits[i].split("=");if(nameValueBits[0]=="log4javascript_domain"){document.domain=nameValueBits[1];break;}}}','logMainContainer=$("log");if(isIePre7){addClass(logMainContainer,"oldIe");}','rootGroup=new Group("root",true);rootGroup.render();currentGroup=rootGroup;setCommandInputWidth();setLogContainerHeight();toggleLoggingEnabled();toggleSearchEnabled();toggleSearchFilter();toggleSearchHighlight();applyFilters();checkAllLevels();toggleWrap();toggleNewestAtTop();toggleScrollToLatest();renderQueuedLogItems();loaded=true;$("command").value="";$("command").autocomplete="off";$("command").onkeydown=function(evt){evt=getEvent(evt);if(evt.keyCode==10||evt.keyCode==13){evalCommandLine();stopPropagation(evt);}else if(evt.keyCode==27){this.value="";this.focus();}else if(evt.keyCode==38&&commandHistory.length>0){currentCommandIndex=Math.max(0,currentCommandIndex-1);this.value=commandHistory[currentCommandIndex];moveCaretToEnd(this);}else if(evt.keyCode==40&&commandHistory.length>0){currentCommandIndex=Math.min(commandHistory.length-1,currentCommandIndex+1);this.value=commandHistory[currentCommandIndex];moveCaretToEnd(this);}};$("command").onkeypress=function(evt){evt=getEvent(evt);if(evt.keyCode==38&&commandHistory.length>0&&evt.preventDefault){evt.preventDefault();}};$("command").onkeyup=function(evt){evt=getEvent(evt);if(evt.keyCode==27&&evt.preventDefault){evt.preventDefault();this.focus();}};document.onkeydown=function keyEventHandler(evt){evt=getEvent(evt);switch(evt.keyCode){case 69:if(evt.shiftKey&&(evt.ctrlKey||evt.metaKey)){evalLastCommand();cancelKeyEvent(evt);return false;}','break;case 75:if(evt.shiftKey&&(evt.ctrlKey||evt.metaKey)){focusSearch();cancelKeyEvent(evt);return false;}','break;case 40:case 76:if(evt.shiftKey&&(evt.ctrlKey||evt.metaKey)){focusCommandLine();cancelKeyEvent(evt);return false;}','break;}};setTimeout(setLogContainerHeight,20);setShowCommandLine(showCommandLine);doSearch();};window.onunload=function(){if(mainWindowExists()){appender.unload();}','appender=null;};function toggleLoggingEnabled(){setLoggingEnabled($("enableLogging").checked);}','function setLoggingEnabled(enable){loggingEnabled=enable;}','var appender=null;function setAppender(appenderParam){appender=appenderParam;}','function setShowCloseButton(showCloseButton){$("closeButton").style.display=showCloseButton?"inline":"none";}','function setShowHideButton(showHideButton){$("hideButton").style.display=showHideButton?"inline":"none";}','var newestAtTop=false;function LogItemContentReverser(){}','LogItemContentReverser.prototype=new LogItemVisitor();LogItemContentReverser.prototype.visitGroup=function(group){group.reverseChildren();this.visitChildren(group);};function setNewestAtTop(isNewestAtTop){var oldNewestAtTop=newestAtTop;var i,iLen,j,jLen;newestAtTop=Boolean(isNewestAtTop);if(oldNewestAtTop!=newestAtTop){var visitor=new LogItemContentReverser();rootGroup.accept(visitor);if(currentSearch){var currentMatch=currentSearch.matches[currentMatchIndex];var matchIndex=0;var matches=[];var actOnLogEntry=function(logEntry){var logEntryMatches=logEntry.getSearchMatches();for(j=0,jLen=logEntryMatches.length;j<jLen;j++){matches[matchIndex]=logEntryMatches[j];if(currentMatch&&logEntryMatches[j].equals(currentMatch)){currentMatchIndex=matchIndex;}','matchIndex++;}};if(newestAtTop){for(i=logEntries.length-1;i>=0;i--){actOnLogEntry(logEntries[i]);}}else{for(i=0,iLen=logEntries.length;i<iLen;i++){actOnLogEntry(logEntries[i]);}}','currentSearch.matches=matches;if(currentMatch){currentMatch.setCurrent();}}else if(scrollToLatest){doScrollToLatest();}}','$("newestAtTop").checked=isNewestAtTop;}','function toggleNewestAtTop(){var isNewestAtTop=$("newestAtTop").checked;setNewestAtTop(isNewestAtTop);}','var scrollToLatest=true;function setScrollToLatest(isScrollToLatest){scrollToLatest=isScrollToLatest;if(scrollToLatest){doScrollToLatest();}','$("scrollToLatest").checked=isScrollToLatest;}','function toggleScrollToLatest(){var isScrollToLatest=$("scrollToLatest").checked;setScrollToLatest(isScrollToLatest);}','function doScrollToLatest(){var l=logMainContainer;if(typeof l.scrollTop!="undefined"){if(newestAtTop){l.scrollTop=0;}else{var latestLogEntry=l.lastChild;if(latestLogEntry){l.scrollTop=l.scrollHeight;}}}}','var closeIfOpenerCloses=true;function setCloseIfOpenerCloses(isCloseIfOpenerCloses){closeIfOpenerCloses=isCloseIfOpenerCloses;}','var maxMessages=null;function setMaxMessages(max){maxMessages=max;pruneLogEntries();}','var showCommandLine=false;function setShowCommandLine(isShowCommandLine){showCommandLine=isShowCommandLine;if(loaded){$("commandLine").style.display=showCommandLine?"block":"none";setCommandInputWidth();setLogContainerHeight();}}','function focusCommandLine(){if(loaded){$("command").focus();}}','function focusSearch(){if(loaded){$("searchBox").focus();}}','function getLogItems(){var items=[];for(var i=0,len=logItems.length;i<len;i++){logItems[i].serialize(items);}','return items;}','function setLogItems(items){var loggingReallyEnabled=loggingEnabled;loggingEnabled=true;for(var i=0,len=items.length;i<len;i++){switch(items[i][0]){case LogItem.serializedItemKeys.LOG_ENTRY:log(items[i][1],items[i][2]);break;case LogItem.serializedItemKeys.GROUP_START:group(items[i][1]);break;case LogItem.serializedItemKeys.GROUP_END:groupEnd();break;}}','loggingEnabled=loggingReallyEnabled;}','function log(logLevel,formattedMessage){if(loggingEnabled){var logEntry=new LogEntry(logLevel,formattedMessage);logEntries.push(logEntry);logEntriesAndSeparators.push(logEntry);logItems.push(logEntry);currentGroup.addChild(logEntry);if(loaded){if(logQueuedEventsTimer!==null){clearTimeout(logQueuedEventsTimer);}','logQueuedEventsTimer=setTimeout(renderQueuedLogItems,renderDelay);unrenderedLogItemsExist=true;}}}','function renderQueuedLogItems(){logQueuedEventsTimer=null;var pruned=pruneLogEntries();var initiallyHasMatches=currentSearch?currentSearch.hasMatches():false;for(var i=0,len=logItems.length;i<len;i++){if(!logItems[i].rendered){logItems[i].render();logItems[i].appendToLog();if(currentSearch&&(logItems[i]instanceof LogEntry)){currentSearch.applyTo(logItems[i]);}}}','if(currentSearch){if(pruned){if(currentSearch.hasVisibleMatches()){if(currentMatchIndex===null){setCurrentMatchIndex(0);}','displayMatches();}else{displayNoMatches();}}else if(!initiallyHasMatches&&currentSearch.hasVisibleMatches()){setCurrentMatchIndex(0);displayMatches();}}','if(scrollToLatest){doScrollToLatest();}','unrenderedLogItemsExist=false;}','function pruneLogEntries(){if((maxMessages!==null)&&(logEntriesAndSeparators.length>maxMessages)){var numberToDelete=logEntriesAndSeparators.length-maxMessages;var prunedLogEntries=logEntriesAndSeparators.slice(0,numberToDelete);if(currentSearch){currentSearch.removeMatches(prunedLogEntries);}','var group;for(var i=0;i<numberToDelete;i++){group=logEntriesAndSeparators[i].group;array_remove(logItems,logEntriesAndSeparators[i]);array_remove(logEntries,logEntriesAndSeparators[i]);logEntriesAndSeparators[i].remove(true,true);if(group.children.length===0&&group!==currentGroup&&group!==rootGroup){array_remove(logItems,group);group.remove(true,true);}}','logEntriesAndSeparators=array_removeFromStart(logEntriesAndSeparators,numberToDelete);return true;}','return false;}','function group(name,startExpanded){if(loggingEnabled){initiallyExpanded=(typeof startExpanded==="undefined")?true:Boolean(startExpanded);var newGroup=new Group(name,false,initiallyExpanded);currentGroup.addChild(newGroup);currentGroup=newGroup;logItems.push(newGroup);if(loaded){if(logQueuedEventsTimer!==null){clearTimeout(logQueuedEventsTimer);}','logQueuedEventsTimer=setTimeout(renderQueuedLogItems,renderDelay);unrenderedLogItemsExist=true;}}}','function groupEnd(){currentGroup=(currentGroup===rootGroup)?rootGroup:currentGroup.group;}','function mainPageReloaded(){currentGroup=rootGroup;var separator=new Separator();logEntriesAndSeparators.push(separator);logItems.push(separator);currentGroup.addChild(separator);}','function closeWindow(){if(appender&&mainWindowExists()){appender.close(true);}else{window.close();}}','function hide(){if(appender&&mainWindowExists()){appender.hide();}}','var mainWindow=window;var windowId="log4javascriptConsoleWindow_"+new Date().getTime()+"_"+(""+Math.random()).substr(2);function setMainWindow(win){mainWindow=win;mainWindow[windowId]=window;if(opener&&closeIfOpenerCloses){pollOpener();}}','function pollOpener(){if(closeIfOpenerCloses){if(mainWindowExists()){setTimeout(pollOpener,500);}else{closeWindow();}}}','function mainWindowExists(){try{return(mainWindow&&!mainWindow.closed&&mainWindow[windowId]==window);}catch(ex){}','return false;}','var logLevels=["TRACE","DEBUG","INFO","WARN","ERROR","FATAL"];function getCheckBox(logLevel){return $("switch_"+logLevel);}','function getIeWrappedLogContainer(){return $("log_wrapped");}','function getIeUnwrappedLogContainer(){return $("log_unwrapped");}','function applyFilters(){for(var i=0;i<logLevels.length;i++){if(getCheckBox(logLevels[i]).checked){addClass(logMainContainer,logLevels[i]);}else{removeClass(logMainContainer,logLevels[i]);}}','updateSearchFromFilters();}','function toggleAllLevels(){var turnOn=$("switch_ALL").checked;for(var i=0;i<logLevels.length;i++){getCheckBox(logLevels[i]).checked=turnOn;if(turnOn){addClass(logMainContainer,logLevels[i]);}else{removeClass(logMainContainer,logLevels[i]);}}}','function checkAllLevels(){for(var i=0;i<logLevels.length;i++){if(!getCheckBox(logLevels[i]).checked){getCheckBox("ALL").checked=false;return;}}','getCheckBox("ALL").checked=true;}','function clearLog(){rootGroup.clear();currentGroup=rootGroup;logEntries=[];logItems=[];logEntriesAndSeparators=[];doSearch();}','function toggleWrap(){var enable=$("wrap").checked;if(enable){addClass(logMainContainer,"wrap");}else{removeClass(logMainContainer,"wrap");}','refreshCurrentMatch();}','var searchTimer=null;function scheduleSearch(){try{clearTimeout(searchTimer);}catch(ex){}','searchTimer=setTimeout(doSearch,500);}','function Search(searchTerm,isRegex,searchRegex,isCaseSensitive){this.searchTerm=searchTerm;this.isRegex=isRegex;this.searchRegex=searchRegex;this.isCaseSensitive=isCaseSensitive;this.matches=[];}','Search.prototype={hasMatches:function(){return this.matches.length>0;},hasVisibleMatches:function(){if(this.hasMatches()){for(var i=0;i<this.matches.length;i++){if(this.matches[i].isVisible()){return true;}}}','return false;},match:function(logEntry){var entryText=String(logEntry.formattedMessage);var matchesSearch=false;if(this.isRegex){matchesSearch=this.searchRegex.test(entryText);}else if(this.isCaseSensitive){matchesSearch=(entryText.indexOf(this.searchTerm)>-1);}else{matchesSearch=(entryText.toLowerCase().indexOf(this.searchTerm.toLowerCase())>-1);}','return matchesSearch;},getNextVisibleMatchIndex:function(){for(var i=currentMatchIndex+1;i<this.matches.length;i++){if(this.matches[i].isVisible()){return i;}}','for(i=0;i<=currentMatchIndex;i++){if(this.matches[i].isVisible()){return i;}}','return-1;},getPreviousVisibleMatchIndex:function(){for(var i=currentMatchIndex-1;i>=0;i--){if(this.matches[i].isVisible()){return i;}}','for(var i=this.matches.length-1;i>=currentMatchIndex;i--){if(this.matches[i].isVisible()){return i;}}','return-1;},applyTo:function(logEntry){var doesMatch=this.match(logEntry);if(doesMatch){logEntry.group.expand();logEntry.setSearchMatch(true);var logEntryContent;var wrappedLogEntryContent;var searchTermReplacementStartTag="<span class=\\\"searchterm\\\">";var searchTermReplacementEndTag="<"+"/span>";var preTagName=isIe?"pre":"span";var preStartTag="<"+preTagName+" class=\\\"pre\\\">";var preEndTag="<"+"/"+preTagName+">";var startIndex=0;var searchIndex,matchedText,textBeforeMatch;if(this.isRegex){var flags=this.isCaseSensitive?"g":"gi";var capturingRegex=new RegExp("("+this.searchRegex.source+")",flags);var rnd=(""+Math.random()).substr(2);var startToken="%%s"+rnd+"%%";var endToken="%%e"+rnd+"%%";logEntryContent=logEntry.formattedMessage.replace(capturingRegex,startToken+"$1"+endToken);logEntryContent=escapeHtml(logEntryContent);var result;var searchString=logEntryContent;logEntryContent="";wrappedLogEntryContent="";while((searchIndex=searchString.indexOf(startToken,startIndex))>-1){var endTokenIndex=searchString.indexOf(endToken,searchIndex);matchedText=searchString.substring(searchIndex+startToken.length,endTokenIndex);textBeforeMatch=searchString.substring(startIndex,searchIndex);logEntryContent+=preStartTag+textBeforeMatch+preEndTag;logEntryContent+=searchTermReplacementStartTag+preStartTag+matchedText+','preEndTag+searchTermReplacementEndTag;if(isIe){wrappedLogEntryContent+=textBeforeMatch+searchTermReplacementStartTag+','matchedText+searchTermReplacementEndTag;}','startIndex=endTokenIndex+endToken.length;}','logEntryContent+=preStartTag+searchString.substr(startIndex)+preEndTag;if(isIe){wrappedLogEntryContent+=searchString.substr(startIndex);}}else{logEntryContent="";wrappedLogEntryContent="";var searchTermReplacementLength=searchTermReplacementStartTag.length+','this.searchTerm.length+searchTermReplacementEndTag.length;var searchTermLength=this.searchTerm.length;var searchTermLowerCase=this.searchTerm.toLowerCase();var logTextLowerCase=logEntry.formattedMessage.toLowerCase();while((searchIndex=logTextLowerCase.indexOf(searchTermLowerCase,startIndex))>-1){matchedText=escapeHtml(logEntry.formattedMessage.substr(searchIndex,this.searchTerm.length));textBeforeMatch=escapeHtml(logEntry.formattedMessage.substring(startIndex,searchIndex));var searchTermReplacement=searchTermReplacementStartTag+','preStartTag+matchedText+preEndTag+searchTermReplacementEndTag;logEntryContent+=preStartTag+textBeforeMatch+preEndTag+searchTermReplacement;if(isIe){wrappedLogEntryContent+=textBeforeMatch+searchTermReplacementStartTag+','matchedText+searchTermReplacementEndTag;}','startIndex=searchIndex+searchTermLength;}','var textAfterLastMatch=escapeHtml(logEntry.formattedMessage.substr(startIndex));logEntryContent+=preStartTag+textAfterLastMatch+preEndTag;if(isIe){wrappedLogEntryContent+=textAfterLastMatch;}}','logEntry.setContent(logEntryContent,wrappedLogEntryContent);var logEntryMatches=logEntry.getSearchMatches();this.matches=this.matches.concat(logEntryMatches);}else{logEntry.setSearchMatch(false);logEntry.setContent(logEntry.formattedMessage,logEntry.formattedMessage);}','return doesMatch;},removeMatches:function(logEntries){var matchesToRemoveCount=0;var currentMatchRemoved=false;var matchesToRemove=[];var i,iLen,j,jLen;for(i=0,iLen=this.matches.length;i<iLen;i++){for(j=0,jLen=logEntries.length;j<jLen;j++){if(this.matches[i].belongsTo(logEntries[j])){matchesToRemove.push(this.matches[i]);if(i===currentMatchIndex){currentMatchRemoved=true;}}}}','var newMatch=currentMatchRemoved?null:this.matches[currentMatchIndex];if(currentMatchRemoved){for(i=currentMatchIndex,iLen=this.matches.length;i<iLen;i++){if(this.matches[i].isVisible()&&!array_contains(matchesToRemove,this.matches[i])){newMatch=this.matches[i];break;}}}','for(i=0,iLen=matchesToRemove.length;i<iLen;i++){array_remove(this.matches,matchesToRemove[i]);matchesToRemove[i].remove();}','if(this.hasVisibleMatches()){if(newMatch===null){setCurrentMatchIndex(0);}else{var newMatchIndex=0;for(i=0,iLen=this.matches.length;i<iLen;i++){if(newMatch===this.matches[i]){newMatchIndex=i;break;}}','setCurrentMatchIndex(newMatchIndex);}}else{currentMatchIndex=null;displayNoMatches();}}};function getPageOffsetTop(el,container){var currentEl=el;var y=0;while(currentEl&&currentEl!=container){y+=currentEl.offsetTop;currentEl=currentEl.offsetParent;}','return y;}','function scrollIntoView(el){var logContainer=logMainContainer;if(!$("wrap").checked){var logContainerLeft=logContainer.scrollLeft;var logContainerRight=logContainerLeft+logContainer.offsetWidth;var elLeft=el.offsetLeft;var elRight=elLeft+el.offsetWidth;if(elLeft<logContainerLeft||elRight>logContainerRight){logContainer.scrollLeft=elLeft-(logContainer.offsetWidth-el.offsetWidth)/2;}}','var logContainerTop=logContainer.scrollTop;var logContainerBottom=logContainerTop+logContainer.offsetHeight;var elTop=getPageOffsetTop(el)-getToolBarsHeight();var elBottom=elTop+el.offsetHeight;if(elTop<logContainerTop||elBottom>logContainerBottom){logContainer.scrollTop=elTop-(logContainer.offsetHeight-el.offsetHeight)/2;}}','function Match(logEntryLevel,spanInMainDiv,spanInUnwrappedPre,spanInWrappedDiv){this.logEntryLevel=logEntryLevel;this.spanInMainDiv=spanInMainDiv;if(isIe){this.spanInUnwrappedPre=spanInUnwrappedPre;this.spanInWrappedDiv=spanInWrappedDiv;}','this.mainSpan=isIe?spanInUnwrappedPre:spanInMainDiv;}','Match.prototype={equals:function(match){return this.mainSpan===match.mainSpan;},setCurrent:function(){if(isIe){addClass(this.spanInUnwrappedPre,"currentmatch");addClass(this.spanInWrappedDiv,"currentmatch");var elementToScroll=$("wrap").checked?this.spanInWrappedDiv:this.spanInUnwrappedPre;scrollIntoView(elementToScroll);}else{addClass(this.spanInMainDiv,"currentmatch");scrollIntoView(this.spanInMainDiv);}},belongsTo:function(logEntry){if(isIe){return isDescendant(this.spanInUnwrappedPre,logEntry.unwrappedPre);}else{return isDescendant(this.spanInMainDiv,logEntry.mainDiv);}},setNotCurrent:function(){if(isIe){removeClass(this.spanInUnwrappedPre,"currentmatch");removeClass(this.spanInWrappedDiv,"currentmatch");}else{removeClass(this.spanInMainDiv,"currentmatch");}},isOrphan:function(){return isOrphan(this.mainSpan);},isVisible:function(){return getCheckBox(this.logEntryLevel).checked;},remove:function(){if(isIe){this.spanInUnwrappedPre=null;this.spanInWrappedDiv=null;}else{this.spanInMainDiv=null;}}};var currentSearch=null;var currentMatchIndex=null;function doSearch(){var searchBox=$("searchBox");var searchTerm=searchBox.value;var isRegex=$("searchRegex").checked;var isCaseSensitive=$("searchCaseSensitive").checked;var i;if(searchTerm===""){$("searchReset").disabled=true;$("searchNav").style.display="none";removeClass(document.body,"searching");removeClass(searchBox,"hasmatches");removeClass(searchBox,"nomatches");for(i=0;i<logEntries.length;i++){logEntries[i].clearSearch();logEntries[i].setContent(logEntries[i].formattedMessage,logEntries[i].formattedMessage);}','currentSearch=null;setLogContainerHeight();}else{$("searchReset").disabled=false;$("searchNav").style.display="block";var searchRegex;var regexValid;if(isRegex){try{searchRegex=isCaseSensitive?new RegExp(searchTerm,"g"):new RegExp(searchTerm,"gi");regexValid=true;replaceClass(searchBox,"validregex","invalidregex");searchBox.title="Valid regex";}catch(ex){regexValid=false;replaceClass(searchBox,"invalidregex","validregex");searchBox.title="Invalid regex: "+(ex.message?ex.message:(ex.description?ex.description:"unknown error"));return;}}else{searchBox.title="";removeClass(searchBox,"validregex");removeClass(searchBox,"invalidregex");}','addClass(document.body,"searching");currentSearch=new Search(searchTerm,isRegex,searchRegex,isCaseSensitive);for(i=0;i<logEntries.length;i++){currentSearch.applyTo(logEntries[i]);}','setLogContainerHeight();if(currentSearch.hasVisibleMatches()){setCurrentMatchIndex(0);displayMatches();}else{displayNoMatches();}}}','function updateSearchFromFilters(){if(currentSearch){if(currentSearch.hasMatches()){if(currentMatchIndex===null){currentMatchIndex=0;}','var currentMatch=currentSearch.matches[currentMatchIndex];if(currentMatch.isVisible()){displayMatches();setCurrentMatchIndex(currentMatchIndex);}else{currentMatch.setNotCurrent();var nextVisibleMatchIndex=currentSearch.getNextVisibleMatchIndex();if(nextVisibleMatchIndex>-1){setCurrentMatchIndex(nextVisibleMatchIndex);displayMatches();}else{displayNoMatches();}}}else{displayNoMatches();}}}','function refreshCurrentMatch(){if(currentSearch&&currentSearch.hasVisibleMatches()){setCurrentMatchIndex(currentMatchIndex);}}','function displayMatches(){replaceClass($("searchBox"),"hasmatches","nomatches");$("searchBox").title=""+currentSearch.matches.length+" matches found";$("searchNav").style.display="block";setLogContainerHeight();}','function displayNoMatches(){replaceClass($("searchBox"),"nomatches","hasmatches");$("searchBox").title="No matches found";$("searchNav").style.display="none";setLogContainerHeight();}','function toggleSearchEnabled(enable){enable=(typeof enable=="undefined")?!$("searchDisable").checked:enable;$("searchBox").disabled=!enable;$("searchReset").disabled=!enable;$("searchRegex").disabled=!enable;$("searchNext").disabled=!enable;$("searchPrevious").disabled=!enable;$("searchCaseSensitive").disabled=!enable;$("searchNav").style.display=(enable&&($("searchBox").value!=="")&&currentSearch&&currentSearch.hasVisibleMatches())?"block":"none";if(enable){removeClass($("search"),"greyedout");addClass(document.body,"searching");if($("searchHighlight").checked){addClass(logMainContainer,"searchhighlight");}else{removeClass(logMainContainer,"searchhighlight");}','if($("searchFilter").checked){addClass(logMainContainer,"searchfilter");}else{removeClass(logMainContainer,"searchfilter");}','$("searchDisable").checked=!enable;}else{addClass($("search"),"greyedout");removeClass(document.body,"searching");removeClass(logMainContainer,"searchhighlight");removeClass(logMainContainer,"searchfilter");}','setLogContainerHeight();}','function toggleSearchFilter(){var enable=$("searchFilter").checked;if(enable){addClass(logMainContainer,"searchfilter");}else{removeClass(logMainContainer,"searchfilter");}','refreshCurrentMatch();}','function toggleSearchHighlight(){var enable=$("searchHighlight").checked;if(enable){addClass(logMainContainer,"searchhighlight");}else{removeClass(logMainContainer,"searchhighlight");}}','function clearSearch(){$("searchBox").value="";doSearch();}','function searchNext(){if(currentSearch!==null&&currentMatchIndex!==null){currentSearch.matches[currentMatchIndex].setNotCurrent();var nextMatchIndex=currentSearch.getNextVisibleMatchIndex();if(nextMatchIndex>currentMatchIndex||confirm("Reached the end of the page. Start from the top?")){setCurrentMatchIndex(nextMatchIndex);}}}','function searchPrevious(){if(currentSearch!==null&&currentMatchIndex!==null){currentSearch.matches[currentMatchIndex].setNotCurrent();var previousMatchIndex=currentSearch.getPreviousVisibleMatchIndex();if(previousMatchIndex<currentMatchIndex||confirm("Reached the start of the page. Continue from the bottom?")){setCurrentMatchIndex(previousMatchIndex);}}}','function setCurrentMatchIndex(index){currentMatchIndex=index;currentSearch.matches[currentMatchIndex].setCurrent();}','function addClass(el,cssClass){if(!hasClass(el,cssClass)){if(el.className){el.className+=" "+cssClass;}else{el.className=cssClass;}}}','function hasClass(el,cssClass){if(el.className){var classNames=el.className.split(" ");return array_contains(classNames,cssClass);}','return false;}','function removeClass(el,cssClass){if(hasClass(el,cssClass)){var existingClasses=el.className.split(" ");var newClasses=[];for(var i=0,len=existingClasses.length;i<len;i++){if(existingClasses[i]!=cssClass){newClasses[newClasses.length]=existingClasses[i];}}','el.className=newClasses.join(" ");}}','function replaceClass(el,newCssClass,oldCssClass){removeClass(el,oldCssClass);addClass(el,newCssClass);}','function getElementsByClass(el,cssClass,tagName){var elements=el.getElementsByTagName(tagName);var matches=[];for(var i=0,len=elements.length;i<len;i++){if(hasClass(elements[i],cssClass)){matches.push(elements[i]);}}','return matches;}','function $(id){return document.getElementById(id);}','function isDescendant(node,ancestorNode){while(node!=null){if(node===ancestorNode){return true;}','node=node.parentNode;}','return false;}','function isOrphan(node){var currentNode=node;while(currentNode){if(currentNode==document.body){return false;}','currentNode=currentNode.parentNode;}','return true;}','function escapeHtml(str){return str.replace(/&/g,"&amp;").replace(/[<]/g,"&lt;").replace(/>/g,"&gt;");}','function getWindowWidth(){if(window.innerWidth){return window.innerWidth;}else if(document.documentElement&&document.documentElement.clientWidth){return document.documentElement.clientWidth;}else if(document.body){return document.body.clientWidth;}','return 0;}','function getWindowHeight(){if(window.innerHeight){return window.innerHeight;}else if(document.documentElement&&document.documentElement.clientHeight){return document.documentElement.clientHeight;}else if(document.body){return document.body.clientHeight;}','return 0;}','function getToolBarsHeight(){return $("switches").offsetHeight;}','function getChromeHeight(){var height=getToolBarsHeight();if(showCommandLine){height+=$("commandLine").offsetHeight;}','return height;}','function setLogContainerHeight(){if(logMainContainer){var windowHeight=getWindowHeight();$("body").style.height=getWindowHeight()+"px";logMainContainer.style.height=""+','Math.max(0,windowHeight-getChromeHeight())+"px";}}','function setCommandInputWidth(){if(showCommandLine){$("command").style.width=""+Math.max(0,$("commandLineContainer").offsetWidth-','($("evaluateButton").offsetWidth+13))+"px";}}','window.onresize=function(){setCommandInputWidth();setLogContainerHeight();};if(!Array.prototype.push){Array.prototype.push=function(){for(var i=0,len=arguments.length;i<len;i++){this[this.length]=arguments[i];}','return this.length;};}','if(!Array.prototype.pop){Array.prototype.pop=function(){if(this.length>0){var val=this[this.length-1];this.length=this.length-1;return val;}};}','if(!Array.prototype.shift){Array.prototype.shift=function(){if(this.length>0){var firstItem=this[0];for(var i=0,len=this.length-1;i<len;i++){this[i]=this[i+1];}','this.length=this.length-1;return firstItem;}};}','if(!Array.prototype.splice){Array.prototype.splice=function(startIndex,deleteCount){var itemsAfterDeleted=this.slice(startIndex+deleteCount);var itemsDeleted=this.slice(startIndex,startIndex+deleteCount);this.length=startIndex;var argumentsArray=[];for(var i=0,len=arguments.length;i<len;i++){argumentsArray[i]=arguments[i];}','var itemsToAppend=(argumentsArray.length>2)?itemsAfterDeleted=argumentsArray.slice(2).concat(itemsAfterDeleted):itemsAfterDeleted;for(i=0,len=itemsToAppend.length;i<len;i++){this.push(itemsToAppend[i]);}','return itemsDeleted;};}','function array_remove(arr,val){var index=-1;for(var i=0,len=arr.length;i<len;i++){if(arr[i]===val){index=i;break;}}','if(index>=0){arr.splice(index,1);return index;}else{return false;}}','function array_removeFromStart(array,numberToRemove){if(Array.prototype.splice){array.splice(0,numberToRemove);}else{for(var i=numberToRemove,len=array.length;i<len;i++){array[i-numberToRemove]=array[i];}','array.length=array.length-numberToRemove;}','return array;}','function array_contains(arr,val){for(var i=0,len=arr.length;i<len;i++){if(arr[i]==val){return true;}}','return false;}','function getErrorMessage(ex){if(ex.message){return ex.message;}else if(ex.description){return ex.description;}','return""+ex;}','function moveCaretToEnd(input){if(input.setSelectionRange){input.focus();var length=input.value.length;input.setSelectionRange(length,length);}else if(input.createTextRange){var range=input.createTextRange();range.collapse(false);range.select();}','input.focus();}','function stopPropagation(evt){if(evt.stopPropagation){evt.stopPropagation();}else if(typeof evt.cancelBubble!="undefined"){evt.cancelBubble=true;}}','function getEvent(evt){return evt?evt:event;}','function getTarget(evt){return evt.target?evt.target:evt.srcElement;}','function getRelatedTarget(evt){if(evt.relatedTarget){return evt.relatedTarget;}else if(evt.srcElement){switch(evt.type){case"mouseover":return evt.fromElement;case"mouseout":return evt.toElement;default:return evt.srcElement;}}}','function cancelKeyEvent(evt){evt.returnValue=false;stopPropagation(evt);}','function evalCommandLine(){var expr=$("command").value;evalCommand(expr);$("command").value="";}','function evalLastCommand(){if(lastCommand!=null){evalCommand(lastCommand);}}','var lastCommand=null;var commandHistory=[];var currentCommandIndex=0;function evalCommand(expr){if(appender){appender.evalCommandAndAppend(expr);}else{var prefix=">>> "+expr+"\\r\\n";try{log("INFO",prefix+eval(expr));}catch(ex){log("ERROR",prefix+"Error: "+getErrorMessage(ex));}}','if(expr!=commandHistory[commandHistory.length-1]){commandHistory.push(expr);if(appender){appender.storeCommandHistory(commandHistory);}}','currentCommandIndex=(expr==commandHistory[currentCommandIndex])?currentCommandIndex+1:commandHistory.length;lastCommand=expr;}','//]]>','</script>','<style type="text/css">','body{background-color:white;color:black;padding:0;margin:0;font-family:tahoma,verdana,arial,helvetica,sans-serif;overflow:hidden}div#switchesContainer input{margin-bottom:0}div.toolbar{border-top:solid #ffffff 1px;border-bottom:solid #aca899 1px;background-color:#f1efe7;padding:3px 5px;font-size:68.75%}div.toolbar,div#search input{font-family:tahoma,verdana,arial,helvetica,sans-serif}div.toolbar input.button{padding:0 5px;font-size:100%}div.toolbar input.hidden{display:none}div#switches input#clearButton{margin-left:20px}div#levels label{font-weight:bold}div#levels label,div#options label{margin-right:5px}div#levels label#wrapLabel{font-weight:normal}div#search label{margin-right:10px}div#search label.searchboxlabel{margin-right:0}div#search input{font-size:100%}div#search input.validregex{color:green}div#search input.invalidregex{color:red}div#search input.nomatches{color:white;background-color:#ff6666}div#search input.nomatches{color:white;background-color:#ff6666}div#searchNav{display:none}div#commandLine{display:none}div#commandLine input#command{font-size:100%;font-family:Courier New,Courier}div#commandLine input#evaluateButton{}*.greyedout{color:gray !important;border-color:gray !important}*.greyedout *.alwaysenabled{color:black}*.unselectable{-khtml-user-select:none;-moz-user-select:none;user-select:none}div#log{font-family:Courier New,Courier;font-size:75%;width:100%;overflow:auto;clear:both;position:relative}div.group{border-color:#cccccc;border-style:solid;border-width:1px 0 1px 1px;overflow:visible}div.oldIe div.group,div.oldIe div.group *,div.oldIe *.logentry{height:1%}div.group div.groupheading span.expander{border:solid black 1px;font-family:Courier New,Courier;font-size:0.833em;background-color:#eeeeee;position:relative;top:-1px;color:black;padding:0 2px;cursor:pointer;cursor:hand;height:1%}div.group div.groupcontent{margin-left:10px;padding-bottom:2px;overflow:visible}div.group div.expanded{display:block}div.group div.collapsed{display:none}*.logentry{overflow:visible;display:none;white-space:pre}span.pre{white-space:pre}pre.unwrapped{display:inline !important}pre.unwrapped pre.pre,div.wrapped pre.pre{display:inline}div.wrapped pre.pre{white-space:normal}div.wrapped{display:none}body.searching *.logentry span.currentmatch{color:white !important;background-color:green !important}body.searching div.searchhighlight *.logentry span.searchterm{color:black;background-color:yellow}div.wrap *.logentry{white-space:normal !important;border-width:0 0 1px 0;border-color:#dddddd;border-style:dotted}div.wrap #log_wrapped,#log_unwrapped{display:block}div.wrap #log_unwrapped,#log_wrapped{display:none}div.wrap *.logentry span.pre{overflow:visible;white-space:normal}div.wrap *.logentry pre.unwrapped{display:none}div.wrap *.logentry span.wrapped{display:inline}div.searchfilter *.searchnonmatch{display:none !important}div#log *.TRACE,label#label_TRACE{color:#666666}div#log *.DEBUG,label#label_DEBUG{color:green}div#log *.INFO,label#label_INFO{color:#000099}div#log *.WARN,label#label_WARN{color:#999900}div#log *.ERROR,label#label_ERROR{color:red}div#log *.FATAL,label#label_FATAL{color:#660066}div.TRACE#log *.TRACE,div.DEBUG#log *.DEBUG,div.INFO#log *.INFO,div.WARN#log *.WARN,div.ERROR#log *.ERROR,div.FATAL#log *.FATAL{display:block}div#log div.separator{background-color:#cccccc;margin:5px 0;line-height:1px}','</style>','</head>','<body id="body">','<div id="switchesContainer">','<div id="switches">','<div id="levels" class="toolbar">','Filters:','<input type="checkbox" id="switch_TRACE" onclick="applyFilters(); checkAllLevels()" checked="checked" title="Show/hide trace messages" /><label for="switch_TRACE" id="label_TRACE">trace</label>','<input type="checkbox" id="switch_DEBUG" onclick="applyFilters(); checkAllLevels()" checked="checked" title="Show/hide debug messages" /><label for="switch_DEBUG" id="label_DEBUG">debug</label>','<input type="checkbox" id="switch_INFO" onclick="applyFilters(); checkAllLevels()" checked="checked" title="Show/hide info messages" /><label for="switch_INFO" id="label_INFO">info</label>','<input type="checkbox" id="switch_WARN" onclick="applyFilters(); checkAllLevels()" checked="checked" title="Show/hide warn messages" /><label for="switch_WARN" id="label_WARN">warn</label>','<input type="checkbox" id="switch_ERROR" onclick="applyFilters(); checkAllLevels()" checked="checked" title="Show/hide error messages" /><label for="switch_ERROR" id="label_ERROR">error</label>','<input type="checkbox" id="switch_FATAL" onclick="applyFilters(); checkAllLevels()" checked="checked" title="Show/hide fatal messages" /><label for="switch_FATAL" id="label_FATAL">fatal</label>','<input type="checkbox" id="switch_ALL" onclick="toggleAllLevels(); applyFilters()" checked="checked" title="Show/hide all messages" /><label for="switch_ALL" id="label_ALL">all</label>','</div>','<div id="search" class="toolbar">','<label for="searchBox" class="searchboxlabel">Search:</label> <input type="text" id="searchBox" onclick="toggleSearchEnabled(true)" onkeyup="scheduleSearch()" size="20" />','<input type="button" id="searchReset" disabled="disabled" value="Reset" onclick="clearSearch()" class="button" title="Reset the search" />','<input type="checkbox" id="searchRegex" onclick="doSearch()" title="If checked, search is treated as a regular expression" /><label for="searchRegex">Regex</label>','<input type="checkbox" id="searchCaseSensitive" onclick="doSearch()" title="If checked, search is case sensitive" /><label for="searchCaseSensitive">Match case</label>','<input type="checkbox" id="searchDisable" onclick="toggleSearchEnabled()" title="Enable/disable search" /><label for="searchDisable" class="alwaysenabled">Disable</label>','<div id="searchNav">','<input type="button" id="searchNext" disabled="disabled" value="Next" onclick="searchNext()" class="button" title="Go to the next matching log entry" />','<input type="button" id="searchPrevious" disabled="disabled" value="Previous" onclick="searchPrevious()" class="button" title="Go to the previous matching log entry" />','<input type="checkbox" id="searchFilter" onclick="toggleSearchFilter()" title="If checked, non-matching log entries are filtered out" /><label for="searchFilter">Filter</label>','<input type="checkbox" id="searchHighlight" onclick="toggleSearchHighlight()" title="Highlight matched search terms" /><label for="searchHighlight" class="alwaysenabled">Highlight all</label>','</div>','</div>','<div id="options" class="toolbar">','Options:','<input type="checkbox" id="enableLogging" onclick="toggleLoggingEnabled()" checked="checked" title="Enable/disable logging" /><label for="enableLogging" id="enableLoggingLabel">Log</label>','<input type="checkbox" id="wrap" onclick="toggleWrap()" title="Enable / disable word wrap" /><label for="wrap" id="wrapLabel">Wrap</label>','<input type="checkbox" id="newestAtTop" onclick="toggleNewestAtTop()" title="If checked, causes newest messages to appear at the top" /><label for="newestAtTop" id="newestAtTopLabel">Newest at the top</label>','<input type="checkbox" id="scrollToLatest" onclick="toggleScrollToLatest()" checked="checked" title="If checked, window automatically scrolls to a new message when it is added" /><label for="scrollToLatest" id="scrollToLatestLabel">Scroll to latest</label>','<input type="button" id="clearButton" value="Clear" onclick="clearLog()" class="button" title="Clear all log messages"  />','<input type="button" id="hideButton" value="Hide" onclick="hide()" class="hidden button" title="Hide the console" />','<input type="button" id="closeButton" value="Close" onclick="closeWindow()" class="hidden button" title="Close the window" />','</div>','</div>','</div>','<div id="log" class="TRACE DEBUG INFO WARN ERROR FATAL"></div>','<div id="commandLine" class="toolbar">','<div id="commandLineContainer">','<input type="text" id="command" title="Enter a JavaScript command here and hit return or press \'Evaluate\'" />','<input type="button" id="evaluateButton" value="Evaluate" class="button" title="Evaluate the command" onclick="evalCommandLine()" />','</div>','</div>','</body>','</html>',''];};var defaultCommandLineFunctions=[];ConsoleAppender=function(){};var consoleAppenderIdCounter=1;ConsoleAppender.prototype=new Appender();ConsoleAppender.prototype.create=function(inPage,container,lazyInit,initiallyMinimized,useDocumentWrite,width,height,focusConsoleWindow){var appender=this;var initialized=false;var consoleWindowCreated=false;var consoleWindowLoaded=false;var consoleClosed=false;var queuedLoggingEvents=[];var isSupported=true;var consoleAppenderId=consoleAppenderIdCounter++;initiallyMinimized=extractBooleanFromParam(initiallyMinimized,this.defaults.initiallyMinimized);lazyInit=extractBooleanFromParam(lazyInit,this.defaults.lazyInit);useDocumentWrite=extractBooleanFromParam(useDocumentWrite,this.defaults.useDocumentWrite);var newestMessageAtTop=this.defaults.newestMessageAtTop;var scrollToLatestMessage=this.defaults.scrollToLatestMessage;width=width?width:this.defaults.width;height=height?height:this.defaults.height;var maxMessages=this.defaults.maxMessages;var showCommandLine=this.defaults.showCommandLine;var commandLineObjectExpansionDepth=this.defaults.commandLineObjectExpansionDepth;var showHideButton=this.defaults.showHideButton;var showCloseButton=this.defaults.showCloseButton;this.setLayout(this.defaults.layout);var init,createWindow,safeToAppend,getConsoleWindow,open;var appenderName=inPage?"InPageAppender":"PopUpAppender";var checkCanConfigure=function(configOptionName){if(consoleWindowCreated){handleError(appenderName+": configuration option '"+configOptionName+"' may not be set after the appender has been initialized");return false;}
return true;};var consoleWindowExists=function(){return(consoleWindowLoaded&&isSupported&&!consoleClosed);};this.isNewestMessageAtTop=function(){return newestMessageAtTop;};this.setNewestMessageAtTop=function(newestMessageAtTopParam){newestMessageAtTop=bool(newestMessageAtTopParam);if(consoleWindowExists()){getConsoleWindow().setNewestAtTop(newestMessageAtTop);}};this.isScrollToLatestMessage=function(){return scrollToLatestMessage;};this.setScrollToLatestMessage=function(scrollToLatestMessageParam){scrollToLatestMessage=bool(scrollToLatestMessageParam);if(consoleWindowExists()){getConsoleWindow().setScrollToLatest(scrollToLatestMessage);}};this.getWidth=function(){return width;};this.setWidth=function(widthParam){if(checkCanConfigure("width")){width=extractStringFromParam(widthParam,width);}};this.getHeight=function(){return height;};this.setHeight=function(heightParam){if(checkCanConfigure("height")){height=extractStringFromParam(heightParam,height);}};this.getMaxMessages=function(){return maxMessages;};this.setMaxMessages=function(maxMessagesParam){maxMessages=extractIntFromParam(maxMessagesParam,maxMessages);if(consoleWindowExists()){getConsoleWindow().setMaxMessages(maxMessages);}};this.isShowCommandLine=function(){return showCommandLine;};this.setShowCommandLine=function(showCommandLineParam){showCommandLine=bool(showCommandLineParam);if(consoleWindowExists()){getConsoleWindow().setShowCommandLine(showCommandLine);}};this.isShowHideButton=function(){return showHideButton;};this.setShowHideButton=function(showHideButtonParam){showHideButton=bool(showHideButtonParam);if(consoleWindowExists()){getConsoleWindow().setShowHideButton(showHideButton);}};this.isShowCloseButton=function(){return showCloseButton;};this.setShowCloseButton=function(showCloseButtonParam){showCloseButton=bool(showCloseButtonParam);if(consoleWindowExists()){getConsoleWindow().setShowCloseButton(showCloseButton);}};this.getCommandLineObjectExpansionDepth=function(){return commandLineObjectExpansionDepth;};this.setCommandLineObjectExpansionDepth=function(commandLineObjectExpansionDepthParam){commandLineObjectExpansionDepth=extractIntFromParam(commandLineObjectExpansionDepthParam,commandLineObjectExpansionDepth);};var minimized=initiallyMinimized;this.isInitiallyMinimized=function(){return initiallyMinimized;};this.setInitiallyMinimized=function(initiallyMinimizedParam){if(checkCanConfigure("initiallyMinimized")){initiallyMinimized=bool(initiallyMinimizedParam);minimized=initiallyMinimized;}};this.isUseDocumentWrite=function(){return useDocumentWrite;};this.setUseDocumentWrite=function(useDocumentWriteParam){if(checkCanConfigure("useDocumentWrite")){useDocumentWrite=bool(useDocumentWriteParam);}};function QueuedLoggingEvent(loggingEvent,formattedMessage){this.loggingEvent=loggingEvent;this.levelName=loggingEvent.level.name;this.formattedMessage=formattedMessage;}
QueuedLoggingEvent.prototype.append=function(){getConsoleWindow().log(this.levelName,this.formattedMessage);};function QueuedGroup(name,initiallyExpanded){this.name=name;this.initiallyExpanded=initiallyExpanded;}
QueuedGroup.prototype.append=function(){getConsoleWindow().group(this.name,this.initiallyExpanded);};function QueuedGroupEnd(){}
QueuedGroupEnd.prototype.append=function(){getConsoleWindow().groupEnd();};var checkAndAppend=function(){safeToAppend();if(!initialized){init();}else if(consoleClosed&&reopenWhenClosed){createWindow();}
if(safeToAppend()){appendQueuedLoggingEvents();}};this.append=function(loggingEvent){if(isSupported){var formattedMessage=appender.getLayout().formatWithException(loggingEvent);queuedLoggingEvents.push(new QueuedLoggingEvent(loggingEvent,formattedMessage));checkAndAppend();}};this.group=function(name,initiallyExpanded){if(isSupported){queuedLoggingEvents.push(new QueuedGroup(name,initiallyExpanded));checkAndAppend();}};this.groupEnd=function(){if(isSupported){queuedLoggingEvents.push(new QueuedGroupEnd());checkAndAppend();}};var appendQueuedLoggingEvents=function(){while(queuedLoggingEvents.length>0){queuedLoggingEvents.shift().append();}
if(focusConsoleWindow){getConsoleWindow().focus();}};this.setAddedToLogger=function(logger){this.loggers.push(logger);if(enabled&&!lazyInit){init();}};this.clear=function(){if(consoleWindowExists()){getConsoleWindow().clearLog();}
queuedLoggingEvents.length=0;};this.focus=function(){if(consoleWindowExists()){getConsoleWindow().focus();}};this.focusCommandLine=function(){if(consoleWindowExists()){getConsoleWindow().focusCommandLine();}};this.focusSearch=function(){if(consoleWindowExists()){getConsoleWindow().focusSearch();}};var commandWindow=window;this.getCommandWindow=function(){return commandWindow;};this.setCommandWindow=function(commandWindowParam){commandWindow=commandWindowParam;};this.executeLastCommand=function(){if(consoleWindowExists()){getConsoleWindow().evalLastCommand();}};var commandLayout=new PatternLayout("%m");this.getCommandLayout=function(){return commandLayout;};this.setCommandLayout=function(commandLayoutParam){commandLayout=commandLayoutParam;};this.evalCommandAndAppend=function(expr){var commandReturnValue={appendResult:true,isError:false};var commandOutput="";try{var result,i;if(!commandWindow.eval&&commandWindow.execScript){commandWindow.execScript("null");}
var commandLineFunctionsHash={};for(i=0,len=commandLineFunctions.length;i<len;i++){commandLineFunctionsHash[commandLineFunctions[i][0]]=commandLineFunctions[i][1];}
var objectsToRestore=[];var addObjectToRestore=function(name){objectsToRestore.push([name,commandWindow[name]]);};addObjectToRestore("appender");commandWindow.appender=appender;addObjectToRestore("commandReturnValue");commandWindow.commandReturnValue=commandReturnValue;addObjectToRestore("commandLineFunctionsHash");commandWindow.commandLineFunctionsHash=commandLineFunctionsHash;var addFunctionToWindow=function(name){addObjectToRestore(name);commandWindow[name]=function(){return this.commandLineFunctionsHash[name](appender,arguments,commandReturnValue);};};for(i=0,len=commandLineFunctions.length;i<len;i++){addFunctionToWindow(commandLineFunctions[i][0]);}
if(commandWindow===window&&commandWindow.execScript){addObjectToRestore("evalExpr");addObjectToRestore("result");window.evalExpr=expr;commandWindow.execScript("window.result=eval(window.evalExpr);");result=window.result;}else{result=commandWindow.eval(expr);}
commandOutput=isUndefined(result)?result:formatObjectExpansion(result,commandLineObjectExpansionDepth);for(i=0,len=objectsToRestore.length;i<len;i++){commandWindow[objectsToRestore[i][0]]=objectsToRestore[i][1];}}catch(ex){commandOutput="Error evaluating command: "+getExceptionStringRep(ex);commandReturnValue.isError=true;}
if(commandReturnValue.appendResult){var message=">>> "+expr;if(!isUndefined(commandOutput)){message+=newLine+commandOutput;}
var level=commandReturnValue.isError?Level.ERROR:Level.INFO;var loggingEvent=new LoggingEvent(null,new Date(),level,[message],null);var mainLayout=this.getLayout();this.setLayout(commandLayout);this.append(loggingEvent);this.setLayout(mainLayout);}};var commandLineFunctions=defaultCommandLineFunctions.concat([]);this.addCommandLineFunction=function(functionName,commandLineFunction){commandLineFunctions.push([functionName,commandLineFunction]);};var commandHistoryCookieName="log4javascriptCommandHistory";this.storeCommandHistory=function(commandHistory){setCookie(commandHistoryCookieName,commandHistory.join(","));};var writeHtml=function(doc){var lines=getConsoleHtmlLines();doc.open();for(var i=0,len=lines.length;i<len;i++){doc.writeln(lines[i]);}
doc.close();};this.setEventTypes(["load","unload"]);var consoleWindowLoadHandler=function(){var win=getConsoleWindow();win.setAppender(appender);win.setNewestAtTop(newestMessageAtTop);win.setScrollToLatest(scrollToLatestMessage);win.setMaxMessages(maxMessages);win.setShowCommandLine(showCommandLine);win.setShowHideButton(showHideButton);win.setShowCloseButton(showCloseButton);win.setMainWindow(window);var storedValue=getCookie(commandHistoryCookieName);if(storedValue){win.commandHistory=storedValue.split(",");win.currentCommandIndex=win.commandHistory.length;}
appender.dispatchEvent("load",{"win":win});};this.unload=function(){logLog.debug("unload "+this+", caller: "+this.unload.caller);if(!consoleClosed){logLog.debug("really doing unload "+this);consoleClosed=true;consoleWindowLoaded=false;consoleWindowCreated=false;appender.dispatchEvent("unload",{});}};var pollConsoleWindow=function(windowTest,interval,successCallback,errorMessage){function doPoll(){try{if(consoleClosed){clearInterval(poll);}
if(windowTest(getConsoleWindow())){clearInterval(poll);successCallback();}}catch(ex){clearInterval(poll);isSupported=false;handleError(errorMessage,ex);}}
var poll=setInterval(doPoll,interval);};var getConsoleUrl=function(){var documentDomainSet=(document.domain!=location.hostname);return useDocumentWrite?"":getBaseUrl()+"console.html"+
(documentDomainSet?"?log4javascript_domain="+escape(document.domain):"");};if(inPage){var containerElement=null;var cssProperties=[];this.addCssProperty=function(name,value){if(checkCanConfigure("cssProperties")){cssProperties.push([name,value]);}};var windowCreationStarted=false;var iframeContainerDiv;var iframeId=uniqueId+"_InPageAppender_"+consoleAppenderId;this.hide=function(){if(initialized&&consoleWindowCreated){if(consoleWindowExists()){getConsoleWindow().$("command").blur();}
iframeContainerDiv.style.display="none";minimized=true;}};this.show=function(){if(initialized){if(consoleWindowCreated){iframeContainerDiv.style.display="block";this.setShowCommandLine(showCommandLine);minimized=false;}else if(!windowCreationStarted){createWindow(true);}}};this.isVisible=function(){return!minimized&&!consoleClosed;};this.close=function(fromButton){if(!consoleClosed&&(!fromButton||confirm("This will permanently remove the console from the page. No more messages will be logged. Do you wish to continue?"))){iframeContainerDiv.parentNode.removeChild(iframeContainerDiv);this.unload();}};open=function(){var initErrorMessage="InPageAppender.open: unable to create console iframe";function finalInit(){try{if(!initiallyMinimized){appender.show();}
consoleWindowLoadHandler();consoleWindowLoaded=true;appendQueuedLoggingEvents();}catch(ex){isSupported=false;handleError(initErrorMessage,ex);}}
function writeToDocument(){try{var windowTest=function(win){return isLoaded(win);};if(useDocumentWrite){writeHtml(getConsoleWindow().document);}
if(windowTest(getConsoleWindow())){finalInit();}else{pollConsoleWindow(windowTest,100,finalInit,initErrorMessage);}}catch(ex){isSupported=false;handleError(initErrorMessage,ex);}}
minimized=false;iframeContainerDiv=containerElement.appendChild(document.createElement("div"));iframeContainerDiv.style.width=width;iframeContainerDiv.style.height=height;iframeContainerDiv.style.border="solid gray 1px";for(var i=0,len=cssProperties.length;i<len;i++){iframeContainerDiv.style[cssProperties[i][0]]=cssProperties[i][1];}
var iframeSrc=useDocumentWrite?"":" src='"+getConsoleUrl()+"'";iframeContainerDiv.innerHTML="<iframe id='"+iframeId+"' name='"+iframeId+"' width='100%' height='100%' frameborder='0'"+iframeSrc+" scrolling='no'></iframe>";consoleClosed=false;var iframeDocumentExistsTest=function(win){try{return bool(win)&&bool(win.document);}catch(ex){return false;}};if(iframeDocumentExistsTest(getConsoleWindow())){writeToDocument();}else{pollConsoleWindow(iframeDocumentExistsTest,100,writeToDocument,initErrorMessage);}
consoleWindowCreated=true;};createWindow=function(show){if(show||!initiallyMinimized){var pageLoadHandler=function(){if(!container){containerElement=document.createElement("div");containerElement.style.position="fixed";containerElement.style.left="0";containerElement.style.right="0";containerElement.style.bottom="0";document.body.appendChild(containerElement);appender.addCssProperty("borderWidth","1px 0 0 0");appender.addCssProperty("zIndex",1000000);open();}else{try{var el=document.getElementById(container);if(el.nodeType==1){containerElement=el;}
open();}catch(ex){handleError("InPageAppender.init: invalid container element '"+container+"' supplied",ex);}}};if(pageLoaded&&container&&container.appendChild){containerElement=container;open();}else if(pageLoaded){pageLoadHandler();}else{log4javascript.addEventListener("load",pageLoadHandler);}
windowCreationStarted=true;}};init=function(){createWindow();initialized=true;};getConsoleWindow=function(){var iframe=window.frames[iframeId];if(iframe){return iframe;}};safeToAppend=function(){if(isSupported&&!consoleClosed){if(consoleWindowCreated&&!consoleWindowLoaded&&getConsoleWindow()&&isLoaded(getConsoleWindow())){consoleWindowLoaded=true;}
return consoleWindowLoaded;}
return false;};}else{var useOldPopUp=appender.defaults.useOldPopUp;var complainAboutPopUpBlocking=appender.defaults.complainAboutPopUpBlocking;var reopenWhenClosed=this.defaults.reopenWhenClosed;this.isUseOldPopUp=function(){return useOldPopUp;};this.setUseOldPopUp=function(useOldPopUpParam){if(checkCanConfigure("useOldPopUp")){useOldPopUp=bool(useOldPopUpParam);}};this.isComplainAboutPopUpBlocking=function(){return complainAboutPopUpBlocking;};this.setComplainAboutPopUpBlocking=function(complainAboutPopUpBlockingParam){if(checkCanConfigure("complainAboutPopUpBlocking")){complainAboutPopUpBlocking=bool(complainAboutPopUpBlockingParam);}};this.isFocusPopUp=function(){return focusConsoleWindow;};this.setFocusPopUp=function(focusPopUpParam){focusConsoleWindow=bool(focusPopUpParam);};this.isReopenWhenClosed=function(){return reopenWhenClosed;};this.setReopenWhenClosed=function(reopenWhenClosedParam){reopenWhenClosed=bool(reopenWhenClosedParam);};this.close=function(){logLog.debug("close "+this);try{popUp.close();this.unload();}catch(ex){}};this.hide=function(){logLog.debug("hide "+this);if(consoleWindowExists()){this.close();}};this.show=function(){logLog.debug("show "+this);if(!consoleWindowCreated){open();}};this.isVisible=function(){return safeToAppend();};var popUp;open=function(){var windowProperties="width="+width+",height="+height+",status,resizable";var frameInfo="";try{var frameEl=window.frameElement;if(frameEl){frameInfo="_"+frameEl.tagName+"_"+(frameEl.name||frameEl.id||"");}}catch(e){frameInfo="_inaccessibleParentFrame";}
var windowName="PopUp_"+location.host.replace(/[^a-z0-9]/gi,"_")+"_"+consoleAppenderId+frameInfo;if(!useOldPopUp||!useDocumentWrite){windowName=windowName+"_"+uniqueId;}
var checkPopUpClosed=function(win){if(consoleClosed){return true;}else{try{return bool(win)&&win.closed;}catch(ex){}}
return false;};var popUpClosedCallback=function(){if(!consoleClosed){appender.unload();}};function finalInit(){getConsoleWindow().setCloseIfOpenerCloses(!useOldPopUp||!useDocumentWrite);consoleWindowLoadHandler();consoleWindowLoaded=true;appendQueuedLoggingEvents();pollConsoleWindow(checkPopUpClosed,500,popUpClosedCallback,"PopUpAppender.checkPopUpClosed: error checking pop-up window");}
try{popUp=window.open(getConsoleUrl(),windowName,windowProperties);consoleClosed=false;consoleWindowCreated=true;if(popUp&&popUp.document){if(useDocumentWrite&&useOldPopUp&&isLoaded(popUp)){popUp.mainPageReloaded();finalInit();}else{if(useDocumentWrite){writeHtml(popUp.document);}
var popUpLoadedTest=function(win){return bool(win)&&isLoaded(win);};if(isLoaded(popUp)){finalInit();}else{pollConsoleWindow(popUpLoadedTest,100,finalInit,"PopUpAppender.init: unable to create console window");}}}else{isSupported=false;logLog.warn("PopUpAppender.init: pop-ups blocked, please unblock to use PopUpAppender");if(complainAboutPopUpBlocking){handleError("log4javascript: pop-up windows appear to be blocked. Please unblock them to use pop-up logging.");}}}catch(ex){handleError("PopUpAppender.init: error creating pop-up",ex);}};createWindow=function(){if(!initiallyMinimized){open();}};init=function(){createWindow();initialized=true;};getConsoleWindow=function(){return popUp;};safeToAppend=function(){if(isSupported&&!isUndefined(popUp)&&!consoleClosed){if(popUp.closed||(consoleWindowLoaded&&isUndefined(popUp.closed))){appender.unload();logLog.debug("PopUpAppender: pop-up closed");return false;}
if(!consoleWindowLoaded&&isLoaded(popUp)){consoleWindowLoaded=true;}}
return isSupported&&consoleWindowLoaded&&!consoleClosed;};}
this.getConsoleWindow=getConsoleWindow;};ConsoleAppender.addGlobalCommandLineFunction=function(functionName,commandLineFunction){defaultCommandLineFunctions.push([functionName,commandLineFunction]);};function PopUpAppender(lazyInit,initiallyMinimized,useDocumentWrite,width,height){this.create(false,null,lazyInit,initiallyMinimized,useDocumentWrite,width,height,this.defaults.focusPopUp);}
PopUpAppender.prototype=new ConsoleAppender();PopUpAppender.prototype.defaults={layout:new PatternLayout("%d{HH:mm:ss} %-5p - %m{1}%n"),initiallyMinimized:false,focusPopUp:false,lazyInit:true,useOldPopUp:true,complainAboutPopUpBlocking:true,newestMessageAtTop:false,scrollToLatestMessage:true,width:"600",height:"400",reopenWhenClosed:false,maxMessages:null,showCommandLine:true,commandLineObjectExpansionDepth:1,showHideButton:false,showCloseButton:true,useDocumentWrite:true};PopUpAppender.prototype.toString=function(){return"PopUpAppender";};log4javascript.PopUpAppender=PopUpAppender;function InPageAppender(container,lazyInit,initiallyMinimized,useDocumentWrite,width,height){this.create(true,container,lazyInit,initiallyMinimized,useDocumentWrite,width,height,false);}
InPageAppender.prototype=new ConsoleAppender();InPageAppender.prototype.defaults={layout:new PatternLayout("%d{HH:mm:ss} %-5p - %m{1}%n"),initiallyMinimized:false,lazyInit:true,newestMessageAtTop:false,scrollToLatestMessage:true,width:"100%",height:"220px",maxMessages:null,showCommandLine:true,commandLineObjectExpansionDepth:1,showHideButton:false,showCloseButton:false,showLogEntryDeleteButtons:true,useDocumentWrite:true};InPageAppender.prototype.toString=function(){return"InPageAppender";};log4javascript.InPageAppender=InPageAppender;log4javascript.InlineAppender=InPageAppender;})();function padWithSpaces(str,len){if(str.length<len){var spaces=[];var numberOfSpaces=Math.max(0,len-str.length);for(var i=0;i<numberOfSpaces;i++){spaces[i]=" ";}
str+=spaces.join("");}
return str;}
(function(){function dir(obj){var maxLen=0;for(var p in obj){maxLen=Math.max(toStr(p).length,maxLen);}
var propList=[];for(p in obj){var propNameStr="  "+padWithSpaces(toStr(p),maxLen+2);var propVal;try{propVal=splitIntoLines(toStr(obj[p])).join(padWithSpaces(newLine,maxLen+6));}catch(ex){propVal="[Error obtaining property. Details: "+getExceptionMessage(ex)+"]";}
propList.push(propNameStr+propVal);}
return propList.join(newLine);}
var nodeTypes={ELEMENT_NODE:1,ATTRIBUTE_NODE:2,TEXT_NODE:3,CDATA_SECTION_NODE:4,ENTITY_REFERENCE_NODE:5,ENTITY_NODE:6,PROCESSING_INSTRUCTION_NODE:7,COMMENT_NODE:8,DOCUMENT_NODE:9,DOCUMENT_TYPE_NODE:10,DOCUMENT_FRAGMENT_NODE:11,NOTATION_NODE:12};var preFormattedElements=["script","pre"];var emptyElements=["br","img","hr","param","link","area","input","col","base","meta"];var indentationUnit="  ";function getXhtml(rootNode,includeRootNode,indentation,startNewLine,preformatted){includeRootNode=(typeof includeRootNode=="undefined")?true:!!includeRootNode;if(typeof indentation!="string"){indentation="";}
startNewLine=!!startNewLine;preformatted=!!preformatted;var xhtml;function isWhitespace(node){return((node.nodeType==nodeTypes.TEXT_NODE)&&/^[ \t\r\n]*$/.test(node.nodeValue));}
function fixAttributeValue(attrValue){return attrValue.toString().replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");}
function getStyleAttributeValue(el){var stylePairs=el.style.cssText.split(";");var styleValue="";for(var j=0,len=stylePairs.length;j<len;j++){var nameValueBits=stylePairs[j].split(":");var props=[];if(!/^\s*$/.test(nameValueBits[0])){props.push(trim(nameValueBits[0]).toLowerCase()+":"+trim(nameValueBits[1]));}
styleValue=props.join(";");}
return styleValue;}
function getNamespace(el){if(el.prefix){return el.prefix;}else if(el.outerHTML){var regex=new RegExp("<([^:]+):"+el.tagName+"[^>]*>","i");if(regex.test(el.outerHTML)){return RegExp.$1.toLowerCase();}}
return"";}
var lt="<";var gt=">";var i,len;if(includeRootNode&&rootNode.nodeType!=nodeTypes.DOCUMENT_FRAGMENT_NODE){switch(rootNode.nodeType){case nodeTypes.ELEMENT_NODE:var tagName=rootNode.tagName.toLowerCase();xhtml=startNewLine?newLine+indentation:"";xhtml+=lt;var prefix=getNamespace(rootNode);var hasPrefix=!!prefix;if(hasPrefix){xhtml+=prefix+":";}
xhtml+=tagName;for(i=0,len=rootNode.attributes.length;i<len;i++){var currentAttr=rootNode.attributes[i];if(!currentAttr.specified||currentAttr.nodeValue===null||currentAttr.nodeName.toLowerCase()==="style"||typeof currentAttr.nodeValue!=="string"||currentAttr.nodeName.indexOf("_moz")===0){continue;}
xhtml+=" "+currentAttr.nodeName.toLowerCase()+"=\"";xhtml+=fixAttributeValue(currentAttr.nodeValue);xhtml+="\"";}
if(rootNode.style.cssText){var styleValue=getStyleAttributeValue(rootNode);if(styleValue!==""){xhtml+=" style=\""+getStyleAttributeValue(rootNode)+"\"";}}
if(array_contains(emptyElements,tagName)||(hasPrefix&&!rootNode.hasChildNodes())){xhtml+="/"+gt;}else{xhtml+=gt;var childStartNewLine=!(rootNode.childNodes.length===1&&rootNode.childNodes[0].nodeType===nodeTypes.TEXT_NODE);var childPreformatted=array_contains(preFormattedElements,tagName);for(i=0,len=rootNode.childNodes.length;i<len;i++){xhtml+=getXhtml(rootNode.childNodes[i],true,indentation+indentationUnit,childStartNewLine,childPreformatted);}
var endTag=lt+"/"+tagName+gt;xhtml+=childStartNewLine?newLine+indentation+endTag:endTag;}
return xhtml;case nodeTypes.TEXT_NODE:if(isWhitespace(rootNode)){xhtml="";}else{if(preformatted){xhtml=rootNode.nodeValue;}else{var lines=splitIntoLines(trim(rootNode.nodeValue));var trimmedLines=[];for(i=0,len=lines.length;i<len;i++){trimmedLines[i]=trim(lines[i]);}
xhtml=trimmedLines.join(newLine+indentation);}
if(startNewLine){xhtml=newLine+indentation+xhtml;}}
return xhtml;case nodeTypes.CDATA_SECTION_NODE:return"<![CDA"+"TA["+rootNode.nodeValue+"]"+"]>"+newLine;case nodeTypes.DOCUMENT_NODE:xhtml="";for(i=0,len=rootNode.childNodes.length;i<len;i++){xhtml+=getXhtml(rootNode.childNodes[i],true,indentation);}
return xhtml;default:return"";}}else{xhtml="";for(i=0,len=rootNode.childNodes.length;i<len;i++){xhtml+=getXhtml(rootNode.childNodes[i],true,indentation+indentationUnit);}
return xhtml;}}
function createCommandLineFunctions(){ConsoleAppender.addGlobalCommandLineFunction("$",function(appender,args,returnValue){return document.getElementById(args[0]);});ConsoleAppender.addGlobalCommandLineFunction("dir",function(appender,args,returnValue){var lines=[];for(var i=0,len=args.length;i<len;i++){lines[i]=dir(args[i]);}
return lines.join(newLine+newLine);});ConsoleAppender.addGlobalCommandLineFunction("dirxml",function(appender,args,returnValue){var lines=[];for(var i=0,len=args.length;i<len;i++){lines[i]=getXhtml(args[i]);}
return lines.join(newLine+newLine);});ConsoleAppender.addGlobalCommandLineFunction("cd",function(appender,args,returnValue){var win,message;if(args.length===0||args[0]===""){win=window;message="Command line set to run in main window";}else{if(args[0].window==args[0]){win=args[0];message="Command line set to run in frame '"+args[0].name+"'";}else{win=window.frames[args[0]];if(win){message="Command line set to run in frame '"+args[0]+"'";}else{returnValue.isError=true;message="Frame '"+args[0]+"' does not exist";win=appender.getCommandWindow();}}}
appender.setCommandWindow(win);return message;});ConsoleAppender.addGlobalCommandLineFunction("clear",function(appender,args,returnValue){returnValue.appendResult=false;appender.clear();});ConsoleAppender.addGlobalCommandLineFunction("keys",function(appender,args,returnValue){var keys=[];for(var k in args[0]){keys.push(k);}
return keys;});ConsoleAppender.addGlobalCommandLineFunction("values",function(appender,args,returnValue){var values=[];for(var k in args[0]){try{values.push(args[0][k]);}catch(ex){logLog.warn("values(): Unable to obtain value for key "+k+". Details: "+getExceptionMessage(ex));}}
return values;});ConsoleAppender.addGlobalCommandLineFunction("expansionDepth",function(appender,args,returnValue){var expansionDepth=parseInt(args[0],10);if(isNaN(expansionDepth)||expansionDepth<0){returnValue.isError=true;return""+args[0]+" is not a valid expansion depth";}else{appender.setCommandLineObjectExpansionDepth(expansionDepth);return"Object expansion depth set to "+expansionDepth;}});}
function init(){createCommandLineFunctions();}
init();})();function createDefaultLogger(){var logger=log4javascript.getLogger(defaultLoggerName);var a=new log4javascript.PopUpAppender();logger.addAppender(a);return logger;}
log4javascript.setDocumentReady=function(){pageLoaded=true;log4javascript.dispatchEvent("load",{});};if(window.addEventListener){window.addEventListener("load",log4javascript.setDocumentReady,false);}else if(window.attachEvent){window.attachEvent("onload",log4javascript.setDocumentReady);}else{var oldOnload=window.onload;if(typeof window.onload!="function"){window.onload=log4javascript.setDocumentReady;}else{window.onload=function(evt){if(oldOnload){oldOnload(evt);}
log4javascript.setDocumentReady();};}}
return log4javascript;},this);

},{}],64:[function(_dereq_,module,exports){
!function(t,r){"object"==typeof exports&&"object"==typeof module?module.exports=r():"function"==typeof define&&define.amd?define([],r):"object"==typeof exports?exports.MessageFormat=r():t.MessageFormat=r()}(this,function(){return function(t){var r={};function e(n){if(r[n])return r[n].exports;var o=r[n]={i:n,l:!1,exports:{}};return t[n].call(o.exports,o,o.exports,e),o.l=!0,o.exports}return e.m=t,e.c=r,e.d=function(t,r,n){e.o(t,r)||Object.defineProperty(t,r,{enumerable:!0,get:n})},e.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},e.t=function(t,r){if(1&r&&(t=e(t)),8&r)return t;if(4&r&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(e.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&r&&"string"!=typeof t)for(var o in t)e.d(n,o,function(r){return t[r]}.bind(null,o));return n},e.n=function(t){var r=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(r,"a",r),r},e.o=function(t,r){return Object.prototype.hasOwnProperty.call(t,r)},e.p="",e(e.s=8)}([function(t,r,e){var n,o;void 0===(o="function"==typeof(n={af:function(t,r){return r?"other":1==t?"one":"other"},ak:function(t,r){return r?"other":0==t||1==t?"one":"other"},am:function(t,r){return r?"other":t>=0&&t<=1?"one":"other"},ar:function(t,r){var e=String(t).split("."),n=Number(e[0])==t,o=n&&e[0].slice(-2);return r?"other":0==t?"zero":1==t?"one":2==t?"two":o>=3&&o<=10?"few":o>=11&&o<=99?"many":"other"},ars:function(t,r){var e=String(t).split("."),n=Number(e[0])==t,o=n&&e[0].slice(-2);return r?"other":0==t?"zero":1==t?"one":2==t?"two":o>=3&&o<=10?"few":o>=11&&o<=99?"many":"other"},as:function(t,r){return r?1==t||5==t||7==t||8==t||9==t||10==t?"one":2==t||3==t?"two":4==t?"few":6==t?"many":"other":t>=0&&t<=1?"one":"other"},asa:function(t,r){return r?"other":1==t?"one":"other"},ast:function(t,r){var e=String(t).split("."),n=!e[1];return r?"other":1==t&&n?"one":"other"},az:function(t,r){var e=String(t).split("."),n=e[0],o=n.slice(-1),i=n.slice(-2),u=n.slice(-3);return r?1==o||2==o||5==o||7==o||8==o||20==i||50==i||70==i||80==i?"one":3==o||4==o||100==u||200==u||300==u||400==u||500==u||600==u||700==u||800==u||900==u?"few":0==n||6==o||40==i||60==i||90==i?"many":"other":1==t?"one":"other"},be:function(t,r){var e=String(t).split("."),n=Number(e[0])==t,o=n&&e[0].slice(-1),i=n&&e[0].slice(-2);return r?2!=o&&3!=o||12==i||13==i?"other":"few":1==o&&11!=i?"one":o>=2&&o<=4&&(i<12||i>14)?"few":n&&0==o||o>=5&&o<=9||i>=11&&i<=14?"many":"other"},bem:function(t,r){return r?"other":1==t?"one":"other"},bez:function(t,r){return r?"other":1==t?"one":"other"},bg:function(t,r){return r?"other":1==t?"one":"other"},bh:function(t,r){return r?"other":0==t||1==t?"one":"other"},bm:function(t,r){return"other"},bn:function(t,r){return r?1==t||5==t||7==t||8==t||9==t||10==t?"one":2==t||3==t?"two":4==t?"few":6==t?"many":"other":t>=0&&t<=1?"one":"other"},bo:function(t,r){return"other"},br:function(t,r){var e=String(t).split("."),n=Number(e[0])==t,o=n&&e[0].slice(-1),i=n&&e[0].slice(-2),u=n&&e[0].slice(-6);return r?"other":1==o&&11!=i&&71!=i&&91!=i?"one":2==o&&12!=i&&72!=i&&92!=i?"two":(3==o||4==o||9==o)&&(i<10||i>19)&&(i<70||i>79)&&(i<90||i>99)?"few":0!=t&&n&&0==u?"many":"other"},brx:function(t,r){return r?"other":1==t?"one":"other"},bs:function(t,r){var e=String(t).split("."),n=e[0],o=e[1]||"",i=!e[1],u=n.slice(-1),a=n.slice(-2),c=o.slice(-1),h=o.slice(-2);return r?"other":i&&1==u&&11!=a||1==c&&11!=h?"one":i&&u>=2&&u<=4&&(a<12||a>14)||c>=2&&c<=4&&(h<12||h>14)?"few":"other"},ca:function(t,r){var e=String(t).split("."),n=!e[1];return r?1==t||3==t?"one":2==t?"two":4==t?"few":"other":1==t&&n?"one":"other"},ce:function(t,r){return r?"other":1==t?"one":"other"},cgg:function(t,r){return r?"other":1==t?"one":"other"},chr:function(t,r){return r?"other":1==t?"one":"other"},ckb:function(t,r){return r?"other":1==t?"one":"other"},cs:function(t,r){var e=String(t).split("."),n=e[0],o=!e[1];return r?"other":1==t&&o?"one":n>=2&&n<=4&&o?"few":o?"other":"many"},cy:function(t,r){return r?0==t||7==t||8==t||9==t?"zero":1==t?"one":2==t?"two":3==t||4==t?"few":5==t||6==t?"many":"other":0==t?"zero":1==t?"one":2==t?"two":3==t?"few":6==t?"many":"other"},da:function(t,r){var e=String(t).split("."),n=e[0],o=Number(e[0])==t;return r?"other":1!=t&&(o||0!=n&&1!=n)?"other":"one"},de:function(t,r){var e=String(t).split("."),n=!e[1];return r?"other":1==t&&n?"one":"other"},dsb:function(t,r){var e=String(t).split("."),n=e[0],o=e[1]||"",i=!e[1],u=n.slice(-2),a=o.slice(-2);return r?"other":i&&1==u||1==a?"one":i&&2==u||2==a?"two":i&&(3==u||4==u)||3==a||4==a?"few":"other"},dv:function(t,r){return r?"other":1==t?"one":"other"},dz:function(t,r){return"other"},ee:function(t,r){return r?"other":1==t?"one":"other"},el:function(t,r){return r?"other":1==t?"one":"other"},en:function(t,r){var e=String(t).split("."),n=!e[1],o=Number(e[0])==t,i=o&&e[0].slice(-1),u=o&&e[0].slice(-2);return r?1==i&&11!=u?"one":2==i&&12!=u?"two":3==i&&13!=u?"few":"other":1==t&&n?"one":"other"},eo:function(t,r){return r?"other":1==t?"one":"other"},es:function(t,r){return r?"other":1==t?"one":"other"},et:function(t,r){var e=String(t).split("."),n=!e[1];return r?"other":1==t&&n?"one":"other"},eu:function(t,r){return r?"other":1==t?"one":"other"},fa:function(t,r){return r?"other":t>=0&&t<=1?"one":"other"},ff:function(t,r){return r?"other":t>=0&&t<2?"one":"other"},fi:function(t,r){var e=String(t).split("."),n=!e[1];return r?"other":1==t&&n?"one":"other"},fil:function(t,r){var e=String(t).split("."),n=e[0],o=e[1]||"",i=!e[1],u=n.slice(-1),a=o.slice(-1);return r?1==t?"one":"other":i&&(1==n||2==n||3==n)||i&&4!=u&&6!=u&&9!=u||!i&&4!=a&&6!=a&&9!=a?"one":"other"},fo:function(t,r){return r?"other":1==t?"one":"other"},fr:function(t,r){return r?1==t?"one":"other":t>=0&&t<2?"one":"other"},fur:function(t,r){return r?"other":1==t?"one":"other"},fy:function(t,r){var e=String(t).split("."),n=!e[1];return r?"other":1==t&&n?"one":"other"},ga:function(t,r){var e=String(t).split("."),n=Number(e[0])==t;return r?1==t?"one":"other":1==t?"one":2==t?"two":n&&t>=3&&t<=6?"few":n&&t>=7&&t<=10?"many":"other"},gd:function(t,r){var e=String(t).split("."),n=Number(e[0])==t;return r?1==t||11==t?"one":2==t||12==t?"two":3==t||13==t?"few":"other":1==t||11==t?"one":2==t||12==t?"two":n&&t>=3&&t<=10||n&&t>=13&&t<=19?"few":"other"},gl:function(t,r){var e=String(t).split("."),n=!e[1];return r?"other":1==t&&n?"one":"other"},gsw:function(t,r){return r?"other":1==t?"one":"other"},gu:function(t,r){return r?1==t?"one":2==t||3==t?"two":4==t?"few":6==t?"many":"other":t>=0&&t<=1?"one":"other"},guw:function(t,r){return r?"other":0==t||1==t?"one":"other"},gv:function(t,r){var e=String(t).split("."),n=e[0],o=!e[1],i=n.slice(-1),u=n.slice(-2);return r?"other":o&&1==i?"one":o&&2==i?"two":!o||0!=u&&20!=u&&40!=u&&60!=u&&80!=u?o?"other":"many":"few"},ha:function(t,r){return r?"other":1==t?"one":"other"},haw:function(t,r){return r?"other":1==t?"one":"other"},he:function(t,r){var e=String(t).split("."),n=e[0],o=!e[1],i=Number(e[0])==t,u=i&&e[0].slice(-1);return r?"other":1==t&&o?"one":2==n&&o?"two":o&&(t<0||t>10)&&i&&0==u?"many":"other"},hi:function(t,r){return r?1==t?"one":2==t||3==t?"two":4==t?"few":6==t?"many":"other":t>=0&&t<=1?"one":"other"},hr:function(t,r){var e=String(t).split("."),n=e[0],o=e[1]||"",i=!e[1],u=n.slice(-1),a=n.slice(-2),c=o.slice(-1),h=o.slice(-2);return r?"other":i&&1==u&&11!=a||1==c&&11!=h?"one":i&&u>=2&&u<=4&&(a<12||a>14)||c>=2&&c<=4&&(h<12||h>14)?"few":"other"},hsb:function(t,r){var e=String(t).split("."),n=e[0],o=e[1]||"",i=!e[1],u=n.slice(-2),a=o.slice(-2);return r?"other":i&&1==u||1==a?"one":i&&2==u||2==a?"two":i&&(3==u||4==u)||3==a||4==a?"few":"other"},hu:function(t,r){return r?1==t||5==t?"one":"other":1==t?"one":"other"},hy:function(t,r){return r?1==t?"one":"other":t>=0&&t<2?"one":"other"},ia:function(t,r){var e=String(t).split("."),n=!e[1];return r?"other":1==t&&n?"one":"other"},id:function(t,r){return"other"},ig:function(t,r){return"other"},ii:function(t,r){return"other"},in:function(t,r){return"other"},io:function(t,r){var e=String(t).split("."),n=!e[1];return r?"other":1==t&&n?"one":"other"},is:function(t,r){var e=String(t).split("."),n=e[0],o=Number(e[0])==t,i=n.slice(-1),u=n.slice(-2);return r?"other":o&&1==i&&11!=u||!o?"one":"other"},it:function(t,r){var e=String(t).split("."),n=!e[1];return r?11==t||8==t||80==t||800==t?"many":"other":1==t&&n?"one":"other"},iu:function(t,r){return r?"other":1==t?"one":2==t?"two":"other"},iw:function(t,r){var e=String(t).split("."),n=e[0],o=!e[1],i=Number(e[0])==t,u=i&&e[0].slice(-1);return r?"other":1==t&&o?"one":2==n&&o?"two":o&&(t<0||t>10)&&i&&0==u?"many":"other"},ja:function(t,r){return"other"},jbo:function(t,r){return"other"},jgo:function(t,r){return r?"other":1==t?"one":"other"},ji:function(t,r){var e=String(t).split("."),n=!e[1];return r?"other":1==t&&n?"one":"other"},jmc:function(t,r){return r?"other":1==t?"one":"other"},jv:function(t,r){return"other"},jw:function(t,r){return"other"},ka:function(t,r){var e=String(t).split("."),n=e[0],o=n.slice(-2);return r?1==n?"one":0==n||o>=2&&o<=20||40==o||60==o||80==o?"many":"other":1==t?"one":"other"},kab:function(t,r){return r?"other":t>=0&&t<2?"one":"other"},kaj:function(t,r){return r?"other":1==t?"one":"other"},kcg:function(t,r){return r?"other":1==t?"one":"other"},kde:function(t,r){return"other"},kea:function(t,r){return"other"},kk:function(t,r){var e=String(t).split("."),n=Number(e[0])==t,o=n&&e[0].slice(-1);return r?6==o||9==o||n&&0==o&&0!=t?"many":"other":1==t?"one":"other"},kkj:function(t,r){return r?"other":1==t?"one":"other"},kl:function(t,r){return r?"other":1==t?"one":"other"},km:function(t,r){return"other"},kn:function(t,r){return r?"other":t>=0&&t<=1?"one":"other"},ko:function(t,r){return"other"},ks:function(t,r){return r?"other":1==t?"one":"other"},ksb:function(t,r){return r?"other":1==t?"one":"other"},ksh:function(t,r){return r?"other":0==t?"zero":1==t?"one":"other"},ku:function(t,r){return r?"other":1==t?"one":"other"},kw:function(t,r){return r?"other":1==t?"one":2==t?"two":"other"},ky:function(t,r){return r?"other":1==t?"one":"other"},lag:function(t,r){var e=String(t).split("."),n=e[0];return r?"other":0==t?"zero":0!=n&&1!=n||0==t?"other":"one"},lb:function(t,r){return r?"other":1==t?"one":"other"},lg:function(t,r){return r?"other":1==t?"one":"other"},lkt:function(t,r){return"other"},ln:function(t,r){return r?"other":0==t||1==t?"one":"other"},lo:function(t,r){return r&&1==t?"one":"other"},lt:function(t,r){var e=String(t).split("."),n=e[1]||"",o=Number(e[0])==t,i=o&&e[0].slice(-1),u=o&&e[0].slice(-2);return r?"other":1==i&&(u<11||u>19)?"one":i>=2&&i<=9&&(u<11||u>19)?"few":0!=n?"many":"other"},lv:function(t,r){var e=String(t).split("."),n=e[1]||"",o=n.length,i=Number(e[0])==t,u=i&&e[0].slice(-1),a=i&&e[0].slice(-2),c=n.slice(-2),h=n.slice(-1);return r?"other":i&&0==u||a>=11&&a<=19||2==o&&c>=11&&c<=19?"zero":1==u&&11!=a||2==o&&1==h&&11!=c||2!=o&&1==h?"one":"other"},mas:function(t,r){return r?"other":1==t?"one":"other"},mg:function(t,r){return r?"other":0==t||1==t?"one":"other"},mgo:function(t,r){return r?"other":1==t?"one":"other"},mk:function(t,r){var e=String(t).split("."),n=e[0],o=e[1]||"",i=!e[1],u=n.slice(-1),a=n.slice(-2),c=o.slice(-1),h=o.slice(-2);return r?1==u&&11!=a?"one":2==u&&12!=a?"two":7!=u&&8!=u||17==a||18==a?"other":"many":i&&1==u&&11!=a||1==c&&11!=h?"one":"other"},ml:function(t,r){return r?"other":1==t?"one":"other"},mn:function(t,r){return r?"other":1==t?"one":"other"},mo:function(t,r){var e=String(t).split("."),n=!e[1],o=Number(e[0])==t,i=o&&e[0].slice(-2);return r?1==t?"one":"other":1==t&&n?"one":!n||0==t||1!=t&&i>=1&&i<=19?"few":"other"},mr:function(t,r){return r?1==t?"one":2==t||3==t?"two":4==t?"few":"other":t>=0&&t<=1?"one":"other"},ms:function(t,r){return r&&1==t?"one":"other"},mt:function(t,r){var e=String(t).split("."),n=Number(e[0])==t,o=n&&e[0].slice(-2);return r?"other":1==t?"one":0==t||o>=2&&o<=10?"few":o>=11&&o<=19?"many":"other"},my:function(t,r){return"other"},nah:function(t,r){return r?"other":1==t?"one":"other"},naq:function(t,r){return r?"other":1==t?"one":2==t?"two":"other"},nb:function(t,r){return r?"other":1==t?"one":"other"},nd:function(t,r){return r?"other":1==t?"one":"other"},ne:function(t,r){var e=String(t).split("."),n=Number(e[0])==t;return r?n&&t>=1&&t<=4?"one":"other":1==t?"one":"other"},nl:function(t,r){var e=String(t).split("."),n=!e[1];return r?"other":1==t&&n?"one":"other"},nn:function(t,r){return r?"other":1==t?"one":"other"},nnh:function(t,r){return r?"other":1==t?"one":"other"},no:function(t,r){return r?"other":1==t?"one":"other"},nqo:function(t,r){return"other"},nr:function(t,r){return r?"other":1==t?"one":"other"},nso:function(t,r){return r?"other":0==t||1==t?"one":"other"},ny:function(t,r){return r?"other":1==t?"one":"other"},nyn:function(t,r){return r?"other":1==t?"one":"other"},om:function(t,r){return r?"other":1==t?"one":"other"},or:function(t,r){var e=String(t).split("."),n=Number(e[0])==t;return r?1==t||5==t||n&&t>=7&&t<=9?"one":2==t||3==t?"two":4==t?"few":6==t?"many":"other":1==t?"one":"other"},os:function(t,r){return r?"other":1==t?"one":"other"},pa:function(t,r){return r?"other":0==t||1==t?"one":"other"},pap:function(t,r){return r?"other":1==t?"one":"other"},pl:function(t,r){var e=String(t).split("."),n=e[0],o=!e[1],i=n.slice(-1),u=n.slice(-2);return r?"other":1==t&&o?"one":o&&i>=2&&i<=4&&(u<12||u>14)?"few":o&&1!=n&&(0==i||1==i)||o&&i>=5&&i<=9||o&&u>=12&&u<=14?"many":"other"},prg:function(t,r){var e=String(t).split("."),n=e[1]||"",o=n.length,i=Number(e[0])==t,u=i&&e[0].slice(-1),a=i&&e[0].slice(-2),c=n.slice(-2),h=n.slice(-1);return r?"other":i&&0==u||a>=11&&a<=19||2==o&&c>=11&&c<=19?"zero":1==u&&11!=a||2==o&&1==h&&11!=c||2!=o&&1==h?"one":"other"},ps:function(t,r){return r?"other":1==t?"one":"other"},pt:function(t,r){var e=String(t).split("."),n=e[0];return r?"other":0==n||1==n?"one":"other"},"pt-PT":function(t,r){var e=String(t).split("."),n=!e[1];return r?"other":1==t&&n?"one":"other"},rm:function(t,r){return r?"other":1==t?"one":"other"},ro:function(t,r){var e=String(t).split("."),n=!e[1],o=Number(e[0])==t,i=o&&e[0].slice(-2);return r?1==t?"one":"other":1==t&&n?"one":!n||0==t||1!=t&&i>=1&&i<=19?"few":"other"},rof:function(t,r){return r?"other":1==t?"one":"other"},root:function(t,r){return"other"},ru:function(t,r){var e=String(t).split("."),n=e[0],o=!e[1],i=n.slice(-1),u=n.slice(-2);return r?"other":o&&1==i&&11!=u?"one":o&&i>=2&&i<=4&&(u<12||u>14)?"few":o&&0==i||o&&i>=5&&i<=9||o&&u>=11&&u<=14?"many":"other"},rwk:function(t,r){return r?"other":1==t?"one":"other"},sah:function(t,r){return"other"},saq:function(t,r){return r?"other":1==t?"one":"other"},sc:function(t,r){var e=String(t).split("."),n=!e[1];return r?11==t||8==t||80==t||800==t?"many":"other":1==t&&n?"one":"other"},scn:function(t,r){var e=String(t).split("."),n=!e[1];return r?11==t||8==t||80==t||800==t?"many":"other":1==t&&n?"one":"other"},sd:function(t,r){return r?"other":1==t?"one":"other"},sdh:function(t,r){return r?"other":1==t?"one":"other"},se:function(t,r){return r?"other":1==t?"one":2==t?"two":"other"},seh:function(t,r){return r?"other":1==t?"one":"other"},ses:function(t,r){return"other"},sg:function(t,r){return"other"},sh:function(t,r){var e=String(t).split("."),n=e[0],o=e[1]||"",i=!e[1],u=n.slice(-1),a=n.slice(-2),c=o.slice(-1),h=o.slice(-2);return r?"other":i&&1==u&&11!=a||1==c&&11!=h?"one":i&&u>=2&&u<=4&&(a<12||a>14)||c>=2&&c<=4&&(h<12||h>14)?"few":"other"},shi:function(t,r){var e=String(t).split("."),n=Number(e[0])==t;return r?"other":t>=0&&t<=1?"one":n&&t>=2&&t<=10?"few":"other"},si:function(t,r){var e=String(t).split("."),n=e[0],o=e[1]||"";return r?"other":0==t||1==t||0==n&&1==o?"one":"other"},sk:function(t,r){var e=String(t).split("."),n=e[0],o=!e[1];return r?"other":1==t&&o?"one":n>=2&&n<=4&&o?"few":o?"other":"many"},sl:function(t,r){var e=String(t).split("."),n=e[0],o=!e[1],i=n.slice(-2);return r?"other":o&&1==i?"one":o&&2==i?"two":o&&(3==i||4==i)||!o?"few":"other"},sma:function(t,r){return r?"other":1==t?"one":2==t?"two":"other"},smi:function(t,r){return r?"other":1==t?"one":2==t?"two":"other"},smj:function(t,r){return r?"other":1==t?"one":2==t?"two":"other"},smn:function(t,r){return r?"other":1==t?"one":2==t?"two":"other"},sms:function(t,r){return r?"other":1==t?"one":2==t?"two":"other"},sn:function(t,r){return r?"other":1==t?"one":"other"},so:function(t,r){return r?"other":1==t?"one":"other"},sq:function(t,r){var e=String(t).split("."),n=Number(e[0])==t,o=n&&e[0].slice(-1),i=n&&e[0].slice(-2);return r?1==t?"one":4==o&&14!=i?"many":"other":1==t?"one":"other"},sr:function(t,r){var e=String(t).split("."),n=e[0],o=e[1]||"",i=!e[1],u=n.slice(-1),a=n.slice(-2),c=o.slice(-1),h=o.slice(-2);return r?"other":i&&1==u&&11!=a||1==c&&11!=h?"one":i&&u>=2&&u<=4&&(a<12||a>14)||c>=2&&c<=4&&(h<12||h>14)?"few":"other"},ss:function(t,r){return r?"other":1==t?"one":"other"},ssy:function(t,r){return r?"other":1==t?"one":"other"},st:function(t,r){return r?"other":1==t?"one":"other"},sv:function(t,r){var e=String(t).split("."),n=!e[1],o=Number(e[0])==t,i=o&&e[0].slice(-1),u=o&&e[0].slice(-2);return r?1!=i&&2!=i||11==u||12==u?"other":"one":1==t&&n?"one":"other"},sw:function(t,r){var e=String(t).split("."),n=!e[1];return r?"other":1==t&&n?"one":"other"},syr:function(t,r){return r?"other":1==t?"one":"other"},ta:function(t,r){return r?"other":1==t?"one":"other"},te:function(t,r){return r?"other":1==t?"one":"other"},teo:function(t,r){return r?"other":1==t?"one":"other"},th:function(t,r){return"other"},ti:function(t,r){return r?"other":0==t||1==t?"one":"other"},tig:function(t,r){return r?"other":1==t?"one":"other"},tk:function(t,r){var e=String(t).split("."),n=Number(e[0])==t,o=n&&e[0].slice(-1);return r?6==o||9==o||10==t?"few":"other":1==t?"one":"other"},tl:function(t,r){var e=String(t).split("."),n=e[0],o=e[1]||"",i=!e[1],u=n.slice(-1),a=o.slice(-1);return r?1==t?"one":"other":i&&(1==n||2==n||3==n)||i&&4!=u&&6!=u&&9!=u||!i&&4!=a&&6!=a&&9!=a?"one":"other"},tn:function(t,r){return r?"other":1==t?"one":"other"},to:function(t,r){return"other"},tr:function(t,r){return r?"other":1==t?"one":"other"},ts:function(t,r){return r?"other":1==t?"one":"other"},tzm:function(t,r){var e=String(t).split("."),n=Number(e[0])==t;return r?"other":0==t||1==t||n&&t>=11&&t<=99?"one":"other"},ug:function(t,r){return r?"other":1==t?"one":"other"},uk:function(t,r){var e=String(t).split("."),n=e[0],o=!e[1],i=Number(e[0])==t,u=i&&e[0].slice(-1),a=i&&e[0].slice(-2),c=n.slice(-1),h=n.slice(-2);return r?3==u&&13!=a?"few":"other":o&&1==c&&11!=h?"one":o&&c>=2&&c<=4&&(h<12||h>14)?"few":o&&0==c||o&&c>=5&&c<=9||o&&h>=11&&h<=14?"many":"other"},ur:function(t,r){var e=String(t).split("."),n=!e[1];return r?"other":1==t&&n?"one":"other"},uz:function(t,r){return r?"other":1==t?"one":"other"},ve:function(t,r){return r?"other":1==t?"one":"other"},vi:function(t,r){return r&&1==t?"one":"other"},vo:function(t,r){return r?"other":1==t?"one":"other"},vun:function(t,r){return r?"other":1==t?"one":"other"},wa:function(t,r){return r?"other":0==t||1==t?"one":"other"},wae:function(t,r){return r?"other":1==t?"one":"other"},wo:function(t,r){return"other"},xh:function(t,r){return r?"other":1==t?"one":"other"},xog:function(t,r){return r?"other":1==t?"one":"other"},yi:function(t,r){var e=String(t).split("."),n=!e[1];return r?"other":1==t&&n?"one":"other"},yo:function(t,r){return"other"},yue:function(t,r){return"other"},zh:function(t,r){return"other"},zu:function(t,r){return r?"other":t>=0&&t<=1?"one":"other"}})?n.call(r,e,r,t):n)||(t.exports=o)},function(t,r,e){t.exports={date:e(4),duration:e(5),number:e(6),time:e(7)}},function(t,r,e){"use strict";function n(t,r,e,o){this.message=t,this.expected=r,this.found=e,this.location=o,this.name="SyntaxError","function"==typeof Error.captureStackTrace&&Error.captureStackTrace(this,n)}!function(t,r){function e(){this.constructor=t}e.prototype=r.prototype,t.prototype=new e}(n,Error),n.buildMessage=function(t,r){var e={literal:function(t){return'"'+o(t.text)+'"'},class:function(t){var r,e="";for(r=0;r<t.parts.length;r++)e+=t.parts[r]instanceof Array?i(t.parts[r][0])+"-"+i(t.parts[r][1]):i(t.parts[r]);return"["+(t.inverted?"^":"")+e+"]"},any:function(t){return"any character"},end:function(t){return"end of input"},other:function(t){return t.description}};function n(t){return t.charCodeAt(0).toString(16).toUpperCase()}function o(t){return t.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\0/g,"\\0").replace(/\t/g,"\\t").replace(/\n/g,"\\n").replace(/\r/g,"\\r").replace(/[\x00-\x0F]/g,function(t){return"\\x0"+n(t)}).replace(/[\x10-\x1F\x7F-\x9F]/g,function(t){return"\\x"+n(t)})}function i(t){return t.replace(/\\/g,"\\\\").replace(/\]/g,"\\]").replace(/\^/g,"\\^").replace(/-/g,"\\-").replace(/\0/g,"\\0").replace(/\t/g,"\\t").replace(/\n/g,"\\n").replace(/\r/g,"\\r").replace(/[\x00-\x0F]/g,function(t){return"\\x0"+n(t)}).replace(/[\x10-\x1F\x7F-\x9F]/g,function(t){return"\\x"+n(t)})}return"Expected "+function(t){var r,n,o,i=new Array(t.length);for(r=0;r<t.length;r++)i[r]=(o=t[r],e[o.type](o));if(i.sort(),i.length>0){for(r=1,n=1;r<i.length;r++)i[r-1]!==i[r]&&(i[n]=i[r],n++);i.length=n}switch(i.length){case 1:return i[0];case 2:return i[0]+" or "+i[1];default:return i.slice(0,-1).join(", ")+", or "+i[i.length-1]}}(t)+" but "+function(t){return t?'"'+o(t)+'"':"end of input"}(r)+" found."},t.exports={SyntaxError:n,parse:function(t,r){r=void 0!==r?r:{};var e,o={},i={start:tr},u=tr,a="#",c=It("#",!1),h=function(){return pr[0]},f=function(){return{type:"octothorpe"}},s=function(t){return t.join("")},l="{",p=It("{",!1),m="}",d=It("}",!1),y=function(t){return{type:"argument",arg:t}},g=",",v=It(",",!1),w="select",b=It("select",!1),S=function(t,e){return r.strict&&pr.unshift(!1),e},k=function(t,e){return r.strict&&pr.shift(),{type:"select",arg:t,cases:e}},x="plural",A=It("plural",!1),j="selectordinal",N=It("selectordinal",!1),C=function(t,r){return pr.unshift(!0),r},F=function(t,e,n,o){var i=("selectordinal"===e?r.ordinal:r.cardinal)||["zero","one","two","few","many","other"];return i&&i.length&&o.forEach(function(r){if(isNaN(r.key)&&i.indexOf(r.key)<0)throw new Error("Invalid key `"+r.key+"` for argument `"+t+"`. Valid "+e+" keys for this locale are `"+i.join("`, `")+"`, and explicit keys like `=0`.")}),pr.shift(),{type:e,arg:t,offset:n||0,cases:o}},O=function(t,r,e){return{type:"function",arg:t,key:r,param:e}},E=Vt("identifier"),z=/^[^\t-\r \x85\u200E\u200F\u2028\u2029!-\/:-@[-\^`{-~\xA1-\xA7\xA9\xAB\xAC\xAE\xB0\xB1\xB6\xBB\xBF\xD7\xF7\u2010-\u2027\u2030-\u203E\u2041-\u2053\u2055-\u205E\u2190-\u245F\u2500-\u2775\u2794-\u2BFF\u2E00-\u2E7F\u3001-\u3003\u3008-\u3020\u3030\uFD3E\uFD3F\uFE45\uFE46]/,P=Yt([["\t","\r"]," ","","‎","‏","\u2028","\u2029",["!","/"],[":","@"],["[","^"],"`",["{","~"],["¡","§"],"©","«","¬","®","°","±","¶","»","¿","×","÷",["‐","‧"],["‰","‾"],["⁁","⁓"],["⁕","⁞"],["←","⑟"],["─","❵"],["➔","⯿"],["⸀","⹿"],["、","〃"],["〈","〠"],"〰","﴾","﴿","﹅","﹆"],!0,!1),L=function(t,r){return{key:t,tokens:r}},J=function(t){return t},D=Vt("plural offset"),M="offset",_=It("offset",!1),T=":",R=It(":",!1),B=function(t){return t},q="=",$=It("=",!1),K="number",G=It("number",!1),U="date",Z=It("date",!1),I="time",Y=It("time",!1),V="spellout",W=It("spellout",!1),H="ordinal",Q=It("ordinal",!1),X="duration",tt=It("duration",!1),rt=function(t){if(r.strict||/^\d/.test(t))return!1;switch(t.toLowerCase()){case"select":case"plural":case"selectordinal":return!1;default:return!0}},et=function(t){return t},nt=function(t){return!r.strict},ot=function(t){return{tokens:t}},it=function(t){return{tokens:[t.join("")]}},ut=Vt("a valid (strict) function parameter"),at=/^[^'{}]/,ct=Yt(["'","{","}"],!0,!1),ht=function(t){return t.join("")},ft="'",st=It("'",!1),lt=function(t){return t},pt=function(t){return"{"+t.join("")+"}"},mt=Vt("doubled apostrophe"),dt="''",yt=It("''",!1),gt=function(){return"'"},vt=/^[^']/,wt=Yt(["'"],!0,!1),bt="'{",St=It("'{",!1),kt=function(t){return"{"+t.join("")},xt="'}",At=It("'}",!1),jt=function(t){return"}"+t.join("")},Nt=Vt("escaped string"),Ct="'#",Ft=It("'#",!1),Ot=function(t){return"#"+t.join("")},Et=function(t){return t[0]},zt=Vt("plain char"),Pt=/^[^{}#\0-\x08\x0E-\x1F\x7F]/,Lt=Yt(["{","}","#",["\0","\b"],["",""],""],!0,!1),Jt=function(t){return!pr[0]},Dt=function(t){return t},Mt=Vt("integer"),_t=/^[0-9]/,Tt=Yt([["0","9"]],!1,!1),Rt=Vt("white space"),Bt=/^[\t-\r \x85\u200E\u200F\u2028\u2029]/,qt=Yt([["\t","\r"]," ","","‎","‏","\u2028","\u2029"],!1,!1),$t=0,Kt=[{line:1,column:1}],Gt=0,Ut=[],Zt=0;if("startRule"in r){if(!(r.startRule in i))throw new Error("Can't start parsing from rule \""+r.startRule+'".');u=i[r.startRule]}function It(t,r){return{type:"literal",text:t,ignoreCase:r}}function Yt(t,r,e){return{type:"class",parts:t,inverted:r,ignoreCase:e}}function Vt(t){return{type:"other",description:t}}function Wt(r){var e,n=Kt[r];if(n)return n;for(e=r-1;!Kt[e];)e--;for(n={line:(n=Kt[e]).line,column:n.column};e<r;)10===t.charCodeAt(e)?(n.line++,n.column=1):n.column++,e++;return Kt[r]=n,n}function Ht(t,r){var e=Wt(t),n=Wt(r);return{start:{offset:t,line:e.line,column:e.column},end:{offset:r,line:n.line,column:n.column}}}function Qt(t){$t<Gt||($t>Gt&&(Gt=$t,Ut=[]),Ut.push(t))}function Xt(t,r,e){return new n(n.buildMessage(t,r),t,r,e)}function tr(){var t,r;for(t=[],r=rr();r!==o;)t.push(r),r=rr();return t}function rr(){var r,e,n;if((r=function(){var r,e,n,i;return r=$t,123===t.charCodeAt($t)?(e=l,$t++):(e=o,0===Zt&&Qt(p)),e!==o&&lr()!==o&&(n=er())!==o&&lr()!==o?(125===t.charCodeAt($t)?(i=m,$t++):(i=o,0===Zt&&Qt(d)),i!==o?(e=y(n),r=e):($t=r,r=o)):($t=r,r=o),r}())===o&&(r=function(){var r,e,n,i,u,a,c,h,f;if(r=$t,123===t.charCodeAt($t)?(e=l,$t++):(e=o,0===Zt&&Qt(p)),e!==o)if(lr()!==o)if((n=er())!==o)if(lr()!==o)if(44===t.charCodeAt($t)?(i=g,$t++):(i=o,0===Zt&&Qt(v)),i!==o)if(lr()!==o)if($t,t.substr($t,6)===w?(u=w,$t+=6):(u=o,0===Zt&&Qt(b)),u!==o&&(u=S(n,u)),u!==o)if((u=lr())!==o)if(44===t.charCodeAt($t)?(a=g,$t++):(a=o,0===Zt&&Qt(v)),a!==o)if(lr()!==o){if(c=[],(h=nr())!==o)for(;h!==o;)c.push(h),h=nr();else c=o;c!==o&&(h=lr())!==o?(125===t.charCodeAt($t)?(f=m,$t++):(f=o,0===Zt&&Qt(d)),f!==o?(e=k(n,c),r=e):($t=r,r=o)):($t=r,r=o)}else $t=r,r=o;else $t=r,r=o;else $t=r,r=o;else $t=r,r=o;else $t=r,r=o;else $t=r,r=o;else $t=r,r=o;else $t=r,r=o;else $t=r,r=o;else $t=r,r=o;return r}())===o&&(r=function(){var r,e,n,i,u,a,c,h,f,s,y;if(r=$t,123===t.charCodeAt($t)?(e=l,$t++):(e=o,0===Zt&&Qt(p)),e!==o)if(lr()!==o)if((n=er())!==o)if(lr()!==o)if(44===t.charCodeAt($t)?(i=g,$t++):(i=o,0===Zt&&Qt(v)),i!==o)if(lr()!==o)if(u=$t,t.substr($t,6)===x?(a=x,$t+=6):(a=o,0===Zt&&Qt(A)),a===o&&(t.substr($t,13)===j?(a=j,$t+=13):(a=o,0===Zt&&Qt(N))),a!==o&&(a=C(n,a)),(u=a)!==o)if((a=lr())!==o)if(44===t.charCodeAt($t)?(c=g,$t++):(c=o,0===Zt&&Qt(v)),c!==o)if(lr()!==o)if((h=function(){var r,e,n,i,u;return Zt++,r=$t,(e=lr())!==o?(t.substr($t,6)===M?(n=M,$t+=6):(n=o,0===Zt&&Qt(_)),n!==o&&lr()!==o?(58===t.charCodeAt($t)?(i=T,$t++):(i=o,0===Zt&&Qt(R)),i!==o&&lr()!==o&&(u=sr())!==o&&lr()!==o?(e=B(u),r=e):($t=r,r=o)):($t=r,r=o)):($t=r,r=o),Zt--,r===o&&(e=o,0===Zt&&Qt(D)),r}())===o&&(h=null),h!==o){if(f=[],(s=or())!==o)for(;s!==o;)f.push(s),s=or();else f=o;f!==o&&(s=lr())!==o?(125===t.charCodeAt($t)?(y=m,$t++):(y=o,0===Zt&&Qt(d)),y!==o?(e=F(n,u,h,f),r=e):($t=r,r=o)):($t=r,r=o)}else $t=r,r=o;else $t=r,r=o;else $t=r,r=o;else $t=r,r=o;else $t=r,r=o;else $t=r,r=o;else $t=r,r=o;else $t=r,r=o;else $t=r,r=o;else $t=r,r=o;else $t=r,r=o;return r}())===o&&(r=function(){var r,e,n,i,u,a,c;return r=$t,123===t.charCodeAt($t)?(e=l,$t++):(e=o,0===Zt&&Qt(p)),e!==o&&lr()!==o&&(n=er())!==o&&lr()!==o?(44===t.charCodeAt($t)?(i=g,$t++):(i=o,0===Zt&&Qt(v)),i!==o&&lr()!==o&&(u=function(){var r,e,n,i,u;return t.substr($t,6)===K?(r=K,$t+=6):(r=o,0===Zt&&Qt(G)),r===o&&(t.substr($t,4)===U?(r=U,$t+=4):(r=o,0===Zt&&Qt(Z)),r===o&&(t.substr($t,4)===I?(r=I,$t+=4):(r=o,0===Zt&&Qt(Y)),r===o&&(t.substr($t,8)===V?(r=V,$t+=8):(r=o,0===Zt&&Qt(W)),r===o&&(t.substr($t,7)===H?(r=H,$t+=7):(r=o,0===Zt&&Qt(Q)),r===o&&(t.substr($t,8)===X?(r=X,$t+=8):(r=o,0===Zt&&Qt(tt)),r===o&&(r=$t,e=$t,Zt++,t.substr($t,6)===w?(n=w,$t+=6):(n=o,0===Zt&&Qt(b)),Zt--,n===o?e=void 0:($t=e,e=o),e!==o?(n=$t,Zt++,t.substr($t,6)===x?(i=x,$t+=6):(i=o,0===Zt&&Qt(A)),Zt--,i===o?n=void 0:($t=n,n=o),n!==o?(i=$t,Zt++,t.substr($t,13)===j?(u=j,$t+=13):(u=o,0===Zt&&Qt(N)),Zt--,u===o?i=void 0:($t=i,i=o),i!==o&&(u=er())!==o&&(rt(u)?void 0:o)!==o?(e=et(u),r=e):($t=r,r=o)):($t=r,r=o)):($t=r,r=o))))))),r}())!==o&&lr()!==o?((a=function(){var r,e,n,i,u;if(r=$t,(e=lr())!==o)if(44===t.charCodeAt($t)?(n=g,$t++):(n=o,0===Zt&&Qt(v)),n!==o){for(i=[],u=rr();u!==o;)i.push(u),u=rr();i!==o&&(u=(u=nt(i))?void 0:o)!==o?(e=ot(i),r=e):($t=r,r=o)}else $t=r,r=o;else $t=r,r=o;if(r===o)if(r=$t,(e=lr())!==o)if(44===t.charCodeAt($t)?(n=g,$t++):(n=o,0===Zt&&Qt(v)),n!==o){for(i=[],u=ur();u!==o;)i.push(u),u=ur();i!==o?(e=it(i),r=e):($t=r,r=o)}else $t=r,r=o;else $t=r,r=o;return r}())===o&&(a=null),a!==o?(125===t.charCodeAt($t)?(c=m,$t++):(c=o,0===Zt&&Qt(d)),c!==o?(e=O(n,u,a),r=e):($t=r,r=o)):($t=r,r=o)):($t=r,r=o)):($t=r,r=o),r}())===o&&(r=$t,35===t.charCodeAt($t)?(e=a,$t++):(e=o,0===Zt&&Qt(c)),e!==o&&(n=(n=h())?void 0:o)!==o?r=e=f():($t=r,r=o),r===o)){if(r=$t,e=[],(n=fr())!==o)for(;n!==o;)e.push(n),n=fr();else e=o;e!==o&&(e=s(e)),r=e}return r}function er(){var r,e,n;if(Zt++,r=$t,e=[],z.test(t.charAt($t))?(n=t.charAt($t),$t++):(n=o,0===Zt&&Qt(P)),n!==o)for(;n!==o;)e.push(n),z.test(t.charAt($t))?(n=t.charAt($t),$t++):(n=o,0===Zt&&Qt(P));else e=o;return r=e!==o?t.substring(r,$t):e,Zt--,r===o&&(e=o,0===Zt&&Qt(E)),r}function nr(){var t,r,e;return t=$t,lr()!==o&&(r=er())!==o&&lr()!==o&&(e=ir())!==o?t=L(r,e):($t=t,t=o),t}function or(){var r,e,n;return r=$t,lr()!==o&&(e=function(){var r,e,n;return(r=er())===o&&(r=$t,61===t.charCodeAt($t)?(e=q,$t++):(e=o,0===Zt&&Qt($)),e!==o&&(n=sr())!==o?(e=B(n),r=e):($t=r,r=o)),r}())!==o&&lr()!==o&&(n=ir())!==o?r=L(e,n):($t=r,r=o),r}function ir(){var r,e,n,i,u,a;if(r=$t,123===t.charCodeAt($t)?(e=l,$t++):(e=o,0===Zt&&Qt(p)),e!==o)if(n=$t,(i=lr())!==o?(u=$t,Zt++,123===t.charCodeAt($t)?(a=l,$t++):(a=o,0===Zt&&Qt(p)),Zt--,a!==o?($t=u,u=void 0):u=o,u!==o?n=i=[i,u]:($t=n,n=o)):($t=n,n=o),n===o&&(n=null),n!==o){for(i=[],u=rr();u!==o;)i.push(u),u=rr();i!==o&&(u=lr())!==o?(125===t.charCodeAt($t)?(a=m,$t++):(a=o,0===Zt&&Qt(d)),a!==o?r=e=J(i):($t=r,r=o)):($t=r,r=o)}else $t=r,r=o;else $t=r,r=o;return r}function ur(){var r,e,n,i;if(Zt++,r=$t,e=[],at.test(t.charAt($t))?(n=t.charAt($t),$t++):(n=o,0===Zt&&Qt(ct)),n!==o)for(;n!==o;)e.push(n),at.test(t.charAt($t))?(n=t.charAt($t),$t++):(n=o,0===Zt&&Qt(ct));else e=o;if(e!==o&&(e=ht(e)),(r=e)===o&&(r=ar())===o&&(r=$t,39===t.charCodeAt($t)?(e=ft,$t++):(e=o,0===Zt&&Qt(st)),e!==o&&(n=cr())!==o?(39===t.charCodeAt($t)?(i=ft,$t++):(i=o,0===Zt&&Qt(st)),i!==o?r=e=lt(n):($t=r,r=o)):($t=r,r=o),r===o))if(r=$t,123===t.charCodeAt($t)?(e=l,$t++):(e=o,0===Zt&&Qt(p)),e!==o){for(n=[],i=ur();i!==o;)n.push(i),i=ur();n!==o?(125===t.charCodeAt($t)?(i=m,$t++):(i=o,0===Zt&&Qt(d)),i!==o?r=e=pt(n):($t=r,r=o)):($t=r,r=o)}else $t=r,r=o;return Zt--,r===o&&(e=o,0===Zt&&Qt(ut)),r}function ar(){var r,e;return Zt++,r=$t,t.substr($t,2)===dt?(e=dt,$t+=2):(e=o,0===Zt&&Qt(yt)),e!==o&&(e=gt()),Zt--,(r=e)===o&&(e=o,0===Zt&&Qt(mt)),r}function cr(){var r,e,n;if((r=ar())===o){if(r=$t,e=[],vt.test(t.charAt($t))?(n=t.charAt($t),$t++):(n=o,0===Zt&&Qt(wt)),n!==o)for(;n!==o;)e.push(n),vt.test(t.charAt($t))?(n=t.charAt($t),$t++):(n=o,0===Zt&&Qt(wt));else e=o;e!==o&&(e=s(e)),r=e}return r}function hr(){var r,e,n,i,u,a;if(Zt++,(r=function(){var r,e,n,i;if(r=$t,t.substr($t,2)===bt?(e=bt,$t+=2):(e=o,0===Zt&&Qt(St)),e!==o){for(n=[],i=cr();i!==o;)n.push(i),i=cr();n!==o?(39===t.charCodeAt($t)?(i=ft,$t++):(i=o,0===Zt&&Qt(st)),i!==o?r=e=kt(n):($t=r,r=o)):($t=r,r=o)}else $t=r,r=o;if(r===o)if(r=$t,t.substr($t,2)===xt?(e=xt,$t+=2):(e=o,0===Zt&&Qt(At)),e!==o){for(n=[],i=cr();i!==o;)n.push(i),i=cr();n!==o?(39===t.charCodeAt($t)?(i=ft,$t++):(i=o,0===Zt&&Qt(st)),i!==o?r=e=jt(n):($t=r,r=o)):($t=r,r=o)}else $t=r,r=o;return r}())===o){if(r=$t,e=$t,n=$t,t.substr($t,2)===Ct?(i=Ct,$t+=2):(i=o,0===Zt&&Qt(Ft)),i!==o){for(u=[],a=cr();a!==o;)u.push(a),a=cr();u!==o?(39===t.charCodeAt($t)?(a=ft,$t++):(a=o,0===Zt&&Qt(st)),a!==o?n=i=Ot(u):($t=n,n=o)):($t=n,n=o)}else $t=n,n=o;n!==o&&(i=(i=h())?void 0:o)!==o?e=n=[n,i]:($t=e,e=o),e!==o&&(e=Et(e)),(r=e)===o&&(39===t.charCodeAt($t)?(r=ft,$t++):(r=o,0===Zt&&Qt(st)))}return Zt--,r===o&&(e=o,0===Zt&&Qt(Nt)),r}function fr(){var r,e;return(r=ar())===o&&(r=hr())===o&&(r=$t,35===t.charCodeAt($t)?(e=a,$t++):(e=o,0===Zt&&Qt(c)),e!==o&&(Jt(e)?void 0:o)!==o?r=e=Dt(e):($t=r,r=o),r===o&&(r=function(){var r;return Zt++,Pt.test(t.charAt($t))?(r=t.charAt($t),$t++):(r=o,0===Zt&&Qt(Lt)),Zt--,r===o&&0===Zt&&Qt(zt),r}())),r}function sr(){var r,e,n;if(Zt++,r=$t,e=[],_t.test(t.charAt($t))?(n=t.charAt($t),$t++):(n=o,0===Zt&&Qt(Tt)),n!==o)for(;n!==o;)e.push(n),_t.test(t.charAt($t))?(n=t.charAt($t),$t++):(n=o,0===Zt&&Qt(Tt));else e=o;return r=e!==o?t.substring(r,$t):e,Zt--,r===o&&(e=o,0===Zt&&Qt(Mt)),r}function lr(){var r,e,n;for(Zt++,r=$t,e=[],Bt.test(t.charAt($t))?(n=t.charAt($t),$t++):(n=o,0===Zt&&Qt(qt));n!==o;)e.push(n),Bt.test(t.charAt($t))?(n=t.charAt($t),$t++):(n=o,0===Zt&&Qt(qt));return r=e!==o?t.substring(r,$t):e,Zt--,r===o&&(e=o,0===Zt&&Qt(Rt)),r}var pr=[!1];if((e=u())!==o&&$t===t.length)return e;throw e!==o&&$t<t.length&&Qt({type:"end"}),Xt(Ut,Gt<t.length?t.charAt(Gt):null,Gt<t.length?Ht(Gt,Gt+1):Ht(Gt,Gt))}}},function(t,r,e){var n,o,i=[{cardinal:["other"],ordinal:["other"]},{cardinal:["one","other"],ordinal:["other"]},{cardinal:["one","other"],ordinal:["one","other"]},{cardinal:["one","two","other"],ordinal:["other"]}];void 0===(o="function"==typeof(n={af:i[1],ak:i[1],am:i[1],ar:{cardinal:["zero","one","two","few","many","other"],ordinal:["other"]},ars:{cardinal:["zero","one","two","few","many","other"],ordinal:["other"]},as:{cardinal:["one","other"],ordinal:["one","two","few","many","other"]},asa:i[1],ast:i[1],az:{cardinal:["one","other"],ordinal:["one","few","many","other"]},be:{cardinal:["one","few","many","other"],ordinal:["few","other"]},bem:i[1],bez:i[1],bg:i[1],bh:i[1],bm:i[0],bn:{cardinal:["one","other"],ordinal:["one","two","few","many","other"]},bo:i[0],br:{cardinal:["one","two","few","many","other"],ordinal:["other"]},brx:i[1],bs:{cardinal:["one","few","other"],ordinal:["other"]},ca:{cardinal:["one","other"],ordinal:["one","two","few","other"]},ce:i[1],cgg:i[1],chr:i[1],ckb:i[1],cs:{cardinal:["one","few","many","other"],ordinal:["other"]},cy:{cardinal:["zero","one","two","few","many","other"],ordinal:["zero","one","two","few","many","other"]},da:i[1],de:i[1],dsb:{cardinal:["one","two","few","other"],ordinal:["other"]},dv:i[1],dz:i[0],ee:i[1],el:i[1],en:{cardinal:["one","other"],ordinal:["one","two","few","other"]},eo:i[1],es:i[1],et:i[1],eu:i[1],fa:i[1],ff:i[1],fi:i[1],fil:i[2],fo:i[1],fr:i[2],fur:i[1],fy:i[1],ga:{cardinal:["one","two","few","many","other"],ordinal:["one","other"]},gd:{cardinal:["one","two","few","other"],ordinal:["one","two","few","other"]},gl:i[1],gsw:i[1],gu:{cardinal:["one","other"],ordinal:["one","two","few","many","other"]},guw:i[1],gv:{cardinal:["one","two","few","many","other"],ordinal:["other"]},ha:i[1],haw:i[1],he:{cardinal:["one","two","many","other"],ordinal:["other"]},hi:{cardinal:["one","other"],ordinal:["one","two","few","many","other"]},hr:{cardinal:["one","few","other"],ordinal:["other"]},hsb:{cardinal:["one","two","few","other"],ordinal:["other"]},hu:i[2],hy:i[2],ia:i[1],id:i[0],ig:i[0],ii:i[0],in:i[0],io:i[1],is:i[1],it:{cardinal:["one","other"],ordinal:["many","other"]},iu:i[3],iw:{cardinal:["one","two","many","other"],ordinal:["other"]},ja:i[0],jbo:i[0],jgo:i[1],ji:i[1],jmc:i[1],jv:i[0],jw:i[0],ka:{cardinal:["one","other"],ordinal:["one","many","other"]},kab:i[1],kaj:i[1],kcg:i[1],kde:i[0],kea:i[0],kk:{cardinal:["one","other"],ordinal:["many","other"]},kkj:i[1],kl:i[1],km:i[0],kn:i[1],ko:i[0],ks:i[1],ksb:i[1],ksh:{cardinal:["zero","one","other"],ordinal:["other"]},ku:i[1],kw:i[3],ky:i[1],lag:{cardinal:["zero","one","other"],ordinal:["other"]},lb:i[1],lg:i[1],lkt:i[0],ln:i[1],lo:{cardinal:["other"],ordinal:["one","other"]},lt:{cardinal:["one","few","many","other"],ordinal:["other"]},lv:{cardinal:["zero","one","other"],ordinal:["other"]},mas:i[1],mg:i[1],mgo:i[1],mk:{cardinal:["one","other"],ordinal:["one","two","many","other"]},ml:i[1],mn:i[1],mo:{cardinal:["one","few","other"],ordinal:["one","other"]},mr:{cardinal:["one","other"],ordinal:["one","two","few","other"]},ms:{cardinal:["other"],ordinal:["one","other"]},mt:{cardinal:["one","few","many","other"],ordinal:["other"]},my:i[0],nah:i[1],naq:i[3],nb:i[1],nd:i[1],ne:i[2],nl:i[1],nn:i[1],nnh:i[1],no:i[1],nqo:i[0],nr:i[1],nso:i[1],ny:i[1],nyn:i[1],om:i[1],or:{cardinal:["one","other"],ordinal:["one","two","few","many","other"]},os:i[1],pa:i[1],pap:i[1],pl:{cardinal:["one","few","many","other"],ordinal:["other"]},prg:{cardinal:["zero","one","other"],ordinal:["other"]},ps:i[1],pt:i[1],"pt-PT":i[1],rm:i[1],ro:{cardinal:["one","few","other"],ordinal:["one","other"]},rof:i[1],root:i[0],ru:{cardinal:["one","few","many","other"],ordinal:["other"]},rwk:i[1],sah:i[0],saq:i[1],sc:{cardinal:["one","other"],ordinal:["many","other"]},scn:{cardinal:["one","other"],ordinal:["many","other"]},sd:i[1],sdh:i[1],se:i[3],seh:i[1],ses:i[0],sg:i[0],sh:{cardinal:["one","few","other"],ordinal:["other"]},shi:{cardinal:["one","few","other"],ordinal:["other"]},si:i[1],sk:{cardinal:["one","few","many","other"],ordinal:["other"]},sl:{cardinal:["one","two","few","other"],ordinal:["other"]},sma:i[3],smi:i[3],smj:i[3],smn:i[3],sms:i[3],sn:i[1],so:i[1],sq:{cardinal:["one","other"],ordinal:["one","many","other"]},sr:{cardinal:["one","few","other"],ordinal:["other"]},ss:i[1],ssy:i[1],st:i[1],sv:i[2],sw:i[1],syr:i[1],ta:i[1],te:i[1],teo:i[1],th:i[0],ti:i[1],tig:i[1],tk:{cardinal:["one","other"],ordinal:["few","other"]},tl:i[2],tn:i[1],to:i[0],tr:i[1],ts:i[1],tzm:i[1],ug:i[1],uk:{cardinal:["one","few","many","other"],ordinal:["few","other"]},ur:i[1],uz:i[1],ve:i[1],vi:{cardinal:["other"],ordinal:["one","other"]},vo:i[1],vun:i[1],wa:i[1],wae:i[1],wo:i[0],xh:i[1],xog:i[1],yi:i[1],yo:i[0],yue:i[0],zh:i[0],zu:i[1]})?n.call(r,e,r,t):n)||(t.exports=o)},function(t,r){function e(t,r,e){var n={day:"numeric",month:"short",year:"numeric"};switch(e){case"full":n.weekday="long";case"long":n.month="long";break;case"short":n.month="numeric"}return new Date(t).toLocaleDateString(r,n)}t.exports=function(){return e}},function(t,r){function e(t){if(!isFinite(t))return String(t);var r="";t<0?(r="-",t=Math.abs(t)):t=Number(t);var e=t%60,n=[Math.round(e)===e?e:e.toFixed(3)];return t<60?n.unshift(0):(t=Math.round((t-n[0])/60),n.unshift(t%60),t>=60&&(t=Math.round((t-n[0])/60),n.unshift(t))),r+n.shift()+":"+n.map(function(t){return t<10?"0"+String(t):String(t)}).join(":")}t.exports=function(){return e}},function(t,r){t.exports=function(t){var r=function(t,r,e){var n=e&&e.split(":")||[],o={integer:{maximumFractionDigits:0},percent:{style:"percent"},currency:{style:"currency",currency:n[1]&&n[1].trim()||CURRENCY,minimumFractionDigits:2,maximumFractionDigits:2}};return new Intl.NumberFormat(r,o[n[0]]||{}).format(t)}.toString().replace("CURRENCY",JSON.stringify(t.currency||"USD")).match(/\(([^)]*)\)[^{]*{([\s\S]*)}/);return new Function(r[1],r[2])}},function(t,r){function e(t,r,e){var n={second:"numeric",minute:"numeric",hour:"numeric"};switch(e){case"full":case"long":n.timeZoneName="short";break;case"short":delete n.second}return new Date(t).toLocaleTimeString(r,n)}t.exports=function(){return e}},function(t,r,e){"use strict";e.r(r);var n=e(1),o=e.n(n),i=e(2),u={break:!0,continue:!0,delete:!0,else:!0,for:!0,function:!0,if:!0,in:!0,new:!0,return:!0,this:!0,typeof:!0,var:!0,void:!0,while:!0,with:!0,case:!0,catch:!0,default:!0,do:!0,finally:!0,instanceof:!0,switch:!0,throw:!0,try:!0},a={debugger:!0,class:!0,enum:!0,extends:!0,super:!0,const:!0,export:!0,import:!0,null:!0,true:!0,false:!0,implements:!0,let:!0,private:!0,public:!0,yield:!0,interface:!0,package:!0,protected:!0,static:!0};function c(t,r){if(/^[A-Z_$][0-9A-Z_$]*$/i.test(t)&&!u[t])return r?"".concat(r,".").concat(t):t;var e=JSON.stringify(t);return r?r+"[".concat(e,"]"):e}function h(t){var r=t.trim().replace(/\W+/g,"_");return u[r]||a[r]||/^\d/.test(r)?"_"+r:r}var f=new RegExp("^"+["ar","ckb","fa","he","ks($|[^bfh])","lrc","mzn","pa-Arab","ps","ug","ur","uz-Arab","yi"].join("|^"));function s(t){return(s="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function l(t,r){for(var e=0;e<r.length;e++){var n=r[e];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var p=function(){function t(r){!function(t,r){if(!(t instanceof r))throw new TypeError("Cannot call a class as a function")}(this,t),this.mf=r,this.lc=null,this.locales={},this.runtime={},this.formatters={}}var r,e,n;return r=t,(e=[{key:"compile",value:function(t,r,e){var n=this;if("object"!=s(t)){this.lc=r;var o=e[r]||{cardinal:[],ordinal:[]};o.strict=!!this.mf.options.strictNumberSign;var u=Object(i.parse)(t,o).map(function(t){return n.token(t)});return"function(d) { return ".concat(u.join(" + ")||'""',"; }")}var a={};for(var c in t){var h=e.hasOwnProperty(c)?c:r;a[c]=this.compile(t[c],h,e)}return a}},{key:"cases",value:function(t,r){var e=this,n="select"===t.type||!this.mf.hasCustomPluralFuncs,o=t.cases.map(function(t){var o=t.key,i=t.tokens;"other"===o&&(n=!1);var u=i.map(function(t){return e.token(t,r)});return c(o)+": "+(u.join(" + ")||'""')});if(n)throw new Error("No 'other' form found in "+JSON.stringify(t));return"{ ".concat(o.join(", ")," }")}},{key:"token",value:function(t,r){var e,n=this;if("string"==typeof t)return JSON.stringify(t);var o,i,u,a,s=[c(t.arg,"d")];switch(t.type){case"argument":return this.mf.options.biDiSupport?(o=s[0],i=this.lc,u=f.test(i),a=JSON.stringify(u?"‏":"‎"),"".concat(a," + ").concat(o," + ").concat(a)):s[0];case"select":e="select",r&&this.mf.options.strictNumberSign&&(r=null),s.push(this.cases(t,r)),this.runtime.select=!0;break;case"selectordinal":e="plural",s.push(0,h(this.lc),this.cases(t,t),1),this.locales[this.lc]=!0,this.runtime.plural=!0;break;case"plural":e="plural",s.push(t.offset||0,h(this.lc),this.cases(t,t)),this.locales[this.lc]=!0,this.runtime.plural=!0;break;case"function":if(!(t.key in this.mf.fmt)&&t.key in this.mf.constructor.formatters){var l=this.mf.constructor.formatters[t.key];this.mf.fmt[t.key]=l(this.mf)}if(!this.mf.fmt[t.key])throw new Error("Formatting function ".concat(JSON.stringify(t.key)," not found!"));if(s.push(JSON.stringify(this.lc)),t.param){r&&this.mf.options.strictNumberSign&&(r=null);var p=t.param.tokens.map(function(t){return n.token(t,r)});s.push("("+(p.join(" + ")||'""')+").trim()")}e=c(t.key,"fmt"),this.formatters[t.key]=!0;break;case"octothorpe":if(!r)return'"#"';e="number",s=[c(r.arg,"d"),JSON.stringify(r.arg)],r.offset&&s.push(r.offset),this.runtime.number=!0}if(!e)throw new Error("Parser error for token "+JSON.stringify(t));return"".concat(e,"(").concat(s.join(", "),")")}}])&&l(r.prototype,e),n&&l(r,n),t}(),m=e(3),d=e.n(m),y=e(0),g=e.n(y);function v(t,r,e){var n=function(){return r.apply(this,arguments)};if(n.toString=function(){return r.toString()},e){var o=d.a[t]||{};n.cardinal=o.cardinal,n.ordinal=o.ordinal}else n.cardinal=[],n.ordinal=[];return n}function w(t,r){for(var e=r.pluralKeyChecks,n=String(t);n;n=n.replace(/[-_]?[^-_]*$/,"")){var o=g.a[n];if(o)return v(n,o,e)}throw new Error("Localisation function not found for locale "+JSON.stringify(t))}function b(t){return(b="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function S(t,r){for(var e=0;e<r.length;e++){var n=r[e];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var k=function(){function t(r){!function(t,r){if(!(t instanceof r))throw new TypeError("Cannot call a class as a function")}(this,t),this.plural=function(t,r,e,n,o){if({}.hasOwnProperty.call(n,t))return n[t];r&&(t-=r);var i=e(t,o);return i in n?n[i]:n.other},this.select=function(t,r){return{}.hasOwnProperty.call(r,t)?r[t]:r.other},this.mf=r,this.setStrictNumber(r.options.strictNumberSign)}var r,e,n;return r=t,(e=[{key:"setStrictNumber",value:function(r){this.number=r?t.strictNumber:t.defaultNumber}},{key:"toString",value:function(t,r){for(var e={},n=Object.keys(r.locales),o=0;o<n.length;++o){var i=n[o];e[h(i)]=t[i]}for(var u=Object.keys(r.runtime),a=0;a<u.length;++a){var f=u[a];e[f]=this[f]}var s=Object.keys(r.formatters);if(s.length>0){e.fmt={};for(var l=0;l<s.length;++l){var p=s[l];e.fmt[p]=this.mf.fmt[p]}}return function t(r,e){if("object"!=b(r)){var n=r.toString().replace(/^(function )\w*/,"$1"),o=/([ \t]*)\S.*$/.exec(n);return o?n.replace(new RegExp("^"+o[1],"mg"),""):n}var i=[];for(var u in r){var a=t(r[u],e+1);i.push(0===e?"var ".concat(u," = ").concat(a,";\n"):"".concat(c(u),": ").concat(a))}if(0===e)return i.join("");if(0===i.length)return"{}";for(var h="  ";--e;)h+="  ";var f=i.join(",\n").replace(/^/gm,h);return"{\n".concat(f,"\n}")}(e,0)}}])&&S(r.prototype,e),n&&S(r,n),t}();function x(t){return(x="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function A(t,r){for(var e=0;e<r.length;e++){var n=r[e];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}function j(t,r,e){return r&&A(t.prototype,r),e&&A(t,e),t}k.defaultNumber=function(t,r,e){if(!e)return t;if(isNaN(t))throw new Error("Can't apply offset:"+e+" to argument `"+r+"` with non-numerical value "+JSON.stringify(t)+".");return t-e},k.strictNumber=function(t,r,e){if(isNaN(t))throw new Error("Argument `"+r+"` has non-numerical value "+JSON.stringify(t)+".");return t-(e||0)},e.d(r,"default",function(){return N});var N=function(){function t(r,e){var n=this;if(function(t,r){if(!(t instanceof r))throw new TypeError("Cannot call a class as a function")}(this,t),this.options=Object.assign({biDiSupport:!1,customFormatters:null,pluralKeyChecks:!0,strictNumberSign:!1},e),this.pluralFuncs={},"string"==typeof r)this.pluralFuncs[r]=w(r,this.options),this.defaultLocale=r;else if(Array.isArray(r))r.forEach(function(t){n.pluralFuncs[t]=w(t,n.options)}),this.defaultLocale=r[0];else{if(r)for(var o=Object.keys(r),i=0;i<o.length;++i){var u=o[i];if("function"!=typeof r[u]){var a="Expected function value for locale "+String(u);throw new Error(a)}this.pluralFuncs[u]=r[u],this.defaultLocale||(this.defaultLocale=u)}this.defaultLocale?this.hasCustomPluralFuncs=!0:(this.defaultLocale=t.defaultLocale,this.hasCustomPluralFuncs=!1)}this.fmt=Object.assign({},this.options.customFormatters),this.runtime=new k(this)}return j(t,null,[{key:"escape",value:function(t,r){var e=r?/[#{}]/g:/[{}]/g;return String(t).replace(e,"'$&'")}}]),j(t,[{key:"addFormatters",value:function(t){for(var r=Object.keys(t),e=0;e<r.length;++e){var n=r[e];this.fmt[n]=t[n]}return this}},{key:"disablePluralKeyChecks",value:function(){for(var t in this.options.pluralKeyChecks=!1,this.pluralFuncs){var r=this.pluralFuncs[t];r&&(r.cardinal=[],r.ordinal=[])}return this}},{key:"setBiDiSupport",value:function(t){return this.options.biDiSupport=!!t||void 0===t,this}},{key:"setStrictNumberSign",value:function(t){return this.options.strictNumberSign=!!t||void 0===t,this.runtime.setStrictNumber(this.options.strictNumberSign),this}},{key:"compile",value:function(t,r){var e={};if(0===Object.keys(this.pluralFuncs).length)if(r){var n=w(r,this.options);if(!n){var o=JSON.stringify(r);throw new Error("Locale ".concat(o," not found!"))}e[r]=n}else r=this.defaultLocale,e=function(t){for(var r=t.pluralKeyChecks,e={},n=Object.keys(g.a),o=0;o<n.length;++o){var i=n[o];e[i]=v(i,g.a[i],r)}return e}(this.options);else if(r){var i=this.pluralFuncs[r];if(!i){var u=JSON.stringify(r),a=JSON.stringify(this.pluralFuncs);throw new Error("Locale ".concat(u," not found in ").concat(a,"!"))}e[r]=i}else r=this.defaultLocale,e=this.pluralFuncs;var f=new p(this),s=f.compile(t,r,e);if("object"!=x(t)){var l=new Function("number, plural, select, fmt",h(r),"return "+s),m=this.runtime;return l(m.number,m.plural,m.select,this.fmt,e[r])}var d=this.runtime.toString(e,f)+"\n",y=function t(r,e){if(e||(e=0),"object"!=x(r))return r;for(var n="",o=0;o<e;++o)n+="  ";var i=[];for(var u in r){var a=t(r[u],e+1);i.push("\n".concat(n,"  ").concat(c(u),": ").concat(a))}return"{".concat(i.join(","),"\n").concat(n,"}")}(s),b=new Function(d+"return "+y)();if(b.hasOwnProperty("toString"))throw new Error("The top-level message key `toString` is reserved");return b.toString=function(t){return t&&"export default"!==t?t.indexOf(".")>-1?d+t+" = "+y:d+["(function (root, G) {",'  if (typeof define === "function" && define.amd) { define(G); }','  else if (typeof exports === "object") { module.exports = G; }',"  else { "+c(t,"root")+" = G; }","})(this, "+y+");"].join("\n"):d+"export default "+y},b}}]),t}();N.defaultLocale="en",N.formatters=o.a}]).default});

},{}],65:[function(_dereq_,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],66:[function(_dereq_,module,exports){
(function (setImmediate,clearImmediate){(function (){
!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.swal=e():t.swal=e()}(this,function(){return function(t){function e(o){if(n[o])return n[o].exports;var r=n[o]={i:o,l:!1,exports:{}};return t[o].call(r.exports,r,r.exports,e),r.l=!0,r.exports}var n={};return e.m=t,e.c=n,e.d=function(t,n,o){e.o(t,n)||Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:o})},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=8)}([function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o="swal-button";e.CLASS_NAMES={MODAL:"swal-modal",OVERLAY:"swal-overlay",SHOW_MODAL:"swal-overlay--show-modal",MODAL_TITLE:"swal-title",MODAL_TEXT:"swal-text",ICON:"swal-icon",ICON_CUSTOM:"swal-icon--custom",CONTENT:"swal-content",FOOTER:"swal-footer",BUTTON_CONTAINER:"swal-button-container",BUTTON:o,CONFIRM_BUTTON:o+"--confirm",CANCEL_BUTTON:o+"--cancel",DANGER_BUTTON:o+"--danger",BUTTON_LOADING:o+"--loading",BUTTON_LOADER:o+"__loader"},e.default=e.CLASS_NAMES},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.getNode=function(t){var e="."+t;return document.querySelector(e)},e.stringToNode=function(t){var e=document.createElement("div");return e.innerHTML=t.trim(),e.firstChild},e.insertAfter=function(t,e){var n=e.nextSibling;e.parentNode.insertBefore(t,n)},e.removeNode=function(t){t.parentElement.removeChild(t)},e.throwErr=function(t){throw t=t.replace(/ +(?= )/g,""),"SweetAlert: "+(t=t.trim())},e.isPlainObject=function(t){if("[object Object]"!==Object.prototype.toString.call(t))return!1;var e=Object.getPrototypeOf(t);return null===e||e===Object.prototype},e.ordinalSuffixOf=function(t){var e=t%10,n=t%100;return 1===e&&11!==n?t+"st":2===e&&12!==n?t+"nd":3===e&&13!==n?t+"rd":t+"th"}},function(t,e,n){"use strict";function o(t){for(var n in t)e.hasOwnProperty(n)||(e[n]=t[n])}Object.defineProperty(e,"__esModule",{value:!0}),o(n(25));var r=n(26);e.overlayMarkup=r.default,o(n(27)),o(n(28)),o(n(29));var i=n(0),a=i.default.MODAL_TITLE,s=i.default.MODAL_TEXT,c=i.default.ICON,l=i.default.FOOTER;e.iconMarkup='\n  <div class="'+c+'"></div>',e.titleMarkup='\n  <div class="'+a+'"></div>\n',e.textMarkup='\n  <div class="'+s+'"></div>',e.footerMarkup='\n  <div class="'+l+'"></div>\n'},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(1);e.CONFIRM_KEY="confirm",e.CANCEL_KEY="cancel";var r={visible:!0,text:null,value:null,className:"",closeModal:!0},i=Object.assign({},r,{visible:!1,text:"Cancel",value:null}),a=Object.assign({},r,{text:"OK",value:!0});e.defaultButtonList={cancel:i,confirm:a};var s=function(t){switch(t){case e.CONFIRM_KEY:return a;case e.CANCEL_KEY:return i;default:var n=t.charAt(0).toUpperCase()+t.slice(1);return Object.assign({},r,{text:n,value:t})}},c=function(t,e){var n=s(t);return!0===e?Object.assign({},n,{visible:!0}):"string"==typeof e?Object.assign({},n,{visible:!0,text:e}):o.isPlainObject(e)?Object.assign({visible:!0},n,e):Object.assign({},n,{visible:!1})},l=function(t){for(var e={},n=0,o=Object.keys(t);n<o.length;n++){var r=o[n],a=t[r],s=c(r,a);e[r]=s}return e.cancel||(e.cancel=i),e},u=function(t){var n={};switch(t.length){case 1:n[e.CANCEL_KEY]=Object.assign({},i,{visible:!1});break;case 2:n[e.CANCEL_KEY]=c(e.CANCEL_KEY,t[0]),n[e.CONFIRM_KEY]=c(e.CONFIRM_KEY,t[1]);break;default:o.throwErr("Invalid number of 'buttons' in array ("+t.length+").\n      If you want more than 2 buttons, you need to use an object!")}return n};e.getButtonListOpts=function(t){var n=e.defaultButtonList;return"string"==typeof t?n[e.CONFIRM_KEY]=c(e.CONFIRM_KEY,t):Array.isArray(t)?n=u(t):o.isPlainObject(t)?n=l(t):!0===t?n=u([!0,!0]):!1===t?n=u([!1,!1]):void 0===t&&(n=e.defaultButtonList),n}},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(1),r=n(2),i=n(0),a=i.default.MODAL,s=i.default.OVERLAY,c=n(30),l=n(31),u=n(32),f=n(33);e.injectElIntoModal=function(t){var e=o.getNode(a),n=o.stringToNode(t);return e.appendChild(n),n};var d=function(t){t.className=a,t.textContent=""},p=function(t,e){d(t);var n=e.className;n&&t.classList.add(n)};e.initModalContent=function(t){var e=o.getNode(a);p(e,t),c.default(t.icon),l.initTitle(t.title),l.initText(t.text),f.default(t.content),u.default(t.buttons,t.dangerMode)};var m=function(){var t=o.getNode(s),e=o.stringToNode(r.modalMarkup);t.appendChild(e)};e.default=m},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(3),r={isOpen:!1,promise:null,actions:{},timer:null},i=Object.assign({},r);e.resetState=function(){i=Object.assign({},r)},e.setActionValue=function(t){if("string"==typeof t)return a(o.CONFIRM_KEY,t);for(var e in t)a(e,t[e])};var a=function(t,e){i.actions[t]||(i.actions[t]={}),Object.assign(i.actions[t],{value:e})};e.setActionOptionsFor=function(t,e){var n=(void 0===e?{}:e).closeModal,o=void 0===n||n;Object.assign(i.actions[t],{closeModal:o})},e.default=i},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(1),r=n(3),i=n(0),a=i.default.OVERLAY,s=i.default.SHOW_MODAL,c=i.default.BUTTON,l=i.default.BUTTON_LOADING,u=n(5);e.openModal=function(){o.getNode(a).classList.add(s),u.default.isOpen=!0};var f=function(){o.getNode(a).classList.remove(s),u.default.isOpen=!1};e.onAction=function(t){void 0===t&&(t=r.CANCEL_KEY);var e=u.default.actions[t],n=e.value;if(!1===e.closeModal){var i=c+"--"+t;o.getNode(i).classList.add(l)}else f();u.default.promise.resolve(n)},e.getState=function(){var t=Object.assign({},u.default);return delete t.promise,delete t.timer,t},e.stopLoading=function(){for(var t=document.querySelectorAll("."+c),e=0;e<t.length;e++){t[e].classList.remove(l)}}},function(t,e){var n;n=function(){return this}();try{n=n||Function("return this")()||(0,eval)("this")}catch(t){"object"==typeof window&&(n=window)}t.exports=n},function(t,e,n){(function(e){t.exports=e.sweetAlert=n(9)}).call(e,n(7))},function(t,e,n){(function(e){t.exports=e.swal=n(10)}).call(e,n(7))},function(t,e,n){"undefined"!=typeof window&&n(11),n(16);var o=n(23).default;t.exports=o},function(t,e,n){var o=n(12);"string"==typeof o&&(o=[[t.i,o,""]]);var r={insertAt:"top"};r.transform=void 0;n(14)(o,r);o.locals&&(t.exports=o.locals)},function(t,e,n){e=t.exports=n(13)(void 0),e.push([t.i,'.swal-icon--error{border-color:#f27474;-webkit-animation:animateErrorIcon .5s;animation:animateErrorIcon .5s}.swal-icon--error__x-mark{position:relative;display:block;-webkit-animation:animateXMark .5s;animation:animateXMark .5s}.swal-icon--error__line{position:absolute;height:5px;width:47px;background-color:#f27474;display:block;top:37px;border-radius:2px}.swal-icon--error__line--left{-webkit-transform:rotate(45deg);transform:rotate(45deg);left:17px}.swal-icon--error__line--right{-webkit-transform:rotate(-45deg);transform:rotate(-45deg);right:16px}@-webkit-keyframes animateErrorIcon{0%{-webkit-transform:rotateX(100deg);transform:rotateX(100deg);opacity:0}to{-webkit-transform:rotateX(0deg);transform:rotateX(0deg);opacity:1}}@keyframes animateErrorIcon{0%{-webkit-transform:rotateX(100deg);transform:rotateX(100deg);opacity:0}to{-webkit-transform:rotateX(0deg);transform:rotateX(0deg);opacity:1}}@-webkit-keyframes animateXMark{0%{-webkit-transform:scale(.4);transform:scale(.4);margin-top:26px;opacity:0}50%{-webkit-transform:scale(.4);transform:scale(.4);margin-top:26px;opacity:0}80%{-webkit-transform:scale(1.15);transform:scale(1.15);margin-top:-6px}to{-webkit-transform:scale(1);transform:scale(1);margin-top:0;opacity:1}}@keyframes animateXMark{0%{-webkit-transform:scale(.4);transform:scale(.4);margin-top:26px;opacity:0}50%{-webkit-transform:scale(.4);transform:scale(.4);margin-top:26px;opacity:0}80%{-webkit-transform:scale(1.15);transform:scale(1.15);margin-top:-6px}to{-webkit-transform:scale(1);transform:scale(1);margin-top:0;opacity:1}}.swal-icon--warning{border-color:#f8bb86;-webkit-animation:pulseWarning .75s infinite alternate;animation:pulseWarning .75s infinite alternate}.swal-icon--warning__body{width:5px;height:47px;top:10px;border-radius:2px;margin-left:-2px}.swal-icon--warning__body,.swal-icon--warning__dot{position:absolute;left:50%;background-color:#f8bb86}.swal-icon--warning__dot{width:7px;height:7px;border-radius:50%;margin-left:-4px;bottom:-11px}@-webkit-keyframes pulseWarning{0%{border-color:#f8d486}to{border-color:#f8bb86}}@keyframes pulseWarning{0%{border-color:#f8d486}to{border-color:#f8bb86}}.swal-icon--success{border-color:#a5dc86}.swal-icon--success:after,.swal-icon--success:before{content:"";border-radius:50%;position:absolute;width:60px;height:120px;background:#fff;-webkit-transform:rotate(45deg);transform:rotate(45deg)}.swal-icon--success:before{border-radius:120px 0 0 120px;top:-7px;left:-33px;-webkit-transform:rotate(-45deg);transform:rotate(-45deg);-webkit-transform-origin:60px 60px;transform-origin:60px 60px}.swal-icon--success:after{border-radius:0 120px 120px 0;top:-11px;left:30px;-webkit-transform:rotate(-45deg);transform:rotate(-45deg);-webkit-transform-origin:0 60px;transform-origin:0 60px;-webkit-animation:rotatePlaceholder 4.25s ease-in;animation:rotatePlaceholder 4.25s ease-in}.swal-icon--success__ring{width:80px;height:80px;border:4px solid hsla(98,55%,69%,.2);border-radius:50%;box-sizing:content-box;position:absolute;left:-4px;top:-4px;z-index:2}.swal-icon--success__hide-corners{width:5px;height:90px;background-color:#fff;padding:1px;position:absolute;left:28px;top:8px;z-index:1;-webkit-transform:rotate(-45deg);transform:rotate(-45deg)}.swal-icon--success__line{height:5px;background-color:#a5dc86;display:block;border-radius:2px;position:absolute;z-index:2}.swal-icon--success__line--tip{width:25px;left:14px;top:46px;-webkit-transform:rotate(45deg);transform:rotate(45deg);-webkit-animation:animateSuccessTip .75s;animation:animateSuccessTip .75s}.swal-icon--success__line--long{width:47px;right:8px;top:38px;-webkit-transform:rotate(-45deg);transform:rotate(-45deg);-webkit-animation:animateSuccessLong .75s;animation:animateSuccessLong .75s}@-webkit-keyframes rotatePlaceholder{0%{-webkit-transform:rotate(-45deg);transform:rotate(-45deg)}5%{-webkit-transform:rotate(-45deg);transform:rotate(-45deg)}12%{-webkit-transform:rotate(-405deg);transform:rotate(-405deg)}to{-webkit-transform:rotate(-405deg);transform:rotate(-405deg)}}@keyframes rotatePlaceholder{0%{-webkit-transform:rotate(-45deg);transform:rotate(-45deg)}5%{-webkit-transform:rotate(-45deg);transform:rotate(-45deg)}12%{-webkit-transform:rotate(-405deg);transform:rotate(-405deg)}to{-webkit-transform:rotate(-405deg);transform:rotate(-405deg)}}@-webkit-keyframes animateSuccessTip{0%{width:0;left:1px;top:19px}54%{width:0;left:1px;top:19px}70%{width:50px;left:-8px;top:37px}84%{width:17px;left:21px;top:48px}to{width:25px;left:14px;top:45px}}@keyframes animateSuccessTip{0%{width:0;left:1px;top:19px}54%{width:0;left:1px;top:19px}70%{width:50px;left:-8px;top:37px}84%{width:17px;left:21px;top:48px}to{width:25px;left:14px;top:45px}}@-webkit-keyframes animateSuccessLong{0%{width:0;right:46px;top:54px}65%{width:0;right:46px;top:54px}84%{width:55px;right:0;top:35px}to{width:47px;right:8px;top:38px}}@keyframes animateSuccessLong{0%{width:0;right:46px;top:54px}65%{width:0;right:46px;top:54px}84%{width:55px;right:0;top:35px}to{width:47px;right:8px;top:38px}}.swal-icon--info{border-color:#c9dae1}.swal-icon--info:before{width:5px;height:29px;bottom:17px;border-radius:2px;margin-left:-2px}.swal-icon--info:after,.swal-icon--info:before{content:"";position:absolute;left:50%;background-color:#c9dae1}.swal-icon--info:after{width:7px;height:7px;border-radius:50%;margin-left:-3px;top:19px}.swal-icon{width:80px;height:80px;border-width:4px;border-style:solid;border-radius:50%;padding:0;position:relative;box-sizing:content-box;margin:20px auto}.swal-icon:first-child{margin-top:32px}.swal-icon--custom{width:auto;height:auto;max-width:100%;border:none;border-radius:0}.swal-icon img{max-width:100%;max-height:100%}.swal-title{color:rgba(0,0,0,.65);font-weight:600;text-transform:none;position:relative;display:block;padding:13px 16px;font-size:27px;line-height:normal;text-align:center;margin-bottom:0}.swal-title:first-child{margin-top:26px}.swal-title:not(:first-child){padding-bottom:0}.swal-title:not(:last-child){margin-bottom:13px}.swal-text{font-size:16px;position:relative;float:none;line-height:normal;vertical-align:top;text-align:left;display:inline-block;margin:0;padding:0 10px;font-weight:400;color:rgba(0,0,0,.64);max-width:calc(100% - 20px);overflow-wrap:break-word;box-sizing:border-box}.swal-text:first-child{margin-top:45px}.swal-text:last-child{margin-bottom:45px}.swal-footer{text-align:right;padding-top:13px;margin-top:13px;padding:13px 16px;border-radius:inherit;border-top-left-radius:0;border-top-right-radius:0}.swal-button-container{margin:5px;display:inline-block;position:relative}.swal-button{background-color:#7cd1f9;color:#fff;border:none;box-shadow:none;border-radius:5px;font-weight:600;font-size:14px;padding:10px 24px;margin:0;cursor:pointer}.swal-button[not:disabled]:hover{background-color:#78cbf2}.swal-button:active{background-color:#70bce0}.swal-button:focus{outline:none;box-shadow:0 0 0 1px #fff,0 0 0 3px rgba(43,114,165,.29)}.swal-button[disabled]{opacity:.5;cursor:default}.swal-button::-moz-focus-inner{border:0}.swal-button--cancel{color:#555;background-color:#efefef}.swal-button--cancel[not:disabled]:hover{background-color:#e8e8e8}.swal-button--cancel:active{background-color:#d7d7d7}.swal-button--cancel:focus{box-shadow:0 0 0 1px #fff,0 0 0 3px rgba(116,136,150,.29)}.swal-button--danger{background-color:#e64942}.swal-button--danger[not:disabled]:hover{background-color:#df4740}.swal-button--danger:active{background-color:#cf423b}.swal-button--danger:focus{box-shadow:0 0 0 1px #fff,0 0 0 3px rgba(165,43,43,.29)}.swal-content{padding:0 20px;margin-top:20px;font-size:medium}.swal-content:last-child{margin-bottom:20px}.swal-content__input,.swal-content__textarea{-webkit-appearance:none;background-color:#fff;border:none;font-size:14px;display:block;box-sizing:border-box;width:100%;border:1px solid rgba(0,0,0,.14);padding:10px 13px;border-radius:2px;transition:border-color .2s}.swal-content__input:focus,.swal-content__textarea:focus{outline:none;border-color:#6db8ff}.swal-content__textarea{resize:vertical}.swal-button--loading{color:transparent}.swal-button--loading~.swal-button__loader{opacity:1}.swal-button__loader{position:absolute;height:auto;width:43px;z-index:2;left:50%;top:50%;-webkit-transform:translateX(-50%) translateY(-50%);transform:translateX(-50%) translateY(-50%);text-align:center;pointer-events:none;opacity:0}.swal-button__loader div{display:inline-block;float:none;vertical-align:baseline;width:9px;height:9px;padding:0;border:none;margin:2px;opacity:.4;border-radius:7px;background-color:hsla(0,0%,100%,.9);transition:background .2s;-webkit-animation:swal-loading-anim 1s infinite;animation:swal-loading-anim 1s infinite}.swal-button__loader div:nth-child(3n+2){-webkit-animation-delay:.15s;animation-delay:.15s}.swal-button__loader div:nth-child(3n+3){-webkit-animation-delay:.3s;animation-delay:.3s}@-webkit-keyframes swal-loading-anim{0%{opacity:.4}20%{opacity:.4}50%{opacity:1}to{opacity:.4}}@keyframes swal-loading-anim{0%{opacity:.4}20%{opacity:.4}50%{opacity:1}to{opacity:.4}}.swal-overlay{position:fixed;top:0;bottom:0;left:0;right:0;text-align:center;font-size:0;overflow-y:auto;background-color:rgba(0,0,0,.4);z-index:10000;pointer-events:none;opacity:0;transition:opacity .3s}.swal-overlay:before{content:" ";display:inline-block;vertical-align:middle;height:100%}.swal-overlay--show-modal{opacity:1;pointer-events:auto}.swal-overlay--show-modal .swal-modal{opacity:1;pointer-events:auto;box-sizing:border-box;-webkit-animation:showSweetAlert .3s;animation:showSweetAlert .3s;will-change:transform}.swal-modal{width:478px;opacity:0;pointer-events:none;background-color:#fff;text-align:center;border-radius:5px;position:static;margin:20px auto;display:inline-block;vertical-align:middle;-webkit-transform:scale(1);transform:scale(1);-webkit-transform-origin:50% 50%;transform-origin:50% 50%;z-index:10001;transition:opacity .2s,-webkit-transform .3s;transition:transform .3s,opacity .2s;transition:transform .3s,opacity .2s,-webkit-transform .3s}@media (max-width:500px){.swal-modal{width:calc(100% - 20px)}}@-webkit-keyframes showSweetAlert{0%{-webkit-transform:scale(1);transform:scale(1)}1%{-webkit-transform:scale(.5);transform:scale(.5)}45%{-webkit-transform:scale(1.05);transform:scale(1.05)}80%{-webkit-transform:scale(.95);transform:scale(.95)}to{-webkit-transform:scale(1);transform:scale(1)}}@keyframes showSweetAlert{0%{-webkit-transform:scale(1);transform:scale(1)}1%{-webkit-transform:scale(.5);transform:scale(.5)}45%{-webkit-transform:scale(1.05);transform:scale(1.05)}80%{-webkit-transform:scale(.95);transform:scale(.95)}to{-webkit-transform:scale(1);transform:scale(1)}}',""])},function(t,e){function n(t,e){var n=t[1]||"",r=t[3];if(!r)return n;if(e&&"function"==typeof btoa){var i=o(r);return[n].concat(r.sources.map(function(t){return"/*# sourceURL="+r.sourceRoot+t+" */"})).concat([i]).join("\n")}return[n].join("\n")}function o(t){return"/*# sourceMappingURL=data:application/json;charset=utf-8;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(t))))+" */"}t.exports=function(t){var e=[];return e.toString=function(){return this.map(function(e){var o=n(e,t);return e[2]?"@media "+e[2]+"{"+o+"}":o}).join("")},e.i=function(t,n){"string"==typeof t&&(t=[[null,t,""]]);for(var o={},r=0;r<this.length;r++){var i=this[r][0];"number"==typeof i&&(o[i]=!0)}for(r=0;r<t.length;r++){var a=t[r];"number"==typeof a[0]&&o[a[0]]||(n&&!a[2]?a[2]=n:n&&(a[2]="("+a[2]+") and ("+n+")"),e.push(a))}},e}},function(t,e,n){function o(t,e){for(var n=0;n<t.length;n++){var o=t[n],r=m[o.id];if(r){r.refs++;for(var i=0;i<r.parts.length;i++)r.parts[i](o.parts[i]);for(;i<o.parts.length;i++)r.parts.push(u(o.parts[i],e))}else{for(var a=[],i=0;i<o.parts.length;i++)a.push(u(o.parts[i],e));m[o.id]={id:o.id,refs:1,parts:a}}}}function r(t,e){for(var n=[],o={},r=0;r<t.length;r++){var i=t[r],a=e.base?i[0]+e.base:i[0],s=i[1],c=i[2],l=i[3],u={css:s,media:c,sourceMap:l};o[a]?o[a].parts.push(u):n.push(o[a]={id:a,parts:[u]})}return n}function i(t,e){var n=v(t.insertInto);if(!n)throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");var o=w[w.length-1];if("top"===t.insertAt)o?o.nextSibling?n.insertBefore(e,o.nextSibling):n.appendChild(e):n.insertBefore(e,n.firstChild),w.push(e);else{if("bottom"!==t.insertAt)throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");n.appendChild(e)}}function a(t){if(null===t.parentNode)return!1;t.parentNode.removeChild(t);var e=w.indexOf(t);e>=0&&w.splice(e,1)}function s(t){var e=document.createElement("style");return t.attrs.type="text/css",l(e,t.attrs),i(t,e),e}function c(t){var e=document.createElement("link");return t.attrs.type="text/css",t.attrs.rel="stylesheet",l(e,t.attrs),i(t,e),e}function l(t,e){Object.keys(e).forEach(function(n){t.setAttribute(n,e[n])})}function u(t,e){var n,o,r,i;if(e.transform&&t.css){if(!(i=e.transform(t.css)))return function(){};t.css=i}if(e.singleton){var l=h++;n=g||(g=s(e)),o=f.bind(null,n,l,!1),r=f.bind(null,n,l,!0)}else t.sourceMap&&"function"==typeof URL&&"function"==typeof URL.createObjectURL&&"function"==typeof URL.revokeObjectURL&&"function"==typeof Blob&&"function"==typeof btoa?(n=c(e),o=p.bind(null,n,e),r=function(){a(n),n.href&&URL.revokeObjectURL(n.href)}):(n=s(e),o=d.bind(null,n),r=function(){a(n)});return o(t),function(e){if(e){if(e.css===t.css&&e.media===t.media&&e.sourceMap===t.sourceMap)return;o(t=e)}else r()}}function f(t,e,n,o){var r=n?"":o.css;if(t.styleSheet)t.styleSheet.cssText=x(e,r);else{var i=document.createTextNode(r),a=t.childNodes;a[e]&&t.removeChild(a[e]),a.length?t.insertBefore(i,a[e]):t.appendChild(i)}}function d(t,e){var n=e.css,o=e.media;if(o&&t.setAttribute("media",o),t.styleSheet)t.styleSheet.cssText=n;else{for(;t.firstChild;)t.removeChild(t.firstChild);t.appendChild(document.createTextNode(n))}}function p(t,e,n){var o=n.css,r=n.sourceMap,i=void 0===e.convertToAbsoluteUrls&&r;(e.convertToAbsoluteUrls||i)&&(o=y(o)),r&&(o+="\n/*# sourceMappingURL=data:application/json;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(r))))+" */");var a=new Blob([o],{type:"text/css"}),s=t.href;t.href=URL.createObjectURL(a),s&&URL.revokeObjectURL(s)}var m={},b=function(t){var e;return function(){return void 0===e&&(e=t.apply(this,arguments)),e}}(function(){return window&&document&&document.all&&!window.atob}),v=function(t){var e={};return function(n){return void 0===e[n]&&(e[n]=t.call(this,n)),e[n]}}(function(t){return document.querySelector(t)}),g=null,h=0,w=[],y=n(15);t.exports=function(t,e){if("undefined"!=typeof DEBUG&&DEBUG&&"object"!=typeof document)throw new Error("The style-loader cannot be used in a non-browser environment");e=e||{},e.attrs="object"==typeof e.attrs?e.attrs:{},e.singleton||(e.singleton=b()),e.insertInto||(e.insertInto="head"),e.insertAt||(e.insertAt="bottom");var n=r(t,e);return o(n,e),function(t){for(var i=[],a=0;a<n.length;a++){var s=n[a],c=m[s.id];c.refs--,i.push(c)}if(t){o(r(t,e),e)}for(var a=0;a<i.length;a++){var c=i[a];if(0===c.refs){for(var l=0;l<c.parts.length;l++)c.parts[l]();delete m[c.id]}}}};var x=function(){var t=[];return function(e,n){return t[e]=n,t.filter(Boolean).join("\n")}}()},function(t,e){t.exports=function(t){var e="undefined"!=typeof window&&window.location;if(!e)throw new Error("fixUrls requires window.location");if(!t||"string"!=typeof t)return t;var n=e.protocol+"//"+e.host,o=n+e.pathname.replace(/\/[^\/]*$/,"/");return t.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi,function(t,e){var r=e.trim().replace(/^"(.*)"$/,function(t,e){return e}).replace(/^'(.*)'$/,function(t,e){return e});if(/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(r))return t;var i;return i=0===r.indexOf("//")?r:0===r.indexOf("/")?n+r:o+r.replace(/^\.\//,""),"url("+JSON.stringify(i)+")"})}},function(t,e,n){var o=n(17);"undefined"==typeof window||window.Promise||(window.Promise=o),n(21),String.prototype.includes||(String.prototype.includes=function(t,e){"use strict";return"number"!=typeof e&&(e=0),!(e+t.length>this.length)&&-1!==this.indexOf(t,e)}),Array.prototype.includes||Object.defineProperty(Array.prototype,"includes",{value:function(t,e){if(null==this)throw new TypeError('"this" is null or not defined');var n=Object(this),o=n.length>>>0;if(0===o)return!1;for(var r=0|e,i=Math.max(r>=0?r:o-Math.abs(r),0);i<o;){if(function(t,e){return t===e||"number"==typeof t&&"number"==typeof e&&isNaN(t)&&isNaN(e)}(n[i],t))return!0;i++}return!1}}),"undefined"!=typeof window&&function(t){t.forEach(function(t){t.hasOwnProperty("remove")||Object.defineProperty(t,"remove",{configurable:!0,enumerable:!0,writable:!0,value:function(){this.parentNode.removeChild(this)}})})}([Element.prototype,CharacterData.prototype,DocumentType.prototype])},function(t,e,n){(function(e){!function(n){function o(){}function r(t,e){return function(){t.apply(e,arguments)}}function i(t){if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");if("function"!=typeof t)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=void 0,this._deferreds=[],f(t,this)}function a(t,e){for(;3===t._state;)t=t._value;if(0===t._state)return void t._deferreds.push(e);t._handled=!0,i._immediateFn(function(){var n=1===t._state?e.onFulfilled:e.onRejected;if(null===n)return void(1===t._state?s:c)(e.promise,t._value);var o;try{o=n(t._value)}catch(t){return void c(e.promise,t)}s(e.promise,o)})}function s(t,e){try{if(e===t)throw new TypeError("A promise cannot be resolved with itself.");if(e&&("object"==typeof e||"function"==typeof e)){var n=e.then;if(e instanceof i)return t._state=3,t._value=e,void l(t);if("function"==typeof n)return void f(r(n,e),t)}t._state=1,t._value=e,l(t)}catch(e){c(t,e)}}function c(t,e){t._state=2,t._value=e,l(t)}function l(t){2===t._state&&0===t._deferreds.length&&i._immediateFn(function(){t._handled||i._unhandledRejectionFn(t._value)});for(var e=0,n=t._deferreds.length;e<n;e++)a(t,t._deferreds[e]);t._deferreds=null}function u(t,e,n){this.onFulfilled="function"==typeof t?t:null,this.onRejected="function"==typeof e?e:null,this.promise=n}function f(t,e){var n=!1;try{t(function(t){n||(n=!0,s(e,t))},function(t){n||(n=!0,c(e,t))})}catch(t){if(n)return;n=!0,c(e,t)}}var d=setTimeout;i.prototype.catch=function(t){return this.then(null,t)},i.prototype.then=function(t,e){var n=new this.constructor(o);return a(this,new u(t,e,n)),n},i.all=function(t){var e=Array.prototype.slice.call(t);return new i(function(t,n){function o(i,a){try{if(a&&("object"==typeof a||"function"==typeof a)){var s=a.then;if("function"==typeof s)return void s.call(a,function(t){o(i,t)},n)}e[i]=a,0==--r&&t(e)}catch(t){n(t)}}if(0===e.length)return t([]);for(var r=e.length,i=0;i<e.length;i++)o(i,e[i])})},i.resolve=function(t){return t&&"object"==typeof t&&t.constructor===i?t:new i(function(e){e(t)})},i.reject=function(t){return new i(function(e,n){n(t)})},i.race=function(t){return new i(function(e,n){for(var o=0,r=t.length;o<r;o++)t[o].then(e,n)})},i._immediateFn="function"==typeof e&&function(t){e(t)}||function(t){d(t,0)},i._unhandledRejectionFn=function(t){"undefined"!=typeof console&&console&&console.warn("Possible Unhandled Promise Rejection:",t)},i._setImmediateFn=function(t){i._immediateFn=t},i._setUnhandledRejectionFn=function(t){i._unhandledRejectionFn=t},void 0!==t&&t.exports?t.exports=i:n.Promise||(n.Promise=i)}(this)}).call(e,n(18).setImmediate)},function(t,e,n){function o(t,e){this._id=t,this._clearFn=e}var r=Function.prototype.apply;e.setTimeout=function(){return new o(r.call(setTimeout,window,arguments),clearTimeout)},e.setInterval=function(){return new o(r.call(setInterval,window,arguments),clearInterval)},e.clearTimeout=e.clearInterval=function(t){t&&t.close()},o.prototype.unref=o.prototype.ref=function(){},o.prototype.close=function(){this._clearFn.call(window,this._id)},e.enroll=function(t,e){clearTimeout(t._idleTimeoutId),t._idleTimeout=e},e.unenroll=function(t){clearTimeout(t._idleTimeoutId),t._idleTimeout=-1},e._unrefActive=e.active=function(t){clearTimeout(t._idleTimeoutId);var e=t._idleTimeout;e>=0&&(t._idleTimeoutId=setTimeout(function(){t._onTimeout&&t._onTimeout()},e))},n(19),e.setImmediate=setImmediate,e.clearImmediate=clearImmediate},function(t,e,n){(function(t,e){!function(t,n){"use strict";function o(t){"function"!=typeof t&&(t=new Function(""+t));for(var e=new Array(arguments.length-1),n=0;n<e.length;n++)e[n]=arguments[n+1];var o={callback:t,args:e};return l[c]=o,s(c),c++}function r(t){delete l[t]}function i(t){var e=t.callback,o=t.args;switch(o.length){case 0:e();break;case 1:e(o[0]);break;case 2:e(o[0],o[1]);break;case 3:e(o[0],o[1],o[2]);break;default:e.apply(n,o)}}function a(t){if(u)setTimeout(a,0,t);else{var e=l[t];if(e){u=!0;try{i(e)}finally{r(t),u=!1}}}}if(!t.setImmediate){var s,c=1,l={},u=!1,f=t.document,d=Object.getPrototypeOf&&Object.getPrototypeOf(t);d=d&&d.setTimeout?d:t,"[object process]"==={}.toString.call(t.process)?function(){s=function(t){e.nextTick(function(){a(t)})}}():function(){if(t.postMessage&&!t.importScripts){var e=!0,n=t.onmessage;return t.onmessage=function(){e=!1},t.postMessage("","*"),t.onmessage=n,e}}()?function(){var e="setImmediate$"+Math.random()+"$",n=function(n){n.source===t&&"string"==typeof n.data&&0===n.data.indexOf(e)&&a(+n.data.slice(e.length))};t.addEventListener?t.addEventListener("message",n,!1):t.attachEvent("onmessage",n),s=function(n){t.postMessage(e+n,"*")}}():t.MessageChannel?function(){var t=new MessageChannel;t.port1.onmessage=function(t){a(t.data)},s=function(e){t.port2.postMessage(e)}}():f&&"onreadystatechange"in f.createElement("script")?function(){var t=f.documentElement;s=function(e){var n=f.createElement("script");n.onreadystatechange=function(){a(e),n.onreadystatechange=null,t.removeChild(n),n=null},t.appendChild(n)}}():function(){s=function(t){setTimeout(a,0,t)}}(),d.setImmediate=o,d.clearImmediate=r}}("undefined"==typeof self?void 0===t?this:t:self)}).call(e,n(7),n(20))},function(t,e){function n(){throw new Error("setTimeout has not been defined")}function o(){throw new Error("clearTimeout has not been defined")}function r(t){if(u===setTimeout)return setTimeout(t,0);if((u===n||!u)&&setTimeout)return u=setTimeout,setTimeout(t,0);try{return u(t,0)}catch(e){try{return u.call(null,t,0)}catch(e){return u.call(this,t,0)}}}function i(t){if(f===clearTimeout)return clearTimeout(t);if((f===o||!f)&&clearTimeout)return f=clearTimeout,clearTimeout(t);try{return f(t)}catch(e){try{return f.call(null,t)}catch(e){return f.call(this,t)}}}function a(){b&&p&&(b=!1,p.length?m=p.concat(m):v=-1,m.length&&s())}function s(){if(!b){var t=r(a);b=!0;for(var e=m.length;e;){for(p=m,m=[];++v<e;)p&&p[v].run();v=-1,e=m.length}p=null,b=!1,i(t)}}function c(t,e){this.fun=t,this.array=e}function l(){}var u,f,d=t.exports={};!function(){try{u="function"==typeof setTimeout?setTimeout:n}catch(t){u=n}try{f="function"==typeof clearTimeout?clearTimeout:o}catch(t){f=o}}();var p,m=[],b=!1,v=-1;d.nextTick=function(t){var e=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)e[n-1]=arguments[n];m.push(new c(t,e)),1!==m.length||b||r(s)},c.prototype.run=function(){this.fun.apply(null,this.array)},d.title="browser",d.browser=!0,d.env={},d.argv=[],d.version="",d.versions={},d.on=l,d.addListener=l,d.once=l,d.off=l,d.removeListener=l,d.removeAllListeners=l,d.emit=l,d.prependListener=l,d.prependOnceListener=l,d.listeners=function(t){return[]},d.binding=function(t){throw new Error("process.binding is not supported")},d.cwd=function(){return"/"},d.chdir=function(t){throw new Error("process.chdir is not supported")},d.umask=function(){return 0}},function(t,e,n){"use strict";n(22).polyfill()},function(t,e,n){"use strict";function o(t,e){if(void 0===t||null===t)throw new TypeError("Cannot convert first argument to object");for(var n=Object(t),o=1;o<arguments.length;o++){var r=arguments[o];if(void 0!==r&&null!==r)for(var i=Object.keys(Object(r)),a=0,s=i.length;a<s;a++){var c=i[a],l=Object.getOwnPropertyDescriptor(r,c);void 0!==l&&l.enumerable&&(n[c]=r[c])}}return n}function r(){Object.assign||Object.defineProperty(Object,"assign",{enumerable:!1,configurable:!0,writable:!0,value:o})}t.exports={assign:o,polyfill:r}},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(24),r=n(6),i=n(5),a=n(36),s=function(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];if("undefined"!=typeof window){var n=a.getOpts.apply(void 0,t);return new Promise(function(t,e){i.default.promise={resolve:t,reject:e},o.default(n),setTimeout(function(){r.openModal()})})}};s.close=r.onAction,s.getState=r.getState,s.setActionValue=i.setActionValue,s.stopLoading=r.stopLoading,s.setDefaults=a.setDefaults,e.default=s},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(1),r=n(0),i=r.default.MODAL,a=n(4),s=n(34),c=n(35),l=n(1);e.init=function(t){o.getNode(i)||(document.body||l.throwErr("You can only use SweetAlert AFTER the DOM has loaded!"),s.default(),a.default()),a.initModalContent(t),c.default(t)},e.default=e.init},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(0),r=o.default.MODAL;e.modalMarkup='\n  <div class="'+r+'" role="dialog" aria-modal="true"></div>',e.default=e.modalMarkup},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(0),r=o.default.OVERLAY,i='<div \n    class="'+r+'"\n    tabIndex="-1">\n  </div>';e.default=i},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(0),r=o.default.ICON;e.errorIconMarkup=function(){var t=r+"--error",e=t+"__line";return'\n    <div class="'+t+'__x-mark">\n      <span class="'+e+" "+e+'--left"></span>\n      <span class="'+e+" "+e+'--right"></span>\n    </div>\n  '},e.warningIconMarkup=function(){var t=r+"--warning";return'\n    <span class="'+t+'__body">\n      <span class="'+t+'__dot"></span>\n    </span>\n  '},e.successIconMarkup=function(){var t=r+"--success";return'\n    <span class="'+t+"__line "+t+'__line--long"></span>\n    <span class="'+t+"__line "+t+'__line--tip"></span>\n\n    <div class="'+t+'__ring"></div>\n    <div class="'+t+'__hide-corners"></div>\n  '}},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(0),r=o.default.CONTENT;e.contentMarkup='\n  <div class="'+r+'">\n\n  </div>\n'},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(0),r=o.default.BUTTON_CONTAINER,i=o.default.BUTTON,a=o.default.BUTTON_LOADER;e.buttonMarkup='\n  <div class="'+r+'">\n\n    <button\n      class="'+i+'"\n    ></button>\n\n    <div class="'+a+'">\n      <div></div>\n      <div></div>\n      <div></div>\n    </div>\n\n  </div>\n'},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(4),r=n(2),i=n(0),a=i.default.ICON,s=i.default.ICON_CUSTOM,c=["error","warning","success","info"],l={error:r.errorIconMarkup(),warning:r.warningIconMarkup(),success:r.successIconMarkup()},u=function(t,e){var n=a+"--"+t;e.classList.add(n);var o=l[t];o&&(e.innerHTML=o)},f=function(t,e){e.classList.add(s);var n=document.createElement("img");n.src=t,e.appendChild(n)},d=function(t){if(t){var e=o.injectElIntoModal(r.iconMarkup);c.includes(t)?u(t,e):f(t,e)}};e.default=d},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(2),r=n(4),i=function(t){navigator.userAgent.includes("AppleWebKit")&&(t.style.display="none",t.offsetHeight,t.style.display="")};e.initTitle=function(t){if(t){var e=r.injectElIntoModal(o.titleMarkup);e.textContent=t,i(e)}},e.initText=function(t){if(t){var e=document.createDocumentFragment();t.split("\n").forEach(function(t,n,o){e.appendChild(document.createTextNode(t)),n<o.length-1&&e.appendChild(document.createElement("br"))});var n=r.injectElIntoModal(o.textMarkup);n.appendChild(e),i(n)}}},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(1),r=n(4),i=n(0),a=i.default.BUTTON,s=i.default.DANGER_BUTTON,c=n(3),l=n(2),u=n(6),f=n(5),d=function(t,e,n){var r=e.text,i=e.value,d=e.className,p=e.closeModal,m=o.stringToNode(l.buttonMarkup),b=m.querySelector("."+a),v=a+"--"+t;if(b.classList.add(v),d){(Array.isArray(d)?d:d.split(" ")).filter(function(t){return t.length>0}).forEach(function(t){b.classList.add(t)})}n&&t===c.CONFIRM_KEY&&b.classList.add(s),b.textContent=r;var g={};return g[t]=i,f.setActionValue(g),f.setActionOptionsFor(t,{closeModal:p}),b.addEventListener("click",function(){return u.onAction(t)}),m},p=function(t,e){var n=r.injectElIntoModal(l.footerMarkup);for(var o in t){var i=t[o],a=d(o,i,e);i.visible&&n.appendChild(a)}0===n.children.length&&n.remove()};e.default=p},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(3),r=n(4),i=n(2),a=n(5),s=n(6),c=n(0),l=c.default.CONTENT,u=function(t){t.addEventListener("input",function(t){var e=t.target,n=e.value;a.setActionValue(n)}),t.addEventListener("keyup",function(t){if("Enter"===t.key)return s.onAction(o.CONFIRM_KEY)}),setTimeout(function(){t.focus(),a.setActionValue("")},0)},f=function(t,e,n){var o=document.createElement(e),r=l+"__"+e;o.classList.add(r);for(var i in n){var a=n[i];o[i]=a}"input"===e&&u(o),t.appendChild(o)},d=function(t){if(t){var e=r.injectElIntoModal(i.contentMarkup),n=t.element,o=t.attributes;"string"==typeof n?f(e,n,o):e.appendChild(n)}};e.default=d},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(1),r=n(2),i=function(){var t=o.stringToNode(r.overlayMarkup);document.body.appendChild(t)};e.default=i},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(5),r=n(6),i=n(1),a=n(3),s=n(0),c=s.default.MODAL,l=s.default.BUTTON,u=s.default.OVERLAY,f=function(t){t.preventDefault(),v()},d=function(t){t.preventDefault(),g()},p=function(t){if(o.default.isOpen)switch(t.key){case"Escape":return r.onAction(a.CANCEL_KEY)}},m=function(t){if(o.default.isOpen)switch(t.key){case"Tab":return f(t)}},b=function(t){if(o.default.isOpen)return"Tab"===t.key&&t.shiftKey?d(t):void 0},v=function(){var t=i.getNode(l);t&&(t.tabIndex=0,t.focus())},g=function(){var t=i.getNode(c),e=t.querySelectorAll("."+l),n=e.length-1,o=e[n];o&&o.focus()},h=function(t){t[t.length-1].addEventListener("keydown",m)},w=function(t){t[0].addEventListener("keydown",b)},y=function(){var t=i.getNode(c),e=t.querySelectorAll("."+l);e.length&&(h(e),w(e))},x=function(t){if(i.getNode(u)===t.target)return r.onAction(a.CANCEL_KEY)},_=function(t){var e=i.getNode(u);e.removeEventListener("click",x),t&&e.addEventListener("click",x)},k=function(t){o.default.timer&&clearTimeout(o.default.timer),t&&(o.default.timer=window.setTimeout(function(){return r.onAction(a.CANCEL_KEY)},t))},O=function(t){t.closeOnEsc?document.addEventListener("keyup",p):document.removeEventListener("keyup",p),t.dangerMode?v():g(),y(),_(t.closeOnClickOutside),k(t.timer)};e.default=O},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(1),r=n(3),i=n(37),a=n(38),s={title:null,text:null,icon:null,buttons:r.defaultButtonList,content:null,className:null,closeOnClickOutside:!0,closeOnEsc:!0,dangerMode:!1,timer:null},c=Object.assign({},s);e.setDefaults=function(t){c=Object.assign({},s,t)};var l=function(t){var e=t&&t.button,n=t&&t.buttons;return void 0!==e&&void 0!==n&&o.throwErr("Cannot set both 'button' and 'buttons' options!"),void 0!==e?{confirm:e}:n},u=function(t){return o.ordinalSuffixOf(t+1)},f=function(t,e){o.throwErr(u(e)+" argument ('"+t+"') is invalid")},d=function(t,e){var n=t+1,r=e[n];o.isPlainObject(r)||void 0===r||o.throwErr("Expected "+u(n)+" argument ('"+r+"') to be a plain object")},p=function(t,e){var n=t+1,r=e[n];void 0!==r&&o.throwErr("Unexpected "+u(n)+" argument ("+r+")")},m=function(t,e,n,r){var i=typeof e,a="string"===i,s=e instanceof Element;if(a){if(0===n)return{text:e};if(1===n)return{text:e,title:r[0]};if(2===n)return d(n,r),{icon:e};f(e,n)}else{if(s&&0===n)return d(n,r),{content:e};if(o.isPlainObject(e))return p(n,r),e;f(e,n)}};e.getOpts=function(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];var n={};t.forEach(function(e,o){var r=m(0,e,o,t);Object.assign(n,r)});var o=l(n);n.buttons=r.getButtonListOpts(o),delete n.button,n.content=i.getContentOpts(n.content);var u=Object.assign({},s,c,n);return Object.keys(u).forEach(function(t){a.DEPRECATED_OPTS[t]&&a.logDeprecation(t)}),u}},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(1),r={element:"input",attributes:{placeholder:""}};e.getContentOpts=function(t){var e={};return o.isPlainObject(t)?Object.assign(e,t):t instanceof Element?{element:t}:"input"===t?r:null}},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.logDeprecation=function(t){var n=e.DEPRECATED_OPTS[t],o=n.onlyRename,r=n.replacement,i=n.subOption,a=n.link,s=o?"renamed":"deprecated",c='SweetAlert warning: "'+t+'" option has been '+s+".";if(r){c+=" Please use"+(i?' "'+i+'" in ':" ")+'"'+r+'" instead.'}var l="https://sweetalert.js.org";c+=a?" More details: "+l+a:" More details: "+l+"/guides/#upgrading-from-1x",console.warn(c)},e.DEPRECATED_OPTS={type:{replacement:"icon",link:"/docs/#icon"},imageUrl:{replacement:"icon",link:"/docs/#icon"},customClass:{replacement:"className",onlyRename:!0,link:"/docs/#classname"},imageSize:{},showCancelButton:{replacement:"buttons",link:"/docs/#buttons"},showConfirmButton:{replacement:"button",link:"/docs/#button"},confirmButtonText:{replacement:"button",link:"/docs/#button"},confirmButtonColor:{},cancelButtonText:{replacement:"buttons",link:"/docs/#buttons"},closeOnConfirm:{replacement:"button",subOption:"closeModal",link:"/docs/#button"},closeOnCancel:{replacement:"buttons",subOption:"closeModal",link:"/docs/#buttons"},showLoaderOnConfirm:{replacement:"buttons"},animation:{},inputType:{replacement:"content",link:"/docs/#content"},inputValue:{replacement:"content",link:"/docs/#content"},inputPlaceholder:{replacement:"content",link:"/docs/#content"},html:{replacement:"content",link:"/docs/#content"},allowEscapeKey:{replacement:"closeOnEsc",onlyRename:!0,link:"/docs/#closeonesc"},allowClickOutside:{replacement:"closeOnClickOutside",onlyRename:!0,link:"/docs/#closeonclickoutside"}}}])});
}).call(this)}).call(this,_dereq_("timers").setImmediate,_dereq_("timers").clearImmediate)
},{"timers":67}],67:[function(_dereq_,module,exports){
(function (setImmediate,clearImmediate){(function (){
var nextTick = _dereq_('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this)}).call(this,_dereq_("timers").setImmediate,_dereq_("timers").clearImmediate)
},{"process/browser.js":65,"timers":67}],68:[function(_dereq_,module,exports){
/*
    I18NDomain class
*/
"use strict";

var context = _dereq_( '../../context.js' );

var I18NDomain = function( stringToApply ) {
    
    var string = stringToApply;
    
    var putToAutoDefineHelper = function( scope, autoDefineHelper ){
        
        var newString = string;
        var conf = context.getConf();
        
        // Add the domains defined previously
        var previousValue = scope.get( conf.i18nDomainVarName );
        if ( previousValue ) {
            newString += conf.inDefineDelimiter + conf.i18nDomainVarName;
        }
        
        // Add brackets if not present
        if ( newString[ 0 ] !== '[' ){
            newString = '[' + newString + ']';
        }
        
        // Add i18nDomainVarName to the autoDefineHelper
        autoDefineHelper.put(
            conf.i18nDomainVarName,
            newString
        );
    };

    var dependsOn = function(){
        return [];
    };
    
    var update = function(){
        // Nothing to do
    };
    
    var toString = function(){
        return string;
    };
    
    return {
        putToAutoDefineHelper: putToAutoDefineHelper,
        dependsOn: dependsOn,
        update: update,
        toString: toString,
        type: I18NDomain.id
    };
};

I18NDomain.id = 'i18n:domain';

I18NDomain.build = function( string ) {
    return string? new I18NDomain( string.trim() ): null;
};

module.exports = I18NDomain;

},{"../../context.js":87}],69:[function(_dereq_,module,exports){
/*
    I18nLanguage class
*/
"use strict";

var context = _dereq_( '../../context.js' );

var I18NLanguage = function( stringToApply ) {
    
    var string = stringToApply;
    
    var putToAutoDefineHelper = function( autoDefineHelper ){

        // Add i18nLanguageVarName to the autoDefineHelper
        autoDefineHelper.put(
            context.getConf().i18nLanguageVarName,
            string
        );
    };
    
    var dependsOn = function(){
        return [];
    };
    
    var update = function(){
        // Nothing to do
    };
    
    var toString = function(){
        return "I18NLanguage: " + string;
    };
    
    return {
        putToAutoDefineHelper: putToAutoDefineHelper,
        dependsOn: dependsOn,
        update: update,
        toString: toString,
        type: I18NLanguage.id
    };
};

I18NLanguage.id = 'i18n:language';

I18NLanguage.build = function( string ) {
    return string? new I18NLanguage( string.trim() ): null;
};

module.exports = I18NLanguage;

},{"../../context.js":87}],70:[function(_dereq_,module,exports){
/*
    METALDefineMacro class
*/
"use strict";

var METALDefineMacro = function( nameToApply ) {
    
    var name = nameToApply;
    
    var process = function( scope, node ){
        
        // Hide macro definitions
        node.style.display = 'none';

        return false;
    };

    var dependsOn = function(){
        return [];
    };
    
    var toString = function(){
        return "METALDefineMacro: " + name;
    };
    
    return {
        process: process,
        dependsOn: dependsOn,
        toString: toString,
        type: METALDefineMacro.id
    };
};

METALDefineMacro.id = 'metal:define-macro';

METALDefineMacro.build = function( string ) {
    return new METALDefineMacro( string.trim() );
};

module.exports = METALDefineMacro;

},{}],71:[function(_dereq_,module,exports){
/*
    METALFillSlot class
*/
"use strict";

var expressionsUtils = _dereq_( '../../expressions/expressionsUtils.js' );

var METALFillSlot = function( _string, _expression, _useMacroNode ) {
    
    var string = _string;
    var expression = _expression;
    var useMacroNode = _useMacroNode;
    
    var process = function(){
        // Nothing to do
    };
    
    var dependsOn = function( scope ){
        return expressionsUtils.buildDependsOnList( undefined, scope, expression );
    };
    
    var update = function( parserUpdater ){
        parserUpdater.updateNode( useMacroNode );
    };
    
    var toString = function(){
        return "METALFillSlot: " + string;
    };
    
    return {
        process: process,
        dependsOn: dependsOn,
        update: update,
        toString: toString,
        type: METALFillSlot.id
    };
};

METALFillSlot.id = 'metal:fill-slot';

METALFillSlot.build = function( string, useMacroNode ) {
    var expressionBuilder = _dereq_( '../../expressions/expressionBuilder.js' );
    
    return new METALFillSlot( 
            string,
            expressionBuilder.build( string ),
            useMacroNode
    );
};

module.exports = METALFillSlot;

},{"../../expressions/expressionBuilder.js":106,"../../expressions/expressionsUtils.js":108}],72:[function(_dereq_,module,exports){
/*
    METALUseMacro class
*/
"use strict";

var context = _dereq_( '../../context.js' );
var expressionBuilder = _dereq_( '../../expressions/expressionBuilder.js' );
var expressionsUtils = _dereq_( '../../expressions/expressionsUtils.js' );
var attributeIndex = _dereq_( '../attributeIndex.js' );
var attributeCache = _dereq_( '../../cache/attributeCache.js' );
var TALDefine = _dereq_( '../TAL/talDefine.js' );
var METALFillSlot = _dereq_( './metalFillSlot.js' );
var resolver = _dereq_( '../../resolver.js' );

var METALUseMacro = function( stringToApply, macroExpressionToApply, defineToApply ) {
    
    var string = stringToApply;
    var macroExpression = macroExpressionToApply;
    var define = defineToApply;
    
    var process = function( scope, node, autoDefineHelper, indexExpressions ){

        // Init some vars
        var macroKey = resolver.getMacroKey( macroExpression, scope );
        var tags = context.getTags();
        var newNode = resolver.getNode( macroKey, scope ); 
        
        // Hide use macro node
        node.style.display = 'none';

        // Remove style attribute to force showing the new node
        newNode.removeAttribute( 'style' );

        // Update define and autoDefine attributes of the new node
        updateNewNodeAttributes( macroKey, newNode, autoDefineHelper, tags, node, indexExpressions );
        
        // Fill slots
        fillSlots( scope, node, tags, newNode, indexExpressions );

        // Add the macro node
        node.parentNode.insertBefore( newNode, node.nextSibling );
        
        return newNode;
    };
    
    var updateNewNodeAttributes = function( macroKey, newNode, autoDefineHelper, tags, node, indexExpressions ){

        // Update the talDefine attribute
        TALDefine.updateAttribute( newNode, define );
        
        // Update the talAutoDefine attribute
        var macroData = resolver.getMacroData( macroKey );
        if ( macroData.url ){
            autoDefineHelper.put( 
                context.getConf().externalMacroUrlVarName, 
                "'" + macroData.url + "'"
            );
            autoDefineHelper.updateNode( newNode );
        }
        
        // Set related id attribute if needed
        if ( indexExpressions ){
            newNode.setAttribute( 
                tags.relatedId, 
                node.getAttribute( tags.id ) 
            );
        }
    };
    
    var fillSlots = function( scope, node, tags, newNode, indexExpressions ){
        
        var list = node.querySelectorAll( 
            "[" + resolver.filterSelector( tags.metalFillSlot ) + "]"
        );
        var element;
        var pos = 0;
        while ( element = list[ pos++ ] ) {
            var slotIdExpressionString = element.getAttribute( tags.metalFillSlot );
            var slotIdExpression = expressionBuilder.build( slotIdExpressionString );
            var slotId = slotIdExpression.evaluate( scope );

            // Index fill slot element
            if ( indexExpressions ){
                var metalFillSlot = attributeCache.getByAttributeClass( 
                    METALFillSlot, 
                    slotIdExpressionString, 
                    element,
                    indexExpressions,
                    scope,
                    function(){
                        return METALFillSlot.build( slotIdExpressionString, node );
                    }
                );
                attributeIndex.add( element, metalFillSlot, scope );   
            }

            // Do nothing if slotIdExpression evaluates to false
            if ( ! slotId ){
                return;
            }

            var slotContent = element.cloneNode( true );
            var currentNode = newNode.querySelector( 
                "[" + resolver.filterSelector( tags.metalDefineSlot ) + "='" + slotId + "']"
            );
            if ( ! currentNode ){
                throw 'Slot "' + slotId + '" in expression "' + slotIdExpressionString +'" not found!';
            }
            currentNode.parentNode.insertBefore( 
                slotContent, 
                currentNode.nextSibling
            );
            slotContent.removeAttribute( tags.metalFillSlot );
            slotContent.setAttribute( tags.id, context.nextExpressionCounter() ); // Set a new id attribute to avoid id conflicts
            currentNode.remove();
        }
    };
    
    var dependsOn = function( scope ){
        return expressionsUtils.buildDependsOnList( undefined, scope, macroExpression );
    };
    
    var update = function( parserUpdater, node ){
        parserUpdater.updateNode( node );
    };
    
    var toString = function(){
        return "METALUseMacro: " + string;
    };
    
    return {
        process: process,
        dependsOn: dependsOn,
        update: update,
        toString: toString,
        type: METALUseMacro.id
    };
};

METALUseMacro.id = 'metal:use-macro';

METALUseMacro.build = function( string, stringDefine ) {
    var expressionBuilder = _dereq_( '../../expressions/expressionBuilder.js' );
    
    return new METALUseMacro( 
            string,
            expressionBuilder.build( string.trim() ),
            stringDefine? stringDefine.trim(): undefined
    );
};

module.exports = METALUseMacro;

},{"../../cache/attributeCache.js":84,"../../context.js":87,"../../expressions/expressionBuilder.js":106,"../../expressions/expressionsUtils.js":108,"../../resolver.js":157,"../TAL/talDefine.js":78,"../attributeIndex.js":83,"./metalFillSlot.js":71}],73:[function(_dereq_,module,exports){
/* 
    contentHelper singleton class
*/
"use strict";

var context = _dereq_( '../../context.js' );
var expressionBuilder = _dereq_( '../../expressions/expressionBuilder.js' );
var evaluateHelper = _dereq_( '../../expressions/evaluateHelper.js' );

module.exports = (function() {

    var formInputHasBody = {
        BUTTON: 1,
        LABEL: 1,
        LEGEND: 1,
        FIELDSET: 1,
        OPTION: 1
    };
    
    var build = function( tag, string, constructorFunction ) {

        // Process it
        var content = string.trim();

        // Check if is an HTML expression
        var structure = content.indexOf( context.getConf().htmlStructureExpressionPrefix + ' ' ) === 0;
        var expressionString = structure? 
            content.substr( 1 + context.getConf().htmlStructureExpressionPrefix.length ): 
            content;
        if ( ! expressionString ){
            throw tag + ' expression void.';
        }
        
        return constructorFunction(
            string,
            expressionBuilder.build( expressionString ),
            structure,
            expressionString
        );
    };
    
    var updateNode = function( node, structure, evaluated ){

        // Check default
        if ( evaluateHelper.isDefault( evaluated ) ){
            return true;
        }

        // Check nothing
        if ( evaluateHelper.isNothing( evaluated ) ){
            evaluated = "";
        }

        // Add it to node
        node.innerHTML = evaluated;
        if ( ! structure ) {
            node[ "form" in node && !formInputHasBody[ node.tagName ] ? "value": "innerText" ] = evaluated;
        }

        return true;
    };
    
    return {
        build: build,
        updateNode: updateNode
    };
})();

},{"../../context.js":87,"../../expressions/evaluateHelper.js":104,"../../expressions/expressionBuilder.js":106}],74:[function(_dereq_,module,exports){
/*
    TALAttributes class
*/
"use strict";

var context = _dereq_( '../../context.js' );
var ExpressionTokenizer = _dereq_( '../../expressions/expressionTokenizer.js' );
var expressionsUtils = _dereq_( '../../expressions/expressionsUtils.js' );
var utils = _dereq_( '../../utils.js' );

var TALAttributes = function( stringToApply, attributeItemsToApply ) {
    
    var string = stringToApply;
    var attributeItems = attributeItemsToApply;
    
    var process = function( scope, node, attributeName ){
        
        for ( var i = 0; i < attributeItems.length; i++ ) {
            var attributeItem = attributeItems[ i ];
            var name = attributeItem.name;
            
            if ( ! attributeName || name === attributeName ){
                var value = attributeItem.expression.evaluate( scope );

                if ( name ){
                    processSimpleAttributeItem( node, name, value );
                } else {
                    processMapAttributeItem( node, value );
                }
            }
        }
    };

    var processMapAttributeItem = function( node, map ){
    
        // Do nothing if map is null
        if ( ! map ){
            return;
        }
        
        if ( ! utils.isPlainObject( map ) ){
            throw 'Invalid attribute value: "' + map + '". Object expected.';
        }
        
        for ( var name in map ){
            var value = map[ name ];
            processSimpleAttributeItem( node, name, value );
        }
    };
    
    var processSimpleAttributeItem = function( node, name, value ){
        
        // Boolean attributes
        if ( context.isBooleanAttribute( name ) ){
            if ( value ){
                node.setAttribute( name, '' );
            } else {
                node.removeAttribute( name );
            }
            return;
        }
        
        // If value is undefined don't parser the attribute
        if ( value == undefined ) {
            return;
        }
            
        // Alt attributes
        if ( context.isAltAttribute( name ) ) {
            switch ( name ) {
            case "innerHTML":
                throw node; // should use "qtext"
            case "style":
                node.style.cssText = value;
                break;
            /*
            case "text":
                node[ querySelectorAll ? name : innerText ] = value;
                break; // option.text unstable in IE
            */
            case "class":
                name = "className";
            default:
                node[ name ] = value;
            }
            return;
        } 

        // Regular attributes
        node.setAttribute( name, value );
    };

    var dependsOn = function( scope ){

        var result = [];
        var object = {};
        
        for ( var i = 0; i < attributeItems.length; i++ ) {
            var attributeItem = attributeItems[ i ];
            var dependsOnList = expressionsUtils.buildDependsOnList( undefined, scope, attributeItem.expression );
            if ( dependsOnList && dependsOnList.length > 0 ){
                object[ attributeItem.name ] = dependsOnList;
            }
        }
        
        if ( Object.keys( object ).length > 0 ){
            result.push( object );
        }
        
        return result;
    };
    
    var update = function( parserUpdater, node, scope, indexItem ){
        process( scope, node, indexItem.groupId );
    };
    
    var toString = function(){
        return "TALAttributes: " + string;
    };
    
    return {
        process: process,
        dependsOn: dependsOn,
        update: update,
        toString: toString,
        type: TALAttributes.id
    };
};

TALAttributes.id = 'tal:attributes';

TALAttributes.build = function( string ) {

    var expressionBuilder = _dereq_( '../../expressions/expressionBuilder.js' );
    
    var attributeItems = [];
    var expressionString = string.trim();
    var tokens = new ExpressionTokenizer( 
            expressionString, 
            context.getConf().attributeDelimiter, 
            true );

    while ( tokens.hasMoreTokens() ) {
        var attribute = tokens.nextToken().trim();
        var space = attribute.indexOf( context.getConf().inAttributeDelimiter );
        if ( space === -1 ) {
            attributeItems.push({
                name: undefined,
                expression: expressionBuilder.build( attribute )
            });
        }
        var name = attribute.substring( 0, space );
        var valueExpression = attribute.substring( space + 1 ).trim();

        attributeItems.push({
            name: name,
            expression: expressionBuilder.build( valueExpression )
        });
    }
    
    return new TALAttributes( string, attributeItems );
};

module.exports = TALAttributes;

},{"../../context.js":87,"../../expressions/expressionBuilder.js":106,"../../expressions/expressionTokenizer.js":107,"../../expressions/expressionsUtils.js":108,"../../utils.js":161}],75:[function(_dereq_,module,exports){
/*
    TALCondition class
*/
"use strict";

var evaluateHelper = _dereq_( '../../expressions/evaluateHelper.js' );
var expressionsUtils = _dereq_( '../../expressions/expressionsUtils.js' );
var context = _dereq_( '../../context.js' );

var TALCondition = function( stringToApply, expressionToApply ) {
    
    var string = stringToApply;
    var expression = expressionToApply;
    
    var process = function( scope, node ){
        
        var result = evaluateHelper.evaluateBoolean( scope, expression );
        
        node.setAttribute( context.getTags().conditionResult, result );
        node.style.display = result ? '' : 'none';
        
        return result;
    };

    var dependsOn = function( scope ){
        return expressionsUtils.buildDependsOnList( undefined, scope, expression );
    };
    
    var update = function( parserUpdater, node ){
        parserUpdater.updateNode( node, true );
    };
    
    var updatableFromAction = function( parserUpdater, node ){
        
        var scope = parserUpdater.getNodeScope( node );
        var result = evaluateHelper.evaluateBoolean( scope, expression );
        var valueFromTag = 'true' === node.getAttribute( context.getTags().conditionResult );
        
        return result !== valueFromTag;
    };
    
    var toString = function(){
        return "TALCondition: " + string;
    };
    
    return {
        process: process,
        dependsOn: dependsOn,
        update: update,
        updatableFromAction: updatableFromAction,
        toString: toString,
        type: TALCondition.id
    };
};

TALCondition.id = 'tal:condition';

TALCondition.build = function( string ) {
    
    var expressionBuilder = _dereq_( '../../expressions/expressionBuilder.js' );
    
    return new TALCondition( 
                string,
                expressionBuilder.build( string ) );
};

module.exports = TALCondition;

},{"../../context.js":87,"../../expressions/evaluateHelper.js":104,"../../expressions/expressionBuilder.js":106,"../../expressions/expressionsUtils.js":108}],76:[function(_dereq_,module,exports){
/*
    TALContent class
*/
"use strict";

var evaluateHelper = _dereq_( '../../expressions/evaluateHelper.js' );
var contentHelper = _dereq_( './contentHelper.js' );
var expressionsUtils = _dereq_( '../../expressions/expressionsUtils.js' );

var TALContent = function( stringToApply, expressionToApply, structureToApply ) {
    
    var string = stringToApply;
    var expression = expressionToApply;
    var structure = structureToApply;
    
    var process = function( scope, node ){
        
        return contentHelper.updateNode( 
            node, 
            structure, 
            evaluateHelper.evaluateToNotNull( scope, expression ) 
        );
    };

    var dependsOn = function( scope ){
        return expressionsUtils.buildDependsOnList( undefined, scope, expression );
    };
    
    var update = function( parserUpdater, node, scope ){
        process( scope, node );
    };
    
    var toString = function(){
        return "TALContent: " + string;
    };
    
    return {
        process: process,
        dependsOn: dependsOn,
        update: update,
        toString: toString,
        type: TALContent.id
    };
};

TALContent.id = 'tal:content';

TALContent.build = function( string ) {
    
    return contentHelper.build( 
        'TALContent',
        string,
        function( _string, _expression, _structure ){
            return new TALContent( _string, _expression, _structure );
        }
    );
};

module.exports = TALContent;

},{"../../expressions/evaluateHelper.js":104,"../../expressions/expressionsUtils.js":108,"./contentHelper.js":73}],77:[function(_dereq_,module,exports){
/*
    TALDeclare class
*/
"use strict";

var context = _dereq_( '../../context.js' );
var ExpressionTokenizer = _dereq_( '../../expressions/expressionTokenizer.js' );
var expressionsUtils = _dereq_( '../../expressions/expressionsUtils.js' );

var TALDeclare = function( _string, _declareItems ) {
    
    var string = _string;
    var declareItems = _declareItems;
    
    var process = function( scope, autoDefineHelper ){

        putVariables( scope, autoDefineHelper );

        return processDeclareItems( scope );
    };
    
    var putVariables = function( scope, autoDefineHelper ) {
        
        // Add strictModeVarName to the autoDefineHelper if needed
        var strictModeVarName = context.getConf().strictModeVarName;
        if ( true !== scope.get( strictModeVarName ) ){
            autoDefineHelper.put( strictModeVarName, 'true' );
        }
        
        // Build declared and required
        var declaredVarsVarName = context.getConf().declaredVarsVarName;
        var declared = scope.get( declaredVarsVarName ) || [];
        for ( var i = 0; i < declareItems.length; i++ ) {
            var declareItem = declareItems[ i ];
            declared.push( declareItem.name );
        }
        
        // Add declaredVarsVarName to the autoDefineHelper
        autoDefineHelper.put( 
            declaredVarsVarName, 
            expressionsUtils.buildList( declared, true )
        );
    };
    
    var processDeclareItems = function( scope ) {
        
        var errorsArray = [];

        for ( var i = 0; i < declareItems.length; i++ ) {
            var declareItem = declareItems[ i ];
            var errors = checkDeclareItem(
                scope,
                declareItem.name,
                declareItem.type,
                declareItem.required,
                declareItem.defaultValueString,
                declareItem.defaultValueExpression
            );
            errorsArray = errorsArray.concat( errors );
        }

        processErrorsArray( errorsArray );

        return errorsArray.length === 0;
    };

    var checkDeclareItem = function( scope, name, type, required, defaultValueString, defaultValueExpression ) {
        
        var errorsArray = [];
        
        var value = scope.get( name );
        
        // Set default value if needed
        if ( value === undefined && defaultValueExpression !== undefined ){
            var setDefaultValueError = setDefaultValue( scope, name, type, defaultValueString, defaultValueExpression );
            if ( setDefaultValueError ){
                errorsArray.push( setDefaultValueError );
                return errorsArray;
            }
            value = scope.get( name );
        }
        
        // Check type
        var typeCheckError = checkType( name, type, value );
        if ( typeCheckError ){
            errorsArray.push( typeCheckError );
        }
        
        // Check required
        var requiredCheckError = checkRequired( name, required, value );
        if ( requiredCheckError ){
            errorsArray.push( requiredCheckError );
        }
        
        return errorsArray;
    };
    
    var checkType = function( name, expectedType, value ) {
        
        if ( ! expectedType ){
            return;
        }
        
        var realType = getTypeOf( value );
        return realType === expectedType.toLowerCase()? 
            false: 
            'Expected value type (' + expectedType.toLowerCase() + ') of ' + name + ' property does not match type (' + realType + '), value is "' + value + '".';
    };
    
    /*
        typeOf();                   // undefined
        typeOf(null);               // null
        typeOf(NaN);                // number
        typeOf(5);                  // number
        typeOf([]);                 // array
        typeOf('');                 // string
        typeOf(function () {});     // function
        typeOf(/a/)                 // regexp
        typeOf(new Date())          // date
        typeOf(new Error)           // error
        typeOf(Promise.resolve())   // promise
        typeOf(function *() {})     // generatorfunction
        typeOf(new WeakMap())       // weakmap
        typeOf(new Map())           // map
        typeOf({});                 // object
        typeOf(new MyConstructor()) // MyConstructor
    */
    var getTypeOf = function( value ){
        
        var temp = {}.toString.call( value ).split(' ')[ 1 ].slice( 0, -1 ).toLowerCase();
        return temp === 'object'? 
            value.constructor.name.toLowerCase(): 
            temp;
    };
    
    var checkRequired = function( name, required, value ) {
        
        return true === required && value === undefined? 
            'Required value must not be undefined: ' + name:
            false;
    };
    
    var setDefaultValue = function( scope, name, type, defaultValueString, defaultValueExpression ) {
        
        try {
            var defaultValue = defaultValueExpression.evaluate( scope );
            scope.set( name, defaultValue );
            return false;
            
        } catch ( e ) {
            return 'Error trying to evaluate default value of field ' + name + ', expression [' + defaultValueString + ']: ' + e;
        }
    };
    
    var processErrorsArray = function( errorsArray ) {

        if ( errorsArray.length === 0 ){
            return;
        }
        
        throw errorsArray;
    };
    
    var dependsOn = function(){
        return [];
    };
    
    var update = function(){
        // Nothing to do
    };
    
    var toString = function(){
        return "TALDeclare: " + string;
    };
    
    return {
        process: process,
        dependsOn: dependsOn,
        update: update,
        toString: toString,
        type: TALDeclare.id
    };
};

TALDeclare.id = 'tal:declare';

TALDeclare.build = function( string ) {

    var expressionBuilder = _dereq_( '../../expressions/expressionBuilder.js' );

    var declareItems = [];
    var omitTypes = [ 'undefined', 'null' ];
    
    var tokens = new ExpressionTokenizer( 
        string.trim(), 
        context.getConf().declareDelimiter, 
        true 
    );

    while ( tokens.hasMoreTokens() ) {
        
        var inPropTokens = new ExpressionTokenizer( 
            tokens.nextToken().trim(), 
            context.getConf().inDeclareDelimiter, 
            true 
        );
        
        var name = undefined;
        var type = undefined;
        var defaultValueString = undefined;
        var required = false;
        var state = 1;
        while ( inPropTokens.hasMoreTokens() ){
            var currentToken = inPropTokens.nextToken();
            if ( TALDeclare.tokenIsRequired( currentToken ) ){
                required = true;
                continue;
            }
            switch ( state ) {
                case 1:
                    name = currentToken;
                    break;
                case 2:
                    if ( -1 === omitTypes.indexOf( currentToken.toLowerCase() ) ){
                        type = currentToken;   
                    }
                    break;
                case 3:
                    defaultValueString = currentToken;
                    break;
                default:
                    throw 'Too many arguments in talDeclare item: ' + string.trim();
            }
            ++state;
        }
        
        // The name is the only required element
        if ( ! name ){
            continue;
        }
        
        declareItems.push({
            name: name,
            type: type,
            required: required,
            defaultValueString: defaultValueString,
            defaultValueExpression: defaultValueString == undefined? undefined: expressionBuilder.build( defaultValueString )
        });
    }

    return new TALDeclare( string, declareItems );
};

TALDeclare.tokenIsRequired = function( token ) {
    return "required" === token.toLowerCase();
};

module.exports = TALDeclare;

},{"../../context.js":87,"../../expressions/expressionBuilder.js":106,"../../expressions/expressionTokenizer.js":107,"../../expressions/expressionsUtils.js":108}],78:[function(_dereq_,module,exports){
/*
    TALDefine class
*/
"use strict";

var context = _dereq_( '../../context.js' );
var ExpressionTokenizer = _dereq_( '../../expressions/expressionTokenizer.js' );

var TALDefine = function( stringToApply, defineItemsToApply ) {
    
    var string = stringToApply;
    var defineItems = defineItemsToApply;
    
    var process = function( scope, forceGlobal ){
        
        // Update scope
        for ( var i = 0; i < defineItems.length; i++ ) {
            var defineItem = defineItems[ i ];
            scope.set( 
                    defineItem.name, 
                    defineItem.nocall? defineItem.expression: defineItem.expression.evaluate( scope ), 
                    forceGlobal || defineItem.global,
                    defineItem.nocall,
                    defineItem.expression
            );
        }
    };
    
    var dependsOn = function(){
        return [];
    };
    
    var update = function(){
        // Nothing to do
    };
    
    var toString = function(){
        return "TALDefine: " + string;
    };
    
    return {
        process: process,
        dependsOn: dependsOn,
        update: update,
        toString: toString,
        type: TALDefine.id
    };
};

TALDefine.id = 'tal:define';

TALDefine.build = function( string ) {

    var expressionBuilder = _dereq_( '../../expressions/expressionBuilder.js' );

    var defineItems = [];
    var expressionString = string.trim();
    var tokens = new ExpressionTokenizer( 
        expressionString, 
        context.getConf().defineDelimiter, 
        true );

    while ( tokens.hasMoreTokens() ) {
        var variable = tokens.nextToken().trim();
        var space = variable.indexOf( context.getConf().inDefineDelimiter );
        if ( space === -1 ) {
            throw 'Bad variable definition: ' + variable;
        }

        var nocall = false;
        var global = false;
        var currentToken = variable.substring( 0, space );
        var nextTokens = variable.substring( space + 1 ).trim();
        var tokenDone = false;
        do {
            var specialToken = false;
            if ( context.getConf().globalVariableExpressionPrefix === currentToken ){
                global = true;
                specialToken = true;
            } else if ( context.getConf().nocallVariableExpressionPrefix === currentToken ){
                nocall = true;  
                specialToken = true;
            } 
            
            if ( specialToken ){
                space = nextTokens.indexOf( context.getConf().inDefineDelimiter );
                currentToken = nextTokens.substring( 0, space );
                nextTokens = nextTokens.substring( space + 1 ).trim();
                
            } else {
                defineItems.push({
                    name: currentToken,
                    expression: expressionBuilder.build( nextTokens ),
                    global: global,
                    nocall: nocall
                });
                tokenDone = true;
            }

        } while( ! tokenDone && space !== -1 );
    }

    return new TALDefine( string, defineItems );
};


TALDefine.appendStrings = function() {
    
    var result = arguments[ 0 ];
    
    for ( var c = 1; c < arguments.length; ++c ){
        var string = arguments[ c ];
        if ( string ){
            result = result? result + context.getConf().defineDelimiter + string: string;
        }
    }
    
    return result;
};

TALDefine.updateAttribute = function( node, defineToAdd ){

    var tags = context.getTags();
    var nodeDefine = node.getAttribute( tags.talDefine );
    var fullDefine = TALDefine.appendStrings( defineToAdd, nodeDefine );

    if ( fullDefine ){
        node.setAttribute( tags.talDefine, fullDefine );
    }
};

module.exports = TALDefine;

},{"../../context.js":87,"../../expressions/expressionBuilder.js":106,"../../expressions/expressionTokenizer.js":107}],79:[function(_dereq_,module,exports){
/*
    TALOmitTag class
*/
"use strict";

var BooleanLiteral = _dereq_( '../../expressions/path/literals/booleanLiteral.js' );
var expressionsUtils = _dereq_( '../../expressions/expressionsUtils.js' );
var context = _dereq_( '../../context.js' );

var TALOmitTag = function( stringToApply, expressionToApply ) {
    
    var string = stringToApply;
    var expression = expressionToApply;
    
    var process = function( scope, node, parserNodeRenderer ){
        
        var result = expression.evaluate( scope );
        if ( ! result ){
            return false;
        }
        
        // Process the contents
        parserNodeRenderer.defaultContent( node );
        
        // Move children from current node to its parent and then remove it
        var tags = context.getTags();
        var parentNode = node.parentNode;
        while ( node.firstChild ) {
            if ( node.firstChild.nodeType === 1 ){
                node.firstChild.setAttribute( tags.qdup, 1 );
            }
            parentNode.appendChild( node.firstChild );
        }
        parentNode.removeChild( node );

        return true;
    };
    
    var dependsOn = function( scope ){
        return expressionsUtils.buildDependsOnList( undefined, scope, expression );
    };
    
    var update = function(){
        // Nothing to do
    };
    
    var toString = function(){
        return "TALOmitTag: " + string;
    };
    
    return {
        process: process,
        dependsOn: dependsOn,
        update: update,
        toString: toString,
        type: TALOmitTag.id
    };
};

TALOmitTag.id = 'tal:omit-tag';

TALOmitTag.build = function( string ) {
    
    var expressionBuilder = _dereq_( '../../expressions/expressionBuilder.js' );
    
    var expressionString = string.trim();
    var expression = expressionString == ''?
            new BooleanLiteral( true ):
            expressionBuilder.build( expressionString );
    
    return new TALOmitTag( string, expression );
};

module.exports = TALOmitTag;

},{"../../context.js":87,"../../expressions/expressionBuilder.js":106,"../../expressions/expressionsUtils.js":108,"../../expressions/path/literals/booleanLiteral.js":119}],80:[function(_dereq_,module,exports){
/*
    TALOnError class
*/
"use strict";

var context = _dereq_( '../../context.js' );
var contentHelper = _dereq_( './contentHelper.js' );

var TALOnError = function( stringToApply, structureToApply ) {
    
    var string = stringToApply;
    var structure = structureToApply;
    
    var putToAutoDefineHelper = function( autoDefineHelper ){

        // Add onErrorVarName to the autoDefineHelper
        autoDefineHelper.put(
            context.getConf().onErrorVarName,
            string,
            true
        );
        
        // Add onErrorStructureVarName to the autoDefineHelper
        autoDefineHelper.put(
            context.getConf().onErrorStructureVarName,
            structure,
            false
        );
    };

    var dependsOn = function(){
        return [];
    };
    
    var update = function(){
        // Nothing to do
    };
    
    var toString = function(){
        return "TALOnError: " + string;
    };
    
    return {
        putToAutoDefineHelper: putToAutoDefineHelper,
        dependsOn: dependsOn,
        update: update,
        toString: toString,
        type: TALOnError.id
    };
};

TALOnError.id = 'tal:on-error';

TALOnError.build = function( string ) {

    return contentHelper.build( 
        'TALOnError',
        string,
        function( _string, _expression, _structure, _expressionString ){
            return new TALOnError( _expressionString, _structure );
        }
    );
};

module.exports = TALOnError;

},{"../../context.js":87,"./contentHelper.js":73}],81:[function(_dereq_,module,exports){
/*
    TALRepeat class
*/
"use strict";

var expressionsUtils = _dereq_( '../../expressions/expressionsUtils.js' );
var expressionBuilder = _dereq_( '../../expressions/expressionBuilder.js' );
var Loop = _dereq_( '../../parsers/loop.js' );

var TALRepeat = function( stringToApply, varNameToApply, expressionStringToApply ) {
    
    var string = stringToApply;
    var varName = varNameToApply;
    var expressionString = expressionStringToApply;
    var expression = expressionBuilder.build( expressionString );
    var loop;
    
    var process = function( scope ){
        loop = new Loop( varName, expressionString, scope );
        return loop;
    };
    
    var dependsOn = function( scope ){
        return expressionsUtils.buildDependsOnList( undefined, scope, expression );
    };
    
    var update = function( parserUpdater, node ){
        parserUpdater.updateNode( node );
    };
    
    var toString = function(){
        return "TALRepeat: " + string;
    };
    
    var getExpressionString = function(){
        return expressionString;
    };
    
    var getVarName = function(){
        return varName;
    };
    
    return {
        process: process,
        dependsOn: dependsOn,
        update: update,
        toString: toString,
        type: TALRepeat.id,
        getExpressionString: getExpressionString,
        getVarName: getVarName
    };
};

TALRepeat.id = 'tal:repeat';

TALRepeat.build = function( string ) {
    
    var expressionString = string.trim();
    var space = expressionString.indexOf( ' ' );
    if ( space === -1 ) {
        throw 'Bad repeat expression: ' + expressionString;
    }
    var varName = expressionString.substring( 0, space );
    var loopExpression = expressionString.substring( space + 1 );
    
    return new TALRepeat( string, varName, loopExpression );
};

module.exports = TALRepeat;

},{"../../expressions/expressionBuilder.js":106,"../../expressions/expressionsUtils.js":108,"../../parsers/loop.js":148}],82:[function(_dereq_,module,exports){
/*
    TALReplace class
*/
"use strict";

var evaluateHelper = _dereq_( '../../expressions/evaluateHelper.js' );
var contentHelper = _dereq_( './contentHelper.js' );
var expressionsUtils = _dereq_( '../../expressions/expressionsUtils.js' );

var TALReplace = function( stringToApply, expressionToApply, structureToApply ) {
    
    var string = stringToApply;
    var expression = expressionToApply;
    var structure = structureToApply;
    
    var process = function( scope, node ){
        
        // Evaluate
        var evaluated = evaluateHelper.evaluateToNotNull( scope, expression );
        
        // Check default
        if ( evaluateHelper.isDefault( evaluated ) ){
            return true;
        }

        // Check nothing
        if ( evaluateHelper.isNothing( evaluated ) ){
            evaluated = "";
        }
        
        if ( structure ){
            // Replace HTML
            node.outerHTML = evaluated;
            
        } else {
            // Replace original node by new text node
            var textNode = node.ownerDocument.createTextNode( evaluated );
            node.parentNode.replaceChild( textNode, node );
        }
        
        return true;
    };
    
    var dependsOn = function( scope ){
        //return expressionsUtils.buildDependsOnList( depsDataItem, scope, expression );
        return expressionsUtils.buildDependsOnList( undefined, scope, expression );
    };
    
    var update = function(){
        // Nothing to do
    };
    
    var toString = function(){
        return 'TALReplace: ' + string;
    };
    
    return {
        process: process,
        dependsOn: dependsOn,
        update: update,
        toString: toString,
        type: TALReplace.id
    };
};

TALReplace.id = 'tal:replace';

TALReplace.build = function( string ) {

    return contentHelper.build( 
        'TALReplace',
        string,
        function( _string, _expression, _structure ){
            return new TALReplace( _string, _expression, _structure );
        }
    );
};

module.exports = TALReplace;

},{"../../expressions/evaluateHelper.js":104,"../../expressions/expressionsUtils.js":108,"./contentHelper.js":73}],83:[function(_dereq_,module,exports){
/* 
    attributeIndex singleton class
*/
"use strict";

var utils = _dereq_( '../utils.js' );
var context = _dereq_( '../context.js' );

module.exports = (function() {
    
    var map;
    
    var reset = function(){
        map = {};
    };
    reset();
    
    var add = function( node, attributeInstance, scope ){
        
        addList(
            node,
            attributeInstance,
            attributeInstance.dependsOn( scope )
        );
    };
    
    var addList = function( node, attributeInstance, list, groupId ){
        
        for ( var i = 0; i < list.length; i++ ) {
            addAny( node, attributeInstance, list[ i ], groupId );
        }
    };
    var addObject = function( node, attributeInstance, item ){
        
        for ( var groupId in item ){
            addAny( node, attributeInstance, item[ groupId ], groupId );
        }
    };
    var addAny = function( node, attributeInstance, item, groupId ){
        
        if ( utils.isPlainObject( item ) ){
            addObject( node, attributeInstance, item );
        } else if ( Array.isArray( item ) ){
            addList( node, attributeInstance, item, groupId );
        } else {
            addVar( node, attributeInstance, item, groupId );
        }
    };
    /*
    var addVar = function( node, attributeInstance, varName, groupId  ){
        
        var list = map[ varName ];
        if ( ! list ){
            list = [];
            map[ varName ] = list;
        }

        list.push(
            {
                attributeInstance: attributeInstance,
                nodeId: node.getAttribute( context.getTags().id ),
                groupId: groupId
            }
        );
    };
    */
    var addVar = function( node, attributeInstance, varName, groupId  ){
        
        var list = map[ varName ];
        if ( ! list ){
            list = [];
            map[ varName ] = list;
        }
        
        var newItem = {
            attributeInstance: attributeInstance,
            nodeId: node.getAttribute( context.getTags().id ),
            groupId: groupId
        };
        
        //var index = list.findIndex( item => utils.deepEqual( item, newItem ) );
        var index = list.findIndex( 
            function( item ) { 
                return utils.deepEqual( item, newItem );
            }
        );
        if ( index === -1 ){
            list.push( newItem );
        } else {
            list[ index ] = newItem;
        }
    };
    
    var getVarsList = function( varName ){
        
        var items = map[ varName ];
        
        // Return an empty list if needed
        if ( items === undefined ){
            return [];
        }
        
        // Remove items with removed nodes
        cleanItems( items );
        
        // We must build another list to avoid sync errors
        var result = [];
        result = result.concat( items );
        return result;
    };
    
    //TODO findNodeById duplicated
    var findNodeById = function ( nodeId ) {
        
        return window.document.querySelector( 
            '[' + context.getTags().id + '="' + nodeId + '"]' 
        );
    };
    
    // Iterate through items and remove them when node does not exist in DOM
    var cleanItems = function( items ){
        
        var indexesToRemove = [];
        
        // Build list of items to remove
        for ( var i = 0; i < items.length; ++i ){
            var item = items[ i ];
            var node = findNodeById( item.nodeId );
            if ( ! node ){
                indexesToRemove.push( i );
            }
        }
        
        // Remove items
        for ( var j = indexesToRemove.length - 1; j >= 0 ; --j ){
            var indexToRemove = indexesToRemove[ j ];
            items.splice( indexToRemove, 1 );
        };
    };
    /*
    var removeVar = function( varName, nodeId ){
        
        var list = map[ varName ];

        var filtered = list.filter(
            function( value, index, arr ){
                return value.nodeId !== nodeId;
            }
        );

        map[ varName ] = filtered;
    };
    
    var removeVarFromNodes = function( varName, nodeIds ){
        
        var list = map[ varName ];

        var filtered = list.filter(
            function( value, index, arr ){
                return nodeIds.indexOf( value.nodeId ) === -1;
            }
        );

        if ( filtered.length === 0 ){
            delete map[ varName ];
        } else {
            map[ varName ] = filtered;
        }
        
    };
    
    var getAllNodeIds = function( target ){
        
        // Get the list
        var list = target.querySelectorAll( '[' + context.getTags().id + ']' );

        // Iterate the list
        var result = [];
        var nodeIdAttributeName = context.getTags().id;
        var node;
        var pos = 0;
        while ( node = list[ pos++ ] ) {
            result.push( 
                node.getAttribute( nodeIdAttributeName ) 
            );
        }
        
        return result;
    };
    
    var removeNode = function( node ){

        var nodeIds = getAllNodeIds( node );

        var nodeId = node.getAttribute( context.getTags().id );
        nodeIds.push( nodeId );
        
        for ( var varName in map ){
            removeVarFromNodes( varName, nodeIds );
        }
    };
    
    var removeMultipleNodes = function( nodeIds ){

        for ( var varName in map ){
            removeVarFromNodes( varName, nodeIds );
        }
    };
    */
    return {
        add: add,
        getVarsList: getVarsList,
        //removeVar: removeVar,
        //removeNode: removeNode,
        //removeMultipleNodes: removeMultipleNodes,
        reset: reset
    };
})();

},{"../context.js":87,"../utils.js":161}],84:[function(_dereq_,module,exports){
/*
    attributeCache singleton class
*/
"use strict";

var CacheHelper = _dereq_( './cacheHelper.js' );
var context = _dereq_( '../context.js' );
var log = _dereq_( '../logHelper.js' );
var attributeIndex = _dereq_( '../attributes/attributeIndex.js' );

module.exports = (function() {
    
    var map;
    
    var reset = function(){
        map = {};
    };
    reset();
    
    var get = function( attribute, string ) {
        
        var attributeMap = map[ attribute ];
        
        if ( ! attributeMap ){
            return null;
        }
         
        return attributeMap[ CacheHelper.hashCode( string ) ];
    };
    
    var put = function( attribute, string, value ){
        
        var attributeMap = map[ attribute ];
        
        if ( ! attributeMap ){
            attributeMap = {};
            map[ attribute ] = attributeMap;
        }
        
        attributeMap[ CacheHelper.hashCode( string ) ] = value;
    };
    
    var index = function( node, attribute, scope ){
        
        if ( node ){
            log.debug( 'Must index!' );
            attributeIndex.add( node, attribute, scope );
            
        } else {
            log.debug( 'Not indexed!' );
        }
        
        return attribute;
    };
    
    var getByDetails = function( attributeType, string, buildFunction, force, node, scope ) {
        
        log.debug( 
            'Request building of ZPT attribute "' + string + '", force "' + force + '"' );
        
        // Get from cache if possible
        if ( force || ! context.getConf().attributeCacheOn ){
            log.debug( 'Cache OFF!' );
            
        } else {
            log.debug( 'Cache ON!' );
            var fromCache = get( attributeType, string );
            if ( fromCache ){
                log.debug( 'Found in cache!' );
                //return fromCache;
                return index( node, fromCache, scope );
            } else {
                log.debug( 'NOT found in cache!' );
            }
        }
        
        // Force build and put into cache
        log.debug( 'Must build!' );
        var builded = buildFunction();
        put( attributeType, string, builded );
        //return builded;
        return index( node, builded, scope );
    };
    
    var getByAttributeClass = function( attributeInstance, string, node, indexExpressions, scope, constructor ) {
        
        return getByDetails( 
                attributeInstance.id, 
                string, 
                constructor || function(){
                    return attributeInstance.build( string );
                }, 
                false,
                indexExpressions? node: undefined,
                scope
        );
    };
    
    return {
        //getByDetails: getByDetails,
        getByAttributeClass: getByAttributeClass,
        reset: reset
    };
})();

},{"../attributes/attributeIndex.js":83,"../context.js":87,"../logHelper.js":134,"./cacheHelper.js":85}],85:[function(_dereq_,module,exports){
/*
    cacheHelper singleton class
*/
module.exports = (function() {
    "use strict";
    
    var hashCode = function( string ) {

        if ( Array.prototype.reduce ) {
            return string.split( "" ).reduce(
                function( a, b ){
                    a = ( ( a << 5 ) - a ) + b.charCodeAt( 0 );
                    return a&a
                },
                0 );
        }

        var hash = 0;
        if ( string.length === 0 ){
            return hash;
        }
        for ( var i = 0, len = string.length; i < len; i++ ) {
            var chr = string.charCodeAt( i );
            hash = ( ( hash << 5 ) - hash ) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        
        return hash;
    };
    
    return {
        hashCode: hashCode
    };
})();

},{}],86:[function(_dereq_,module,exports){
/*
    expressionCache singleton class
*/
module.exports = (function() {
    "use strict";
    
    var CacheHelper = _dereq_( './cacheHelper.js' );
    var context = _dereq_( '../context.js' );
    var log = _dereq_( '../logHelper.js' );
    
    var map = {};
    
    var get = function( string ) {
        return map[ CacheHelper.hashCode( string ) ];
    };
    
    var put = function( string, value ){
        map[ CacheHelper.hashCode( string ) ] = value;
    };
    
    var process = function( string, buildFunction, force ) {
        
        log.debug( 
            'Request building of expression "' + string + '", force "' + force + '"' );
        
        // Get from cache if possible
        if ( ! force && context.getConf().expressionCacheOn ){
            log.debug( 'Cache ON!' );
            var fromCache = get( string );
            if ( fromCache ){
                log.debug( 'Found in cache!' );
                return fromCache;
            } 
            log.debug( 'NOT found in cache!' );
            
        } else {
            log.debug( 'Cache OFF!' );
        }
        
        // Force build and put into cache
        log.debug( 'Must build!' );
        var builded = buildFunction();
        put( string, builded );
        return builded;
    };
    
    var clean = function( ) {
        map = {};
    };
    
    return {
        get: process,
        clean: clean
    };
})();

},{"../context.js":87,"../logHelper.js":134,"./cacheHelper.js":85}],87:[function(_dereq_,module,exports){
/* 
    context singleton class
*/

var log4javascript = _dereq_( 'log4javascript' );
var utils = _dereq_( './utils.js' );
var LoopItem = _dereq_( './parsers/loopItem.js' );
var CSSAnimationManager = _dereq_( './parsers/dictionaryActions/cssAnimationManager.js' );

module.exports = (function() {
    "use strict";
    
    /* Tags */
    var defaultTags = {
        talCondition:     "data-condition",
        talRepeat:        "data-repeat",
        talAttributes:    "data-attributes",
        talContent:       "data-content",
        talDefine:        "data-define",
        talAutoDefine:    "data-tauto-define",
        talOmitTag:       "data-omit-tag",
        talReplace:       "data-replace",
        talOnError:       "data-on-error",
        talDeclare:         "data-declare",
        metalDefineMacro: "data-define-macro",
        metalUseMacro:    "data-use-macro",
        metalDefineSlot:  "data-define-slot",
        metalFillSlot:    "data-fill-slot",
        metalMacro:       "data-mmacro",
        i18nDomain:       "data-domain",
        i18nLanguage:     "data-language",
        //scopeKey:         "data-scope-key",
        rootKey:          "data-root-key",
        qdup:             "data-qdup",
        id:               "data-id",
        relatedId:        "data-related-id",
        conditionResult:  "data-condition-result"
    };
    var originalTags = {
        talCondition:     "tal:condition",
        talRepeat:        "tal:repeat",
        talAttributes:    "tal:attributes",
        talContent:       "tal:content",
        talDefine:        "tal:define",
        talAutoDefine:    "tal:auto-define",
        talOmitTag:       "tal:omit-tag",
        talReplace:       "tal:replace",
        talOnError:       "tal:on-error",
        talDeclare:       "tal:declare",
        metalDefineMacro: "metal:define-macro",
        metalUseMacro:    "metal:use-macro",
        metalDefineSlot:  "metal:define-slot",
        metalFillSlot:    "metal:fill-slot",
        metalMacro:       "data-mmacro",
        i18nDomain:       "i18n:domain",
        i18nLanguage:     "i18n:language",
        //scopeKey:         "data-scope-key",
        rootKey:          "data-root-key",
        qdup:             "data-qdup",
        id:               "data-id",
        relatedId:        "data-related-id",
        conditionResult:  "data-condition-result"
    };
    var tags = defaultTags;
    var tal = '';
    
    var getTags = function (){
        return tags;
    };
    
    var setTags = function ( tagsToSet ){
        tags = tagsToSet;
        tal = '';
    };
    
    var getTal = function (){
        if ( tal === '' ){
            var c = 0;
            var notInclude = tags.qdup;
            for ( var property in tags ) {
                if ( notInclude === tags[ property ] ){
                    continue;
                }
                if ( c++ > 0){
                    tal += ",";
                }
                tal += "*[" + tags[ property ] + "]";
            }
        }
        
        return tal;
    };
    var useOriginalTags = function(){
        setTags( originalTags );
    };
    /* End Tags */
    
    /* Formatters */
    var formatters = {};
    formatters.lowerCase = function ( value ){
        return value.toLocaleLowerCase();
    };
    formatters.upperCase = function ( value ){
        return value.toLocaleUpperCase();
    };
    formatters.localeDate = function ( value ){
        return value.toLocaleDateString;
    };
    formatters.localeTime = function ( value ){
        return value.toLocaleTimeString;
    };
    formatters.localeString = function ( value, locale ){
        return locale? 
               value.toLocaleString( value, locale ): 
               value.toLocaleString( value );
    };
    formatters.fix = function ( number, fixTo ){
        return number.toFixed( fixTo );
    };
    
    var getFormatter = function ( id ){
        return formatters[ id ];
    };
    
    var registerFormatter = function ( id, formatter ){
        formatters[ id ] = formatter;
    };
    var unregisterFormatter = function ( id ){
        delete formatters[ id ];
    };
    /* End Formatters */
    
    /* Conf */
    var EXPRESSION_SUFFIX = ':';
    var PRIVATE_VARS_PREFIX = '_';
    var defaultConf = {
        pathDelimiter:          '|',
        pathSegmentDelimiter:   '/',
        expressionDelimiter:    ' ',
        intervalDelimiter:      ':',
        propertyDelimiter:      '/',
        defineDelimiter:        ';',
        inDefineDelimiter:      ' ',
        attributeDelimiter:     ';',
        inAttributeDelimiter:   ' ',
        domainDelimiter:        ' ',
        i18nOptionsDelimiter:   ';',
        inI18nOptionsDelimiter: ' ',
        argumentsDelimiter:     ',',
        macroDelimiter:         '@',
        declareDelimiter:         ';',
        inDeclareDelimiter:       ' ',
        
        i18nConfResourceId:      "/CONF/",
        
        htmlStructureExpressionPrefix:  "structure",
        globalVariableExpressionPrefix: "global",
        nocallVariableExpressionPrefix: "nocall",
        
        templateErrorVarName:    "error",
        onErrorVarName:          PRIVATE_VARS_PREFIX + "on-error",
        onErrorStructureVarName: PRIVATE_VARS_PREFIX + "on-error-structure",
        i18nDomainVarName:       PRIVATE_VARS_PREFIX + "i18nDomain",
        i18nLanguageVarName:     PRIVATE_VARS_PREFIX + "i18nLanguage",
        externalMacroUrlVarName: PRIVATE_VARS_PREFIX + "externalMacroUrl",
        strictModeVarName:       PRIVATE_VARS_PREFIX + "strictMode",
        declaredVarsVarName:     PRIVATE_VARS_PREFIX + "declaredVars",
        repeatVarName:           PRIVATE_VARS_PREFIX + "repeat",
        
        windowVarName:           "window",
        contextVarName:          "context",
        
        nothingVarName:          "nothing",
        defaultVarName:          "default",
        nothingVarValue:         "___nothing___",
        defaultVarValue:         "___default___",
        
        loggingOn:    false,
        loggingLevel: log4javascript.Level.ERROR,

        externalMacroPrefixURL: "",
        variableNameRE:         /^[A-Za-z0-9_/-]+$/,
        expressionCacheOn:      true,
        attributeCacheOn:       true,

        expressionSuffix:     EXPRESSION_SUFFIX,
        stringExpression:     "string" + EXPRESSION_SUFFIX,
        existsExpression:     "exists" + EXPRESSION_SUFFIX,
        notExpression:        "not" + EXPRESSION_SUFFIX,
        javaScriptExpression: "js" + EXPRESSION_SUFFIX,
        equalsExpression:     "eq" + EXPRESSION_SUFFIX,
        greaterExpression:    "gt" + EXPRESSION_SUFFIX,
        lowerExpression:      "lt" + EXPRESSION_SUFFIX,
        addExpression:        "+" + EXPRESSION_SUFFIX,
        subExpression:        "-" + EXPRESSION_SUFFIX,
        mulExpression:        "*" + EXPRESSION_SUFFIX,
        divExpression:        "/" + EXPRESSION_SUFFIX,
        modExpression:        "%" + EXPRESSION_SUFFIX,
        orExpression:         "or" + EXPRESSION_SUFFIX,
        andExpression:        "and" + EXPRESSION_SUFFIX,
        condExpression:       "cond" + EXPRESSION_SUFFIX,
        formatExpression:     "format" + EXPRESSION_SUFFIX,
        trExpression:         "tr" + EXPRESSION_SUFFIX,
        trNumberExpression:   "trNumber" + EXPRESSION_SUFFIX,
        trCurrencyExpression: "trCurrency" + EXPRESSION_SUFFIX,
        trDateTimeExpression: "trDate" + EXPRESSION_SUFFIX,
        inExpression:         "in" + EXPRESSION_SUFFIX,
        queryExpression:      "query" + EXPRESSION_SUFFIX,
        pathExpression:       "",
        
        firstIndexIdentifier: "_first_",
        lastIndexIdentifier:  "_last_"
    };
    var conf = defaultConf;
    
    var getConf = function (){
        return conf;
    };
    
    var setConf = function ( confToSet ){
        conf = confToSet;
    };
    /* End conf */
    
    /* Logger */
    var logger;
    var getDefaultLogger = function (){
        
        var defaultLogger = log4javascript.getDefaultLogger();
        
        defaultLogger.setLevel( getConf().loggingLevel );
        //defaultLogger.removeAllAppenders();
        //defaultLogger.addAppender( new log4javascript.BrowserConsoleAppender( true ) );
        
        return defaultLogger;
    };
    var getLogger = function (){
        
        if ( ! logger && getConf().loggingOn ){
            logger = getDefaultLogger();
        }
        
        return logger;
    };
    var setLogger = function ( loggerToSet ){
        logger = loggerToSet;
    };
    /* End Logger */
    
    /* 
        Boolean attributes:
        The presence of a boolean attribute on an element represents the true value, and the absence of the attribute represents the false value.
    */
    var booleanAttributes = {
        checked: 1,
        compact: 1,
        declare: 1,
        defer: 1,
        disabled: 1,
        ismap: 1,
        multiple: 1,
        nohref: 1,
        noresize: 1,
        noshade: 1,
        nowrap: 1,
        readonly: 1,
        selected: 1
    };
    
    var getBooleanAttributes = function (){
        return booleanAttributes;
    };
    var setBooleanAttributes = function ( booleanAttributesToSet ){
        booleanAttributes = booleanAttributesToSet;
    };
    var isBooleanAttribute = function ( attribute ){
        return booleanAttributes[ attribute ] === 1;
    };
    /* End Boolean attributes */
    
    /* 
        Alt attributes:
        Attributes which don't support setAttribute().
    */
    var altAttributes = {
        className: 1,
        class: 1,
        href: 1,
        htmlFor: 1,
        id: 1,
        innerHTML: 1,
        label: 1,
        style: 1,
        src: 1,
        text: 1,
        title: 1,
        value: 1
    };
    // All booleanAttributes are also altAttributes
    utils.extend( altAttributes, booleanAttributes );
    
    var getAltAttributes = function (){
        return altAttributes;
    };
    var setAltAttributes = function ( altAttributesToSet ){
        altAttributes = altAttributesToSet;
    };
    var isAltAttribute = function ( attribute ){
        return altAttributes[ attribute ] === 1;
    };
    /* End Alt attributes */
    
    /* Errors */
    var defaultErrorFunction = function( error ) {
        
        var msg = Array.isArray( error )?
            error.join( '\n' ):
            error;
        
        window.alert( msg );
        
        throw msg;
    };
    var errorFunction = defaultErrorFunction;
    var setErrorFunction = function( _errorFunction ){
        self.errorFunction = _errorFunction;
    };
    var asyncError = function( url, errorMessage, failCallback ){

        var msg = 'Error trying to get ' + url + ': ' + errorMessage;
        if ( failCallback ){
            failCallback( msg );
        } else {
            errorFunction( msg );
        }
    };
    /* End errors */
    
    /* Repeat */
    var repeat = function( index, length, offset ){
        return new LoopItem( index, length, offset );
    };
    /* End repeat*/
    
    /* Folder dictionaries */
    var folderDictionaries = [];
    var setFolderDictionaries = function( _folderDictionaries ){
        folderDictionaries = _folderDictionaries;
    };
    var getFolderDictionaries = function(){
        return folderDictionaries;
    };
    /* End folder dictionaries */
    
    /* Strict mode  */
    var strictMode = false;
    var setStrictMode = function( _strictMode ){
        strictMode = _strictMode;
    };
    var isStrictMode = function(){
        return strictMode;
    };
    /* End strict mode  */
    
    /* Expression counter */
    var expressionCounter = 0;
    var nextExpressionCounter = function(){
        return ++expressionCounter;
    };
    var setExpressionCounter = function( _expressionCounter ){
        expressionCounter = _expressionCounter;
    };
    /* End expression counter */
    
    /* Run counter */
    var runCounter = 0;
    var nextRunCounter = function(){
        return ++runCounter;
    };
    /* End run counter */
    
    /* Animation managers */
    var defaultAnimationManager = CSSAnimationManager;
    var animationManager = defaultAnimationManager;
    var getAnimationManager = function(){
        return animationManager;
    };
    var setAnimationManager = function( _animationManager ){
        animationManager = _animationManager;
    };
    /* End animation managers*/
    
    var self = {
        getTags: getTags,
        setTags: setTags,
        getTal: getTal,
        getFormatter: getFormatter,
        registerFormatter: registerFormatter,
        unregisterFormatter: unregisterFormatter,
        getConf: getConf,
        setConf: setConf,
        getLogger: getLogger,
        setLogger: setLogger,
        useOriginalTags: useOriginalTags,
        getBooleanAttributes: getBooleanAttributes,
        setBooleanAttributes: setBooleanAttributes,
        isBooleanAttribute: isBooleanAttribute,
        getAltAttributes: getAltAttributes,
        setAltAttributes: setAltAttributes,
        isAltAttribute: isAltAttribute,
        errorFunction: errorFunction,
        setErrorFunction: setErrorFunction,
        asyncError: asyncError,
        repeat: repeat,
        setFolderDictionaries: setFolderDictionaries,
        getFolderDictionaries: getFolderDictionaries,
        setStrictMode: setStrictMode,
        isStrictMode: isStrictMode,
        nextExpressionCounter: nextExpressionCounter,
        setExpressionCounter: setExpressionCounter,
        nextRunCounter: nextRunCounter,
        getAnimationManager: getAnimationManager,
        setAnimationManager: setAnimationManager
    };
    
    return self;
})();

},{"./parsers/dictionaryActions/cssAnimationManager.js":144,"./parsers/loopItem.js":149,"./utils.js":161,"log4javascript":63}],88:[function(_dereq_,module,exports){
/*
    AddExpression class
*/
"use strict";

var context = _dereq_( '../../context.js' );
var arithmethicHelper = _dereq_( './arithmethicHelper.js' );
var expressionsUtils = _dereq_( '../expressionsUtils.js' );

var AddExpression = function( stringToApply, expressionListToApply ) {
    
    var string = stringToApply;
    var expressionList = expressionListToApply;
    
    var evaluate = function( scope ){

        return arithmethicHelper.evaluate( 
            string,
            scope,
            expressionList, 
            AddExpression.mathOperation, 
            function( total, value ){
                return total + value;
            } 
        );
    };
    
    var dependsOn = function( depsDataItem, scope ){
        return expressionsUtils.buildDependsOnList( depsDataItem, scope, expressionList );
    };
    
    var toString = function(){
        return string;
    };
    
    return {
        evaluate: evaluate,
        dependsOn: dependsOn,
        toString: toString
    };
};

AddExpression.removePrefix = true;
AddExpression.getPrefix = function() {
    return context.getConf().addExpression;
};
AddExpression.mathOperation = 'add';
AddExpression.getId = AddExpression.mathOperation;

AddExpression.build = function( string ) {
    
    var expressionList = arithmethicHelper.build( 
            string,
            AddExpression.mathOperation 
    );

    return new AddExpression( string, expressionList );
};

module.exports = AddExpression;

},{"../../context.js":87,"../expressionsUtils.js":108,"./arithmethicHelper.js":89}],89:[function(_dereq_,module,exports){
/* 
    arithmethicHelper singleton class
*/
module.exports = (function() {
    "use strict";
    
    var context = _dereq_( '../../context.js' );
    var ExpressionTokenizer = _dereq_( '../expressionTokenizer.js' );
    var evaluateHelper = _dereq_( '../evaluateHelper.js' );
    
    var build = function( string, tag ) {
        var expressionBuilder = _dereq_( '../expressionBuilder.js' );

        if ( string.length === 0 ) {
            throw tag + " expression void.";
        }
        
        var segments = new ExpressionTokenizer( 
                string, 
                context.getConf().expressionDelimiter, 
                false 
        );

        return expressionBuilder.buildList( segments );
    };
    
    var evaluate = function( string, scope, expressionList, mathOperation, arithmethicFunction ) {
        
        // Evaluate segments
        var result = 0;
        var c = 0;
        
        for ( var i = 0; i < expressionList.length; i++ ) {
            var expression = expressionList[ i ];
            var evaluated = expression.evaluate( scope );
            
            if ( ! Array.isArray( evaluated ) ){ 
                // Process numeric value
                result = processInteger( 
                    c++, 
                    evaluated, 
                    result, 
                    arithmethicFunction, 
                    mathOperation, 
                    expression );
                
            } else {
                // Process array of numeric
                for ( var j = 0; j < evaluated.length; j++ ) {
                    result = processInteger( 
                        c++, 
                        evaluated[ j ], 
                        result, 
                        arithmethicFunction, 
                        mathOperation, 
                        expression );
                }
            }
        }
        
        if ( c < 2 ) {
            throw 'Error in expression "' + string + '". Only one element in evaluation of "' + mathOperation 
                + '" expression, please add at least one more.';
        }
        
        return result;
    };
    
    var processInteger = function( c, value, result, arithmethicFunction, mathOperation, expression ){
        
        if ( ! evaluateHelper.isNumber( value ) ) {
            throw "Error trying doing math operation, value '" + value 
                    + "' is not a valid number in expression '" + mathOperation + ' ' + expression + "'";
        }

        return c == 0? Number( value ): arithmethicFunction( result, Number( value ) );
    };
    
    return {
        build: build,
        evaluate: evaluate
    };
})();

},{"../../context.js":87,"../evaluateHelper.js":104,"../expressionBuilder.js":106,"../expressionTokenizer.js":107}],90:[function(_dereq_,module,exports){
/*
    DivideExpression class
*/
"use strict";

var context = _dereq_( '../../context.js' );
var arithmethicHelper = _dereq_( './arithmethicHelper.js' );
var expressionsUtils = _dereq_( '../expressionsUtils.js' );

var DivideExpression = function( stringToApply, expressionListToApply ) {
    
    var string = stringToApply;
    var expressionList = expressionListToApply;
    
    var evaluate = function( scope ){

        return arithmethicHelper.evaluate( 
            string,
            scope,
            expressionList, 
            DivideExpression.mathOperation, 
            function( total, value ){
                return total / value;
            } 
        );
    };

    var dependsOn = function( depsDataItem, scope ){
        return expressionsUtils.buildDependsOnList( depsDataItem, scope, expressionList );
    };
    
    var toString = function(){
        return string;
    };
    
    return {
        evaluate: evaluate,
        dependsOn: dependsOn,
        toString: toString
    };
};

DivideExpression.removePrefix = true;
DivideExpression.getPrefix = function() {
    return context.getConf().divExpression;
};
DivideExpression.mathOperation = 'divide';
DivideExpression.getId = DivideExpression.mathOperation;

DivideExpression.build = function( string ) {
    
    var expressionList = arithmethicHelper.build( 
            string,
            DivideExpression.mathOperation 
    );

    return new DivideExpression( string, expressionList );
};

module.exports = DivideExpression;

},{"../../context.js":87,"../expressionsUtils.js":108,"./arithmethicHelper.js":89}],91:[function(_dereq_,module,exports){
/*
    ModExpression class
*/
"use strict";

var context = _dereq_( '../../context.js' );
var arithmethicHelper = _dereq_( './arithmethicHelper.js' );
var expressionsUtils = _dereq_( '../expressionsUtils.js' );

var ModExpression = function( stringToApply, expressionListToApply ) {
    
    var string = stringToApply;
    var expressionList = expressionListToApply;
    
    var evaluate = function( scope ){

        return arithmethicHelper.evaluate( 
            string,
            scope,
            expressionList, 
            ModExpression.mathOperation, 
            function( total, value ){
                return total % value;
            } 
        );
    };
    
    var dependsOn = function( depsDataItem, scope ){
        return expressionsUtils.buildDependsOnList( depsDataItem, scope, expressionList );
    };
    
    var toString = function(){
        return string;
    };
    
    return {
        evaluate: evaluate,
        dependsOn: dependsOn,
        toString: toString
    };
};

ModExpression.removePrefix = true;
ModExpression.getPrefix = function() {
    return context.getConf().modExpression;
};
ModExpression.mathOperation = 'mod';
ModExpression.getId = ModExpression.mathOperation;

ModExpression.build = function( string ) {
    
    var expressionList = arithmethicHelper.build( 
            string,
            ModExpression.mathOperation 
    );

    return new ModExpression( string, expressionList );
};

module.exports = ModExpression;

},{"../../context.js":87,"../expressionsUtils.js":108,"./arithmethicHelper.js":89}],92:[function(_dereq_,module,exports){
/*
    MultiplyExpression class
*/
"use strict";

var context = _dereq_( '../../context.js' );
var arithmethicHelper = _dereq_( './arithmethicHelper.js' );
var expressionsUtils = _dereq_( '../expressionsUtils.js' );

var MultiplyExpression = function( stringToApply, expressionListToApply ) {
    
    var string = stringToApply;
    var expressionList = expressionListToApply;
    
    var evaluate = function( scope ){

        return arithmethicHelper.evaluate( 
            string,
            scope,
            expressionList, 
            MultiplyExpression.mathOperation, 
            function( total, value ){
                return total * value;
            } 
        );
    };

    var dependsOn = function( depsDataItem, scope ){
        return expressionsUtils.buildDependsOnList( depsDataItem, scope, expressionList );
    };
    
    var toString = function(){
        return string;
    };
    
    return {
        evaluate: evaluate,
        dependsOn: dependsOn,
        toString: toString
    };
};

MultiplyExpression.removePrefix = true;
MultiplyExpression.getPrefix = function() {
    return context.getConf().mulExpression;
};
MultiplyExpression.mathOperation = 'multiply';
MultiplyExpression.getId = MultiplyExpression.mathOperation;

MultiplyExpression.build = function( string ) {
    
    var expressionList = arithmethicHelper.build( 
            string,
            MultiplyExpression.mathOperation 
    );

    return new MultiplyExpression( string, expressionList );
};

module.exports = MultiplyExpression;

},{"../../context.js":87,"../expressionsUtils.js":108,"./arithmethicHelper.js":89}],93:[function(_dereq_,module,exports){
/*
    SubstractExpression class
*/
"use strict";

var context = _dereq_( '../../context.js' );
var arithmethicHelper = _dereq_( './arithmethicHelper.js' );
var expressionsUtils = _dereq_( '../expressionsUtils.js' );

var SubstractExpression = function( stringToApply, expressionListToApply ) {
    
    var string = stringToApply;
    var expressionList = expressionListToApply;
    
    var evaluate = function( scope ){

        return arithmethicHelper.evaluate( 
            string,
            scope,
            expressionList, 
            SubstractExpression.mathOperation, 
            function( total, value ){
                return total - value;
            } 
        );
    };
    
    var dependsOn = function( depsDataItem, scope ){
        return expressionsUtils.buildDependsOnList( depsDataItem, scope, expressionList );
    };
    
    var toString = function(){
        return string;
    };
    
    return {
        evaluate: evaluate,
        dependsOn: dependsOn,
        toString: toString
    };
};

SubstractExpression.removePrefix = true;
SubstractExpression.getPrefix = function() {
    return context.getConf().subExpression;
};
SubstractExpression.mathOperation = 'substract';
SubstractExpression.getId = SubstractExpression.mathOperation;

SubstractExpression.build = function( string ) {
    
    var expressionList = arithmethicHelper.build( 
            string,
            SubstractExpression.mathOperation 
    );

    return new SubstractExpression( string, expressionList );
};

module.exports = SubstractExpression;

},{"../../context.js":87,"../expressionsUtils.js":108,"./arithmethicHelper.js":89}],94:[function(_dereq_,module,exports){
/*
    AndExpression class
*/
"use strict";

var context = _dereq_( '../../context.js' );
var evaluateHelper = _dereq_( '../evaluateHelper.js' );
var expressionsUtils = _dereq_( '../expressionsUtils.js' );

var AndExpression = function( stringToApply, expressionListToApply ) {
    
    var string = stringToApply;
    var expressionList = expressionListToApply;
    
    var evaluate = function( scope ){

        for ( var i = 0; i < expressionList.length; i++ ) {
            var expression = expressionList[ i ];
            if ( ! evaluateHelper.evaluateBoolean( scope, expression ) ){
                return false;
            }
        }

        return true;
    };
    
    var dependsOn = function( depsDataItem, scope ){
        return expressionsUtils.buildDependsOnList( depsDataItem, scope, expressionList );
    };
    
    var toString = function(){
        return string;
    };
    
    return {
        evaluate: evaluate,
        dependsOn: dependsOn,
        toString: toString
    };
};

AndExpression.removePrefix = true;
AndExpression.getPrefix = function() {
    return context.getConf().andExpression;
};
AndExpression.getId = AndExpression.getPrefix;

AndExpression.build = function( string ) {
    var boolHelper = _dereq_( './boolHelper.js' );
    
    var expressionList = boolHelper.build( string, 'And' );

    return new AndExpression( string, expressionList );
};

module.exports = AndExpression;

},{"../../context.js":87,"../evaluateHelper.js":104,"../expressionsUtils.js":108,"./boolHelper.js":95}],95:[function(_dereq_,module,exports){
/* 
    boolHelper singleton class
*/
"use strict";

module.exports = (function() {    
    var context = _dereq_( '../../context.js' );
    var ExpressionTokenizer = _dereq_( '../expressionTokenizer.js' );
    var expressionBuilder = _dereq_( '../expressionBuilder.js' );
    
    var build = function( s, tag ) {
        
        var string = s.trim();
        
        if ( string.length === 0 ) {
            throw tag + ' expression void.';
        }

        var segments = new ExpressionTokenizer( 
                string, 
                context.getConf().expressionDelimiter, 
                false );
        if ( segments.countTokens() === 1 ) {
            throw 'Syntax error in expression "' + string + '". Only one element in ' + tag + ' expression, please add at least one more.';
        }
        
        return expressionBuilder.buildList( segments );
    };
    
    return {
        build: build
    };
})();

},{"../../context.js":87,"../expressionBuilder.js":106,"../expressionTokenizer.js":107}],96:[function(_dereq_,module,exports){
/*
    CondExpression class
*/
"use strict";

var context = _dereq_( '../../context.js' );
var ExpressionTokenizer = _dereq_( '../expressionTokenizer.js' );
var expressionsUtils = _dereq_( '../expressionsUtils.js' );
var evaluateHelper = _dereq_( '../evaluateHelper.js' );

var CondExpression = function( stringToApply, expression1ToApply, expression2ToApply, expression3ToApply ) {
    
    var string = stringToApply;
    var expression1 = expression1ToApply;
    var expression2 = expression2ToApply;
    var expression3 = expression3ToApply;
    
    var evaluate = function( scope ){
        
        return evaluateHelper.evaluateBoolean( scope, expression1 )?
            expression2.evaluate( scope ):
            expression3.evaluate( scope );
    };
    
    var dependsOn = function( depsDataItem, scope ){
        return expressionsUtils.buildDependsOnList( depsDataItem, scope, expression1, expression2, expression3 );
    };
    
    var toString = function(){
        return string;
    };
    
    return {
        evaluate: evaluate,
        dependsOn: dependsOn,
        toString: toString
    };
};

CondExpression.removePrefix = true;
CondExpression.getPrefix = function() {
    return context.getConf().condExpression;
};
CondExpression.getId = CondExpression.getPrefix;

CondExpression.build = function( s ) {
    var expressionBuilder = _dereq_( '../expressionBuilder.js' );
    
    var string = s.trim();

    if ( string.length === 0 ) {
        throw 'Cond expression void.';
    }

    var segments = new ExpressionTokenizer( 
            string, 
            context.getConf().expressionDelimiter, 
            false );
    if ( segments.countTokens() !== 3 ) {
        throw 'Syntax error in cond expression "' + string + '". 3 element are needed.';
    }

    return new CondExpression( 
        string,
        expressionBuilder.build( segments.nextToken() ), 
        expressionBuilder.build( segments.nextToken() ), 
        expressionBuilder.build( segments.nextToken() ) 
    );
};

module.exports = CondExpression;

},{"../../context.js":87,"../evaluateHelper.js":104,"../expressionBuilder.js":106,"../expressionTokenizer.js":107,"../expressionsUtils.js":108}],97:[function(_dereq_,module,exports){
/*
    NotExpression class
*/
"use strict";

var context = _dereq_( '../../context.js' );
var evaluateHelper = _dereq_( '../evaluateHelper.js' );
var expressionsUtils = _dereq_( '../expressionsUtils.js' );

var NotExpression = function( stringToApply, expressionToApply ) {
    
    var string = stringToApply;
    var expression = expressionToApply;
    
    var evaluate = function( scope ){
        return ! evaluateHelper.evaluateBoolean( scope, expression );
    };

    var dependsOn = function( depsDataItem, scope ){
        return expressionsUtils.buildDependsOnList( depsDataItem, scope, expression );
    };
    
    var toString = function(){
        return string;
    };
    
    return {
        evaluate: evaluate,
        dependsOn: dependsOn,
        toString: toString
    };
};

NotExpression.removePrefix = true;
NotExpression.getPrefix = function() {
    return context.getConf().notExpression;
};
NotExpression.getId = NotExpression.getPrefix;

NotExpression.build = function( string ) {
    var expressionBuilder = _dereq_( '../expressionBuilder.js' );
    
    var expression = expressionBuilder.build( string );
    
    return new NotExpression( string, expression );
};

module.exports = NotExpression;

},{"../../context.js":87,"../evaluateHelper.js":104,"../expressionBuilder.js":106,"../expressionsUtils.js":108}],98:[function(_dereq_,module,exports){
/*
    OrExpression class
*/
"use strict";

var context = _dereq_( '../../context.js' );
var evaluateHelper = _dereq_( '../evaluateHelper.js' );
var expressionsUtils = _dereq_( '../expressionsUtils.js' );

var OrExpression = function( stringToApply, expressionListToApply ) {
    
    var string = stringToApply;
    var expressionList = expressionListToApply;
    
    var evaluate = function( scope ){

        for ( var i = 0; i < expressionList.length; i++ ) {
            var expression = expressionList[ i ];
            if ( evaluateHelper.evaluateBoolean( scope, expression ) ){
                return true;
            }
        }

        return false;
    };

    var dependsOn = function( depsDataItem, scope ){
        return expressionsUtils.buildDependsOnList( depsDataItem, scope, expressionList );
    };
    
    var toString = function(){
        return string;
    };
    
    return {
        evaluate: evaluate,
        dependsOn: dependsOn,
        toString: toString
    };
};

OrExpression.removePrefix = true;
OrExpression.getPrefix = function() {
    return context.getConf().orExpression;
};
OrExpression.getId = OrExpression.getPrefix;

OrExpression.build = function( string ) {
    var boolHelper = _dereq_( './boolHelper.js' );
    
    var expressionList = boolHelper.build( string, 'Or' );

    return new OrExpression( string, expressionList );
};

module.exports = OrExpression;

},{"../../context.js":87,"../evaluateHelper.js":104,"../expressionsUtils.js":108,"./boolHelper.js":95}],99:[function(_dereq_,module,exports){
/* 
    comparisonHelper singleton class
*/
"use strict";

module.exports = (function() {
    var context = _dereq_( '../../context.js' );
    var ExpressionTokenizer = _dereq_( '../expressionTokenizer.js' );
    var evaluateHelper = _dereq_( '../evaluateHelper.js' );
    
    var build = function( s, tag ) {
        var expressionBuilder = _dereq_( '../expressionBuilder.js' );
        
        var string = s.trim();
        
        if ( string.length === 0 ) {
            throw tag + ' expression void.';
        }

        var segments = new ExpressionTokenizer( 
                string, 
                context.getConf().expressionDelimiter, 
                false );
        if ( segments.countTokens() !== 2 ) {
            throw 'Wrong number of elements in expression "' + string + '", ' + tag + ' expressions only support two.';
        }

        var expression1 = expressionBuilder.build( segments.nextToken() );
        var expression2 = expressionBuilder.build( segments.nextToken() );
        
        return {
            expression1: expression1,
            expression2: expression2
        };
    };
    
    var evaluate = function( scope, valueExpression1, valueExpression2 ) {
        
        return {
            number1: evaluateHelper.evaluateNumber( scope, valueExpression1 ),
            number2: evaluateHelper.evaluateNumber( scope, valueExpression2 )
        };
    };
    
    return {
        build: build,
        evaluate: evaluate
    };
})();

},{"../../context.js":87,"../evaluateHelper.js":104,"../expressionBuilder.js":106,"../expressionTokenizer.js":107}],100:[function(_dereq_,module,exports){
/*
    EqualsExpression class
*/
"use strict";

var context = _dereq_( '../../context.js' );
var ExpressionTokenizer = _dereq_( '../expressionTokenizer.js' );
var expressionsUtils = _dereq_( '../expressionsUtils.js' );

var EqualsExpression = function( stringToApply, argsToApply ) {
    
    var string = stringToApply;
    var args = argsToApply;
    
    var evaluate = function( scope ){
        var arg0 = args[ 0 ];
        var result0 = arg0.evaluate( scope );
        
        for ( var i = 1; i < args.length; i++ ) {
            var arg = args[ i ];
            var result = arg.evaluate( scope );
            if ( result0 != result ){
                return false;
            }
        }
        
        return true;
    };

    var dependsOn = function( depsDataItem, scope ){
        return expressionsUtils.buildDependsOnList( depsDataItem, scope, args );
    };
    
    var toString = function(){
        return string;
    };

    return {
        evaluate: evaluate,
        dependsOn: dependsOn,
        toString: toString
    };
};

EqualsExpression.removePrefix = true;
EqualsExpression.getPrefix = function() {
    return context.getConf().equalsExpression;
};
EqualsExpression.getId = EqualsExpression.getPrefix;

EqualsExpression.build = function( s ) {
    var expressionBuilder = _dereq_( '../expressionBuilder.js' );
    
    var string = s.trim();
    
    if ( string.length === 0 ) {
        throw 'Equals expression void.';
    }

    var segments = new ExpressionTokenizer( 
            string, 
            context.getConf().expressionDelimiter, 
            false );
    if ( segments.countTokens() === 1 ) {
        throw 'Only one element in equals expression "' + string + '", please add at least one more.';
    }

    return new EqualsExpression( 
        string,
        expressionBuilder.buildList( segments ) 
    );
};

module.exports = EqualsExpression;

},{"../../context.js":87,"../expressionBuilder.js":106,"../expressionTokenizer.js":107,"../expressionsUtils.js":108}],101:[function(_dereq_,module,exports){
/*
    GreaterExpression class
*/
"use strict";

var context = _dereq_( '../../context.js' );
var comparisonHelper = _dereq_( './comparisonHelper.js' );
var expressionsUtils = _dereq_( '../expressionsUtils.js' );

var GreaterExpression = function( stringToApply, expression1ToApply, expression2ToApply ) {
    
    var string = stringToApply;
    var expression1 = expression1ToApply;
    var expression2 = expression2ToApply;
    
    var evaluate = function( scope ){
        var numbers = comparisonHelper.evaluate( scope, expression1, expression2 );
        return numbers.number1 > numbers.number2;
    };

    var dependsOn = function( depsDataItem, scope ){
        return expressionsUtils.buildDependsOnList( depsDataItem, scope, expression1, expression2 );
    };
    
    var toString = function(){
        return string;
    };
    
    return {
        evaluate: evaluate,
        dependsOn: dependsOn,
        toString: toString
    };
};

GreaterExpression.removePrefix = true;
GreaterExpression.getPrefix = function() {
    return context.getConf().greaterExpression;
};
GreaterExpression.getId = GreaterExpression.getPrefix;

GreaterExpression.build = function( string ) {
    
    var data = comparisonHelper.build( string, 'greater' );

    return new GreaterExpression( string, data.expression1, data.expression2 );
};

module.exports = GreaterExpression;

},{"../../context.js":87,"../expressionsUtils.js":108,"./comparisonHelper.js":99}],102:[function(_dereq_,module,exports){
/*
    InExpression class
*/
"use strict";

var context = _dereq_( '../../context.js' );
var ExpressionTokenizer = _dereq_( '../expressionTokenizer.js' );
var expressionsUtils = _dereq_( '../expressionsUtils.js' );

var InExpression = function( stringToApply, expressionListToApply ) {
    
    var string = stringToApply;
    var expressionList = expressionListToApply;
    
    var evaluate = function( scope ){
        var expression0 = expressionList[ 0 ];
        var evaluated0 = expression0.evaluate( scope );
        
        for ( var i = 1; i < expressionList.length; i++ ) {
            var expression = expressionList[ i ];
            var evaluated = expression.evaluate( scope );
            
            if ( Array.isArray( evaluated ) ){ 
                for ( var j = 0; j < evaluated.length; j++ ) {
                    if ( evaluated0 == evaluated[ j ] ){
                        return true;
                    }
                }
                continue;
            }
            
            if ( evaluated0 == evaluated ){
                return true;
            }
        }
        
        return false;
    };

    var dependsOn = function( depsDataItem, scope ){
        return expressionsUtils.buildDependsOnList( depsDataItem, scope, expressionList );
    };
    
    var toString = function(){
        return string;
    };
    
    return {
        evaluate: evaluate,
        dependsOn: dependsOn,
        toString: toString
    };
};

InExpression.removePrefix = true;
InExpression.getPrefix = function() {
    return context.getConf().inExpression;
};
InExpression.getId = InExpression.getPrefix;

InExpression.build = function( s ) {
    var expressionBuilder = _dereq_( '../expressionBuilder.js' );
    
    var string = s.trim();
    
    if ( string.length === 0 ) {
        throw 'In expression void.';
    }

    var segments = new ExpressionTokenizer( 
            string, 
            context.getConf().expressionDelimiter, 
            false 
    );
    if ( segments.countTokens() === 1 ) {
        throw 'Only one element in in expression "' + string + '", please add at least one more.';
    }

    return new InExpression( 
        string,
        expressionBuilder.buildList( segments ) 
    );
};

module.exports = InExpression;

},{"../../context.js":87,"../expressionBuilder.js":106,"../expressionTokenizer.js":107,"../expressionsUtils.js":108}],103:[function(_dereq_,module,exports){
/*
    LowerExpression class
*/
"use strict";

var context = _dereq_( '../../context.js' );
var comparisonHelper = _dereq_( './comparisonHelper.js' );
var expressionsUtils = _dereq_( '../expressionsUtils.js' );

var LowerExpression = function( stringToApply, expression1ToApply, expression2ToApply ) {
    
    var string = stringToApply;
    var expression1 = expression1ToApply;
    var expression2 = expression2ToApply;
    
    var evaluate = function( scope ){
        var numbers = comparisonHelper.evaluate( scope, expression1, expression2 );
        return numbers.number1 < numbers.number2;
    };
    
    var dependsOn = function( depsDataItem, scope ){
        return expressionsUtils.buildDependsOnList( depsDataItem, scope, expression1, expression2 );
    };
    
    var toString = function(){
        return string;
    };
    
    return {
        evaluate: evaluate,
        dependsOn: dependsOn,
        toString: toString
    };
};

LowerExpression.removePrefix = true;
LowerExpression.getPrefix = function() {
    return context.getConf().lowerExpression;
};
LowerExpression.getId = LowerExpression.getPrefix;

LowerExpression.build = function( string ) {
    
    var data = comparisonHelper.build( string, 'lower' );

    return new LowerExpression( string, data.expression1, data.expression2 );
};

module.exports = LowerExpression;

},{"../../context.js":87,"../expressionsUtils.js":108,"./comparisonHelper.js":99}],104:[function(_dereq_,module,exports){
/* 
    evaluateHelper singleton class
*/
"use strict";

var context = _dereq_( '../context.js' );

module.exports = (function() {
    
    var evaluateToNotNull = function( scope, expression ) {
        var evaluated = expression.evaluate( scope );
        return evaluated == undefined? 'undefined': evaluated;
    };
    
    var evaluateBoolean = function( scope, expression ) {
        var evaluated = expression.evaluate( scope );
        
        if ( evaluated === undefined
            || evaluated == null
            || evaluated == 'false' 
            || evaluated == false 
            || evaluated == 0 ){
            return false;
        }
        
        return true;
    };
    
    var evaluateNumber = function( scope, expression, errorMessageToApply ) {
        var evaluated = expression.evaluate( scope );
        
        if ( ! isNumber( evaluated ) ){
            var errorMessage = 
                errorMessageToApply? 
                errorMessageToApply: 
                'Expression "' + expression + '" is not a valid number.';
            throw errorMessage;
        }
        
        return evaluated;
    };
    
    var isNumber = function( string ){
        return ! isNaN( parseFloat( string ) ) || ! isFinite( string );
    };
    /*
    var evaluateInteger = function( scope, expression, errorMessageToApply ) {
        var evaluated = expression.evaluate( scope );
        
        if ( ! isInteger( evaluated ) ){
            var errorMessage = 
                errorMessageToApply? 
                errorMessageToApply: 
                'Expression "' + expression + '" is not a valid integer.'
            throw errorMessage;
        }
        
        return evaluated;
    };*/
    /*
    var isInteger = function( string ){
        return ! isNaN( parseInt( string ) ) || ! isFinite( string );
    };*/
    
    var evaluateExpressionList = function ( list, scope ){
        
        var result = [];
        
        for ( var i = 0; i < list.length; i++ ) {
            var expression = list[ i ];
            result.push( expression.evaluate( scope ) );
        }
        
        return result;
    };
    
    var isDefault = function( value ){
        return value === context.getConf().defaultVarValue;
    };
    var isNothing = function( value ){
        return value === context.getConf().nothingVarValue;
    };
    
    return {
        evaluateToNotNull: evaluateToNotNull,
        evaluateBoolean: evaluateBoolean,
        evaluateNumber: evaluateNumber,
        //evaluateInteger: evaluateInteger,
        isNumber: isNumber,
        //isInteger: isInteger,
        evaluateExpressionList: evaluateExpressionList,
        isDefault: isDefault,
        isNothing: isNothing
    };
})();

},{"../context.js":87}],105:[function(_dereq_,module,exports){
/*
    ExistsExpression class
*/
"use strict";

var context = _dereq_( '../context.js' );
var expressionsUtils = _dereq_( './expressionsUtils.js' );

var ExistsExpression = function( stringToApply, expressionToApply ) {
    
    var string = stringToApply;
    var expression = expressionToApply;
    
    var evaluate = function( scope ){
        
        try {
            return undefined !== expression.evaluate( scope );
            
        } catch ( e ){
            return false;
        }
    };

    var dependsOn = function( depsDataItem, scope ){
        return expressionsUtils.buildDependsOnList( depsDataItem, scope, expression );
    };
    
    var toString = function(){
        return string;
    };
    
    return {
        evaluate: evaluate,
        dependsOn: dependsOn,
        toString: toString
    };
};

ExistsExpression.removePrefix = true;
ExistsExpression.getPrefix = function() {
    return context.getConf().existsExpression;
};
ExistsExpression.getId = ExistsExpression.getPrefix;

ExistsExpression.build = function( string ) {
    var expressionBuilder = _dereq_( './expressionBuilder.js' );
    
    var expression = expressionBuilder.build( string );
    return new ExistsExpression( string, expression );
};

module.exports = ExistsExpression;

},{"../context.js":87,"./expressionBuilder.js":106,"./expressionsUtils.js":108}],106:[function(_dereq_,module,exports){
/* 
    expressionBuilder singleton class
*/
module.exports = (function() {
    "use strict";
    
    var context = _dereq_( '../context.js' );
    var ExpressionTokenizer = _dereq_( './expressionTokenizer.js' );
    var PathExpression = _dereq_( './path/pathExpression.js' );
    var expressionCache = _dereq_( '../cache/expressionCache.js' );
    /*var log = require( '../logHelper.js' );*/
    
    var expressionManagers = {};
    var withoutPrefixExpressionManagers = {};
    var DEFAULT_ID = PathExpression.getId();
    
    /* Register expression managers */
    var register = function( expressionsManager, id ) {
        expressionManagers[ id || expressionsManager.getPrefix() || expressionsManager.getId() ] = expressionsManager;
        
        if ( ! expressionsManager.removePrefix && expressionsManager.getPrefix() ){
            withoutPrefixExpressionManagers[ expressionsManager.getPrefix() ] = expressionsManager;
        }
    };
    
    var unregister = function( expressionsManager, id ) {
        delete expressionManagers[ id || expressionsManager.getPrefix() || expressionsManager.getId() ];
    };
    
    var registerGeneralPurpose = function(){
        register( _dereq_( './existsExpression.js' ) );
        register( _dereq_( './formatExpression.js' ) );
        register( _dereq_( './stringExpression.js' ) );
        register( _dereq_( './path/pathExpression.js' ) );
    };
    var registerComparison = function(){
        register( _dereq_( './comparison/equalsExpression.js' ) );
        register( _dereq_( './comparison/greaterExpression.js' ) );
        register( _dereq_( './comparison/lowerExpression.js' ) );
        register( _dereq_( './comparison/inExpression.js' ) );
    };
    var registerArithmetic = function(){
        register( _dereq_( './arithmethic/addExpression.js' ) );
        register( _dereq_( './arithmethic/substractExpression.js' ) );
        register( _dereq_( './arithmethic/multiplyExpression.js' ) );
        register( _dereq_( './arithmethic/divideExpression.js' ) );
        register( _dereq_( './arithmethic/modExpression.js' ) );
    };
    var registerLogical = function(){
        register( _dereq_( './bool/andExpression.js' ) );
        register( _dereq_( './bool/condExpression.js' ) );
        register( _dereq_( './bool/notExpression.js' ) );
        register( _dereq_( './bool/orExpression.js' ) );
    };
    var registerI18n = function(){
        register( _dereq_( './i18n/trCurrencyExpression.js' ) );
        register( _dereq_( './i18n/trDateTimeExpression.js' ) );
        register( _dereq_( './i18n/trNumberExpression.js' ) );
        register( _dereq_( './i18n/trStringExpression.js' ) );
    };
    var registerScripting = function(){
        register( _dereq_( './scripting/javascriptExpression.js' ) );
        register( _dereq_( './scripting/queryExpression.js' ) );
    };
    
    var registerAll = function(){
        registerGeneralPurpose();
        registerComparison();
        registerArithmetic();
        registerLogical();
        registerI18n();
        registerScripting();
    }();
    /* End Register expression managers */
    
    var build = function( string, force ) {
        return expressionCache.get(
                string, 
                function(){
                    return forceBuild( string );
                }, 
                force
        );
    };
    
    var forceBuild = function( string ) {
        var effectiveString = removeParenthesisIfAny( string.trim() );
        var index = effectiveString.indexOf( context.getConf().expressionSuffix );
        var id = undefined;
        var isDefault = false;
        
        // Is the default expression type? Is registered?
        if ( index !== -1 ){
            id = effectiveString.substring( 0, index )  + ':';
            
            // If the id is not resistered must be a path
            isDefault = ! expressionManagers.hasOwnProperty( id );
        } else {
            isDefault = true;
        }
        
        // Remove prefix and set id if it is default expression type
        var removePrefix = false;
        var expressionManager = undefined;
        if ( isDefault ){
            /*id = DEFAULT_ID;*/
            expressionManager = getWithoutPrefixExpressionManager( effectiveString );
        } else {
            removePrefix = true;
        }
        
        // Get the expression manager and build the expression
        expressionManager = expressionManager || expressionManagers[ id ];
        var finalString = undefined;
        if ( removePrefix && expressionManager.removePrefix ){
            finalString = effectiveString.substr( id.length );
        } else {
            finalString = effectiveString;
        }
        return expressionManager.build( finalString );
    };
    
    var getWithoutPrefixExpressionManager = function( string ){
        
        for ( var prefix in withoutPrefixExpressionManagers ) {
            if ( string.indexOf( prefix ) === 0 ) {
                return withoutPrefixExpressionManagers[ prefix ];
            }
        }
        
        return expressionManagers[ DEFAULT_ID ];
    };
    
    var buildList = function( segments ) {
        var list = [];
        
        while ( segments.hasMoreTokens() ) {
            list.push(
                build( 
                    segments.nextToken().trim()  ) );
        }

        return list;
    };
    
    var removePrefix = function( string, prefix ) {
        return string.substr( prefix.length );
    };
    
    var removePrefixAndBuild = function( string, prefix ) {
        return build(
                string.substr( prefix.length ));
    };
    
    var removeParenthesisIfAny = function( token ){
        var effectiveToken = token.trim();
        
        if ( effectiveToken == '' ){
            return effectiveToken;
        }
        
        if ( effectiveToken.charAt( 0 ) === '(' ){
            return removeParenthesisIfAny( 
                        effectiveToken.substring( 1, effectiveToken.lastIndexOf( ')' ) ).trim() );
        }
        
        return effectiveToken;
    };
    
    var endsWith = function( str, suffix ) {
        return str.indexOf( suffix, str.length - suffix.length ) !== -1;
    };
    
    var getArgumentsFromString = function( string ) {
        
        // Parse and evaluate arguments; then push them to an array
        var tokens = new ExpressionTokenizer( 
                string, 
                context.getConf().argumentsDelimiter, 
                true );
        var args = [];
        while ( tokens.hasMoreTokens() ) {
            var currentString = tokens.nextToken().trim();
            args.push( 
                    build( currentString ) );
        }
        
        return args;
    };
    
    return {
        register: register,
        unregister: unregister,
        registerAll: registerAll,
        build: build,
        buildList: buildList,
        removePrefix: removePrefix,
        removePrefixAndBuild: removePrefixAndBuild,
        removeParenthesisIfAny: removeParenthesisIfAny,
        endsWith: endsWith,
        getArgumentsFromString: getArgumentsFromString
    };
})();

},{"../cache/expressionCache.js":86,"../context.js":87,"./arithmethic/addExpression.js":88,"./arithmethic/divideExpression.js":90,"./arithmethic/modExpression.js":91,"./arithmethic/multiplyExpression.js":92,"./arithmethic/substractExpression.js":93,"./bool/andExpression.js":94,"./bool/condExpression.js":96,"./bool/notExpression.js":97,"./bool/orExpression.js":98,"./comparison/equalsExpression.js":100,"./comparison/greaterExpression.js":101,"./comparison/inExpression.js":102,"./comparison/lowerExpression.js":103,"./existsExpression.js":105,"./expressionTokenizer.js":107,"./formatExpression.js":109,"./i18n/trCurrencyExpression.js":110,"./i18n/trDateTimeExpression.js":111,"./i18n/trNumberExpression.js":113,"./i18n/trStringExpression.js":114,"./path/pathExpression.js":123,"./scripting/javascriptExpression.js":128,"./scripting/queryExpression.js":129,"./stringExpression.js":130}],107:[function(_dereq_,module,exports){
/* 
    Class ExpressionTokenizer 
*/
module.exports = function( exp, delimiter, escape ) {
    "use strict";
    
    var expressionBuilder = _dereq_( './expressionBuilder.js' );
    var removeParenthesisIfAny = expressionBuilder.removeParenthesisIfAny;
    
    var expression = exp.trim();

    var iterator;
    var currIndex = 0;
    var delimiterCount = 0;
    var delimiters = [];
    
    var makeIterator = function( array ){
        var nextIndex = 0;
        
        return {
            next: function(){
                return nextIndex < array.length ?
                   array [ nextIndex++ ] :
                   undefined;
            },
            hasNext: function(){
                return nextIndex < array.length;
            }
        };
    };
    
    var analyze = function(){
        var avoidRepeatedSeparators = delimiter === ' ';
        
        // Go ahead and find delimiters, if any, at construction time
        var parentLevel = 0;
        var inQuote = false;
        var previousCh = '';
        
        // Scan for delimiters
        var length = expression.length;
        for ( var i = 0; i < length; i++ ) {
            var ch = expression.charAt( i );
            
            if ( ch === delimiter ) {
                // If delimiter is not buried in parentheses or a quote
                if ( parentLevel === 0 && ! inQuote  ) {
                    
                    if ( avoidRepeatedSeparators && ( previousCh === delimiter || previousCh === '\n' ) ) {
                        continue;
                    }
                    
                    var nextCh = ( i + 1 < length ) ? expression.charAt( i + 1 ) : '';
                    
                    // And if delimiter is not escaped
                    if ( ! ( escape && nextCh === delimiter ) ) {
                        delimiterCount++;
                        delimiters.push( i );
                    } else {
                        // Somewhat inefficient way to pare the
                        // escaped delimiter down to a single
                        // character without breaking our stride
                        expression = expression.substring( 0, i + 1 ) + expression.substring( i + 2 );
                        length--;
                    }
                }
            // Increment parenthesis level
            } else if ( ch === '(' || ch === '[' ) {
                parentLevel++;
                
            // Decrement parenthesis level
            } else if ( ch === ')' || ch === ']' ) {
                parentLevel--;
                // If unmatched right parenthesis
                if ( parentLevel < 0 ) {
                    throw 'Syntax error. Unmatched right parenthesis: ' + expression;
                }
                
            // Start or end quote
            } else if ( ch === '\'' ) {
                inQuote = ! inQuote;
            }
            
            previousCh = ch;
        }
        
        // If unmatched left parenthesis
        if ( parentLevel > 0 ) {
            throw 'Syntax error: unmatched left parenthesis: ' + expression;
        }
        
        // If runaway quote
        if ( inQuote ) {
            throw 'Syntax error: runaway quotation: ' + expression;
        }
        
        iterator = makeIterator( delimiters );
    }();
    
    var hasMoreTokens = function( ) {
        return currIndex < expression.length;
    };
    
    var nextToken = function( ) {
        var token;
        
        if ( iterator.hasNext() ) {
            var next = iterator.next();
            var delim = parseInt( next );
            token = expression.substring( currIndex, delim ).trim();
            currIndex = delim + 1;
            delimiterCount--;
            
            return removeParenthesisIfAny( token );
        }
        
        token = expression.substring( currIndex ).trim();
        currIndex = expression.length;
        
        return removeParenthesisIfAny( token );
    };
        
    var countTokens = function( ) {
        if ( hasMoreTokens() ) {
            return delimiterCount + 1;
        }
        return 0;
    };
    
    var nextTokenIfAny = function( defaultValue ) {
        return hasMoreTokens()? nextToken(): defaultValue;
    };
    
    return {
        hasMoreTokens: hasMoreTokens,
        nextToken: nextToken,
        countTokens: countTokens,
        nextTokenIfAny: nextTokenIfAny
    };
};

},{"./expressionBuilder.js":106}],108:[function(_dereq_,module,exports){
/* 
    expressionsUtils singleton class
*/
"use strict";

var evaluateHelper = _dereq_( './evaluateHelper.js' );
var utils = _dereq_( '../utils.js' );
var DepsDataItem = _dereq_( '../parsers/depsDataItem.js' );

module.exports = (function() {
    
    var buildLiteral = function( value ) {
        return evaluateHelper.isNumber( value )? "" + value: "'" + value + "'";
    };
    
    var buildList = function( items, asStrings ) {
        
        var result = '[';
        var separator = asStrings? "'": "";
        
        for ( var i = 0; i < items.length; i++ ) {
            result += separator + items[ i ] + separator + " ";
        }
        
        result += ']';
        return result;
    };
    
    var buildDependsOnList = function(){
        
        var result = [];
        
        var depsDataItem = arguments[ 0 ];
        if ( ! depsDataItem ){
            depsDataItem = new DepsDataItem();
        }
        
        var scope = arguments[ 1 ];
        
        for ( var argCounter = 2; argCounter < arguments.length; argCounter++ ){
            var list = arguments[ argCounter ];
            result = result.concat( 
                getDependsOnFromList( depsDataItem, scope, list )
            );
        }
        
        return result;
    };
    
    var getDependsOnFromList = function( depsDataItem, scope, arg ){
        
        var result = [];
        
        if ( ! arg ){
            return result;
        }
        
        if ( ! Array.isArray( arg ) ){
            return getDependsOnFromNonList( depsDataItem, scope, arg );
        }
        
        var list = arg;
        for ( var i = 0; i < list.length; i++ ) {
            var item = list[ i ];
            result = result.concat( 
                Array.isArray( item )? getDependsOnFromList( scope, item ): getDependsOnFromNonList( depsDataItem, scope, item )
            );
        }

        return result;
    };
    
    var getDependsOnFromNonList = function( depsDataItem, scope, item ){
        
        return ! utils.isFunction( item.dependsOn ) || ( utils.isFunction( item.getVarName ) && depsDataItem === item.getVarName() )? 
            []: 
            item.dependsOn( depsDataItem, scope );
    };
    
    return {
        buildLiteral: buildLiteral,
        buildList: buildList,
        buildDependsOnList: buildDependsOnList
    };
})();

},{"../parsers/depsDataItem.js":137,"../utils.js":161,"./evaluateHelper.js":104}],109:[function(_dereq_,module,exports){
/*
    FormatExpression class
*/
"use strict";

var utils = _dereq_( '../utils.js' );
var context = _dereq_( '../context.js' );
var ExpressionTokenizer = _dereq_( './expressionTokenizer.js' );
var expressionsUtils = _dereq_( './expressionsUtils.js' );
var evaluateHelper = _dereq_( './evaluateHelper.js' );

var FormatExpression = function( stringToApply, formatterExpressionToApply, argsExpressionsToApply ) {
    
    var string = stringToApply;
    var formatterExpression = formatterExpressionToApply;
    var argsExpressions = argsExpressionsToApply;
    
    var evaluate = function( scope ){
        
        // Get formatter
        var formatter = evaluateFormatter( scope, formatterExpression );
        
        // Get arguments
        var args = evaluateHelper.evaluateExpressionList( argsExpressions, scope );
        
        return formatter.apply( formatter, args );
    };
    
    var evaluateFormatter = function( scope, expression ) {
        
        // Try to get a built-in formatter
        var formatter = context.getFormatter( expression );
        
        // Try to get a function with a name
        if ( ! isValidFormatter( formatter ) ){
            formatter = scope.get( expression );
        }
    
        // Try to get a function evaluating the expression
        if ( ! isValidFormatter( formatter ) ){
            try {
                var expressionBuilder = _dereq_( './expressionBuilder.js' );
                var formatterExpression = expressionBuilder.build( expression );
                var value = formatterExpression.evaluate( scope );
                
                return evaluateFormatter( scope, value );

            } catch( e ){
                // Nothing to do
            }
        }
        
        // Return the formatter only if it is valid
        if ( isValidFormatter( formatter ) ){
            return formatter;
        }
        
        throw 'No valid formatter found: ' + string;
    };
    
    var isValidFormatter = function( formatter ){
        return formatter && utils.isFunction( formatter );
    };
    
    var dependsOn = function( depsDataItem, scope ){
        return expressionsUtils.buildDependsOnList( depsDataItem, scope, formatterExpression, argsExpressions );
    };
    
    var toString = function(){
        return string;
    };
    
    return {
        evaluate: evaluate,
        dependsOn: dependsOn,
        toString: toString
    };
};

FormatExpression.removePrefix = true;
FormatExpression.getPrefix = function() {
    return context.getConf().formatExpression;
};
FormatExpression.getId = FormatExpression.getPrefix;

FormatExpression.build = function( s ) {
    var expressionBuilder = _dereq_( './expressionBuilder.js' );
    
    var string = s.trim();
    if ( string.length === 0 ) {
        throw 'Format expression void.';
    }

    var segments = new ExpressionTokenizer( 
            string, 
            context.getConf().expressionDelimiter, 
            false );
    var numberOfTokens = segments.countTokens();
    if ( numberOfTokens === 1 ) {
        throw 'Only one element in format expression: "' + string + '". Please add at least one more.';
    }

    // Get formatter
    var formatter = segments.nextToken().trim();

    // Get arguments
    var argsExpressions = [];
    while ( segments.hasMoreTokens() ) {
        var argExpression = expressionBuilder.build( segments.nextToken() );
        argsExpressions.push( argExpression );
    }

    return new FormatExpression( string, formatter, argsExpressions );
};

module.exports = FormatExpression;

},{"../context.js":87,"../utils.js":161,"./evaluateHelper.js":104,"./expressionBuilder.js":106,"./expressionTokenizer.js":107,"./expressionsUtils.js":108}],110:[function(_dereq_,module,exports){
/*
    TrCurrencyExpression class
*/
"use strict";

var context = _dereq_( '../../context.js' );
var trHelper = _dereq_( './trHelper.js' );

var TrCurrencyExpression = function( stringToApply, expressionToApply, argsExpressionsToApply, subformatToApply ) {
    
    var string = stringToApply;
    var expression = expressionToApply;
    var argsExpressions = argsExpressionsToApply;
    var subformat = subformatToApply;
    
    var evaluate = function( scope ){
        var evaluated = trHelper.evaluate( 
                scope, 
                expression, 
                argsExpressions, 
                'currency', 
                subformat );
        return evaluated;
    };
    
    var dependsOn = function( depsDataItem, scope ){
        return trHelper.dependsOn( depsDataItem, scope, expression, argsExpressions );
    };
    
    var toString = function(){
        return string;
    };
    
    return {
        evaluate: evaluate,
        dependsOn: dependsOn,
        toString: toString
    };
};

TrCurrencyExpression.removePrefix = true;
TrCurrencyExpression.getPrefix = function() {
    return context.getConf().trCurrencyExpression;
};
TrCurrencyExpression.getId = TrCurrencyExpression.getPrefix;

TrCurrencyExpression.build = function( string ) {
    
    var trData = trHelper.build( 
            string,
            TrCurrencyExpression.getPrefix(), 
            2, 
            3, 
            true );

    return new TrCurrencyExpression( 
            string, 
            trData.expression, 
            trData.argsExpressions, 
            trData.subformat );
};

module.exports = TrCurrencyExpression;

},{"../../context.js":87,"./trHelper.js":112}],111:[function(_dereq_,module,exports){
/*
    TrDateTimeExpression class
*/
"use strict";

var context = _dereq_( '../../context.js' );
var trHelper = _dereq_( './trHelper.js' );

var TrDateTimeExpression = function( stringToApply, expressionToApply, argsExpressionsToApply ) {
    
    var string = stringToApply;
    var expression = expressionToApply;
    var argsExpressions = argsExpressionsToApply;
    
    var evaluate = function( scope ){
        var evaluated = trHelper.evaluate( 
                scope, 
                expression, 
                argsExpressions, 
                'datetime', 
                null );
        return evaluated;
    };

    var dependsOn = function( depsDataItem, scope ){
        return trHelper.dependsOn( depsDataItem, scope, expression, argsExpressions );
    };
    
    var toString = function(){
        return string;
    };
    
    return {
        evaluate: evaluate,
        dependsOn: dependsOn,
        toString: toString
    };
};

TrDateTimeExpression.removePrefix = true;
TrDateTimeExpression.getPrefix = function() {
    return context.getConf().trDateTimeExpression;
};
TrDateTimeExpression.getId = TrDateTimeExpression.getPrefix;

TrDateTimeExpression.build = function( string ) {
    
    var trData = trHelper.build( 
            string,
            TrDateTimeExpression.getPrefix(), 
            1, 
            2, 
            false );

    return new TrDateTimeExpression( 
            string, 
            trData.expression, 
            trData.argsExpressions );
};

module.exports = TrDateTimeExpression;

},{"../../context.js":87,"./trHelper.js":112}],112:[function(_dereq_,module,exports){
/* 
    trHelper singleton class
*/
"use strict";

var context = _dereq_( '../../context.js' );
var ExpressionTokenizer = _dereq_( '../expressionTokenizer.js' );
var i18nHelper = _dereq_( '../../i18n/i18nHelper.js' );
var evaluateHelper = _dereq_( '../evaluateHelper.js' );
var expressionsUtils = _dereq_( '../expressionsUtils.js' );
var VariableExpression = _dereq_( '../path/variableExpression.js' );

module.exports = (function() {
    
    var build = function( string, tag, minElements, maxElements, useSubformat ) {
        var expressionBuilder = _dereq_( '../expressionBuilder.js' );
        
        if ( string.length === 0 ) {
            throw tag + ' expression void.';
        }

        var segments = new ExpressionTokenizer( 
                string.trim(), 
                context.getConf().expressionDelimiter, 
                false );
        
        // Check number of tokens
        var count = segments.countTokens();
        if ( count < minElements ) {
            throw 'Too few elements in ' + tag + ' expression (minimum is ' + minElements 
                    + ', ' + count + ' present): ' + string.trim();
        }
        if ( count > maxElements ) {
            throw 'Too many elements in ' + tag + ' expression (maximum is ' + maxElements 
                    + ', ' + count + ' present):' + string.trim();
        }
        
        // Get tokens
        var subformat = useSubformat? 
                expressionBuilder.build( segments.nextToken() ): 
                undefined;
        var expression = expressionBuilder.build( 
                segments.nextToken().trim() );
        var argsSegment = segments.hasMoreTokens()? 
                segments.nextToken().trim(): 
                undefined;
        
        return {
            expression: expression,
            argsExpressions: buildI18nArgs( argsSegment ),
            subformat: subformat
        };
    };
    
    var buildI18nArgs = function( segment ){
        var expressionBuilder = _dereq_( '../expressionBuilder.js' );
        
        var args = {};
        if ( ! segment ){
            return args;
        }
        var tokens = new ExpressionTokenizer( 
                segment, 
                context.getConf().i18nOptionsDelimiter, 
                true
        );
        while ( tokens.hasMoreTokens() ) {
            var token = tokens.nextToken().trim();
            var argsTokens = new ExpressionTokenizer( 
                    token, 
                    context.getConf().inI18nOptionsDelimiter, 
                    true 
            );
            if ( argsTokens.countTokens() !== 2 ) {
                throw '2 elements are needed in i18n expression.';
            }
            
            var argKey = argsTokens.nextToken().trim();
            var argExpression = expressionBuilder.build( 
                    argsTokens.nextToken().trim() );
            args[ argKey ] = argExpression;
        }
        return args;
    };
    
    var evaluateI18nArgs = function( scope, i18nArgs ){
        var values = {};
        
        for ( var argKey in i18nArgs ) {
            var argExpression = i18nArgs[ argKey ];
            var argValue = evaluateHelper.evaluateToNotNull( scope, argExpression );
            values[ argKey ] = argValue;
        }
        
        return values;
    };
    
    var evaluate = function( scope, valueExpression, argsExpressions, format, subformat ) {
        var argValues = evaluateI18nArgs( scope, argsExpressions );
        var subformatEvaluated = 
                subformat? 
                evaluateHelper.evaluateToNotNull( scope, subformat ): 
                undefined;
        var valueEvaluated = evaluateHelper.evaluateToNotNull( scope, valueExpression );
        var evaluated = translate( 
                scope, 
                valueEvaluated, 
                argValues, 
                format, 
                subformatEvaluated );
        
        return evaluated;
    };
    
    var translate = function( scope, id, i18nArgs, format, subformat ){
        
        var i18nList = scope.get( context.getConf().i18nDomainVarName );
        var language = scope.get( context.getConf().i18nLanguageVarName );
        return i18nHelper.tr( 
            i18nList, 
            id, 
            i18nArgs, 
            format, 
            subformat,
            language 
        );
    };
    
    var dependsOn = function( depsDataItem, scope, expression, argsExpressions ){
        
        return expressionsUtils.buildDependsOnList( 
            depsDataItem, 
            scope, 
            new VariableExpression( context.getConf().i18nDomainVarName ),
            new VariableExpression( context.getConf().i18nLanguageVarName ),
            expression, 
            argsExpressions
        );
    };
    
    return {
        build: build,
        evaluate: evaluate,
        dependsOn: dependsOn
    };
})();

},{"../../context.js":87,"../../i18n/i18nHelper.js":133,"../evaluateHelper.js":104,"../expressionBuilder.js":106,"../expressionTokenizer.js":107,"../expressionsUtils.js":108,"../path/variableExpression.js":127}],113:[function(_dereq_,module,exports){
/*
    TrNumberExpression class
*/
"use strict";

var context = _dereq_( '../../context.js' );
var trHelper = _dereq_( './trHelper.js' );

var TrNumberExpression = function( stringToApply, expressionToApply, argsExpressionsToApply ) {
    
    var string = stringToApply;
    var expression = expressionToApply;
    var argsExpressions = argsExpressionsToApply;
    
    var evaluate = function( scope ){
        var evaluated = trHelper.evaluate( 
                scope, 
                expression, 
                argsExpressions, 
                'number', 
                null 
        );
        return evaluated;
    };

    var dependsOn = function( depsDataItem, scope ){
        return trHelper.dependsOn( depsDataItem, scope, expression, argsExpressions );
    };
    
    var toString = function(){
        return string;
    };
    
    return {
        evaluate: evaluate,
        dependsOn: dependsOn,
        toString: toString
    };
};

TrNumberExpression.removePrefix = true;
TrNumberExpression.getPrefix = function() {
    return context.getConf().trNumberExpression;
};
TrNumberExpression.getId = TrNumberExpression.getPrefix;

TrNumberExpression.build = function( string ) {
    
    var trData = trHelper.build( 
            string,
            TrNumberExpression.getPrefix(), 
            1, 
            2, 
            false 
    );

    return new TrNumberExpression( 
            string, 
            trData.expression, 
            trData.argsExpressions 
    );
};

module.exports = TrNumberExpression;

},{"../../context.js":87,"./trHelper.js":112}],114:[function(_dereq_,module,exports){
/*
    TrStringExpression class
*/
"use strict";

var context = _dereq_( '../../context.js' );
var trHelper = _dereq_( './trHelper.js' );

var TrStringExpression = function( stringToApply, expressionToApply, argsExpressionsToApply ) {
    
    var string = stringToApply;
    var expression = expressionToApply;
    var argsExpressions = argsExpressionsToApply;
    
    var evaluate = function( scope ){
        var evaluated = trHelper.evaluate( 
                scope, 
                expression, 
                argsExpressions, 
                'string', 
                null 
        );
        return evaluated;
    };
    
    var dependsOn = function( depsDataItem, scope ){
        return trHelper.dependsOn( depsDataItem, scope, expression, argsExpressions );
    };
    
    var toString = function(){
        return string;
    };
    
    return {
        evaluate: evaluate,
        dependsOn: dependsOn,
        toString: toString
    };
};

TrStringExpression.removePrefix = true;
TrStringExpression.getPrefix = function() {
    return context.getConf().trExpression;
};
TrStringExpression.getId = TrStringExpression.getPrefix;

TrStringExpression.build = function( string ) {
    
    var trData = trHelper.build( 
            string,
            TrStringExpression.getPrefix(), 
            1, 
            2, 
            false 
    );

    return new TrStringExpression( 
            string, 
            trData.expression, 
            trData.argsExpressions 
    );
};

module.exports = TrStringExpression;

},{"../../context.js":87,"./trHelper.js":112}],115:[function(_dereq_,module,exports){
/*
    ArrayExpression class
*/
"use strict";

var expressionsUtils = _dereq_( '../expressionsUtils.js' );

var ArrayExpression = function( arrayBaseToApply, indexesToApply ) {
    
    var arrayBase = arrayBaseToApply;
    var indexes = indexesToApply;
    
    var evaluate = function( scope ){
        
        // Evaluate and check array bases and indexes
        var evaluatedArrayBase = arrayBase.evaluate( scope );

        // Iterate indexes
        var result = evaluatedArrayBase;
        for ( var i = 0; i < indexes.length; i++ ) {
            
            // Get and evaluate index as integer
            var indexExpression = indexes[ i ];

            // Evaluate array access
            result = result[ indexExpression.evaluate( scope ) ];
        }
        
        return result;
    };
    
    var dependsOn = function( depsDataItem, scope ){
        
        // Build the arrayBaseDependsOn
        var arrayBaseDependsOn = expressionsUtils.buildDependsOnList( depsDataItem, scope, arrayBase );
        
        // This must be rare!
        if ( arrayBaseDependsOn.length === 0 ){
            return [];
        } else if ( arrayBaseDependsOn.length > 1 ){
            return expressionsUtils.buildDependsOnList( depsDataItem, scope, arrayBase, indexes );
        }
        
        // Join all together
        var dep = arrayBaseDependsOn[ 0 ];
        for ( var i = 0; i < indexes.length; ++i ){
            var indexExpression = indexes[ i ];
            var indexEvaluated = indexExpression.evaluate( scope );
            dep += '[' + indexEvaluated + ']';
        }
        
        return [ dep ];
    };
    
    var toString = function(){
        return arrayBase + '[' + indexes + ']';
    };
    
    return {
        evaluate: evaluate,
        dependsOn: dependsOn,
        toString: toString
    };
};

ArrayExpression.build = function( arrayBase, accessor ) {
    var expressionBuilder = _dereq_( '../expressionBuilder.js' );
    
    var indexes = [];
    
    var done = false;
    while ( ! done ){

        // Array accessor must begin and end with brackets
        var close = accessor.indexOf( ']' );
        if ( accessor.charAt( 0 ) !== '[' || close === -1 ) {
            throw 'Bad array accessor: '  + accessor;
        }

        // Get index and add to indexes
        var index = expressionBuilder.build( 
                accessor.substring( 1, close ) 
        );
        indexes.push( index );

        // continue processing array access for multidimensional arrays
        close++;
        if ( accessor.length > close ) {
            accessor = accessor.substring( close );
        } else {
            done = true;
        }
    }
    
    return new ArrayExpression( arrayBase, indexes );
};

ArrayExpression.buildArrayData = function( token ) {
    
    var bracket = ArrayExpression.findArrayAccessor( token );
    
    if ( bracket <= 0 ) {
        return undefined;
    }
    
    return {
        arrayAccessor: token.substring( bracket ).trim(),
        token: token.substring( 0, bracket ).trim()
    };
};

ArrayExpression.findArrayAccessor = function( token ) {
    var SCANNING = 0;
    var IN_PAREN = 1;
    var IN_QUOTE = 2;

    var length = token.length;
    var state = SCANNING;
    var parenDepth = 0;
    for ( var i = 0; i < length; i++ ) {
        var ch = token.charAt( i );
        switch( state ) {
        case IN_PAREN:
            if ( ch === ')' ) {
                parenDepth--;
                if ( parenDepth === 0 ) {
                    state = SCANNING;
                }
            } else if ( ch === '(' ) {
                parenDepth++;
            }
            break;

        case IN_QUOTE:
            if ( ch === '\'' ) {
                state = SCANNING;
            }
            break;

        case SCANNING:
            if ( ch === '\'' ) {
                state = IN_QUOTE;
            } else if ( ch === '(' ) {
                parenDepth++;
                state = IN_PAREN;
            } else if ( ch === '[' ) {
                return i;
            }
        }
    }

    return -1;
};

module.exports = ArrayExpression;

},{"../expressionBuilder.js":106,"../expressionsUtils.js":108}],116:[function(_dereq_,module,exports){
/*
    FunctionExpression class
*/
"use strict";

var evaluateHelper = _dereq_( '../evaluateHelper.js' );

var FunctionExpression = function( stringToApply, nameToApply, argsToApply ) {
    
    var string = stringToApply;
    var name = nameToApply;
    var args = argsToApply;
    
    var evaluate = function( scope ){
        var evaluatedArgs = evaluateHelper.evaluateExpressionList( args, scope );
        var element = scope.get( name );
        return ! element? undefined: element.apply( element, evaluatedArgs );
    };

    var dependsOn = function(){
        return [];
    };
    
    var toString = function(){
        return string;
    };
    
    return {
        evaluate: evaluate,
        dependsOn: dependsOn,
        toString: toString
    };
};

FunctionExpression.build = function( string ) {
    var expressionBuilder = _dereq_( '../expressionBuilder.js' );
    
    var leftParent = string.indexOf( '(' );
    if ( leftParent === -1 ) {
        return undefined;
    }
    
    if ( ! expressionBuilder.endsWith( string, ')' ) ) {
        throw 'Syntax error. Bad function call: ' + string;
    }
    var functionName = string.substring( 0, leftParent ).trim();
    var argsString = string.substring( leftParent + 1, string.length - 1 );
    var args = expressionBuilder.getArgumentsFromString( argsString );

    return new FunctionExpression( string, functionName, args );
};

module.exports = FunctionExpression;

},{"../evaluateHelper.js":104,"../expressionBuilder.js":106}],117:[function(_dereq_,module,exports){
/*
    IndirectionExpression class
*/
"use strict";

var IndirectionExpression = function( nameToApply ) {
    
    var name = nameToApply;
    
    var evaluate = function( scope, parent ){
        return parent[ scope.get( name ) ];
    };
    
    var dependsOn = function(){
        return [];
    };
    
    var toString = function(){
        return '?' + name;
    };
    
    return {
        evaluate: evaluate,
        dependsOn: dependsOn,
        toString: toString
    };
};

IndirectionExpression.build = function( string ) {
    
    if ( string.charAt( 0 ) !== '?' ) {
        return undefined;
    }
    
    return new IndirectionExpression( string.substring( 1 ) );
};

module.exports = IndirectionExpression;

},{}],118:[function(_dereq_,module,exports){
/*
    ListExpression class
*/
"use strict";

var context = _dereq_( '../../context.js' );
var ExpressionTokenizer = _dereq_( '../expressionTokenizer.js' );
var expressionsUtils = _dereq_( '../expressionsUtils.js' );
var RangeExpression = _dereq_( './rangeExpression.js' );

var ListExpression = function( stringToApply, itemsToApply ) {
    
    var string = stringToApply;
    var items = itemsToApply;
    
    var evaluate = function( scope ){
        
        var result = [];
        
        for ( var i = 0; i < items.length; i++ ) {
            var expression = items[ i ];
            var evaluated = expression.evaluate( scope );
            
            if ( Array.isArray( evaluated ) ){ 
                result = result.concat( evaluated );
            } else {
                result.push( evaluated );
            }
        }

        return result;
    };
    
    var dependsOn = function( depsDataItem, scope ){
        return expressionsUtils.buildDependsOnList( depsDataItem, scope, items );
    };
    
    var toString = function(){
        return string;
    };
    
    return {
        evaluate: evaluate,
        dependsOn: dependsOn,
        toString: toString
    };
};

ListExpression.build = function( s ) {
    var expressionBuilder = _dereq_( '../expressionBuilder.js' );
    
    if ( s.charAt( 0 ) !== '[' || s.charAt( s.length - 1 ) !==  ']' ) {
        return undefined;
    }
    
    var string = s.substring( 1, s.length - 1 );
    var items = [];
    var segments = new ExpressionTokenizer( 
            string, 
            context.getConf().expressionDelimiter, 
            true );

    while ( segments.hasMoreTokens() ) {
        var segment = segments.nextToken().trim();
        var range = RangeExpression.build( segment );

        items.push(
            range?
            range:
            expressionBuilder.build( segment )
        );
    }

    return new ListExpression( string, items );
};

module.exports = ListExpression;

},{"../../context.js":87,"../expressionBuilder.js":106,"../expressionTokenizer.js":107,"../expressionsUtils.js":108,"./rangeExpression.js":126}],119:[function(_dereq_,module,exports){
/*
    BooleanLiteral class
*/
"use strict";

var BooleanLiteral = function( literalToApply ) {

    var literal = literalToApply;
    
    var evaluate = function( scope ){
        return literal;
    };
    
    var toString = function(){
        return "" + literal;
    };
    
    var dependsOn = function(){
        return [];
    };
    
    return {
        evaluate: evaluate,
        dependsOn: dependsOn,
        toString: toString
    };
};

BooleanLiteral.build = function( string ) {
    
    if ( 'true' === string ) {
        return new BooleanLiteral( true );
    }
    if ( 'false' === string ) {
        return new BooleanLiteral( false );
    }
    return undefined;
};

module.exports = BooleanLiteral;

},{}],120:[function(_dereq_,module,exports){
/*
    NumericLiteral class
*/
"use strict";

var NumericLiteral = function( literalToApply ) {
    
    var literal = literalToApply;
    
    var evaluate = function( scope ){
        return literal;
    };
    
    var dependsOn = function(){
        return [];
    };
    
    var toString = function(){
        return literal;
    };
    
    return {
        evaluate: evaluate,
        dependsOn: dependsOn,
        toString: toString
    };
};

NumericLiteral.build = function( string ) {
    
    if ( isFinite( string ) ){
        var integerValue = parseInt( string );
        if ( integerValue == string ){
            return new NumericLiteral( integerValue );
        }

        var floatValue = parseFloat( string );
        if ( floatValue == string ){
            return new NumericLiteral( floatValue );
        }
    }

    return undefined;
};

module.exports = NumericLiteral;

},{}],121:[function(_dereq_,module,exports){
/*
    StringLiteral class
*/
"use strict";

var StringLiteral = function( literalToApply ) {

    var literal = literalToApply;
    
    var evaluate = function( scope ){
        return literal;
    };
    
    var dependsOn = function(){
        return [];
    };
    
    var toString = function(){
        return literal;
    };
    
    return {
        evaluate: evaluate,
        dependsOn: dependsOn,
        toString: toString
    };
};

StringLiteral.build = function( string ) {
    
    if ( string.charAt( 0 ) === "'" && string.charAt( string.length - 1 ) ===  "'" ) {
        return new StringLiteral( 
            string.substring( 1, string.length - 1 ) );
    }

    return undefined;
};

module.exports = StringLiteral;

},{}],122:[function(_dereq_,module,exports){
/*
    MethodExpression class
*/
"use strict";

var evaluateHelper = _dereq_( '../evaluateHelper.js' );

var MethodExpression = function( stringToApply, nameToApply, argsToApply ) {
    
    var string = stringToApply;
    var name = nameToApply;
    var args = argsToApply;
    
    var evaluate = function( scope, parent ){
        var evaluatedArgs = evaluateHelper.evaluateExpressionList( args, scope );
        return parent[ name ].apply( parent, evaluatedArgs );
    };

    var dependsOn = function(){
        return undefined;
    };
    
    var toString = function(){
        return string;
    };
    
    return {
        evaluate: evaluate,
        dependsOn: dependsOn,
        toString: toString
    };
};

MethodExpression.build = function( string ) {
    var expressionBuilder = _dereq_( '../expressionBuilder.js' );
    
    var leftParent = string.indexOf( '(' );
    if ( leftParent === -1 ) {
        return undefined;
    }
    
    if ( ! expressionBuilder.endsWith( string, ')' ) ) {
        throw 'Syntax error. Bad method call: ' + string;
    }
    
    var methodName = string.substring( 0, leftParent ).trim();
    var argsString = string.substring( leftParent + 1, string.length - 1 );
    var args = expressionBuilder.getArgumentsFromString( argsString );
    
    return new MethodExpression( string, methodName, args );
};

module.exports = MethodExpression;

},{"../evaluateHelper.js":104,"../expressionBuilder.js":106}],123:[function(_dereq_,module,exports){
/*
    PathExpression class
*/
"use strict";

var context = _dereq_( '../../context.js' );
var ExpressionTokenizer = _dereq_( '../expressionTokenizer.js' );
var StringLiteral = _dereq_( './literals/stringLiteral.js' );
var PathSegmentExpression = _dereq_( './pathSegmentExpression.js' );
var expressionsUtils = _dereq_( '../expressionsUtils.js' );

var PathExpression = function( stringToApply, expressionListToApply ) {
    
    var string = stringToApply;
    var expressionList = expressionListToApply;
    
    var evaluate = function( scope ){

        var exception = undefined;
        
        for ( var i = 0; i < expressionList.length; i++ ) {
            try {
                var expression = expressionList[ i ];
                var result = expression.evaluate( scope );
                if ( result != null ){
                    return result;
                }
            } catch( e ) {
                exception = e;
            }
        }
        
        if ( exception ) {
            throw exception;
        }
        
        return null;
    };

    var dependsOn = function( depsDataItem, scope ){
        return expressionsUtils.buildDependsOnList( depsDataItem, scope, expressionList );
    };
    
    var toString = function(){
        return string;
    };
    
    return {
        evaluate: evaluate,
        dependsOn: dependsOn,
        toString: toString
    };
};

PathExpression.removePrefix = false;
PathExpression.getPrefix = function() {
    return context.getConf().pathExpression;
};
PathExpression.getId = function() { 
    return 'path';
};

PathExpression.build = function( s ) {
    var expressionBuilder = _dereq_( '../expressionBuilder.js' );
    
    var string = s.trim();
    
    // Blank expression evaluates to blank string
    if ( string.length === 0 ) {
        return StringLiteral.build( '' );
    }
    
    var segments = new ExpressionTokenizer( 
            string, 
            context.getConf().pathDelimiter, 
            false );

    // If there is only 1 must be a path segment
    if ( segments.countTokens() === 1 ) {
        return PathSegmentExpression.build( string );
    }

    // If there are more than 1 they can be any expression instance
    var expressionList = [];
    while ( segments.hasMoreTokens() ) {
        var nextToken = segments.nextToken();
        if ( ! nextToken ){
            throw 'Null token inside path expression: ' + string;
        }
        expressionList.push( 
            expressionBuilder.build( 
                nextToken
            ) 
        );
    }
    return new PathExpression( string, expressionList );
};

module.exports = PathExpression;

},{"../../context.js":87,"../expressionBuilder.js":106,"../expressionTokenizer.js":107,"../expressionsUtils.js":108,"./literals/stringLiteral.js":121,"./pathSegmentExpression.js":124}],124:[function(_dereq_,module,exports){
/*
    PathSegmentExpression class
*/
"use strict";

var context = _dereq_( '../../context.js' );
var ExpressionTokenizer = _dereq_( '../expressionTokenizer.js' );
var expressionsUtils = _dereq_( '../expressionsUtils.js' );
var ArrayExpression = _dereq_( './arrayExpression.js' );
var StringLiteral = _dereq_( './literals/stringLiteral.js' );
var NumericLiteral = _dereq_( './literals/numericLiteral.js' );
var BooleanLiteral = _dereq_( './literals/booleanLiteral.js' );
var ListExpression = _dereq_( './listExpression.js' );
var FunctionExpression = _dereq_( './functionExpression.js' );
var VariableExpression = _dereq_( './variableExpression.js' );
var IndirectionExpression = _dereq_( './indirectionExpression.js' );
var MethodExpression = _dereq_( './methodExpression.js' );
var PropertyExpression = _dereq_( './propertyExpression.js' );

var PathSegmentExpression = function( stringToApply, itemsToApply ) {
    
    var string = stringToApply;
    var items = itemsToApply;
    
    var evaluate = function( scope ){
        
        var token = items[ 0 ];
        var result = token.evaluate( scope );
        for ( var i = 1; i < items.length; i++ ) {
            // Only last element can be null
            if ( result == null ) {
                throw 'Error evaluating "' + string + '": "'  + token + '" is null';
            }
            token = items[ i ];
            result = token.evaluate( scope, result );
        }
        
        return result;
    };
    
    var dependsOn = function( depsDataItem, scope ){
        
        var firstSegmentDependsOn = expressionsUtils.buildDependsOnList( depsDataItem, scope, items[ 0 ] );
        if ( firstSegmentDependsOn.length === 0 ){
            return [];
        } else if ( firstSegmentDependsOn.length > 1 ){
            return firstSegmentDependsOn;
        }
        
        var temp = firstSegmentDependsOn[ 0 ];
        var result = [ temp ];
        for ( var i = 1; i < items.length; i++ ) {
            var token = items[ i ];
            var tokenDependsOn = token.dependsOn( temp );
            if ( ! tokenDependsOn ){
                break;
                //return temp;
            }
            
            temp += tokenDependsOn;
            result.push( temp );
        }
        
        return result;
    };
    
    var toString = function(){
        return string;
    };
    
    return {
        evaluate: evaluate,
        dependsOn: dependsOn,
        toString: toString
    };
};

PathSegmentExpression.build = function( string ) {
    
    var items = [];
    
    // Blank expression evaluates to blank string
    if ( string.length === 0 ) {
        items.push( 
            StringLiteral.build( '' ) );
        return items;
    }

    // Build first token
    var path = new ExpressionTokenizer( 
            string, 
            context.getConf().pathSegmentDelimiter, 
            false );
    var token = path.nextToken().trim();
    items.push(
            PathSegmentExpression.buildFirstPathToken( token ) );

    // Traverse the path
    while ( path.hasMoreTokens() ) {
        token = path.nextToken().trim();
        items.push(
            PathSegmentExpression.buildNextPathToken( token ) );
    }
    
    return new PathSegmentExpression( string, items );
};

PathSegmentExpression.buildFirstPathToken = function( t ){

    // Separate identifier from any array accessors
    var arrayData = ArrayExpression.buildArrayData( t );
    var arrayAccessor = arrayData? arrayData.arrayAccessor: undefined;
    var token = arrayData? arrayData.token: t;

    // First token must come from dictionary or be a literal

    // First see if it's a string literal
    var result = StringLiteral.build( token );

    // If it's not, try to see if it's a number
    if ( result === undefined ) {
        result = NumericLiteral.build( token );

        // Maybe it's a boolean literal
        if ( result === undefined ) {
            result = BooleanLiteral.build( token );

            // A list?
            if ( result === undefined ){
                result = ListExpression.build( token );

                // A function call?
                if ( result === undefined ) {
                    result = FunctionExpression.build( token );

                    // Must be an object in scope
                    if ( result === undefined ) {
                        result = VariableExpression.build( token );
                        
                        // Not recognized expression
                        if ( result === undefined ) {
                            throw 'Unknown expression: ' + token;
                        }
                    }
                }
            }
        }
    }

    if ( arrayAccessor !== undefined ) {
        result = ArrayExpression.build( result, arrayAccessor );
    }

    return result;
};

PathSegmentExpression.buildNextPathToken = function( t ){
    
    // Separate identifier from any array accessors
    var arrayData = ArrayExpression.buildArrayData( t );
    var arrayAccessor = arrayData? arrayData.arrayAccessor: undefined;
    var token = arrayData? arrayData.token: t;

    // Test for indirection
    var result = IndirectionExpression.build( token );
    
    // A method call?
    if ( result === undefined ) {
        result = MethodExpression.build( token );

        // A property
        if ( result === undefined ) {
            result = PropertyExpression.build( token );
        }
    }

    if ( arrayAccessor !== undefined ) {
        result = ArrayExpression.build( result, arrayAccessor );
    }

    return result;
};

module.exports = PathSegmentExpression;

},{"../../context.js":87,"../expressionTokenizer.js":107,"../expressionsUtils.js":108,"./arrayExpression.js":115,"./functionExpression.js":116,"./indirectionExpression.js":117,"./listExpression.js":118,"./literals/booleanLiteral.js":119,"./literals/numericLiteral.js":120,"./literals/stringLiteral.js":121,"./methodExpression.js":122,"./propertyExpression.js":125,"./variableExpression.js":127}],125:[function(_dereq_,module,exports){
/*
    PropertyExpression class
*/
"use strict";

var PropertyExpression = function( nameToApply ) {
    
    var name = nameToApply;
    
    var evaluate = function( scope, parent ){
        return parent[ name ];
    };
    
    var dependsOn = function( parent ){
        return '.' + name;
    };
    
    var toString = function(){
        return name;
    };
    
    return {
        evaluate: evaluate,
        dependsOn: dependsOn,
        toString: toString
    };
};

PropertyExpression.build = function( string ) {
    return new PropertyExpression( string );
};

module.exports = PropertyExpression;

},{}],126:[function(_dereq_,module,exports){
/*
    RangeExpression class
*/
"use strict";

var context = _dereq_( '../../context.js' );
var ExpressionTokenizer = _dereq_( '../expressionTokenizer.js' );
var expressionsUtils = _dereq_( '../expressionsUtils.js' );
var evaluateHelper = _dereq_( '../evaluateHelper.js' );
var NumericLiteral = _dereq_( './literals/numericLiteral.js' );

var RangeExpression = function( stringToApply, startExpressionToApply, endExpressionToApply, stepExpressionToApply ) {
    
    var string = stringToApply;
    var startExpression = startExpressionToApply;
    var endExpression = endExpressionToApply;
    var stepExpression = stepExpressionToApply;
    
    var evaluate = function( scope ){
        
        // Evaluate all expressions
        var start = evaluateHelper.evaluateNumber( scope, startExpression );
        var end = evaluateHelper.evaluateNumber( scope, endExpression );
        var step = evaluateHelper.evaluateNumber( scope, stepExpression );
        
        // The range is valid, evaluate it
        var result = [];
        var forward = step > 0; 
        
        var c = start;
        while( forward? c <= end: c >= end ){
            result.push( c );
            c += step;
        }
        
        return result;
    };

    var dependsOn = function( depsDataItem, scope ){
        return expressionsUtils.buildDependsOnList( depsDataItem, scope, startExpression, endExpression, stepExpression );
    };
    
    var toString = function(){
        return string;
    };
    
    return {
        evaluate: evaluate,
        dependsOn: dependsOn,
        toString: toString
    };
};

RangeExpression.build = function( s ) {
    var expressionBuilder = _dereq_( '../expressionBuilder.js' );
    
    if ( ! s ) {
        return undefined;
    }

    var string = s.trim();
    
    // If it contains spaces it is not a valid range
    if ( string.indexOf( ' ' ) !== -1 ) {
        return undefined;
    }
    
    var segments = new ExpressionTokenizer( 
            string, 
            context.getConf().intervalDelimiter, 
            false );

    var numberOfTokens = segments.countTokens();
    if ( numberOfTokens !== 2 && numberOfTokens !== 3 ) {
        return undefined;
    }

    var RANGE_DEFAULT_START = 0;
    var RANGE_DEFAULT_STEP = 1;
    
    // Build start expression
    var start = segments.nextToken().trim();
    var startExpression = start == ''? 
            NumericLiteral.build( RANGE_DEFAULT_START ): 
            expressionBuilder.build( start );

    // Build end expression
    var endExpression = expressionBuilder.build( segments.nextToken() );

    // Build step expression
    var stepExpression = numberOfTokens === 3? 
            expressionBuilder.build( segments.nextToken() ):
            NumericLiteral.build( RANGE_DEFAULT_STEP );
    
    return new RangeExpression( string, startExpression, endExpression, stepExpression );
};

module.exports = RangeExpression;

},{"../../context.js":87,"../evaluateHelper.js":104,"../expressionBuilder.js":106,"../expressionTokenizer.js":107,"../expressionsUtils.js":108,"./literals/numericLiteral.js":120}],127:[function(_dereq_,module,exports){
/*
    VariableExpression class
*/
"use strict";

var context = _dereq_( '../../context.js' );

var VariableExpression = function( nameToApply ) {
    
    var name = nameToApply;
    
    var evaluate = function( scope ){
        
        if ( ! scope.isValidVariable( name ) ){
            throw 'Not declared variable found using strict mode:' + name;
        }
        
        return scope.get( name );
    };
    
    var dependsOn = function( depsDataItem, scope ){
        
        if ( ! depsDataItem.mustAddVar( name ) ){
            return [];
        }
        
        var expression = scope.getVarExpression( name );
        if ( ! expression ){
            depsDataItem.add1NonExpressionVar( name );
            return [ name ];
        }
        
        depsDataItem.add1ExpressionVar( name );
        var result = expression.dependsOn( depsDataItem, scope );
        depsDataItem.addAllVars( result, scope );
        return result;
    };
    
    var getVarName = function(){
        return name;
    };
    
    var toString = function(){
        return name;
    };

    return {
        evaluate: evaluate,
        dependsOn: dependsOn,
        getVarName: getVarName,
        toString: toString
    };
};

VariableExpression.build = function( string ) {
    
    return context.getConf().variableNameRE.test( string )?
        new VariableExpression( string ):
        undefined;
};

module.exports = VariableExpression;

},{"../../context.js":87}],128:[function(_dereq_,module,exports){
/*
    JavascriptExpression class
*/
"use strict";

var context = _dereq_( '../../context.js' );
var expressionsUtils = _dereq_( '../expressionsUtils.js' );
var StringExpression = _dereq_( '../stringExpression.js' );

var JavascriptExpression = function( expressionToApply ) {
    
    var stringExpression = expressionToApply;
    
    var evaluate = function( scope ){
        var evaluatedString = stringExpression.evaluate( scope );
        return eval( evaluatedString );
    };
    
    var dependsOn = function( depsDataItem, scope ){
        return expressionsUtils.buildDependsOnList( depsDataItem, scope, stringExpression );
    };
    
    var toString = function(){
        return stringExpression;
    };
    
    return {
        evaluate: evaluate,
        dependsOn: dependsOn,
        toString: toString
    };
};

JavascriptExpression.removePrefix = true;

JavascriptExpression.getPrefix = function() {
    if ( JavascriptExpression.prefix === undefined ){
        JavascriptExpression.prefix = context.getConf().javaScriptExpression;
    }
    return JavascriptExpression.prefix;
};

JavascriptExpression.getId = JavascriptExpression.getPrefix;

JavascriptExpression.build = function( string ) {
    return new JavascriptExpression(
            StringExpression.build( string ) );
};

module.exports = JavascriptExpression;

},{"../../context.js":87,"../expressionsUtils.js":108,"../stringExpression.js":130}],129:[function(_dereq_,module,exports){
/*
    QueryExpression class
*/
"use strict";

var context = _dereq_( '../../context.js' );
var expressionsUtils = _dereq_( '../expressionsUtils.js' );

var QueryExpression = function( stringToApply, expressionToApply ) {
    
    var string = stringToApply;
    var expression = expressionToApply;
    
    var evaluate = function( scope ){
        
        try {
            var evaluated = expression.evaluate( scope );
            var elementList = window.document.querySelectorAll( evaluated );
            
            // elementList with length 1
            if ( elementList.length === 1 ){
                return elementList[ 0 ].innerText;
            }
            
            // elementList with length > 1
            var texts = [];
            for ( var i = 0; i < elementList.length; ++i ){
                texts.push( elementList[ i ].innerText );
            }
            return texts;
            
        } catch ( e ){
            return 'Query expression error in "' + string + '": ' + e;
        }
    };

    var dependsOn = function( depsDataItem, scope ){
        return expressionsUtils.buildDependsOnList( depsDataItem, scope, expression );
    };
    
    var toString = function(){
        return string;
    };

    return {
        evaluate: evaluate,
        dependsOn: dependsOn,
        toString: toString
    };
};

QueryExpression.removePrefix = true;
QueryExpression.getPrefix = function() {
    return context.getConf().queryExpression;
};
QueryExpression.getId = QueryExpression.getPrefix;

QueryExpression.build = function( string ) {
    var expressionBuilder = _dereq_( '../expressionBuilder.js' );
    
    var expression = expressionBuilder.build( string );
    
    return new QueryExpression( string, expression );
};

module.exports = QueryExpression;

},{"../../context.js":87,"../expressionBuilder.js":106,"../expressionsUtils.js":108}],130:[function(_dereq_,module,exports){
/*
    StringExpression class
*/
"use strict";

var context = _dereq_( '../context.js' );
var StringLiteral = _dereq_( './path/literals/stringLiteral.js' );
var PathExpression = _dereq_( './path/pathExpression.js' );
var expressionsUtils = _dereq_( './expressionsUtils.js' );

var StringExpression = function( stringToApply, expressionListToApply ) {
    
    var string = stringToApply;
    var expressionList = expressionListToApply;
    
    var evaluate = function( scope ){
        
        var result = '';
        
        for ( var i = 0; i < expressionList.length; i++ ) {
            var expression = expressionList[ i ];
            result += expression.evaluate( scope );
        }
        
        return result;
    };

    var dependsOn = function( depsDataItem, scope ){
        return expressionsUtils.buildDependsOnList( depsDataItem, scope, expressionList );
    };
    
    var toString = function(){
        return string;
    };
    
    return {
        evaluate: evaluate,
        dependsOn: dependsOn,
        toString: toString
    };
};

StringExpression.removePrefix = true;
StringExpression.getPrefix = function() {
    return context.getConf().stringExpression;
};
StringExpression.getId = StringExpression.getPrefix;

StringExpression.build = function( string ) {
    var STATE_SCANNING = 0;
    var STATE_AT_DOLLAR = 1;
    var STATE_IN_EXPRESSION = 2;
    var STATE_IN_BRACKETED_EXPRESSION = 3;

    var expressionList = [];
    var literal = '';
    var subexpression = '';
    var state = STATE_SCANNING;

    for ( var i = 0; i < string.length; i++ ) {
        var ch = string.charAt( i );

        switch ( state ) {
                
        // In the string part of the expression
        case STATE_SCANNING:
            // Found a dollar sign
            if ( ch === '$' ) {
                state = STATE_AT_DOLLAR;
                
            // Just keep appending to buffer
            } else {
                literal += ch;
            }
            break;

        // Next character after dollar sign
        case STATE_AT_DOLLAR:
            // An escaped dollar sign
            if ( ch === '$' ) {
                literal += '$';
                state = STATE_SCANNING;
                
            // Beginning of a bracketed expression
            } else if ( ch === '{' ) {
                // Reset subexpression and change state
                subexpression = '';
                state = STATE_IN_BRACKETED_EXPRESSION;

                // Add literal and reset it if needed
                if ( literal ){
                    expressionList.push( 
                            new StringLiteral( literal ) 
                    );
                    literal = '';
                }
                
            // Beginning of a non bracketed expression
            } else {
                subexpression += ch;
                state = STATE_IN_EXPRESSION;
                
                // Add literal and reset it if needed
                if ( literal ){
                    expressionList.push( 
                            new StringLiteral( literal )
                    );
                    literal = '';
                }
            }
            break;

        // In subexpression
        case STATE_IN_BRACKETED_EXPRESSION:
        case STATE_IN_EXPRESSION:
            // Check for end
            if ( ( state === STATE_IN_BRACKETED_EXPRESSION && ch === '}' )
                    || ( state === STATE_IN_EXPRESSION && ch == ' ' ) ) {
                expressionList.push( 
                        PathExpression.build( subexpression ) 
                );

                if ( state === STATE_IN_EXPRESSION ) {
                    literal += ch;
                }
                state = STATE_SCANNING;
                
            // Keep appending to subexpression
            } else {
                subexpression += ch;
            }
        }
    }

    // Ended in unclosed bracket
    if ( state === STATE_IN_BRACKETED_EXPRESSION ) {
        throw 'Unclosed left curly brace: ' + string;
        
    // Ended at expression
    } else if ( state == STATE_IN_EXPRESSION ) {
        expressionList.push( 
                PathExpression.build( subexpression ) 
        );
    }

    if ( literal ){
        expressionList.push( 
                new StringLiteral( literal ) 
        );
    }

    return new StringExpression( string, expressionList );
};

module.exports = StringExpression;

},{"../context.js":87,"./expressionsUtils.js":108,"./path/literals/stringLiteral.js":121,"./path/pathExpression.js":123}],131:[function(_dereq_,module,exports){
/* 
    I18n class 
    External dependencies: Intl (supported by recent browsers) and MessageFormat
*/
module.exports = function( languageId, res ) {
    "use strict";
    
    var MessageFormat = _dereq_( 'messageformat' );
    var context = _dereq_( '../context.js' );
    var utils = _dereq_( '../utils.js' );
    
    var resources = res;
    var mf = new MessageFormat( languageId );
    var cache = {};
    var numberFormatCache = {};
    var dateTimeFormatCache = {};
    /*var CONF_RESOURCE_ID = '/CONF/';*/
    var CONF_RESOURCE_ID = context.getConf().i18nConfResourceId;
    
    var getLanguage = function(){
        //return resources[ context.getConf().i18nConfResourceId ].language;
        return resources[ CONF_RESOURCE_ID ].language;
    };
    
    var getLocale = function(){
        //return resources[ context.getConf().i18nConfResourceId ].locale;
        return resources[ CONF_RESOURCE_ID ].locale;
    };
    
    var exists = function( id ) {
        return resources[ id ] !== undefined;
    };
    
    var tr = function( id, params, format, subformat ) {
        
        switch ( format ) {
        case 'string':
            return trString( id, params );
        case 'number':
            return trNumber( id, params );
        case 'currency':
            return trCurrency( id, params, subformat );
        case 'datetime':
            return trDateTime( id, params );
        } 
        
        throw 'I18n format type not supported: ' + format;
    };
    
    var trString = function( id, params ) {
        
        var mfunc = cache[ id ];
        
        if ( ! mfunc ){
            mfunc = mf.compile( resources[ id ] );
            cache[ id ] = mfunc;
        }
        
        return mfunc( params );
    };
    
    var getSource = function( params ){
        
        return params && utils.isFunction( params.toSource )?
            params.toSource():
            '';
    };
    
    var trNumber = function( value, params ) {
        
        var source = getSource( params );
        var numberFormat = numberFormatCache[ source ];
        
        if ( ! numberFormat ){
            numberFormat = new Intl.NumberFormat( getLocale(), params );
            numberFormatCache[ source ] = numberFormat;
        }
        
        return numberFormat.format( value );
    };
    
    var trCurrency = function( value, params, theCurrency ) {
        
        params.style = 'currency';
        params.currency = theCurrency;
        
        return trNumber( value, params );
    };
    
    var trDateTime = function( value, params ) {
        
        var source = getSource( params );
        var dateTimeFormat = dateTimeFormatCache[ source ];
        
        if ( ! dateTimeFormat ){
            dateTimeFormat = new Intl.DateTimeFormat( getLocale(), params );
            dateTimeFormatCache[ source ] = dateTimeFormat;
        }
        
        return dateTimeFormat.format( value );
    };
    
    return {
        getLanguage: getLanguage,
        getLocale: getLocale,
        exists: exists,
        tr: tr
    };
};

},{"../context.js":87,"../utils.js":161,"messageformat":64}],132:[function(_dereq_,module,exports){
/* 
    I18nBundle class 
*/
module.exports = function( ) {
    "use strict";
    
    var i18nList = {};
    var first = undefined;

    var add = function( i18n ){
        i18nList[ i18n.getLanguage() ] = i18n;
        if ( ! first ){
            first = i18n;
        }
    };
    
    var exists = function( id ){
        return first.exists( id );
    };
    
    var tr = function( id, params, format, subformat, language ) {
        
        if ( ! language ){
            throw 'Language not defined! Please, use data-iLanguage to define it before trying to translate anything!';
        }
        
        var i18n = i18nList[ language ];
        
        if ( ! i18n ){
            throw 'Language "' + language + '" not found in I18nBundle!';
        }
        
        return i18n.tr( id, params, format, subformat );
    };

    // Init!
    for ( var c = 0; c < arguments.length; c++ ) {
        add( arguments[ c ] );
    }
    
    return {
        add: add,
        exists: exists,
        tr: tr
    };
};

},{}],133:[function(_dereq_,module,exports){
/* 
    i18nHelper singleton class 
*/
var utils = _dereq_( '../utils.js' );
var I18n = _dereq_( './i18n.js' );
var context = _dereq_( '../context.js' );

module.exports = (function() {
    "use strict";
    
    var tr = function ( i18nList, id, params, format, subformat, language ){
        
        if ( ! i18nList ) {
            return 'No I18n instance defined!';
        }
            
        var length = i18nList.length;
        if ( ! length ){
            return 'Void I18n list!';
        }

        for ( var i = 0; i < length; i++ ) {
            var i18n = i18nList[ i ];
            if ( format !== 'string' || i18n.exists( id ) ){
                return i18n.tr( id, params, format, subformat, language );
            }
        }
        
        return 'I18n resource "' + id + '" not found!';
    };
    
    var loadAsync = function( remoteList, callback, failCallback ){
        
        loadAsyncItem( 
            {}, 
            callback, 
            failCallback,
            remoteList, 
            remoteList.length - 1 );
    };
    
    var loadAsyncItem = function( map, callback, failCallback, remoteList, currentIndex ){
        
        var url = remoteList[ currentIndex ];
        utils.getJSON( 
            {
                url: url,
                done: function( data ) {
                    map[ url ] = data;
                    if ( currentIndex > 0 ){
                        loadAsyncItem( 
                            map, 
                            callback, 
                            failCallback,
                            remoteList, 
                            --currentIndex );
                    } else {
                        callback( map );
                    }
                },
                fail: function( jqxhr, textStatus, error ) {
                    context.asyncError( url, error, failCallback );
                }
            }
        );
    };
    /*
    var loadAsyncItem = function( map, callback, failCallback, remoteList, currentIndex ){
        
        var url = remoteList[ currentIndex ];
        $.getJSON( url )
            .done(
                function( data ) {
                    map[ url ] = data;
                    if ( currentIndex > 0 ){
                        loadAsyncItem( 
                            map, 
                            callback, 
                            failCallback,
                            remoteList, 
                            --currentIndex );
                    } else {
                        callback( map );
                    }
                }
            )
            .fail(
                function( jqxhr, textStatus, error ) {
                    context.asyncError( url, error, failCallback );
                }
            );
    };
    */
    
    var loadAsyncAuto = function( dictionary, i18n, callback, failCallback ){
        
        // Return if it is nothing to do
        if ( ! i18n || ! i18n.files || ! Object.keys( i18n.files ).length ){
            callback();
            return;
        }
        
        // Build jsonFiles array
        var numberOfLanguages = Object.keys( i18n.files ).length;
        var jsonFiles = [];
        var urlPrefix = i18n.urlPrefix || '';
        for ( var lang in i18n.files ){
            var langFiles = i18n.files[ lang ];
            for ( var index in langFiles ){
                var file = langFiles[ index ];
                var url = urlPrefix + file;
                jsonFiles.push( url );
            }
        }
        
        // Use loadAsync method to load all jsonFiles; then register I18n instances and arrays
        loadAsync( 
            jsonFiles, 
            function( i18nMap ){
                
                for ( var lang in i18n.files ){
                    var langFiles = i18n.files[ lang ];
                    var i18nInstanceArray = [];
                    
                    // Register array vars
                    dictionary[ buildI18nInstanceArrayName( lang ) ] = i18nInstanceArray;
                    if ( numberOfLanguages === 1 ){
                        dictionary[ 'i18nArray' ] = i18nInstanceArray;
                    }
                    
                    for ( var index in langFiles ){
                        var file = langFiles[ index ];
                        var url = urlPrefix + file;
                        var i18nInstance = new I18n( lang, i18nMap[ url ] );
                        
                        // Register i18n instances
                        dictionary[ buildI18nInstanceName( file ) ] = i18nInstance;
                        i18nInstanceArray.unshift( i18nInstance ); // Add to the beginning of the array
                    }
                }
                
                callback();
            },
            failCallback 
        );
    };
    
    var buildI18nInstanceArrayName = function( lang ){
        return 'i18n' + lang.toUpperCase() + 'Array';
    };
    
    var buildI18nInstanceName = function( file ){
        
        var fileWithoutExtension = file.substr( 0, file.lastIndexOf( '.' ) );
        return 'i18n' + fileWithoutExtension.toUpperCase();
    };

    return {
        tr: tr,
        loadAsync: loadAsync,
        loadAsyncAuto: loadAsyncAuto
    };
})();

},{"../context.js":87,"../utils.js":161,"./i18n.js":131}],134:[function(_dereq_,module,exports){
/*
    logHelper singleton class
*/
module.exports = (function() {
    "use strict";
    
    var context = _dereq_( './context.js' );
    
    var trace = function (){
        
        var logger = context.getLogger();
        
        if ( ! logger ){
            return;
        }
        
        logger.trace.apply( logger, arguments );
    };
    
    var debug = function (){
        
        var logger = context.getLogger();
        
        if ( ! logger ){
            return;
        }
        
        logger.debug.apply( logger, arguments );
    };
    
    var info = function (){
        
        var logger = context.getLogger();
        
        if ( ! logger ){
            return;
        }
        
        logger.info.apply( logger, arguments );
    };
    
    var warn = function (){
        
        var logger = context.getLogger();
        
        if ( ! logger ){
            return;
        }
        
        logger.warn.apply( logger, arguments );
    };
    
    var error = function (){
        
        var logger = context.getLogger();
        
        if ( ! logger ){
            return;
        }
        
        logger.error.apply( logger, arguments );
    };
    
    var fatal = function (){
        
        var logger = context.getLogger();
        
        if ( ! logger ){
            return;
        }
        
        logger.fatal.apply( logger, arguments );
    };
    
    /*
    var fatalAndThrow = function ( message ){
        
        fatal.apply( this, arguments );
        throw message;
    };*/
    
    return {
        trace: trace,
        debug: debug,
        info: info,
        warn: warn,
        error: error,
        fatal: fatal
        //fatalAndThrow: fatalAndThrow
    };
})();

},{"./context.js":87}],135:[function(_dereq_,module,exports){
/*
    Exported functions
*/
exports.run = function( options ){
    
    var parser = _dereq_( './parsers/parser.js' );
    return parser.run( options );
};

/* Declare exports */
exports.I18n = _dereq_( './i18n/i18n.js' );
exports.I18nBundle = _dereq_( './i18n/i18nBundle.js' );
exports.i18nHelper = _dereq_( './i18n/i18nHelper.js' );
exports.context = _dereq_( './context.js' );
exports.logHelper = _dereq_( './logHelper.js' );
exports.expressionBuilder = _dereq_( './expressions/expressionBuilder.js' );
exports.evaluateHelper = _dereq_( './expressions/evaluateHelper.js' );
exports.ExpressionTokenizer = _dereq_( './expressions/expressionTokenizer.js' );
exports.ReactiveDictionary = _dereq_( './scopes/reactiveDictionary.js' );
exports.version = _dereq_( './version.js' );

/* Support RequireJS module pattern */
if ( typeof define === 'function' && define.amd ) {
    define( 'zpt.run', exports.run );
    define( 'zpt.I18n', exports.I18n );
    define( 'zpt.I18nBundle', exports.I18nBundle );
    define( 'zpt.i18nHelper', exports.i18nHelper );
    define( 'zpt.context', exports.context );
    define( 'zpt.logHelper', exports.logHelper );
    define( 'zpt.expressionBuilder', exports.expressionBuilder );
    define( 'zpt.evaluateHelper', exports.evaluateHelper );
    define( 'zpt.ExpressionTokenizer', exports.ExpressionTokenizer );
    define( 'zpt.ReactiveDictionary', exports.ReactiveDictionary );
    define( 'zpt.version', exports.version );
}

},{"./context.js":87,"./expressions/evaluateHelper.js":104,"./expressions/expressionBuilder.js":106,"./expressions/expressionTokenizer.js":107,"./i18n/i18n.js":131,"./i18n/i18nBundle.js":132,"./i18n/i18nHelper.js":133,"./logHelper.js":134,"./parsers/parser.js":152,"./scopes/reactiveDictionary.js":158,"./version.js":162}],136:[function(_dereq_,module,exports){
/* 
    Class AutoDefineHelper 
*/
var context = _dereq_( '../context.js' );
var TALDefine = _dereq_( '../attributes/TAL/talDefine.js' );

module.exports = function ( node ) {
    "use strict";
    
    var defineDelimiter = context.getConf().defineDelimiter;
    var inDefineDelimiter = context.getConf().inDefineDelimiter;
    var nocallExpressionPrefix = context.getConf().nocallVariableExpressionPrefix;
    var talAutoDefine = context.getTags().talAutoDefine;

    var buffer = '';
    if ( node && node.getAttribute( talAutoDefine ) ){
        buffer = node.getAttribute( talAutoDefine );
    }
    
    var put = function( name, string, nocall ){
        
        if ( buffer !== '' ){
            buffer += defineDelimiter;
        }
        buffer += (nocall? nocallExpressionPrefix + inDefineDelimiter: '') + name + inDefineDelimiter + string;
    };

    var updateNode = function( node ){

        if ( buffer ){
            node.setAttribute( talAutoDefine, buffer );
            return buffer;
        }
    };
    
    return {
        put: put,
        updateNode: updateNode
    };
};

},{"../attributes/TAL/talDefine.js":78,"../context.js":87}],137:[function(_dereq_,module,exports){
/* 
    Class DepsDataItem 
*/
"use strict";

var DepsDataItem = function() {
    
    this.nonExpressionVars = {};
    this.expressionVars = {};
};

DepsDataItem.prototype.mustAddVar = function( varName ){
    return this.nonExpressionVars[ varName ] === undefined && this.expressionVars[ varName ] === undefined;
};

DepsDataItem.prototype.addAllVars = function( varNames, scope ){
    
    for ( var name in varNames ){
        this.add1Var( varNames[ name ], scope );
    }
};

DepsDataItem.prototype.add1ExpressionVar = function( varName ){
    this.expressionVars[ varName ] = true;
};

DepsDataItem.prototype.add1NonExpressionVar = function( varName ){
    this.nonExpressionVars[ varName ] = true;
};

DepsDataItem.prototype.add1Var = function( varName, scope ){

    var map = scope.isLocalVar( varName )? this.expressionVars: this.nonExpressionVars;
    map[ varName ] = true;

    return true;
};

module.exports = DepsDataItem;

},{}],138:[function(_dereq_,module,exports){
/* 
    Class AbstractAction
*/
"use strict";

var utils = _dereq_( '../../utils.js' );
var context = _dereq_( '../../context.js' );

var AbstractAction = function( object, dictionary ) {
    
    this.id = object.id;
    this.var = object.var;
    this.currentElement = object.currentElement;
    this.animation = object.animation;
    this.animationCallback = object.animationCallback;
    if ( object.search ){
        if ( this.id || this.var ){
            throw 'Error in action: you can not set a search and then and id: if you set a search ZPT-JS will set the id for you!';
        }
        this.initializeUsingSearch( object.search, dictionary );
    }
};

AbstractAction.prototype.initializeUsingSearch = function( search, dictionary ){

    this.id = '';
    this.var = dictionary;
    
    // Iterate search items and build id and var
    for ( var i = 0; i < search.length; ++i ){
        var item = search[ i ];
        
        // Replace item is it a search object, '_first_' or '_last_'
        if ( utils.isPlainObject( item ) ){
            item = this.search( this.var, item );
        } else if ( item === context.getConf().firstIndexIdentifier ){
            item = 0;
        } else if ( item === context.getConf().lastIndexIdentifier ){
            item = this.var.length - 1;
        }
        
        // Build the id
        if ( Number.isInteger( item ) ){
            this.id += '[' + item + ']';
        } else {
            var separator = i === 0? '': '.';
            this.id += separator + item;
        }
        
        // Build the var
        this.var = this.var[ item ];
    }
};

AbstractAction.prototype.search = function( list, expressionElement ){
    
    for ( var i = 0; i < list.length; ++i ){
        var record = list[ i ];
        if ( AbstractAction.elementMaches( record, expressionElement ) ){
            return i;
        }
    }
    
    throw 'No record found matching your criteria!';
};

AbstractAction.elementMaches = function( element, expressionElement ){
    
    if ( expressionElement == undefined ){
        throw 'Expression to match must not be null!';
    }

    if ( Array.isArray( expressionElement ) ){
        throw 'Expression ' + utils.genericToString( expressionElement ) + ' to match must not be an array!';
    }

    if ( utils.isPlainObject( expressionElement ) ){
        for ( var i in expressionElement ){
            if ( expressionElement[ i ] !== element[ i ] ){
                return false;
            }
        }
        return true;
    }

    // Must be numeric or string
    return element === expressionElement;
};

AbstractAction.prototype.getValue = function( dictionary ){
    return this.var === undefined?
        dictionary[ this.id ]:
        this.var;
};

AbstractAction.prototype.resolveThisNode = function( indexItem, parserUpdater ){
    
    //var attributeInstance = indexItem.attributeInstance;
    var node = parserUpdater.findNodeById( indexItem.nodeId );
    if ( ! node ){
        // Removed node!
        parserUpdater.addRemovedToStatistics();
        return false;
    }
    parserUpdater.addUpdatedToStatistics();
    
    // Return the node
    return node;
};

AbstractAction.prototype.attributeInstanceIsRelated = function( attributeInstance ){
    throw 'Error: attributeInstanceIsRelated must be implemented!';
};

AbstractAction.prototype.updateDictionary = function(){
    throw 'Error: updateDictionary must be implemented!';
};

AbstractAction.prototype.updateHTML = function(){
    throw 'Error: updateHTML must be implemented!';
};

module.exports = AbstractAction;

},{"../../context.js":87,"../../utils.js":161}],139:[function(_dereq_,module,exports){
/* 
    Class AbstractArrayAction
*/
"use strict";

var AbstractAction = _dereq_( './abstractAction.js' );
var utils = _dereq_( '../../utils.js' );
var context = _dereq_( '../../context.js' );

var AbstractArrayAction = function( object, dictionary ) {
    AbstractAction.call( this, object, dictionary );
    
    this.index = object.index;
};

AbstractArrayAction.prototype = Object.create( AbstractAction.prototype );

AbstractArrayAction.getIndexNumericValue = function( index ){
    
    if ( index === undefined ){
        return undefined;   
    }
    
    if ( index === context.getConf().firstIndexIdentifier ){
        return 0;
    } else if ( index === context.getConf().lastIndexIdentifier ){
        return -1; // This means it is the last
    }
    return index;
};

AbstractArrayAction.prototype.getIndexNumericValue = function(){
    return AbstractArrayAction.getIndexNumericValue( this.index );
};

AbstractArrayAction.prototype.getIndexToUse = function( dictionary ){

    if ( this.index === undefined && this.currentElement === undefined ){
        throw 'index or currentElement must be defined in ' + this.id + ' array action!';
    }
    
    // Check if it uses the index
    var indexNumericValue = this.getIndexNumericValue();
    if ( indexNumericValue !== undefined ){
        return indexNumericValue;
    }

    // Must use currentElement
    var arrayValue = this.getValue( dictionary );
    
    for ( var i = 0; i < arrayValue.length; ++i ){
        var element = arrayValue[ i ];
        if ( AbstractAction.elementMaches( element, this.currentElement ) ){
            return i;
        }
    }
    
    throw 'currentElement ' + utils.genericToString( this.currentElement ) + ' not found in ' + this.id + ' array action!';
};

AbstractArrayAction.prototype.attributeInstanceIsRelated = function( attributeInstance ){
    return AbstractArrayAction.staticAttributeInstanceIsRelated( attributeInstance );
};

AbstractArrayAction.staticAttributeInstanceIsRelated = function( attributeInstance ){
    return attributeInstance.type === 'tal:repeat';
};

AbstractArrayAction.prototype.updateDictionary = function(){
    throw 'Error: updateDictionary must be implemented!';
};

AbstractArrayAction.prototype.updateHTML = function(){
    throw 'Error: updateHTML must be implemented!';
};

AbstractArrayAction.prototype.resolveChildNode = function( indexItem, parserUpdater ){
    
    //var attributeInstance = indexItem.attributeInstance;
    var node = parserUpdater.findNodeById( indexItem.nodeId );
    if ( ! node ){
        // Removed node!
        parserUpdater.addRemovedToStatistics();
        return false;
    }
    parserUpdater.addUpdatedToStatistics();
    
    // Return the node
    return this.indexToUse === -1?
        null:
        this.getIndexOfLoop( node.parentNode, indexItem.nodeId, this.indexToUse );
};

AbstractArrayAction.prototype.getIndexOfLoop = function( parentNode, nodeId, indexInLoop ){
    
    var numberOfChildren = parentNode.childElementCount;
    for ( var i = 0; i < numberOfChildren; ++i ){
        var childNode = parentNode.children[ i ];
        var currentNodeId = childNode.getAttribute( context.getTags().id );
        if ( currentNodeId === nodeId ){
            return parentNode.children[ 1 + i + indexInLoop ];
        }
    }
    
    return null;
};

module.exports = AbstractArrayAction;

},{"../../context.js":87,"../../utils.js":161,"./abstractAction.js":138}],140:[function(_dereq_,module,exports){
/* 
    Class AbstractObjectAction
*/
"use strict";

var AbstractAction = _dereq_( './abstractAction.js' );

var AbstractObjectAction = function( object, dictionary ) {
    AbstractAction.call( this, object, dictionary );
    
    this.property = object.property;
    this.id += '.' + object.property;
};

AbstractObjectAction.prototype = Object.create( AbstractAction.prototype );

AbstractObjectAction.prototype.attributeInstanceIsRelated = function( attributeInstance ){
    return true;
};

AbstractObjectAction.prototype.updateHTML = function( indexItem, parserUpdater, actionInstance ){
    
    // Must get the node
    var node = this.resolveThisNode( indexItem, parserUpdater );
    if ( ! node ){
        throw 'No node found to update';
    }
    
    // Update the selected node
    parserUpdater.updateNode( node );
    
    // Run animation
    parserUpdater.runAnimation( actionInstance, node );
    
    return true;
};

module.exports = AbstractObjectAction;

},{"./abstractAction.js":138}],141:[function(_dereq_,module,exports){
/* 
    Class ArrayCreate
*/
"use strict";

var AbstractArrayAction = _dereq_( './abstractArrayAction.js' );
var context = _dereq_( '../../context.js' );
var ParserNodeRenderer = _dereq_( '../../parsers/parserNodeRenderer.js' );
var utils = _dereq_( '../../utils.js' );

var ArrayCreate = function( object, dictionary ) {
    AbstractArrayAction.call( this, object, dictionary );
    
    this.newElement = object.newElement;
};

ArrayCreate.prototype = Object.create( AbstractArrayAction.prototype );

ArrayCreate.prototype.updateDictionary = function( dictionary ){
    
    this.indexToUse = this.getIndexToUse( dictionary );
    var arrayValue = this.getValue( dictionary );
    
    if ( this.indexToUse === -1 ){
        this.resolvedIndex = arrayValue.length;
        arrayValue.push( this.newElement );
    } else {
        this.resolvedIndex = this.indexToUse;
        arrayValue.splice( this.indexToUse, 0, this.newElement );
    }
};

ArrayCreate.prototype.updateHTML = function( indexItem, parserUpdater, actionInstance ){
    
    // Must get the nodeToUpdate
    var node = this.resolveThisNode( indexItem, parserUpdater );
    if ( ! node ){
        throw 'No node found to clone';
    }
    
    // Init some vars
    var tags = context.getTags();
    var parentNode = node.parentNode;
    
    // Clone and configure the node
    var tmpNode = ParserNodeRenderer.cloneAndConfigureNode( 
        node, 
        true, 
        tags, 
        node.getAttribute( tags.id ) 
    );
    ParserNodeRenderer.configureNodeForNewItem( 
        tmpNode, 
        tags, 
        parentNode, 
        indexItem, 
        this.resolvedIndex
    );
    
    // Insert it
    var sibling = this.indexToUse === -1?
        null:
        parentNode.children[ 1 + this.indexToUse ];
    parentNode.insertBefore( tmpNode, sibling );
    
    // Update the selected node
    parserUpdater.updateNode( tmpNode );
    
    // Run animation
    parserUpdater.runAnimation( actionInstance, tmpNode );
    
    return true;
};

ArrayCreate.buildMultiple = function( object, dictionary ){

    var actions = [];
    
    // Copy newElements to a new array
    var newElements = utils.copyArray( object.newElement );
    
    // Configure the object, create the first instance and add it to the list
    object.newElement = newElements[ 0 ];
    var firstActionInstance = new ArrayCreate( object, dictionary );
    actions.push( firstActionInstance );
    
    // Get the firstIndex and if the new elments must be the last
    var firstIndex = firstActionInstance.getIndexNumericValue();
    var isLast = -1 === firstIndex;
        
    // Build actions list
    for ( var i = 1; i < newElements.length; ++i ){
        var newElement = newElements[ i ];
        
        // Clone the object and configure the newElement and the index
        var newObject = utils.deepExtend( object );
        newObject.newElement = newElement;
        newObject.index = isLast?
            -1:
            firstIndex + i;
        
        // Instance the action instance and add it to the list
        var newActionInstance = new ArrayCreate( newObject, dictionary );
        actions.push( newActionInstance );
    }
    
    return actions;
};

module.exports = ArrayCreate;

},{"../../context.js":87,"../../parsers/parserNodeRenderer.js":153,"../../utils.js":161,"./abstractArrayAction.js":139}],142:[function(_dereq_,module,exports){
/* 
    Class ArrayDelete
*/
"use strict";

var AbstractArrayAction = _dereq_( './abstractArrayAction.js' );
var utils = _dereq_( '../../utils.js' );
var attributeIndex = _dereq_( '../../attributes/attributeIndex.js' );
var nodeRemover = _dereq_( '../nodeRemover.js' );

var ArrayDelete = function( object, dictionary ) {
    AbstractArrayAction.call( this, object, dictionary );
};

ArrayDelete.prototype = Object.create( AbstractArrayAction.prototype );

ArrayDelete.prototype.updateDictionary = function( dictionary ){

    this.indexToUse = this.getIndexToUse( dictionary );
    var arrayValue = this.getValue( dictionary );
    arrayValue.splice( this.indexToUse, 1 );
};

ArrayDelete.prototype.updateHTML = function( indexItem, parserUpdater, actionInstance, continueData ){
    
    // Must get the nodeToUpdate
    var nodeToDelete = this.resolveChildNode( indexItem, parserUpdater );
    if ( ! nodeToDelete ){
        throw 'No node found to be deleted at this index: ' + this.indexToUse;
    }
    
    // Run animation
    parserUpdater.runAnimation( 
        actionInstance, 
        nodeToDelete, 
        function(){
            
            // Remove the selected node from the index and from HTML
            //attributeIndex.removeNode( nodeToDelete ); 
            nodeRemover.removeNode( nodeToDelete );
            //TODO update next siblings?
            
            // Continue
            parserUpdater.continueUpdateHTML( continueData );
        } 
    );
    
    //return true;
    return false;
};

ArrayDelete.buildMultiple = function( object, dictionary ){

    var actions = [];
    var property = object.index? 'index': 'currentElement';

    // Copy indexes to a new array
    var allItems = utils.copyArray( object[ property ] );
    
    // Build actions list
    for ( var i = 0; i < allItems.length; ++i ){
        var item = allItems[ i ];
        
        // Clone the object and configure the index
        var newObject = utils.deepExtend( object );
        newObject[ property ] = item;
        
        // Instance the action instance and add it to the list
        var newActionInstance = new ArrayDelete( newObject, dictionary );
        newActionInstance.index = newActionInstance.getIndexToUse( dictionary );
        actions.push( newActionInstance );
    }
    
    // Sort actions
    actions.sort(
        function( a, b ){ return b.index - a.index; }
    );
    
    return actions;
};

module.exports = ArrayDelete;

},{"../../attributes/attributeIndex.js":83,"../../utils.js":161,"../nodeRemover.js":151,"./abstractArrayAction.js":139}],143:[function(_dereq_,module,exports){
/* 
    Class ArrayUpdate
*/
"use strict";

var AbstractArrayAction = _dereq_( './abstractArrayAction.js' );

var ArrayUpdate = function( object, dictionary ) {
    AbstractArrayAction.call( this, object, dictionary );
    
    this.newElement = object.newElement;
};

ArrayUpdate.prototype = Object.create( AbstractArrayAction.prototype );

ArrayUpdate.prototype.updateDictionary = function( dictionary ){
    
    this.indexToUse = this.getIndexToUse( dictionary );
    var arrayValue = this.getValue( dictionary );
    arrayValue[ this.indexToUse ] = this.newElement;
};

ArrayUpdate.prototype.updateHTML = function( indexItem, parserUpdater, actionInstance ){
    
    // Must get the nodeToUpdate
    var nodeToUpdate = this.resolveChildNode( indexItem, parserUpdater );
    if ( ! nodeToUpdate ){
        throw 'No node found to be updated at this index: ' + this.indexToUse;
    }
    
    // Update the selected node
    parserUpdater.updateNode( nodeToUpdate, true );
    
    // Run animation
    parserUpdater.runAnimation( actionInstance, nodeToUpdate );
    
    return true;
};

module.exports = ArrayUpdate;

},{"./abstractArrayAction.js":139}],144:[function(_dereq_,module,exports){
/* 
    Class CSSAnimationManager 
*/
"use strict";

module.exports = (function() {
    
    var animate = function( dictionaryAction, node, callback ) {
        
        // Run callback and return if there is no animation
        if ( ! dictionaryAction.animation ){
            if ( callback ){
                callback();
            };
            return;
        }
        
        // Set the animation
        node.style.animation = 'none';
        setTimeout(
            function() {
                // Set the animationend listener
                var animationendCallback = function( event ){
                    if ( callback ){
                        callback();
                    }
                };
                //node.removeEventListener( 'animationend', animationendCallback );
                node.addEventListener( 'animationend', animationendCallback );

                // Set the animation
                node.style.animation = dictionaryAction.animation;
            }, 
            10
        );
    };
    
    var reset = function( node ) {
        node.style.animation = 'none';
    };
    
    var self = {
        animate: animate,
        reset: reset
    };
    
    return self;
})();

},{}],145:[function(_dereq_,module,exports){
/* 
    Class dictionaryActionBuilder 
*/
"use strict";

var ArrayUpdate = _dereq_( './arrayUpdate.js' );
var ArrayDelete = _dereq_( './arrayDelete.js' );
var ArrayCreate = _dereq_( './arrayCreate.js' );
var ObjectUpdate = _dereq_( './objectUpdate.js' );
var ObjectDelete = _dereq_( './objectDelete.js' );

module.exports = (function() {
    
    var build = function( object, dictionary ) {
        
        switch ( object.action ) {
        case 'updateArray':
            return new ArrayUpdate( object, dictionary );
        case 'deleteArray':
            return Array.isArray( object.index ) || Array.isArray( object.currentElement )? 
                ArrayDelete.buildMultiple( object, dictionary ):
                new ArrayDelete( object, dictionary );
        case 'createArray':
            return Array.isArray( object.newElement )? 
                ArrayCreate.buildMultiple( object, dictionary ):
                new ArrayCreate( object, dictionary );
        case 'updateObject':
            return object.editedProperties || object.deletedProperties?
                ObjectUpdate.buildMultiple( object, dictionary ):
                new ObjectUpdate( object, dictionary );
        case 'deleteObject':
            return new ObjectDelete( object, dictionary );
        default:
            throw 'Unknown dictionary action: ' + object.action;
        }
    };
    
    var self = {
        build: build
    };
    
    return self;
})();

},{"./arrayCreate.js":141,"./arrayDelete.js":142,"./arrayUpdate.js":143,"./objectDelete.js":146,"./objectUpdate.js":147}],146:[function(_dereq_,module,exports){
/* 
    Class ObjectDelete
*/
"use strict";

var AbstractObjectAction = _dereq_( './abstractObjectAction.js' );

var ObjectDelete = function( object, dictionary ) {
    AbstractObjectAction.call( this, object, dictionary );
};

ObjectDelete.prototype = Object.create( AbstractObjectAction.prototype );

ObjectDelete.prototype.updateDictionary = function( dictionary ){
    
    var objectValue = this.getValue( dictionary );
    delete objectValue[ this.property ];
};

module.exports = ObjectDelete;

},{"./abstractObjectAction.js":140}],147:[function(_dereq_,module,exports){
/* 
    Class ObjectUpdate
*/
"use strict";

var AbstractObjectAction = _dereq_( './abstractObjectAction.js' );
var ObjectDelete = _dereq_( './objectDelete.js' );
var utils = _dereq_( '../../utils.js' );

var ObjectUpdate = function( object, dictionary ) {
    AbstractObjectAction.call( this, object, dictionary );
    
    this.newElement = object.newElement;
};

ObjectUpdate.prototype = Object.create( AbstractObjectAction.prototype );

ObjectUpdate.prototype.updateDictionary = function( dictionary ){
    
    var objectValue = this.getValue( dictionary );
    objectValue[ this.property ] = this.newElement;
};

ObjectUpdate.buildMultiple = function( object, dictionary ){

    var actions = [];
    var clonedObject = utils.deepExtend( object );
    
    // Copy editedProperties and deletedProperties
    var editedProperties = clonedObject.editedProperties;
    var deletedProperties = clonedObject.deletedProperties;
    
    // Delete them
    delete clonedObject.editedProperties;
    delete clonedObject.deletedProperties;
        
    // Build actions list for editedProperties
    if ( editedProperties ){
        clonedObject.action = 'updateObject';
        for ( var editedPropertiesId in editedProperties ){
            var editedPropertiesValue = editedProperties[ editedPropertiesId ];

            // Clone the object and configure property and newElement
            var newObject = utils.deepExtend( clonedObject );
            newObject.property = editedPropertiesId;
            newObject.newElement = editedPropertiesValue;

            // Instance the action instance and add it to the list
            var newActionInstance = new ObjectUpdate( newObject, dictionary );
            actions.push( newActionInstance );
        }
    }
    
    // Build actions list for deletedProperties
    if ( deletedProperties ){
        clonedObject.action = 'deleteObject';
        for ( var i = 0; i < deletedProperties.length; ++i ){
            var deletedPropertiesItem = deletedProperties[ i ];

            // Clone the object and configure property
            newObject = utils.deepExtend( clonedObject );
            newObject.property = deletedPropertiesItem;

            // Instance the action instance and add it to the list
            newActionInstance = new ObjectDelete( newObject, dictionary );
            actions.push( newActionInstance );
        }
    }
    
    return actions;
};

module.exports = ObjectUpdate;

},{"../../utils.js":161,"./abstractObjectAction.js":140,"./objectDelete.js":146}],148:[function(_dereq_,module,exports){
/* 
    Class Loop 
*/
"use strict";

var AutoDefineHelper = _dereq_( './autoDefineHelper.js' );
var expressionBuilder = _dereq_( '../expressions/expressionBuilder.js' );
var context = _dereq_( '../context.js' );

var Loop = function ( _itemVariableName, _expressionString, scope ) {
    
    var itemVariableName = _itemVariableName;
    var expressionString = _expressionString;
    
    var expression = expressionBuilder.build( expressionString );
    var getExpression = function(){
        return expression;
    };
    
    var items = expression.evaluate( scope );
    var getItems = function(){
        return items;
    };
    
    var currentIndex = -1;
    var maxIndex = items? items.length - 1: -1;
    
    var offset = 0;
    var setOffset = function( _offset ){
        offset = _offset;
    };
    
    var repeat = function(){
        
        if ( currentIndex++ < maxIndex ) {
            
            return Loop.buildAutoDefineHelper( 
                itemVariableName, 
                currentIndex, 
                expressionString, 
                items.length, 
                offset 
            );
        }
        
        return null;
    };
    
    return {
        setOffset: setOffset,
        repeat:repeat,
        getItems: getItems,
        getExpression: getExpression
    };
};

Loop.buildAutoDefineHelper = function( itemVariableName, itemIndex, expressionString, numberOfItems, offset ){
    
    var autoDefineHelper = new AutoDefineHelper();

    // Declare item-index, item-all, item and item-repeat variables
    autoDefineHelper.put(
        itemVariableName + '-index',
        itemIndex
    );
    autoDefineHelper.put(
        itemVariableName + '-all',
        expressionString
    );
    autoDefineHelper.put(
        itemVariableName,
        itemVariableName + '-all' + '[' + itemVariableName + '-index' + ']'
    );
    autoDefineHelper.put(
        itemVariableName + '-repeat',
        "context/repeat(" 
            + itemVariableName + "-index" + ","
            + numberOfItems + ","
            + offset
            + ")"
    );

    return autoDefineHelper;
};

Loop.setAutoDefineAttribute = function( node, itemVariableName, itemIndex, expressionString, numberOfItems, offset ){
    
    // Set item-index, item-all, item and item-repeat attributes
    node.setAttribute( 
        context.getTags().talAutoDefine,
        itemVariableName + '-index ' + itemIndex + ';'
            + itemVariableName + '-all ' + expressionString + ';'
            + itemVariableName + ' ' + itemVariableName +'-all[' + itemVariableName + '-index];'
            + itemVariableName + '-repeat context/repeat(' + itemVariableName + '-index,' + numberOfItems + ',' + offset + ')'
    );
};

module.exports = Loop;

},{"../context.js":87,"../expressions/expressionBuilder.js":106,"./autoDefineHelper.js":136}],149:[function(_dereq_,module,exports){
/* 
    Class LoopItem
*/
"use strict";

var LoopItem = function ( _currentIndex, _itemsLength, _offset ) {
    
    this.currentIndex = _currentIndex;
    this.itemsLength = _itemsLength;
    this.offset = _offset;
};

LoopItem.prototype.index = function( ) {
    return this.offset + this.currentIndex;
};

LoopItem.prototype.number = function( ) {
    return this.index() + 1;
};

LoopItem.prototype.even = function( ) {
    return this.index() % 2 === 0;
};

LoopItem.prototype.odd = function ( ) {
    return this.index() % 2 === 1;
};

LoopItem.prototype.start = function ( ) {
    return this.index() === 0;
};

LoopItem.prototype.end = function ( ) {
    return this.currentIndex === this.itemsLength - 1;
};

LoopItem.prototype.length = function () {
    return this.offset + this.itemsLength;
};

LoopItem.prototype.letter = function () {
    return this.formatLetter( this.index(), 'a' );
};

LoopItem.prototype.Letter = function () {
    return this.formatLetter( this.index(), 'A' );
};

LoopItem.prototype.formatLetter = function ( ii, startChar ) {
    var i = ii;
    var buffer = '';
    var start = startChar.charCodeAt( 0 ); 
    var digit = i % 26;
    buffer += String.fromCharCode( start + digit );

    while( i > 25 ) {
        i /= 26;
        digit = (i - 1 ) % 26;
        buffer += String.fromCharCode( start + digit );
    }

    return buffer.split('').reverse().join('');
};

LoopItem.prototype.roman = function () {
    return this.formatRoman( this.index() + 1, 0 );
};

LoopItem.prototype.Roman = function () {
    return this.formatRoman( this.index() + 1, 1 );
};

LoopItem.prototype.formatRoman = function ( nn, capital ) {
    var n = nn;

    // Can't represent any number 4000 or greater
    if ( n >= 4000 ) {
        return 'Overflow formatting roman!';
    }

    var buf = '';
    for ( var decade = 0; n !== 0; decade++ ) {
        var digit = n % 10;
        if ( digit > 0 ) {
            digit--;
            buf += this.romanArray [ decade ][ digit ][ capital ];
        }
        n = (n / 10) >> 0;
    }

    return buf.split( '' ).reverse().join( '' );
};

LoopItem.prototype.romanArray = [
    /* One's place */
    [
        [ "i", "I" ],
        [ "ii", "II" ], 
        [ "iii", "III" ],
        [ "vi", "VI" ],
        [ "v", "V" ],
        [ "iv", "IV" ],
        [ "iiv", "IIV" ],
        [ "iiiv", "IIIV" ],
        [ "xi", "XI" ]
    ],

    /* 10's place */
    [
        [ "x", "X" ],
        [ "xx", "XX" ],
        [ "xxx", "XXX" ],
        [ "lx", "LX" ],
        [ "l", "L" ],
        [ "xl", "XL" ],
        [ "xxl", "XXL" ],
        [ "xxxl", "XXXL" ],
        [ "cx", "CX" ]
    ],

    /* 100's place */
    [
        [ "c", "C" ],
        [ "cc", "CC" ],
        [ "ccc", "CCC" ],
        [ "dc", "DC" ],
        [ "d", "D" ],
        [ "cd", "CD" ],
        [ "ccd", "CCD" ],
        [ "cccd", "CCCD" ],
        [ "mc", "MC" ]
    ],

    /* 1000's place */
    [
        [ "m", "M" ],
        [ "mm", "MM" ],
        [ "mmm", "MMM" ]
    ]
];

module.exports = LoopItem;

},{}],150:[function(_dereq_,module,exports){
/* 
    Class NodeAttributes 
*/
"use strict";

var context = _dereq_( '../context.js' );

var NodeAttributes = function( node, indexExpressions ) {
    
    var tags = context.getTags();
    
    // tal namespace
    this.talDefine = node.getAttribute( tags.talDefine );
    this.talCondition = node.getAttribute( tags.talCondition );
    this.talRepeat = node.getAttribute( tags.talRepeat );
    this.talContent = node.getAttribute( tags.talContent );
    this.talAttributes = node.getAttribute( tags.talAttributes );
    this.talOmitTag = node.getAttribute( tags.talOmitTag );
    this.talReplace = node.getAttribute( tags.talReplace );
    this.talOnError = node.getAttribute( tags.talOnError );
    this.talDeclare = node.getAttribute( tags.talDeclare );
    //this.talTag = undefined;
    
    // metal namespace
    this.metalDefineMacro = node.getAttribute( tags.metalDefineMacro );
    this.metalUseMacro = node.getAttribute( tags.metalUseMacro );
    this.metalDefineSlot = node.getAttribute( tags.metalDefineSlot );
    this.metalFillSlot = node.getAttribute( tags.metalFillSlot );
    
    // i18n namespace
    this.i18nDomain = node.getAttribute( tags.i18nDomain );
    this.i18nLanguage = node.getAttribute( tags.i18nLanguage );
    
    // For internal use
    this.qdup = node.getAttribute( tags.qdup );
    
    // Init this.id and set the node id if indexExpressions is true, some attribute is set and it is undefined
    if ( indexExpressions && this.isDynamicContentOn() ){
        this.id = node.getAttribute( tags.id );
        if ( ! this.id ){
            //this.id = utils.generateId( 6 );
            this.id = context.nextExpressionCounter();
            node.setAttribute( tags.id, this.id );
        }
    }
};

NodeAttributes.prototype.isDynamicContentOn = function() {
    
    return this.talDefine 
        || this.talCondition
        || this.talRepeat
        || this.talContent
        || this.talAttributes
        || this.talOmitTag 
        || this.talReplace
        || this.talOnError
        || this.talDeclare
        //|| this.talTag
        //|| this.metalDefineMacro 
        || this.metalUseMacro 
        //|| this.metalDefineSlot 
        || this.metalFillSlot 
        || this.i18nDomain
        || this.i18nLanguage;
        //|| this.qdup;
};

module.exports = NodeAttributes;

},{"../context.js":87}],151:[function(_dereq_,module,exports){
/* 
    Class NodeRemover 
*/
"use strict";

var context = _dereq_( '../context.js' );

module.exports = (function() {
    
    var tags = context.getTags();
    
    var removeGeneratedNodes = function( target ) {
        
        // Is multiroot?
        if ( Array.isArray( target ) ){ 
            // There are several roots
            
            var result = [];
            for ( var c = 0; c < target.length; c++ ) {
                result = result.concat( 
                    removeNodes( target[ c ] )
                );
            }
            return result;
        }
        
        // There is only one root
        return removeNodes( target );
    };
    
    var removeNodes = function( target ) {
        
        var result = [];
        
        result = result.concat( removeNodesByTag( target, tags.qdup ) );       // Remove all generated nodes (repeats)
        result = result.concat( removeNodesByTag( target, tags.metalMacro ) ); // Remove all generated nodes (macros)
        
        return result;
    };
    
    var removeNodesByTag = function( target, tag ){
        
        var list = target.querySelectorAll( "*[" + tag + "]" );
        return removeList( list );
    };
    
    var removeRelatedNodes = function( target ){
        
        var list = target.parentNode.querySelectorAll( 
            '[' + context.getTags().relatedId + '="' + target.getAttribute( context.getTags().id ) + '"]' 
        );
        return removeList( list );
    };
    
    var removeList = function( list ){

        var result = [];
        
        var node;
        var pos = 0;
        while ( node = list[ pos++ ] ) {
            // Add nodeId to result if needed
            var nodeId = getNodeId( node );
            if ( nodeId !== undefined ){
                result.push( nodeId );
            }
            
            // Add the nodeIds of its children
            addNodeIdsToList( node, result );
            
            // Remove node
            node.parentNode.removeChild( node );
        }
        
        return result;
    };
    
    var addNodeIdsToList = function( target, result ){
        
        // Get the nodes with data-id
        var nodeIdAttributeName = context.getTags().id;
        var list = target.querySelectorAll( '[' + nodeIdAttributeName + ']' );
        
        // Iterate the list
        var node;
        var pos = 0;
        while ( node = list[ pos++ ] ) {
            result.push( 
                node.getAttribute( nodeIdAttributeName ) 
            );
        }
    };
    
    var getNodeId = function( node ){
        
        var nodeIdAttributeName = context.getTags().id;
        
        return node.hasAttribute( nodeIdAttributeName )?
            node.getAttribute( nodeIdAttributeName ):
            undefined;
    };
    
    var removeNode = function( node ){
        var nodeId = getNodeId( node );
        var parentNode = node.parentNode;
        if ( parentNode ){
            parentNode.removeChild( node );
        }
        return nodeId;
    };
    
    var removeMultipleNodes = function( node, mustRemoveGeneratedNodes ){
        
        var result = removeRelatedNodes( node );
        
        if ( mustRemoveGeneratedNodes ){
            result = result.concat(
                removeGeneratedNodes( node )
            );
        }
        
        return result;
    };
    
    var self = {
        removeGeneratedNodes: removeGeneratedNodes,
        //removeRelatedNodes: removeRelatedNodes,
        removeNode: removeNode,
        removeMultipleNodes: removeMultipleNodes
    };
    
    return self;
})();

},{"../context.js":87}],152:[function(_dereq_,module,exports){
/* 
    Class Parser 
*/
"use strict";

var context = _dereq_( '../context.js' );
var ParserRenderer = _dereq_( './parserRenderer.js' );
var ParserUpdater = _dereq_( './parserUpdater.js' );
var ParserPreloader = _dereq_( './parserPreloader.js' );
var ReactiveDictionary = _dereq_( '../scopes/reactiveDictionary.js' );

module.exports = (function() {
    
    var parserOptions = {
        command: undefined, // preload, fullRender or partialRender
        root: undefined,
        dictionary: {},
        indexExpressions: true
        //notRemoveGeneratedTags,
        //target,
        //declaredRemotePageUrls,
        //i18n,
        //callback,
        //failCallback,
    };
    
    var updateParserOptions = function( options ){
        
        parserOptions.command = options.command || 'fullRender';
        parserOptions.root = options.root === undefined? parserOptions.root: options.root;
        parserOptions.dictionary = ( options.dictionary instanceof ReactiveDictionary?
            options.dictionary._getNonReactiveDictionary(): 
            options.dictionary )
            || parserOptions.dictionary;
        //parserOptions.dictionary = options.dictionary || parserOptions.dictionary;
        parserOptions.indexExpressions = options.indexExpressions === undefined? parserOptions.indexExpressions: options.indexExpressions;
    };
    
    var run = function( _options ){
        
        var options = _options || {};
        
        // Init parser options
        updateParserOptions( options );
    
        var command = options.command || 'fullRender';
        switch ( command ) {
            case 'preload':
                return processPreload(
                    options.callback,
                    options.failCallback,
                    options.declaredRemotePageUrls || [],
                    options.i18n,
                    options.notRemoveGeneratedTags,
                    options.maxFolderDictionaries
                );
            case 'fullRender':
            case 'partialRender':
                return processRender(
                    command === 'partialRender'? options.target: parserOptions.root,
                    options.dictionaryExtension,
                    options.notRemoveGeneratedTags,
                    parserOptions.indexExpressions && command === 'fullRender',
                    options.goToURLHash === undefined? context.nextRunCounter() === 1: false
                );
            case 'update':
                return processUpdate( 
                    options.dictionaryChanges,
                    options.dictionaryActions
                );
            default:
                throw 'Unknown command: ' + command;
        }
    };
    
    var processPreload = function( callback, failCallback, declaredRemotePageUrls, i18n, notRemoveGeneratedTags, maxFolderDictionaries ){
        
        var parserPreloader = new ParserPreloader( 
            parserOptions, 
            callback, 
            failCallback, 
            declaredRemotePageUrls, 
            i18n, 
            notRemoveGeneratedTags, 
            maxFolderDictionaries
        );

        parserPreloader.run();

        return parserPreloader;
    };
    
    var processRender = function( target, dictionaryExtension, notRemoveGeneratedTags, resetIndex, goToURLHash ){
        
        var parserRenderer = new ParserRenderer( 
            parserOptions, 
            target, 
            dictionaryExtension, 
            notRemoveGeneratedTags, 
            resetIndex,
            goToURLHash
        );

        parserRenderer.run();
        
        return parserRenderer;
    };
    
    var processUpdate = function( dictionaryChanges, dictionaryActions ) {
        
        var parserUpdater = new ParserUpdater( 
            dictionaryChanges,
            dictionaryActions,
            parserOptions
        );

        parserUpdater.run();
        
        return parserUpdater;
    };
    
    var getOptions = function(){
        return parserOptions;
    };
    
    var self = {
        run: run,
        getOptions: getOptions
    };
    
    return self;
})();

},{"../context.js":87,"../scopes/reactiveDictionary.js":158,"./parserPreloader.js":154,"./parserRenderer.js":155,"./parserUpdater.js":156}],153:[function(_dereq_,module,exports){
(function (process){(function (){
/* 
    Class ParserNodeRenderer
*/
"use strict";

var context = _dereq_( '../context.js' );
var log = _dereq_( '../logHelper.js' );
var NodeAttributes = _dereq_( './nodeAttributes.js' );
var attributeCache = _dereq_( '../cache/attributeCache.js' );
var attributeIndex = _dereq_( '../attributes/attributeIndex.js' );
var AutoDefineHelper = _dereq_( './autoDefineHelper.js' );
var evaluateHelper = _dereq_( '../expressions/evaluateHelper.js' );
var Loop = _dereq_( './loop.js' );

var I18NDomain = _dereq_( '../attributes/I18N/i18nDomain.js' );
var I18NLanguage = _dereq_( '../attributes/I18N/i18nLanguage.js' );
var METALDefineMacro = _dereq_( '../attributes/METAL/metalDefineMacro.js' );
var METALUseMacro = _dereq_( '../attributes/METAL/metalUseMacro.js' );
var TALAttributes = _dereq_( '../attributes/TAL/talAttributes.js' );
var TALCondition = _dereq_( '../attributes/TAL/talCondition.js' );
var TALContent = _dereq_( '../attributes/TAL/talContent.js' );
var TALDefine = _dereq_( '../attributes/TAL/talDefine.js' );
var TALOmitTag = _dereq_( '../attributes/TAL/talOmitTag.js' );
var TALOnError = _dereq_( '../attributes/TAL/talOnError.js' );
var TALRepeat = _dereq_( '../attributes/TAL/talRepeat.js' );
var TALReplace = _dereq_( '../attributes/TAL/talReplace.js' );
var TALDeclare = _dereq_( '../attributes/TAL/talDeclare.js' );
var contentHelper = _dereq_( '../attributes/TAL/contentHelper.js' );

var ParserNodeRenderer = function( _target, _scope, _indexExpressions ) {
    
    var target = _target; 
    var scope = _scope;
    var indexExpressions = _indexExpressions;
    
    var tags = context.getTags();
    
    var run = function(){
        process( target );
    };
    
    var process = function( node ) {

        try {
            // Get the attributes from the node
            var attributes = new NodeAttributes( node, indexExpressions );
            
            scope.startElement();

            // Process instructions
            attributes.talRepeat != null ? 
                processLoop( node, attributes ):
                processElement( node, attributes );

            scope.endElement();

        } catch ( e ) {
            
            // Try to treat error
            if ( ! treatError( node, e ) ) {
                throw e;
            }
        }
    };
    
    var processLoopNextSibling = function( node ){

        var counter = -1;
        var nextSibling = node;
        do {
            ++counter;
            nextSibling = nextSibling.nextElementSibling;
            if ( ! nextSibling ){
                return {
                    nextSibling: null,
                    counter: counter
                };
            }
        } while ( nextSibling.hasAttribute( tags.qdup ) );

        return {
            nextSibling: nextSibling,
            counter: counter
        };
    };
    
    var processLoop = function( node, attributes ) {
        
        // Process repeat
        //var talRepeat = TALRepeat.build( attributes.talRepeat );
        var talRepeat = attributeCache.getByAttributeClass( 
            TALRepeat, 
            attributes.talRepeat, 
            node,
            indexExpressions,
            scope
        );
        var loop = talRepeat.process( scope, node );

        // Check default
        if ( evaluateHelper.isDefault( loop.getItems() ) ){
            processElement( node, attributes );
            return true;
        }
        
        // Configure the node to clone it later
        node.removeAttribute( tags.talRepeat );
        node.removeAttribute( 'style' );
        node.setAttribute( tags.qdup, 1 );
        var nodeId = node.getAttribute( 'id' );
        node.removeAttribute( 'id' );
        var nodeDataId = node.getAttribute( tags.id );
        node.removeAttribute( tags.id );
        
        var nextSiblingData = processLoopNextSibling( node );
        var nextSibling = nextSiblingData.nextSibling;
        loop.setOffset( nextSiblingData.counter );
        //log.warn( 'loop counter: ' + nextSiblingData.counter );
        
        var autoDefineHelper;
        while ( autoDefineHelper = loop.repeat() ) {
            
            scope.startElement();
            
            // Clone and configure the node
            var tmpNode = ParserNodeRenderer.cloneAndConfigureNode( node, indexExpressions, tags, nodeDataId );

            // Insert it
            var parentNode = node.parentNode;
            parentNode.insertBefore( tmpNode, nextSibling );
            
            // Process it
            if ( ! processElement( tmpNode, attributes, autoDefineHelper ) ) {
                scope.endElement();
                return false;
            }
            
            scope.endElement();
        }

        // Configure repeat node (the original) to enable future reevaluation
        node.style.display = 'none';
        node.setAttribute( tags.talRepeat, attributes.talRepeat );
        if ( nodeId !== '' && nodeId != null ){
            node.setAttribute( 'id', nodeId );
        }
        if ( nodeDataId !== '' && nodeDataId != null ){
            node.setAttribute( tags.id, nodeDataId );
        }
        node.removeAttribute( tags.qdup );
        
        return true;
    };

    var treatError = function( node, exception ) {

        try {
            // Set the error variable
            var templateError = {
                type: exception.name,
                value: exception.message,
                traceback: exception.stack
            };
            scope.set( 
                context.getConf().templateErrorVarName, 
                templateError 
            );
            
            // Exit if there is no on-error expression defined
            var content = scope.get( context.getConf().onErrorVarName );
            if ( content == null ) {
                log.fatal( exception );
                scope.endElement();
                return false;
            }
            
            log.error( exception );
            scope.endElement();
            
            contentHelper.updateNode( 
                node, 
                scope.get( context.getConf().onErrorStructureVarName ), 
                content 
            );
            
            return content;
            
        } catch ( e ) {
            log.fatal( e );
            scope.endElement();
            throw e;
        }
    };
    
    var processElement = function( node, attributes, _autoDefineHelper ) {

        // If it is defined a metalFillSlot or a metalDefineMacro do nothing
        if ( attributes.metalFillSlot || ! processMETALDefineMacro(
            node, 
            attributes.metalDefineMacro 
        ) ) {
            // Stop processing the rest of this node as it is invisible
            return false;
        }
        
        var autoDefineHelper = _autoDefineHelper || new AutoDefineHelper( node );
        
        if ( ! processDeclare( 
            node,
            attributes.talDeclare,
            autoDefineHelper
        ) ) {
            // Stop processing the rest of this node as it is invisible
            return false;
        }
        
        processOnError( 
            node,
            attributes.talOnError,
            autoDefineHelper
        );
        
        processI18nLanguage( 
            node,
            attributes.i18nLanguage,
            autoDefineHelper
        );
        
        processI18nDomain(
            node,
            attributes.i18nDomain, 
            autoDefineHelper
        );
        
        processAutoDefine( 
            node, 
            autoDefineHelper
        );
        
        ParserNodeRenderer.processDefine( 
            node,
            attributes.talDefine,  
            false,
            scope,
            indexExpressions
        );
        
        if ( ! processCondition(
                node, 
                attributes.talCondition 
        ) ) {
            // Stop processing the rest of this node as it is invisible
            return false;
        }

        var omittedTag = processOmitTag(
                node, 
                attributes.talOmitTag 
        );

        var replaced = processReplace(
                node, 
                attributes.talReplace 
        );

        if ( ! omittedTag && ! replaced ) {
            
            processAttributes(
                    node, 
                    attributes.talAttributes 
            );

            if ( ! processContent(
                    node, 
                    attributes.talContent ) ) {

                defaultContent( node );
            }
        }

        processMETALUseMacro(
                node, 
                attributes.metalUseMacro, 
                attributes.talDefine,
                autoDefineHelper
        );
        
        return true;
    };

    var defaultContent = function( node ) {

        var childNodes = node.childNodes;
        if ( ! childNodes ) {
            return;
        }

        for ( var i = 0; i < childNodes.length; i++ ) {
            var currentChildNode = childNodes[ i ];

            // Check if node is ELEMENT_NODE and not parsed yet
            if ( currentChildNode && currentChildNode.nodeType === 1
                    && ! currentChildNode.getAttribute( tags.qdup ) ) {
                process( currentChildNode );
            }
        }
    };
    
    var processOnError = function( node, string, autoDefineHelper ) {

        if ( ! string ) {
            return;
        }

        var talOnError = attributeCache.getByAttributeClass( 
            TALOnError, 
            string, 
            node,
            indexExpressions,
            scope
        );
        return talOnError.putToAutoDefineHelper( autoDefineHelper );
    };
    
    var processAutoDefine = function( node, autoDefineHelper ) {
        
        var string = autoDefineHelper.updateNode( node );
        if ( ! string ) {
            return;
        }
        
        var talDefine = attributeCache.getByAttributeClass( 
            TALDefine, 
            string, 
            node,
            indexExpressions,
            scope
        );
        return talDefine.process( scope, false );
    };

    var processI18nDomain = function( node, string, autoDefineHelper ) {

        if ( ! string ) {
            return;
        }

        var i18nDomain = attributeCache.getByAttributeClass( 
            I18NDomain, 
            string, 
            node,
            indexExpressions,
            scope
        );
        return i18nDomain.putToAutoDefineHelper( scope, autoDefineHelper );
    };
    
    var processI18nLanguage = function( node, string, autoDefineHelper ) {

        if ( ! string ) {
            return;
        }

        var i18nLanguage = attributeCache.getByAttributeClass( 
            I18NLanguage, 
            string, 
            node,
            indexExpressions,
            scope
        );
        return i18nLanguage.putToAutoDefineHelper( autoDefineHelper );
    };
    
    var processDeclare = function( node, string, autoDefineHelper ) {

        if ( ! string ) {
            return true;
        }

        var talDeclare = attributeCache.getByAttributeClass( 
            TALDeclare, 
            string, 
            node,
            indexExpressions,
            scope
        );
        return talDeclare.process( scope, autoDefineHelper );
    };
    
    var processMETALDefineMacro = function( node, string ) {

        if ( ! string ) {
            return true;
        }

        // No sense to cache macro definitions!
        var metalDefineMacro = METALDefineMacro.build( string );
        return metalDefineMacro.process( scope, node );
    };

    var processMETALUseMacro = function( node, string, stringDefine, autoDefineHelper ) {

        if ( ! string ) {
            return;
        }
        
        // No sense to cache macro uses!
        var metalUseMacro = METALUseMacro.build( string, stringDefine, scope );
        var newNode = metalUseMacro.process( scope, node, autoDefineHelper, indexExpressions );
        newNode.setAttribute( tags.qdup, 1 );
        
        // Index node
        if ( indexExpressions ){
            attributeIndex.add( node, metalUseMacro, scope );
        }
    
        // Process new node
        return process( newNode );
    };

    var processCondition = function( node, string ) {

        if ( ! string ) {
            return true;
        }

        var talCondition = attributeCache.getByAttributeClass( 
            TALCondition, 
            string, 
            node,
            indexExpressions,
            scope
        );
        return talCondition.process( scope, node );
    };
    
    var processReplace = function( node, string ) {
        
        if ( ! string ){
            return false;
        }
        
        var talReplace = attributeCache.getByAttributeClass( 
            TALReplace, 
            string, 
            node,
            indexExpressions,
            scope
        );
        return talReplace.process( scope, node );
    };

    var processOmitTag = function( node, string ) {

        if ( string == null ) {
            return false;
        }

        var talOmitTag = attributeCache.getByAttributeClass( 
            TALOmitTag, 
            string, 
            node,
            indexExpressions,
            scope
        );
        return talOmitTag.process( scope, node, self );
    };
    
    var processContent = function( node, string ) {
        
        if ( ! string ){
            return false;
        }

        var talContent = attributeCache.getByAttributeClass( 
            TALContent, 
            string, 
            node,
            indexExpressions,
            scope
        );
        return talContent.process( scope, node );
    };
  
    var processAttributes = function( node, string ) {

        if ( ! string ) {
            return;
        }

        var talAttributes = attributeCache.getByAttributeClass( 
            TALAttributes, 
            string, 
            node,
            indexExpressions,
            scope 
        );
        return talAttributes.process( scope, node );
    };
    
    var self = {
        run: run,
        defaultContent: defaultContent
    };
    
    return self;
};

ParserNodeRenderer.processDefine = function( node, string, forceGlobal, scope, indexExpressions ) {

    if ( ! string ) {
        return;
    }

    var talDefine = attributeCache.getByAttributeClass( 
        TALDefine, 
        string, 
        node,
        indexExpressions,
        scope
    );
    return talDefine.process( scope, forceGlobal );
};

ParserNodeRenderer.cloneAndConfigureNode = function( node, indexExpressions, tags, nodeDataId ) {
    
    // Clone node
    var tmpNode = node.cloneNode( true );
    if ( 'form' in tmpNode ) {
        tmpNode.checked = false;
    }

    // Set id and related id if needed
    if ( indexExpressions ){
        tmpNode.setAttribute( tags.id, context.nextExpressionCounter() );
        tmpNode.setAttribute( tags.relatedId, nodeDataId );
    }
    
    return tmpNode;
};

ParserNodeRenderer.configureNodeForNewItem = function( tmpNode, tags, parentNode, indexItem, indexToUse ) {
    
    // Remove attributes
    tmpNode.removeAttribute( tags.talRepeat );
    tmpNode.removeAttribute( 'style' );
    tmpNode.setAttribute( tags.qdup, 1 );
    
    // Configure loop attributes
    Loop.setAutoDefineAttribute( 
        tmpNode, 
        indexItem.attributeInstance.getVarName(), 
        indexToUse,
        indexItem.attributeInstance.getExpressionString(), 
        parentNode.childElementCount, 
        0
    );
};

module.exports = ParserNodeRenderer;

}).call(this)}).call(this,_dereq_('_process'))
},{"../attributes/I18N/i18nDomain.js":68,"../attributes/I18N/i18nLanguage.js":69,"../attributes/METAL/metalDefineMacro.js":70,"../attributes/METAL/metalUseMacro.js":72,"../attributes/TAL/contentHelper.js":73,"../attributes/TAL/talAttributes.js":74,"../attributes/TAL/talCondition.js":75,"../attributes/TAL/talContent.js":76,"../attributes/TAL/talDeclare.js":77,"../attributes/TAL/talDefine.js":78,"../attributes/TAL/talOmitTag.js":79,"../attributes/TAL/talOnError.js":80,"../attributes/TAL/talRepeat.js":81,"../attributes/TAL/talReplace.js":82,"../attributes/attributeIndex.js":83,"../cache/attributeCache.js":84,"../context.js":87,"../expressions/evaluateHelper.js":104,"../logHelper.js":134,"./autoDefineHelper.js":136,"./loop.js":148,"./nodeAttributes.js":150,"_process":65}],154:[function(_dereq_,module,exports){
/* 
    Class ParserPreloader
*/
"use strict";

var context = _dereq_( '../context.js' );
var log = _dereq_( '../logHelper.js' );
var nodeRemover = _dereq_( './nodeRemover.js' );
var Scope = _dereq_( '../scopes/scope.js' );
var i18nHelper = _dereq_( '../i18n/i18nHelper.js' );
var resolver = _dereq_( '../resolver.js' );
var attributeIndex = _dereq_( '../attributes/attributeIndex.js' );

var ParserPreloader = function( _parserOptions, _callback, _failCallback, _declaredRemotePageUrls, _i18n, _notRemoveGeneratedTags, _maxFolderDictionaries ) {
    
    var parserOptions = _parserOptions;
    var callback = _callback;
    var failCallback = _failCallback;
    var declaredRemotePageUrls = _declaredRemotePageUrls;
    var i18n = _i18n;
    var notRemoveGeneratedTags = _notRemoveGeneratedTags;
    var maxFolderDictionaries = _maxFolderDictionaries;
    
    var run = function(){

        try {
            if ( ! notRemoveGeneratedTags ){
                nodeRemover.removeGeneratedNodes( parserOptions.root );
                /*
                attributeIndex.removeMultipleNodes(
                    nodeRemover.removeGeneratedNodes( parserOptions.root )
                );
                */
            }

            var scope = new Scope( 
                parserOptions.dictionary, 
                parserOptions.dictionaryExtension, 
                true 
            );

            scope.loadFolderDictionariesAsync( 
                maxFolderDictionaries, 
                window.location,
                function(){
                    context.setFolderDictionaries( scope.folderDictionaries );

                    i18nHelper.loadAsyncAuto( 
                        parserOptions.dictionary,
                        i18n,
                        function(){
                            resolver.loadRemotePages( 
                                scope,
                                declaredRemotePageUrls,
                                callback,
                                failCallback
                            );
                        },
                        failCallback
                    );
                } 
            );

        } catch( e ){
            log.fatal( 'Exiting init method of ZPT with errors: ' + e );
            throw e;
        }
    };

    
    var self = {
        run: run
    };
    
    return self;
};

module.exports = ParserPreloader;

},{"../attributes/attributeIndex.js":83,"../context.js":87,"../i18n/i18nHelper.js":133,"../logHelper.js":134,"../resolver.js":157,"../scopes/scope.js":159,"./nodeRemover.js":151}],155:[function(_dereq_,module,exports){
(function (process){(function (){
/* 
    Class ParserRenderer
*/
"use strict";

var context = _dereq_( '../context.js' );
var log = _dereq_( '../logHelper.js' );
var attributeCache = _dereq_( '../cache/attributeCache.js' );
var attributeIndex = _dereq_( '../attributes/attributeIndex.js' );
var nodeRemover = _dereq_( './nodeRemover.js' );
var scopeBuilder = _dereq_( '../scopes/scopeBuilder.js' );
var ParserNodeRenderer = _dereq_( './parserNodeRenderer.js' );

var ParserRenderer = function( _parserOptions, _target, _dictionaryExtension, _notRemoveGeneratedTags, _resetIndex, _goToURLHash ) {
    
    var parserOptions = _parserOptions;
    var target = _target;
    var dictionaryExtension = _dictionaryExtension;
    var notRemoveGeneratedTags = _notRemoveGeneratedTags;
    var resetIndex = _resetIndex;
    var goToURLHash = _goToURLHash;
    
    var run = function(){
        process();
    };
    
    var process = function(){

        try {
            if ( ! target ){
                throw 'Unable to process null root or target!';
            }

            if ( ! notRemoveGeneratedTags ){
                nodeRemover.removeGeneratedNodes( target );
                /*
                attributeIndex.removeMultipleNodes(
                    nodeRemover.removeGeneratedNodes( target )
                );
                */
            }

            if ( resetIndex ){
                attributeIndex.reset();
                attributeCache.reset();
            }

            processAllTargetElements();
            
            if ( goToURLHash ){
                processGoToURLHash();
            }

        } catch( e ){
            log.fatal( 'Exiting run method of ZPT with errors: ' + e );
            context.errorFunction( e );
            //throw e;
        }
    };

    var processAllTargetElements = function() {

        // Is multiroot?
        if ( Array.isArray( target ) ){ 
            // There are several roots
            for ( var c = 0; c < target.length; c++ ) {
                process1Target( target[ c ] );
            }
        } else {
            // There is only one root
            process1Target( target );
        }
    };

    var process1Target = function( currentTarget ) {

        var parserNodeRenderer = new ParserNodeRenderer( 
            currentTarget, 
            scopeBuilder.build( 
                parserOptions, 
                currentTarget, 
                dictionaryExtension,
                parserOptions.command === 'partialRender'
            ),
            parserOptions.indexExpressions
        );

        parserNodeRenderer.run();
    };
    
    var processGoToURLHash = function(){
        
        var id = decodeURI( window.location.hash ).substr( 1 );
        if ( ! id ){
            return;
        }
        
        var element = window.document.getElementById( id );
        if ( ! element ){
            log.warn( 'Unable to go to URL hash. Element with id "' + id + '" not found!' );
            return;
        }

        // Go to hash
        window.location.href = '#' + id;
    };
    
    var self = {
        run: run
    };
    
    return self;
};

module.exports = ParserRenderer;

}).call(this)}).call(this,_dereq_('_process'))
},{"../attributes/attributeIndex.js":83,"../cache/attributeCache.js":84,"../context.js":87,"../logHelper.js":134,"../scopes/scopeBuilder.js":160,"./nodeRemover.js":151,"./parserNodeRenderer.js":153,"_process":65}],156:[function(_dereq_,module,exports){
/* 
    Class ParserUpdater
*/
"use strict";

var context = _dereq_( '../context.js' );
var log = _dereq_( '../logHelper.js' );
var attributeIndex = _dereq_( '../attributes/attributeIndex.js' );
var scopeBuilder = _dereq_( '../scopes/scopeBuilder.js' );
var ParserNodeRenderer = _dereq_( './parserNodeRenderer.js' );
var nodeRemover = _dereq_( './nodeRemover.js' );
var utils = _dereq_( '../utils.js' );
var dictionaryActionBuilder = _dereq_( './dictionaryActions/dictionaryActionBuilder.js' );
var AbstractArrayAction = _dereq_( './dictionaryActions/abstractArrayAction.js' );

var ParserUpdater = function( _dictionaryChanges, _dictionaryActions, _parserOptions ) {
    
    var dictionaryChanges = _dictionaryChanges;
    var dictionaryActions = _dictionaryActions;
    var parserOptions = _parserOptions;
    
    var scopeMap = {};
    var nodeAttributes, 
        statistics;
    var dictionaryActionsInstances;
    
    var initializeDictionaryActionsInstances = function(){
        
        dictionaryActionsInstances = [];
        
        if ( ! dictionaryActions ){
            return;
        }
        
        for ( var i = 0; i < dictionaryActions.length; ++i ){
            var action = dictionaryActions[ i ];
            var newActionInstance = dictionaryActionBuilder.build( action, parserOptions.dictionary );
            if ( Array.isArray( newActionInstance ) ){
                dictionaryActionsInstances = dictionaryActionsInstances.concat( newActionInstance );
            } else {
                dictionaryActionsInstances.push( newActionInstance );
            }
        }
    };
    initializeDictionaryActionsInstances();
    
    var getStatistics = function(){
        return statistics;
    };

    var updateDictionaryForDictionaryChanges = function(){
        
        if ( dictionaryChanges ){
            utils.extend( parserOptions.dictionary, dictionaryChanges );
        }
    };
    
    var addUpdatedToStatistics = function(){
        ++statistics.totalUpdates;
    };
    
    var addRemovedToStatistics = function(){
        ++statistics.removedNodeUpdates;
    };
    
    var run = function(){
        
        try {
            // Check the index was built
            if ( ! parserOptions.indexExpressions ){
                throw 'Unable to update, no index built! Set indexExpressions to true!';
            }
            
            // Init some vars
            nodeAttributes = {};
            statistics = {
                totalUpdates: 0,
                removedNodeUpdates: 0
            };

            // Do all required HTML updates
            updateHTML();
            
        } catch( e ){
            log.fatal( 'Exiting run method of update command of ZPT with errors: ' + e );
            context.errorFunction( e );
        }
    };

    var updateHTML = function(){

        if ( updateHTMLFromActions( 0 ) ){
            updateHTMLFromVarChange();
        }
    };
    
    var updateHTMLFromActions = function( initial ){

        for ( var i = initial; i < dictionaryActionsInstances.length; ++i ){
            var actionInstance = dictionaryActionsInstances[ i ];
            
            // Update dictionary using action
            actionInstance.updateDictionary( parserOptions.dictionary );
            
            // Get the list of changes related to varName
            var list = attributeIndex.getVarsList( actionInstance.id );
            if ( ! list ){
                continue;
            }
            
            // Iterate list and update HTML if required
            if ( ! updateHTMLFromVarsList( actionInstance, i, 0, list ) ){
                return false;
            }
            /*
            for ( var j = 0; j < list.length; j++ ) {
                var indexItem = list[ j ];
                if ( ! actionInstance.attributeInstanceIsRelated( indexItem.attributeInstance ) ){
                    if ( ! utils.isFunction( indexItem.attributeInstance.updatableFromAction ) 
                            || indexItem.attributeInstance.updatableFromAction( self, findNodeById( indexItem.nodeId ) ) ){
                        buildDataFromVarChangeExcluding( actionInstance.id );
                    }
                    continue;
                }
                
                if ( ! actionInstance.updateHTML( 
                    indexItem, 
                    self, 
                    actionInstance, 
                    { 
                        actionInstance: actionInstance,
                        i: i, 
                        list: list,
                        initialJ: j 
                    }
                ) ){
                    return false;
                }
            }
            */
        }
        
        return true;
    };
    
    var updateHTMLFromVarsList = function( actionInstance, i, initialJ, list ){
        
        // Iterate list and update HTML if required
        for ( var j = initialJ; j < list.length; j++ ) {
            var indexItem = list[ j ];
            if ( ! actionInstance.attributeInstanceIsRelated( indexItem.attributeInstance ) ){
                if ( ! utils.isFunction( indexItem.attributeInstance.updatableFromAction ) 
                        || indexItem.attributeInstance.updatableFromAction( self, findNodeById( indexItem.nodeId ) ) ){
                    buildDataFromVarChangeExcluding( actionInstance.id );
                }
                continue;
            }

            if ( ! actionInstance.updateHTML( 
                indexItem, 
                self, 
                actionInstance, 
                { 
                    actionInstance: actionInstance,
                    i: i, 
                    initialJ: j,
                    list: list
                }
            ) ){
                return false;
            }
        }
        
        return true;
    };
    
    var continueUpdateHTML = function( continueData ){

        updateHTMLFromVarsList(
            continueData.actionInstance, 
            continueData.i, 
            continueData.initialJ + 1, 
            continueData.list
        );
        
        if ( updateHTMLFromActions( continueData.i + 1 ) ){
            updateHTMLFromVarChange();
        }
    };
    
    var runAnimation = function( actionInstance, node, callback ){
        
        // Build combinedCallback combining callback and actionInstance.animationCallback
        var combinedCallback = function(){
                if ( callback ){
                    callback();
                } else {
                    context.getAnimationManager().reset( node );
                }
                if ( actionInstance.animationCallback ){
                    actionInstance.animationCallback();
                }
            };
        
        // Get animation manager to run animation
        context.getAnimationManager().animate( actionInstance, node, combinedCallback );
    };
    /*
    var runAnimation = function( actionInstance, node, callback ){
        
        // Build combinedCallback combining callback and actionInstance.animationCallback
        var combinedCallback = ! callback && ! actionInstance.animationCallback? 
            undefined:
            function(){
                if ( callback ){
                    callback();
                }
                if ( actionInstance.animationCallback ){
                    actionInstance.animationCallback();
                }
            };
        
        // Get animation manager to run animation
        context.getAnimationManager().animate( actionInstance, node, combinedCallback );
    };
    */
    
    var updateHTMLFromVarChange = function(){
        
        // Update dictionary
        updateDictionaryForDictionaryChanges();
        
        // Build data
        for ( var varName in dictionaryChanges ){
            buildDataFromVarChange( varName );
        }
        
        // Update attributes
        for ( var i in nodeAttributes ) {
            var currentNodeAttributeList = nodeAttributes[ i ];
            for ( var j in currentNodeAttributeList ){
                updateAttribute( currentNodeAttributeList[ j ] );   
            }
        }
    };
    
    var buildDataFromVarChange = function( varName ){
        
        // Get the list of changes related to varName
        var list = attributeIndex.getVarsList( varName );
        buildDataFromList( varName, list );
    };
    
    var buildDataFromVarChangeExcluding = function( varName ){
        
        // Get the list of changes related to varName
        var list = attributeIndex.getVarsList( varName );
        
        var filtered = list.filter(
            function( indexItem, index, arr ){
                return ! AbstractArrayAction.staticAttributeInstanceIsRelated(
                    indexItem.attributeInstance
                );
            }
        );
        
        buildDataFromList( varName, filtered );
    };
    
    var buildDataFromList = function( varName, list ){
        
        if ( ! list ){
            return;
        }
        
        // Build data about all changes
        var length = list.length;
        for ( var i = 0; i < length; i++ ) {
            addNewNodeAttribute( varName, list[ i ] );
            /*
            if ( ! addNewNodeAttribute( varName, list[ i ] ) ){
                attributeIndex.removeVar( varName, list[ i ].nodeId );
            }
            */
        }
    };
    
    var findNodeById = function ( nodeId ) {
        
        return window.document.querySelector( 
            '[' + context.getTags().id + '="' + nodeId + '"]' 
        );
    };

    var addNewNodeAttribute = function( varName, indexItem ){

        var attributeInstance = indexItem.attributeInstance;
        var node = findNodeById( indexItem.nodeId );
        if ( ! node ){
            // Removed node!
            ++statistics.removedNodeUpdates;
            return false;
        }

        // Add data to nodeData
        var thisNodeData = nodeAttributes[ indexItem.nodeId ];
        if ( ! thisNodeData ){
            thisNodeData = {};
            nodeAttributes[ indexItem.nodeId ] = thisNodeData;
        }
        var elementId = indexItem.groupId? 
            attributeInstance.type + '/' + indexItem.groupId: 
            attributeInstance.type;
        thisNodeData[ elementId ] = indexItem;

        return true;
    };
    
    var updateAttribute = function( indexItem ){
        
        var attributeInstance = indexItem.attributeInstance;
        var node = findNodeById( indexItem.nodeId );
        if ( ! node ){
            // Removed node!
            ++statistics.removedNodeUpdates;
            return false;
        }
        
        ++statistics.totalUpdates;
        
        var scope = getNodeScope( node, indexItem.nodeId );
        
        attributeInstance.update( self, node, scope, indexItem );
        
        return true;
    };

    var getNodeScope = function( node, nodeId ){
        
        if ( ! nodeId ){
            nodeId = node.getAttribute( context.getTags().id );
        }
        
        var thisScope = scopeMap[ nodeId ];
        
        if ( ! thisScope ){
            thisScope = scopeBuilder.build( 
                parserOptions, 
                node, 
                undefined,
                true
            );
            scopeMap[ nodeId ] = thisScope;
        }

        return thisScope;
    };
    
    var updateNode = function( node, mustRemoveGeneratedNodes ){
        
        // Remove related to node nodes
        nodeRemover.removeMultipleNodes( node, mustRemoveGeneratedNodes );
        /*
        attributeIndex.removeMultipleNodes(
            nodeRemover.removeMultipleNodes( node, mustRemoveGeneratedNodes )
        );
        */
        
        // Instance and invoke parserNodeRenderer to update node
        var parserNodeRenderer = new ParserNodeRenderer( 
            node, 
            scopeBuilder.build( 
                parserOptions, 
                node, 
                undefined,
                true
            ),
            true
        );
        parserNodeRenderer.run();
    };
    /*
    var deleteNode = function( node ){
        node.parentNode.removeChild( node );
    };
    */
    var self = {
        run: run,
        updateNode: updateNode,
        //deleteNode: deleteNode,
        findNodeById: findNodeById,
        getNodeScope: getNodeScope,
        getStatistics: getStatistics,
        addUpdatedToStatistics: addUpdatedToStatistics,
        addRemovedToStatistics: addRemovedToStatistics,
        runAnimation: runAnimation,
        continueUpdateHTML: continueUpdateHTML
    };
    
    return self;
};

module.exports = ParserUpdater;

},{"../attributes/attributeIndex.js":83,"../context.js":87,"../logHelper.js":134,"../scopes/scopeBuilder.js":160,"../utils.js":161,"./dictionaryActions/abstractArrayAction.js":139,"./dictionaryActions/dictionaryActionBuilder.js":145,"./nodeRemover.js":151,"./parserNodeRenderer.js":153}],157:[function(_dereq_,module,exports){
/* 
    resolver singleton class
*/
var utils = _dereq_( './utils.js' );
var context = _dereq_( './context.js' );
var expressionBuilder = _dereq_( './expressions/expressionBuilder.js' );

module.exports = (function( ) {
    "use strict";
    
    var macros = {};
    var remotePages = {};
    
    var getNode = function( macroKey, scope ) {
        
        var node = macros[ macroKey ];
        
        if ( ! node ){
            node = loadNode( macroKey, scope );
        }
        
        return node? node.cloneNode( true ): undefined;
    };
    /*
    var isRemote = function( macroKey ){
        return -1 != macroKey.indexOf( context.getConf().macroDelimiter );
    };*/
    
    var getMacroDataUsingExpression = function ( macroKeyExpression, scope ){
        
        var macroKey = macroKeyExpression.evaluate( scope );
        
        if ( ! macroKey ){
            return {
                macroId: null,
                url: null
            };
        }
        
        return getMacroData( macroKey, scope );
    };
    
    var getMacroDataUsingExpressionString = function ( macroKeyExpressionString, scope ){
        
        var macroKeyExpression = expressionBuilder.build( macroKeyExpressionString );
        return getMacroDataUsingExpression( macroKeyExpression, scope );
    };
    
    var getMacroData = function ( macroKey, scope ){

        var index = macroKey.indexOf( context.getConf().macroDelimiter );
        
        return index === -1?
            {
                macroId: macroKey,
                url: null
            }:
            {
                macroId: macroKey.substring( 0, index ),
                url: buildURL ( macroKey.substring( 1 + index ) )
            };
    };
    
    var builDefineMacroSelector = function( macroId ){
        return "[" + filterSelector( context.getTags().metalDefineMacro ) + "='" + macroId + "']";
    };
    
    var loadNode = function( macroKey, scope ){

        var macroData = getMacroData( macroKey, scope );

        if ( macroData.url ){
            // Node is in another page
            return loadRemoteNode( macroKey, macroData );
        }
        
        // No url set
        var urlInScope = scope.get( context.getConf().externalMacroUrlVarName );
        if ( urlInScope ){
            // Try to find node in another page but using a previously defined url
            macroData.url = urlInScope;
            var remoteNode = loadRemoteNode( macroKey, macroData );
            if ( remoteNode ){
                // Node is found in another page
                return remoteNode;
            }
        }
        
        // Node is in this page
        var macroId = macroData.macroId;
        var selector = builDefineMacroSelector( macroId );
        var node = window.document.querySelector( selector );

        if ( ! node ){
            throw "Node using selector '" + selector + "' is null!";
        }

        return configureNode( 
            node.cloneNode( true ), 
            macroId,
            macroKey );
        
    };
    var loadRemoteNode = function( macroKey, macroData ){
        
        var element = remotePages[ macroData.url ];
        
        if ( ! element ){
            throw 'Macros in URL ' + macroData.url + ' not preloaded!';
        }
        
        var selector = builDefineMacroSelector( macroData.macroId );
        var node = element.querySelector( selector );
        
        if ( ! node ){
            return undefined;
        }
        
        return configureNode( 
                    node.cloneNode( true ), 
                    macroData.macroId,
                    macroKey );
    };
    
    var buildRemotePageUrlList = function( scope, declaredRemotePageUrls ){
        
        var remotePageUrls = declaredRemotePageUrls.slice();
        
        var list = document.querySelectorAll( 
            "[" + filterSelector( context.getTags().metalUseMacro ) + "]"
        );
        var currentMacroUse;
        var pos = 0;
        while ( currentMacroUse = list[ pos++ ] ) {
            var macroKeyExpressionString = currentMacroUse.getAttribute( context.getTags().metalUseMacro );
            
            try {
                var macroData = getMacroDataUsingExpressionString( macroKeyExpressionString, scope );

                var url = macroData.url;
                if ( url && remotePageUrls.indexOf( url ) === -1 ){
                    remotePageUrls.push( url );
                }
            } catch ( exception ){
                // Macrodata could not be resolved, do nothing
            }
        }
                                                              
        return remotePageUrls;
    };
    
    // Add preffix if the URL is not absolute
    var buildURL = function( URL ){
        return URL.startsWith( '/' )? URL: context.getConf().externalMacroPrefixURL + URL;
    };
    
    var loadRemotePages = function( scope, declaredRemotePageUrls, callback, failCallback ){

        var remotePageUrls = buildRemotePageUrlList( scope, declaredRemotePageUrls );
        var pending = remotePageUrls.length;
        remotePages = {};
        
        if ( ! pending ){
            if ( callback && utils.isFunction( callback ) ){
                callback();   
            }
            return;
        }
        
        for ( var c = 0; c < remotePageUrls.length; c++ ) {
            var currentPageUrl = buildURL( remotePageUrls[ c ] );
            
            /* jshint loopfunc: true */
            utils.ajax(
                {
                    url: currentPageUrl,
                    //dataType: 'html',
                    done: function( html ) {
                        var element = document.createElement( 'div' );
                        element.innerHTML = html;
                        remotePages[ this.url ] = element;
                        if ( --pending == 0 && callback && utils.isFunction( callback ) ){
                            callback();
                        }
                    },
                    fail: function( jqXHR, textStatus, error ) {
                        context.asyncError( currentPageUrl, error, failCallback );
                    }
                }
            );
            /*
            $.ajax({
                url: currentPageUrl,
                dataType: 'html'
            }).done( function( html ) {
                var element = $( '<div></div>' );
                element.html( html );
                remotePages[ this.url ] = element;
                if ( --pending == 0 && callback && utils.isFunction( callback ) ){
                    callback();
                }
            }).fail( function( jqXHR, textStatus, error ) {
                context.asyncError( currentPageUrl, error, failCallback );
            });
            */
        }
    };
                  
    var configureNode = function( node, macroId, macroKey ){
        node.removeAttribute( context.getTags().metalDefineMacro );
        node.setAttribute( context.getTags().metalMacro, macroId );
        
        macros[ macroKey ] = node;
        
        return node;
    };
    
    var getMacroKey = function( macroKeyExpression, scope ){
        
        var macroData = getMacroDataUsingExpression( macroKeyExpression, scope );
        
        return macroData.url? macroData.macroId + context.getConf().macroDelimiter + macroData.url: macroData.macroId;
    };
    
    // Must filter to replace : by \\:
    var filterSelector = function( selector ){
        return selector.replace( /:/gi, '\\:' );
    };
    
    return {
        getNode: getNode,
        //isRemote: isRemote,
        loadRemotePages: loadRemotePages,
        getMacroData: getMacroData,
        getMacroKey: getMacroKey,
        filterSelector: filterSelector
    };
})();

},{"./context.js":87,"./expressions/expressionBuilder.js":106,"./utils.js":161}],158:[function(_dereq_,module,exports){
/* 
    ReactiveDictionary class 
*/
"use strict";

var zpt = _dereq_( '../main.js' );

var ReactiveDictionary = function( _nonReactiveDictionary, _initialAutoCommit ) {
    
    // Init some vars
    var self = this;
    this._privateScope = {
        nonReactiveDictionary: _nonReactiveDictionary,
        autoCommit: true,
        dictionaryChanges: {},
        dictionaryActions: [],
        commit: function(){
            zpt.run({
                command: 'update',
                dictionaryChanges: self._privateScope.dictionaryChanges,
                dictionaryActions: self._privateScope.dictionaryActions
            });
            self._privateScope.dictionaryChanges = {};
            self._privateScope.dictionaryActions = [];
        }
    };

    // Define some methods
    this._getNonReactiveDictionary = function(){
        return this._privateScope.nonReactiveDictionary;
    };
    
    this._isAutoCommit = function(){
        return this._privateScope.autoCommit;
    };
    
    this._setAutoCommit = function( _autoCommit ){
        this._privateScope.autoCommit = _autoCommit;
    };
    
    this._commit = function(){
        this._privateScope.commit();
    };

    this._addActions = function( dictionaryActions ){
        
        // Record this actions to commit it later
        self._privateScope.dictionaryActions = self._privateScope.dictionaryActions.concat( dictionaryActions );
        
        // Commit the change only if autoCommit is on
        if ( self._isAutoCommit() ){
            self._privateScope.commit();
        }
    };
    
    this._addVariable = function( key, value ){
        
        // Set the value in nonReactiveDictionary
        self._privateScope.nonReactiveDictionary[ key ] = value;
        
        // Define getter and setter
        this._defineProperty( 
            this._privateScope.nonReactiveDictionary, 
            key 
        );
    };

    this._defineProperty = function( dictionary, key ){

        // Define property to set getter and setter
        Object.defineProperty(
            self, 
            key, 
            {
                enumerable: true,
                configurable: true,
                get: function () { 
                    return dictionary[ key ];
                },
                set: function ( value ) {
                    // Record this change to commit it later
                    self._privateScope.dictionaryChanges[ key ] = value;

                    // Commit the change only if autoCommit is on
                    if ( self._isAutoCommit() ){
                        self._privateScope.commit();
                    }
                }
            }
        );
    };
    
    // Initialize
    this._initialize = function( dictionary ){
        
        // Initialize autoCommit
        if ( _initialAutoCommit !== undefined ){
            this._setAutoCommit( _initialAutoCommit );
        }
        
        // Iterate properties in dictionary to define setters and getters
        var keys = Object.keys( dictionary );
        for ( var i = 0; i < keys.length; i++ ){
            var key = keys[ i ];
            var property = Object.getOwnPropertyDescriptor( dictionary, key );
            if ( property && property.configurable === false ) {
                continue;
            }
            
            // Define getter and setter
            (function( key ) {
                self._defineProperty( dictionary, key );
            })( key );
        }
    };
    this._initialize( this._privateScope.nonReactiveDictionary );
};

module.exports = ReactiveDictionary;

},{"../main.js":135}],159:[function(_dereq_,module,exports){
/* 
    Class Scope 
*/
"use strict";

var context = _dereq_( '../context.js' );
var utils = _dereq_( '../utils.js' );
var loadjs = _dereq_( 'loadjs' );

var Scope = function( _dictionary, _dictionaryExtension, addCommonVars, _folderDictionaries ) {
    
    this.dictionary = _dictionary || {};
    this.dictionaryExtension = _dictionaryExtension || {};
    this.vars = {};
    this.changesStack = [];
    this.nocallVars = {};
    this.folderDictionaries = _folderDictionaries || [];
    this.globalVarsExpressions = {};
    
    if ( addCommonVars ){
        this.setCommonVars();
    }
    this.setMandatoryVars();
};

Scope.prototype.setMandatoryVars = function(){

    // Register nothing var
    this.setVar( 
        context.getConf().nothingVarName, 
        context.getConf().nothingVarValue 
    );
    
    // Register default var
    this.setVar( 
        context.getConf().defaultVarName, 
        context.getConf().defaultVarValue 
    );
};

Scope.prototype.setCommonVars = function(){
    
    // Register window object if it exists
    if ( window ){
        this.setVar( 
            context.getConf().windowVarName, 
            window 
        );
    }

    // Register context
    this.setVar( 
        context.getConf().contextVarName, 
        context 
    );
};

Scope.prototype.startElement = function(){
    
    var vars = {
        varsToUnset: [],
        varsToSet: {},
        expressions: {},
        impliedDeclaredVars: []
    };

    this.changesStack.push( vars );

    return vars;
};

Scope.prototype.currentVars = function(){
    return this.changesStack[ this.changesStack.length - 1 ];
};

Scope.prototype.setVar = function( name, value ) {
    this.vars[ name ] = value;
};

Scope.prototype.getWithoutEvaluating = function( name ) {
    
    var value;
    
    value = this.vars[ name ];
    if ( value !== undefined ){
        return value;
    }
    
    value = this.dictionaryExtension[ name ];
    if ( value !== undefined ){
        return value;
    }
    
    value = this.dictionary[ name ];
    if ( value !== undefined ){
        return value;
    }
    
    for ( var i = 0; i < this.folderDictionaries.length; ++i ){
        value = this.folderDictionaries[ i ][ name ];
        if ( value !== undefined ){
            return value;
        }
    }
    
    return undefined;
};

Scope.prototype.get = function( name ) {

    var value = this.getWithoutEvaluating( name );
    
    if ( ! this.nocallVars[ name ] ){
        return value;
    }
    
    return value && utils.isFunction( value.evaluate )?
        value.evaluate( this ): 
        'Error evaluating property "' + name + '": ' + value;
};

Scope.prototype.unset = function( name ) {
    delete this.vars[ name ];
};

Scope.prototype.endElement = function ( ) {

    var vars = this.changesStack.pop(); 

    var varsToUnset = vars.varsToUnset;
    var varsToSet = vars.varsToSet; 

    for ( var i = 0; i < varsToUnset.length; ++i ){
        this.unset( varsToUnset[ i ] );
    }

    for ( var name in varsToSet ){
        var value = varsToSet[ name ];
        this.setVar( name, value );
    }
};

Scope.prototype.set = function ( name, value, isGlobal, nocall, _expression ) {
    
    var expression = _expression === undefined? null: _expression;
    
    if ( ! isGlobal ){

        // Local vars
        var vars = this.currentVars();
        var currentValue = this.getWithoutEvaluating( name );

        if ( currentValue != null ){
            vars.varsToSet[ name ] = currentValue;
            
        } else {
            vars.varsToUnset.push( name );
        }
        
        vars.expressions[ name ] = expression;
        
        if ( this.isStrictMode() ){
            vars.impliedDeclaredVars.push( name );
        }
        
    } else {
        
        // Global vars
        this.globalVarsExpressions[ name ] = expression; 
    }
    
    // Common to global and local vars
    this.setVar( name, value );
    
    // Add to nocallVars if needed
    if ( nocall ){
        this.nocallVars[ name ] = true;
    }
};

Scope.prototype.loadFolderDictionariesAsync = function ( maxFolderDictionaries, location, callback ) {
    
    if ( ! maxFolderDictionaries ) {
        callback();
        return;
    }
    
    var urlList = this.buildUrlListOfFolderDictionaries( maxFolderDictionaries, location );
    this.loadFolderDictionary(
        maxFolderDictionaries,
        callback,
        urlList, 
        0
    );
};

Scope.prototype.loadFolderDictionary = function ( maxFolderDictionaries, callback, urlList, i ) {
    
    var instance = this;
    
    var loadjsCallback = function( url, success ){
        
        // Treat js file only if load is sucessfull
        if ( success && window.folderDictionary ){
            instance.folderDictionaries.push( window.folderDictionary );
        }
            
        // Run callback and return if the urlList is over
        if ( i === urlList.length){
            callback();
            return;
        }

        // Continue, the urlList is not over
        instance.loadFolderDictionary(
            maxFolderDictionaries, 
            callback,
            urlList, 
            i
        );
    };
    
    var url = urlList[ i++ ];
    loadjs(
        url, 
        {
            success: function() { 
                loadjsCallback( url, true );
            },
            error: function() { 
                loadjsCallback( url, false );
            }
        }
    );
};

Scope.prototype.buildUrlListOfFolderDictionaries = function ( maxFolderDictionaries, location ) {
    
    var result = [];
    
    var c = 0;
    var path = location.pathname;
    var lastIndex = path.lastIndexOf( '/' );
    while ( lastIndex !== -1 && ++c <= maxFolderDictionaries ){
        var parent = path.substr( 0, lastIndex );
        result.push( 
            location.origin + parent + '/' + 'folderDictionary.js' 
        );
        lastIndex = parent.lastIndexOf( '/' );
    }
    
    return result;
};

Scope.prototype.isStrictMode = function(){
    return context.isStrictMode() || this.get( context.getConf().strictModeVarName );
};

Scope.prototype.isValidVariable = function( name ){
    
    // If strict mode is off all variable are valid
    if ( ! this.isStrictMode() ){
        return true;
    }
    
    // If the variable is declared return true
    var declared = this.get( context.getConf().declaredVarsVarName );
    var isDeclared = declared && declared.indexOf? 
        declared.indexOf( name ) !== -1: 
        false;
    if ( isDeclared ){
        return true;
    }
    
    // Check if the variable is implicitly declared
    for ( var i = this.changesStack.length - 1; i >= 0; --i ){
        var vars = this.changesStack[ i ];
        var isImplied = vars.impliedDeclaredVars.indexOf( name ) !== -1;
        if ( isImplied ){
            return true;
        }
    }
    
    return false;
};

Scope.prototype.getVarExpression = function ( name ) {
    
    var expression = this.getExpressionFromLocal( name );
    return expression !== undefined? expression: this.globalVarsExpressions[ name ];
};

Scope.prototype.getExpressionFromLocal = function ( name ) {

    for ( var i = this.changesStack.length - 1; i >= 0; --i ){
        var vars = this.changesStack[ i ];
        var expression = vars.expressions[ name ];
        if ( expression !== undefined ){
            return expression;
        }
    }
    
    return undefined;
};

Scope.prototype.isLocalVar = function ( name ) {
    return this.vars[ name ] !== undefined;
};

module.exports = Scope;

},{"../context.js":87,"../utils.js":161,"loadjs":62}],160:[function(_dereq_,module,exports){
/* 
    scopeBuilder singleton class
*/
"use strict";

var context = _dereq_( '../context.js' );
var Scope = _dereq_( './scope.js' );
var utils = _dereq_( '../utils.js' );
var ParserNodeRenderer = _dereq_( '../parsers/parserNodeRenderer.js' );

module.exports = (function() {
    
    var keyLength = 6;
    
    var build = function( parserOptions, target, dictionaryExtension, mustUpdate ) {

        var scope = new Scope( 
            parserOptions.dictionary, 
            dictionaryExtension, 
            true,
            context.getFolderDictionaries()
        );
        
        if ( mustUpdate ){
            update( parserOptions, target, scope );
        }
        
        return scope;
    };
    
    var update = function( parserOptions, target, scope ) {
        
        // Get root key
        var rootMap = markAllRoots( parserOptions );
        var rootKeyTag = getRootKeyTag();
        var root = getRoot( parserOptions, target, rootMap );
        var rootKey =  root.getAttribute( rootKeyTag );
        
        var talDefineTag = context.getTags().talDefine;
        var talAutoDefineTag = context.getTags().talAutoDefine;
        
        var node = target.parentNode;
        var c = 0;
        var itemsList = [];
        
        do {
            // Add talDefine
            var talDefine = node.getAttribute( talDefineTag );
            if ( talDefine ){
                itemsList.push( talDefine );
            }
            
            // Add talAutoDefine
            var talAutoDefine = node.getAttribute( talAutoDefineTag );
            if ( talAutoDefine ){
                itemsList.push( talAutoDefine );
            }
            
            var nodeKey = node.getAttribute( rootKeyTag );
            if ( nodeKey && nodeKey === rootKey ){
                return processListOfDefines( 
                    scope, 
                    itemsList, 
                    node,
                    parserOptions.indexExpressions
                );
            }
            
            node = node.parentNode;
            
        } while ( node.nodeType !== 9 && ++c < 100 );
        
        throw 'Error trying to update scope: root not found!';
    };
    
    var processListOfDefines = function( scope, itemsList, node, indexExpressions ){
        
        for ( var c = itemsList.length - 1; c >= 0; c-- ) {
            var talDefine = itemsList[ c ];
            ParserNodeRenderer.processDefine(
                node, 
                talDefine, 
                true,
                scope,
                indexExpressions
            );
        }
    };
    
    var getRoot = function( parserOptions, target, rootMap ){
        
        if ( ! Array.isArray( parserOptions.root ) ){ 
            return parserOptions.root;
        }
        
        var rootKeyTag = getRootKeyTag();
        var node = target;
        var c = 0;
        do {
            var rootKey =  node.getAttribute( rootKeyTag );
            if ( rootKey ){
                return rootMap[ rootKey ];
            }

            node = node.parentNode;

        } while ( node.nodeType !== 9 && ++c < 100 );
        
        throw 'Error trying to get root: not found!';
    };
    
    var markAllRoots = function( parserOptions ){

        var rootMap = {};
        var root = parserOptions.root;

        // Is multiroot?
        if ( Array.isArray( root ) ){ 
            // There are several roots
            for ( var c = 0; c < root.length; c++ ) {
                markAsRoot( root[ c ], rootMap );
            }
        } else {
            // There is only one root
            markAsRoot( root, rootMap );
        }

        return rootMap;
    };
    
    var markAsRoot = function( node, rootMap ){
        
        // Build the key
        var key = buildKey();

        // Put a copy of scope into the cache
        rootMap[ key ] = node;

        // Save the key as an attribute of the node
        node.setAttribute( getRootKeyTag(), key );
    };
    
    var buildKey = function(){
        return utils.generateId( keyLength );
    };
    
    var getRootKeyTag = function(){
        return context.getTags().rootKey;
    };
    
    return {
        build: build
    };
})();

},{"../context.js":87,"../parsers/parserNodeRenderer.js":153,"../utils.js":161,"./scope.js":159}],161:[function(_dereq_,module,exports){
/*
    utils singleton class
*/
module.exports = (function() {
    "use strict";
    
    var generateId = function ( len, _charSet ) {
        
        var charSet = _charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var result = '';
        for ( var i = 0; i < len; i++ ) {
            var pos = Math.floor( Math.random() * charSet.length );
            result += charSet.substring( pos, pos + 1 );
        }
        return result;
    };
    
    //var isArray = Array.isArray;
    
    var isFunction = function isFunction( obj ) {

        // Support: Chrome <=57, Firefox <=52
        // In some browsers, typeof returns "function" for HTML <object> elements
        // (i.e., `typeof document.createElement( "object" ) === "function"`).
        // We don't want to classify *any* DOM node as a function.
        return typeof obj === "function" && typeof obj.nodeType !== "number";
    };
    
    var isPlainObject = function( obj ) {
        var proto, Ctor;

        // Detect obvious negatives
        // Use toString instead of jQuery.type to catch host objects
        if ( !obj || Object.prototype.toString.call( obj ) !== "[object Object]" ) {
            return false;
        }

        proto = getProto( obj );

        // Objects with no prototype (e.g., `Object.create( null )`) are plain
        if ( !proto ) {
            return true;
        }

        // Objects with prototype are plain iff they were constructed by a global Object function
        Ctor = hasOwn.call( proto, "constructor" ) && proto.constructor;
        return typeof Ctor === "function" && fnToString.call( Ctor ) === ObjectFunctionString;
    };
    var getProto = Object.getPrototypeOf;
    var class2type = {};
    var hasOwn = class2type.hasOwnProperty;
    var fnToString = hasOwn.toString;
    var ObjectFunctionString = fnToString.call( Object );
    
    var deepExtend = function( out ) {
        out = out || {};

        for ( var i = 1; i < arguments.length; i++ ) {
            var obj = arguments[ i ];

            if ( ! obj ){
                continue;
            }
            
            for ( var key in obj ) {
                if ( obj.hasOwnProperty( key ) ) {
                    if ( typeof obj[ key ] === 'object' ){
                        out[ key ] = deepExtend( out[ key ], obj[ key ] );
                    } else {
                        out[ key ] = obj[ key ];
                    }
                }
            }
        }

        return out;
    };
    
    var extend = function(out) {
        out = out || {};

        for ( var i = 1; i < arguments.length; i++ ) {
            if ( ! arguments[ i ] ){
                continue;
            }

            for ( var key in arguments[ i ] ) {
                if ( arguments[ i ].hasOwnProperty( key ) ){
                    out[ key ] = arguments[ i ][ key ];
                }
            }
        }

        return out;
    };
    
    var ajax = function( conf ){
        
        // Check conf object
        if ( ! conf ){
            throw 'Error trying to process ajax: no arguments!';
        }
        if ( ! conf.url ){
            throw 'Error trying to process ajax: no URL defined!';
        }
        if ( ! conf.done ){
            throw 'Error trying to process ajax: no done callback defined!';
        }
        
        // Do it!
        var oReq = new window.XMLHttpRequest();
        oReq.addEventListener( 
            'load',
            function(){
                if ( this.status >= 200 && this.status < 400 ) {
                    // Success!
                    conf.done( 
                        conf.parseJSON?
                        JSON.parse( oReq.responseText ):
                        oReq.responseText
                    );
                } else {
                    // We reached our target server, but it returned an error
                    conf.fail( undefined, undefined, this.statusText );
                }
            }
        );
        if ( conf.fail ){
            oReq.addEventListener( 'error', conf.fail );
        }
        oReq.open( 'GET', conf.url );
        oReq.send();
    };
    
    var getJSON = function( conf ){
        
        conf.parseJSON = true;
        ajax( conf );
    };
    
    /*
    var getJSON = function( conf ){
        
        // Check conf object
        if ( ! conf ){
            throw 'Error trying to getJSON: no arguments!';
        }
        if ( ! conf.url ){
            throw 'Error trying to getJSON: no URL defined!';
        }
        if ( ! conf.done ){
            throw 'Error trying to getJSON: no done callback defined!';
        }
        
        // Do it!
        var oReq = new window.XMLHttpRequest();
        oReq.addEventListener( 
            'load',
            function(){
                if ( this.status >= 200 && this.status < 400 ) {
                    // Success!
                    conf.done( 
                        JSON.parse( 
                            oReq.responseText 
                        ) 
                    );
                } else {
                    // We reached our target server, but it returned an error
                    conf.fail( undefined, undefined, this.statusText );
                }
            }
        );
        if ( conf.fail ){
            oReq.addEventListener( 'error', conf.fail );
        }
        oReq.open( 'GET', conf.url );
        oReq.send();
    };
    */
    /*
    var getNodeId = function ( node ){
        return node.getAttribute( context.getTags().id );
    };
    */
    var deepEqual = function( x, y ) {
        return (x && y && typeof x === 'object' && typeof y === 'object') ?
            (Object.keys(x).length === Object.keys(y).length) && Object.keys(x).reduce(function(isEqual, key) {return isEqual && deepEqual(x[key], y[key]);}, true):
            (x === y);
    };
    
    var copyArray = function( arrayToCopy ){
        
        var result = [];
        
        for ( var i = 0; i < arrayToCopy.length; ++i ){
            result.push( arrayToCopy[ i ] );
        }
        
        return result;
    };
    
    var genericToString = function( element ){
    
        if ( element == undefined ){
            return 'undefined';
        }
        
        if ( Array.isArray( element ) ){
            var result = 'Array[ ';
            for ( var i = 0; i < element.length; ++i ){
                var separator = i === 0? '': ', ';
                result += separator + genericToString( element[ i ] );
            }
            result += ' ]';
            return result;
        }
        
        if ( isPlainObject( element ) ){
            return JSON.stringify( element );
        }
        
        // Must be numeric or string
        return element;
    };
    
    return {
        generateId: generateId,
        //isArray: isArray,
        isFunction: isFunction,
        isPlainObject: isPlainObject,
        deepExtend: deepExtend,
        extend: extend,
        getJSON: getJSON,
        ajax: ajax,
        deepEqual: deepEqual,
        copyArray: copyArray,
        genericToString: genericToString
        //getNodeId: getNodeId
    };
})();

},{}],162:[function(_dereq_,module,exports){
// generated by genversion
module.exports = '0.40.3'

},{}]},{},[56]);
