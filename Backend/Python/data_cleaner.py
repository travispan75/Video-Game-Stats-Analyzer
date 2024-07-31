import json
from datetime import datetime
import os
from dotenv import load_dotenv
import pandas as pd
import numpy as np
import pymongo

load_dotenv()

mongodb = pymongo.MongoClient(os.environ['MONGO_URI'])
databases = mongodb.list_database_names()
stats_database = mongodb["test"]
stats_collection = stats_database["pkmnstatsschemas"]

now = datetime.now()
month = now.strftime("%m")
year = now.strftime("%Y")
print(month)
print(year)
pkmn_data_document = stats_collection.find_one(f"{year}-{month}/chaos/gen9ou-1825.json")


