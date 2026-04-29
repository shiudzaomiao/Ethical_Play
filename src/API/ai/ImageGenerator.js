// ImageGenerator.js - 处理角色图像生成 (使用火山引擎 Ark API)

const API_BASE = "/api/ark";

/**
 * 生成角色图像
 * @param {string} role - 角色名称
 * @param {string} [customPrompt] - 自定义提示词
 * @param {string} [refImageUrl] - 参考图 URL (图生图模式)
 * @returns {Promise<string>} - 返回生成的图像URL
 */
export async function generateRoleImage(role, customPrompt, refImageUrl) {
  const prompt = customPrompt || `一个专业的${role}角色形象插图，高质量细节，正面特写`;

  try {
    const response = await fetch(`${API_BASE}/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        ref_image_url: refImageUrl
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.data && data.data[0] && data.data[0].url) {
      // 使用后端代理解决跨域问题
      return `${API_BASE}/proxy-image?url=${encodeURIComponent(data.data[0].url)}`;
    } else {
      throw new Error('未收到有效的图像URL');
    }
  } catch (error) {
    console.error('生成图像时出错:', error);
    throw error;
  }
}

