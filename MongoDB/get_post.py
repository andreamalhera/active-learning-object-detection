from pymongo import MongoClient
import json
from urllib.request import urlopen
from bson import json_util



def printdatabases():
	print('[',end='');print(*client.database_names(), sep=', ', end='');print(']')

def printcollections(database):
	print('[',end='');print(*db.collection_names(), sep=', ', end='');print(']')


def get_human():
	human = db.human
	myurl = "http://localhost:5000/rois/"
	response = urlopen(myurl)
	data = json_util.loads(response.read())

	result = human.insert_one(data)
	print('One post: {0}'.format(result.inserted_id))


def post_human():

# TO-DO
	posts = db.human.find()
	#print(scotts_posts)
	for post in posts:
	    print(post)