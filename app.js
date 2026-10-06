// 读取本地存储旧记录
let records = JSON.parse(localStorage.getItem('myRecords')) || [];

// 保存按钮
document.getElementById('btnSave').addEventListener('click', () => {
    const text = document.getElementById('entryText').value;
    const mood = Number(document.getElementById('mood').value);
    const energy = Number(document.getElementById('energy').value);
    const record = {
        text: text,
        mood: mood,
        energy: energy,
        time: new Date().toLocaleString(),
        date:new
    Date().toLocaleDateString('sv')
    };
    records.push(record);
    localStorage.setItem('myRecords', JSON.stringify(records));
    alert('已保存！现在一共 ' + records.length + ' 条');
    drawChart();
    renderHeatmap();
});

// 清空全部记录按钮
document.getElementById('btnClear').addEventListener('click',()=>{
    if(confirm("确定要清空所有日记数据吗？")){
        records = [];
        localStorage.removeItem('myRecords');
        drawChart();
        renderHeatmap();
    }
})

// 滑块实时更新数字
document.getElementById('mood').addEventListener('input', (e) => {
    document.getElementById('moodVal').textContent = e.target.value;
});
document.getElementById('energy').addEventListener('input', (e) => {
    document.getElementById('energyVal').textContent = e.target.value;
});

// 绘图函数
function drawChart(){
    const canvas = document.getElementById('chart');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);

    function scoreToY(score) {
        const top = 20, height = 120;
        return top + (1 - (score - 1) / 9) * height;
    }

    if(records.length === 0) return;

    // Y轴刻度文字
    ctx.fillStyle="#666";
    ctx.font="12px sans-serif";
    for(let s=1;s<=10;s++){
        const y = scoreToY(s);
        ctx.fillText(s, 10, y+4);
    }

    const paddingLeft = 40;
    const paddingRight = 30;
    const usableWidth = canvas.width - paddingLeft - paddingRight;

    // 橙色 精力折线
    ctx.beginPath();
    for(let i=0;i<records.length;i++){
        const r = records[i];
        let x;
        if(records.length === 1){
            x = canvas.width / 2;
        }else{
            x = paddingLeft + i * (usableWidth / (records.length - 1));
        }
        const y = scoreToY(r.energy);
        if(i === 0){
            ctx.moveTo(x, y);
        }else{
            ctx.lineTo(x, y);
        }
    }
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2;
    ctx.stroke();
    // 精力圆点
    for(let i=0;i<records.length;i++){
        const r = records[i];
        let x;
        if(records.length === 1){
            x = canvas.width / 2;
        }else{
            x = paddingLeft + i * (usableWidth / (records.length - 1));
        }
        const y = scoreToY(r.energy);
        ctx.beginPath();
        ctx.arc(x,y,4,0,Math.PI*2);
        ctx.fillStyle='#f97316';
        ctx.fill();
    }

    // 图例，只保留精力
    ctx.fillStyle="#f97316";
    ctx.fillText("● 精力",420,30);
}
// 页面加载自动画图
drawChart();
// 根据心情分数生成颜色
function moodColor(m) {
  const t = (m - 1) / 9;    // 分数1~10归一化0~1
  const hue = 222 + t * 113;// 蓝(222) → 粉(335)
  return `hsl(${hue} 70% 72%)`;
}

// 渲染热力图
function renderHeatmap(){
  const container = document.getElementById('heatmap');
  container.innerHTML = ''; //清空旧格子

  // 起始日期：往前推363天，一共364格
  const start = new Date();
  start.setDate(start.getDate() - 363);

  for (let i = 0; i < 364; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const key = d.toLocaleDateString('sv'); // yyyy-MM-dd 标准日期key
    // 筛选当天所有记录
    const dayRecords = records.filter(r => r.date === key);

    const cell = document.createElement('div');
    cell.style.width = '13px';
    cell.style.height = '13px';
    cell.style.borderRadius = '3px';

    if(dayRecords.length > 0){
      // 取当日心情平均分
      const avgScore = dayRecords.reduce((s, r) => s + r.mood, 0) / dayRecords.length;
      cell.style.background = moodColor(avgScore);
    }else{
      // 无记录灰色
      cell.style.background = '#f0f1f7';
    }
    container.appendChild(cell);
  }
}
// 根据心情分数生成颜色
function moodColor(m) {
  const t = (m - 1) / 9;
  const hue = 222 + t * 113;
  return `hsl(${hue} 70% 72%)`;
}

