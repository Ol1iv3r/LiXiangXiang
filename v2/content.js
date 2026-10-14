// 所有个人资料与作品集中在这里维护。所有示例都必须在正式申请前替换。
// 每个双语字段使用 { zh: '中文', en: 'English' }。
export const cover = {
  name: '李想想',
  background: '/LiXiangXiang/assets/intro/cover.webp',
  aboutBackground: '/LiXiangXiang/assets/intro/about.webp',
  personCutout: '/LiXiangXiang/assets/intro/person.png',
  signature: '/LiXiangXiang/assets/cover/signature.png',
  nameLogo: '/LiXiangXiang/assets/cover/name.png',
  slogan: 'THE LOVE & HOPE SHALL NEVER DIE.',
  instagram: 'https://www.instagram.com/yrdzz_/',
};

// Selected personal photographs and frames from all five films.
export const roles = [
  {id:'me',title:'Me',photos:[1,2,3,4].map(i=>`/LiXiangXiang/assets/intro/self-${i}.jpg`), paragraphs:['Xiang Li / 李想 / Oliver','2004– born in Shanghai\nnow– based in Hong Kong']},
  {id:'director',title:'director',photos:['/LiXiangXiang/assets/work/sticky-notes/frame-09.jpg','/LiXiangXiang/assets/work/curiosity/frame-03.jpg','/LiXiangXiang/assets/work/a-great-mindset-person/frame-07.jpg','/LiXiangXiang/assets/work/the-fold/frame-05.jpg','/LiXiangXiang/assets/work/beyond-the-frame/frame-01.jpg','/LiXiangXiang/assets/work/sticky-notes/frame-12.jpg'],paragraphs:['Narrative & Documentary;\nSolo filmmaker; AI filmmaker'],cta:'work'},
  {id:'photography',title:'film photographer,\ncinematographer',photos:[],paragraphs:[],cta:'instagram'},
  {id:'social',title:'social designer',photos:[],paragraphs:['Passionate about volunteering teaching,\nAttentive to social issues around myself and others']},
  {id:'digital',title:'programmer, 3D engineer',photos:[],paragraphs:['Python, C++, Blender...','Research Focus:\nOptimizing accuracy and speed of video generation models\nAI agent tools for film and video production']}
];

export const profile = {
  name: { zh: '你的名字', en: 'Your Name' },
  brand: 'BETWEEN FRAMES',
  email: 'lixiang0410222@gmail.com', // 填入真实邮箱后，页脚会自动显示联系链接。
  linkedin:'https://www.linkedin.com/in/xiang-li-899b07292/',
  phones:['+852 96350574','+86 13917181311'],
  cv: '', // 例如 /assets/cv.pdf。留空则不显示下载按钮。
  introduction: {
    zh: '我用影像，靠近那些难以言说的感受。',
    en: 'I make images to get closer to the things words cannot hold.'
  },
  biography: {
    zh: '这里将写下你的故事：你从哪里来，为什么开始拍电影，以及你如何观察这个世界。比起一份经历的罗列，更想让观众认识镜头背后的你。',
    en: 'Your story belongs here: where you come from, why you began making films, and how you look at the world. A space to meet the person behind the camera.'
  },
  goal: {
    zh: '这里将呈现你希望在硕士阶段继续探索的创作议题，以及影像、技术与个人经验之间的联系。',
    en: 'A space for the questions you want to pursue in graduate study, and the connections between cinema, technology, and personal experience.'
  }
};

