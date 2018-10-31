// Change stylesheet of theme when themeSelector changes

$( '#themeSelector' ).change(
    function () {
        var $this = $( this );
        var theme = $this.val();
        $( '#stylesheet' ).attr( 'href', '/themes/' + theme + '/theme.css' );
    }
);
