import fs from 'fs'
import test from 'ava'
import { globby } from 'globby'
import yaml from 'js-yaml'
import { readChunkSync } from 'read-chunk'
import imageSize from 'image-size'
import prettyBytes from 'pretty-bytes'
import isPng from './utils/isPng.js'
import blockList from './const/block.js'
import paramSchema from './const/data_schema.js'

const checkImage = (t, path) => {
  const buffer = readChunkSync(path, {
    startPosition: 0,
    length: 8
  })
  if (!isPng(buffer)) {
    t.fail('图片格式不合法')
  }
  const dimensions = imageSize(path)
  if (dimensions.width !== 200 || dimensions.height !== 200) {
    t.fail(`图片尺寸不合法 ${dimensions.width}x${dimensions.height}`)
  }
  const lstat = fs.lstatSync(path)
  if (lstat.size > 1024 * 20) {
    t.fail(`图片文件体积超过限制 ${prettyBytes(lstat.size)}`)
  }
  t.pass()
}

const checkJson = (t, path) => {
  const data = fs.readFileSync(path, 'utf8')
  const json = yaml.load(data)

  // 检查 schema
  const { value, error }  = paramSchema.validate(json);
  if (error) {
    t.fail(`schema 校验失败 ${error.message}, ${JSON.stringify(value)}`)
  }

  for (let phone of json.phone) {
    // 不收录 106 短信通道号码（短号码例外）
    if (phone.number.toString().substr(0, 3) === '106' && phone.number.toString().length > 10) {
      t.fail(`不收录 ${phone}，原因：106 短信通道号码`)
    }
  }

  for (const block of blockList) {
    if (block.organization === json.name) {
      t.fail(`不收录 ${block.organization}，原因：${block.reason}`)
    }
  }

  t.pass()
}

const app = async () => {
  const paths = await globby('yellowpage_data/*/*.yaml')
  console.log("检查Json数据");
  for (const path of paths) {
    const type = path.split('/')[1]
    const name = path.split('/')[2].split('.')[0]
    test(`Image/${type}/${name}`, checkImage, `yellowpage_data/${type}/${name}.png`)
    test(`vCard/${type}/${name}`, checkJson, `yellowpage_data/${type}/${name}.yaml`)
  }

}

app()
