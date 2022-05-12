document.addEventListener("DOMContentLoaded", function(event) {
    var ahash = window.location.hash.slice(1);
    if(window.location.hash == ""){
        show('home','game','about');
    }
    else{
            if(ahash == 'game'){
               show('game','home','about');
               console.log("tadnfjndjfnv");
            }
            else if(ahash == 'home'){
                show('home','game','about');
            }
            else if(ahash == 'about'){
                show('about','game','home');
            }
    }
});


