// @flow
const { ipcRenderer } = require('electron');
const fs = require('fs-extra');

class RecipeWebview {
  constructor(options = {}) {
    this.countCache = {
      direct: 0,
      indirect: 0,
    };

    if (options.theme) {
      this.changeTheme(options.theme);
    }

    ipcRenderer.on('poll', () => {
      this.loopFunc();
    });

    ipcRenderer.on('change-theme', (ee, { themeName }) => {
      this.changeTheme(themeName);
    });
  }

  changeTheme = (themeName) => {
    if(document.body && document.body.classList) {
      const currentClassList = document.body.classList;
      if (themeName && !currentClassList.contains(themeName)) {
        let name = themeName;
        if (!themeName.startsWith('theme-')) {
          name = `theme-${themeName}`;
        }
        [...currentClassList].forEach((c) => {
          if (c && c.startsWith('theme-')) {
            document.body.classList.remove(c);
          }
        });
        if (name === 'theme-regular') {
          return;
        }
        document.body.classList.add(name);
      }
    } else {
      window.addEventListener('load', () => {
        const currentClassList = document.body.classList;
        if (themeName && !currentClassList.contains(themeName)) {
          let name = themeName;
          if (!themeName.startsWith('theme-')) {
            name = `theme-${themeName}`;
          }
          [...currentClassList].forEach((c) => {
            if (c && c.startsWith('theme-')) {
              document.body.classList.remove(c);
            }
          });
          if (name === 'theme-regular') {
            return;
          }
          document.body.classList.add(name);
        }
      })
    }
  };

  loopFunc = () => null;

  /**
   * Initialize the loop
   *
   * @param {Function}        Function that will be executed
   */
  loop(fn) {
    this.loopFunc = fn;
  }

  /**
   * Set the unread message badge
   *
   * @param {int} direct      Set the count of direct messages
   *                          eg. Slack direct mentions, or a
   *                          message to @channel
   * @param {int} indirect    Set a badge that defines there are
   *                          new messages but they do not involve
   *                          me directly to me eg. in a channel
   */
  setBadge(direct = 0, indirect = 0) {
    if (this.countCache.direct === direct
      && this.countCache.indirect === indirect) return;

    const count = {
      direct: direct > 0 ? direct : 0,
      indirect: indirect > 0 ? indirect : 0,
    };

    ipcRenderer.sendToHost('messages', count);
    Object.assign(this.countCache, count);
  }

  /**
   * Injects the contents of a CSS file into the current webview
   *
   * @param {Array} files     CSS files that should be injected. This must
   *                          be an absolute path to the file
   */
  injectCSS(...files) {
    files.forEach((file) => {
      const data = fs.readFileSync(file);
      const styles = document.createElement('style');
      styles.innerHTML = data.toString();

      document.querySelector('head').appendChild(styles);
    });
  }

  onNotify(fn) {
    if (typeof fn === 'function') {
      window.Notification.prototype.onNotify = fn;
    }
  }

  initialize(fn) {
    if (typeof fn === 'function') {
      fn();
    }
  }
}

module.exports = RecipeWebview;
