const { join } = require('path')
const fs = require('fs')
const XdgBasedir = require('xdg-basedir')
const gsettings = require('node-gsettings-wrapper')
var LOOKUP_DIRS = XdgBasedir.dataDirs ? XdgBasedir.dataDirs.map(function (dir) {
  return join(dir, 'icons')
}) : []
LOOKUP_DIRS.unshift('/usr/share/pixmaps')
if (process.env['HOME']) { LOOKUP_DIRS.unshift(join(process.env['HOME'], '.icons')) }
/**
 * Class used to find valid installed index theme paths
 */
class ThemeFinder {
  /**
   * find valid theme paths synchronously
   * @returns {Array<string>} An array of valid index.theme paths. Returns an empty array if nothing found.
   */
  findThemesPathSync () {
    var foundDirs = []
    // finding theme paths
    LOOKUP_DIRS.forEach(lookUpDir => {
      var dirs = []
      try {
        dirs = fs.readdirSync(lookUpDir)
      } catch (e) {}
      dirs = dirs.map((dir) => join(lookUpDir, dir))
      foundDirs = foundDirs.concat(dirs)
    })
    // appending index.theme at the end
    foundDirs = foundDirs.map(dir => join(dir, 'index.theme'))

    // filtering  empty dirs
    return foundDirs.filter(dir => {
      try {
        fs.accessSync(dir)
        return true
      } catch (e) {
        return false
      }
    })
  }
  /**
   * find valid theme paths asynchronously
   * @returns {Promise<Array<string>>} An array of valid index.theme paths. Returns an empty array if nothing found.
   */
  findThemesPath () {
    return new Promise(resolve => {
      var promisesDir = []
      LOOKUP_DIRS.forEach(dir => {
        promisesDir.push(this.readDir(dir))
      })

      Promise.all(promisesDir).then(results => {
        var dirsFound = results.reduce((accumulator, currentValue) => {
          return accumulator.concat(currentValue)
        })
        var promisesCheckDir = []
        dirsFound.forEach(dir => promisesCheckDir.push(this.isValidThemeDir(dir)))
        Promise.all(promisesCheckDir).then(res => resolve(res.filter(obj => obj.valid).map(obj => obj.dir)))
      })
    })
  }
  /**
   * Filter if the dir is an icon dir
   * @private
   * @param {string} dir Directory to lookup
   * @returns {Promise<Object>}
   */
  isValidThemeDir (dir) {
    return new Promise(function (resolve) {
      dir = join(dir, 'index.theme')
      fs.access(dir, function (err) {
        resolve({ dir: dir, valid: !err })
      })
    })
  }
  /**
   * Promised lookup dir
   * @private
   * @param {string} lookUpDir
   * @returns {Array<string>}
   */
  readDir (lookUpDir) {
    return new Promise(function (resolve) {
      fs.readdir(lookUpDir, function (_err, dirs) {
        resolve(dirs ? dirs.map((dir) => join(lookUpDir, dir)) : [])
      })
    })
  }
  /**
   * Get current theme set in gsettings asynchronously
   *
   * @returns {Promise<string>} Current theme
   */
  getCurrentTheme () {
    return new Promise(function (resolve) {
      if (gsettings.isAvailable()) { resolve(gsettings.Key.findById('org.gnome.desktop.interface', 'icon-theme').getValue()) } else resolve(null) // TODO: KDE SUPPORT
    })
  }
  /**
   * Get current theme set in gsettings synchronously
   *
   * @returns {string} Current theme
   */
  getCurrentThemeSync () {
    return gsettings.isAvailable() ? gsettings.Key.findById('org.gnome.desktop.interface', 'icon-theme').getValue() : null// TODO: KDE SUPPORT
  }
}
module.exports = ThemeFinder
