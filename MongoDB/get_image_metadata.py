import pymongo

if __name__ == '__main__':
    '''
    get metadata of a given image
    '''
    filename = 'stadt.jpg' #insert image name

    client = pymongo.MongoClient()
    db = client.database #connect to database
    unlabeled = db.unlabeled  #collection --> can be changed to machine or human

    get_metadata = unlabeled.find_one({'filename':filename})

    for k, v in get_metadata.items(): #prints mtadata as key-value-pair
        print(k, v)

