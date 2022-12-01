const fullname = document.getElementById("full-name");
const username = document.getElementById("username");
const email = document.getElementById("email");
const city = document.getElementById("city");
const address = document.getElementById("address");
const postcode = document.getElementById("postcode");

const errorMessage = document.getElementById("error-message");

(async () =>{
    try{
        const res = await fetch("/users");
        const data = await res.json();
        email.placeholder = data.email;
        username.placeholder = data.username;
        city.placeholder = data.city;
        address.placeholder = data.address;
        postcode.placeholder = data.postcode;
        fullname.placeholder = data.fullname;
    }catch(e){
        window.location.href="/";
    }
})()

async function onDelete(){
    const res = await fetch("/user", {
        method: "DELETE"
    });

    if(res.status === 200){
        window.location.href = "/logout";
    } else{
        errorMessage.style.display = "block";     
    }
}
