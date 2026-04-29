import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Plot.css';

interface Scene {
  id: string;
  title: string;
  background: string;
  content: string;
  choices?: { option: string; percentage: string }[];
  selectedChoice?: string;
  popup?: string;
}

interface Act {
  id: string;
  title: string;
  scenes: Scene[];
}

interface Perspective {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  acts: Act[];
}

const PREAMBLE = {
  title: '前置概念提示',
  content: '你可能从未听过"工程伦理"这个词。它不像反诈那样天天上热搜，也很少直接发生在你我身上。但当一座桥、一栋楼、一条隧道出事时，背后往往藏着一个被忽略的工程伦理问题——工程师的每一次签字、每一次"算了"，都可能在未来的某一天，压垮一个家庭。下面的故事根据真实事件改编，请你进入角色，体会那些"小决定"背后的重量。',
  background: 'src/assets/plot3.2.jpg'
};

const perspectives: Perspective[] = [
  {
    id: 'engineer',
    name: '工程师视角',
    icon: '👷',
    color: '#7c3aed',
    description: '你是张明远，25岁，助理结构工程师，入职2年。',
    acts: [
      {
        id: 'act1',
        title: '【第一幕】第一份报告',
        scenes: [
          {
            id: 'scene1',
            title: '场景：清晨，办公室',
            background: 'src/assets/plot1.1.jpg',
            content: '你叫张明远，25岁，毕业两年，从小觉得"盖大楼"很酷。',
          },
          {
            id: 'scene2',
            title: '',
            background: 'src/assets/plot1.2.jpg',
            content: '今天是你负责的"幸福里小区7号楼加装电梯"项目材料验收的日子。',
          },
          {
            id: 'scene3',
            title: '',
            background: 'src/assets/plot1.3.jpg',
            content: '供应商送来一批钢材，你按规范抽检了3根，发现其中1根的屈服强度比国家标准低了约5%——标准要求355兆帕，实测339。',
          },
          {
            id: 'scene4',
            title: '',
            background: 'src/assets/plot1.4.jpg',
            content: '同事老王凑过来："小张，这批料就这一根差点，放内墙非承重部位，没事。王总催着呢，工期耽误一天罚五万，你签字吧。"',
          },
          {
            id: 'scene5',
            title: '',
            background: 'src/assets/plot1.5.jpg',
            content: '你想起大学时有一门选修课讲过"工程师的社会责任"，当时你只觉得是考前背的考点，没想到真的会遇上。',
          },
          {
            id: 'choice1',
            title: '第一次选择',
            background: 'src/assets/plot1.6.jpg',
            content: '',
            choices: [
              { option: 'A. 坚决不同意，要求整批退回，书面报告王总', percentage: '17%' },
              { option: 'B. 只退回不合格的那根，其余继续用', percentage: '48%' },
              { option: 'C. 听老王的，签字合格，反正"就一点点"', percentage: '35%' },
            ],
            popup: '已有3,421位年轻工程师参与过类似情境，其中48%选了B，35%选了C，仅17%选了A。',
          },
          {
            id: 'scene6',
            title: '',
            background: 'src/assets/plot1.7.jpg',
            content: '你犹豫很久，选了 A。你把报告递给王总，王总拍桌子："你知不知道退回整批要停工15天？甲方会杀了我们！"',
          },
          {
            id: 'scene7',
            title: '',
            background: 'src/assets/plot1.7.jpg',
            content: '就一根稍微差点，能出什么事？我干二十年了，你教我？"',
          },
          {
            id: 'scene8',
            title: '',
            background: 'src/assets/plot1.8.jpg',
            content: '最后，公司决定只退回那一根不合格的，其余继续使用。王总让你写一份"情况说明"，承认自己"过度谨慎"。你写了。',
          },
          {
            id: 'scene9',
            title: '',
            background: 'src/assets/plot1.9.jpg',
            content: '走出办公室，你第一次觉得"坚持原则"的滋味有点苦。',
          },
        ],
      },
      {
        id: 'act2',
        title: '【第二幕】裂缝',
        scenes: [
          {
            id: 'scene1',
            title: '场景：三周后，工地',
            background: 'src/assets/plot2.1.jpg',
            content: '电梯井道建到3层，你例行巡检，发现井道侧壁有一条约0.3毫米的裂缝，位置恰好在那批"合格"钢材的区域。',
          },
          {
            id: 'scene2',
            title: '',
            background: 'src/assets/plot2.2（2）.jpg',
            content: '施工队长老刘说："正常收缩，抹点水泥就看不见了。"',
          },
          {
            id: 'scene3',
            title: '',
            background: 'src/assets/plot2.3.jpg',
            content: '你蹲下来量了量，又发现附近还有两条细缝。',
          },
          {
            id: 'scene4',
            title: '',
            background: 'src/assets/plot2.4.jpg',
            content: '你拍照发给大学同学——现在在检测机构工作的赵岩。赵岩回复："像受力裂缝，建议停工检测。"',
          },
          {
            id: 'choice2',
            title: '第二次选择',
            background: 'src/assets/plot2.4.jpg',
            content: '',
            choices: [
              { option: 'A. 立刻通知监理，要求强制停工，请第三方检测', percentage: '14%' },
              { option: 'B. 自己买回弹仪抽测，先不声张', percentage: '56%' },
              { option: 'C. 听老刘的，抹灰了事，每天多看两眼', percentage: '30%' },
            ],
            popup: '56%的年轻工程师选了B，30%选了C，仅14%选了A。',
          },
          {
            id: 'scene5',
            title: '',
            background: 'src/assets/plot2.5.jpg',
            content: '你选了 B。你自费买了个回弹仪，晚上偷偷测了10个点，发现混凝土强度也有两个点偏低。',
          },
          {
            id: 'scene6',
            title: '',
            background: 'src/assets/plot2.6.jpg',
            content: '你整理报告给监理张工。张工看一眼："小张，数据波动正常，别大惊小怪。你才毕业几年？"',
          },
          {
            id: 'scene7',
            title: '',
            background: 'src/assets/plot2.6.jpg',
            content: '你争辩，张工说："我是监理，我说没事就没事。"你把报告发给王总，王总回："知道了，继续施工。"',
          },
          {
            id: 'scene8',
            title: '',
            background: 'src/assets/plot2.2.jpg',
            content: '一周后，裂缝被水泥砂浆抹平，表面光鲜。你站在楼下，心里像压了块石头，却说不出具体是什么。',
          },
        ],
      },
      {
        id: 'act3',
        title: '【第三幕】匿名举报',
        scenes: [
          {
            id: 'scene1',
            title: '场景：深夜，出租屋',
            background: 'src/assets/plot3.1.jpg',
            content: '你在网上搜到住建局的工程质量举报平台。你的手指在鼠标上徘徊。',
          },
          {
            id: 'scene2',
            title: '',
            background: 'src/assets/plot3.2.jpg',
            content: '你想起大学那门选修课的最后一节，老师说："如果有一天，你的良心过不去，记得有一个选项叫\'吹哨人\'。但代价可能很大。"',
          },
          {
            id: 'scene3',
            title: '',
            background: 'src/assets/plot3.2.jpg',
            content: '当时你觉得这是电影台词，现在你发现它是真的。',
          },
          {
            id: 'choice3',
            title: '第三次选择',
            background: 'src/assets/plot3.3.jpg',
            content: '',
            choices: [
              { option: 'A. 实名举报，附所有证据', percentage: '8%' },
              { option: 'B. 匿名举报，不留痕迹', percentage: '20%' },
              { option: 'C. 不举报，但每天加密巡检，一旦恶化就强行叫停', percentage: '72%' },
            ],
            popup: '72%的年轻工程师选了C，20%选了B，仅8%选了A。',
          },
          {
            id: 'scene4',
            title: '',
            background: 'src/assets/plot3.4.jpg',
            content: '你选了 B。你花了一整晚写举报信，附上裂缝照片、钢材报告扫描件、回弹数据，通过匿名通道提交。',
          },
          {
            id: 'scene5',
            title: '',
            background: 'src/assets/plot2.4.jpg',
            content: '一周后，你接到一个陌生电话："张明远同志，你的举报已收到，正在调查。"你心跳。',
          },
          {
            id: 'scene6',
            title: '',
            background: 'src/assets/plot3.5.jpg',
            content: '三天后，王总把你叫进办公室："有人匿名举报咱们工地，是不是你？"你摇头。',
          },
          {
            id: 'scene7',
            title: '',
            background: 'src/assets/plot3.5.jpg',
            content: '王总冷笑："不是你最好。这个项目区里领导盯着，谁敢搅黄，我饶不了他。"',
          },
          {
            id: 'scene8',
            title: '',
            background: 'src/assets/plot3.6.jpg',
            content: '两周后，住建局来人了。抽查三个点，结论："未见明显结构性安全隐患，建议加强监测。"',
          },
          {
            id: 'scene9',
            title: '',
            background: 'src/assets/plot3.7.jpg',
            content: '你懵了——你明明测出有问题。同事悄悄告诉你，王总提前"打了招呼"。',
          },
          {
            id: 'scene10',
            title: '',
            background: 'src/assets/plot3.7.jpg',
            content: '你第一次觉得，有些事情不是"对错"就能解决的。',
          },
        ],
      },
      {
        id: 'act4',
        title: '【第四幕】暴雨前夜',
        scenes: [
          {
            id: 'scene1',
            title: '场景：事故前一天，乌云密布',
            background: 'src/assets/plot4.1.jpg',
            content: '井道已建到6层，准备浇顶层混凝土。',
          },
          {
            id: 'scene2',
            title: '',
            background: 'src/assets/plot4.2.jpg',
            content: '你爬上脚手架，发现之前的裂缝处水泥砂浆脱落，露出里面的混凝土——大面积的蜂窝和孔洞，钢筋锈迹斑斑。',
          },
          {
            id: 'scene3',
            title: '',
            background: 'src/assets/plot4.3.jpg',
            content: '你用锤子一敲，一块混凝土掉下来，钢筋锈得发黑。',
          },
          {
            id: 'scene4',
            title: '',
            background: 'src/assets/plot4.4.jpg',
            content: '你冲下脚手架，手抖着给王总打电话："必须立刻停工！井道会塌的！"',
          },
          {
            id: 'scene5',
            title: '',
            background: 'src/assets/plot4.4.jpg',
            content: '王总吼："明天就要浇筑，你让我停工？你负责？"你喊："出了人命谁负责？！"',
          },
          {
            id: 'scene6',
            title: '',
            background: 'src/assets/plot4.4.jpg',
            content: '王总沉默几秒："小张，明天照常浇筑。你要是不干，现在就滚蛋。"',
          },
          {
            id: 'choice4',
            title: '第四次选择',
            background: 'src/assets/plot4.4.jpg',
            content: '',
            choices: [
              { option: 'A. 当场辞职，并立刻报警和联系媒体', percentage: '12%' },
              { option: 'B. 先浇混凝土，同时私下联系电视台记者，准备曝光', percentage: '61%' },
              { option: 'C. 服从王总，心想"我尽力了"', percentage: '27%' },
            ],
            popup: '61%的年轻工程师选了B，27%选了C，仅12%选了A。',
          },
          {
            id: 'scene7',
            title: '',
            background: 'src/assets/plot4.5.jpg',
            content: '你选了 B。你给市电视台民生栏目打了电话，记者说需要核实，明天才能来。',
          },
          {
            id: 'scene8',
            title: '',
            background: 'src/assets/plot4.6.jpg',
            content: '混凝土泵车轰鸣了一整夜。灰色泥浆注入模板。',
          },
          {
            id: 'scene9',
            title: '',
            background: 'src/assets/plot4.7.jpg',
            content: '你站在雨中，看着，耳边仿佛听到钢筋在呻吟。凌晨三点你才回到出租屋，湿透的衣服没脱，坐了一夜。',
          },
        ],
      },
      {
        id: 'act5',
        title: '【第五幕】坍塌与反转',
        scenes: [
          {
            id: 'scene1',
            title: '场景：第二天下午2点50分',
            background: 'src/assets/plot5.1.jpg',
            content: '记者还没来。井道侧壁在混凝土自重和侧压力下，从4楼处断裂——整段结构像被折断的筷子，轰然砸向地面。',
          },
          {
            id: 'scene2',
            title: '',
            background: 'src/assets/plot5.2.jpg',
            content: '钢管、模板、混凝土块飞溅，一楼阳台被砸穿，3楼的周大爷正在阳台收衣服，当场被埋。',
          },
          {
            id: 'scene3',
            title: '',
            background: 'src/assets/plot5.3.jpg',
            content: '周大爷被抬上救护车时，已经昏迷。',
          },
          {
            id: 'scene4',
            title: '',
            background: 'src/assets/plot5.4.jpg',
            content: '三个月后，法院宣判：王总因重大责任事故罪，判7年。',
          },
          {
            id: 'scene5',
            title: '',
            background: 'src/assets/plot5.4.jpg',
            content: '监理张工受贿、玩忽职守，判3年。',
          },
          {
            id: 'scene6',
            title: '',
            background: 'src/assets/plot5.4.jpg',
            content: '你，张明远，因为有你之前的书面报告、匿名举报记录、以及事故前联系记者的通话记录，被认定"已尽到合理注意义务和报告义务"，免于刑事处罚。',
          },
          {
            id: 'scene7',
            title: '',
            background: 'src/assets/plot5.5.jpg',
            content: '但你的名字上了行业黑名单，没有公司敢录用你。你的注册结构工程师考试资格被暂停3年。',
          },
          {
            id: 'scene8',
            title: '',
            background: 'src/assets/plot5.6.jpg',
            content: '你去看守所探望王总。王总隔着玻璃说："小张，你是对的，可惜我听不进去。"',
          },
          {
            id: 'scene9',
            title: '',
            background: 'src/assets/plot5.6.jpg',
            content: '"王总，要是当初第一次就听我的，退货、停工、检测……"王总低下头，哭了。',
          },
          {
            id: 'scene10',
            title: '',
            background: 'src/assets/plot5.7.jpg',
            content: '你走出看守所，手机收到新闻："幸无死亡"——周大爷半身不遂，但没死。',
          },
          {
            id: 'scene11',
            title: '',
            background: 'src/assets/plot1.5.jpg',
            content: '你站在路边，忽然想起大学那门选修课。你当时嫌学分水，现在才明白：那门课讲的不是书本上的条条框框，而是将来你每次签字时，心里那个发抖的声音。',
          },
          {
            id: 'ending',
            title: '',
            background: 'src/assets/plot3.2.jpg',
            content: '你做了所有你能做的正确选择：拒绝签字、匿名举报、联系记者……可灾难还是发生了。但如果没有你的坚持，死的人可能不止一个。工程伦理，不是保证世界完美，而是在所有人都在装睡时，你选择做一个醒着的人。——献给每一个还在坚持的年轻工程师。',
            popup: '与你选择相同的工程师中（第一次选A，第二次选B，第三次选B，第四次选B），仅有3%的人走到了最后。他们中62%失去了工作，但97%的人不后悔。',
          },
        ],
      },
    ],
  },
  {
    id: 'victim',
    name: '受害者视角',
    icon: '👨‍🦽',
    color: '#ef4444',
    description: '你是周小禾，22岁，大三学生，独生女。',
    acts: [
      {
        id: 'act1',
        title: '【第一幕】最平常的一天',
        scenes: [
          {
            id: 'scene1',
            title: '场景：周五傍晚，学校宿舍',
            background: 'src/assets/plot2.1.1.jpg',
            content: '手机震动，是妈妈发来的语音："小禾，这周末回来不？你爸说腿好点了，想让你陪他去逛公园。"',
          },
          {
            id: 'scene2',
            title: '',
            background: 'src/assets/plot2.1.1.jpg',
            content: '你笑着回："回！我还买了你爱吃的板栗糕。"',
          },
          {
            id: 'scene3',
            title: '',
            background: 'src/assets/plot2.1.2.jpg',
            content: '你挂掉电话，心里盘算着下周是爸爸59岁生日，你省吃俭用攒了两个月的生活费，打算给他买那个他一直念叨的电动轮椅。',
          },
          {
            id: 'scene4',
            title: '',
            background: 'src/assets/plot2.1.3.jpg',
            content: '你在淘宝上把轮椅加入了购物车，价格3880元，你对着余额咬了咬牙，还是点了"存下"。',
          },
        ],
      },
      {
        id: 'act2',
        title: '【第二幕】期待中的电梯',
        scenes: [
          {
            id: 'scene1',
            title: '场景：周六早晨，家里的厨房',
            background: 'src/assets/plot2.2.1.jpg',
            content: '你推门进来，妈妈围着围裙从厨房探出头："瘦了！学校食堂是不是又涨价了？"',
          },
          {
            id: 'scene2',
            title: '',
            background: 'src/assets/plot2.2.2.jpg',
            content: '爸爸坐在客厅看报纸，腿边放着拐杖。他年轻时在机械厂干了三十年，膝盖磨损严重，最近两年上下楼越来越困难。',
          },
          {
            id: 'scene3',
            title: '',
            background: 'src/assets/plot2.2.3.jpg',
            content: '"爸，咱们楼真要加装电梯了？"你把板栗糕放在桌上，爸爸眼睛一亮："可不是嘛！昨天刚开工，轰隆隆的，吵是吵了点，但三个月后我就能下楼遛弯了。"',
          },
          {
            id: 'scene4',
            title: '',
            background: 'src/assets/plot2.2.4.jpg',
            content: '你想起回来时看到楼下搭起了脚手架，工人们正往井道里绑钢筋。',
          },
          {
            id: 'scene5',
            title: '',
            background: 'src/assets/plot2.2.5.jpg',
            content: '"这家公司正规吗？我搜搜。"你掏出手机。妈妈把一碟煎蛋推过来："正规正规，王阿姨家女婿介绍的，人家干过好几个小区了。快吃，凉了。"',
          },
          {
            id: 'choice1',
            title: '第一次选择（你的犹豫）',
            background: 'src/assets/plot2.2.5.jpg',
            content: '',
            choices: [
              { option: 'A. 坚持上网查这家公司的资质和过往项目', percentage: '10%' },
              { option: 'B. 听妈妈的话，不查了', percentage: '67%' },
              { option: 'C. 随口问一句"不会出事吧"，然后吃煎蛋', percentage: '23%' },
            ],
            popup: '与你处境相同的住户子女中，67%选择了B，23%选择了C，仅10%选择了A。',
          },
          {
            id: 'scene6',
            title: '',
            background: 'src/assets/plot2.2.5.jpg',
            content: '你点了 B。你一心想的是爸爸能下楼，没再多想。',
          },
        ],
      },
      {
        id: 'act3',
        title: '【第三幕】第一声异响',
        scenes: [
          {
            id: 'scene1',
            title: '场景：开工后第28天，周日晚上',
            background: 'src/assets/plot2.3.1.jpg',
            content: '你正要出门，忽然听到楼道里传来一声沉闷的"咔——"，像是钢筋被折弯的声音。',
          },
          {
            id: 'scene2',
            title: '',
            background: 'src/assets/plot2.3.2.jpg',
            content: '妈妈在厨房说："这施工队真是的，快晚上了还不消停。"你不放心，下楼去看。',
          },
          {
            id: 'scene3',
            title: '',
            background: 'src/assets/plot2.3.3.jpg',
            content: '井道已经建到2层，你用手电筒照了照，发现井道侧壁有一条细细的裂缝，大约30厘米长，像一条丑陋的蜈蚣趴在混凝土上。',
          },
          {
            id: 'scene4',
            title: '',
            background: 'src/assets/plot2.3.4.jpg',
            content: '你喊了一声施工队的人，叼着烟的老刘走过来："没事没事，混凝土收缩缝，明儿抹点水泥就看不见了。"',
          },
          {
            id: 'scene5',
            title: '',
            background: 'src/assets/plot2.3.5.jpg',
            content: '你拍了照片，发到业主群里。群里很快炸开："小周你别大惊小怪""我亲戚家装电梯也有裂缝""都是正常的"。',
          },
          {
            id: 'scene6',
            title: '',
            background: 'src/assets/plot2.3.5.jpg',
            content: '只有三楼的钱阿姨回了句："我瞧着不太对，要不要请人看看？"',
          },
          {
            id: 'choice2',
            title: '第二次选择（你怎么办）',
            background: 'src/assets/plot2.3.5.jpg',
            content: '',
            choices: [
              { option: 'A. 坚持要求施工方出具第三方检测报告', percentage: '9%' },
              { option: 'B. 打电话给街道办，问有没有质量监督渠道', percentage: '20%' },
              { option: 'C. 算了，大家都说没事，那应该没事吧', percentage: '71%' },
            ],
            popup: '类似情况下，71%的住户选择了C，20%选择了B，仅9%选择了A。',
          },
          {
            id: 'scene7',
            title: '',
            background: 'src/assets/plot2.3.6.jpg',
            content: '你选了 C。你把手机揣回兜里，跟妈妈说了句"没事"，坐上了回学校的公交车。',
          },
          {
            id: 'scene8',
            title: '',
            background: 'src/assets/plot2.3.7.jpg',
            content: '你在车上刷到一条短视频：某地加装电梯井道坍塌，砸死一个人。你划走了，心想"那是新闻里的事"。',
          },
        ],
      },
      {
        id: 'act4',
        title: '【第四幕】被磨平的警惕',
        scenes: [
          {
            id: 'scene1',
            title: '场景：开工后第45天',
            background: 'src/assets/plot2.4.1.jpg',
            content: '你回家拿换季衣服，一进楼道就闻到一股潮湿的水泥味。',
          },
          {
            id: 'scene2',
            title: '',
            background: 'src/assets/plot2.4.2.jpg',
            content: '你忽然想起，井道已经建到5层，但墙面有明显凸起。',
          },
          {
            id: 'scene3',
            title: '',
            background: 'src/assets/plot2.4.3.jpg',
            content: '你摸了摸，水泥下面似乎是空的。',
          },
          {
            id: 'scene4',
            title: '',
            background: 'src/assets/plot2.4.4.jpg',
            content: '你上楼，发现家里客厅的天花板墙角也出现了裂缝，细细的，从屋顶一直延伸到窗边。',
          },
          {
            id: 'scene5',
            title: '',
            background: 'src/assets/plot2.4.5.jpg',
            content: '妈妈正在往墙上贴挂历："遮住就看不见了，你爸又说没事。"',
          },
          {
            id: 'scene6',
            title: '',
            background: 'src/assets/plot2.4.5.jpg',
            content: '"你爸坐在沙发上，腿肿得老高，药快吃完了，但他坚持不去医院。""省点钱，等电梯装好了，我天天锻炼。"',
          },
          {
            id: 'scene7',
            title: '',
            background: 'src/assets/plot2.4.6.jpg',
            content: '你没有再说话。你又拍了几张照片，但没有发到群里。',
          },
          {
            id: 'choice3',
            title: '第三次选择（你内心的挣扎）',
            background: 'src/assets/plot2.4.6.jpg',
            content: '',
            choices: [
              { option: 'A. 瞒着爸妈，自己花钱请个结构工程师朋友来看一眼', percentage: '9%' },
              { option: 'B. 联合钱阿姨一起去街道办事处实名反映情况', percentage: '18%' },
              { option: 'C. 告诉自己"应该没事"，把照片存进"可能没用"的文件夹', percentage: '73%' },
            ],
            popup: '73%的住户选择了C，18%选择了B，9%选择了A。',
          },
          {
            id: 'scene8',
            title: '',
            background: 'src/assets/plot2.4.6.jpg',
            content: '你选了 C。你心想："等下次回来再说吧。"',
          },
        ],
      },
      {
        id: 'act5',
        title: '【第五幕】那个下午',
        scenes: [
          {
            id: 'scene1',
            title: '场景：事发当天，周二下午',
            background: 'src/assets/plot2.5.1.jpg',
            content: '教室里很安静，老师在讲抽样误差。你的手机调了静音，放在书包里。',
          },
          {
            id: 'scene2',
            title: '',
            background: 'src/assets/plot2.5.1.jpg',
            content: '2点40分，妈妈打了一个电话，你没接到。',
          },
          {
            id: 'scene3',
            title: '',
            background: 'src/assets/plot2.5.1.jpg',
            content: '2点45分，妈妈打了第二个，你还是没接到。',
          },
          {
            id: 'scene4',
            title: '',
            background: 'src/assets/plot2.5.1.jpg',
            content: '2点50分，妈妈打了第三个，你的手机在书包里震动，但你正埋头抄笔记。',
          },
          {
            id: 'scene5',
            title: '',
            background: 'src/assets/plot2.5.2.jpg',
            content: '2点53分，手机疯狂震动，是邻居钱阿姨。你赶紧接起来，钱阿姨声音发抖："小禾！快回来！你爸……电梯井塌了！"',
          },
          {
            id: 'scene6',
            title: '',
            background: 'src/assets/plot2.5.2.jpg',
            content: '你爸他在阳台收衣服，被掉下来的钢管砸中了！"',
          },
          {
            id: 'scene7',
            title: '',
            background: 'src/assets/plot2.5.7.jpg',
            content: '你腾地站起来，椅子倒地发出巨响。全班人都看你。你顾不上请假，冲出教室。',
          },
          {
            id: 'scene8',
            title: '',
            background: 'src/assets/plot2.5.3.jpg',
            content: '出租车上，你翻看妈妈发来的微信语音，一共13条。第一条："小禾，你爸说阳台有点晃，我害怕……"',
          },
          {
            id: 'scene9',
            title: '',
            background: 'src/assets/plot2.5.3.jpg',
            content: '第二条："小禾，楼上有东西掉下来了！你回来！你回来啊！"第三条（哭声）："……他不动了……他不动了……"',
          },
          {
            id: 'scene10',
            title: '',
            background: 'src/assets/plot2.5.4.jpg',
            content: '你手抖得打不了字，只能一遍遍听，眼泪砸在手机屏幕上。',
          },
        ],
      },
      {
        id: 'act6',
        title: '【第六幕】医院',
        scenes: [
          {
            id: 'scene1',
            title: '场景：市第一人民医院',
            background: 'src/assets/plot2.6.1.jpg',
            content: '你冲进去时，妈妈瘫坐在长椅上，浑身是血——是爸爸的血。',
          },
          {
            id: 'scene2',
            title: '',
            background: 'src/assets/plot2.6.1.jpg',
            content: '她认不出你，只是重复一句话："我不该同意装电梯……我不该……"',
          },
          {
            id: 'scene3',
            title: '',
            background: 'src/assets/plot2.6.3.jpg',
            content: '你找到医生。医生说："伤者胸椎爆裂性骨折，脊髓损伤，下肢完全瘫痪。头部也有外伤，有脑出血迹象，需要开颅减压。"',
          },
          {
            id: 'scene4',
            title: '',
            background: 'src/assets/plot2.6.3.jpg',
            content: '你的腿发软，扶着墙问："能治好吗？"医生沉默了两秒："要看康复情况，但走路……基本不可能了。"',
          },
          {
            id: 'scene5',
            title: '',
            background: 'src/assets/plot2.6.4.jpg',
            content: '你冲进ICU，隔着玻璃看到爸爸。他脸上全是擦伤，嘴唇发紫，身上插满了管子，呼吸机一起一伏。',
          },
          {
            id: 'scene6',
            title: '',
            background: 'src/assets/plot2.6.4.jpg',
            content: '他的左手露在被子外面，那只手曾经在你小时候把你举过头顶，现在指甲缝里全是泥和血。',
          },
          {
            id: 'scene7',
            title: '',
            background: 'src/assets/plot2.6.5.jpg',
            content: '你趴在玻璃上，哭不出声。',
          },
        ],
      },
      {
        id: 'act7',
        title: '【第七幕】家，已经不再是家',
        scenes: [
          {
            id: 'scene1',
            title: '场景：事故发生三天后',
            background: 'src/assets/plot2.7.1.jpg',
            content: '天花板上的裂缝更大了，像一张咧开的嘴。墙上贴的挂历被撕掉了，露出发黑的霉斑。',
          },
          {
            id: 'scene2',
            title: '',
            background: 'src/assets/plot2.7.2.jpg',
            content: '窗户外，电梯井的废墟被围挡遮住，但能看见扭曲的钢筋像死掉的藤蔓。',
          },
          {
            id: 'scene3',
            title: '',
            background: 'src/assets/plot2.7.3.jpg',
            content: '你去街道办事处，工作人员态度很好，但两手一摊："我们没有执法权，建议你们走司法程序。"',
          },
          {
            id: 'scene4',
            title: '',
            background: 'src/assets/plot2.7.3.jpg',
            content: '施工方来过一次，丢下两万块钱"慰问金"，然后消失了。',
          },
          {
            id: 'scene5',
            title: '',
            background: 'src/assets/plot2.7.3.jpg',
            content: '王总在电话里说："这是天灾，我们也没办法。你要打官司就打，反正公司马上破产清算。"',
          },
          {
            id: 'scene6',
            title: '',
            background: 'src/assets/plot2.7.4.jpg',
            content: '你去法律援助中心，律师告诉你：起诉周期至少一年，胜诉后能不能拿到赔偿要看对方资产。',
          },
          {
            id: 'scene7',
            title: '',
            background: 'src/assets/plot2.7.4.jpg',
            content: '你家根本垫不起诉讼费。',
          },
          {
            id: 'scene8',
            title: '',
            background: 'src/assets/plot2.7.5.jpg',
            content: '你回到出租屋（你已经不敢回家了，因为每一面墙都在提醒你发生了什么）.',
          },
          {
            id: 'scene9',
            title: '',
            background: 'src/assets/plot2.7.6.jpg',
            content: '打开电脑，开始写水滴筹。标题你改了十几遍，最后写成："爸爸被倒塌的电梯井砸成瘫痪，求大家帮帮我。"',
          },
          {
            id: 'scene10',
            title: '',
            background: 'src/assets/plot2.7.6.jpg',
            content: '你上传了爸爸在ICU的照片，那张照片里他的脸肿得不像他。',
          },
          {
            id: 'scene11',
            title: '',
            background: 'src/assets/plot2.7.8.jpg',
            content: '三天后，水滴筹筹到4万7千元。还不够一次手术的费用。',
          },
          {
            id: 'choice4',
            title: '第四次选择（你如何撑下去）',
            background: 'src/assets/plot2.7.8.jpg',
            content: '',
            choices: [
              { option: 'A. 接受媒体采访，把这件事闹大，哪怕得罪本地所有开发商', percentage: '20%' },
              { option: 'B. 去工地门口拉横幅，逼施工方赔偿', percentage: '33%' },
              { option: 'C. 先退学，找份工作，一边打工一边照顾爸爸', percentage: '47%' },
            ],
            popup: '受害者家属中，47%选了C，33%选了B，20%选了A。',
          },
          {
            id: 'scene12',
            title: '',
            background: 'src/assets/plot2.7.9.jpg',
            content: '你选了 C。你办了休学手续。你的辅导员在电话里一直相劝，说怎么会这样呢，你成绩那么好，太可惜。',
          },
          {
            id: 'scene13',
            title: '',
            background: 'src/assets/plot2.7.9.jpg',
            content: '你憋回自己的眼泪，脱力吐出几字："老师，我爸爸只有我了。"',
          },
        ],
      },
      {
        id: 'act8',
        title: '【第八幕】法院',
        scenes: [
          {
            id: 'scene1',
            title: '场景：六个月后，区人民法院',
            background: 'src/assets/plot2.8.1.jpg',
            content: '王总被判了7年，监理张工3年。你和妈妈旁听，你看到被告席上有一个年轻人，穿着衬衫，头发蓬乱。',
          },
          {
            id: 'scene2',
            title: '',
            background: 'src/assets/plot2.8.1.jpg',
            content: '你后来才知道他叫张明远，25岁，是这个项目的结构工程师。',
          },
          {
            id: 'scene3',
            title: '',
            background: 'src/assets/plot2.8.1.jpg',
            content: '他被判免于刑事处罚，但吊销执照。',
          },
          {
            id: 'scene4',
            title: '',
            background: 'src/assets/plot2.8.2.jpg',
            content: '你死死地盯着他。他转过头来看了你一眼，眼神里全是愧疚和恐惧。',
          },
          {
            id: 'scene5',
            title: '',
            background: 'src/assets/plot2.8.3.jpg',
            content: '你妈妈忽然站起来，指着张明远喊："你是工程师！你为什么不早点说！你为什么不报警！"',
          },
          {
            id: 'scene6',
            title: '',
            background: 'src/assets/plot2.8.4.jpg',
            content: '法警把她拦下，她瘫在椅子上，哭得浑身发抖。',
          },
          {
            id: 'scene7',
            title: '',
            background: 'src/assets/plot2.8.7.jpg',
            content: '你走过去，站在张明远面前。他低着头，嘴唇在抖。',
          },
          {
            id: 'scene8',
            title: '',
            background: 'src/assets/plot2.8.6.jpg',
            content: '你想说很多话：想问他为什么签字放行那根钢材，想问他知道你爸爸再也站不起来了吗，想问他自己还能不能回到学校。',
          },
          {
            id: 'scene9',
            title: '',
            background: 'src/assets/plot2.8.6.jpg',
            content: '但你只能说出一句："我爸爸以前最喜欢看《新闻联播》里那些大桥的镜头……他现在连遥控器都拿不起来了。"',
          },
          {
            id: 'scene10',
            title: '',
            background: 'src/assets/plot2.8.5.jpg',
            content: '张明远哭了。你也哭了。',
          },
          {
            id: 'choice5',
            title: '第五次选择（你是否愿意写谅解书）',
            background: 'src/assets/plot2.8.5.jpg',
            content: '律师问你："如果你写谅解书，他可能会缓刑；如果你不写，他大概率还是免刑（因为责任链上层更重）。但谅解书会影响他未来重新考试资格的可能。"',
            choices: [
              { option: 'A. 绝不谅解，我要他一辈子当不了工程师', percentage: '63%' },
              { option: 'B. 谅解，但我要求他每年来看我爸爸一次，告诉他什么叫"良心"', percentage: '12%' },
              { option: 'C. 我不知道，让我妈妈决定', percentage: '25%' },
            ],
            popup: '同类案件中，63%的人选了A，25%选了C，12%选了B。',
          },
          {
            id: 'scene11',
            title: '',
            background: 'src/assets/plot2.8.5.jpg',
            content: '你犹豫了很久，最后选了 A。你想：你爸爸再也站不起来了，他凭什么还能有机会重新考试？',
          },
          {
            id: 'scene12',
            title: '',
            background: 'src/assets/plot5.5.jpg',
            content: '最终，法院没有采纳谅解书（因为伤势太重），张明远被判免刑但吊销执照。',
          },
          {
            id: 'scene13',
            title: '',
            background: 'src/assets/plot2.7.5.jpg',
            content: '你走出法院时，外面下着雨。你忽然想起，那天在ICU外面，你第一次觉得"雨打在脸上像刀子"。',
          },
        ],
      },
      {
        id: 'act9',
        title: '【第九幕】爸爸的生日',
        scenes: [
          {
            id: 'scene1',
            title: '场景：一年后，城中村隔断间',
            background: 'src/assets/plot2.9.1.jpg',
            content: '你把爸爸从医院接出来，妈妈在一家超市做理货员，月薪2800。',
          },
          {
            id: 'scene2',
            title: '',
            background: 'src/assets/plot2.9.2.jpg',
            content: '你在一个辅导机构教小孩写作业，月薪3500。房租、药费、康复费、爸爸的尿不湿……每个月精打细算，还是负数。',
          },
          {
            id: 'scene3',
            title: '',
            background: 'src/assets/plot2.9.4.jpg',
            content: '今天是爸爸的60岁生日。你花15块钱买了块小蛋糕，插了一根蜡烛。',
          },
          {
            id: 'scene4',
            title: '',
            background: 'src/assets/plot2.9.4.jpg',
            content: '你推着爸爸走到桌前。他的头发全白了，眼神空洞，右半边身子完全不能动，说话含混不清。',
          },
          {
            id: 'scene5',
            title: '',
            background: 'src/assets/plot2.9.3.jpg',
            content: '"爸，吹蜡烛。"你把蛋糕递到他面前。他盯着蜡烛看了很久，然后用力吹了一口气。火苗晃了晃，没有灭。',
          },
          {
            id: 'scene6',
            title: '',
            background: 'src/assets/plot2.9.3.jpg',
            content: '你帮他吹灭了。他嘴角动了动，似乎在笑。',
          },
          {
            id: 'scene7',
            title: '',
            background: 'src/assets/plot2.9.5.jpg',
            content: '你切了一小块蛋糕，喂他吃。蛋糕屑粘在他嘴角，他用没瘫痪的左手去抹，却擦到了眼睛上。',
          },
          {
            id: 'scene8',
            title: '',
            background: 'src/assets/plot2.9.5.jpg',
            content: '你忍不住哭了。你想起去年这个时候，爸爸还能自己走路去菜市场，还能给你做你最爱吃的红烧排骨。',
          },
          {
            id: 'scene9',
            title: '',
            background: 'src/assets/plot2.9.6.jpg',
            content: '妈妈端着一碗长寿面进来，眼眶红红的："小禾，别难过。至少他还在。"',
          },
          {
            id: 'scene10',
            title: '',
            background: 'src/assets/plot2.9.7.jpg',
            content: '你点点头。你知道妈妈说得对。但有些东西，失去了就是失去了。',
          },
          {
            id: 'ending',
            title: '',
            background: 'src/assets/plot2.9.7.jpg',
            content: '那天晚上，你在日记里写："如果时光能倒流，我一定会坚持让他们停工检测。如果……"但没有如果。工程伦理，对普通人来说，可能就是那一句"我觉得不太对"的勇气。如果当初有人多问一句，多坚持一下，也许一切都会不一样。——献给每一个曾被命运裹挟的普通人。',
            popup: '与你选择相同的受害者家属中，58%的人表示"后悔没有更早站出来"，32%的人说"以后会更关注身边的安全问题"，10%的人说"不知道还能做什么"。',
          },
        ],
      },
    ],
  },
];

