import { bind } from "astal";
import Tray from "gi://AstalTray";

export default function SysTray() {
  const tray = Tray.get_default();

  return (
    <box className="SysTray">
      {bind(tray, "items").as((items) =>
        items.length > 0 ? (
          items.map((item) => (
            <menubutton
              tooltipMarkup={bind(item, "tooltipMarkup")}
              usePopover={false}
              className="SysTrayItem"
              actionGroup={bind(item, "actionGroup").as((ag) => [
                "dbusmenu",
                ag,
              ])}
              menuModel={bind(item, "menuModel")}
            >
              <icon gicon={bind(item, "gicon")} />
            </menubutton>
          ))
        ) : (
          <label label="" />
        ),
      )}
    </box>
  );
}
