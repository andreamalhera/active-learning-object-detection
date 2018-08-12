from __future__ import print_function
import pymongo, datetime, os
from PIL import Image  # pillow module for getting image metadata
import tensorflow as tf


flags = tf.app.flags
tf.flags.DEFINE_string('image_dir', '',
                        'Image directory.')
FLAGS = flags.FLAGS


if __name__ == '__main__':
    '''
    reads image from a folder
    inserts metadata in collection unlabeled
    '''
    client = pymongo.MongoClient()
    db = client.database #connect to database
    unlabeled = db.unlabeled  #new collection


    path = FLAGS.image_dir

    raw_images = os.scandir(path)

    for pic in raw_images:
        # print(pic.name)
        pillow_image = Image.open(path + pic.name)  # getting metadata
        # print(pillow_image.format, pillow_image.size, pillow_image.mode) #format: jpg, size: width and height,
        # mode: RGB
        # insert document in collection
        new_document = db.unlabeled.insert_one(
            {"filename":pic.name, "source_id":path+pic.name, "format":pillow_image.format,
             "sha256":"fabd5dbb0065d689c16d3c405734df223c958953df64e9fb96af4cbda0ea3d9b",
             "width": pillow_image.size[0], "height": pillow_image.size[1],
             "last-modified": datetime.datetime.utcnow()}) #"file-typ": pillow_image.format

