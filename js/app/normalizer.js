/* 
    normalizer singleton class
*/
var context = require( './context.js' );
var $ = require( 'jquery' );

module.exports = (function() {
    "use strict";

    // Normalizes some options (sets default values)
    var normalize = function( options ) {
        
        normalizeGeneralOptions( options );
        
        options.fields = normalizeFieldGroupOptions( options.fields, options );
        
        normalizePagesOptions( options );
        
        normalizeGeneralOptionsPostFields( options );
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
    
    var normalizeFieldGroupOptions = function ( fields, options, parent ) {

        var fieldInstances = {};

        $.each( fields, function ( fieldId, field ) {
            fieldInstances[ fieldId ] = buildFullFieldInstance( fieldId, field, options, parent );
        });

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

        // Create customOptions if needed
        if ( ! field.customOptions ){
            field.customOptions = {};
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

        return $.extend( true, {}, defaultFieldOptions, field );
    };
    
    var normalizeGeneralOptionsPostFields = function( options ) {

        // Add remote page URLs to allDeclaredRemotePageUrls array
        options.allDeclaredRemotePageUrls = options.templates.declaredRemotePageUrls.slice();
        context.declareRemotePageUrl( options.templates.busyTemplate, options.allDeclaredRemotePageUrls );

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
        $.each( options.pageConf.pages, function ( pageId, page ) {
            var pageConf = $.extend( true, {}, defaultPageConf, page );
            options.pageConf.pages[ pageId ] = pageConf;
        });
    };
    
    return {
        run: normalize,
        buildFullFieldInstance: buildFullFieldInstance
    };
})();
