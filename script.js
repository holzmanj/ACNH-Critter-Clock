let FISH;

function drawFishTable() {
    wrapper = document.getElementById("fish-table-wrapper");

    // clear out previous contents of columns
    for (let i = 1; i <= 6; i++) {
        let column = document.getElementById(`fish-size-${i}-column-body`);
        column.innerHTML = "";
    }

    let date = new Date();
    let month = date.getMonth();
    let hour = date.getHours();

    let availableFish = FISH.filter(f => month in f.months && hour in f.time);
    availableFish = availableFish.sort((a, b) => b.price - a.price);
    
    availableFish.forEach(fish => {
        let size = parseInt(fish.shadow_size);
        let column = document.getElementById(`fish-size-${size}-column-body`);

        // style fish tile depending on where to find fish
        let fishTile = document.createElement("div");
        if (fish.location == "Sea" || fish.location == "Pier") {
            fishTile.className = "fish-tile saltwater-fish-tile";
        } else {
            fishTile.className = "fish-tile freshwater-fish-tile";
        }

        let fishImg = document.createElement("img");
        fishImg.className = "fish-image";
        fishImg.src = fish.image;
        fishTile.appendChild(fishImg);

        let fishName = document.createElement("div");
        fishName.className = "fish-name";
        fishName.innerHTML = fish.name;
        fishTile.appendChild(fishName);

        let fishPrice = document.createElement("div");
        fishPrice.className = "fish-price";
        fishPrice.innerHTML = fish.price;
        fishTile.appendChild(fishPrice);

        let fishLocation = document.createElement("div");
        fishLocation.className = "fish-location";
        fishLocation.innerHTML = fish.location;
        fishTile.appendChild(fishLocation);

        column.appendChild(fishTile);
    });
}

window.onload = function () {
    // load fish from JSON
    let request = new XMLHttpRequest();
    request.onload = function () {
        FISH = JSON.parse(request.response);

        drawFishTable();
    };
    request.open("GET", window.location.href + "fish.json");
    request.send();
}