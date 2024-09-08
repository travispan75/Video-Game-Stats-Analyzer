import requests
from datetime import datetime
import os
from dotenv import load_dotenv
from scipy.stats import zscore
import pandas as pd
import numpy as np
import pymongo
from bs4 import BeautifulSoup

# mongodb and environment file intialization/fetching

load_dotenv()

mongodb = pymongo.MongoClient(os.environ['MONGO_URI'])
stats_database = mongodb["Pokemon_Data"]
stats_collection = stats_database["pkmnstatsschemas"]

# get correct month and year to grab the ID for the document in the mongoDB database. Loop backwards through month and year 
# until a document has been found if the current month's data has not been created yet

now = datetime.now()
month_int = now.month
month_str = now.strftime("%m")
year_int = now.year
year_str = now.strftime("%Y")
while (not stats_collection.find_one(f"{year_str}-{month_str}/chaos/gen9ou-1825.json")):
    month_int -= 1
    if (month_int == 0):
        month_int = 12
        year_int -= 1
    month_str = str(month_int)
    if (len(month_str) < 2):
        month_str = '0' + month_str
    year_str = str(year_int)
latest_month = month_int
latest_year = year_int
pkmn_data_document = stats_collection.find_one(f"{year_str}-{month_str}/chaos/gen9ou-1825.json")

# organize data into a pandas Dataframe

name_set = set()
name_row = []
viability_col = []
usage_col = []
for pokemon in pkmn_data_document.get("data", []):
    name_row.append(pokemon)
    name_set.add(pokemon)
    viability_col.append(pkmn_data_document["data"][pokemon]["Viability Ceiling"])
    usage_col.append(pkmn_data_document["data"][pokemon]["usage"])

# get viability and usage for each Pokemon

usage_df = pd.DataFrame({
   'viability': viability_col,
   'usage': usage_col
}, index=name_row)
usage_df.sort_values(by='usage', inplace=True, ascending=False)
name_row = usage_df.index.tolist()

# get top/bottom 10 Pokemon in terms of usage and determine underrated and overrated Pokemon
# based on viability and usage z-scores 

pokeAPIPkmn = "https://pokeapi.co/api/v2/pokemon/"
pokeAPISpecies = "https://pokeapi.co/api/v2/pokemon-species/"
pkmn_id = []

def getPkmnID(pokemon):
    pokemon_name = pokemon.lower().replace(' ', '-')
    response = requests.get(pokeAPIPkmn + f"{pokemon_name}/")
    if response.status_code == 200:
        response_json = response.json()
        return response_json["id"]
    else:
        pkmn_arr = pokemon.lower().split('-', 1) 
        pkmn_arr[0] = pkmn_arr[0].replace(' ', '-')
        response = requests.get(pokeAPISpecies + f"{pkmn_arr[0]}/")
        if response.status_code == 200:
            response_json = response.json() 
            forms = response_json.get("varieties", [])
            pkmn_info_url = None
            for form in forms:
                if form["is_default"]:
                    pkmn_info_url = form["pokemon"]["url"]
                else:
                    min_length = min(len(pokemon_name), len(form["pokemon"]["name"]))
                    if pokemon_name[:min_length] == form["pokemon"]["name"][:min_length]:
                        pkmn_info_url = form["pokemon"]["url"]
                        break
            if pkmn_info_url:
                response = requests.get(pkmn_info_url)
                response_json = response.json()
                return response_json["id"]
            else:
                print(pokemon_name)
                return 0
        else:
            print(pokemon_name)
            return 0
for pokemon in name_row:
    pkmn_id.append(getPkmnID(pokemon))
usage_df['ID'] = pkmn_id

top_ten_pokemon = usage_df.head(10)
bottom_ten_pokemon = usage_df.tail(10)

ou_threshold = 0.0425

usage_df['99th_gxe'] = usage_df['viability'].apply(lambda x: x[2])

usage_df['usage_z'] = zscore(usage_df['usage'])
usage_df['99th_gxe_z'] = zscore(usage_df['99th_gxe'])

usage_df['z_score difference'] = usage_df['99th_gxe_z'] - usage_df['usage_z'] 
z_score_df = usage_df[(usage_df['usage'] >= ou_threshold*0.5) & (usage_df['usage'] <= ou_threshold*1.5)].copy()
z_score_df.sort_values(by='z_score difference', inplace=True, ascending=False)

