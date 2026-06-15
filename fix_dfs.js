const fs = require("fs");

let content = fs.readFileSync("src/components/visualizations/DFSComponent.tsx", "utf8");

const fixes = [
  [/边列\uFFFD\?\(/g, "边列表 ("],
  [/随机生成\uFFFD\?\/span>/g, "随机生成图</span>"],
  [/开\uFFFD\?\/span>/g, "开始</span>"],
  [/上一\uFFFD\?\/span>/g, "上一步</span>"],
  [/下一\uFFFD\?\/span>/g, "下一步</span>"],
  [/value="1500">\uFFFD\?<\/option>/g, 'value="1500">慢</option>'],
  [/value="800">\uFFFD\?<\/option>/g, 'value="800">中</option>'],
  [/value="300">\uFFFD\?<\/option>/g, 'value="300">快</option>'],
  [/算法状\uFFFD/g, "算法状态"],
  [/已访\uFFFD/g, "已访问"],
  [/伪代\uFFFD/g, "伪代码"],
  [/暂无伪代\uFFFD/g, "暂无伪代码"],
  [/调用\uFFFD/g, "调用栈"],
  [/访问节\uFFFD/g, "访问节点"],
  [/检查邻\uFFFD/g, "检查邻居"],
  [/递归深\uFFFD/g, "递归深入"],
  [/回\uFFFD/g, "回溯"],
  [/准备\uFFFD/g, "准备中"],
  [/空\uFFFD/g, "空"],
];

for (const [pat, rep] of fixes) {
  content = content.replace(pat, rep);
}

fs.writeFileSync("src/components/visualizations/DFSComponent.tsx", content, "utf8");
console.log("Fixed");