const Plot = () => {
  const navigate = useNavigate();
  const [currentPerspective, setCurrentPerspective] = useState('engineer');
  const [currentActIndex, setCurrentActIndex] = useState(0);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentPerspectiveData = perspectives.find(p => p.id === currentPerspective);
  const currentAct = currentPerspectiveData?.acts[currentActIndex];
  const currentScene = currentAct?.scenes[currentSceneIndex];

  useEffect(() => {
    const saved = localStorage.getItem('plot_progress');
    if (saved) {
      const progress = JSON.parse(saved);
      setCurrentPerspective(progress.perspective || 'engineer');
      setCurrentActIndex(progress.actIndex || 0);
      setCurrentSceneIndex(progress.sceneIndex || 0);
    }
  }, []);

  const saveProgress = () => {
    const progress = {
      perspective: currentPerspective,
      actIndex: currentActIndex,
      sceneIndex: currentSceneIndex,
    };
    localStorage.setItem('plot_progress', JSON.stringify(progress));
    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 2000);
  };

  const goToNextScene = () => {
    if (!currentScene) return;

    if (currentScene.choices && !selectedChoice) {
      setShowPopup(true);
      return;
    }

    setIsTransitioning(true);
    
    setTimeout(() => {
      if (currentSceneIndex < currentAct.scenes.length - 1) {
        setCurrentSceneIndex(prev => prev + 1);
        setSelectedChoice(null);
      } else if (currentActIndex < currentPerspectiveData.acts.length - 1) {
        setCurrentActIndex(prev => prev + 1);
        setCurrentSceneIndex(0);
        setSelectedChoice(null);
      }
      setIsTransitioning(false);
      saveProgress();
    }, 300);
  };

  const handleChoice = (choice) => {
    setSelectedChoice(choice);
    setShowPopup(false);
    setTimeout(() => goToNextScene(), 500);
  };

  const handlePerspectiveChange = (perspectiveId) => {
    setCurrentPerspective(perspectiveId);
    setCurrentActIndex(0);
    setCurrentSceneIndex(0);
    setSelectedChoice(null);
    saveProgress();
  };

  const goToAct = (actIndex) => {
    setCurrentActIndex(actIndex);
    setCurrentSceneIndex(0);
    setSelectedChoice(null);
    saveProgress();
  };

  const handleRestart = () => {
    localStorage.removeItem('plot_progress');
    setCurrentPerspective('engineer');
    setCurrentActIndex(0);
    setCurrentSceneIndex(0);
    setSelectedChoice(null);
  };

  const goToHome = () => {
    navigate('/home');
  };

  const nextPerspective = () => {
    const currentIndex = perspectives.findIndex(p => p.id === currentPerspective);
    const nextIndex = (currentIndex + 1) % perspectives.length;
    handlePerspectiveChange(perspectives[nextIndex].id);
  };

  const totalScenes = currentPerspectiveData?.acts.reduce((acc, act) => acc + act.scenes.length, 0) || 0;
  const currentSceneCount = currentPerspectiveData?.acts.slice(0, currentActIndex).reduce((acc, act) => acc + act.scenes.length, 0) || 0;
  const progress = ((currentSceneCount + currentSceneIndex + 1) / totalScenes) * 100;

  return (
    <div className="plot-container">
      <div className="perspective-selector">
        <div className="perspective-header">
          <div className="perspective-tabs">
            {perspectives.map((perspective) => (
              <button
                key={perspective.id}
                className={`perspective-tab ${currentPerspective === perspective.id ? 'active' : ''}`}
                onClick={() => handlePerspectiveChange(perspective.id)}
              >
                <span className="perspective-icon">{perspective.icon}</span>
                <span>{perspective.name}</span>
              </button>
            ))}
          </div>
          <div className="perspective-footer">
            <p className="perspective-desc">{currentPerspectiveData?.description}</p>
            <button className="home-btn" onClick={goToHome}>
              <span className="home-icon">🏠</span>
              返回首页
            </button>
            {showSaveMessage && <span className="save-message">✓ 进度已保存</span>}
          </div>
        </div>
      </div>

      <div className="chapter-nav">
        <div className="chapter-list">
          {currentPerspectiveData?.acts.map((act, index) => (
            <button
              key={act.id}
              className={`chapter-item ${currentActIndex === index ? 'active' : ''}`}
              onClick={() => goToAct(index)}
            >
              <span className="chapter-number">{index + 1}</span>
              <span className="chapter-title">{act.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="plot-content">
        {currentScene?.background && (
          <div
            className="background-image"
            style={{ backgroundImage: `url(${currentScene.background})` }}
          />
        )}
        <div className={`content-overlay ${currentActIndex === 0 && currentSceneIndex === 0 ? 'preamble-overlay' : ''}`}>
          <div
            className={`content-card ${currentActIndex === 0 && currentSceneIndex === 0 ? 'preamble-card' : ''} ${isTransitioning ? 'fade-out' : 'fade-in'}`}
          >
            {currentScene?.title && (
              <h2 className="act-title">{currentScene.title}</h2>
            )}
            {currentScene?.content && (
              <div className="scene-content">
                <p>{currentScene.content}</p>
              </div>
            )}
            {currentScene?.choices && !selectedChoice && (
              <div className="choices-container">
                <h3 className="choices-title">{currentScene.title}</h3>
                <div className="choices-list">
                  {currentScene.choices.map((choice, index) => (
                    <button
                      key={index}
                      className="choice-btn"
                      onClick={() => handleChoice(choice.option)}
                    >
                      <span className="choice-text">{choice.option}</span>
                      <span className="choice-percentage">{choice.percentage}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {currentScene?.popup && selectedChoice && (
              <div className="ending-actions">
                <div className="ending-popup">
                  <p>{currentScene.popup}</p>
                </div>
              </div>
            )}
            {currentScene?.id === 'ending' ? (
              <div className="ending-actions">
                {currentScene.popup && (
                  <div className="ending-popup">
                    <p>{currentScene.popup}</p>
                  </div>
                )}
                <button className="next-perspective-btn" onClick={nextPerspective}>
                  切换视角继续体验
                </button>
                <button className="restart-btn" onClick={handleRestart}>
                  重新开始
                </button>
              </div>
            ) : !currentScene?.choices || selectedChoice ? (
              <button className="next-btn" onClick={goToNextScene}>
                <span>继续</span>
                <span className="arrow">→</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="progress-indicator">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="progress-text">
          {currentSceneCount + currentSceneIndex + 1} / {totalScenes}
        </span>
      </div>

      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <p>请先做出你的选择</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plot;
