# flow-chart
流程图工具

基于 jsplumb 封装一个使用十分简单的流程图处理类。

样式使用less处理

### 引入依赖文件
```
<link rel="stylesheet" type="text/css" href="../chart.css">
<script src="../libs/jquery.min.js"></script>
<script src="../libs/jsPlumb.min.js"></script>
<script src='../chart.js'></script>

### 常用操作
```
Chart.ready(() => { // 初始化
    // 创建画布
    let chart = new Chart($('#div1'), {
        onNodeClick (data) { // 点击节点时触发的事件
            console.log(data);
        }
    });

    // 添加节点
    let nodeStart = chart.addNode('开始', basicX, startY, {
        class: 'node-start', // 自定义节点样式
        data: { // 节点绑定数据，在click事件中可以获取
            name: '开始',
            nodeType: 0
        }
    });
    // 添加端口
    nodeStart.addPort({
        isSource: true
    });

    // 获取所有节点
    console.log(chart.getNodes());

    // 序列化用以保存
    console.log(JSON.stringify(chart.toJson()));

    // 删除节点 - 1
    nodeStart.dispose();
    // 删除节点 - 2
    chart.removeNode(nodeStart.getId());
});
```