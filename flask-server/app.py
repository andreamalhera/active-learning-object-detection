from PIL import Image
import requests
from io import BytesIO
from flask import Flask
from flask import jsonify
from flask import request
from ast import literal_eval
from proposal import ProposalObject
from flask_pymongo import PyMongo
from collections import Counter
import calendar
import time
from flask_cors import CORS
import json
import functools
from bson.objectid import ObjectId

app = Flask(__name__)
CORS(app)
app.config['MONGO_DBNAME'] = 'activeLearningDB'
app.config['MONGO_URI'] = 'mongodb://localhost:27017/database'
mongo = PyMongo(app)
classifier = ProposalObject()
blocked_source_ids = []

@app.route('/', methods=['GET'])
def index():
    return 'test'



@app.route('/onemachine/', methods=['GET'])
def get_one_machine():
    collection_output = {}
    machineLabeled = mongo.db.machine
    o = machineLabeled.find_one(sort=[('detection_score', -1)]) #changed avg_score to detection_score
    collection_output['height'] = o['height']
    collection_output['width'] = o['width']
    collection_output['filename'] = o['filename']
    collection_output['source_id'] = o['source_id']
    collection_output['format'] = o['format']
    collection_output['sha256'] = o['sha256']
    collection_output['detection_score'] = o['detection_score']
    collection_output['bbox/xmin'] = o['bbox/xmin']
    collection_output['bbox/xmax'] = o['bbox/xmax']
    collection_output['bbox/ymin'] = o['bbox/ymin']
    collection_output['bbox/ymax'] = o['bbox/ymax']
    collection_output['label'] = o['label']
    collection_output['detection_score'] = o['detection_score']
    collection_output['localization_stability'] = o['localization_stability']
    #return jsonify({'machine': collection_output}) //funktioniert
    return jsonify(collection_output)

@app.route('/image/', methods=['GET'])
def getImage():
    img = Image.open('/home/sinksar/Schreibtisch/BigData/newImages/SSDB00001.JPG')
    return jsonify({'machine': 'test'})

@app.route('/machinelabeled/', methods=['GET'])
def get_machine():
    collection_output = []
    machineLabeled = mongo.db.machine
    for o in machineLabeled.find():
        print(o)
        collection_output.append({
            'height': o['height'],
            'width': o['width'],
            'filename': o['filename'],
            'source_id': o['source_id'],
            'format': o['format'],
            'last_modified': o['last_modified'],
            'blocked' : o['blocked'],
            'sha256': o['sha256'],
            'detection_score': o['detection_score'],
            'xMin': o['xMin'],
            'xMax': o['xMax'],
            'yMin': o['yMin'],
            'yMax': o['yMax'],
            'label': o['label'],
            'avgScore': o['avgScore'],
            'localization_stability': o['localization_stability']
        })
    return jsonify({'machine': collection_output})


@app.route('/machinelabeled/', methods=['POST'])
def create_machine():
    if Counter(request.json['table'])=='machine':
        print('not valid')
        return jsonify({'result': "Non valid table for"})
    if request.json['table']=='machine':
        databasePath = mongo.db.machine
        data = json.loads((request.json['data']))
        print(data)
        height = json.loads(data['height'])
        width = json.loads(data['width'])
        filename = (data['filename'])
        source_id = (data['source_id'])
        sha256 = (data['sha256'])
        detection_score = json.loads(data['detection_score'])
        format = (data['format'])
        last_modified = calendar.timegm(time.localtime())
        xmin = json.loads(data['bbox/xmin'])
        xmax = json.loads(data['bbox/xmax'])
        ymin = json.loads(data['bbox/ymin'])
        ymax = json.loads(data['bbox/ymax'])
        label = json.loads(data['label']),
        localization_stability = json.loads(data['localization_stability'])
        avgScore = functools.reduce(lambda x, y: x + y, detection_score) / len(detection_score)
        c = databasePath.find({'source_id': source_id}).count()
        if (c == 0):
            image_object = databasePath.insert({
                'source_id': source_id,
                'height': height,
                'width': width,
                'filename': filename,
                'last_modified': last_modified,
                'format': format,
                'sha256': sha256,
                'detection_score': detection_score,
                'xMin': xmin,
                'xMax': xmax,
                'yMin': ymin,
                'yMax': ymax,
                'label': label,
                'avgScore': avgScore,
                'blocked': False,
                'localization_stability': localization_stability
            })
            newEntry = databasePath.find_one({'_id': image_object})
            mongo.db.unlabeled.remove({'source_id': source_id})
            print(newEntry)
            output = {'success': 'Created new machineLabeled Image'}
            return jsonify({'result': output})
        else:
            return jsonify({'error': 'duplicate source-id'})
    else:
        return jsonify({'error': 'wrong JSON'})


