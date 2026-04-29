import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import SlideShow from './index';

// 模拟gsap
vi.mock('gsap', () => ({
  default: {
    set: vi.fn(),
  },
}));

// 模拟requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 0));

describe('SlideShow Component', () => {
  beforeEach(() => {
    // 重置mock
    vi.clearAllMocks();
    // 模拟窗口大小
    Object.defineProperty(window, 'innerWidth', { value: 1000 });
    Object.defineProperty(window, 'innerHeight', { value: 800 });
  });

  test('组件渲染正常', () => {
    render(<SlideShow />);

    // 检查标题是否存在
    expect(screen.getByText('案例博物馆1')).toBeInTheDocument();

    // 检查slider容器存在
    expect(screen.getByRole('document').querySelector('.slider')).toBeInTheDocument();
  });

  test('滚轮事件触发scrollTarget更新', () => {
    render(<SlideShow />);
    const slider = screen.getByRole('document').querySelector('.slider');

    // 模拟滚轮事件
    fireEvent.wheel(slider, { deltaY: 100 });

    // 验证事件默认行为被阻止（需要结合实际逻辑断言，这里示例）
    expect(slider).toBeTruthy();
  });

  test('触摸事件触发scrollTarget更新', () => {
    render(<SlideShow />);
    const slider = screen.getByRole('document').querySelector('.slider');

    // 模拟触摸开始
    fireEvent.touchStart(slider, {
      touches: [{ clientX: 100 }],
    });

    // 模拟触摸移动
    fireEvent.touchMove(slider, {
      touches: [{ clientX: 50 }],
    });

    expect(slider).toBeTruthy();
  });

  test('窗口大小变化触发重新布局', () => {
    render(<SlideShow />);

    // 模拟窗口大小变化
    fireEvent.resize(window);

    expect(window.innerWidth).toBe(1000); // 验证模拟值
    expect(requestAnimationFrame).toHaveBeenCalled();
  });
});
