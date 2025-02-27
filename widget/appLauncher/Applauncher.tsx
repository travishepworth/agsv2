import Apps from "gi://AstalApps";
import { App, Astal, Gdk, Gtk } from "astal/gtk3";
import { Variable } from "astal";

const MAX_ITEMS = 7;

function hide() {
  App.get_window("launcher")!.hide();
}

function AppButton({ app }: { app: Apps.Application }) {
  return (
    <button
      className="AppButton"
      onClicked={() => {
        hide();
        app.launch();
      }}
    >
      <box>
        <icon icon={app.iconName} />
        <box valign={Gtk.Align.START} vertical vexpand={false}>
          <label className="name" truncate xalign={0} label={app.name} />
          {app.description && (
            <label
              className="description"
              wrap
              xalign={0}
              label={app.description}
            />
          )}
        </box>
      </box>
    </button>
  );
}

export default function Applauncher() {
  const { CENTER } = Gtk.Align;
  const apps = new Apps.Apps();
  const width = Variable(1000);
  const entryRef = Variable<null | Gtk.Entry>(null);

  const text = Variable("");
  const list = text((text) => apps.fuzzy_query(text).slice(0, MAX_ITEMS));
  const onEnter = () => {
    apps.fuzzy_query(text.get())?.[0].launch();
    hide();
  };

  let splashBox: Gtk.Box | null = null;

  return (
    <window
      name="launcher"
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM}
      exclusivity={Astal.Exclusivity.IGNORE}
      keymode={Astal.Keymode.ON_DEMAND}
      application={App}
      visible={false}
      onShow={(self) => {
        text.set("");
        width.set(self.get_current_monitor().workarea.width);
        (splashBox as any).css = `
          background-image: url("file:///home/travis/.current_wallpaper");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        `;
      }}
      onKeyPressEvent={function (self, event: Gdk.Event) {
        if (event.get_keyval()[1] === Gdk.KEY_Escape) self.hide();
      }}
    >
      <box>
        <eventbox widthRequest={width((w) => w / 2)} expand onClick={hide} />
        <box
          className="fullLauncher"
          widthRequest={500}
          heightRequest={600}
          vexpand={false}
          hexpand={false}
          valign={CENTER}
          halign={CENTER}
        >
          <box
            widthRequest={500}
            heightRequest={600}
            vexpand={false}
            valign={CENTER}
            className="Splash"
            setup={(self) => {
              splashBox = self;
            }}
          ></box>
          <box
            className="fullBox"
            hexpand={false}
            vertical
            vexpand={false}
            heightRequest={600}
          >
            <box
              widthRequest={500}
              className="Applauncher"
              vexpand={false}
              vertical
              valign={Gtk.Align.START}
            >
              <entry
                valign={Gtk.Align.START}
                placeholderText=" Search"
                text={text()}
                onChanged={(self) => text.set(self.text)}
                onActivate={onEnter}
                // Move focus to text box on show
                onMap={(self) => {
                  self.grab_focus();
                }}
              />
              <box spacing={6} vertical valign={Gtk.Align.START}>
                {list.as((list) => list.map((app) => <AppButton app={app} />))}
              </box>
              <box
                halign={CENTER}
                className="not-found"
                vertical
                visible={list.as((l) => l.length === 0)}
              >
                <icon icon="system-search-symbolic" />
                <label label="No match found" />
              </box>
            </box>
            <eventbox expand onClick={hide} />
          </box>
        </box>
        <eventbox widthRequest={width((w) => w / 2)} expand onClick={hide} />
      </box>
    </window>
  );
}
