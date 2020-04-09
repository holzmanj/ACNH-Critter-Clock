const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

let FISH;
let BUGS;
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

function toggleCaught(critterName) {
    let caughtCritters = getCookie("caughtCritters").split("|");
    
    if (caughtCritters.includes(critterName)) {
        let i = caughtCritters.indexOf(critterName);
        caughtCritters.splice(i, 1);
    } else {
        caughtCritters.push(critterName);
    }

    setCookie("caughtCritters", caughtCritters.join("|"));
}

function isCaught(critterName) {
    let caughtCritters = getCookie("caughtCritters").split("|");
    return caughtCritters.includes(critterName);
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

function toggleCritters() {
    let pageWrapper = document.getElementById("page-content-wrapper");
    let toggleWrapper = document.getElementById("toggle-critters-container");
    if (pageWrapper.className.includes("show-fish")) {
        pageWrapper.removeClass("show-fish");
        pageWrapper.addClass("show-bugs");
        toggleWrapper.removeClass("show-fish");
        toggleWrapper.addClass("show-bugs");
    } else {
        pageWrapper.removeClass("show-bugs");
        pageWrapper.addClass("show-fish");
        toggleWrapper.removeClass("show-bugs");
        toggleWrapper.addClass("show-fish");
    }
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

function generateCaughtCheckbox(critterName) {
    let container = document.createElement("label");
    container.className = "checkbox-container";

    let input = document.createElement("input");
    input.type = "checkbox";
    input.checked = isCaught(critterName);
    input.onchange = () => toggleCaught(critterName);

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
        fishTile.appendChild(generateCaughtCheckbox(fish.name));

        column.appendChild(fishTile);
    });
}

function updateBugsTable() {
    wrapper = document.getElementById("bugs-table-container");

    // clear out previous contents of columns
    ["flying", "flowers", "trees", "ground", "other"].forEach(group => {
        let column = document.getElementById(`bugs-${group}-column-body`);
        column.innerHTML = "";
    });

    let date = new Date();
    let month = date.getMonth();
    let hour = date.getHours();

    let availableBugs = BUGS.filter(b => b.months.includes(month) && b.time.includes(hour));
    availableBugs = availableBugs.sort((a, b) => b.price - a.price);

    availableBugs.forEach(bug => {
        let column = document.getElementById(`bugs-${bug.group}-column-body`);

        let bugTile = document.createElement("div");
        bugTile.addClass("bug-tile");

        // IMAGE
        let bugImg = document.createElement("img");
        bugImg.className = "bug-image";
        bugImg.src = bug.image;
        bugTile.appendChild(bugImg);

        // NAME
        let bugName = document.createElement("div");
        bugName.className = "bug-name";
        bugName.innerHTML = bug.name;
        bugTile.appendChild(bugName);

        // PRICE
        let bugPrice = document.createElement("div");
        bugPrice.className = "bug-price";
        bugPrice.innerHTML = bug.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        bugTile.appendChild(bugPrice);

        // LOCATION
        let bugLocation = document.createElement("div");
        bugLocation.className = "bug-location";
        bugLocation.innerHTML = bug.location;
        bugTile.appendChild(bugLocation);

        // CAUGHT CHECKBOX
        bugTile.appendChild(generateCaughtCheckbox(bug.name));

        column.appendChild(bugTile);
    });
}

function clockTick() {
    let d = new Date();
    if (d.getHours() !== HOUR) {
        updateBackground();
        updateFishTable();
        updateBugsTable();
    }

    // update clock last because it modifies the globals
    if (d.getMinutes() !== MINUTE) {
        updateClock();
    }

    setTimeout(clockTick, 1000);
}

function loadBugs() {
    let request = new XMLHttpRequest();
    request.onload = function () {
        BUGS = JSON.parse(request.response);

        clockTick();
    };
    request.open("GET", window.location.href + "bugs.json");
    request.send();
}

function loadFish() {
    let request = new XMLHttpRequest();
    request.onload = function () {
        FISH = JSON.parse(request.response);

        loadBugs();
    };
    request.open("GET", window.location.href + "fish.json");
    request.send();
}

window.onload = function () {
    loadFish();

}