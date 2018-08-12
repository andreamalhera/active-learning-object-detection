import pymongo

if __name__ == '__main__':
    client = pymongo.MongoClient()
    db = client.database #connect to database
    #all_files = db.human.find() #creates a cursor; change to unlabeled to machine or human
    filename = db.human.find({}, {'filename':1})
    #filename = db.human.find_one({: "/home/sinksar/Schreibtisch/BigData/newImages/SSDB01598.JPG"})
    #print(filename['image/filename'])
    
    for my_file in filename:
        for k, v in my_file.items():
            print(k, v)

        print('')