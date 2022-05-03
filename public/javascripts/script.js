var one = document.querySelector("#one");
var createques = document.querySelector("#createques")

var flag = 0
one.addEventListener("click", function () {
    if (flag === 0) {
        createques.style.display = "initial"
        flag = 1;
    }
    else {
        flag = 0;
        createques.style.display = "none"
    }
})