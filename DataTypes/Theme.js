
const Directory = require('./Directory')
const { join } = require('path')
/**
 * Theme class
 */
class Theme {
  /**
  *Creates an instance of Theme.
  * @param {Object} data
  * @param {string} path
  */
  constructor (data, path) {
    var iconThemeProps = data['Icon Theme']
    if (!iconThemeProps.Name) { throw new Error('Name required for theme') }
    if (!iconThemeProps.Comment) { throw new Error('Comment required for theme') }
    if (!iconThemeProps.Directories) { throw new Error('Directories required for theme') }
    /**
     * Theme's absolute path
     * @type {string}
    */
    this.path = path
    /**
     * Short name of the icon theme, used in e.g. lists when selecting themes.
     * @type {string}
    */
    this.name = iconThemeProps.Name

    /**
     * Longer string describing the theme.
     * @type {string}
    */
    this.comment = iconThemeProps.Comment

    /**
     * The name of the theme that this theme inherits from. If an icon name is not found in the current theme, it is searched for in the inherited theme (and recursively in all the inherited themes). If no theme is specified implementations are required to add the "hicolor" theme to the inheritance tree. An implementation may optionally add other default themes in between the last specified theme and the hicolor theme.
     * @type {Array<string>}
     * @default null
    */
    this.Inherits = iconThemeProps.Inherits ? iconThemeProps.Inherits.split(',') : null

    /**
     * List of subdirectories for this theme.
     * @type {Array<Directory>}
    */
    this.directories = this.parseDirectories(iconThemeProps.Directories.split(','), data)

    /**
     * Additional list of subdirectories for this theme, in addition to the ones in Directories. These directories should only be read by implementations supporting scaled directories and was added to keep compatibility with old implementations that don't support these.
     * @type {Array<string>}
     * @default null
    */
    this.scaledDirectories = iconThemeProps.ScaledDirectories ? iconThemeProps.ScaledDirectories.split(',') : null

    /**
     * Whether to hide the theme in a theme selection user interface. This is used for things such as fallback-themes that are not supposed to be visible to the user.
     * @type {boolean}
     * @default false
    */
    this.hidden = !!(iconThemeProps.Hidden && iconThemeProps.Hidden.test(/true/i))

    /**
     * The name of an icon that should be used as an example of how this theme looks.
     * @type {string}
     * @default null
    */
    this.example = iconThemeProps.Example || null
  }
  /**
   *
   * Find an icon in all theme directories synchronously
   * It returns the first icon who is fulfilling the search requirements
   * @param {IconOptions} options Icons search options
   * @throws Throws error in case the icon is not found or every directories are not matching the search icons options
   * @returns {string}
   */
  findIconSync (options) {
    var context = options.context || '*'
    var size = options.size || '*'
    var searchDirs = this.directories.filter(dir => {
      return (dir.size === size || size === '*') && (dir.context === context || context === '*')
    })
    if (searchDirs.length === 0) { throw new Error('No directories matching search restriction') }
    for (var i in searchDirs) {
      var dir = searchDirs[i]
      try {
        return dir.findIconSync(options)
      } catch (e) {}
    }
    throw new Error('Icon not found')
  }
  /**
   *
   * Find an icon in all theme directories asynchronously
   * It returns the first icon who is fulfilling the search requirements
   * @param {IconOptions} options Icons search options
   * @returns {Promise<string>}
   */
  findIcon (options) {
    return new Promise((resolve, reject) => {
      var context = options.context || '*'
      var size = options.size || '*'
      var searchDirs = this.directories.filter(dir => {
        return (dir.size === size || size === '*') && (dir.context === context || context === '*')
      })
      var promises = []
      if (searchDirs.length > 0) {
        searchDirs.forEach(dir => {
          promises.push(new Promise(resolve => {
            dir.findIcon(options).then(resolve)
              .catch(_err => {
                resolve(null)
              })
          }))
        })
        Promise.all(promises).then(results => {
          var isFound = false
          results.forEach(iconPath => {
            if (iconPath != null && !isFound) {
              resolve(iconPath)
              isFound = true
            }
          })
          if (!isFound) {
            reject(new Error('Icon not found'))
          }
        })
      } else {
        reject(new Error('No directories matching search restriction'))
      }
    })
  }
  /**
   *
   * Parse dirs
   * @private
   * @param {Array<string>} dirs
   * @param {Object} data
   * @returns {Array<Directory>|Array}
   */
  parseDirectories (dirs, data) {
    var parsedDirs = []
    dirs.forEach(dir => {
      try {
        parsedDirs.push(new Directory(data[dir], dir, join(this.path, dir)))
      } catch (e) {}
    })
    return parsedDirs
  }
}
module.exports = Theme
