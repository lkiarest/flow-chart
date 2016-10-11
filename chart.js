/**
 * @class 流程节点
 * @param {Object} container      节点容器（画布），jquery对象
 * @param {String} id      节点id
 * @param {String} name    节点名称
 * @param {Number} x       节点x坐标
 * @param {Number} y       节点y坐标
 * @param {Object} [options] 节点附加属性
 * @param {String} [options.color] 节点文字颜色
 * @param {String} [options.bgColor] 节点背景色
 * @param {Number} [options.radius] 节点圆角大小
 * @param {Number} [options.data] 绑定到节点的附加数据
 * @param {Number} [options.container] 节点容器（画布），若设置此选项则会自动将节点添加到画布上
 */
let ChartNode = function(id, name, x, y, options) {
    this._container = null;
    this._id = id;
    this._name = name;
    this._x = x;
    this._y = y;
    this._data = options && options.data || {};
    this._data.nodeId = id;
    this._options = $.extend({ // 默认属性
        // class: 'classname'
    }, options);
    this._el = null;

    if (options && options.container) {
        this.appendTo(options.container);
    }
};

/**
 * 连线样式
 * @type {Object}
 */
ChartNode.lineStyle = {
    lineWidth: 1,
    joinstyle: "round",
    strokeStyle: "#0096f2"
};

/**
 * 标签位置
 */
ChartNode.labelPos = {
    'Bottom': [6, 2.5],
    'Top': [6, -2.5],
};

ChartNode.prototype._px = (value) => {
    return value + 'px';
};

ChartNode.prototype.getId = function() {
    return this._id;
};

ChartNode.prototype.getData = function() {
    return this._data || {};
};

ChartNode.prototype.appendTo = function(container) {
    if (! container) {
        console.error('node container is null !');
        return;
    }

    let self = this;
    let options = self._options;
    let className = options.class || '';
    let px = self._px;

    // 创建并插入 dom 节点
    let node = $('<div>').addClass(`window task ${className}`)
        .attr('id', self._id)
        .css({
            left: px(self._x),
            top: px(self._y)
        })
        .text(self._name)
        .data('node', this._data);

    container.append(node);
    jsPlumb.draggable(node, { grid: [10, 10] });

    this._el = node;
};

/**
 * 添加连接端口
 * @param {Object} options 连接端口参数
 * @param {String} [options.color=#0096f2] 端口颜色
 * @param {Boolean} [options.isSource=false] 是否为源端口
 * @param {Boolean} [options.isTarget=false] 是否为目标端口
 * @param {String} [options.label] 端口名称
 * @param {String} [options.position=bottom] 端口位置，可设置为 'Top'
 */
ChartNode.prototype.addPort = function(options) {
    let pos = options.position || 'Bottom';
    let labelPos = ChartNode.labelPos[pos];
    let endpointConf = {
        endpoint: "Dot",
        paintStyle: {
            strokeStyle: options.color || '#0096f2',
            radius: 2,
            lineWidth: 1
        },
        anchor: pos,
        isSource: !!options.isSource,
        isTarget: !!options.isTarget,
        maxConnections: -1,
        connector: ["Flowchart", { stub: [15, 15], gap: 0, cornerRadius: 5, alwaysRespectStubs: true }],
        connectorStyle: ChartNode.lineStyle,
        // hoverPaintStyle: endpointHoverStyle,
        // connectorHoverStyle: connectorHoverStyle,
        dragOptions: {},
        overlays: [
            ["Label", {
                location: labelPos,
                label: options.label || '',
                cssClass: "endpoint-label-lkiarest"
            }]
        ]
    };

    jsPlumb.addEndpoint(this._el, endpointConf);
};

/**
 * 更新坐标
 */
ChartNode.prototype.updatePos = function() {
    let el = this._el;
    this._x = parseInt(el.css("left"), 10);
    this._y = parseInt(el.css("top"), 10);
};

ChartNode.prototype.dispose = function() {
    let el = this._el;
    jsPlumb.detachAllConnections(el);
    jsPlumb.removeAllEndpoints(el);
    el.remove();
};

/**
 * @class 画布
 */
let Chart = function(container, options) {
    this._container = container;
    this._nodes = [];
    this._seedName = 'flow-chart-node';
    this._seedId = 0;

    this.init(options);
};

Chart.prototype.nodeId = function() {
    return this._seedName + (this._seedId++);
};

/**
 * 初始化方法
 * @param  {Object} [options] 初始化参数
 * @param {Function} [options.onNodeClick] 节点点击事件回调函数，参数为节点绑定的数据
 */
Chart.prototype.init = function(options) {
    jsPlumb.importDefaults({
        DragOptions: { cursor: 'pointer', zIndex: 2000 },
        ConnectionOverlays: [
            ["PlainArrow", {
                width: 10,
                location: 1,
                id: "arrow",
                length: 8
            }]
        ]
    });

    this._container.addClass('flow-chart-canvas-lkiarest');

    // 点击事件
    if (options && options.onNodeClick) {
        this._container.on('click', '.task', event => {
            let target = $(event.target);
            options.onNodeClick.call(this, target.data('node'));
        });
    }
};

/**
 * 添加新节点
 * @param {String} name    节点名称
 * @param {Number} x       节点x坐标
 * @param {Number} y       节点y坐标
 * @param {Object} options 节点参数，可参考 {class ChartNode} 构造参数
 * @param {String} [options.id] 节点id，若未定义则由系统自动分配
 */
Chart.prototype.addNode = function(name, x, y, options) {
    let id = options && options.id || this.nodeId();
    let node = new ChartNode(id, name, x, y, options);
    node.appendTo(this._container);
    this._nodes.push(node);
    return node;
};

Chart.prototype.removeNode = function(nodeId) {
    let nodes = this._nodes;
    for (let i = 0, len = nodes.length; i < len; i++) {
        let node = nodes[i];
        if (node.getId() === nodeId) {
            node.dispose();
            nodes.splice(i, 1);
            return node;
        }
    }
};

Chart.prototype.getNodes = function() {
    return this._nodes;
};

Chart.prototype.toJson = function() {
    // 获取所有节点
    let nodes = [];
    this._nodes.forEach(item => {
        let data = item.getData();
        data.nodeId = item.getId();
        nodes.push(data);
    });

    // 获取所有连接
    let connections = jsPlumb.getConnections().map(connection => {
        return {
            connectionId: connection.id,
            pageSourceId: connection.sourceId,
            pageTargetId: connection.targetId
        };
    });

    return {
        nodes: nodes,
        connections: connections
    };
};

Chart.ready = (callback) => {
    jsPlumb.ready(callback);
};
