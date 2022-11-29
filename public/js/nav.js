const hamburger = document.getElementById("hamburger");
const navItems = document.querySelectorAll(".list-container");
const mobile = document.querySelectorAll(".mobile");

let toggle = false;

// When hamburger icon is clicked
hamburger.addEventListener("click", () =>{
    toggle = !toggle;

    navItems.forEach(container =>{
        container.style.display = toggle ? "flex" : "none";
    })
})

// On window resize 
window.addEventListener("resize", () =>{
    if(window.innerWidth > 768){
        navItems.forEach(container =>{
            container.style.display = "flex";
        })

        mobile.forEach(container => container.style.display = "none")
        toggle = false;
    } else{
        hamburger.style.display = "block";
        navItems.forEach(container =>{
            container.style.display = "none";
        })
    }
}) 