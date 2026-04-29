import NavBar from '../../components/NavBar';
import './index.css';
import { useEffect, useRef } from 'react';

const Knowledge = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 加载Three.js库
    const loadThreeJS = () => {
      return new Promise((resolve) => {
        if (window.THREE) {
          resolve(window.THREE);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.min.js';
        script.onload = () => {
          const orbitScript = document.createElement('script');
          orbitScript.src = 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/controls/OrbitControls.js';
          orbitScript.onload = () => {
            resolve(window.THREE);
          };
          document.head.appendChild(orbitScript);
        };
        document.head.appendChild(script);
      });
    };

    loadThreeJS().then((THREE) => {
      const nodes = [
        // 基础理论层（红色）
        { id: 1, label: "工程与伦理本质", type: "basic", color: 0xe74c3c },
        { id: 2, label: "四大伦理立场", type: "basic", color: 0xe74c3c },
        { id: 3, label: "功利论", type: "basic", color: 0xe74c3c },
        { id: 4, label: "义务论", type: "basic", color: 0xe74c3c },
        { id: 5, label: "契约论", type: "basic", color: 0xe74c3c },
        { id: 6, label: "德性论", type: "basic", color: 0xe74c3c },
        { id: 7, label: "工程伦理问题特点", type: "basic", color: 0xe74c3c },
        { id: 8, label: "历史性", type: "basic", color: 0xe74c3c },
        { id: 9, label: "社会性", type: "basic", color: 0xe74c3c },
        { id: 10, label: "复杂性", type: "basic", color: 0xe74c3c },
        { id: 11, label: "工程伦理教育目标", type: "basic", color: 0xe74c3c },
        { id: 12, label: "培养伦理意识", type: "basic", color: 0xe74c3c },
        { id: 13, label: "掌握伦理规范", type: "basic", color: 0xe74c3c },
        { id: 14, label: "提升伦理决策能力", type: "basic", color: 0xe74c3c },

        // 核心原则层（橙色）
        { id: 15, label: "核心原则层", type: "core", color: 0xf39c12 },
        { id: 16, label: "工程风险、安全与责任", type: "core", color: 0xf39c12 },
        { id: 17, label: "技术因素风险", type: "core", color: 0xf39c12 },
        { id: 18, label: "环境因素风险", type: "core", color: 0xf39c12 },
        { id: 19, label: "人为因素风险", type: "core", color: 0xf39c12 },
        { id: 20, label: "风险伦理评估原则", type: "core", color: 0xf39c12 },
        { id: 21, label: "以人为本", type: "core", color: 0xf39c12 },
        { id: 22, label: "预防为主", type: "core", color: 0xf39c12 },
        { id: 23, label: "整体主义", type: "core", color: 0xf39c12 },
        { id: 24, label: "制度约束", type: "core", color: 0xf39c12 },
        { id: 25, label: "工程价值、利益与公正", type: "core", color: 0xf39c12 },
        { id: 26, label: "经济价值", type: "core", color: 0xf39c12 },
        { id: 27, label: "社会价值", type: "core", color: 0xf39c12 },
        { id: 28, label: "生态价值", type: "core", color: 0xf39c12 },
        { id: 29, label: "利益分配不公", type: "core", color: 0xf39c12 },
        { id: 30, label: "邻避效应", type: "core", color: 0xf39c12 },
        { id: 31, label: "公正实现原则", type: "core", color: 0xf39c12 },
        { id: 32, label: "分配公正", type: "core", color: 0xf39c12 },
        { id: 33, label: "补偿公正", type: "core", color: 0xf39c12 },
        { id: 34, label: "程序公正", type: "core", color: 0xf39c12 },
        { id: 35, label: "工程环境伦理", type: "core", color: 0xf39c12 },
        { id: 36, label: "人类中心主义", type: "core", color: 0xf39c12 },
        { id: 37, label: "生态中心主义", type: "core", color: 0xf39c12 },
        { id: 38, label: "人与自然和谐", type: "core", color: 0xf39c12 },
        { id: 39, label: "可持续发展", type: "core", color: 0xf39c12 },
        { id: 40, label: "工程师环境责任", type: "core", color: 0xf39c12 },

        // 职业规范层（绿色）
        { id: 41, label: "工程师职业伦理", type: "profession", color: 0x27ae60 },
        { id: 42, label: "工程职业特征", type: "profession", color: 0x27ae60 },
        { id: 43, label: "专业性", type: "profession", color: 0x27ae60 },
        { id: 44, label: "社会性", type: "profession", color: 0x27ae60 },
        { id: 45, label: "责任性", type: "profession", color: 0x27ae60 },
        { id: 46, label: "核心伦理规范", type: "profession", color: 0x27ae60 },
        { id: 47, label: "公众安全优先", type: "profession", color: 0x27ae60 },
        { id: 48, label: "忠诚责任", type: "profession", color: 0x27ae60 },
        { id: 49, label: "社会责任", type: "profession", color: 0x27ae60 },
        { id: 50, label: "环境责任", type: "profession", color: 0x27ae60 },
        { id: 51, label: "职业美德", type: "profession", color: 0x27ae60 },
        { id: 52, label: "诚信", type: "profession", color: 0x27ae60 },
        { id: 53, label: "正直", type: "profession", color: 0x27ae60 },
        { id: 54, label: "审慎", type: "profession", color: 0x27ae60 },
        { id: 55, label: "担当", type: "profession", color: 0x27ae60 },
        { id: 56, label: "伦理冲突应对", type: "profession", color: 0x27ae60 },
        { id: 57, label: "雇主与公众利益平衡", type: "profession", color: 0x27ae60 },
        { id: 58, label: "技术追求与伦理底线", type: "profession", color: 0x27ae60 },

        // 实践应用层（蓝色）
        { id: 59, label: "实践应用层", type: "practice", color: 0x3498db },
        { id: 60, label: "土木工程伦理", type: "practice", color: 0x3498db },
        { id: 61, label: "水利工程伦理", type: "practice", color: 0x3498db },
        { id: 62, label: "化学工程伦理", type: "practice", color: 0x3498db },
        { id: 63, label: "核工程伦理", type: "practice", color: 0x3498db },
        { id: 64, label: "信息大数据伦理", type: "practice", color: 0x3498db },
        { id: 65, label: "环境工程伦理", type: "practice", color: 0x3498db },
        { id: 66, label: "生物医药伦理", type: "practice", color: 0x3498db },
        { id: 67, label: "水资源公正配置", type: "practice", color: 0x3498db },
        { id: 68, label: "移民补偿", type: "practice", color: 0x3498db },
        { id: 69, label: "安全伦理与知情权", type: "practice", color: 0x3498db },
        { id: 70, label: "数据隐私保护", type: "practice", color: 0x3498db },

        // 决策方法层（紫色）
        { id: 71, label: "决策方法层", type: "decision", color: 0x9b59b6 },
        { id: 72, label: "问题辨识", type: "decision", color: 0x9b59b6 },
        { id: 73, label: "区分伦理与法律问题", type: "decision", color: 0x9b59b6 },
        { id: 74, label: "处理原则", type: "decision", color: 0x9b59b6 },
        { id: 75, label: "人道主义", type: "decision", color: 0x9b59b6 },
        { id: 76, label: "社会公正", type: "decision", color: 0x9b59b6 },
        { id: 77, label: "人与自然和谐", type: "decision", color: 0x9b59b6 },
        { id: 78, label: "实践思路", type: "decision", color: 0x9b59b6 },
        { id: 79, label: "结合原则与情境", type: "decision", color: 0x9b59b6 },
        { id: 80, label: "多方协商", type: "decision", color: 0x9b59b6 },
        { id: 81, label: "修正规范", type: "decision", color: 0x9b59b6 },
        { id: 82, label: "建立保障制度", type: "decision", color: 0x9b59b6 }
      ];

      const links = [
        // 基础理论层内部连接
        { source: 1, target: 2 },
        { source: 2, target: 3 }, { source: 2, target: 4 }, { source: 2, target: 5 }, { source: 2, target: 6 },
        { source: 1, target: 7 },
        { source: 7, target: 8 }, { source: 7, target: 9 }, { source: 7, target: 10 },
        { source: 1, target: 11 },
        { source: 11, target: 12 }, { source: 11, target: 13 }, { source: 11, target: 14 },

        // 基础理论 -> 核心原则
        { source: 1, target: 16 }, { source: 1, target: 25 }, { source: 1, target: 35 },
        { source: 7, target: 20 },
        { source: 11, target: 20 },

        // 核心原则层内部连接
        { source: 16, target: 17 }, { source: 16, target: 18 }, { source: 16, target: 19 },
        { source: 16, target: 20 },
        { source: 20, target: 21 }, { source: 20, target: 22 }, { source: 20, target: 23 }, { source: 20, target: 24 },
        { source: 25, target: 26 }, { source: 25, target: 27 }, { source: 25, target: 28 },
        { source: 25, target: 29 }, { source: 25, target: 30 }, { source: 25, target: 31 },
        { source: 31, target: 32 }, { source: 31, target: 33 }, { source: 31, target: 34 },
        { source: 35, target: 36 }, { source: 35, target: 37 },
        { source: 35, target: 38 }, { source: 35, target: 39 }, { source: 35, target: 40 },

        // 核心原则 -> 职业规范
        { source: 16, target: 41 }, { source: 25, target: 41 }, { source: 35, target: 41 },
        { source: 20, target: 46 },
        { source: 21, target: 47 }, { source: 47, target: 46 },

        // 职业规范层内部连接
        { source: 41, target: 42 },
        { source: 42, target: 43 }, { source: 42, target: 44 }, { source: 42, target: 45 },
        { source: 41, target: 46 },
        { source: 46, target: 47 },
        { source: 46, target: 48 }, { source: 46, target: 49 }, { source: 46, target: 50 },
        { source: 41, target: 51 },
        { source: 51, target: 52 }, { source: 51, target: 53 }, { source: 51, target: 54 }, { source: 51, target: 55 },
        { source: 41, target: 56 },
        { source: 56, target: 57 }, { source: 56, target: 58 },

        // 职业规范 -> 实践应用
        { source: 41, target: 59 },
        { source: 41, target: 60 }, { source: 41, target: 61 }, { source: 41, target: 62 },
        { source: 41, target: 63 }, { source: 41, target: 64 }, { source: 41, target: 65 }, { source: 41, target: 66 },
        { source: 61, target: 67 }, { source: 61, target: 68 },
        { source: 63, target: 69 },
        { source: 64, target: 70 },

        // 实践应用 -> 决策方法
        { source: 59, target: 71 },
        { source: 59, target: 72 }, { source: 59, target: 74 }, { source: 59, target: 78 },
        { source: 72, target: 73 },
        { source: 74, target: 75 }, { source: 74, target: 76 }, { source: 74, target: 77 },
        { source: 78, target: 79 }, { source: 78, target: 80 }, { source: 78, target: 81 }, { source: 78, target: 82 },

        // 决策方法 -> 基础理论（循环完善）
        { source: 71, target: 1 },

        // 核心原则与决策方法关联
        { source: 20, target: 74 }, { source: 31, target: 76 }, { source: 38, target: 77 },
        { source: 38, target: 77 }
      ];

      // 使用容器尺寸
      const width = container.clientWidth;
      const height = container.clientHeight;

      // 场景初始化
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1a1a2e);

      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.set(0, 0, 150);
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);

      // 清除之前可能存在的渲染器
      const existingRenderer = container.querySelector('canvas');
      if (existingRenderer) {
        existingRenderer.remove();
      }

      container.appendChild(renderer.domElement);

      const controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;

      const nodeGroup = new THREE.Group();
      scene.add(nodeGroup);

      const nodeObjects = [];

      // 分层布局 - 调整y坐标使整体居中
      const layerConfigs = {
        basic: { y: 40, radius: 50, color: 0xe74c3c },
        core: { y: 10, radius: 70, color: 0xf39c12 },
        profession: { y: -10, radius: 50, color: 0x27ae60 },
        practice: { y: -40, radius: 50, color: 0x3498db },
        decision: { y: -70, radius: 40, color: 0x9b59b6 }
      };

      const layoutNodes = nodes.map((node, index) => {
        const config = layerConfigs[node.type] || { y: 0, radius: 40 };
        const angle = (index / nodes.length) * Math.PI * 2;
        const r = config.radius + (Math.random() - 0.5) * 20;

        return {
          ...node,
          x: Math.cos(angle) * r,
          y: config.y + (Math.random() - 0.5) * 10,
          z: Math.sin(angle) * r,
          vx: 0, vy: 0, vz: 0
        };
      });

      // 力导向布局优化
      function simulateLayout() {
        const iterations = 30;
        const repulsionStrength = 500;
        const attractionStrength = 0.08;
        const damping = 0.85;
        const centerY = 0;

        for (let i = 0; i < iterations; i++) {
          // 节点间斥力
          for (let j = 0; j < layoutNodes.length; j++) {
            for (let k = j + 1; k < layoutNodes.length; k++) {
              const dx = layoutNodes[j].x - layoutNodes[k].x;
              const dy = layoutNodes[j].y - layoutNodes[k].y;
              const dz = layoutNodes[j].z - layoutNodes[k].z;
              const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.1;

              const force = repulsionStrength / (distance * distance);
              const fx = (dx / distance) * force;
              const fy = (dy / distance) * force;
              const fz = (dz / distance) * force;

              layoutNodes[j].vx += fx; layoutNodes[j].vy += fy; layoutNodes[j].vz += fz;
              layoutNodes[k].vx -= fx; layoutNodes[k].vy -= fy; layoutNodes[k].vz -= fz;
            }
          }

          // 连线引力
          links.forEach(link => {
            const source = layoutNodes.find(n => n.id === link.source);
            const target = layoutNodes.find(n => n.id === link.target);
            if (source && target) {
              const dx = target.x - source.x;
              const dy = target.y - source.y;
              const dz = target.z - source.z;
              const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.1;

              const force = (distance - 15) * attractionStrength;
              const fx = (dx / distance) * force;
              const fy = (dy / distance) * force;
              const fz = (dz / distance) * force;

              source.vx += fx; source.vy += fy; source.vz += fz;
              target.vx -= fx; target.vy -= fy; target.vz -= fz;
            }
          });

          // 层间引力（让同层节点聚集）
          const layers = {};
          layoutNodes.forEach(node => {
            if (!layers[node.type]) layers[node.type] = [];
            layers[node.type].push(node);
          });

          Object.values(layers).forEach(layer => {
            const avgX = layer.reduce((sum, n) => sum + n.x, 0) / layer.length;
            const avgY = layer.reduce((sum, n) => sum + n.y, 0) / layer.length;
            const avgZ = layer.reduce((sum, n) => sum + n.z, 0) / layer.length;

            layer.forEach(node => {
              node.vx += (avgX - node.x) * 0.02;
              node.vy += (avgY - node.y) * 0.02;
              node.vz += (avgZ - node.z) * 0.02;
            });
          });

          // 更新位置
          layoutNodes.forEach(node => {
            node.vx *= damping; node.vy *= damping; node.vz *= damping;
            node.x += node.vx; node.y += node.vy; node.z += node.vz;

            const maxRange = 60;
            node.x = Math.max(-maxRange, Math.min(maxRange, node.x));
            node.y = Math.max(-maxRange, Math.min(maxRange, node.y));
            node.z = Math.max(-maxRange, Math.min(maxRange, node.z));
          });
        }
      }

      simulateLayout();

      // 创建节点
      layoutNodes.forEach(node => {
        const geometry = new THREE.SphereGeometry(2.5, 32, 32);
        const material = new THREE.MeshStandardMaterial({
          color: node.color,
          emissive: node.color,
          emissiveIntensity: 0.4,
          metalness: 0.4,
          roughness: 0.3,
          transparent: true,
          opacity: 0.95
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(node.x, node.y, node.z);
        sphere.userData = node;
        nodeGroup.add(sphere);
        nodeObjects.push(sphere);

        // 文字标签
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 384;
        canvas.height = 96;
        context.fillStyle = '#ffffff';
        context.font = 'bold 16px Microsoft YaHei';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(node.label, 192, 48);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(node.x + 5, node.y, node.z);
        sprite.scale.set(15, 3.75, 1);
        nodeGroup.add(sprite);
      });

      // 创建连线
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x666666, transparent: true, opacity: 0.5 });
      links.forEach(link => {
        const sourceNode = layoutNodes.find(n => n.id === link.source);
        const targetNode = layoutNodes.find(n => n.id === link.target);

        if (sourceNode && targetNode) {
          const points = [];
          points.push(new THREE.Vector3(sourceNode.x, sourceNode.y, sourceNode.z));
          points.push(new THREE.Vector3(targetNode.x, targetNode.y, targetNode.z));

          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const line = new THREE.Line(geometry, lineMaterial);
          nodeGroup.add(line);
        }
      });

      // 光源
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.0);
      directionalLight1.position.set(1, 1, 1);
      scene.add(directionalLight1);

      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight2.position.set(-1, -1, -1);
      scene.add(directionalLight2);

      // 添加点光源增加氛围
      const pointLight = new THREE.PointLight(0xf39c12, 0.5, 200);
      pointLight.position.set(0, 0, 0);
      scene.add(pointLight);

      // 鼠标交互
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      const tooltip = document.getElementById('tooltip');

      function onMouseMove(event) {
        const rect = container.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(nodeObjects);

        if (intersects.length > 0) {
          const node = intersects[0].object.userData;
          tooltip.style.display = 'block';
          tooltip.style.left = event.clientX + 15 + 'px';
          tooltip.style.top = event.clientY + 15 + 'px';
          tooltip.innerHTML = `<strong>${node.label}</strong><br/><small>类型: ${node.type}</small>`;
        } else {
          tooltip.style.display = 'none';
        }
      }

      window.addEventListener('mousemove', onMouseMove);

      // 使用ResizeObserver监听容器尺寸变化
      const resizeObserver = new ResizeObserver(() => {
        const w = container.clientWidth;
        const h = container.clientHeight;

        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      });

      resizeObserver.observe(container);

      // 动画循环
      function animate() {
        requestAnimationFrame(animate);
        controls.update();

        // 让点光源轻微脉动
        const time = Date.now() * 0.001;
        pointLight.intensity = 0.5 + Math.sin(time) * 0.1;

        renderer.render(scene, camera);
      }

      animate();

      // 清理函数
      return () => {
        resizeObserver.disconnect();
        window.removeEventListener('mousemove', onMouseMove);
        container.removeChild(renderer.domElement);
      };
    });
  }, []);

  return (
    <div className="knowledge-page">
      <NavBar />
      <div className="graph-container" ref={mountRef} />
      <div id="info">
        <h3>工程伦理知识关系图</h3>
        <p> 拖动旋转  |  滚轮缩放</p>
        <p> 放大查看详细信息</p>
      </div>
      <div id="legend">
        <h4>📚 图例</h4>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#e74c3c', color: '#e74c3c' }}></div>
          <span>基础理论层</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#f39c12', color: '#f39c12' }}></div>
          <span>核心原则层</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#27ae60', color: '#27ae60' }}></div>
          <span>职业规范层</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#3498db', color: '#3498db' }}></div>
          <span>实践应用层</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#9b59b6', color: '#9b59b6' }}></div>
          <span>决策方法层</span>
        </div>
      </div>
      <div id="tooltip"></div>
    </div>
  );
};

export default Knowledge;
