
const { readdir, readdirSync } = require('fs')
const { join } = require('path')

/**
 * Theme directory class
 */
class Directory {
  /**
   *Creates an instance of Directory.
   * @param {Object} data
   * @param {string} dirname
   */
  constructor (data, dirname, absolutePath) {
    if (!data.Size) { throw new Error('Size required for directory') }
    /**
     * Absolute path of directory
     * @type {string}
    */
    this.absolutePath = absolutePath
    /**
     * directory Location name
     * @type {string}
    */
    this.dirPath = dirname
    /**
     * Nominal (unscaled) size of the icons in this directory.
     * @type {number}
    */
    this.size = parseInt(data.Size)

    /**
     * Target scale of of the icons in this directory. Defaults to the value 1 if not present. Any directory with a scale other than 1 should be listed in the ScaledDirectories list rather than Directories for backwards compatibility.
     * @type {number}
     * @default 1
    */
    this.scale = parseInt(data.Scale) || 1

    /**
     * The context the icon is normally used in. This is in detail discussed in the section called "Context".
     * @type {string}
    */
    this.context = data.Context

    /**
     * The type of icon sizes for the icons in this directory. Valid types are Fixed, Scalable and Threshold. The type decides what other keys in the section are used. If not specified, the default is Threshold.
     * @type {string}
     * @default "Threshold"
    */
    this.type = data.Type || 'Threshold'

    /**
     * Specifies the maximum (unscaled) size that the icons in this directory can be scaled to. Defaults to the value of Size if not present.
     * @type {number}
     * @default size
    */
    this.minSize = parseInt(data.MinSize) || this.size

    /**
     * Specifies the minimum (unscaled) size that the icons in this directory can be scaled to. Defaults to the value of Size if not present.
     * @type {number}
     * @default size
    */
    this.maxSize = parseInt(data.MaxSize) || this.size

    /**
     * The icons in this directory can be used if the size differ at most this much from the desired (unscaled) size. Defaults to 2 if not present.
     * @type {number}
     * @default 2
    */
    this.threshold = parseInt(data.Threshold) || 2

    /**
     * An array of icons cached
     * @type {Array<string>}
     * @private
     * @default []
    */
    this.icons = []
  }
  /**
   *
   * Find an icon in the current directory synchronously
   * It returns the first icons who is fulfilling the search requirements
   * @param {IconOptions} options Icons search options
   * @throws throw not found error if no icons found
   * @returns {string}
   */
  findIconSync (options) {
    var extensions = options.ext || ['svg', 'png', 'xpm']
    var extensionStr = extensions.join('|')
    var regExp = new RegExp(`${escapeRegExp(options.iconName)}\\.(${extensionStr})`)
    var files = readdirSync(this.absolutePath)
    for (var i in files) {
      var fileName = files[i]
      if (regExp.test(fileName)) { return join(this.absolutePath, fileName) }
    }
    throw new Error('Icon not found')
  }
  /**
   *
   * Find an icon in the current directory asynchronously
   * It returns the first icons who is fulfilling the search requirements
   * @param {IconOptions} options Icons search options
   * @returns {Promise<string>}
   */
  findIcon (options) {
    return new Promise((resolve, reject) => {
      var extensions = options.ext || ['svg', 'png', 'xpm']
      var extensionStr = extensions.join('|')
      var regExp = new RegExp(`${escapeRegExp(options.iconName)}\\.(${extensionStr})`)
      this.listIcons().then(icons => {
        var found = false
        icons.forEach(fileName => {
          if (regExp.test(fileName) && !found) {
            resolve(join(this.absolutePath, fileName))
            found = true
          }
        })
        if (!found) { reject(new Error('Icon not found')) }
      })
    })
  }
  /**
   * List icons inside a directory and cache them
   * @private
   * @returns {Promise<Array<string>>}
   */
  listIcons () {
    return new Promise(resolve => {
      if (this.icons.length === 0) {
        readdir(this.absolutePath, (_err, files) => {
          this.icons = files || []
          resolve(this.icons)
        })
      } else {
        resolve(this.icons)
      }
    })
  }
}
/**
 *
 * Simple regularExpression escape
 * @private
 * @param {string} string
 * @returns {string}
 */
function escapeRegExp (string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}
module.exports = Directory
