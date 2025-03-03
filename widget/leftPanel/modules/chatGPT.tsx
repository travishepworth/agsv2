import { Gtk } from "astal/gtk3";
import { Variable, bind } from "astal";

export default function ChatGPTDisplay({
  history,
}: {
  history: Variable<{ role: string; content: string }[]>;
}) {
  return (
    <box className="ChatGPTDisplay" vertical spacing={5}>
      <scrollable
        className="ChatGPTScrollable"
        vexpand={true}
        hexpand={false}
        hscroll={Gtk.PolicyType.NEVER}
        vscroll={Gtk.PolicyType.AUTOMATIC}
      >
        <box vertical spacing={5}>
          {bind(history).as((messages) =>
            messages.map((msg) => (
              <box
                halign={msg.role === "user" ? Gtk.Align.START : Gtk.Align.END} // Left for user, right for ChatGPT
                spacing={5}
                className="ChatResponse"
              >
                {msg.role === "user" ? (
                  // User message: Title left, content follows
                  <box vertical spacing={5} >
                    <label label="You:" className="User" halign={Gtk.Align.START} />
                    <label label={msg.content} wrap={true} halign={Gtk.Align.START} />
                  </box>
                ) : (
                  // ChatGPT message: Title right, content to its left
                  <box vertical halign={Gtk.Align.END} spacing={5}>
                    <label
                      label="ChatGPT:"
                      className="Assistant"
                      halign={Gtk.Align.END} // Pin title to right edge
                    />
                    <label
                      label={msg.content}
                      wrap={true}
                      halign={Gtk.Align.END} // Ensure content wraps properly
                    />
                  </box>
                )}
              </box>
            )),
          )}
        </box>
      </scrollable>
    </box>
  );
}
