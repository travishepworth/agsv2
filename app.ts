import { App } from "astal/gtk3";
import style from "./style.scss";
import { requestState } from "./widget/osd/osd";
import Bar from "./widget/bar/Bar";
import Applauncher from "./widget/appLauncher/Applauncher";
import NotificationPopups from "./widget/notifications/NotificationPopups";
import LeftPanel from "./widget/leftPanel/LeftPanel";
import RightPanel from "./widget/rightPanel/rightPanel";
import OSD from "./widget/osd/osd";

App.start({
  requestHandler(request: string, res: (response: any) => void) {
    requestState.set(request);
    res("ok");
  },
  css: style,
  main() {
    App.get_monitors().map(Bar);
    App.get_monitors().map(Applauncher);
    App.get_monitors().map(NotificationPopups);
    App.get_monitors().map(LeftPanel)
    App.get_monitors().map(RightPanel);
    App.get_monitors().map(OSD);
  },
});
