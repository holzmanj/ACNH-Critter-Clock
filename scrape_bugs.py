import json
import re

import requests
from bs4 import BeautifulSoup


page = requests.get("https://animalcrossing.fandom.com/wiki/Bugs_(New_Horizons)")
page_tree = BeautifulSoup(page.content, "html.parser")

tables = page_tree.find_all("table", class_="sortable")
table = tables[0]  # I'm pretty sure this is the Northern Hemisphere one...

rows = table.find_all("tr")
rows = rows[1:]

bugs = []
for row in rows:
    cells = row.find_all("td")
    b = {
        "name": cells[0].contents[1].contents[0],
        "image": cells[1].contents[1].attrs["href"],
        "price": int(cells[2].contents[0].strip()),
        "location": cells[3].contents[0].strip(),
        "time": cells[4].contents[1].text
    }

    # sort bugs into larger groups based on location
    if "Flying" in b["location"]:
        b["group"] = "flying"
    elif "Flowers" in b["location"]:
        b["group"] = "flowers"
    elif "Tree" in b["location"]:
        b["group"] = "trees"
    elif "Ground" in b["location"] or "Underground" in b["location"]:
        b["group"] = "ground"
    else:
        b["group"] = "other"


    # convert time to list of hours
    if b["time"] == "All day":
        b["time"] = list(range(24))
    else:
        ranges = "".join(b["time"].split(" ")).split("&")
        b["time"] = []
        for time_range in ranges:
            times = time_range.split("-")
            for i in range(2):
                match = re.fullmatch(r"([0-9]{1,2})(AM|PM)", times[i])
                if match.group(2) == "AM":
                    times[i] = int(match.group(1))
                else:
                    times[i] = (int(match.group(1)) + 12) % 24

            hr = times[0]
            while hr != times[1]:
                b["time"].append(hr)
                hr = (hr + 1) % 24

    # convert month cells to list
    b["months"] = []
    for i in range(5, 17):
        if cells[i].text.strip() == "✓":
            b["months"].append(i - 5)

    bugs.append(b)

with open("bugs.json", "w") as file:
    json.dump(bugs, file)