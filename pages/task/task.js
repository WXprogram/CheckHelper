// pages/task/task.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 0,
    pages: 0,
    isRefreshing: false,
    showView: false,
    currentTabsIndex: '',
    httpUrl: app.globalData.url,
    planList: [{
      id: '',
      projectName: '',
      auditType: '',
      personPost: '',
      entName: '',
      entAddress: '',
      startDate: '',
      endDate: '',
      appraiseUrl: '',
      satisfiedUrl: '',
      region: '',
      isShow: ''
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      planList: null
    })
    this.fetchPlanData(0, true);
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
      this.fetchPlanData(0, true);
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
      this.fetchPlanData(this.data.page + 1, false);
      var that = this;
      setTimeout(function () {
        that.setData({
          isRefreshing: false
        })
      }, 1000);
    }

  },

  fetchPlanData: function (pageNo, override) {

    // 向后端请求指定页码的数据
    var that = this;
    var planListUrl = app.globalData.url;
    wx.request({
      url: planListUrl + '/planList',
      data: {
        personNum: wx.getStorageSync('personNum'),
        pageNo: pageNo
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success(res) {
        var planData = res.data.data;
        if ('200' == res.data.status) {
          that.setData({
            page: pageNo,     //当前的页号
            pages: planData.pages,  //总页数
            planList: override ? planData.planList : that.data.planList.concat(planData.planList)
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
  /**
   * 页面详细信息的显示或隐藏
   */
  onChangeShowState: function (event) {
    var index = event.currentTarget.dataset['index'];
    var that = this;
    that.setData({
      showView: (!that.data.showView),
      currentTabsIndex: index
    })
  },
  goWjdc: function (){
    wx.navigateTo({
      url: '../wjdc/wjdc?scene=1'
    })
  },
  showRecord: function (event){
    var index = event.currentTarget.dataset['index'];
    var planId = event.currentTarget.id;
    var that = this;
    that.setData({
      showView: !that.data.showView,
      currentTabsIndex: index
    })
    wx.navigateTo({
      url: '../task/show_record/show_record?planId=' + planId
    })
  }
})