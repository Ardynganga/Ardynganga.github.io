
//--[menu]
Click_ON_OF('#menu', () => {
    $('#composant_menu').css('visibility', 'visible');
},() => {
    $('#composant_menu').css('visibility', 'hidden');
})

//--[ gestion de theme ]
if (window.localStorage.getItem('theme') != null) {
    let theme = window.localStorage.getItem('theme');
    if (theme == 0) {
        $('.btn-theme-claire').hide();
        $('.btn-theme-sombre').show();
        $('.btn-theme-sombre').css('visibility', 'visible');

        $('.bg-N1').css('background-color', 'rgb(27, 26, 26)');
        $('.bg-N1').css('color', 'white');

        $('.bg-N2').css('background-color', 'rgb(66, 64, 64)');
        $('.bg-N2').css('color', 'white');
        $('a').css('color', 'white');
    }

}
Click_ON_OF('#btn_theme', () => {
    $('.btn-theme-claire').hide();
    $('.btn-theme-sombre').show();
    $('.btn-theme-sombre').css('visibility', 'visible');

    $('.bg-N1').css('background-color', 'rgb(27, 26, 26)');
    $('.bg-N1').css('color', 'white');

    $('.bg-N2').css('background-color', 'rgb(66, 64, 64)');
    $('.bg-N2').css('color', 'white');
    $('a').css('color', 'white');
}, () => {
    $('.btn-theme-sombre').hide();
    $('.btn-theme-sombre').css('visibility', 'hidden');
    $('.btn-theme-claire').show();
    $('.btn-theme-claire').css('visibility', 'visible');

    $('.bg-N1').css('background-color', 'whitesmoke');
    $('.bg-N1').css('color', 'black');

    $('.bg-N2').css('background-color', 'white');
    $('.bg-N2').css('color', 'black');
    $('a').css('color', 'black');
}, 'theme')