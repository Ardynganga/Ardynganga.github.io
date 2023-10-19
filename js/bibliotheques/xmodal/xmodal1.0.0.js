//--[ xmodal un module js basique pour la creation de lodale sur des site et application web.]

class Xmodal {

    //--[ Alert]
    xalert(id_container, titre, body) {
        let modal = (`
            <!-- [1] -->
            <div class="modal_style blancs xomodal-alert" id="modal-1" aria-hidden="true">
                
                <!-- [2] -->
                <div class="modal__overlay" tabindex="-1" data-micromodal-close>
                    
                    <!-- [3] -->
                    <div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="modal-1-title">
                        <header class="modal__header">
                            <h2 class="modal__title" id="modal-1-title">
                                ${titre}
                            </h2>

                            <!-- [4] -->
                            <button class="modal__close" aria-label="Close modal" data-micromodal-close></button>
                        </header>

                        <main class="modal__content" id="modal-1-content">
                            <p>
                                ${body}
                            </p>
                        </main>

                        <footer class="modal__footer">
                            <button class="modal__btn modal__btn-primary modal__closex">ok</button>
                            
                        </footer>

                    </div>
                </div>
            </div>
        `);
        $(id_container).html(modal);
        let modal_alert = 1;
        $('body').css('overflow', 'hidden');
        $('.modal__close').click(function (e) {
            e.preventDefault();
            $('.xomodal-alert').css('display', 'none');
            $('body').css('overflow', '');
        });
        $('.modal__closex').click(function (e) {
            e.preventDefault();
            $('.xomodal-alert').css('display', 'none');
            $('body').css('overflow', '');
        });

    }

    //--[ Confirme]
    xconfirm(id_container, titre, body, fonction) {
        let modal = (`
            <!-- [1] -->
            <div class="modal xomodal-confirm" id="modal-1" aria-hidden="true">
                
                <!-- [2] -->
                <div class="modal__overlay" tabindex="-1" data-micromodal-close>
                    
                    <!-- [3] -->
                    <div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="modal-1-title">
                        <header class="modal__header">
                            <h2 class="modal__title" id="modal-1-title">
                                ${titre}
                            </h2>

                            <!-- [4] -->
                            <button class="modal__close" aria-label="Close modal" data-micromodal-close></button>
                        </header>

                        <main class="modal__content" id="modal-1-content">
                            <p>
                                ${body}
                            </p>
                        </main>

                        <footer class="modal__footer">
                            <button class="modal__btn modal__btn-primary btn__ok">Ok</button>
                            <button class="modal__btn  btn__annuler" data-micromodal-close aria-label="Close this dialog window">Annuler</button>
                        </footer>

                    </div>
                </div>
            </div>
        `);
        $(id_container).html(modal);

        $('.modal__close').click(function (e) {
            e.preventDefault();
            $('.xomodal-confirm').css('display', 'none');
            fonction(false);
        });
        $('.btn__ok').click(function (e) {
            e.preventDefault();
            $('.xomodal-confirm').css('display', 'none');
            fonction(true);
        });
        $('.btn__annuler').click(function (e) {
            e.preventDefault(false);
            $('.xomodal-confirm').css('display', 'none');
            fonction();
        });

    }

