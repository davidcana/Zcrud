/* 
    Page class
*/

import { context } from '../context.js';
import { utils } from '../utils.js';
import { pageUtils } from './pageUtils.js';
import { buttonUtils } from '../buttons/buttonUtils.js';
import { zzDOM } from '../../../node_modules/zzdom/index.js';
var $ = zzDOM.zz;

export const Page = function( optionsToApply, userDataToApply ) {
    
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
            this.options
        );
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
        dictionaryExtension
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

