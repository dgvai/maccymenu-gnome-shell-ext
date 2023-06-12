const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const GObject = imports.gi.GObject;
const St = imports.gi.St;
const Util = imports.misc.util;
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
    this.toggleActivityMenuVisibility();
    this.generateLayout(layout);
  }

  loadConfig() {
    this._settings = ExtensionUtils.getSettings(Me.metadata["settings-schema"]);

    this._settingsC = this._settings.connect("changed::icon", this.resetIcon.bind(this));

    this._settingsC = this._settings.connect(
      "changed::activity-menu-visibility",
      this.toggleActivityMenuVisibility.bind(this)
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

  toggleActivityMenuVisibility() {
    const showActivity = this._settings.get_boolean("activity-menu-visibility");
    if (showActivity) {
      Main.panel.statusArea["activities"].container.show();
    } else {
      Main.panel.statusArea["activities"].container.hide();
    }
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
    popUpMenu.connect("activate", () => Util.spawn(cmds).bind(this));
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
    Main.panel.statusArea["activities"].container.show();
  }
}

let MenuButton;

function init() {}

function enable() {
  MenuButton = new MaccyMenu(LAYOUT);
  Main.panel.addToStatusArea("maccyMenuButton", MenuButton, 0, "left");
}

function disable() {
  MenuButton.stop();
  MenuButton = null;
  Main.panel.statusArea.maccyMenuButton.destroy();
}
