const app=getApp()
let titles = []
let errorOptions=[]
Page({
  data:{
    percent:0,
    total:0,
    isSelect:false,
    subject:null,
    userSelect:'',
    current:1
  },
onLoad(){
  let that = this
   app.globalData.errorsubject.sort()
   for(var i = 0;i < 5;++i)
   {
     var subject1=app.globalData.errorsubject[i]
     for(var j=0;j<app.globalData.errortimes.length;++j)
       {
         if(app.globalData.errortimes[j]==subject1)
           {
            wx.cloud.database().collection('questions').get().then(res=>{
              titles=res.data
              let subject=titles[j]
              that.setData({
                subject,
              })
           })
       }
   }
  }
},
radioChange(e){
  this.setData({
    userSelect:e.detail.value
  })
},
submit(){
  let userSelect=this.data.userSelect
  if(!userSelect){
    wx:wx.showToast({
      icon:'none',
      title: '请做选择'
    })
  }
  let num= this.data.current+1
  //更新进度条
  this.setData({
    percent:((num-1)/titles.length*100).toFixed(2)
  })
  //判断对错
  if(this.data.subject.answer.indexOf(userSelect)>-1){
      this.setData({
        userScore:this.data.userScore+1
      })
  }else{
      let subjectNow=this.data.subject
      subjectNow.userSelect=userSelect
      errorOptions.push(subjectNow)
  }
  //打分
  if(num>titles.length){
    let totalScore=(this.data.userScore/titles.length*100).toFixed(1)
    this.setData({
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
  this.setData({
    userSelect:'',
    subject,
    current:num,
    isSelect:false
  })
}
})