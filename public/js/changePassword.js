const result = document.getElementById("result");

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
} else{
      message.textContent = "";
      message.style.backgroundColor = "";  

  }
}


async function changePassword(e){
  e.preventDefault();
  const password = e.target.password.value;
  const confirmPassword = e.target.password.value;

  try{
    const res = await fetch("/user", {
      method: "PATCH", 
      body: JSON.stringify({password, confirmPassword}),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      }
    });

    const data = await res.json();

    if(data.status == 200){
      result.innerText = "Success!";
      result.style.display = "block";
      result.classList = "success-message";    
    }else{
      throw Error(data.message); 
    }
  }catch(e){
    // display error
    result.innerText = e.message;
    result.style.display = "block";
    result.classList = "success-message"; 
  }
}