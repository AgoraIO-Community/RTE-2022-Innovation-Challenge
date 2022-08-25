import unittest
from face_utils.scrfd.scrfd import SCRFD
from face_utils.landmark_mbv2.detector import Detector
from face_utils.fatigue_detector.head_detector import HeadDetector_real
from face_utils.fatigue_detector.mouth_detector import MouthDetector_real
from face_utils.fatigue_detector.eye_Detector import EyeDetector_real
from face_utils.fatigue_detector.brow_detector import BrowDetector_real
from face_utils.fatigue_detector.causalModel.causal_infer import CausalInferModel_real
from face_utils.yaml_load import load_yaml
from util.detect_queue import FaceState_Queue
from util.detect_queue import FatigueState_Queue
import cv2
import leancloud
from face_utils.fatigue_detector.fatigue_detector import FatigueDetector

appId = 'Kllqq69T39mWeIal2XBwKXPF-9Nh9j0Va'  # leancloud appId
appKey = 'yMUsQLDQlvoYTjpXOKQ2Spmt'  # leancloud appKey
masterKey = 'WQv6PpmfgNYiDVczr5shUvIc'  # leancloud masterKey
leancloud.init(app_id = appId, master_key = masterKey)

chatroom_id = '628ced73033caa54ba649f11'   #房间id
username = 'Sarah'  #用户名

front_face_threshold = 5  #头部姿态正脸校准阈值
eyes_ratio_threshold = 1.2  #大的EAR与小的EAR的比值
estimate_param_isSaved = False  #校准参数是否已保存

def repr(faceState):
    print(f'chatroom_id = {faceState.get("chatroom_id")}, '
          f'username = {faceState.get("username")}, '
          f'face_state = {faceState.get("face_state")}, '
          f'fatigue_state = {faceState.get("fatigue_state")}, '
          f'EAR_estimate = {faceState.get("EAR_estimate")}, '
          f'BAR_estimate = {faceState.get("BAR_estimate")}')

'''判断是否为正脸'''
def is_front_face(pitch,roll,ratio):
    '''
    :param pitch:
    :param roll:
    :param ratio:
    :return: 返回是否为正脸，左右眼是否对称
    '''
    symmetry_state = False
    if (ratio < eyes_ratio_threshold):  # 左右眼对称
        symmetry_state = True
        if (abs(pitch) < front_face_threshold and abs(roll) < front_face_threshold):  #旋转点头动作幅度较小
            return True,symmetry_state
    return False,symmetry_state

'''用队列来缓存检测到的帧，如果该队列中所有检测结果都一样的，则标记为该类别，否则标记为正常类别'''

