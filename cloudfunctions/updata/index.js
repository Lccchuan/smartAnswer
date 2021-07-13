// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const _=db.command
  await db.collection('useranswer')
  .where({
    danci_id:6
  })
  .update({
    data:{
      Rtimes:_.inc(1)
    }
  })
  .then(res=>{
     console.log(res.data)
  })
}