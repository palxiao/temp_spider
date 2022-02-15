/*
 * @Author: ShawnPhang
 * @Date: 2021-12-30 17:41:15
 * @Description:
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-01-13 17:13:48
 * @site: book.palxp.com / blog.palxp.com
 */
module.exports = {
  image: {
    name: '图片',
    type: 'w-image',
    uuid: -1,
    width: 0,
    height: 0,
    left: 0,
    top: 0,
    zoom: 1,
    transform: '',
    radius: 0,
    opacity: 1,
    parent: '-1',
    imgUrl: '',
    setting: [],
    record: {
      width: 0,
      height: 0,
      minWidth: 10,
      minHeight: 10,
      dir: 'all',
    },
  },
  text: {
    name: '文本',
    type: 'w-text',
    uuid: -1,
    editable: false,
    left: 0,
    top: 0,
    transform: '',
    lineHeight: 1.5,
    letterSpacing: 0,
    fontSize: 24,
    fontClass: {
      name: '默认字体',
      value: '',
    },
    fontWeight: 'normal',
    fontStyle: 'normal',
    writingMode: '',
    textDecoration: 'none',
    color: 'rgba(0, 0, 0, 1)',
    textAlign: 'left',
    text: '文本',
    opacity: 1,
    backgroundColor: '',
    parent: '-1',
    record: {
      width: 0,
      height: 0,
      minWidth: 0,
      minHeight: 0,
      dir: 'horizontal',
    },
  },
  group: {
    name: '组合',
    type: 'w-group',
    uuid: -1,
    width: 0,
    height: 0,
    left: 0,
    top: 0,
    transform: '',
    opacity: 1,
    parent: '-1',
    isContainer: true,
    setting: [],
    record: {
      width: 0,
      height: 0,
      minWidth: 0,
      minHeight: 0,
      dir: 'none',
    },
  },
  page: {
    name: '作品名',
    type: 'page',
    uuid: '-1',
    left: 0,
    top: 0,
    width: 1920, // 画布宽度
    height: 1080, // 画布高度
    backgroundColor: '#ffffff', // 画布背景颜色
    backgroundImage: '', // 画布背景图片
    opacity: 1, // 透明度
    tag: 0, // 强制刷新用
    setting: [],
    record: {},
  },
  fontClass: {
    name: '默认字体',
    value: '',
  },
}
