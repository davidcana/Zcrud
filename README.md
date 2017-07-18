# What is zCrud?

zCrud is a javascript API (also works as jQuery plugin) used to create AJAX based CRUD tables without coding HTML or Javascript. It is based on 
 [jTable](http://www.jtable.org) with some major changes:
 
 * The heaviest change is to build all HTML code of forms using a template engine ([ZPT-JS](https://github.com/davidcana/ZPT-JS/wiki)). 
 * It does not depend on any javascript API (like jQueryUI), only on jQuery.
 * It does not create any dialog form, only simple HTML forms.
 
The next list details the features of jTable and the expected version of zCrud that will implement it:

* Automatically creates HTML table and loads records from server using AJAX. *(done!)*
* Creates 'create new record' form. When user creates a record, it sends data to server using AJAX and adds the same record to the table in the page. *(done!)*
* Creates 'edit record' form. When user edits a record, it updates server using AJAX and updates all cells on the table in the page. *(done!)*
* Creates 'delete a record' form. When user deletes a record, it deletes the record from server using AJAX and deletes the record from the table in the page. *(done!)*
* All tables and forms can be created using default templates. It is also possible to use customized templates. *(done!)*
* All styling of table and forms are defined in a CSS file, so you can easily change style of everything to use plugin in your pages. CSS file is well defined and commented. *(done!)*
* It is not depended on any server side technology. *(done!)*
* Makes it easy to customize already implemented form field types; also to add new form field types. *(done!)*
* All HTML code is valid (w3c compliant). It works on all common browsers. *(0.1.0 version)*
* Exposes some events to enable validation with forms. *(0.1.0 version)*
* Supports server side sorting and paging using AJAX. *(0.2.0 version)*
* Supports master/child tables. *(0.3.0 version)*
* Allows user to select rows. *(0.4.0 version)*
* Allows user to resize columns. *(0.5.0 version)*
* Allows user to show/hide columns. *(0.5.0 version)*
* It can be localized easily. Full I18n and L10n support. *(0.6.0 version)*
* Shows animations for create/delete/edit operations on the table. *(0.7.0 version)*