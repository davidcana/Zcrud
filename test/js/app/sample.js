"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
//var Qunit = require( 'qunitjs' );
var testUtils = require( './testUtils' );

zcrud.run({
    body: document.body,
    target: $( '#departmentsContainer' ),
    title: 'Departments',
    entityId: 'department',
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
            edit: true,
            delete: true,
            description: 'The unique id of the department!'
        },
        name: {
            title: 'Name',
            width: '90%',
            description: 'The name of the department!'
        },
        description: {
            title: 'Description',
            description: 'The description of the department!',
            list: false,
            type: 'textarea',
            template: "descriptionTextarea"
        },
        date: {
            title: 'Date',
            description: 'The date of the department!',
            list: false,
            type: 'date',
            customOptions: {
                inline: true
            }
        },
        time: {
            title: 'Time',
            description: 'The time of the department!',
            list: false,
            type: 'time'
        },
        datetime: {
            title: 'Datetime',
            description: 'The datetime of the department!',
            list: false,
            type: 'datetime'
        },
        phoneType: {
            title: 'Phone type',
            description: 'The phone type of the department!',
            list: false,
            type: 'radio',
            options: 'http://localhost:8080/cerbero/CRUDManager.do?table=phoneTypes'
            /*
            options: function(){
                return [ 'Home phone!', 'Office phone!', 'Cell phone!!!' ];
            }*/
            //options: [ 'Home phone', 'Office phone', 'Cell phone' ]
            /*
            options: [
                { value: '1', displayText: 'Home phone!' }, 
                { lue: '2', displayText: 'Office phone!' }, 
                { value: '3', displayText: 'Cell phone!' } ]*/
            //options: { '1': 'Home phone', '2': 'Office phone', '3': 'Cell phone' }
        },
        province: {
            title: 'Province',
            description: 'The province of the department',
            list: false,
            type: 'select',
            options: [ 'Cádiz', 'Málaga' ],
            defaultValue: 'Cádiz'
        },
        city: {
            title: 'City',
            description: 'The city of the department',
            list: false,
            type: 'select',
            dependsOn: 'province',
            options: function( data ){
                if ( ! data.dependedValues.province ){
                    return [ 'Algeciras', 'Estepona', 'Marbella', 'Tarifa' ]
                };
                
                switch ( data.dependedValues.province ) {
                case 'Cádiz':
                    return [ 'Algeciras', 'Tarifa' ];
                    break;
                case 'Málaga':
                    return [ 'Estepona', 'Marbella' ];
                    break;
                default:
                    throw 'Unknown province: ' + data.dependedValues.province;
                }
            }
        },
        browser: {
            title: 'Browser',
            description: 'The prefered browser of the department',
            list: false,
            type: 'datalist',
            options: [ 'Internet Explorer', 'Firefox', 'Chrome', 'Opera', 'Safari' ]
        },
        important: {
            title: 'Important',
            description: 'Is important?',
            list: false,
            type: 'checkbox'
        }
    },
    listTemplate: "'listDefaultTemplate@templates/lists.html'",
    updateTemplate: "'formDefaultTemplate@templates/forms.html'",
    createTemplate: "'formDefaultTemplate@templates/forms.html'",
    deleteTemplate: "'deleteDefaultTemplate@templates/forms.html'",
    
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
