import sys
import os
from pathlib import Path
curPath = os.path.abspath(os.path.dirname(__file__))
rootPath = curPath

import numpy as np
import cv2
from scipy.spatial.transform import Rotation

# sys.path.append(rootPath)
rootPath = "face_utils/landmark_mbv2/"  #打包时用项目路径
THREED_FACE_MODEL = rootPath + "/reference_3d_68_points_trans.npy"

def _face_preprocesing(frame, detected_faces, mean, std, out_size, height, width):
    """
    NEW
    Helper function used in batch detecting landmarks
    Let's assume that frame is of shape B x H x W x 3
    """
    lenth_index = [len(ama) for ama in detected_faces]
    lenth_cumu = np.cumsum(lenth_index)

    flat_faces = [item for sublist in detected_faces for item in sublist]  # Flatten the faces

    concatenated_face = None
    bbox_list = []
    for k, face in enumerate(flat_faces):
        frame_assignment = np.where(k <= lenth_cumu)[0][0]  # which frame is it?
        x1 = face[0]
        y1 = face[1]
        x2 = face[2]
        y2 = face[3]
        w = x2 - x1 + 1
        h = y2 - y1 + 1
        size = int(min([w, h]) * 1.2)
        cx = x1 + w // 2
        cy = y1 + h // 2
        x1 = cx - size // 2
        x2 = x1 + size
        y1 = cy - size // 2
        y2 = y1 + size

        dx = max(0, -x1)
        dy = max(0, -y1)
        x1 = max(0, x1)
        y1 = max(0, y1)

        edx = max(0, x2 - width)
        edy = max(0, y2 - height)
        x2 = min(width, x2)
        y2 = min(height, y2)
        new_bbox = list(map(int, [x1, x2, y1, y2]))
        new_bbox = BBox(new_bbox)
        cropped = frame[
                  frame_assignment, new_bbox.top: new_bbox.bottom, new_bbox.left: new_bbox.right
                  ]
        bbox_list.append(new_bbox)

        if dx > 0 or dy > 0 or edx > 0 or edy > 0:
            cropped = cv2.copyMakeBorder(
                cropped,
                int(dy),
                int(edy),
                int(dx),
                int(edx),
                cv2.BORDER_CONSTANT,
                0,
            )
        cropped_face = cv2.resize(cropped, (out_size, out_size))

        if cropped_face.shape[0] <= 0 or cropped_face.shape[1] <= 0:
            continue
        test_face = cropped_face.copy()
        test_face = test_face / 255.0

        test_face = (test_face - mean) / std
        test_face = test_face.transpose((2, 0, 1))
        test_face = test_face.reshape((1,) + test_face.shape)

        if concatenated_face is None:
            concatenated_face = test_face
        else:
            concatenated_face = np.concatenate([concatenated_face, test_face], 0)

    return (concatenated_face, lenth_index, bbox_list)

def convert_to_euler(rotvec, is_rotvec=True):
    """
    Converts the rotation vector or matrix (the standard output for head pose models) into euler angles in the form
    of a ([pitch, roll, yaw]) vector. Adapted from https://github.com/vitoralbiero/img2pose.

    Args:
        rotvec: The rotation vector produced by the headpose model
        is_rotvec:

    Returns:
        np.ndarray: euler angles ([pitch, roll, yaw])
    """
    if is_rotvec:
        rotvec = Rotation.from_rotvec(rotvec).as_matrix()
    rot_mat_2 = np.transpose(rotvec)
    angle = Rotation.from_matrix(rot_mat_2).as_euler('xyz', degrees=True)
    return np.array([angle[0], -angle[2], -angle[1]])  # pitch, roll, yaw

