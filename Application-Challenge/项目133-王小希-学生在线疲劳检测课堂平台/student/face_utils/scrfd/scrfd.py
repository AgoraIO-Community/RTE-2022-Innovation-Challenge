'''SCRFD模型人脸定位'''
import sys
import os
from pathlib import Path
curPath = os.path.abspath(os.path.dirname(__file__))

import cv2
import onnxruntime
import argparse
import numpy as np
from PIL import Image

#模型 https://github.com/hpc203/scrfd-opencv
class SCRFD():

    def __init__(self, onnxmodel, confThreshold=0.5, nmsThreshold=0.5):
        # onnxmodel = curPath + "/" + onnxmodel
        # onnxmodel = Path(curPath).name + "/" + onnxmodel   #打包时用项目路径
        onnxmodel = "face_utils/scrfd/" + onnxmodel   #打包时用项目路径
        self.inpWidth = 640
        self.inpHeight = 640
        self.confThreshold = confThreshold
        self.nmsThreshold = nmsThreshold
        # self.net = cv2.dnn.readNet(onnxmodel)  #对于SCRFD模型，使用原生的onnx比dnn快了10帧： 20:10
        print(f"SCRFD: {onnxruntime.get_device()}")
        self.ort_sess = onnxruntime.InferenceSession(onnxmodel,providers=['CPUExecutionProvider'])  #onnx加载推理模型
        # self.ort_sess = onnxruntime.InferenceSession(onnxmodel,providers=['CUDAExecutionProvider', 'CPUExecutionProvider'])  # Create inference session using ort.InferenceSession
        self.keep_ratio = True
        self.fmc = 3
        self._feat_stride_fpn = [8, 16, 32]
        self._num_anchors = 2

    def resize_image(self, srcimg):
        padh, padw, newh, neww = 0, 0, self.inpHeight, self.inpWidth
        if self.keep_ratio and srcimg.shape[0] != srcimg.shape[1]:
            hw_scale = srcimg.shape[0] / srcimg.shape[1]
            if hw_scale > 1:
                newh, neww = self.inpHeight, int(self.inpWidth / hw_scale)
                img = cv2.resize(srcimg, (neww, newh), interpolation=cv2.INTER_AREA)
                padw = int((self.inpWidth - neww) * 0.5)
                img = cv2.copyMakeBorder(img, 0, 0, padw, self.inpWidth - neww - padw, cv2.BORDER_CONSTANT,
                                         value=0)  # add border
            else:
                newh, neww = int(self.inpHeight * hw_scale) + 1, self.inpWidth
                img = cv2.resize(srcimg, (neww, newh), interpolation=cv2.INTER_AREA)
                padh = int((self.inpHeight - newh) * 0.5)
                img = cv2.copyMakeBorder(img, padh, self.inpHeight - newh - padh, 0, 0, cv2.BORDER_CONSTANT, value=0)
        else:
            img = cv2.resize(srcimg, (self.inpWidth, self.inpHeight), interpolation=cv2.INTER_AREA)
        return img, newh, neww, padh, padw

    def distance2bbox(self, points, distance, max_shape=None):
        x1 = points[:, 0] - distance[:, 0]
        y1 = points[:, 1] - distance[:, 1]
        x2 = points[:, 0] + distance[:, 2]
        y2 = points[:, 1] + distance[:, 3]
        if max_shape is not None:
            x1 = x1.clamp(min=0, max=max_shape[1])
            y1 = y1.clamp(min=0, max=max_shape[0])
            x2 = x2.clamp(min=0, max=max_shape[1])
            y2 = y2.clamp(min=0, max=max_shape[0])
        return np.stack([x1, y1, x2, y2], axis=-1)

    def distance2kps(self, points, distance, max_shape=None):
        preds = []
        for i in range(0, distance.shape[1], 2):
            px = points[:, i % 2] + distance[:, i]
            py = points[:, i % 2 + 1] + distance[:, i + 1]
            if max_shape is not None:
                px = px.clamp(min=0, max=max_shape[1])
                py = py.clamp(min=0, max=max_shape[0])
            preds.append(px)
            preds.append(py)
        return np.stack(preds, axis=-1)

    def detect_faces(self, srcimg):

        print("is detecting face")
        '''
        :param srcimg: 输入人脸图片 cv2
        :return: 返回人脸图片的边界框集合 type=list([x1,y1,x2,y2,confidence],[x1,y1,x2,y2,confidence]....)
        '''
        dets = []
        img, newh, neww, padh, padw = self.resize_image(srcimg)
        blob = cv2.dnn.blobFromImage(img, 1.0 / 128, (self.inpWidth, self.inpHeight), (127.5, 127.5, 127.5), swapRB=True)
        # Sets the input to the network
        # self.net.setInput(blob)

        # Runs the forward pass to get output of the output layers
        # outs = self.net.forward(self.net.getUnconnectedOutLayersNames())
        # inference output

        # inferenceSession
        print("inference started")
        outs = self.ort_sess.run(None, {'images': blob})
        scores_list, bboxes_list, kpss_list = [], [], []
        for idx, stride in enumerate(self._feat_stride_fpn):
            # cv2.dnn
            # scores = outs[idx * self.fmc][0]
            # bbox_preds = outs[idx * self.fmc + 1][0] * stride
            # kps_preds = outs[idx * self.fmc + 2][0] * stride

            #在FPN中获取同一尺度的特征图
            scores = outs[idx][0]
            bbox_preds = outs[idx + 3][0] * stride
            kps_preds = outs[idx + 6][0] * stride

            height = blob.shape[2] // stride
            width = blob.shape[3] // stride
            anchor_centers = np.stack(np.mgrid[:height, :width][::-1], axis=-1).astype(np.float32)
            anchor_centers = (anchor_centers * stride).reshape((-1, 2))
            if self._num_anchors > 1:
                anchor_centers = np.stack([anchor_centers] * self._num_anchors, axis=1).reshape((-1, 2))

            pos_inds = np.where(scores >= self.confThreshold)[0]
            bboxes = self.distance2bbox(anchor_centers, bbox_preds)
            pos_scores = scores[pos_inds]
            pos_bboxes = bboxes[pos_inds]
            scores_list.append(pos_scores)
            bboxes_list.append(pos_bboxes)

            kpss = self.distance2kps(anchor_centers, kps_preds)
            # kpss = kps_preds
            kpss = kpss.reshape((kpss.shape[0], -1, 2))
            pos_kpss = kpss[pos_inds]
            kpss_list.append(pos_kpss)

        scores = np.vstack(scores_list).ravel()
        # bboxes = np.vstack(bboxes_list) / det_scale
        # kpss = np.vstack(kpss_list) / det_scale
        bboxes = np.vstack(bboxes_list)
        kpss = np.vstack(kpss_list)
        bboxes[:, 2:4] = bboxes[:, 2:4] - bboxes[:, 0:2]
        ratioh, ratiow = srcimg.shape[0] / newh, srcimg.shape[1] / neww
        bboxes[:, 0] = (bboxes[:, 0] - padw) * ratiow
        bboxes[:, 1] = (bboxes[:, 1] - padh) * ratioh
        bboxes[:, 2] = bboxes[:, 2] * ratiow
        bboxes[:, 3] = bboxes[:, 3] * ratioh
        kpss[:, :, 0] = (kpss[:, :, 0] - padw) * ratiow
        kpss[:, :, 1] = (kpss[:, :, 1] - padh) * ratioh
        indices = cv2.dnn.NMSBoxes(bboxes.tolist(), scores.tolist(), self.confThreshold, self.nmsThreshold)

        #将bboxes,scores封装到dets中
        for i in indices:
            # i = i[0]
            # xmin, ymin, xamx, ymax = int(bboxes[i, 0]), int(bboxes[i, 1]), int(bboxes[i, 0] + bboxes[i, 2]), int(bboxes[i, 1] + bboxes[i, 3])
            # cv2.rectangle(srcimg, (xmin, ymin), (xamx, ymax), (0, 0, 255), thickness=2)

            # 绘制5个关键点
            # for j in range(5):
            #     cv2.circle(srcimg, (int(kpss[i, j, 0]), int(kpss[i, j, 1])), 1, (0,255,0), thickness=-1)

            # 绘制分数
            # cv2.putText(srcimg, str(np.round(scores[i], 3)), (xmin, ymin - 10), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), thickness=1)

            temp = [int(bboxes[i, 0]), int(bboxes[i, 1]) ,int(bboxes[i, 0] + bboxes[i, 2]), int(bboxes[i, 1] + bboxes[i, 3]), np.round(scores[i], 3)]
            dets.append(temp)

        return [dets]

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--imgpath', type=str, default='img/selfie.jpg', help='image path')
    parser.add_argument('--onnxmodel', default='scrfd_500m_kps.onnx', type=str, choices=['weights/scrfd_500m_kps.onnx', 'weights/scrfd_2.5g_kps.onnx', 'weights/scrfd_10g_kps.onnx'], help='onnx model')
    parser.add_argument('--confThreshold', default=0.5, type=float, help='class confidence')
    parser.add_argument('--nmsThreshold', default=0.5, type=float, help='nms iou thresh')
    args = parser.parse_args()

    detector = SCRFD(args.onnxmodel, confThreshold=args.confThreshold, nmsThreshold=args.nmsThreshold)

    # cv2_img = cv2.imread("database/Jackie/Jackie1.jpg")
    img = Image.open(r"database/Jackie/Jackie1.jpg")
    cv2_img = cv2.cvtColor(np.asarray(img),cv2.COLOR_RGB2BGR)
    # dets = detector.detect_faces(img)[0]  #获得人脸
    dets = detector.detect_faces(cv2_img)[0]  #获得人脸

    for det in dets:
        x1, y1, x2, y2,_ = det
        x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
        #绘制人脸边框
        cv2.rectangle(cv2_img, (x1,y1), (x2,y2), color=(0,0,255), thickness=2)  # 目标的bbox

    PIL_img = Image.fromarray(cv2.cvtColor(cv2_img, cv2.COLOR_BGR2RGB))
    PIL_img.show()