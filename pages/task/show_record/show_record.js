const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 0,
    pages: 0,
    isRefreshing: false,
    planId: '',
    recordList: [{
      signType: '',
      signDate: ''
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      planId: options.planId,
      recordList: null
    })
    this.fetchRecordData(0, true);
  },

  /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
  onPullDownRefresh: function () {
    // 下拉刷新
    if (!this.data.isRefreshing) {
      this.setData({
        isRefreshing: true
      })
      this.fetchRecordData(0, true);
      var that = this;
      setTimeout(function () {
        that.setData({
          isRefreshing: false
        })
      }, 1000);
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    //判断请求是否在进行中  判断请求的页数是否超出总页数
    if (!this.data.isRefreshing && this.data.page < this.data.pages) {
      this.setData({
        isRefreshing: true
      })
      this.fetchRecordData(this.data.page + 1, false);
      var that = this;
      setTimeout(function () {
        that.setData({
          isRefreshing: false
        })
      }, 1000);
    }

  },

  fetchRecordData: function (pageNo, override) {

    // 向后端请求指定页码的数据
    var that = this;
    var recordListUrl = app.globalData.url;
    var planId = this.data.planId;
    wx.request({
      url: recordListUrl + '/showRecord',
      data: {
        planId: planId,
        pageNo: pageNo
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success(res) {
        var recordData = res.data.data;
        if ('200' == res.data.status) {
          that.setData({
            page: pageNo,     //当前的页号
            pages: recordData.pages,  //总页数
            recordList: override ? recordData.recordList : that.data.recordList.concat(recordData.recordList)
          })
        } else {
          wx.showToast({
            title: '系统繁忙，请稍后再试',
            icon: 'none',
            duration: 2000
          })
        }

      },
      fail(res) {
        wx.showToast({
          title: '网络异常，稍后再试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
})