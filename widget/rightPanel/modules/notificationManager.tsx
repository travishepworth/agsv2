import { Gtk } from "astal/gtk3";
import { Variable, bind } from "astal";
import Notifd from "gi://AstalNotifd";

const notifd = Notifd.get_default(); // Access the notification daemon

function NotificationItem({ notification }: { notification: Notifd.Notification }) {
  const expanded = Variable<boolean>(false);

  const toggleExpand = () => {
    expanded.set(!expanded.get());
  };

  const dismissNotification = () => {
    notification.dismiss(); // Dismiss via Notifd
  };

  return (
    <box className="NotificationItem" vertical spacing={5}>
      <box vertical={false} spacing={10}>
        <label className="NotificationText" label={notification.summary} hexpand={true} xalign={0} />
        <button className="expandButton" onClicked={toggleExpand}>
          <label label={bind(expanded).as((e) => (e ? "Collapse" : "Expand"))} />
        </button>
        <button className="dismissButton" onClicked={dismissNotification}>
          <label label="✖" />
        </button>
      </box>
      {bind(expanded).as((e) =>
        e ? (
          <label
            label={notification.body}
            wrap={true}
            xalign={0}
            className="NotificationBody"
          />
        ) : ""
      )}
    </box>
  );
}

export default function Notifications() {
  const clearAll = () => {
    for (const not of notifd.notifications) {
      not.dismiss(); // Dismiss all notifications
    }
  };

  const isVisible = bind(notifd, "notifications").as((nots) => nots.length > 0);

  return (
    <box className="Notifications" vertical spacing={10}>
      <box className="NotificationsTopBox" vertical={false} spacing={10}>
        <label label="Notifications" hexpand={true} />
        <button className="ClearAllButton" onClicked={clearAll}>
          <label label="Clear All" />
        </button>
      </box>
        <Gtk.ScrolledWindow
        hscrollbarPolicy={Gtk.PolicyType.NEVER}
        vscrollbarPolicy={Gtk.PolicyType.AUTOMATIC}
        widthRequest={325}
        heightRequest={500}
        visible={isVisible.get()}
        >
      <box
        className="NotificationText"
        vertical
        spacing={5}
        visible={bind(notifd, "notifications").as((nots) => nots.length > 0)}
      >
        {bind(notifd, "notifications").as((nots) =>
          nots.map((not) => <NotificationItem notification={not} />)
        )}
      </box>
      </Gtk.ScrolledWindow>
      <label
        label="No notifications"
        visible={bind(notifd, "notifications").as((nots) => nots.length === 0)}
        halign={Gtk.Align.CENTER}
      />
    </box>
  );
}
