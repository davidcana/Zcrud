/* 
    Page class
*/
"use strict";

var $ = require( 'jquery' );
var context = require( '../context.js' );
var pageUtils = require( './pageUtils.js' );
var buttonUtils = require( '../buttons/buttonUtils.js' );
var utils = require( '../utils.js' );

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
