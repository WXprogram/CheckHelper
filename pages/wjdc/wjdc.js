// pages/wjdc/wjdc.js
const jsonUtil = require('../../utils/json.js');
const util = require('../../utils/util.js')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    planAttachId: '',
    quesnaireInfo: [{
      id: '',
      questionName: '',
      projectName: '',
      questionList: [{
        questionId: '',
        questionTitle: '',
        orderNum: '',
        questionType: '',
        optionalList: [{
          optionalId: '',
          optionalAnswer: '',
          orderNum: '',
          checked: ''
        }]
      }]
    }],
    questionAnswer: [{
      quesionId: '',
      optionalId: '',
      content: ''
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.scene) {
      let scene = decodeURIComponent(options.scene);
      var that = this;
      util.requestUrl({
        url: "/showQuenaire",
        data: { 
                planAttachId: scene
              }
      }).then(function (res) {
        that.setData({
          planAttachId: scene,
          quesnaireInfo: res
        })
      })
    }
  },

  /**
   * 单选题
   */
  radiochange: function (e) {
    var selQuesionId = e.target.id;
    var selOptionalId = e.detail.value;
    var newArray = [{
      quesionId: selQuesionId,
      optionalId: selOptionalId
    }]
    //取出data中queRadio数据
    var dataQueRadio = this.data.questionAnswer;
    this.saveOrUpdateData('1', dataQueRadio, newArray);
  },

  /**
   * 问答题和单选题输入框
   */
  anwserInput: function (e) {
    var selQuesionId = e.target.id;
    var selContent = e.detail.value;
    var newArray = [{
      quesionId: selQuesionId,
      content: selContent
    }]
    //取出data中queRadio数据
    var dataqueRadioInput = this.data.questionAnswer;
    this.saveOrUpdateData('2', dataqueRadioInput, newArray);
  },

  formSubmit: function (e) {
    var subData = e.detail.value;
    //表单校验
    if (!this.checkForm(subData)) {
      return false;
    }
    util.requestUrl({
      url: "/saveAnswer",
      data: { 
              planAttachId: this.data.planAttachId,
              questionnaireId: this.data.quesnaireInfo.id,
              questionAnswer: this.data.questionAnswer
      }
    }).then(function (res) {
      
    })
  },

  /**
   * 添加或者修改data数据操作
   */
  saveOrUpdateData: function (type, anwserData, newArray) {
    var selQuesionId = newArray[0].quesionId;
    var selOptionalId = newArray[0].optionalId;
    var selContent = newArray[0].content;
    //取出data中queRadio数据
    //var dataQueRadio = this.data.queRadio;
    //如果为空修改为当前选中的
    if (anwserData[0].quesionId == "") {
      this.update(newArray);
    } else {
      //循环查询是否有重复的questionId
      for (var i = 0; i < anwserData.length; i++) {
        //如果有重复的questionId就修改
        if (anwserData[i].quesionId == selQuesionId) {
          if (type == '1') {
            anwserData[i].optionalId = selOptionalId;
          } else if (type == '2') {
            anwserData[i].content = selContent;
          }
          this.update(anwserData);
        } else {
          this.save(anwserData, newArray);
        }
      }
    }
  },

  /**
   * 添加
   */
  save: function (data, newArray) {
    this.setData({
      questionAnswer: data.concat(newArray)
    });
  },

  /**
   * 修改
   */
  update: function (data) {
    this.setData({
      questionAnswer: data
    });
  },

  /**
   * 表单校验
   */
  checkForm: function (subData) {
    var aa = jsonUtil.jsonToString(subData);
    var b = jsonUtil.jsonToMap(aa);
    var showFalse = '0';
    var showMsg = '';
    var questionList = this.data.quesnaireInfo.questionList;
    for (var i = 0; i < questionList.length; i++) {
      var question = questionList[i];
      var radioKey = 'radio' + question.questionId;
      var inputKey = 'input' + question.questionId;
      //判断选择题的是否答了
      if (question.questionType == '1' && b.get(radioKey).length == 0) {
        showFalse = '1';
        showMsg = '请选择第' + (i + 1) + '题后再提交';
        break;
      }
      //判断问答题是否答了
      if (question.questionType == '2' && b.get(inputKey).length == 0) {
        showFalse = '1';
        showMsg = '请回答第' + (i + 1) + '题后再提交';
        break;
      }
    }
    if (showFalse == '1') {
      wx.showToast({
        title: showMsg,
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    return true;
  }
})