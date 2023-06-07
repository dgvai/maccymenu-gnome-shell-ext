const { Adw, Gtk, Gdk } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const GeneralPrefs = Me.imports.preferences.generalPage;

function init() {}

function fillPreferencesWindow(window) {
  let iconTheme = Gtk.IconTheme.get_for_display(Gdk.Display.get_default());
  if (!iconTheme.get_search_path().includes(Me.path + "/media")) {
    iconTheme.add_search_path(Me.path + "/media");
  }

  const settings = ExtensionUtils.getSettings(Me.metadata["settings-schema"]);

  const generalPage = new GeneralPrefs.GeneralPage(settings);

  let prefsWidth = settings.get_int("prefs-default-width");
  let prefsHeight = settings.get_int("prefs-default-height");

  window.set_default_size(prefsWidth, prefsHeight);
  window.set_search_enabled(true);

  window.add(generalPage);

  window.connect("close-request", () => {
    let currentWidth = window.default_width;
    let currentHeight = window.default_height;

    if (currentWidth != prefsWidth || currentHeight != prefsHeight) {
      settings.set_int("prefs-default-width", currentWidth);
      settings.set_int("prefs-default-height", currentHeight);
    }
    window.destroy();
  });
}
