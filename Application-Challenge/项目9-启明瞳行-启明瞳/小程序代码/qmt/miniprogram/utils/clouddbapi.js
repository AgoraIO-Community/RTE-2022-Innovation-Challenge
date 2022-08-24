const db = wx.cloud.database()

// 查询
const cmmonQuery = (option) => {
  db.collection(option.data.tableName).where(
    option.data.whereData
    ).get({
    success: function success(res) {
      option.success && option.success(res)
      console.log(res)
    }
  })
}

//插入
const commonInsert = (option) => {
  db.collection(option.data.tableName).insert({})
}

//更新
const commonUpdate = (option) => {
  db.collection(option.data.tableName).insert({});
  db.collection(option.data.tableName).doc(option.data.doc).update({
    // data 传入需要局部更新的数据
    data: option.data.updateData,
    success(res) {
      option.success && option.success(res)
    }
  })
}



const dml = {
  commonQuery: (params) => cmmonQuery(params),
  commonInsert: (params) => commonInsert(params),
  commonUpdate: (params) => commonUpdate(params),
}

module.exports = {
  dml
}