// 渲染热力图
function renderHeatmap(){
  const container = document.getElementById('heatmap');
  container.innerHTML = '';

  const start = new Date();
  start.setDate(start.getDate() - 363);

  for (let i = 0; i < 364; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const key = d.toLocaleDateString('sv');
    const dayRecords = records.filter(r => r.date === key);

    const cell = document.createElement('div');
    cell.style.width = '16px';
    cell.style.height = '16px';
    cell.style.borderRadius = '3px';
    cell.title=key;

    if(dayRecords.length > 0){
      const avgScore = dayRecords.reduce((s, r) => s + r.mood, 0) / dayRecords.length;
      cell.style.background = moodColor(avgScore);
    }else{
      cell.style.background = 'rgba(0, 136, 255, 0.06)';
    }
    container.appendChild(cell);
  }
}

drawChart();
renderHeatmap();
// 分词器
const segmenter = new Intl.Segmenter('zh', { granularity: 'word' });
// 停用词：过滤虚词
const stopWords = new Set(["我们","彼此","今天","昨天","未来","掠过","翅膀","有形","未曾","将会","但是","依然","心里","就是","还有","因为","所以","可以","这个","那个"]);

function tokenize(text) {
  const words = [];
  for (const s of segmenter.segment(text)) {
    // 增加停用词判断 !stopWords.has(s.segment)
    if (s.isWordLike && s.segment.length >= 2 && !stopWords.has(s.segment)) {
      words.push(s.segment);
    }
  }
  return words;
}

function countWords(records) {
  const book = new Map();
  for (const r of records) {
    const wordList = tokenize(r.text || "");
    // 同一篇日记重复词语只计1次
    for (const w of new Set(wordList)) {
      book.set(w, (book.get(w) || 0) + 1);
    }
  }
  // 按出现次数从高到低排序
  const sorted = Array.from(book.entries()).sort((a,b)=>b[1]-a[1]);
  return sorted;
}
// 渲染词云图
function renderWordCloud(wordList) {
  const myChart = echarts.init(document.getElementById('wordCloud'));
  const option = {
    backgroundColor: '#ffffff',
    series: [{
      type: 'wordCloud',
      shape: 'circle',
      gridSize: 10,
      sizeRange: [14, 65],
      rotationRange: [-30, 30],
      textStyle: {
        color: function() {
          const colors = ['#3366cc','#dc3912','#ff9900','#109618','#990099'];
          return colors[Math.floor(Math.random() * colors.length)];
        }
      },
      data: wordList
    }]
  };
  myChart.setOption(option);
}
// 洞察引擎：词语情绪账本 + 星期规律
function runInsightEngine() {
    const ledger = {};
    for (const r of records) {
        const words = new Set(tokenize(r.text));
        for (const w of words) {
            if (!ledger[w]) {
                ledger[w] = { count: 0, moodSum: 0 };
            }
            ledger[w].count++;
            ledger[w].moodSum += r.mood;
        }
    }

    const totalMood = records.reduce((sum, r) => sum + r.mood, 0);
    const overallAvg = totalMood / records.length;

    // 准备输出文本
    let outputText = "";
    outputText += `全局平均心情：${overallAvg.toFixed(2)}\n`;

    outputText += "\n====情绪归因分析====\n";
    for (const [word, s] of Object.entries(ledger)) {
        if (s.count < 3) continue;
        const wordAvgMood = s.moodSum / s.count;
        const lift = wordAvgMood - overallAvg;
        if (lift >= 0.6) {
            outputText += `${word} 是你的能量来源 (${lift.toFixed(1)})\n`;
        }
        if (lift <= -0.6) {
            outputText += `${word} 在持续消耗你 (${lift.toFixed(1)})\n`;
        }
    }

    // 星期规律
    const byWeekday = [[], [], [], [], [], [], []];
    for (const r of records) {
        const dayIdx = new Date(r.date).getDay();
        byWeekday[dayIdx].push(r.mood);
    }
    const weekName = ["周日","周一","周二","周三","周四","周五","周六"];
    outputText += "\n====星期心情规律====\n";
    for(let i=0;i<7;i++){
        const arr = byWeekday[i];
        if(arr.length ===0) continue;
        const avg = arr.reduce((s,v)=>s+v,0)/arr.length;
        outputText += `${weekName[i]} 平均心情：${avg.toFixed(2)}\n`;
    }

    // 打印到控制台
    console.log(outputText);
    // 渲染到网页
    document.getElementById("insightResult").innerText = outputText;
}
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('./sw.js')
  .then(reg => console.log("SW注册成功",reg))
  .catch(err => console.log("SW注册失败",err));
}