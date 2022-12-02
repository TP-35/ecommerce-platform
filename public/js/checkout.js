
const fullname = document.getElementById("fullname");
const email = document.getElementById("email");
const city = document.getElementById("city");
const address = document.getElementById("address");
const postcode = document.getElementById("postcode");
const error = document.getElementById("error-message");


(async () => {
    try {
        const res = await fetch("/users");
        const data = await res.json();

        fullname.value = data.fullname;
        email.value = data.email;
        city.value = data.city;
        address.value = data.address;
        postcode.value = data.postcode;
    } catch (e) {
    }
})()

const onCheckout = async (e) => {
    e.preventDefault(); // Prevents the submit action, which will stop the page redirecting

    // Stores all the necessary values 
    const fullname = e.target.fullname.value;
    const email = e.target.email.value;
    const address = e.target.address.value;
    const city = e.target.city.value;
    const postcode = e.target.postcode.value;
    const quantity = 1;

    // Tries to call the method that handles creating an order
    try {
        const res = await fetch("/orders", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({
                fullname,
                email,
                address,
                city,
                postcode,
                quantity
            })
        })

        // Returns the message if necessary
        const data = await res.json();
        
        if(res.status === 200){
            window.location.href = "/";
        }else{
            throw data.message;
        }

    } catch (e) {
        error.innerText = e;
    }
}