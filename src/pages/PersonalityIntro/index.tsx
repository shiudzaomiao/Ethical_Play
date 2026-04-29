import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PersonalityIntro.css';

const personalityTypes = [
  {
    code: 'PRTV',
    name: '守望者',
    tags: ['公众利益', '原则性', '技术前瞻', '远见'],
    desc: '你将公众安全视为最高准则，坚守工程伦理红线，时刻关注技术对人类未来的深远影响。',
    color: '#7c3aed'
  },
  {
    code: 'OSTD',
    name: '捍卫者',
    tags: ['组织忠诚', '务实', '规则导向', '效率'],
    desc: '你是组织最可靠的支柱，在现有规则框架内追求极致的执行力与项目交付。',
    color: '#3b82f6'
  },
  {
    code: 'PSHV',
    name: '治愈者',
    tags: ['人文关怀', '公众福祉', '灵活性', '愿景'],
    desc: '在宏大的工程中融入人文温度，善于根据复杂局势灵活调整，以人为本是你的核心逻辑。',
    color: '#10b981'
  },
  {
    code: 'ORHD',
    name: '调和者',
    tags: ['组织平衡', '人文核心', '实干', '规则'],
    desc: '擅长在组织利益与团队人文关怀之间寻找平衡点，是工程团队中不可或缺的粘合剂。',
    color: '#f59e0b'
  },
  {
    code: 'PRTH',
    name: '理想家',
    tags: ['原则', '技术', '人文', '公众'],
    desc: '追求技术完美的理想主义者，坚信工程应该服务于人类的情感与尊严。',
    color: '#ec4899'
  },
  {
    code: 'OSTR',
    name: '督察员',
    tags: ['组织', '原则', '技术', '实干'],
    desc: '严格执行组织流程，对技术细节有着近乎偏执的精确要求，是质量的终极守门员。',
    color: '#64748b'
  },
  {
    code: 'PSTV',
    name: '开拓者',
    tags: ['公众', '权变', '技术', '远见'],
    desc: '敢于打破陈规以保护公众利益，通过技术创新解决复杂的社会化工程难题。',
    color: '#06b6d4'
  },
  {
    code: 'OSHV',
    name: '协调官',
    tags: ['组织', '权变', '人文', '远见'],
    desc: '具备极强的大局观，能灵活协调各方资源，在保证组织利益的同时兼顾长远的人文影响。',
    color: '#8b5cf6'
  },
  {
    code: 'PRDV',
    name: '策略家',
    tags: ['原则', '实干', '公众', '远见'],
    desc: '深谋远虑的工程指挥官，在坚守公众安全原则的基础上，通过务实的手段推动长远目标的实现。',
    color: '#ef4444'
  },
  {
    code: 'OHTV',
    name: '外交家',
    tags: ['人文', '技术', '组织', '远见'],
    desc: '擅长通过沟通与人文关怀解决技术争议，为组织构建具有前瞻性的工程文化。',
    color: '#f97316'
  },
  {
    code: 'PRHD',
    name: '奉献者',
    tags: ['原则', '人文', '公众', '实干'],
    desc: '脚踏实地的原则守护者，在每一个工程细节中默默践行着对公众和生命的尊重。',
    color: '#14b8a6'
  },
  {
    code: 'OSTV',
    name: '分析师',
    tags: ['组织', '技术', '实干', '远见'],
    desc: '以数据和技术指标为核心，为组织构建稳健且具有前瞻性的工程解决方案。',
    color: '#6366f1'
  },
  {
    code: 'PSRD',
    name: '实践家',
    tags: ['公众', '原则', '人文', '实干'],
    desc: '在工程现场解决实际问题的先锋，用坚定的原则和人文关怀保障每一个环节的公众安全。',
    color: '#fbbf24'
  },
  {
    code: 'ORTH',
    name: '建筑师',
    tags: ['组织', '技术', '人文', '原则'],
    desc: '追求工程美学与组织规范的统一，在冰冷的技术架构中搭建温暖的人文桥梁。',
    color: '#a855f7'
  },
  {
    code: 'PSHD',
    name: '守护人',
    tags: ['公众', '人文', '权变', '实干'],
    desc: '最灵活的现场保护者，能根据突发状况迅速调整方案，以最务实的方式保障人的生命安全。',
    color: '#22c55e'
  },
  {
    code: 'OSTD',
    name: '执行官',
    tags: ['组织', '原则', '实干', '技术'],
    desc: '绝对的行动派，在组织规则和技术标准的指引下，以极高的效率完成每一项工程使命。',
    color: '#475569'
  }
];

const PersonalityIntro: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="personality-intro-container">
      <div className="top-nav">
        <button onClick={() => navigate('/ai-scenario/select-role')} className="back-btn">← 返回角色选择</button>
        <h1 className="page-title">E-MBTI 人格图鉴</h1>
      </div>

      <div className="intro-grid">
        {personalityTypes.map((type, index) => (
          <div key={index} className="personality-card" style={{ '--type-color': type.color } as React.CSSProperties}>
            <div className="card-header">
              <span className="type-code">{type.code}</span>
              <h3 className="type-name">{type.name}</h3>
            </div>
            <div className="type-tags">
              {type.tags.map((tag, tIndex) => (
                <span key={tIndex} className="tag">{tag}</span>
              ))}
            </div>
            <p className="type-desc">{type.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonalityIntro;
