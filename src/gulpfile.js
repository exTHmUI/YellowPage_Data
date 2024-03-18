import fs from 'fs'
import path from 'path'
import { deleteAsync } from 'del'
import through2 from 'through2'

import gulp from 'gulp'
import zip from 'gulp-zip'
import concat from 'gulp-concat'
import concatFolders from 'gulp-concat-folders'
import rename from 'gulp-rename'

import concatJson from './concat.js'
import concatFoldersJson from './concat-folder.js'

import plugin_vcard from './plugins/vcard.js'
import plugin_vcard_ext from './plugins/vcard-ext.js'

import plugin_yellowPageData from './plugins/yellowpagedata.js'

const generatorVcard = () => {
  return gulp.src('data/*/*.yaml')
    .pipe(through2.obj(plugin_vcard))
    .pipe(rename({ extname: '.vcf' }))
    .pipe(gulp.dest('./temp'))
}

const generatorVcard_ext = () => {
  return gulp.src('data/*/*.yaml')
    .pipe(through2.obj(plugin_vcard_ext))
    .pipe(rename({ extname: '.vcf' }))
    .pipe(gulp.dest('./temp'))
}

const generatorJson = () => {
  return gulp.src("yellowpage_data/*/*.yaml")
      .pipe(through2.obj(plugin_yellowPageData))
      .pipe(rename({extname: ".json"}))
      .pipe(gulp.dest("./out"));
}

const archive = () => {
  return gulp.src('temp/**')
    .pipe(zip('archive.zip'))
    .pipe(gulp.dest('./public'))
}

const combineVcard = () => {
  return gulp.src('temp/*/*.vcf')
    .pipe(concatFolders('汇总'))
    .pipe(rename({ extname: '.all.vcf' }))
    .pipe(gulp.dest('./temp'))
}

const combineJson = () => {
  return gulp.src("out/*/*.json")
    .pipe(concatFoldersJson("汇总"))
    .pipe(rename({extname: ".all.json"}))
    .pipe(gulp.dest("./out"));
}

const vCardAllInOne = () => {
  return gulp.src('temp/汇总/*.all.vcf')
    .pipe(concat('全部.vcf'))
    .pipe(gulp.dest('./temp/汇总'))
}

const jsonAllInOne = () => {
  return gulp.src("out/汇总/*.all.json")
    .pipe(concatJson("全部.json"))
    .pipe(gulp.dest("./out"));
}

const cleanVcard = () => {
  return deleteAsync([
    'public',
    'temp'
  ])
}

const cleanJson = () => {
  return deleteAsync([
    'out'
  ])
}

const createRadicale = () => {
  let folders = fs.readdirSync('temp')
    .filter(function(f) {
      return fs.statSync(path.join('temp', f)).isDirectory();
    })
  folders.map(function(folder){
    fs.writeFileSync(path.join('temp', folder, '/.Radicale.props'), '{"D:displayname": "' + folder + '", "tag": "VADDRESSBOOK"}')
  })
  return gulp.src('temp/**', {})
}

const cleanRadicale = () => {
  return deleteAsync([
    'radicale'
  ], {force: true})
}

const distRadicale = () => {
  return gulp.src('temp/**', {dot: true})
    .pipe(gulp.dest('./radicale'))
}

const buildVcard = gulp.series(cleanVcard, generatorVcard, combineVcard, vCardAllInOne, archive)
const radicale = gulp.series(cleanVcard, generatorVcard_ext, createRadicale, cleanRadicale, distRadicale)
const buildJson = gulp.series(cleanJson, generatorJson, combineJson, jsonAllInOne)
const cleanVcardOut = gulp.series(cleanVcard);
const cleanJsonOut = gulp.series(cleanJson);

export {
  generatorVcard,
  generatorJson,
  combineVcard,
  combineJson,
  vCardAllInOne,
  jsonAllInOne,
  archive,
  buildVcard,
  buildJson,
  cleanVcardOut,
  cleanJsonOut,
  radicale
}