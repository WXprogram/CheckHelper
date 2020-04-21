//app.js
const app = getApp()
App({
  onLaunch: function () {
    const updateManager = wx.getUpdateManager();
    updateManager.onUpdateReady(function(){
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })
    // 新版本下载失败时执行
    updateManager.onUpdateFailed(function () {
      wx.showModal({
        title: '新版本下载失败',
        content: '请删除当前小程序，重新搜索打开',
      })
    })
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
    //url: 'http://192.168.12.76:8080/wjdc/a/mobile/wechat/ch'
  }
})