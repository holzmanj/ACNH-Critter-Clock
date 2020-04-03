let FISH;

document.onload = function () {
    // load fish from JSON
    let request = new XMLHttpRequest();
    request.onload = function () {
        FISH = JSON.parse(request.response);

        document.getElementById("test").innerHTML = FISH;
    };
    request.open("GET", "/fish.json");
    request.send();
}