const frames = ['hero', 'sea', 'city', 'forest', 'night', 'desert', 'mountain', 'street'];
export const projects = [
  { id:'the-tide', number:'01', title:{zh:'潮汐之间',en:'Between Tides'}, category:'short', image:'hero',
    subtitle:{zh:'当潮水退去，记忆开始浮现。',en:'When the tide recedes, memory begins to surface.'}},
  { id:'a-place-to-stay', number:'02', title:{zh:'在此停留',en:'A Place to Stay'}, category:'documentary', image:'city',
    subtitle:{zh:'在城市的日常里，寻找被忽略的温度。',en:'Finding a quiet warmth in the everyday life of a city.'}},
  { id:'synthetic-dreams', number:'03', title:{zh:'人造梦境',en:'Synthetic Dreams'}, category:'ai', image:'desert',
    subtitle:{zh:'当记忆可以生成，真实会是什么模样？',en:'What does reality look like when memories can be generated?'}},
  { id:'into-the-silence', number:'04', title:{zh:'无声之处',en:'Into the Silence'}, category:'short', image:'forest',
    subtitle:{zh:'一次离开，一段尚未说出口的告别。',en:'A departure. A goodbye still waiting to be spoken.'}},
  { id:'a-little-longer', number:'05', title:{zh:'让时间慢一点',en:'A Little Longer'}, category:'tvc', image:'sea',
    subtitle:{zh:'把感官的细节，放大成一个瞬间。',en:'The smallest sensations, held in a single moment.'}},
  { id:'next-chapter', number:'06', title:{zh:'未完待续',en:'The Next Chapter'}, category:'ongoing', image:'night',
    subtitle:{zh:'一个新的故事，正在慢慢成形。',en:'A new story is slowly taking shape.'}}
].map((p,i) => ({
  demo:true, year:'—', duration:'—',
  showcase:i<5, featured:i<3, // 五部作品，其中前三部有幕后流程。
  cover:'', poster:'', // 可单独指定横版封面、竖版海报；空值使用 image。
  role:{zh:'创作职责待补充',en:'Creative role to be added'},
  video:'', // YouTube 视频 ID 或 watch / youtu.be 链接；空值不加载播放器。
  concept:{zh:'这个位置将记录作品真正的起点：一个问题、一段经验，或某个难以忘记的画面。你可以在这里解释叙事选择、视觉语言，以及这次创作带给你的思考。',en:'The real starting point of this film will live here: a question, an experience, or an image that stayed with you. Share your narrative choices, visual language, and what the process taught you.'},
  stills:frames.map((_,j)=>({src:`/LiXiangXiang/assets/${frames[(j+i)%frames.length]}.jpg`,caption:{zh:`视觉示例 · 静帧 ${String(j+1).padStart(2,'0')}`,en:`Visual placeholder · Frame ${String(j+1).padStart(2,'0')}`}})),
  // 可增加至 16 张；每张提供 src、caption。示例图不是个人作品。
  behind:[
    {type:'script',label:{zh:'剧本与文字',en:'Script & writing'},description:{zh:'从最初的想法，到故事的结构。',en:'From a first thought to the shape of a story.'},url:''},
    {type:'storyboard',label:{zh:'分镜与调度',en:'Storyboard & blocking'},description:{zh:'在拍摄之前，想象每一个镜头。',en:'Imagining each frame before the camera rolls.'},url:''},
    {type:'blender',label:{zh:'Blender 视觉探索',en:'Blender explorations'},description:{zh:'空间、光线与场景的前期实验。',en:'Early experiments in space, light, and setting.'},url:''}
  ],
  ...p, // 单部作品填写的字段覆盖上述默认值。
}));

