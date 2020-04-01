// pages/sign/record/record.js
const util = require('../../../utils/util.js')
const app = getApp()
var QQMapWX = require('../../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    height: '',
    speed: 0,
    accuracy: 0,
    markers: [{
      iconPath: '/resources/others.png',
      id: 0,
      latitude: '',
      longitude: '',
      width: 50,
      height: 50
    }],
    circles: [{
      latitude: '',
      longitude: '',
      color: '#7cb5ec88',
      fillColor: '#7cb5ec88',
      radius: 500,
      strokeWidth: 1
    }],
    info: {
      longitude: '',
      latitude: '',
      planNum: '',
      personNum: '',
      orgCode: '',
      orgName: '',
      signType: '',
      // 健康状态
      isReport: '', //是否上报
      isHealthy: '0',//健康状态：正常、异常
      healthyDetails:''//健康信息备注
    },
    items:[
      { name: '正常', value: '0', checked: true},
      { name: '异常', value: '1',color:'red' }
  ],
    controls: [{
      id: 1,
      iconPath: '/image/sign/dw.png',
      position: {
        left: 10,
        top: '',
        width: 40,
        height: 40
      },
      clickable: true
    }],
    showSignData: '',
    disabled: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let openId = wx.getStorageSync('openId');
    if (openId==null || openId==''){
      wx.login({
        success: function (res) {
          //获取登录的临时凭证
          var code = res.code;
          //调用后端，获取微信的session_key, secret
          var loginUrl = app.globalData.url;
          wx.request({
            url: loginUrl + '/wxLogin?code=' + code,
            data: wx.getStorageSync('personNum'),
            method: 'POST',
            success: function (result) {
              var openId = result.data.data;
              wx.setStorageSync("openId", openId);
            }
          })
        }
      })
    }
   
    var that = this;
    //util.atuoGetLocation('北京市海淀区马甸东路9号国家市场监督管理总局马甸办公区');
    //util.showPosition();
    if (options.lat == 'null' || options.lat == '' || options.lat =='undefined'){
      //获取对应企业地址解析经纬度，然后保存到数据库
      var showAddress = options.showAddress;
      util.getLoactionAddress(showAddress).then(function(resolve){
        options.lat = resolve.lat;
        options.lng = resolve.lng;
        util.requestUrl({
          url: "/savePlanLat",
          data: { planId: options.planId, latitude: options.lat, longitude: options.lng }
        }).then(function (res) {
          console.log(res);
          console.log('成功了');
        })
        that.showMapData(options);
      },function(reject){
        console.log('reject=' + reject);
      })
    }else{
      this.showMapData(options);
    }
    // 查询用户健康信息
    util.requestUrl({
      url: "/getPersonHealthyInfo",
      method: 'GET',
      data: { personNum: wx.getStorageSync('personNum')}
    }).then(function (res) {
      if(res){
        that.setData({
          info: {
            isReport: '已上报',// 已上报
            isHealthy: res.isHealthy,//健康状态：正常、异常
            healthyDetails:res.healthyDetails,//健康信息备注
          },
          items:[
            { name: '正常', value: '0', checked: res.isHealthy=='0'?true:false,disabled:true},
            { name: '异常', value: '1' ,color:'red', checked: res.isHealthy=='1'?true:false,disabled:true}
            ]
        });
      }else{
        that.data.info.isReport = '未上报'// 未上报
      }
    })
  },

  showMapData: function (options) {
    var radius = parseInt(wx.getStorageSync('mapRadius'));
    this.setData({
      circles: [{
        latitude: options.lat,
        longitude: options.lng,
        color: '#7cb5ec88',
        fillColor: '#7cb5ec88',
        radius: radius,
        strokeWidth: 1
      }]
    })
    var h = wx.getSystemInfoSync().windowHeight;
    var posh = wx.getSystemInfoSync().windowHeight * 0.9 - 100;
    this.setData({
      controls: [{
        id: 1,
        iconPath: '/image/sign/dw.png',
        position: {
          left: 10,
          top: posh,
          width: 32,
          height: 32
        },
        clickable: true
      }]
    })



    if ('1' == options.signType) {
      this.setData({
        showSignData: '签到'
      })
    } else {
      this.setData({
        showSignData: '签退'
      })
    }
    var that = this
    wx.showLoading({
      title: "定位中",
      mask: true
    })

    wx.getLocation({
      type: 'gcj02',
      altitude: true,//高精度定位
      //定位成功，更新定位结果
      success: function (res) {
        var latitude = null;
        var longitude = null;
        qqmapsdk = new QQMapWX({
          key: 'ED7BZ-AUWLW-IGHRD-OUWOA-DMS73-FLFWO'
        });
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: function (addressRes) {
            latitude = addressRes.result.location.lat;
            longitude = addressRes.result.location.lng;
            var speed = res.speed;
            var accuracy = res.accuracy;
            var isReport = that.data.info.isReport;
            var isHealthy = that.data.info.isHealthy;
            var healthyDetails = that.data.info.healthyDetails;
            that.setData({
              height: h,
              speed: speed,
              accuracy: accuracy,
              info: {
                longitude: longitude,
                latitude: latitude,
                planId: options.planId,
                signType: options.signType,
                personNum: wx.getStorageSync('personNum'),
                orgCode: wx.getStorageSync('orgCode'),
                orgName: wx.getStorageSync('orgName'),
                isReport:isReport,
                isHealthy:isHealthy,
                healthyDetails:healthyDetails
              }
            })
          }
        })

      },
      //定位失败回调
      fail: function () {
        wx.showToast({
          title: "定位失败",
          icon: "none"
        })
      },

      complete: function () {
        //隐藏定位中信息进度
        wx.hideLoading()
      }

    })
  },
  // 签到、签退
  canSign: function () {
    this.setData({
      disabled:true,
      canSubmit: false
    });
    //首先判断距离是否可以签到
    var signUrl = app.globalData.url;
    var that = this;
    wx.request({
      url: signUrl + '/saveRecord',
      data: this.data.info,
      method: 'POST',
      success(result) {
        var resInfo = result.data.data;
        if ('200' == result.data.status) {
          wx.requestSubscribeMessage({
            tmplIds: ['prU0-X2iV3fChuPYEjh4K51lBVLbOBriFi4KN_lYXhQ'],
            success(res) {
              //允许订阅
              if (res['prU0-X2iV3fChuPYEjh4K51lBVLbOBriFi4KN_lYXhQ'] === 'accept') {
                let openId = wx.getStorageSync('openId');
                //后台记录订阅信息，定时发送通知
                var sendUrl = app.globalData.url;
                wx.request({
                  url: sendUrl + '/subscribeTo?openId='+openId,
                  data: that.data.info.signType,
                  method: 'POST', 
                  success(result) {
                    that.tip(that.data.showSignData + '成功',that,'');  
                  }
                })
              }else{
                that.tip(that.data.showSignData + '成功',that,'');
              }
            }
          })
        } else {
          // 未在签到打卡范围，进行页面跳转
          var showMsg = '';
          if ('1' == result.data.status) {
            showMsg = result.data.msg;
            if((that.data.info.isReport) == '未上报'){
              showMsg = '上报成功\r\n' + showMsg;
            }
            that.tip(showMsg,that,'fail');   
          } else {
            showMsg = '系统繁忙，请稍后再试';
            wx.showToast({
              title: showMsg,
              icon: 'none',
              duration: 2000
            })
          } 
        }
      },
      fail(result) {
        wx.showToast({
          title: '网络异常，稍后再试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  controltap: function(){
    this.myMapCtx = wx.createMapContext("map", this);
    this.myMapCtx.moveToLocation();
  },
  // 健康状态change事件
  healthyStateChange: function(e){
    var info = this.data.info;
    info.isHealthy = e.detail.value;
    
  },
  // 通用input事件
  getInputValue: function(e){
    var info = this.data.info;
    info.healthyDetails = e.detail.value;
  },

  // 模态确认窗口
  tip:function(content,param,signResult){
    wx.showModal({
      title: '提示',
      content: content,
      showCancel: false,
      success: function() {
          setTimeout(function () {
            wx.switchTab({
              url: '/pages/sign/sign',
              success: function (e) {
                var page = getCurrentPages();
                if (page == undefined || page == null) return;
                page[0].switchTabShow(param.data.info.signType, param.data.info.planId, param.data.circles.latitude, param.data.circles.longitude,signResult);
              }
            })
          }, 500);
      }
    }) 
  }
})