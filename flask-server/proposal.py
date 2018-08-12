import os
import sys
import logging
import numpy as np
import tensorflow as tf
from PIL import Image
from object_detection.utils import ops as utils_ops
from object_detection.utils import label_map_util
from object_detection.utils import visualization_utils as vis_util

class ProposalObject:
    def __init__(self):
        self.PATH_TO_GRAPH = '/media/sinksar/Ubuntu/random/frozen_inference_graph.pb'
        self.PATH_TO_LABELS = 'labels/kitti_label_map.pbtxt'
        self.NUM_CLASSES = 9
        self.detection_graph = tf.Graph()
        with self.detection_graph.as_default():
            self.od_graph_def = tf.GraphDef()
            with tf.gfile.GFile(self.PATH_TO_GRAPH, 'rb') as fid:
                self.serialized_graph = fid.read()
                self.od_graph_def.ParseFromString(self.serialized_graph)
                tf.import_graph_def(self.od_graph_def, name='')

    def load_image_into_numpy_array(self, image):
      (im_width, im_height) = image.size
      return np.array(image.getdata()).reshape((im_height, im_width, 3)).astype(np.uint8)

    def run_inference_for_images(self, image):
        with self.detection_graph.as_default():
            with tf.Session() as sess:
                ops = tf.get_default_graph().get_operations()
                all_tensor_names = {output.name for op in ops for output in op.outputs}
                tensor_dict = {}
                for key in ['num_detections', 'detection_scores','detection_classes']:
                    tensor_name = key + ':0'
                    if tensor_name in all_tensor_names:
                        tensor_dict[key] = tf.get_default_graph().get_tensor_by_name(tensor_name)

                image_tensor = tf.get_default_graph().get_tensor_by_name('image_tensor:0')

                # Run inference
                output_dict = sess.run(tensor_dict,
                                       feed_dict={image_tensor: np.expand_dims(image, 0)})

                # all outputs are float32 numpy arrays, so convert types as appropriate
                output_dict['num_detections'] = int(output_dict['num_detections'][0])
                output_dict['detection_classes'] = output_dict['detection_classes'][0].astype(np.uint8)
                output_dict['detection_scores'] = output_dict['detection_scores'][0]
                data = {"detection_score": output_dict['detection_scores'].tolist(), "label": output_dict['detection_classes'].tolist()}
                return data

    def getProposal(self, image):
        image_np = self.load_image_into_numpy_array(image)
        output_dict_array = self.run_inference_for_images(image_np)
        print(output_dict_array)
        return output_dict_array
