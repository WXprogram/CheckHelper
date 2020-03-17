var app = getApp()
var QQMapWX = require('./qqmap-wx-jssdk.min.js');
var qqmapsdk;
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//todate默认参数是当前日期，可以传入对应时间 todate格式为2018-10-05
function getDates(days, todate) {
  var dateArry = [];
  for (var i = 0; i < days; i++) {
    var dateObj = dateLater(todate, i);
    dateArry.push(dateObj)
  }
  return dateArry;
}
function dateLater(dates, later) {
  let dateObj = {};
  let show_day = new Array('星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六');
  let date = new Date(dates);
  date.setDate(date.getDate() + later);
  let day = date.getDay();
  let yearDate = date.getFullYear();
  let month = ((date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : date.getMonth() + 1);
  let dayFormate = (date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate());
  dateObj.year = yearDate + '年';
  dateObj.monthDay = month + '月' + dayFormate + '日';
  dateObj.week = show_day[day];
  return dateObj;
}

/* 公共request 方法 */
const requestUrl = ({
  url,
  data,
  success,
  method = "post",
  header = { 'content-type': 'application/json' }
}) => {
  //wx.showLoading({
  //  title: '加载中',
  //})
  
  let server = app.globalData.url;
  //var header = { 'content-type': 'application/x-www-form-urlencoded' }
  return new Promise(function (resolve, reject) {
    wx.request({
      url: server + url,
      method: method,
      data: data,
      header: header,
      success: (res) => {
        
        if (res.data.status !== '200' || res['statusCode'] !== 200) {
         // wx.hideLoading();
          var showMsg = '';
          if (res.data.status == '1'){
            showMsg = res.data.msg;
          }else{
            showMsg = '系统繁忙，请稍后再试';
          }
          
          wx.showToast({
            title: showMsg,
            icon: 'none',
            duration: 2000,
            mask: true
          })
        } else {
          resolve(res.data.data)
        }
      },
      fail: function (res) {
       // wx.hideLoading();
        wx.showToast({
          title: '系统繁忙，请稍后再试',
          icon: 'none',
          duration: 2000,
          mask: true
        })
      },
      complete: function () {
        //wx.hideLoading()
      }
    })
  })
    .catch((res) => { })
}

/**计算两点之间的距离 */
function showPosition() {
  qqmapsdk = new QQMapWX({
    key: 'ED7BZ-AUWLW-IGHRD-OUWOA-DMS73-FLFWO'
  });
  //调用距离计算接口
  qqmapsdk.calculateDistance({
    from: '39.920524,116.447611',
    to: '39.922367,116.447708', //strs为字符串，末尾的“；”要去掉
    success: function (res) {
      //var dataList = that.data.listInfo;
      var lists = res.result.elements;
      console.log(lists.distance)
      var box = [];
      for (var x = 0; x < lists.length; x++) {
        var aa = lists[x].distance / 1000;
        console.log(aa);
      }; 
    },
    fail: function (res) {
      // console.log(res);
    },
    complete: function (res) {
      // console.log(res);
    }
  });
}

function atuoGetLocation(address){
  qqmapsdk = new QQMapWX({
    key: 'ED7BZ-AUWLW-IGHRD-OUWOA-DMS73-FLFWO'
  });
  qqmapsdk.geocoder({
    address: address, 
    complete: res => {
      console.log(res.result.location);   //经纬度对象
    }
  });
}

function getLoactionAddress(address){
  return new Promise(function(resolve,reject){
    qqmapsdk = new QQMapWX({
      key: 'ED7BZ-AUWLW-IGHRD-OUWOA-DMS73-FLFWO'
    });
    qqmapsdk.geocoder({
      address: address,
      complete: res => {
        resolve(res.result.location);//返回经纬度对象
      },
      fail: function (res) {
        reject(err);
      },
    });
  })
}

function reverseGeocoder(lat, log){
  let obj = null;
  qqmapsdk = new QQMapWX({
    key: 'ED7BZ-AUWLW-IGHRD-OUWOA-DMS73-FLFWO'
  });
  qqmapsdk.reverseGeocoder({
    location: {
      latitude: lat,
      longitude: log
    },
    success: function (addressRes) {
      obj = {};
      obj.lat = addressRes.result.location.lat;
      obj.lng = addressRes.result.location.lng;
    }
  })
  return obj;
}

const reveGeocoder = ({
  lat,
  lng
}) => {
  return new Promise(function (resolve, reject) {
    qqmapsdk = new QQMapWX({
      key: 'ED7BZ-AUWLW-IGHRD-OUWOA-DMS73-FLFWO'
    });
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: lat,
        longitude: lng
      },
      success: function (addressRes) {
        var obj = {};
        obj.lat = addressRes.result.location.lat;
        obj.lng = addressRes.result.location.lng;
        resolve(obj)
      }
    })
  })
}

module.exports = {
  formatTime: formatTime,
  dateLater: dateLater,
  requestUrl: requestUrl,
  showPosition: showPosition,
  atuoGetLocation: atuoGetLocation,
  reverseGeocoder: reverseGeocoder,
  reveGeocoder: reveGeocoder,
  getLoactionAddress: getLoactionAddress
}