class PerspectiveNPointModel:
    """ Class that leverages 68 2D facial landmark points to estimate head pose using the Perspective-n-Point
    algorithm.

    Code adapted from https://github.com/yinguobing/head-pose-estimation/ and
    https://github.com/lincolnhard/head-pose-estimation/. Each code base licensed under MIT Licenses, which can be
    found here: https://github.com/yinguobing/head-pose-estimation/blob/master/LICENSE and here:
    https://github.com/lincolnhard/head-pose-estimation/blob/master/LICENSE
    """

    def __init__(self):
        """ Initializes the model, with a reference 3D model (xyz coordinates) of a standard face"""
        # self.model_points = get_full_model_points(os.path.join(get_resource_path(), "3d_face_model.txt"))
        self.model_points = np.load(THREED_FACE_MODEL, allow_pickle=True)

    def predict(self, img, landmarks):
        """ Determines headpose using passed 68 2D landmarks

        Args:
            img (np.ndarray) : The cv2 image from which the landmarks were produced
            landmarks (np.ndarray) : The landmarks to use to produce the headpose estimate

        Returns:
            np.ndarray: Euler angles ([pitch, roll, yaw])
        """
        # Obtain camera intrinsics to solve PnP algorithm. These intrinsics represent defaults - users may modify this
        # code to pass their own camera matrix and distortion coefficients if they happen to have calibrated their
        # camera: https://learnopencv.com/camera-calibration-using-opencv/
        h, w = img.shape[:2]
        camera_matrix = np.array([[w + h, 0, w // 2],
                                  [0, w + h, h // 2],
                                  [0, 0, 1]], dtype='float32')
        dist_coeffs = np.zeros((4, 1), dtype='float32')  # Assuming no lens distortion

        # Solve PnP using all 68 points:
        landmarks = landmarks.astype('float32')
        _, rotation_vector, translation_vector = cv2.solvePnP(self.model_points, landmarks, camera_matrix, dist_coeffs,
                                                              flags=cv2.SOLVEPNP_EPNP)

        # Convert to Euler Angles
        euler_angles = convert_to_euler(np.squeeze(rotation_vector))

        # PnP may give values outside the range of (-90, 90), and sometimes misinterprets a face as facing
        # AWAY from the camera (since 2D landmarks do not convey whether face is facing towards or away from camera)
        # Thus, we adjust below to ensure the face is interpreted as front-facing
        euler_angles[euler_angles > 90] -= 180
        euler_angles[euler_angles < -90] += 180
        return euler_angles

class PerspectiveNPoint:

    def __init__(self):
        self.model = PerspectiveNPointModel()

    def __call__(self, frames, landmarks):
        """ Determines headpose using passed 68 2D landmarks
        Args:
            frames (np.ndarray) : A list of cv2 images from which the landmarks were produced
            landmarks (np.ndarray) : The landmarks used to produce headpose estimates

        Returns:
            np.ndarray: (num_images, num_faces, [pitch, roll, yaw]) - Euler angles (in degrees) for each face within in
                        each image
        """
        all_poses = []
        for image, image_landmarks in zip(frames, landmarks):
            poses_in_this_img = []
            for face_landmarks in image_landmarks:
                poses_in_this_img.append(self.model.predict(image, face_landmarks))
            all_poses.append(poses_in_this_img)

        return all_poses

class BBox(object):
    # https://github.com/cunjian/pytorch_face_landmark/
    # bbox is a list of [left, right, top, bottom]
    def __init__(self, bbox):
        self.left = bbox[0]
        self.right = bbox[1]
        self.top = bbox[2]
        self.bottom = bbox[3]
        self.x = bbox[0]
        self.y = bbox[2]
        self.w = bbox[1] - bbox[0]
        self.h = bbox[3] - bbox[2]

    # scale to [0,1]
    def projectLandmark(self, landmark):
        landmark_ = np.asarray(np.zeros(landmark.shape))
        for i, point in enumerate(landmark):
            landmark_[i] = ((point[0] - self.x) / self.w, (point[1] - self.y) / self.h)
        return landmark_

    # landmark of (5L, 2L) from [0,1] to real range
    def reprojectLandmark(self, landmark):
        landmark_ = np.asarray(np.zeros(landmark.shape))
        for i, point in enumerate(landmark):
            x = point[0] * self.w + self.x
            y = point[1] * self.h + self.y
            landmark_[i] = (x, y)
        return landmark_