//获取应用实例
const app = getApp()

Page({
  data: {
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  },

  onLoad: function () {
    var that = this;
    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          //用户已授权
          wx.login({
            success: function (res) {
              var usercode = res.code;
              console.log("用户的code:" + usercode);
              if(res.code){
                wx.getUserInfo({
                  success: function (res) {
                    //打印用户信息
                    console.log(res.userInfo);
                    //从数据库获取用户信息
                    wx.request({
                      url: app.serverUrl + '/wxLogin',
                      method: "POST",
                      data: {
                        code: usercode,
                        nickName: res.userInfo.nickName,
                        avatarUrl: res.userInfo.avatarUrl
                      },
                      header: {
                        'content-type': 'application/json'
                      },
                      success: function (res) {
                        console.log("插入小程序登录用户信息成功！");
                        app.setGlobalUserInfo(res.data.data);
                      }
                    });
                    //用户已经授权过
                    wx.reLaunch({
                      url: '../index/index',
                    })
                  }
                });
              }
            }
          })
        }
      }
    })
  },

  bindGetUserInfo: function (e) {
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      var that = this;
      //插入登录的用户的相关信息到数据库
      wx.login({
        success: function (res) {
          console.log("用户的code:" + res.code);
          if (res.code) {
            wx.request({
              url: app.serverUrl + '/wxLogin',
              method: "POST",
              data: {
                code: res.code,
                nickName: e.detail.userInfo.nickName,
                avatarUrl: e.detail.userInfo.avatarUrl
              },
              header: {
                'content-type': 'application/json'
              },
              success: function (res) {
                console.log("插入小程序登录用户信息成功！");
                app.setGlobalUserInfo(res.data.data);
              }
            });
            //授权成功后，跳转进入小程序首页
            wx.reLaunch({
              url: '../index/index',
            })
          }
        }
      })
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入',
        showCancel: false,
        confirmText: '返回授权',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击了“返回授权”')
          }
        }
      })
    }
  },

})