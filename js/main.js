//--| fonction getCookie une fonction qui recuper le cookier en pasant le nom du cookier |---\\
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
//--[ methode qui permet de basculer en des click 0-1]
function Click_ON_OF(element_HTML, Methode_on, Methode_of, nameContaire) {

    $(element_HTML).click(function (e) {
        e.preventDefault();

        //----------
        if (window.localStorage.getItem(nameContaire) != null) {
            let ctr = window.localStorage.getItem(nameContaire);
            ctr = parseInt(ctr);
            ctr += 1;
            ctr = ctr % 2;
            console.log(ctr)
            if (ctr == 0) {
                Methode_on();
                window.localStorage.setItem(nameContaire, ctr)
            } else {
                //--[ of ]
                Methode_of();
                window.localStorage.setItem(nameContaire, ctr)
            }
            window.localStorage.setItem(nameContaire, ctr)
        } else {
            window.localStorage.setItem(nameContaire, 1)
        }

    });
}
