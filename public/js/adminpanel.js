/* Dynamically collapses/expands the dropdown when pressed. */
var dropdown = document.getElementsByClassName("dropdown-btn");
var i;

for (i = 0; i < dropdown.length; i++) {
    /* Listens to when a user clicks any elements with the class name */
    dropdown[i].addEventListener("click", function () {
        this.classList.toggle("active");
        var dropdownContent = this.nextElementSibling;
        if (dropdownContent.style.display === "block") {
            dropdownContent.style.display = "none"
        } else {
            dropdownContent.style.display = "block";
        }
    });
}

/* Submits user changes to the database */
function submitChange() {
    console.log("to do");
}