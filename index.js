const ThemeFinder = require('./ThemeFinder')
const ThemeParser = require('./ThemeParser')
const Directory = require('./DataTypes/Directory')
const Theme = require('./DataTypes/Theme')
const { basename } = require('path')
/**
   * Icon search options
   * @typedef {Object} IconOptions
   * @property {string} iconName - The icon name to find
   * @property {Array<string>} ext - An array of  file extensions, default to freedesktop specs: ['svg', 'png', 'xpm']
   * @property {string} context - The icon's directory context (ex App, Status...), default to '*'
   * @property {number|string} size - The icon's directory size, default to '*'
   */
/**
 * Icon Callback
 * @callback IconCallback
 * @param {string} iconPath Either the icon found, or the fallback icon given
 */
module.exports = {

  /**
   * Get an icon asynchronously. If it doesn't find the requested icon, it fallback to fb
   * @param {IconOptions | string } iconOptions An icon option or a string (for the icon name)
   * @param {string} fb Icon fallback path, if the desired icon is not find in a path
   * @param {IconCallback} cb Callback
   */
  getIcon: function (iconOptions, fb, cb) {
    if (typeof iconOptions === 'string') { iconOptions = { iconName: iconOptions } }
    var finder = new ThemeFinder()
    finder.findThemesPath().then(
      res => {
        ThemeParser.parseEveryThemes(res).then(themes => {
          var promises = []
          themes.forEach(theme => {
            var themeName = basename(theme.path)
            promises.push(new Promise(resolve => {
              theme.findIcon(iconOptions).then(path => resolve({ icon: path, themeName: themeName })).catch(_err => resolve(null))
            }))
          })
          Promise.all(promises).then(results => {
            results = results.filter(res => !!res)
            finder.getCurrentTheme().then(currentTheme => {
              var iconsNameFiltered = results.map(obj => obj.themeName)
              var indexTheme = iconsNameFiltered.indexOf(currentTheme)
              if (indexTheme > -1) {
                var currentInstalledIcon = results[indexTheme]
                results.splice(indexTheme, 1)
                results.unshift(currentInstalledIcon)
              }
              if (results.length > 0) {
                cb(results[0].icon)
              } else { cb(fb) }
            })
          })
        })
      }
    )
  },
  ThemeFinder: ThemeFinder,
  ThemeParser: ThemeParser,
  Directory: Directory,
  Theme: Theme,
  /**
   * Get an icon synchronously. If it doesn't find the requested icon, it fallback to fb
   * @param {IconOptions | string } iconOptions An icon option or a string (for the icon name)
   * @param {string} fb Icon fallback path, if the desired icon is not find in a path
   * @returns {string} Either the icon found, or the fallback icon given
   */
  getIconSync: function (iconOptions, fb) {
    if (typeof iconOptions === 'string') { iconOptions = { iconName: iconOptions } }
    var finder = new ThemeFinder()
    var validThemesPath = finder.findThemesPathSync()
    var themes = ThemeParser.parseEveryThemesSync(validThemesPath)
    var iconsPathsFound = []
    for (var i in themes) {
      var theme = themes[i]
      try {
        iconsPathsFound.push({ icon: theme.findIconSync(iconOptions), themeName: basename(theme.path) })
      } catch (e) {}
    }
    if (iconsPathsFound.length > 0) {
      var currentTheme = finder.getCurrentThemeSync()
      var iconsNameFiltered = iconsPathsFound.map(obj => obj.themeName)
      var indexTheme = iconsNameFiltered.indexOf(currentTheme)
      if (indexTheme > -1) {
        var currentInstalledIcon = iconsPathsFound[indexTheme]
        iconsPathsFound.splice(indexTheme, 1)
        iconsPathsFound.unshift(currentInstalledIcon)
      }
      return iconsPathsFound[0].icon
    } else {
      return fb
    }
  }
}
