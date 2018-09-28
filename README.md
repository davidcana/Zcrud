# What is ZCrud?

ZCrud is a javascript API (also works as jQuery plugin) used to create AJAX based CRUD tables without coding HTML or Javascript. First implmentations were based on [jTable](http://www.jtable.org) with some major changes:
 
 * The heaviest change is to build all HTML code of forms using a template engine ([ZPT-JS](https://github.com/davidcana/ZPT-JS/wiki)). 
 * It does not depend on any javascript API (like jQueryUI), only on jQuery.
 * It does not create any dialog form, only simple HTML forms.

Core features of ZCrud are:

* Automatically creates a main HTML table and loads records from server using AJAX. Supports server side sorting, paging and filtering using AJAX. The table can be editable directly too. 
* Automatically creates some typical forms and sends and receives data from/to server using AJAX:
    * *create record* form.  
    * *edit record* form. 
    * *delete record* form. 
* About forms:
    * Supports master/child forms. 
    * Allows user to select rows. 
    * Makes it easy to customize already implemented form field types; also to add new form field types.
    * Makes it easy to use defined buttons (submit, cancel, ...) and to add custom.
    * Built-in support of validation of forms using [jQuery Form Validator](http://www.formvalidator.net/). Exposes some events to enable custom validation without using it.
    * Undo/redo support. 
* All tables and forms are created using templates.  It is also possible to use customized templates. The template engine is [ZPT-JS](https://github.com/davidcana/ZPT-JS). 
* Pretty messages and confirm questions using [Sweetalert](https://sweetalert.js.org) (by default). It is easy to replace it by any other API or function.
* Only client-side: any server side technology can work with ZCrud. 
* Built-in support for english and spanish (full I18n and L10n support). Other languages can be added easily. 
* All HTML code is valid (w3c compliant). It works on all common browsers. 
