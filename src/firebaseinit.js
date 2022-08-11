import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut} from "firebase/auth";
import { getDatabase, ref, update, runTransaction, onValue, query, orderByKey, equalTo} from "firebase/database";
import { getStorage, uploadBytes, getBytes, ref as sRef } from "firebase/storage";
import 'bootstrap';

var completedimageload = false;

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
  
  
    let storRef = sRef(storage, 'recipedata/' + shown.split(/enrec/)[1] + "/save");

    let docengref = document.getElementById("enlargedrecipe");
  
    getBytes(storRef).then((arraybuf) => rWrec(arraybuf, true, docengref));
  
  
    return false;
    }
}



document.addEventListener("DOMContentLoaded", function(event) {
  hasherFunc();
});


document.getElementById("uploadButton").onclick = () => {
  let fileElement = document.getElementById('fileInput')

  if (fileElement.files.length === 0) {
    alert('Please choose a file')
    return
  }

  let file = fileElement.files[0];

  writeRecipe("lasagne", "noice lasagne", "15mins", "AHSHSHSHS \n eat the beans", "beans and rice", file);

}


window.addEventListener('hashchange', function() {
  hasherFunc();
});

function hasherFunc(){
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
          else if(ahash == 'editRecipe'){
            show('editRecipe');
          }
          else if(ahash.match("enrec") != null){
            sLargeRc(ahash)
          }
          else {
            show('home')
          }
  }}


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

var isadmin = false;

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
        if(userid == "H0G3Y9tBJxTlrePksO8iCh9CaSH3"){
          isadmin = true;
        }
        whenSignedIn.show();
        whenSignedOut.hide();
    } else {
        isadmin = false;
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
      if(isadmin == true){
        var editbutton = document.getElementById("edit_recipe" + n);
        editbutton.onclick = function(){show('editRecipe')};
      }

      viewbutton.onclick = function(){sLargeRc('enrec' + childSnapshot.key)};
      
      upvotebutton.onclick = function(){upvoteRecipe(childSnapshot.key, userid)};

      if(completedimageload == false){
        let storRef = sRef(storage, 'recipedata/' + childSnapshot.key + "/image");

        var imageelement = document.getElementById("recipe_image" + n)
      
        getBytes(storRef).then((arraybuf) => rWrec(arraybuf, false, imageelement));  
        completedimageload = true;
      }


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
//build up string to go in innerhtml
  cardDiv.innerHTML += `
  <div class="card-body">
      <p class="card-text" id="recipe_name` + i + `"></p>
      <small class="text-muted" id="recipe_time` + i + `"></small>
      <div class="d-flex justify-content-between align-items-center">
        <div class="btn-group">
          <button type="button" class="btn btn-sm btn-outline-secondary" id="view_recipe` + i + `">View</button>
          <button type="button" class="btn btn-sm btn-outline-secondary" id="edit_recipe` + i + `">Edit</button>
          <button type="button" class="btn btn-sm btn-outline-secondary" id="upvote` + i + `">Upvote</button>
         <small id="upvotes` + i + `"></small>
        </div>
      </div>
    </div>
  `
  if(completedimageload == false){
    var imagerecipe = document.createElement("img");

    imagerecipe.id = ("recipe_image" + i);

    cardDiv.appendChild(imagerecipe);
  }

if(isadmin != true){
  document.getElementById('edit_recipe').remove();
}


  
//sort recipes into official and non-offical. The official ones you can play on the minigame.

  //document.getElementById(("upvote" + i)).addEventListener("click", function() {
   // upvoteRecipe(recinum, userid);
 // });

}
}
function writeRecipe(recipe_shorthand, recipe_name, recipe_time, recipe_ingredients, recipe_instructions, recipe_image){
    const recref = ref(db, 'recipes/' + recipe_shorthand);
    
    update( recref, {
        recipe_name: recipe_name,
        recipe_time: recipe_time
        });

      var savefile = new File(["<div id='erecipe_instructions'>" + recipe_instructions + "</div><div id='erecipe_ingredients'>" + recipe_ingredients + "</div>"],recipe_shorthand + "save", {type: "text/html"});

        
      uploadBytes(sRef(storage, 'recipedata/' + recipe_shorthand + "/image"), recipe_image).then((snapshot) => {
        console.log('Uploaded image');
      });

      uploadBytes(sRef(storage, 'recipedata/' + recipe_shorthand + "/save"), savefile).then((snapshot) => {
        console.log('Uploaded instructions and ingredients');
      });
      
    }





function upvoteRecipe(recipe_shorthand, userid){
        if(userid != null){
        const upvotesRef = ref(db, 'recipes/' + recipe_shorthand + "/upvotes");
        const userref = ref(db, 'users/' + userid + '/upvotedrecipes');

          onValue(query(ref(db, 'users/' + userid + '/upvotedrecipes'), orderByKey(), equalTo(recipe_shorthand)), (snapshot) => {
            var data = snapshot.val();
            data = data[recipe_shorthand];
            console.log(data);
            if(data == null || data == 0){
              runTransaction(upvotesRef, (current_value) => {

                update(userref, {
                  [recipe_shorthand] : 1
                } );
    
                return (current_value || 0) + 1;
              });
            }
            else{
              runTransaction(upvotesRef, (current_value) => {

                update(userref, {
                  [recipe_shorthand] : 0
                } );
    
                return (current_value || 0) - 1;
              });
            }
          }, {
            onlyOnce: true
          })
        //if(query(ref(db, 'users/' + userid), orderByChild('updoots'), equalTo(recipe_shorthand)) == null){
          
        //}
        
        }else{
            console.log("User not logged in, redirecting to login...")
            signInWithPopup(auth, provider);
        }
  	    }




function rWrec(recbuffer, boolsav, htmname){
    if(boolsav== true){
      let recblob = new Blob([recbuffer], {type : "text/plain"});
      (async () => {
        htmname.innerHTML = await recblob.text();
      })();
    }else{
      
      (async () => {
        let recblob = new Blob([recbuffer], {type : "img/png"});
        var urlCreator = window.URL || window.webkitURL;
        var imageUrl = urlCreator.createObjectURL(recblob);
        htmname.src = imageUrl;
      })();

    }
    

    
    
          
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
