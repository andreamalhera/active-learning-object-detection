import pymongo

client = pymongo.MongoClient('mongodb://localhost:27017/')
db = client.database
collections = ["human", "machine"]

for collection in collections:
	if collection not in db.collection_names():
		db.create_collection(collection)
		

#Delete a database:
#db.drop_collection(collection)


printcollections(db)
#get_human()
#post_human()