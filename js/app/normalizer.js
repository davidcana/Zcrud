/* 
    normalizer singleton class
*/
var context = require( './context.js' );
var fieldBuilder = require( './fields/fieldBuilder.js' );
var $ = require( 'jquery' );

module.exports = (function() {
    "use strict";

    // Normalizes some options (sets default values)
    var normalize = function( options ) {

        normalizeGeneralOptions( options );

        $.each( options.fields, function ( fieldId, field ) {
            normalizeFieldOptions( fieldId, field, options );
        });
        
        normalizePagesOptions( options );
        
        normalizeGeneralOptionsPostFields( options );
    };

    // Normalizes some general options (non related to fields)
    var normalizeGeneralOptions = function( options ) {

        if ( options.formId == undefined ){
            options.formId = 'zcrud-form-' + options.entityId;
        }

        // Normalize list options
        var listOptions = options.pages.list;
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

        // Normalize editable list
        var editableListIsOn = listOptions.components.editing.isOn;
        var toolbar = listOptions.buttons.toolbar;
        if ( toolbar.newRegisterRow == undefined ){
            toolbar.newRegisterRow = editableListIsOn;
        }
        if ( toolbar.openNewRegisterForm == undefined ){
            toolbar.openNewRegisterForm = ! editableListIsOn;
        }
        if ( toolbar.undo == undefined ){
            toolbar.undo = editableListIsOn;
        }
        if ( toolbar.redo == undefined ){
            toolbar.redo = editableListIsOn;
        }
        if ( toolbar.save == undefined ){
            toolbar.save = editableListIsOn;
        }
        var byRow = listOptions.buttons.byRow;
        if ( byRow.openEditRegisterForm == undefined ){
            byRow.openEditRegisterForm = ! editableListIsOn;
        }
        if ( byRow.openDeleteRegisterForm == undefined ){
            byRow.openDeleteRegisterForm = ! editableListIsOn;
        }
        if ( byRow.deleteRegisterRow == undefined ){
            byRow.deleteRegisterRow = editableListIsOn;
        }
    };

    // Normalizes some options for a field (sets default values)
    var normalizeFieldOptions = function ( id, field, options, parent ) {

        // Set id
        field.id = id;

        // Set the name
        /*
        if ( field.key ){
            options.key = id;
        }*/
        field.name = id;

        // Set defaults when undefined
        if ( field.type == undefined ) {
            field.type = 'text';
        }
        if ( field.elementId == undefined ) {
            field.elementId = 'zcrud-' + id;
        }
        if ( field.elementName == undefined ) {
            field.elementName = parent? parent.id + context.subformSeparator + id: id;
        }
        //field.labelFor = fieldBuilder.getLabelFor( field, options );
        if ( field.template == undefined ){
            field.template = fieldBuilder.getTemplate( field, options );
        }
        if ( field.viewTemplate == undefined ){
            field.viewTemplate = fieldBuilder.getViewTemplate( field );
        }
        context.declareRemotePageUrl( field.template, options.templates.declaredRemotePageUrls );
        if ( field.formFieldAttributes == undefined ){
            field.formFieldAttributes = {};
        }
        if ( field.sorting == undefined ){
            field.sorting = true;
        }

        // Convert dependsOn to array if it's a comma separated lists
        if ( field.dependsOn && $.type( field.dependsOn ) === 'string' ) {
            var dependsOnArray = field.dependsOn.split( ',' );
            field.dependsOn = [];
            for ( var i = 0; i < dependsOnArray.length; i++ ) {
                field.dependsOn.push( $.trim( dependsOnArray[ i ] ) );
            }
        }

        // 
        normalizeCustomOptionsField( field, options );

        // Normalize subfields in this field
        if ( field.fields ){
            $.each( field.fields, function ( subfieldId, subfield ) {
                normalizeFieldOptions( subfieldId, subfield, options, field );
            });
        }
    };

    var normalizeGeneralOptionsPostFields = function( options ) {

        // Add remote page URLs to allDeclaredRemotePageUrls array
        options.allDeclaredRemotePageUrls = options.templates.declaredRemotePageUrls.slice();
        context.declareRemotePageUrl( options.templates.busyTemplate, options.allDeclaredRemotePageUrls );

        for ( var i in options.pages ) {
            var template = options.pages[ i ].template;
            context.declareRemotePageUrl( template, options.allDeclaredRemotePageUrls );
        }
        //alert( JSON.stringify( options.allDeclaredRemotePageUrls ) );
    };

    var normalizeCustomOptionsField = function( field, options ){

        if ( ! field.customOptions ){
            field.customOptions = {};
        }

        var defaultFieldOptions = options.fieldsConfig.defaultFieldOptions[ field.type ];
        if ( ! defaultFieldOptions ){
            defaultFieldOptions = {};
        }

        field.customOptions = $.extend( true, {}, defaultFieldOptions, field.customOptions );
    };

    var normalizePagesOptions = function( options ){
        
        var defaultPageConf = options.defaultPageConf;
        $.each( options.pages, function ( pageId, page ) {
            var pageConf = $.extend( true, {}, defaultPageConf, page );
            options.pages[ pageId ] = pageConf;
        });
    };
    
    return {
        run: normalize,
        normalizeFieldOptions: normalizeFieldOptions
    };
})();
