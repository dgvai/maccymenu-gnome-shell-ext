const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const GObject = imports.gi.GObject;
const St = imports.gi.St;
const Util = imports.misc.util;
const Lang = imports.lang;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const { ICON_CLASS } = Me.imports.classes;
const { LAYOUT } = Me.imports.layout;

class MaccyMenu extends PanelMenu.Button {
  static {
    GObject.registerClass(this);
  }

  constructor(layout) {
    super(1, null, false);
    this.loadConfig();
    this.setIcon();
    this.generateLayout(layout);
  }

  loadConfig() {
    this._settings = ExtensionUtils.getSettings(Me.metadata["settings-schema"]);

    this._settingsC = this._settings.connect(
      "changed",
      this.resetIcon.bind(this)
    );
  }

  setIcon() {
    const icon_class = ICON_CLASS[this._settings.get_enum("icon")];
    this.icon = new St.Icon({
      style_class: icon_class,
    });

    this.add_actor(this.icon);
  }

  resetIcon() {
    this.remove_actor(this.icon);
    this.setIcon();
  }

  generateLayout(layout) {
    layout.forEach((item) => {
      switch (item.type) {
        case "menu":
          this.makeMenu(item.title, item.cmds);
          break;
        case "separator":
          this.makeSeparator();
          break;
      }
    });
  }

  makeMenu(title, cmds) {
    const popUpMenu = new PopupMenu.PopupMenuItem(title);
    popUpMenu.connect(
      "activate",
      Lang.bind(this, () => Util.spawn(cmds))
    );
    this.menu.addMenuItem(popUpMenu);
  }

  makeSeparator() {
    const separator = new PopupMenu.PopupSeparatorMenuItem();
    this.menu.addMenuItem(separator);
  }

  stop() {
    if (this._settingsC) {
      this._settings.disconnect(this._settingsC);
      this._settingsC = undefined;
    }
  }
}

let MenuButton;

function init() {}

function enable() {
  MenuButton = new MaccyMenu(LAYOUT);
  Main.panel.statusArea.activities?.hide();
  Main.panel.addToStatusArea("maccyMenuButton", MenuButton, 0, "left");
}

function disable() {
  MenuButton.stop();
  Main.panel.statusArea.activities?.show();
  Main.panel.statusArea.maccyMenuButton.destroy();
}
