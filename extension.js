const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const GObject = imports.gi.GObject;
const St = imports.gi.St;
const Lang = imports.lang;
const Util = imports.misc.util;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const ICON_CLASS = {
  0: "apple-icon",
  1: "ubuntu-icon",
  2: "fedora-icon",
  3: "linux-icon",
};

const Layout = [
  {
    type: "menu",
    title: "About This PC",
    cmds: ["gnome-control-center", "info-overview"],
  },
  {
    type: "separator",
  },
  {
    type: "menu",
    title: "System Preferences...",
    cmds: ["gnome-control-center"],
  },
  {
    type: "menu",
    title: "App Store...",
    cmds: ["snap-store"],
  },
  {
    type: "separator",
  },
  {
    type: "menu",
    title: "Force Quit",
    cmds: ["xkill"],
  },
  {
    type: "separator",
  },
  {
    type: "menu",
    title: "Sleep",
    cmds: ["systemctl", "suspend"],
  },
  {
    type: "menu",
    title: "Restart...",
    cmds: ["gnome-session-quit", "--reboot"],
  },
  {
    type: "menu",
    title: "Shut Down...",
    cmds: ["gnome-session-quit", "--power-off"],
  },
  {
    type: "separator",
  },
  {
    type: "menu",
    title: "Logout...",
    cmds: ["gnome-session-quit", "--logout"],
  },
];

class MaccyMenu extends PanelMenu.Button {
  static {
    GObject.registerClass(this);
  }

  constructor() {
    super(1, null, false);
    this.loadConfig();
    this.setIcon();
    this.generateLayout();
  }

  loadConfig() {
    this._settings = ExtensionUtils.getSettings(Me.metadata["settings-schema"]);

    this._settingsC = this._settings.connect("changed", this.resetIcon.bind(this));
  }

  setIcon() {
    if(this.icon ) delete this.icon
    const icon_class = ICON_CLASS[this._settings.get_enum("icon")];
    this.icon = new St.Icon({
      style_class: icon_class,
    });

    this.add_actor(this.icon);
  }

  resetIcon() {
    this.remove_actor(this.icon)
    const icon_class = ICON_CLASS[this._settings.get_enum("icon")];
    this.icon = new St.Icon({
      style_class: icon_class,
    });
    this.add_actor(this.icon);
  }

  generateLayout() {
    Layout.forEach((item) => {
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

function init() {
  MenuButton = new MaccyMenu();
}

function enable() {
  Main.panel.statusArea.activities?.hide();
  Main.panel.addToStatusArea("maccyMenuButton", MenuButton, 0, "left");
}

function disable() {
  MenuButton.stop();
  Main.panel.statusArea.activities?.show();
  Main.panel.statusArea.maccyMenuButton.destroy();
}
