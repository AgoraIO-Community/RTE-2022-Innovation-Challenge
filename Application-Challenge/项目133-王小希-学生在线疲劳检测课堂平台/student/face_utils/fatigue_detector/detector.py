import cv2
import time
from matplotlib import pyplot as plt
import numpy as np

'''
检测器父类
    实现功能: 
    1）该检测器是一个视频人脸检测器：能够通过videoStream视频流对象，利用其内置的sendFrame方法，获取待检测的帧序列集合，
    videoStream对detector传递帧序列集合的过程是对用户透明的。
    2）检测器父类提供一个图片人脸关键点检测接口(getLandmark(self,frame))
'''
class Detector:

    def __init__(self):
        pass

    def getlargest_face(self,dets):
        if len(dets) == 1:
            return 0

        face_areas = [abs(det[0] - det[2]) * abs(det[1] - det[3]) for det in dets]

        largest_area = face_areas[0]
        largest_index = 0
        for index in range(1, len(dets)):
            if face_areas[index] > largest_area:
                largest_index = index
                largest_area = face_areas[index]

        print("largest_face index is {} in {} faces".format(largest_index, len(dets)))

        return largest_index