import json
from datetime import datetime
import os
from dotenv import load_dotenv
from scipy.stats import zscore
import pandas as pd
import numpy as np
import pymongo

# mongodb and environment file intialization/fetching

load_dotenv()

mongodb = pymongo.MongoClient(os.environ['MONGO_URI'])
databases = mongodb.list_database_names()
stats_database = mongodb["test"]
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
pkmn_data_document = stats_collection.find_one(f"{year_str}-{month_str}/chaos/gen9ou-1825.json")

# organize data into a pandas Dataframe

name_row = []
viability_col = []
usage_col = []
for pokemon in pkmn_data_document.get("data", []):
    name_row.append(pokemon)
    viability_col.append(pkmn_data_document["data"][pokemon]["Viability Ceiling"])
    usage_col.append(pkmn_data_document["data"][pokemon]["usage"])

# get viability and usage for each Pokemon

usage_df = pd.DataFrame({
   'viability': viability_col,
   'usage': usage_col
}, index=name_row)
usage_df.sort_values(by='usage', inplace=True, ascending=False)

# get top/bottom 10 Pokemon in terms of usage and determine underrated and overrated Pokemon
# based on viability and usage z-scores

# export this
top_ten_pokemon = usage_df.head(10)
bottom_ten_pokemon = usage_df.tail(10)

ou_threshold = 0.0425

usage_df['99th_gxe'] = usage_df['viability'].apply(lambda x: x[2])

usage_df['usage_z'] = zscore(usage_df['usage'])
usage_df['99th_gxe_z'] = zscore(usage_df['99th_gxe'])

usage_df['z_score difference'] = usage_df['99th_gxe_z'] - usage_df['usage_z'] 
z_score_df = usage_df[(usage_df['usage'] >= ou_threshold*0.5) & (usage_df['usage'] <= ou_threshold*1.5)].copy()
z_score_df.sort_values(by='z_score difference', inplace=True, ascending=False)

# export this
underrated = z_score_df['z_score difference'].head(10)
overrated = z_score_df['z_score difference'].tail(10)

# get top 10 items in terms of usage

item_dict = {}
for pokemon in pkmn_data_document.get("data", []):
    for item in pkmn_data_document["data"][pokemon]["Items"]:
        if (item in item_dict):
            item_dict[item] += pkmn_data_document["data"][pokemon]["Items"][item]*pkmn_data_document["data"][pokemon]["usage"]
        else:
            item_dict[item] = pkmn_data_document["data"][pokemon]["Items"][item]*pkmn_data_document["data"][pokemon]["usage"]

total_item_usage = sum(item_dict.values())

for key, value in item_dict.items():
    item_dict[key] = item_dict[key]/total_item_usage 

item_dict = list(item_dict.items())
item_dict.sort(key=lambda x: x[1], reverse=True)
top_ten_items = item_dict[:20]

# change in usage 

document_list = [pkmn_data_document]

month_int -= 1
if (month_int == 0):
    month_int = 12
    year_int -= 1
month_str = str(month_int)
if (len(month_str) < 2):
    month_str = '0' + month_str

while (stats_collection.find_one(f"{year_str}-{month_str}/chaos/gen9ou-1825.json")):
    document_list.append(stats_collection.find_one(f"{year_str}-{month_str}/chaos/gen9ou-1825.json"))
    month_int -= 1
    if (month_int == 0):
        month_int = 12
        year_int -= 1
    month_str = str(month_int)
    if (len(month_str) < 2):
        month_str = '0' + month_str
    year_str = str(year_int)

# organize data into a pandas Dataframe

historic_usage = []
for pokemon in name_row:
    historic_usage.append([])
    for document in document_list:
        if pokemon in document['data']:
            historic_usage[-1].append(document['data'][pokemon]['usage'])
        else:
            historic_usage[-1].append(None)
usage_df['historic usages'] = historic_usage

top_ev_spreads = []
for pokemon in name_row:
    spreads = list(pkmn_data_document['data'][pokemon]['Spreads'].items())
    spreads.sort(key=lambda x: x[1], reverse=True)
    total_ev_spread_usage = sum(x[1] for x in spreads)
    top_ev_spreads.append([(x[0], x[1]/total_ev_spread_usage) for x in spreads[:8]])
usage_df['top_ev_spreads'] = top_ev_spreads

top_abilities = []
for pokemon in name_row:
    abilities = list(pkmn_data_document['data'][pokemon]['Abilities'].items())
    abilities.sort(key=lambda x: x[1], reverse=True)
    total_abilities_usage = sum(x[1] for x in abilities)
    top_abilities.append([(x[0], x[1]/total_abilities_usage) for x in abilities])
usage_df['top abilities'] = top_abilities

top_moves = []
for pokemon in name_row:
    moves = list(pkmn_data_document['data'][pokemon]['Moves'].items())
    moves.sort(key=lambda x: x[1], reverse=True)
    total_move_usage = sum(x[1] for x in moves)
    top_moves.append([(x[0], x[1]/total_move_usage) for x in moves[:12]])
usage_df['top moves'] = top_moves

top_items = []
for pokemon in name_row:
    items = list(pkmn_data_document['data'][pokemon]['Items'].items())
    items.sort(key=lambda x: x[1], reverse=True)
    total_item_usage = sum(x[1] for x in items)
    top_items.append([(x[0], x[1]/total_item_usage) for x in items[:8]])
usage_df['top items'] = top_items