//app.js
App({
  globalData:{
     　errortimes:[],
       errorsubject:[]
  },
  onLaunch: function () {
    wx.cloud.init({
      env:'cloud1-3g12917o9043b04a'
    })
      },
     fuzhi(){
       for(var i=0;i<errortimes.length;i++)
          errorsubject[i]=errortimes
     }
    })
