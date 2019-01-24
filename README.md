# Get icon path from theme - freedesktop spec

<a href="https://onury.io/docma"><img src="https://img.shields.io/badge/docs%20by-docma-c27cf4.svg?docs%20by=docma&style=flat-square" alt="documentation" /></a>
<a href="https://standardjs.com"><img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square" alt="Standard - JavaScript Style Guide"></a>

An alternative to hardcode tray for electron apps !

## What's this

A lot of electron apps use hardcoded icons for tray icon, such as discord, rambox, etc...
This module allows those apps to use icons from icons themes installed for Gnome, KDE...
It was originally developped for rambox.
It's based on freedesktop icon theme specification.

## USAGE

`npm i --save get-icon-path`

```js
const { getIcon, getIconSync } = require('get-icon-path')
getIcon({ iconName: 'rambox-notification', size: 32 }, 'test.path', function (e) {
  console.log(e, 'Promised')
})
getIcon('rambox-notification', 'test.path', function (e) {
  //e will equals to 'test.path' if no icons is found
  console.log(e, 'Promised')
})
var res = getIconSync({ iconName: 'rambox-notification' }, 'text.path')
console.log(res, 'Non promised')
```

## DOCUMENTATION

## TO DO

- Herited theme parsing
- KDE enabled theme detection