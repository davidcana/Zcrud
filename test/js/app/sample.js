"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
//var Qunit = require( 'qunitjs' );
var testUtils = require( './testUtils' );

zcrud.run({
    body: document.body,
    target: $( '#departmentsContainer' ),
    title: 'Departments',
    actions: {
        listAction:   'http://localhost:8080/cerbero/CRUDManager.do?cmd=LIST&table=department',
        createAction: 'http://localhost:8080/cerbero/CRUDManager.do?cmd=CREATE&table=department',
        updateAction: 'http://localhost:8080/cerbero/CRUDManager.do?cmd=UPDATE&table=department',
        deleteAction: 'http://localhost:8080/cerbero/CRUDManager.do?cmd=DELETE&table=department'
    },
    fields: [
        {
            id: 'id',
            title: 'Id',
            key: true,
            create: true,
            edit: true,
            delete: true,
            description: 'The unique id of the department!'
        },
        {
            id: 'name',
            title: 'Name',
            width: '90%',
            description: 'The name of the department!'
        },
        {
            id: 'description',
            title: 'Description',
            description: 'The description of the department!',
            list: false,
            type: 'textarea'
        },
        {
            id: 'date',
            title: 'Date',
            description: 'The date of the department!',
            list: false,
            type: 'date',
            customOptions:{
                inline: true
            }
        },
        {
            id: 'time',
            title: 'Time',
            description: 'The time of the department!',
            list: false,
            type: 'time'
        },
        {
            id: 'datetime',
            title: 'Datetime',
            description: 'The datetime of the department!',
            list: false,
            type: 'datetime'
        }
    ],
    listTemplate: 'listDefaultTemplate',
    //listTemplate: 'listCustomizedTemplate',
    updateTemplate: 'formDefaultTemplate',
    //updateTemplate: 'formCustomizedTemplate',
    createTemplate: 'formDefaultTemplate',
    //createTemplate: 'formCustomizedTemplate',
    deleteTemplate: 'deleteDefaultTemplate',
    //deleteTemplate: 'deleteCustomizedTemplate',
    
    ajax: testUtils.ajax,
    /*
    ajaxPreFilter : function( data ){
        return data;
    },
    ajaxPostFilter : function( data ){
        return {
            records: data.Records,
            result : data.Result,
            message: data.Message
        };
    }*/
});
