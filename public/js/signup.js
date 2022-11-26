const errorMessage = document.getElementById("error-message");

const onSignup = async (e) =>{
    e.preventDefault();
    
    const email = e.target.email.value;
    const username = e.target.username.value;
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;
    const address = e.target.address.value;
    const city = e.target.city.value;
    const postcode = e.target.postcode.value;

    try{
        const res = await fetch("/signup", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
            method: "POST",
            body: JSON.stringify({
                email,
                username,
                password,
                confirmPassword,
                address,
                city,
                postcode
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
            window.location.href = "/";
        }
    }catch(e){
        errorMessage.innerText = "Failed to make request.";
        console.log(e);
    }
}