@app.route('/unlabeled/', methods=['GET'])
def get_unlabeled():
    collection_output = []
    unlabeled = mongo.db.unlabeled
    for o in unlabeled.find():
        print(o)
        collection_output.append({
            'height': o['height'],
            'width': o['width'],
            'filename': o['filename'],
            'source_id': o['source_id'],
            'format': o['format'],
            'last_modified': o['last_modified']
        })
    return jsonify({'unlabeled': collection_output})


@app.route('/unlabeled/', methods=['POST'])
def create_unlabeled():
    if Counter(request.json['table'])=='unlabeled':
        print('not valid')
        return jsonify({'result': "Non valid table for unlabeled"})

    if request.json['table'] =='unlabeled':
        databasePath = mongo.db.unlabeled
        data = json.loads(request.json['data'])
        height = (data['image/height'])
        width = (data['image/width'])
        source_id = (data['image/source_id'])
        filename =(data['image/filename'])
        format = (data['image/format'])
        last_modified = calendar.timegm(time.localtime())
        c = databasePath.find({'source_id':source_id}).count()
        if(c==0):
            image_object = databasePath.insert({
                'source_id': source_id,
                'height': height,
                'width': width,
                'filename': filename,
                'last_modified': last_modified,
                'format': format
            })
            newEntry = databasePath.find_one({'_id': image_object})
            print(newEntry)
            output = {'success': 'Created new Unlabeled Image'}
            return jsonify({'result': output})
        else:
            print('duplicate source-id')
            return jsonify({'error': 'duplicate source-id'})
    else:
        return jsonify({'error': 'duplicate source-id'})


@app.route('/humanlabeled/', methods=['GET'])
def get_humanlabeled():
    collection_output = []
    humanlabeled = mongo.db.human
    for o in humanlabeled.find():
        print(o)
        collection_output.append({
            'image/height': o['image/height'],
            'image/width':  o['image/width'],
            'image/filename': o['image/filename'],
            'image/source_id': o['image/source_id'],
            'image/key/sha256': o['image/key/sha256'],
            'image/format': o['image/format'],
            'image/object/class/label': o['image/object/class/label'],
            'image/object/bbox/xmin': o['image/object/bbox/xmin'],
            'image/object/bbox/xmax': o['image/object/bbox/xmax'],
            'image/object/bbox/ymin': o['image/object/bbox/ymin'],
            'image/object/bbox/ymax': o['image/object/bbox/ymax']
        })
    return jsonify({'human': collection_output})


@app.route('/humanlabeled/', methods=['POST'])
def create_humanlabeled():
    databasePath = mongo.db.human
    data = (request.json)
    height = data['height']
    width = data['width']
    format = data['format']
    last_modified = calendar.timegm(time.localtime())
    filename = data['filename']
    source_id = data['source_id']
    sha256 = data['sha256']
    detection_score = data['detection_score']
    label = data['label']
    xMin = data['xMin']
    xMax = data['xMax']
    yMin = data['yMin']
    yMax = data['yMax']
    mongo.db.machine.remove({'source_id': source_id})
    image_object = databasePath.insert({
        'image/source_id': source_id,
        'image/height': height,
        'image/width': width,
        'image/filename': filename,
        'last_modified': last_modified,
        'image/format': format,
        'image/key/sha256': sha256,
        'detection_score': detection_score,
        'image/object/bbox/xmin': xMin,
        'image/object/bbox/xmax': xMax,
        'image/object/bbox/ymin': yMin,
        'image/object/bbox/ymax': yMax,
        'image/object/class/label' :label
        })
    print(image_object)
    return jsonify({'success': True})


@app.route('/getProposal/', methods=['GET'])
def get_proposals():

    path = request.args.get('path')
    coords = literal_eval(request.args.get('coords'))
    image = crop(path, coords)
    data = classifier.getProposal(image)
    print(data)
    return json.dumps(data)


def crop(image_path, coords):
    """
    @param image_path: The path to the image to edit
    @param coords: A tuple of x/y coordinates (x1, y1, x2, y2)
    @param saved_location: Path to save the cropped image
    """
    image_obj = Image.open(image_path)
    cropped_image = image_obj.crop(coords)
    return cropped_image

if __name__ == '__main__':
    app.run(debug=True)
