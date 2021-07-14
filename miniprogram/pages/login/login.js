Page({
  data: {},
  onLoad() {},
  getUserInfo(e) {
    const { nickName } = e.detail.userInfo,that=this
    wx.cloud.callFunction({
      name: "getUserInfo1",
      complete:  (res) => {
        that.updateUserInfo(res,nickName)
      },
    });
  },
  async updateUserInfo(response,nickName){
    if (response.errMsg === "cloud.callFunction:ok") {
      const { openid } = response.result;
      const res = await this.getDbUserInfo(openid);
      if (res) {
        const data = {
          openid: openid,
          accuracy: 0,
          reviewed: 0,
          Not_reviewed: 0,
          userName: nickName,
        };
        // 如果数据库里没有user信息
        if (!res.data.length) {
          wx.cloud.database().collection("userInfo").add({
            data,
          });
          
        }
        // 本地持久化
        wx.setStorageSync("userInfo", JSON.stringify(data));
        wx.showToast({
          title: "登录成功",
          icon: "success",
          duration: 2000,
        });
        // 回首页
        wx.switchTab({
          url: "/pages/shouye/shouye",
        });
      }
    }
  },
   // 查询用户数据信息
  async getDbUserInfo(_openid) {
    return await wx.cloud
      .database()
      .collection("userInfo")
      .where({ _openid })
      .get();
  },

});