underrated = z_score_df['z_score difference'].head(10)
overrated = z_score_df['z_score difference'].tail(10)

# get top 10 items in terms of usage

item_name = {}
pkmn_items_url = "https://bulbapedia.bulbagarden.net/wiki/List_of_items_by_index_number_in_Generation_IX"
response = requests.get(pkmn_items_url)
soup = BeautifulSoup(response.content, 'html.parser')
item_rows = soup.find_all('tr')
for row in item_rows:
    item_tds = row.find_all('td')
    if len(item_tds) >= 4:
        a_tags = item_tds[3].find_all('a')
        for a in a_tags:
            item_name[a.get_text(strip=True).lower().replace('-', '').replace(' ', '')] = a.get_text(strip=True)

item_dict = {}
for pokemon in pkmn_data_document.get("data", []):
    for item in pkmn_data_document["data"][pokemon]["Items"]:
        item_key = item_name[item] if item in item_name else item
        if (item_key in item_dict):
            item_dict[item_key] += pkmn_data_document["data"][pokemon]["Items"][item]*pkmn_data_document["data"][pokemon]["usage"]
        else:
            item_dict[item_key] = pkmn_data_document["data"][pokemon]["Items"][item]*pkmn_data_document["data"][pokemon]["usage"]

total_item_usage = sum(item_dict.values())

for key, value in item_dict.items():
    item_dict[key] = item_dict[key]/total_item_usage 

item_dict = list(item_dict.items())
item_dict.sort(key=lambda x: x[1], reverse=True)
top_twenty_items = item_dict[:20]

# change in usage for each Pokemon

document_list = []

month_int = latest_month
year_int = latest_year

month_int -= 1
if (month_int == 0):
    month_int = 12
    year_int -= 1
month_str = str(month_int)
if (len(month_str) < 2):
    month_str = '0' + month_str
i = 0

while (stats_collection.find_one(f"{year_str}-{month_str}/chaos/gen9ou-1825.json") and i < 12):
    document_list.append(stats_collection.find_one(f"{year_str}-{month_str}/chaos/gen9ou-1825.json"))
    month_int -= 1
    if (month_int == 0):
        month_int = 12
        year_int -= 1
    month_str = str(month_int)
    if (len(month_str) < 2):
        month_str = '0' + month_str
    year_str = str(year_int)
    i += 1

historic_usage = []
for pokemon in name_row:
    historic_usage.append([])
    for document in document_list:
        if pokemon in document['data']:
            historic_usage[-1].append(document['data'][pokemon]['usage'])
        else:
            historic_usage[-1].append(None)
usage_df['historic usage'] = historic_usage

# additional data for each Pokemon

top_ev_spreads = []
for pokemon in name_row:
    spreads = list(pkmn_data_document['data'][pokemon]['Spreads'].items())
    spreads.sort(key=lambda x: x[1], reverse=True)
    total_ev_spread_usage = sum(x[1] for x in spreads)
    top_ev_spreads.append([(x[0], x[1]/total_ev_spread_usage) for x in spreads[:8]])
usage_df['top_ev_spreads'] = top_ev_spreads

ability_name = {}
ability_name_url = "https://pokemondb.net/ability"
response = requests.get(ability_name_url)
soup = BeautifulSoup(response.content, 'html.parser')
ability_anchors = soup.find_all('a', class_='ent-name')
for ability in ability_anchors:
    ability_name[ability.text.lower().replace('-', '').replace(' ', '')] = ability.text

top_abilities = []
for pokemon in name_row:
    abilities = list(pkmn_data_document['data'][pokemon]['Abilities'].items())
    abilities.sort(key=lambda x: x[1], reverse=True)
    total_abilities_usage = sum(x[1] for x in abilities)
    top_abilities.append([(ability_name[x[0]] if x[0] in ability_name else x[0], x[1]/total_abilities_usage) for x in abilities])
usage_df['top abilities'] = top_abilities

move_name = {}
move_name_url = "https://pokemondb.net/move/all"
response = requests.get(move_name_url)
soup = BeautifulSoup(response.content, 'html.parser')
move_anchors = soup.find_all('a', class_='ent-name')
for move in move_anchors:
    move_name[move.text.lower().replace('-', '').replace(' ', '')] = move.text

top_moves = []
for pokemon in name_row:
    moves = list(pkmn_data_document['data'][pokemon]['Moves'].items())
    moves.sort(key=lambda x: x[1], reverse=True)
    total_move_usage = sum(x[1] for x in moves)
    top_moves.append([(move_name[x[0]] if x[0] in move_name else x[0], x[1]/total_move_usage) for x in moves[:12]])
