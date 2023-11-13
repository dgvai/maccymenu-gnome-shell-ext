const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const { Gtk, Gio, GLib, GObject, St } = imports.gi;
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
    this.setupPopupMenu();
  }

  initialize() {
    this.icon = new St.Icon({
      style_class: "menu-button",
    });
    this.add_actor(this.icon);
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
    this.icon.style = "width: 24px; height: 24px;"; 
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

  setupPopupMenu() {
    const fullname = GLib.get_real_name();
    const layout = this.generateLayout(fullname);
    this.renderPopupMenu(layout);
    this.connect("button-press-event", () => this.renderPopupMenu(layout));
  }

  generateLayout(fullname) {
    LAYOUT[LAYOUT.length - 1].title = `Logout ${fullname}...`;
    return LAYOUT;
  }

  renderPopupMenu(layout) {
    this.menu.removeAll();
    layout.forEach((item) => {
      switch (item.type) {
        case "menu":
          this.makeMenu(item.title, item.cmds);
          break;
        case "expandable-menu":
          this.makeExpandableMenu(item.title);
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

  makeExpandableMenu(title) {
    const popUpMenu = new PopupMenu.PopupSubMenuMenuItem(title);
    const recentManager = new Gtk.RecentManager();
    const items = recentManager.get_items();
    let counter = 0;
    for (let i = 0; i < items.length; i++) {
      const subMenu = new PopupMenu.PopupImageMenuItem(items[i].get_display_name(), items[i].get_gicon().names[0]);
      popUpMenu.menu.addMenuItem(subMenu);
      subMenu.connect('activate', () => {
      	const uri = items[i].get_uri();
        if (uri) {
          Util.spawnCommandLine(`xdg-open "${uri}"`);
        }
      });
      if (counter === 5) break;
      counter++;
    }
      if (counter === 5) break;
      counter++;
    }
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
