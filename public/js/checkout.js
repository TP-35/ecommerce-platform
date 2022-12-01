const fullname = document.getElementById("full-name");
const email = document.getElementById("email");
const city = document.getElementById("city");
const address = document.getElementById("address");
const postcode = document.getElementById("postcode");

(async () =>{
    try{
        const res = await fetch("/users");
        const data = await res.json();
        
        fullname.value = data.fullname;
        email.value = data.email;
        city.value = data.city;
        address.value = data.address;
        postcode.value = data.postcode;
    }catch(e){
    }
})()

async function onCheckout(e){
    e.preventDefault();
    //todo save order to database
    //todo clear basket to simulate purchase 
}