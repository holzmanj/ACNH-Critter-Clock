import json
import re

import requests
from bs4 import BeautifulSoup


# this rarity function is unfinished and unused for now because not all fish
# currently have rarity values for New Horizons.
rarity_values = set()
def find_rarity(url: str) -> None:
    page = requests.get(f"https://animalcrossing.fandom.com{url}")
    tree = BeautifulSoup(page.content, "html.parser")
    pairs = tree.find_all("div", class_="pi-item pi-data pi-item-spacing pi-border-color")

    pairs = filter(lambda p: p.contents[1].text.strip() == "Rarity", pairs)
    rarity = list(map(lambda p: p.contents[3].text.strip(), pairs))

    if len(rarity) == 0:
        print(f"Couldn't find rarity for {url}")
    else:
        for val in rarity:
            rarity_values.add(val)


page = requests.get("https://animalcrossing.fandom.com/wiki/Fish_(New_Horizons)")
page_tree = BeautifulSoup(page.content, "html.parser")

tables = page_tree.find_all("table", class_="roundy sortable")
table = tables[0]

rows = table.find_all("tr")
rows = rows[1:]

fish = []
for row in rows:
    cells = row.find_all("td")
    f = {
        "name": cells[0].contents[1].contents[0],
        "image": cells[1].contents[1].attrs["href"],
        "price": int(cells[2].contents[0].strip()),
        "location": cells[3].contents[0].strip(),
        "shadow_size": cells[4].contents[0].strip(),
        "time": cells[5].contents[1].text
    }

    # piranha's date format fucks everything up, just add time/months by hand
    if f["name"] == "Piranha":
        f["time"] = [0, 1, 2, 3, 9, 10, 11, 12, 13, 14, 15, 21, 22, 23]
        f["months"] = [5, 6, 7]
        # f["rarity"] =
        fish.append(f)
        continue

    # convert time to list of hours
    if f["time"] == "All day":
        f["time"] = list(range(24))
    else:
        time = "".join(f["time"].split(" ")).split("-")
        for i in range(2):
            match = re.fullmatch(r"([0-9]{1,2})(AM|PM)", time[i])
            if match.group(2) == "AM":
                time[i] = int(match.group(1))
            else:
                time[i] = (int(match.group(1)) + 12) % 24

        f["time"] = []
        hr = time[0]
        while hr != time[1]:
            f["time"].append(hr)
            hr = (hr + 1) % 24

    # convert month cells to list
    f["months"] = []
    for i in range(6, 18):
        if cells[i].text.strip() == "✓":
            f["months"].append(i - 6)

    fish.append(f)

with open("fish.json", "w") as file:
    json.dump(fish, file)