usage_df['top moves'] = top_moves

top_items = []
for pokemon in name_row:
    items = list(pkmn_data_document['data'][pokemon]['Items'].items())
    items.sort(key=lambda x: x[1], reverse=True)
    total_item_usage = sum(x[1] for x in items)
    top_items.append([(item_name[x[0]] if x[0] in item_name else x[0], x[1]/total_item_usage) for x in items[:8]])
usage_df['top items'] = top_items

top_teammates = []
for pokemon in name_row:
    teammates = list(pkmn_data_document['data'][pokemon]['Teammates'].items())
    teammates.sort(key=lambda x: x[1], reverse=True)
    total_teammate_usage = sum(x[1] for x in teammates)
    top_teammates.append([(x[0], x[1]/total_teammate_usage) for x in teammates[:8]])
usage_df['top teammates'] = top_teammates

top_teras = []
for pokemon in name_row:
    teras = list(pkmn_data_document['data'][pokemon]['Tera Types'].items())
    teras.sort(key=lambda x: x[1], reverse=True)
    total_tera_usage = sum(x[1] for x in teras)
    top_teras.append([(x[0], x[1]/total_tera_usage) for x in teras[:8]])
usage_df['top teras'] = top_teras

pkmn_types_arr = []
pkmn_stats_arr = []
for pokemon in name_row:
    pkmn_types_arr.append([])
    pkmn_stats_arr.append([])
    response = requests.get(pokeAPIPkmn + f"{usage_df.loc[pokemon, 'ID']}/")
    if response.status_code == 200:
        pokemon_info = response.json()
        pkmn_stats = pokemon_info['stats']
        for stat in pkmn_stats:
            pkmn_stats_arr[-1].append(stat['base_stat'])
        pkmn_typing = pokemon_info['types']
        for type in pkmn_typing:
            pkmn_types_arr[-1].append(type['type']['name'])
usage_df['typing'] = pkmn_types_arr
usage_df['stats'] = pkmn_stats_arr

# grab names and data for any unused Pokemon

month_int = latest_month
year_int = latest_year
month_str = str(month_int)
if (len(month_str) < 2):
    month_str = '0' + month_str
year_str = str(year_int)

unused = {}
response = requests.get(f"https://www.smogon.com/stats/{year_str}-{month_str}/gen9ou-1825.txt")
response_text = response.text
table_rows = response_text.splitlines()
for i in range(5, len(table_rows) - 1):
    unused_name = table_rows[i].split('|', 3)
    unused_name = unused_name[2].strip()
    if unused_name not in name_set:
        unused[unused_name] = {}
        unused[unused_name]["ID"] = getPkmnID(unused_name)
        response = requests.get(pokeAPIPkmn + str(unused[unused_name]["ID"])) 
        response_json = response.json()
        unused[unused_name]["abilities"] = []
        for ability in response_json['abilities']:
            unused[unused_name]["abilities"].append(ability["ability"]["name"])
        unused[unused_name]["typing"] = []
        for type in response_json["types"]:
            unused[unused_name]["typing"].append(type["type"]["name"])
        unused[unused_name]["stats"] = []
        for stat in response_json["stats"]:
            unused[unused_name]["stats"].append(stat["base_stat"])
        
# export data to the cleaneddata collection so it can be used by the frontend
usage_df_json = usage_df.to_dict(orient='index')
underrated_json = underrated.to_dict()
overrated_json = overrated.to_dict()
top_twenty_items_json = dict(top_twenty_items)
top_ten_pokemon_json = top_ten_pokemon.to_dict(orient='index')
bottom_ten_pokemon_json = bottom_ten_pokemon.to_dict(orient='index')

cleaned_data_collection = stats_database["cleaneddata"]

cleaned_data_collection.update_one(
    {"_id": f"{now.strftime('%m')}-{now.strftime('%Y')}"}, 
    {"$set": 
     {"pokemon_info": usage_df_json,
      "underrated": underrated_json, 
      "overrated": overrated_json, 
      "top_twenty_items": top_twenty_items_json, 
      "top_ten_pokemon": top_ten_pokemon_json, 
      "bottom_ten_pokemon": bottom_ten_pokemon_json,
      "unused_pokemon": unused}},
    upsert=True
)

mongodb.close()