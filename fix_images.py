import json

# 读取JSON文件
with open('D:\\project\\1\\src\\API\\museumCases.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 定义正确的图片路径映射
image_mapping = {
    "工程安全责任缺失类": "/assets/case1.png",
    "工程数据与科研造假类": "/assets/case2.png",
    "生态环境破坏类": "/assets/case3.png",
    "公众利益与权益侵害类": "/assets/case4.png",
    "工程腐败与权力寻租类": "/assets/case5.png",
    "工程决策失误类": "/assets/case6.png",
    "知识产权与技术伦理类": "/assets/case7.png",
    "职业操守与利益冲突类": "/assets/case8.png",
    "新兴技术伦理挑战类": "/assets/case9.png",
    "一工程安全责任缺失类": "/assets/case1.png",
    "三生态环境破坏类": "/assets/case3.png",
    "七技术滥用与伦理越界类": "/assets/case7.png",
    "九跨国/跨区域工程伦理失衡类": "/assets/case9.png"
}

# 修复图片路径
fixed_count = 0
for category in data['categories']:
    category_name = category['name']
    if category_name in image_mapping:
        category['image'] = image_mapping[category_name]
        print(f"Fixed: {category_name} -> {image_mapping[category_name]}")
        fixed_count += 1

# 写入修复后的文件
with open('D:\\project\\1\\src\\API\\museumCases.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"\n图片路径修复完成！共修复 {fixed_count} 个分类")
