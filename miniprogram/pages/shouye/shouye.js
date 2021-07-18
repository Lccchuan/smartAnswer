let titles = [];
Page({
  /**
   * 页面的初始数据
   */
  data: {
    array: [],
    canvasInfo: {},
    dataList: [],
    pieInfo: {},
  },

  onLoad: function (options) {
    let that = this,
      userInfo = wx.getStorageSync("userInfo");
    try {
      const { openid } = JSON.parse(userInfo);
      //  获取用户信息
      wx.cloud
        .database()
        .collection("userInfo")
        .where({ _openid: openid })
        .get()
        .then( (res) => {
          if (!res.data.length) {
            this.gotoLogin();
          }
          else{
            this.getMyAnswers(res.data[0].openid)
          }
          
        });
    } catch (error) {
      this.gotoLogin();
    }
   
  },
  promiseQuestion(unitid){
    const _=wx.cloud.database().command
    return wx.cloud
    .database()
    .collection("questions")
    .where({unitid:_.eq(unitid)})
    .get()
  },
  getQuestions(_id,times){
    const arr=[]
    for (let i = 1; i < 7; i++) {
      arr.push(this.promiseQuestion(i+''))
    }
    Promise.all(arr).then(res=>{
      const answerArr=this.getNumber(times)
      const data=[]
      for (let i=0;i<res.length;i++) {
        const item=i+1
        const counts=res[i].data.length,value=answerArr.get(item+'')||0
        data.push({
          title:`unit${item}`,
          value,
          counts,
          rate:counts?value/counts*100+"%":"0%"
        })
      }
      this.setData({
        dataList:data
      })
      this.messureCanvas();
    })
  },
  getNumber(arr){
    const arr1=new Map()
    arr.forEach(val=>{
      let value=arr1.get(val.unitid)||0
      arr1.set(val.unitid,++value)
    }) 
    return arr1
  },
   getMyAnswers(_id){
    wx.cloud
    .database()
    .collection("useranswer")
    .where({ _id })
    .get().then(res=>{
      let times=[]
      if(res.data.length){
        times=res.data[0].times||[]
      }
      this.getQuestions(_id,times)
    })
  },
  gotoLogin() {
    wx: wx.navigateTo({
      url: "/pages/login/login",
    });
  },
  messureCanvas() {
    let query = wx.createSelectorQuery().in(this);
    // 然后逐个取出navbar和header的节点信息
    // 选择器的语法与jQuery语法相同
    query.select("#canvas").boundingClientRect();
    // 执行上面所指定的请求，结果会按照顺序存放于一个数组中，在callback的第一个参数中返回
    var that = this;
    query.exec((res) => {
      // 分别取出navbar和header的高度
      var canvasInfo = {};
      canvasInfo.width = res[0].width;
      canvasInfo.height = res[0].height;
      that.setData({
        canvasInfo: canvasInfo,
      });
      that.drawColumnar();
    });
  },
  drawColumnar() {
  const query=  wx.createSelectorQuery(),_this=this
query.select('#canvas').context().exec(function(res){
 const ctxColumnar=res[0].context
    var dataList = _this.data.dataList
    var canvasInfo = _this.data.canvasInfo
    var columnarNum = dataList.length
    var columnarWidth = (canvasInfo.width-30)/(2*columnarNum+1)
    var maxColumnarHeight = canvasInfo.height - 60 - 20
    var maxColumnarValue = 0
    for (var i = 0; i < dataList.length; i++){
      if(dataList[i].value>maxColumnarValue){
        maxColumnarValue = dataList[i].counts
      }
    }
    for (var i = 0; i < dataList.length;i++){
      ctxColumnar.setFontSize(14)
      var percent = dataList[i].rate
      var dx = columnarWidth * (2 * i + 1)
      var dy = canvasInfo.height - (maxColumnarHeight * (dataList[i].value / maxColumnarValue) + 60) + 10
      ctxColumnar.setFillStyle('#2b2b2b')
      var percentWidth = ctxColumnar.measureText(percent)
      ctxColumnar.fillText(percent, dx+columnarWidth/2-percentWidth.width/2, dy)
      ctxColumnar.setFillStyle('rgb(99, 112, 210)')
      var valueWidth = ctxColumnar.measureText(dataList[i].value+"")
      ctxColumnar.fillText(dataList[i].value+"",dx+columnarWidth/2-valueWidth.width/2,dy+20)
      ctxColumnar.fillRect(dx, dy + 22, columnarWidth, maxColumnarHeight * (dataList[i].value / maxColumnarValue))
      ctxColumnar.setFillStyle('#8a8a8a')
      var titleWidth = ctxColumnar.measureText(dataList[i].title + "")
      ctxColumnar.fillText(dataList[i].title , dx+columnarWidth/2-titleWidth.width/2, canvasInfo.height-10)
    }
    ctxColumnar.draw()
  })
  }

});
