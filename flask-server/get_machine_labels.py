import itertools
import json
import tensorflow as tf
from object_detection.core import standard_fields
from object_detection.inference import detection_inference
from object_detection.utils import dataset_util
import os
from PIL import Image
import io

INFERENCE_GRAPH ='/media/sinksar/Ubuntu/classifier/frozen_inference_graph.pb'


def getProposal(image, sourceID):
   tf.logging.set_verbosity(tf.logging.INFO)
   im = image
   width, height = im.size
   detection_score = []
   source_id = sourceID
   label_list = []
   with tf.gfile.GFile(source_id, 'rb') as fid:
       encoded_png = fid.read()
   encoded_png_io = io.BytesIO(encoded_png)

   feature_dict = {
       'image/source_id': dataset_util.bytes_feature(source_id.encode('utf8')),
       'image/encoded': dataset_util.bytes_feature(encoded_png),
       'image/object/class/label': dataset_util.int64_list_feature(label_list),
       'image/format': dataset_util.bytes_feature('png'.encode('utf8'))
   }
   proposalRecord = tf.train.Example(features=tf.train.Features(feature=feature_dict))

   with tf.Session() as sess:
       inference_graph = INFERENCE_GRAPH
       tf.logging.info('Reading graph and building model...')
       (detected_boxes_tensor, detected_scores_tensor,
        detected_labels_tensor) = detection_inference.build_inference_graph(inference_graph)
       sess.run(tf.local_variables_initializer())
       tf.train.start_queue_runners()
       try:
           tf_example = detection_inference.infer_detections_and_add_to_example(serialized_example_tensor, detected_boxes_tensor, detected_scores_tensor, detected_labels_tensor, False)
           source_id = str(tf_example.features.feature['image/source_id'].bytes_list.value[0].decode())
           data = {
             "source_id": source_id,
             "format": str(tf_example.features.feature['image/format'].bytes_list.value[0].decode()),
             "detection_score": str(tf_example.features.feature[standard_fields.TfExampleFields.detection_score].float_list.value),
             "label": str(tf_example.features.feature[standard_fields.TfExampleFields.detection_class_label].int64_list.value) }
       except tf.errors.OutOfRangeError:
           tf.logging.info('Finished processing records')
   return data
