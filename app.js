const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
const facebookAuthProvider = new firebase.auth.FacebookAuthProvider();

let userType;

const createUser = (user) => {
     console.log(user)
     if(user){
          const userid = user.uid
          firebase.database().ref("users/"+userid).child('name').set(user.displayName)
          firebase.database().ref("users/"+userid).child('photo').set(user.photoURL)
          if($(location).attr('href').endsWith("login.html")){
               $(location).attr('href', $(location).attr('href').replace("login.html", "profile.html"));
          }
     }
}

const checkInput = () => {
     let str = $("#search").val();
     console.log(str);
     if(str){
          console.log("description="+str);
          return "description=high school,"+str.split(' ').join(',');
     }
     return "description=high school";
}

const displayProfile = (user) => {
     $(".user-avatar").attr("src", user.photoURL)
     $(".user-avatar-small").attr("src", user.photoURL)
     $(".username").text(user.displayName)
}

const displayJobListings = () => {
     let info = checkInput()
     $.ajax({
          dataType: "jsonp",
          url: "https://jobs.github.com/positions.json?"+info,
          success: function(data){
               console.log(data)
               $(".job-list").empty()
               for(var i=0;i<data.length;i++){
                    let job = data[i]
                    $(".job-list").append(`
                         <div class="col-md-4 col-sm-12">
                              <div class="job-card card">
                                   <img class="card-img-top" src="`+job.company_logo+`">
                                   <div class="card-body">
                                        <h4 class="card-title">`+job.company+`</h4>
                                        <p class="card-text">`+job.description.substring(0,150)+"..."+`</p>
                                        <a href="`+job.company_url+`">Company Website</a>
                                        <a>`+job.location+`</a>
                                   </div>
                              </div>
                         </div>
                    `)
               }
          }
     })
}

$("#google-sign").click(() => {
     firebase.auth().signInWithPopup(googleAuthProvider).then(function(result){
          const user = result.user
          createUser(user)
          // The signed-in user info.
     }).catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // The email of the user's account used.
          var email = error.email;
          // The firebase.auth.AuthCredential type that was used.
          var credential = error.credential;
          // ...
          console.log("Error " + errorCode + " : " + errorMessage)
     });
})

firebase.auth().onAuthStateChanged(function(user) {
     if (user) {
          if($(location).attr('href').endsWith("login.html")){
               $(location).attr('href', $(location).attr('href').replace("login.html", "profile.html"));
          }
          console.log("User is on");
          console.log(user)
          createUser(user)
          displayProfile(user)
          // User is signed in.
     } else {
          console.log("Nobody is signed in");
          // No user is signed in.
     }
});

$("#sign-out").click(() => {
     firebase.auth().signOut()
     $(location).attr('href', $(location).attr('href').replace("profile.html", "login.html"));
})
$("#employee-select").click(function(){
     if(!firebase.auth().currentUser){
          userType = "employees";
          console.log(userType)
     }
})
$("#student-select").click(function(){
     if(!firebase.auth().currentUser){
          userType = "students";
          console.log(userType)
     }
})

$(() => {
     $("#search").keypress(function(e){
          if(e.which == 13){
               $(".profile-render").addClass("disappear")
               displayJobListings()
               $(".job-listings").removeClass("disappear")
          }
     })
     $(".form-inline").submit(function(e){
          e.preventDefault();
     })
})
