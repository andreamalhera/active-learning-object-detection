import json, os, datetime, hashlib
from PIL import Image


path_images = 'images/'
path_annotations = 'annotations/'
path_jsons = 'jsons/'

data = {'human':[]}

for pic in os.scandir(path_images):
    #insert metadta from image
    pillow_image = Image.open(path_images + pic.name)
    dict_per_image = {}

    dict_per_image["image/filename"] = pic.name
    dict_per_image["image/format"] = pillow_image.format
    dict_per_image["image/height"] = pillow_image.size[1]
    dict_per_image["image/key/sha256"] = str(241)+'baecb2f8f53c980479d7de9ffbc99286213513bfa7b04568672b0685f90bd'

    #get annotations:
    annotation_file_name = pic.name[:-3]+'txt'
    annotation_file = open(path_annotations+annotation_file_name)
    content = annotation_file.read()
    content = content.split('\n')

    type = []

    twod_bbox_left = []
    twod_bbox_top = []
    twod_bbox_right = []
    twod_bbox_bottom = []

    #append rois to metadata
    for roi in content:
      sub_roi = roi.split(' ')

      try:
        type.append(sub_roi[0])
        twod_bbox_left.append(float(sub_roi[4]))
        twod_bbox_top.append(float(sub_roi[5]))
        twod_bbox_right.append(float(sub_roi[6]))
        twod_bbox_bottom.append(float(sub_roi[7]))

      except: KeyError

      #random mapping from labels to integers
      for elem in type:
        if elem == 'Truck':
          type[type.index(elem)] = 1
        elif elem == 'Car':
          type[type.index(elem)] = 2
        elif elem == 'Cyclist':
          type[type.index(elem)] = 3
        elif elem == 'DontCare': #'DontCare' labels denote regions in which objects have not been labeled,
          # for example because they have been too far away from the laser scanner
          type[type.index(elem)] = 0
        elif elem == 'Van':
          type[type.index(elem)] = 5
        elif elem == 'Pedestrian':
          type[type.index(elem)] = 6
        elif elem == 'Person_sitting':
          type[type.index(elem)] = 7
        elif elem == 'Tram':
          type[type.index(elem)] = 8
        elif elem == 'Misc': #Sonstiges
          type[type.index(elem)] = 9
        else:
          type[type.index(elem)] = 4

    dict_per_image["image/object/bbox/xmax"] = twod_bbox_right
    dict_per_image["image/object/bbox/xmin"] = twod_bbox_left
    dict_per_image["image/object/bbox/ymax"] = twod_bbox_top
    dict_per_image["image/object/bbox/ymin"] = twod_bbox_bottom

    dict_per_image["image/object/class/label"] = type
    dict_per_image["image/source_id"] = path_images+pic.name
    dict_per_image["image/width"] = pillow_image.size[0]
    data['human'].append(dict_per_image)

with open('human.json', "w") as write_file:
    json.dump(data, write_file)


