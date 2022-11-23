const errorMessage = document.getElementById("error-message");

const onLogin = async (e) =>{
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    try{
        const res = await fetch("/login", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              method: "POST",
            body: JSON.stringify({
                username,
                password
            })
        })

        const data = await res.json();

        if(res.status == 400){
            errorMessage.innerText = data.message;
        }
        else if(res.status == 500){
            errorMessage.innerText = "Internal server error. Please try again later";
        } 
        else if(res.status == 200){
            errorMessage.innerText = "";
            console.log("Success!");
            console.log(data.token);
            localStorage.setItem("token", data.token);
        }
    }catch(e){
        errorMessage.innerText = "Failed to make request.";
    }
}