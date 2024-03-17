import os
import yaml
from pathlib import Path

# 获取当前脚本所在目录
script_dir = os.path.dirname(os.path.abspath(__file__))

def convert_phone_data(data):
    # 转换单个数据项
    transformed_data = {
        'name': data['basic']['organization'],
        'phone': [f'{{number: "{number}", label: "" }}' for number in data['basic']['cellPhone']]
    }

    if 'url' in data['basic']:
        transformed_data['website'] = [f'{{url: "{data["basic"]["url"]}", label: "" }}']
    
    return transformed_data

def process_directory(directory_path):
    directory = Path(os.path.join(script_dir, directory_path))
    
    for file_path in directory.glob('**/*.yaml'):  
        with open(file_path, 'r', encoding='utf-8') as f:
            content = yaml.safe_load(f)
            converted_content = convert_phone_data(content)

        # 将转换后的数据写入临时字符串
        yaml_str = yaml.dump(converted_content, default_flow_style=False, allow_unicode=True)
        # 去除phone和website条目中的单引号
        yaml_str = yaml_str.replace("'", "")

        # 直接在原路径下以原文件名覆盖写回转换后的数据
        with open(file_path, 'w', encoding='utf-8') as out_file:
            out_file.write(yaml_str)

process_directory('yellowpage_data')