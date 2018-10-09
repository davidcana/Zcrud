// Invoke ZPT

var zptParser = zpt.buildParser({
    root: document.body,
    //root: [ $( '#commonHeader' )[0], $( '#commonFooter' )[0] ],
    dictionary: {
        location: window.location
    },
    declaredRemotePageUrls: [ 'templates.html' ]
});

zptParser.init(
    function(){
        zptParser.run();
    }
);
/*
$( '#commonHeader' ).zpt({
    dictionary: {}
});
$( '#commonFooter' ).zpt({
    dictionary: {}
});
*/
/*
zpt.run({
    root: $( '#commonHeader' )[0],
    dictionary: {}
});

zpt.run({
    root: $( '#commonFooter' )[0],
    dictionary: {}
});*/
