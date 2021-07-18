// pages/index2/index2.js
let titles = [];
let titles2 = [];
let errorOptions = [];
//conset app=getapp()
Page({
  data: {
    percent: 0,
    total: 0,
    isSelect: false,
    subject: null,
    subject2: null,
    userSelect: "",
    userScore: 0, //用户答对了几道题
    totalScore: -1, //用户总得分
    totalError: 0, //用户错题数
    current: 1,
    userInfo: null,
    showNone:false,
    noneText:''
  },
  onLoad(options) {
    console.log(options)
    let that = this;
    this.data.userInfo = JSON.parse(wx.getStorageSync("userInfo"));
    switch (options.type) {
      case "1":
        wx.setNavigationBarTitle({
          title: '连续单项选择题',
        })
        this.getUnitQuestion(null,null,options.id)
        break;
      case "2":
        wx.setNavigationBarTitle({
          title: '错题集单项选择题',
        })
        this.getWrongQuestion()
        break;
        case "3":
          wx.setNavigationBarTitle({
            title: '拓展训练单项选择题',
          })
          this.getExpandQuestion()
          break
    }
  },
  /**
   * 获取题目列表
   *ids:[]：错题id数据
   *isIn；是否要查询ids内的数据
   */ 
  getUnitQuestion(ids,isIn,id){
    let promise=null
    const _=wx.cloud.database().command
    if(ids){
     promise= wx.cloud
      .database()
      .collection("questions")
      .where(isIn?{_id:_.in(ids)}:{_id:_.nin(ids)})
      .get()
    }else{
      promise= wx.cloud
      .database()
      .collection("questions")
      .where({unitid:_.eq(id)})
      .get()
    }
    promise
    .then((res) => {
      titles = res.data;
      let subject = titles[0];
      this.setData({
        subject,
        total: titles.length,
      });
      if(!titles.length){
        this.showNones("暂无数据") 
      }
    });
  },
  // 获取错题题目
  async getWrongQuestion(){
    try {
    const { openid } = this.data.userInfo,res=await  this.hasUserAnswer(openid), data=!res.data.length?[]:res.data[0].times
    // 如果没有答过题那就没有错题
    if(!data.length){
     this.showNones("暂时没有错题噢,真棒！")
    }else{
      const wrongIds=this.getIncludIds(data,false),_=wx.cloud.database().command
      if(!wrongIds.length){
        this.showNones("暂时没有错题噢,真棒！")
      }else
      this.getUnitQuestion(wrongIds,true)
    }
  } catch (error) {
     this.showNones("暂时没有错题噢,真棒！")
  }
  },
  // 获取拓展题题目（不包括错题）
  async getExpandQuestion(){
    try {
      const { openid } = this.data.userInfo,res=await  this.hasUserAnswer(openid), data=!res.data.length?[]:res.data[0].times
      
      const expandIds=this.getIncludIds(data,true)
      console.log(data,expandIds)
      this.getUnitQuestion(expandIds,false)
    } catch (error) {
     this.showNones("暂无数据") 
    }
  },
  
  // 只展示五道错题
  getIncludIds(data,isExpand){
    const arr=[]
    for(let i=0;i<data.length;i++){
      const val=data[i]

      if(isExpand||(val.Rtimes!==val.Ttimes&&arr.length<5)){
        arr.push(val.danci_id)
      }else{
        break
      }  
    }
    return arr
  },

  showNones(text){
    this.setData({
      noneText:text,
      showNone:true
    })
  },
  async updata(isPass) {
    const { openid } = this.data.userInfo;
    let isTrue = await this.hasUserAnswer(openid)
    if (!isTrue.data.length) {
      this.addToAnswer(openid);
      isTrue = await this.hasUserAnswer(openid);
    }
    const { times } = isTrue.data[0];
    // 判断数据表是否有这个对应内容，没有就创建内容，有则自增判断
    if (!times.length||!times.some(val=>val.danci_id===this.data.subject._id)) {
      times.push({
        danci_id: this.data.subject._id,
        Ttimes: 1,
        Rtimes: isPass ? 1 : 0,
        unitid:this.data.subject.unitid
      });
    } else {
      for (let i = 0; i < times.length; i++) {
        const item = times[i];
        if (item && item.danci_id === this.data.subject._id) {
          isPass && item.Rtimes++;
          item.Ttimes++;
        }
      }
    }
    //更新数据包字段
    wx.cloud
      .database()
      .collection("useranswer")
      .doc(openid)
      .update({
        data: {
          times,
        },
        success(res) {
          console.log("success", res);
        },
      });
  },
  // 添加到answer表
  addToAnswer(_id) {
    const data = {
      _id,
      times: [],
    };
    wx.cloud.database().collection("useranswer").add({ data });
  },
  // 判断是否有answer表的对应数据
  async hasUserAnswer(_id) {
    return await wx.cloud
      .database()
      .collection("useranswer")
      .where({ _id })
      .get();
  },

  radioChange(e) {
    this.setData({
      userSelect: e.detail.value,
    });
  },

  async submit() {
    let that = this;
    let userSelect = that.data.userSelect;
    if (!userSelect) {
      wx: wx.showToast({
        icon: "none",
        title: "请做选择",
      });
    }

    let num = that.data.current + 1;
    //更新进度条
    that.setData({
      percent: (((num - 1) / titles.length) * 100).toFixed(2),
    });

    //判断对错
    if (that.data.subject.answer.indexOf(userSelect) > -1) {
      that.setData({
        userScore: that.data.userScore + 1,
      });
      await this.updata(true);

      wx: wx.showToast({
        icon: "none",
        title: "回答正确",
      });
    } else {
      let subjectNow = that.data.subject;
      subjectNow.userSelect = userSelect;
      errorOptions.push(subjectNow);
      await this.updata(false);
      this.seeError();
    }

    //打分
    if (num > titles.length) {
      let totalScore = ((that.data.userScore / titles.length) * 100).toFixed(1);
      that.setData({
        totalScore: totalScore,
        totalError: errorOptions.length,
      });
      wx: wx.showToast({
        icon: "none",
        title: "已经最后一道了",
      });
      wx:wx.navigateBack(-1)
      return;
    }

    let subject = titles[num - 1];
    that.setData({
      userSelect: "",
      subject,
      current: num,
      isSelect: false,
    });
  },

  //查看错题
  seeError() {
    wx.setStorageSync("danci", errorOptions);
    // applicationCache.globalData.globalErrorOptions= errorOptions
    wx: wx.navigateTo({
      url: "/pages/errorOptions/errorOptions",
    });
  },
  return() {
    wx: wx.switchTab({
      url: "/pages/xuanze/xuanze",
    });
  },
});
