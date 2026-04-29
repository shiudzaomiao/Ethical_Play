import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import NavBar from '../../components/NavBar';
import museumData from '../../API/museumCases.json';
import './styles.css';

// 常量定义
const SLIDE_WIDTH = 300;
const SLIDE_HEIGHT = 400;
const SLIDE_GAP = 150;
const CENTER_LIFT = 100;
const SCROLL_LERP = 0.1;
const SNAP_THRESHOLD = SLIDE_GAP * 0.3;

const SlideShow = () => {
  const sliderRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const slideElementsRef = useRef([]);

  // 状态管理
  const [scrollTarget, setScrollTarget] = useState(0);
  const [scrollCurrent, setScrollCurrent] = useState(0);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [categories, setCategories] = useState(museumData.categories);
  const [currentCategory, setCurrentCategory] = useState(museumData.categories[0]);
  const [currentCases, setCurrentCases] = useState(museumData.categories[0]?.cases || []);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const trackWidth = categories.length * SLIDE_GAP;
  const windowSize = useRef({
    width: window.innerWidth,
    height: window.innerHeight,
    centerX: window.innerWidth / 2,
    arcBaselineY: window.innerHeight * 0.4,
  });



  // 处理卡片点击
  const handleCaseClick = (caseItem) => {
    setSelectedCase(caseItem);
    setIsModalOpen(true);
  };

  // 关闭模态框
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCase(null);
  };

  // 计算单个slide的变换属性
  const computeSlideTransform = useCallback((slideIndex, scrollOffset) => {
    let wrappedOffsetX = (((slideIndex * SLIDE_GAP - scrollOffset) % trackWidth) + trackWidth) % trackWidth;
    if (wrappedOffsetX > trackWidth / 2) wrappedOffsetX -= trackWidth;

    const slideCenterX = windowSize.current.centerX + wrappedOffsetX;
    // 使用固定的参考值计算归一化距离，而不是依赖窗口宽度
    const normalizedDist = wrappedOffsetX / (SLIDE_GAP * 4);
    const absDist = Math.min(Math.abs(normalizedDist), 1);

    // 调整缩放因子，使远处的幻灯片不会太小
    const scaleFactor = Math.max(1 - absDist * 0.6, 0.4);
    const scaleWidth = SLIDE_WIDTH * scaleFactor;
    const scaleHeight = SLIDE_HEIGHT * scaleFactor;
    const centerLiftY = Math.max(1 - absDist * 1.5, 0) * CENTER_LIFT;

    return {
      x: slideCenterX - scaleWidth / 2,
      y: windowSize.current.arcBaselineY - scaleHeight / 2 - centerLiftY,
      width: scaleWidth,
      height: scaleHeight,
      zIndex: Math.round(100 - absDist * 50),
      distanceFromCenter: Math.abs(wrappedOffsetX),
    };
  }, [trackWidth]);

  // 布局所有slides
  const layoutSlides = useCallback((scrollOffset) => {
    slideElementsRef.current.forEach((slideEl, i) => {
      const { x, y, width, height, zIndex } = computeSlideTransform(i, scrollOffset);
      gsap.set(slideEl, { x, y, width, height, zIndex });
    });
  }, [computeSlideTransform]);

  // 计算吸附目标
  const computeSnapTarget = useCallback((scrollOffset) => {
    const nearestIndex = Math.round(scrollOffset / SLIDE_GAP);
    return nearestIndex * SLIDE_GAP;
  }, []);

  // 同步激活的分类
  const syncActiveCategory = useCallback((scrollOffset) => {
    const snappedOffset = computeSnapTarget(scrollOffset);
    let closestIndex = Math.round(snappedOffset / SLIDE_GAP);

    // 实现循环效果
    if (closestIndex < 0) {
      closestIndex = (closestIndex % categories.length + categories.length) % categories.length;
    } else {
      closestIndex = closestIndex % categories.length;
    }

    if (closestIndex !== activeCategoryIndex) {
      setActiveCategoryIndex(closestIndex);
      const category = categories[closestIndex];
      setCurrentCategory(category);
      setCurrentCases(category.cases);
      if (titleRef.current && category) {
        titleRef.current.textContent = category.name;
      }
      if (descriptionRef.current && category) {
        descriptionRef.current.textContent = category.description;
      }
    }
  }, [computeSnapTarget, activeCategoryIndex, categories]);

  // 动画循环
  const animate = useCallback(() => {
    let target = scrollTarget;
    const distToSnap = scrollTarget - computeSnapTarget(scrollCurrent);

    if (Math.abs(distToSnap) < SNAP_THRESHOLD && Math.abs(scrollTarget - scrollCurrent) > 1) {
      target = computeSnapTarget(scrollCurrent);
    }

    const newScrollCurrent = scrollCurrent + (target - scrollCurrent) * SCROLL_LERP;

    if (Math.abs(newScrollCurrent - scrollCurrent) > 0.5) {
      setScrollCurrent(newScrollCurrent);
      layoutSlides(newScrollCurrent);
      syncActiveCategory(newScrollCurrent);
    }

    requestAnimationFrame(animate);
  }, [scrollCurrent, scrollTarget, layoutSlides, syncActiveCategory, computeSnapTarget]);

  // 窗口大小监听
  useEffect(() => {
    const handleResize = () => {
      windowSize.current = {
        width: window.innerWidth,
        height: window.innerHeight,
        centerX: window.innerWidth / 2,
        arcBaselineY: window.innerHeight * 0.4,
      };
      layoutSlides(scrollCurrent);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [layoutSlides, scrollCurrent]);

  // 初始化slides
  useEffect(() => {
    if (!sliderRef.current) return;

    // 清空原有内容
    sliderRef.current.innerHTML = '';
    slideElementsRef.current = [];

    // 创建slide元素
    categories.forEach((category, index) => {
      const slideEl = document.createElement('div');
      slideEl.classList.add('slide');

      const imgEl = document.createElement('img');
      imgEl.src = category.image;
      slideEl.appendChild(imgEl);

      sliderRef.current?.appendChild(slideEl);
      slideElementsRef.current.push(slideEl);
    });

    // 初始布局
    layoutSlides(0);
  }, [categories, layoutSlides]);

  // 动画启动
  useEffect(() => {
    const animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [animate]);

  // 滚轮事件
  useEffect(() => {
    let wheelTimeout = null;

    const handleWheel = (e) => {
      e.preventDefault();
      setScrollTarget(prev => prev + e.deltaY * 0.5);

      if (wheelTimeout) clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(() => {
        const nearestIndex = Math.round(scrollCurrent / SLIDE_GAP);
        setScrollTarget(nearestIndex * SLIDE_GAP);
      }, 150);
    };

    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        if (wheelTimeout) clearTimeout(wheelTimeout);
        slider.removeEventListener('wheel', handleWheel);
      };
    }
  }, [scrollCurrent]);

  // 触摸事件
  useEffect(() => {
    let touchStartX = 0;
    let lastTouchX = 0;
    let lastTouchTime = Date.now();
    let velocity = 0;

    const handleTouchStart = (e) => {
      // 检查触摸目标是否是搜索框或其内部元素
      const target = e.target;
      if (target.closest('.search-container') || target.closest('.search-input')) {
        return;
      }
      touchStartX = e.touches[0].clientX;
      lastTouchX = touchStartX;
      lastTouchTime = Date.now();
    };

    const handleTouchMove = (e) => {
      // 检查触摸目标是否是搜索框或其内部元素
      const target = e.target;
      if (target.closest('.search-container') || target.closest('.search-input')) {
        return;
      }
      e.preventDefault();
      const touchCurrentX = e.touches[0].clientX;
      const now = Date.now();
      const dt = now - lastTouchTime;
      if (dt > 0) {
        velocity = (lastTouchX - touchCurrentX) / dt;
      }
      setScrollTarget(prev => prev + (touchStartX - touchCurrentX) * 1.2);
      lastTouchX = touchCurrentX;
      lastTouchTime = now;
    };

    const handleTouchEnd = () => {
      if (Math.abs(velocity) > 0.5) {
        setScrollTarget(prev => prev + velocity * 50);
      }
      // 使用函数式更新获取最新的scrollCurrent值
      setScrollTarget(prev => {
        const nearestIndex = Math.round(prev / SLIDE_GAP);
        return nearestIndex * SLIDE_GAP;
      });
    };

    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener('touchstart', handleTouchStart);
      slider.addEventListener('touchmove', handleTouchMove, { passive: false });
      slider.addEventListener('touchend', handleTouchEnd);

      return () => {
        slider.removeEventListener('touchstart', handleTouchStart);
        slider.removeEventListener('touchmove', handleTouchMove);
        slider.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, []);

  return (
    <div className="museum-container">
      <NavBar />

      <div ref={sliderRef} className="slider"></div>

      <p ref={titleRef} className="slide-title">
        {currentCategory?.name}
      </p>

      <p ref={descriptionRef} className="slide-description">
        {currentCategory?.description}
      </p>



      {/* 案例卡片展示 */}
      {currentCategory && (
        <div className="cases-container">
          <h3 className="cases-title">{currentCategory.name}案例</h3>
          <div className="cases-grid">
            {currentCases.map((caseItem, index) => (
              <div
                key={`${currentCategory.id}-${caseItem.id}`}
                className="case-card"
                onClick={() => handleCaseClick(caseItem)}
              >
                <div className="case-card-content">
                  <h4 className="case-card-title">{caseItem.title}</h4>
                  <p className="case-card-description">{caseItem.description.substring(0, 100)}...</p>
                  <div className="case-card-keywords">
                    {caseItem.keywords.slice(0, 3).map((keyword, keyIndex) => (
                      <span key={keyIndex} className="case-keyword-tag">{keyword}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 模态框 */}
      {isModalOpen && selectedCase && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>&times;</button>
            <h2 className="modal-title">{selectedCase.title}</h2>
            <p className="modal-description">{selectedCase.description}</p>
            <div className="modal-keywords">
              <h3>关键词：</h3>
              <div className="keyword-list">
                {selectedCase.keywords.map((keyword, index) => (
                  <span key={index} className="keyword-tag">{keyword}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlideShow;
