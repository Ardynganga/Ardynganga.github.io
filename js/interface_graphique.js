
const Csrf_token = getCookie('csrftoken');

//--[ recuperation des propriété de linterface graphique]
let data_request = {
    "tache":"get_propriete_interface_graphique",
}
let myHeaders = new Headers({'X-CSRFToken':Csrf_token});
let myInit = { 
    method: 'POST',
    headers: myHeaders,
    mode: 'cors',
    cache: 'default',
    body:JSON.stringify(data_request)
}
fetch('/interface_graphique/',myInit).then((res)=>{
    return res.json()
  }).then((res)=>{
    console.log(res);
    $('#logo_url').attr('src', res.url_logo);
    $('.entete').css('background-color', res.base_color);
    
  })


  let heigth = innerHeight;
  let width = innerWidth;
