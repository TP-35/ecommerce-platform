function showPass() {
    var pass = document.getElementById("password");
    if (pass.type === "password") {
      pass.type = "text";
    } else {
      pass.type = "password";
    }
    var pass = document.getElementById("confirmpassword");
    if (pass.type === "password") {
      pass.type = "text";
    } else {
      pass.type = "password";
    }
  }



  function samePass(){
  var password = document.getElementById("password").value; 
  var confirmpassword = document.getElementById("confirmpassword").value;
  var message = document.getElementById("message");
  if(password.length != 0){
  if (password != confirmpassword ){
     message.textContent = "Passwords don't match";
     message.style.backgroundColor = "#ff2200";
  }
 else {
   message.textContent = "Passwords Match";
     message.style.backgroundColor = "#2cff14";  
 } 
}
else{
    message.textContent = "";
    message.style.backgroundColor = "";  

}


}