    //--[ Dialogue]
    xdialogue(id_container, titre, body, type, placeholder, maxlength, fonction) {
        let modal = (`
            <!-- [1] -->
            <div class="modal_style xomodal-dialogue" id="modal-1" aria-hidden="true">
                
                <!-- [2] -->
                <div class="modal__overlay" tabindex="-1" data-micromodal-close>
                    
                    <!-- [3] -->
                    <div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="modal-1-title">
                        <header class="modal__header">
                            <h2 class="modal__title" id="modal-1-title">
                                ${titre}
                            </h2>

                            <!-- [4] -->
                            <button class="modal__close" aria-label="Close modal" data-micromodal-close></button>
                        </header>

                        <main class="modal__content" id="modal-1-content">
                            <p>
                                ${body}
                            </p>
                            <input type="${type}" id="input_dialogue" placeholder="${placeholder}" maxlength="${maxlength}">
                        </main>
                        <form action="">
                            <footer class="modal__footer">
                                
                                
                                
                                <button type="submit" class="modal__btn modal__btn-primary btn__ok">Valider</button>
                                <button class="modal__btn  btn__annuler" data-micromodal-close aria-label="Close this dialog window">Annuler</button>
                            </footer>
                        </form>
                    </div>
                </div>
            </div>
        `);
        $(id_container).html(modal);
        $('body').css('overflow', 'hidden');
        $('.modal__close').click(function (e) {
            e.preventDefault();
            $('.xomodal-dialogue').css('display', 'none');
            $('body').css('overflow', '');
        });
        $('.btn__ok').click(function (e) {
            e.preventDefault();
            $('.xomodal-dialogue').css('display', 'none');
            let val = $('#input_dialogue').val();
            fonction(val);
        });
        $('.btn__annuler').click(function (e) {
            e.preventDefault(false);
            $('.xomodal-dialogue').css('display', 'none');
        });
    }

    //--[ Dialogue]
    xdialogue2(id_container, titre, body, type, placeholder, maxlength, type2, placeholder2, maxlength2, fonction) {
        let montantMise = $('#Montant_mise').val();
        let typeMise = $('#type_pari').val();

        if(typeMise == "Type du pari"){
            typeMise = "Pari multis joueurs";
        }
        let modal = (`
            <!-- [1] -->
            <div class="modal_style xomodal-dialogue" id="modal-1" aria-hidden="true">
                
                <!-- [2] -->
                <div class="modal__overlay" tabindex="-1" data-micromodal-close>
                    
                    <!-- [3] -->
                    <div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="modal-1-title">
                        <header class="modal__header">
                            <h2 class="modal__title" id="modal-1-title">
                                ${titre}
                            </h2>

                            <!-- [4] -->
                            <button class="modal__close" aria-label="Close modal" data-micromodal-close></button>
                        </header>

                        <main class="modal__content" id="modal-1-content">
                            <p>
                                ${body}
                            </p>
                            <input type="${type}" id="input_dialogue" placeholder="${placeholder}" maxlength="${maxlength}">
                            <input type="${type2}" id="input_dialogue2" placeholder="${placeholder2}" maxlength="${maxlength2}" value="${montantMise}">
                            <br><br>
                            <div class=" text-start">
                                <select name="" id="type_paris" class="" style="width: 90%;padding: 5px;border-radius: 5px;" value="${typeMise}">
                                    <option value="Pari multis joueurs">Pari multis joueurs</option>
                                    <option value="Pari individuel">Pari individuel</option>
                                </select>
                            </div>
                        </main>
                        <form action="">
                            <footer class="modal__footer">
                                
                                
                                
                                <button type="submit" class="modal__btn modal__btn-primary btn__ok">Valider</button>
                                <button class="modal__btn  btn__annuler" data-micromodal-close aria-label="Close this dialog window">Annuler</button>
                            </footer>
                        </form>
                    </div>
                </div>
            </div>
        `);
        $(id_container).html(modal);

        $('.modal__close').click(function (e) {
            e.preventDefault();
            $('.xomodal-dialogue').css('display', 'none');
        });
        $('.btn__ok').click(function (e) {
            e.preventDefault();
            $('.xomodal-dialogue').css('display', 'none');
            let val = $('#input_dialogue').val();
            let val2 = $('#input_dialogue2').val();
            let val3 = $('#type_paris').val();
            fonction(val,val2,val3);
        });
        $('.btn__annuler').click(function (e) {
            e.preventDefault(false);
            $('.xomodal-dialogue').css('display', 'none');
        });
    }
}