class MyTest(unittest.TestCase):
    ''''''
    '''模拟学生进行疲劳自检'''
    def test_save_face_state(self):

        onnxPath = "scrfd_500m_kps.onnx"
        cfgPath = "detect_config.yaml"
        fatigueStrategyPath = "fatigue_strategies.txt"

        scrfd_model = SCRFD(onnxPath)
        detector = Detector()  # 初始化mbv2人脸关键点检测器
        headDetector = HeadDetector_real()   #头部姿态检测器
        eyeDetector = EyeDetector_real()  #人眼检测器
        browDetector = BrowDetector_real()  #眉毛检测器
        mouthDetector = MouthDetector_real()  #眉毛检测器

        # 模型配置文件加载
        cfg = load_yaml(cfgPath)
        # 暂时只适用于单个人脸检测（如果要检测多个人脸，需要为每个ID分配一个检测器）
        AVG_FPS = cfg["AVG_FPS"]
        eyeDetector.TIMEWINDOW_LENGTH = int(
            round(cfg["PERCLOS_time_window_length"] * AVG_FPS / 30))  # 修改PERCLOS_time_window_length
        mouthDetector.TW_length = int(round(cfg["FOM_TIMEWINDOW_LENGTH"] * AVG_FPS / 30))  # 修改FOM_TIMEWINDOW_LENGTH
        headDetector.NODDING_WINDOW_LENGTH = int(
            round(cfg["nodding_window_length"] * AVG_FPS / 30))  # 修改nodding_window_length
        headDetector.FRONT_BEHIND_WL = int(round(cfg["front_behind_WL"] * AVG_FPS / 30))  # 修改front_behind_WL

        causalInferModel = CausalInferModel_real(fatigueStrategyPath)   #因果推理模型
        fatigueDetector = FatigueDetector(cfg,detector,eyeDetector,browDetector,mouthDetector,headDetector,causalInferModel)   #疲劳检测器

        global estimate_param_isSaved

        camera = cv2.VideoCapture(0)

        # while(camera.isOpened() ):
        query = leancloud.Query("Face_detection")
        query.equal_to("chatroom_id", chatroom_id)
        query.equal_to("username", username)
        faceState = None
        try:
            faceState = query.first()
        except:  #没有找到，则创建新的对象
            FaceState = leancloud.Object.extend("Face_detection")
            faceState = FaceState()
            faceState.set("chatroom_id", chatroom_id)
            faceState.set("username", username)

        faceState_queue = FaceState_Queue(size=20)  # 人脸检测队列, 每20帧一次更新
        fatigueState_queue = FatigueState_Queue(size=30)  # 人脸检测队列, 每30帧一次更新
        EAR_estimate = 0  #校准正脸下的EAR值
        BAR_estimate = 0  #校准正脸下的BAR值
        while(camera.isOpened()):
            ret,frame = camera.read()
            if(ret):
                dets = scrfd_model.detect_faces(frame)[0]

                face_state_el = 0  #face_state_el初始化为无人脸
                fatigue_state_el = 0  #fatigue_state_el初始化为警觉
                if(len(dets) != 0):
                    largest_face_index = eyeDetector.getlargest_face(dets)  #获取最大人脸

                    det = dets[largest_face_index]

                    landmark = detector.detect_landmarks(frame, [[det]])

                    ''' 正脸校准: pitch，roll阈值判断，左右眼大小判断'''
                    pitch, roll, _ = headDetector.get_pitch_roll_yaw(detector, frame, dets, landmark)  # 头部姿态
                    #左右眼EAR
                    left_EAR = eyeDetector.getEAR(landmark[0][0])
                    right_EAR = eyeDetector.get_right_EAR(landmark[0][0])
                    #左右眉BAR
                    left_BAR = browDetector.get_BAR(landmark[0][0])
                    right_BAR = browDetector.get_right_BAR(landmark[0][0])

                    max_EAR, min_EAR = max(left_EAR, right_EAR), min(left_EAR, right_EAR)
                    ratio = (max_EAR / min_EAR)
                    flag, symmetry_state = is_front_face(pitch,roll,ratio)

                    # 如果为正脸
                    if(flag):
                        '''Step1、先判断校准参数是否已保存'''
                        if (estimate_param_isSaved == False):
                            EAR_estimate = (left_EAR + right_EAR) / 2
                            BAR_estimate = (left_BAR + right_BAR) / 2
                            faceState.set("EAR_estimate", EAR_estimate)
                            faceState.set("BAR_estimate", BAR_estimate)
                            estimate_param_isSaved = True

                        face_state_el = 2
                    else:  #非正脸
                        face_state_el = 1

                    '''Step2、疲劳检测'''
                    if(estimate_param_isSaved):
                        fatigue_state,suggest,kss_mean,fatigue_level = fatigueDetector.fatigue_detect(frame,det,landmark,EAR_estimate,BAR_estimate)
                        print(f"fatigue_state = {fatigue_state}, suggest = {suggest}")
                        cv2.putText(frame, "KSS " + str(round(kss_mean, 4)), (450, 430), cv2.FONT_HERSHEY_SIMPLEX, 1,
                                    (0, 0, 255), 2)
                        fatigue_state_el = int(fatigue_level)

                    # x1, y1, x2, y2, _ = det
                    # x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                    # # 绘制人脸边框
                    # cv2.rectangle(frame, (x1, y1), (x2, y2), color=(0, 0, 255), thickness=2)  # 目标的bbox
                    # cv2.putText(frame, "X:" + str(pitch), (60, 80), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                    # cv2.putText(frame, "Z:" + str(roll), (60, 180), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                    # cv2.putText(frame, "symmetry:" + str(symmetry_state), (60, 120), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                    # cv2.putText(frame, "left_BAR:" + str(left_BAR), (60, 240), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                    # cv2.putText(frame, "right_BAR:" + str(right_BAR), (60, 300), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

                else:  # 未检测到人脸
                    face_state_el = 0

                faceState_queue.insert(face_state_el,faceState)  #利用队列，间歇性地将人脸状态数据更新到云端
                fatigueState_queue.insert(fatigue_state_el,faceState)  #利用队列，间歇性地将人脸疲劳状态数据更新到云端

            cv2.imshow("res", frame)
            cv2.waitKey(15)

        cv2.destroyAllWindows()
        camera.release()

    '''模拟老师监视学生的学习状态'''
    def test_face_state_display(self):
        query = leancloud.Query("Face_detection")
        query.equal_to("chatroom_id", chatroom_id)
        students_face_state = None
        try:
            students_face_state = query.find()
        except:
            pass

        if(students_face_state != None):
            for student_faceState in students_face_state:
                repr(student_faceState)

