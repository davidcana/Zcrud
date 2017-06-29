$(function () {
    "use strict";
    //debugger;
    
    
    $( '#departmentsContainer' ).jtable({
        title: 'Departments',
        actions: {
            listAction:   'http://localhost:8080/cerbero/CRUDManager.do?cmd=LIST&table=department',
            createAction: 'http://localhost:8080/cerbero/CRUDManager.do?cmd=CREATE&table=department',
            updateAction: 'http://localhost:8080/cerbero/CRUDManager.do?cmd=UPDATE&table=department',
            deleteAction: 'http://localhost:8080/cerbero/CRUDManager.do?cmd=DELETE&table=department'
        },
        fields: {
            id: {
            	title: 'Id',
            	key: true,
                create: true,
                edit: true
            },
            name: {
                title: 'Name',
                width: '90%'
            }
        }
    });
    
    $( '#departmentsContainer' ).jtable( 'load' );
});
