// pages/message/info/info.js
const util = require('../../../utils/util.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    createDate: '',
    content: '',
    orgCode: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    util.requestUrl({
      url: "/messageInfo",
      data: { id: options.id },
      header: { 'content-type': 'application/x-www-form-urlencoded' }
    }).then(function (res) {
      that.setData({
        title: res.title,
        createDate: res.createDate,
        content: res.content,
        orgName: res.orgName
      })
    })
  }
})