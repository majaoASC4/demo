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
     let jobListData = firebase.database().ref("jobs")
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
     $.ajax({
          dataType: "jsonp",
          url: "https://service.dice.com/api/rest/jobsearch/v1/simple.json",
          success: function(data){
               console.log(data)
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
               $(".admin-panel").addClass("disappear")
               displayJobListings()
               $(".job-listings").removeClass("disappear")
          }
     })
     $(".form-inline").submit(function(e){
          e.preventDefault();
     })
     let jobListData = firebase.database().ref("jobs")
     jobListData.on('child_added', function(row){
          let job = row.val()
          $(".custom-list").append(`
               <div class="col-md-4 col-sm-12">
                    <div class="job-card card">
                         <img class="card-img-top" src="`+job.comp_logo+`">
                         <div class="card-body">
                              <h4 class="card-title">`+job.comp_name+`</h4>
                              <p class="card-text">`+job.job_desc.substring(0,150)+"..."+`</p>
                              <a href="`+job.comp_site+`">Company Website</a>
                              <a>`+job.location+`</a>
                         </div>
                    </div>
               </div>
          `)
     })
})

$("#job-add").click(function(e){
     e.preventDefault();
     $(".profile-render").addClass("disappear")
     $(".job-listings").addClass("disappear")
     $(".admin-panel").removeClass("disappear")
})

$("#home").click(function(e){
     e.preventDefault();
     $(".admin-panel").addClass("disappear")
     $(".job-listings").addClass("disappear")
     $(".profile-render").removeClass("disappear")
})

$("#admin-panel-submit").click(function(){
     let jobName = $("#job-name").val()
     let compName = $("#company-name").val()
     let compLogo = $("#company-logo").val()
     let compSite = $("#company-site").val()
     let jobDesc = $("#job-description").val()
     let recruiter = $("#offerer").val()
     if((jobName && compName && compLogo && compSite && jobDesc && recruiter) && (jobName != "" && compName != "" && compLogo != "" && jobDesc != "" && recruiter != "")){
          firebase.database().ref("jobs").push({
               job_name: jobName,
               comp_name: compName,
               job_desc: jobDesc,
               comp_logo: compLogo,
               offerer: recruiter,
               comp_site: compSite,
               location: "New York"
          })
          $("input").val("")
     }
})