// 三部精选作品的真实页面素材来自 Web Materials/My WOrk/1x。
// 其余影片继续使用可替换的作品框架。
Object.assign(projects[0], {
  id:'the-sticky-notes', number:'01',
  video:'https://youtu.be/76cMKNa3CZw',
  documents:[
    {id:'script',label:'Script',src:'/LiXiangXiang/assets/work/sticky-notes/documents/script.pdf'},
    {id:'storyboard',label:'Storyboard + Shooting plan',src:'/LiXiangXiang/assets/work/sticky-notes/documents/storyboard.pdf'},
  ],
  title:{zh:'便貼',en:'The Sticky Notes'}, category:'documentary', image:'hero',
  cover:'/LiXiangXiang/assets/work/sticky-notes/cover.jpg', poster:'/LiXiangXiang/assets/work/sticky-notes/frame-01.jpg', badge:'Non-fiction',
  logo:'/LiXiangXiang/assets/cover/signature.png', titleArt:{zh:'/LiXiangXiang/assets/work/asset-14.png',en:'/LiXiangXiang/assets/work/asset-15.png'},
  actionArt:{watch:'/LiXiangXiang/assets/work/asset-30.png',explore:'/LiXiangXiang/assets/work/asset-31.png',watchActive:'/LiXiangXiang/assets/work/asset-32.png',exploreActive:'/LiXiangXiang/assets/work/asset-33.png'},
  stills:Array.from({length:12},(_,i)=>({src:`/LiXiangXiang/assets/work/sticky-notes/frame-${String(i+1).padStart(2,'0')}.${i===6?'webp':'jpg'}`,caption:`The Sticky Notes — frame ${String(i+1).padStart(2,'0')}`})),
  subtitle:{zh:'李想，一位刚毕业的年轻人，用一整面贴满便签的墙，整理求职与生活。',en:'Li Xiang, a recent graduate, maps out his job search and life using a wall covered in sticky notes.'},
  concept:{zh:'一面贴满便签的墙，记录下毕业、求职与生活重新开始的日常。',en:'A wall of sticky notes maps a young graduate’s search for work, direction, and a new daily rhythm.'},
  role:{zh:'非虚构短片',en:'Non-fiction film'}, year:'',duration:'',demo:false,
});
Object.assign(projects[1], {
  id:'the-fold', number:'02', title:{zh:'摺痕',en:'The Fold'}, category:'ai', image:'city',
  video:'https://youtu.be/RwPldnvR1XU',
  cover:'/LiXiangXiang/assets/work/the-fold/cover.jpg', poster:'/LiXiangXiang/assets/work/the-fold/frame-03.jpg', badge:'AIGC',
  logo:'/LiXiangXiang/assets/cover/signature.png', titleArt:{zh:'/LiXiangXiang/assets/work/asset-41.png',en:'/LiXiangXiang/assets/work/asset-42.png'},
  actionArt:{watch:'/LiXiangXiang/assets/work/asset-38.png',explore:'/LiXiangXiang/assets/work/asset-39.png',watchActive:'/LiXiangXiang/assets/work/asset-32.png',exploreActive:'/LiXiangXiang/assets/work/asset-33.png'},
  stills:Array.from({length:12},(_,i)=>({src:`/LiXiangXiang/assets/work/the-fold/frame-${String(i+1).padStart(2,'0')}.jpg`,caption:`The Fold — frame ${String(i+1).padStart(2,'0')}`})),
  subtitle:{zh:'一位老年拾荒者在雨中的旅程，让我们看见生存、尊严与善意。',en:'An elderly scavenger’s journey through the rain offers a close look at survival, dignity, and kindness.'},
  concept:{zh:'在一座熟悉又陌生的城市里，跟随一位拾荒者走过雨天，凝视那些常被忽略的生活。',en:'Through a familiar yet overlooked city, follow one scavenger through the rain and notice the lives that pass unseen.'},
  role:{zh:'AI 生成影像',en:'AI generated cinema'},year:'',duration:'',demo:false,
});
Object.assign(projects[2], {
  id:'beyond-the-frame',number:'03',title:{zh:'当義教成為一種「形式主義」',en:'Beyond the Frame'},category:'documentary',image:'portrait',
  video:'https://youtu.be/DtVyjNbW9PU',
  videoPlayback:'youtube-only',
  documents:[{id:'process',label:'Explore',src:'/LiXiangXiang/assets/work/beyond-the-frame/production-process.pdf'}],
  videoNotice:'Watch the full film on YouTube.',
  cover:'/LiXiangXiang/assets/work/beyond-the-frame/cover.jpg',poster:'/LiXiangXiang/assets/work/beyond-the-frame/cover.jpg',badge:'Documentary',
  logo:'/LiXiangXiang/assets/cover/signature.png',titleArt:{zh:'/LiXiangXiang/assets/work/asset-73.png',en:'/LiXiangXiang/assets/work/asset-74.png'},
  actionArt:{watch:'/LiXiangXiang/assets/work/asset-70.png',explore:'/LiXiangXiang/assets/work/asset-71.png',watchActive:'/LiXiangXiang/assets/work/asset-32.png',exploreActive:'/LiXiangXiang/assets/work/asset-33.png'},
  stills:Array.from({length:12},(_,i)=>({src:`/LiXiangXiang/assets/work/beyond-the-frame/frame-${String(i+1).padStart(2,'0')}.jpg`,caption:`Beyond the Frame — frame ${String(i+1).padStart(2,'0')}`})),
  subtitle:{zh:'故事始于一次支教：一个夏天，一群学生与来自新疆吐鲁番的孩子们。',en:'A documentary re-edited from promotional footage, documenting a volunteer teaching experience.'},
  concept:{zh:'回望一次支教经历，也重新思考当教育只剩下形式时，真正重要的东西是什么。',en:'Looking back on a summer of volunteer teaching, and asking what remains when education becomes a formality.'},
  role:{zh:'纪录片',en:'Documentary'},year:'',duration:'',demo:false,
});

