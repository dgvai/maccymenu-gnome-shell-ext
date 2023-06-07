var LAYOUT = [
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
