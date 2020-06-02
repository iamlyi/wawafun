const app = getApp()

Page({
  data: {
    // 用于分页的属性
    //总页数
    totalPage: 1,
    //当前页数
    page: 1,
    //视频列表
    videoList: [],
    screenWidth: 350,
    //用于图片展示
    serverUrl: "",
    searchContent: ""
  },

  onLoad: function(params) {
      var me = this;
      var screenWidth = wx.getSystemInfoSync().screenWidth; //获取系统信息，手机屏幕宽度
      me.setData({
        screenWidth: screenWidth,
      });

      var searchContent = params.search;
      console.log(searchContent);
      var isSaveRecord = params.isSaveRecord;
      if (isSaveRecord == null || isSaveRecord == '' || isSaveRecord == undefined) {
        isSaveRecord = 0;
      }
      if (searchContent != undefined && searchContent != null && searchContent != "") {
        me.setData({
          searchContent: searchContent
        });
      }


      // 获取当前的分页数
      var page = me.data.page;
      me.getAllVideoList(page, isSaveRecord);
  },

  getAllVideoList: function(page, isSaveRecord) {
    var me = this;
    var serverUrl = app.serverUrl;
    wx.showLoading({
      title: '请等待，加载中...',
    });

    var searchContent = me.data.searchContent;

    wx.request({
      url: serverUrl + '/video/showAll?page=' + page + "&isSaveRecord=" + isSaveRecord,
      method: "POST",
      data: {
        videoDesc: searchContent
      },
      success: function(res) {
        wx.hideLoading();
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();

        console.log(res.data);

        // 判断当前页page是否是第一页，如果是第一页，那么设置videoList为空
        if (page === 1) {
          me.setData({
            videoList: []
          });
        }

        var videoList = res.data.data.rows; //原有的列表
        var newVideoList = me.data.videoList; //现有的列表

        me.setData({
          videoList: newVideoList.concat(videoList), //列表拼接
          page: page,
          totalPage: res.data.data.total,
          serverUrl: serverUrl
        });

      }
    })
  },

  onPullDownRefresh: function() {
    wx.showNavigationBarLoading();
    this.getAllVideoList(1, 0);//下来刷新回到第一页
  },

  //上拉触底，即第一页
  onReachBottom: function() {
    var me = this;
    var currentPage = me.data.page;
    var totalPage = me.data.totalPage;

    // 判断当前页数和总页数是否相等，如果相等则无需查询
    if (currentPage === totalPage) {
      wx.showToast({
        title: '已经没有视频啦~~',
        icon: "none"
      })
      return;
    }
    //分页查询
    var page = currentPage + 1;
    me.getAllVideoList(page, 0);//到下一页
  },

  showVideoInfo: function(e) {
    var me = this;
    var videoList = me.data.videoList; //获取videoList
    var arrindex = e.target.dataset.arrindex; //获取数组下标
    var videoInfo = JSON.stringify(videoList[arrindex]); //把json对象转换为string

    wx.redirectTo({
      url: '../videoinfo/videoinfo?videoInfo=' + videoInfo
    })
  }

})