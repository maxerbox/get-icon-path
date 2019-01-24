const { getIcon, getIconSync } = require('./index')
getIcon({ iconName: 'rambox-notification', size: 32 }, 'test.path', function (e) {
  console.log(e, 'Promised')
})
var res = getIconSync({ iconName: 'rambox-notification' }, 'text.path')
console.log(res, 'Non promised')
