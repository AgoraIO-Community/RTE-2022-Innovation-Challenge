import sys
import os
from pathlib import Path
# curPath = os.path.abspath(os.path.dirname(__file__))
# rootPath = curPath
# sys.path.append(rootPath)

import numpy as np
import onnxruntime
from face_utils.landmark_mbv2.utils import (
    _face_preprocesing,
    PerspectiveNPoint
)

# 模型 https://github.com/cunjian/pytorch_face_landmark
class Detector():

    def __init__(self,landmark_model_path="landmark_detection_56_se_external.onnx"):
        '''
        :param landmark_model_path: 人脸关键点mbv2权重文件
        '''

        rootPath = "face_utils/landmark_mbv2/onnx"
        '''onnxRuntime'''
        print(onnxruntime.get_device())  #是否支持gpu，虽然打印出GPU，但不一定能使用

        self.ort_sess = onnxruntime.InferenceSession(rootPath + "/" + landmark_model_path,providers=['CUDAExecutionProvider'])  # Create inference session using ort.InferenceSession
        self.ort_sess.set_providers(['CUDAExecutionProvider'], [{'device_id': 0}])

    '''人脸关键点检测'''
    def detect_landmarks(self, frame, detected_faces):
        """
            Detect landmarks from image or video frame
            Args:
                frame (array): image array
                detected_faces (array):

            Returns:
                list: x and y landmark coordinates (1,68,2)
            """
        # check if frame is 4d

        if frame.ndim == 3:
            frame = np.expand_dims(frame, 0)
        assert frame.ndim == 4, "Frame needs to be 4 dimensions (list of images)"

        mean = np.asarray([0.485, 0.456, 0.406])
        std = np.asarray([0.229, 0.224, 0.225])
        out_size = 56

        _, height, width, _ = frame.shape

        concate_arr, len_frames_faces, bbox_list = _face_preprocesing(frame=frame, detected_faces=detected_faces,
                                                                      mean=mean, std=std, out_size=out_size,
                                                                      height=height, width=width)

        # Run through the deep leanring model
        '''onnxRuntime'''
        landmark = self.ort_sess.run(None, {'input': concate_arr.tolist()})  # 调用实例sess的run方法进行推理
        landmark = np.array(landmark)
        landmark = landmark.reshape(landmark.shape[1], -1, 2)

        landmark_results = []
        for ik in range(landmark.shape[0]):
            landmark2 = bbox_list[ik].reprojectLandmark(landmark[ik, :, :])
            landmark_results.append(landmark2)

        list_concat = []
        new_lens = np.insert(np.cumsum(len_frames_faces), 0, 0)
        for ij in range(len(len_frames_faces)):
            list_concat.append(landmark_results[new_lens[ij]:new_lens[ij + 1]])

        return list_concat

    '''头部姿态估计'''
    def detect_facepose(self,frame, detected_faces=None, landmarks=None):
        """
        Detect headposes from image or video frame
        Args:
            frame (array): image array
            landmarks (array): 人脸关键点

        Returns:
            list: x and y landmark coordinates (1,68,2)
        """
        # check if frame is 4d
        facepose_detector = PerspectiveNPoint()
        poses = facepose_detector(frame, landmarks)
        return poses

if __name__ == '__main__':
    pass
    # frame = cv2.imread("girl.jpg")
    #
    # face_model = SCRFD("scrfd_500m_kps.onnx")
    # # face_landmark_model = Detector("landmark_detection_56.onnx")
    # face_landmark_model = Detector("landmark_detection_56_se_external.onnx")
    #
    # #人脸边界框检测
    # dets = face_model.detect_faces(frame)[0]
    #
    # count = 1000
    # k = 0
    # total_time = 0
    # while(k < count):
    #     print(k)
    #     startT = time.time()
    #     if(len(dets) > 0):
    #         #人脸关键点检测
    #         landmarks = face_landmark_model.detect_landmarks(frame,[dets])
    #         landmark = landmarks[0]
    #         # 检测到人脸，绘制关键点
    #         # if (len(landmark) != 0):
    #         #     # 绘制68个关键点
    #         #     for j in range(len(landmark)):
    #         #         for i in range(68):
    #         #             cv2.circle(frame, (tuple([int(landmark[j][i][0]), int(landmark[j][i][1])])), 2, (0, 525, 0), -1, 8)
    #         # cv2.imshow("res",frame)
    #         # cv2.waitKey(0)
    #     k += 1
    #     endT = time.time()
    #     total_time += (endT - startT)
    # print(f"mean_time = {(total_time / count) * 1000} ms")
