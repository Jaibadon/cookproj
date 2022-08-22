import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut} from "firebase/auth";
import { getDatabase, ref, update, runTransaction,onValue, query, orderByKey, equalTo, orderByChild, startAt, endAt, limitToFirst} from "firebase/database";
import { getStorage, uploadBytes, getBytes, ref as sRef } from "firebase/storage";
import 'bootstrap';

var recipeprops = ["shorthand", "name", "time", "ingredients", "instructions"];

var completedimageload = [];

var homecompletedimageload = [];

function sLargeRc(shown){
  var sogref = ref(db, 'recipes/' + shown.split(/enrec/)[1])
  var recipeexists = true;
  onValue(sogref, (snapshot) =>{
    if(snapshot.val() == null){
      recipeexists = false;
    }
  })
  if(shown.match("enrec") != null && recipeexists == true){

    $('body')[0].style['background-image'] = "";

    $('html')[0].style['background-image'] = "";

    window.location.hash = '#' + shown;
    var ids = $("#contentmain > div").map(function() {
        return this.id;
    }).get();
  
    for(var i = 0; i < ids.length; i++){
      document.getElementById(ids[i]).style.display='none';
    }
    document.getElementById('enlargedrecipe').style.display='block';
  
    let storRef = sRef(storage, 'recipedata/' + shown.split(/enrec/)[1] + "/save");

    let botRef = sRef(storage, 'recipedata/' + shown.split(/enrec/)[1] + "/image");

    let docengref = document.getElementById("recipeintning");

    let imggref = document.getElementById("enlargedimagesrc");
  
    getBytes(storRef).then((arraybuf) => rWrec(arraybuf, true, docengref));

    getBytes(botRef).then((arraybuf) => rWrec(arraybuf, false, imggref));
  
    return false;
    }
    else{
      console.log("RECIPE DOES NOT EXIST");
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
  }

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

function gangsi(n, childSnapshot, homebol){
  if(homebol == false){
  var viewbutton = document.getElementById("view_recipe" + n);
  var upvotebutton = document.getElementById("upvote" + n);
  if(isadmin == true && attachdone == false){
  var editbutton = document.getElementById("edit_recipe" + n);
  editbutton.onclick = function(){  
  for(var j = 0; j < recipeprops.length; j++){
  var input = document.createElement("input");
  input.type = "text";
  input.id = "recipe_"+ recipeprops[j]+ "ni";             document.getElementById("editRecipe").insertBefore(input, document.getElementById("fileInput"));
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
  if(ccduSnapshot.key == "recipe_name"){
  recipeelement.innerHTML = titleCase(ccduSnapshot.val());
  }
  else{
  recipeelement.innerHTML = ccduSnapshot.val();
                }
             }
          });
        }
  else{
    var viewbutton = document.getElementById("homeview_recipe" + n);
    var upvotebutton = document.getElementById("homeupvote" + n);

    viewbutton.onclick = function(){sLargeRc('enrec' + childSnapshot.key)};
    upvotebutton.onclick = function(){upvoteRecipe(childSnapshot.key, userid)};
    childSnapshot.forEach((ccduSnapshot) =>{
    var recipeelement = document.getElementById("home" + ccduSnapshot.key + n);
    if(typeof(recipeelement) != 'undefined' && recipeelement != null){
    if(ccduSnapshot.key == "recipe_name"){
    recipeelement.innerHTML = titleCase(ccduSnapshot.val());
    }
    else{
    recipeelement.innerHTML = ccduSnapshot.val();
                  }
               }
            });
          }
        }

onValue(ref(db, 'recipes'), (snapshot) => {
  createRec(snapshot.size, false, false);

  var n = 0;

  if(gsnaprecog != null && gsnaprecog != -3){
    gsnaprecog.forEach((childSnapshot) => {
  
       gangsi(n, childSnapshot, false)
        n = n + 1;
    });
    }else if(gsnaprecog == null){
      var recipeelement = document.getElementById('recipescontainer');

      recipeelement.innerHTML = "No Recipes Found, Sorry!";
    }

  snapshot.forEach((childSnapshot) => {

    if(gsnaprecog == -3){

      gangsi(n, childSnapshot, false)

        if(completedimageload[n] != true){
        let storRef = sRef(storage, 'recipedata/' + childSnapshot.key + "/image");
        var imageelement = document.getElementById("recipe_image" + n)

        getBytes(storRef).then((arraybuf) => rWrec(arraybuf, false, imageelement));  
        completedimageload[n] = true;
      }
      n = n + 1;
    }
  });

});

function titleCase(str) {
  var splitStr = str.toLowerCase().split(' ');
  for (var i = 0; i < splitStr.length; i++) {
      splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
  }
  return splitStr.join(' '); 
}

function respondToVisibility (element, callback) {
  var options = {
    root: document.documentElement
  }

  var observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      callback(entry.intersectionRatio > 0);
    });
  }, options);

  observer.observe(element);
}
var firstload = true;
respondToVisibility(document.getElementById("home"), visible => { 
if(visible == true && firstload == true){
  onValue(query(ref(db, 'recipes/'), orderByChild('upvotes'), limitToFirst(6)), (snapshot) => {
    console.log(snapshot.val())
    var n = 0;
    createRec(snapshot.size, false, true)
    snapshot.forEach((childSnapshot) => {
  
        gangsi(n, childSnapshot, true)
  
          if(homecompletedimageload[n] != true){
          let storRef = sRef(storage, 'recipedata/' + childSnapshot.key + "/image");
          var imageelement = document.getElementById("homerecipe_image" + n)
  
          getBytes(storRef).then((arraybuf) => rWrec(arraybuf, false, imageelement));  
          homecompletedimageload[n] = true;
        n = n + 1;
      }
    });
  })
firstload = false;
}
});


