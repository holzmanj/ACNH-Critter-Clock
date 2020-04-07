const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

let FISH;
let MONTH, HOUR, MINUTE;

HTMLElement.prototype.addClass = function (className) {
    let classes = this.className.split(" ");
    if (!classes.includes(className)) {
        classes.push(className);
        this.className = classes.join(" ");
    }
}

HTMLElement.prototype.removeClass = function (className) {
    let classes = this.className.split(" ");
    if (classes.includes(className)) {
        let i = classes.indexOf(className);
        classes.splice(i, 1);
        this.className = classes.join(" ");
    }
}

function setCookie(name, value) {
    document.cookie = name + "=" + value + ";expires=Tue, 19 Jan 2038 09:14:07 GMT";
}

function getCookie(name) {
    var name = name + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
}

function toggleCaught(fishName, elem) {
    caughtFish = getCookie("caughtFish").split("|");
    
    if (caughtFish.includes(fishName)) {
        let i = caughtFish.indexOf(fishName);
        caughtFish.splice(i, 1);
    } else {
        caughtFish.push(fishName);
    }

    setCookie("caughtFish", caughtFish.join("|"));
}

function isCaught(fishName) {
    caughtFish = getCookie("caughtFish").split("|");
    return caughtFish.includes(fishName);
}

function updateBackground() {
    let background = document.getElementById("background");
    let hour = (new Date()).getHours();
    // sunrise between 5AM and 7AM
    if (hour >= 5 && hour < 7) {
        background.className = "sunrise";
    } else 
    // day between 7AM and 5PM
    if (hour >= 7 && hour < 17) {
        background.className = "day";
    } else
    // sunset between 5PM and 7PM
    if (hour >= 17 && hour < 19) {
        background.className = "sunrise";
    } else {
        background.className = "night";
    }
}

function updateClock() {
    function dateOrdinal(day) {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
          case 1:  return "st";
          case 2:  return "nd";
          case 3:  return "rd";
          default: return "th";
        }
    }

    let d = new Date();
    MONTH = d.getMonth();
    HOUR = d.getHours();
    MINUTE = d.getMinutes();

    let dateWrapper = document.getElementById("date-wrapper");
    let timeWrapper = document.getElementById("time-wrapper");

    dateWrapper.innerHTML = `It's ${MONTH_NAMES[MONTH]} ${d.getDate()}${dateOrdinal(d.getDate())}`;
    let hours = HOUR % 12;
    hours = hours ? hours : 12;    // turns hour 0 into 12
    let minutes = MINUTE;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    let ampm = HOUR < 12 ? "AM" : "PM"

    timeWrapper.innerHTML = `${hours}:${minutes} ${ampm}`;
}

function getFishFilters() {
    let filters = {
        saltwater: document.getElementById("show-saltwater").checked,
        freshwater: document.getElementById("show-freshwater").checked,
        caught: document.getElementById("show-caught").checked,
        uncaught: document.getElementById("show-uncaught").checked
    };
    return filters;
}

function generateCaughtCheckbox(fishName, tile) {
    let container = document.createElement("label");
    container.className = "checkbox-container";

    let input = document.createElement("input");
    input.type = "checkbox";
    input.checked = isCaught(fishName);
    input.onchange = () => toggleCaught(fishName, tile);

    let checkmark = document.createElement("span");
    checkmark.className = "checkmark";

    let hoverText = document.createElement("div");
    hoverText.className = "hover-text";
    hoverText.innerHTML = "Mark as caught"

    container.appendChild(input);
    container.appendChild(checkmark);
    container.appendChild(hoverText);
    return container
}

function updateFishTable() {
    wrapper = document.getElementById("fish-table-wrapper");

    // clear out previous contents of columns
    for (let i = 1; i <= 6; i++) {
        let column = document.getElementById(`fish-size-${i}-column-body`);
        column.innerHTML = "";
    }

    let date = new Date();
    let month = date.getMonth();
    let hour = date.getHours();

    let availableFish = FISH.filter(f => f.months.includes(month) && f.time.includes(hour));

    let filters = getFishFilters();
    if (!filters.caught) {
        availableFish = availableFish.filter(f => !isCaught(f.name));
    }
    if (!filters.uncaught) {
        availableFish = availableFish.filter(f => isCaught(f.name));
    }

    availableFish = availableFish.sort((a, b) => b.price - a.price);

    availableFish.forEach(fish => {
        let size = fish.shadow_size == "Narrow" ? "narrow" : parseInt(fish.shadow_size);
        let column = document.getElementById(`fish-size-${size}-column-body`);

        // style fish tile depending on where to find fish
        let fishTile = document.createElement("div");
        fishTile.addClass("fish-tile");
        if (fish.location.startsWith("Sea") || fish.location.startsWith("Pier")) {
            if (!filters.saltwater) {
                return;
            } else {
                fishTile.addClass("saltwater-fish-tile")
            }
        } else {
            if (!filters.freshwater) {
                return;
            } else {
                fishTile.addClass("freshwater-fish-tile")
            }
        }

        // IMAGE
        let fishImg = document.createElement("img");
        fishImg.className = "fish-image";
        fishImg.src = fish.image;
        fishTile.appendChild(fishImg);

        // NAME
        let fishName = document.createElement("div");
        fishName.className = "fish-name";
        fishName.innerHTML = fish.name;
        fishTile.appendChild(fishName);

        // PRICE
        let fishPrice = document.createElement("div");
        fishPrice.className = "fish-price";
        fishPrice.innerHTML = fish.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        fishTile.appendChild(fishPrice);

        // LOCATION
        let fishLocation = document.createElement("div");
        fishLocation.className = "fish-location";
        fishLocation.innerHTML = fish.location;
        fishTile.appendChild(fishLocation);

        // CAUGHT CHECKBOX
        fishTile.appendChild(generateCaughtCheckbox(fish.name, fishTile));

        column.appendChild(fishTile);
    });
}

function clockTick() {
    let d = new Date();
    if (d.getHours() !== HOUR) {
        updateBackground();
        updateFishTable();
    }

    // update clock last because it modifies the globals
    if (d.getMinutes() !== MINUTE) {
        updateClock();
    }

    setTimeout(clockTick, 1000);
}

window.onload = function () {
    // load fish from JSON
    let request = new XMLHttpRequest();
    request.onload = function () {
        FISH = JSON.parse(request.response);

        clockTick();
    };
    request.open("GET", window.location.href + "fish.json");
    request.send();
}