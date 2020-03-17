//app.js111
const app = getApp()
App({
  onLaunch: function () {
    var personNum = wx.getStorageSync('personNum');
    if (personNum != null && personNum != '') {
      wx.switchTab({
        url: '/pages/sign/sign',
      })
    } 
    
  },
  globalData: {
    userInfo: null,
    url: 'https://manyidu.cait.com/wjdc/a/mobile/wechat/ch'
    //url: 'http://192.168.12.94:8081/wjdc/a/mobile/wechat/ch'
  }
})