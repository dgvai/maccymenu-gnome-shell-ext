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
        subtitle: "Change the menu icon",
        model: iconsList,
        selected: this._settings.get_enum("icon"),
      });

      let activityMenuSwitch = new Gtk.Switch({
        valign: Gtk.Align.CENTER,
        active: this._settings.get_boolean("activity-menu-visibility"),
      });
      let activityMenuRow = new Adw.ActionRow({
        title: "Activity Menu",
        subtitle: "Change the visibility of the activity menu",
        activatable_widget: activityMenuSwitch,
      });
      activityMenuRow.add_suffix(activityMenuSwitch);

      tweaksGroup.add(iconSelectorRow);
      tweaksGroup.add(activityMenuRow);

      this.add(tweaksGroup);

      iconSelectorRow.connect("notify::selected", (widget) => {
        this._settings.set_enum("icon", widget.selected);
      });

      activityMenuSwitch.connect("notify::active", (widget) => {
        this._settings.set_boolean("activity-menu-visibility", widget.get_active());
      });
    }
  }
);