// Additional films and their supplied production materials.
Object.assign(projects[3], {
  id:'curiosity', title:{zh:'你所追求的好奇心',en:'Curiosity'}, category:'tvc', badge:'TVC',
  video:'https://youtu.be/pUqsMLO6UWk', demo:false, year:'', duration:'',
  detailCover:'/LiXiangXiang/assets/work/curiosity/detail-cover.jpg', cover:'/LiXiangXiang/assets/work/curiosity/cover.jpg', poster:'/LiXiangXiang/assets/work/curiosity/cover.jpg',
  subtitle:{zh:'嘉士伯宣传片',en:'TVC for Carlsberg'}, concept:{zh:'',en:''}, role:{zh:'',en:'TVC'},
  titleArt:{zh:'/LiXiangXiang/assets/work/asset-107.png',en:'/LiXiangXiang/assets/work/asset-108.png'},
  documents:[{id:'process',label:'Production process',src:'/LiXiangXiang/assets/work/curiosity/production-process.pdf'}],
  stills:Array.from({length:12},(_,i)=>({src:`/LiXiangXiang/assets/work/curiosity/frame-${String(i+1).padStart(2,'0')}.jpg`,caption:`Curiosity — frame ${i+1}`})), behind:[],
});
Object.assign(projects[4], {
  id:'a-great-mindset-person', title:{zh:'心態',en:'A Great Mindset Person'}, category:'short', badge:'Short Film',
  video:'https://youtu.be/7UptIj-mK2c', demo:false, year:'', duration:'',
  detailCover:'/LiXiangXiang/assets/work/a-great-mindset-person/detail-cover.jpg', cover:'/LiXiangXiang/assets/work/a-great-mindset-person/cover.jpg', poster:'/LiXiangXiang/assets/work/a-great-mindset-person/cover.jpg',
  subtitle:{zh:'他是谁？',en:'Who is he?'}, concept:{zh:'',en:''}, role:{zh:'',en:'Short film'},
  titleArt:{zh:'/LiXiangXiang/assets/work/asset-104.png',en:'/LiXiangXiang/assets/work/asset-105.png'},
  documents:[{id:'process',label:'Explore',src:'/LiXiangXiang/assets/work/a-great-mindset-person/production-process.pdf'}],
  stills:Array.from({length:12},(_,i)=>({src:`/LiXiangXiang/assets/work/a-great-mindset-person/frame-${String(i+1).padStart(2,'0')}.jpg`,caption:`A Great Mindset Person — frame ${i+1}`})), behind:[],
});

export const categories = {
  all:{zh:'全部作品',en:'All works'}, short:{zh:'短片',en:'Short film'},
  documentary:{zh:'纪录片',en:'Documentary'}, ai:{zh:'AI 短片',en:'AI film'},
  tvc:{zh:'商业广告',en:'TVC'}, ongoing:{zh:'创作中',en:'In progress'}
};
export { photography } from './photography.js?v=ba5e63171cd3';
export const reviews = [
  {title:{zh:'一部让我重新理解时间的电影',en:'A film that changed my sense of time'},topic:{zh:'关于时间与记忆',en:'On time & memory'},text:{zh:'在这里添加你喜爱的电影、导演与一篇真正属于你的影评。可以从一个镜头开始，谈谈它为什么让你停留，以及它如何影响你的创作。',en:'Add a favorite film, its director, and your own reflection. Start with a frame: why it stayed with you, and how it shaped the way you make images.'}},
  {title:{zh:'镜头之外，还有什么？',en:'What lives beyond the frame?'},topic:{zh:'关于观看与表达',en:'On seeing & expression'},text:{zh:'这里可以记录第二部喜爱的电影。关注具体的声音、构图或叙事选择，让你的观看方式成为个人作品集的一部分。',en:'A second film reflection can live here. Look closely at a sound, a composition, or a narrative choice, and make your way of seeing part of the portfolio.'}}
];

const archiveTitles={
 'the-sticky-notes':90,'the-fold':89,'beyond-the-frame':86,'curiosity':88,'a-great-mindset-person':87
};
for(const project of projects)if(archiveTitles[project.id]){
 project.archiveTitleArt=`/LiXiangXiang/assets/work/asset-${archiveTitles[project.id]}.png`;
 project.archiveTitleBilingual=false;
}

// Version 2: swap whole project objects so images, documents and playback stay together.
const stickyPosition=projects.findIndex(p=>p.id==='the-sticky-notes');
const documentaryPosition=projects.findIndex(p=>p.id==='beyond-the-frame');
[projects[stickyPosition],projects[documentaryPosition]]=[projects[documentaryPosition],projects[stickyPosition]];