var selectElement = document.getElementById('searchnavbar');

selectElement.addEventListener('change', (event) => {

  //window.location.search = selectElement.value;
  //var b = window.location.href.substring(window.location.href.indexOf("?")+1, window.location.href.indexOf("#"));
  var b = selectElement.value;

  var b = b.split(" ");

  for(var i = 0; i < b.length; i++){
    onValue(query(ref(db, 'recipes/'), orderByChild('recipe_name'), startAt(b[i].toLowerCase()),endAt(b[i].toLowerCase()+"\u{f8ff}")), (snapshot) => {
      if(snapshot.size > document.querySelectorAll(`[id^="recipe_image"]`).length){
        createRec(snapshot.size, true, false)
      }
      else{
        createRec(snapshot.size, false, false)
      }
      
      gsnaprecog = snapshot;
      if(gsnaprecog != null && gsnaprecog != -3 && snapshot.size > 0){
        var o = 0;
        var n = 0;

        gsnaprecog.forEach((childSnapshot) => {   
          
          var beans = document.querySelectorAll(`[id^="recipe_image"]`);
            if(beans[o].id != undefined){
               n = beans[o].id.match(/[0-9]/);
            }

            gangsi(n, childSnapshot, false)
              let storRef = sRef(storage, 'recipedata/' + childSnapshot.key + "/image");
              var imageelement = document.getElementById("recipe_image" + n)
      
              getBytes(storRef).then((arraybuf) => rWrec(arraybuf, false, imageelement));  
              //completedimageload[n] = true;
            
            o = o+ 1
        });
        }else if(gsnaprecog == null || snapshot.size == 0){
          var recipeelement = document.getElementById('recipescontainer');
    
          recipeelement.innerHTML = "No Recipes Found, Sorry!";
        }
        show('recipes');
  });
  }


});

