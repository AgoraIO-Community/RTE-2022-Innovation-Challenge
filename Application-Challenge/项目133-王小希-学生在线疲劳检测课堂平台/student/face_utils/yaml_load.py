import yaml  #pip install PyYAML
import os
curPath = os.path.abspath(os.path.dirname(__file__))

def load_yaml(load_path):
    """load yaml file"""
    # load_path = curPath + "/" + load_path
    load_path = "face_utils/" + load_path
    with open(load_path, 'rb') as f:
        loaded = yaml.load(f, Loader=yaml.Loader)

    return loaded

if __name__ == '__main__':
    cfg = load_yaml("detect_config.yaml")
    print(cfg)