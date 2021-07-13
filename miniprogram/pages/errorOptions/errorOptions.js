
const app=getApp()
let titles= []

 Page({
   data:{
     total:0,
     current:0
   },
   onLoad(){
    let arr= wx.getStorageSync('danci')
    if(arr&&arr.length>0){
      titles=arr
    }
    this.setData({
      subject:titles[this.data.current],
      total:titles.length
    })
  },
   pre(){
    if(this.data.current-1 < 0){
      wx.showToast({
        icon:'error',
        title: '已经第一道了'
      })
     }else{
     let currentNum = this.data.current
     this.setData({
       current:currentNum-1,
       subject:titles[currentNum-1]
     })
    }
   },
   next(){
     if(this.data.current+1 >= titles.length){
      wx.showToast({
        icon:'error',
        title: '最后一道了'
      })
     }else{
     let currentNum = this.data.current+1
     this.setData({
       current:currentNum,
       subject:titles[currentNum]
     })
    }
   }
  })