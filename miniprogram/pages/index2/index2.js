// pages/index2/index2.js
let titles = []
let titles2 = []
let errorOptions=[]
//conset app=getapp()
Page({
  data:{
    percent:0,
    total:0,
    isSelect:false,
    subject:null,
    subject2:null,
    userSelect:'',
    userScore:0,//用户答对了几道题
    totalScore:-1,//用户总得分
    totalError:0,//用户错题数
    current:1
  },
onLoad(){
  let that=this
   wx.cloud.database().collection('questions').get().then(res=>{
         titles=res.data
          let subject=titles[0]
          that.setData({
            subject,
            total:titles.length
          })
   })
},
updata(){
  wx.cloud.database().collection('useranswer').doc(_id).updata({
    data:{
      Rtimes_id8:Rtimes_id8.inc(1)
    },
    success(res){
    
    }
  })
},     
radioChange(e){
  this.setData({
    userSelect:e.detail.value
  })
},

submit:function(){
  let that = this;
  let userSelect=that.data.userSelect
  if(!userSelect){
    wx:wx.showToast({
      icon:'none',
      title: '请做选择'
    })
  }
  
  let num= that.data.current+1
      //更新进度条
      that.setData({
        percent:((num-1)/titles.length*100).toFixed(2)
      })

  
  //判断对错
  if(that.data.subject.answer.indexOf(userSelect)>-1){
      that.setData({
        userScore:that.data.userScore+1

      })
      wx:wx.showToast({
        icon:'none',
        title: '回答正确'
      })
      
  }else{
      let subjectNow=that.data.subject
      subjectNow.userSelect=userSelect
      errorOptions.push(subjectNow)
      this.seeError()
  }
  //打分
  if(num>titles.length){
    let totalScore=(that.data.userScore/titles.length*100).toFixed(1)
    that.setData({
      totalScore:totalScore,
      totalError:errorOptions.length
    })
    wx:wx.showToast({
      icon:'none',
      title:"已经最后一道了"
    })
    return
  }
  
  let subject=titles[num-1]
  that.setData({
    userSelect:'',
    subject,
    current:num,
    isSelect:false,
  })
},


//查看错题
seeError(){
 wx.setStorageSync('danci',errorOptions)
 // applicationCache.globalData.globalErrorOptions= errorOptions
  wx:wx.navigateTo({
    url: '/pages/errorOptions/errorOptions'
  })
},
return(){
  wx:wx.switchTab({
    url: '/pages/xuanze/xuanze'
  })
 }

})