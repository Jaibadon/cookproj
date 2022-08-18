import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut} from "firebase/auth";
import { getDatabase, ref, update, runTransaction, onValue, query, orderByKey, equalTo, orderByChild, startAt, endAt} from "firebase/database";
import { getStorage, uploadBytes, getBytes, ref as sRef } from "firebase/storage";
import 'bootstrap';

var recipeprops = ["shorthand", "name", "time", "ingredients", "instructions"];

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

    let docengref = document.getElementById("recipeintning");
  
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

  var finalwrite = [];

  for(var i = 0; i < recipeprops.length; i++){
    finalwrite[i] = document.getElementById("recipe_" + recipeprops[i] + "ni").value;
    console.log(recipeprops[i]);
  }

  console.log(finalwrite);

  writeRecipe(finalwrite[0], finalwrite[1], finalwrite[2], finalwrite[3], finalwrite[4], file);

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

var gsnaprecog = -3;

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

var attachdone = false;

onValue(ref(db, 'recipes'), (snapshot) => {
  createRec(snapshot.size);

  var n = 0;

  if(gsnaprecog != null && gsnaprecog != -3){
    gsnaprecog.forEach((childSnapshot) => {

      console.log("ASMDANSJFNOAJSF", childSnapshot.key);
  
        var viewbutton = document.getElementById("view_recipe" + n);
        var upvotebutton = document.getElementById("upvote" + n);
        if(isadmin == true && attachdone == false){
          var editbutton = document.getElementById("edit_recipe" + n);
          editbutton.onclick = function(){  
              for(var b = 0; b < recipeprops.length; b++){
                var input = document.createElement("input");
                input.type = "text";
                input.id = "recipe_"+ recipeprops[b]+ "ni";
                document.getElementById("editRecipe").insertBefore(input, document.getElementById("fileInput"));
              }
                  show('editRecipe');
                };
                attachdone = true;
        }
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
    }else if(gsnaprecog == null){
      var recipeelement = document.getElementById('recipes');

      recipeelement.innerHTML = "No Recipes Found, Sorry!";
    }

  snapshot.forEach((childSnapshot) => {

    console.log("ASMDANSJFNOAJSF", childSnapshot.key);

    if(gsnaprecog == -3){

      var viewbutton = document.getElementById("view_recipe" + n);
      var upvotebutton = document.getElementById("upvote" + n);
      if(isadmin == true && attachdone == false){
        var editbutton = document.getElementById("edit_recipe" + n);
        editbutton.onclick = function(){

            //very hard to make fully dynamic, will do if have time

            for(var b = 0; b < recipeprops.length; b++){
              var input = document.createElement("input");
              input.type = "text";
              input.id = "recipe_"+ recipeprops[b]+ "ni";
              document.getElementById("editRecipe").insertBefore(input, document.getElementById("fileInput"));
            }

                show('editRecipe')
              
              };
              attachdone = true;
      }

      viewbutton.onclick = function(){sLargeRc('enrec' + childSnapshot.key)};
      
      upvotebutton.onclick = function(){upvoteRecipe(childSnapshot.key, userid)};

      childSnapshot.forEach((ccduSnapshot) =>{
         var recipeelement = document.getElementById(ccduSnapshot.key + n);
         if(typeof(recipeelement) != 'undefined' && recipeelement != null){
            recipeelement.innerHTML = ccduSnapshot.val();
         }
      });
      n = n + 1;
    }
  });

});

var selectElement = document.getElementById('searchnavbar');

selectElement.addEventListener('change', (event) => {

  //window.location.search = selectElement.value;
  //var b = window.location.href.substring(window.location.href.indexOf("?")+1, window.location.href.indexOf("#"));
  var b = selectElement.value;

  var b = b.split(" ");

  for(var i = 0; i < b.length; i++){
    onValue(query(ref(db, 'recipes/'), orderByChild('recipe_name'), startAt(b[i].toLowerCase()),endAt(b[i].toLowerCase()+"\u{f8ff}")), (snapshot) => {
      console.log(b);
      console.log(snapshot.val());
      createRec(snapshot.size)
      gsnaprecog = snapshot;
      if(gsnaprecog != null && gsnaprecog != -3){
        var n = 0;
        gsnaprecog.forEach((childSnapshot) => {
    
          console.log("beans", childSnapshot.key);
      
            var viewbutton = document.getElementById("view_recipe" + n);
            var upvotebutton = document.getElementById("upvote" + n);
            if(isadmin == true && attachdone == false){
              var editbutton = document.getElementById("edit_recipe" + n);
              editbutton.onclick = function(){  
                  for(var b = 0; b < recipeprops.length; b++){
                    var input = document.createElement("input");
                    input.type = "text";
                    input.id = "recipe_"+ recipeprops[b]+ "ni";
                    document.getElementById("editRecipe").insertBefore(input, document.getElementById("fileInput"));
                  }
                      show('editRecipe');
                    };
                    attachdone = true;
            }
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
        }else if(gsnaprecog == null){
          var recipeelement = document.getElementById('recipes');
    
          recipeelement.innerHTML = "No Recipes Found, Sorry!";
        }
        show('recipes');
  });
  }


});

function createRec(recinum){


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

    var beforeinsert = document.getElementsByClassName("card-body")[i];

    cardDiv.insertBefore(imagerecipe, beforeinsert);
  }

if(isadmin != true){
  document.getElementById('edit_recipe' + i).remove();
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
        recipe_time: recipe_time,
        upvotes: 0
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
            if(data != null){
            data = data[recipe_shorthand];
            }
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
