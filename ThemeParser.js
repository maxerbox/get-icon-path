/**
   * Temp object
   * @private
   * @typedef {Object} objData
   * @property {Object} data - The icon name to find
   * @property {string} path - An array of  file extensions, default to freedesktop specs: ['svg', 'png', 'xpm']
   */
const fs = require('fs')
const xdgParse = require('xdg-parse')
const { dirname } = require('path')
const Theme = require('./DataTypes/Theme')

/**
 * Simple parser class
 */
class ThemeParser {
  /**
   *
   * Parse Every Themes synchronously
   * @static
   * @memberof ThemeParser
   * @param {Array<string>} paths An array of valid index.theme paths
   * @returns {Array<Theme>}
   */
  static parseEveryThemesSync (paths) {
    var themes = []
    paths.forEach(path => {
      try {
        var buffer = fs.readFileSync(path)
        var data = xdgParse(buffer.toString())
        themes.push(new Theme(data, dirname(path)))
      } catch (e) {}
    })
    return themes
  }
  /**
   *
   * Parse Every Themes asynchronously
   * @static
   * @memberof ThemeParser
   * @param {Array<string>} paths An array of valid index.theme paths
   * @returns {Promise<Array<Theme>>}
   */
  static parseEveryThemes (paths) {
    return new Promise(resolve => {
      var promises = []
      paths.forEach(path => promises.push(this.parseTheme(path)))
      Promise.all(promises).then(results => {
        var themes = []
        results = results.filter(result => !!result)
        results.forEach(obj => {
          try {
            themes.push(new Theme(obj.data, dirname(obj.path)))
          } catch (e) {}
        })

        resolve(themes)
      })
    }
    )
  }

  /**
   * Parse a single theme
   * @private
   * @static
   * @param {string} path
   * @returns {Promise<objData>}
   */
  static parseTheme (path) {
    return new Promise(resolve => {
      fs.readFile(path, function (err, data) {
        var obj = null
        try {
          obj = xdgParse(data.toString())
        } catch (e) {}
        resolve(!err && data ? { data: obj, path: path } : null)
      })
    })
  }
}
module.exports = ThemeParser
