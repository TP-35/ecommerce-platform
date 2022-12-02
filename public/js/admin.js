const updateUser = async (e) => {
    const errorMessage = document.getElementById("error-message");
    e.preventDefault(); // Prevents the submit action, which will stop the page redirecting

    // Stores all the necessary values 
    const oldUsername = e.target.username.defaultValue;
    const newUsername = e.target.username.value;
    const password = e.target.password.value;
    const fullName = e.target.fullname.value;
    const email = e.target.email.value;
    const role = e.target.role.value;

    // Tries to call the method that handles updating a user
    try {
        const res = await fetch("/users/" + oldUsername, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              method: "POST",
            body: JSON.stringify({
                oldUsername,
                newUsername,
                password,
                fullName,
                email,
                role
            })
        })

        // Returns the message if necessary
        const data = await res.json();

        if (res.status == 400) {
            errorMessage.innerText = data.message;
        }
        else if (res.status == 500) {
            errorMessage.innerText = "Internal server error. Please try again later";
        } 
        else if (res.status == 200) {
            errorMessage.innerText = "";
            // Redirects the user as intended
            window.location.href = "/listusers";
        }
    } catch(e) {
        console.log(e);
        errorMessage.innerText = "Failed to make request.";
    }
}

const addProduct = async (e) => {
    const errorMessage = document.getElementById("error-message");
    e.preventDefault(); // Prevents the submit action, which will stop the page redirecting

    // Stores all the necessary values 
    const name = e.target.name.value;
    const description = e.target.description.value;
    const category = e.target.category.value;
    const cost = e.target.cost.value;
    const shipping_cost = e.target.shippingcost.value;
    const image = e.target.image.value;
    const gender = e.target.gender.value;
    const quantity = e.target.quantity.value;

    // Tries to call the method that handles updating a product
    try {
        const res = await fetch("/products/", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              method: "POST",
            body: JSON.stringify({
                name,
                description,
                category,
                cost,
                shipping_cost,
                image,
                gender,
                quantity
            })
        })

        // Returns the message if necessary
        const data = await res.json();

        if (res.status == 400) {
            errorMessage.innerText = data.message;
        }
        else if (res.status == 500) {
            errorMessage.innerText = "Internal server error. Please try again later";
        } 
        else if (res.status == 200) {
            errorMessage.innerText = "";
            // Redirects the user as intended
            window.location.href = "/listproducts";
        }
    } catch(e) {
        console.log(e);
        errorMessage.innerText = "Failed to make request.";
    }
}

const updateProduct = async (e) => {
    const errorMessage = document.getElementById("error-message");
    e.preventDefault(); // Prevents the submit action, which will stop the page redirecting

    // Stores all the necessary values 
    const product_id = e.target.product_id.defaultValue;
    const name = e.target.name.value;
    const description = e.target.description.value;
    const category = e.target.category.value;
    const cost = e.target.cost.value;
    const shipping_cost = e.target.shippingcost.value;
    const image = e.target.image.value;
    const gender = e.target.gender.value;
    const quantity = e.target.quantity.value;

    // Tries to call the method that handles updating a product
    try {
        const res = await fetch("/products/" + product_id, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              method: "POST",
            body: JSON.stringify({
                name,
                description,
                category,
                cost,
                shipping_cost,
                image,
                gender,
                quantity
            })
        })

        // Returns the message if necessary
        const data = await res.json();

        if (res.status == 400) {
            errorMessage.innerText = data.message;
        }
        else if (res.status == 500) {
            errorMessage.innerText = "Internal server error. Please try again later";
        } 
        else if (res.status == 200) {
            errorMessage.innerText = "";
            // Redirects the user as intended
            window.location.href = "/listproducts";
        }
    } catch(e) {
        console.log(e);
        errorMessage.innerText = "Failed to make request.";
    }
}