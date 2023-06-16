const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const { Gio, GLib, GObject, St } = imports.gi;
const Util = imports.misc.util;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const { ICONS } = Me.imports.constants;
const { LAYOUT } = Me.imports.layout;

class MaccyMenu extends PanelMenu.Button {
  static {
    GObject.registerClass(this);
  }

  constructor() {
    super(1, null, false);

    this.initialize();
    this.loadConfig();
    this.setIcon();
    this.toggleActivityMenuVisibility();

    const fullname = GLib.get_real_name();
    const layout = this.generateLayout(fullname);
    this.renderPopupMenu(layout);
  }

  initialize() {
    this.icon = new St.Icon({
      style_class: "menu-button",
    });
    this.add_actor(this.icon);
  }

  generateLayout(fullname) {
    LAYOUT[LAYOUT.length - 1].title = `Logout ${fullname}...`;
    return LAYOUT;
  }

  renderPopupMenu(layout) {
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

  loadConfig() {
    this._settings = ExtensionUtils.getSettings(Me.metadata["settings-schema"]);

    this._settingsC = this._settings.connect("changed::icon", this.setIcon.bind(this));

    this._settingsC = this._settings.connect(
      "changed::activity-menu-visibility",
      this.toggleActivityMenuVisibility.bind(this)
    );
  }

  setIcon() {
    const iconIndex = this._settings.get_int("icon");
    const path = Me.path + ICONS[iconIndex].path;
    this.icon.gicon = Gio.icon_new_for_string(path);
  }

  toggleActivityMenuVisibility() {
    const showActivity = this._settings.get_boolean("activity-menu-visibility");
    if (showActivity) {
      Main.panel.statusArea["activities"].container.show();
    } else {
      Main.panel.statusArea["activities"].container.hide();
    }
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
  MenuButton = new MaccyMenu();
  Main.panel.addToStatusArea("maccyMenuButton", MenuButton, 0, "left");
}

function disable() {
  MenuButton.stop();
  MenuButton = null;
  Main.panel.statusArea.maccyMenuButton.destroy();
}
