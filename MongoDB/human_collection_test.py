import pymongo, os, datetime, hashlib
from PIL import Image


if __name__ == '__main__':
    client = pymongo.MongoClient()
    db = client.database #connect to database
    human = db.human #new collection

    path_images = 'human/images/'
    path_annotations = 'human/annotations/'

    for pic in os.scandir(path_images):
        #insert metadta from image
        pillow_image = Image.open(path_images + pic.name)
        new_document = db.unlabeled.insert_one(
            {"filename":pic.name, "path": path_images, "size": 0,
             "width": pillow_image.size[0], "height": pillow_image.size[1],
             "last-modified": datetime.datetime.utcnow()}) #"file-typ": pillow_image.format

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

        threed_bbox_height = []
        threed_bbox_width = []
        threed_bbox_length = []
        threed_bbox_x = []
        threed_bbox_y = []
        threed_bbox_z = []
        threed_bbox_rot_y = []

        #append rois to metadata
        for roi in content:
            sub_roi = roi.split(' ')
            #print(sub_roi)
            try:
                type.append(sub_roi[0])
                twod_bbox_left.append(sub_roi[4])
                twod_bbox_top.append(sub_roi[5])
                twod_bbox_right.append(sub_roi[6])
                twod_bbox_bottom.append(sub_roi[7])
                threed_bbox_height.append(sub_roi[8])
                threed_bbox_width.append(sub_roi[9])
                threed_bbox_length.append(sub_roi[10])
                threed_bbox_x.append(sub_roi[11])
                threed_bbox_y.append(sub_roi[12])
                threed_bbox_z.append(sub_roi[13])
                threed_bbox_rot_y.append(sub_roi[14])
            except: KeyError

        new_json_in_col = db.human.insert_one(
            {"height": pillow_image.size[1],
             "width": pillow_image.size[0],
             "filename":pic.name,
             "source_id": path_images+pic.name,
             "sha256":"fabd5dbb0065d689c16d3c405734df223c958953df64e9fb96af4cbda0ea3d9b",
             #"sha256":hashlib.sha256(),
             "format":pillow_image.format,
             "detection_score": 0.124,
             "last-modified": datetime.datetime.utcnow() ,
             '2d_bbox_left':twod_bbox_left,
             '2d_bbox_top':twod_bbox_top, '2d_bbox_right':twod_bbox_right, '2d_bbox_bottom':twod_bbox_bottom,
             '3d_bbox_height':threed_bbox_height, '3d_bbox_width':threed_bbox_width,
             '3d_bbox_length':threed_bbox_length, '3d_bbox_x':threed_bbox_x, '3d_bbox_y':threed_bbox_y, '3d_bbox_z':
                 threed_bbox_z, '3d_bbox_rot_y': threed_bbox_rot_y, 'label':type})#"size": pillow_image.size,



