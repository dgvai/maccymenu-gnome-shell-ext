const { Adw, Gtk, GObject } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

var GeneralPage = GObject.registerClass(
  class OpenWeather_GeneralPage extends Adw.PreferencesPage {
    _init(settings) {
      super._init({
        title: "Settings",
        icon_name: "preferences-system-symbolic",
        name: "GeneralPage",
      });
      this._settings = settings;

      let tweaksGroup = new Adw.PreferencesGroup({
        title: "Tweaks",
      });

      let iconsList = new Gtk.StringList();
      iconsList.append("Apple");
      iconsList.append("Ubuntu");
      iconsList.append("Fedora");
      iconsList.append("Linux");

      let iconSelectorRow = new Adw.ComboRow({
        title: "Menu Icon",
        model: iconsList,
        selected: this._settings.get_enum("icon"),
      });

      tweaksGroup.add(iconSelectorRow);
      this.add(tweaksGroup);

      iconSelectorRow.connect("notify::selected", (widget) => {
        this._settings.set_enum("icon", widget.selected);
      });
    }
  }
);
