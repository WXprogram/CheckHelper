//index.js
//获取应用实例
const util = require('../../utils/util.js')
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    var personNum = wx.getStorageSync('personNum');
    if (personNum != null && personNum != '') {
      wx.switchTab({
        url: '/pages/sign/sign',
      })
    } else {
      console.log('进入登录')
      // 登录
      wx.login({
        success: res => {
          console.log(res);
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  formSubmit: function (e) {
    var subData = e.detail.value;
    if (!this.checkForm(subData)) {
      return false;
    }
    var mobile = subData.mobile;
    var that = this;
    util.requestUrl({
      url: "/checkMobile",
      data: { mobile: mobile },
      header: { 'content-type': 'application/x-www-form-urlencoded' }
    }).then(function (res) {
      wx.setStorageSync('personNum', res.personNum);
      wx.setStorageSync('orgCode', res.orgCode);
      wx.setStorageSync('orgName', res.orgName);
      wx.switchTab({
        url: '/pages/sign/sign'
      })
    })
  },
  /**
   * 表单校验
   */
  checkForm: function (subData) {
    if (!(/^1[345678]\d{9}$/.test(subData.mobile))) {
      wx.showToast({
        title: '手机号码有误',
        duration: 2000,
        icon: 'none'
      });
      return false;
    }
    return true;
  }
})
