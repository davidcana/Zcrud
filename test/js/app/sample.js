"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
//var Qunit = require( 'qunitjs' );

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
            edit: true
        },
        {
            id: 'name',
            title: 'Name',
            width: '90%'
        }
    ],
    listTemplate: 'listDefaultTemplate',
    //listTemplate: 'listCustomizedTemplate',
    updateTemplate: 'formCustomizedTemplate'
});
