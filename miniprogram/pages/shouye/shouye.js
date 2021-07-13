let titles = []
Page({

  /**
   * 页面的初始数据
   */
  data: {
    array:[],
    canvasInfo: {},
    dataList: [{
      title: "未复习",
      value: 3,
      background: "#b8f2e6"
    }, {
      title: "已复习",
      value: 8,
      background: "#ffa69e"
    }],
    pieInfo: {}
  },

 
  onLoad: function(options) {
    let that = this
    wx.cloud.database().collection('usermessage').get().then(res=>{
      titles=res.data
       let subject=titles[0]
       that.setData({
         subject,
         
       })
})
    this.messureCanvas()
  },
  messureCanvas() {
    let query = wx.createSelectorQuery().in(this);
    // 然后逐个取出navbar和header的节点信息
    // 选择器的语法与jQuery语法相同
    query.select('#pieCanvas').boundingClientRect();
    // 执行上面所指定的请求，结果会按照顺序存放于一个数组中，在callback的第一个参数中返回
    var that = this
    query.exec((res) => {
      // 分别取出navbar和header的高度 
      console.log(res)
      var canvasInfo = {}
      canvasInfo.width = res[0].width
      canvasInfo.height = res[0].height
      that.setData({
        canvasInfo: canvasInfo
      })
      console.log(canvasInfo)
      that.drawPie(-1)
    })
  },
  drawPie(index) {
    const ctxPie = wx.createCanvasContext("pieCanvas")
    var canvasInfo = this.data.canvasInfo
    var dataList = this.data.dataList
    var pieInfo = this.data.pieInfo
    var pieRadius = (canvasInfo.width - 90) / 4
    pieInfo.pieRadius = pieRadius
    var pieX = 30 + pieRadius
    pieInfo.centerX = pieX
    var pieY = 30 + pieRadius
    pieInfo.centerY = pieY
    var totalValue = 0
    for (var i = 0; i < dataList.length; i++) {
      totalValue = totalValue + dataList[i].value
    }
    var area = []
    for (var i = 0; i < dataList.length; i++) {
      var areaItem = {}
      ctxPie.beginPath()
      var start = 0
      for (var j = 0; j < i; j++) {
        start = start + dataList[j].value
      }
      if (i < dataList.length - 1) {
        if(index==i){
          ctxPie.arc(pieX, pieY, pieRadius+5, start / totalValue * 2 * Math.PI, (start + dataList[i].value) / totalValue * 2 * Math.PI)
        }else{
          ctxPie.arc(pieX, pieY, pieRadius, start / totalValue * 2 * Math.PI, (start + dataList[i].value) / totalValue * 2 * Math.PI)
        }
        areaItem.start = start / totalValue * 2 * Math.PI
        areaItem.end = (start + dataList[i].value) / totalValue * 2 * Math.PI
      } else {
        if(index == i){
          ctxPie.arc(pieX, pieY, pieRadius+5, start / totalValue * 2 * Math.PI, 2 * Math.PI)
        }else{
          ctxPie.arc(pieX, pieY, pieRadius, start / totalValue * 2 * Math.PI, 2 * Math.PI)
        }
        areaItem.start = start / totalValue * 2 * Math.PI
        areaItem.end = 2 * Math.PI
      }
      area.push(areaItem)
      ctxPie.lineTo(pieX, pieY);
      ctxPie.setFillStyle(dataList[i].background);
      ctxPie.fill();
      ctxPie.closePath();


      //绘制标注
      var startX = 2 * pieRadius + 60
      var startY = (30 + pieRadius) - 30 * dataList.length / 2 + i * 30
      ctxPie.setFillStyle(dataList[i].background)
      ctxPie.fillRect(startX, startY, 20, 20)


      ctxPie.setFillStyle('#8a8a8a')
      ctxPie.setFontSize(12)
      ctxPie.fillText(dataList[i].title, startX + 30, startY + 15)
      ctxPie.fillText(dataList[i].value + "", startX + 70, startY + 15)
      ctxPie.fillText(parseInt(dataList[i].value * 100 / totalValue) + "%" + "", startX + 100, startY + 15)

    }
    pieInfo.area = area
    this.data.pieInfo = pieInfo
    console.log(this.data.pieInfo)
    ctxPie.draw()
  },
  touchStart(e) {
    var pieInfo = this.data.pieInfo
    var x = e.touches[0].x
    var y = e.touches[0].y
    if ((Math.pow(x - pieInfo.centerX, 2) + Math.pow(y - pieInfo.centerY, 2)) > Math.pow(pieInfo.pieRadius, 2)) {
      console.log("在圆外，不执行")
      return
    }
    var pointPos = 0
    console.log("在圆内，继续执行")
    var angle = Math.atan((y - pieInfo.centerY) / (x - pieInfo.centerX)) / (Math.PI / 180)
    //判断角度值
    if (x > pieInfo.centerX) {
      if (angle > 0) {
        pointPos = angle / 180 * Math.PI
      } else {
        pointPos = angle / 180 * Math.PI + 2 * Math.PI
      }
    } else {
      if (angle > 0) {
        pointPos = angle / 180 * Math.PI + Math.PI
      } else {
        pointPos = angle / 180 * Math.PI + Math.PI
      }
    }
    var index = 0
    for(var i = 0;i<pieInfo.area.length;i++){
      if(pointPos>pieInfo.area[i].start&&pointPos<pieInfo.area[i].end){
        index = i
      }
    }
    console.log("在第"+index+"个区域")
    this.drawPie(index)
  },
})
