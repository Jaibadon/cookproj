import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut} from "firebase/auth";
import { getDatabase, ref, update, runTransaction, onValue, query, orderByChild, equalTo, set} from "firebase/database";
import { getStorage, uploadBytes, getBytes, ref as sRef } from "firebase/storage";
import 'bootstrap';



function sLargeRc(shown){
  if(shown.match("enrec") != null){

    window.location.hash = '#' + shown;
    var ids = $("#contentmain > div").map(function() {
        return this.id;
    }).get();
  
    for(var i = 0; i < ids.length; i++){
      document.getElementById(ids[i]).style.display='none';
    }
    document.getElementById('enlargedrecipe').style.display='block';
  
  
    let storRef = sRef(storage, 'recipedata/' + shown.split(/enrec/)[1]);
  
    getBytes(storRef).then((arraybuf) => rWrec(arraybuf));
  
  
    return false;
    }
}



document.addEventListener("DOMContentLoaded", function(event) {
    var ahash = window.location.hash.slice(1);
    if(window.location.hash == ""){
        show('home');
    }
    else{
            if(ahash == 'game'){
               show('game');
            }
            else if(ahash == 'home'){
                show('home');
            }
            else if(ahash == 'about'){
                show('about');
            }
            else if(ahash == 'recipes'){
                show('recipes');
            }
            else if(ahash.match("enrec") != null){
              sLargeRc(ahash)
            }
            else {
              show('home')
            }
            
    }
});


const firebaseConfig = {
    apiKey: "AIzaSyDqR2leco9zvUmnQFzbBF8PfIyUEllJHaY",
    authDomain: "vue-firebasep.firebaseapp.com",
    projectId: "vue-firebasep",
    storageBucket: "vue-firebasep.appspot.com",
    messagingSenderId: "688478706827",
    appId: "1:688478706827:web:f1113b0f3653a7bbbcc88e",
    measurementId: "G-K2EQGYBMQY",
    databaseURL: "https://vue-firebasep-default-rtdb.asia-southeast1.firebasedatabase.app"
  };

const app = initializeApp(firebaseConfig); 

const db = getDatabase(app);

const storage = getStorage();

var signedin = false;

var userid = null;

const auth = getAuth();

const whenSignedIn = $('[id=whenSignedIn]');
const whenSignedOut = $('[id=whenSignedOut]');

const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');

whenSignedIn.hide();
whenSignedOut.hide();

const provider = new GoogleAuthProvider();

signInBtn.onclick = () => signInWithPopup(auth, provider);

signOutBtn.onclick = () => signOut(auth);

onAuthStateChanged(auth, (user) => {
    if (user) {
        signedin = true;
        userid = user.uid;
        whenSignedIn.show();
        whenSignedOut.hide();
    } else {
        whenSignedIn.hide();
        whenSignedOut.show(); 
    }
});

onValue(ref(db, 'recipes'), (snapshot) => {
  createRec(snapshot.size, snapshot.ref);

  var n = 0;

  snapshot.forEach((childSnapshot) => {

      var viewbutton = document.getElementById("view_recipe" + n);
      var upvotebutton = document.getElementById("upvote" + n);

      viewbutton.onclick = function(){sLargeRc('enrec' + childSnapshot.key)};
      upvotebutton.onclick = function(){upvoteRecipe(childSnapshot.key, userid)};


      childSnapshot.forEach((ccduSnapshot) =>{
         var recipeelement = document.getElementById(ccduSnapshot.key + n);
         if(typeof(recipeelement) != 'undefined' && recipeelement != null){
            recipeelement.innerHTML = ccduSnapshot.val();
         }
      });
      n = n + 1;
  });
});

function createRec(recinum, reciref){

  const myNode = document.getElementById("recipescontainer");
  while (myNode.firstChild) {
    myNode.removeChild(myNode.lastChild);
  }

for(var i = 0; i < recinum; i++){

  //get all vars of recipe[i]

  var cardDiv = document.createElement("div")

  cardDiv.classList.add("card")

  cardDiv.classList.add("shadow-sm");

  var colDiv = document.createElement("div")

  colDiv.classList.add("colDiv");

  colDiv.appendChild(cardDiv);

  document.getElementById("recipescontainer").append(colDiv);

  var imagerecipe = document.createElement("img");

  imagerecipe.id = ("recipe_image" + i);

  cardDiv.appendChild(imagerecipe);

  cardDiv.innerHTML += `
  <div class="card-body">
      <p class="card-text" id="recipe_name` + i + `"></p>
      <div class="d-flex justify-content-between align-items-center">
        <div class="btn-group">
          <button type="button" class="btn btn-sm btn-outline-secondary" id="view_recipe` + i + `">View</button>
          <button type="button" class="btn btn-sm btn-outline-secondary" id="edit_recipe` + i + `">Edit</button>
          <button type="button" class="btn btn-sm btn-outline-secondary" id="upvote` + i + `">Upvote</button>
        </div>
        <small>Upvotes: </small><small id="upvotes` + i + `"></small>
        <small class="text-muted" id="recipe_time` + i + `"></small>
      </div>
    </div>
  `
  
//sort recipes into official and non-offical. The official ones you can play on the minigame.

  //document.getElementById(("upvote" + i)).addEventListener("click", function() {
   // upvoteRecipe(recinum, userid);
 // });

}
}
function writeRecipe(recipe_shorthand, recipe_name, recipe_time, recipe_ingredients, recipe_instructions){
    const recref = ref(db, 'recipes/' + recipe_shorthand);
    const storRef = sRef(storage, 'recipedata/' + recipe_shorthand);
    
    update( recref, {
        recipe_name: recipe_name,
        recipe_time: recipe_time
        });

      var savefile = new Blob(["<div id='erecipe_instructions'>" + recipe_instructions + "</div><div id='erecipe_ingredients'>" + recipe_ingredients + "</div>"], {type: "text/html"});

      uploadBytes(storRef, savefile).then((snapshot) => {
        console.log('Uploaded instructions and ingredients');
      });
    }

//writeRecipe("lasagne", "noice lasagne", "15mins", "cook the beans in the beans nicely \n eat the beans", "beans and rice");



function upvoteRecipe(recipe_shorthand, userid){
        if(userid != null){
        const upvotesRef = ref(db, 'recipes/' + recipe_shorthand + "/upvotes");
        const userref = ref(db, 'users/' + userid);
       // console.log(query(ref(db, 'users/' + userid), orderByChild('updoots'), equalTo(recipe_shorthand)));
        //if(query(ref(db, 'users/' + userid), orderByChild('updoots'), equalTo(recipe_shorthand)) == null){
          runTransaction(upvotesRef, (current_value) => {

            update(userref, {
              [recipe_shorthand] : 1
            } );

            return (current_value || 0) + 1;
          });
        //}
        
        }else{
            console.log("User not logged in, redirecting to login...")
            signInWithPopup(auth, provider);
        }
  	    }




function rWrec(recbuffer){
    let recblob = new Blob([recbuffer], {type : "text/plain"});

    (async () => {
      document.getElementById("enlargedrecipe").innerHTML = await recblob.text();
    })();
    
          
}

//var firstrecipe = document.getElementById("recipes").firstChild.firstChild.firstChild;

/*for(var i = 0; i < firstrecipe.length; i++){
    firstrecipe.id = firstrecipe.id + i;
}

*/


  //var namffe = "lasagne";
 // const upvoteCountRef = ref(db, ('recipes/' + namffe + '/upvotes'));
//  onValue(upvoteCountRef, (snapshot) => {
 //   const data = snapshot.val();
 //   document.getElementById("upvotecount").innerHTML = data;
 // });
