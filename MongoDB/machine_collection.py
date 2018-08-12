import pymongo, json
from bson import Binary, Code
from bson.json_util import dumps

if __name__ == '__main__':
    '''
    inserts JSON from tf into collection machine
    '''
    client = pymongo.MongoClient()
    db = client.database #connect to database
    machine = db.machine  #new collection
    unlabeled = db.unlabeled
    input = 'example.json'

    page = open(input, 'r')
    parsed = json.loads(page.read())


    #print(parsed['rois'][0]['id'])
    #insert in machine and delete from unlabeled
    machine.insert(parsed)

    filename = parsed['filename']
    deleted = unlabeled.delete_one({'filename': filename})



