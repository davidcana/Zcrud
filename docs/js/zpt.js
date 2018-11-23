// Invoke ZPT
var zptParser = zpt.buildParser({
    root: [ 
        document.getElementById( 'commonHeader' ), 
        document.getElementById( 'commonFooter' )
    ],
    dictionary: {},
    declaredRemotePageUrls: [ '/templates.html' ]
});

zptParser.init(
    function(){
        zptParser.run();
    }
);