function createRec(recinum, boldol, homebol){

  if(homebol == false){

  if($("#recipescontainer").contents().filter(function() {
    return this.nodeType == Node.TEXT_NODE;
  }).text() != undefined){
    $("#recipescontainer").contents().filter(function() {
      return this.nodeType == Node.TEXT_NODE;
    }).remove();
  }
  
  const myNode = document.getElementsByClassName("colDiv");

  if(boldol != true){

  while(recinum < myNode.length){
    myNode[0].remove();
  }
  if(myNode != undefined){
  for(var n = 0; n < myNode.length; n++){
  for (var i = 0; i < myNode.childElementCount; i++) {
    var nodres = myNode[n].childNodes.item(i).id;
    if(nodres != undefined){
    if(nodres.match("recipe_image") == null){
      myNode[n].removeChild(myNode[n].childNodes.item(i));
    }    
  }
  }
}
  }
}
  

if(document.querySelectorAll(`[class^="colDiv"]`).length == 0 || boldol == true){
  var p = 0;
for(var i = document.querySelectorAll(`[class^="colDiv"]`).length; i < recinum; i++){

  while(document.getElementById('recipe_image' + i) != undefined){
    i++;
    recinum++;
  }

  //get all vars of recipe[i]

  var cardDiv = document.createElement("div")

  cardDiv.classList.add("card")

  cardDiv.classList.add("shadow-sm");

  var colDiv = document.createElement("div")

  colDiv.classList.add("colDiv");

  colDiv.appendChild(cardDiv);

  document.getElementById("recipescontainer").append(colDiv);
//build up string to go in innerhtml

var ndiv = document.createElement('div');

ndiv.classList.add('card-body');
ndiv.insertAdjacentHTML('beforeend', `

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
`)


  cardDiv.append(ndiv);

  if(completedimageload[p] != true || boldol == true){
    var imagerecipe = document.createElement("img");

    imagerecipe.id = ("recipe_image" + i);

    var beforeinsert = ndiv;

    cardDiv.insertBefore(imagerecipe, beforeinsert);
  }

if(isadmin != true){
  document.getElementById('edit_recipe' + i).remove();
}
p++;
}
}
}else{
 

if(document.querySelectorAll(`[class="colDi"]`).length == 0){
  var p = 0;
for(var i = document.querySelectorAll(`[class="colDi"]`).length; i < recinum; i++){

  while(document.getElementById('homerecipe_image' + i) != undefined){
    i++;
    recinum++;
  }

  //get all vars of recipe[i]

  var cardDiv = document.createElement("div")

  cardDiv.classList.add("card")

  cardDiv.classList.add("shadow-sm");

  var colDiv = document.createElement("div")

  colDiv.classList.add("colDi");

  colDiv.appendChild(cardDiv);

  document.getElementById("srecipescontainer").append(colDiv);
//build up string to go in innerhtml

var ndiv = document.createElement('div');

ndiv.classList.add('card-body');
ndiv.id = 'homever' + i;
ndiv.insertAdjacentHTML('beforeend', `

    <p class="card-text" id="homerecipe_name` + i + `"></p>
    <small class="text-muted" id="homerecipe_time` + i + `"></small>
    <div class="d-flex justify-content-between align-items-center">
      <div class="btn-group">
        <button type="button" class="btn btn-sm btn-outline-secondary" id="homeview_recipe` + i + `">View</button>
        <button type="button" class="btn btn-sm btn-outline-secondary" id="homeupvote` + i + `">Upvote</button>
       <small id="homeupvotes` + i + `"></small>
      </div>
    </div>
`)


  cardDiv.append(ndiv);

  if(homecompletedimageload[p] != true){
    var imagerecipe = document.createElement("img");

    imagerecipe.id = ("homerecipe_image" + i);

    var beforeinsert = document.getElementById('homever' + i);

    cardDiv.insertBefore(imagerecipe, beforeinsert);
  }
p++;
}
}
}
}
function writeRecipe(recipe_shorthand, recipe_name, recipe_time, recipe_ingredients, recipe_instructions, recipe_image){
    const recref = ref(db, 'recipes/' + recipe_shorthand);
    
    update( recref, {
        recipe_name: recipe_name,
        recipe_time: recipe_time,
        upvotes: 0
        });

      var savefile = new File(["<div id='erecipe_ingredients'>" + recipe_ingredients + "</div><div id='erecipe_instructions'>" + recipe_instructions + "</div>"],recipe_shorthand + "save", {type: "text/html"});
        
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
      htmname.innerHTML = "Loading...";
      (async () => {
        htmname.innerHTML = await recblob.text();   
            var instructStr = document.getElementById('erecipe_ingredients').innerHTML;

    var mailist = document.createElement('ul');

    mailist.classList.add("list-group", "list-group-flush");

    var ainstructArr = instructStr.split(',');

    for(var h = 0; h < ainstructArr.length; h++){
      var sublistb = document.createElement('li');
      sublistb.classList.add("list-group-item");
      sublistb.innerHTML = ainstructArr[h];
      mailist.append(sublistb);
    } 
    document.getElementById('erecipe_ingredients').replaceChild(mailist, $('#erecipe_ingredients')[0].childNodes[0]);

    var dune = document.getElementById('erecipe_instructions');

    var intstring = dune.innerHTML;

    var aintstringarr = intstring.split('%');

    var malist = document.createElement('ol');

    malist.classList.add("list-group");

    for(var h = 0; h < aintstringarr.length; h++){
      var sublistb = document.createElement('li');
      sublistb.classList.add("list-group-item");
      
        sublistb.innerHTML = aintstringarr[h];
      
      if(sublistb.innerHTML != "" && sublistb.innerHTML != " "){
      malist.append(sublistb);
      }
    } 
    dune.replaceChild(malist, $('#erecipe_instructions')[0].childNodes[0]);

    var instheading = document.createElement('h2');

    instheading.innerHTML = "Instructions"

    var ingheading = document.createElement('h2');

    ingheading.innerHTML = "Ingredients"

    dune.insertBefore(instheading, malist);

    document.getElementById('erecipe_ingredients').insertBefore(ingheading,mailist);
    
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


function recommendRecipes(){

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
