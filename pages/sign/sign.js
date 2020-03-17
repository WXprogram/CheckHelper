// pages/sign/sign.js
const util = require('../../utils/util.js')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isRefreshing: false,
    height: '',
    width: '',
    swiperHeight: '',
    contentWidth: '',
    contentHeight: '',
    dateWeek: {
      year: '',
      monthDay: '',
      week: ''
    },
    personNum: '',
    personName: '',
    orgName: '',
    signPlanList: [{
      id: '',
      planNum: '',
      entName: '',
      entAddress: '',
      dayNum: '',
      startDay: '',
      signType: '',
      entLat: '',
      entLng: ''
    }],
    showPlanId: '',
    lat: '',
    lng: '',
    showAddress: '',
    signData: '',
    showSignType: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      signPlanList: null
    })
    var h = wx.getSystemInfoSync().windowHeight;
    var newHi = h * 0.84;
    var w = wx.getSystemInfoSync().windowWidth;
    var newW = (w - 320) / 2;
    var conH = h * 0.08;
    var week = util.dateLater(new Date(), 0);
    this.setData({
      height: h,
      width: w,
      swiperHeight: newHi,
      contentWidth: newW,
      contentHeight: conH,
      dateWeek: week
    })
    /**
     * 调接口查询审核员签到信息
     */
    var that = this;
    util.requestUrl({
      url: "/signInfo",
      data: wx.getStorageSync('personNum')
    }).then(function (res) {
      var firstSignPlan = null;
      console.log(res.radius);
      wx.setStorageSync('mapRadius', res.radius);
      if (res.signPlanList != null && res.signPlanList.length>0){
        firstSignPlan = res.signPlanList[0];
        that.showSignType(firstSignPlan.signType);
        that.setData({
          personNum: res.personNum,
          personName: res.personName,
          orgName: res.orgName,
          signPlanList: res.signPlanList,
          showPlanId: firstSignPlan.id,
          lat: firstSignPlan.entLat ? firstSignPlan.entLat : null,
          lng: firstSignPlan.entLng ? firstSignPlan.entLng : null,
          showAddress: firstSignPlan.entAddress
        })
      }else{
        that.setData({
          personNum: res.personNum,
          personName: res.personName,
          orgName: res.orgName,
          signPlanList: null
        })
      }
      
    })
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
      this.onLoad();
      var that = this;
      setTimeout(function () {
        that.setData({
          isRefreshing: false
        })
      }, 1000);
      wx.stopPullDownRefresh();
    }
  },

  jieshu: function (options) {
    var showPlanId = options.detail.currentItemId;
    var list = this.data.signPlanList;
    var lat = null;
    var lng = null;
    var showAddress = null;
    for (var i = 0; i < list.length; i++) {
      var planInfo = list[i];
      if (planInfo.id == showPlanId) {
        this.showSignType(planInfo.signType);
        lat = planInfo.entLat;
        lng = planInfo.entLng;
        showAddress = planInfo.entAddress;
      }
    }
    this.setData({
      showPlanId: showPlanId,
      lat: lat,
      lng: lng,
      showAddress: showAddress
    })
  },

  sign: function () {
    var signType = this.data.showSignType;
    var lat = this.data.lat;
    var lng = this.data.lng;
    var showAddress = this.data.showAddress;
    wx.navigateTo({
      url: '../sign/record/record?planId=' + this.data.showPlanId + '&signType=' + signType + '&lat=' + lat + '&lng=' + lng + '&showAddress=' + showAddress,
    })
  },

  showSignType: function (signType) {
    //如果等于2，表示最新的是签退 那么下次就是签到
    if (signType == '1') {
      this.setData({
        signData: '签退',
        showSignType: '2'
      })
    } else {
      this.setData({
        signData: '签到',
        showSignType: '1'
      })
    }
  },

  /**
   * record。js跳转回来之后执行的方法   改变页面签到签退显示
   */
  switchTabShow: function(signType, planId, lat, lng){
    this.showSignType(signType);
    var list = this.data.signPlanList;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id == planId) {
        list[i].signType = signType;
        list[i].entLat = lat;
        list[i].entLng = lng;
        this.setData({
          signPlanList: list
        });
      }
    }
  }
})