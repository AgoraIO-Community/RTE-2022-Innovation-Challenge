import yaml  #pip install PyYAML

def load_yaml(load_path):
    """load yaml file"""
    with open(load_path, 'rb') as f:
        loaded = yaml.load(f, Loader=yaml.Loader)

    return loaded

if __name__ == '__main__':
    cfg = load_yaml("detect_config.yaml")
    print(cfg)